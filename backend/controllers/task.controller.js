// backend/controllers/TaskController.js
const { Task, Case, User } = require("../models");
const BaseController = require("../utils/BaseController");
const { Op } = require("sequelize");

module.exports = class TaskController extends BaseController {
  constructor() {
    super(Task);
  }

  // GET /task/getTasks
  async getTasks(req, res) {
    try {
      const { caseId, assignedToId, status, startDate, endDate } = req.query;

      const where = {};
      if (caseId) where.caseId = caseId;
      if (assignedToId) where.assignedToId = assignedToId;
      if (status) where.status = status;
      if (startDate && endDate) {
        where.dueDate = {
          [Op.between]: [new Date(startDate), new Date(endDate)],
        };
      }

      const data = await Task.findAll({
        where,
        include: [
          { model: Case, attributes: ["id", "title"] },
          {
            model: User,
            as: "assignee",
            attributes: ["id", "name", "email", "image"],
          },
        ],
        order: [["dueDate", "ASC"]],
      });

      return this.createResponse({ success: true, data });
    } catch (err) {
      return this.createResponse({ success: false, message: err.message });
    }
  }

  // GET /task/getTask/:id
  async getTaskById(req, res) {
    try {
      const { id } = req.params;
      const task = await Task.findByPk(id, {
        include: [
          { model: Case, attributes: ["id", "title"] },
          {
            model: User,
            as: "assignee",
            attributes: ["id", "name", "email"],
          },
        ],
      });

      if (!task)
        return this.createResponse({
          success: false,
          message: "Task not found",
        });
      return this.createResponse({ success: true, data: task });
    } catch (err) {
      return this.createResponse({ success: false, message: err.message });
    }
  }

  // POST /task/createTask/:userId
  async createTask(req, res) {
    try {
      const { caseId, assignedToId, title, description, status, dueDate } =
        req.body;
      const { userId } = req.params;

      const newTask = await Task.create({
        caseId,
        assignedToId,
        title,
        description,
        status,
        dueDate,
      });

      await this.logActivity({
        userId,
        action: "create",
        targetType: "Task",
        targetId: newTask.id,
        details: `Created task '${title}' for caseId ${caseId}`,
      });

      return this.createResponse({ success: true, data: newTask });
    } catch (err) {
      return this.createResponse({ success: false, message: err.message });
    }
  }

  // PUT /task/updateTask/:id/:userId
  async updateTask(req, res) {
    try {
      const { id, userId } = req.params;
      const task = await Task.findByPk(id);
      if (!task)
        return this.createResponse({
          success: false,
          message: "Task not found",
        });

      await task.update(req.body);

      await this.logActivity({
        userId,
        action: "update",
        targetType: "Task",
        targetId: id,
        details: `Updated task ID ${id}`,
      });

      return this.createResponse({ success: true, data: task });
    } catch (err) {
      return this.createResponse({ success: false, message: err.message });
    }
  }

  // DELETE /task/deleteTask/:id/:userId
  async deleteTask(req, res) {
    try {
      const { id, userId } = req.params;
      const task = await Task.findByPk(id);
      if (!task)
        return this.createResponse({
          success: false,
          message: "Task not found",
        });

      await task.destroy();

      await this.logActivity({
        userId,
        action: "delete",
        targetType: "Task",
        targetId: id,
        details: `Deleted task ID ${id}`,
      });

      return this.createResponse({ success: true, message: "Task deleted" });
    } catch (err) {
      return this.createResponse({ success: false, message: err.message });
    }
  }
};
