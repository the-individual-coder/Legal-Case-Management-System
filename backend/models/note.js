"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Note extends Model {
    static associate(models) {
      Note.belongsTo(models.Case, { foreignKey: "caseId" });
      Note.belongsTo(models.User, { as: "author", foreignKey: "authorId" });
    }
  }
  Note.init(
    {
      caseId: DataTypes.INTEGER,
      authorId: DataTypes.INTEGER,
      content: DataTypes.TEXT,
    },
    { sequelize, modelName: "Note" }
  );
  return Note;
};
