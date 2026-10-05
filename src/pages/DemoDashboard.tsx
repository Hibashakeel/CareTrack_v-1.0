import { useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import {
  Activity,
  ArrowRight,
  BedDouble,
  Bell,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  FileText,
  HeartPulse,
  LayoutDashboard,
  LogOut,
  MessageCircleQuestion,
  Mic,
  Search,
  Settings,
  ShieldCheck,
  Stethoscope,
  UserCheck,
  Users,
} from "lucide-react";

type DemoRole = "patient" | "nurse" | "doctor" | "admin";

const demoPatient = {
  name: "Sarah Ahmed",
  email: "sarah.ahmed@example.com",
  ward: "Medical Ward",
  room: "204",
  bed: "B",
  condition: "Stable",
  pain: "2 / 10",
  water: "6 glasses",
  medication: "Morning medication taken",
};

const demoPatients = [
  {
    id: "p1",
    name: "Sarah Ahmed",
    ward: "Medical Ward",
    room: "204",
    bed: "B",
    severity: "Stable",
    report: "Feeling better today",
  },
  {
    id: "p2",
    name: "Ali Hassan",
    ward: "Surgical Ward",
    room: "118",
    bed: "A",
    severity: "Needs Attention",
    report: "Reported mild discomfort",
  },
  {
    id: "p3",
    name: "Ayesha Khan",
    ward: "Medical Ward",
    room: "212",
    bed: "C",
    severity: "Urgent",
    report: "Requires nurse review",
  },
];

function StatCard({
  icon: Icon,
  value,
  label,
}: {
  icon: typeof Activity;
  value: string;
  label: string;
}) {
  return (
    <div className="demo-stat-card">
      <div className="demo-stat-icon">
        <Icon size={21} />
      </div>

      <div>
        <strong>{value}</strong>
        <span>{label}</span>
      </div>
    </div>
  );
}

function SectionTitle({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="demo-section-title">
      <div>
        <h2>{title}</h2>
        {subtitle && <p>{subtitle}</p>}
      </div>
    </div>
  );
}

function PatientDashboard() {
  return (
    <>
      <div className="demo-welcome">
        <div>
          <span className="demo-eyebrow">PATIENT OVERVIEW</span>

          <h1>Good morning, Sarah</h1>

          <p>
            Keep your daily health information updated and stay connected with
            your healthcare team.
          </p>
        </div>

        <Link
          to="/demo/patient/daily-report"
          className="demo-primary-button"
        >
          <ClipboardList size={18} />
          Add Daily Report
        </Link>
      </div>

      <div className="demo-stats-grid">
        <StatCard
          icon={CheckCircle2}
          value="Submitted"
          label="Today's Report"
        />

        <StatCard
          icon={Activity}
          value="6"
          label="Water Glasses"
        />

        <StatCard
          icon={HeartPulse}
          value="2 / 10"
          label="Pain Level"
        />

        <StatCard
          icon={CalendarDays}
          value="2"
          label="Appointments"
        />
      </div>

      <div className="demo-two-column">
        <section className="demo-panel">
          <SectionTitle
            title="Daily Health Summary"
            subtitle="Your latest self-reported information"
          />

          <div className="demo-info-grid">
            <div>
              <span>Condition</span>
              <strong>{demoPatient.condition}</strong>
            </div>

            <div>
              <span>Pain Level</span>
              <strong>{demoPatient.pain}</strong>
            </div>

            <div>
              <span>Water Intake</span>
              <strong>{demoPatient.water}</strong>
            </div>

            <div>
              <span>Medication</span>
              <strong>{demoPatient.medication}</strong>
            </div>
          </div>
        </section>

        <section className="demo-panel">
          <SectionTitle
            title="Doctor Communication"
            subtitle="Stay connected with your doctor"
          />

          <div className="demo-action-list">
            <Link to="/demo/patient/questions">
              <MessageCircleQuestion size={20} />

              <div>
                <strong>Doctor Questions</strong>
                <span>View and answer questions</span>
              </div>

              <ArrowRight size={18} />
            </Link>

            <Link to="/demo/patient/voice-responses">
              <Mic size={20} />

              <div>
                <strong>Voice Response</strong>
                <span>Send a voice response</span>
              </div>

              <ArrowRight size={18} />
            </Link>
          </div>
        </section>
      </div>

      <section className="demo-panel">
        <SectionTitle
          title="Quick Actions"
          subtitle="Frequently used patient features"
        />

        <div className="demo-quick-grid">
          <Link to="/demo/patient/daily-report">
            <ClipboardList size={22} />
            <strong>Daily Report</strong>
            <span>Submit today's health update</span>
          </Link>

          <Link to="/demo/patient/vitals">
            <HeartPulse size={22} />
            <strong>My Vitals</strong>
            <span>View recorded vital information</span>
          </Link>

          <Link to="/demo/patient/medications">
            <PillIcon />
            <strong>Medications</strong>
            <span>Review medication information</span>
          </Link>

          <Link to="/demo/patient/appointments">
            <CalendarDays size={22} />
            <strong>Appointments</strong>
            <span>View upcoming appointments</span>
          </Link>
        </div>
      </section>
    </>
  );
}

function PillIcon() {
  return <Activity size={22} />;
}

function NurseDashboard() {
  return (
    <>
      <div className="demo-welcome">
        <div>
          <span className="demo-eyebrow">NURSE OVERVIEW</span>

          <h1>Good morning, Nurse</h1>

          <p>
            Monitor patient conditions, review daily reports and prioritize
            patients who need attention.
          </p>
        </div>

        <Link
          to="/demo/nurse/patients"
          className="demo-primary-button"
        >
          <Users size={18} />
          View Patients
        </Link>
      </div>

      <div className="demo-stats-grid">
        <StatCard
          icon={Users}
          value="24"
          label="Total Patients"
        />

        <StatCard
          icon={CheckCircle2}
          value="18"
          label="Stable"
        />

        <StatCard
          icon={Activity}
          value="4"
          label="Needs Attention"
        />

        <StatCard
          icon={HeartPulse}
          value="2"
          label="Urgent"
        />
      </div>

      <div className="demo-two-column">
        <section className="demo-panel">
          <SectionTitle
            title="Patients Requiring Attention"
            subtitle="Prioritized patient overview"
          />

          <div className="demo-patient-list">
            {demoPatients.map((patient) => (
              <div className="demo-patient-row" key={patient.id}>
                <div className="demo-avatar">
                  {patient.name.charAt(0)}
                </div>

                <div className="demo-patient-main">
                  <strong>{patient.name}</strong>

                  <span>
                    {patient.ward} · Room {patient.room} · Bed {patient.bed}
                  </span>
                </div>

                <span
                  className={`demo-severity ${
                    patient.severity === "Urgent"
                      ? "urgent"
                      : patient.severity === "Needs Attention"
                        ? "attention"
                        : "stable"
                  }`}
                >
                  {patient.severity}
                </span>

                <Link to="/demo/nurse/patients">
                  View
                </Link>
              </div>
            ))}
          </div>
        </section>

        <section className="demo-panel">
          <SectionTitle
            title="Today's Tasks"
            subtitle="Your nursing activity"
          />

          <div className="demo-task-list">
            <div>
              <CheckCircle2 size={20} />
              <span>Review morning patient reports</span>
              <strong>12</strong>
            </div>

            <div>
              <HeartPulse size={20} />
              <span>Check scheduled vitals</span>
              <strong>8</strong>
            </div>

            <div>
              <FileText size={20} />
              <span>Update nursing notes</span>
              <strong>5</strong>
            </div>

            <div>
              <Bell size={20} />
              <span>Pending notifications</span>
              <strong>3</strong>
            </div>
          </div>
        </section>
      </div>

      <section className="demo-panel">
        <SectionTitle
          title="Nursing Quick Access"
          subtitle="Frequently used sections"
        />

        <div className="demo-quick-grid">
          <Link to="/demo/nurse/patients">
            <Users size={22} />
            <strong>Patients</strong>
            <span>Browse patient records</span>
          </Link>

          <Link to="/demo/nurse/reports">
            <ClipboardList size={22} />
            <strong>Patient Reports</strong>
            <span>Review daily health reports</span>
          </Link>

          <Link to="/demo/nurse/vitals">
            <HeartPulse size={22} />
            <strong>Vitals</strong>
            <span>Review patient vital information</span>
          </Link>

          <Link to="/demo/nurse/notes">
            <FileText size={22} />
            <strong>Notes</strong>
            <span>Manage nursing notes</span>
          </Link>
        </div>
      </section>
    </>
  );
}

function DoctorDashboard() {
  return (
    <>
      <div className="demo-welcome">
        <div>
          <span className="demo-eyebrow">DOCTOR OVERVIEW</span>

          <h1>Good morning, Doctor</h1>

          <p>
            Review patient records, monitor health reports and communicate with
            patients through CareTrack.
          </p>
        </div>

        <Link
          to="/demo/doctor/patients"
          className="demo-primary-button"
        >
          <Users size={18} />
          View Patients
        </Link>
      </div>

      <div className="demo-stats-grid">
        <StatCard
          icon={Users}
          value="24"
          label="Total Patients"
        />

        <StatCard
          icon={ClipboardList}
          value="18"
          label="Daily Reports"
        />

        <StatCard
          icon={HeartPulse}
          value="21"
          label="Patient Vitals"
        />

        <StatCard
          icon={Bell}
          value="5"
          label="Notifications"
        />
      </div>

      <section className="demo-panel">
        <SectionTitle
          title="Recent Patient Records"
          subtitle="Recently updated patient information"
        />

        <div className="demo-table-wrap">
          <table className="demo-table">
            <thead>
              <tr>
                <th>Patient</th>
                <th>Ward</th>
                <th>Latest Report</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>

            <tbody>
              {demoPatients.map((patient) => (
                <tr key={patient.id}>
                  <td>
                    <div className="demo-table-person">
                      <div className="demo-avatar">
                        {patient.name.charAt(0)}
                      </div>

                      <strong>{patient.name}</strong>
                    </div>
                  </td>

                  <td>{patient.ward}</td>

                  <td>{patient.report}</td>

                  <td>
                    <span
                      className={`demo-severity ${
                        patient.severity === "Urgent"
                          ? "urgent"
                          : patient.severity === "Needs Attention"
                            ? "attention"
                            : "stable"
                      }`}
                    >
                      {patient.severity}
                    </span>
                  </td>

                  <td>
                    <Link to="/demo/doctor/patients">
                      View Patient
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="demo-panel">
        <SectionTitle
          title="Clinical Quick Access"
          subtitle="Access important patient communication and records"
        />

        <div className="demo-quick-grid">
          <Link to="/demo/doctor/patients">
            <Users size={22} />
            <strong>Patient Records</strong>
            <span>Review patient information</span>
          </Link>

          <Link to="/demo/doctor/questions">
            <MessageCircleQuestion size={22} />
            <strong>Doctor Questions</strong>
            <span>Ask questions from patient records</span>
          </Link>

          <Link to="/demo/doctor/voice-responses">
            <Mic size={22} />
            <strong>Voice Responses</strong>
            <span>Review patient voice communication</span>
          </Link>

          <Link to="/demo/doctor/appointments">
            <CalendarDays size={22} />
            <strong>Appointments</strong>
            <span>View scheduled appointments</span>
          </Link>
        </div>
      </section>
    </>
  );
}

function AdminDashboard() {
  return (
    <>
      <div className="demo-welcome">
        <div>
          <span className="demo-eyebrow">
            ADMINISTRATION OVERVIEW
          </span>

          <h1>Welcome, Administrator</h1>

          <p>
            Manage CareTrack users, hospital resources, admissions and system
            activity.
          </p>
        </div>

        <Link
          to="/demo/admin/settings"
          className="demo-primary-button"
        >
          <Settings size={18} />
          System Settings
        </Link>
      </div>

      <div className="demo-stats-grid">
        <StatCard
          icon={Users}
          value="148"
          label="Total Users"
        />

        <StatCard
          icon={UserCheck}
          value="12"
          label="Pending Requests"
        />

        <StatCard
          icon={Stethoscope}
          value="18"
          label="Doctors"
        />

        <StatCard
          icon={HeartPulse}
          value="34"
          label="Nurses"
        />
      </div>

      <div className="demo-two-column">
        <section className="demo-panel">
          <SectionTitle
            title="Staff Registration Requests"
            subtitle="Requests waiting for administrator review"
          />

          <div className="demo-request-list">
            <div className="demo-request">
              <div className="demo-avatar">A</div>

              <div>
                <strong>Dr. Ahmed Khan</strong>
                <span>Doctor · ahmed@example.com</span>
              </div>

              <span className="demo-pending">
                Pending
              </span>
            </div>

            <div className="demo-request">
              <div className="demo-avatar">M</div>

              <div>
                <strong>Maria Ali</strong>
                <span>Nurse · maria@example.com</span>
              </div>

              <span className="demo-pending">
                Pending
              </span>
            </div>
          </div>

          <Link
            to="/demo/admin/doctors"
            className="demo-panel-link"
          >
            Manage Staff
            <ArrowRight size={17} />
          </Link>
        </section>

        <section className="demo-panel">
          <SectionTitle
            title="Hospital Overview"
            subtitle="Current system information"
          />

          <div className="demo-admin-grid">
            <div>
              <BedDouble size={21} />
              <strong>8</strong>
              <span>Active Wards</span>
            </div>

            <div>
              <Activity size={21} />
              <strong>126</strong>
              <span>Active Admissions</span>
            </div>

            <div>
              <CalendarDays size={21} />
              <strong>17</strong>
              <span>Today's Appointments</span>
            </div>

            <div>
              <ShieldCheck size={21} />
              <strong>98%</strong>
              <span>System Activity</span>
            </div>
          </div>
        </section>
      </div>

      <section className="demo-panel">
        <SectionTitle
          title="Administration Quick Access"
          subtitle="Manage major areas of the platform"
        />

        <div className="demo-quick-grid">
          <Link to="/demo/admin/patients">
            <Users size={22} />
            <strong>Patients</strong>
            <span>Manage patient accounts</span>
          </Link>

          <Link to="/demo/admin/admissions">
            <BedDouble size={22} />
            <strong>Admissions</strong>
            <span>Review active admissions</span>
          </Link>

          <Link to="/demo/admin/doctors">
            <Stethoscope size={22} />
            <strong>Doctors</strong>
            <span>Manage doctor accounts</span>
          </Link>

          <Link to="/demo/admin/nurses">
            <HeartPulse size={22} />
            <strong>Nurses</strong>
            <span>Manage nursing accounts</span>
          </Link>

          <Link to="/demo/admin/reports">
            <ClipboardList size={22} />
            <strong>Reports</strong>
            <span>View system reports</span>
          </Link>

          <Link to="/demo/admin/audit-logs">
            <ShieldCheck size={22} />
            <strong>Audit Logs</strong>
            <span>Review system activity</span>
          </Link>
        </div>
      </section>
    </>
  );
}

function DemoEmptyPage({
  role,
  page,
}: {
  role: DemoRole;
  page: string;
}) {
  const prettyPage = page
    .split("-")
    .map(
      (word) =>
        word.charAt(0).toUpperCase() + word.slice(1)
    )
    .join(" ");

  return (
    <section className="demo-empty-page">
      <div className="demo-empty-icon">
        <Search size={30} />
      </div>

      <span className="demo-eyebrow">
        DEMO SECTION
      </span>

      <h1>{prettyPage}</h1>

      <p>
        This is a preview of the {role}{" "}
        {prettyPage.toLowerCase()} section. Demo mode uses sample
        information only and does not change your Firebase data.
      </p>

      <Link
        to={`/demo/${role}`}
        className="demo-primary-button"
      >
        <LayoutDashboard size={18} />
        Back to Dashboard
      </Link>
    </section>
  );
}

export default function DemoDashboard() {
  const { role, "*": wildcard } = useParams<{
    role?: string;
    "*": string | undefined;
  }>();

  const currentRole: DemoRole =
    role === "patient" ||
    role === "nurse" ||
    role === "doctor" ||
    role === "admin"
      ? role
      : "patient";

  const currentPage = useMemo(() => {
    const path = wildcard || "";

    if (!path) {
      return "dashboard";
    }

    return path.split("/")[0];
  }, [wildcard]);

  const renderContent = () => {
    if (currentPage === "dashboard") {
      if (currentRole === "patient") {
        return <PatientDashboard />;
      }

      if (currentRole === "nurse") {
        return <NurseDashboard />;
      }

      if (currentRole === "doctor") {
        return <DoctorDashboard />;
      }

      return <AdminDashboard />;
    }

    return (
      <DemoEmptyPage
        role={currentRole}
        page={currentPage}
      />
    );
  };

  return (
    <div
      className={`demo-interface demo-role-${currentRole}`}
    >
      <style>{`
        .demo-interface {
          min-height: 100vh;
          background: #f4f8f8;
          color: #173b5d;
          font-family: Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        }

        .demo-interface * {
          box-sizing: border-box;
        }

        .demo-topbar {
          height: 70px;
          background: #ffffff;
          border-bottom: 1px solid #dfeceb;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 28px;
          position: sticky;
          top: 0;
          z-index: 20;
        }

        .demo-brand {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .demo-brand-mark {
          width: 40px;
          height: 40px;
          border-radius: 12px;
          display: grid;
          place-items: center;
          background: #0056dd;
          color: white;
        }

        .demo-brand strong {
          font-size: 18px;
          display: block;
          color: #173b5d;
        }

        .demo-brand span {
          color: #778290;
          font-size: 12px;
        }

        .demo-top-actions {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .demo-mode-badge {
          background: #e8f7f5;
          color: #0056dd;
          border: 1px solid #cad9ec;
          border-radius: 999px;
          padding: 8px 13px;
          font-size: 12px;
          font-weight: 700;
        }

        .demo-exit {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          text-decoration: none;
          color: #525c69;
          border: 1px solid #dbe7e6;
          background: white;
          padding: 9px 13px;
          border-radius: 9px;
          font-size: 13px;
          font-weight: 700;
        }

        .demo-exit:hover {
          background: #f5fbfa;
          color: #0056dd;
        }

        /*
          No sidebar is rendered here.
          The existing real system sidebar remains untouched.
        */

        .demo-main {
          width: 100%;
          min-width: 0;
          padding: 30px;
          max-width: 1500px;
          margin: 0 auto;
        }

        .demo-welcome {
          background: linear-gradient(135deg, #0056dd, #064494);
          color: white;
          border-radius: 18px;
          padding: 28px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 20px;
          margin-bottom: 22px;
          box-shadow: 0 12px 30px rgba(15, 118, 110, .16);
        }

        .demo-eyebrow {
          font-size: 10px;
          font-weight: 800;
          letter-spacing: .1em;
          opacity: .82;
        }

        .demo-welcome h1 {
          margin: 8px 0;
          font-size: 27px;
          letter-spacing: -.02em;
        }

        .demo-welcome p {
          margin: 0;
          max-width: 650px;
          color: rgba(255,255,255,.86);
          font-size: 14px;
          line-height: 1.6;
        }

        .demo-primary-button {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          background: white;
          color: #0056dd;
          text-decoration: none;
          padding: 11px 16px;
          border-radius: 10px;
          font-size: 13px;
          font-weight: 800;
          white-space: nowrap;
        }

        .demo-primary-button:hover {
          background: #f0fdfa;
        }

        .demo-stats-grid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 15px;
          margin-bottom: 22px;
        }

        .demo-stat-card {
          background: white;
          border: 1px solid #dfeceb;
          border-radius: 14px;
          padding: 18px;
          display: flex;
          align-items: center;
          gap: 13px;
        }

        .demo-stat-icon {
          width: 43px;
          height: 43px;
          display: grid;
          place-items: center;
          border-radius: 11px;
          background: #e8f7f5;
          color: #0056dd;
          flex-shrink: 0;
        }

        .demo-stat-card strong {
          display: block;
          font-size: 20px;
          color: #173b5d;
        }

        .demo-stat-card span {
          display: block;
          margin-top: 3px;
          font-size: 11px;
          color: #778290;
        }

        .demo-two-column {
          display: grid;
          grid-template-columns: 1.35fr 1fr;
          gap: 20px;
          margin-bottom: 22px;
        }

        .demo-panel {
          background: white;
          border: 1px solid #dfeceb;
          border-radius: 15px;
          padding: 21px;
          margin-bottom: 22px;
        }

        .demo-section-title {
          margin-bottom: 18px;
        }

        .demo-section-title h2 {
          margin: 0;
          font-size: 17px;
          color: #173b5d;
        }

        .demo-section-title p {
          margin: 5px 0 0;
          color: #778290;
          font-size: 12px;
        }

        .demo-info-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 13px;
        }

        .demo-info-grid > div {
          background: #f4f9f8;
          border-radius: 10px;
          padding: 14px;
        }

        .demo-info-grid span {
          display: block;
          font-size: 11px;
          color: #818a96;
          margin-bottom: 6px;
        }

        .demo-info-grid strong {
          font-size: 13px;
          color: #273648;
        }

        .demo-action-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .demo-action-list a {
          display: flex;
          align-items: center;
          gap: 11px;
          padding: 13px;
          border-radius: 10px;
          text-decoration: none;
          color: #0056dd;
          background: #f4f9f8;
        }

        .demo-action-list a:hover {
          background: #eaf7f5;
        }

        .demo-action-list a > div {
          flex: 1;
        }

        .demo-action-list strong,
        .demo-action-list span {
          display: block;
        }

        .demo-action-list strong {
          font-size: 12px;
          color: #273648;
        }

        .demo-action-list span {
          margin-top: 3px;
          color: #818a96;
          font-size: 11px;
        }

        .demo-quick-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 12px;
        }

        .demo-quick-grid a {
          text-decoration: none;
          color: #0056dd;
          border: 1px solid #e0eceb;
          border-radius: 12px;
          padding: 16px;
          transition: .2s ease;
        }

        .demo-quick-grid a:hover {
          border-color: #9bb5d8;
          background: #fbfefe;
          transform: translateY(-2px);
        }

        .demo-quick-grid strong {
          display: block;
          color: #273648;
          font-size: 13px;
          margin-top: 12px;
        }

        .demo-quick-grid span {
          display: block;
          color: #818a96;
          font-size: 11px;
          margin-top: 4px;
          line-height: 1.5;
        }

        .demo-patient-list {
          display: flex;
          flex-direction: column;
          gap: 7px;
        }

        .demo-patient-row {
          display: flex;
          align-items: center;
          gap: 11px;
          padding: 11px;
          background: #f5f9f8;
          border-radius: 10px;
        }

        .demo-avatar {
          width: 37px;
          height: 37px;
          border-radius: 50%;
          display: grid;
          place-items: center;
          background: #e3f4f2;
          color: #0056dd;
          font-size: 12px;
          font-weight: 800;
          flex-shrink: 0;
        }

        .demo-patient-main {
          flex: 1;
          min-width: 0;
        }

        .demo-patient-main strong,
        .demo-patient-main span {
          display: block;
        }

        .demo-patient-main strong {
          font-size: 12px;
          color: #273648;
        }

        .demo-patient-main span {
          color: #818a96;
          font-size: 10px;
          margin-top: 3px;
        }

        .demo-patient-row > a,
        .demo-table a,
        .demo-panel-link {
          color: #0056dd;
          text-decoration: none;
          font-size: 11px;
          font-weight: 700;
        }

        .demo-patient-row > a:hover,
        .demo-table a:hover,
        .demo-panel-link:hover {
          color: #072d5f;
        }

        .demo-severity {
          padding: 5px 8px;
          border-radius: 999px;
          font-size: 9px;
          font-weight: 800;
          white-space: nowrap;
        }

        .demo-severity.stable {
          background: #eaf8ef;
          color: #198754;
        }

        .demo-severity.attention {
          background: #fff7df;
          color: #b77900;
        }

        .demo-severity.urgent {
          background: #ffeded;
          color: #d83a3a;
        }

        .demo-task-list {
          display: flex;
          flex-direction: column;
          gap: 7px;
        }

        .demo-task-list > div {
          display: flex;
          align-items: center;
          gap: 10px;
          background: #f5f9f8;
          padding: 12px;
          border-radius: 9px;
          color: #0056dd;
        }

        .demo-task-list span {
          flex: 1;
          color: #515c6a;
          font-size: 11px;
        }

        .demo-task-list strong {
          font-size: 12px;
          color: #273648;
        }

        .demo-table-wrap {
          overflow-x: auto;
        }

        .demo-table {
          width: 100%;
          border-collapse: collapse;
          min-width: 680px;
        }

        .demo-table th {
          text-align: left;
          padding: 11px;
          color: #818a96;
          font-size: 10px;
          font-weight: 800;
          border-bottom: 1px solid #e7efee;
        }

        .demo-table td {
          padding: 13px 11px;
          border-bottom: 1px solid #edf2f1;
          font-size: 11px;
          color: #5f6975;
        }

        .demo-table-person {
          display: flex;
          align-items: center;
          gap: 9px;
        }

        .demo-table-person strong {
          color: #273648;
          font-size: 12px;
        }

        .demo-request-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .demo-request {
          display: flex;
          align-items: center;
          gap: 11px;
          background: #f5f9f8;
          border-radius: 10px;
          padding: 12px;
        }

        .demo-request > div:nth-child(2) {
          flex: 1;
        }

        .demo-request strong,
        .demo-request span {
          display: block;
        }

        .demo-request strong {
          font-size: 12px;
          color: #273648;
        }

        .demo-request div span {
          color: #818a96;
          font-size: 10px;
          margin-top: 3px;
        }

        .demo-pending {
          background: #fff6df;
          color: #a66b00;
          border-radius: 999px;
          padding: 5px 8px;
          font-size: 9px;
          font-weight: 800;
        }

        .demo-panel-link {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          margin-top: 15px;
        }

        .demo-admin-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 10px;
        }

        .demo-admin-grid > div {
          border: 1px solid #e2eceb;
          border-radius: 10px;
          padding: 14px;
          color: #0056dd;
        }

        .demo-admin-grid strong {
          display: block;
          color: #273648;
          font-size: 18px;
          margin-top: 7px;
        }

        .demo-admin-grid span {
          color: #818a96;
          font-size: 10px;
        }

        .demo-empty-page {
          background: white;
          border: 1px solid #dfeceb;
          border-radius: 18px;
          padding: 70px 30px;
          text-align: center;
          max-width: 850px;
          margin: 40px auto;
        }

        .demo-empty-icon {
          width: 65px;
          height: 65px;
          margin: 0 auto 20px;
          display: grid;
          place-items: center;
          background: #e8f7f5;
          color: #0056dd;
          border-radius: 17px;
        }

        .demo-empty-page .demo-eyebrow {
          color: #0056dd;
        }

        .demo-empty-page h1 {
          margin: 9px 0;
          font-size: 27px;
          color: #173b5d;
        }

        .demo-empty-page p {
          color: #778290;
          max-width: 560px;
          margin: 0 auto 25px;
          line-height: 1.7;
          font-size: 13px;
        }

        .demo-empty-page .demo-primary-button {
          background: #0056dd;
          color: white;
          display: inline-flex;
        }

        .demo-empty-page .demo-primary-button:hover {
          background: #072e62;
        }

        @media (max-width: 1050px) {
          .demo-stats-grid {
            grid-template-columns: repeat(2, 1fr);
          }

          .demo-quick-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 800px) {
          .demo-topbar {
            padding: 0 15px;
          }

          .demo-mode-badge {
            display: none;
          }

          .demo-main {
            padding: 18px;
          }

          .demo-two-column {
            grid-template-columns: 1fr;
          }

          .demo-welcome {
            align-items: flex-start;
            flex-direction: column;
          }
        }

        @media (max-width: 550px) {
          .demo-stats-grid,
          .demo-quick-grid,
          .demo-info-grid {
            grid-template-columns: 1fr;
          }

          .demo-main {
            padding: 12px;
          }

          .demo-welcome,
          .demo-panel {
            padding: 17px;
          }

          .demo-welcome h1 {
            font-size: 22px;
          }

          .demo-topbar {
            height: 62px;
          }
        }
      `}</style>

      <header className="demo-topbar">
        <div className="demo-brand">
          <div className="demo-brand-mark">
            <HeartPulse size={21} />
          </div>

          <div>
            <strong>CareTrack</strong>
            <span>
              Smart Patient Self-Monitoring System
            </span>
          </div>
        </div>

        <div className="demo-top-actions">
          <span className="demo-mode-badge">
            DEMO MODE · NO FIREBASE CHANGES
          </span>

          <Link to="/demo" className="demo-exit">
            <LogOut size={16} />
            Exit Demo
          </Link>
        </div>
      </header>

      <main className="demo-main">
        {renderContent()}
      </main>
    </div>
  );
}