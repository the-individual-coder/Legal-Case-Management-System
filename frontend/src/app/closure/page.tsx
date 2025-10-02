"use client";

import React, { useEffect, useState } from "react";
import { Table, Button, Space, Spin, App } from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import ClosureFormModal from "@/components/Closure/ClosureFormModal";
import { useSession } from "next-auth/react";
import { PERMISSIONS, can } from "@/lib/rbac";

type Closure = {
  id: number;
  summary: string;
  closedAt: string;
  Case?: { id: number; title: string };
  closedBy?: { id: number; name: string };
};

export default function ClosurePage() {
  const [loading, setLoading] = useState(true);
  const [closures, setClosures] = useState<Closure[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Closure | null>(null);

  const { data, status } = useSession();
  const userId = status === "authenticated" ? data?.user?.id : null;
  const role = (data?.user as any)?.role ?? "client";
  const { modal, message } = App.useApp();

  const canView = can(role, PERMISSIONS.CLOSURE.VIEW);
  const canCreate = can(role, PERMISSIONS.CLOSURE.CREATE);
  const canUpdate = can(role, PERMISSIONS.CLOSURE.UPDATE);
  const canDelete = can(role, PERMISSIONS.CLOSURE.DELETE);

  const fetchClosures = async () => {
    if (!canView) return;
    setLoading(true);
    try {
      if (["admin", "staff", "reviewer"].includes(role)) {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/caseclosure/getClosures`,
          { credentials: "include" }
        );
        const json = await res.json();
        setClosures(json.data.data || []);
      } else {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/caseclosure?search=closedById:${userId}&include=closedBy,Case`
        );
        const json = await res.json();
        setClosures(json.data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClosures();
  }, []);

  const handleDelete = async (id: number) => {
    if (!canDelete) {
      message.error("You do not have permission to delete closures.");
      return;
    }

    modal.confirm({
      title: "Delete closure?",
      onOk: async () => {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/caseclosure/deleteClosure/${id}/${userId}`,
          { method: "DELETE", credentials: "include" }
        );
        await res.json();
        message.success("Closure deleted");
        fetchClosures();
      },
    });
  };

  const columns = [
    {
      title: "Case No.",
      dataIndex: ["Case", "title"],
      render: (_: any, record: Closure) => `${record.Case?.id}`,
    },
    {
      title: "Closed By",
      dataIndex: ["closedBy", "name"],
      render: (name: string) => name || "-",
    },
    {
      title: "Closed At",
      dataIndex: "closedAt",
      render: (d: string) => new Date(d).toLocaleString(),
    },
    { title: "Summary", dataIndex: "summary" },
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
      render: (r: Closure) =>
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
        <p>You do not have permission to view closures.</p>
      </div>
    );
  }

  if (loading) return <Spin size="large" className="m-8" />;

  return (
    <div className="p-6">
      <div className="flex justify-between mb-4">
        <h1 className="text-2xl font-bold">Closures</h1>
        {canCreate && (
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              setEditing(null);
              setModalOpen(true);
            }}
          >
            New Closure
          </Button>
        )}
      </div>

      <Table rowKey="id" columns={columns} dataSource={closures} bordered />

      {modalOpen && (
        <ClosureFormModal
          open={modalOpen}
          onCancel={() => {
            setModalOpen(false);
            fetchClosures();
          }}
          initialValues={editing || undefined}
          userId={Number(userId)}
        />
      )}
    </div>
  );
}
