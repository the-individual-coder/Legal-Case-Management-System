// backend/controllers/CalendarController.js
const { CalendarEvent, Case, User } = require("../models");
const BaseController = require("../utils/BaseController");
const { Op } = require("sequelize");

module.exports = class CalendareventController extends BaseController {
  constructor() {
    super(CalendarEvent);
  }

  async getEventsByIdWithParams(req, res) {
    try {
      const { id } = req.params;
      const { caseId, createdById, startDate, endDate } = req.query;
      const where = {};
      if (caseId) where.caseId = caseId;
      if (createdById) where.createdById = createdById;
      if (startDate && endDate) {
        where.startTime = {
          [Op.between]: [new Date(startDate), new Date(endDate)],
        };
        where.id = id;
      }

      const data = await CalendarEvent.findAll({
        where,
        include: [
          { model: Case, as: "Case", attributes: ["id", "title"] },
          {
            model: User,
            as: "creator",
            attributes: ["id", "name", "email", "image"],
          },
        ],
        order: [["startTime", "ASC"]],
      });

      return this.createResponse({ success: true, data });
    } catch (err) {
      return this.createResponse({ success: false, message: err.message });
    }
  }
  // GET /calendar/getEvents?caseId=&createdById=&startDate=&endDate=
  async getEvents(req, res) {
    try {
      const { caseId, createdById, startDate, endDate } = req.query;
      const where = {};
      if (caseId) where.caseId = caseId;
      if (createdById) where.createdById = createdById;
      if (startDate && endDate) {
        where.startTime = {
          [Op.between]: [new Date(startDate), new Date(endDate)],
        };
      }

      const data = await CalendarEvent.findAll({
        where,
        include: [
          { model: Case, as: "Case", attributes: ["id", "title"] },
          {
            model: User,
            as: "creator",
            attributes: ["id", "name", "email", "image"],
          },
        ],
        order: [["startTime", "ASC"]],
      });

      return this.createResponse({ success: true, data });
    } catch (err) {
      return this.createResponse({ success: false, message: err.message });
    }
  }

  // GET /calendar/getEvent/:id
  async getEventById(req, res) {
    try {
      const { id } = req.params;
      const ev = await CalendarEvent.findByPk(id, {
        include: [
          { model: Case, as: "Case", attributes: ["id", "title"] },
          {
            model: User,
            as: "creator",
            attributes: ["id", "name", "email", "image"],
          },
        ],
      });

      if (!ev)
        return this.createResponse({
          success: false,
          message: "Event not found",
        });
      return this.createResponse({ success: true, data: ev });
    } catch (err) {
      return this.createResponse({ success: false, message: err.message });
    }
  }

  // POST /calendar/createEvent/:userId
  async createEvent(req, res) {
    try {
      const { title, description, startTime, endTime, caseId } = req.body;
      const { userId } = req.params;

      const newEv = await CalendarEvent.create({
        title,
        description,
        startTime,
        endTime,
        caseId: caseId || null,
        createdById: userId,
      });

      await this.logActivity({
        userId,
        action: "create",
        targetType: "CalendarEvent",
        targetId: newEv.id,
        details: `Created calendar event '${title}' start:${startTime} end:${endTime}`,
      });

      return this.createResponse({ success: true, data: newEv });
    } catch (err) {
      return this.createResponse({ success: false, message: err.message });
    }
  }

  // PUT /calendar/updateEvent/:id/:userId
  async updateEvent(req, res) {
    try {
      const { id, userId } = req.params;
      const ev = await CalendarEvent.findByPk(id);
      if (!ev)
        return this.createResponse({
          success: false,
          message: "Event not found",
        });

      await ev.update(req.body);

      await this.logActivity({
        userId,
        action: "update",
        targetType: "CalendarEvent",
        targetId: id,
        details: `Updated calendar event ID ${id}`,
      });

      return this.createResponse({ success: true, data: ev });
    } catch (err) {
      return this.createResponse({ success: false, message: err.message });
    }
  }

  // DELETE /calendar/deleteEvent/:id/:userId
  async deleteEvent(req, res) {
    try {
      const { id, userId } = req.params;
      const ev = await CalendarEvent.findByPk(id);
      if (!ev)
        return this.createResponse({
          success: false,
          message: "Event not found",
        });

      await ev.destroy();

      await this.logActivity({
        userId,
        action: "delete",
        targetType: "CalendarEvent",
        targetId: id,
        details: `Deleted calendar event ID ${id}`,
      });

      return this.createResponse({ success: true, message: "Event deleted" });
    } catch (err) {
      return this.createResponse({ success: false, message: err.message });
    }
  }
};
