const BaseRouter = require("../../utils/BaseRouter.js")
const Controller = require("../../controllers/activitylog.controller.js")

module.exports = class ActivitylogRouter extends BaseRouter {
  constructor() {
    super(new Controller());
  }

  /**
   * @instructions enable snippet to mappings
   */
  getAdditionalMapping = () => {
    let mappings = [
      {
        method: 'get',
        path: '/getActivitylogs',
        function: "getActivitylogs"
      },
    ]
    return mappings;
  };
}
