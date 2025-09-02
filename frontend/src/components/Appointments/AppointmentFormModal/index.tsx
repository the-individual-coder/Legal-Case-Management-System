"use client";

import React, { useEffect, useState } from "react";
import { Modal, Form, Input, DatePicker, Select, Button, App } from "antd";

import dayjs from "dayjs";
import { useSession } from "next-auth/react";

type Props = {
  open: boolean;
  onClose: () => void;
  editing?: any | null;
};

export default function AppointmentFormModal({
  open,
  onClose,
  editing,
}: Props) {
  const [form] = Form.useForm();

  const [clients, setClients] = useState<any[]>([]);
  const [cases, setCases] = useState<any[]>([]);
  const [lawyers, setLawyers] = useState<any[]>([]);

  // Access session data
  const { data, status } = useSession();
  const { message } = App.useApp();
  // Check if the session is still loading or if the user is logged in
  const userId = status === "authenticated" ? data?.user?.id : null;

  // Fetch dropdown options
  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/client/getClients`, {
      credentials: "include",
    })
      .then((res) => res.json())
      .then((json) => setClients(json.data.data || []))
      .catch(console.error);

    fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/case/getCases`, {
      credentials: "include",
    })
      .then((res) => res.json())
      .then((json) => setCases(json.data.data || []))
      .catch(console.error);

    fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/user/getUsers?role=lawyer`, {
      credentials: "include",
    })
      .then((res) => res.json())
      .then((json) => setLawyers(json.data.data || []))
      .catch(console.error);

    console.log("the dataa", data);
    console.log("the statusssss", status);
  }, []);

  // Prefill form in edit mode
  useEffect(() => {
    if (editing) {
      form.setFieldsValue({
        ...editing,
        scheduledAt: dayjs(editing.scheduledAt),
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

    try {
      const values = await form.validateFields();

      const payload = {
        ...values,
        scheduledAt: values.scheduledAt.toISOString(), // combine into single datetime
      };

      const method = editing ? "PUT" : "POST";
      const url = editing
        ? `${process.env.NEXT_PUBLIC_API_BASE_URL}/appointment/updateAppointment/${editing.id}/${userId}`
        : `${process.env.NEXT_PUBLIC_API_BASE_URL}/appointment/createAppointment/${userId}`;

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      console.log("the json", json);
      message.success("Appointment saved");
      onClose();
    } catch (err: any) {
      message.error(err.message || "Validation failed");
    }
  };

  return (
    <Modal
      title={editing ? "Edit Appointment" : "New Appointment"}
      open={open}
      onCancel={onClose}
      footer={null}
    >
      <Form form={form} layout="vertical">
        <Form.Item label="Case" name="caseId" rules={[{ required: true }]}>
          <Select placeholder="Select case">
            {cases?.map((c) => (
              <Select.Option key={c.id} value={c.id}>
                {c.title}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item label="Client" name="clientId" rules={[{ required: true }]}>
          <Select placeholder="Select client">
            {clients.map((c) => (
              <Select.Option key={c.id} value={c.id}>
                {c.firstName} {c.lastName}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item label="Lawyer" name="lawyerId" rules={[{ required: true }]}>
          <Select placeholder="Select lawyer">
            {lawyers.map((l) => (
              <Select.Option key={l.id} value={l.id}>
                {l.name}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          label="Date & Time"
          name="scheduledAt"
          rules={[{ required: true }]}
        >
          <DatePicker
            showTime
            style={{ width: "100%" }}
            placeholder="Select date and time"
          />
        </Form.Item>

        <Form.Item label="Status" name="status" rules={[{ required: true }]}>
          <Select>
            <Select.Option value="pending">Pending</Select.Option>
            <Select.Option value="confirmed">Confirmed</Select.Option>
            <Select.Option value="completed">Completed</Select.Option>
            <Select.Option value="canceled">Canceled</Select.Option>
          </Select>
        </Form.Item>

        <Form.Item label="Notes" name="notes">
          <Input.TextArea rows={3} />
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
