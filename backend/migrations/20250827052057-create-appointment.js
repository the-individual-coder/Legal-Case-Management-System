"use strict";
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("Appointments", {
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
      lawyerId: {
        type: Sequelize.INTEGER,
        references: { model: "Users", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      },
      scheduledAt: { type: Sequelize.DATE },
      status: { type: Sequelize.STRING },
      notes: { type: Sequelize.TEXT },
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
    await queryInterface.dropTable("Appointments");
  },
};
