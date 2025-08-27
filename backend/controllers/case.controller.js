const { Case } = require("../models");
const BaseController = require("../utils/BaseController");

module.exports = class CaseController extends BaseController {
  constructor() {
    super(Case);
  }

  async getCases() {
    const cases = await Case.findAll();
    console.log("the cases");
    return this.createResponse(cases);
  }
};
