"use client";

import React, { useEffect, useState } from "react";
import { Modal, Form, Input, DatePicker, Select, Button, App } from "antd";
import dayjs from "dayjs";
import { useSession } from "next-auth/react";
import { PERMISSIONS, can } from "@/lib/rbac";

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

  const { data, status } = useSession();
  const { message } = App.useApp();

  const userId = status === "authenticated" ? data?.user?.id : null;
  const role = (data?.user as any)?.role ?? "client";

  const canCreate = can(role, PERMISSIONS.APPOINTMENTS.CREATE);
  const canUpdate = can(role, PERMISSIONS.APPOINTMENTS.UPDATE);
  const allowed = editing ? canUpdate : canCreate;

  const fetchData = async () => {
    if (role === "client") {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/client?search=email:${data?.user?.email}`
        );
        const json = await response.json();

        const ClientData = json.data[0];

        if (ClientData) {
          const detailResponse = await fetch(
            `${process.env.NEXT_PUBLIC_API_BASE_URL}/client?search=id:${ClientData?.id}`,
            {
              credentials: "include",
            }
          );
          const detailJson = await detailResponse.json();
          setClients(detailJson.data || []);
        }
      } catch (error) {
        console.error(error);
      }
    } else {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/client/getClients`,
          {
            credentials: "include",
          }
        );
        const json = await response.json();
        setClients(json.data.data || []);
      } catch (error) {
        console.error(error);
      }
    }
  };
  // Fetch dropdown options
  useEffect(() => {
    if (!allowed) return;

    fetchData();
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
  }, [allowed]);

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
    if (!allowed) {
      message.error("You do not have permission to perform this action");
      return;
    }

    try {
      const values = await form.validateFields();

      const payload = {
        ...values,
        scheduledAt: values.scheduledAt.toISOString(),
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

      message.success("Appointment saved");
      onClose();
    } catch (err: any) {
      console.error(err);
      message.error(err.message || "Failed to save appointment");
    }
  };

  if (!allowed) {
    return (
      <Modal
        title="Unauthorized"
        open={open}
        onCancel={onClose}
        footer={[
          <Button key="close" onClick={onClose}>
            Close
          </Button>,
        ]}
      >
        <p>
          You do not have permission to {editing ? "edit" : "create"}{" "}
          appointments.
        </p>
      </Modal>
    );
  }

  return (
    <Modal
      title={editing ? "Edit Appointment" : "New Appointment"}
      open={open}
      onCancel={onClose}
      footer={null}
    >
      <Form form={form} layout="vertical">
        <Form.Item label="Case No." name="caseId" rules={[{ required: true }]}>
          <Select placeholder="Select case no.">
            {cases?.map((c) => (
              <Select.Option key={c.id} value={c.id}>
                {c.id}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item label="Client" name="clientId" rules={[{ required: true }]}>
          <Select
            placeholder="Select client"
            showSearch
            optionFilterProp="label"
          >
            {clients.map((c) => (
              <Select.Option
                key={c.id}
                value={c.id}
                label={`${c.firstName} ${c.lastName}`}
              >
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
            disabledDate={(current) =>
              current && current < dayjs().startOf("day")
            }
          />
        </Form.Item>

        <Form.Item label="Status" name="status" rules={[{ required: true }]}>
          <Select>
            <Select.Option value="pending">Pending</Select.Option>
            <Select.Option disabled={role == "client"} value="confirmed">
              Confirmed
            </Select.Option>
            <Select.Option disabled={role == "client"} value="completed">
              Completed
            </Select.Option>
            <Select.Option disabled={role == "client"} value="canceled">
              Canceled
            </Select.Option>
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
