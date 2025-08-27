"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Appointment extends Model {
    static associate(models) {
      Appointment.belongsTo(models.Case, { foreignKey: "caseId" });
      Appointment.belongsTo(models.Client, { foreignKey: "clientId" });
      Appointment.belongsTo(models.User, {
        as: "lawyer",
        foreignKey: "lawyerId",
      });
    }
  }
  Appointment.init(
    {
      caseId: DataTypes.INTEGER,
      clientId: DataTypes.INTEGER,
      lawyerId: DataTypes.INTEGER,
      scheduledAt: DataTypes.DATE,
      status: DataTypes.STRING,
      notes: DataTypes.TEXT,
    },
    { sequelize, modelName: "Appointment" }
  );
  return Appointment;
};
