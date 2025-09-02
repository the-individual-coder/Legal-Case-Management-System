"use client";
import React, { useEffect, useState } from "react";
import { Modal, Form, Input, Select, Button, message } from "antd";

export default function ClientIntakeFormModal({
  visible,
  onClose,
  editing,
}: {
  visible: boolean;
  onClose: () => void;
  editing?: any;
}) {
  const [form] = Form.useForm();
  const [clients, setClients] = useState<any[]>([]);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/client/getClients`, {
      credentials: "include",
    })
      .then((res) => res.json())
      .then((json) => setClients(json.data.data || []))
      .catch(console.error);

    if (editing) form.setFieldsValue(editing);
  }, [editing]);

  const handleFinish = async (values: any) => {
    try {
      const method = editing ? "PUT" : "POST";
      const url = editing
        ? `${process.env.NEXT_PUBLIC_API_BASE_URL}/clientIntake/${editing.id}`
        : `${process.env.NEXT_PUBLIC_API_BASE_URL}/clientIntake/create`;

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(values),
      });
      const json = await res.json();
      message.success(editing ? "Updated" : "Created");
      onClose();
    } catch (err) {
      message.error("Failed");
    }
  };

  return (
    <Modal
      title={editing ? "Edit Intake" : "New Intake"}
      open={visible}
      onCancel={onClose}
      footer={null}
    >
      <Form form={form} layout="vertical" onFinish={handleFinish}>
        <Form.Item label="Client" name="clientId" rules={[{ required: true }]}>
          <Select
            placeholder="Select client"
            options={clients.map((c) => ({
              label: `${c.firstName} ${c.lastName}`,
              value: c.id,
            }))}
          />
        </Form.Item>
        <Form.Item
          label="Case Type"
          name="caseType"
          rules={[{ required: true }]}
        >
          <Input />
        </Form.Item>
        <Form.Item label="Referred By" name="referredBy">
          <Input />
        </Form.Item>
        <Form.Item label="Notes" name="intakeNotes">
          <Input.TextArea rows={3} />
        </Form.Item>
        <div className="flex justify-end gap-2">
          <Button onClick={onClose}>Cancel</Button>
          <Button type="primary" htmlType="submit">
            {editing ? "Update" : "Create"}
          </Button>
        </div>
      </Form>
    </Modal>
  );
}
