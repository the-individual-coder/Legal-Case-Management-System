"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class ActivityLog extends Model {
    static associate(models) {
      ActivityLog.belongsTo(models.User, { foreignKey: "userId" });
    }
  }
  ActivityLog.init(
    {
      userId: DataTypes.INTEGER,
      action: DataTypes.STRING,
      targetType: DataTypes.STRING,
      targetId: DataTypes.INTEGER,
      details: DataTypes.TEXT,
    },
    { sequelize, modelName: "ActivityLog" }
  );
  return ActivityLog;
};
