"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Task extends Model {
    static associate(models) {
      Task.belongsTo(models.Case, { foreignKey: "caseId" });
      Task.belongsTo(models.User, {
        as: "assignee",
        foreignKey: "assignedToId",
      });
    }
  }
  Task.init(
    {
      caseId: DataTypes.INTEGER,
      assignedToId: DataTypes.INTEGER,
      title: DataTypes.STRING,
      description: DataTypes.TEXT,
      status: DataTypes.STRING,
      dueDate: DataTypes.DATE,
    },
    { sequelize, modelName: "Task" }
  );
  return Task;
};
