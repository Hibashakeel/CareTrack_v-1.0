import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Activity,
  BedDouble,
  Bell,
  CalendarDays,
  CheckCircle2,
  FileText,
  History,
  RefreshCw,
  Search,
  Settings,
  ShieldCheck,
  Stethoscope,
  Users,
} from "lucide-react";

import {
  get,
  push,
  ref,
} from "firebase/database";

import { db } from "../../lib/firebase";
import ContextualHelp from "../../components/ContextualHelp";
import AdminUserManagement from "../../components/admin/AdminUserManagement";
import {
  AdminAdmissionManagement,
  AdminWardManagement,
} from "../../components/admin/AdminHospitalOperations";
import { createNotification } from "../../services/notifications";

/* =========================================================
   TYPES
========================================================= */

export interface SystemUser {
  uid: string;
  fullName?: string;
  email?: string;
  phone?: string;
  role?: string;
  active?: boolean;
  approvalStatus?: string;
  createdAt?: number | string;
}

interface Admission {
  id: string;
  patientId?: string;
  patientName?: string;
  ward?: string;
  room?: string;
  bed?: string;
  status?: string;
  admittedAt?: string | number;
}

interface AdminAppointment {
  id: string;
  patientUid?: string;
  doctorUid?: string;
  patient?: string;
  doctor?: string;
  patientName?: string;
  doctorName?: string;
  date?: string;
  time?: string;
  startTime?: string;
  status?: string;
}

interface AdminAuditLog {
  id: string;
  actorUid?: string;
  actorName?: string;
  actorRole?: string;
  action?: string;
  recordType?: string;
  recordId?: string;
  createdAt?: number | string | null;
}

interface AdminPageProps {
  title: string;
  description?: string;
  icon: React.ElementType;
  children: React.ReactNode;
}

/* =========================================================
   COMMON ADMIN PAGE
========================================================= */

export function AdminPage({
  title,
  description,
  icon: Icon,
  children,
}: AdminPageProps) {
  return (
    <div
      style={{
        padding: "22px",
        maxWidth: "1400px",
        margin: "0 auto",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "13px",
          marginBottom: "22px",
        }}
      >
        <div
          style={{
            width: "44px",
            height: "44px",
            borderRadius: "12px",
            background: "#eef6ff",
            color: "#0056dd",
            display: "grid",
            placeItems: "center",
            flexShrink: 0,
          }}
        >
          <Icon size={21} />
        </div>

        <div
          style={{
            minWidth: 0,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "3px",
              flexWrap: "wrap",
            }}
          >
            <h1
              style={{
                margin: 0,
                color: "#17324d",
                fontSize: "23px",
                fontWeight: 800,
              }}
            >
              {title}
            </h1>

            {/* =================================================
                CONTEXTUAL HELP
            ================================================= */}

            {title === "Patients" && (
              <ContextualHelp title="Patients">
                Search and review registered
                patient accounts. Use the search
                box to find a patient by name,
                email, or phone number. The
                Refresh button reloads the latest
                patient information from CareTrack.
              </ContextualHelp>
            )}

            {title === "Doctors" && (
              <ContextualHelp title="Doctors">
                This section shows registered
                doctors and their approval status.
                Use the search box to find a
                doctor by name, email, or phone.
              </ContextualHelp>
            )}

            {title === "Nurses" && (
              <ContextualHelp title="Nurses">
                This section shows registered
                nurses and their approval status.
                Use the search box to find a nurse
                by name, email, or phone.
              </ContextualHelp>
            )}

            {title === "Admissions" && (
              <ContextualHelp title="Admissions">
                Use this section to review patient
                admission records, including ward,
                room, bed, and admission status.
                Search can help you quickly locate
                a specific admission.
              </ContextualHelp>
            )}

            {title === "Reports" && (
              <ContextualHelp title="Reports">
                This section provides a quick
                system-level overview of registered
                patients, doctors, nurses, and
                active accounts.
              </ContextualHelp>
            )}

            {title === "Notifications" && (
              <ContextualHelp title="Notifications">
                Create a clear message for CareTrack
                users and send it as a system-wide
                notification. Avoid entering
                unnecessary private patient
                information in a general
                notification.
              </ContextualHelp>
            )}

            {title === "Settings" && (
              <ContextualHelp title="Admin Settings">
                These settings control administrative
                preferences. System Notifications
                controls whether administrators can
                send system notifications.
                Maintenance Mode indicates that
                system maintenance is active.
              </ContextualHelp>
            )}

            {title === "Wards" && (
              <ContextualHelp title="Wards">
                This section provides an overview of
                the hospital's ward organization and
                patient allocation.
              </ContextualHelp>
            )}

            {title === "Appointments" && (
              <ContextualHelp title="Appointments">
                Review scheduled patient
                appointments, including the patient,
                assigned doctor, date, time, and
                appointment status.
              </ContextualHelp>
            )}

            {title === "Audit Logs" && (
              <ContextualHelp title="Audit Logs">
                Review important system activities
                recorded in CareTrack, including
                account registration, approvals,
                admissions, and appointments.
              </ContextualHelp>
            )}
          </div>

          {description && (
            <p
              style={{
                margin: "4px 0 0",
                color: "#8293a0",
                fontSize: "12px",
              }}
            >
              {description}
            </p>
          )}
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
  const [users, setUsers] =
    useState<SystemUser[]>([]);

  const [loading, setLoading] =
    useState(true);

  const loadUsers = async () => {
    try {
      setLoading(true);

      const snapshot = await get(
        ref(db, "users")
      );

      if (!snapshot.exists()) {
        setUsers([]);
        return;
      }

      const data = snapshot.val();

      const list: SystemUser[] =
        Object.entries(data).map(
          ([uid, value]) => ({
            uid,
            ...(value as Omit<
              SystemUser,
              "uid"
            >),
          })
        );

      setUsers(list);
    } catch (error) {
      console.error(
        "Failed to load users:",
        error
      );

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
  placeholder,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
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
        size={15}
        style={{
          position: "absolute",
          left: "12px",
          top: "50%",
          transform:
            "translateY(-50%)",
          color: "#9aa7b0",
        }}
      />

      <input
        value={value}
        onChange={(e) =>
          onChange(e.target.value)
        }
        placeholder={placeholder}
        style={{
          width: "100%",
          boxSizing: "border-box",
          height: "38px",
          border:
            "1px solid #dce5ea",
          borderRadius: "9px",
          padding:
            "0 12px 0 36px",
          outline: "none",
          color: "#334e60",
          background: "#fff",
          fontSize: "12px",
        }}
      />
    </div>
  );
}

/* =========================================================
   ACTION BUTTON
========================================================= */

function ActionButton({
  children,
  onClick,
  disabled = false,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      style={{
        height: "38px",
        border:
          "1px solid #dce5ea",
        background: "#ffffff",
        color: "#536b7b",
        borderRadius: "9px",
        padding: "0 13px",
        display: "flex",
        alignItems: "center",
        gap: "7px",
        cursor: disabled
          ? "not-allowed"
          : "pointer",
        fontSize: "11px",
        fontWeight: 700,
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
  status?: string;
}) {
  const normalized =
    String(status || "")
      .toLowerCase()
      .replace(/\s+/g, "");

  let background = "#f1f4f6";
  let color = "#607583";

  if (
    normalized === "active" ||
    normalized === "approved" ||
    normalized === "completed" ||
    normalized === "stable"
  ) {
    background = "#e8f6ef";
    color = "#16804b";
  }

  if (
    normalized === "pending" ||
    normalized === "attention" ||
    normalized === "needsattention"
  ) {
    background = "#fff6df";
    color = "#a36a00";
  }

  if (
    normalized === "urgent" ||
    normalized === "rejected" ||
    normalized === "inactive"
  ) {
    background = "#fdecec";
    color = "#c44b4b";
  }

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "4px 8px",
        borderRadius: "20px",
        background,
        color,
        fontSize: "9px",
        fontWeight: 800,
        whiteSpace: "nowrap",
      }}
    >
      {status || "Unknown"}
    </span>
  );
}

/* =========================================================
   ADMIN PATIENTS
========================================================= */

function LegacyAdminPatients() {
  const {
    users,
    loading,
    refresh,
  } = useUsers();

  const [search, setSearch] =
    useState("");

  const patients = useMemo(() => {
    const query =
      search.toLowerCase().trim();

    return users
      .filter(
        (user) =>
          user.role === "patient"
      )
      .filter((user) => {
        if (!query) return true;

        return (
          user.fullName
            ?.toLowerCase()
            .includes(query) ||
          user.email
            ?.toLowerCase()
            .includes(query) ||
          user.phone
            ?.toLowerCase()
            .includes(query)
        );
      });
  }, [users, search]);

  return (
    <AdminPage
      title="Patients"
      description="View and manage registered patients."
      icon={Users}
    >
      <div
        className="panel"
        style={{
          padding: "15px",
          marginBottom: "16px",
        }}
      >
        <div
          style={{
            display: "flex",
            gap: "9px",
          }}
        >
          <SearchBox
            value={search}
            onChange={setSearch}
            placeholder="Search patients..."
          />

          <ActionButton
            onClick={refresh}
          >
            <RefreshCw size={14} />
            Refresh
          </ActionButton>
        </div>
      </div>

      {loading ? (
        <div
          className="panel"
          style={{
            padding: "35px",
            textAlign: "center",
            color: "#8293a0",
          }}
        >
          Loading patients...
        </div>
      ) : patients.length === 0 ? (
        <div
          className="panel"
          style={{
            padding: "35px",
            textAlign: "center",
            color: "#8293a0",
          }}
        >
          No patients found.
        </div>
      ) : (
        <div
          className="panel"
          style={{
            overflowX: "auto",
          }}
        >
          <table
            style={{
              width: "100%",
              borderCollapse:
                "collapse",
              fontSize: "12px",
            }}
          >
            <thead>
              <tr
                style={{
                  background:
                    "#f6f9fa",
                  textAlign: "left",
                }}
              >
                <th style={tableHeader}>
                  Patient
                </th>

                <th style={tableHeader}>
                  Email
                </th>

                <th style={tableHeader}>
                  Phone
                </th>

                <th style={tableHeader}>
                  Account
                </th>
              </tr>
            </thead>

            <tbody>
              {patients.map(
                (patient) => (
                  <tr
                    key={
                      patient.uid
                    }
                  >
                    <td
                      style={
                        tableCell
                      }
                    >
                      <strong>
                        {patient.fullName ||
                          "Unnamed Patient"}
                      </strong>
                    </td>

                    <td
                      style={
                        tableCell
                      }
                    >
                      {patient.email ||
                        "Not provided"}
                    </td>

                    <td
                      style={
                        tableCell
                      }
                    >
                      {patient.phone ||
                        "Not provided"}
                    </td>

                    <td
                      style={
                        tableCell
                      }
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
                )
              )}
            </tbody>
          </table>
        </div>
      )}
    </AdminPage>
  );
}

/* =========================================================
   COMPACT STAFF CARD
========================================================= */

function StaffCard({
  user,
  role,
}: {
  user: SystemUser;
  role: "doctor" | "nurse";
}) {
  const name =
    user.fullName ||
    (role === "doctor"
      ? "Unnamed Doctor"
      : "Unnamed Nurse");

  const isDoctor =
    role === "doctor";

  return (
    <div
      style={{
        background: "#ffffff",
        border:
          "1px solid #e2e9ee",
        borderRadius: "12px",
        padding: "16px",
        minWidth: 0,
        boxShadow:
          "0 2px 8px rgba(20, 50, 70, 0.04)",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          marginBottom: "14px",
        }}
      >
        <div
          style={{
            width: "40px",
            height: "40px",
            minWidth: "40px",
            borderRadius: "50%",
            background: isDoctor
              ? "#eef6ff"
              : "#edf4f8",
            color: isDoctor
              ? "#0056dd"
              : "#47718c",
            display: "grid",
            placeItems: "center",
            fontSize: "15px",
            fontWeight: 800,
          }}
        >
          {name
            .charAt(0)
            .toUpperCase()}
        </div>

        <div
          style={{
            minWidth: 0,
            flex: 1,
          }}
        >
          <h3
            style={{
              margin: 0,
              color: "#17324d",
              fontSize: "14px",
              fontWeight: 800,
              overflow: "hidden",
              textOverflow:
                "ellipsis",
              whiteSpace:
                "nowrap",
            }}
          >
            {name}
          </h3>

          <span
            style={{
              display: "block",
              marginTop: "3px",
              color: "#8293a0",
              fontSize: "10px",
              fontWeight: 600,
            }}
          >
            {isDoctor
              ? "Doctor"
              : "Nurse"}
          </span>
        </div>
      </div>

      <div
        style={{
          borderTop:
            "1px solid #edf1f4",
          paddingTop: "11px",
        }}
      >
        <div
          style={{
            marginBottom: "9px",
          }}
        >
          <span
            style={{
              display: "block",
              color: "#9aa7b0",
              fontSize: "9px",
              fontWeight: 800,
              textTransform:
                "uppercase",
              marginBottom: "3px",
            }}
          >
            Email
          </span>

          <span
            style={{
              display: "block",
              color: "#536b7b",
              fontSize: "11px",
              fontWeight: 600,
              overflowWrap:
                "anywhere",
              lineHeight: 1.35,
            }}
          >
            {user.email ||
              "Not provided"}
          </span>
        </div>

        <div
          style={{
            marginBottom: "12px",
          }}
        >
          <span
            style={{
              display: "block",
              color: "#9aa7b0",
              fontSize: "9px",
              fontWeight: 800,
              textTransform:
                "uppercase",
              marginBottom: "3px",
            }}
          >
            Phone
          </span>

          <span
            style={{
              display: "block",
              color: "#536b7b",
              fontSize: "11px",
              fontWeight: 600,
            }}
          >
            {user.phone ||
              "Not provided"}
          </span>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "1fr 1fr",
            gap: "8px",
            borderTop:
              "1px solid #edf1f4",
            paddingTop: "10px",
          }}
        >
          <div>
            <span
              style={{
                display: "block",
                color: "#9aa7b0",
                fontSize: "9px",
                fontWeight: 800,
                textTransform:
                  "uppercase",
                marginBottom: "4px",
              }}
            >
              Approval
            </span>

            <StatusBadge
              status={
                user.approvalStatus ||
                "pending"
              }
            />
          </div>

          <div>
            <span
              style={{
                display: "block",
                color: "#9aa7b0",
                fontSize: "9px",
                fontWeight: 800,
                textTransform:
                  "uppercase",
                marginBottom: "4px",
              }}
            >
              Account
            </span>

            <StatusBadge
              status={
                user.active
                  ? "Active"
                  : "Inactive"
              }
            />
          </div>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   ADMIN DOCTORS
========================================================= */

function LegacyAdminDoctors() {
  const {
    users,
    loading,
    refresh,
  } = useUsers();

  const [search, setSearch] =
    useState("");

  const doctors = useMemo(() => {
    const query =
      search.toLowerCase().trim();

    return users
      .filter(
        (user) =>
          user.role === "doctor"
      )
      .filter((user) => {
        if (!query) return true;

        return (
          user.fullName
            ?.toLowerCase()
            .includes(query) ||
          user.email
            ?.toLowerCase()
            .includes(query) ||
          user.phone
            ?.toLowerCase()
            .includes(query)
        );
      });
  }, [users, search]);

  return (
    <AdminPage
      title="Doctors"
      description="Manage registered doctors and their approval status."
      icon={Stethoscope}
    >
      <div
        className="panel"
        style={{
          padding: "15px",
          marginBottom: "16px",
        }}
      >
        <div
          style={{
            display: "flex",
            gap: "9px",
            flexWrap: "wrap",
          }}
        >
          <SearchBox
            value={search}
            onChange={setSearch}
            placeholder="Search doctors..."
          />

          <ActionButton
            onClick={refresh}
          >
            <RefreshCw size={14} />
            Refresh
          </ActionButton>
        </div>
      </div>

      {loading ? (
        <div
          className="panel"
          style={{
            padding: "35px",
            textAlign: "center",
            color: "#8293a0",
          }}
        >
          Loading doctors...
        </div>
      ) : doctors.length === 0 ? (
        <div
          className="panel"
          style={{
            padding: "35px",
            textAlign: "center",
            color: "#8293a0",
          }}
        >
          <Stethoscope
            size={32}
            color="#0056dd"
          />

          <h3
            style={{
              color: "#536b7b",
              marginBottom: "5px",
            }}
          >
            No doctors found
          </h3>

          <p
            style={{
              margin: 0,
              fontSize: "12px",
            }}
          >
            No registered doctors
            match your search.
          </p>
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(3, minmax(0, 1fr))",
            gap: "14px",
            alignItems: "start",
          }}
        >
          {doctors.map(
            (doctor) => (
              <StaffCard
                key={doctor.uid}
                user={doctor}
                role="doctor"
              />
            )
          )}
        </div>
      )}
    </AdminPage>
  );
}

/* =========================================================
   ADMIN NURSES
========================================================= */

function LegacyAdminNurses() {
  const {
    users,
    loading,
    refresh,
  } = useUsers();

  const [search, setSearch] =
    useState("");

  const nurses = useMemo(() => {
    const query =
      search.toLowerCase().trim();

    return users
      .filter(
        (user) =>
          user.role === "nurse"
      )
      .filter((user) => {
        if (!query) return true;

        return (
          user.fullName
            ?.toLowerCase()
            .includes(query) ||
          user.email
            ?.toLowerCase()
            .includes(query) ||
          user.phone
            ?.toLowerCase()
            .includes(query)
        );
      });
  }, [users, search]);

  return (
    <AdminPage
      title="Nurses"
      description="Manage registered nurses and their approval status."
      icon={Users}
    >
      <div
        className="panel"
        style={{
          padding: "15px",
          marginBottom: "16px",
        }}
      >
        <div
          style={{
            display: "flex",
            gap: "9px",
            flexWrap: "wrap",
          }}
        >
          <SearchBox
            value={search}
            onChange={setSearch}
            placeholder="Search nurses..."
          />

          <ActionButton
            onClick={refresh}
          >
            <RefreshCw size={14} />
            Refresh
          </ActionButton>
        </div>
      </div>

      {loading ? (
        <div
          className="panel"
          style={{
            padding: "35px",
            textAlign: "center",
            color: "#8293a0",
          }}
        >
          Loading nurses...
        </div>
      ) : nurses.length === 0 ? (
        <div
          className="panel"
          style={{
            padding: "35px",
            textAlign: "center",
            color: "#8293a0",
          }}
        >
          <Users
            size={32}
            color="#0056dd"
          />

          <h3
            style={{
              color: "#536b7b",
              marginBottom: "5px",
            }}
          >
            No nurses found
          </h3>

          <p
            style={{
              margin: 0,
              fontSize: "12px",
            }}
          >
            No registered nurses
            match your search.
          </p>
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(3, minmax(0, 1fr))",
            gap: "14px",
            alignItems: "start",
          }}
        >
          {nurses.map(
            (nurse) => (
              <StaffCard
                key={nurse.uid}
                user={nurse}
                role="nurse"
              />
            )
          )}
        </div>
      )}
    </AdminPage>
  );
}

/* =========================================================
   ADMIN ADMISSIONS
========================================================= */

function LegacyAdminAdmissions() {
  const [
    admissions,
    setAdmissions,
  ] = useState<Admission[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [search, setSearch] =
    useState("");

  const loadAdmissions =
    async () => {
      try {
        setLoading(true);

        const snapshot =
          await get(
            ref(db, "admissions")
          );

        if (!snapshot.exists()) {
          setAdmissions([]);
          return;
        }

        const data =
          snapshot.val();

        const list: Admission[] =
          Object.entries(
            data
          ).map(
            ([id, value]) => ({
              id,
              ...(value as Omit<
                Admission,
                "id"
              >),
            })
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

  const filtered =
    useMemo(() => {
      const query =
        search
          .toLowerCase()
          .trim();

      if (!query)
        return admissions;

      return admissions.filter(
        (item) =>
          item.patientName
            ?.toLowerCase()
            .includes(query) ||
          item.ward
            ?.toLowerCase()
            .includes(query) ||
          item.room
            ?.toLowerCase()
            .includes(query) ||
          item.bed
            ?.toLowerCase()
            .includes(query)
      );
    }, [
      admissions,
      search,
    ]);

  return (
    <AdminPage
      title="Admissions"
      description="Monitor current and previous patient admissions."
      icon={BedDouble}
    >
      <div
        className="panel"
        style={{
          padding: "15px",
          marginBottom: "16px",
        }}
      >
        <div
          style={{
            display: "flex",
            gap: "9px",
          }}
        >
          <SearchBox
            value={search}
            onChange={setSearch}
            placeholder="Search admissions..."
          />

          <ActionButton
            onClick={
              loadAdmissions
            }
          >
            <RefreshCw size={14} />
            Refresh
          </ActionButton>
        </div>
      </div>

      {loading ? (
        <div
          className="panel"
          style={{
            padding: "35px",
            textAlign: "center",
          }}
        >
          Loading admissions...
        </div>
      ) : (
        <div
          className="panel"
          style={{
            overflowX: "auto",
          }}
        >
          {filtered.length ===
          0 ? (
            <div
              style={{
                padding: "35px",
                textAlign:
                  "center",
                color:
                  "#8293a0",
              }}
            >
              No admissions found.
            </div>
          ) : (
            <table
              style={{
                width: "100%",
                borderCollapse:
                  "collapse",
                fontSize: "12px",
              }}
            >
              <thead>
                <tr
                  style={{
                    background:
                      "#f6f9fa",
                    textAlign:
                      "left",
                  }}
                >
                  <th
                    style={
                      tableHeader
                    }
                  >
                    Patient
                  </th>

                  <th
                    style={
                      tableHeader
                    }
                  >
                    Ward
                  </th>

                  <th
                    style={
                      tableHeader
                    }
                  >
                    Room
                  </th>

                  <th
                    style={
                      tableHeader
                    }
                  >
                    Bed
                  </th>

                  <th
                    style={
                      tableHeader
                    }
                  >
                    Status
                  </th>
                </tr>
              </thead>

              <tbody>
                {filtered.map(
                  (item) => (
                    <tr
                      key={
                        item.id
                      }
                    >
                      <td
                        style={
                          tableCell
                        }
                      >
                        {item.patientName ||
                          item.patientId ||
                          "Unknown"}
                      </td>

                      <td
                        style={
                          tableCell
                        }
                      >
                        {item.ward ||
                          "—"}
                      </td>

                      <td
                        style={
                          tableCell
                        }
                      >
                        {item.room ||
                          "—"}
                      </td>

                      <td
                        style={
                          tableCell
                        }
                      >
                        {item.bed ||
                          "—"}
                      </td>

                      <td
                        style={
                          tableCell
                        }
                      >
                        <StatusBadge
                          status={
                            item.status ||
                            "Active"
                          }
                        />
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          )}
        </div>
      )}
    </AdminPage>
  );
}

/* =========================================================
   ADMIN WARDS
========================================================= */

function LegacyAdminWards() {
  return <AdminWardManagement />;
}

/* =========================================================
   ADMIN APPOINTMENTS
========================================================= */

export function AdminAppointments() {
  const [appointments, setAppointments] = useState<AdminAppointment[]>([]);
  const [users, setUsers] = useState<Record<string, SystemUser>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadAppointments() {
      try {
        const [appointmentsSnapshot, usersSnapshot] = await Promise.all([
          get(ref(db, "appointments")),
          get(ref(db, "users")),
        ]);
        const records = appointmentsSnapshot.val() as
          | Record<string, Omit<AdminAppointment, "id">>
          | null;
        const userRecords = usersSnapshot.val() as
          | Record<string, Omit<SystemUser, "uid">>
          | null;
        setAppointments(
          Object.entries(records ?? {}).map(([id, value]) => ({
            id,
            ...value,
          }))
        );
        setUsers(
          Object.fromEntries(
            Object.entries(userRecords ?? {}).map(([uid, value]) => [
              uid,
              { uid, ...value },
            ])
          )
        );
      } catch (loadError) {
        console.error("Could not load admin appointments:", loadError);
        setError(
          loadError instanceof Error
            ? loadError.message
            : "Could not load appointments from Firebase."
        );
      } finally {
        setLoading(false);
      }
    }

    void loadAppointments();
  }, []);

  return (
    <AdminPage
      title="Appointments"
      description="Monitor scheduled patient appointments."
      icon={CalendarDays}
    >
      {error && <p role="alert" style={{ color: "#b42318" }}>{error}</p>}
      {loading ? (
        <div className="panel" style={{ padding: 20 }}>Loading appointments...</div>
      ) : appointments.length === 0 ? (
        <div className="panel" style={{ padding: 20 }}>
          No appointment records are available in Firebase.
        </div>
      ) : <div
        style={{
          display: "grid",
          gap: "12px",
        }}
      >
        {appointments.map(
          (appointment) => (
            <div
              key={
                appointment.id
              }
              className="panel"
              style={{
                padding: "16px",
                display: "grid",
                gridTemplateColumns:
                  "1.4fr 1fr 1fr 1fr auto",
                gap: "15px",
                alignItems:
                  "center",
              }}
            >
              <div>
                <span
                  style={
                    smallLabel
                  }
                >
                  PATIENT
                </span>

                <strong
                  style={{
                    color:
                      "#17324d",
                    fontSize:
                      "13px",
                  }}
                >
                  {
                    appointment.patientName ||
                    appointment.patient ||
                    users[appointment.patientUid ?? ""]?.fullName ||
                    appointment.patientUid ||
                    "Unknown patient"
                  }
                </strong>
              </div>

              <div>
                <span
                  style={
                    smallLabel
                  }
                >
                  DOCTOR
                </span>

                <span
                  style={{
                    color:
                      "#536b7b",
                    fontSize:
                      "11px",
                  }}
                >
                  {
                    appointment.doctorName ||
                    appointment.doctor ||
                    users[appointment.doctorUid ?? ""]?.fullName ||
                    appointment.doctorUid ||
                    "Unassigned"
                  }
                </span>
              </div>

              <div>
                <span
                  style={
                    smallLabel
                  }
                >
                  DATE
                </span>

                <span
                  style={{
                    color:
                      "#536b7b",
                    fontSize:
                      "11px",
                  }}
                >
                  {
                    appointment.date
                      ? formatAdminDate(appointment.date)
                      : "Date unavailable"
                  }
                </span>
              </div>

              <div>
                <span
                  style={
                    smallLabel
                  }
                >
                  TIME
                </span>

                <span
                  style={{
                    color:
                      "#536b7b",
                    fontSize:
                      "11px",
                  }}
                >
                  {
                    appointment.time ||
                    appointment.startTime ||
                    "Time unavailable"
                  }
                </span>
              </div>

              <StatusBadge
                status={
                  appointment.status
                }
              />
            </div>
          )
        )}
      </div>}
    </AdminPage>
  );
}

/* =========================================================
   ADMIN REPORTS
========================================================= */

export function AdminReports() {
  const [stats, setStats] = useState<
    Array<{ title: string; value: number; icon: React.ElementType }>
  >([]);
  const [activity, setActivity] = useState<AdminAuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadReportData() {
      try {
        const [
          usersSnapshot,
          wardsSnapshot,
          admissionsSnapshot,
          occupancySnapshot,
          appointmentsSnapshot,
          reportsSnapshot,
          auditSnapshot,
        ] = await Promise.all([
          get(ref(db, "users")),
          get(ref(db, "wards")),
          get(ref(db, "admissions")),
          get(ref(db, "bedOccupancy")),
          get(ref(db, "appointments")),
          get(ref(db, "patientDailyReports")),
          get(ref(db, "auditLogs")),
        ]);
        const users = Object.values(
          (usersSnapshot.val() ?? {}) as Record<string, SystemUser>
        );
        const wards = Object.values(
          (wardsSnapshot.val() ?? {}) as Record<
            string,
            { roomCount?: number; bedsPerRoom?: number }
          >
        );
        const admissions = Object.values(
          (admissionsSnapshot.val() ?? {}) as Record<string, Admission>
        );
        const occupancy = (occupancySnapshot.val() ?? {}) as Record<
          string,
          Record<string, Record<string, unknown>>
        >;
        const appointmentRecords = appointmentsSnapshot.val() as
          | Record<string, unknown>
          | null;
        const patientReports = reportsSnapshot.val() as
          | Record<string, Record<string, unknown>>
          | null;
        const auditRecords = auditSnapshot.val() as
          | Record<string, Omit<AdminAuditLog, "id">>
          | null;
        const occupiedBeds = Object.values(occupancy).reduce(
          (total, rooms) =>
            total +
            Object.values(rooms ?? {}).reduce(
              (roomTotal, beds) =>
                roomTotal +
                Object.values(beds ?? {}).filter((bed) => bed != null).length,
              0
            ),
          0
        );
        const bedCapacity = wards.reduce(
          (total, ward) =>
            total +
            (Number(ward.roomCount) || 0) *
              (Number(ward.bedsPerRoom) || 0),
          0
        );
        const reportCount = Object.values(patientReports ?? {}).reduce(
          (total, records) =>
            total +
            Object.values(records ?? {}).filter(
              (record) => record != null
            ).length,
          0
        );
        const activeAdmissions = admissions.filter(
          (admission) => admission.status === "active"
        ).length;
        setStats([
          {
            title: "Total Patients",
            value: users.filter((user) => user.role === "patient").length,
            icon: Users,
          },
          {
            title: "Registered Doctors",
            value: users.filter((user) => user.role === "doctor").length,
            icon: Stethoscope,
          },
          {
            title: "Registered Nurses",
            value: users.filter((user) => user.role === "nurse").length,
            icon: Activity,
          },
          {
            title: "Active Accounts",
            value: users.filter((user) => user.active === true).length,
            icon: CheckCircle2,
          },
          { title: "Active Admissions", value: activeAdmissions, icon: BedDouble },
          { title: "Wards", value: wards.length, icon: BedDouble },
          { title: "Total Bed Capacity", value: bedCapacity, icon: BedDouble },
          { title: "Occupied Beds", value: occupiedBeds, icon: BedDouble },
          {
            title: "Patient Reports",
            value: reportCount,
            icon: FileText,
          },
          {
            title: "Appointments",
            value: Object.keys(appointmentRecords ?? {}).length,
            icon: CalendarDays,
          },
          {
            title: "Recorded Audit Events",
            value: Object.keys(auditRecords ?? {}).length,
            icon: History,
          },
        ]);
        setActivity(
          Object.entries(auditRecords ?? {})
            .map(([id, log]) => ({ id, ...log }))
            .sort(
              (a, b) =>
                getAdminTime(b.createdAt) - getAdminTime(a.createdAt)
            )
            .slice(0, 5)
        );
      } catch (loadError) {
        console.error("Could not load admin report data:", loadError);
        setError(
          loadError instanceof Error
            ? loadError.message
            : "Could not load real hospital statistics."
        );
      } finally {
        setLoading(false);
      }
    }

    void loadReportData();
  }, []);

  return (
    <AdminPage
      title="Reports"
      description="System-level overview of CareTrack activity."
      icon={FileText}
    >
      {loading ? (
        <div
          className="panel"
          style={{
            padding: "35px",
            textAlign: "center",
          }}
        >
          Loading report...
        </div>
      ) : error ? (
        <div role="alert" className="panel" style={{ padding: 20, color: "#b42318" }}>
          {error}
        </div>
      ) : (
        <>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))",
            gap: "15px",
          }}
        >
          {stats.map(
            ({
              title,
              value,
              icon: Icon,
            }) => (
              <div
                key={title}
                className="panel"
                style={{
                  padding: "18px",
                }}
              >
                <div
                  style={{
                    width: "38px",
                    height: "38px",
                    borderRadius:
                      "10px",
                    background:
                      "#eef6ff",
                    color:
                      "#0056dd",
                    display:
                      "grid",
                    placeItems:
                      "center",
                    marginBottom:
                      "13px",
                  }}
                >
                  <Icon size={19} />
                </div>

                <div
                  style={{
                    color:
                      "#8293a0",
                    fontSize:
                      "10px",
                    fontWeight:
                      700,
                  }}
                >
                  {title}
                </div>

                <div
                  style={{
                    color:
                      "#17324d",
                    fontSize:
                      "25px",
                    fontWeight:
                      800,
                    marginTop:
                      "4px",
                  }}
                >
                  {value}
                </div>
              </div>
            )
          )}
        </div>
        <section className="panel" style={{ marginTop: 16, overflow: "hidden" }}>
          <h2 style={{ margin: 0, padding: "16px 18px", color: "#17324d", fontSize: 15 }}>
            Recent hospital activity
          </h2>
          {activity.length === 0 ? (
            <p style={{ padding: "0 18px 16px", color: "#8293a0", fontSize: 12 }}>
              No audit events have been recorded yet.
            </p>
          ) : activity.map((log, index) => (
            <div key={log.id} style={{ display: "flex", gap: 12, padding: "12px 18px", borderTop: "1px solid #edf1f4" }}>
              <History size={16} color="#47718c" />
              <div style={{ flex: 1 }}>
                <strong style={{ color: "#314e60", fontSize: 12 }}>{log.action || "Recorded action"}</strong>
                <div style={{ color: "#8293a0", fontSize: 10, marginTop: 3 }}>
                  {log.actorName || log.actorUid || "Unknown user"} · {log.actorRole || "role unavailable"} · {log.recordType || "record"} {log.recordId || ""}
                </div>
              </div>
              <span style={{ color: "#8293a0", fontSize: 10 }}>{formatAdminDate(log.createdAt)}</span>
            </div>
          ))}
        </section>
        </>
      )}
    </AdminPage>
  );
}

/* =========================================================
   ADMIN AUDIT LOGS
========================================================= */

export function AdminAuditLogs() {
  const [logs, setLogs] = useState<AdminAuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    get(ref(db, "auditLogs"))
      .then((snapshot) => {
        const records = snapshot.val() as
          | Record<string, Omit<AdminAuditLog, "id">>
          | null;
        setLogs(
          Object.entries(records ?? {})
            .map(([id, log]) => ({ id, ...log }))
            .sort(
              (a, b) =>
                getAdminTime(b.createdAt) - getAdminTime(a.createdAt)
            )
        );
      })
      .catch((loadError: unknown) => {
        console.error("Could not load audit logs:", loadError);
        setError(
          loadError instanceof Error
            ? loadError.message
            : "Could not load audit logs from Firebase."
        );
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <AdminPage
      title="Audit Logs"
      description="Review important system activities."
      icon={History}
    >
      {error && <p role="alert" style={{ color: "#b42318" }}>{error}</p>}
      <div
        className="panel"
        style={{
          overflow: "hidden",
        }}
      >
        {loading ? (
          <p style={{ padding: 17, color: "#8293a0" }}>Loading audit events...</p>
        ) : logs.length === 0 ? (
          <p style={{ padding: 17, color: "#8293a0" }}>
            No audit events have been recorded yet.
          </p>
        ) : logs.map(
          (log, index) => (
            <div
              key={log.id}
              style={{
                display: "flex",
                alignItems:
                  "center",
                gap: "13px",
                padding:
                  "15px 17px",
                borderBottom:
                  index <
                  logs.length - 1
                    ? "1px solid #edf1f4"
                    : "none",
              }}
            >
              <div
                style={{
                  width: "34px",
                  height: "34px",
                  borderRadius:
                    "9px",
                  background:
                    "#edf4f8",
                  color:
                    "#47718c",
                  display:
                    "grid",
                  placeItems:
                    "center",
                  flexShrink: 0,
                }}
              >
                <History
                  size={16}
                />
              </div>

              <div
                style={{
                  flex: 1,
                }}
              >
                <div
                  style={{
                    color:
                      "#314e60",
                    fontSize:
                      "12px",
                    fontWeight:
                      700,
                  }}
                >
                  {log.action || "Recorded action"}
                </div>

                <div
                  style={{
                    color:
                      "#9aa7b0",
                    fontSize:
                      "10px",
                    marginTop:
                      "3px",
                  }}
                >
                  By {log.actorName || log.actorUid || "Unknown user"}
                  {log.actorRole ? ` · ${log.actorRole}` : ""}
                  {log.recordType || log.recordId
                    ? ` · ${log.recordType || "record"} ${log.recordId || ""}`
                    : ""}
                </div>
              </div>

              <span
                style={{
                  color:
                    "#8293a0",
                  fontSize:
                    "10px",
                  whiteSpace:
                    "nowrap",
                }}
              >
                {formatAdminDate(log.createdAt)}
              </span>
            </div>
          )
        )}
      </div>
    </AdminPage>
  );
}

/* =========================================================
   ADMIN NOTIFICATIONS
========================================================= */

export function AdminNotifications() {
  const [message, setMessage] =
    useState("");

  const [sent, setSent] =
    useState(false);

  const sendNotification =
    async () => {
      const text =
        message.trim();

      if (!text) return;

      try {
        const usersSnapshot = await get(ref(db, "users"));
        const users = (usersSnapshot.val() ?? {}) as Record<string, { active?: boolean; uid?: string }>;

        const recipientUids = Object.keys(users).filter((uid) => {
          const userRecord = users[uid];
          return userRecord && typeof userRecord === "object" && userRecord.active !== false;
        });

        if (recipientUids.length === 0) {
          throw new Error("No active users are available for a system notification.");
        }

        await Promise.all(
          recipientUids.map((uid) =>
            createNotification(
              uid,
              "System update",
              text,
              "system",
              "admin-system-notification",
              {
                sentBy: "admin",
              }
            )
          )
        );

        setMessage("");
        setSent(true);

        window.setTimeout(
          () => setSent(false),
          2500
        );
      } catch (error) {
        console.error(
          "Failed to send notification:",
          error
        );
      }
    };

  return (
    <AdminPage
      title="Notifications"
      description="Send system-wide notifications to CareTrack users."
      icon={Bell}
    >
      <div
        className="panel"
        style={{
          padding: "20px",
          maxWidth: "720px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems:
              "center",
            gap: "10px",
            marginBottom:
              "16px",
          }}
        >
          <Bell
            size={19}
            color="#0056dd"
          />

          <h3
            style={{
              margin: 0,
              color:
                "#17324d",
              fontSize:
                "15px",
            }}
          >
            Create Notification
          </h3>

          <ContextualHelp title="Sending Notifications">
            Write a clear message for
            CareTrack users and select
            Send Notification when it is
            ready. Avoid entering
            unnecessary private patient
            information in a system-wide
            notification.
          </ContextualHelp>
        </div>

        <textarea
          value={message}
          onChange={(e) =>
            setMessage(
              e.target.value
            )
          }
          placeholder="Write notification message..."
          rows={5}
          style={{
            width: "100%",
            boxSizing:
              "border-box",
            resize: "vertical",
            border:
              "1px solid #dce5ea",
            borderRadius: "9px",
            padding: "12px",
            outline: "none",
            fontSize: "12px",
            color:
              "#334e60",
          }}
        />

        <div
          style={{
            marginTop: "12px",
            display: "flex",
            alignItems:
              "center",
            gap: "12px",
          }}
        >
          <ActionButton
            onClick={
              sendNotification
            }
          >
            <Bell size={14} />
            Send Notification
          </ActionButton>

          {sent && (
            <span
              style={{
                color:
                  "#16804b",
                fontSize:
                  "11px",
                fontWeight:
                  700,
              }}
            >
              Notification sent successfully.
            </span>
          )}
        </div>
      </div>
    </AdminPage>
  );
}

/* =========================================================
   ADMIN SETTINGS
========================================================= */

export function AdminSettings() {
  const [
    notificationsEnabled,
    setNotificationsEnabled,
  ] = useState(true);

  const [
    maintenanceMode,
    setMaintenanceMode,
  ] = useState(false);

  return (
    <AdminPage
      title="Settings"
      description="Manage CareTrack administrative preferences."
      icon={Settings}
    >
      <div
        style={{
          display: "grid",
          gap: "14px",
          maxWidth: "800px",
        }}
      >
        <SettingCard
          title="System Notifications"
          description="Allow administrators to send system notifications."
          enabled={
            notificationsEnabled
          }
          onChange={
            setNotificationsEnabled
          }
        />

        <SettingCard
          title="Maintenance Mode"
          description="Show maintenance status when system maintenance is active."
          enabled={maintenanceMode}
          onChange={
            setMaintenanceMode
          }
        />

        <div
          className="panel"
          style={{
            padding: "18px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems:
                "center",
              gap: "11px",
            }}
          >
            <ShieldCheck
              size={20}
              color="#0056dd"
            />

            <div>
              <h3
                style={{
                  margin: 0,
                  color:
                    "#17324d",
                  fontSize:
                    "14px",
                }}
              >
                CareTrack Security
              </h3>

              <p
                style={{
                  margin:
                    "4px 0 0",
                  color:
                    "#8293a0",
                  fontSize:
                    "11px",
                }}
              >
                Administrative access and user approval are controlled through the admin area.
              </p>
            </div>
          </div>
        </div>
      </div>
    </AdminPage>
  );
}

/* =========================================================
   SETTINGS CARD
========================================================= */

function SettingCard({
  title,
  description,
  enabled,
  onChange,
}: {
  title: string;
  description: string;
  enabled: boolean;
  onChange: (
    value: boolean
  ) => void;
}) {
  return (
    <div
      className="panel"
      style={{
        padding: "18px",
        display: "flex",
        alignItems: "center",
        justifyContent:
          "space-between",
        gap: "20px",
      }}
    >
      <div>
        <h3
          style={{
            margin: 0,
            color:
              "#17324d",
            fontSize:
              "14px",
          }}
        >
          {title}
        </h3>

        <p
          style={{
            margin:
              "5px 0 0",
            color:
              "#8293a0",
            fontSize:
              "11px",
          }}
        >
          {description}
        </p>
      </div>

      <button
        type="button"
        onClick={() =>
          onChange(!enabled)
        }
        style={{
          width: "48px",
          height: "26px",
          border: "none",
          borderRadius:
            "20px",
          background: enabled
            ? "#0056dd"
            : "#c9d3d9",
          padding: "3px",
          cursor:
            "pointer",
          flexShrink: 0,
        }}
      >
        <span
          style={{
            display:
              "block",
            width: "20px",
            height: "20px",
            borderRadius:
              "50%",
            background:
              "#ffffff",
            transform:
              enabled
                ? "translateX(22px)"
                : "translateX(0)",
            transition:
              "transform 0.2s ease",
          }}
        />
      </button>
    </div>
  );
}

/* =========================================================
   TABLE STYLES
========================================================= */

const tableHeader: React.CSSProperties = {
  padding: "12px 14px",
  color: "#718491",
  fontSize: "10px",
  fontWeight: 800,
  textTransform: "uppercase",
  borderBottom:
    "1px solid #e7edf0",
};

const tableCell: React.CSSProperties = {
  padding: "13px 14px",
  color: "#536b7b",
  borderBottom:
    "1px solid #edf1f4",
  verticalAlign: "middle",
};

const smallLabel: React.CSSProperties = {
  display: "block",
  color: "#9aa7b0",
  fontSize: "8px",
  fontWeight: 800,
  letterSpacing: "0.5px",
  marginBottom: "4px",
};

/* =========================================================
   DEFAULT EXPORT
========================================================= */

export default AdminPage;

export function AdminPatients() {
  return <AdminUserManagement role="patient" />;
}

export function AdminDoctors() {
  return <AdminUserManagement role="doctor" />;
}

export function AdminNurses() {
  return <AdminUserManagement role="nurse" />;
}

export function AdminAdmissions() {
  return <AdminAdmissionManagement />;
}

export function AdminWards() {
  return <AdminWardManagement />;
}

function getAdminTime(value?: number | string | null) {
  if (value === undefined || value === null || value === "") return 0;
  const timestamp =
    typeof value === "number" ? value : new Date(value).getTime();
  return Number.isNaN(timestamp) ? 0 : timestamp;
}

function formatAdminDate(value?: number | string | null) {
  if (value === undefined || value === null || value === "") {
    return "Date unavailable";
  }
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? String(value)
    : date.toLocaleString();
}