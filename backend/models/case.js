"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Case extends Model {
    static associate(models) {
      Case.belongsTo(models.Client, { foreignKey: "clientId" });
      Case.belongsTo(models.User, {
        as: "assignedLawyer",
        foreignKey: "assignedLawyerId",
      });
      Case.hasMany(models.Document, { foreignKey: "caseId" });
      Case.hasMany(models.Note, { foreignKey: "caseId" });
      Case.hasMany(models.Task, { foreignKey: "caseId" });
      Case.hasMany(models.Appointment, { foreignKey: "caseId" });
      Case.hasMany(models.LawyerRecommendation, { foreignKey: "caseId" });
      Case.hasOne(models.CaseClosure, { foreignKey: "caseId" });
      Case.hasMany(models.Invoice, { foreignKey: "caseId" });
    }
  }
  Case.init(
    {
      title: DataTypes.STRING,
      description: DataTypes.TEXT,
      status: DataTypes.STRING,
      priority: DataTypes.STRING,
      clientId: DataTypes.INTEGER,
      assignedLawyerId: DataTypes.INTEGER,
      startDate: DataTypes.DATE,
      endDate: DataTypes.DATE,
    },
    { sequelize, modelName: "Case" }
  );
  return Case;
};
