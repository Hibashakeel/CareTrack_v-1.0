import {
  CalendarDays,
  Clock3,
  MapPin,
  UserRound,
  ClipboardList,
  CheckCircle2,
} from "lucide-react";

import { useEffect, useState } from "react";
import { get, ref } from "firebase/database";

import { useAuth } from "../../context/AuthContext";
import { db } from "../../lib/firebase";
import "./doctor-pages.css";

type Appointment = {
  id: string;
  patient?: string;
  patientName?: string;
  patientUid?: string;
  department?: string;
  date?: string | number;
  time?: string;
  startTime?: string;
  location?: string;
  type?: string;
  status?: string;
};

export default function DoctorAppointments() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadAppointments() {
      if (!user?.uid) {
        setAppointments([]);
        setLoading(false);
        return;
      }

      try {
        const indexSnapshot = await get(
          ref(db, `appointmentsByDoctor/${user.uid}`)
        );
        const appointmentIds = Object.keys(
          (indexSnapshot.val() ?? {}) as Record<string, unknown>
        );
        const records = await Promise.all(
          appointmentIds.map(async (id) => {
            const snapshot = await get(ref(db, `appointments/${id}`));
            const value = snapshot.val() as Omit<Appointment, "id"> | null;
            if (!value) return null;
            let patient =
              value.patientName || value.patient;
            if (!patient && value.patientUid) {
              const patientSnapshot = await get(
                ref(db, `users/${value.patientUid}`)
              );
              const patientProfile = patientSnapshot.val() as
                | { fullName?: string }
                | null;
              patient = patientProfile?.fullName;
            }
            return {
              ...value,
              id,
              patient: patient || "Patient unavailable",
            };
          })
        );
        setAppointments(
          records.filter((appointment) => appointment !== null)
        );
      } catch (loadError) {
        console.error("Could not load doctor appointments:", loadError);
        setError(
          loadError instanceof Error
            ? loadError.message
            : "Could not load appointments from Firebase."
        );
      } finally {
        setLoading(false);
      }
    }

    void loadAppointments();
  }, [user?.uid]);

  const scheduledCount = appointments.filter(
    (appointment) => (appointment.status || "").toLowerCase() === "scheduled"
  ).length;

  const upcomingCount = appointments.filter(
    (appointment) => (appointment.status || "").toLowerCase() === "upcoming"
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
        {loading ? (
          <div className="doctor-empty-card">Loading appointments...</div>
        ) : error ? (
          <div className="doctor-empty-card" role="alert">{error}</div>
        ) : appointments.length === 0 ? (
          <div className="doctor-empty-card">No appointment records are available.</div>
        ) : appointments.map((appointment) => (
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

                <strong>{formatDoctorAppointmentDate(appointment.date)}</strong>
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
                    <h2>{appointment.patientName || appointment.patient || "Patient unavailable"}</h2>

                    <p>{appointment.department || "Consultation"}</p>
                  </div>
                </div>

                <div className="doctor-appointment-badges">
                  <span className="doctor-appointment-type">
                    {appointment.type || "Appointment"}
                  </span>

                  <span className="doctor-appointment-status">
                    <span />
                    {appointment.status || "Scheduled"}
                  </span>
                </div>
              </div>

              {/* DETAILS */}
              <div className="doctor-appointment-details">
                <div className="doctor-appointment-detail">
                  <Clock3 size={15} />

                  <div>
                    <span>Time</span>

                    <strong>{appointment.time || appointment.startTime || "Time unavailable"}</strong>
                  </div>
                </div>

                <div className="doctor-appointment-detail">
                  <MapPin size={15} />

                  <div>
                    <span>Location</span>

                    <strong>{appointment.location || "Location unavailable"}</strong>
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

function formatDoctorAppointmentDate(value?: string | number) {
  if (value === undefined || value === "") return "Date unavailable";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? String(value)
    : date.toLocaleDateString();
}
