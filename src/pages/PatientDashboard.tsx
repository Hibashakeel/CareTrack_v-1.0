import {
  Activity,
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  Droplets,
  FileText,
  HeartPulse,
  MessageCircleQuestion,
  Pill,
  UserRound,
} from "lucide-react";

import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { get, ref } from "firebase/database";

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
  dailyChanges?: string;
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

        const data = snapshot.val() as Record<
          string,
          DailyReport
        >;

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
    report?.condition?.trim()
      ? report.condition
      : "No condition reported";

  const pain =
    typeof report?.pain === "number"
      ? `${report.pain} / 10`
      : "—";

  const water =
    typeof report?.waterGlasses === "number"
      ? `${report.waterGlasses} glasses`
      : "—";

  const food =
    report?.food?.trim()
      ? report.food
      : "No food information";

  const symptoms =
    report?.symptoms?.trim()
      ? report.symptoms
      : "No symptoms reported";

  const dailyChanges =
    report?.dailyChanges?.trim()
      ? report.dailyChanges
      : "No daily changes reported";

  const reportCompleted = Boolean(report);

  return (
    <div className="patient-dashboard polished-dashboard">

      {/* =====================================================
          WELCOME
      ====================================================== */}

      <section className="pd-welcome">
        <div className="pd-welcome-content">
          <span className="pd-eyebrow">
            PATIENT OVERVIEW
          </span>

          <h1>
            Good morning, {firstName}
          </h1>

          <p>
            Keep your daily health information updated so
            your care team can stay informed.
          </p>
        </div>

        <div className="pd-welcome-status">
          <span className="pd-status-dot" />

          {reportCompleted
            ? "Latest report available"
            : "Daily report not submitted"}
        </div>
      </section>


      {/* =====================================================
          1. IMPORTANT ACTIONS
      ====================================================== */}

      <section className="pd-action-section">

        <div className="pd-section-heading">
          <div>
            <span className="pd-card-kicker">
              QUICK ACTIONS
            </span>

            <h2>
              What would you like to do?
            </h2>

            <p>
              Access your main patient activities directly.
            </p>
          </div>
        </div>

        <div className="pd-action-grid">

          {/* DAILY REPORT */}

          <Link
            to="/patient/daily-report"
            className="pd-action-card pd-action-primary"
          >
            <div className="pd-action-icon">
              <ClipboardList size={22} />
            </div>

            <div className="pd-action-content">
              <span>DAILY REPORT</span>

              <strong>
                {reportCompleted
                  ? "Update Daily Report"
                  : "Complete Daily Report"}
              </strong>

              <small>
                Record today's health information
              </small>
            </div>

            <ArrowRight
              size={18}
              className="pd-action-arrow"
            />
          </Link>


          {/* DOCTOR QUESTIONS */}

          <Link
            to="/patient/questions"
            className="pd-action-card"
          >
            <div className="pd-action-icon">
              <MessageCircleQuestion size={22} />
            </div>

            <div className="pd-action-content">
              <span>COMMUNICATION</span>

              <strong>
                Doctor Questions
              </strong>

              <small>
                Answer questions from your doctor
              </small>
            </div>

            <ArrowRight
              size={18}
              className="pd-action-arrow"
            />
          </Link>


          {/* MEDICATION */}

          <Link
            to="/patient/medications"
            className="pd-action-card"
          >
            <div className="pd-action-icon">
              <Pill size={22} />
            </div>

            <div className="pd-action-content">
              <span>MEDICATION</span>

              <strong>
                My Medications
              </strong>

              <small>
                View and update your medication status
              </small>
            </div>

            <ArrowRight
              size={18}
              className="pd-action-arrow"
            />
          </Link>


          {/* APPOINTMENTS */}

          <Link
            to="/patient/appointments"
            className="pd-action-card"
          >
            <div className="pd-action-icon">
              <CalendarDays size={22} />
            </div>

            <div className="pd-action-content">
              <span>APPOINTMENTS</span>

              <strong>
                View Appointments
              </strong>

              <small>
                Check your scheduled appointments
              </small>
            </div>

            <ArrowRight
              size={18}
              className="pd-action-arrow"
            />
          </Link>

        </div>
      </section>


      {/* =====================================================
          2. LATEST DAILY REPORT
      ====================================================== */}

      <section className="pd-card pd-report-card">

        <div className="pd-card-header">
          <div>
            <span className="pd-card-kicker">
              {report
                ? "LATEST DAILY REPORT"
                : "DAILY REPORT"}
            </span>

            <h2>
              Latest Daily Report
            </h2>

            <p>
              Your most recently submitted daily
              self-monitoring information.
            </p>
          </div>

          <Link
            to="/patient/daily-report"
            className="pd-link-button"
          >
            {report
              ? "Update report"
              : "Add report"}

            <ArrowRight size={16} />
          </Link>
        </div>


        <div className="pd-report-grid">

          {/* CONDITION */}

          <div className="pd-report-item">
            <div className="pd-report-icon">
              <Activity size={19} />
            </div>

            <div className="pd-report-content">
              <span>Current Condition</span>

              <strong>
                {loadingReport
                  ? "Loading..."
                  : condition}
              </strong>
            </div>
          </div>


          {/* PAIN */}

          <div className="pd-report-item">
            <div className="pd-report-icon">
              <HeartPulse size={19} />
            </div>

            <div className="pd-report-content">
              <span>Pain Level</span>

              <strong>
                {loadingReport
                  ? "Loading..."
                  : pain}
              </strong>
            </div>
          </div>


          {/* WATER */}

          <div className="pd-report-item">
            <div className="pd-report-icon">
              <Droplets size={19} />
            </div>

            <div className="pd-report-content">
              <span>Water Intake</span>

              <strong>
                {loadingReport
                  ? "Loading..."
                  : water}
              </strong>
            </div>
          </div>


          {/* SYMPTOMS */}

          <div className="pd-report-item">
            <div className="pd-report-icon">
              <FileText size={19} />
            </div>

            <div className="pd-report-content">
              <span>Symptoms</span>

              <strong title={symptoms}>
                {loadingReport
                  ? "Loading..."
                  : symptoms}
              </strong>
            </div>
          </div>


          {/* FOOD */}

          <div className="pd-report-item">
            <div className="pd-report-icon">
              <CheckCircle2 size={19} />
            </div>

            <div className="pd-report-content">
              <span>Food</span>

              <strong title={food}>
                {loadingReport
                  ? "Loading..."
                  : food}
              </strong>
            </div>
          </div>


          {/* DAILY CHANGES */}

          <div className="pd-report-item">
            <div className="pd-report-icon">
              <Activity size={19} />
            </div>

            <div className="pd-report-content">
              <span>Daily Changes</span>

              <strong title={dailyChanges}>
                {loadingReport
                  ? "Loading..."
                  : dailyChanges}
              </strong>
            </div>
          </div>

        </div>


        {/* REPORT FOOTER */}

        <div className="pd-report-footer">

          <div className="pd-report-footer-status">
            <span
              className={
                report
                  ? "pd-status-dot active"
                  : "pd-status-dot inactive"
              }
            />

            <span>
              {report
                ? "Report information is saved in CareTrack"
                : "No daily report has been submitted yet"}
            </span>
          </div>

          {report?.reportDate && (
            <span className="pd-report-date">
              Report date: {report.reportDate}
            </span>
          )}

        </div>

      </section>


      {/* =====================================================
          3. CARE INFORMATION
      ====================================================== */}

      <section className="pd-care-section">

        <div className="pd-section-heading">
          <div>
            <span className="pd-card-kicker">
              CARE INFORMATION
            </span>

            <h2>
              Your Care Information
            </h2>

            <p>
              View your medication, vitals, notes and
              personal information.
            </p>
          </div>
        </div>


        <div className="pd-care-grid">

          {/* MEDICATION */}

          <Link
            to="/patient/medications"
            className="pd-care-card"
          >
            <div className="pd-care-icon">
              <Pill size={21} />
            </div>

            <div className="pd-care-content">
              <strong>
                Medication
              </strong>

              <span>
                View your medication information
              </span>
            </div>

            <ArrowRight size={17} />
          </Link>


          {/* VITALS */}

          <Link
            to="/patient/vitals"
            className="pd-care-card"
          >
            <div className="pd-care-icon">
              <HeartPulse size={21} />
            </div>

            <div className="pd-care-content">
              <strong>
                My Vitals
              </strong>

              <span>
                View your recorded vital information
              </span>
            </div>

            <ArrowRight size={17} />
          </Link>


          {/* NOTES */}

          <Link
            to="/patient/notes"
            className="pd-care-card"
          >
            <div className="pd-care-icon">
              <FileText size={21} />
            </div>

            <div className="pd-care-content">
              <strong>
                My Notes
              </strong>

              <span>
                View notes from your care team
              </span>
            </div>

            <ArrowRight size={17} />
          </Link>


          {/* INFORMATION */}

          <Link
            to="/patient/information"
            className="pd-care-card"
          >
            <div className="pd-care-icon">
              <UserRound size={21} />
            </div>

            <div className="pd-care-content">
              <strong>
                My Information
              </strong>

              <span>
                View your personal information
              </span>
            </div>

            <ArrowRight size={17} />
          </Link>

        </div>

      </section>


      {/* =====================================================
          4. RECENT ACTIVITY
      ====================================================== */}

      <section className="pd-card pd-timeline-card">

        <div className="pd-card-header pd-compact-header">

          <div>
            <span className="pd-card-kicker">
              RECENT ACTIVITY
            </span>

            <h2>
              My Timeline
            </h2>

            <p>
              A quick look at your latest activity.
            </p>
          </div>

          <Link
            to="/patient/timeline"
            className="pd-link-button"
          >
            View Timeline

            <ArrowRight size={16} />
          </Link>

        </div>


        <div className="pd-timeline-preview">

          {report ? (
            <div className="pd-timeline-item">

              <span className="pd-timeline-dot" />

              <div>
                <strong>
                  Daily report submitted
                </strong>

                <span>
                  Your latest daily report is saved
                  in CareTrack.
                </span>
              </div>

            </div>
          ) : (
            <div className="pd-timeline-item">

              <span className="pd-timeline-dot inactive" />

              <div>
                <strong>
                  No daily report yet
                </strong>

                <span>
                  Submit your daily report to start
                  tracking your activity.
                </span>
              </div>

            </div>
          )}

        </div>

      </section>


      {/* =====================================================
          PAGE STYLES
      ====================================================== */}

      <style>{`

        /* =====================================================
           MAIN CONTAINER
        ====================================================== */

        .polished-dashboard {
          width: 100%;
          max-width: 1500px;
          margin: 0 auto;
          padding: 8px 0 32px;
          color: #172033;
          box-sizing: border-box;
        }


        /* =====================================================
           WELCOME
        ====================================================== */

        .pd-welcome {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 24px;
          padding: 27px 30px;
          margin-bottom: 22px;
          border: 1px solid #dceaf5;
          border-radius: 20px;
          background: linear-gradient(
            135deg,
            #f7fbff 0%,
            #eef7ff 100%
          );
        }

        .pd-welcome-content {
          min-width: 0;
        }

        .pd-eyebrow,
        .pd-card-kicker {
          display: block;
          margin-bottom: 7px;
          color: #5f7288;
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 0.09em;
        }

        .pd-welcome h1 {
          margin: 0;
          color: #14243a;
          font-size: clamp(25px, 3vw, 34px);
          line-height: 1.15;
          font-weight: 800;
        }

        .pd-welcome p {
          max-width: 650px;
          margin: 9px 0 0;
          color: #68798d;
          font-size: 14px;
          line-height: 1.6;
        }

        .pd-welcome-status {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          flex-shrink: 0;
          padding: 10px 13px;
          border: 1px solid #d9e5ee;
          border-radius: 10px;
          background: rgba(255,255,255,0.72);
          color: #52677c;
          font-size: 11px;
          font-weight: 700;
        }

        .pd-status-dot {
          width: 8px;
          height: 8px;
          flex-shrink: 0;
          border-radius: 50%;
          background: #6d8498;
        }

        .pd-status-dot.active {
          background: #4b8b5a;
        }

        .pd-status-dot.inactive {
          background: #a6b2bd;
        }


        /* =====================================================
           SECTION HEADING
        ====================================================== */

        .pd-section-heading {
          margin-bottom: 13px;
        }

        .pd-section-heading h2 {
          margin: 0;
          color: #17283d;
          font-size: 18px;
          line-height: 1.3;
          font-weight: 800;
        }

        .pd-section-heading p {
          margin: 5px 0 0;
          color: #718094;
          font-size: 13px;
          line-height: 1.55;
        }


        /* =====================================================
           ACTION CARDS
        ====================================================== */

        .pd-action-section {
          margin-bottom: 24px;
        }

        .pd-action-grid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 14px;
        }

        .pd-action-card {
          display: flex;
          align-items: center;
          gap: 12px;
          min-width: 0;
          padding: 16px;
          border: 1px solid #e0e8ef;
          border-radius: 15px;
          background: #ffffff;
          color: inherit;
          text-decoration: none;
          box-shadow: 0 4px 15px rgba(28, 49, 70, 0.035);
          transition:
            transform 0.2s ease,
            border-color 0.2s ease,
            box-shadow 0.2s ease;
        }

        .pd-action-card:hover {
          transform: translateY(-2px);
          border-color: #c7d8e7;
          box-shadow: 0 8px 22px rgba(28, 49, 70, 0.075);
        }

        .pd-action-primary {
          border-color: #cbdce9;
          background: linear-gradient(
            145deg,
            #ffffff 0%,
            #f3f8fc 100%
          );
        }

        .pd-action-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 43px;
          height: 43px;
          flex-shrink: 0;
          border-radius: 11px;
          background: #edf5fb;
          color: #245a89;
        }

        .pd-action-content {
          display: flex;
          flex: 1;
          flex-direction: column;
          min-width: 0;
        }

        .pd-action-content span {
          margin-bottom: 3px;
          color: #718397;
          font-size: 9px;
          font-weight: 800;
          letter-spacing: 0.07em;
        }

        .pd-action-content strong {
          overflow: hidden;
          color: #263a4e;
          font-size: 13px;
          font-weight: 800;
          line-height: 1.35;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .pd-action-content small {
          margin-top: 3px;
          overflow: hidden;
          color: #7b8b9b;
          font-size: 10px;
          line-height: 1.4;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .pd-action-arrow {
          flex-shrink: 0;
          color: #8293a3;
        }


        /* =====================================================
           COMMON CARD
        ====================================================== */

        .pd-card {
          padding: 22px;
          border: 1px solid #e3eaf1;
          border-radius: 17px;
          background: #ffffff;
          box-shadow: 0 5px 18px rgba(28, 49, 70, 0.045);
          box-sizing: border-box;
        }

        .pd-card-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 18px;
          margin-bottom: 20px;
        }

        .pd-card-header h2,
        .pd-card h2 {
          margin: 0;
          color: #17283d;
          font-size: 18px;
          line-height: 1.3;
          font-weight: 800;
        }

        .pd-card-header p {
          margin: 6px 0 0;
          color: #718094;
          font-size: 13px;
          line-height: 1.55;
        }

        .pd-compact-header {
          margin-bottom: 15px;
        }


        /* =====================================================
           LINKS
        ====================================================== */

        .pd-link-button {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          flex-shrink: 0;
          color: #245a89;
          font-size: 12px;
          font-weight: 700;
          text-decoration: none;
          white-space: nowrap;
          transition: 0.2s ease;
        }

        .pd-link-button:hover {
          color: #102f4e;
        }


        /* =====================================================
           LATEST REPORT
        ====================================================== */

        .pd-report-card {
          margin-bottom: 24px;
        }

        .pd-report-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 12px;
        }

        .pd-report-item {
          display: flex;
          align-items: center;
          gap: 12px;
          min-width: 0;
          padding: 15px;
          border: 1px solid #e7edf3;
          border-radius: 13px;
          background: #f9fbfd;
        }

        .pd-report-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 39px;
          height: 39px;
          flex-shrink: 0;
          border-radius: 10px;
          background: #edf5fb;
          color: #245a89;
        }

        .pd-report-content {
          min-width: 0;
        }

        .pd-report-content span {
          display: block;
          margin-bottom: 4px;
          color: #77879a;
          font-size: 11px;
          font-weight: 600;
        }

        .pd-report-content strong {
          display: block;
          overflow: hidden;
          color: #23364b;
          font-size: 13px;
          font-weight: 750;
          line-height: 1.4;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .pd-report-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 15px;
          margin-top: 14px;
          padding-top: 13px;
          border-top: 1px solid #edf1f5;
        }

        .pd-report-footer-status {
          display: flex;
          align-items: center;
          gap: 8px;
          min-width: 0;
          color: #758597;
          font-size: 11px;
        }

        .pd-report-date {
          flex-shrink: 0;
          color: #8795a3;
          font-size: 11px;
        }


        /* =====================================================
           CARE INFORMATION
        ====================================================== */

        .pd-care-section {
          margin-bottom: 24px;
        }

        .pd-care-grid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 13px;
        }

        .pd-care-card {
          display: flex;
          align-items: center;
          gap: 11px;
          min-width: 0;
          padding: 15px;
          border: 1px solid #e4ebf1;
          border-radius: 14px;
          background: #ffffff;
          color: inherit;
          text-decoration: none;
          transition: 0.2s ease;
        }

        .pd-care-card:hover {
          transform: translateY(-1px);
          border-color: #cbd9e6;
          background: #fbfdff;
        }

        .pd-care-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 41px;
          height: 41px;
          flex-shrink: 0;
          border-radius: 10px;
          background: #edf5fb;
          color: #245a89;
        }

        .pd-care-content {
          display: flex;
          flex: 1;
          flex-direction: column;
          min-width: 0;
        }

        .pd-care-content strong {
          color: #2c4055;
          font-size: 12px;
          font-weight: 800;
        }

        .pd-care-content span {
          margin-top: 3px;
          overflow: hidden;
          color: #7a8999;
          font-size: 10px;
          line-height: 1.4;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .pd-care-card > svg {
          flex-shrink: 0;
          color: #8291a1;
        }


        /* =====================================================
           TIMELINE
        ====================================================== */

        .pd-timeline-card {
          margin-bottom: 0;
        }

        .pd-timeline-preview {
          padding-top: 2px;
        }

        .pd-timeline-item {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          padding: 13px;
          border: 1px solid #e9eef3;
          border-radius: 12px;
          background: #f8fafc;
        }

        .pd-timeline-dot {
          width: 9px;
          height: 9px;
          margin-top: 5px;
          flex-shrink: 0;
          border-radius: 50%;
          background: #3f769e;
          box-shadow: 0 0 0 4px #eaf2f8;
        }

        .pd-timeline-dot.inactive {
          background: #a4b0ba;
          box-shadow: 0 0 0 4px #eef1f3;
        }

        .pd-timeline-item strong {
          display: block;
          color: #33485d;
          font-size: 12px;
        }

        .pd-timeline-item span {
          display: block;
          margin-top: 3px;
          color: #7a8998;
          font-size: 11px;
          line-height: 1.5;
        }


        /* =====================================================
           RESPONSIVE
        ====================================================== */

        @media (max-width: 1200px) {

          .pd-action-grid {
            grid-template-columns: repeat(
              2,
              minmax(0, 1fr)
            );
          }

          .pd-care-grid {
            grid-template-columns: repeat(
              2,
              minmax(0, 1fr)
            );
          }

        }


        @media (max-width: 800px) {

          .pd-welcome {
            flex-direction: column;
            align-items: flex-start;
          }

          .pd-welcome-status {
            width: 100%;
            box-sizing: border-box;
          }

          .pd-report-grid {
            grid-template-columns: 1fr;
          }

          .pd-care-grid {
            grid-template-columns: 1fr;
          }

        }


        @media (max-width: 600px) {

          .polished-dashboard {
            padding-bottom: 20px;
          }

          .pd-welcome {
            padding: 20px;
            border-radius: 15px;
          }

          .pd-action-grid {
            grid-template-columns: 1fr;
          }

          .pd-card {
            padding: 17px;
            border-radius: 14px;
          }

          .pd-card-header {
            flex-direction: column;
            gap: 10px;
          }

          .pd-link-button {
            align-self: flex-start;
          }

          .pd-report-footer {
            align-items: flex-start;
            flex-direction: column;
          }

        }


        @media (max-width: 420px) {

          .pd-action-card {
            padding: 14px;
          }

          .pd-action-content strong {
            font-size: 12px;
          }

          .pd-report-item {
            padding: 13px;
          }

        }

      `}</style>
    </div>
  );
}

