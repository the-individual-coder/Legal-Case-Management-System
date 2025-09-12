const { Client } = require("../models");
const logActivity = require("../utils/LogActivity");
const BaseController = require("../utils/BaseController");
const { Op } = require("sequelize");

module.exports = class ClientController extends BaseController {
  constructor() {
    super(Client);
  }

  // GET /api/clients
  async getClients(req, res) {
    try {
      const { search, firstName, lastName, email } = req.query;

      const where = {};

      if (search) {
        // Basic text search across firstName, lastName, email
        where[Op.or] = [
          { firstName: { [Op.iLike]: `%${search}%` } },
          { lastName: { [Op.iLike]: `%${search}%` } },
          { email: { [Op.iLike]: `%${search}%` } },
          { phone: { [Op.iLike]: `%${search}%` } },
          { address: { [Op.iLike]: `%${search}%` } },
        ];
      }

      if (firstName) where.firstName = { [Op.iLike]: `%${firstName}%` };
      if (lastName) where.lastName = { [Op.iLike]: `%${lastName}%` };
      if (email) where.email = { [Op.iLike]: `%${email}%` };

      const data = await Client.findAll({
        where,
        order: [
          ["lastName", "ASC"],
          ["firstName", "ASC"],
        ],
      });

      return this.createResponse({ success: true, data });
    } catch (err) {
      return this.createResponse({ success: false, message: err.message });
    }
  }

  // GET /api/clients/:id
  async getClientById(req, res) {
    try {
      const { id } = req.params;

      const client = await Client.findByPk(id);

      if (!client) {
        return this.createResponse({
          success: false,
          message: "Client not found",
        });
      }

      return this.createResponse({ success: true, data: client });
    } catch (err) {
      return this.createResponse({ success: false, message: err.message });
    }
  }
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
  // POST /api/clients
  async createClient(req, res) {
    try {
      const { firstName, lastName, email, phone, address, notes } = req.body;
      const { userId } = req.params;

      const newClient = await Client.create({
        firstName,
        lastName,
        email,
        phone,
        address,
        notes,
      });

      // Log activity
      await logActivity({
        userId,
        action: "create",
        targetType: "Client",
        targetId: newClient.id,
        details: `Created client ${firstName} ${lastName} (email: ${email})`,
      });

      return this.createResponse({ success: true, data: newClient });
    } catch (err) {
      console.log("the error, err", err);
      return this.createResponse({ success: false, message: err.message });
    }
  }

  // PUT /api/clients/:id
  async updateClient(req, res) {
    try {
      const { id, userId } = req.params;

      const client = await Client.findByPk(id);
      if (!client) {
        return this.createResponse({
          success: false,
          message: "Client not found",
        });
      }

      await client.update(req.body);

      await logActivity({
        userId,
        action: "update",
        targetType: "Client",
        targetId: id,
        details: `Updated client ID ${id}`,
      });

      return this.createResponse({ success: true, data: client });
    } catch (err) {
      return this.createResponse({ success: false, message: err.message });
    }
  }

  // DELETE /api/clients/:id
  async deleteClient(req, res) {
    try {
      const { id, userId } = req.params;

      const client = await Client.findByPk(id);
      if (!client) {
        return this.createResponse({
          success: false,
          message: "Client not found",
        });
      }

      await client.destroy();

      await logActivity({
        userId,
        action: "delete",
        targetType: "Client",
        targetId: id,
        details: `Deleted client ID ${id}`,
      });

      return this.createResponse({
        success: true,
        message: "Client deleted",
      });
    } catch (err) {
      return this.createResponse({ success: false, message: err.message });
    }
  }
};
