"use strict";
const fs = require("fs");
const path = require("path");
const Sequelize = require("sequelize");
const basename = path.basename(__filename);
const db = {};

let sequelize;

// ✅ Use DATABASE_URL if provided (Vercel / production)
if (process.env.DATABASE_URL) {
  sequelize = new Sequelize(process.env.DATABASE_URL, {
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
  // fallback to local config.json for development
  const env = process.env.NODE_ENV || "development";
  const config = require(__dirname + "/../config/config.json")[env];
  sequelize = new Sequelize(
    config.database,
    config.username,
    config.password,
    config
  );
}

// Load models dynamically
fs.readdirSync(__dirname)
  .filter((file) => file !== basename && file.endsWith(".js"))
  .forEach((file) => {
    const model = require(path.join(__dirname, file))(
      sequelize,
      Sequelize.DataTypes
    );
    db[model.name] = model;
  });

db.sequelize = sequelize;
db.Sequelize = Sequelize;

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
