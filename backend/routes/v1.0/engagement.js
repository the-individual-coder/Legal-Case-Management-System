const BaseRouter = require("../../utils/BaseRouter.js");
const Controller = require("../../controllers/clientintake.controller.js");

module.exports = class ClientIntakeRouter extends BaseRouter {
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
        path: "/engagement",
        function: "getEngagements",
      },
      {
        method: "post",
        path: "/engagement",
        function: "createEngagement",
      },
      {
        method: "post",
        path: "/engagement/:id",
        function: "updateEngagement",
      },
      {
        method: "get",
        path: "/engagement/:id/:userId",
        function: "deleteEngagement",
      },
    ];
    return mappings;
  };
};
