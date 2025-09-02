const BaseRouter = require("../../utils/BaseRouter.js");
const Controller = require("../../controllers/appointment.controller.js");

module.exports = class AppointmentRouter extends BaseRouter {
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
        path: "/getAppointments",
        function: "getAppointments",
      },
      {
        method: "post",
        path: "/createAppointment/:userId",
        function: "createAppointment",
      },
      {
        method: "put",
        path: "/updateAppointment/:id/:userId",
        function: "updateAppointment",
      },
      {
        method: "delete",
        path: "/deleteAppointment/:id/:userId",
        function: "deleteAppointment",
      },
    ];
    return mappings;
  };
};
