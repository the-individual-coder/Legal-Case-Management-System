// src/lib/rbac.ts

export type Role = "admin" | "lawyer" | "reviewer" | "staff" | "client";

export const PERMISSIONS = {
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

export const ROLE_PERMISSIONS: Record<Role, string[]> = {
  admin: Object.values(PERMISSIONS),
  lawyer: [
    PERMISSIONS.CASES,
    PERMISSIONS.DOCUMENTS,
    PERMISSIONS.CALENDAR,
    PERMISSIONS.BILLING,
    PERMISSIONS.DASHBOARD,
  ],
  reviewer: [PERMISSIONS.DOCUMENTS, PERMISSIONS.NOTES, PERMISSIONS.DASHBOARD],
  staff: [PERMISSIONS.APPOINTMENTS, PERMISSIONS.CLIENTS, PERMISSIONS.BILLING, PERMISSIONS.DASHBOARD],
  client: [PERMISSIONS.APPOINTMENTS, PERMISSIONS.DOCUMENTS, PERMISSIONS.BILLING, PERMISSIONS.DASHBOARD],
};

export function getPermissionsByRole(role: Role): string[] {
  return ROLE_PERMISSIONS[role] ?? [];
}
