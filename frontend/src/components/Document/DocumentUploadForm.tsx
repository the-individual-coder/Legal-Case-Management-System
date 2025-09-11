"use client";

import React, { useEffect, useState } from "react";
import {
  Modal,
  Form,
  Select,
  Upload,
  Button,
  Input,
  App,
  DatePicker,
} from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { useSession } from "next-auth/react";

export default function DocumentUploadForm({
  open,
  onClose,
  onUploaded,
  caseId,
}: {
  open: boolean;
  onClose: () => void;
  onUploaded?: (doc: any) => void;
  caseId?: number | null;
}) {
  const [form] = Form.useForm();
  const { message } = App.useApp();
  const { data: session, status } = useSession();
  const userId = status === "authenticated" ? (session?.user as any)?.id : null;

  const [uploading, setUploading] = useState(false);
  const [cases, setCases] = useState<any[]>([]);
  const uploadProps = {
    name: "file",
    multiple: false,
    customRequest: async (options: any) => {
      const { file, onSuccess, onError } = options;
      setUploading(true);
      try {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("caseId", form.getFieldValue("caseId") || caseId || "");
        formData.append("createdBy", userId || "");
        formData.append("type", form.getFieldValue("type") || "upload");

        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL_NO_VERSION}/document/upload`,
          {
            method: "POST",
            credentials: "include",
            body: formData,
          }
        );
        const json = await res.json();
        message.success("Uploaded");
        onSuccess && onSuccess(json);
        onUploaded && onUploaded(json.data);
      } catch (err: any) {
        console.error("upload error", err);
        message.error(err.message || "Upload failed");
        onError && onError(err);
      } finally {
        setUploading(false);
        onClose();
      }
    },
    showUploadList: true,
  };

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/case/getCases`, {
      credentials: "include",
    })
      .then((res) => res.json())
      .then((json) => setCases(json.data.data || []))
      .catch(console.error);
  }, []);

  return (
    <Modal
      title="Upload Document"
      open={open}
      onCancel={onClose}
      footer={null}
      destroyOnHidden
    >
      <Form form={form} layout="vertical">
        <Form.Item name="caseId" label="Case">
          <Select
            showSearch
            optionFilterProp="label"
            placeholder="Attach to case (optional)"
            // For brevity: assume parent passes case options separately or you can fetch in component
            options={
              cases && cases.length > 0
                ? cases.map((c) => ({
                    label: `${c.title}`,
                    value: c.id,
                  }))
                : []
            }
          />
        </Form.Item>

        <Form.Item name="type" label="Type" initialValue="evidence">
          <Select
            options={[
              { label: "Evidence", value: "evidence" },
              { label: "Contract", value: "contract" },
              { label: "Payment proof", value: "payment_proof" },
              { label: "Other", value: "other" },
            ]}
          />
        </Form.Item>

        <Form.Item label="File">
          <Upload {...uploadProps}>
            <Button icon={<UploadOutlined />} loading={uploading}>
              Click to Upload
            </Button>
          </Upload>
        </Form.Item>

        <div className="flex justify-end gap-2">
          <Button onClick={onClose}>Cancel</Button>
        </div>
      </Form>
    </Modal>
  );
}
