"use client";

import React, { useEffect, useState } from "react";
import { Modal, Form, Input, DatePicker, Select, Button, App } from "antd";
import dayjs from "dayjs";
import { useSession } from "next-auth/react";

type Task = {
  id?: number;
  caseId?: number;
  assignedToId?: number;
  title: string;
  description?: string;
  dueDate?: string;
  status?: string;
};

interface TaskFormModalProps {
  open: boolean;
  onClose: () => void;
  editing?: Task | null;
}

export default function TaskFormModal({
  open,
  onClose,
  editing,
}: TaskFormModalProps) {
  const [form] = Form.useForm();
  const { data } = useSession();
  const userId = (data?.user as any)?.id;
  const { message } = App.useApp();
  const [cases, setCases] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const isEditing = !!editing;

  useEffect(() => {
    if (editing) {
      form.setFieldsValue({
        ...editing,
        dueDate: editing.dueDate ? dayjs(editing.dueDate) : undefined,
      });
    } else {
      form.resetFields();
    }
  }, [editing, form]);

  // Fetch cases for select
  const fetchCases = async () => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/case/getCases`,
        {
          credentials: "include",
        }
      );
      const json = await res.json();
      setCases(json.data.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  // Fetch users (lawyers/staff only)
  const fetchUsers = async () => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/user/getUsers`,
        {
          credentials: "include",
        }
      );
      const json = await res.json();
      setUsers(
        (json.data.data || []).filter((u: any) =>
          ["lawyer", "staff"].includes(u.role)
        )
      );
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchCases();
    fetchUsers();
  }, []);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      const payload = {
        ...values,
        dueDate: values.dueDate ? values.dueDate.toISOString() : null,
      };

      let url = "";
      let method = "";

      if (isEditing) {
        url = `${process.env.NEXT_PUBLIC_API_BASE_URL}/task/updateTask/${editing?.id}/${userId}`;
        method = "PUT";
      } else {
        url = `${process.env.NEXT_PUBLIC_API_BASE_URL}/task/createTask/${userId}`;
        method = "POST";
      }

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        credentials: "include",
      });

      await res.json();
      message.success(
        isEditing ? "Task updated successfully" : "Task created successfully"
      );
      onClose();
    } catch (err: any) {
      console.error(err);
      message.error("Failed to save task");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title={isEditing ? "Edit Task" : "New Task"}
      open={open}
      onCancel={onClose}
      footer={null}
      destroyOnHidden
    >
      <Form form={form} layout="vertical">
        <Form.Item
          name="caseId"
          label="Case"
          rules={[{ required: true, message: "Case is required" }]}
        >
          <Select placeholder="Select case">
            {cases.map((c) => (
              <Select.Option key={c.id} value={c.id}>
                {c.title}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          name="assignedToId"
          label="Assigned To"
          rules={[{ required: true, message: "Assigned user is required" }]}
        >
          <Select placeholder="Select user">
            {users.map((u) => (
              <Select.Option key={u.id} value={u.id}>
                {u.name} ({u.role})
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          name="title"
          label="Title"
          rules={[{ required: true, message: "Title is required" }]}
        >
          <Input />
        </Form.Item>

        <Form.Item name="description" label="Description">
          <Input.TextArea rows={3} />
        </Form.Item>

        <Form.Item name="dueDate" label="Due Date">
          <DatePicker style={{ width: "100%" }} />
        </Form.Item>

        <Form.Item name="status" label="Status" initialValue="pending">
          <Select>
            <Select.Option value="pending">Pending</Select.Option>
            <Select.Option value="in-progress">In Progress</Select.Option>
            <Select.Option value="completed">Completed</Select.Option>
          </Select>
        </Form.Item>

        <Form.Item>
          <div className="flex justify-end space-x-2">
            <Button onClick={onClose}>Cancel</Button>
            <Button type="primary" onClick={handleSubmit} loading={loading}>
              {isEditing ? "Update" : "Create"}
            </Button>
          </div>
        </Form.Item>
      </Form>
    </Modal>
  );
}
