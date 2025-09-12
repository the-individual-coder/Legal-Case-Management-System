"use client";

import React, { useEffect, useState } from "react";
import { Table, Button, Space, Spin, Modal, message, App } from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import ClientFormModal from "@/components/Clients/ClientFormModal";
import { useSession } from "next-auth/react";
import { PERMISSIONS, can } from "@/lib/rbac";

type Client = {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  address?: string;
  notes?: string;
};

export default function ClientsPage() {
  const [loading, setLoading] = useState(true);
  const [clients, setClients] = useState<Client[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Client | null>(null);

  const { data, status } = useSession();
  const userId = status === "authenticated" ? data?.user?.id : null;
  const role = (data?.user as any)?.role ?? "client";

  const { modal, message: antdMessage } = App.useApp();

  const canView = can(role, PERMISSIONS.CLIENTS.VIEW);
  const canCreate = can(role, PERMISSIONS.CLIENTS.CREATE);
  const canUpdate = can(role, PERMISSIONS.CLIENTS.UPDATE);
  const canDelete = can(role, PERMISSIONS.CLIENTS.DELETE);

  const fetchClients = async () => {
    if (!canView) return;
    setLoading(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/client/getClients`,
        { credentials: "include" }
      );
      const json = await res.json();
      setClients(json.data.data || json.data || []);
    } catch (err: any) {
      antdMessage.error(err.message || "Failed to load clients");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  const handleDelete = async (client: Client) => {
    if (!canDelete) {
      antdMessage.error("You do not have permission to delete clients.");
      return;
    }

    modal.confirm({
      title: `Delete client ${client.firstName} ${client.lastName}?`,
      onOk: async () => {
        try {
          const res = await fetch(
            `${process.env.NEXT_PUBLIC_API_BASE_URL}/client/deleteClient/${client.id}/${userId}`,
            {
              method: "DELETE",
              credentials: "include",
            }
          );
          await res.json();
          antdMessage.success("Client deleted");
          fetchClients();
        } catch (err: any) {
          antdMessage.error(err.message || "Failed to delete client");
        }
      },
    });
  };

  const columns = [
    { title: "First Name", dataIndex: "firstName", key: "firstName" },
    { title: "Last Name", dataIndex: "lastName", key: "lastName" },
    { title: "Email", dataIndex: "email", key: "email" },
    { title: "Phone", dataIndex: "phone", key: "phone" },
    { title: "Address", dataIndex: "address", key: "address" },
    { title: "Notes", dataIndex: "notes", key: "notes" },
    {
      title: "Action",
      render: (record: Client) =>
        (canUpdate || canDelete) && (
          <Space>
            {canUpdate && (
              <Button
                icon={<EditOutlined />}
                onClick={() => {
                  setEditing(record);
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
                onClick={() => handleDelete(record)}
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
        <p>You do not have permission to view clients.</p>
      </div>
    );
  }

  if (loading) return <Spin size="large" className="m-8" />;

  return (
    <div className="p-6">
      <div className="flex justify-between mb-4">
        <h1 className="text-2xl font-bold">Clients</h1>
        {canCreate && (
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              setEditing(null);
              setModalOpen(true);
            }}
          >
            New Client
          </Button>
        )}
      </div>

      <Table
        style={{ tableLayout: "auto" }}
        rowKey="id"
        columns={columns}
        dataSource={clients}
      />

      {modalOpen && (
        <ClientFormModal
          open={modalOpen}
          onClose={() => {
            setModalOpen(false);
            fetchClients();
          }}
          editing={editing}
        />
      )}
    </div>
  );
}
