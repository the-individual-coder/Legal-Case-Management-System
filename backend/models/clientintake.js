"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class ClientIntake extends Model {
    static associate(models) {
      // Associate with Client model
      ClientIntake.belongsTo(models.Client, {
        foreignKey: "clientId",
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      });
    }
  }

  ClientIntake.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      clientId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      caseType: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      referredBy: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      intakeNotes: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: sequelize.literal("CURRENT_TIMESTAMP"),
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: sequelize.literal("CURRENT_TIMESTAMP"),
      },
    },
    {
      sequelize,
      modelName: "ClientIntake",
      tableName: "ClientIntake", // explicitly match your table name
    }
  );

  return ClientIntake;
};
