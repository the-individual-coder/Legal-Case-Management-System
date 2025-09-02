"use strict";

const fs = require("fs");
const path = require("path");
const Sequelize = require("sequelize");
const basename = path.basename(__filename);
const db = {};

// ✅ Use singleton to prevent too many DB connections in development
let sequelize;

if (!global._sequelizeInstance) {
  if (process.env.DATABASE_URL) {
    global._sequelizeInstance = new Sequelize(process.env.DATABASE_URL, {
      dialect: "postgres",
      protocol: "postgres",
      logging: false,
      pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000,
      },
    });
  } else {
    const env = process.env.NODE_ENV || "development";
    const config = require(__dirname + "/../config/config.json")[env];
    global._sequelizeInstance = new Sequelize(
      config.database,
      config.username,
      config.password,
      config
    );
  }

  console.log("💡 Sequelize instance created");
} else {
  console.log("♻️ Reusing existing Sequelize instance");
}

sequelize = global._sequelizeInstance;

// 🔄 Dynamically import all models in the current directory
fs.readdirSync(__dirname)
  .filter((file) => file !== basename && file.endsWith(".js"))
  .forEach((file) => {
    const model = require(path.join(__dirname, file))(
      sequelize,
      Sequelize.DataTypes
    );
    db[model.name] = model;
  });

// 🔗 Run associations (if defined)
Object.keys(db).forEach((modelName) => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

// ✅ Utility to authenticate DB connection
class DatabaseService {
  static async init() {
    try {
      await sequelize.authenticate();
      console.log("✅ Database connection established.");
    } catch (error) {
      console.error("❌ Unable to connect to the database:", error);
    }
  }
}

module.exports = {
  ...db,
  DatabaseService,
};
