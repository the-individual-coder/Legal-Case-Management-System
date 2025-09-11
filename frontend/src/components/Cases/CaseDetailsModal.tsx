"use client";

import React, { useEffect, useState } from "react";
import { Modal, Tabs, List, Spin, Button, App } from "antd";
import { useSession } from "next-auth/react";
import { PERMISSIONS, can } from "@/lib/rbac";

const { TabPane } = Tabs;

export default function CaseDetailsModal({
  visible,
  caseId,
  caseName,
  onClose,
}: {
  visible: boolean;
  caseId: number;
  caseName: string;
  onClose: () => void;
}) {
  const { message } = App.useApp();
  const { data: session, status } = useSession();
  const role = (session?.user as any)?.role ?? "client";
  const userId = status === "authenticated" ? (session?.user as any)?.id : null;

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [timeline, setTimeline] = useState<any[]>([]);

  useEffect(() => {
    if (!visible) return;
    fetchDetails();
  }, [visible]);

  const fetchDetails = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/case/get/${caseId}`,
        { credentials: "include" }
      );
      const json = await res.json();

      setData(json.data.data);
      // fetch activity logs for this case
      const logsRes = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/activityLog?search=targetType:Case,targetId:${caseId}`,
        { credentials: "include" }
      );
      const logsJson = await logsRes.json();
      setTimeline(logsJson.data || []);
    } catch (err) {
      console.error(err);
      message.error("Failed to load case details");
    } finally {
      setLoading(false);
    }
  };

  if (!visible) return null;

  return (
    <Modal
      title={`Case - ${caseName} - Details`}
      open={visible}
      onCancel={onClose}
      footer={[
        <Button key="close" onClick={onClose}>
          Close
        </Button>,
      ]}
      width={900}
      destroyOnHidden
    >
      {loading ? (
        <Spin />
      ) : (
        <Tabs defaultActiveKey="1">
          <TabPane tab="Overview" key="1">
            <div className="space-y-2">
              <div>
                <strong>Title:</strong> {data?.title}
              </div>
              <div>
                <strong>Client:</strong>{" "}
                {data?.Client
                  ? `${data.Client.firstName} ${data.Client.lastName}`
                  : "-"}
              </div>
              <div>
                <strong>Assigned Lawyer:</strong>{" "}
                {data?.assignedLawyer?.name ?? "-"}
              </div>
              <div>
                <strong>Status:</strong> {data?.status}
              </div>
              <div>
                <strong>Priority:</strong> {data?.priority}
              </div>
              <div>
                <strong>Description:</strong>
                <div className="p-2 bg-white border rounded">
                  {data?.description || "-"}
                </div>
              </div>
            </div>
          </TabPane>

          <TabPane tab="Engagements" key="2">
            <List
              dataSource={data?.engagement || []}
              renderItem={(e: any) => (
                <List.Item>
                  <div>
                    <div className="font-medium">Engagement #{e.id}</div>
                    <div className="text-sm text-slate-500">
                      Status: {e.status} —{" "}
                      {e.startDate
                        ? new Date(e.startDate).toLocaleDateString()
                        : "-"}
                    </div>
                  </div>
                </List.Item>
              )}
            />
          </TabPane>

          <TabPane tab="Timeline" key="3">
            <List
              dataSource={timeline}
              renderItem={(t: any) => (
                <List.Item>
                  <div>
                    <div className="text-sm text-slate-700">
                      {t.action} —{" "}
                      <span className="text-xs text-slate-400">
                        {new Date(t.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <div className="text-sm text-slate-500">{t.details}</div>
                  </div>
                </List.Item>
              )}
            />
          </TabPane>
        </Tabs>
      )}
    </Modal>
  );
}
