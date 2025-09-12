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
        path: "/list",
        function: "list",
      },
      {
        method: "get",
        path: "/getClients",
        function: "getClients",
      },
      {
        method: "get",
        path: "/:id",
        function: "getClientById",
      },
      {
        method: "post",
        path: "/createClient/:userId",
        function: "createClient",
      },
      {
        method: "put",
        path: "/updateClient/:id/:userId",
        function: "updateClient",
      },
      {
        method: "delete",
        path: "/deleteClient/:id/:userId",
        function: "deleteClient",
      },
    ];
    return mappings;
  };
};
