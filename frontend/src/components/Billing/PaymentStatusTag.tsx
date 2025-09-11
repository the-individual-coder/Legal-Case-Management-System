// src/components/Billing/PaymentStatusTag.tsx
"use client";
import React from "react";
import { Tag } from "antd";

export default function PaymentStatusTag({ status }: { status: string }) {
  if (!status) status = "pending";
  const s = status.toLowerCase();
  if (s === "paid") return <Tag color="green">Paid</Tag>;
  if (s === "overdue") return <Tag color="red">Overdue</Tag>;
  return <Tag color="gold">Pending</Tag>;
}
