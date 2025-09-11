const BaseRouter = require("../../utils/BaseRouter.js");
const Controller = require("../../controllers/client.controller.js");

module.exports = class ClientRouter extends BaseRouter {
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
        path: "/getClients",
        function: "getClients",
      },
      {
        method: "get",
        path: "/list",
        function: "list",
      },
    ];
    return mappings;
  };
};
