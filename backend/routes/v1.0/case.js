const BaseRouter = require("../../utils/BaseRouter.js")
const Controller = require("../../controllers/case.controller.js")

module.exports = class CaseRouter extends BaseRouter {
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
        path: '/getCases',
        function: "getCases"
      },
    ]
    return mappings;
  };
}
