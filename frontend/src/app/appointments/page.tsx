"use client";

import React, { useEffect, useState } from "react";
import { Table, Button, Space, Tag, Spin, Modal, message, App } from "antd";
import { notifySuccess, notifyError } from "@/lib/notification";
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import AppointmentFormModal from "@/components/Appointments/AppointmentFormModal";
import { useSession } from "next-auth/react";

type Appointment = {
  id: number;
  scheduledAt: string;
  status: string;
  notes?: string;
  Case?: { id: number; title: string };
  client?: { id: number; firstName: string; lastName: string }; // <- lowercase
  lawyer?: { id: number; name: string }; // <- lowercase
};

export default function AppointmentsPage() {
  const [loading, setLoading] = useState(true);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Appointment | null>(null);

  // Access session data
  const { data, status } = useSession();

  // Check if the session is still loading or if the user is logged in
  const userId = status === "authenticated" ? data?.user?.id : null;
  const { modal } = App.useApp();
  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/appointment/getAppointments`,
        {
          credentials: "include",
        }
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
    console.log("the id", id);
    modal.confirm({
      title: "Delete appointment?",
      onOk: async () => {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/appointment/deleteAppointment/${id}/${userId}`,
          { method: "DELETE", credentials: "include" }
        );
        const json = await res.json();
        notifySuccess("Deleted", "Appointment has been deleted successfully.");
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
      dataIndex: ["lawyer", "name"], // <-- lowercase here too
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
      render: (r: Appointment) => (
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
        <h1 className="text-2xl font-bold">Appointments</h1>
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
      </div>

      <Table rowKey="id" columns={columns} dataSource={appointments} />

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
