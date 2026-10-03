import {
  CalendarDays,
  Clock3,
  MapPin,
  UserRound,
  ClipboardList,
  CheckCircle2,
} from "lucide-react";

import "./doctor-pages.css";

type Appointment = {
  id: number;
  patient: string;
  department: string;
  date: string;
  time: string;
  location: string;
  type: string;
  status: "Scheduled" | "Upcoming";
};

export default function DoctorAppointments() {
  const appointments: Appointment[] = [
    {
      id: 1,
      patient: "Sarah Ahmed",
      department: "General Consultation",
      date: "30 September 2026",
      time: "10:30 AM",
      location: "Consultation Room 2",
      type: "Follow-up",
      status: "Scheduled",
    },
    {
      id: 2,
      patient: "Ali Raza",
      department: "Patient Review",
      date: "05 October 2026",
      time: "11:00 AM",
      location: "Consultation Room 1",
      type: "Review",
      status: "Upcoming",
    },
  ];

  const scheduledCount = appointments.filter(
    (appointment) => appointment.status === "Scheduled"
  ).length;

  const upcomingCount = appointments.filter(
    (appointment) => appointment.status === "Upcoming"
  ).length;

  return (
    <div className="doctor-page doctor-appointments-page">
      {/* PAGE HEADER */}
      <div className="doctor-page-header doctor-appointments-header">
        <div>
          <p className="doctor-eyebrow">DOCTOR / SCHEDULE</p>

          <h1>Appointments</h1>

          <p>
            Manage upcoming patient consultations and review scheduled
            appointment details.
          </p>
        </div>

        <div className="doctor-page-header-icon">
          <CalendarDays size={27} />
        </div>
      </div>

      {/* SUMMARY */}
      <div className="doctor-appointment-summary">
        <div className="doctor-appointment-stat">
          <div className="doctor-appointment-stat-icon">
            <CalendarDays size={19} />
          </div>

          <div>
            <strong>{appointments.length}</strong>
            <span>Total Appointments</span>
          </div>
        </div>

        <div className="doctor-appointment-stat">
          <div className="doctor-appointment-stat-icon">
            <Clock3 size={19} />
          </div>

          <div>
            <strong>{scheduledCount}</strong>
            <span>Scheduled</span>
          </div>
        </div>

        <div className="doctor-appointment-stat">
          <div className="doctor-appointment-stat-icon">
            <CheckCircle2 size={19} />
          </div>

          <div>
            <strong>{upcomingCount}</strong>
            <span>Upcoming</span>
          </div>
        </div>
      </div>

      {/* SECTION HEADER */}
      <div className="doctor-appointments-section-header">
        <div>
          <h2>Upcoming Appointments</h2>

          <p>
            Review your scheduled patient consultations.
          </p>
        </div>

        <div className="doctor-appointments-count">
          <ClipboardList size={15} />
          {appointments.length} appointments
        </div>
      </div>

      {/* APPOINTMENTS */}
      <div className="doctor-appointment-list">
        {appointments.map((appointment) => (
          <article
            className="doctor-appointment-card"
            key={appointment.id}
          >
            {/* DATE */}
            <div className="doctor-appointment-date">
              <div className="doctor-appointment-date-icon">
                <CalendarDays size={20} />
              </div>

              <div>
                <span>Appointment Date</span>

                <strong>{appointment.date}</strong>
              </div>
            </div>

            {/* MAIN CONTENT */}
            <div className="doctor-appointment-main">
              <div className="doctor-appointment-title">
                <div className="doctor-patient-heading">
                  <div className="doctor-patient-avatar">
                    <UserRound size={19} />
                  </div>

                  <div>
                    <h2>{appointment.patient}</h2>

                    <p>{appointment.department}</p>
                  </div>
                </div>

                <div className="doctor-appointment-badges">
                  <span className="doctor-appointment-type">
                    {appointment.type}
                  </span>

                  <span className="doctor-appointment-status">
                    <span />
                    {appointment.status}
                  </span>
                </div>
              </div>

              {/* DETAILS */}
              <div className="doctor-appointment-details">
                <div className="doctor-appointment-detail">
                  <Clock3 size={15} />

                  <div>
                    <span>Time</span>

                    <strong>{appointment.time}</strong>
                  </div>
                </div>

                <div className="doctor-appointment-detail">
                  <MapPin size={15} />

                  <div>
                    <span>Location</span>

                    <strong>{appointment.location}</strong>
                  </div>
                </div>

                <div className="doctor-appointment-detail">
                  <UserRound size={15} />

                  <div>
                    <span>Visit Type</span>

                    <strong>Patient Consultation</strong>
                  </div>
                </div>
              </div>
            </div>
          </article>
        ))}
      </div>

      {/* FOOTER NOTE */}
      <div className="doctor-appointments-note">
        <CalendarDays size={16} />

        <span>
          Appointment information is displayed from the current
          CareTrack scheduling record.
        </span>
      </div>
    </div>
  );
}
