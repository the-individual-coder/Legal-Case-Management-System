// src/components/ClientFormModal.tsx
"use client";
import { useState } from "react";
import { Modal, Form, Input, Button, message } from "antd";
import { post } from "@/lib/api";
import type { Client } from "@/lib/api";

export default function ClientFormModal({
  visible,
  onClose,
  defaultValues,
}: {
  visible: boolean;
  onClose: () => void;
  defaultValues?: Partial<Client>;
}) {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  async function submit(values: any) {
    setLoading(true);
    try {
      await post("/api/clients", values);
      message.success("Client created");
      onClose();
    } catch (e: any) {
      message.error(e?.message ?? "Failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal
      title="New Client"
      open={visible}
      onCancel={onClose}
      footer={null}
      destroyOnHidden
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={defaultValues}
        onFinish={submit}
      >
        <Form.Item name="name" label="Full Name" rules={[{ required: true }]}>
          <Input placeholder="Jane Doe" />
        </Form.Item>
        <Form.Item name="email" label="Email" rules={[{ type: "email" }]}>
          <Input />
        </Form.Item>
        <Form.Item name="phone" label="Phone">
          <Input />
        </Form.Item>
        <Form.Item name="address" label="Address">
          <Input />
        </Form.Item>
        <div className="flex justify-end gap-2">
          <Button onClick={onClose}>Cancel</Button>
          <Button type="primary" htmlType="submit" loading={loading}>
            Save
          </Button>
        </div>
      </Form>
    </Modal>
  );
}
