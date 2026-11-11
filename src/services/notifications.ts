import { get, push, ref, set, update } from "firebase/database";

import { db } from "../lib/firebase";

export type NotificationType =
  | "general"
  | "daily_report"
  | "question"
  | "voice_response"
  | "system"
  | "appointment";

export interface NotificationRecord {
  id: string;
  recipientUid: string;
  title: string;
  message: string;
  type: NotificationType | string;
  relatedRecordId?: string | null;
  read: boolean;
  createdAt: number;
  [key: string]: unknown;
}

export async function createNotification(
  recipientUid: string,
  title: string,
  message: string,
  type: NotificationType | string,
  relatedRecordId?: string | null,
  metadata: Record<string, string | number | boolean | null> = {}
) {
  if (!recipientUid || !title.trim() || !message.trim()) {
    return null;
  }

  const notificationRef = push(ref(db, `notifications/${recipientUid}`));
  if (!notificationRef.key) {
    throw new Error("Could not generate a notification record.");
  }

  const notification: NotificationRecord = {
    id: notificationRef.key,
    recipientUid,
    title: title.trim(),
    message: message.trim(),
    type,
    relatedRecordId: relatedRecordId ?? null,
    read: false,
    createdAt: Date.now(),
    ...metadata,
  };

  await set(notificationRef, notification);

  return {
    id: notificationRef.key,
    path: `notifications/${recipientUid}/${notificationRef.key}`,
    value: notification,
  };
}

export async function markNotificationRead(
  recipientUid: string,
  notificationId: string
) {
  if (!recipientUid || !notificationId) {
    return;
  }

  await update(ref(db), {
    [`notifications/${recipientUid}/${notificationId}/read`]: true,
  });
}

export async function getUserNotifications(recipientUid: string) {
  if (!recipientUid) {
    return [] as NotificationRecord[];
  }

  const snapshot = await get(ref(db, `notifications/${recipientUid}`));
  if (!snapshot.exists()) {
    return [] as NotificationRecord[];
  }

  const data = snapshot.val() as Record<string, NotificationRecord>;
  return Object.values(data).sort((a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0));
}
