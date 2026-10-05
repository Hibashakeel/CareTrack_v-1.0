import {
  Bell,
  CheckCircle2,
  ClipboardList,
  MessageCircleQuestion,
  AlertCircle,
  Clock3,
  Check,
} from "lucide-react";

import { useState } from "react";

import "../role-dashboards.css";

type Notification = {
  id: number;
  title: string;
  message: string;
  time: string;
  type: "report" | "question" | "attention" | "system";
  unread: boolean;
};

const initialNotifications: Notification[] = [
  {
    id: 1,
    title: "New patient report",
    message:
      "Sarah Ahmed has submitted today's daily health report.",
    time: "10 minutes ago",
    type: "report",
    unread: true,
  },
  {
    id: 2,
    title: "Patient update requires review",
    message:
      "Ali Raza has added new information to today's patient update.",
    time: "25 minutes ago",
    type: "attention",
    unread: true,
  },
  {
    id: 3,
    title: "Doctor question answered",
    message:
      "A patient has submitted a response to a doctor question.",
    time: "42 minutes ago",
    type: "question",
    unread: false,
  },
  {
    id: 4,
    title: "Daily monitoring reminder",
    message:
      "Remember to review pending patient reports during your shift.",
    time: "1 hour ago",
    type: "system",
    unread: false,
  },
];

export default function NurseNotifications() {
  const [notifications, setNotifications] =
    useState<Notification[]>(initialNotifications);

  const unreadCount = notifications.filter(
    (notification) => notification.unread
  ).length;

  const markAsRead = (id: number) => {
    setNotifications((current) =>
      current.map((notification) =>
        notification.id === id
          ? {
              ...notification,
              unread: false,
            }
          : notification
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications((current) =>
      current.map((notification) => ({
        ...notification,
        unread: false,
      }))
    );
  };

  const getIcon = (type: Notification["type"]) => {
    if (type === "report") {
      return <ClipboardList size={19} />;
    }

    if (type === "question") {
      return <MessageCircleQuestion size={19} />;
    }

    if (type === "attention") {
      return <AlertCircle size={19} />;
    }

    return <Bell size={19} />;
  };

  return (
    <div className="role-dashboard">

      {/* HEADER */}

      <div className="role-dashboard-header">

        <div>
          <p className="role-eyebrow">
            CARETRACK UPDATES
          </p>

          <h1>
            Notifications
          </h1>

          <p>
            Stay updated about patient reports, questions and
            monitoring activities.
          </p>
        </div>

        {unreadCount > 0 && (
          <button
            type="button"
            onClick={markAllAsRead}
            className="role-primary-button"
            style={{
              border: "none",
              cursor: "pointer",
            }}
          >
            <Check size={17} />
            Mark All as Read
          </button>
        )}

      </div>


      {/* SUMMARY */}

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
            <strong>2</strong>
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


      {/* NOTIFICATION LIST */}

      <section className="role-card">

        <div className="role-card-header">

          <div>
            <h2>
              Recent Notifications
            </h2>

            <p>
              Your latest CareTrack updates
            </p>
          </div>

          <Bell
            size={21}
            color="#006ee6"
          />

        </div>


        <div>

          {notifications.map((notification) => (

            <div
              key={notification.id}
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: "14px",
                padding: "17px 0",
                borderTop: "1px solid #edf3f6",
                background: notification.unread
                  ? "#fbfefe"
                  : "transparent",
              }}
            >

              {/* ICON */}

              <div
                style={{
                  width: "42px",
                  height: "42px",
                  minWidth: "42px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: "11px",
                  background: notification.unread
                    ? "#eef6ff"
                    : "#f4f8fa",
                  color: notification.unread
                    ? "#006ee6"
                    : "#8293a0",
                }}
              >
                {getIcon(notification.type)}
              </div>


              {/* CONTENT */}

              <div
                style={{
                  flex: 1,
                  minWidth: 0,
                }}
              >

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    marginBottom: "5px",
                  }}
                >

                  <strong
                    style={{
                      color: "#183b56",
                      fontSize: "13px",
                    }}
                  >
                    {notification.title}
                  </strong>

                  {notification.unread && (
                    <span
                      style={{
                        width: "7px",
                        height: "7px",
                        borderRadius: "50%",
                        background: "#006ee6",
                      }}
                    />
                  )}

                </div>


                <p
                  style={{
                    margin: 0,
                    color: "#718696",
                    fontSize: "12px",
                    lineHeight: 1.55,
                  }}
                >
                  {notification.message}
                </p>


                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "5px",
                    marginTop: "8px",
                    color: "#91a0aa",
                    fontSize: "10px",
                  }}
                >

                  <Clock3 size={12} />

                  {notification.time}

                </div>

              </div>


              {/* ACTION */}

              {notification.unread && (
                <button
                  type="button"
                  onClick={() =>
                    markAsRead(notification.id)
                  }
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "5px",
                    padding: "7px 10px",
                    border: "1px solid #dceaf2",
                    borderRadius: "8px",
                    background: "#fff",
                    color: "#006ee6",
                    fontSize: "10px",
                    fontWeight: 700,
                    cursor: "pointer",
                    whiteSpace: "nowrap",
                  }}
                >
                  <Check size={13} />
                  Read
                </button>
              )}

            </div>

          ))}

        </div>

      </section>


      {/* EMPTY / INFORMATION CARD */}

      <section
        className="role-card"
        style={{
          background: "#f7fcfd",
        }}
      >

        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            gap: "12px",
          }}
        >

          <CheckCircle2
            size={20}
            color="#006ee6"
          />

          <div>

            <strong
              style={{
                display: "block",
                marginBottom: "5px",
                color: "#183b56",
                fontSize: "13px",
              }}
            >
              CareTrack notifications
            </strong>

            <p
              style={{
                margin: 0,
                color: "#718696",
                fontSize: "11px",
                lineHeight: 1.6,
              }}
            >
              Notifications help nurses stay aware of patient
              updates, submitted reports and communication
              activities. They are designed to improve visibility
              without making automatic clinical decisions.
            </p>

          </div>

        </div>

      </section>

    </div>
  );
}