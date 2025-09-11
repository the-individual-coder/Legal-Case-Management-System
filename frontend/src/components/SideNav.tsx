// src/components/SideNav.tsx
"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_ITEMS, can, Role } from "@/lib/rbac";
import { useSession } from "next-auth/react";
import { Menu } from "antd";

export default function SideNav() {
  const pathname = usePathname();
  const { data: session } = useSession();

  const role = ((session?.user as any)?.role ?? "client") as Role;

  const allowed = NAV_ITEMS.filter((i) => {
    if (!i.permission) return true; // items without permission are always visible
    return can(role, i.permission); // use RBAC helper
  });

  const items = allowed.map((i) => ({
    key: i.href,
    label: <Link href={i.href}>{i.label}</Link>,
    icon: i.icon,
  }));

  return (
    <div className="p-4 menu-list">
      <Menu mode="inline" selectedKeys={[pathname]} items={items} />
    </div>
  );
}
