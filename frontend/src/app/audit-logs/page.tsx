"use client";

import React, { useEffect, useState } from "react";
import { Table, Button, Space, Spin, App, DatePicker, Input } from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import { useSession } from "next-auth/react";
import { PERMISSIONS, can } from "@/lib/rbac";
import ActivityLogFormModal from "@/components/ActivityLog/ActivityLogFormModal";

type ActivityLog = {
  id: number;
  userId: number;
  action: string;
  targetType: string;
  targetId: number;
  details: string;
  createdAt: string;
  user?: { id: number; name: string; email: string; role: string };
};

export default function ActivityLogsPage() {
  const [loading, setLoading] = useState(true);
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [filters, setFilters] = useState<any>({});
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<ActivityLog | null>(null);

  const { modal, message } = App.useApp();

  const { data, status } = useSession();
  const userId = status === "authenticated" ? data?.user?.id : null;
  const role = (data?.user as any)?.role ?? "client";

  const canView = true;
  const canCreate = true;
  const canUpdate = true;
  const canDelete = true;

  const fetchLogs = async () => {
    if (!canView) return;
    setLoading(true);
    try {
      const query = new URLSearchParams(filters).toString();
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/ActivityLog/getActivityLogs?${query}`,
        { credentials: "include" }
      );
      const json = await res.json();
      setLogs(json.data.data || []);
    } catch (err) {
      console.error(err);
      message.error("Failed to load activity logs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [filters]);

  const handleDelete = async (id: number) => {
    if (!canDelete) {
      message.error("You do not have permission to delete activity logs.");
      return;
    }

    modal.confirm({
      title: "Delete activity log?",
      onOk: async () => {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/ActivityLog/deleteActivityLog/${id}/${userId}`,
          { method: "DELETE", credentials: "include" }
        );
        await res.json();
        message.success("Activity log deleted");
        fetchLogs();
      },
    });
  };

  const columns = [
    {
      title: "User",
      dataIndex: ["user", "name"],
      render: (_: any, record: ActivityLog) =>
        record.user?.name || `User #${record.userId}`,
    },
    { title: "Action", dataIndex: "action" },
    { title: "Target Type", dataIndex: "targetType" },
    { title: "Target ID", dataIndex: "targetId" },
    { title: "Details", dataIndex: "details" },
    {
      title: "Created At",
      dataIndex: "createdAt",
      render: (d: string) => new Date(d).toLocaleString(),
    },
    {
      title: "Action",
      render: (r: ActivityLog) => (
        <Space>
          <Button
            icon={<EyeOutlined />}
            onClick={() =>
              modal.info({
                title: "Activity Log Details",
                content: (
                  <div className="space-y-2">
                    <p>
                      <b>User:</b> {r.user?.name || `User #${r.userId}`}
                    </p>
                    <p>
                      <b>Action:</b> {r.action}
                    </p>
                    <p>
                      <b>Target:</b> {r.targetType} #{r.targetId}
                    </p>
                    <p>
                      <b>Details:</b> {r.details}
                    </p>
                    <p>
                      <b>Created At:</b>{" "}
                      {new Date(r.createdAt).toLocaleString()}
                    </p>
                  </div>
                ),
              })
            }
          >
            View
          </Button>
          {canUpdate && (
            <Button
              icon={<EditOutlined />}
              onClick={() => {
                setEditing(r);
                setModalOpen(true);
              }}
            >
              Edit
            </Button>
          )}
          {canDelete && (
            <Button
              icon={<DeleteOutlined />}
              danger
              onClick={() => handleDelete(r.id)}
            >
              Delete
            </Button>
          )}
        </Space>
      ),
    },
  ];

  if (!canView) {
    return (
      <div className="p-6">
        <h1 className="text-xl font-bold">Unauthorized</h1>
        <p>You do not have permission to view activity logs.</p>
      </div>
    );
  }

  if (loading) return <Spin size="large" className="m-8" />;

  return (
    <div className="p-6">
      <div className="flex justify-between mb-4 items-center">
        <h1 className="text-2xl font-bold">Activity Logs</h1>
        {canCreate && (
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              setEditing(null);
              setModalOpen(true);
            }}
          >
            New Log
          </Button>
        )}
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-4 flex-wrap">
        <Input.Search
          placeholder="Filter by action"
          onSearch={(v) => setFilters((f: any) => ({ ...f, action: v }))}
          allowClear
          style={{ width: 200 }}
        />
        <Input.Search
          placeholder="Filter by target type"
          onSearch={(v) => setFilters((f: any) => ({ ...f, targetType: v }))}
          allowClear
          style={{ width: 200 }}
        />
        <DatePicker.RangePicker
          onChange={(dates) => {
            if (dates && dates[0] && dates[1]) {
              setFilters((f: any) => ({
                ...f,
                startDate: dates[0]!.toISOString(),
                endDate: dates[1]!.toISOString(),
              }));
            } else {
              setFilters((f: any) => {
                const newFilters = { ...f };
                delete newFilters.startDate;
                delete newFilters.endDate;
                return newFilters;
              });
            }
          }}
        />
      </div>

      <Table rowKey="id" columns={columns} dataSource={logs} bordered />

      {modalOpen && (
        <ActivityLogFormModal
          open={modalOpen}
          onClose={() => {
            setModalOpen(false);
            fetchLogs();
          }}
          editing={editing}
        />
      )}
    </div>
  );
}
