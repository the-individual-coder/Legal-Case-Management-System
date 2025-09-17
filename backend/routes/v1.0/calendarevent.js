const BaseRouter = require("../../utils/BaseRouter.js");
const Controller = require("../../controllers/calendarevent.controller.js");

module.exports = class CalendareventRouter extends BaseRouter {
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
        path: "/getEvents",
        function: "getEvents",
      },
      {
        method: "get",
        path: "/getEventsByIdWithParams/:id",
        function: "getEventsByIdWithParams",
      },
      {
        method: "get",
        path: "/getEvent/:id",
        function: "getEventById",
      },
      {
        method: "post",
        path: "/createEvent/:userId",
        function: "createEvent",
      },
      {
        method: "put",
        path: "/updateEvent/:id/:userId",
        function: "updateEvent",
      },
      {
        method: "delete",
        path: "/deleteEvent/:id/:userId",
        function: "deleteEvent",
      },
    ];
    return mappings;
  };
};
