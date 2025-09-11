// src/components/Billing/InvoiceFormModal.tsx
"use client";

import React, { useEffect, useState } from "react";
import {
  Modal,
  Form,
  Input,
  DatePicker,
  Button,
  Select,
  Upload,
  App,
} from "antd";
import { UploadOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import { useSession } from "next-auth/react";

type Props = {
  visible: boolean;
  editing?: any | null;
  onClose: () => void;
};

export default function InvoiceFormModal({ visible, editing, onClose }: Props) {
  const [form] = Form.useForm();
  const { message } = App.useApp();
  const { data: session, status } = useSession();
  const userId = status === "authenticated" ? (session?.user as any)?.id : null;

  const [clients, setClients] = useState<any[]>([]);
  const [cases, setCases] = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/client/getClients`, {
      credentials: "include",
    })
      .then((r) => r.json())
      .then((j) => setClients(j.data?.data || []))
      .catch(() => {});
    fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/case/getCases`, {
      credentials: "include",
    })
      .then((r) => r.json())
      .then((j) => setCases(j.data?.data || []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (editing) {
      form.setFieldsValue({
        clientId: editing.clientId,
        caseId: editing.caseId,
        amount: editing.amount,
        dueDate: editing.dueDate ? dayjs(editing.dueDate) : null,
        paidAt: editing.paidAt ? dayjs(editing.paidAt) : null,
        description: editing.description,
        status: editing.status,
      });
    } else form.resetFields();
  }, [editing, form]);

  const handleFinish = async (values: any) => {
    try {
      const payload = {
        ...values,
        dueDate: values.dueDate ? values.dueDate.toISOString() : null,
        paidAt: values.paidAt ? values.paidAt.toISOString() : null,
        userId,
      };

      if (editing) {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/invoice/update/${editing.id}/${userId}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify(payload),
          }
        );
        const json = await res.json();

        message.success("Invoice updated");
        onClose();
        return;
      } else {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/invoice/create`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify(payload),
          }
        );
        const json = await res.json();
        message.success("Invoice created");
        onClose();
        return;
      }
    } catch (err: any) {
      message.error(err.message || "Failed");
    }
  };

  // Upload stub - replace with real Cloudinary uploader via your server endpoint
  const uploadProps = {
    name: "file",
    multiple: false,
    customRequest: async (options: any) => {
      const { file, onSuccess, onError, onProgress } = options;
      try {
        setUploading(true);
        console.log("the editinggg", editing);
        const formData = new FormData();
        formData.append("file", file);
        formData.append("caseId", editing?.caseId || ""); // must be linked to case
        formData.append("invoiceId", editing?.id || ""); // must be linked to invoice
        formData.append("userId", userId);

        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL_NO_VERSION}/billing/upload-proof`,
          {
            method: "POST",
            body: formData,
            credentials: "include",
          }
        );

        if (!res.ok) throw new Error("Upload failed");
        const json = await res.json();

        message.success("Payment proof uploaded");
        onSuccess?.(json, file);
      } catch (err: any) {
        console.error("Upload error:", err);
        message.error(err.message || "Upload failed");
        onError?.(err);
      } finally {
        setUploading(false);
      }
    },
    showUploadList: true,
  };

  return (
    <Modal
      title={editing ? "Edit Invoice" : "New Invoice"}
      open={visible}
      onCancel={onClose}
      footer={null}
    >
      <Form form={form} layout="vertical" onFinish={handleFinish}>
        <Form.Item name="clientId" label="Client" rules={[{ required: true }]}>
          <Select
            showSearch
            optionFilterProp="label"
            options={clients.map((c) => ({
              label: `${c.firstName} ${c.lastName}`,
              value: c.id,
            }))}
          />
        </Form.Item>

        <Form.Item name="caseId" label="Case (optional)">
          <Select
            showSearch
            optionFilterProp="label"
            options={cases.map((c) => ({ label: c.title, value: c.id }))}
          />
        </Form.Item>

        <Form.Item name="amount" label="Amount" rules={[{ required: true }]}>
          <Input type="number" />
        </Form.Item>

        <Form.Item name="dueDate" label="Due Date">
          <DatePicker style={{ width: "100%" }} />
        </Form.Item>

        <Form.Item shouldUpdate={(prev, cur) => prev.status !== cur.status}>
          {({ getFieldValue }) =>
            getFieldValue("status") === "paid" ? (
              <Form.Item name="paidAt" label="Paid At">
                <DatePicker style={{ width: "100%" }} showTime />
              </Form.Item>
            ) : null
          }
        </Form.Item>

        <Form.Item name="description" label="Description">
          <Input.TextArea rows={3} />
        </Form.Item>

        <Form.Item name="status" label="Status" initialValue="pending">
          <Select
            options={[
              { label: "Pending", value: "pending" },
              { label: "Paid", value: "paid" },
              { label: "Overdue", value: "overdue" },
            ]}
          />
        </Form.Item>

        <Form.Item label="Attach payment proof (optional)">
          <Upload {...uploadProps}>
            <Button icon={<UploadOutlined />}>Upload</Button>
          </Upload>
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
