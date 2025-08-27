"use strict";
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("Documents", {
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
      title: { type: Sequelize.STRING },
      type: { type: Sequelize.STRING },
      content: { type: Sequelize.TEXT },
      filePath: { type: Sequelize.STRING },
      ocrText: { type: Sequelize.TEXT },
      createdBy: {
        type: Sequelize.INTEGER,
        references: { model: "Users", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      },
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
    await queryInterface.dropTable("Documents");
  },
};
