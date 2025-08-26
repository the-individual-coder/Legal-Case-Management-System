'use strict';
const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const basename = path.basename(__filename);
const env = process.env.NODE_ENV || 'development';
const config = require(__dirname + '/../config/config.json')[env];

const db = {};

const sequelize = new Sequelize(config.database, config.username, config.password, config);

fs.readdirSync(__dirname)
  .filter(file => file !== basename && file.endsWith('.js'))
  .forEach(file => {
    const model = require(path.join(__dirname, file))(sequelize, Sequelize.DataTypes);
    db[model.name] = model;
  });

db.sequelize = sequelize;
db.Sequelize = Sequelize;

class DatabaseService {
  static async init() {
    try {
      await sequelize.authenticate();
      console.log('✅ Database connection established.');
    } catch (error) {
      console.error('❌ Unable to connect to the database:', error);
    }
  }
}

// 👇 Export models and DatabaseService
module.exports = {
  ...db,
  DatabaseService
};
