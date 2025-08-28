// src/app/clients/new/page.tsx
"use client"
import ClientFormModal from "@/components/ClientFormModal";
import { Card, Breadcrumb, Typography, Button } from "antd";
import { useState } from "react";
import AuthGuard from "@/components/AuthGuard";

export default function NewClientPage() {
  // server component => We'll render an inner client component for interactivity
  return (
    <AuthGuardWrapper />
  );
}

function AuthGuardWrapper() {
  // client-side wrapper for page interaction & RBAC
  const [open, setOpen] = useState(false);
  return (
    <AuthGuard requiredRoles={["admin","staff"]}>
      <div className="max-w-6xl mx-auto">
        <Breadcrumb items={[{ title: "Clients" }, { title: "New" }]} />
        <div className="flex items-center justify-between my-4">
          <Typography.Title level={4}>New Client</Typography.Title>
          <Button type="primary" onClick={() => setOpen(true)}>Add Client</Button>
        </div>
        <Card>
          <p className="text-gray-600">Use the form to create a new client profile. This is a placeholder area for client intake steps and details.</p>
        </Card>
        <ClientFormModal visible={open} onClose={() => setOpen(false)} />
      </div>
    </AuthGuard>
  );
}
