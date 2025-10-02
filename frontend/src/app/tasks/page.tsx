"use client";

import React, { useEffect, useState } from "react";
import { Table, Button, Space, Tag, Spin, Modal, App, Select } from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import TaskFormModal from "@/components/Tasks/TaskFormModal";
import { useSession } from "next-auth/react";
import { PERMISSIONS, can } from "@/lib/rbac";

type Task = {
  id: number;
  title: string;
  description?: string;
  status: string;
  dueDate: string;
  Case?: { id: number; title: string };
  AssignedTo?: { id: number; name: string };
};

export default function TasksPage() {
  const [loading, setLoading] = useState(true);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Task | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>("");

  const { data, status } = useSession();
  const userId = status === "authenticated" ? data?.user?.id : null;
  const role = (data?.user as any)?.role ?? "client";
  const { modal, message } = App.useApp();

  const canView = can(role, PERMISSIONS.TASKS.VIEW);
  const canCreate = can(role, PERMISSIONS.TASKS.CREATE);
  const canUpdate = can(role, PERMISSIONS.TASKS.UPDATE);
  const canDelete = can(role, PERMISSIONS.TASKS.DELETE);

  const fetchTasks = async () => {
    if (!canView) return;
    setLoading(true);
    try {
      const conditions: string[] = [];
      if (filterStatus) conditions.push(`status:${filterStatus}`);
      const searchQuery = conditions.length
        ? `search=${conditions.join(",")}`
        : "";

      let url: string;
      if (["admin", "staff", "reviewer"].includes(role)) {
        if (searchQuery) {
          url = `${process.env.NEXT_PUBLIC_API_BASE_URL}/task?${searchQuery}&include=Case,assignee`;
        } else {
          url = `${process.env.NEXT_PUBLIC_API_BASE_URL}/task/getTasks`;
        }
      } else {
        url = `${
          process.env.NEXT_PUBLIC_API_BASE_URL
        }/task?search=assignedToId:${userId}${
          searchQuery ? "," + searchQuery.replace("search=", "") : ""
        }&include=Case,assignee`;
      }

      const res = await fetch(url, { credentials: "include" });
      const json = await res.json();
      setTasks(json.data.data || json.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterStatus]);

  const handleDelete = async (id: number) => {
    if (!canDelete) {
      message.error("You do not have permission to delete tasks.");
      return;
    }

    modal.confirm({
      title: "Delete task?",
      onOk: async () => {
        await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/task/deleteTask/${id}/${userId}`,
          { method: "DELETE", credentials: "include" }
        );
        message.success("Task deleted");
        fetchTasks();
      },
    });
  };

  const columns = [
    { title: "Case No.", dataIndex: ["Case", "id"], key: "case" },
    { title: "Title", dataIndex: "title", key: "title" },
    { title: "Assigned To", dataIndex: ["assignee", "name"], key: "assignee" },
    {
      title: "Due Date",
      dataIndex: "dueDate",
      render: (d: string) => new Date(d).toLocaleDateString(),
    },
    {
      title: "Status",
      dataIndex: "status",
      render: (s: string) => (
        <Tag color={s === "completed" ? "green" : "orange"}>{s}</Tag>
      ),
    },
    {
      title: "Created At",
      dataIndex: "createdAt",
      render: (d: string) => new Date(d).toLocaleString(),
    },
    {
      title: "Updated At",
      dataIndex: "updatedAt",
      render: (d: string) => new Date(d).toLocaleString(),
    },
    {
      title: "Action",
      render: (r: Task) =>
        (canUpdate || canDelete) && (
          <Space>
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
        <p>You do not have permission to view tasks.</p>
      </div>
    );
  }

  if (loading) return <Spin size="large" className="m-8" />;

  return (
    <div className="p-6">
      <div className="flex justify-between mb-4">
        <h1 className="text-2xl font-bold">Tasks</h1>
        {canCreate && (
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              setEditing(null);
              setModalOpen(true);
            }}
          >
            New Task
          </Button>
        )}
      </div>

      {/* Status Filter */}
      <div className="mb-4">
        <Select
          placeholder="Filter by Status"
          style={{ width: 200 }}
          value={filterStatus || undefined}
          onChange={(value) => setFilterStatus(value)}
          options={[
            { label: "Pending", value: "pending" },
            { label: "In Progress", value: "in-progress" },
            { label: "Completed", value: "completed" },
          ]}
          allowClear
        />
      </div>

      <Table rowKey="id" columns={columns} dataSource={tasks} />

      {modalOpen && (
        <TaskFormModal
          open={modalOpen}
          onClose={() => {
            setModalOpen(false);
            fetchTasks();
          }}
          editing={editing}
        />
      )}
    </div>
  );
}
