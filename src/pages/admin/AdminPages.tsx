import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  AlertCircle,
  BedDouble,
  Bell,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  Clock3,
  FileText,
  HeartPulse,
  History,
  RefreshCw,
  Search,
  Settings,
  ShieldCheck,
  Stethoscope,
  UserRound,
  Users,
  XCircle,
} from "lucide-react";

import { get, push, ref, set } from "firebase/database";
import { db } from "../../lib/firebase";


/* =========================================================
   TYPES
========================================================= */

interface SystemUser {
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
  id: string;
  patientId: string;
  patientName: string;
  patientEmail?: string;
  ward: string;
  bed: string;
  admissionDate: string;
  status: "admitted" | "discharged" | "pending";
  notes?: string;
  createdAt?: number;
}

interface AdminPageProps {
  title: string;
  description: string;
  icon: any;
  children: React.ReactNode;
}


/* =========================================================
   COMMON PAGE WRAPPER
========================================================= */

function AdminPage({
  title,
  description,
  icon: Icon,
  children,
}: AdminPageProps) {
  return (
    <div>
      <div className="page-title">
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
          }}
        >
          <div
            style={{
              width: "46px",
              height: "46px",
              borderRadius: "12px",
              background: "#eaf6f6",
              color: "#087b83",
              display: "grid",
              placeItems: "center",
              flexShrink: 0,
            }}
          >
            <Icon size={23} />
          </div>

          <div>
            <h1>{title}</h1>
            <p
              style={{
                margin: 0,
                color: "#8293a0",
                fontSize: "13px",
              }}
            >
              {description}
            </p>
          </div>
        </div>
      </div>

      {children}
    </div>
  );
}


/* =========================================================
   USERS HOOK
========================================================= */

function useUsers() {
  const [users, setUsers] = useState<SystemUser[]>([]);
  const [loading, setLoading] = useState(true);

  const loadUsers = async () => {
    try {
      setLoading(true);

      const snapshot = await get(ref(db, "users"));

      if (!snapshot.exists()) {
        setUsers([]);
        return;
      }

      const data = snapshot.val();

      const list: SystemUser[] = Object.entries(data).map(
        ([uid, value]: [string, any]) => ({
          uid,
          ...value,
        })
      );

      setUsers(list);
    } catch (error) {
      console.error("Failed to load users:", error);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  return {
    users,
    loading,
    refresh: loadUsers,
  };
}


/* =========================================================
   SEARCH BOX
========================================================= */

function SearchBox({
  value,
  onChange,
  placeholder = "Search...",
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <div
      style={{
        position: "relative",
        flex: 1,
        minWidth: "220px",
      }}
    >
      <Search
        size={17}
        style={{
          position: "absolute",
          left: "13px",
          top: "50%",
          transform: "translateY(-50%)",
          color: "#8b9aa6",
        }}
      />

      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          width: "100%",
          padding: "11px 12px 11px 39px",
          border: "1px solid #dce5eb",
          borderRadius: "9px",
          outline: "none",
          background: "white",
        }}
      />
    </div>
  );
}


/* =========================================================
   BUTTON
========================================================= */

function ActionButton({
  children,
  onClick,
  type = "button",
  disabled = false,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  type?: "button" | "submit";
  disabled?: boolean;
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      style={{
        border: 0,
        borderRadius: "8px",
        padding: "10px 14px",
        background: "#087b83",
        color: "white",
        fontWeight: 700,
        fontSize: "12px",
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.6 : 1,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "7px",
      }}
    >
      {children}
    </button>
  );
}


/* =========================================================
   STATUS BADGE
========================================================= */

function StatusBadge({
  status,
}: {
  status: string;
}) {
  const normalized = status.toLowerCase();

  let background = "#eef2f5";
  let color = "#637583";

  if (
    normalized === "active" ||
    normalized === "approved" ||
    normalized === "admitted"
  ) {
    background = "#e9f7f0";
    color = "#21825b";
  }

  if (
    normalized === "pending"
  ) {
    background = "#fff5df";
    color = "#a56b00";
  }

  if (
    normalized === "inactive" ||
    normalized === "rejected" ||
    normalized === "discharged"
  ) {
    background = "#fbecec";
    color = "#b44d4d";
  }

  return (
    <span
      style={{
        display: "inline-block",
        padding: "5px 9px",
        borderRadius: "20px",
        background,
        color,
        fontSize: "10px",
        fontWeight: 800,
        textTransform: "uppercase",
      }}
    >
      {status}
    </span>
  );
}


/* =========================================================
   ADMIN PATIENTS
========================================================= */

export function AdminPatients() {
  const { users, loading, refresh } = useUsers();
  const [search, setSearch] = useState("");

  const patients = useMemo(() => {
    const query = search.toLowerCase().trim();

    return users
      .filter((user) => user.role === "patient")
      .filter((user) => {
        if (!query) return true;

        return (
          user.fullName?.toLowerCase().includes(query) ||
          user.email?.toLowerCase().includes(query) ||
          user.phone?.toLowerCase().includes(query)
        );
      });
  }, [users, search]);

  const totalPatients = users.filter(
    (user) => user.role === "patient"
  ).length;

  const activePatients = users.filter(
    (user) =>
      user.role === "patient" &&
      user.active
  ).length;

  return (
    <AdminPage
      title="Patients"
      description="View and manage registered CareTrack patients."
      icon={Users}
    >

      {/* =========================
          PATIENT SUMMARY CARDS
      ========================= */}

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "16px",
          marginBottom: "20px",
        }}
      >

        {/* Total Patients */}

        <div
          style={{
            background: "white",
            border: "1px solid #e1e9ef",
            borderRadius: "14px",
            padding: "18px",
            display: "flex",
            alignItems: "center",
            gap: "14px",
            minHeight: "82px",
          }}
        >
          <div
            style={{
              width: "42px",
              height: "42px",
              borderRadius: "11px",
              background: "#eaf6f6",
              color: "#087b83",
              display: "grid",
              placeItems: "center",
              flexShrink: 0,
            }}
          >
            <Users size={20} />
          </div>

          <div>
            <span
              style={{
                display: "block",
                color: "#7b8c99",
                fontSize: "12px",
                marginBottom: "4px",
              }}
            >
              Total Patients
            </span>

            <strong
              style={{
                display: "block",
                color: "#17324d",
                fontSize: "24px",
                lineHeight: 1,
              }}
            >
              {totalPatients}
            </strong>
          </div>
        </div>


        {/* Active Patients */}

        <div
          style={{
            background: "white",
            border: "1px solid #e1e9ef",
            borderRadius: "14px",
            padding: "18px",
            display: "flex",
            alignItems: "center",
            gap: "14px",
            minHeight: "82px",
          }}
        >
          <div
            style={{
              width: "42px",
              height: "42px",
              borderRadius: "11px",
              background: "#e9f7f0",
              color: "#21825b",
              display: "grid",
              placeItems: "center",
              flexShrink: 0,
            }}
          >
            <CheckCircle2 size={20} />
          </div>

          <div>
            <span
              style={{
                display: "block",
                color: "#7b8c99",
                fontSize: "12px",
                marginBottom: "4px",
              }}
            >
              Active Patients
            </span>

            <strong
              style={{
                display: "block",
                color: "#17324d",
                fontSize: "24px",
                lineHeight: 1,
              }}
            >
              {activePatients}
            </strong>
          </div>
        </div>

      </div>


      {/* =========================
          PATIENT RECORD PANEL
      ========================= */}

      <div
        className="panel"
        style={{
          padding: "22px",
          overflow: "hidden",
        }}
      >

        {/* Search Header */}

        <div
          style={{
            display: "flex",
            gap: "10px",
            alignItems: "center",
            flexWrap: "wrap",
            marginBottom: "20px",
          }}
        >

          <SearchBox
            value={search}
            onChange={setSearch}
            placeholder="Search patient name, email or phone..."
          />

          <ActionButton onClick={refresh}>
            <RefreshCw size={15} />
            Refresh
          </ActionButton>

        </div>


        {/* Loading */}

        {loading ? (

          <div
            style={{
              padding: "45px 20px",
              textAlign: "center",
              color: "#8293a0",
            }}
          >
            <RefreshCw
              size={28}
              style={{
                marginBottom: "10px",
              }}
            />

            <p
              style={{
                margin: 0,
              }}
            >
              Loading patients...
            </p>
          </div>

        ) : patients.length === 0 ? (

          /* No patients */

          <div
            style={{
              textAlign: "center",
              padding: "45px 20px",
              color: "#8293a0",
            }}
          >
            <Users
              size={36}
              style={{
                marginBottom: "8px",
              }}
            />

            <h3
              style={{
                margin: "0 0 5px",
                color: "#536b7b",
                fontSize: "16px",
              }}
            >
              No patients found
            </h3>

            <p
              style={{
                margin: 0,
                fontSize: "13px",
              }}
            >
              No registered patients match your search.
            </p>
          </div>

        ) : (

          /* Patient Records */

          <div
            style={{
              width: "100%",
              overflowX: "auto",
            }}
          >

            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                minWidth: "700px",
              }}
            >

              <thead>

                <tr>

                  <th
                    style={{
                      textAlign: "left",
                      padding: "12px 14px",
                      background: "#f6f9fb",
                      borderBottom: "1px solid #e1e9ef",
                      color: "#647888",
                      fontSize: "11px",
                      fontWeight: 800,
                      textTransform: "uppercase",
                      letterSpacing: ".04em",
                    }}
                  >
                    Patient
                  </th>

                  <th
                    style={{
                      textAlign: "left",
                      padding: "12px 14px",
                      background: "#f6f9fb",
                      borderBottom: "1px solid #e1e9ef",
                      color: "#647888",
                      fontSize: "11px",
                      fontWeight: 800,
                      textTransform: "uppercase",
                      letterSpacing: ".04em",
                    }}
                  >
                    Email
                  </th>

                  <th
                    style={{
                      textAlign: "left",
                      padding: "12px 14px",
                      background: "#f6f9fb",
                      borderBottom: "1px solid #e1e9ef",
                      color: "#647888",
                      fontSize: "11px",
                      fontWeight: 800,
                      textTransform: "uppercase",
                      letterSpacing: ".04em",
                    }}
                  >
                    Phone
                  </th>

                  <th
                    style={{
                      textAlign: "left",
                      padding: "12px 14px",
                      background: "#f6f9fb",
                      borderBottom: "1px solid #e1e9ef",
                      color: "#647888",
                      fontSize: "11px",
                      fontWeight: 800,
                      textTransform: "uppercase",
                      letterSpacing: ".04em",
                    }}
                  >
                    Status
                  </th>

                </tr>

              </thead>


              <tbody>

                {patients.map((patient) => (

                  <tr key={patient.uid}>

                    {/* Patient */}

                    <td
                      style={{
                        padding: "15px 14px",
                        borderBottom: "1px solid #edf1f4",
                        verticalAlign: "middle",
                      }}
                    >

                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "11px",
                        }}
                      >

                        <div
                          style={{
                            width: "38px",
                            height: "38px",
                            borderRadius: "50%",
                            background: "#e4f3f3",
                            color: "#087b83",
                            display: "grid",
                            placeItems: "center",
                            fontWeight: 800,
                            fontSize: "13px",
                            flexShrink: 0,
                          }}
                        >
                          {(patient.fullName ||
                            "P")
                            .charAt(0)
                            .toUpperCase()}
                        </div>

                        <div>

                          <strong
                            style={{
                              display: "block",
                              color: "#17324d",
                              fontSize: "13px",
                            }}
                          >
                            {patient.fullName ||
                              "Unnamed Patient"}
                          </strong>

                          <small
                            style={{
                              display: "block",
                              color: "#8293a0",
                              marginTop: "3px",
                              fontSize: "10px",
                            }}
                          >
                            Patient ID:{" "}
                            {patient.uid.slice(0, 8)}
                          </small>

                        </div>

                      </div>

                    </td>


                    {/* Email */}

                    <td
                      style={{
                        padding: "15px 14px",
                        borderBottom: "1px solid #edf1f4",
                        color: "#536b7b",
                        fontSize: "12px",
                      }}
                    >
                      {patient.email || "—"}
                    </td>


                    {/* Phone */}

                    <td
                      style={{
                        padding: "15px 14px",
                        borderBottom: "1px solid #edf1f4",
                        color: "#536b7b",
                        fontSize: "12px",
                      }}
                    >
                      {patient.phone || "—"}
                    </td>


                    {/* Status */}

                    <td
                      style={{
                        padding: "15px 14px",
                        borderBottom: "1px solid #edf1f4",
                      }}
                    >

                      <StatusBadge
                        status={
                          patient.active
                            ? "Active"
                            : "Inactive"
                        }
                      />

                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>

        )}

      </div>

    </AdminPage>
  );
}


/* =========================================================
   ADMIN DOCTORS
========================================================= */

export function AdminDoctors() {
  const { users, loading, refresh } = useUsers();
  const [search, setSearch] = useState("");

  const doctors = useMemo(() => {
    const query = search.toLowerCase().trim();

    return users
      .filter((user) => user.role === "doctor")
      .filter((user) => {
        if (!query) return true;

        return (
          user.fullName?.toLowerCase().includes(query) ||
          user.email?.toLowerCase().includes(query)
        );
      });
  }, [users, search]);

  return (
    <AdminPage
      title="Doctors"
      description="Manage registered doctors and their approval status."
      icon={Stethoscope}
    >
      <div className="panel">
        <div
          style={{
            display: "flex",
            gap: "10px",
            flexWrap: "wrap",
            marginBottom: "18px",
          }}
        >
          <SearchBox
            value={search}
            onChange={setSearch}
            placeholder="Search doctors..."
          />

          <ActionButton onClick={refresh}>
            <RefreshCw size={15} />
            Refresh
          </ActionButton>
        </div>

        {loading ? (
          <p>Loading doctors...</p>
        ) : doctors.length === 0 ? (
          <p style={{ color: "#8293a0" }}>
            No doctors found.
          </p>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Approval</th>
                  <th>Account</th>
                </tr>
              </thead>

              <tbody>
                {doctors.map((doctor) => (
                  <tr key={doctor.uid}>
                    <td>
                      <strong>
                        {doctor.fullName || "Unnamed Doctor"}
                      </strong>
                    </td>

                    <td>{doctor.email || "—"}</td>

                    <td>
                      <StatusBadge
                        status={
                          doctor.approvalStatus || "pending"
                        }
                      />
                    </td>

                    <td>
                      <StatusBadge
                        status={
                          doctor.active
                            ? "Active"
                            : "Inactive"
                        }
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminPage>
  );
}


/* =========================================================
   ADMIN NURSES
========================================================= */

export function AdminNurses() {
  const { users, loading, refresh } = useUsers();
  const [search, setSearch] = useState("");

  const nurses = useMemo(() => {
    const query = search.toLowerCase().trim();

    return users
      .filter((user) => user.role === "nurse")
      .filter((user) => {
        if (!query) return true;

        return (
          user.fullName?.toLowerCase().includes(query) ||
          user.email?.toLowerCase().includes(query)
        );
      });
  }, [users, search]);

  return (
    <AdminPage
      title="Nurses"
      description="Manage registered nurses and their approval status."
      icon={Users}
    >
      <div className="panel">
        <div
          style={{
            display: "flex",
            gap: "10px",
            flexWrap: "wrap",
            marginBottom: "18px",
          }}
        >
          <SearchBox
            value={search}
            onChange={setSearch}
            placeholder="Search nurses..."
          />

          <ActionButton onClick={refresh}>
            <RefreshCw size={15} />
            Refresh
          </ActionButton>
        </div>

        {loading ? (
          <p>Loading nurses...</p>
        ) : nurses.length === 0 ? (
          <p style={{ color: "#8293a0" }}>
            No nurses found.
          </p>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Approval</th>
                  <th>Account</th>
                </tr>
              </thead>

              <tbody>
                {nurses.map((nurse) => (
                  <tr key={nurse.uid}>
                    <td>
                      <strong>
                        {nurse.fullName || "Unnamed Nurse"}
                      </strong>
                    </td>

                    <td>{nurse.email || "—"}</td>

                    <td>
                      <StatusBadge
                        status={
                          nurse.approvalStatus || "pending"
                        }
                      />
                    </td>

                    <td>
                      <StatusBadge
                        status={
                          nurse.active
                            ? "Active"
                            : "Inactive"
                        }
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminPage>
  );
}


/* =========================================================
   ADMIN ADMISSIONS
========================================================= */

export function AdminAdmissions() {
  const { users } = useUsers();

  const [admissions, setAdmissions] = useState<Admission[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [search, setSearch] = useState("");

  const [patientId, setPatientId] = useState("");
  const [ward, setWard] = useState("General Ward");
  const [bed, setBed] = useState("");
  const [admissionDate, setAdmissionDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [status, setStatus] =
    useState<Admission["status"]>("admitted");
  const [notes, setNotes] = useState("");

  const [message, setMessage] = useState("");


  const patients = users.filter(
    (user) => user.role === "patient"
  );


  const loadAdmissions = async () => {
    try {
      setLoading(true);

      const snapshot = await get(
        ref(db, "admissions")
      );

      if (!snapshot.exists()) {
        setAdmissions([]);
        return;
      }

      const data = snapshot.val();

      const list: Admission[] = Object.entries(data).map(
        ([id, value]: [string, any]) => ({
          id,
          ...value,
        })
      );

      list.sort(
        (a, b) =>
          (b.createdAt || 0) -
          (a.createdAt || 0)
      );

      setAdmissions(list);
    } catch (error) {
      console.error(
        "Failed to load admissions:",
        error
      );

      setAdmissions([]);
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    loadAdmissions();
  }, []);


  const selectedPatient = patients.find(
    (patient) => patient.uid === patientId
  );


  const handleCreateAdmission = async (
    event: React.FormEvent
  ) => {
    event.preventDefault();

    setMessage("");

    if (!patientId) {
      setMessage("Please select a patient.");
      return;
    }

    if (!bed.trim()) {
      setMessage("Please enter a bed number.");
      return;
    }

    try {
      setSaving(true);

      const admissionRef = push(
        ref(db, "admissions")
      );

      const newAdmission: Admission = {
        id: admissionRef.key || "",
        patientId,
        patientName:
          selectedPatient?.fullName ||
          "Unknown Patient",
        patientEmail:
          selectedPatient?.email || "",
        ward,
        bed: bed.trim(),
        admissionDate,
        status,
        notes: notes.trim(),
        createdAt: Date.now(),
      };

      await set(
        admissionRef,
        newAdmission
      );

      setPatientId("");
      setWard("General Ward");
      setBed("");
      setAdmissionDate(
        new Date().toISOString().split("T")[0]
      );
      setStatus("admitted");
      setNotes("");

      setMessage(
        "Admission created successfully."
      );

      await loadAdmissions();
    } catch (error) {
      console.error(
        "Admission creation failed:",
        error
      );

      setMessage(
        "Unable to save admission. Check Firebase rules."
      );
    } finally {
      setSaving(false);
    }
  };


  const filteredAdmissions = admissions.filter(
    (admission) => {
      const query =
        search.toLowerCase().trim();

      if (!query) return true;

      return (
        admission.patientName
          ?.toLowerCase()
          .includes(query) ||
        admission.ward
          ?.toLowerCase()
          .includes(query) ||
        admission.bed
          ?.toLowerCase()
          .includes(query) ||
        admission.status
          ?.toLowerCase()
          .includes(query)
      );
    }
  );


  const admittedCount = admissions.filter(
    (item) => item.status === "admitted"
  ).length;

  const pendingCount = admissions.filter(
    (item) => item.status === "pending"
  ).length;

  const dischargedCount = admissions.filter(
    (item) => item.status === "discharged"
  ).length;


  return (
    <AdminPage
      title="Admissions"
      description="Create and monitor patient admission records."
      icon={ClipboardList}
    >

      {/* =========================
          STATS
      ========================= */}

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit,minmax(180px,1fr))",
          gap: "15px",
          marginBottom: "20px",
        }}
      >

        <div className="stat-card">
          <BedDouble size={20} />
          <span>Current Admissions</span>
          <strong>{admittedCount}</strong>
        </div>

        <div className="stat-card">
          <Clock3 size={20} />
          <span>Pending</span>
          <strong>{pendingCount}</strong>
        </div>

        <div className="stat-card">
          <CheckCircle2 size={20} />
          <span>Discharged</span>
          <strong>{dischargedCount}</strong>
        </div>

      </div>


      {/* =========================
          CREATE ADMISSION
      ========================= */}

      <div
        className="panel"
        style={{
          marginBottom: "20px",
        }}
      >

        <div
          style={{
            marginBottom: "18px",
          }}
        >
          <h3
            style={{
              margin: 0,
              color: "#17324d",
            }}
          >
            Create Admission
          </h3>

          <p
            style={{
              margin: "5px 0 0",
              color: "#8293a0",
              fontSize: "12px",
            }}
          >
            Assign a registered patient to a ward and bed.
          </p>
        </div>


        <form onSubmit={handleCreateAdmission}>

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit,minmax(220px,1fr))",
              gap: "15px",
            }}
          >

            <label>
              <span
                style={{
                  display: "block",
                  marginBottom: "7px",
                  fontSize: "12px",
                  fontWeight: 700,
                  color: "#536b7b",
                }}
              >
                Patient
              </span>

              <select
                value={patientId}
                onChange={(e) =>
                  setPatientId(e.target.value)
                }
                style={{
                  width: "100%",
                  padding: "11px",
                  border:
                    "1px solid #dce5eb",
                  borderRadius: "8px",
                  background: "white",
                }}
              >
                <option value="">
                  Select patient
                </option>

                {patients.map((patient) => (
                  <option
                    key={patient.uid}
                    value={patient.uid}
                  >
                    {patient.fullName ||
                      patient.email ||
                      "Unnamed Patient"}
                  </option>
                ))}
              </select>
            </label>


            <label>
              <span
                style={{
                  display: "block",
                  marginBottom: "7px",
                  fontSize: "12px",
                  fontWeight: 700,
                  color: "#536b7b",
                }}
              >
                Ward
              </span>

              <select
                value={ward}
                onChange={(e) =>
                  setWard(e.target.value)
                }
                style={{
                  width: "100%",
                  padding: "11px",
                  border:
                    "1px solid #dce5eb",
                  borderRadius: "8px",
                  background: "white",
                }}
              >
                <option>
                  General Ward
                </option>

                <option>
                  Medical Ward
                </option>

                <option>
                  Surgical Ward
                </option>

                <option>
                  Private Ward
                </option>
              </select>
            </label>


            <label>
              <span
                style={{
                  display: "block",
                  marginBottom: "7px",
                  fontSize: "12px",
                  fontWeight: 700,
                  color: "#536b7b",
                }}
              >
                Bed Number
              </span>

              <input
                value={bed}
                onChange={(e) =>
                  setBed(e.target.value)
                }
                placeholder="e.g. B-104"
                style={{
                  width: "100%",
                  padding: "11px",
                  border:
                    "1px solid #dce5eb",
                  borderRadius: "8px",
                }}
              />
            </label>


            <label>
              <span
                style={{
                  display: "block",
                  marginBottom: "7px",
                  fontSize: "12px",
                  fontWeight: 700,
                  color: "#536b7b",
                }}
              >
                Admission Date
              </span>

              <input
                type="date"
                value={admissionDate}
                onChange={(e) =>
                  setAdmissionDate(
                    e.target.value
                  )
                }
                style={{
                  width: "100%",
                  padding: "11px",
                  border:
                    "1px solid #dce5eb",
                  borderRadius: "8px",
                }}
              />
            </label>


            <label>
              <span
                style={{
                  display: "block",
                  marginBottom: "7px",
                  fontSize: "12px",
                  fontWeight: 700,
                  color: "#536b7b",
                }}
              >
                Status
              </span>

              <select
                value={status}
                onChange={(e) =>
                  setStatus(
                    e.target.value as Admission["status"]
                  )
                }
                style={{
                  width: "100%",
                  padding: "11px",
                  border:
                    "1px solid #dce5eb",
                  borderRadius: "8px",
                  background: "white",
                }}
              >
                <option value="admitted">
                  Admitted
                </option>

                <option value="pending">
                  Pending
                </option>

                <option value="discharged">
                  Discharged
                </option>
              </select>
            </label>


            <label>
              <span
                style={{
                  display: "block",
                  marginBottom: "7px",
                  fontSize: "12px",
                  fontWeight: 700,
                  color: "#536b7b",
                }}
              >
                Notes
              </span>

              <input
                value={notes}
                onChange={(e) =>
                  setNotes(e.target.value)
                }
                placeholder="Optional admission notes"
                style={{
                  width: "100%",
                  padding: "11px",
                  border:
                    "1px solid #dce5eb",
                  borderRadius: "8px",
                }}
              />
            </label>

          </div>


          {message && (
            <div
              style={{
                marginTop: "15px",
                padding: "11px 13px",
                borderRadius: "8px",
                background:
                  message.includes("successfully")
                    ? "#e9f7f0"
                    : "#fbecec",
                color:
                  message.includes("successfully")
                    ? "#21825b"
                    : "#b44d4d",
                fontSize: "12px",
                fontWeight: 700,
              }}
            >
              {message}
            </div>
          )}


          <div
            style={{
              marginTop: "18px",
            }}
          >
            <ActionButton
              type="submit"
              disabled={saving}
            >
              <ClipboardList size={15} />

              {saving
                ? "Saving..."
                : "Create Admission"}
            </ActionButton>
          </div>

        </form>
      </div>


      {/* =========================
          ADMISSION RECORDS
      ========================= */}

      <div className="panel">

        <div
          style={{
            display: "flex",
            gap: "10px",
            flexWrap: "wrap",
            marginBottom: "18px",
          }}
        >

          <SearchBox
            value={search}
            onChange={setSearch}
            placeholder="Search patient, ward, bed or status..."
          />

          <ActionButton
            onClick={loadAdmissions}
          >
            <RefreshCw size={15} />
            Refresh
          </ActionButton>

        </div>


        {loading ? (
          <p>Loading admissions...</p>
        ) : filteredAdmissions.length === 0 ? (

          <div
            style={{
              textAlign: "center",
              padding: "45px 20px",
              color: "#8293a0",
            }}
          >
            <ClipboardList size={36} />

            <h3
              style={{
                color: "#536b7b",
                marginBottom: "5px",
              }}
            >
              No admission records
            </h3>

            <p>
              Create an admission above to add the
              first patient admission.
            </p>
          </div>

        ) : (

          <div
            style={{
              overflowX: "auto",
            }}
          >

            <table className="data-table">

              <thead>
                <tr>
                  <th>Patient</th>
                  <th>Ward</th>
                  <th>Bed</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Notes</th>
                </tr>
              </thead>

              <tbody>

                {filteredAdmissions.map(
                  (admission) => (
                    <tr key={admission.id}>

                      <td>
                        <strong>
                          {admission.patientName}
                        </strong>

                        {admission.patientEmail && (
                          <small
                            style={{
                              display: "block",
                              color: "#8293a0",
                              marginTop: "3px",
                            }}
                          >
                            {admission.patientEmail}
                          </small>
                        )}
                      </td>

                      <td>
                        {admission.ward}
                      </td>

                      <td>
                        <strong>
                          {admission.bed}
                        </strong>
                      </td>

                      <td>
                        {admission.admissionDate}
                      </td>

                      <td>
                        <StatusBadge
                          status={admission.status}
                        />
                      </td>

                      <td>
                        {admission.notes || "—"}
                      </td>

                    </tr>
                  )
                )}

              </tbody>

            </table>

          </div>

        )}

      </div>

    </AdminPage>
  );
}


/* =========================================================
   ADMIN WARDS
========================================================= */

export function AdminWards() {
  const wards = [
    {
      name: "General Ward",
      beds: 30,
      occupied: 18,
    },
    {
      name: "Medical Ward",
      beds: 25,
      occupied: 14,
    },
    {
      name: "Surgical Ward",
      beds: 20,
      occupied: 12,
    },
    {
      name: "Private Ward",
      beds: 15,
      occupied: 7,
    },
  ];

  return (
    <AdminPage
      title="Wards"
      description="Monitor ward capacity and bed availability."
      icon={BedDouble}
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit,minmax(240px,1fr))",
          gap: "18px",
        }}
      >
        {wards.map((ward) => {
          const available =
            ward.beds - ward.occupied;

          const percentage =
            Math.round(
              (ward.occupied / ward.beds) * 100
            );

          return (
            <div
              className="panel"
              key={ward.name}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "18px",
                }}
              >
                <div>
                  <h3
                    style={{
                      margin: 0,
                    }}
                  >
                    {ward.name}
                  </h3>

                  <span
                    style={{
                      color: "#8293a0",
                      fontSize: "11px",
                    }}
                  >
                    Ward capacity
                  </span>
                </div>

                <BedDouble
                  size={22}
                  color="#087b83"
                />
              </div>

              <div
                style={{
                  height: "8px",
                  borderRadius: "10px",
                  background: "#e8eef2",
                  overflow: "hidden",
                  marginBottom: "15px",
                }}
              >
                <div
                  style={{
                    width: `${percentage}%`,
                    height: "100%",
                    background: "#087b83",
                  }}
                />
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "repeat(3,1fr)",
                  gap: "8px",
                  textAlign: "center",
                }}
              >
                <div>
                  <strong>{ward.beds}</strong>
                  <small
                    style={{
                      display: "block",
                      color: "#8293a0",
                    }}
                  >
                    Beds
                  </small>
                </div>

                <div>
                  <strong>{ward.occupied}</strong>
                  <small
                    style={{
                      display: "block",
                      color: "#8293a0",
                    }}
                  >
                    Occupied
                  </small>
                </div>

                <div>
                  <strong>{available}</strong>
                  <small
                    style={{
                      display: "block",
                      color: "#8293a0",
                    }}
                  >
                    Available
                  </small>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </AdminPage>
  );
}


/* =========================================================
   ADMIN APPOINTMENTS
========================================================= */

export function AdminAppointments() {
  return (
    <AdminPage
      title="Appointments"
      description="Monitor patient appointments across CareTrack."
      icon={CalendarDays}
    >
      <div className="panel">
        <div
          style={{
            textAlign: "center",
            padding: "45px 20px",
          }}
        >
          <CalendarDays
            size={42}
            color="#087b83"
          />

          <h3>Appointment Management</h3>

          <p
            style={{
              color: "#8293a0",
              maxWidth: "550px",
              margin: "0 auto",
            }}
          >
            This section is ready for appointment
            records from patients and doctors.
          </p>
        </div>
      </div>
    </AdminPage>
  );
}


/* =========================================================
   ADMIN REPORTS
========================================================= */

export function AdminReports() {
  const reports = [
    {
      title: "Patient Activity Report",
      icon: Activity,
      description:
        "Review patient self-reported information and activity.",
    },
    {
      title: "Staff Activity Report",
      icon: Users,
      description:
        "Review activity related to doctors and nurses.",
    },
    {
      title: "System Summary",
      icon: FileText,
      description:
        "View an overall summary of the CareTrack system.",
    },
  ];

  return (
    <AdminPage
      title="Reports"
      description="View administrative reports and system summaries."
      icon={FileText}
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit,minmax(260px,1fr))",
          gap: "18px",
        }}
      >
        {reports.map((report) => {
          const Icon = report.icon;

          return (
            <div
              className="panel"
              key={report.title}
            >
              <Icon
                size={28}
                color="#087b83"
              />

              <h3>{report.title}</h3>

              <p
                style={{
                  color: "#8293a0",
                  fontSize: "13px",
                  lineHeight: 1.6,
                }}
              >
                {report.description}
              </p>

              <ActionButton>
                <FileText size={14} />
                View Report
              </ActionButton>
            </div>
          );
        })}
      </div>
    </AdminPage>
  );
}


/* =========================================================
   ADMIN AUDIT LOGS
========================================================= */

export function AdminAuditLogs() {
  const logs = [
    {
      action: "Staff approval workflow",
      detail:
        "Admin approval activity is monitored here.",
      time: "Recent",
    },
    {
      action: "User management",
      detail:
        "Patient and staff account activity.",
      time: "System",
    },
  ];

  return (
    <AdminPage
      title="Audit Logs"
      description="Review administrative activity and system events."
      icon={ShieldCheck}
    >
      <div className="panel">

        {logs.map((log, index) => (
          <div
            key={index}
            style={{
              display: "flex",
              gap: "14px",
              padding: "15px 0",
              borderBottom:
                index === logs.length - 1
                  ? "0"
                  : "1px solid #edf1f4",
            }}
          >
            <History
              size={20}
              color="#087b83"
            />

            <div>
              <strong>{log.action}</strong>

              <p
                style={{
                  margin: "4px 0",
                  color: "#8293a0",
                  fontSize: "12px",
                }}
              >
                {log.detail}
              </p>

              <small
                style={{
                  color: "#a0adb6",
                }}
              >
                {log.time}
              </small>
            </div>
          </div>
        ))}

      </div>
    </AdminPage>
  );
}


/* =========================================================
   ADMIN NOTIFICATIONS
========================================================= */

export function AdminNotifications() {
  return (
    <AdminPage
      title="Notifications"
      description="Monitor system notifications and important alerts."
      icon={Bell}
    >
      <div className="panel">

        <div
          style={{
            display: "flex",
            gap: "14px",
            alignItems: "flex-start",
            padding: "16px",
            background: "#fff8e7",
            borderRadius: "10px",
            marginBottom: "12px",
          }}
        >
          <AlertCircle
            size={21}
            color="#b77a00"
          />

          <div>
            <strong>
              Staff approval notifications
            </strong>

            <p
              style={{
                margin: "4px 0 0",
                color: "#7d6b43",
                fontSize: "12px",
              }}
            >
              Pending nurse and doctor registrations
              require administrator attention.
            </p>
          </div>
        </div>


        <div
          style={{
            display: "flex",
            gap: "14px",
            alignItems: "flex-start",
            padding: "16px",
            background: "#eaf6f6",
            borderRadius: "10px",
          }}
        >
          <Bell
            size={21}
            color="#087b83"
          />

          <div>
            <strong>
              CareTrack system
            </strong>

            <p
              style={{
                margin: "4px 0 0",
                color: "#647888",
                fontSize: "12px",
              }}
            >
              System notification center is active.
            </p>
          </div>
        </div>

      </div>
    </AdminPage>
  );
}


/* =========================================================
   ADMIN SETTINGS
========================================================= */

export function AdminSettings() {
  const [hospitalName, setHospitalName] =
    useState("CareTrack Hospital");

  const [email, setEmail] =
    useState("admin@caretrack.com");

  const [notifications, setNotifications] =
    useState(true);

  const [saved, setSaved] =
    useState(false);

  const handleSave = () => {
    setSaved(true);

    setTimeout(() => {
      setSaved(false);
    }, 2500);
  };

  return (
    <AdminPage
      title="Settings"
      description="Configure CareTrack administrative preferences."
      icon={Settings}
    >
      <div
        className="panel"
        style={{
          maxWidth: "760px",
        }}
      >

        <div
          style={{
            display: "grid",
            gap: "18px",
          }}
        >

          <label>
            <span
              style={{
                display: "block",
                marginBottom: "7px",
                fontSize: "12px",
                fontWeight: 700,
                color: "#536b7b",
              }}
            >
              Hospital Name
            </span>

            <input
              value={hospitalName}
              onChange={(e) =>
                setHospitalName(e.target.value)
              }
              style={{
                width: "100%",
                padding: "11px",
                border:
                  "1px solid #dce5eb",
                borderRadius: "8px",
              }}
            />
          </label>


          <label>
            <span
              style={{
                display: "block",
                marginBottom: "7px",
                fontSize: "12px",
                fontWeight: 700,
                color: "#536b7b",
              }}
            >
              Administration Email
            </span>

            <input
              type="email"
              value={email}
              onChange={(e) =>
                setEmail(e.target.value)
              }
              style={{
                width: "100%",
                padding: "11px",
                border:
                  "1px solid #dce5eb",
                borderRadius: "8px",
              }}
            />
          </label>


          <label
            style={{
              display: "flex",
              gap: "10px",
              alignItems: "center",
              fontSize: "13px",
              color: "#536b7b",
            }}
          >
            <input
              type="checkbox"
              checked={notifications}
              onChange={(e) =>
                setNotifications(
                  e.target.checked
                )
              }
            />

            Enable administrative notifications
          </label>


          <div>
            <ActionButton
              onClick={handleSave}
            >
              <Settings size={15} />
              Save Settings
            </ActionButton>
          </div>


          {saved && (
            <div
              style={{
                padding: "11px 13px",
                background: "#e9f7f0",
                color: "#21825b",
                borderRadius: "8px",
                fontSize: "12px",
                fontWeight: 700,
              }}
            >
              Settings saved successfully.
            </div>
          )}

        </div>

      </div>
    </AdminPage>
  );
}