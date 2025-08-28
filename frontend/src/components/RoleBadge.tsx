// src/components/RoleBadge.tsx
"use client";
import { Tag } from "antd";

export default function RoleBadge({ role }: { role?: string }) {
  const colorMap: Record<string, string> = {
    admin: "magenta",
    lawyer: "blue",
    reviewer: "green",
    staff: "orange",
    client: "default",
  };
  return <Tag color={colorMap[role ?? "client"]}>{role ?? "client"}</Tag>;
}
