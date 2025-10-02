"use client";

import React, { useEffect, useState } from "react";
import { Table, Button, Space, Tag, Spin, App, Select } from "antd";
import { EditOutlined, DeleteOutlined } from "@ant-design/icons";
import UserFormModal from "@/components/User/UserFormModal";
import { useSession } from "next-auth/react";
import { PERMISSIONS, can } from "@/lib/rbac";

type User = {
  id: number;
  name: string;
  email: string;
  role: string;
  status: string;
  providerId?: string;
};

export default function UsersPage() {
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<User[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<User | null>(null);
  const [filterRole, setFilterRole] = useState<string>("");
  const [filterStatus, setFilterStatus] = useState<string>("");

  const { data, status } = useSession();
  const userId = status === "authenticated" ? data?.user?.id : null;
  const role = (data?.user as any)?.role ?? "client";
  const { modal, message } = App.useApp();

  const canView = can(role, PERMISSIONS.USERS.VIEW);
  const canUpdate = can(role, PERMISSIONS.USERS.UPDATE);
  const canDelete = can(role, PERMISSIONS.USERS.DELETE);

  const fetchUsers = async () => {
    if (!canView) return;
    setLoading(true);
    try {
      const conditions: string[] = [];
      if (filterRole) conditions.push(`role:${filterRole}`);
      if (filterStatus) conditions.push(`status:${filterStatus}`);
      const searchQuery = conditions.length
        ? `search=${conditions.join(",")}`
        : "";

      const url = searchQuery
        ? `${process.env.NEXT_PUBLIC_API_BASE_URL}/user?${searchQuery}`
        : `${process.env.NEXT_PUBLIC_API_BASE_URL}/user/getUsers`;

      const res = await fetch(url, { credentials: "include" });
      const json = await res.json();
      setUsers(json.data.data || json.data || []);
    } catch (err) {
      console.error(err);
      message.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterRole, filterStatus]);

  const handleDelete = async (id: number) => {
    if (!canDelete) {
      message.error("You do not have permission to delete users.");
      return;
    }

    modal.confirm({
      title: "Delete user?",
      onOk: async () => {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/user/deleteUser/${id}/${userId}`,
          { method: "DELETE", credentials: "include" }
        );
        await res.json();
        message.success("User deleted");
        fetchUsers();
      },
    });
  };

  const columns = [
    { title: "Name", dataIndex: "name" },
    { title: "Email", dataIndex: "email" },
    {
      title: "Role",
      dataIndex: "role",
      render: (role: string) => <Tag color="blue">{role}</Tag>,
    },
    {
      title: "Status",
      dataIndex: "status",
      render: (status: string) => (
        <Tag color={status === "active" ? "green" : "red"}>{status}</Tag>
      ),
    },
    {
      title: "Actions",
      render: (r: User) =>
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
        <p>You do not have permission to view users.</p>
      </div>
    );
  }

  if (loading) return <Spin size="large" className="m-8" />;

  return (
    <div className="p-6">
      <div className="flex justify-between mb-4">
        <h1 className="text-2xl font-bold">Users</h1>
      </div>

      {/* Filters */}
      <div className="flex gap-4 mb-4">
        <Select
          placeholder="Filter by Role"
          style={{ width: 200 }}
          value={filterRole || undefined}
          onChange={(value) => setFilterRole(value)}
          allowClear
          options={[
            { value: "admin", label: "Admin" },
            { value: "lawyer", label: "Lawyer" },
            { value: "reviewer", label: "Reviewer" },
            { value: "staff", label: "Staff" },
            { value: "client", label: "Client" },
          ]}
        />
        <Select
          placeholder="Filter by Status"
          style={{ width: 200 }}
          value={filterStatus || undefined}
          onChange={(value) => setFilterStatus(value)}
          allowClear
          options={[
            { value: "active", label: "Active" },
            { value: "inactive", label: "Inactive" },
          ]}
        />
      </div>

      <Table rowKey="id" columns={columns} dataSource={users} bordered />

      {modalOpen && (
        <UserFormModal
          open={modalOpen}
          onClose={() => {
            setModalOpen(false);
            fetchUsers();
          }}
          editing={editing}
        />
      )}
    </div>
  );
}
