// backend/routes/ClientIntakeRouter.js
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
        path: "/list",
        function: "list",
      },
      {
        method: "get",
        path: "/getByClient/:clientId",
        function: "getByClient",
      },
      {
        method: "post",
        path: "/create",
        function: "create",
      },
      {
        method: "put",
        path: "/update/:id/:userId",
        function: "update",
      },
      {
        method: "delete",
        path: "/delete/:id/:userId",
        function: "delete",
      },
    ];
    return mappings;
  };
};
