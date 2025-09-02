const { Engagement, Client, Case, ActivityLog } = require("../models");
const BaseController = require("../utils/BaseController");
module.exports = class EngagementController extends BaseController {
  constructor() {
    super(Engagement);
  }

  // GET /engagement
  async getEngagements(req, res) {
    try {
      const { clientId, caseId } = req.query;
      const where = {};
      if (clientId) where.clientId = clientId;
      if (caseId) where.caseId = caseId;

      const data = await Engagement.findAll({
        where,
        include: [
          { model: Client, attributes: ["id", "firstName", "lastName"] },
          { model: Case, attributes: ["id", "title"] },
        ],
        order: [["createdAt", "DESC"]],
      });

      return res.json({ success: true, data });
    } catch (err) {
      return res.json({ success: false, message: err.message });
    }
  }

  // POST /engagement
  async createEngagement(req, res) {
    try {
      const { clientId, caseId, proposalContent, status, userId } = req.body;

      const engagement = await Engagement.create({
        clientId,
        caseId,
        proposalContent,
        status: status || "draft",
      });

      await logActivity({
        userId,
        action: "create",
        targetType: "Engagement",
        targetId: engagement.id,
        details: `Created engagement for client ${clientId}, case ${caseId}`,
      });

      return res.json({ success: true, data: engagement });
    } catch (err) {
      return res.json({ success: false, message: err.message });
    }
  }

  // POST /engagement/:id
  async updateEngagement(req, res) {
    try {
      const { id } = req.params;
      const { userId, ...updateData } = req.body;

      const engagement = await Engagement.findByPk(id);
      if (!engagement)
        return res.json({ success: false, message: "Engagement not found" });

      await engagement.update(updateData);

      await logActivity({
        userId,
        action: "update",
        targetType: "Engagement",
        targetId: id,
        details: `Updated engagement for client ${engagement.clientId}`,
      });

      return res.json({ success: true, data: engagement });
    } catch (err) {
      return res.json({ success: false, message: err.message });
    }
  }

  // DELETE /engagement/:id/:userId
  async deleteEngagement(req, res) {
    try {
      const { id, userId } = req.params;

      const engagement = await Engagement.findByPk(id);
      if (!engagement)
        return res.json({ success: false, message: "Engagement not found" });

      await engagement.destroy();

      await logActivity({
        userId,
        action: "delete",
        targetType: "Engagement",
        targetId: id,
        details: `Deleted engagement for client ${engagement.clientId}`,
      });

      return res.json({ success: true, message: "Deleted successfully" });
    } catch (err) {
      return res.json({ success: false, message: err.message });
    }
  }
};
