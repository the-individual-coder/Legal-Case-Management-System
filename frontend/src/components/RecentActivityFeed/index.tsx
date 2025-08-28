// src/components/RecentActivityFeed.tsx
"use client";
import { List, Avatar } from "antd";

const data = [
  { title: "Document uploaded", desc: "Client: Acme Corp", time: "2h ago" },
  { title: "Appointment scheduled", desc: "With: John Doe", time: "4h ago" },
];

export default function RecentActivityFeed() {
  return (
    <List
      itemLayout="horizontal"
      dataSource={data}
      renderItem={(item) => (
        <List.Item>
          <List.Item.Meta
            avatar={<Avatar />}
            title={item.title}
            description={`${item.desc} · ${item.time}`}
          />
        </List.Item>
      )}
    />
  );
}
