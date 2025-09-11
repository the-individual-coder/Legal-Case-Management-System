"use client";

import React, { useEffect, useState } from "react";
import { Table, Button, Space, Spin, App, Modal, Input, Tag } from "antd";
import { FileSearchOutlined, UploadOutlined } from "@ant-design/icons";
import { useSession } from "next-auth/react";
import DocumentUploadForm from "@/components/Document/DocumentUploadForm";
import OCRPreview from "@/components/Document/OCRPreview";

export default function DocumentsPage() {
  const { modal, message } = App.useApp();
  const { data: session, status } = useSession();
  const userId = status === "authenticated" ? (session?.user as any)?.id : null;

  const [loading, setLoading] = useState(true);
  const [docs, setDocs] = useState<any[]>([]);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<any | null>(null);
  const [reviewing, setReviewing] = useState<any | null>(null);

  const fetchDocs = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/document/list`,
        { credentials: "include" }
      );
      const json = await res.json();
      setDocs(json.data.data || []);
    } catch (err) {
      console.error(err);
      message.error("Failed to load documents");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocs();
  }, []);

  const handleOpen = (d: any) => {
    window.open(d.filePath, "_blank");
  };

  const handleReview = (d: any) => {
    console.log("hanldedd");
    // open modal to input status & notes
    modal.confirm({
      title: `Review document "${d.title}"`,
      content: (
        <div>
          <div className="mb-2">Select status and add notes below.</div>
          <Input.Group compact>
            <select
              id="review-status"
              className="ant-input"
              defaultValue="approved"
              style={{ width: "40%", marginRight: 8 }}
            >
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="changes_requested">Changes requested</option>
            </select>
          </Input.Group>
          <Input.TextArea
            id="review-notes"
            placeholder="Notes (optional)"
            rows={4}
            className="mt-2"
          />
        </div>
      ),
      okText: "Submit review",
      onOk: async () => {
        const statusEl = document.getElementById(
          "review-status"
        ) as HTMLSelectElement;
        const notesEl = document.getElementById(
          "review-notes"
        ) as HTMLTextAreaElement;
        const statusValue = statusEl?.value || "approved";
        const notesValue = notesEl?.value || "";

        try {
          const res = await fetch(
            `${process.env.NEXT_PUBLIC_API_BASE_URL}/document/review/${d.id}/${userId}`,
            {
              method: "POST",
              credentials: "include",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ status: statusValue, notes: notesValue }),
            }
          );
          const json = await res.json();
          message.success("Review recorded");
          fetchDocs();
        } catch (err: any) {
          message.error(err.message || "Failed");
        }
      },
    });
  };

  if (loading) return <Spin className="m-8" size="large" />;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Documents</h1>
        <div className="flex gap-2">
          <Button
            icon={<UploadOutlined />}
            type="primary"
            onClick={() => setUploadOpen(true)}
          >
            Upload
          </Button>
        </div>
      </div>

      <Table dataSource={docs} rowKey="id" pagination={{ pageSize: 10 }}>
        <Table.Column title="Title" dataIndex="title" key="title" />
        <Table.Column
          title="Case"
          dataIndex={["caseId"]}
          key="caseId"
          render={(c) => c ?? "-"}
        />
        <Table.Column
          title="Type"
          dataIndex="type"
          key="type"
          render={(t) => <Tag>{t}</Tag>}
        />
        <Table.Column
          title="Uploaded By"
          dataIndex={["creator", "name"]}
          key="creator"
        />
        <Table.Column
          title="Uploaded At"
          dataIndex="createdAt"
          key="createdAt"
          render={(d) => new Date(d).toLocaleString()}
        />
        <Table.Column
          title="OCR"
          key="ocr"
          render={(_, r: any) =>
            r.ocrText ? (
              <Button
                onClick={() => setSelectedDoc(r)}
                icon={<FileSearchOutlined />}
              >
                View OCR
              </Button>
            ) : (
              <span className="text-xs text-slate-400">—</span>
            )
          }
        />
        <Table.Column
          title="Actions"
          key="actions"
          render={(_, r: any) => (
            <Space>
              <Button onClick={() => handleOpen(r)}>Open</Button>
              <Button onClick={() => handleReview(r)}>Review</Button>
            </Space>
          )}
        />
      </Table>

      {uploadOpen && (
        <DocumentUploadForm
          open={uploadOpen}
          caseId={null}
          onClose={() => {
            setUploadOpen(false);
            fetchDocs();
          }}
          onUploaded={() => fetchDocs()}
        />
      )}

      {selectedDoc && (
        <Modal
          open={!!selectedDoc}
          onCancel={() => setSelectedDoc(null)}
          footer={null}
          destroyOnHidden
          width={800}
        >
          <h3 className="font-semibold mb-3">{selectedDoc.title} — OCR</h3>
          <OCRPreview text={selectedDoc.ocrText} />
        </Modal>
      )}
    </div>
  );
}
