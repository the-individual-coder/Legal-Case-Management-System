// src/components/StatsCard.tsx
"use client";
import { Card } from "antd";

export default function StatsCard({ title, value }: { title: string; value: string }) {
  return (
    <Card>
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-500">{title}</div>
        <div className="text-2xl font-semibold">{value}</div>
      </div>
    </Card>
  );
}
