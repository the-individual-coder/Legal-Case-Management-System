// src/app/appointments/new/page.tsx
"use client";
import AuthGuard from "@/components/AuthGuard";
import { Breadcrumb, Typography, Card, Button } from "antd";
import AppointmentFormModal from "@/components/AppointmentFormModal";
import { useState } from "react";

export default function NewAppointmentPage() {
  return <ClientWrapper />;
}

function ClientWrapper() {
  const [open, setOpen] = useState(false);
  return (
    <AuthGuard requiredRoles={["admin","staff","client"]}>
      <div className="max-w-4xl mx-auto">
        <Breadcrumb items={[{ title: "Appointments" }, { title: "New" }]} />
        <div className="flex items-center justify-between my-4">
          <Typography.Title level={4}>New Appointment</Typography.Title>
          <Button type="primary" onClick={() => setOpen(true)}>New</Button>
        </div>
        <Card>
          <p className="text-gray-600">Schedule a new appointment.</p>
        </Card>
        <AppointmentFormModal visible={open} onClose={() => setOpen(false)} />
      </div>
    </AuthGuard>
  );
}
