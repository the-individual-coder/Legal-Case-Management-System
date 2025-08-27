"use strict";
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("Invoices", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      caseId: {
        type: Sequelize.INTEGER,
        references: { model: "Cases", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      },
      clientId: {
        type: Sequelize.INTEGER,
        references: { model: "Clients", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      },
      amount: { type: Sequelize.DECIMAL },
      status: { type: Sequelize.STRING },
      dueDate: { type: Sequelize.DATE },
      paidAt: { type: Sequelize.DATE },
      description: { type: Sequelize.TEXT },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("Invoices");
  },
};
