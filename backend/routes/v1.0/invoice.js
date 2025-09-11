const BaseRouter = require("../../utils/BaseRouter.js");
const Controller = require("../../controllers/invoice.controller.js");

module.exports = class InvoiceRouter extends BaseRouter {
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
        path: "/getInvoices",
        function: "getInvoices",
      },
      {
        method: "get",
        path: "/list",
        function: "list",
      },
      {
        method: "get",
        path: "/get/:id",
        function: "getById",
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
        method: "put",
        path: "/pay/:id/:userId",
        function: "pay",
      },
      {
        method: "delete",
        path: "/delete/:id/:userId",
        function: "delete",
      },
      {
        method: "post",
        path: "/createFromEngagement/:engagementId/:userId",
        function: "createFromEngagement",
      },
    ];
    return mappings;
  };
};
