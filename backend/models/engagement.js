"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Engagement extends Model {
    static associate(models) {
      Engagement.belongsTo(models.User, {
        as: "lawyer",
        foreignKey: "lawyerId",
      });
      Engagement.belongsTo(models.Client, {
        as: "client",
        foreignKey: "clientId",
      });
      Engagement.belongsTo(models.Case, {
        as: "case",
        foreignKey: "caseId",
      });
      Engagement.belongsTo(models.Document, {
        as: "agreementDoc",
        foreignKey: "agreementDocId",
      });
    }
  }

  Engagement.init(
    {
      caseId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      clientId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      lawyerId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      agreementDocId: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      startDate: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      endDate: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      status: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: "active",
      },
    },
    {
      sequelize,
      modelName: "Engagement",
      timestamps: true,
      createdAt: "createdAt",
      updatedAt: "updatedAt",
    }
  );

  return Engagement;
};
