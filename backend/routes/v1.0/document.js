const BaseRouter = require("../../utils/BaseRouter.js")
const Controller = require("../../controllers/document.controller.js")

module.exports = class DocumentRouter extends BaseRouter {
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
        path: '/getDocuments',
        function: "getDocuments"
      },
    ]
    return mappings;
  };
}
