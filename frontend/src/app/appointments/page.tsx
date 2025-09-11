"use client";

import React, { useEffect, useState } from "react";
import { Table, Button, Space, Tag, Spin, Modal, message, App } from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import AppointmentFormModal from "@/components/Appointments/AppointmentFormModal";
import { useSession } from "next-auth/react";
import { PERMISSIONS, can } from "@/lib/rbac";

type Appointment = {
  id: number;
  scheduledAt: string;
  status: string;
  notes?: string;
  Case?: { id: number; title: string };
  client?: { id: number; firstName: string; lastName: string };
  lawyer?: { id: number; name: string };
};

export default function AppointmentsPage() {
  const [loading, setLoading] = useState(true);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Appointment | null>(null);

  const { data, status } = useSession();
  const userId = status === "authenticated" ? data?.user?.id : null;
  const role = (data?.user as any)?.role ?? "client";
  const { modal } = App.useApp();

  const canView = can(role, PERMISSIONS.APPOINTMENTS.VIEW);
  const canCreate = can(role, PERMISSIONS.APPOINTMENTS.CREATE);
  const canUpdate = can(role, PERMISSIONS.APPOINTMENTS.UPDATE);
  const canDelete = can(role, PERMISSIONS.APPOINTMENTS.DELETE);

  const fetchAppointments = async () => {
    if (!canView) return;
    setLoading(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/appointment/getAppointments`,
        { credentials: "include" }
      );
      const json = await res.json();
      setAppointments(json.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const handleDelete = async (id: number) => {
    if (!canDelete) {
      message.error("You do not have permission to delete appointments.");
      return;
    }

    modal.confirm({
      title: "Delete appointment?",
      onOk: async () => {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/appointment/deleteAppointment/${id}/${userId}`,
          { method: "DELETE", credentials: "include" }
        );
        const json = await res.json();
        message.success("Deleted");
        fetchAppointments();
      },
    });
  };

  const columns = [
    { title: "Case", dataIndex: ["Case", "title"], key: "case" },
    {
      title: "Client",
      render: (r: Appointment) =>
        r.client ? `${r.client.firstName} ${r.client.lastName}` : "-",
    },
    {
      title: "Lawyer",
      dataIndex: ["lawyer", "name"],
      key: "lawyer",
    },
    {
      title: "Scheduled At",
      dataIndex: "scheduledAt",
      render: (d: string) => new Date(d).toLocaleString(),
    },
    {
      title: "Status",
      dataIndex: "status",
      render: (s: string) => (
        <Tag color={s === "confirmed" ? "green" : "orange"}>{s}</Tag>
      ),
    },
    {
      title: "Action",
      render: (r: Appointment) =>
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
        <p>You do not have permission to view appointments.</p>
      </div>
    );
  }

  if (loading) return <Spin size="large" className="m-8" />;

  return (
    <div className="p-6">
      <div className="flex justify-between mb-4">
        <h1 className="text-2xl font-bold">Appointments</h1>
        {canCreate && (
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              setEditing(null);
              setModalOpen(true);
            }}
          >
            New Appointment
          </Button>
        )}
      </div>

      <Table
        style={{ tableLayout: "auto" }}
        rowKey="id"
        columns={columns}
        dataSource={appointments}
      />

      {modalOpen && (
        <AppointmentFormModal
          open={modalOpen}
          onClose={() => {
            setModalOpen(false);
            fetchAppointments();
          }}
          editing={editing}
        />
      )}
    </div>
  );
}
