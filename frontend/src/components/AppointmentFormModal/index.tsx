// src/components/AppointmentFormModal.tsx
"use client";
import { Modal, Form, Input, DatePicker, TimePicker, Select, message, Button } from "antd";
import { post } from "@/lib/api";

export default function AppointmentFormModal({
  visible,
  onClose,
}: {
  visible: boolean;
  onClose: () => void;
}) {
  const [form] = Form.useForm();

  async function onFinish(values: any) {
    try {
      await post("/api/appointments", values);
      message.success("Appointment scheduled");
      onClose();
    } catch (e: any) {
      message.error(e?.message ?? "Failed");
    }
  }

  return (
    <Modal title="New Appointment" open={visible} onCancel={onClose} footer={null}>
      <Form layout="vertical" form={form} onFinish={onFinish}>
        <Form.Item label="Client" name="clientId" rules={[{ required: true }]}>
          <Select placeholder="Select client" />
        </Form.Item>
        <Form.Item label="Date" name="date" rules={[{ required: true }]}>
          <DatePicker style={{ width: "100%" }} />
        </Form.Item>
        <Form.Item label="Time" name="time" rules={[{ required: true }]}>
          <TimePicker style={{ width: "100%" }} />
        </Form.Item>
        <Form.Item label="Notes" name="notes">
          <Input.TextArea rows={3} />
        </Form.Item>
        <div className="flex justify-end gap-2">
          <Button onClick={onClose}>Cancel</Button>
          <Button type="primary" htmlType="submit">Save</Button>
        </div>
      </Form>
    </Modal>
  );
}
