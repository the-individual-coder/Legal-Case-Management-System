"use client";

import React, { useEffect, useState } from "react";
import {
  Modal,
  Form,
  Input,
  DatePicker,
  Select,
  Button,
  message,
  App,
} from "antd";
import dayjs from "dayjs";
import { useSession } from "next-auth/react";

type Props = {
  open: boolean;
  onClose: () => void;
  editing?: any | null;
  userId?: number | null;
};

export default function CalendarEventFormModal({
  open,
  onClose,
  editing,
  userId,
}: Props) {
  const [form] = Form.useForm();
  const isEditing = !!editing;
  const { data } = useSession();
  const [cases, setCases] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);
  const { message, modal } = App.useApp();
  useEffect(() => {
    if (editing) {
      form.setFieldsValue({
        title: editing.title,
        description: editing.description,
        caseId: editing.caseId || undefined,
        range: editing.startTime
          ? [
              dayjs(editing.startTime),
              editing.endTime
                ? dayjs(editing.endTime)
                : dayjs(editing.startTime),
            ]
          : undefined,
      });
    } else {
      form.resetFields();
    }
  }, [editing, form]);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/case/getCases`, {
      credentials: "include",
    })
      .then((r) => r.json())
      .then((json) => setCases(json.data.data || []))
      .catch(console.error);
  }, []);

  const handleSubmit = async () => {
    if (!userId) {
      return message.error("User not logged in");
    }
    try {
      const values = await form.validateFields();
      setSaving(true);

      const payload = {
        title: values.title,
        description: values.description,
        caseId: values.caseId || null,
        startTime: values.range ? values.range[0].toISOString() : null,
        endTime: values.range ? values.range[1].toISOString() : null,
      };

      const url = isEditing
        ? `${process.env.NEXT_PUBLIC_API_BASE_URL}/CalendarEvent/updateEvent/${editing.id}/${userId}`
        : `${process.env.NEXT_PUBLIC_API_BASE_URL}/CalendarEvent/createEvent/${userId}`;

      const method = isEditing ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      await res.json();

      message.success(isEditing ? "Event updated" : "Event created");
      onClose();
    } catch (err: any) {
      console.error(err);
      message.error(err.message || "Failed to save event");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      title={isEditing ? "Edit Event" : "New Event"}
      open={open}
      onCancel={onClose}
      footer={null}
      destroyOnHidden
    >
      <Form form={form} layout="vertical">
        <Form.Item
          name="title"
          label="Title"
          rules={[{ required: true, message: "Title required" }]}
        >
          <Input />
        </Form.Item>

        <Form.Item name="description" label="Description">
          <Input.TextArea rows={3} />
        </Form.Item>

        <Form.Item name="caseId" label="Case (optional)">
          <Select allowClear placeholder="Select case">
            {cases.map((c) => (
              <Select.Option key={c.id} value={c.id}>
                {c.title}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          name="range"
          label="Start & End"
          rules={[{ required: true, message: "Specify start and end" }]}
        >
          <DatePicker.RangePicker showTime style={{ width: "100%" }} />
        </Form.Item>

        <div className="flex justify-end gap-2">
          <Button onClick={onClose}>Cancel</Button>
          <Button type="primary" onClick={handleSubmit} loading={saving}>
            {isEditing ? "Update" : "Create"}
          </Button>
        </div>
      </Form>
    </Modal>
  );
}
