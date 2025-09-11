"use client";

import React, { useEffect, useState } from "react";
import { Modal, Form, Input, Select, DatePicker, Button, App } from "antd";
import dayjs from "dayjs";
import { useSession } from "next-auth/react";
import { PERMISSIONS, can } from "@/lib/rbac";

type Props = { visible: boolean; editing?: any | null; onClose: () => void };

export default function CaseFormModal({ visible, editing, onClose }: Props) {
  const [form] = Form.useForm();
  const { message } = App.useApp();
  const { data: session, status } = useSession();
  const role = (session?.user as any)?.role ?? "client";
  const userId = status === "authenticated" ? (session?.user as any)?.id : null;

  const canCreate = can(role, PERMISSIONS.CASES.CREATE);
  const canUpdate = can(role, PERMISSIONS.CASES.UPDATE);
  const allowed = editing ? canUpdate : canCreate;

  const [clients, setClients] = useState<any[]>([]);
  const [lawyers, setLawyers] = useState<any[]>([]);

  useEffect(() => {
    if (!allowed) return;
    fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/client/list`, {
      credentials: "include",
    })
      .then((r) => r.json())
      .then((j) => setClients(j.data?.data || []))
      .catch(() => {});
    fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/user?search=role:lawyer`, {
      credentials: "include",
    })
      .then((r) => r.json())
      .then((j) => setLawyers(j.data || []))
      .catch(() => {});
  }, [allowed]);

  useEffect(() => {
    if (editing) {
      form.setFieldsValue({
        title: editing.title,
        description: editing.description,
        priority: editing.priority || "normal",
        clientId: editing.clientId ?? editing.Client?.id,
        assignedLawyerId:
          editing.assignedLawyerId ?? editing.AssignedLawyer?.id,
        startDate: editing.startDate ? dayjs(editing.startDate) : null,
        endDate: editing.endDate ? dayjs(editing.endDate) : null,
        status: editing.status ?? "new",
      });
    } else form.resetFields();
  }, [editing, form]);

  const handleSubmit = async () => {
    if (!allowed) {
      message.error("You don't have permission");
      return;
    }

    try {
      const vals = await form.validateFields();
      const payload = {
        title: vals.title,
        description: vals.description,
        priority: vals.priority,
        clientId: vals.clientId,
        assignedLawyerId: vals.assignedLawyerId,
        startDate: vals.startDate ? vals.startDate.toISOString() : null,
        endDate: vals.endDate ? vals.endDate.toISOString() : null,
        status: vals.status,
        userId,
      };

      const url = editing
        ? `${process.env.NEXT_PUBLIC_API_BASE_URL}/case/update/${editing.id}/${userId}`
        : `${process.env.NEXT_PUBLIC_API_BASE_URL}/case/create`;

      const method = editing ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      message.success(editing ? "Updated" : "Created");
      onClose();
    } catch (err: any) {
      message.error(err.message || "Failed");
    }
  };

  if (!allowed) {
    return (
      <Modal
        title="Unauthorized"
        open={visible}
        onCancel={onClose}
        footer={[
          <Button key="close" onClick={onClose}>
            Close
          </Button>,
        ]}
      >
        You don't have permission to create or edit cases.
      </Modal>
    );
  }

  return (
    <Modal
      title={editing ? "Edit Case" : "New Case"}
      open={visible}
      onCancel={onClose}
      footer={null}
      destroyOnClose
    >
      <Form form={form} layout="vertical" onFinish={handleSubmit}>
        <Form.Item name="title" label="Title" rules={[{ required: true }]}>
          <Input />
        </Form.Item>

        <Form.Item name="description" label="Description">
          <Input.TextArea rows={3} />
        </Form.Item>

        <Form.Item name="clientId" label="Client" rules={[{ required: true }]}>
          <Select
            options={clients.map((c) => ({
              label: `${c.firstName} ${c.lastName}`,
              value: c.id,
            }))}
          />
        </Form.Item>

        <Form.Item name="assignedLawyerId" label="Assigned Lawyer">
          <Select
            options={lawyers.map((l) => ({ label: l.name, value: l.id }))}
          />
        </Form.Item>

        <Form.Item name="priority" label="Priority" initialValue="normal">
          <Select
            options={[
              { label: "Low", value: "low" },
              { label: "Normal", value: "normal" },
              { label: "High", value: "high" },
              { label: "Urgent", value: "urgent" },
            ]}
          />
        </Form.Item>

        <Form.Item name="startDate" label="Start Date">
          <DatePicker style={{ width: "100%" }} showTime />
        </Form.Item>

        <Form.Item name="endDate" label="End Date">
          <DatePicker style={{ width: "100%" }} showTime />
        </Form.Item>

        <Form.Item name="status" label="Status" initialValue="new">
          <Select
            options={[
              { label: "New", value: "new" },
              { label: "Active", value: "active" },
              { label: "In Court", value: "in_court" },
              { label: "Closed", value: "closed" },
              { label: "On-hold", value: "on-hold" },
            ]}
          />
        </Form.Item>

        <div className="flex justify-end gap-2">
          <Button onClick={onClose}>Cancel</Button>
          <Button type="primary" onClick={() => form.submit()}>
            {editing ? "Update" : "Create"}
          </Button>
        </div>
      </Form>
    </Modal>
  );
}
