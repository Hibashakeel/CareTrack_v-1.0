import {
  Activity,
  CalendarDays,
  FileText,
  Pill,
  MessageCircleQuestion,
  ClipboardList,
  Clock3,
} from "lucide-react";

import "../patient-pages.css";

type TimelineItem = {
  id: number;
  title: string;
  description: string;
  date: string;
  time: string;
  type: "report" | "medication" | "question" | "appointment";
};

export default function PatientTimeline() {
  const timeline: TimelineItem[] = [
    {
      id: 1,
      title: "Daily Health Report Submitted",
      description:
        "Your daily condition, pain level, symptoms, food, water intake and daily changes were recorded.",
      date: "03 October 2026",
      time: "09:15 AM",
      type: "report",
    },
    {
      id: 2,
      title: "Medication Recorded",
      description:
        "Today's medication status was updated in your patient record.",
      date: "03 October 2026",
      time: "08:10 AM",
      type: "medication",
    },
    {
      id: 3,
      title: "Doctor Question Answered",
      description:
        "You submitted a response to a question from your care team.",
      date: "02 October 2026",
      time: "04:20 PM",
      type: "question",
    },
    {
      id: 4,
      title: "Appointment Scheduled",
      description:
        "A follow-up appointment was added to your CareTrack patient record.",
      date: "28 September 2026",
      time: "11:30 AM",
      type: "appointment",
    },
  ];

  const getIcon = (type: TimelineItem["type"]) => {
    switch (type) {
      case "report":
        return <ClipboardList size={19} />;

      case "medication":
        return <Pill size={19} />;

      case "question":
        return <MessageCircleQuestion size={19} />;

      case "appointment":
        return <CalendarDays size={19} />;

      default:
        return <Activity size={19} />;
    }
  };

  const getTypeLabel = (type: TimelineItem["type"]) => {
    switch (type) {
      case "report":
        return "Daily Report";

      case "medication":
        return "Medication";

      case "question":
        return "Doctor Question";

      case "appointment":
        return "Appointment";

      default:
        return "Activity";
    }
  };

  return (
    <div className="patient-page patient-timeline-page">

      {/* ================= PAGE HEADER ================= */}

      <div className="patient-page-heading timeline-page-heading">
        <div>
          <h1>My Timeline</h1>

          <p>
            View your recent CareTrack activities and recorded
            patient information in chronological order.
          </p>
        </div>

        <div className="timeline-header-icon">
          <Activity size={24} />
        </div>
      </div>

      {/* ================= TIMELINE CARD ================= */}

      <div className="patient-inner-card timeline-main-card">

        {/* CARD HEADER */}

        <div className="timeline-card-header">

          <div className="timeline-card-title">
            <div className="timeline-title-icon">
              <FileText size={19} />
            </div>

            <div>
              <h2>Patient Activity Timeline</h2>

              <p>
                Your recent health-related activities and
                updates are shown below.
              </p>
            </div>
          </div>

          <div className="timeline-count">
            <strong>{timeline.length}</strong>
            <span>Activities</span>
          </div>

        </div>

        {/* ================= TIMELINE ================= */}

        <div className="caretrack-timeline">

          {timeline.map((item, index) => (

            <div
              className="caretrack-timeline-item"
              key={item.id}
            >

              {/* TIMELINE LEFT SIDE */}

              <div className="caretrack-timeline-marker">

                <div
                  className={`caretrack-timeline-icon timeline-icon-${item.type}`}
                >
                  {getIcon(item.type)}
                </div>

                {index < timeline.length - 1 && (
                  <div className="caretrack-timeline-line" />
                )}

              </div>

              {/* TIMELINE CONTENT */}

              <div className="caretrack-timeline-content">

                {/* DATE / TIME */}

                <div className="timeline-meta">

                  <span className="timeline-date">
                    {item.date}
                  </span>

                  <span className="timeline-separator">
                    •
                  </span>

                  <span className="timeline-time">
                    <Clock3 size={13} />
                    {item.time}
                  </span>

                </div>

                {/* ACTIVITY TYPE */}

                <span
                  className={`timeline-type timeline-type-${item.type}`}
                >
                  {getTypeLabel(item.type)}
                </span>

                {/* TITLE */}

                <h3>{item.title}</h3>

                {/* DESCRIPTION */}

                <p>{item.description}</p>

              </div>

            </div>

          ))}

        </div>

        {/* ================= FOOTER NOTE ================= */}

        <div className="timeline-footer-note">
          <Activity size={16} />

          <span>
            Your timeline keeps important CareTrack activities
            organized for easier review.
          </span>
        </div>

      </div>
    </div>
  );
}
