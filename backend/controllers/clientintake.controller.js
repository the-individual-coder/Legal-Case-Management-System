const { ClientIntake, Client } = require("../models");
const { Op } = require("sequelize");
const BaseController = require("../utils/BaseController");

module.exports = class ClientIntakeController extends BaseController {
  constructor() {
    super(ClientIntake);
  }

  // GET /clientIntake/list
  async list(req, res) {
    try {
      const data = await ClientIntake.findAll({
        include: [
          {
            model: Client,
            as: "Client",
            attributes: ["id", "firstName", "lastName", "email", "phone"],
          },
        ],
        order: [["createdAt", "DESC"]],
      });
      return this.createResponse({ success: true, data });
    } catch (err) {
      return this.createResponse({ success: false, message: err.message });
    }
  }

  // GET /clientIntake/:id
  async getById(req, res) {
    try {
      const { id } = req.params;
      const intake = await ClientIntake.findByPk(id, {
        include: [
          {
            model: Client,
            as: "Client",
            attributes: ["id", "firstName", "lastName", "email", "phone"],
          },
        ],
      });

      if (!intake) {
        return this.createResponse({
          success: false,
          message: "Intake not found",
        });
      }

      return this.createResponse({ success: true, data: intake });
    } catch (err) {
      return this.createResponse({ success: false, message: err.message });
    }
  }

  // POST /clientIntake/create
  async create(req, res) {
    try {
      const { clientId, caseType, referredBy, intakeNotes } = req.body;

      const newIntake = await ClientIntake.create({
        clientId,
        caseType,
        referredBy,
        intakeNotes,
      });

      return this.createResponse({ success: true, data: newIntake });
    } catch (err) {
      return this.createResponse({ success: false, message: err.message });
    }
  }

  // PUT /clientIntake/:id
  async update(req, res) {
    try {
      const { id } = req.params;
      const intake = await ClientIntake.findByPk(id);
      if (!intake)
        return this.createResponse({
          success: false,
          message: "Intake not found",
        });

      await intake.update(req.body);
      return this.createResponse({ success: true, data: intake });
    } catch (err) {
      return this.createResponse({ success: false, message: err.message });
    }
  }

  // DELETE /clientIntake/:id
  async delete(req, res) {
    try {
      const { id } = req.params;
      const intake = await ClientIntake.findByPk(id);
      if (!intake)
        return this.createResponse({
          success: false,
          message: "Intake not found",
        });

      await intake.destroy();
      return this.createResponse({
        success: true,
        message: "Deleted successfully",
      });
    } catch (err) {
      return this.createResponse({ success: false, message: err.message });
    }
  }
};
