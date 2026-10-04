import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";

import {
  Activity,
  AlertCircle,
  ArrowLeft,
  BedDouble,
  Bell,
  CheckCircle2,
  ClipboardList,
  FileText,
  HeartPulse,
  MessageSquare,
  Pill,
  Search,
  Stethoscope,
  Thermometer,
  User,
  Users,
  Utensils,
} from "lucide-react";

import { get, ref, set } from "firebase/database";
import { auth, db } from "../../lib/firebase";
import ContextualHelp from "../../components/ContextualHelp";

/* =========================================================
   TYPES
========================================================= */

type Severity = "stable" | "attention" | "urgent";

interface UserProfile {
  uid: string;
  fullName?: string;
  email?: string;
  phone?: string;
  role?: string;
  active?: boolean;
  approvalStatus?: string;
  createdAt?: number;
}

interface Admission {
  id?: string;
  patientId?: string;
  patientUid?: string;
  uid?: string;
  ward?: string;
  room?: string;
  bed?: string;
  admissionDate?: string;
  status?: string;
  reason?: string;
  doctor?: string;
}

interface PatientMonitoring {
  severity?: Severity;
  updatedAt?: number;
  updatedBy?: string;
  painLevel?: string | number;
  symptoms?: string;
  waterConsumption?: string | number;
  food?: string;
  dailyCondition?: string;
  bloodPressure?: string;
  heartRate?: string;
  temperature?: string;
  oxygenLevel?: string;
  medicineStatus?: string;
  notes?: string;
}

interface PatientDailyReport {
  reportId?: string;
  patientId?: string;
  patientName?: string;
  patientEmail?: string;
  reportDate?: string;
  condition?: string;
  pain?: number | string;
  waterGlasses?: number | string;
  food?: string;
  symptoms?: string;
  submittedAt?: number;
  status?: string;
}

/* =========================================================
   COMMON PAGE
========================================================= */

function NursePage({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <div style={{ padding: "28px" }}>
      <div style={{ marginBottom: "24px" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "4px",
            flexWrap: "wrap",
          }}
        >
          <h1
            style={{
              margin: 0,
              fontSize: "30px",
              fontWeight: 800,
              color: "#17324d",
            }}
          >
            {title}
          </h1>

          {title === "Nurse Dashboard" && (
            <ContextualHelp title="Nurse Dashboard">
              Review the overall patient monitoring summary, including
              patient counts, manually assigned attention levels, active
              admissions, and patients marked urgent.
            </ContextualHelp>
          )}

          {title === "Patients" && (
            <ContextualHelp title="Patients">
              Search patient records by name, email, phone, ward, or bed.
              You can review the patient record and manually update the
              attention priority as Stable, Needs Attention, or Urgent.
            </ContextualHelp>
          )}

          {title === "Patient Details" && (
            <ContextualHelp title="Patient Details">
              Review the patient's recorded profile, admission details,
              daily reports, food and water information, recorded vitals,
              medication information, and monitoring notes.
            </ContextualHelp>
          )}

          {title === "Nurse Reports" && (
            <ContextualHelp title="Nurse Reports">
              Review daily reports submitted by patients. Use the report
              information to stay informed about recorded condition, pain,
              water, food, and symptoms.
            </ContextualHelp>
          )}

          {title === "Patient Vitals" && (
            <ContextualHelp title="Patient Vitals">
              Review recorded patient vital information such as blood
              pressure, heart rate, temperature, and oxygen level.
            </ContextualHelp>
          )}

          {title === "Nurse Notes" && (
            <ContextualHelp title="Nurse Notes">
              Select a patient and record an observation or other important
              nursing information. Save the note so it can be associated
              with the selected patient's record.
            </ContextualHelp>
          )}

          {title === "Notifications" && (
            <ContextualHelp title="Notifications">
              Use this area to stay informed about patient-related updates
              and newly submitted patient reports.
            </ContextualHelp>
          )}
        </div>

        <p
          style={{
            marginTop: "7px",
            marginBottom: 0,
            color: "#718096",
            fontSize: "15px",
          }}
        >
          {subtitle}
        </p>
      </div>

      {children}
    </div>
  );
}

/* =========================================================
   STAT CARD
========================================================= */

function NurseStatCard({
  title,
  value,
  icon,
  description,
}: {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  description?: string;
}) {
  return (
    <div
      style={{
        background: "#ffffff",
        border: "1px solid #e5eaf0",
        borderRadius: "16px",
        padding: "20px",
        display: "flex",
        alignItems: "center",
        gap: "15px",
        boxShadow: "0 4px 14px rgba(20, 50, 80, 0.05)",
      }}
    >
      <div
        style={{
          width: "48px",
          height: "48px",
          borderRadius: "14px",
          background: "#eef6fb",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#2377a8",
        }}
      >
        {icon}
      </div>

      <div>
        <div
          style={{
            fontSize: "27px",
            fontWeight: 800,
            color: "#17324d",
          }}
        >
          {value}
        </div>

        <div
          style={{
            fontSize: "14px",
            fontWeight: 700,
            color: "#526579",
          }}
        >
          {title}
        </div>

        {description && (
          <div
            style={{
              fontSize: "12px",
              color: "#8997a6",
              marginTop: "2px",
            }}
          >
            {description}
          </div>
        )}
      </div>
    </div>
  );
}

/* =========================================================
   SEVERITY BADGE
========================================================= */

function SeverityBadge({
  severity,
}: {
  severity: Severity;
}) {
  const config = {
    stable: {
      label: "Stable",
      background: "#eaf8ef",
      color: "#25834b",
    },
    attention: {
      label: "Needs Attention",
      background: "#fff6df",
      color: "#a46b00",
    },
    urgent: {
      label: "Urgent",
      background: "#ffeaea",
      color: "#c53939",
    },
  };

  const item = config[severity];

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        padding: "6px 11px",
        borderRadius: "999px",
        background: item.background,
        color: item.color,
        fontSize: "12px",
        fontWeight: 800,
      }}
    >
      {item.label}
    </span>
  );
}

/* =========================================================
   LOAD NURSE DATA
========================================================= */

async function loadNurseData() {
  const [
    usersSnapshot,
    admissionsSnapshot,
    monitoringSnapshot,
  ] = await Promise.all([
    get(ref(db, "users")),
    get(ref(db, "admissions")),
    get(ref(db, "patientMonitoring")),
  ]);

  return {
    users: usersSnapshot.exists()
      ? (usersSnapshot.val() as Record<string, UserProfile>)
      : {},

    admissions: admissionsSnapshot.exists()
      ? (admissionsSnapshot.val() as Record<string, Admission>)
      : {},

    monitoring: monitoringSnapshot.exists()
      ? (monitoringSnapshot.val() as Record<
          string,
          PatientMonitoring
        >)
      : {},
  };
}

/* =========================================================
   NURSE DASHBOARD
========================================================= */

export function NurseDashboard() {
  const [users, setUsers] =
    useState<Record<string, UserProfile>>({});

  const [admissions, setAdmissions] =
    useState<Record<string, Admission>>({});

  const [monitoring, setMonitoring] =
    useState<Record<string, PatientMonitoring>>({});

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await loadNurseData();

        setUsers(data.users);
        setAdmissions(data.admissions);
        setMonitoring(data.monitoring);
      } catch (error) {
        console.error("Nurse dashboard error:", error);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  const patients = useMemo(() => {
    return Object.values(users).filter(
      (user) => user.role === "patient"
    );
  }, [users]);

  const stableCount = patients.filter(
    (patient) =>
      (monitoring[patient.uid]?.severity || "stable") ===
      "stable"
  ).length;

  const attentionCount = patients.filter(
    (patient) =>
      monitoring[patient.uid]?.severity === "attention"
  ).length;

  const urgentCount = patients.filter(
    (patient) =>
      monitoring[patient.uid]?.severity === "urgent"
  ).length;

  const activeAdmissions = Object.values(admissions).filter(
    (admission) =>
      !admission.status ||
      admission.status.toLowerCase() === "active"
  ).length;

  const urgentPatients = patients.filter(
    (patient) =>
      monitoring[patient.uid]?.severity === "urgent"
  );

  if (loading) {
    return (
      <NursePage
        title="Nurse Dashboard"
        subtitle="Loading patient information..."
      >
        <div className="panel">Loading...</div>
      </NursePage>
    );
  }

  return (
    <NursePage
      title="Nurse Dashboard"
      subtitle="Monitor patients and their recorded information."
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit, minmax(210px, 1fr))",
          gap: "16px",
          marginBottom: "24px",
        }}
      >
        <NurseStatCard
          title="Total Patients"
          value={patients.length}
          icon={<Users size={23} />}
        />

        <NurseStatCard
          title="Stable"
          value={stableCount}
          icon={<CheckCircle2 size={23} />}
        />

        <NurseStatCard
          title="Needs Attention"
          value={attentionCount}
          icon={<AlertCircle size={23} />}
        />

        <NurseStatCard
          title="Urgent"
          value={urgentCount}
          icon={<Activity size={23} />}
        />

        <NurseStatCard
          title="Active Admissions"
          value={activeAdmissions}
          icon={<BedDouble size={23} />}
        />
      </div>

      <div
        style={{
          background: "#ffffff",
          border: "1px solid #e5eaf0",
          borderRadius: "16px",
          padding: "22px",
        }}
      >
        <div style={{ marginBottom: "18px" }}>
          <h2
            style={{
              margin: 0,
              color: "#17324d",
              fontSize: "20px",
            }}
          >
            Urgent Attention
          </h2>

          <p
            style={{
              margin: "5px 0 0",
              color: "#718096",
              fontSize: "13px",
            }}
          >
            Patients manually marked as urgent.
          </p>
        </div>

        {urgentPatients.length === 0 ? (
          <div
            style={{
              padding: "25px",
              background: "#f7fafc",
              borderRadius: "12px",
              textAlign: "center",
              color: "#718096",
            }}
          >
            No patients are currently marked as urgent.
          </div>
        ) : (
          <div style={{ display: "grid", gap: "12px" }}>
            {urgentPatients.map((patient) => (
              <div
                key={patient.uid}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: "15px",
                  padding: "15px",
                  border: "1px solid #f0d4d4",
                  borderRadius: "12px",
                  background: "#fffafa",
                }}
              >
                <div>
                  <strong style={{ color: "#17324d" }}>
                    {patient.fullName || "Unnamed Patient"}
                  </strong>

                  <div
                    style={{
                      color: "#718096",
                      fontSize: "13px",
                      marginTop: "4px",
                    }}
                  >
                    {patient.email || "No email"}
                  </div>
                </div>

                <Link
                  to={`/nurse/patients/${patient.uid}`}
                  style={{
                    textDecoration: "none",
                    padding: "8px 13px",
                    borderRadius: "8px",
                    background: "#17324d",
                    color: "#ffffff",
                    fontSize: "12px",
                    fontWeight: 700,
                  }}
                >
                  View Patient
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </NursePage>
  );
}

/* =========================================================
   NURSE PATIENTS
========================================================= */

export function NursePatients() {
  const [users, setUsers] =
    useState<Record<string, UserProfile>>({});

  const [admissions, setAdmissions] =
    useState<Record<string, Admission>>({});

  const [monitoring, setMonitoring] =
    useState<Record<string, PatientMonitoring>>({});

  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await loadNurseData();

        setUsers(data.users);
        setAdmissions(data.admissions);
        setMonitoring(data.monitoring);
      } catch (error) {
        console.error("Patients loading error:", error);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  const patients = useMemo(() => {
    const query = search.toLowerCase().trim();

    return Object.values(users)
      .filter((user) => user.role === "patient")
      .filter((patient) => {
        if (!query) return true;

        const admission = Object.values(admissions).find(
          (item) =>
            item.patientId === patient.uid ||
            item.patientUid === patient.uid ||
            item.uid === patient.uid
        );

        const text = [
          patient.fullName,
          patient.email,
          patient.phone,
          admission?.ward,
          admission?.room,
          admission?.bed,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        return text.includes(query);
      });
  }, [users, admissions, search]);

  async function changeSeverity(
    patientUid: string,
    severity: Severity
  ) {
    try {
      const currentUser = auth.currentUser;

      const updatedMonitoring: PatientMonitoring = {
        ...monitoring[patientUid],
        severity,
        updatedAt: Date.now(),
        updatedBy: currentUser?.uid || "",
      };

      await set(
        ref(db, `patientMonitoring/${patientUid}`),
        updatedMonitoring
      );

      setMonitoring((previous) => ({
        ...previous,
        [patientUid]: updatedMonitoring,
      }));
    } catch (error) {
      console.error("Severity update error:", error);
      alert("Unable to update patient severity.");
    }
  }

  function getAdmission(patientUid: string) {
    return Object.values(admissions).find(
      (item) =>
        item.patientId === patientUid ||
        item.patientUid === patientUid ||
        item.uid === patientUid
    );
  }

  const stableCount = patients.filter(
    (patient) =>
      (monitoring[patient.uid]?.severity || "stable") ===
      "stable"
  ).length;

  const attentionCount = patients.filter(
    (patient) =>
      monitoring[patient.uid]?.severity === "attention"
  ).length;

  const urgentCount = patients.filter(
    (patient) =>
      monitoring[patient.uid]?.severity === "urgent"
  ).length;

  if (loading) {
    return (
      <NursePage
        title="Patients"
        subtitle="Loading patient records..."
      >
        <div className="panel">Loading...</div>
      </NursePage>
    );
  }

  return (
    <NursePage
      title="Patients"
      subtitle="Review patient information and assign attention priority."
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit, minmax(190px, 1fr))",
          gap: "14px",
          marginBottom: "20px",
        }}
      >
        <NurseStatCard
          title="Total Patients"
          value={patients.length}
          icon={<Users size={22} />}
        />

        <NurseStatCard
          title="Stable"
          value={stableCount}
          icon={<CheckCircle2 size={22} />}
        />

        <NurseStatCard
          title="Needs Attention"
          value={attentionCount}
          icon={<AlertCircle size={22} />}
        />

        <NurseStatCard
          title="Urgent"
          value={urgentCount}
          icon={<Activity size={22} />}
        />
      </div>

      <div
        style={{
          background: "#ffffff",
          border: "1px solid #e5eaf0",
          borderRadius: "16px",
          padding: "20px",
        }}
      >
        <div
          style={{
            position: "relative",
            marginBottom: "18px",
          }}
        >
          <Search
            size={18}
            style={{
              position: "absolute",
              left: "14px",
              top: "13px",
              color: "#8a98a8",
            }}
          />

          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search patient by name, email, phone, ward or bed..."
            style={{
              width: "100%",
              boxSizing: "border-box",
              padding: "12px 14px 12px 42px",
              border: "1px solid #dce3ea",
              borderRadius: "10px",
              outline: "none",
              fontSize: "14px",
            }}
          />
        </div>

        <div style={{ overflowX: "auto" }}>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              minWidth: "900px",
            }}
          >
            <thead>
              <tr>
                {[
                  "Patient",
                  "Contact",
                  "Ward / Bed",
                  "Severity",
                  "Update Priority",
                  "Action",
                ].map((heading) => (
                  <th
                    key={heading}
                    style={{
                      textAlign: "left",
                      padding: "13px",
                      background: "#f7fafc",
                      borderBottom: "1px solid #e5eaf0",
                      color: "#526579",
                      fontSize: "12px",
                      fontWeight: 800,
                    }}
                  >
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {patients.map((patient) => {
                const admission = getAdmission(patient.uid);

                const severity =
                  monitoring[patient.uid]?.severity || "stable";

                return (
                  <tr key={patient.uid}>
                    <td
                      style={{
                        padding: "15px 13px",
                        borderBottom: "1px solid #edf1f5",
                      }}
                    >
                      <strong style={{ color: "#17324d" }}>
                        {patient.fullName || "Unnamed Patient"}
                      </strong>
                    </td>

                    <td
                      style={{
                        padding: "15px 13px",
                        borderBottom: "1px solid #edf1f5",
                        color: "#718096",
                        fontSize: "13px",
                      }}
                    >
                      <div>{patient.email || "No email"}</div>
                      <div>{patient.phone || "No phone"}</div>
                    </td>

                    <td
                      style={{
                        padding: "15px 13px",
                        borderBottom: "1px solid #edf1f5",
                        color: "#526579",
                        fontSize: "13px",
                      }}
                    >
                      {admission?.ward || "Not assigned"}
                      {admission?.bed
                        ? ` / Bed ${admission.bed}`
                        : ""}
                    </td>

                    <td
                      style={{
                        padding: "15px 13px",
                        borderBottom: "1px solid #edf1f5",
                      }}
                    >
                      <SeverityBadge severity={severity} />
                    </td>

                    <td
                      style={{
                        padding: "15px 13px",
                        borderBottom: "1px solid #edf1f5",
                      }}
                    >
                      <select
                        value={severity}
                        onChange={(event) =>
                          changeSeverity(
                            patient.uid,
                            event.target.value as Severity
                          )
                        }
                        style={{
                          padding: "8px",
                          borderRadius: "8px",
                          border: "1px solid #dce3ea",
                          fontSize: "13px",
                        }}
                      >
                        <option value="stable">Stable</option>

                        <option value="attention">
                          Needs Attention
                        </option>

                        <option value="urgent">Urgent</option>
                      </select>
                    </td>

                    <td
                      style={{
                        padding: "15px 13px",
                        borderBottom: "1px solid #edf1f5",
                      }}
                    >
                      <Link
                        to={`/nurse/patients/${patient.uid}`}
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "6px",
                          textDecoration: "none",
                          background: "#17324d",
                          color: "#ffffff",
                          padding: "8px 12px",
                          borderRadius: "8px",
                          fontSize: "12px",
                          fontWeight: 700,
                        }}
                      >
                        View Patient
                      </Link>
                    </td>
                  </tr>
                );
              })}

              {patients.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    style={{
                      padding: "35px",
                      textAlign: "center",
                      color: "#718096",
                    }}
                  >
                    No patient records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div
          style={{
            marginTop: "18px",
            padding: "12px 14px",
            background: "#f7fafc",
            borderRadius: "10px",
            color: "#718096",
            fontSize: "12px",
          }}
        >
          <strong>CareTrack note:</strong> Severity is manually
          assigned by authorized staff for attention prioritization.
          CareTrack does not diagnose patients or make automatic
          treatment decisions.
        </div>
      </div>
    </NursePage>
  );
}

/* =========================================================
   NURSE PATIENT DETAIL
   PATIENT DAILY REPORT INTEGRATION
========================================================= */

export function NursePatientDetail() {
  const { patientId } = useParams();

  const [patient, setPatient] =
    useState<UserProfile | null>(null);

  const [admission, setAdmission] =
    useState<Admission | null>(null);

  const [monitoring, setMonitoring] =
    useState<PatientMonitoring | null>(null);

  const [dailyReports, setDailyReports] =
    useState<PatientDailyReport[]>([]);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPatient() {
      if (!patientId) {
        setLoading(false);
        return;
      }

      try {
        const [
          userSnapshot,
          admissionsSnapshot,
          monitoringSnapshot,
          dailyReportSnapshot,
        ] = await Promise.all([
          get(ref(db, `users/${patientId}`)),
          get(ref(db, "admissions")),
          get(ref(db, `patientMonitoring/${patientId}`)),
          get(ref(db, `patientDailyReports/${patientId}`)),
        ]);

        /* PATIENT PROFILE */

        if (userSnapshot.exists()) {
          setPatient(userSnapshot.val() as UserProfile);
        }

        /* ADMISSION */

        if (admissionsSnapshot.exists()) {
          const admissionsData =
            admissionsSnapshot.val() as Record<
              string,
              Admission
            >;

          const matchingAdmission = Object.values(
            admissionsData
          ).find(
            (item) =>
              item.patientId === patientId ||
              item.patientUid === patientId ||
              item.uid === patientId
          );

          if (matchingAdmission) {
            setAdmission(matchingAdmission);
          }
        }

        /* MONITORING / VITALS */

        if (monitoringSnapshot.exists()) {
          setMonitoring(
            monitoringSnapshot.val() as PatientMonitoring
          );
        } else {
          setMonitoring({
            severity: "stable",
          });
        }

        /* PATIENT DAILY REPORTS */

        if (dailyReportSnapshot.exists()) {
          const reportsData = dailyReportSnapshot.val();

          const patientReports: PatientDailyReport[] = [];

          Object.entries(reportsData).forEach(
            ([reportId, report]) => {
              if (
                report &&
                typeof report === "object"
              ) {
                patientReports.push({
                  ...(report as PatientDailyReport),
                  reportId,
                  patientId,
                });
              }
            }
          );

          patientReports.sort((a, b) => {
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

          setDailyReports(patientReports);
        } else {
          setDailyReports([]);
        }
      } catch (error) {
        console.error("Patient detail error:", error);
      } finally {
        setLoading(false);
      }
    }

    loadPatient();
  }, [patientId]);

  async function updateSeverity(
    severity: Severity
  ) {
    if (!patientId) return;

    try {
      const currentUser = auth.currentUser;

      const updatedData: PatientMonitoring = {
        ...(monitoring || {}),
        severity,
        updatedAt: Date.now(),
        updatedBy: currentUser?.uid || "",
      };

      await set(
        ref(db, `patientMonitoring/${patientId}`),
        updatedData
      );

      setMonitoring(updatedData);
    } catch (error) {
      console.error("Severity update error:", error);
      alert("Unable to update severity.");
    }
  }

  function formatReportTime(
    value?: number
  ) {
    if (!value) {
      return "Time unavailable";
    }

    return new Date(value).toLocaleString();
  }

  function formatReportDate(
    value?: number
  ) {
    if (!value) {
      return "Not available";
    }

    return new Date(value).toLocaleString();
  }

  if (loading) {
    return (
      <NursePage
        title="Patient Details"
        subtitle="Loading patient information..."
      >
        <div className="panel">
          Loading patient data...
        </div>
      </NursePage>
    );
  }

  if (!patient) {
    return (
      <NursePage
        title="Patient Not Found"
        subtitle="The requested patient record could not be found."
      >
        <Link
          to="/nurse/patients"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "7px",
            textDecoration: "none",
            background: "#17324d",
            color: "#ffffff",
            padding: "10px 15px",
            borderRadius: "9px",
            fontWeight: 700,
          }}
        >
          <ArrowLeft size={17} />
          Back to Patients
        </Link>
      </NursePage>
    );
  }

  const severity =
    monitoring?.severity || "stable";

  const latestReport = dailyReports[0];

  return (
    <NursePage
      title="Patient Details"
      subtitle="Review the patient's recorded information and monitoring data."
    >
      <Link
        to="/nurse/patients"
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "7px",
          textDecoration: "none",
          color: "#2377a8",
          fontWeight: 700,
          fontSize: "14px",
          marginBottom: "18px",
        }}
      >
        <ArrowLeft size={17} />
        Back to Patients
      </Link>

      {/* PATIENT HEADER */}

      <div
        style={{
          background: "#ffffff",
          border: "1px solid #e5eaf0",
          borderRadius: "16px",
          padding: "24px",
          marginBottom: "18px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "20px",
          flexWrap: "wrap",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "16px",
          }}
        >
          <div
            style={{
              width: "62px",
              height: "62px",
              borderRadius: "18px",
              background: "#eef6fb",
              color: "#2377a8",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <User size={30} />
          </div>

          <div>
            <h2
              style={{
                margin: 0,
                color: "#17324d",
                fontSize: "24px",
              }}
            >
              {patient.fullName || "Unnamed Patient"}
            </h2>

            <p
              style={{
                margin: "5px 0 0",
                color: "#718096",
                fontSize: "13px",
              }}
            >
              {patient.email || "No email available"}
            </p>

            <p
              style={{
                margin: "3px 0 0",
                color: "#718096",
                fontSize: "13px",
              }}
            >
              {patient.phone || "No phone available"}
            </p>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
          }}
        >
          <SeverityBadge severity={severity} />

          <select
            value={severity}
            onChange={(event) =>
              updateSeverity(
                event.target.value as Severity
              )
            }
            style={{
              padding: "9px 11px",
              borderRadius: "8px",
              border: "1px solid #dce3ea",
              fontSize: "13px",
            }}
          >
            <option value="stable">Stable</option>

            <option value="attention">
              Needs Attention
            </option>

            <option value="urgent">Urgent</option>
          </select>
        </div>
      </div>

      {/* PATIENT + ADMISSION */}

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit, minmax(250px, 1fr))",
          gap: "16px",
          marginBottom: "18px",
        }}
      >
        <DetailCard
          title="Patient Information"
          icon={<User size={20} />}
        >
          <InfoRow
            label="Full Name"
            value={patient.fullName}
          />

          <InfoRow
            label="Email"
            value={patient.email}
          />

          <InfoRow
            label="Phone"
            value={patient.phone}
          />

          <InfoRow
            label="Account Status"
            value={
              patient.active
                ? "Active"
                : "Inactive"
            }
          />
        </DetailCard>

        <DetailCard
          title="Admission Information"
          icon={<BedDouble size={20} />}
        >
          <InfoRow
            label="Ward"
            value={
              admission?.ward ||
              "Not assigned"
            }
          />

          <InfoRow
            label="Room"
            value={
              admission?.room ||
              "Not assigned"
            }
          />

          <InfoRow
            label="Bed"
            value={
              admission?.bed ||
              "Not assigned"
            }
          />

          <InfoRow
            label="Admission Date"
            value={
              admission?.admissionDate ||
              "Not available"
            }
          />

          <InfoRow
            label="Status"
            value={
              admission?.status ||
              "Not available"
            }
          />

          <InfoRow
            label="Reason"
            value={
              admission?.reason ||
              "Not available"
            }
          />
        </DetailCard>
      </div>

      {/* =====================================================
          LATEST PATIENT DAILY REPORT
      ===================================================== */}

      <div
        style={{
          marginBottom: "18px",
        }}
      >
        <DetailCard
          title="Latest Patient Daily Report"
          icon={<ClipboardList size={20} />}
        >
          {!latestReport ? (
            <div
              style={{
                background: "#f7fafc",
                borderRadius: "12px",
                padding: "20px",
                textAlign: "center",
                color: "#718096",
                fontSize: "13px",
              }}
            >
              No daily report submitted yet.
            </div>
          ) : (
            <>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: "12px",
                  flexWrap: "wrap",
                  marginBottom: "16px",
                }}
              >
                <div>
                  <strong
                    style={{
                      color: "#17324d",
                      fontSize: "15px",
                    }}
                  >
                    Patient Submitted Report
                  </strong>

                  <div
                    style={{
                      marginTop: "4px",
                      color: "#718096",
                      fontSize: "12px",
                    }}
                  >
                    Report Date:{" "}
                    {latestReport.reportDate ||
                      "Not available"}
                  </div>

                  <div
                    style={{
                      marginTop: "3px",
                      color: "#718096",
                      fontSize: "12px",
                    }}
                  >
                    Submitted:{" "}
                    {formatReportDate(
                      latestReport.submittedAt
                    )}
                  </div>
                </div>

                <span
                  style={{
                    padding: "7px 11px",
                    borderRadius: "999px",
                    background: "#eaf8ef",
                    color: "#25834b",
                    fontSize: "11px",
                    fontWeight: 800,
                  }}
                >
                  {latestReport.status || "Submitted"}
                </span>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "repeat(auto-fit, minmax(170px, 1fr))",
                  gap: "12px",
                }}
              >
                <MiniInfo
                  icon={
                    <ClipboardList size={18} />
                  }
                  label="Condition"
                  value={
                    latestReport.condition ||
                    "Not provided"
                  }
                />

                <MiniInfo
                  icon={<Activity size={18} />}
                  label="Pain Level"
                  value={
                    latestReport.pain !==
                    undefined
                      ? `${latestReport.pain}/10`
                      : "Not provided"
                  }
                />

                <MiniInfo
                  icon={<Utensils size={18} />}
                  label="Water"
                  value={
                    latestReport.waterGlasses !==
                    undefined
                      ? `${latestReport.waterGlasses} glasses`
                      : "Not provided"
                  }
                />
              </div>

              <div
                style={{
                  marginTop: "15px",
                }}
              >
                <InfoRow
                  label="Food / Meals"
                  value={
                    latestReport.food ||
                    "No food information provided"
                  }
                />
              </div>

              <div
                style={{
                  marginTop: "2px",
                }}
              >
                <InfoRow
                  label="Symptoms"
                  value={
                    latestReport.symptoms ||
                    "No symptoms reported"
                  }
                />
              </div>
            </>
          )}
        </DetailCard>
      </div>

      {/* DAILY CONDITION */}

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit, minmax(250px, 1fr))",
          gap: "16px",
          marginBottom: "18px",
        }}
      >
        <DetailCard
          title="Daily Condition"
          icon={<ClipboardList size={20} />}
        >
          <InfoRow
            label="Condition"
            value={
              latestReport?.condition ||
              monitoring?.dailyCondition ||
              "No daily condition recorded"
            }
          />

          <InfoRow
            label="Symptoms"
            value={
              latestReport?.symptoms ||
              monitoring?.symptoms ||
              "No symptoms recorded"
            }
          />

          <InfoRow
            label="Pain Level"
            value={
              latestReport?.pain !== undefined
                ? `${latestReport.pain}/10`
                : monitoring?.painLevel !== undefined
                ? String(monitoring.painLevel)
                : "Not recorded"
            }
          />
        </DetailCard>

        <DetailCard
          title="Food & Water"
          icon={<Utensils size={20} />}
        >
          <InfoRow
            label="Food"
            value={
              latestReport?.food ||
              monitoring?.food ||
              "Not recorded"
            }
          />

          <InfoRow
            label="Water Consumption"
            value={
              latestReport?.waterGlasses !== undefined
                ? `${latestReport.waterGlasses} glasses`
                : monitoring?.waterConsumption !== undefined
                ? String(monitoring.waterConsumption)
                : "Not recorded"
            }
          />
        </DetailCard>
      </div>

      {/* RECORDED VITALS */}

      <DetailCard
        title="Recorded Vitals"
        icon={<HeartPulse size={20} />}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(180px, 1fr))",
            gap: "12px",
          }}
        >
          <MiniInfo
            icon={<Activity size={18} />}
            label="Blood Pressure"
            value={
              monitoring?.bloodPressure ||
              "Not recorded"
            }
          />

          <MiniInfo
            icon={<HeartPulse size={18} />}
            label="Heart Rate"
            value={
              monitoring?.heartRate ||
              "Not recorded"
            }
          />

          <MiniInfo
            icon={<Thermometer size={18} />}
            label="Temperature"
            value={
              monitoring?.temperature ||
              "Not recorded"
            }
          />

          <MiniInfo
            icon={<Activity size={18} />}
            label="Oxygen Level"
            value={
              monitoring?.oxygenLevel ||
              "Not recorded"
            }
          />
        </div>
      </DetailCard>

      {/* MEDICATION */}

      <div style={{ marginTop: "18px" }}>
        <DetailCard
          title="Medication Record"
          icon={<Pill size={20} />}
        >
          <InfoRow
            label="Medicine Status"
            value={
              monitoring?.medicineStatus ||
              "No medicine information recorded"
            }
          />
        </DetailCard>
      </div>

      {/* NURSE NOTES */}

      <div style={{ marginTop: "18px" }}>
        <DetailCard
          title="Nurse Notes"
          icon={<FileText size={20} />}
        >
          <InfoRow
            label="Notes"
            value={
              monitoring?.notes ||
              "No nurse notes recorded."
            }
          />
        </DetailCard>
      </div>

      {/* CARETRACK NOTE */}

      <div
        style={{
          marginTop: "18px",
          padding: "15px",
          background: "#f7fafc",
          border: "1px solid #e5eaf0",
          borderRadius: "12px",
          color: "#718096",
          fontSize: "12px",
          display: "flex",
          gap: "10px",
          alignItems: "flex-start",
        }}
      >
        <Stethoscope size={17} />

        <span>
          CareTrack is an information recording, monitoring and
          communication system. The information shown here is based
          on patient and staff records and does not represent an
          automatic diagnosis or treatment decision.
        </span>
      </div>
    </NursePage>
  );
}

/* =========================================================
   DETAIL CARD
========================================================= */

function DetailCard({
  title,
  icon,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        background: "#ffffff",
        border: "1px solid #e5eaf0",
        borderRadius: "16px",
        padding: "20px",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "9px",
          marginBottom: "17px",
          color: "#2377a8",
        }}
      >
        {icon}

        <h3
          style={{
            margin: 0,
            color: "#17324d",
            fontSize: "17px",
          }}
        >
          {title}
        </h3>
      </div>

      {children}
    </div>
  );
}

/* =========================================================
   INFO ROW
========================================================= */

function InfoRow({
  label,
  value,
}: {
  label: string;
  value?: string;
}) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        gap: "20px",
        padding: "10px 0",
        borderBottom: "1px solid #edf1f5",
      }}
    >
      <span
        style={{
          color: "#7b8998",
          fontSize: "13px",
        }}
      >
        {label}
      </span>

      <strong
        style={{
          color: "#34495e",
          fontSize: "13px",
          textAlign: "right",
          maxWidth: "65%",
        }}
      >
        {value || "Not available"}
      </strong>
    </div>
  );
}

/* =========================================================
   MINI INFO
========================================================= */

function MiniInfo({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div
      style={{
        background: "#f7fafc",
        borderRadius: "12px",
        padding: "15px",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "7px",
          color: "#2377a8",
          marginBottom: "7px",
        }}
      >
        {icon}

        <span
          style={{
            fontSize: "12px",
            color: "#718096",
            fontWeight: 700,
          }}
        >
          {label}
        </span>
      </div>

      <strong
        style={{
          color: "#17324d",
          fontSize: "16px",
        }}
      >
        {value}
      </strong>
    </div>
  );
}

/* =========================================================
   NURSE REPORTS - REAL FIREBASE DATA
========================================================= */

export function NurseReports() {
  const [reports, setReports] = useState<
    PatientDailyReport[]
  >([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadReports() {
      try {
        setLoading(true);
        setError("");

        const snapshot = await get(
          ref(db, "patientDailyReports")
        );

        if (!snapshot.exists()) {
          setReports([]);
          return;
        }

        const data = snapshot.val();

        const allReports: PatientDailyReport[] = [];

        Object.entries(data).forEach(
          ([patientId, patientReports]) => {
            if (
              patientReports &&
              typeof patientReports === "object"
            ) {
              Object.entries(
                patientReports as Record<string, any>
              ).forEach(([reportId, report]) => {
                if (
                  report &&
                  typeof report === "object"
                ) {
                  allReports.push({
                    ...(report as PatientDailyReport),
                    reportId,
                    patientId,
                  });
                }
              });
            }
          }
        );

        allReports.sort((a, b) => {
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

        setReports(allReports);
      } catch (err) {
        console.error(
          "Nurse reports loading error:",
          err
        );

        setError(
          "Unable to load patient reports. Please check your Firebase rules."
        );
      } finally {
        setLoading(false);
      }
    }

    loadReports();
  }, []);

  function formatDate(value?: number) {
    if (!value) {
      return "Date unavailable";
    }

    return new Date(value).toLocaleString();
  }

  const patientsCount = new Set(
    reports.map((report) => report.patientId)
  ).size;

  const attentionCount = reports.filter((report) => {
    const pain = Number(report.pain || 0);

    return (
      pain >= 7 ||
      report.condition === "Feeling worse"
    );
  }).length;

  if (loading) {
    return (
      <NursePage
        title="Patient Reports"
        subtitle="Review patient-submitted daily information."
      >
        <div className="panel">
          Loading patient reports...
        </div>
      </NursePage>
    );
  }

  if (error) {
    return (
      <NursePage
        title="Patient Reports"
        subtitle="Review patient-submitted daily information."
      >
        <div
          style={{
            background: "#fff5f5",
            border: "1px solid #f0cccc",
            borderRadius: "14px",
            padding: "20px",
            color: "#a94f4f",
          }}
        >
          {error}
        </div>
      </NursePage>
    );
  }

  return (
    <NursePage
      title="Patient Reports"
      subtitle="Review daily information submitted by patients."
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit, minmax(190px, 1fr))",
          gap: "15px",
          marginBottom: "20px",
        }}
      >
        <NurseStatCard
          title="Total Reports"
          value={reports.length}
          icon={<ClipboardList size={22} />}
        />

        <NurseStatCard
          title="Patients"
          value={patientsCount}
          icon={<Users size={22} />}
        />

        <NurseStatCard
          title="Needs Review"
          value={attentionCount}
          icon={<AlertCircle size={22} />}
        />
      </div>

      {reports.length === 0 ? (
        <div
          style={{
            background: "#ffffff",
            border: "1px solid #e5eaf0",
            borderRadius: "16px",
            padding: "50px 25px",
            textAlign: "center",
          }}
        >
          <ClipboardList
            size={42}
            color="#2377a8"
            style={{ marginBottom: "12px" }}
          />

          <h3
            style={{
              margin: "0 0 8px",
              color: "#17324d",
            }}
          >
            No Patient Reports Yet
          </h3>

          <p
            style={{
              margin: 0,
              color: "#718096",
              fontSize: "14px",
            }}
          >
            Patient daily reports will appear here after
            a patient submits a report.
          </p>
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gap: "18px",
          }}
        >
          {reports.map((report) => {
            const pain = Number(report.pain || 0);

            const needsReview =
              pain >= 7 ||
              report.condition === "Feeling worse";

            return (
              <div
                key={`${report.patientId}-${report.reportId}`}
                style={{
                  background: "#ffffff",
                  border: needsReview
                    ? "1px solid #f0cccc"
                    : "1px solid #e5eaf0",
                  borderRadius: "16px",
                  padding: "22px",
                  boxShadow:
                    "0 4px 14px rgba(20, 50, 80, 0.05)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    gap: "15px",
                    flexWrap: "wrap",
                  }}
                >
                  <div>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "9px",
                        marginBottom: "7px",
                      }}
                    >
                      <div
                        style={{
                          width: "42px",
                          height: "42px",
                          borderRadius: "12px",
                          background: "#eef6fb",
                          color: "#2377a8",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <User size={21} />
                      </div>

                      <div>
                        <h2
                          style={{
                            margin: 0,
                            color: "#17324d",
                            fontSize: "18px",
                          }}
                        >
                          {report.patientName ||
                            "Unknown Patient"}
                        </h2>

                        <p
                          style={{
                            margin: "3px 0 0",
                            color: "#718096",
                            fontSize: "12px",
                          }}
                        >
                          {report.patientEmail ||
                            "No email available"}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      flexWrap: "wrap",
                    }}
                  >
                    <span
                      style={{
                        padding: "7px 11px",
                        borderRadius: "999px",
                        background: "#eaf8ef",
                        color: "#25834b",
                        fontSize: "11px",
                        fontWeight: 800,
                      }}
                    >
                      {report.status || "Submitted"}
                    </span>

                    {needsReview && (
                      <span
                        style={{
                          padding: "7px 11px",
                          borderRadius: "999px",
                          background: "#ffeaea",
                          color: "#c53939",
                          fontSize: "11px",
                          fontWeight: 800,
                        }}
                      >
                        Needs Review
                      </span>
                    )}
                  </div>
                </div>

                <div
                  style={{
                    marginTop: "15px",
                    paddingTop: "13px",
                    borderTop: "1px solid #edf1f5",
                    color: "#718096",
                    fontSize: "12px",
                  }}
                >
                  Report Date:{" "}
                  <strong style={{ color: "#34495e" }}>
                    {report.reportDate ||
                      "Not available"}
                  </strong>

                  {" • "}

                  Submitted:{" "}
                  <strong style={{ color: "#34495e" }}>
                    {formatDate(report.submittedAt)}
                  </strong>
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns:
                      "repeat(auto-fit, minmax(150px, 1fr))",
                    gap: "12px",
                    marginTop: "18px",
                  }}
                >
                  <div
                    style={{
                      background: "#f7fafc",
                      borderRadius: "12px",
                      padding: "15px",
                    }}
                  >
                    <span
                      style={{
                        display: "block",
                        color: "#718096",
                        fontSize: "11px",
                        fontWeight: 800,
                        marginBottom: "7px",
                      }}
                    >
                      CONDITION
                    </span>

                    <strong
                      style={{
                        color:
                          report.condition ===
                          "Feeling worse"
                            ? "#c53939"
                            : "#17324d",
                        fontSize: "13px",
                      }}
                    >
                      {report.condition ||
                        "Not provided"}
                    </strong>
                  </div>

                  <div
                    style={{
                      background: "#f7fafc",
                      borderRadius: "12px",
                      padding: "15px",
                    }}
                  >
                    <span
                      style={{
                        display: "block",
                        color: "#718096",
                        fontSize: "11px",
                        fontWeight: 800,
                        marginBottom: "7px",
                      }}
                    >
                      PAIN LEVEL
                    </span>

                    <strong
                      style={{
                        color:
                          pain >= 7
                            ? "#c53939"
                            : pain >= 4
                            ? "#a46b00"
                            : "#25834b",
                        fontSize: "16px",
                      }}
                    >
                      {pain}/10
                    </strong>
                  </div>

                  <div
                    style={{
                      background: "#f7fafc",
                      borderRadius: "12px",
                      padding: "15px",
                    }}
                  >
                    <span
                      style={{
                        display: "block",
                        color: "#718096",
                        fontSize: "11px",
                        fontWeight: 800,
                        marginBottom: "7px",
                      }}
                    >
                      WATER
                    </span>

                    <strong
                      style={{
                        color: "#17324d",
                        fontSize: "13px",
                      }}
                    >
                      {report.waterGlasses ?? 0} glasses
                    </strong>
                  </div>
                </div>

                <div style={{ marginTop: "17px" }}>
                  <h4
                    style={{
                      margin: "0 0 7px",
                      color: "#31566a",
                      fontSize: "12px",
                      fontWeight: 800,
                    }}
                  >
                    FOOD / MEALS
                  </h4>

                  <div
                    style={{
                      background: "#f7fafc",
                      borderRadius: "10px",
                      padding: "13px",
                      color: "#617787",
                      fontSize: "13px",
                      lineHeight: 1.5,
                    }}
                  >
                    {report.food ||
                      "No food information provided."}
                  </div>
                </div>

                <div style={{ marginTop: "14px" }}>
                  <h4
                    style={{
                      margin: "0 0 7px",
                      color: "#31566a",
                      fontSize: "12px",
                      fontWeight: 800,
                    }}
                  >
                    SYMPTOMS
                  </h4>

                  <div
                    style={{
                      background: "#f7fafc",
                      borderRadius: "10px",
                      padding: "13px",
                      color: "#617787",
                      fontSize: "13px",
                      lineHeight: 1.5,
                    }}
                  >
                    {report.symptoms ||
                      "No symptoms reported."}
                  </div>
                </div>

                {needsReview && (
                  <div
                    style={{
                      marginTop: "16px",
                      padding: "13px 14px",
                      borderRadius: "10px",
                      background: "#fff5f5",
                      border: "1px solid #f0cccc",
                      color: "#a94f4f",
                      fontSize: "12px",
                      fontWeight: 700,
                    }}
                  >
                    This report has information that may
                    require staff review. CareTrack only
                    records and displays submitted
                    information.
                  </div>
                )}

                {report.patientId && (
                  <div style={{ marginTop: "17px" }}>
                    <Link
                      to={`/nurse/patients/${report.patientId}`}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "7px",
                        textDecoration: "none",
                        background: "#17324d",
                        color: "#ffffff",
                        padding: "9px 14px",
                        borderRadius: "9px",
                        fontSize: "12px",
                        fontWeight: 700,
                      }}
                    >
                      <User size={15} />
                      Open Patient
                    </Link>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </NursePage>
  );
}

/* =========================================================
   NURSE VITALS
========================================================= */

export function NurseVitals() {
  return (
    <NursePage
      title="Patient Vitals"
      subtitle="Review recorded patient vital information."
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "16px",
        }}
      >
        <DetailCard
          title="Blood Pressure"
          icon={<Activity size={20} />}
        >
          <p
            style={{
              color: "#718096",
              fontSize: "13px",
            }}
          >
            Recorded blood pressure information will appear
            here.
          </p>
        </DetailCard>

        <DetailCard
          title="Heart Rate"
          icon={<HeartPulse size={20} />}
        >
          <p
            style={{
              color: "#718096",
              fontSize: "13px",
            }}
          >
            Recorded heart rate information will appear here.
          </p>
        </DetailCard>

        <DetailCard
          title="Temperature"
          icon={<Thermometer size={20} />}
        >
          <p
            style={{
              color: "#718096",
              fontSize: "13px",
            }}
          >
            Recorded temperature information will appear here.
          </p>
        </DetailCard>

        <DetailCard
          title="Oxygen Level"
          icon={<Activity size={20} />}
        >
          <p
            style={{
              color: "#718096",
              fontSize: "13px",
            }}
          >
            Recorded oxygen information will appear here.
          </p>
        </DetailCard>
      </div>
    </NursePage>
  );
}

/* =========================================================
   NURSE NOTES
========================================================= */

export function NurseNotes() {
  const [patients, setPatients] = useState<UserProfile[]>([]);
  const [selectedPatient, setSelectedPatient] = useState("");
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const loadPatients = async () => {
      try {
        const snapshot = await get(ref(db, "users"));

        if (!snapshot.exists()) {
          setPatients([]);
          return;
        }

        const data = snapshot.val();

        const patientList: UserProfile[] = Object.entries(data)
          .map(([uid, value]) => ({
            uid,
            ...(value as Omit<UserProfile, "uid">),
          }))
          .filter(
            (user) =>
              String(user.role || "").toLowerCase() === "patient"
          );

        setPatients(patientList);
      } catch (error) {
        console.error("Error loading patients:", error);
      }
    };

    loadPatients();
  }, []);

  const handleSaveNote = async () => {
    if (!selectedPatient) {
      setMessage("Please select a patient.");
      return;
    }

    if (!note.trim()) {
      setMessage("Please write a note before saving.");
      return;
    }

    setSaving(true);
    setMessage("");

    try {
      const noteId = Date.now().toString();

      await set(
        ref(db, `nurseNotes/${selectedPatient}/${noteId}`),
        {
          patientId: selectedPatient,
          note: note.trim(),
          nurseId: auth.currentUser?.uid || "",
          createdAt: new Date().toISOString(),
        }
      );

      setNote("");
      setMessage("Nurse note saved successfully.");
    } catch (error) {
      console.error("Error saving nurse note:", error);
      setMessage("Unable to save note. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <NursePage
      title="Nurse Notes"
      subtitle="Record observations and important patient-related notes."
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(0, 1fr)",
          gap: "24px",
        }}
      >
        {/* ADD NOTE CARD */}
        <section className="panel">
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "16px",
              marginBottom: "22px",
            }}
          >
            <div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  marginBottom: "6px",
                }}
              >
                <MessageSquare size={22} />
                <h2 style={{ margin: 0 }}>Add Nursing Note</h2>
              </div>

              <p style={{ margin: 0, opacity: 0.7 }}>
                Record an observation or important information about a patient.
              </p>
            </div>
          </div>

          {/* PATIENT */}
          <div style={{ marginBottom: "20px" }}>
            <label
              htmlFor="note-patient"
              style={{
                display: "block",
                fontWeight: 600,
                marginBottom: "8px",
              }}
            >
              Select Patient
            </label>

            <select
              id="note-patient"
              value={selectedPatient}
              onChange={(e) => {
                setSelectedPatient(e.target.value);
                setMessage("");
              }}
              style={{
                width: "100%",
                padding: "12px 14px",
                borderRadius: "10px",
                border: "1px solid #d8dee8",
                background: "#fff",
                fontSize: "14px",
              }}
            >
              <option value="">Select a patient</option>

              {patients.map((patient) => (
                <option key={patient.uid} value={patient.uid}>
                  {patient.fullName || patient.email || "Unnamed Patient"}
                </option>
              ))}
            </select>
          </div>

          {/* NOTE */}
          <div style={{ marginBottom: "20px" }}>
            <label
              htmlFor="nurse-note"
              style={{
                display: "block",
                fontWeight: 600,
                marginBottom: "8px",
              }}
            >
              Nursing Note
            </label>

            <textarea
              id="nurse-note"
              value={note}
              onChange={(e) => {
                setNote(e.target.value);
                setMessage("");
              }}
              placeholder="Write your observation, patient update, care information, or other important note..."
              rows={7}
              style={{
                width: "100%",
                padding: "14px",
                borderRadius: "10px",
                border: "1px solid #d8dee8",
                resize: "vertical",
                fontSize: "14px",
                lineHeight: 1.6,
                boxSizing: "border-box",
              }}
            />
          </div>

          {/* MESSAGE */}
          {message && (
            <div
              style={{
                marginBottom: "18px",
                padding: "12px 14px",
                borderRadius: "10px",
                background: message.includes("successfully")
                  ? "#ecfdf3"
                  : "#fff7ed",
                color: message.includes("successfully")
                  ? "#15803d"
                  : "#c2410c",
                fontSize: "14px",
                fontWeight: 500,
              }}
            >
              {message}
            </div>
          )}

          {/* SAVE */}
          <button
            type="button"
            onClick={handleSaveNote}
            disabled={saving}
            className="role-primary-button"
            style={{
              border: "none",
              cursor: saving ? "not-allowed" : "pointer",
              opacity: saving ? 0.7 : 1,
            }}
          >
            <CheckCircle2 size={18} />
            {saving ? "Saving..." : "Save Note"}
          </button>
        </section>

        {/* INFORMATION CARD */}
        <section className="panel">
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: "14px",
            }}
          >
            <div
              style={{
                minWidth: "42px",
                height: "42px",
                borderRadius: "12px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "#eef6ff",
              }}
            >
              <ClipboardList size={20} />
            </div>

            <div>
              <h3 style={{ margin: "0 0 6px" }}>
                Nursing Documentation
              </h3>

              <p style={{ margin: 0, opacity: 0.7, lineHeight: 1.6 }}>
                Use nursing notes to record patient observations, daily
                condition updates, care-related information, and other
                important communication for the healthcare team.
              </p>
            </div>
          </div>
        </section>
      </div>
    </NursePage>
  );
}

/* =========================================================
   NURSE NOTIFICATIONS
========================================================= */

export function NurseNotifications() {
  return (
    <NursePage
      title="Notifications"
      subtitle="Stay updated about patient-related activities."
    >
      <div
        style={{
          display: "grid",
          gap: "12px",
        }}
      >
        <div
          style={{
            background: "#ffffff",
            border: "1px solid #e5eaf0",
            borderRadius: "14px",
            padding: "18px",
            display: "flex",
            gap: "12px",
            alignItems: "flex-start",
          }}
        >
          <Bell
            size={20}
            color="#2377a8"
          />

          <div>
            <strong style={{ color: "#17324d" }}>
              Patient monitoring updates
            </strong>

            <p
              style={{
                margin: "5px 0 0",
                color: "#718096",
                fontSize: "13px",
              }}
            >
              Notifications for patient-related updates
              will appear here.
            </p>
          </div>
        </div>

        <div
          style={{
            background: "#ffffff",
            border: "1px solid #e5eaf0",
            borderRadius: "14px",
            padding: "18px",
            display: "flex",
            gap: "12px",
            alignItems: "flex-start",
          }}
        >
          <ClipboardList
            size={20}
            color="#2377a8"
          />

          <div>
            <strong style={{ color: "#17324d" }}>
              Patient reports
            </strong>

            <p
              style={{
                margin: "5px 0 0",
                color: "#718096",
                fontSize: "13px",
              }}
            >
              New patient-submitted reports can be shown
              here.
            </p>
          </div>
        </div>
      </div>
    </NursePage>
  );
}