import {
  Search,
  UserRound,
  BedDouble,
  Activity,
  ArrowRight,
} from "lucide-react";

import { Link } from "react-router-dom";

import "../role-dashboards.css";

const patients = [
  {
    id: "PT-1024",
    name: "Sarah Ahmed",
    room: "204",
    ward: "General Ward",
    condition: "Stable",
    lastUpdate: "10 min ago",
  },
  {
    id: "PT-1025",
    name: "Ali Raza",
    room: "207",
    ward: "General Ward",
    condition: "Needs Attention",
    lastUpdate: "25 min ago",
  },
  {
    id: "PT-1026",
    name: "Ayesha Khan",
    room: "210",
    ward: "Private Ward",
    condition: "Stable",
    lastUpdate: "42 min ago",
  },
  {
    id: "PT-1027",
    name: "Usman Tariq",
    room: "215",
    ward: "General Ward",
    condition: "Stable",
    lastUpdate: "1 hour ago",
  },
];

export default function NursePatients() {
  return (
    <div className="role-dashboard">

      <div className="role-dashboard-header">
        <div>
          <p className="role-eyebrow">PATIENT MANAGEMENT</p>
          <h1>Patients</h1>
          <p>
            View patients assigned to your current care area.
          </p>
        </div>
      </div>

      <section className="role-card">

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            padding: "11px 14px",
            border: "1px solid #dceaf2",
            borderRadius: "10px",
            marginBottom: "18px",
          }}
        >
          <Search size={17} color="#8293a0" />

          <input
            type="text"
            placeholder="Search patient by name or ID..."
            style={{
              border: "none",
              outline: "none",
              width: "100%",
              fontSize: "13px",
              color: "#183b56",
              background: "transparent",
            }}
          />
        </div>

        <div className="role-patient-list">

          {patients.map((patient) => (
            <div
              className="role-patient-row"
              key={patient.id}
              style={{
                gridTemplateColumns:
                  "42px minmax(160px, 1fr) 120px 120px 110px",
              }}
            >

              <div className="role-patient-avatar">
                <UserRound size={17} />
              </div>

              <div className="role-patient-info">
                <strong>{patient.name}</strong>
                <span>{patient.id}</span>
              </div>

              <div className="role-patient-info">
                <strong>
                  <BedDouble
                    size={13}
                    style={{ verticalAlign: "middle" }}
                  />{" "}
                  Room {patient.room}
                </strong>
                <span>{patient.ward}</span>
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

              <Link
                to={`/demo/nurse/patients/${patient.id}`}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "5px",
                  color: "#006ee6",
                  textDecoration: "none",
                  fontSize: "11px",
                  fontWeight: 700,
                }}
              >
                View
                <ArrowRight size={14} />
              </Link>

            </div>
          ))}

        </div>

      </section>

      <section className="role-card">

        <div className="role-card-header">
          <div>
            <h2>Patient Monitoring</h2>
            <p>
              CareTrack allows nurses to review patient-reported
              information without making automated treatment decisions.
            </p>
          </div>

          <Activity size={21} color="#006ee6" />
        </div>

      </section>

    </div>
  );
}