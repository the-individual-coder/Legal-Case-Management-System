// src/lib/rbac.js

/** @typedef {"admin" | "lawyer" | "reviewer" | "staff" | "client"} Role */

const PERMISSIONS = {
  DASHBOARD: {
    VIEW: "dashboard:view",
  },
  APPOINTMENTS: {
    VIEW: "appointments:view",
    CREATE: "appointments:create",
    UPDATE: "appointments:update",
    DELETE: "appointments:delete",
  },
  CLIENTS: {
    VIEW: "clients:view",
    CREATE: "clients:create",
    UPDATE: "clients:update",
    DELETE: "clients:delete",
  },
  ENGAGEMENTS: {
    VIEW: "engagements:view",
    CREATE: "engagements:create",
    UPDATE: "engagements:update",
    DELETE: "engagements:delete",
  },
  CASES: {
    VIEW: "cases:view",
    CREATE: "cases:create",
    UPDATE: "cases:update",
    DELETE: "cases:delete",
  },
  DOCUMENTS: {
    VIEW: "documents:view",
    CREATE: "documents:create",
    UPDATE: "documents:update",
    DELETE: "documents:delete",
    OCR: "documents:ocr",
    REVIEW: "documents:review",
  },
  CALENDAR: {
    VIEW: "calendar:view",
    CREATE: "calendar:create",
    UPDATE: "calendar:update",
    DELETE: "calendar:delete",
  },
  BILLING: {
    VIEW: "billing:view",
    CREATE: "billing:create",
    UPDATE: "billing:update",
    DELETE: "billing:delete",
  },
  CLOSURE: {
    VIEW: "closure:view",
    CREATE: "closure:create",
    UPDATE: "closure:update",
    DELETE: "closure:delete",
  },
  USERS: {
    VIEW: "users:view",
    CREATE: "users:create",
    UPDATE: "users:update",
    DELETE: "users:delete",
  },
  AUDIT_LOGS: {
    VIEW: "audit_logs:view",
  },
  NOTES: {
    VIEW: "notes:view",
    CREATE: "notes:create",
    UPDATE: "notes:update",
    DELETE: "notes:delete",
  },
  CLIENT_INTAKE: {
    VIEW: "client_intake:view",
    CREATE: "client_intake:create",
    UPDATE: "client_intake:update",
    DELETE: "client_intake:delete",
  },
};

const ROLE_PERMISSIONS = {
  admin: Object.values(PERMISSIONS).flatMap(Object.values), // all actions

  lawyer: [
    PERMISSIONS.CASES.VIEW,
    PERMISSIONS.CASES.UPDATE,
    PERMISSIONS.DOCUMENTS.VIEW,
    PERMISSIONS.DOCUMENTS.CREATE,
    PERMISSIONS.DOCUMENTS.UPDATE,
    PERMISSIONS.DOCUMENTS.REVIEW,
    PERMISSIONS.CALENDAR.VIEW,
    PERMISSIONS.CALENDAR.CREATE,
    PERMISSIONS.CALENDAR.UPDATE,
    PERMISSIONS.BILLING.VIEW,
    PERMISSIONS.NOTES.VIEW,
    PERMISSIONS.NOTES.CREATE,
    PERMISSIONS.NOTES.UPDATE,
    PERMISSIONS.CLOSURE.VIEW,
  ],

  reviewer: [
    PERMISSIONS.DOCUMENTS.VIEW,
    PERMISSIONS.DOCUMENTS.REVIEW,
    PERMISSIONS.NOTES.VIEW,
    PERMISSIONS.NOTES.UPDATE,
    PERMISSIONS.DASHBOARD.VIEW,
  ],

  staff: [
    PERMISSIONS.APPOINTMENTS.VIEW,
    PERMISSIONS.APPOINTMENTS.CREATE,
    PERMISSIONS.APPOINTMENTS.UPDATE,
    PERMISSIONS.CLIENTS.VIEW,
    PERMISSIONS.CLIENTS.CREATE,
    PERMISSIONS.BILLING.CREATE,
    PERMISSIONS.BILLING.VIEW,
    PERMISSIONS.CLIENT_INTAKE.VIEW,
    PERMISSIONS.CLIENT_INTAKE.CREATE,
    PERMISSIONS.ENGAGEMENTS.VIEW,
    PERMISSIONS.ENGAGEMENTS.CREATE,
  ],

  client: [
    PERMISSIONS.APPOINTMENTS.VIEW,
    PERMISSIONS.APPOINTMENTS.CREATE,
    PERMISSIONS.DOCUMENTS.VIEW,
    PERMISSIONS.BILLING.VIEW,
    PERMISSIONS.CLIENT_INTAKE.CREATE,
    PERMISSIONS.DASHBOARD.VIEW,
  ],
};

function getPermissionsByRole(role) {
  return ROLE_PERMISSIONS[role] ?? [];
}

function can(role, permission) {
  return getPermissionsByRole(role).includes(permission);
}

module.exports = {
  PERMISSIONS,
  ROLE_PERMISSIONS,
  getPermissionsByRole,
  can,
};
