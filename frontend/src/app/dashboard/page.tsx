// src/app/dashboard/page.tsx
"use client";
import { Card, Breadcrumb } from "antd";

import AuthGuard from "@/components/AuthGuard";
import StatsCard from "@/components/StatsCard";
import RecentActivityFeed from "@/components/RecentActivityFeed";
import { MainLayout } from "@/layouts/MainLayout";
import { useSession } from "next-auth/react";
import { useEffect } from "react";

export default function DashboardPage() {
  const { data: session } = useSession();

  useEffect(() => {
    console.log("Session from useSession (browser)", session);
  }, [session]);

  return (
    <AuthGuard>
      <div className="max-w-6xl mx-auto">
        <Breadcrumb items={[{ title: "Dashboard" }]} />
        <h3 className="text-xl font-semibold mt-4">Dashboard</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          <StatsCard title="Active Cases" value="24" />
          <StatsCard title="Pending Documents" value="8" />
          <StatsCard title="Open Appointments" value="5" />
        </div>
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card title="Activity">
            <RecentActivityFeed />
          </Card>
          <Card title="Charts">
            <div className="h-56 flex items-center justify-center text-gray-400">
              Chart placeholder
            </div>
          </Card>
        </div>
      </div>
    </AuthGuard>
  );
}
