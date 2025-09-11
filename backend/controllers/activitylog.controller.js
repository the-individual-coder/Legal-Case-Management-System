const { ActivityLog } = require("../models");
const BaseController = require("../utils/BaseController");

module.exports = class ActivitylogController extends BaseController {
  constructor() {
    super(ActivityLog);
  }

  async getActivitylogs() {
    const activitylog = await ActivityLog.findAll();
    console.log("the activitylog", activitylog);
    return this.createResponse(activitylog);
  }
};
