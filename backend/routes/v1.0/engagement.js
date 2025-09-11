// backend/routes/EngagementRouter.js
const BaseRouter = require("../../utils/BaseRouter.js");
const Controller = require("../../controllers/engagement.controller.js");

module.exports = class EngagementRouter extends BaseRouter {
  constructor() {
    super(new Controller());
  }

  getAdditionalMapping = () => {
    let mappings = [
      {
        method: "get",
        path: "/list",
        function: "list",
      },
      {
        method: "get",
        path: "/getEngagements",
        function: "getEngagements",
      },
      {
        method: "post",
        path: "/create",
        function: "create",
      },
      {
        method: "put",
        path: "/update/:id/:userId",
        function: "update",
      },
      {
        method: "delete",
        path: "/delete/:id/:userId",
        function: "delete",
      },
      {
        method: "post",
        path: "/generateContract/:id/:userId",
        function: "generateContract",
      },
    ];
    return mappings;
  };
};
