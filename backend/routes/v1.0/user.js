const BaseRouter = require("../../utils/BaseRouter.js");
const Controller = require("../../controllers/user.controller.js");

module.exports = class UserRouter extends BaseRouter {
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
        path: "/getUsers",
        function: "getUsers",
      },
      {
        method: "post",
        path: "/syncUser",
        function: "syncUser",
      },
    ];
    return mappings;
  };
};
