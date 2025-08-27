const BaseRouter = require("../../utils/BaseRouter.js")
const Controller = require("../../controllers/note.controller.js")

module.exports = class NoteRouter extends BaseRouter {
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
        path: '/getNotes',
        function: "getNotes"
      },
    ]
    return mappings;
  };
}
