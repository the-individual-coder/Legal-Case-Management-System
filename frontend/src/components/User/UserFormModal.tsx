"use client";

import React, { useEffect } from "react";
import { Modal, Form, Input, Button, Select, App } from "antd";
import { useSession } from "next-auth/react";
import { PERMISSIONS, can } from "@/lib/rbac";

type Props = {
  open: boolean;
  onClose: () => void;
  editing?: any | null;
};

export default function UserFormModal({ open, onClose, editing }: Props) {
  const [form] = Form.useForm();
  const { data, status } = useSession();
  const { message } = App.useApp();

  const userId = status === "authenticated" ? data?.user?.id : null;
  const role = (data?.user as any)?.role ?? "client";

  const canCreate = can(role, PERMISSIONS.USERS.CREATE);
  const canUpdate = can(role, PERMISSIONS.USERS.UPDATE);
  const allowed = editing ? canUpdate : canCreate;

  useEffect(() => {
    if (editing) {
      form.setFieldsValue(editing);
    } else {
      form.resetFields();
    }
  }, [editing, form]);

  const handleSubmit = async () => {
    if (!allowed) {
      message.error("You do not have permission to perform this action");
      return;
    }
    try {
      const values = await form.validateFields();

      const method = editing ? "PUT" : "POST";
      const url = editing
        ? `${process.env.NEXT_PUBLIC_API_BASE_URL}/user/updateUser/${editing.id}/${userId}`
        : `${process.env.NEXT_PUBLIC_API_BASE_URL}/user/createUser/${userId}`;

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(values),
      });

      await res.json();
      message.success("User saved");
      onClose();
    } catch (err: any) {
      console.error(err);
      message.error(err.message || "Failed to save user");
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
          You do not have permission to {editing ? "edit" : "create"} users.
        </p>
      </Modal>
    );
  }

  return (
    <Modal
      title={editing ? "Edit User" : "New User"}
      open={open}
      onCancel={onClose}
      footer={null}
      destroyOnHidden
    >
      <Form form={form} layout="vertical">
        <Form.Item
          label="Name"
          name="name"
          rules={[{ required: true, message: "Please enter name" }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          label="Email"
          name="email"
          rules={[{ required: true, message: "Please enter email" }]}
        >
          <Input type="email" disabled={true} />
        </Form.Item>

        <Form.Item
          label="Role"
          name="role"
          rules={[{ required: true, message: "Please select role" }]}
        >
          <Select
            options={[
              { value: "admin", label: "Admin" },
              { value: "lawyer", label: "Lawyer" },
              { value: "reviewer", label: "Reviewer" },
              { value: "staff", label: "Staff" },
              { value: "client", label: "Client" },
            ]}
          />
        </Form.Item>

        <Form.Item
          label="Status"
          name="status"
          rules={[{ required: true, message: "Please select status" }]}
        >
          <Select
            options={[
              { value: "active", label: "Active" },
              { value: "inactive", label: "Inactive" },
            ]}
          />
        </Form.Item>

        <div className="flex justify-end gap-2">
          <Button onClick={onClose}>Cancel</Button>
          <Button type="primary" onClick={handleSubmit}>
            Save
          </Button>
        </div>
      </Form>
    </Modal>
  );
}
