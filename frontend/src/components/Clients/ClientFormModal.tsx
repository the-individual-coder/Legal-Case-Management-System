"use client";

import React, { useEffect } from "react";
import { Modal, Form, Input, Button, App } from "antd";
import { useSession } from "next-auth/react";
import { PERMISSIONS, can } from "@/lib/rbac";

type Client = {
  id?: number;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  address?: string;
  notes?: string;
};

type Props = {
  open: boolean;
  onClose: () => void;
  editing?: Client | null;
};

export default function ClientFormModal({ open, onClose, editing }: Props) {
  const [form] = Form.useForm();
  const { data, status } = useSession();
  const { message } = App.useApp();

  const userId = status === "authenticated" ? data?.user?.id : null;
  const role = (data?.user as any)?.role ?? "client";

  const canCreate = can(role, PERMISSIONS.CLIENTS.CREATE);
  const canUpdate = can(role, PERMISSIONS.CLIENTS.UPDATE);
  const allowed = editing ? canUpdate : canCreate;

  useEffect(() => {
    if (editing) {
      form.setFieldsValue(editing);
    } else {
      form.resetFields();
    }
  }, [editing, form]);

  const handleSubmit = async () => {
    if (!userId) {
      message.error("User not logged in");
      return;
    }
    if (!allowed) {
      message.error("You do not have permission to perform this action");
      return;
    }

    try {
      const values = await form.validateFields();

      const method = editing ? "PUT" : "POST";
      const url = editing
        ? `${process.env.NEXT_PUBLIC_API_BASE_URL}/client/updateClient/${editing.id}/${userId}`
        : `${process.env.NEXT_PUBLIC_API_BASE_URL}/client/createClient/${userId}`;

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(values),
      });

      if (!res.ok) {
        throw new Error(await res.text());
      }

      message.success(`Client ${editing ? "updated" : "created"} successfully`);
      onClose();
    } catch (err: any) {
      console.error(err);
      message.error(err.message || "Failed to save client");
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
          You do not have permission to {editing ? "edit" : "create"} clients.
        </p>
      </Modal>
    );
  }

  return (
    <Modal
      title={editing ? "Edit Client" : "New Client"}
      open={open}
      onCancel={onClose}
      footer={null}
    >
      <Form form={form} layout="vertical">
        <Form.Item
          label="First Name"
          name="firstName"
          rules={[{ required: true, message: "Please input first name" }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          label="Last Name"
          name="lastName"
          rules={[{ required: true, message: "Please input last name" }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          label="Email"
          name="email"
          rules={[
            { required: true, message: "Please input email" },
            { type: "email", message: "Please enter a valid email" },
          ]}
        >
          <Input />
        </Form.Item>

        <Form.Item label="Phone" name="phone">
          <Input />
        </Form.Item>

        <Form.Item label="Address" name="address">
          <Input />
        </Form.Item>

        <Form.Item label="Notes" name="notes">
          <Input.TextArea rows={3} />
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
