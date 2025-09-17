const BaseRouter = require("../../utils/BaseRouter.js");
const Controller = require("../../controllers/activitylog.controller.js");

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
        method: "get",
        path: "/getActivityLogs",
        function: "getActivityLogs",
      },
      {
        method: "put",
        path: "/updateActivityLog/:id/:userId",
        function: "updateActivityLog",
      },

      {
        method: "get",
        path: "/getActivityLogById/:id",
        function: "getActivityLogById",
      },
      {
        method: "delete",
        path: "/deleteActivityLog/:id/:userId",
        function: "deleteActivityLog",
      },
    ];
    return mappings;
  };
};
