// src/components/dashboard/RecentActivityFeed.tsx
import React from "react";
import { List, Avatar } from "antd";

type ActivityItem = {
  id: number;
  user: { id: number; name: string; image?: string } | null;
  action: string;
  targetType?: string;
  targetId?: number;
  createdAt: string;
};

export default function RecentActivityFeed({
  items,
}: {
  items: ActivityItem[];
}) {
  return (
    <div className="bg-white rounded-2xl shadow-sm p-4 overflow-y-auto h-[349px]">
      <h3 className="text-lg font-semibold mb-3">Recent Activity</h3>
      <List
        itemLayout="horizontal"
        dataSource={items}
        renderItem={(item: ActivityItem) => (
          <List.Item>
            <List.Item.Meta
              avatar={<Avatar src={item.user?.image} />}
              title={
                <div className="flex gap-2 items-center">
                  <span className="font-medium">
                    {item.user?.name || "System"}
                  </span>{" "}
                  <span className="text-xs text-slate-400">
                    {item.targetType ? `· ${item.targetType}` : ""}
                  </span>
                </div>
              }
              description={
                <div className="text-sm text-slate-600">
                  {item.action}{" "}
                  <span className="text-xs text-slate-400">
                    {" "}
                    · {new Date(item.createdAt).toLocaleString()}
                  </span>
                </div>
              }
            />
          </List.Item>
        )}
      />
    </div>
  );
}
