// src/lib/rbac.tsx

export type Role = "admin" | "lawyer" | "reviewer" | "staff" | "client";

// ---------------------------------
// Action-based permissions
// ---------------------------------
export const PERMISSIONS = {
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
  TASKS: {
    VIEW: "tasks:view",
    CREATE: "tasks:create",
    UPDATE: "tasks:update",
    DELETE: "tasks:delete",
    ASSIGN: "tasks:assign", // Optional, if tasks can be assigned
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

// ---------------------------------
// Role → Allowed permissions
// ---------------------------------
export const ROLE_PERMISSIONS: Record<Role, string[]> = {
  admin: Object.values(PERMISSIONS).flatMap(Object.values),

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
    PERMISSIONS.TASKS.VIEW,
    PERMISSIONS.TASKS.CREATE,
    PERMISSIONS.TASKS.UPDATE,
    PERMISSIONS.TASKS.DELETE,
    PERMISSIONS.CLOSURE.VIEW,
  ],

  reviewer: [
    PERMISSIONS.DOCUMENTS.VIEW,
    PERMISSIONS.DOCUMENTS.REVIEW,
    PERMISSIONS.NOTES.VIEW,
    PERMISSIONS.NOTES.UPDATE,
    PERMISSIONS.DASHBOARD.VIEW,
    PERMISSIONS.TASKS.VIEW,
    PERMISSIONS.CALENDAR.VIEW,
    PERMISSIONS.CALENDAR.CREATE,
    PERMISSIONS.CALENDAR.UPDATE,
  ],

  staff: [
    PERMISSIONS.APPOINTMENTS.VIEW,
    PERMISSIONS.APPOINTMENTS.CREATE,
    PERMISSIONS.APPOINTMENTS.UPDATE,
    PERMISSIONS.CLIENTS.VIEW,
    PERMISSIONS.CLIENTS.CREATE,
    PERMISSIONS.CALENDAR.VIEW,
    PERMISSIONS.CALENDAR.CREATE,
    PERMISSIONS.CALENDAR.UPDATE,
    PERMISSIONS.BILLING.CREATE,
    PERMISSIONS.BILLING.VIEW,
    PERMISSIONS.TASKS.VIEW,
    PERMISSIONS.TASKS.CREATE,
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

// ---------------------------------
// Permission helper
// ---------------------------------
export function can(role: Role | string | undefined, permission: string) {
  if (!role) return false;
  const roleKey = role as Role;
  const perms = ROLE_PERMISSIONS[roleKey] ?? [];
  return perms.includes(permission) || roleKey === "admin";
}

// ---------------------------------
// Nav config — map module to VIEW perms
// ---------------------------------
export type NavItem = {
  key: string;
  label: string;
  href: string;
  icon?: React.ReactNode;
  permission?: string;
};

import {
  HomeOutlined,
  CalendarOutlined,
  UserAddOutlined,
  FileTextOutlined,
  IdcardOutlined,
  TeamOutlined,
  FileProtectOutlined,
  WalletOutlined,
  FileDoneOutlined,
  AuditOutlined,
} from "@ant-design/icons";

export const NAV_ITEMS: NavItem[] = [
  {
    key: "dashboard",
    label: "Dashboard",
    href: "/dashboard",
    icon: <HomeOutlined />,
    permission: PERMISSIONS.DASHBOARD.VIEW,
  },
  {
    key: "appointments",
    label: "Appointments",
    href: "/appointments",
    icon: <CalendarOutlined />,
    permission: PERMISSIONS.APPOINTMENTS.VIEW,
  },
  {
    key: "clients",
    label: "Clients",
    href: "/clients",
    icon: <UserAddOutlined />,
    permission: PERMISSIONS.CLIENTS.VIEW,
  },
  {
    key: "client-intake",
    label: "Client Intake",
    href: "/client-intake",
    icon: <FileTextOutlined />,
    permission: PERMISSIONS.CLIENT_INTAKE.VIEW,
  },
  {
    key: "engagements",
    label: "Engagements",
    href: "/engagements",
    icon: <FileTextOutlined />,
    permission: PERMISSIONS.ENGAGEMENTS.VIEW,
  },
  {
    key: "cases",
    label: "Cases",
    href: "/cases",
    icon: <IdcardOutlined />,
    permission: PERMISSIONS.CASES.VIEW,
  },
  {
    key: "documents",
    label: "Documents",
    href: "/documents",
    icon: <FileProtectOutlined />,
    permission: PERMISSIONS.DOCUMENTS.VIEW,
  },
  {
    key: "calendar",
    label: "Calendar",
    href: "/calendar",
    icon: <CalendarOutlined />,
    permission: PERMISSIONS.CALENDAR.VIEW,
  },
  {
    key: "billing",
    label: "Billing",
    href: "/billing",
    icon: <WalletOutlined />,
    permission: PERMISSIONS.BILLING.VIEW,
  },
  {
    key: "closure",
    label: "Closure",
    href: "/closure",
    icon: <FileDoneOutlined />,
    permission: PERMISSIONS.CLOSURE.VIEW,
  },
  {
    key: "notes",
    label: "Notes",
    href: "/notes",
    icon: <FileTextOutlined />,
    permission: PERMISSIONS.NOTES.VIEW,
  },
  {
    key: "tasks",
    label: "Tasks",
    href: "/tasks",
    icon: <FileTextOutlined />,
    permission: PERMISSIONS.TASKS.VIEW,
  },
  {
    key: "users",
    label: "Users",
    href: "/users",
    icon: <TeamOutlined />,
    permission: PERMISSIONS.USERS.VIEW,
  },
  {
    key: "audit",
    label: "Audit Logs",
    href: "/audit-logs",
    icon: <AuditOutlined />,
    permission: PERMISSIONS.AUDIT_LOGS.VIEW,
  },
];
