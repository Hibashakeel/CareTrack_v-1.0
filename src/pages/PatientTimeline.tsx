import {
  Activity,
  CalendarDays,
  FileText,
  Pill,
  MessageCircleQuestion,
  Mic,
} from "lucide-react";

import "../patient-pages.css";

type TimelineItem = {
  id: number;
  title: string;
  description: string;
  date: string;
  type: "report" | "medication" | "question" | "voice" | "appointment";
};

export default function PatientTimeline() {
  const timeline: TimelineItem[] = [
    {
      id: 1,
      title: "Daily Health Report Submitted",
      description:
        "Patient daily condition and symptoms were recorded.",
      date: "Today · 09:15 AM",
      type: "report",
    },
    {
      id: 2,
      title: "Medication Recorded",
      description:
        "Today's morning medication was marked as taken.",
      date: "Today · 08:10 AM",
      type: "medication",
    },
    {
      id: 3,
      title: "Doctor Question Answered",
      description:
        "A response was submitted to a care team question.",
      date: "Yesterday · 04:20 PM",
      type: "question",
    },
    {
      id: 4,
      title: "Voice Response Added",
      description:
        "A voice response was recorded and prepared for transcription.",
      date: "Yesterday · 03:45 PM",
      type: "voice",
    },
    {
      id: 5,
      title: "Appointment Scheduled",
      description:
        "A follow-up appointment was added to the patient record.",
      date: "28 September 2026",
      type: "appointment",
    },
  ];

  const getIcon = (type: TimelineItem["type"]) => {
    switch (type) {
      case "report":
        return <Activity size={17} />;

      case "medication":
        return <Pill size={17} />;

      case "question":
        return <MessageCircleQuestion size={17} />;

      case "voice":
        return <Mic size={17} />;

      default:
        return <CalendarDays size={17} />;
    }
  };

  return (
    <div className="patient-page">
      <div className="patient-page-heading">
        <h1>My Timeline</h1>
        <p>
          A chronological view of your CareTrack information and
          activities.
        </p>
      </div>

      <div className="patient-inner-card">
        <div className="patient-card-title">
          <FileText size={20} color="#159a9c" />
          Patient Activity Timeline
        </div>

        <p className="patient-card-description">
          Your recorded information is organized here for easier
          review.
        </p>

        <div className="patient-timeline">
          {timeline.map((item, index) => (
            <div className="timeline-item" key={item.id}>
              <div className="timeline-line">
                <div className="timeline-icon">
                  {getIcon(item.type)}
                </div>

                {index !== timeline.length - 1 && (
                  <div className="timeline-connector" />
                )}
              </div>

              <div className="timeline-content">
                <div className="timeline-date">
                  {item.date}
                </div>

                <h3>{item.title}</h3>

                <p>{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}