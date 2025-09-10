// src/components/SideNav.tsx
"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_ITEMS } from "@/lib/rbac";
import { useSession } from "next-auth/react";
import { Menu } from "antd";

export default function SideNav() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const role = (session?.user as any)?.role ?? "client";

  const allowed = NAV_ITEMS.filter((i) => {
    if (!i.permission) return true;
    // admin open
    if (role === "admin") return true;
    // simple permission on session
    const perms = (session?.user as any)?.permissions ?? [];
    return perms.includes(i.permission);
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
