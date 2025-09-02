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
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      image: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      role: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: "client",
      },
      permissions: {
        type: DataTypes.ARRAY(DataTypes.STRING),
        allowNull: true,
      },
      status: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: "active",
      },
      providerId: {
        type: DataTypes.STRING,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: "User",
    }
  );

  return User;
};
