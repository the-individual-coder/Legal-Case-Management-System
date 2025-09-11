// src/app/billing/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import { Table, Button, Space, Spin, App, Modal } from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import InvoiceFormModal from "@/components/Billing/InvoiceFormModal";
import PaymentStatusTag from "@/components/Billing/PaymentStatusTag";
import { useSession } from "next-auth/react";
import { PERMISSIONS, can } from "@/lib/rbac";

type InvoiceRow = {
  id: number;
  amount: number;
  status: string;
  dueDate?: string | null;
  paidAt?: string | null;
  description?: string;
  Client?: { firstName: string; lastName: string; email?: string };
  Case?: { title?: string };
};

export default function BillingPage() {
  const { modal, message } = App.useApp();
  const { data: session, status } = useSession();
  const role = (session?.user as any)?.role ?? "client";
  const userId = status === "authenticated" ? (session?.user as any)?.id : null;

  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<InvoiceRow[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<InvoiceRow | null>(null);

  const canView = can(role, PERMISSIONS.BILLING.VIEW);
  const canCreate = can(role, PERMISSIONS.BILLING.CREATE);
  const canUpdate = can(role, PERMISSIONS.BILLING.UPDATE);
  const canDelete = can(role, PERMISSIONS.BILLING.DELETE);

  const fetchInvoices = async () => {
    if (!canView) return;
    setLoading(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/invoice/list`,
        { credentials: "include" }
      );
      const json = await res.json();
      setItems(json.data.data || []);
    } catch (err) {
      console.error(err);
      message.error("Failed to load invoices");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  const handleDelete = (rec: InvoiceRow) => {
    if (!canDelete) {
      message.error("You don't have permission.");
      return;
    }
    modal.confirm({
      title: "Delete invoice?",
      content: `Delete invoice #${rec.id}?`,
      onOk: async () => {
        try {
          const res = await fetch(
            `${process.env.NEXT_PUBLIC_API_BASE_URL}/invoice/delete/${rec.id}/${userId}`,
            { method: "DELETE", credentials: "include" }
          );
          const json = await res.json();
          message.success("Deleted");
          fetchInvoices();
        } catch (err) {
          message.error("Failed");
        }
      },
    });
  };

  const columns = [
    {
      title: "Invoice #",
      dataIndex: "id",
      key: "id",
      render: (id: number) => `#${id}`,
    },
    {
      title: "Client",
      key: "client",
      render: (_: any, r: InvoiceRow) =>
        r.Client ? `${r.Client.firstName} ${r.Client.lastName}` : "-",
    },
    { title: "Case", dataIndex: ["Case", "title"], key: "case" },
    {
      title: "Amount",
      dataIndex: "amount",
      key: "amount",
      render: (a: number) => `₱${Number(a).toFixed(2)}`,
    },
    {
      title: "Due",
      dataIndex: "dueDate",
      key: "due",
      render: (d: string) => (d ? new Date(d).toLocaleDateString() : "-"),
    },
    {
      title: "Paid At",
      dataIndex: "paidAt",
      render: (d: string) => (d ? new Date(d).toLocaleDateString() : "-"),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (s: string) => <PaymentStatusTag status={s} />,
    },
    {
      title: "Actions",
      key: "actions",
      render: (_: any, r: InvoiceRow) => (
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
          <Button
            onClick={() => recordPayment(r.id)}
            disabled={r.status === "paid"}
          >
            Record Payment
          </Button>
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

  const recordPayment = (invoiceId: number) => {
    modal.confirm({
      title: "Record payment?",
      content:
        "Client will upload payment proof via client portal — do you want to mark as paid now?",
      onOk: async () => {
        try {
          const body = { paidAt: new Date().toISOString() };
          const res = await fetch(
            `${process.env.NEXT_PUBLIC_API_BASE_URL}/invoice/pay/${invoiceId}/${userId}`,
            {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              credentials: "include",
              body: JSON.stringify(body),
            }
          );
          const json = await res.json();
          message.success("Marked as paid");
          fetchInvoices();
        } catch (err) {
          message.error("Failed");
        }
      },
    });
  };

  if (!canView)
    return (
      <div className="p-6">
        <h2>Unauthorized</h2>
      </div>
    );
  if (loading) return <Spin size="large" className="m-8" />;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Billing / Invoices</h1>
        {canCreate && (
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              setEditing(null);
              setModalOpen(true);
            }}
          >
            New Invoice
          </Button>
        )}
      </div>

      <Table
        rowKey="id"
        columns={columns}
        dataSource={items}
        pagination={{ pageSize: 8 }}
      />

      {modalOpen && (
        <InvoiceFormModal
          visible={modalOpen}
          editing={editing}
          onClose={() => {
            setModalOpen(false);
            setEditing(null);
            fetchInvoices();
          }}
        />
      )}
    </div>
  );
}
