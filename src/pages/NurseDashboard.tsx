import {
  Activity,
  AlertCircle,
  BedDouble,
  Bell,
  CheckCircle2,
  ClipboardList,
  Clock3,
  HeartPulse,
  Users,
  ArrowRight,
} from "lucide-react";

import { Link } from "react-router-dom";

import "../role-dashboards.css";

const patients = [
  {
    id: "PT-1024",
    name: "Sarah Ahmed",
    room: "Room 204",
    condition: "Stable",
    report: "Submitted",
    time: "10 min ago",
  },
  {
    id: "PT-1025",
    name: "Ali Raza",
    room: "Room 207",
    condition: "Needs Attention",
    report: "Pending",
    time: "25 min ago",
  },
  {
    id: "PT-1026",
    name: "Ayesha Khan",
    room: "Room 210",
    condition: "Stable",
    report: "Submitted",
    time: "42 min ago",
  },
];

export default function NurseDashboard() {
  return (
    <div className="role-dashboard">

      {/* HEADER */}

      <div className="role-dashboard-header">

        <div>
          <p className="role-eyebrow">
            NURSE CARE CENTER
          </p>

          <h1>
            Good morning, Nurse 👋
          </h1>

          <p>
            Monitor patient updates, reports and daily care
            information from one place.
          </p>
        </div>

        <Link
          to="/nurse/patients"
          className="role-primary-button"
        >
          <Users size={17} />
          View Patients
        </Link>

      </div>


      {/* STAT CARDS */}

      <div className="role-stat-grid">

        <div className="role-stat-card">
          <div className="role-stat-icon">
            <Users size={21} />
          </div>

          <div>
            <span>Total Patients</span>
            <strong>24</strong>
            <small>Currently admitted</small>
          </div>
        </div>


        <div className="role-stat-card">
          <div className="role-stat-icon">
            <ClipboardList size={21} />
          </div>

          <div>
            <span>Reports Today</span>
            <strong>18</strong>
            <small>6 still pending</small>
          </div>
        </div>


        <div className="role-stat-card">
          <div className="role-stat-icon">
            <HeartPulse size={21} />
          </div>

          <div>
            <span>Vitals Updated</span>
            <strong>21</strong>
            <small>87% completed</small>
          </div>
        </div>


        <div className="role-stat-card">
          <div className="role-stat-icon">
            <AlertCircle size={21} />
          </div>

          <div>
            <span>Needs Attention</span>
            <strong>3</strong>
            <small>Review patient updates</small>
          </div>
        </div>

      </div>


      {/* MAIN GRID */}

      <div className="role-main-grid">

        {/* PATIENT TABLE */}

        <section className="role-card">

          <div className="role-card-header">

            <div>
              <h2>Patient Overview</h2>
              <p>
                Latest patient monitoring information
              </p>
            </div>

            <Link to="/nurse/patients">
              View all
              <ArrowRight size={15} />
            </Link>

          </div>


          <div className="role-patient-list">

            {patients.map((patient) => (

              <div
                className="role-patient-row"
                key={patient.id}
              >

                <div className="role-patient-avatar">
                  {patient.name
                    .split(" ")
                    .map((name) => name[0])
                    .join("")}
                </div>

                <div className="role-patient-info">

                  <strong>
                    {patient.name}
                  </strong>

                  <span>
                    {patient.id} • {patient.room}
                  </span>

                </div>


                <div
                  className={`role-condition ${
                    patient.condition === "Stable"
                      ? "stable"
                      : "attention"
                  }`}
                >
                  {patient.condition}
                </div>


                <div className="role-report-status">

                  {patient.report === "Submitted" ? (
                    <CheckCircle2 size={16} />
                  ) : (
                    <Clock3 size={16} />
                  )}

                  <span>
                    {patient.report}
                  </span>

                </div>


                <small className="role-time">
                  {patient.time}
                </small>

              </div>

            ))}

          </div>

        </section>


        {/* RIGHT SIDE */}

        <div className="role-side-column">

          {/* ATTENTION CARD */}

          <section className="role-card role-attention-card">

            <div className="role-card-header">
              <div>
                <h2>Needs Attention</h2>
                <p>
                  Patient updates requiring review
                </p>
              </div>

              <AlertCircle size={21} />

            </div>


            <div className="role-attention-item">

              <div className="role-attention-number">
                01
              </div>

              <div>
                <strong>
                  Ali Raza
                </strong>

                <span>
                  Daily report is pending
                </span>
              </div>

            </div>


            <div className="role-attention-item">

              <div className="role-attention-number">
                02
              </div>

              <div>
                <strong>
                  Room 212
                </strong>

                <span>
                  Vitals update required
                </span>
              </div>

            </div>


            <div className="role-attention-item">

              <div className="role-attention-number">
                03
              </div>

              <div>
                <strong>
                  Sarah Ahmed
                </strong>

                <span>
                  New patient message
                </span>
              </div>

            </div>

          </section>


          {/* SHIFT CARD */}

          <section className="role-card role-shift-card">

            <div className="role-shift-icon">
              <Activity size={22} />
            </div>

            <div>
              <span>Current Shift</span>

              <strong>
                Morning Shift
              </strong>

              <small>
                08:00 AM – 04:00 PM
              </small>
            </div>

          </section>

        </div>

      </div>


      {/* QUICK ACTIONS */}

      <section className="role-card">

        <div className="role-card-header">

          <div>
            <h2>Quick Actions</h2>
            <p>
              Common tasks for patient monitoring
            </p>
          </div>

        </div>


        <div className="role-quick-actions">

          <Link to="/nurse/patients">
            <Users size={20} />
            <span>View Patients</span>
          </Link>

          <Link to="/nurse/reports">
            <ClipboardList size={20} />
            <span>Patient Reports</span>
          </Link>

          <Link to="/nurse/vitals">
            <HeartPulse size={20} />
            <span>Update Vitals</span>
          </Link>

          <Link to="/nurse/notifications">
            <Bell size={20} />
            <span>Notifications</span>
          </Link>

        </div>

      </section>

    </div>
  );
}