"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class LawyerRecommendation extends Model {
    static associate(models) {
      LawyerRecommendation.belongsTo(models.Case, { foreignKey: "caseId" });
      LawyerRecommendation.belongsTo(models.User, {
        as: "lawyer",
        foreignKey: "lawyerId",
      });
    }
  }
  LawyerRecommendation.init(
    {
      caseId: DataTypes.INTEGER,
      lawyerId: DataTypes.INTEGER,
      score: DataTypes.DECIMAL,
      notes: DataTypes.TEXT,
    },
    { sequelize, modelName: "LawyerRecommendation" }
  );
  return LawyerRecommendation;
};
