const BaseRouter = require("../../utils/BaseRouter.js")
const Controller = require("../../controllers/applicants.controller.js")
module.exports = class ApplicantsRouter extends BaseRouter {
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
        path: '/getApplicants',
        function: "getApplicants"
      },
    ]
    return mappings;
  };
}