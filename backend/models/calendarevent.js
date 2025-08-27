"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class CalendarEvent extends Model {
    static associate(models) {
      CalendarEvent.belongsTo(models.User, {
        as: "creator",
        foreignKey: "createdById",
      });
    }
  }
  CalendarEvent.init(
    {
      title: DataTypes.STRING,
      description: DataTypes.TEXT,
      startTime: DataTypes.DATE,
      endTime: DataTypes.DATE,
      createdById: DataTypes.INTEGER,
    },
    { sequelize, modelName: "CalendarEvent" }
  );
  return CalendarEvent;
};
