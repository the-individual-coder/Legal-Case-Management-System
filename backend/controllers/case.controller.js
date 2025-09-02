const {
  Case,
  User,
  Appointment,
  Invoice,
  ActivityLog,
  Client,
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
};
