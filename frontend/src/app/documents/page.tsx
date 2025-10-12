"use client";

import React, { useEffect, useState } from "react";
import {
  Table,
  Button,
  Space,
  Spin,
  App,
  Modal,
  Input,
  Tag,
  Select,
} from "antd";
import { FileSearchOutlined, UploadOutlined } from "@ant-design/icons";
import { useSession } from "next-auth/react";
import DocumentUploadForm from "@/components/Document/DocumentUploadForm";
import OCRPreview from "@/components/Document/OCRPreview";

export default function DocumentsPage() {
  const { modal, message } = App.useApp();
  const { data: session, status } = useSession();
  const userId = status === "authenticated" ? (session?.user as any)?.id : null;
  const role = (session?.user as any)?.role ?? "client";
  const [loading, setLoading] = useState(true);
  const [docs, setDocs] = useState<any[]>([]);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<any | null>(null);
  const [filter, setFilter] = useState({ type: "", status: "" });

  const fetchDocs = async () => {
    setLoading(true);
    try {
      const conditions: string[] = [];
      if (filter.type) conditions.push(`type:${filter.type}`);
      if (filter.status) conditions.push(`status:${filter.status}`);
      const searchQuery = conditions.length
        ? `search=${conditions.join(",")}`
        : "";

      let url: string;
      if (role !== "staff" && role !== "admin" && role !== "reviewer") {
        url = `${
          process.env.NEXT_PUBLIC_API_BASE_URL
        }/document?search=createdBy:${session?.user?.id}${
          searchQuery
            ? "," + searchQuery.replace("search=", "").replace("&", "")
            : ""
        }&include=creator`;
      } else if (searchQuery) {
        url = `${process.env.NEXT_PUBLIC_API_BASE_URL}/document?${searchQuery}&include=creator`;
      } else {
        url = `${process.env.NEXT_PUBLIC_API_BASE_URL}/document/list`;
      }

      const res = await fetch(url, { credentials: "include" });
      const json = await res.json();
      setDocs(json.data.data || json.data);
    } catch (err) {
      console.error(err);
      message.error("Failed to load documents");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter.type, filter.status]);

  const handleOpen = (d: any) => {
    if (!d.filePath) return;

    const fileUrl = d.filePath;
    const ext = fileUrl.split(".").pop()?.toLowerCase();

    const imageTypes = ["jpg", "jpeg", "png", "gif", "webp"];
    const docTypes = ["pdf", "doc", "docx", "xls", "xlsx", "ppt", "pptx"];

    let viewUrl = fileUrl;

    if (docTypes.includes(ext || "")) {
      // Google Docs Viewer for PDFs and Office docs
      viewUrl = `https://docs.google.com/gview?url=${encodeURIComponent(
        fileUrl
      )}&embedded=true`;
    } else if (imageTypes.includes(ext || "")) {
      // Open image directly
      viewUrl = fileUrl;
    }

    // Open in a new tab without triggering download
    window.open(viewUrl, "_blank", "noopener,noreferrer");
  };

  const handleReview = (d: any) => {
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
          await res.json();
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

      {/* Filters */}
      <div className="flex gap-2 mb-4 flex-wrap">
        <Select
          placeholder="Filter by Type"
          style={{ width: 200 }}
          value={filter.type || undefined}
          onChange={(value) => setFilter((f) => ({ ...f, type: value }))}
          options={[
            { label: "Evidence", value: "evidence" },
            { label: "Contract", value: "contract" },
            { label: "Payment proof", value: "payment_proof" },
            { label: "Other", value: "other" },
          ]}
          allowClear
        />
        <Select
          placeholder="Filter by Status"
          style={{ width: 200 }}
          value={filter.status || undefined}
          onChange={(value) => setFilter((f) => ({ ...f, status: value }))}
          options={[
            { label: "Approved", value: "approved" },
            { label: "Rejected", value: "rejected" },
            { label: "Pending", value: "pending" },
            { label: "Changes Requested", value: "changes_requested" },
          ]}
          allowClear
        />
      </div>

      <Table dataSource={docs} rowKey="id" pagination={{ pageSize: 10 }}>
        <Table.Column title="Title" dataIndex="title" key="title" />
        <Table.Column
          title="Case No."
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
          title="Status"
          dataIndex="status"
          key="status"
          render={(status: string) => {
            let color = "default";
            switch (status) {
              case "approved":
                color = "green";
                break;
              case "rejected":
                color = "red";
                break;
              case "pending":
              case "changes_requested":
                color = "orange";
                break;
              default:
                color = "blue";
            }
            return (
              <Tag color={color}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </Tag>
            );
          }}
        />
        <Table.Column
          title="Review Notes"
          dataIndex="reviewNotes"
          key="reviewNotes"
          render={(notes: string) =>
            notes ? (
              <Tag
                color="purple"
                style={{ whiteSpace: "normal", maxWidth: 200 }}
              >
                {notes}
              </Tag>
            ) : (
              <span style={{ color: "#999" }}>—</span>
            )
          }
        />
        <Table.Column
          title="Description"
          dataIndex="content"
          key="content"
          render={(t) => t}
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
          title="Download"
          key="download"
          render={(_, r: any) => {
            const handleDownload = async () => {
              try {
                const response = await fetch(r.filePath);
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = r.title || "document";
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);
              } catch (err) {
                message.error("Download failed");
              }
            };
            return (
              <Button type="link" onClick={handleDownload}>
                Download
              </Button>
            );
          }}
        />
        <Table.Column
          title="Actions"
          key="actions"
          render={(_, r: any) => (
            <Space>
              <Button onClick={() => handleOpen(r)}>Open</Button>
              {!["client"].includes(role) && (
                <Button onClick={() => handleReview(r)}>Review</Button>
              )}
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
