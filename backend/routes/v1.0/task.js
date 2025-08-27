const BaseRouter = require("../../utils/BaseRouter.js")
const Controller = require("../../controllers/task.controller.js")

module.exports = class TaskRouter extends BaseRouter {
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
        path: '/getTasks',
        function: "getTasks"
      },
    ]
    return mappings;
  };
}
