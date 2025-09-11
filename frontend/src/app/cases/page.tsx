"use client";

import React, { useEffect, useState } from "react";
import { Table, Button, Space, Spin, Tag, App } from "antd";
import {
  PlusOutlined,
  EditOutlined,
  UsergroupAddOutlined,
} from "@ant-design/icons";
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

  const canView = can(role, PERMISSIONS.CASES.VIEW);
  const canCreate = can(role, PERMISSIONS.CASES.CREATE);
  const canUpdate = can(role, PERMISSIONS.CASES.UPDATE);

  const fetchCases = async () => {
    if (!canView) return;
    setLoading(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/case/list`,
        { credentials: "include" }
      );
      const json = await res.json();
      setItems(json.data.data || []);
    } catch (err) {
      console.error(err);
      message.error("Failed to load cases");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCases();
  }, []);

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

      {loading ? (
        <Spin size="large" className="m-8" />
      ) : (
        <Table rowKey="id" dataSource={items} pagination={{ pageSize: 8 }}>
          <Table.Column title="Title" dataIndex="title" key="title" />
          <Table.Column
            title="Client"
            key="Client"
            render={(_, r: CaseRow) =>
              r.Client ? `${r.Client.firstName} ${r.Client.lastName}` : "-"
            }
          />
          <Table.Column
            title="Lawyer"
            dataIndex={["assignedLawyer", "name"]}
            key="lawyer"
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
            title="Actions"
            key="actions"
            render={(_, r: CaseRow) => (
              <Space>
                <Button
                  onClick={async () => {
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
                    <Button
                      icon={<UsergroupAddOutlined />}
                      onClick={() => {
                        // quick assign flow (open assign modal)
                        modal.confirm({
                          title: "Assign lawyer",
                          content:
                            "This will open the edit case modal where you can assign a lawyer.",
                          onOk() {
                            setEditing(r);
                            setModalOpen(true);
                          },
                        });
                      }}
                    >
                      Assign
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
