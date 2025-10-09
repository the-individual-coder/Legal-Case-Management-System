"use client";
import React, { useEffect, useState } from "react";
import {
  Calendar as AntCalendar,
  Button,
  Modal,
  Spin,
  App,
  List,
  Tag,
  Space,
} from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import { useSession } from "next-auth/react";
import { PERMISSIONS, can } from "@/lib/rbac";
import CalendarEventFormModal from "@/components/Calendar/CalendarEventFormModal";

type EventItem = {
  id: number;
  title: string;
  description?: string;
  startTime: string;
  endTime?: string;
  Case?: { id: number; title: string };
  creator?: { id: number; name: string };
};

export default function CalendarPage() {
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState<EventItem[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<EventItem | null>(null);
  const [selectedDate, setSelectedDate] = useState<dayjs.Dayjs>(dayjs()); // New state for the selected date
  const { data, status } = useSession();
  const userId = status === "authenticated" ? (data?.user as any)?.id : null;
  const role = (data?.user as any)?.role ?? "client";
  const { message, modal } = App.useApp();

  const canView = can(role, PERMISSIONS.CALENDAR.VIEW);
  const canCreate = can(role, PERMISSIONS.CALENDAR.CREATE);
  const canUpdate = can(role, PERMISSIONS.CALENDAR.UPDATE);
  const canDelete = can(role, PERMISSIONS.CALENDAR.DELETE);

  const fetchEvents = async (from?: string, to?: string) => {
    if (!canView) return;
    setLoading(true);
    try {
      const qs =
        from && to
          ? `?startDate=${encodeURIComponent(
              from
            )}&endDate=${encodeURIComponent(to)}`
          : "";
      if (["admin", "staff", "reviewer", "lawyer"].includes(role)) {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/CalendarEvent/getEvents${qs}`,
          { credentials: "include" }
        );
        const json = await res.json();
        setEvents(json.data.data || []);
      } else {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/CalendarEvent/getEventsByIdWithParams/${userId}${qs}`,
          { credentials: "include" }
        );
        const json = await res.json();
        setEvents(json.data.data || []);
      }
    } catch (err) {
      console.error(err);
      message.error("Failed to load events");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // load events for the default month (current month)
    const start = new Date();
    const end = new Date();
    end.setMonth(end.getMonth() + 1);
    fetchEvents(start.toISOString(), end.toISOString());
  }, []);

  const handleDelete = async (id: number) => {
    if (!canDelete)
      return message.error("You do not have permission to delete events.");
    modal.confirm({
      title: "Delete event?",
      onOk: async () => {
        try {
          const res = await fetch(
            `${process.env.NEXT_PUBLIC_API_BASE_URL}/CalendarEvent/deleteEvent/${id}/${userId}`,
            { method: "DELETE", credentials: "include" }
          );
          await res.json();
          message.success("Deleted");
          fetchEvents();
        } catch (err: any) {
          console.error(err);
          message.error(err.message || "Delete failed");
        }
      },
    });
  };

  const cellRender = (value: dayjs.Dayjs) => {
    const day = value.startOf("day"); // Start of the day (midnight)
    const items = events.filter((e) => {
      const eventStart = dayjs(e.startTime).startOf("day");
      return eventStart.isSame(day, "day");
    });
    return (
      <div className="p-1 bg-gray-50 rounded">
        <List
          size="small"
          dataSource={items}
          renderItem={(item) => (
            <List.Item style={{ padding: 4 }}>
              <div className="w-full">
                <div className="flex justify-between items-center">
                  <div>
                    <strong>{item.title}</strong>
                    <div className="text-xs text-gray-500">
                      {item.Case ? item.Case.title : "No Case"}
                    </div>
                  </div>
                  <div>
                    <Space>
                      {canUpdate && (
                        <Button
                          size="small"
                          icon={<EditOutlined />}
                          onClick={() => {
                            setEditing(item);
                            setModalOpen(true);
                          }}
                        />
                      )}
                      {canDelete && (
                        <Button
                          size="small"
                          icon={<DeleteOutlined />}
                          danger
                          onClick={() => handleDelete(item.id)}
                        />
                      )}
                    </Space>
                  </div>
                </div>
              </div>
            </List.Item>
          )}
        />
      </div>
    );
  };

  const handleMonthChange = (date: dayjs.Dayjs) => {
    setSelectedDate(date); // Update the selected date when the month changes
    const start = date.startOf("month").toISOString();
    const end = date.endOf("month").toISOString();
    console.log("Fetching events for:", start, end);
    fetchEvents(start, end);
  };

  if (!canView) {
    return (
      <div className="p-6">
        <h1 className="text-xl font-bold">Unauthorized</h1>
        <p>You do not have permission to view the calendar.</p>
      </div>
    );
  }

  if (loading) return <Spin size="large" className="m-8" />;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Calendar</h1>
        {canCreate && (
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              setEditing(null);
              setModalOpen(true);
            }}
          >
            New Event
          </Button>
        )}
      </div>

      <AntCalendar
        value={selectedDate} // Set the calendar's value to the selected date
        cellRender={cellRender}
        onChange={handleMonthChange} // Handle month change
      />

      {modalOpen && (
        <CalendarEventFormModal
          open={modalOpen}
          onClose={() => {
            setModalOpen(false);
            fetchEvents();
          }}
          editing={editing}
          userId={userId}
        />
      )}
    </div>
  );
}
