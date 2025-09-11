"use client";

import React, { useEffect, useState } from "react";
import { Modal, Form, Input, Button, Select, App } from "antd";
import { useSession } from "next-auth/react";
import { PERMISSIONS, can } from "@/lib/rbac";

type Props = {
  open: boolean;
  onClose: () => void;
  editing?: any | null;
};

type Client = {
  id: number;
  firstName: string;
  lastName: string;
};

export default function ClientIntakeFormModal({
  open,
  onClose,
  editing,
}: Props) {
  const [form] = Form.useForm();
  const { data: session, status } = useSession();
  const { message } = App.useApp();

  const role = (session?.user as any)?.role ?? "client";
  const userId = status === "authenticated" ? (session?.user as any)?.id : null;

  const canCreate = can(role, PERMISSIONS.CLIENT_INTAKE.CREATE);
  const canUpdate = can(role, PERMISSIONS.CLIENT_INTAKE.UPDATE);
  const allowed = editing ? canUpdate : canCreate;

  const [clients, setClients] = useState<Client[]>([]);

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/client/list`
        );
        const json = await res.json();
        setClients(json.data.data || []);
      } catch (err) {
        console.error("Failed to load clients", err);
      }
    };
    fetchClients();
  }, []);

  useEffect(() => {
    if (editing) {
      form.setFieldsValue({
        clientId: editing.client?.id,
        caseType: editing.caseType,
        referredBy: editing.referredBy,
        intakeNotes: editing.intakeNotes,
      });
    } else {
      form.resetFields();
    }
  }, [editing, form]);

  const handleSubmit = async () => {
    if (!allowed) {
      message.error("You do not have permission to perform this action.");
      return;
    }
    try {
      const values = await form.validateFields();

      if (editing) {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/clientintake/update/${editing.id}/${userId}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify(values),
          }
        );
        if (!res.ok) throw new Error("Update failed");
        await res.json();
        message.success("Updated");
      } else {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/clientintake/create`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ ...values, userId }),
          }
        );
        if (!res.ok) throw new Error("Create failed");
        await res.json();
        message.success("Created");
      }
      onClose();
    } catch (err: any) {
      message.error(err.message || "Failed");
    }
  };

  if (!allowed) {
    return (
      <Modal
        title="Unauthorized"
        open={open}
        onCancel={onClose}
        footer={[
          <Button key="close" onClick={onClose}>
            Close
          </Button>,
        ]}
      >
        <p>
          You do not have permission to {editing ? "edit" : "create"} client
          intake records.
        </p>
      </Modal>
    );
  }

  return (
    <Modal
      title={editing ? "Edit Intake" : "New Client Intake"}
      open={open}
      onCancel={onClose}
      footer={null}
    >
      <Form form={form} layout="vertical">
        <Form.Item label="Client" name="clientId" rules={[{ required: true }]}>
          <Select
            placeholder="Select client"
            options={clients.map((c) => ({
              value: c.id,
              label: `${c.firstName} ${c.lastName}`,
            }))}
            showSearch
            optionFilterProp="label"
          />
        </Form.Item>

        <Form.Item
          label="Case Type"
          name="caseType"
          rules={[{ required: true }]}
        >
          <Input placeholder="e.g., civil, family, criminal" />
        </Form.Item>

        <Form.Item label="Referred By" name="referredBy">
          <Input placeholder="Referral source" />
        </Form.Item>

        <Form.Item label="Intake Notes" name="intakeNotes">
          <Input.TextArea rows={4} />
        </Form.Item>

        <div className="flex justify-end gap-2">
          <Button onClick={onClose}>Cancel</Button>
          <Button type="primary" onClick={handleSubmit}>
            {editing ? "Update" : "Create"}
          </Button>
        </div>
      </Form>
    </Modal>
  );
}
