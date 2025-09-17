"use client";

import React, { useEffect, useState } from "react";
import { Modal, Form, Input, DatePicker, Button, App, Select } from "antd";
import dayjs from "dayjs";
import { useSession } from "next-auth/react";
import { PERMISSIONS, can } from "@/lib/rbac";

type Props = {
  open: boolean;
  onClose: () => void;
  editing?: any | null;
};

export default function ActivityLogFormModal({
  open,
  onClose,
  editing,
}: Props) {
  const [form] = Form.useForm();
  const { data, status } = useSession();
  const { message } = App.useApp();

  const userId = status === "authenticated" ? data?.user?.id : null;
  const role = (data?.user as any)?.role ?? "client";

  const canCreate = true;
  const canUpdate = true;
  const allowed = editing ? canUpdate : canCreate;

  const [users, setUsers] = useState<any[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  useEffect(() => {
    if (open) {
      setLoadingUsers(true);
      fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/user`)
        .then((res) => res.json())
        .then((data) => setUsers(data.data || []))
        .catch((err) => console.error(err))
        .finally(() => setLoadingUsers(false));
    }
  }, [open]);

  useEffect(() => {
    if (editing) {
      form.setFieldsValue({
        ...editing,
        createdAt: editing.createdAt ? dayjs(editing.createdAt) : null,
      });
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
      const payload = {
        ...values,
        createdAt: values.createdAt?.toISOString() ?? new Date().toISOString(),
      };

      const method = editing ? "PUT" : "POST";
      const url = editing
        ? `${process.env.NEXT_PUBLIC_API_BASE_URL}/activitylog/updateActivityLog/${editing.id}/${userId}`
        : `${process.env.NEXT_PUBLIC_API_BASE_URL}/activitylog/createActivityLog/${userId}`;

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      await res.json();
      message.success("Activity log saved");
      onClose();
    } catch (err: any) {
      console.error(err);
      message.error(err.message || "Failed to save activity log");
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
          You do not have permission to {editing ? "edit" : "create"} activity
          logs.
        </p>
      </Modal>
    );
  }

  return (
    <Modal
      title={editing ? "Edit Activity Log" : "New Activity Log"}
      open={open}
      onCancel={onClose}
      footer={null}
    >
      <Form form={form} layout="vertical">
        <Form.Item
          name="userId"
          label="User"
          rules={[{ required: true, message: "Please select a user" }]}
        >
          <Select
            placeholder="Select a user"
            showSearch
            optionFilterProp="children"
            loading={loadingUsers}
          >
            {users.map((u) => (
              <Select.Option key={u.id} value={u.id}>
                {u.name} ({u.email})
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          label="Action"
          name="action"
          rules={[{ required: true, message: "Action is required" }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          label="Target Type"
          name="targetType"
          rules={[{ required: true, message: "Target Type is required" }]}
        >
          <Input />
        </Form.Item>

        <Form.Item label="Target ID" name="targetId">
          <Input />
        </Form.Item>

        <Form.Item label="Details" name="details">
          <Input.TextArea rows={3} />
        </Form.Item>

        <Form.Item label="Created At" name="createdAt">
          <DatePicker showTime style={{ width: "100%" }} />
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
