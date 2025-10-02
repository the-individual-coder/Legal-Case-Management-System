"use client";

import React, { useEffect, useState } from "react";
import { Modal, Form, Input, DatePicker, Button, App, Select } from "antd";
import dayjs from "dayjs";
import { useSession } from "next-auth/react";
import { PERMISSIONS, can } from "@/lib/rbac";

type Props = {
  open: boolean;
  onCancel: () => void;
  initialValues?: any | null;
  userId?: number | null;
};

export default function ClosureFormModal({
  open,
  onCancel,
  initialValues,
  userId,
}: Props) {
  const [form] = Form.useForm();
  const { data, status } = useSession();
  const { message } = App.useApp();
  const [cases, setCases] = useState<any[]>([]);

  const role = (data?.user as any)?.role ?? "client";
  const canCreate = can(role, PERMISSIONS.CLOSURE.CREATE);
  const canUpdate = can(role, PERMISSIONS.CLOSURE.UPDATE);
  const allowed = initialValues ? canUpdate : canCreate;

  useEffect(() => {
    if (!allowed) return;

    // fetch available cases for dropdown
    fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/case/getCases`, {
      credentials: "include",
    })
      .then((res) => res.json())
      .then((json) => setCases(json.data.data || []))
      .catch(console.error);
  }, [allowed]);

  useEffect(() => {
    if (initialValues) {
      form.setFieldsValue({
        ...initialValues,
        caseId: initialValues.Case?.id,
        closedAt: initialValues.closedAt ? dayjs(initialValues.closedAt) : null,
      });
    } else {
      form.resetFields();
    }
  }, [initialValues, form]);

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
        closedAt: values.closedAt.toISOString(),
      };

      const method = initialValues ? "PUT" : "POST";
      const url = initialValues
        ? `${process.env.NEXT_PUBLIC_API_BASE_URL}/caseclosure/updateClosure/${initialValues.id}/${userId}`
        : `${process.env.NEXT_PUBLIC_API_BASE_URL}/caseclosure/createClosure/${userId}`;

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      await res.json();
      message.success("Closure saved");
      onCancel();
    } catch (err: any) {
      console.error(err);
      message.error(err.message || "Failed to save closure");
    }
  };

  if (!allowed) {
    return (
      <Modal
        title="Unauthorized"
        open={open}
        onCancel={onCancel}
        footer={[
          <Button key="close" onClick={onCancel}>
            Close
          </Button>,
        ]}
      >
        <p>
          You do not have permission to {initialValues ? "edit" : "create"}{" "}
          closures.
        </p>
      </Modal>
    );
  }

  return (
    <Modal
      title={initialValues ? "Edit Closure" : "New Closure"}
      open={open}
      onCancel={onCancel}
      footer={null}
    >
      <Form form={form} layout="vertical">
        <Form.Item
          name="caseId"
          label="Case No."
          rules={[{ required: true, message: "Please select a case" }]}
        >
          <Select
            placeholder="Select a case no."
            showSearch
            optionFilterProp="children"
          >
            {cases.map((c) => (
              <Select.Option key={c.id} value={c.id}>
                {c.id}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          label="Closed At"
          name="closedAt"
          rules={[{ required: true }]}
        >
          <DatePicker showTime style={{ width: "100%" }} />
        </Form.Item>

        <Form.Item label="Summary" name="summary">
          <Input.TextArea rows={3} />
        </Form.Item>

        <div className="flex justify-end gap-2">
          <Button onClick={onCancel}>Cancel</Button>
          <Button type="primary" onClick={handleSubmit}>
            Save
          </Button>
        </div>
      </Form>
    </Modal>
  );
}
