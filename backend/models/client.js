"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Client extends Model {
    static associate(models) {
      Client.hasMany(models.Case, { foreignKey: "clientId" });
      Client.hasMany(models.Appointment, { foreignKey: "clientId" });
      Client.hasMany(models.Invoice, { foreignKey: "clientId" });
    }
  }
  Client.init(
    {
      firstName: DataTypes.STRING,
      lastName: DataTypes.STRING,
      email: DataTypes.STRING,
      phone: DataTypes.STRING,
      address: DataTypes.STRING,
      notes: DataTypes.TEXT,
    },
    { sequelize, modelName: "Client" }
  );
  return Client;
};
