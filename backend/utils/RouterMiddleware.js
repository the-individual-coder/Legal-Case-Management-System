const fs = require("fs");
const path = require("path");
const Logger = require("./Logger.js");
// const ApplicationSettings = require("./ApplicationSettings.js")

const API_CONTEXT = process.env.API_CONTEXT || "app";
const PUBLIC_ROUTE = [
  // '/api/v1.0/auth',
  // '/api/v1.0/admission',
];

module.exports = class RouterMiddleware {
  constructor() {}

  /**
   *
   * @param {Object} app
   * @param {String} folderName
   * @description initialize the routes in a specific directory+
   */
  static init(app, folderName) {
    try {
      fs.readdirSync(folderName).forEach((dir) => {
        var routerDir = path.join(folderName, dir);

        fs.readdirSync(routerDir).forEach((file) => {
          var fullName = path.join(routerDir, file);
          if (file.toLowerCase().indexOf(".js")) {
            let endpoint =
              "/" +
              fullName
                .replace(folderName, API_CONTEXT)
                .replace(".js", "")
                .split("\\")
                .join("/");
            let routeFile = `../${fullName}`;

            // dynamic import
            import(routeFile).then((routerClass) => {
              //intialize Router instances
              let router = new routerClass.default();

              if (
                !PUBLIC_ROUTE.includes(endpoint)
                // &&
                // (
                //   ApplicationSettings.getValue("SECURE_API") || ""
                // ).toLowerCase() === "true"
              ) {
                app.use(
                  endpoint,
                  //  this.authMiddleware,
                  router.getRoutes()
                );
              } else {
                app.use(endpoint, router.getRoutes());
              }
              console.log(
                "\x1b[36m",
                `Initializing endpoint: ${endpoint}`,
                "\x1b[0m"
              );
            });
          }
        });
      });
    } catch (error) {
      Logger.error(error);
    }
  }

  static authMiddleware(req, res, next) {
    const bearerToken = (req.headers.authorization || "").split(" ");
    if (bearerToken.length && bearerToken[0] == "Bearer") {
      console.log("bearerToken[1] :>> ", bearerToken[1]);
      next();
    } else return res.status(401).json({ message: "Invalid token." });
  }
};
