// src/lib/rbac.js

/** @typedef {"admin" | "lawyer" | "reviewer" | "staff" | "client"} Role */

const PERMISSIONS = {
  DASHBOARD: "dashboard",
  APPOINTMENTS: "appointments",
  CLIENTS: "clients",
  ENGAGEMENTS: "engagements",
  CASES: "cases",
  DOCUMENTS: "documents",
  CALENDAR: "calendar",
  BILLING: "billing",
  CLOSURE: "closure",
  USERS: "users",
  AUDIT_LOGS: "audit_logs",
  NOTES: "notes",
};

const ROLE_PERMISSIONS = {
  admin: Object.values(PERMISSIONS),
  lawyer: [
    PERMISSIONS.CASES,
    PERMISSIONS.DOCUMENTS,
    PERMISSIONS.CALENDAR,
    PERMISSIONS.BILLING,
    PERMISSIONS.DASHBOARD,
  ],
  reviewer: [PERMISSIONS.DOCUMENTS, PERMISSIONS.NOTES, PERMISSIONS.DASHBOARD],
  staff: [
    PERMISSIONS.APPOINTMENTS,
    PERMISSIONS.CLIENTS,
    PERMISSIONS.BILLING,
    PERMISSIONS.DASHBOARD,
  ],
  client: [
    PERMISSIONS.APPOINTMENTS,
    PERMISSIONS.DOCUMENTS,
    PERMISSIONS.BILLING,
    PERMISSIONS.DASHBOARD,
  ],
};

function getPermissionsByRole(role) {
  return ROLE_PERMISSIONS[role] ?? [];
}

module.exports = {
  PERMISSIONS,
  ROLE_PERMISSIONS,
  getPermissionsByRole,
};
