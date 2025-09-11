const {
  Case,
  User,
  Appointment,
  Invoice,
  ActivityLog,
  Client,
  Engagement,
  CaseClosures,
} = require("../models");
const { Op } = require("sequelize");
const BaseController = require("../utils/BaseController");

module.exports = class CaseController extends BaseController {
  constructor() {
    super(Case);
  }

  // GET /api/cases
  async getCases(req, res) {
    try {
      const cases = await Case.findAll({
        attributes: ["id", "title", "status", "clientId"],
        include: [
          {
            model: Client,
            as: "Client",
            attributes: ["id", "firstName", "lastName"],
          },
          { model: User, as: "assignedLawyer", attributes: ["id", "name"] },
        ],
        order: [["createdAt", "DESC"]],
      });
      return this.createResponse({ success: true, data: cases });
    } catch (err) {
      return this.createResponse({ success: false, message: err.message });
    }
  }

  // GET /api/dashboard
  async getDashboard(req, res) {
    try {
      // --- Summary counts ---
      const totalCasesPromise = Case.count();
      const activeClientsPromise = User.count({
        where: { role: "client", status: "active" },
      });

      // --- Upcoming appointments in next 7 days ---
      const now = new Date();
      const inSevenDays = new Date();
      inSevenDays.setDate(now.getDate() + 7);

      const upcomingAppointmentsPromise = Appointment.findAll({
        where: {
          scheduledAt: { [Op.between]: [now, inSevenDays] },
          status: { [Op.not]: "cancelled" },
        },
        order: [["scheduledAt", "ASC"]],
        limit: 10,
      });

      // --- Pending invoices ---
      const pendingInvoicesPromise = Invoice.findAndCountAll({
        where: { status: "pending" },
        order: [["dueDate", "ASC"]],
        limit: 10,
      });

      // --- Recent activity logs ---
      const recentActivityPromise = ActivityLog.findAll({
        order: [["createdAt", "DESC"]],
        limit: 15,
        include: [
          {
            model: User,
            as: "user", // must match association in model
            attributes: ["id", "name", "email", "image"],
          },
        ],
      });

      const [
        totalCases,
        activeClients,
        upcomingAppointments,
        pendingInvoices,
        recentActivity,
      ] = await Promise.all([
        totalCasesPromise,
        activeClientsPromise,
        upcomingAppointmentsPromise,
        pendingInvoicesPromise,
        recentActivityPromise,
      ]);

      // --- Compose metrics ---
      const metrics = {
        totalCases,
        activeClients,
        upcomingAppointmentsCount: upcomingAppointments.length,
        pendingInvoicesCount: pendingInvoices.count || 0,
      };

      return this.createResponse({
        metrics,
        upcomingAppointments: upcomingAppointments.map((a) => ({
          id: a.id,
          caseId: a.caseId,
          clientId: a.clientId,
          lawyerId: a.lawyerId,
          scheduledAt: a.scheduledAt,
          status: a.status,
          notes: a.notes,
        })),
        pendingInvoices: (pendingInvoices.rows || []).map((inv) => ({
          id: inv.id,
          caseId: inv.caseId,
          clientId: inv.clientId,
          amount: inv.amount,
          status: inv.status,
          dueDate: inv.dueDate,
          paidAt: inv.paidAt,
          description: inv.description,
        })),
        recentActivity: recentActivity.map((log) => ({
          id: log.id,
          user: log.user
            ? {
                id: log.user.id,
                name: log.user.name,
                email: log.user.email,
                image: log.user.image,
              }
            : null,
          action: log.action,
          targetType: log.targetType,
          targetId: log.targetId,
          details: log.details,
          createdAt: log.createdAt,
        })),
      });
    } catch (err) {
      console.error("DashboardController#getDashboard error:", err);
      return this.createResponse({ error: "Internal server error" });
    }
  }

  // GET /case/list
  async list(req, res) {
    try {
      const {
        clientId,
        assignedLawyerId,
        status,
        q,
        page = 1,
        limit = 100,
      } = req.query;
      const where = {};
      if (clientId) where.clientId = clientId;
      if (assignedLawyerId) where.assignedLawyerId = assignedLawyerId;
      if (status) where.status = status;
      if (q) where.title = { [this.Op.iLike]: `%${q}%` };

      const offset = (Number(page) - 1) * Number(limit);

      const cases = await Case.findAll({
        where,
        include: [
          {
            model: Client,
            as: "Client",
            attributes: ["id", "firstName", "lastName", "email"],
          },
          {
            model: User,
            as: "assignedLawyer",
            attributes: ["id", "name", "email", "image"],
          },
        ],
        order: [["createdAt", "DESC"]],
        limit: Number(limit),
        offset,
      });

      return this.createResponse({ success: true, data: cases });
    } catch (err) {
      console.error("Case.list error:", err);
      return this.createResponse({ success: false, message: err.message });
    }
  }

  // GET /case/get/:id
  async getById(req, res) {
    try {
      const { id } = req.params;
      const cas = await Case.findByPk(id, {
        include: [
          {
            model: Client,
            as: "Client",
            attributes: ["id", "firstName", "lastName", "email", "phone"],
          },
          {
            model: User,
            as: "assignedLawyer",
            attributes: ["id", "name", "email", "image"],
          },
          {
            model: Engagement,
            as: "engagement",
            attributes: [
              "id",
              "status",
              "startDate",
              "endDate",
              "agreementDocId",
            ],
          },
        ],
      });

      if (!cas)
        return this.createResponse(
          { success: false, message: "Case not found" },
          404
        );
      return this.createResponse({ success: true, data: cas });
    } catch (err) {
      console.error("Case.getById error:", err);
      return this.createResponse({ success: false, message: err.message });
    }
  }

  // POST /case/create
  async create(req, res) {
    try {
      const {
        title,
        description,
        priority,
        clientId,
        assignedLawyerId,
        startDate,
        endDate,
        status,
        userId,
      } = req.body;
      const actorId = userId ?? req.headers["x-user-id"];
      const actor = actorId ? await User.findByPk(actorId) : null;
      const role = actor?.role ?? "client";
      const perms = getPermissionsByRole(role);

      if (!perms.includes(PERMISSIONS.CASES.CREATE) && role !== "admin") {
        return this.createResponse(
          { success: false, message: "Unauthorized" },
          403
        );
      }

      if (!title || !clientId) {
        return this.createResponse(
          { success: false, message: "title and clientId are required" },
          400
        );
      }

      const newCase = await Case.create({
        title,
        description: description ?? null,
        priority: priority ?? "normal",
        clientId,
        assignedLawyerId: assignedLawyerId ?? null,
        startDate: startDate ?? null,
        endDate: endDate ?? null,
        status: status ?? "new",
      });

      await logActivity({
        userId: actorId || null,
        action: "create",
        targetType: "Case",
        targetId: newCase.id,
        details: `Created case ${newCase.title} (${newCase.id}) for client ${clientId}`,
      });

      return this.createResponse({ success: true, data: newCase });
    } catch (err) {
      console.error("Case.create error:", err);
      return this.createResponse({ success: false, message: err.message });
    }
  }

  // PUT /case/update/:id/:userId
  async update(req, res) {
    try {
      const { id, userId } = req.params;
      const actor = userId ? await User.findByPk(userId) : null;
      const role = actor?.role ?? "client";
      const perms = getPermissionsByRole(role);

      if (!perms.includes(PERMISSIONS.CASES.UPDATE) && role !== "admin") {
        return this.createResponse(
          { success: false, message: "Unauthorized" },
          403
        );
      }

      const cas = await Case.findByPk(id);
      if (!cas)
        return this.createResponse(
          { success: false, message: "Case not found" },
          404
        );

      const {
        title,
        description,
        priority,
        assignedLawyerId,
        startDate,
        endDate,
        status,
      } = req.body;
      cas.title = title ?? cas.title;
      cas.description = description ?? cas.description;
      cas.priority = priority ?? cas.priority;
      cas.assignedLawyerId = assignedLawyerId ?? cas.assignedLawyerId;
      cas.startDate = startDate ?? cas.startDate;
      cas.endDate = endDate ?? cas.endDate;
      cas.status = status ?? cas.status;
      await cas.save();

      await logActivity({
        userId: userId || null,
        action: "update",
        targetType: "Case",
        targetId: cas.id,
        details: `Updated case ${cas.id}`,
      });

      return this.createResponse({ success: true, data: cas });
    } catch (err) {
      console.error("Case.update error:", err);
      return this.createResponse({ success: false, message: err.message });
    }
  }

  // PUT /case/assign/:id/:lawyerId/:userId
  async assignLawyer(req, res) {
    try {
      const { id, lawyerId, userId } = req.params;
      const actor = userId ? await User.findByPk(userId) : null;
      const role = actor?.role ?? "client";
      const perms = getPermissionsByRole(role);

      if (!perms.includes(PERMISSIONS.CASES.UPDATE) && role !== "admin") {
        return this.createResponse(
          { success: false, message: "Unauthorized" },
          403
        );
      }

      const cas = await Case.findByPk(id);
      if (!cas)
        return this.createResponse(
          { success: false, message: "Case not found" },
          404
        );

      const lawyer = await User.findByPk(lawyerId);
      if (!lawyer)
        return this.createResponse(
          { success: false, message: "Lawyer not found" },
          404
        );

      cas.assignedLawyerId = lawyerId;
      await cas.save();

      await logActivity({
        userId: userId || null,
        action: "assign",
        targetType: "Case",
        targetId: cas.id,
        details: `Assigned lawyer ${lawyerId} to case ${cas.id}`,
      });

      return this.createResponse({ success: true, data: cas });
    } catch (err) {
      console.error("Case.assignLawyer error:", err);
      return this.createResponse({ success: false, message: err.message });
    }
  }

  // PUT /case/changeStatus/:id/:status/:userId
  async changeStatus(req, res) {
    try {
      const { id, status, userId } = req.params;
      const actor = userId ? await User.findByPk(userId) : null;
      const role = actor?.role ?? "client";
      const perms = getPermissionsByRole(role);

      if (!perms.includes(PERMISSIONS.CASES.UPDATE) && role !== "admin") {
        return this.createResponse(
          { success: false, message: "Unauthorized" },
          403
        );
      }

      const cas = await Case.findByPk(id);
      if (!cas)
        return this.createResponse(
          { success: false, message: "Case not found" },
          404
        );

      cas.status = status;
      await cas.save();

      await logActivity({
        userId: userId || null,
        action: "status_change",
        targetType: "Case",
        targetId: cas.id,
        details: `Changed status of case ${cas.id} to ${status}`,
      });

      return this.createResponse({ success: true, data: cas });
    } catch (err) {
      console.error("Case.changeStatus error:", err);
      return this.createResponse({ success: false, message: err.message });
    }
  }

  // POST /case/close/:id/:userId
  async closeCase(req, res) {
    try {
      const { id, userId } = req.params;
      const { summary, closedAt } = req.body;

      const actor = userId ? await User.findByPk(userId) : null;
      const role = actor?.role ?? "client";
      const perms = getPermissionsByRole(role);

      // closing a case should be allowed for lawyers or admin
      if (
        !perms.includes(PERMISSIONS.CASES.UPDATE) &&
        role !== "admin" &&
        role !== "lawyer"
      ) {
        return this.createResponse(
          { success: false, message: "Unauthorized" },
          403
        );
      }

      const cas = await Case.findByPk(id);
      if (!cas)
        return this.createResponse(
          { success: false, message: "Case not found" },
          404
        );

      cas.status = "closed";
      await cas.save();

      const closure = await CaseClosures.create({
        caseId: id,
        closedById: userId || null,
        closedAt: closedAt ? new Date(closedAt) : new Date(),
        summary: summary ?? null,
      });

      await logActivity({
        userId: userId || null,
        action: "close",
        targetType: "Case",
        targetId: id,
        details: `Closed case ${id}. Closure record ${closure.id}`,
      });

      return this.createResponse({
        success: true,
        data: { case: cas, closure },
      });
    } catch (err) {
      console.error("Case.closeCase error:", err);
      return this.createResponse({ success: false, message: err.message });
    }
  }
};
