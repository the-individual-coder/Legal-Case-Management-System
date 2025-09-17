"use client";

import React, { useEffect, useState } from "react";
import { Table, Button, Space, Spin, App } from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import NoteFormModal from "@/components/Notes/NoteFormModal";
import { useSession } from "next-auth/react";
import { PERMISSIONS, can } from "@/lib/rbac";

type NoteItem = {
  id: number;
  content: string;
  createdAt: string;
  Case?: { id: number; title: string };
  author?: { id: number; name: string; image?: string };
};

export default function NotesPage() {
  const [loading, setLoading] = useState(true);
  const [notes, setNotes] = useState<NoteItem[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<NoteItem | null>(null);

  const { data, status } = useSession();
  const userId = status === "authenticated" ? (data?.user as any)?.id : null;
  const role = (data?.user as any)?.role ?? "client";
  const { modal, message } = App.useApp();

  const canView = can(role, PERMISSIONS.NOTES.VIEW);
  const canCreate = can(role, PERMISSIONS.NOTES.CREATE);
  const canUpdate = can(role, PERMISSIONS.NOTES.UPDATE);
  const canDelete = can(role, PERMISSIONS.NOTES.DELETE);

  const fetchNotes = async () => {
    if (!canView) return;
    setLoading(true);
    try {
      if (["admin", "staff", "reviewer"].includes(role)) {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/note/getNotes`,
          {
            credentials: "include",
          }
        );
        const json = await res.json();
        // If your API wraps with { data: ... } like appointments, adapt accordingly
        const dataPayload = json.data.data || json;
        setNotes(Array.isArray(dataPayload) ? dataPayload : []);
      } else {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/note?search=authorId:${userId}&include=Case,author`
        );
        const json = await res.json();
        // If your API wraps with { data: ... } like appointments, adapt accordingly
        const dataPayload = json.data || json;
        setNotes(Array.isArray(dataPayload) ? dataPayload : []);
      }
    } catch (err) {
      console.error(err);
      message.error("Failed to load notes");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, []);

  const handleDelete = async (id: number) => {
    if (!canDelete) {
      message.error("You do not have permission to delete notes.");
      return;
    }

    modal.confirm({
      title: "Delete note?",
      onOk: async () => {
        try {
          const res = await fetch(
            `${process.env.NEXT_PUBLIC_API_BASE_URL}/note/deleteNote/${id}/${userId}`,
            { method: "DELETE", credentials: "include" }
          );
          await res.json();
          message.success("Deleted");
          fetchNotes();
        } catch (err: any) {
          console.error(err);
          message.error(err.message || "Delete failed");
        }
      },
    });
  };

  const columns = [
    { title: "Case", dataIndex: ["Case", "title"], key: "Case" },
    {
      title: "Author",
      dataIndex: ["author", "name"],
      key: "author",
    },
    {
      title: "Content",
      dataIndex: "content",
      render: (c: string) => (
        <div style={{ maxWidth: 500, whiteSpace: "pre-wrap" }}>{c}</div>
      ),
    },
    {
      title: "Created At",
      dataIndex: "createdAt",
      render: (d: string) => new Date(d).toLocaleString(),
    },
    {
      title: "Action",
      key: "action",
      render: (r: NoteItem) =>
        (canUpdate || canDelete) && (
          <Space>
            {canUpdate && (
              <Button
                icon={<EditOutlined />}
                onClick={() => {
                  setEditing(r);
                  setModalOpen(true);
                }}
              >
                Edit
              </Button>
            )}
            {canDelete && (
              <Button
                icon={<DeleteOutlined />}
                danger
                onClick={() => handleDelete(r.id)}
              >
                Delete
              </Button>
            )}
          </Space>
        ),
    },
  ];

  if (!canView) {
    return (
      <div className="p-6">
        <h1 className="text-xl font-bold">Unauthorized</h1>
        <p>You do not have permission to view notes.</p>
      </div>
    );
  }

  if (loading) return <Spin size="large" className="m-8" />;

  return (
    <div className="p-6">
      <div className="flex justify-between mb-4">
        <h1 className="text-2xl font-bold">Notes</h1>
        {canCreate && (
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              setEditing(null);
              setModalOpen(true);
            }}
          >
            New Note
          </Button>
        )}
      </div>

      <Table rowKey="id" columns={columns} dataSource={notes} />

      {modalOpen && (
        <NoteFormModal
          open={modalOpen}
          onClose={() => {
            setModalOpen(false);
            fetchNotes();
          }}
          editing={editing}
          userId={userId}
        />
      )}
    </div>
  );
}
