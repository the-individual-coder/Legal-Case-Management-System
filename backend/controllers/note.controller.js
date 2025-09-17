// backend/controllers/NoteController.js
const { Note, Case, User } = require("../models");
const BaseController = require("../utils/BaseController");
const { Op } = require("sequelize");

module.exports = class NoteController extends BaseController {
  constructor() {
    super(Note);
  }

  // GET /api/note/getNotes?caseId=&authorId=
  async getNotes(req, res) {
    try {
      const { caseId, authorId } = req.query;
      const where = {};
      if (caseId) where.caseId = caseId;
      if (authorId) where.authorId = authorId;

      const data = await Note.findAll({
        where,
        include: [
          { model: Case, as: "Case", attributes: ["id", "title"] },
          {
            model: User,
            as: "author",
            attributes: ["id", "name", "email", "image"],
          },
        ],
        order: [["createdAt", "DESC"]],
      });

      return this.createResponse({ success: true, data });
    } catch (err) {
      return this.createResponse({ success: false, message: err.message });
    }
  }

  // GET /api/note/getNote/:id
  async getNoteById(req, res) {
    try {
      const { id } = req.params;
      const note = await Note.findByPk(id, {
        include: [
          { model: Case, as: "Case", attributes: ["id", "title"] },
          {
            model: User,
            as: "author",
            attributes: ["id", "name", "email", "image"],
          },
        ],
      });

      if (!note) {
        return this.createResponse({
          success: false,
          message: "Note not found",
        });
      }

      return this.createResponse({ success: true, data: note });
    } catch (err) {
      return this.createResponse({ success: false, message: err.message });
    }
  }

  // POST /api/note/createNote/:userId
  async createNote(req, res) {
    try {
      const { userId } = req.params;
      const { caseId, content } = req.body;

      const newNote = await Note.create({
        caseId: caseId || null,
        content,
        authorId: userId,
      });

      await this.logActivity({
        userId,
        action: "create",
        targetType: "Note",
        targetId: newNote.id,
        details: `Created note for caseId:${caseId ?? "none"}`,
      });

      return this.createResponse({ success: true, data: newNote });
    } catch (err) {
      return this.createResponse({ success: false, message: err.message });
    }
  }

  // PUT /api/note/updateNote/:id/:userId
  async updateNote(req, res) {
    try {
      const { id, userId } = req.params;
      const note = await Note.findByPk(id);
      if (!note) {
        return this.createResponse({
          success: false,
          message: "Note not found",
        });
      }

      // simple ownership check could be added here (optional)
      await note.update(req.body);

      await this.logActivity({
        userId,
        action: "update",
        targetType: "Note",
        targetId: id,
        details: `Updated note ID ${id}`,
      });

      return this.createResponse({ success: true, data: note });
    } catch (err) {
      return this.createResponse({ success: false, message: err.message });
    }
  }

  // DELETE /api/note/deleteNote/:id/:userId
  async deleteNote(req, res) {
    try {
      const { id, userId } = req.params;
      const note = await Note.findByPk(id);
      if (!note) {
        return this.createResponse({
          success: false,
          message: "Note not found",
        });
      }

      await note.destroy();

      await this.logActivity({
        userId,
        action: "delete",
        targetType: "Note",
        targetId: id,
        details: `Deleted note ID ${id}`,
      });

      return this.createResponse({ success: true, message: "Note deleted" });
    } catch (err) {
      return this.createResponse({ success: false, message: err.message });
    }
  }
};
