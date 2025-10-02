"use client";

import React, { useEffect, useState } from "react";
import { Table, Button, Space, Spin, Tag, App, Select } from "antd";
import { PlusOutlined, EditOutlined } from "@ant-design/icons";
import { useSession } from "next-auth/react";
import { PERMISSIONS, can } from "@/lib/rbac";
import CaseFormModal from "@/components/Cases/CaseFormModal";
import CaseDetailsModal from "@/components/Cases/CaseDetailsModal";
import LawyerRecommenderModal from "@/components/LawyerRecommender/LawyerRecommenderModal";

type CaseRow = {
  id: number;
  title: string;
  description?: string;
  status?: string;
  priority?: string;
  Client?: { id: number; firstName: string; lastName: string };
  AssignedLawyer?: { id: number; name?: string };
  createdAt?: string;
  updatedAt?: string;
};

export default function CasesPage() {
  const { modal, message } = App.useApp();
  const { data: session, status } = useSession();
  const role = (session?.user as any)?.role ?? "client";
  const userId = status === "authenticated" ? (session?.user as any)?.id : null;

  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<CaseRow[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [editing, setEditing] = useState<CaseRow | null>(null);
  const [selectedCase, setSelectedCase] = useState<CaseRow | null>(null);

  const [filter, setFilter] = useState({ status: "", priority: "" });

  const canView = can(role, PERMISSIONS.CASES.VIEW);
  const canCreate = can(role, PERMISSIONS.CASES.CREATE);
  const canUpdate = can(role, PERMISSIONS.CASES.UPDATE);

  const buildSearchQuery = () => {
    const conditions: string[] = [];
    if (filter.status) conditions.push(`status:${filter.status}`);
    if (filter.priority) conditions.push(`priority:${filter.priority}`);
    return conditions.length ? `search=${conditions.join(",")}` : "";
  };

  const fetchCases = async () => {
    if (!canView) return;
    setLoading(true);
    try {
      const searchQuery = buildSearchQuery(); // builds filters like "search=status:active,priority:high"
      let url: string;

      if (role === "lawyer") {
        url = `${process.env.NEXT_PUBLIC_API_BASE_URL}/case?search=assignedLawyerId:${session?.user?.id}`;
        if (searchQuery) {
          url += `,${searchQuery.replace("search=", "")}`;
        }
        url += "&include=Client,assignedLawyer";
      } else if (searchQuery) {
        url = `${process.env.NEXT_PUBLIC_API_BASE_URL}/case?${searchQuery}&include=Client,assignedLawyer`;
      } else {
        url = `${process.env.NEXT_PUBLIC_API_BASE_URL}/case/list`;
      }

      const res = await fetch(url, { credentials: "include" });
      const json = await res.json();
      setItems(json.data.data || json.data || []);
    } catch (err) {
      console.error(err);
      message.error("Failed to load cases");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCases();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter.status, filter.priority]);

  if (!canView) {
    return (
      <div className="p-6">
        <h2 className="text-xl font-bold">Unauthorized</h2>
        <p>You do not have permission to view cases.</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Cases</h1>
        {canCreate && (
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              setEditing(null);
              setModalOpen(true);
            }}
          >
            New Case
          </Button>
        )}
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-4 flex-wrap">
        <Select
          placeholder="Filter by Priority"
          style={{ width: 200 }}
          value={filter.priority || undefined}
          onChange={(value) => setFilter((f) => ({ ...f, priority: value }))}
          options={[
            { label: "Low", value: "low" },
            { label: "Normal", value: "normal" },
            { label: "High", value: "high" },
            { label: "Urgent", value: "urgent" },
          ]}
          allowClear
        />
        <Select
          placeholder="Filter by Status"
          style={{ width: 200 }}
          value={filter.status || undefined}
          onChange={(value) => setFilter((f) => ({ ...f, status: value }))}
          options={[
            { label: "New", value: "new" },
            { label: "Active", value: "active" },
            { label: "In Court", value: "in_court" },
            { label: "Closed", value: "closed" },
            { label: "On-hold", value: "on-hold" },
          ]}
          allowClear
        />
      </div>

      {loading ? (
        <Spin size="large" className="m-8" />
      ) : (
        <Table rowKey="id" dataSource={items} pagination={{ pageSize: 8 }}>
          <Table.Column title="Case no." dataIndex="id" key="id" />
          <Table.Column
            title="Client"
            key="Client"
            render={(_, r: CaseRow) =>
              r.Client ? `${r.Client.firstName} ${r.Client.lastName}` : "-"
            }
          />
          <Table.Column
            title="Lawyer"
            key="assignedLawyer"
            render={(_, r: any) =>
              r.assignedLawyer.name ? `${r.assignedLawyer.name}` : "-"
            }
          />
          <Table.Column
            title="Priority"
            dataIndex="priority"
            key="priority"
            render={(p) => <Tag>{p}</Tag>}
          />
          <Table.Column
            title="Status"
            dataIndex="status"
            key="status"
            render={(s) => (
              <Tag
                color={
                  s === "closed" ? "red" : s === "in_court" ? "orange" : "green"
                }
              >
                {s}
              </Tag>
            )}
          />
          <Table.Column
            title="Created At"
            dataIndex="createdAt"
            key="createdAt"
            render={(s) => new Date(s).toLocaleString()}
          />
          <Table.Column
            title="Updated At"
            dataIndex="updatedAt"
            key="updatedAt"
            render={(s) => new Date(s).toLocaleString()}
          />
          <Table.Column
            title="Actions"
            key="actions"
            render={(_, r: CaseRow) => (
              <Space>
                <Button
                  onClick={() => {
                    setSelectedCase(r);
                    setDetailsOpen(true);
                  }}
                >
                  Open
                </Button>

                {canUpdate && (
                  <>
                    <Button
                      icon={<EditOutlined />}
                      onClick={() => {
                        setEditing(r);
                        setModalOpen(true);
                      }}
                    >
                      Edit
                    </Button>
                    <Button onClick={() => setSelectedCase(r)} type="primary">
                      Recommend Lawyer
                    </Button>
                  </>
                )}
              </Space>
            )}
          />
        </Table>
      )}

      {modalOpen && (
        <CaseFormModal
          visible={modalOpen}
          editing={editing}
          onClose={() => {
            setModalOpen(false);
            setEditing(null);
            fetchCases();
          }}
        />
      )}

      {selectedCase && (
        <LawyerRecommenderModal
          caseId={selectedCase.id}
          open={!!selectedCase}
          onClose={() => setSelectedCase(null)}
          fetchCases={fetchCases}
        />
      )}

      {detailsOpen && selectedCase && (
        <CaseDetailsModal
          visible={detailsOpen}
          caseId={selectedCase.id}
          caseName={selectedCase.title}
          onClose={() => {
            setDetailsOpen(false);
            setSelectedCase(null);
            fetchCases();
          }}
        />
      )}
    </div>
  );
}
