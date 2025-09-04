const BaseRouter = require("../../utils/BaseRouter.js");
const Controller = require("../../controllers/engagement.controller.js");

module.exports = class EngagementRouter extends BaseRouter {
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
        path: "/getEngagement",
        function: "getEngagements",
      },
      {
        method: "post",
        path: "/createEngagement",
        function: "createEngagement",
      },
      {
        method: "post",
        path: "/updateEngagement/:id",
        function: "updateEngagement",
      },
      {
        method: "get",
        path: "/deleteEngagement/:id/:userId",
        function: "deleteEngagement",
      },
    ];
    return mappings;
  };
};
