"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    static associate(models) {
      User.hasMany(models.Case, {
        as: "assignedCases",
        foreignKey: "assignedLawyerId",
      });
      User.hasMany(models.Appointment, {
        as: "appointments",
        foreignKey: "lawyerId",
      });
      User.hasMany(models.Note, { as: "notes", foreignKey: "authorId" });
      User.hasMany(models.Task, { as: "tasks", foreignKey: "assignedToId" });
      User.hasMany(models.CalendarEvent, {
        as: "calendarEvents",
        foreignKey: "createdById",
      });
      User.hasMany(models.CaseClosure, {
        as: "closures",
        foreignKey: "closedById",
      });
      User.hasMany(models.ActivityLog, {
        as: "activities",
        foreignKey: "userId",
      });
    }
  }
  User.init(
    {
      name: DataTypes.STRING,
      email: DataTypes.STRING,
      password: DataTypes.STRING,
      role: DataTypes.STRING,
      status: DataTypes.STRING,
    },
    { sequelize, modelName: "User" }
  );
  return User;
};
