"use client";

import React, { useEffect, useState } from "react";
import { Modal, List, Button, App, Avatar } from "antd";
import { useSession } from "next-auth/react";

type Props = {
  caseId: number;
  open: boolean;
  onClose: () => void;
  fetchCases: () => void;
};

export default function LawyerRecommenderModal({
  caseId,
  open,
  onClose,
  fetchCases,
}: Props) {
  const { message } = App.useApp();
  const { data: session, status } = useSession();
  const userId = status === "authenticated" ? (session?.user as any)?.id : null;

  const [lawyers, setLawyers] = useState<any[]>([]);

  useEffect(() => {
    if (open) {
      fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/LawyerRecommendation/recommend/${caseId}/${userId}`,
        {
          credentials: "include",
        }
      )
        .then((r) => r.json())
        .then((j) => setLawyers(j.data.data || []))
        .catch(() => {});
    }
  }, [open, caseId, userId]);

  const handleAssign = async (lawyerId: number) => {
    await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/LawyerRecommendation/assign`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ caseId, lawyerId, userId }),
      }
    );
    message.success("Lawyer assigned successfully");
    onClose();
    fetchCases();
  };

  return (
    <Modal
      title="Recommended Lawyers"
      open={open}
      onCancel={onClose}
      footer={null}
    >
      <List
        dataSource={lawyers}
        renderItem={(lawyer) => (
          <List.Item
            key={lawyer.lawyerId}
            actions={[
              <Button
                type="primary"
                onClick={() => handleAssign(lawyer.lawyerId)}
              >
                Assign
              </Button>,
            ]}
          >
            <List.Item.Meta
              avatar={<Avatar>{lawyer.lawyerId}</Avatar>}
              title={`Lawyer ${lawyer.lawyerName}`}
              description={`Score: ${lawyer.score} | ${lawyer.notes}`}
            />
          </List.Item>
        )}
      />
    </Modal>
  );
}
