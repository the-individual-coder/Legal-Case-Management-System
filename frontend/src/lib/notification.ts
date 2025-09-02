// src/lib/notification.ts
import { notification } from "antd";

export function notifySuccess(message: string, description?: string) {
  notification.success({ message, description });
}

export function notifyError(message: string, description?: string) {
  notification.error({ message, description });
}
