// src/app/dashboard/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import { Row, Col, Spin, Empty } from "antd";
import {
  FileDoneOutlined,
  UserOutlined,
  CalendarOutlined,
  DollarCircleOutlined,
} from "@ant-design/icons";

import StatsCard from "@/components/Dashboard/StatsCard";
import RecentActivityFeed from "@/components/Dashboard/RecentActivityFeed";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import { useSession } from "next-auth/react";

type DashboardResponse = {
  success: boolean;
  data: {
    metrics: {
      totalCases: number;
      activeClients: number;
      upcomingAppointmentsCount: number;
      pendingInvoicesCount: number;
    };
    upcomingAppointments: Array<any>;
    pendingInvoices: Array<any>;
    recentActivity: Array<any>;
  };
};

export default function DashboardPage() {
  const { data: session } = useSession();
  const role = (session?.user as any)?.role ?? "client";
  const perms = (session?.user as any)?.permissions ?? [];

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<DashboardResponse["data"] | null>(null);
  const [chartData, setChartData] = useState<{ date: string; value: number }[]>(
    []
  );

  useEffect(() => {
    const fetchDashboard = async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/case/dashboard`,
          {
            credentials: "include",
          }
        );
        if (!res.ok) throw new Error("Failed to fetch dashboard");
        const json: DashboardResponse = await res.json();
        setData(json.data);

        // Fake chart data
        const total = json.data?.metrics?.totalCases || 0;
        const months = 6;
        const now = new Date();
        const series = Array.from({ length: months })?.map((_, i) => {
          const d = new Date(
            now.getFullYear(),
            now.getMonth() - (months - 1 - i),
            1
          );
          return {
            date: d.toLocaleString("default", { month: "short" }),
            value: Math.max(0, Math.round(total / (months - i) / 1.5)),
          };
        });
        setChartData(series);
      } catch (err) {
        console.error(err);
        setData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  if (loading)
    return (
      <div className="p-8">
        <Spin size="large" />
      </div>
    );
  if (!data)
    return (
      <div className="p-8">
        <Empty description="No dashboard data" />
      </div>
    );

  // RBAC helpers
  const canSeeCases =
    role === "admin" || role === "lawyer" || role === "reviewer";
  const canSeeClients = role === "admin" || role === "lawyer";
  const canSeeAppointments = ["admin", "lawyer", "staff", "client"].includes(
    role
  );
  const canSeeInvoices = ["admin", "lawyer", "staff", "client"].includes(role);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <div className="text-sm text-slate-500">D&S Law</div>
      </div>

      <Row gutter={[16, 16]}>
        {canSeeCases && (
          <Col xs={24} sm={12} md={6}>
            <StatsCard
              title="Total Cases"
              value={data?.metrics?.totalCases}
              icon={<FileDoneOutlined />}
              description="All cases in system"
            />
          </Col>
        )}
        {canSeeClients && (
          <Col xs={24} sm={12} md={6}>
            <StatsCard
              title="Active Clients"
              value={data?.metrics?.activeClients}
              icon={<UserOutlined />}
              description="Clients with active status"
            />
          </Col>
        )}
        {canSeeAppointments && (
          <Col xs={24} sm={12} md={6}>
            <StatsCard
              title="Upcoming Appointments"
              value={data?.metrics?.upcomingAppointmentsCount}
              icon={<CalendarOutlined />}
              description="Next 7 days"
            />
          </Col>
        )}
        {canSeeInvoices && (
          <Col xs={24} sm={12} md={6}>
            <StatsCard
              title="Pending Invoices"
              value={data?.metrics?.pendingInvoicesCount}
              icon={<DollarCircleOutlined />}
              description="Awaiting payment"
            />
          </Col>
        )}
      </Row>

      {canSeeCases && (
        <Row gutter={[16, 16]}>
          <Col xs={24} lg={16}>
            <div className="bg-white rounded-2xl shadow-sm p-4">
              <h3 className="text-lg font-semibold mb-3">Cases trend</h3>
              <div style={{ width: "100%", height: 280 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData as any}>
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="value"
                      stroke="#2563EB"
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </Col>

          <Col xs={24} lg={8}>
            <RecentActivityFeed items={data?.recentActivity} />
          </Col>
        </Row>
      )}

      <Row gutter={[16, 16]}>
        {canSeeAppointments && (
          <Col xs={24} md={12}>
            <div className="bg-white rounded-2xl shadow-sm p-4">
              <h3 className="text-lg font-semibold mb-3">
                Upcoming Appointments
              </h3>
              {data?.upcomingAppointments?.length === 0 ? (
                <Empty description="No appointments" />
              ) : (
                <ul className="space-y-3">
                  {data?.upcomingAppointments?.map((a) => (
                    <li key={a.id} className="p-3 border rounded-lg">
                      <div className="flex justify-between">
                        <div>
                          <div className="font-medium">
                            {a.title || `Appointment #${a.id}`}
                          </div>
                          <div className="text-sm text-slate-500">
                            {new Date(a.scheduledAt).toLocaleString()}
                          </div>
                        </div>
                        <div className="text-sm text-slate-400">{a.status}</div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </Col>
        )}

        {canSeeInvoices && (
          <Col xs={24} md={12}>
            <div className="bg-white rounded-2xl shadow-sm p-4">
              <h3 className="text-lg font-semibold mb-3">Pending Invoices</h3>
              {data?.pendingInvoices?.length === 0 ? (
                <Empty description="No pending invoices" />
              ) : (
                <ul className="space-y-3">
                  {data?.pendingInvoices?.map((inv) => (
                    <li
                      key={inv.id}
                      className="p-3 border rounded-lg flex justify-between"
                    >
                      <div>
                        <div className="font-medium">Invoice #{inv.id}</div>
                        <div className="text-sm text-slate-500">
                          Due {new Date(inv.dueDate).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">₱{inv.amount}</div>
                        <div className="text-xs text-amber-600">
                          {inv.status}
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </Col>
        )}
      </Row>
    </div>
  );
}
