"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Invoice extends Model {
    static associate(models) {
      Invoice.belongsTo(models.Case, { foreignKey: "caseId" });
      Invoice.belongsTo(models.Client, { foreignKey: "clientId" });
    }
  }
  Invoice.init(
    {
      caseId: DataTypes.INTEGER,
      clientId: DataTypes.INTEGER,
      amount: DataTypes.DECIMAL,
      status: DataTypes.STRING,
      dueDate: DataTypes.DATE,
      paidAt: DataTypes.DATE,
      description: DataTypes.TEXT,
    },
    { sequelize, modelName: "Invoice" }
  );
  return Invoice;
};
