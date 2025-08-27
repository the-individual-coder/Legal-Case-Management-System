"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Document extends Model {
    static associate(models) {
      Document.belongsTo(models.Case, { foreignKey: "caseId" });
      Document.belongsTo(models.User, {
        as: "creator",
        foreignKey: "createdBy",
      });
    }
  }
  Document.init(
    {
      caseId: DataTypes.INTEGER,
      title: DataTypes.STRING,
      type: DataTypes.STRING,
      content: DataTypes.TEXT,
      filePath: DataTypes.STRING,
      ocrText: DataTypes.TEXT,
      createdBy: DataTypes.INTEGER,
    },
    { sequelize, modelName: "Document" }
  );
  return Document;
};
