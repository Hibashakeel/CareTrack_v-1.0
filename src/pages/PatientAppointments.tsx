import {
  CalendarDays,
  Clock3,
  MapPin,
  UserRound,
} from "lucide-react";

import "../patient-pages.css";

type Appointment = {
  id: number;
  doctor: string;
  department: string;
  date: string;
  time: string;
  location: string;
  type: string;
};

export default function PatientAppointments() {
  const appointments: Appointment[] = [
    {
      id: 1,
      doctor: "Dr. Care Team",
      department: "General Consultation",
      date: "30 September 2026",
      time: "10:30 AM",
      location: "Consultation Room 2",
      type: "Follow-up",
    },
    {
      id: 2,
      doctor: "Dr. Care Team",
      department: "Patient Review",
      date: "05 October 2026",
      time: "11:00 AM",
      location: "Consultation Room 1",
      type: "Review",
    },
  ];

  return (
    <div className="patient-page">
      <div className="patient-page-heading">
        <h1>My Appointments</h1>
        <p>
          View your upcoming appointments and consultation details.
        </p>
      </div>

      <div className="appointment-list">
        {appointments.map((appointment) => (
          <div
            className="patient-inner-card appointment-card"
            key={appointment.id}
          >
            <div className="appointment-date-box">
              <CalendarDays size={22} />
              <strong>{appointment.date}</strong>
            </div>

            <div className="appointment-main">
              <div className="appointment-title-row">
                <div>
                  <h2>{appointment.doctor}</h2>
                  <p>{appointment.department}</p>
                </div>

                <span className="appointment-type">
                  {appointment.type}
                </span>
              </div>

              <div className="appointment-details">
                <span>
                  <Clock3 size={15} />
                  {appointment.time}
                </span>

                <span>
                  <MapPin size={15} />
                  {appointment.location}
                </span>

                <span>
                  <UserRound size={15} />
                  Care Team
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}