
import {
  Bell,
  CheckCircle2,
  MessageCircleQuestion,
  CalendarDays,
  Clock3,
  Circle,
} from "lucide-react";

import "../patient-pages.css";

type Notification = {
  id: number;
  title: string;
  message: string;
  time: string;
  type: "question" | "appointment" | "general";
  unread: boolean;
};

export default function PatientNotifications() {
  const notifications: Notification[] = [
    {
      id: 1,
      title: "New Question From Care Team",
      message:
        "Your care team has added a new question for you. Please review and submit your response.",
      time: "10 minutes ago",
      type: "question",
      unread: true,
    },
    {
      id: 2,
      title: "Upcoming Appointment",
      message:
        "You have an appointment scheduled for 30 September. Please review your appointment details.",
      time: "2 hours ago",
      type: "appointment",
      unread: true,
    },
    {
      id: 3,
      title: "Daily Report Saved",
      message:
        "Your daily health report has been successfully recorded in your CareTrack patient record.",
      time: "Yesterday",
      type: "general",
      unread: false,
    },
  ];

  const unreadCount = notifications.filter(
    (notification) => notification.unread
  ).length;

  const getNotificationIcon = (type: Notification["type"]) => {
    switch (type) {
      case "question":
        return <MessageCircleQuestion size={19} />;

      case "appointment":
        return <CalendarDays size={19} />;

      default:
        return <CheckCircle2 size={19} />;
    }
  };

  const getNotificationType = (type: Notification["type"]) => {
    switch (type) {
      case "question":
        return "Doctor Question";

      case "appointment":
        return "Appointment";

      default:
        return "CareTrack Update";
    }
  };

  return (
    <div className="patient-page patient-notifications-page">
      {/* Page Header */}
      <div className="patient-page-heading notifications-page-heading">
        <div>
          <span className="notifications-eyebrow">CARE UPDATES</span>

          <h1>Notifications</h1>

          <p>
            Stay updated with questions, appointments, and important
            CareTrack activity.
          </p>
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

      {/* Main Notification Card */}
      <div className="notifications-panel">
        {/* Panel Header */}
        <div className="notifications-panel-header">
          <div className="notifications-panel-title">
            <div className="notifications-panel-icon">
              <Bell size={19} />
            </div>

            <div>
              <h2>Recent Notifications</h2>
              <p>Your latest CareTrack updates and reminders</p>
            </div>
          </div>

          <div className="notifications-status">
            <span className="notifications-status-dot" />
            Live updates
          </div>
        </div>

        {/* Notification List */}
        <div className="notifications-list">
          {notifications.length > 0 ? (
            notifications.map((notification) => (
              <div
                className={`notification-card ${
                  notification.unread ? "notification-card-unread" : ""
                }`}
                key={notification.id}
              >
                {/* Icon */}
                <div
                  className={`notification-type-icon notification-type-${notification.type}`}
                >
                  {getNotificationIcon(notification.type)}
                </div>

                {/* Content */}
                <div className="notification-main">
                  <div className="notification-top-row">
                    <div className="notification-title-group">
                      <span
                        className={`notification-type-label notification-label-${notification.type}`}
                      >
                        {getNotificationType(notification.type)}
                      </span>

                      <h3>{notification.title}</h3>
                    </div>

                    {notification.unread && (
                      <span className="notification-unread">
                        <Circle size={8} fill="currentColor" />
                        New
                      </span>
                    )}
                  </div>

                  <p>{notification.message}</p>

                  <div className="notification-time">
                    <Clock3 size={13} />
                    <span>{notification.time}</span>
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

              <p>
                You are all caught up. New CareTrack updates will appear
                here.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="notifications-panel-footer">
          <CheckCircle2 size={15} />

          <span>
            Important questions, appointments, and patient record updates
            will appear here.
          </span>
        </div>
      </div>
    </div>
  );
}

