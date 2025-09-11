const BaseRouter = require("../../utils/BaseRouter.js");
const Controller = require("../../controllers/lawyerrecommendation.controller.js");

module.exports = class LawyerrecommendationRouter extends BaseRouter {
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
        path: "/getLawyerrecommendations",
        function: "getLawyerrecommendations",
      },
      {
        method: "get",
        path: "/recommend/:caseId/:userId",
        function: "recommend",
      },
      {
        method: "post",
        path: "/assign",
        function: "assign",
      },
    ];
    return mappings;
  };
};
