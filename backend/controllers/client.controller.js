const { Client } = require("../models");
const BaseController = require("../utils/BaseController");

module.exports = class ClientController extends BaseController {
  constructor() {
    super(Client);
  }

  async getClients(req, res) {
    try {
      const clients = await Client.findAll({
        attributes: ["id", "firstName", "lastName", "email", "phone"],
      });
      return this.createResponse({ success: true, data: clients });
    } catch (err) {
      return this.createResponse({ success: false, message: err.message });
    }
  }
};
