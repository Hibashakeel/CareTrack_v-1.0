import {
  CalendarDays,
  Clock3,
  MapPin,
  UserRound,
} from "lucide-react";

export default function DoctorAppointments() {
  const appointments = [
    {
      id: 1,
      patient: "Sarah Ahmed",
      department: "General Consultation",
      date: "30 September 2026",
      time: "10:30 AM",
      location: "Consultation Room 2",
      type: "Follow-up",
    },
    {
      id: 2,
      patient: "Ali Raza",
      department: "Patient Review",
      date: "05 October 2026",
      time: "11:00 AM",
      location: "Consultation Room 1",
      type: "Review",
    },
  ];

  return (
    <div className="doctor-page">
      <div className="doctor-page-header">
        <div>
          <p className="doctor-eyebrow">
            DOCTOR / SCHEDULE
          </p>

          <h1>Appointments</h1>

          <p>
            View upcoming patient appointments and
            consultation details.
          </p>
        </div>

        <div className="doctor-page-header-icon">
          <CalendarDays size={28} />
        </div>
      </div>

      <div className="doctor-appointment-list">
        {appointments.map((appointment) => (
          <article
            className="doctor-appointment-card"
            key={appointment.id}
          >
            <div className="doctor-appointment-date">
              <CalendarDays size={23} />

              <strong>
                {appointment.date}
              </strong>
            </div>

            <div className="doctor-appointment-main">
              <div className="doctor-appointment-title">
                <div>
                  <h2>
                    {appointment.patient}
                  </h2>

                  <p>
                    {appointment.department}
                  </p>
                </div>

                <span>
                  {appointment.type}
                </span>
              </div>

              <div className="doctor-appointment-details">
                <div>
                  <Clock3 size={15} />
                  {appointment.time}
                </div>

                <div>
                  <MapPin size={15} />
                  {appointment.location}
                </div>

                <div>
                  <UserRound size={15} />
                  Patient consultation
                </div>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}