import { useEffect, useState } from "react";
import { Bell, CheckCircle2, Circle, Clock3 } from "lucide-react";
import { onValue, ref } from "firebase/database";

import { useAuth } from "../../context/AuthContext";
import { db } from "../../lib/firebase";
import { markNotificationRead } from "../../services/notifications";

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: string;
  read?: boolean;
  createdAt?: number;
}

export default function DoctorNotifications() {
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
        console.error("Failed to load doctor notifications:", error);
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
    <div className="patient-dashboard">
      <section className="patient-welcome">
        <div className="patient-welcome-text">
          <p className="dashboard-eyebrow">DOCTOR / ALERTS</p>
          <h1>Notifications</h1>
          <p>View real CareTrack updates and patient alerts.</p>
        </div>
      </section>

      <section className="patient-card">
        <div className="patient-card-header">
          <div>
            <p className="card-kicker">UPDATES</p>
            <h2>Recent Notifications</h2>
            <p>Unread alerts: {unreadCount}</p>
          </div>
          <div className="quick-action-icon">
            <Bell size={21} />
          </div>
        </div>

        {loading ? (
          <div style={{ padding: "35px", textAlign: "center", color: "#718096" }}>Loading notifications...</div>
        ) : notifications.length === 0 ? (
          <div style={{ padding: "40px 20px", textAlign: "center", background: "#f8fafc", borderRadius: "12px", color: "#718096" }}>
            <Bell size={34} style={{ marginBottom: "10px" }} />
            <h3 style={{ margin: "0 0 6px", color: "#34495e" }}>No notifications</h3>
            <p style={{ margin: 0 }}>No alerts are currently available for this account.</p>
          </div>
        ) : (
          <div style={{ display: "grid", gap: "12px" }}>
            {notifications.map((notification) => (
              <div
                key={notification.id}
                onClick={() => handleMarkRead(notification.id)}
                style={{
                  padding: "17px",
                  border: "1px solid #e5eaf0",
                  borderRadius: "12px",
                  background: notification.read ? "#ffffff" : "#f8fbff",
                  cursor: "pointer",
                }}
              >
                <div style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
                  <div style={{ width: "40px", height: "40px", flexShrink: 0, borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", background: "#eef5ff" }}>
                    <Bell size={19} />
                  </div>

                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", gap: "10px", flexWrap: "wrap" }}>
                      <div>
                        <div style={{ fontSize: "11px", textTransform: "uppercase", color: "#718096", fontWeight: 700, marginBottom: "4px" }}>
                          {notification.type.replace("_", " ")}
                        </div>
                        <strong style={{ fontSize: "16px", color: "#243447" }}>{notification.title}</strong>
                      </div>

                      {!notification.read && (
                        <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", color: "#006ee6", fontWeight: 700, fontSize: "11px" }}>
                          <Circle size={8} fill="currentColor" />
                          New
                        </span>
                      )}
                    </div>

                    <p style={{ margin: "10px 0 8px", color: "#4a5d72", lineHeight: 1.6 }}>{notification.message}</p>

                    <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "#718096", fontSize: "12px" }}>
                      <Clock3 size={13} />
                      <span>{notification.createdAt ? new Date(notification.createdAt).toLocaleString() : "Recently"}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div style={{ marginTop: "16px", display: "flex", alignItems: "center", gap: "8px", color: "#2c7a7b", fontSize: "13px" }}>
          <CheckCircle2 size={15} />
          <span>Notifications are saved directly in Firebase and remain available after refresh.</span>
        </div>
      </section>
    </div>
  );
}

