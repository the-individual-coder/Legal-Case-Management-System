"use client";

import React, { useEffect, useState } from "react";
import { Table, Button, Space, Spin, Tag, App } from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import { useSession } from "next-auth/react";
import { PERMISSIONS, can } from "@/lib/rbac";
import ClientIntakeFormModal from "@/components/ClientIntake/ClientIntakeFormModal";

type Client = {
  id: number;
  firstName: string;
  lastName: string;
  email?: string;
};

type Intake = {
  id: number;
  Client: Client;
  caseType?: string;
  referredBy?: string;
  intakeNotes?: string;
  createdAt?: string;
};

export default function ClientIntakePage() {
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<Intake[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Intake | null>(null);

  const { data: session, status } = useSession();
  const role = (session?.user as any)?.role ?? "client";
  const userId = status === "authenticated" ? (session?.user as any)?.id : null;

  const canView = can(role, PERMISSIONS.CLIENT_INTAKE.VIEW);
  const canCreate = can(role, PERMISSIONS.CLIENT_INTAKE.CREATE);
  const canUpdate = can(role, PERMISSIONS.CLIENT_INTAKE.UPDATE);
  const canDelete = can(role, PERMISSIONS.CLIENT_INTAKE.DELETE);

  const { modal, message } = App.useApp();

  const fetchList = async () => {
    if (!canView) return;
    setLoading(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/clientintake/list`,
        { credentials: "include" }
      );
      if (!res.ok) throw new Error("Failed to fetch");
      const json = await res.json();
      setItems(json.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDelete = (intake: Intake) => {
    if (!canDelete) {
      message.error(
        "You do not have permission to delete client intake records."
      );
      return;
    }
    console.log("the intale", intake);
    modal.confirm({
      title: "Delete intake record?",
      content: `Are you sure you want to delete intake for ${intake.Client.firstName} ${intake.Client.lastName}?`,
      onOk: async () => {
        try {
          const res = await fetch(
            `${process.env.NEXT_PUBLIC_API_BASE_URL}/clientintake/delete/${intake.id}/${userId}`,
            { method: "DELETE", credentials: "include" }
          );
          if (!res.ok) throw new Error("Delete failed");
          await res.json();
          message.success("Deleted");
          fetchList();
        } catch (err: any) {
          message.error(err.message || "Failed to delete");
        }
      },
    });
  };

  if (!canView) {
    return (
      <div className="p-6">
        <h1 className="text-xl font-bold">Unauthorized</h1>
        <p>You do not have permission to view client intake records.</p>
      </div>
    );
  }

  if (loading) return <Spin size="large" className="m-8" />;

  const columns = [
    {
      title: "Client",
      dataIndex: "Client",
      key: "Client",
      // No width is set, allowing this column to take up remaining space
      render: (c: Client) => (
        <div>
          <span className="font-medium">
            {c.firstName} {c.lastName}
          </span>
          {c.email && <div className="text-gray-500 text-xs">{c.email}</div>}
        </div>
      ),
    },
    {
      title: "Case Type",
      dataIndex: "caseType",
      key: "caseType",
      width: 150, // Set a specific width for this column
      render: (t: string) => <Tag color="blue">{t}</Tag>,
    },
    {
      title: "Referred By",
      dataIndex: "referredBy",
      key: "referredBy",
      // No width is set, allowing this column to adjust
    },
    {
      title: "Notes",
      dataIndex: "intakeNotes",
      key: "intakeNotes",
      // No width is set, allowing this column to adjust
      ellipsis: true,
    },
    {
      title: "Created",
      dataIndex: "createdAt",
      key: "createdAt",
      width: 180, // Set a specific width for the date column
      render: (d: string) => new Date(d).toLocaleString(),
    },
    {
      title: "Actions",
      key: "actions",
      width: 200, // Fixed width to ensure buttons don't wrap
      render: (r: Intake) => (
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
              danger
              icon={<DeleteOutlined />}
              onClick={() => handleDelete(r)}
            >
              Delete
            </Button>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Client Intake</h1>
        {canCreate && (
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              setEditing(null);
              setModalOpen(true);
            }}
          >
            New Intake
          </Button>
        )}
      </div>

      <Table rowKey="id" dataSource={items} columns={columns} />

      {modalOpen && (
        <ClientIntakeFormModal
          open={modalOpen}
          editing={editing}
          onClose={() => {
            setModalOpen(false);
            setEditing(null);
            fetchList();
          }}
        />
      )}
    </div>
  );
}
