const BaseRouter = require("../../utils/BaseRouter.js")
const Controller = require("../../controllers/calendarevent.controller.js")

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
        method: 'get',
        path: '/getCalendarevents',
        function: "getCalendarevents"
      },
    ]
    return mappings;
  };
}
