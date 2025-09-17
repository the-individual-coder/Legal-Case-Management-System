const BaseRouter = require("../../utils/BaseRouter.js");
const Controller = require("../../controllers/note.controller.js");

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
        method: "get",
        path: "/getNotes",
        function: "getNotes",
      },
      {
        method: "get",
        path: "/getNote/:id",
        function: "getNoteById",
      },
      {
        method: "post",
        path: "/createNote/:userId",
        function: "createNote",
      },
      {
        method: "put",
        path: "/updateNote/:id/:userId",
        function: "updateNote",
      },
      {
        method: "delete",
        path: "/deleteNote/:id/:userId",
        function: "deleteNote",
      },
    ];
    return mappings;
  };
};
