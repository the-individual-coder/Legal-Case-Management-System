const BaseRouter = require("../../utils/BaseRouter.js");
const Controller = require("../../controllers/document.controller.js");

module.exports = class DocumentRouter extends BaseRouter {
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
        path: "/getDocuments",
        function: "getDocuments",
      },
      {
        method: "post",
        path: "/upload",
        function: "upload",
      },
      {
        method: "get",
        path: "/list",
        function: "list",
      },
      {
        method: "get",
        path: "/get/:id",
        function: "getById",
      },
      {
        method: "post",
        path: "/review/:id/:userId",
        function: "review",
      },
      {
        method: "get",
        path: "/ocr/:id/:userId",
        function: "ocr",
      },
    ];
    return mappings;
  };
};
