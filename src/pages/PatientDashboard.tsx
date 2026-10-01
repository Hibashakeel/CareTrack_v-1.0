import {
  Activity,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  FileText,
  HeartPulse,
  MessageCircleQuestion,
  Pill,
  Plus,
  Droplets,
  ArrowRight,
  Mic,
} from "lucide-react";

import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { get, ref } from "firebase/database";

import StatCard from "../components/StatCard";
import { useAuth } from "../context/AuthContext";
import { db } from "../lib/firebase";

interface DailyReport {
  patientId?: string;
  patientName?: string;
  patientEmail?: string;
  reportDate?: string;
  condition?: string;
  pain?: number;
  waterGlasses?: number;
  food?: string;
  symptoms?: string;
  submittedAt?: number | null;
  status?: string;
}

export default function PatientDashboard() {
  const { user, profile } = useAuth();

  const [report, setReport] = useState<DailyReport | null>(null);
  const [loadingReport, setLoadingReport] = useState(true);

  useEffect(() => {
    async function loadLatestReport() {
      if (!user?.uid) {
        setLoadingReport(false);
        return;
      }

      try {
        const snapshot = await get(
          ref(db, `patientDailyReports/${user.uid}`)
        );

        if (!snapshot.exists()) {
          setReport(null);
          setLoadingReport(false);
          return;
        }

        const data = snapshot.val() as Record<string, DailyReport>;

        const reports = Object.values(data);

        reports.sort((a, b) => {
          const timeA =
            typeof a.submittedAt === "number"
              ? a.submittedAt
              : 0;

          const timeB =
            typeof b.submittedAt === "number"
              ? b.submittedAt
              : 0;

          return timeB - timeA;
        });

        setReport(reports[0] || null);
      } catch (error) {
        console.error(
          "Unable to load patient dashboard report:",
          error
        );
      } finally {
        setLoadingReport(false);
      }
    }

    loadLatestReport();
  }, [user?.uid]);

  const patientName =
    profile?.fullName ||
    user?.displayName ||
    "Patient";

  const firstName =
    patientName.trim().split(" ")[0] || "Patient";

  const condition =
    report?.condition || "No report submitted yet";

  const pain =
    typeof report?.pain === "number"
      ? `${report.pain} / 10`
      : "—";

  const water =
    typeof report?.waterGlasses === "number"
      ? `${report.waterGlasses} / 8`
      : "—";

  const symptoms =
    report?.symptoms?.trim()
      ? report.symptoms
      : "No symptoms reported";

  const reportCompleted = Boolean(report);

  const reportStatus = reportCompleted
    ? "Completed"
    : "Not submitted";

  return (
    <div className="patient-dashboard">

      {/* WELCOME */}
      <section className="patient-welcome">
        <div className="patient-welcome-text">
          <p className="dashboard-eyebrow">
            PATIENT OVERVIEW
          </p>

          <h1>
            Good morning, {firstName}
          </h1>

          <p>
            Keep your daily health information updated so
            your care team can stay informed.
          </p>
        </div>

        <Link
          to="/patient/daily-report"
          className="patient-primary-button dashboard-report-button"
        >
          <Plus size={18} />
          Add Daily Report
        </Link>
      </section>

      {/* STAT CARDS */}
      <section className="patient-stat-grid">

        <StatCard
          label="Today's Report"
          value={
            loadingReport
              ? "Loading..."
              : reportStatus
          }
          hint={
            reportCompleted
              ? "Saved in CareTrack"
              : "Update your information"
          }
          icon={<ClipboardList size={22} />}
        />

        <StatCard
          label="Water Intake"
          value={
            loadingReport
              ? "Loading..."
              : water
          }
          hint="Glasses today"
          icon={<Droplets size={22} />}
        />

        <StatCard
          label="Pain Level"
          value={
            loadingReport
              ? "Loading..."
              : pain
          }
          hint={
            report
              ? "From your latest report"
              : "No report yet"
          }
          icon={<HeartPulse size={22} />}
        />

        <StatCard
          label="Appointments"
          value="View"
          hint="Check your appointments"
          icon={<CalendarDays size={22} />}
        />

      </section>

      {/* MAIN DASHBOARD */}
      <div className="patient-content-grid">

        {/* LEFT */}
        <div className="patient-main-column">

          {/* HEALTH SUMMARY */}
          <section className="patient-card dashboard-health-card">

            <div className="patient-card-header">

              <div>
                <p className="card-kicker">
                  {report ? "LATEST REPORT" : "TODAY"}
                </p>

                <h2>Daily Health Summary</h2>

                <p>
                  Your latest self-reported health information.
                </p>
              </div>

              <Link
                to="/patient/daily-report"
                className="patient-text-button"
              >
                {report ? "Update report" : "Add report"}
                <ArrowRight size={16} />
              </Link>

            </div>

            <div className="health-summary-grid">

              <div className="health-summary-item">
                <div className="summary-icon">
                  <Activity size={19} />
                </div>

                <div>
                  <span>Current condition</span>

                  <strong>
                    {loadingReport
                      ? "Loading..."
                      : condition}
                  </strong>
                </div>
              </div>

              <div className="health-summary-item">
                <div className="summary-icon">
                  <HeartPulse size={19} />
                </div>

                <div>
                  <span>Pain level</span>

                  <strong>
                    {loadingReport
                      ? "Loading..."
                      : pain}
                  </strong>
                </div>
              </div>

              <div className="health-summary-item">
                <div className="summary-icon">
                  <Droplets size={19} />
                </div>

                <div>
                  <span>Water intake</span>

                  <strong>
                    {loadingReport
                      ? "Loading..."
                      : report
                      ? `${report.waterGlasses} glasses`
                      : "No data"}
                  </strong>
                </div>
              </div>

              <div className="health-summary-item">
                <div className="summary-icon">
                  <FileText size={19} />
                </div>

                <div className="summary-text-item">
                  <span>Symptoms</span>

                  <strong
                    title={symptoms}
                    className="summary-truncated"
                  >
                    {loadingReport
                      ? "Loading..."
                      : symptoms}
                  </strong>
                </div>
              </div>

            </div>

          </section>

          {/* FOOD */}
          <section className="patient-card">

            <div className="patient-card-header">

              <div>
                <p className="card-kicker">
                  DAILY INFORMATION
                </p>

                <h2>Food &amp; Daily Notes</h2>

                <p>
                  Information recorded in your latest
                  daily report.
                </p>
              </div>

              <Link
                to="/patient/daily-report"
                className="patient-text-button"
              >
                Update
                <ArrowRight size={16} />
              </Link>

            </div>

            <div className="dashboard-note-grid">

              <div className="dashboard-note-box">
                <div className="dashboard-note-title">
                  Food
                </div>

                <p>
                  {report?.food?.trim()
                    ? report.food
                    : "No food information submitted yet."}
                </p>
              </div>

              <div className="dashboard-note-box">
                <div className="dashboard-note-title">
                  Symptoms / Changes
                </div>

                <p>
                  {report?.symptoms?.trim()
                    ? report.symptoms
                    : "No symptoms or changes reported."}
                </p>
              </div>

            </div>

          </section>

          {/* MEDICATION */}
          <section className="patient-card">

            <div className="patient-card-header">

              <div>
                <p className="card-kicker">
                  MEDICATION
                </p>

                <h2>Today's Medication</h2>

                <p>
                  Track the medication information recorded
                  for you.
                </p>
              </div>

              <Link
                to="/patient/medications"
                className="patient-text-button"
              >
                View all
                <ArrowRight size={16} />
              </Link>

            </div>

            <div className="medication-row">

              <div className="medication-icon">
                <Pill size={21} />
              </div>

              <div className="medication-details">
                <strong>Medication records</strong>

                <span>
                  View your medication information.
                </span>
              </div>

              <Link
                to="/patient/medications"
                className="medication-status"
              >
                <CheckCircle2 size={16} />
                View
              </Link>

            </div>

          </section>

          {/* DOCTOR QUESTIONS */}
          <section className="patient-card dashboard-communication-card">

            <div className="communication-icon">
              <MessageCircleQuestion size={24} />
            </div>

            <div className="communication-content">

              <p className="card-kicker">
                DOCTOR COMMUNICATION
              </p>

              <h2>
                Stay connected with your doctor
              </h2>

              <p>
                Answer questions from your doctor or
                submit information about your current
                condition.
              </p>

              <Link
                to="/patient/questions"
                className="patient-secondary-button"
              >
                Open Doctor Questions
                <ArrowRight size={16} />
              </Link>

            </div>

          </section>

        </div>

        {/* RIGHT */}
        <aside className="patient-side-column">

          {/* APPOINTMENTS */}
          <section className="patient-card appointment-card">

            <div className="appointment-top">

              <div className="appointment-icon">
                <CalendarDays size={21} />
              </div>

              <span className="status-badge">
                Upcoming
              </span>

            </div>

            <p className="card-kicker">
              APPOINTMENTS
            </p>

            <h2>Your Appointments</h2>

            <p className="appointment-specialty">
              View your scheduled appointments.
            </p>

            <div className="appointment-info">
              <CalendarDays size={16} />

              <span>
                Appointment information
              </span>
            </div>

            <Link
              to="/patient/appointments"
              className="patient-secondary-button full-button"
            >
              View Appointments
            </Link>

          </section>

          {/* VOICE */}
          <section className="patient-card dashboard-voice-card">

            <div className="voice-icon">
              <Mic size={21} />
            </div>

            <p className="card-kicker">
              VOICE RESPONSE
            </p>

            <h2>
              Answer your doctor by voice
            </h2>

            <p>
              Record a response to a question from your
              care team.
            </p>

            <Link
              to="/patient/voice-responses"
              className="patient-primary-button full-button"
            >
              <Mic size={17} />
              Open Voice Responses
            </Link>

          </section>

          {/* TIMELINE */}
          <section className="patient-card">

            <div className="patient-card-header compact">

              <div>
                <p className="card-kicker">
                  RECENT ACTIVITY
                </p>

                <h2>My Timeline</h2>
              </div>

              <Link
                to="/patient/timeline"
                className="patient-text-button"
              >
                View
              </Link>

            </div>

            <div className="timeline-mini">

              {report ? (
                <div className="timeline-item">

                  <span className="timeline-dot" />

                  <div>
                    <strong>
                      Daily report submitted
                    </strong>

                    <span>
                      Latest report saved in CareTrack
                    </span>
                  </div>

                </div>
              ) : (
                <div className="timeline-item">

                  <span className="timeline-dot" />

                  <div>
                    <strong>
                      No daily report yet
                    </strong>

                    <span>
                      Submit your first daily report
                    </span>
                  </div>

                </div>
              )}

            </div>

          </section>

        </aside>

      </div>

      {/* QUICK ACTIONS */}
      <section className="patient-card quick-actions-card">

        <div className="quick-actions-heading">

          <div>
            <p className="card-kicker">
              QUICK ACTIONS
            </p>

            <h2>
              Manage your information
            </h2>

            <p>
              Quickly access the information you update
              most.
            </p>
          </div>

        </div>

        <div className="quick-action-grid">

          {/* MY NOTES */}
          <Link
            to="/patient/notes"
            className="quick-action"
          >
            <div className="quick-action-icon">
              <FileText size={21} />
            </div>

            <span>
              <strong>My Notes</strong>
              <small>
                View notes from your care team
              </small>
            </span>

            <ArrowRight size={17} />
          </Link>

          {/* MY INFORMATION */}
          <Link
            to="/patient/information"
            className="quick-action"
          >
            <div className="quick-action-icon">
              <FileText size={21} />
            </div>

            <span>
              <strong>My Information</strong>
              <small>
                View personal information
              </small>
            </span>

            <ArrowRight size={17} />
          </Link>

          {/* MY VITALS */}
          <Link
            to="/patient/vitals"
            className="quick-action"
          >
            <div className="quick-action-icon">
              <Activity size={21} />
            </div>

            <span>
              <strong>My Vitals</strong>
              <small>
                View recorded vitals
              </small>
            </span>

            <ArrowRight size={17} />
          </Link>

          {/* DAILY REPORT */}
          <Link
            to="/patient/daily-report"
            className="quick-action"
          >
            <div className="quick-action-icon">
              <ClipboardList size={21} />
            </div>

            <span>
              <strong>Daily Report</strong>
              <small>
                Update today's information
              </small>
            </span>

            <ArrowRight size={17} />
          </Link>

          {/* APPOINTMENTS */}
          <Link
            to="/patient/appointments"
            className="quick-action"
          >
            <div className="quick-action-icon">
              <CalendarDays size={21} />
            </div>

            <span>
              <strong>Appointments</strong>
              <small>
                View upcoming appointments
              </small>
            </span>

            <ArrowRight size={17} />
          </Link>

        </div>

      </section>

    </div>
  );
}
