// src/components/dashboard/StatsCard.tsx
import React from "react";
import { Card } from "antd";

type StatsCardProps = {
  title: string;
  value: number | string;
  description?: string;
  icon?: React.ReactNode;
};

export default function StatsCard({
  title,
  value,
  description,
  icon,
}: StatsCardProps) {
  return (
    <Card className="rounded-2xl shadow-sm p-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm text-slate-500 whitespace-nowrap">
            {title}
          </div>
          <div className="text-2xl font-semibold text-slate-900">{value}</div>
          {description && (
            <div className="text-xs text-slate-500 mt-1">{description}</div>
          )}
        </div>
        <div className="text-3xl opacity-70">{icon}</div>
      </div>
    </Card>
  );
}
