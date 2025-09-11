// backend/controllers/DocumentController.js
// Routes:
// POST   /document/upload                (multipart form: file, caseId, createdBy)
// GET    /document/list                  ?caseId
// GET    /document/get/:id
// POST   /document/review/:id/:userId    (body: { status, notes }) -> creates Note + ActivityLog
// GET    /document/ocr/:id/:userId       (optional: trigger OCR on-demand)

const path = require("path");
const fs = require("fs-extra");
const cloudinary = require("cloudinary").v2;
const { v4: uuidv4 } = require("uuid");
const Tesseract = require("tesseract.js");

const BaseController = require("../utils/BaseController");
const {
  Document,
  Case: CaseModel,
  Client,
  User,
  Note,
  ActivityLog,
} = require("../models");
const logActivity = require("../utils/logActivity");
const { getPermissionsByRole, PERMISSIONS } = require("../utils/rbac");

// configure cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || "",
  api_key: process.env.CLOUDINARY_API_KEY || "",
  api_secret: process.env.CLOUDINARY_API_SECRET || "",
});

class DocumentController extends BaseController {
  constructor() {
    super(Document);
  }

  // POST /document/upload
  // multipart: file, caseId, createdBy
  async upload(req, res) {
    try {
      // multer should have put file in req.file
      const file = req.file;
      const { caseId, createdBy } = req.body;

      if (!file) {
        return this.createResponse(
          { success: false, message: "No file uploaded" },
          400
        );
      }

      // optional: validate caseId exists
      let caseRow = null;
      if (caseId) caseRow = await CaseModel.findByPk(caseId);

      // upload to cloudinary
      const tempPath = file.path;
      const publicId = `documents/${path.basename(
        file.filename,
        path.extname(file.filename)
      )}_${uuidv4()}`;

      const uploadResult = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            folder: "documents",
            public_id: publicId,
            resource_type: "auto",
          },
          (error, result) => {
            if (error) return reject(error);
            resolve(result);
          }
        );
        fs.createReadStream(tempPath).pipe(stream);
      });

      console.log("beforee");
      // run OCR (best-effort) if it's an image/pdf (Tesseract supports many image types; PDF may need conversion)
      let ocrText = null;
      try {
        // Tesseract works with local file - we already have tempPath
        // Note: processing PDFs with Tesseract can be slow and needs imagemagick in some setups — handle failures gracefully
        const workerPromise = Tesseract.recognize(tempPath, "eng");
        const { data } = await workerPromise;
        console.log("beforee  p");
        ocrText = data && data.text ? data.text.trim() : null;
      } catch (ocrErr) {
        console.warn("OCR failed (non-fatal):", ocrErr?.message || ocrErr);
        ocrText = null;
      }
      console.log("afterr  p");
      // create Document record
      const doc = await Document.create({
        caseId: caseId || null,
        title: file.originalname,
        type: req.body.type || "upload",
        content: req.body.content || null,
        filePath: uploadResult.secure_url || uploadResult.url || "",
        ocrText: ocrText || null,
        createdBy: createdBy || null,
      });
      console.log("afterr  pzz");
      // log activity
      await logActivity({
        userId: createdBy || null,
        action: "upload",
        targetType: "Document",
        targetId: doc.id,
        details: `Uploaded document ${doc.title} for case ${caseId || "N/A"}`,
      });
      console.log("afterr  pzzss");
      return this.createResponse({ success: true, data: doc });
    } catch (err) {
      console.error("Document.upload error:", err);
      return this.createResponse({ success: false, message: err.message });
    }
  }

  // GET /document/list?caseId=
  async list(req, res) {
    try {
      const { caseId } = req.query;
      const where = {};
      if (caseId) where.caseId = caseId;

      const docs = await Document.findAll({
        where,
        order: [["createdAt", "DESC"]],
        include: [
          { model: User, as: "creator", attributes: ["id", "name", "email"] },
        ],
      });

      return this.createResponse({ success: true, data: docs });
    } catch (err) {
      console.error("Document.list error:", err);
      return this.createResponse({ success: false, message: err.message });
    }
  }

  // GET /document/get/:id
  async getById(req, res) {
    try {
      const { id } = req.params;
      const doc = await Document.findByPk(id, {
        include: [
          { model: User, as: "creator", attributes: ["id", "name", "email"] },
        ],
      });
      if (!doc)
        return this.createResponse(
          { success: false, message: "Not found" },
          404
        );
      return this.createResponse({ success: true, data: doc });
    } catch (err) {
      console.error("Document.getById error:", err);
      return this.createResponse({ success: false, message: err.message });
    }
  }

  // POST /document/review/:id/:userId
  // body: { status: 'approved' | 'rejected' | 'changes_requested', notes }
  // -> creates a Note with authorId=userId and logs activity
  async review(req, res) {
    try {
      const { id, userId } = req.params;
      const { status, notes } = req.body;

      const doc = await Document.findByPk(id);
      if (!doc)
        return this.createResponse(
          { success: false, message: "Document not found" },
          404
        );

      // create a Note linked to the document's case describing the review
      await Note.create({
        caseId: doc.caseId || null,
        authorId: userId || null,
        content: `Document Review (${status}): ${notes || ""}`,
      });

      await logActivity({
        userId: userId || null,
        action: "review",
        targetType: "Document",
        targetId: id,
        details: `Document ${id} reviewed with status=${status}`,
      });

      return this.createResponse({ success: true, message: "Review recorded" });
    } catch (err) {
      console.error("Document.review error:", err);
      return this.createResponse({ success: false, message: err.message });
    }
  }

  // GET /document/ocr/:id/:userId  (optional: re-run OCR on-demand)
  async ocr(req, res) {
    try {
      const { id, userId } = req.params;
      const doc = await Document.findByPk(id);
      if (!doc)
        return this.createResponse(
          { success: false, message: "Document not found" },
          404
        );

      // download file from doc.filePath -> store to temp and run tesseract
      const tempPath = path.join(
        process.cwd(),
        "tmp",
        `${uuidv4()}_${path.basename(doc.filePath)}`
      );
      await fs.ensureDir(path.dirname(tempPath));

      // use node-fetch to download (or https.get). Avoid extra dependency if possible:
      const https = require("https");
      const fileStream = fs.createWriteStream(tempPath);
      await new Promise((resolve, reject) => {
        https
          .get(doc.filePath, (response) => {
            response.pipe(fileStream);
            fileStream.on("finish", () => {
              fileStream.close(resolve);
            });
          })
          .on("error", (err) => {
            reject(err);
          });
      });

      let ocrText = null;
      try {
        const { data } = await Tesseract.recognize(tempPath, "eng");
        ocrText = data && data.text ? data.text.trim() : null;
      } catch (ocrErr) {
        console.warn("OCR re-run failed:", ocrErr);
      }

      if (ocrText) {
        doc.ocrText = ocrText;
        await doc.save();
      }

      await fs.remove(tempPath).catch(() => {});

      await logActivity({
        userId: userId || null,
        action: "ocr",
        targetType: "Document",
        targetId: id,
        details: `OCR performed on document ${id}`,
      });

      return this.createResponse({
        success: true,
        data: { ocrText: doc.ocrText },
      });
    } catch (err) {
      console.error("Document.ocr error:", err);
      return this.createResponse({ success: false, message: err.message });
    }
  }
}

module.exports = DocumentController;
