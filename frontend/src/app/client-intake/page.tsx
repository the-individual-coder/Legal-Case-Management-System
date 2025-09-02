"use client";
import React, { useEffect, useState } from "react";
import { Table, Button, Space, Spin, Modal, message } from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import ClientIntakeFormModal from "@/components/ClientIntake/ClientIntakeFormModal";

export default function ClientIntakePage() {
  const [loading, setLoading] = useState(true);
  const [intakes, setIntakes] = useState<any[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);

  const fetchIntakes = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/clientIntake/list`,
        { credentials: "include" }
      );
      const json = await res.json();
      setIntakes(json.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIntakes();
  }, []);

  const handleDelete = (id: number) => {
    Modal.confirm({
      title: "Delete intake?",
      onOk: async () => {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/clientIntake/${id}`,
          { method: "DELETE", credentials: "include" }
        );
        const json = await res.json();
        if (json.success) {
          message.success("Deleted");
          fetchIntakes();
        } else {
          message.error(json.message);
        }
      },
    });
  };

  const columns = [
    {
      title: "Client",
      dataIndex: ["Client", "firstName"],
      key: "client",
      render: (_: any, r: any) =>
        `${r.Client?.firstName} ${r.Client?.lastName}`,
    },
    { title: "Case Type", dataIndex: "caseType", key: "caseType" },
    { title: "Referred By", dataIndex: "referredBy", key: "referredBy" },
    { title: "Notes", dataIndex: "intakeNotes", key: "notes" },
    {
      title: "Action",
      key: "action",
      render: (r: any) => (
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
        <h1 className="text-2xl font-bold">Client Intakes</h1>
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
      </div>
      <Table rowKey="id" columns={columns} dataSource={intakes} />
      {modalOpen && (
        <ClientIntakeFormModal
          visible={modalOpen}
          onClose={() => {
            setModalOpen(false);
            fetchIntakes();
          }}
          editing={editing}
        />
      )}
    </div>
  );
}
