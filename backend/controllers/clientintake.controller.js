// backend/controllers/ClientIntakeController.js
const { ClientIntake, User, Client } = require("../models");
const BaseController = require("../utils/BaseController");
const { getPermissionsByRole } = require("../utils/rbac.js");
const { PERMISSIONS } = require("../utils/rbac.js"); // or adjust import path

module.exports = class ClientIntakeController extends BaseController {
  constructor() {
    super(ClientIntake);
  }

  // GET /clientintake/list
  async list(req, res) {
    try {
      const records = await ClientIntake.findAll({
        include: [{ model: Client }].filter(Boolean),
        order: [["createdAt", "DESC"]],
      });
      return this.createResponse({ success: true, data: records });
    } catch (err) {
      return this.createResponse({ success: false, message: err.message });
    }
  }

  // GET /clientintake/getByClient/:clientId
  async getByClient(req, res) {
    try {
      const { clientId } = req.params;
      if (!clientId) {
        return this.createResponse({
          success: false,
          message: "clientId required",
        });
      }
      const records = await ClientIntake.findAll({
        where: { clientId },
        order: [["createdAt", "DESC"]],
      });
      return this.createResponse({ success: true, data: records });
    } catch (err) {
      return this.createResponse({ success: false, message: err.message });
    }
  }

  // POST /clientintake/create
  async create(req, res) {
    try {
      const userId = req.body.userId ?? req.headers["x-user-id"];
      const user = await User.findByPk(userId);
      const userRole = user?.role ?? "client";
      const perms = getPermissionsByRole(userRole);

      if (
        !perms.includes(PERMISSIONS.CLIENT_INTAKE.CREATE) &&
        userRole !== "admin"
      ) {
        return this.createResponse(
          { success: false, message: "Unauthorized" },
          403
        );
      }

      const { clientId, caseType, referredBy, intakeNotes } = req.body;
      if (!clientId) {
        return this.createResponse(
          { success: false, message: "clientId is required" },
          400
        );
      }

      const rec = await ClientIntake.create({
        clientId,
        caseType,
        referredBy,
        intakeNotes,
      });

      await this.logActivity({
        userId,
        action: "create",
        targetType: "ClientIntake",
        targetId: rec.id,
        details: `Created client intake for clientId=${clientId}`,
      });

      return this.createResponse({ success: true, data: rec });
    } catch (err) {
      console.error("ClientIntake.create error:", err);
      return this.createResponse({ success: false, message: err.message });
    }
  }

  // PUT /clientintake/update/:id/:userId
  async update(req, res) {
    try {
      const { id, userId } = req.params;
      const user = await User.findByPk(userId);
      const userRole = user?.role ?? "client";
      const perms = getPermissionsByRole(userRole);

      if (
        !perms.includes(PERMISSIONS.CLIENT_INTAKE.UPDATE) &&
        userRole !== "admin"
      ) {
        return this.createResponse(
          { success: false, message: "Unauthorized" },
          403
        );
      }

      const intake = await ClientIntake.findByPk(id);
      if (!intake) {
        return this.createResponse(
          { success: false, message: "ClientIntake not found" },
          404
        );
      }

      const { caseType, referredBy, intakeNotes } = req.body;
      intake.caseType = caseType ?? intake.caseType;
      intake.referredBy = referredBy ?? intake.referredBy;
      intake.intakeNotes = intakeNotes ?? intake.intakeNotes;

      await intake.save();

      await this.logActivity({
        userId,
        action: "update",
        targetType: "ClientIntake",
        targetId: id,
        details: `Updated client intake ${id}`,
      });

      return this.createResponse({ success: true, data: intake });
    } catch (err) {
      console.error("ClientIntake.update error:", err);
      return this.createResponse({ success: false, message: err.message });
    }
  }

  // DELETE /clientintake/delete/:id/:userId
  async delete(req, res) {
    try {
      const { id, userId } = req.params;
      const user = await User.findByPk(userId);
      const userRole = user?.role ?? "client";
      const perms = getPermissionsByRole(userRole);

      if (
        !perms.includes(PERMISSIONS.CLIENT_INTAKE.DELETE) &&
        userRole !== "admin"
      ) {
        return this.createResponse(
          { success: false, message: "Unauthorized" },
          403
        );
      }

      const rec = await ClientIntake.findByPk(id);
      if (!rec) {
        return this.createResponse(
          { success: false, message: "ClientIntake not found" },
          404
        );
      }

      await rec.destroy();

      await this.logActivity({
        userId,
        action: "delete",
        targetType: "ClientIntake",
        targetId: id,
        details: `Deleted client intake ${id}`,
      });

      return this.createResponse({ success: true, message: "Deleted" });
    } catch (err) {
      console.error("ClientIntake.delete error:", err);
      return this.createResponse({ success: false, message: err.message });
    }
  }
};
