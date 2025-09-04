"use client";
import React, { useEffect, useState } from "react";
import { Table, Button, Space, Spin, Modal, App, message } from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import EngagementModal from "@/components/Engagement/EngagementModal";
import { useSession } from "next-auth/react";

type Engagement = {
  id: number;
  clientId: number;
  caseId: number;
  client?: { firstName: string; lastName: string };
  case?: { title: string };
  proposalContent: string;
  status: string;
  createdAt: string;
};

export default function EngagementPage() {
  const { modal, message: antMessage } = App.useApp();
  const { data: session, status } = useSession();
  const userId = status === "authenticated" ? session?.user?.id : null;

  const [loading, setLoading] = useState(true);
  const [engagements, setEngagements] = useState<Engagement[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Engagement | null>(null);

  const fetchEngagements = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/engagement/getEngagement`,
        { credentials: "include" }
      );
      const json = await res.json();
      setEngagements(json.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEngagements();
  }, []);

  const handleDelete = (id: number) => {
    modal.confirm({
      title: "Delete engagement?",
      onOk: async () => {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/engagement/deleteEngagement/${id}/${userId}`,
          { method: "DELETE", credentials: "include" }
        );
        const json = await res.json();
        antMessage.success("Deleted successfully");
        fetchEngagements();
      },
    });
  };

  const columns = [
    {
      title: "Client",
      render: (r: Engagement) =>
        r.client ? `${r.client.firstName} ${r.client.lastName}` : "-",
      key: "client",
    },
    {
      title: "Case",
      render: (r: Engagement) => r.case?.title || "-",
      key: "case",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (s: string) => <span>{s}</span>,
    },
    {
      title: "Created At",
      dataIndex: "createdAt",
      render: (d: string) => new Date(d).toLocaleString(),
    },
    {
      title: "Actions",
      render: (r: Engagement) => (
        <Space>
          <Button
            icon={<EditOutlined />}
            onClick={() => {
              setEditing(r);
              setModalOpen(true);
            }}
          />
          <Button
            icon={<DeleteOutlined />}
            danger
            onClick={() => handleDelete(r.id)}
          />
        </Space>
      ),
    },
  ];

  if (loading) return <Spin size="large" className="m-8" />;

  return (
    <div className="p-6">
      <div className="flex justify-between mb-4">
        <h1 className="text-2xl font-bold">Engagements / Proposals</h1>
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
      </div>

      <Table rowKey="id" columns={columns} dataSource={engagements} />

      {modalOpen && (
        <EngagementModal
          visible={modalOpen}
          onClose={() => {
            setModalOpen(false);
            fetchEngagements();
          }}
          editing={editing}
          userId={userId}
        />
      )}
    </div>
  );
}
