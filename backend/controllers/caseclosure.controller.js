// backend/controllers/ClosureController.js
const { CaseClosure, Case, User } = require("../models");
const BaseController = require("../utils/BaseController");
const { Op } = require("sequelize");

module.exports = class CaseclosureController extends BaseController {
  constructor() {
    super(CaseClosure);
  }

  // GET /closure/getClosures?caseId=&closedById=&startDate=&endDate=
  async getClosures(req, res) {
    try {
      const { caseId, closedById, startDate, endDate } = req.query;
      const where = {};

      if (caseId) where.caseId = caseId;
      if (closedById) where.closedById = closedById;
      if (startDate && endDate) {
        where.closedAt = {
          [Op.between]: [new Date(startDate), new Date(endDate)],
        };
      }

      const data = await CaseClosure.findAll({
        where,
        include: [
          { model: Case, attributes: ["id", "title", "status"] },
          {
            model: User,
            as: "closedBy",
            attributes: ["id", "name", "email", "image"],
          },
        ],
        order: [["closedAt", "DESC"]],
      });

      return this.createResponse({ success: true, data });
    } catch (err) {
      return this.createResponse({ success: false, message: err.message });
    }
  }

  // GET /closure/getClosure/:id
  async getClosureById(req, res) {
    try {
      const { id } = req.params;
      const closure = await CaseClosure.findByPk(id, {
        include: [
          {
            model: Case,
            attributes: ["id", "title", "status", "clientId"],
          },
          {
            model: User,
            as: "closedBy",
            attributes: ["id", "name", "email", "image"],
          },
        ],
      });

      if (!closure) {
        return this.createResponse({
          success: false,
          message: "Closure not found",
        });
      }

      return this.createResponse({ success: true, data: closure });
    } catch (err) {
      return this.createResponse({ success: false, message: err.message });
    }
  }

  // POST /closure/createClosure/:userId
  async createClosure(req, res) {
    try {
      const { caseId, closedAt, summary } = req.body;
      const { userId } = req.params;

      // Basic validation
      if (!caseId) {
        return this.createResponse({
          success: false,
          message: "caseId is required",
        });
      }

      const newClosure = await CaseClosure.create({
        caseId,
        closedById: userId,
        closedAt: closedAt ? new Date(closedAt) : new Date(),
        summary: summary || null,
      });

      await this.logActivity({
        userId,
        action: "create",
        targetType: "CaseClosure",
        targetId: newClosure.id,
        details: `Closed caseId:${caseId} by user:${userId}`,
      });

      // Optionally update Case.status here if you want (example commented)
      // await Case.update({ status: 'closed' }, { where: { id: caseId } });

      return this.createResponse({ success: true, data: newClosure });
    } catch (err) {
      return this.createResponse({ success: false, message: err.message });
    }
  }

  // PUT /closure/updateClosure/:id/:userId
  async updateClosure(req, res) {
    try {
      const { id, userId } = req.params;
      const closure = await CaseClosure.findByPk(id);
      if (!closure) {
        return this.createResponse({
          success: false,
          message: "Closure not found",
        });
      }

      await closure.update(req.body);

      await this.logActivity({
        userId,
        action: "update",
        targetType: "CaseClosure",
        targetId: id,
        details: `Updated closure ID ${id}`,
      });

      return this.createResponse({ success: true, data: closure });
    } catch (err) {
      return this.createResponse({ success: false, message: err.message });
    }
  }

  // DELETE /closure/deleteClosure/:id/:userId
  async deleteClosure(req, res) {
    try {
      const { id, userId } = req.params;
      const closure = await CaseClosure.findByPk(id);
      if (!closure) {
        return this.createResponse({
          success: false,
          message: "Closure not found",
        });
      }

      await closure.destroy();

      await this.logActivity({
        userId,
        action: "delete",
        targetType: "CaseClosure",
        targetId: id,
        details: `Deleted closure ID ${id}`,
      });

      return this.createResponse({ success: true, message: "Closure deleted" });
    } catch (err) {
      return this.createResponse({ success: false, message: err.message });
    }
  }
};
