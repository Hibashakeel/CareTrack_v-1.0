import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Bell,
  Clock,
} from "lucide-react";

import { get, ref } from "firebase/database";

import { useAuth } from "../../context/AuthContext";
import { db } from "../../lib/firebase";

interface NotificationItem {
  id: string;
  title?: string;
  message?: string;
  text?: string;
  type?: string;
  createdAt?: string;
  read?: boolean;
}

export default function DoctorNotifications() {
  const { user } = useAuth();

  const [notifications, setNotifications] =
    useState<NotificationItem[]>([]);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadNotifications() {
      if (!user?.uid) {
        setLoading(false);
        return;
      }

      try {
        const snapshot = await get(
          ref(db, `notifications/${user.uid}`)
        );

        if (!snapshot.exists()) {
          setNotifications([]);
          return;
        }

        const data = snapshot.val();

        const list: NotificationItem[] =
          Object.entries(data).map(
            ([id, value]) => ({
              id,
              ...(value as Omit<
                NotificationItem,
                "id"
              >),
            })
          );

        list.sort((a, b) => {
          const timeA = a.createdAt
            ? new Date(a.createdAt).getTime()
            : 0;

          const timeB = b.createdAt
            ? new Date(b.createdAt).getTime()
            : 0;

          return timeB - timeA;
        });

        setNotifications(list);
      } catch (error) {
        console.error(
          "Unable to load doctor notifications:",
          error
        );
      } finally {
        setLoading(false);
      }
    }

    loadNotifications();
  }, [user?.uid]);

  return (
    <div className="patient-dashboard">

      <section className="patient-welcome">

        <div className="patient-welcome-text">

          <p className="dashboard-eyebrow">
            DOCTOR / ALERTS
          </p>

          <h1>
            Notifications
          </h1>

          <p>
            View notifications and care-related
            updates.
          </p>

        </div>

        <Link
          to="/doctor/dashboard"
          className="patient-secondary-button"
        >
          <ArrowLeft size={17} />
          Dashboard
        </Link>

      </section>


      <section className="patient-card">

        <div className="patient-card-header">

          <div>

            <p className="card-kicker">
              UPDATES
            </p>

            <h2>
              Recent Notifications
            </h2>

            <p>
              Important updates related to your
              doctor account.
            </p>

          </div>

          <div className="quick-action-icon">
            <Bell size={21} />
          </div>

        </div>


        {loading ? (

          <div
            style={{
              padding: "35px",
              textAlign: "center",
              color: "#718096",
            }}
          >
            Loading notifications...
          </div>

        ) : notifications.length === 0 ? (

          <div
            style={{
              padding: "40px 20px",
              textAlign: "center",
              background: "#f8fafc",
              borderRadius: "12px",
              color: "#718096",
            }}
          >

            <Bell
              size={34}
              style={{
                marginBottom: "10px",
              }}
            />

            <h3
              style={{
                margin: "0 0 6px",
                color: "#34495e",
              }}
            >
              No notifications
            </h3>

            <p style={{ margin: 0 }}>
              You currently have no new notifications.
            </p>

          </div>

        ) : (

          <div
            style={{
              display: "grid",
              gap: "12px",
            }}
          >

            {notifications.map(
              (notification) => (

                <div
                  key={notification.id}
                  style={{
                    padding: "17px",
                    border:
                      "1px solid #e5eaf0",
                    borderRadius: "12px",
                    background:
                      notification.read
                        ? "#ffffff"
                        : "#f8fbff",
                  }}
                >

                  <div
                    style={{
                      display: "flex",
                      alignItems:
                        "flex-start",
                      gap: "12px",
                    }}
                  >

                    <div
                      style={{
                        width: "40px",
                        height: "40px",
                        flexShrink: 0,
                        borderRadius: "10px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent:
                          "center",
                        background:
                          "#eef5ff",
                      }}
                    >
                      <Bell size={19} />
                    </div>


                    <div
                      style={{
                        flex: 1,
                      }}
                    >

                      <div
                        style={{
                          display: "flex",
                          justifyContent:
                            "space-between",
                          gap: "10px",
                          flexWrap: "wrap",
                        }}
                      >

                        <strong
                          style={{
                            color: "#26384a",
                          }}
                        >
                          {notification.title ||
                            "Notification"}
                        </strong>

                        {!notification.read && (
                          <span
                            style={{
                              fontSize: "11px",
                              fontWeight: 700,
                              padding:
                                "4px 8px",
                              borderRadius:
                                "20px",
                              background:
                                "#e8f1ff",
                            }}
                          >
                            NEW
                          </span>
                        )}

                      </div>


                      <p
                        style={{
                          margin:
                            "7px 0 10px",
                          color: "#52606d",
                          fontSize: "14px",
                          lineHeight: 1.6,
                        }}
                      >
                        {notification.message ||
                          notification.text ||
                          "No notification message."}
                      </p>


                      <div
                        style={{
                          display: "flex",
                          alignItems:
                            "center",
                          gap: "6px",
                          color: "#8997a6",
                          fontSize: "11px",
                        }}
                      >

                        <Clock size={13} />

                        {notification.createdAt
                          ? new Date(
                              notification.createdAt
                            ).toLocaleString()
                          : "Date unavailable"}

                      </div>

                    </div>

                  </div>

                </div>

              )
            )}

          </div>

        )}

      </section>

    </div>
  );
}