
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
  NOTES:"notes"
};

export const ROLE_PERMISSIONS: Record<Role, string[]> = {
  admin: Object.values(PERMISSIONS),
  lawyer: [
    PERMISSIONS.CASES,
    PERMISSIONS.DOCUMENTS,
    PERMISSIONS.CALENDAR,
    PERMISSIONS.BILLING,
    PERMISSIONS.CASES,
    PERMISSIONS.DASHBOARD,
  ],
  reviewer: [PERMISSIONS.DOCUMENTS, PERMISSIONS.NOTES || "notes", PERMISSIONS.DASHBOARD],
  staff: [PERMISSIONS.APPOINTMENTS, PERMISSIONS.CLIENTS, PERMISSIONS.BILLING, PERMISSIONS.DASHBOARD],
  client: [PERMISSIONS.APPOINTMENTS, PERMISSIONS.DOCUMENTS, PERMISSIONS.BILLING, PERMISSIONS.DASHBOARD],
};

export function can(role: Role | string | undefined, permission: string) {
  if (!role) return false;
  const perms = (ROLE_PERMISSIONS as any)[role] ?? [];
  return perms.includes(permission) || role === "admin";
}

/**
 * Simple nav config with permission keys
 */
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
  { key: "dashboard", label: "Dashboard", href: "/dashboard", icon: <HomeOutlined />, permission: PERMISSIONS.DASHBOARD },
  { key: "appointments", label: "Appointments", href: "/appointments/new", icon: <CalendarOutlined />, permission: PERMISSIONS.APPOINTMENTS },
  { key: "clients", label: "Clients", href: "/clients/new", icon: <UserAddOutlined />, permission: PERMISSIONS.CLIENTS },
  { key: "engagements", label: "Engagements", href: "/engagements/new", icon: <FileTextOutlined />, permission: PERMISSIONS.ENGAGEMENTS },
  { key: "cases", label: "Cases", href: "/cases", icon: <IdcardOutlined />, permission: PERMISSIONS.CASES },
  { key: "documents", label: "Documents", href: "/documents", icon: <FileProtectOutlined />, permission: PERMISSIONS.DOCUMENTS },
  { key: "calendar", label: "Calendar", href: "/calendar", icon: <CalendarOutlined />, permission: PERMISSIONS.CALENDAR },
  { key: "billing", label: "Billing", href: "/billing", icon: <WalletOutlined />, permission: PERMISSIONS.BILLING },
  { key: "closure", label: "Closure", href: "/closure", icon: <FileDoneOutlined />, permission: PERMISSIONS.CLOSURE },
  { key: "users", label: "Users", href: "/users", icon: <TeamOutlined />, permission: PERMISSIONS.USERS },
  { key: "audit", label: "Audit Logs", href: "/audit-logs", icon: <AuditOutlined />, permission: PERMISSIONS.AUDIT_LOGS },
];
