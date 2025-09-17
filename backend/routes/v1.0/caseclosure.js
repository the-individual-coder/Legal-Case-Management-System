const BaseRouter = require("../../utils/BaseRouter.js");
const Controller = require("../../controllers/caseclosure.controller.js");

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
        method: "get",
        path: "/getClosures",
        function: "getClosures",
      },
      {
        method: "get",
        path: "/getClosure/:id",
        function: "getClosureById",
      },
      {
        method: "post",
        path: "/createClosure/:userId",
        function: "createClosure",
      },
      {
        method: "put",
        path: "/updateClosure/:id/:userId",
        function: "updateClosure",
      },
      {
        method: "delete",
        path: "/deleteClosure/:id/:userId",
        function: "deleteClosure",
      },
    ];
    return mappings;
  };
};
