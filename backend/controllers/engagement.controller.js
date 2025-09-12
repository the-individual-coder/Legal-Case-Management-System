// backend/controllers/EngagementController.js
const path = require("path");
const cloudinary = require("cloudinary").v2;
const { v4: uuidv4 } = require("uuid");
const fs = require("fs-extra");

const BaseController = require("../utils/BaseController");
const { renderTemplateToPdf } = require("../utils/contractGenerator");
const { Engagement, Case, Client, Document, User } = require("../models");
const { getPermissionsByRole, PERMISSIONS } = require("../utils/rbac");

// Configure Cloudinary using env vars (set in your deployment)
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || "",
  api_key: process.env.CLOUDINARY_API_KEY || "",
  api_secret: process.env.CLOUDINARY_API_SECRET || "",
});

class EngagementController extends BaseController {
  constructor() {
    super(Engagement);
  }

  // GET /engagement/list
  async list(req, res) {
    try {
      const records = await Client.findAll({
        order: [["createdAt", "DESC"]],
      });
      return this.createResponse({ success: true, data: records });
    } catch (err) {
      return this.createResponse({ success: false, message: err.message });
    }
  }
  // GET /engagement/getEngagements
  async getEngagements(req, res) {
    try {
      const { caseId, clientId, lawyerId, status } = req.query;
      const where = {};
      if (caseId) where.caseId = caseId;
      if (clientId) where.clientId = clientId;
      if (lawyerId) where.lawyerId = lawyerId;
      if (status) where.status = status;

      const engagements = await Engagement.findAll({
        where,
        order: [["createdAt", "DESC"]],
        include: [
          { model: Case, as: "case", attributes: ["id", "title"] },
          {
            model: Client,
            as: "client",
            attributes: ["id", "firstName", "lastName", "email", "phone"],
          },
          { model: User, as: "lawyer", attributes: ["id", "name", "email"] },
          {
            model: Document,
            as: "agreementDoc",
            attributes: ["id", "title", "filePath"],
          },
        ],
      });

      return this.createResponse({ success: true, data: engagements });
    } catch (err) {
      console.error("getEngagements error:", err);
      return this.createResponse({ success: false, message: err.message });
    }
  }

  // POST /engagement/create
  async create(req, res) {
    try {
      const { caseId, clientId, lawyerId, startDate, endDate, status, userId } =
        req.body;
      const actorId = userId ?? req.headers["x-user-id"];
      const actor = actorId ? await User.findByPk(actorId) : null;
      const role = actor?.role ?? "client";
      const perms = getPermissionsByRole(role);

      if (!perms.includes(PERMISSIONS.ENGAGEMENTS.CREATE) && role !== "admin") {
        return this.createResponse(
          { success: false, message: "Unauthorized" },
          403
        );
      }

      if (!caseId || !clientId || !lawyerId) {
        return this.createResponse(
          {
            success: false,
            message: "caseId, clientId and lawyerId are required",
          },
          400
        );
      }

      const engagement = await Engagement.create({
        caseId,
        clientId,
        lawyerId,
        startDate: startDate ?? null,
        endDate: endDate ?? null,
        status: status ?? "active",
      });

      await this.logActivity({
        userId: actorId,
        action: "create",
        targetType: "Engagement",
        targetId: engagement.id,
        details: `Created engagement for case ${caseId}, client ${clientId}`,
      });

      // Try to auto-generate contract after creating engagement (non-fatal)
      try {
        await this._generateAndAttachContract({
          engagementId: engagement.id,
          actorId,
        });
      } catch (genErr) {
        console.warn("Contract generation non-fatal error:", genErr);
      }

      return this.createResponse({ success: true, data: engagement });
    } catch (err) {
      console.error("Engagement.create error:", err);
      return this.createResponse({ success: false, message: err.message });
    }
  }

  // internal helper: generate PDF, upload to Cloudinary, create Document, attach to engagement
  async _generateAndAttachContract({ engagementId, actorId }) {
    if (!engagementId) throw new Error("engagementId required");

    const engagement = await Engagement.findByPk(engagementId);
    if (!engagement) throw new Error("Engagement not found");

    const client = await Client.findByPk(engagement.clientId);
    const lawyer = await User.findByPk(engagement.lawyerId);
    const legalCase = await Case.findByPk(engagement.caseId);

    const templatePath = path.join(
      process.cwd(),
      "templates",
      "engagement_contract.hbs"
    );

    const context = {
      engagementId: engagement.id,
      caseTitle: legalCase?.title ?? "",
      clientName: client ? `${client.firstName} ${client.lastName}` : "",
      clientEmail: client?.email ?? "",
      clientPhone: client?.phone ?? "",
      lawyerName: lawyer?.name ?? "",
      startDate: engagement.startDate
        ? new Date(engagement.startDate).toLocaleDateString()
        : "",
      endDate: engagement.endDate
        ? new Date(engagement.endDate).toLocaleDateString()
        : "",
      createdAt: new Date().toLocaleDateString(),
    };

    // Render PDF buffer
    const pdfBuffer = await renderTemplateToPdf({ templatePath, context });

    // Upload to Cloudinary (raw file)
    const publicId = `engagement_contracts/engagement_${
      engagement.id
    }_${uuidv4()}`;
    const uploadResult = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: "engagement_contracts",
          public_id: `engagement_${engagement.id}_${uuidv4()}`,
          resource_type: "auto", // <-- Let Cloudinary detect file type
          format: "pdf", // <-- Force extension
        },
        (error, result) => {
          if (error) return reject(error);
          resolve(result);
        }
      );
      uploadStream.end(pdfBuffer);
    });

    const uploadObj = uploadResult || {};
    // Create Document record referencing Cloudinary URL
    const doc = await Document.create({
      caseId: engagement.caseId,
      title: `Engagement Contract - ${context.clientName || "Client"}`,
      type: "contract",
      filePath: uploadObj.secure_url || uploadObj.url || "",
      createdBy: actorId || null,
    });

    engagement.agreementDocId = doc.id;
    await engagement.save();

    await this.logActivity({
      userId: actorId,
      action: "generate",
      targetType: "Engagement",
      targetId: engagement.id,
      details: `Generated contract document ${doc.id} uploaded to Cloudinary`,
    });

    return { doc, upload: uploadObj };
  }

  // POST /engagement/generateContract/:id/:userId
  async generateContract(req, res) {
    try {
      const { id, userId } = req.params;
      const actor = userId ? await User.findByPk(userId) : null;
      const role = actor?.role ?? "client";
      const perms = getPermissionsByRole(role);

      if (!perms.includes(PERMISSIONS.ENGAGEMENTS.UPDATE) && role !== "admin") {
        return this.createResponse(
          { success: false, message: "Unauthorized" },
          403
        );
      }

      // call helper
      const result = await this._generateAndAttachContract({
        engagementId: id,
        actorId: userId,
      });

      return this.createResponse({
        success: true,
        data: { documentId: result.doc.id, filePath: result.doc.filePath },
      });
    } catch (err) {
      console.error("generateContract error:", err);
      return this.createResponse({ success: false, message: err.message });
    }
  }

  // PUT /engagement/update/:id/:userId
  async update(req, res) {
    try {
      const { id, userId } = req.params;
      const actor = userId ? await User.findByPk(userId) : null;
      const role = actor?.role ?? "client";
      const perms = getPermissionsByRole(role);

      if (!perms.includes(PERMISSIONS.ENGAGEMENTS.UPDATE) && role !== "admin") {
        return this.createResponse(
          { success: false, message: "Unauthorized" },
          403
        );
      }

      const engagement = await Engagement.findByPk(id);
      if (!engagement)
        return this.createResponse(
          { success: false, message: "Not found" },
          404
        );

      const { caseId, clientId, lawyerId, startDate, endDate, status } =
        req.body;
      engagement.caseId = caseId ?? engagement.caseId;
      engagement.clientId = clientId ?? engagement.clientId;
      engagement.lawyerId = lawyerId ?? engagement.lawyerId;
      engagement.startDate = startDate ?? engagement.startDate;
      engagement.endDate = endDate ?? engagement.endDate;
      engagement.status = status ?? engagement.status;
      await engagement.save();

      await this.logActivity({
        userId,
        action: "update",
        targetType: "Engagement",
        targetId: id,
        details: `Updated engagement ${id}`,
      });

      return this.createResponse({ success: true, data: engagement });
    } catch (err) {
      console.error("Engagement.update error:", err);
      return this.createResponse({ success: false, message: err.message });
    }
  }

  // DELETE /engagement/delete/:id/:userId
  async delete(req, res) {
    try {
      const { id, userId } = req.params;
      const actor = userId ? await User.findByPk(userId) : null;
      const role = actor?.role ?? "client";
      const perms = getPermissionsByRole(role);

      if (!perms.includes(PERMISSIONS.ENGAGEMENTS.DELETE) && role !== "admin") {
        return this.createResponse(
          { success: false, message: "Unauthorized" },
          403
        );
      }

      const engagement = await Engagement.findByPk(id);
      if (!engagement)
        return this.createResponse(
          { success: false, message: "Not found" },
          404
        );

      // Optionally delete Cloudinary contract (and Document record)
      if (engagement.agreementDocId) {
        const doc = await Document.findByPk(engagement.agreementDocId);
        if (doc && doc.filePath) {
          // Cloudinary public_id extraction is needed to delete; if you saved public_id in Document, delete easily.
          // If only saved secure_url, skip automatic deletion or extract public_id from URL (not recommended).
          // For safety, we'll skip automatic deletion unless you store public_id.
        }
        if (doc) await doc.destroy();
      }

      await engagement.destroy();

      await this.logActivity({
        userId,
        action: "delete",
        targetType: "Engagement",
        targetId: id,
        details: `Deleted engagement ${id}`,
      });

      return this.createResponse({ success: true, message: "Deleted" });
    } catch (err) {
      console.error("Engagement.delete error:", err);
      return this.createResponse({ success: false, message: err.message });
    }
  }
}

module.exports = EngagementController;
