const BaseRouter = require("../../utils/BaseRouter.js");
const Controller = require("../../controllers/task.controller.js");

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
        method: "get",
        path: "/getTasks",
        function: "getTasks",
      },
      {
        method: "get",
        path: "/getTask/:id",
        function: "getTaskById",
      },
      {
        method: "post",
        path: "/createTask/:userId",
        function: "createTask",
      },
      {
        method: "put",
        path: "/updateTask/:id/:userId",
        function: "updateTask",
      },
      {
        method: "delete",
        path: "/deleteTask/:id/:userId",
        function: "deleteTask",
      },
    ];
    return mappings;
  };
};
