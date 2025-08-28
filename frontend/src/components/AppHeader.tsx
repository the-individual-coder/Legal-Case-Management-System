"use client";
import { Layout, Dropdown, Avatar, Menu, Button } from "antd";
import { useSession, signOut } from "next-auth/react";
import RoleBadge from "./RoleBadge";
import Link from "next/link";
import Image from "next/image";
import { MenuProps } from "antd";

export default function AppHeader() {
  const { data: session } = useSession();

  // Define menu items in AntD's new format
  const items: MenuProps["items"] = [
    {
      key: "user-info",
      label: (
        <div className="px-4 py-2">
          <div className="flex items-center gap-3">
            <Avatar src={(session?.user as any)?.image} />
            <div>
              <div className="font-medium">{session?.user?.name}</div>
              <div className="text-xs text-gray-500">{session?.user?.email}</div>
            </div>
          </div>
        </div>
      ),
      // Disable interaction for this item
      disabled: true,
    },
    {
      key: "divider1",
      type: "divider",
    },
    {
      key: "role-badge",
      label: (
        <div className="p-2">
          <RoleBadge role={(session?.user as any)?.role} />
        </div>
      ),
      disabled: true,
    },
    {
      key: "divider2",
      type: "divider",
    },
    {
      key: "logout",
      label: (
        <Button block type="text" onClick={() => signOut({ callbackUrl: "/login" })}>
          Logout
        </Button>
      ),
    },
  ];

  return (
    <div className="px-6 py-3 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <Link href="/">
          <div className="flex items-center gap-3 cursor-pointer">
            <Image src="/logo.png" alt="logo" width={36} height={36} />
            <div>
              <div className="font-semibold text-lg">D&S Law</div>
              <div className="text-xs text-gray-500">Case Management</div>
            </div>
          </div>
        </Link>
      </div>
      <div className="flex items-center gap-4">
        <Dropdown menu={{ items }} trigger={["click"]} placement="bottomRight">
          <div className="cursor-pointer flex items-center gap-3">
            <Avatar src={(session?.user as any)?.image} />
            <div className="hidden sm:block text-sm">{session?.user?.name}</div>
          </div>
        </Dropdown>
      </div>
    </div>
  );
}
