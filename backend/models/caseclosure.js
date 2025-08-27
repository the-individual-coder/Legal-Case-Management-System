"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class CaseClosure extends Model {
    static associate(models) {
      CaseClosure.belongsTo(models.Case, { foreignKey: "caseId" });
      CaseClosure.belongsTo(models.User, {
        as: "closedBy",
        foreignKey: "closedById",
      });
    }
  }
  CaseClosure.init(
    {
      caseId: DataTypes.INTEGER,
      closedById: DataTypes.INTEGER,
      closedAt: DataTypes.DATE,
      summary: DataTypes.TEXT,
    },
    { sequelize, modelName: "CaseClosure" }
  );
  return CaseClosure;
};
