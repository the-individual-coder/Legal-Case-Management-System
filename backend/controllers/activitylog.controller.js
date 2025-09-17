const { ActivityLog, User } = require("../models");
const BaseController = require("../utils/BaseController");
const { Op } = require("sequelize");
module.exports = class ActivitylogController extends BaseController {
  constructor() {
    super(ActivityLog);
  }
  // PUT /activitylog/updateActivityLog/:id/:userId
  async updateActivityLog(req, res) {
    try {
      const { id, userId } = req.params;

      const log = await ActivityLog.findByPk(id);
      if (!log) {
        return this.createResponse({
          success: false,
          message: "ActivityLog not found",
        });
      }

      await log.update(req.body);

      // Record update action
      await this.logActivity({
        userId,
        action: "update",
        targetType: "ActivityLog",
        targetId: id,
        details: `Updated activity log ID ${id}`,
      });

      return this.createResponse({
        success: true,
        message: "ActivityLog updated",
        data: log,
      });
    } catch (err) {
      return this.createResponse({ success: false, message: err.message });
    }
  }

  // GET /activitylog/getActivityLogs
  async getActivityLogs(req, res) {
    try {
      const { userId, action, targetType, startDate, endDate } = req.query;

      const where = {};
      if (userId) where.userId = userId;
      if (action) where.action = action;
      if (targetType) where.targetType = targetType;
      if (startDate && endDate) {
        where.createdAt = {
          [Op.between]: [new Date(startDate), new Date(endDate)],
        };
      }

      const data = await ActivityLog.findAll({
        where,
        include: [
          {
            model: User,
            as: "user",
            attributes: ["id", "name", "email", "role", "image"],
          },
        ],
        order: [["createdAt", "DESC"]],
      });

      return this.createResponse({ success: true, data });
    } catch (err) {
      return this.createResponse({ success: false, message: err.message });
    }
  }
  // async getActivitylogs() {
  //   const activitylog = await ActivityLog.findAll();
  //   console.log("the activitylog", activitylog);
  //   return this.createResponse(activitylog);
  // }
  // GET /activitylog/getActivityLogById/:id
  async getActivityLogById(req, res) {
    try {
      const { id } = req.params;
      const log = await ActivityLog.findByPk(id, {
        include: [
          {
            model: User,
            as: "user",
            attributes: ["id", "name", "email", "role", "image"],
          },
        ],
      });

      if (!log) {
        return this.createResponse({
          success: false,
          message: "ActivityLog not found",
        });
      }

      return this.createResponse({ success: true, data: log });
    } catch (err) {
      return this.createResponse({ success: false, message: err.message });
    }
  }

  // DELETE /activitylog/deleteActivityLog/:id/:userId
  async deleteActivityLog(req, res) {
    try {
      const { id, userId } = req.params;

      const log = await ActivityLog.findByPk(id);
      if (!log) {
        return this.createResponse({
          success: false,
          message: "ActivityLog not found",
        });
      }

      await log.destroy();

      // Record deletion action
      await this.logActivity({
        userId,
        action: "delete",
        targetType: "ActivityLog",
        targetId: id,
        details: `Deleted activity log ID ${id}`,
      });

      return this.createResponse({
        success: true,
        message: "ActivityLog deleted",
      });
    } catch (err) {
      return this.createResponse({ success: false, message: err.message });
    }
  }
};
