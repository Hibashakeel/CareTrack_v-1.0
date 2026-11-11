
import { useEffect, useState } from "react";
import { Bell, Check, CheckCircle2, Circle, Clock3 } from "lucide-react";
import { onValue, ref } from "firebase/database";

import { useAuth } from "../context/AuthContext";
import { db } from "../lib/firebase";
import { markNotificationRead } from "../services/notifications";

import "../patient-pages.css";

type NotificationItem = {
  id: string;
  title: string;
  message: string;
  type: string;
  read?: boolean;
  createdAt?: number;
};

export default function PatientNotifications() {
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
        console.error("Failed to load patient notifications:", error);
        setNotifications([]);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user?.uid]);

  const unreadCount = notifications.filter((notification) => !notification.read).length;

  const handleMarkRead = async (notificationId: string) => {
    if (!user?.uid) return;
    await markNotificationRead(user.uid, notificationId);
  };

  return (
    <div className="patient-page patient-notifications-page">
      <div className="patient-page-heading notifications-page-heading">
        <div>
          <span className="notifications-eyebrow">CARE UPDATES</span>
          <h1>Notifications</h1>
          <p>Updates from your care team and your CareTrack account appear here.</p>
        </div>

        <div className="notifications-header-stat">
          <div className="notifications-header-icon">
            <Bell size={18} />
          </div>
          <div>
            <strong>{unreadCount}</strong>
            <span>Unread updates</span>
          </div>
        </div>
      </div>

      <div className="notifications-panel">
        <div className="notifications-panel-header">
          <div className="notifications-panel-title">
            <div className="notifications-panel-icon">
              <Bell size={19} />
            </div>
            <div>
              <h2>Recent Notifications</h2>
              <p>Your current CareTrack updates and alerts</p>
            </div>
          </div>

          <div className="notifications-status">
            <span className="notifications-status-dot" />
            Live updates
          </div>
        </div>

        <div className="notifications-list">
          {loading ? (
            <div className="notifications-empty">
              <h3>Loading notifications...</h3>
            </div>
          ) : notifications.length > 0 ? (
            notifications.map((notification) => (
              <div
                key={notification.id}
                className={`notification-card ${notification.read ? "" : "notification-card-unread"}`}
                onClick={() => handleMarkRead(notification.id)}
                style={{ cursor: "pointer" }}
              >
                <div className="notification-type-icon notification-type-general">
                  <Bell size={19} />
                </div>

                <div className="notification-main">
                  <div className="notification-top-row">
                    <div className="notification-title-group">
                      <span className="notification-type-label notification-label-general">
                        {notification.type.replace("_", " ")}
                      </span>
                      <h3>{notification.title}</h3>
                    </div>

                    {!notification.read && (
                      <span className="notification-unread">
                        <Circle size={8} fill="currentColor" />
                        New
                      </span>
                    )}
                  </div>

                  <p>{notification.message}</p>

                  <div className="notification-time">
                    <Clock3 size={13} />
                    <span>
                      {notification.createdAt ? new Date(notification.createdAt).toLocaleString() : "Recently"}
                    </span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="notifications-empty">
              <div className="notifications-empty-icon">
                <Bell size={24} />
              </div>
              <h3>No notifications</h3>
              <p>You are all caught up. New updates will appear here once they are created.</p>
            </div>
          )}
        </div>

        <div className="notifications-panel-footer">
          <CheckCircle2 size={15} />
          <span>Important updates and care actions are stored in the Firebase notifications collection.</span>
        </div>
      </div>
    </div>
  );
}

