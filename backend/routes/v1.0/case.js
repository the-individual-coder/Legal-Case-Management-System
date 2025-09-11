const BaseRouter = require("../../utils/BaseRouter.js");
const Controller = require("../../controllers/case.controller.js");

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
        method: "get",
        path: "/getCases",
        function: "getCases",
      },
      {
        method: "get",
        path: "/dashboard",
        function: "getDashboard",
      },
      // GET /case/list
      {
        method: "get",
        path: "/list",
        function: "list",
      },
      // GET /case/get/:id
      {
        method: "get",
        path: "/get/:id",
        function: "getById",
      },
      // POST /case/create
      {
        method: "post",
        path: "/create",
        function: "create",
      },
      // PUT /case/update/:id/:userId
      {
        method: "put",
        path: "/update/:id/:userId",
        function: "update",
      },
      // PUT /case/assign/:id/:lawyerId/:userId
      {
        method: "put",
        path: "/assign/:id/:lawyerId/:userId",
        function: "assign",
      },
      // PUT /case/changeStatus/:id/:status/:userId
      {
        method: "put",
        path: "/changeStatus/:id/:status/:userId",
        function: "changeStatus",
      },
      // POST /case/close/:id/:userId
      {
        method: "post",
        path: "/close/:id/:userId",
        function: "close",
      },
    ];
    return mappings;
  };
};
