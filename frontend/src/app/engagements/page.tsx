"use client";

import React, { useEffect, useState } from "react";
import { Table, Button, Space, Tag, Spin, App } from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  FileTextOutlined,
} from "@ant-design/icons";
import { useSession } from "next-auth/react";
import { PERMISSIONS, can } from "@/lib/rbac";
import dynamic from "next/dynamic";
const EngagementFormModal = dynamic(
  () => import("@/components/Engagement/EngagementFormModal"),
  { ssr: false }
);

type EngagementRow = {
  id: number;
  case?: { id: number; title: string };
  client?: { id: number; firstName: string; lastName: string; email?: string };
  lawyer?: { id: number; name: string };
  startDate?: string | null;
  endDate?: string | null;
  status?: string;
  Agreement?: { id: number; title: string; filePath: string };
  agreementDocId?: number | null;
};

export default function EngagementsPage() {
  const { data: session, status } = useSession();
  const role = (session?.user as any)?.role ?? "client";
  const userId = status === "authenticated" ? (session?.user as any)?.id : null;
  const [items, setItems] = useState<EngagementRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<EngagementRow | null>(null);
  const { modal, message } = App.useApp();

  const canView = can(role, PERMISSIONS.ENGAGEMENTS.VIEW);
  const canCreate = can(role, PERMISSIONS.ENGAGEMENTS.CREATE);
  const canUpdate = can(role, PERMISSIONS.ENGAGEMENTS.UPDATE);
  const canDelete = can(role, PERMISSIONS.ENGAGEMENTS.DELETE);

  const fetchEngagements = async () => {
    if (!canView) return;
    setLoading(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/engagement/getEngagements`,
        { credentials: "include" }
      );
      const json = await res.json();
      setItems(json.data.data || []);
    } catch (err) {
      console.error("the error", err);
      message.error("Failed to fetch engagements");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEngagements();
  }, []);

  const handleDelete = (rec: EngagementRow) => {
    if (!canDelete) {
      message.error("You don't have permission to delete.");
      return;
    }
    modal.confirm({
      title: "Delete engagement?",
      content: `Delete engagement for ${rec.client?.firstName} ${rec.client?.lastName}?`,
      onOk: async () => {
        try {
          const res = await fetch(
            `${process.env.NEXT_PUBLIC_API_BASE_URL}/engagement/delete/${rec.id}/${userId}`,
            { method: "DELETE", credentials: "include" }
          );
          if (!res.ok) throw new Error("Delete failed");
          await res.json();
          message.success("Deleted");
          fetchEngagements();
        } catch (err: any) {
          message.error(err.message || "Failed to delete");
        }
      },
    });
  };

  const handleGenerate = (rec: EngagementRow) => {
    if (!canUpdate) {
      message.error("You don't have permission to generate contracts.");
      return;
    }
    modal.confirm({
      title: "Generate contract?",
      content: `Generate contract for ${rec.client?.firstName} ${rec.client?.lastName}?`,
      onOk: async () => {
        try {
          const res = await fetch(
            `${process.env.NEXT_PUBLIC_API_BASE_URL}/engagement/generateContract/${rec.id}/${userId}`,
            { method: "POST", credentials: "include" }
          );
          if (!res.ok) throw new Error("Generation failed");
          const json = await res.json();
          message.success("Contract generated");
          if (json.data?.filePath) window.open(json.data.filePath, "_blank");
          fetchEngagements();
        } catch (err: any) {
          message.error(err.message || "Failed to generate");
        }
      },
    });
  };

  if (!canView)
    return (
      <div className="p-6">
        <h1 className="text-xl font-bold">Unauthorized</h1>
        <p>You do not have permission.</p>
      </div>
    );
  if (loading)
    return (
      <div className="p-8">
        <Spin size="large" />
      </div>
    );

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Engagements</h1>
        {canCreate && (
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              setEditing(null);
              setModalOpen(true);
            }}
          >
            New Engagement
          </Button>
        )}
      </div>

      <Table dataSource={items} rowKey="id" pagination={{ pageSize: 8 }}>
        <Table.Column title="Case" dataIndex={["case", "title"]} key="case" />
        <Table.Column
          title="Client"
          key="client"
          render={(_, r: EngagementRow) => (
            <div>
              <div className="font-medium">
                {r.client?.firstName} {r.client?.lastName}
              </div>
              {r.client?.email && (
                <div className="text-xs text-slate-500">{r.client.email}</div>
              )}
            </div>
          )}
        />
        <Table.Column
          title="Lawyer"
          dataIndex={["lawyer", "name"]}
          key="lawyer"
        />
        <Table.Column
          title="Period"
          key="period"
          render={(_, r: EngagementRow) => (
            <div>
              {r.startDate ? new Date(r.startDate).toLocaleDateString() : "-"} →{" "}
              {r.endDate ? new Date(r.endDate).toLocaleDateString() : "—"}
            </div>
          )}
        />
        <Table.Column
          title="Status"
          dataIndex="status"
          key="status"
          render={(s) => <Tag>{s}</Tag>}
        />
        <Table.Column
          title="Agreement"
          key="agreement"
          render={(_, r: EngagementRow) =>
            r.Agreement?.filePath ? (
              <Button
                icon={<FileTextOutlined />}
                onClick={() => window.open(r?.Agreement.filePath, "_blank")}
              >
                Open
              </Button>
            ) : (
              <Button
                onClick={() => handleGenerate(r)}
                icon={<FileTextOutlined />}
              >
                Generate
              </Button>
            )
          }
        />
        <Table.Column
          title="Actions"
          key="actions"
          render={(_, r: EngagementRow) => (
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
          )}
        />
      </Table>

      {modalOpen && (
        <EngagementFormModal
          open={modalOpen}
          editing={editing}
          onClose={() => {
            setModalOpen(false);
            setEditing(null);
            fetchEngagements();
          }}
        />
      )}
    </div>
  );
}
