import { Bell, CheckCircle2, MessageCircleQuestion } from "lucide-react";

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
        "Your care team has added a new question for you.",
      time: "10 minutes ago",
      type: "question",
      unread: true,
    },
    {
      id: 2,
      title: "Upcoming Appointment",
      message:
        "You have an appointment scheduled for 30 September.",
      time: "2 hours ago",
      type: "appointment",
      unread: true,
    },
    {
      id: 3,
      title: "Daily Report Saved",
      message:
        "Your daily health report has been successfully recorded.",
      time: "Yesterday",
      type: "general",
      unread: false,
    },
  ];

  return (
    <div className="patient-page">
      <div className="patient-page-heading">
        <h1>Notifications</h1>
        <p>
          Stay updated with questions, appointments, and CareTrack
          activity.
        </p>
      </div>

      <div className="patient-inner-card">
        <div className="patient-card-title">
          <Bell size={20} color="#159a9c" />
          Recent Notifications
        </div>

        <p className="patient-card-description">
          Your latest CareTrack updates are shown below.
        </p>

        <div className="notification-list">
          {notifications.map((notification) => (
            <div
              className={`notification-item ${
                notification.unread ? "unread" : ""
              }`}
              key={notification.id}
            >
              <div className="notification-icon">
                {notification.type === "question" ? (
                  <MessageCircleQuestion size={18} />
                ) : notification.type === "appointment" ? (
                  <Bell size={18} />
                ) : (
                  <CheckCircle2 size={18} />
                )}
              </div>

              <div className="notification-content">
                <div className="notification-title-row">
                  <h3>{notification.title}</h3>

                  {notification.unread && (
                    <span className="notification-dot" />
                  )}
                </div>

                <p>{notification.message}</p>

                <span>{notification.time}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}