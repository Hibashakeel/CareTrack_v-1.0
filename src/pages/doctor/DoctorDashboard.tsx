import {
  Activity,
  ArrowRight,
  Bell,
  ClipboardList,
  FileText,
  HeartPulse,
  Users,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { get, ref } from "firebase/database";

import { useAuth } from "../../context/AuthContext";
import { db } from "../../lib/firebase";

interface UserProfile {
  uid?: string;
  fullName?: string;
  email?: string;
  role?: string;
  active?: boolean;
  approvalStatus?: string;
}

interface DailyReport {
  id: string;
  patientId: string;
  date?: string;
  createdAt?: string;
  painLevel?: string | number;
  symptoms?: string;
  notes?: string;
}

interface PatientVital {
  id: string;
  patientId: string;
  heartRate?: string | number;
  bloodPressure?: string;
  temperature?: string | number;
  oxygen?: string | number;
  respiratoryRate?: string | number;
  createdAt?: string;
}

export default function DoctorDashboard() {
  const { user, profile } = useAuth();

  const [patients, setPatients] = useState<UserProfile[]>([]);
  const [reportsCount, setReportsCount] = useState(0);
  const [vitalsCount, setVitalsCount] = useState(0);
  const [notificationsCount, setNotificationsCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboardData() {
      try {
        const usersSnapshot = await get(ref(db, "users"));

        if (!usersSnapshot.exists()) {
          setPatients([]);
          setReportsCount(0);
          setVitalsCount(0);
          setNotificationsCount(0);
          return;
        }

        const usersData =
          usersSnapshot.val() as Record<string, UserProfile>;

        const patientList = Object.entries(usersData)
          .filter(([, item]) => item.role === "patient")
          .map(([uid, item]) => ({
            ...item,
            uid,
          }));

        setPatients(patientList);

        let totalReports = 0;
        let totalVitals = 0;

        for (const patient of patientList) {
          if (!patient.uid) continue;

          const reportsSnapshot = await get(
            ref(db, `patientDailyReports/${patient.uid}`)
          );

          if (reportsSnapshot.exists()) {
            const data = reportsSnapshot.val();

            if (
              typeof data === "object" &&
              data !== null
            ) {
              const entries = Object.entries(data);

              if (
                entries.length > 0 &&
                typeof entries[0][1] === "object"
              ) {
                totalReports += entries.length;
              } else {
                totalReports += 1;
              }
            } else {
              totalReports += 1;
            }
          }

          const vitalsSnapshot = await get(
            ref(db, `patientVitals/${patient.uid}`)
          );

          if (vitalsSnapshot.exists()) {
            const data = vitalsSnapshot.val();

            if (
              typeof data === "object" &&
              data !== null
            ) {
              const entries = Object.entries(data);

              if (
                entries.length > 0 &&
                typeof entries[0][1] === "object"
              ) {
                totalVitals += entries.length;
              } else {
                totalVitals += 1;
              }
            } else {
              totalVitals += 1;
            }
          }
        }

        setReportsCount(totalReports);
        setVitalsCount(totalVitals);

        /*
         * Notifications will remain 0 until the notification
         * data source is connected. This avoids showing
         * misleading "Available" text.
         */
        setNotificationsCount(0);
      } catch (error) {
        console.error(
          "Unable to load doctor dashboard:",
          error
        );
      } finally {
        setLoading(false);
      }
    }

    if (user?.uid) {
      loadDashboardData();
    } else {
      setLoading(false);
    }
  }, [user?.uid]);

  const doctorName =
    profile?.fullName ||
    user?.displayName ||
    "Doctor";

  const firstName =
    doctorName.trim().split(" ")[0] || "Doctor";

  return (
    <div className="doctor-dashboard">

      {/* =========================
          WELCOME
      ========================== */}
      <section className="doctor-dashboard-welcome">
        <div>
          <p className="doctor-dashboard-eyebrow">
            DOCTOR OVERVIEW
          </p>

          <h1>
            Good morning, {firstName}
          </h1>

          <p>
            Monitor patient information, daily reports,
            recorded vitals and care notes from one place.
          </p>
        </div>

        <Link
          to="/doctor/patients"
          className="doctor-dashboard-primary-btn"
        >
          <Users size={18} />
          View Patients
          <ArrowRight size={16} />
        </Link>
      </section>

      {/* =========================
          SUMMARY CARDS
      ========================== */}
      <section className="doctor-dashboard-stat-grid">

        {/* PATIENTS */}
        <Link
          to="/doctor/patients"
          className="doctor-dashboard-stat-card"
        >
          <div className="doctor-dashboard-stat-icon">
            <Users size={22} />
          </div>

          <div className="doctor-dashboard-stat-content">
            <span>Total Patients</span>

            <strong>
              {loading ? "..." : patients.length}
            </strong>

            <small>
              Registered patients
            </small>
          </div>

          <ArrowRight
            className="doctor-dashboard-stat-arrow"
            size={18}
          />
        </Link>

        {/* REPORTS */}
        <Link
          to="/doctor/reports"
          className="doctor-dashboard-stat-card"
        >
          <div className="doctor-dashboard-stat-icon">
            <ClipboardList size={22} />
          </div>

          <div className="doctor-dashboard-stat-content">
            <span>Daily Reports</span>

            <strong>
              {loading ? "..." : reportsCount}
            </strong>

            <small>
              Submitted reports
            </small>
          </div>

          <ArrowRight
            className="doctor-dashboard-stat-arrow"
            size={18}
          />
        </Link>

        {/* VITALS */}
        <Link
          to="/doctor/vitals"
          className="doctor-dashboard-stat-card"
        >
          <div className="doctor-dashboard-stat-icon">
            <HeartPulse size={22} />
          </div>

          <div className="doctor-dashboard-stat-content">
            <span>Patient Vitals</span>

            <strong>
              {loading ? "..." : vitalsCount}
            </strong>

            <small>
              Recorded vital entries
            </small>
          </div>

          <ArrowRight
            className="doctor-dashboard-stat-arrow"
            size={18}
          />
        </Link>

        {/* NOTIFICATIONS */}
        <Link
          to="/doctor/notifications"
          className="doctor-dashboard-stat-card"
        >
          <div className="doctor-dashboard-stat-icon">
            <Bell size={22} />
          </div>

          <div className="doctor-dashboard-stat-content">
            <span>Notifications</span>

            <strong>
              {loading ? "..." : notificationsCount}
            </strong>

            <small>
              New updates
            </small>
          </div>

          <ArrowRight
            className="doctor-dashboard-stat-arrow"
            size={18}
          />
        </Link>

      </section>

      {/* =========================
          RECENT PATIENTS
      ========================== */}
      <section className="doctor-dashboard-records-card">

        <div className="doctor-dashboard-section-header">

          <div>
            <p className="doctor-dashboard-card-kicker">
              PATIENT MANAGEMENT
            </p>

            <h2>
              Recent Patient Records
            </h2>

            <p>
              Quickly access patient profiles and
              review their submitted information.
            </p>
          </div>

          <Link
            to="/doctor/patients"
            className="doctor-dashboard-view-all"
          >
            View all
            <ArrowRight size={16} />
          </Link>

        </div>

        {loading ? (
          <div className="doctor-dashboard-empty">
            Loading patient records...
          </div>
        ) : patients.length === 0 ? (
          <div className="doctor-dashboard-empty">
            No patient records found.
          </div>
        ) : (
          <div className="doctor-dashboard-patient-list">

            {patients
              .slice(0, 5)
              .map((patient) => (

                <Link
                  key={patient.uid}
                  to={`/doctor/patients/${patient.uid}`}
                  className="doctor-dashboard-patient-row"
                >

                  <div className="doctor-dashboard-patient-left">

                    <div className="doctor-dashboard-patient-avatar">
                      <Users size={19} />
                    </div>

                    <div>
                      <strong>
                        {patient.fullName ||
                          "Unnamed Patient"}
                      </strong>

                      <span>
                        {patient.email ||
                          "No email available"}
                      </span>
                    </div>

                  </div>

                  <ArrowRight size={18} />

                </Link>

              ))}

          </div>
        )}

      </section>

      {/* =========================
          QUICK ACCESS
      ========================== */}
      <section className="doctor-dashboard-quick-section">

        <div className="doctor-dashboard-section-header">

          <div>
            <p className="doctor-dashboard-card-kicker">
              QUICK ACCESS
            </p>

            <h2>
              Clinical Records
            </h2>

            <p>
              Open the information you need without
              leaving the doctor workspace.
            </p>
          </div>

        </div>

        <div className="doctor-dashboard-action-grid">

          {/* REPORTS */}
          <Link
            to="/doctor/reports"
            className="doctor-dashboard-action-card"
          >

            <div className="doctor-dashboard-action-icon">
              <ClipboardList size={22} />
            </div>

            <div className="doctor-dashboard-action-content">

              <p>
                DAILY MONITORING
              </p>

              <h3>
                Daily Health Reports
              </h3>

              <span>
                Review health information submitted
                by patients.
              </span>

            </div>

            <ArrowRight
              className="doctor-dashboard-action-arrow"
              size={19}
            />

          </Link>

          {/* VITALS */}
          <Link
            to="/doctor/vitals"
            className="doctor-dashboard-action-card"
          >

            <div className="doctor-dashboard-action-icon">
              <HeartPulse size={22} />
            </div>

            <div className="doctor-dashboard-action-content">

              <p>
                MONITORING
              </p>

              <h3>
                Patient Vitals
              </h3>

              <span>
                Review the latest recorded vital
                information.
              </span>

            </div>

            <ArrowRight
              className="doctor-dashboard-action-arrow"
              size={19}
            />

          </Link>

          {/* NOTES */}
          <Link
            to="/doctor/notes"
            className="doctor-dashboard-action-card"
          >

            <div className="doctor-dashboard-action-icon">
              <FileText size={22} />
            </div>

            <div className="doctor-dashboard-action-content">

              <p>
                CARE NOTES
              </p>

              <h3>
                Nurse Notes
              </h3>

              <span>
                Review notes recorded by the nursing
                team.
              </span>

            </div>

            <ArrowRight
              className="doctor-dashboard-action-arrow"
              size={19}
            />

          </Link>

        </div>

      </section>

    </div>
  );
}
