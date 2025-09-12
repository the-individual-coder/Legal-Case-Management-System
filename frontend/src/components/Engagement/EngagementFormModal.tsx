"use client";

import React, { useEffect, useState } from "react";
import { Modal, Form, Select, DatePicker, Button, App } from "antd";
import dayjs from "dayjs";
import { useSession } from "next-auth/react";
import { PERMISSIONS, can } from "@/lib/rbac";

type Props = { open: boolean; editing?: any | null; onClose: () => void };

export default function EngagementFormModal({ open, editing, onClose }: Props) {
  const [form] = Form.useForm();
  const { data: session, status } = useSession();
  const { message } = App.useApp();

  const role = (session?.user as any)?.role ?? "client";
  const userId = status === "authenticated" ? (session?.user as any)?.id : null;
  const canCreate = can(role, PERMISSIONS.ENGAGEMENTS.CREATE);
  const canUpdate = can(role, PERMISSIONS.ENGAGEMENTS.UPDATE);
  const allowed = editing ? canUpdate : canCreate;

  const [cases, setCases] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [lawyers, setLawyers] = useState<any[]>([]);

  useEffect(() => {
    if (!allowed) return;
    fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/case/getCases`, {
      credentials: "include",
    })
      .then((r) => r.json())
      .then((j) => setCases(j.data?.data || []))
      .catch(() => {});
    fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/client/getClients`, {
      credentials: "include",
    })
      .then((r) => r.json())
      .then((j) => setClients(j.data?.data || []))
      .catch(() => {});
    fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/user/getUsers?role=lawyer`, {
      credentials: "include",
    })
      .then((r) => r.json())
      .then((j) => setLawyers(j.data?.data || []))
      .catch(() => {});
  }, [allowed]);

  useEffect(() => {
    if (editing) {
      form.setFieldsValue({
        caseId: editing.Case?.id ?? editing.caseId,
        clientId: editing.Client?.id ?? editing.clientId,
        lawyerId: editing.Lawyer?.id ?? editing.lawyerId,
        startDate: editing.startDate ? dayjs(editing.startDate) : null,
        endDate: editing.endDate ? dayjs(editing.endDate) : null,
        status: editing.status ?? "active",
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
        ...vals,
        startDate: vals.startDate ? vals.startDate.toISOString() : null,
        endDate: vals.endDate ? vals.endDate.toISOString() : null,
      };
      const url = editing
        ? `${process.env.NEXT_PUBLIC_API_BASE_URL}/engagement/update/${editing.id}/${userId}`
        : `${process.env.NEXT_PUBLIC_API_BASE_URL}/engagement/create`;
      const method = editing ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ ...payload, userId }),
      });
      if (!res.ok) throw new Error(await res.text());
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
        open={open}
        onCancel={onClose}
        footer={[
          <Button key="close" onClick={onClose}>
            Close
          </Button>,
        ]}
      >
        You don&apos;t have permission.
      </Modal>
    );
  }

  return (
    <Modal
      title={editing ? "Edit Engagement" : "New Engagement"}
      open={open}
      onCancel={onClose}
      footer={null}
      destroyOnHidden
    >
      <Form form={form} layout="vertical" onFinish={handleSubmit}>
        <Form.Item name="caseId" label="Case" rules={[{ required: true }]}>
          <Select
            options={cases.map((c: any) => ({ label: c.title, value: c.id }))}
            showSearch
            optionFilterProp="label"
          />
        </Form.Item>
        <Form.Item name="clientId" label="Client" rules={[{ required: true }]}>
          <Select
            options={clients.map((c: any) => ({
              label: `${c.firstName} ${c.lastName}`,
              value: c.id,
            }))}
            showSearch
            optionFilterProp="label"
          />
        </Form.Item>
        <Form.Item name="lawyerId" label="Lawyer" rules={[{ required: true }]}>
          <Select
            options={lawyers.map((l: any) => ({ label: l.name, value: l.id }))}
            showSearch
            optionFilterProp="label"
          />
        </Form.Item>
        <Form.Item name="startDate" label="Start Date">
          <DatePicker showTime style={{ width: "100%" }} />
        </Form.Item>
        <Form.Item name="endDate" label="End Date">
          <DatePicker showTime style={{ width: "100%" }} />
        </Form.Item>
        <Form.Item name="status" label="Status" initialValue="active">
          <Select
            options={[
              { label: "Active", value: "active" },
              { label: "Completed", value: "completed" },
              { label: "Terminated", value: "terminated" },
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
