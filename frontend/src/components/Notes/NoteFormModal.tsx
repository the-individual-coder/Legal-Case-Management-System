"use client";

import React, { useEffect, useState } from "react";
import { Modal, Form, Input, Select, Button, App } from "antd";
import { useSession } from "next-auth/react";

type Props = {
  open: boolean;
  onClose: () => void;
  editing?: any | null;
  userId?: number | null;
};

export default function NoteFormModal({
  open,
  onClose,
  editing,
  userId,
}: Props) {
  const [form] = Form.useForm();
  const { data, status } = useSession();
  const role = (data?.user as any)?.role ?? "client";

  const [cases, setCases] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);
  const { message } = App.useApp();
  useEffect(() => {
    // fetch cases for select
    fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/case/getCases`, {
      credentials: "include",
    })
      .then((r) => r.json())
      .then((json) => {
        const dd = (json.data && json.data.data) || json.data || [];
        setCases(dd);
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (editing) {
      form.setFieldsValue({
        caseId: editing.caseId,
        content: editing.content,
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

    setSaving(true);
    try {
      const values = await form.validateFields();

      if (editing) {
        // update
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/note/updateNote/${editing.id}/${userId}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify(values),
          }
        );
        await res.json();
        message.success("Notes Saved!");
      } else {
        // create
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/note/createNote/${userId}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify(values),
          }
        );
        await res.json();
        message.success("Created Successfully!");
      }

      onClose();
    } catch (err: any) {
      console.error(err);
      message.error(err.message || "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      title={editing ? "Edit Note" : "New Note"}
      open={open}
      onCancel={onClose}
      footer={[
        <Button key="cancel" onClick={onClose}>
          Cancel
        </Button>,
        <Button
          key="save"
          type="primary"
          loading={saving}
          onClick={handleSubmit}
        >
          Save
        </Button>,
      ]}
    >
      <Form layout="vertical" form={form}>
        <Form.Item label="Case No. (optional)" name="caseId">
          <Select placeholder="Select case" allowClear>
            {cases.map((c: any) => (
              <Select.Option value={c.id} key={c.id}>
                {c.id}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          name="content"
          label="Content"
          rules={[{ required: true, message: "Please enter note content" }]}
        >
          <Input.TextArea rows={8} />
        </Form.Item>
      </Form>
    </Modal>
  );
}
