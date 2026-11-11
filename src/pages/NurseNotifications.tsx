import {
  AlertCircle,
  Bell,
  CheckCircle2,
  Circle,
  Clock3,
  ClipboardList,
  MessageCircleQuestion,
} from "lucide-react";
import { useEffect, useState } from "react";
import { onValue, ref } from "firebase/database";

import { useAuth } from "../context/AuthContext";
import { db } from "../lib/firebase";
import { markNotificationRead } from "../services/notifications";

import "../role-dashboards.css";

type NotificationItem = {
  id: string;
  title: string;
  message: string;
  type: string;
  read?: boolean;
  createdAt?: number;
};

export default function NurseNotifications() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.uid) {
      setNotifications([]);
      setLoading(false);
      return;
    }

    const notificationsRef = ref(db, `notifications/${user.uid}`);
    const unsubscribe = onValue(
      notificationsRef,
      (snapshot) => {
        if (!snapshot.exists()) {
          setNotifications([]);
          setLoading(false);
          return;
        }

        const nextNotifications = Object.entries(snapshot.val() ?? {})
          .map(([id, value]) => {
            const payload = value as Record<string, unknown>;
            return {
              id,
              title: String(payload.title ?? "CareTrack Update"),
              message: String(payload.message ?? "A CareTrack update is available."),
              type: String(payload.type ?? "general"),
              read: Boolean(payload.read),
              createdAt: Number(payload.createdAt ?? 0),
            };
          })
          .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));

        setNotifications(nextNotifications);
        setLoading(false);
      },
      (error) => {
        console.error("Failed to load nurse notifications:", error);
        setNotifications([]);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user?.uid]);

  const unreadCount = notifications.filter((notification) => !notification.read).length;

  const markAsRead = async (notificationId: string) => {
    if (!user?.uid) return;
    await markNotificationRead(user.uid, notificationId);
  };

  const markAllAsRead = async () => {
    if (!user?.uid) return;
    await Promise.all(
      notifications
        .filter((notification) => !notification.read)
        .map((notification) => markNotificationRead(user.uid, notification.id))
    );
  };

  const getIcon = (type: string) => {
    if (type === "report" || type === "daily_report") return <ClipboardList size={19} />;
    if (type === "question") return <MessageCircleQuestion size={19} />;
    if (type === "attention") return <AlertCircle size={19} />;
    return <Bell size={19} />;
  };

  return (
    <div className="role-dashboard">
      <div className="role-dashboard-header">
        <div>
          <p className="role-eyebrow">CARETRACK UPDATES</p>
          <h1>Notifications</h1>
          <p>Stay updated about patient reports, questions and monitoring activities.</p>
        </div>

        {unreadCount > 0 && (
          <button
            type="button"
            onClick={markAllAsRead}
            className="role-primary-button"
            style={{ border: "none", cursor: "pointer" }}
          >
            <CheckCircle2 size={17} />
            Mark All as Read
          </button>
        )}
      </div>

      <div className="role-stat-grid">
        <div className="role-stat-card">
          <div className="role-stat-icon">
            <Bell size={21} />
          </div>
          <div>
            <span>Total Notifications</span>
            <strong>{notifications.length}</strong>
            <small>Recent CareTrack updates</small>
          </div>
        </div>

        <div className="role-stat-card">
          <div className="role-stat-icon">
            <AlertCircle size={21} />
          </div>
          <div>
            <span>Unread</span>
            <strong>{unreadCount}</strong>
            <small>Require your attention</small>
          </div>
        </div>

        <div className="role-stat-card">
          <div className="role-stat-icon">
            <ClipboardList size={21} />
          </div>
          <div>
            <span>Patient Reports</span>
            <strong>{notifications.filter((notification) => notification.type.includes("report") || notification.type.includes("daily")).length}</strong>
            <small>Recent report updates</small>
          </div>
        </div>

        <div className="role-stat-card">
          <div className="role-stat-icon">
            <CheckCircle2 size={21} />
          </div>
          <div>
            <span>System Status</span>
            <strong>OK</strong>
            <small>CareTrack is online</small>
          </div>
        </div>
      </div>

      <section className="role-card">
        <div className="role-card-header">
          <div>
            <h2>Recent Notifications</h2>
            <p>Your latest CareTrack updates</p>
          </div>
          <Bell size={21} color="#006ee6" />
        </div>

        {loading ? (
          <div className="role-list-empty">Loading notifications...</div>
        ) : notifications.length === 0 ? (
          <div className="role-list-empty">
            <Bell size={24} />
            <h3>No notifications</h3>
            <p>You are all caught up. New updates will appear here once they are created.</p>
          </div>
        ) : (
          <div className="role-list">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`role-list-item ${notification.read ? "" : "unread"}`}
                onClick={() => markAsRead(notification.id)}
                style={{ cursor: "pointer" }}
              >
                <div className="role-list-icon">{getIcon(notification.type)}</div>

                <div className="role-list-content">
                  <div className="role-list-header-row">
                    <strong>{notification.title}</strong>
                    {!notification.read && (
                      <span className="role-pill success">
                        <Circle size={8} fill="currentColor" />
                        New
                      </span>
                    )}
                  </div>

                  <p>{notification.message}</p>

                  <div className="role-meta-row">
                    <Clock3 size={13} />
                    <span>{notification.createdAt ? new Date(notification.createdAt).toLocaleString() : "Recently"}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}