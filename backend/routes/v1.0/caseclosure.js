const BaseRouter = require("../../utils/BaseRouter.js")
const Controller = require("../../controllers/caseclosure.controller.js")

module.exports = class CaseclosureRouter extends BaseRouter {
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
        path: '/getCaseclosures',
        function: "getCaseclosures"
      },
    ]
    return mappings;
  };
}
