const BaseRouter = require("../../utils/BaseRouter.js")
const Controller = require("../../controllers/invoice.controller.js")

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
        method: 'get',
        path: '/getInvoices',
        function: "getInvoices"
      },
    ]
    return mappings;
  };
}
