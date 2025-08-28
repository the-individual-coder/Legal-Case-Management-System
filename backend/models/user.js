"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Users extends Model {
    static associate(models) {
      Users.hasMany(models.Case, {
        as: "assignedCases",
        foreignKey: "assignedLawyerId",
      });
      Users.hasMany(models.Appointment, {
        as: "appointments",
        foreignKey: "lawyerId",
      });
      Users.hasMany(models.Note, { as: "notes", foreignKey: "authorId" });
      Users.hasMany(models.Task, { as: "tasks", foreignKey: "assignedToId" });
      Users.hasMany(models.CalendarEvent, {
        as: "calendarEvents",
        foreignKey: "createdById",
      });
      Users.hasMany(models.CaseClosure, {
        as: "closures",
        foreignKey: "closedById",
      });
      Users.hasMany(models.ActivityLog, {
        as: "activities",
        foreignKey: "userId",
      });
    }
  }

  Users.init(
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
      modelName: "Users",
    }
  );

  return Users;
};
