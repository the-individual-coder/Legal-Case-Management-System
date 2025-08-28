// src/components/PageHeaderActions.tsx
"use client";
import { Button } from "antd";

export default function PageHeaderActions({ children }: { children?: React.ReactNode }) {
  return <div className="flex items-center gap-2">{children}</div>;
}
