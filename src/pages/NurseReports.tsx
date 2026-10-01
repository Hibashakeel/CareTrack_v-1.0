import {
  ClipboardList,
  CheckCircle2,
  Clock3,
  AlertCircle,
  FileText,
  ArrowRight,
} from "lucide-react";

import { Link } from "react-router-dom";

import "../role-dashboards.css";

const reports = [
  {
    patient: "Sarah Ahmed",
    id: "PT-1024",
    type: "Daily Health Report",
    status: "Submitted",
    time: "10 min ago",
    summary: "Patient reported stable condition and adequate water intake.",
  },
  {
    patient: "Ali Raza",
    id: "PT-1025",
    type: "Daily Health Report",
    status: "Pending",
    time: "25 min ago",
    summary: "Patient has not submitted today's report yet.",
  },
  {
    patient: "Ayesha Khan",
    id: "PT-1026",
    type: "Daily Health Report",
    status: "Submitted",
    time: "42 min ago",
    summary: "Patient reported mild discomfort and normal appetite.",
  },
  {
    patient: "Usman Tariq",
    id: "PT-1027",
    type: "Daily Health Report",
    status: "Review",
    time: "1 hour ago",
    summary: "New symptoms were added to the patient's daily update.",
  },
];

export default function NurseReports() {
  return (
    <div className="role-dashboard">

      {/* HEADER */}

      <div className="role-dashboard-header">

        <div>
          <p className="role-eyebrow">
            PATIENT MONITORING
          </p>

          <h1>
            Patient Reports
          </h1>

          <p>
            Review daily information submitted by patients.
          </p>
        </div>

        <div
          className="role-primary-button"
          style={{ cursor: "default" }}
        >
          <ClipboardList size={17} />
          Today's Reports
        </div>

      </div>


      {/* SUMMARY */}

      <div className="role-stat-grid">

        <div className="role-stat-card">

          <div className="role-stat-icon">
            <ClipboardList size={21} />
          </div>

          <div>
            <span>Total Reports</span>
            <strong>24</strong>
            <small>Today's patient reports</small>
          </div>

        </div>


        <div className="role-stat-card">

          <div className="role-stat-icon">
            <CheckCircle2 size={21} />
          </div>

          <div>
            <span>Submitted</span>
            <strong>18</strong>
            <small>Reports received</small>
          </div>

        </div>


        <div className="role-stat-card">

          <div className="role-stat-icon">
            <Clock3 size={21} />
          </div>

          <div>
            <span>Pending</span>
            <strong>5</strong>
            <small>Waiting for patient update</small>
          </div>

        </div>


        <div className="role-stat-card">

          <div className="role-stat-icon">
            <AlertCircle size={21} />
          </div>

          <div>
            <span>For Review</span>
            <strong>1</strong>
            <small>New information available</small>
          </div>

        </div>

      </div>


      {/* REPORT LIST */}

      <section className="role-card">

        <div className="role-card-header">

          <div>
            <h2>
              Recent Patient Reports
            </h2>

            <p>
              Patient-submitted information for nursing review
            </p>
          </div>

          <FileText
            size={21}
            color="#159a9c"
          />

        </div>


        <div className="role-patient-list">

          {reports.map((report) => (

            <div
              key={`${report.id}-${report.type}`}
              style={{
                display: "grid",
                gridTemplateColumns:
                  "minmax(180px, 1fr) 180px 120px 100px",
                alignItems: "center",
                gap: "18px",
                padding: "17px 0",
                borderTop: "1px solid #edf3f6",
              }}
            >

              {/* PATIENT */}

              <div className="role-patient-info">

                <strong>
                  {report.patient}
                </strong>

                <span>
                  {report.id}
                </span>

              </div>


              {/* REPORT */}

              <div className="role-patient-info">

                <strong>
                  {report.type}
                </strong>

                <span>
                  {report.summary}
                </span>

              </div>


              {/* STATUS */}

              <div
                className={`role-condition ${
                  report.status === "Submitted"
                    ? "stable"
                    : report.status === "Pending"
                    ? "attention"
                    : "attention"
                }`}
              >
                {report.status}
              </div>


              {/* ACTION */}

              <Link
                to={`/demo/nurse/reports/${report.id}`}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "5px",
                  color: "#159a9c",
                  textDecoration: "none",
                  fontSize: "11px",
                  fontWeight: 700,
                }}
              >
                Review
                <ArrowRight size={14} />
              </Link>

            </div>

          ))}

        </div>

      </section>


      {/* INFORMATION NOTE */}

      <section
        className="role-card"
        style={{
          background: "#f7fcfd",
        }}
      >

        <div
          style={{
            display: "flex",
            gap: "13px",
            alignItems: "flex-start",
          }}
        >

          <FileText
            size={21}
            color="#159a9c"
          />

          <div>

            <h2
              style={{
                margin: "0 0 6px",
                color: "#183b56",
                fontSize: "15px",
              }}
            >
              About Patient Reports
            </h2>

            <p
              style={{
                margin: 0,
                color: "#718696",
                fontSize: "12px",
                lineHeight: 1.6,
              }}
            >
              These reports contain information entered by patients,
              such as pain level, food intake, water consumption,
              symptoms and changes in daily condition. CareTrack
              supports monitoring and communication; it does not
              automatically diagnose or recommend treatment.
            </p>

          </div>

        </div>

      </section>

    </div>
  );
}