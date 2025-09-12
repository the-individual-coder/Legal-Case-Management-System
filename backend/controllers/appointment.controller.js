const { Appointment, Case, Client, User } = require("../models");
const BaseController = require("../utils/BaseController");
const { Op } = require("sequelize");
module.exports = class AppointmentController extends BaseController {
  constructor() {
    super(Appointment);
  }

  // controllers/appointmentsController.ts

  // GET /api/appointments
  async getAppointments(req, res) {
    try {
      const { caseId, clientId, lawyerId, startDate, endDate } = req.query;

      const where = {};
      if (caseId) where.caseId = caseId;
      if (clientId) where.clientId = clientId;
      if (lawyerId) where.lawyerId = lawyerId;
      if (startDate && endDate) {
        where.scheduledAt = {
          [Op.between]: [new Date(startDate), new Date(endDate)],
        };
      }

      const data = await Appointment.findAll({
        where,
        include: [
          { model: Case, as: "Case", attributes: ["id", "title"] },
          {
            model: Client,
            as: "client",
            attributes: ["id", "firstName", "lastName", "email"],
          },
          {
            model: User,
            as: "lawyer",
            attributes: ["id", "name", "email", "image"],
          },
        ],
        order: [["scheduledAt", "ASC"]],
      });

      return this.createResponse({ success: true, data });
    } catch (err) {
      return this.createResponse({ success: false, message: err.message });
    }
  }

  // GET /api/appointments/:id
  async getAppointmentById(req, res) {
    try {
      const { id } = req.params;

      const appointment = await Appointment.findByPk(id, {
        include: [
          { model: Case, as: "Case", attributes: ["id", "title"] },
          {
            model: Client,
            as: "Client",
            attributes: ["id", "firstName", "lastName", "email"],
          },
          {
            model: User,
            as: "Lawyer",
            attributes: ["id", "name", "email", "image"],
          },
        ],
      });

      if (!appointment) {
        return this.createResponse({
          success: false,
          message: "Appointment not found",
        });
      }

      return this.createResponse({ success: true, data: appointment });
    } catch (err) {
      return this.createResponse({ success: false, message: err.message });
    }
  }

  // POST /api/appointments
  async createAppointment(req, res) {
    try {
      const { caseId, clientId, lawyerId, scheduledAt, status, notes } =
        req.body;
      const { userId } = req.params;
      const newAppointment = await Appointment.create({
        caseId,
        clientId,
        lawyerId,
        scheduledAt,
        status,
        notes,
      });

      // Log activity
      await this.logActivity({
        userId,
        action: "create",
        targetType: "Appointment",
        targetId: newAppointment.id,
        details: `Created appointment for clientId: ${clientId}, caseId: ${caseId}`,
      });

      return this.createResponse({ success: true, data: newAppointment });
    } catch (err) {
      return this.createResponse({ success: false, message: err.message });
    }
  }

  // PUT /api/appointments/:id
  async updateAppointment(req, res) {
    try {
      const { id, userId } = req.params;
      const appointment = await Appointment.findByPk(id);
      if (!appointment) {
        return this.createResponse({
          success: false,
          message: "Appointment not found",
        });
      }

      await appointment.update(req.body);

      await this.logActivity({
        userId,
        action: "update",
        targetType: "Appointment",
        targetId: id,
        details: `Updated appointment ID ${id}`,
      });

      return this.createResponse({ success: true, data: appointment });
    } catch (err) {
      return this.createResponse({ success: false, message: err.message });
    }
  }

  // DELETE /api/appointments/:id
  async deleteAppointment(req, res) {
    try {
      const { id, userId } = req.params;

      const appointment = await Appointment.findByPk(id);
      if (!appointment) {
        return this.createResponse({
          success: false,
          message: "Appointment not found",
        });
      }

      await appointment.destroy();

      await this.logActivity({
        userId,
        action: "delete",
        targetType: "Appointment",
        targetId: id,
        details: `Deleted appointment ID ${id}`,
      });

      return this.createResponse({
        success: true,
        message: "Appointment deleted",
      });
    } catch (err) {
      return this.createResponse({ success: false, message: err.message });
    }
  }
};
