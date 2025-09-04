"use client";
import { Modal, Form, Input, Select, Button, message } from "antd";
import { post } from "@/lib/api";

export default function EngagementModal({
  visible,
  onClose,
  editing,
  userId,
}: any) {
  const [form] = Form.useForm();

  const onFinish = async (values: any) => {
    try {
      if (editing) {
        await post(`/engagement/updateEngagement/${editing.id}`, {
          ...values,
          userId,
        });
        message.success("Engagement updated successfully");
      } else {
        await post("/engagement/createEngagement", { ...values, userId });
        message.success("Engagement created successfully");
      }
      onClose();
    } catch (err: any) {
      message.error(err?.message ?? "Failed");
    }
  };

  return (
    <Modal
      title={editing ? "Edit Engagement" : "New Engagement"}
      open={visible}
      onCancel={onClose}
      footer={null}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        initialValues={editing || {}}
      >
        <Form.Item label="Client" name="clientId" rules={[{ required: true }]}>
          <Select placeholder="Select client" />
        </Form.Item>
        <Form.Item label="Case" name="caseId" rules={[{ required: true }]}>
          <Select placeholder="Select case" />
        </Form.Item>
        <Form.Item
          label="Proposal Content"
          name="proposalContent"
          rules={[{ required: true }]}
        >
          <Input.TextArea rows={5} />
        </Form.Item>
        <Form.Item label="Status" name="status">
          <Select>
            <Select.Option value="draft">Draft</Select.Option>
            <Select.Option value="sent">Sent</Select.Option>
            <Select.Option value="accepted">Accepted</Select.Option>
            <Select.Option value="rejected">Rejected</Select.Option>
          </Select>
        </Form.Item>
        <div className="flex justify-end gap-2">
          <Button onClick={onClose}>Cancel</Button>
          <Button type="primary" htmlType="submit">
            {editing ? "Update" : "Save"}
          </Button>
        </div>
      </Form>
    </Modal>
  );
}
