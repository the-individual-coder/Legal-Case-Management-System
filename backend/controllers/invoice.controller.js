// backend/controllers/InvoiceController.js
// Controller for Invoice model
// Routes:
// GET    /invoice/list
// GET    /invoice/get/:id
// POST   /invoice/create
// PUT    /invoice/update/:id/:userId
// PUT    /invoice/pay/:id/:userId
// DELETE /invoice/delete/:id/:userId
// POST   /invoice/createFromEngagement/:engagementId/:userId  (helper)

const path = require("path");
const { v4: uuidv4 } = require("uuid");
const fs = require("fs-extra");
const cloudinary = require("cloudinary").v2;
const BaseController = require("../utils/BaseController");
const {
  Invoice,
  Client,
  Case,
  Engagement,
  Document,
  User,
} = require("../models");
const logActivity = require("../utils/logActivity");
const { getPermissionsByRole, PERMISSIONS } = require("../utils/rbac");

// Cloudinary config (ensure env vars set)
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || "",
  api_key: process.env.CLOUDINARY_API_KEY || "",
  api_secret: process.env.CLOUDINARY_API_SECRET || "",
});

class InvoiceController extends BaseController {
  constructor() {
    super(Invoice);
  }
  static async uploadProof(req, res) {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      const { invoiceId, caseId, userId } = req.body;

      const tempPath = req.file.path;
      const fileName = `${uuidv4()}-${req.file.originalname}`;
      const upload = await cloudinary.uploader.upload(tempPath, {
        folder: "billing/proofs",
        public_id: fileName,
        resource_type: "auto",
      });

      // Save document record
      const document = await Document.create({
        caseId: caseId,
        title: "Payment Proof",
        type: "payment_proof",
        filePath: upload.secure_url,
        createdBy: userId,
      });

      // Update invoice
      await Invoice.update(
        { status: "paid", paidAt: new Date() },
        { where: { id: invoiceId } }
      );

      await logActivity({
        userId,
        action: "upload",
        targetType: "Invoice",
        targetId: invoiceId,
        details: `Uploaded payment proof (Document #${document.id})`,
      });

      // cleanup tmp file
      await fs.remove(tempPath);

      return res.status(200).json({ success: true, document });
    } catch (error) {
      console.error("Billing uploadProof error:", error);
      return res.status(500).json({ error: "Failed to upload proof" });
    }
  }

  // GET /invoice/list
  async list(req, res) {
    try {
      const { clientId, caseId, status, q, page = 1, limit = 100 } = req.query;
      const where = {};
      if (clientId) where.clientId = clientId;
      if (caseId) where.caseId = caseId;
      if (status) where.status = status;
      if (q) where.description = { [this.Op.iLike]: `%${q}%` };

      const offset = (Number(page) - 1) * Number(limit);

      const invoices = await Invoice.findAll({
        where,
        include: [
          {
            model: Client,
            as: "Client",
            attributes: ["id", "firstName", "lastName", "email"],
          },
          { model: Case, as: "Case", attributes: ["id", "title"] },
        ],
        order: [["createdAt", "DESC"]],
        limit: Number(limit),
        offset,
      });

      return this.createResponse({ success: true, data: invoices });
    } catch (err) {
      console.error("Invoice.list error:", err);
      return this.createResponse({ success: false, message: err.message });
    }
  }

  // GET /invoice/get/:id
  async getById(req, res) {
    try {
      const { id } = req.params;
      const invoice = await Invoice.findByPk(id, {
        include: [
          {
            model: Client,
            as: "Client",
            attributes: ["id", "firstName", "lastName", "email"],
          },
          { model: Case, as: "Case", attributes: ["id", "title"] },
        ],
      });
      if (!invoice)
        return this.createResponse(
          { success: false, message: "Invoice not found" },
          404
        );
      return this.createResponse({ success: true, data: invoice });
    } catch (err) {
      console.error("Invoice.getById error:", err);
      return this.createResponse({ success: false, message: err.message });
    }
  }

  // POST /invoice/create
  async create(req, res) {
    try {
      const {
        caseId,
        clientId,
        amount,
        dueDate,
        paidAt,
        description,
        status,
        userId,
      } = req.body;
      const actorId = userId ?? req.headers["x-user-id"];
      const actor = actorId ? await User.findByPk(actorId) : null;
      const role = actor?.role ?? "client";
      const perms = getPermissionsByRole(role);

      if (!perms.includes(PERMISSIONS.BILLING.CREATE) && role !== "admin") {
        return this.createResponse(
          { success: false, message: "Unauthorized" },
          403
        );
      }

      if (!clientId || !amount) {
        return this.createResponse(
          { success: false, message: "clientId and amount are required" },
          400
        );
      }

      const newInv = await Invoice.create({
        caseId: caseId ?? null,
        clientId,
        amount,
        dueDate: dueDate ?? null,
        paidAt: paidAt ?? null,
        description: description ?? null,
        status: status ?? "pending",
      });

      await logActivity({
        userId: actorId || null,
        action: "create",
        targetType: "Invoice",
        targetId: newInv.id,
        details: `Created invoice ${newInv.id} for client ${clientId} case ${
          caseId || "n/a"
        }`,
      });

      return this.createResponse({ success: true, data: newInv });
    } catch (err) {
      console.error("Invoice.create error:", err);
      return this.createResponse({ success: false, message: err.message });
    }
  }

  // PUT /invoice/update/:id/:userId
  async update(req, res) {
    try {
      const { id, userId } = req.params;
      const actor = userId ? await User.findByPk(userId) : null;
      const role = actor?.role ?? "client";
      const perms = getPermissionsByRole(role);

      if (!perms.includes(PERMISSIONS.BILLING.UPDATE) && role !== "admin") {
        return this.createResponse(
          { success: false, message: "Unauthorized" },
          403
        );
      }

      const invoice = await Invoice.findByPk(id);
      if (!invoice)
        return this.createResponse(
          { success: false, message: "Invoice not found" },
          404
        );

      const { amount, dueDate, paidAt, description, status } = req.body;
      await invoice.update({
        amount: amount ?? invoice.amount,
        dueDate: dueDate ?? invoice.dueDate,
        paidAt: paidAt ?? invoice.paidAt,
        description: description ?? invoice.description,
        status: status ?? invoice.status,
      });

      await logActivity({
        userId: userId || null,
        action: "update",
        targetType: "Invoice",
        targetId: invoice.id,
        details: `Updated invoice ${invoice.id}`,
      });

      return this.createResponse({ success: true, data: invoice });
    } catch (err) {
      console.error("Invoice.update error:", err);
      return this.createResponse({ success: false, message: err.message });
    }
  }

  // PUT /invoice/pay/:id/:userId
  // Body: { paymentProof: "<url>", paidAt: "<ISO string>" }
  async pay(req, res) {
    try {
      const { id, userId } = req.params;
      const actor = userId ? await User.findByPk(userId) : null;
      const role = actor?.role ?? "client";
      const perms = getPermissionsByRole(role);

      // clients are allowed to mark as paid (upload proof), staff/admin can also
      if (
        ![PERMISSIONS.BILLING.UPDATE, PERMISSIONS.BILLING.CREATE].some((p) =>
          perms.includes(p)
        ) &&
        role !== "admin" &&
        role !== "client"
      ) {
        // allow client and admin; staff has billing.CREATE/UPDATE above
        // clients can call pay to upload proof
        // so no immediate reject here; allow client
      }

      const invoice = await Invoice.findByPk(id);
      if (!invoice)
        return this.createResponse(
          { success: false, message: "Invoice not found" },
          404
        );

      const { paymentProof, paidAt } = req.body;

      await invoice.update({
        status: "paid",
        paidAt: paidAt ? new Date(paidAt) : new Date(),
      });

      // Create Document record for payment proof if provided
      if (paymentProof) {
        try {
          const doc = await Document.create({
            caseId: invoice.caseId ?? null,
            title: `Payment proof - invoice ${invoice.id}`,
            type: "payment_proof",
            content: "",
            filePath: paymentProof,
            createdBy: userId || null,
          });

          // Optionally, attach document id somewhere or leave as standalone evidence.
        } catch (docErr) {
          console.warn("Failed to create payment proof document:", docErr);
        }
      }

      await logActivity({
        userId: userId || null,
        action: "pay",
        targetType: "Invoice",
        targetId: invoice.id,
        details: `Invoice ${invoice.id} marked as paid by user ${
          userId || "unknown"
        }`,
      });

      return this.createResponse({ success: true, data: invoice });
    } catch (err) {
      console.error("Invoice.pay error:", err);
      return this.createResponse({ success: false, message: err.message });
    }
  }

  // DELETE /invoice/delete/:id/:userId
  async delete(req, res) {
    try {
      const { id, userId } = req.params;
      const actor = userId ? await User.findByPk(userId) : null;
      const role = actor?.role ?? "client";
      const perms = getPermissionsByRole(role);

      if (!perms.includes(PERMISSIONS.BILLING.DELETE) && role !== "admin") {
        return this.createResponse(
          { success: false, message: "Unauthorized" },
          403
        );
      }

      const invoice = await Invoice.findByPk(id);
      if (!invoice)
        return this.createResponse(
          { success: false, message: "Invoice not found" },
          404
        );

      await invoice.destroy();

      await logActivity({
        userId: userId || null,
        action: "delete",
        targetType: "Invoice",
        targetId: id,
        details: `Deleted invoice ${id}`,
      });

      return this.createResponse({ success: true, message: "Deleted" });
    } catch (err) {
      console.error("Invoice.delete error:", err);
      return this.createResponse({ success: false, message: err.message });
    }
  }

  // POST /invoice/createFromEngagement/:engagementId/:userId
  // Helper: create retainer invoice when engagement accepted (call from Engagement acceptance flow)
  async createFromEngagement(req, res) {
    try {
      const { engagementId, userId } = req.params;
      const engagement = await Engagement.findByPk(engagementId);
      if (!engagement)
        return this.createResponse(
          { success: false, message: "Engagement not found" },
          404
        );

      // Example default retainer amount: you can fetch from engagement or client settings
      const defaultRetainer = Number(process.env.DEFAULT_RETAINER_AMOUNT || 0);

      const inv = await Invoice.create({
        caseId: engagement.caseId ?? null,
        clientId: engagement.clientId,
        amount: defaultRetainer,
        dueDate: null,
        paidAt: null,
        description: `Retainer for engagement ${engagementId}`,
        status: defaultRetainer > 0 ? "pending" : "paid",
      });

      await logActivity({
        userId: userId || null,
        action: "create",
        targetType: "Invoice",
        targetId: inv.id,
        details: `Auto-created retainer invoice ${inv.id} for engagement ${engagementId}`,
      });

      return this.createResponse({ success: true, data: inv });
    } catch (err) {
      console.error("Invoice.createFromEngagement error:", err);
      return this.createResponse({ success: false, message: err.message });
    }
  }
}

module.exports = InvoiceController;
