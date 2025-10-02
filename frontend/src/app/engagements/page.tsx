"use client";

import React, { useEffect, useState } from "react";
import { Table, Button, Space, Tag, Spin, App, Input, Select } from "antd";
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
  const [filter, setFilter] = useState({ caseNo: "", status: "" }); // 👈 filters
  const { modal, message } = App.useApp();

  const canView = can(role, PERMISSIONS.ENGAGEMENTS.VIEW);
  const canCreate = can(role, PERMISSIONS.ENGAGEMENTS.CREATE);
  const canUpdate = can(role, PERMISSIONS.ENGAGEMENTS.UPDATE);
  const canDelete = can(role, PERMISSIONS.ENGAGEMENTS.DELETE);

  const fetchEngagements = async () => {
    if (!canView) return;
    setLoading(true);
    try {
      const caseFilter = filter.caseNo ? `caseId=${filter.caseNo}` : "";
      const statusFilter = filter.status ? `status=${filter.status}` : "";
      const query = [caseFilter, statusFilter].filter(Boolean).join("&");

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/engagement/getEngagements${
          query ? `?${query}` : ""
        }`,
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
  }, [filter]); // 👈 refetch when filters change

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

      {/* Filters */}
      <div className="flex gap-2 mb-4 flex-wrap">
        <Input.Search
          placeholder="Filter by case no."
          value={filter.caseNo}
          onChange={(e) => setFilter((f) => ({ ...f, caseNo: e.target.value }))}
          onSearch={(v) => setFilter((f) => ({ ...f, caseNo: v }))}
          allowClear
          style={{ width: 200 }}
        />
        <Select
          placeholder="Filter by status"
          style={{ width: 200 }}
          value={filter.status || undefined}
          onChange={(value) => setFilter((f) => ({ ...f, status: value }))}
          allowClear
          options={[
            { label: "Active", value: "active" },
            { label: "Completed", value: "completed" },
            { label: "Terminated", value: "terminated" },
            { label: "On-hold", value: "on-hold" },
          ]}
        />
      </div>

      <Table dataSource={items} rowKey="id" pagination={{ pageSize: 8 }}>
        <Table.Column title="Case No." dataIndex={["case", "id"]} key="case" />
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
          key="agreementDoc"
          render={(_, r: any) =>
            r?.agreementDoc?.filePath ? (
              <Button
                icon={<FileTextOutlined />}
                onClick={() => {
                  const filePath = r?.agreementDoc?.filePath;
                  if (filePath) window.open(filePath, "_blank");
                }}
              >
                Open
              </Button>
            ) : (
              <Button
                onClick={() => {
                  handleGenerate(r);
                }}
                icon={<FileTextOutlined />}
              >
                Generate
              </Button>
            )
          }
        />
        <Table.Column
          title="Created At"
          dataIndex="createdAt"
          key="createdAt"
          render={(s) => new Date(s).toLocaleString()}
        />
        <Table.Column
          title="Updated At"
          dataIndex="updatedAt"
          key="updatedAt"
          render={(s) => new Date(s).toLocaleString()}
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
