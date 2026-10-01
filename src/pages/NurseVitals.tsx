import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Activity,
  HeartPulse,
  Save,
  Search,
  Stethoscope,
  Thermometer,
  User,
  Users,
} from "lucide-react";
import { get, ref, set } from "firebase/database";
import { useAuth } from "../context/AuthContext";
import { db } from "../lib/firebase";

// =========================
// TYPES
// =========================

type UserProfile = {
  uid?: string;
  fullName?: string;
  email?: string;
  role?: string;
  phone?: string;
  active?: boolean;
  approvalStatus?: string;
};

type PatientMonitoring = {
  bloodPressure?: string;
  heartRate?: string | number;
  temperature?: string | number;
  oxygenLevel?: string | number;

  severity?: "stable" | "attention" | "urgent";

  condition?: string;
  symptoms?: string;
  food?: string;
  waterGlasses?: string | number;
  pain?: string | number;

  updatedAt?: number;
  updatedBy?: string;
};

// =========================
// MAIN PAGE
// =========================

export function NurseVitals() {
  const { profile } = useAuth();

  const [patients, setPatients] = useState<UserProfile[]>([]);
  const [monitoring, setMonitoring] = useState<
    Record<string, PatientMonitoring>
  >({});

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [search, setSearch] = useState("");
  const [selectedPatientId, setSelectedPatientId] = useState("");

  const [bloodPressure, setBloodPressure] = useState("");
  const [heartRate, setHeartRate] = useState("");
  const [temperature, setTemperature] = useState("");
  const [oxygenLevel, setOxygenLevel] = useState("");

  // =========================
  // LOAD PATIENTS + VITALS
  // =========================

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);

      const [usersSnapshot, monitoringSnapshot] = await Promise.all([
        get(ref(db, "users")),
        get(ref(db, "patientMonitoring")),
      ]);

      const usersData = usersSnapshot.val() || {};
      const monitoringData = monitoringSnapshot.val() || {};

      const patientList: UserProfile[] = Object.entries(usersData)
        .map(([uid, value]) => ({
          uid,
          ...(value as UserProfile),
        }))
        .filter(
          (user) =>
            user.role === "patient" &&
            user.active !== false
        );

      setPatients(patientList);
      setMonitoring(monitoringData);
    } catch (error) {
      console.error("Error loading nurse vitals data:", error);
      alert("Unable to load patient vitals.");
    } finally {
      setLoading(false);
    }
  }

  // =========================
  // FILTER PATIENTS
  // =========================

  const filteredPatients = useMemo(() => {
    const term = search.trim().toLowerCase();

    if (!term) return patients;

    return patients.filter((patient) => {
      const name = patient.fullName?.toLowerCase() || "";
      const email = patient.email?.toLowerCase() || "";

      return name.includes(term) || email.includes(term);
    });
  }, [patients, search]);

  // =========================
  // SELECT PATIENT
  // =========================

  function selectPatient(patient: UserProfile) {
    const patientId = patient.uid || "";

    setSelectedPatientId(patientId);

    const existing = monitoring[patientId] || {};

    setBloodPressure(existing.bloodPressure?.toString() || "");
    setHeartRate(existing.heartRate?.toString() || "");
    setTemperature(existing.temperature?.toString() || "");
    setOxygenLevel(existing.oxygenLevel?.toString() || "");
  }

  // =========================
  // CLEAR FORM
  // =========================

  function clearForm() {
    setSelectedPatientId("");
    setBloodPressure("");
    setHeartRate("");
    setTemperature("");
    setOxygenLevel("");
  }

  // =========================
  // SAVE VITALS
  // =========================

  async function saveVitals() {
    if (!selectedPatientId) {
      alert("Please select a patient first.");
      return;
    }

    if (
      !bloodPressure.trim() &&
      !heartRate.trim() &&
      !temperature.trim() &&
      !oxygenLevel.trim()
    ) {
      alert("Please enter at least one vital sign.");
      return;
    }

    try {
      setSaving(true);

      const previous = monitoring[selectedPatientId] || {};

      const updatedRecord: PatientMonitoring = {
        ...previous,

        bloodPressure: bloodPressure.trim(),
        heartRate: heartRate.trim(),
        temperature: temperature.trim(),
        oxygenLevel: oxygenLevel.trim(),

        updatedAt: Date.now(),

        updatedBy:
          profile?.fullName ||
          profile?.email ||
          "Nurse",
      };

      await set(
        ref(db, `patientMonitoring/${selectedPatientId}`),
        updatedRecord
      );

      setMonitoring((current) => ({
        ...current,
        [selectedPatientId]: updatedRecord,
      }));

      alert("Patient vitals saved successfully.");
    } catch (error) {
      console.error("Error saving vitals:", error);
      alert("Unable to save vitals. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  // =========================
  // HELPERS
  // =========================

  function getPatientName(patient: UserProfile) {
    return patient.fullName || "Unnamed Patient";
  }

  function getPatientVitals(patientId: string) {
    return monitoring[patientId] || {};
  }

  function formatDate(timestamp?: number) {
    if (!timestamp) return "Not recorded";

    return new Date(timestamp).toLocaleString();
  }

  const selectedPatient = patients.find(
    (patient) => patient.uid === selectedPatientId
  );

  // =========================
  // UI
  // =========================

  return (
    <div style={styles.page}>
      <div style={styles.container}>

        {/* HEADER */}
        <div style={styles.header}>
          <div>
            <div style={styles.breadcrumb}>
              Nurse / Vitals
            </div>

            <h1 style={styles.title}>
              Patient Vitals
            </h1>

            <p style={styles.subtitle}>
              Record and monitor patient vital signs.
            </p>
          </div>

          <Link
            to="/nurse/dashboard"
            style={styles.backButton}
          >
            Back to Dashboard
          </Link>
        </div>

        {/* SUMMARY CARDS */}
        <div style={styles.statsGrid}>

          <StatCard
            icon={<Users size={22} />}
            title="Total Patients"
            value={patients.length.toString()}
          />

          <StatCard
            icon={<HeartPulse size={22} />}
            title="Vitals Recorded"
            value={Object.keys(monitoring).filter(
              (id) =>
                monitoring[id]?.bloodPressure ||
                monitoring[id]?.heartRate ||
                monitoring[id]?.temperature ||
                monitoring[id]?.oxygenLevel
            ).length.toString()}
          />

          <StatCard
            icon={<Activity size={22} />}
            title="Selected Patient"
            value={
              selectedPatient
                ? getPatientName(selectedPatient)
                : "None"
            }
          />

        </div>

        {/* SEARCH */}
        <div style={styles.searchBox}>
          <Search size={19} />

          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search patient by name or email..."
            style={styles.searchInput}
          />
        </div>

        <div style={styles.mainGrid}>

          {/* PATIENT LIST */}
          <section style={styles.card}>
            <div style={styles.cardHeader}>
              <div>
                <h2 style={styles.cardTitle}>
                  Patients
                </h2>

                <p style={styles.cardSubtitle}>
                  Select a patient to record vitals.
                </p>
              </div>

              <Users size={22} />
            </div>

            {loading ? (
              <div style={styles.empty}>
                Loading patients...
              </div>
            ) : filteredPatients.length === 0 ? (
              <div style={styles.empty}>
                No patients found.
              </div>
            ) : (
              <div style={styles.patientList}>
                {filteredPatients.map((patient) => {
                  const patientId = patient.uid || "";

                  const patientVitals =
                    getPatientVitals(patientId);

                  const isSelected =
                    selectedPatientId === patientId;

                  const hasVitals =
                    Boolean(
                      patientVitals.bloodPressure ||
                      patientVitals.heartRate ||
                      patientVitals.temperature ||
                      patientVitals.oxygenLevel
                    );

                  return (
                    <button
                      key={patientId}
                      onClick={() => selectPatient(patient)}
                      style={{
                        ...styles.patientItem,
                        ...(isSelected
                          ? styles.patientItemSelected
                          : {}),
                      }}
                    >
                      <div style={styles.avatar}>
                        <User size={20} />
                      </div>

                      <div style={styles.patientInfo}>
                        <strong>
                          {getPatientName(patient)}
                        </strong>

                        <span>
                          {patient.email || "No email"}
                        </span>

                        <small>
                          {hasVitals
                            ? "Vitals available"
                            : "No vitals recorded"}
                        </small>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </section>

          {/* VITALS FORM */}
          <section style={styles.card}>

            {!selectedPatient ? (
              <div style={styles.selectPatientMessage}>
                <div style={styles.largeIcon}>
                  <Stethoscope size={42} />
                </div>

                <h2>
                  Select a Patient
                </h2>

                <p>
                  Choose a patient from the list to
                  enter or update their vital signs.
                </p>
              </div>
            ) : (
              <>
                {/* SELECTED PATIENT */}
                <div style={styles.selectedPatientHeader}>

                  <div style={styles.selectedAvatar}>
                    <User size={25} />
                  </div>

                  <div>
                    <h2 style={styles.selectedName}>
                      {getPatientName(selectedPatient)}
                    </h2>

                    <p style={styles.selectedEmail}>
                      {selectedPatient.email || "No email"}
                    </p>
                  </div>

                </div>

                <div style={styles.divider} />

                <h3 style={styles.formHeading}>
                  Record / Update Vitals
                </h3>

                <p style={styles.formDescription}>
                  Enter the readings measured by the nurse.
                </p>

                {/* VITAL INPUTS */}
                <div style={styles.formGrid}>

                  <VitalInput
                    icon={<HeartPulse size={20} />}
                    label="Blood Pressure"
                    placeholder="e.g. 120/80"
                    value={bloodPressure}
                    onChange={setBloodPressure}
                    unit="mmHg"
                  />

                  <VitalInput
                    icon={<Activity size={20} />}
                    label="Heart Rate"
                    placeholder="e.g. 72"
                    value={heartRate}
                    onChange={setHeartRate}
                    unit="bpm"
                  />

                  <VitalInput
                    icon={<Thermometer size={20} />}
                    label="Temperature"
                    placeholder="e.g. 37"
                    value={temperature}
                    onChange={setTemperature}
                    unit="°C"
                  />

                  <VitalInput
                    icon={<Activity size={20} />}
                    label="Oxygen Level"
                    placeholder="e.g. 98"
                    value={oxygenLevel}
                    onChange={setOxygenLevel}
                    unit="%"
                  />

                </div>

                {/* CURRENT DATA */}
                <div style={styles.currentBox}>
                  <h3 style={styles.currentTitle}>
                    Current Saved Vitals
                  </h3>

                  <div style={styles.currentGrid}>

                    <MiniInfo
                      label="Blood Pressure"
                      value={
                        monitoring[selectedPatientId]
                          ?.bloodPressure || "—"
                      }
                    />

                    <MiniInfo
                      label="Heart Rate"
                      value={
                        monitoring[selectedPatientId]
                          ?.heartRate
                          ? `${monitoring[selectedPatientId].heartRate} bpm`
                          : "—"
                      }
                    />

                    <MiniInfo
                      label="Temperature"
                      value={
                        monitoring[selectedPatientId]
                          ?.temperature
                          ? `${monitoring[selectedPatientId].temperature} °C`
                          : "—"
                      }
                    />

                    <MiniInfo
                      label="Oxygen Level"
                      value={
                        monitoring[selectedPatientId]
                          ?.oxygenLevel
                          ? `${monitoring[selectedPatientId].oxygenLevel}%`
                          : "—"
                      }
                    />

                  </div>

                  {monitoring[selectedPatientId]?.updatedAt && (
                    <p style={styles.lastUpdated}>
                      Last updated:{" "}
                      {formatDate(
                        monitoring[selectedPatientId]
                          ?.updatedAt
                      )}
                    </p>
                  )}

                  {monitoring[selectedPatientId]?.updatedBy && (
                    <p style={styles.updatedBy}>
                      Updated by:{" "}
                      {monitoring[selectedPatientId]?.updatedBy}
                    </p>
                  )}
                </div>

                {/* BUTTONS */}
                <div style={styles.actions}>

                  <button
                    onClick={clearForm}
                    style={styles.cancelButton}
                    disabled={saving}
                  >
                    Clear
                  </button>

                  <button
                    onClick={saveVitals}
                    style={styles.saveButton}
                    disabled={saving}
                  >
                    <Save size={19} />

                    {saving
                      ? "Saving..."
                      : "Save Vitals"}
                  </button>

                </div>
              </>
            )}

          </section>
        </div>

        {/* INFORMATION NOTE */}
        <div style={styles.note}>
          <Stethoscope size={20} />

          <div>
            <strong>
              CareTrack Vitals
            </strong>

            <p>
              Vitals entered by the nurse are stored
              in the patient's monitoring record and
              can be reviewed by authorized healthcare
              staff.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}

// =========================
// STAT CARD
// =========================

function StatCard({
  icon,
  title,
  value,
}: {
  icon: React.ReactNode;
  title: string;
  value: string;
}) {
  return (
    <div style={styles.statCard}>

      <div style={styles.statIcon}>
        {icon}
      </div>

      <div>
        <p style={styles.statTitle}>
          {title}
        </p>

        <h3 style={styles.statValue}>
          {value}
        </h3>
      </div>

    </div>
  );
}

// =========================
// VITAL INPUT
// =========================

function VitalInput({
  icon,
  label,
  placeholder,
  value,
  onChange,
  unit,
}: {
  icon: React.ReactNode;
  label: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  unit: string;
}) {
  return (
    <div style={styles.inputGroup}>

      <label style={styles.label}>
        <span style={styles.labelIcon}>
          {icon}
        </span>

        {label}
      </label>

      <div style={styles.inputWrapper}>

        <input
          value={value}
          onChange={(e) =>
            onChange(e.target.value)
          }
          placeholder={placeholder}
          style={styles.input}
        />

        <span style={styles.unit}>
          {unit}
        </span>

      </div>

    </div>
  );
}

// =========================
// MINI INFO
// =========================

function MiniInfo({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div style={styles.miniInfo}>

      <span style={styles.miniLabel}>
        {label}
      </span>

      <strong style={styles.miniValue}>
        {value}
      </strong>

    </div>
  );
}

// =========================
// STYLES
// =========================

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    background: "#f6f8fb",
    padding: "32px",
  },

  container: {
    maxWidth: "1400px",
    margin: "0 auto",
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "20px",
    marginBottom: "28px",
  },

  breadcrumb: {
    fontSize: "13px",
    color: "#64748b",
    marginBottom: "8px",
  },

  title: {
    margin: 0,
    fontSize: "30px",
    fontWeight: 700,
    color: "#172033",
  },

  subtitle: {
    margin: "8px 0 0",
    color: "#64748b",
    fontSize: "15px",
  },

  backButton: {
    textDecoration: "none",
    background: "#ffffff",
    color: "#334155",
    border: "1px solid #dbe2ea",
    borderRadius: "10px",
    padding: "11px 16px",
    fontSize: "14px",
    fontWeight: 600,
  },

  statsGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "18px",
    marginBottom: "22px",
  },

  statCard: {
    background: "#ffffff",
    border: "1px solid #e4e9ef",
    borderRadius: "14px",
    padding: "20px",
    display: "flex",
    alignItems: "center",
    gap: "15px",
    boxShadow:
      "0 2px 8px rgba(15, 23, 42, 0.04)",
  },

  statIcon: {
    width: "46px",
    height: "46px",
    borderRadius: "12px",
    background: "#eef6ff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#2563eb",
  },

  statTitle: {
    margin: 0,
    color: "#64748b",
    fontSize: "13px",
  },

  statValue: {
    margin: "4px 0 0",
    color: "#172033",
    fontSize: "20px",
  },

  searchBox: {
    background: "#ffffff",
    border: "1px solid #e4e9ef",
    borderRadius: "12px",
    padding: "0 15px",
    height: "48px",
    display: "flex",
    alignItems: "center",
    gap: "10px",
    marginBottom: "22px",
    color: "#64748b",
  },

  searchInput: {
    border: "none",
    outline: "none",
    width: "100%",
    height: "100%",
    fontSize: "14px",
    color: "#172033",
    background: "transparent",
  },

  mainGrid: {
    display: "grid",
    gridTemplateColumns:
      "minmax(300px, 0.85fr) minmax(500px, 1.5fr)",
    gap: "22px",
    alignItems: "start",
  },

  card: {
    background: "#ffffff",
    border: "1px solid #e4e9ef",
    borderRadius: "16px",
    padding: "22px",
    boxShadow:
      "0 2px 8px rgba(15, 23, 42, 0.04)",
  },

  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    color: "#2563eb",
    marginBottom: "18px",
  },

  cardTitle: {
    margin: 0,
    fontSize: "19px",
    color: "#172033",
  },

  cardSubtitle: {
    margin: "5px 0 0",
    color: "#64748b",
    fontSize: "13px",
  },

  patientList: {
    display: "flex",
    flexDirection: "column",
    gap: "9px",
    maxHeight: "620px",
    overflowY: "auto",
  },

  patientItem: {
    width: "100%",
    border: "1px solid #e5eaf0",
    background: "#ffffff",
    borderRadius: "12px",
    padding: "13px",
    display: "flex",
    alignItems: "center",
    gap: "12px",
    textAlign: "left",
    cursor: "pointer",
  },

  patientItemSelected: {
    border: "1px solid #2563eb",
    background: "#eff6ff",
  },

  avatar: {
    width: "42px",
    height: "42px",
    borderRadius: "50%",
    background: "#eaf2ff",
    color: "#2563eb",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },

  patientInfo: {
    display: "flex",
    flexDirection: "column",
    gap: "3px",
    minWidth: 0,
  },

  empty: {
    padding: "40px 10px",
    textAlign: "center",
    color: "#64748b",
    fontSize: "14px",
  },

  selectPatientMessage: {
    minHeight: "520px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center",
    color: "#64748b",
    padding: "30px",
  },

  largeIcon: {
    width: "82px",
    height: "82px",
    borderRadius: "50%",
    background: "#eef6ff",
    color: "#2563eb",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: "20px",
  },

  selectedPatientHeader: {
    display: "flex",
    alignItems: "center",
    gap: "14px",
  },

  selectedAvatar: {
    width: "52px",
    height: "52px",
    borderRadius: "14px",
    background: "#eaf2ff",
    color: "#2563eb",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  selectedName: {
    margin: 0,
    fontSize: "20px",
    color: "#172033",
  },

  selectedEmail: {
    margin: "4px 0 0",
    fontSize: "13px",
    color: "#64748b",
  },

  divider: {
    height: "1px",
    background: "#e8edf2",
    margin: "22px 0",
  },

  formHeading: {
    margin: 0,
    fontSize: "18px",
    color: "#172033",
  },

  formDescription: {
    margin: "6px 0 20px",
    color: "#64748b",
    fontSize: "13px",
  },

  formGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(2, minmax(0, 1fr))",
    gap: "18px",
  },

  inputGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },

  label: {
    display: "flex",
    alignItems: "center",
    gap: "7px",
    fontSize: "13px",
    fontWeight: 600,
    color: "#334155",
  },

  labelIcon: {
    color: "#2563eb",
    display: "flex",
  },

  inputWrapper: {
    position: "relative",
    display: "flex",
    alignItems: "center",
  },

  input: {
    width: "100%",
    boxSizing: "border-box",
    height: "46px",
    border: "1px solid #d8e0e8",
    borderRadius: "9px",
    padding: "0 62px 0 13px",
    outline: "none",
    fontSize: "14px",
    color: "#172033",
    background: "#ffffff",
  },

  unit: {
    position: "absolute",
    right: "13px",
    color: "#64748b",
    fontSize: "12px",
    fontWeight: 600,
    pointerEvents: "none",
  },

  currentBox: {
    marginTop: "24px",
    padding: "17px",
    borderRadius: "12px",
    background: "#f8fafc",
    border: "1px solid #e6ebf0",
  },

  currentTitle: {
    margin: "0 0 14px",
    fontSize: "14px",
    color: "#334155",
  },

  currentGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(2, minmax(0, 1fr))",
    gap: "10px",
  },

  miniInfo: {
    background: "#ffffff",
    border: "1px solid #e5eaf0",
    borderRadius: "9px",
    padding: "11px",
    display: "flex",
    flexDirection: "column",
    gap: "4px",
  },

  miniLabel: {
    fontSize: "11px",
    color: "#64748b",
  },

  miniValue: {
    fontSize: "15px",
    color: "#172033",
  },

  lastUpdated: {
    margin: "14px 0 0",
    fontSize: "11px",
    color: "#64748b",
  },

  updatedBy: {
    margin: "4px 0 0",
    fontSize: "11px",
    color: "#64748b",
  },

  actions: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "10px",
    marginTop: "22px",
  },

  cancelButton: {
    height: "44px",
    padding: "0 18px",
    borderRadius: "9px",
    border: "1px solid #d8e0e8",
    background: "#ffffff",
    color: "#475569",
    fontWeight: 600,
    cursor: "pointer",
  },

  saveButton: {
    height: "44px",
    padding: "0 20px",
    borderRadius: "9px",
    border: "none",
    background: "#2563eb",
    color: "#ffffff",
    fontWeight: 600,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },

  note: {
    marginTop: "22px",
    background: "#eff6ff",
    border: "1px solid #dbeafe",
    borderRadius: "12px",
    padding: "16px",
    display: "flex",
    gap: "12px",
    color: "#2563eb",
  },
};