
import React, { useEffect, useMemo, useState } from "react";
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
  set,
} from "firebase/database";
import { db } from "../../lib/firebase";

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

interface AdminPageProps {
  title: string;
  description?: string;
  icon: React.ElementType;
  children: React.ReactNode;
}

/* =========================================================
   COMMON ADMIN PAGE
========================================================= */

function AdminPage({
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
            background: "#e8f6f6",
            color: "#087b83",
            display: "grid",
            placeItems: "center",
            flexShrink: 0,
          }}
        >
          <Icon size={21} />
        </div>

        <div>
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
  const [users, setUsers] = useState<SystemUser[]>([]);
  const [loading, setLoading] = useState(true);

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

      const list: SystemUser[] = Object.entries(
        data
      ).map(([uid, value]) => ({
        uid,
        ...(value as Omit<SystemUser, "uid">),
      }));

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
          transform: "translateY(-50%)",
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
          border: "1px solid #dce5ea",
          borderRadius: "9px",
          padding: "0 12px 0 36px",
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
        border: "1px solid #dce5ea",
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

export function AdminPatients() {
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

          <ActionButton onClick={refresh}>
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
              borderCollapse: "collapse",
              fontSize: "12px",
            }}
          >
            <thead>
              <tr
                style={{
                  background: "#f6f9fa",
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
              {patients.map((patient) => (
                <tr key={patient.uid}>
                  <td style={tableCell}>
                    <strong>
                      {patient.fullName ||
                        "Unnamed Patient"}
                    </strong>
                  </td>

                  <td style={tableCell}>
                    {patient.email ||
                      "Not provided"}
                  </td>

                  <td style={tableCell}>
                    {patient.phone ||
                      "Not provided"}
                  </td>

                  <td style={tableCell}>
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

  const isDoctor = role === "doctor";

  return (
    <div
      style={{
        background: "#ffffff",
        border: "1px solid #e2e9ee",
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
              ? "#e8f6f6"
              : "#edf4f8",
            color: isDoctor
              ? "#087b83"
              : "#47718c",
            display: "grid",
            placeItems: "center",
            fontSize: "15px",
            fontWeight: 800,
          }}
        >
          {name.charAt(0).toUpperCase()}
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
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
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
              textTransform: "uppercase",
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
              overflowWrap: "anywhere",
              lineHeight: 1.35,
            }}
          >
            {user.email || "Not provided"}
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
              textTransform: "uppercase",
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
            {user.phone || "Not provided"}
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
                textTransform: "uppercase",
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
                textTransform: "uppercase",
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

export function AdminDoctors() {
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
            color="#087b83"
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
          {doctors.map((doctor) => (
            <StaffCard
              key={doctor.uid}
              user={doctor}
              role="doctor"
            />
          ))}
        </div>
      )}
    </AdminPage>
  );
}

/* =========================================================
   ADMIN NURSES
========================================================= */

export function AdminNurses() {
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
            color="#087b83"
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
          {nurses.map((nurse) => (
            <StaffCard
              key={nurse.uid}
              user={nurse}
              role="nurse"
            />
          ))}
        </div>
      )}
    </AdminPage>
  );
}

/* =========================================================
   ADMIN ADMISSIONS
========================================================= */

export function AdminAdmissions() {
  const [admissions, setAdmissions] =
    useState<Admission[]>([]);
  const [loading, setLoading] =
    useState(true);
  const [search, setSearch] =
    useState("");

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

      const list: Admission[] =
        Object.entries(data).map(
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

  const filtered = useMemo(() => {
    const query =
      search.toLowerCase().trim();

    if (!query) return admissions;

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
  }, [admissions, search]);

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
            onClick={loadAdmissions}
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
          {filtered.length === 0 ? (
            <div
              style={{
                padding: "35px",
                textAlign: "center",
                color: "#8293a0",
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
                    textAlign: "left",
                  }}
                >
                  <th
                    style={tableHeader}
                  >
                    Patient
                  </th>
                  <th
                    style={tableHeader}
                  >
                    Ward
                  </th>
                  <th
                    style={tableHeader}
                  >
                    Room
                  </th>
                  <th
                    style={tableHeader}
                  >
                    Bed
                  </th>
                  <th
                    style={tableHeader}
                  >
                    Status
                  </th>
                </tr>
              </thead>

              <tbody>
                {filtered.map(
                  (item) => (
                    <tr key={item.id}>
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

export function AdminWards() {
  const {
    users,
    loading,
  } = useUsers();

  const patients =
    users.filter(
      (user) =>
        user.role === "patient"
    );

  const wardNames = [
    "General Ward",
    "Medical Ward",
    "Surgical Ward",
    "Private Ward",
  ];

  return (
    <AdminPage
      title="Wards"
      description="Overview of hospital ward organization and patient allocation."
      icon={BedDouble}
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(4, minmax(0, 1fr))",
          gap: "15px",
        }}
      >
        {wardNames.map(
          (ward, index) => (
            <div
              key={ward}
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
                  justifyContent:
                    "space-between",
                  marginBottom:
                    "14px",
                }}
              >
                <div
                  style={{
                    width: "38px",
                    height: "38px",
                    borderRadius:
                      "10px",
                    background:
                      "#e8f6f6",
                    color:
                      "#087b83",
                    display:
                      "grid",
                    placeItems:
                      "center",
                  }}
                >
                  <BedDouble
                    size={19}
                  />
                </div>

                <span
                  style={{
                    fontSize:
                      "10px",
                    color:
                      "#8293a0",
                    fontWeight:
                      700,
                  }}
                >
                  WARD {index + 1}
                </span>
              </div>

              <h3
                style={{
                  margin:
                    "0 0 6px",
                  color:
                    "#17324d",
                  fontSize:
                    "14px",
                }}
              >
                {ward}
              </h3>

              <p
                style={{
                  margin: 0,
                  color:
                    "#8293a0",
                  fontSize:
                    "11px",
                }}
              >
                {loading
                  ? "Loading..."
                  : `${Math.max(
                      0,
                      Math.floor(
                        patients.length /
                          4
                      )
                    )} patients`}
              </p>
            </div>
          )
        )}
      </div>
    </AdminPage>
  );
}

/* =========================================================
   ADMIN APPOINTMENTS
========================================================= */

export function AdminAppointments() {
  const [appointments] =
    useState([
      {
        id: "1",
        patient:
          "Sarah Ahmed",
        doctor:
          "Dr. Ahmed Khan",
        date:
          "05 October 2026",
        time:
          "10:30 AM",
        status:
          "Scheduled",
      },
      {
        id: "2",
        patient:
          "Ali Raza",
        doctor:
          "Dr. Sara Malik",
        date:
          "06 October 2026",
        time:
          "11:00 AM",
        status:
          "Upcoming",
      },
      {
        id: "3",
        patient:
          "Fatima Noor",
        doctor:
          "Dr. Ahmed Khan",
        date:
          "07 October 2026",
        time:
          "02:00 PM",
        status:
          "Scheduled",
      },
    ]);

  return (
    <AdminPage
      title="Appointments"
      description="Monitor scheduled patient appointments."
      icon={CalendarDays}
    >
      <div
        style={{
          display: "grid",
          gap: "12px",
        }}
      >
        {appointments.map(
          (appointment) => (
            <div
              key={appointment.id}
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
                  style={smallLabel}
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
                    appointment.patient
                  }
                </strong>
              </div>

              <div>
                <span
                  style={smallLabel}
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
                    appointment.doctor
                  }
                </span>
              </div>

              <div>
                <span
                  style={smallLabel}
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
                  }
                </span>
              </div>

              <div>
                <span
                  style={smallLabel}
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
                    appointment.time
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
      </div>
    </AdminPage>
  );
}

/* =========================================================
   ADMIN REPORTS
========================================================= */

export function AdminReports() {
  const {
    users,
    loading,
  } = useUsers();

  const patients =
    users.filter(
      (user) =>
        user.role === "patient"
    ).length;

  const doctors =
    users.filter(
      (user) =>
        user.role === "doctor"
    ).length;

  const nurses =
    users.filter(
      (user) =>
        user.role === "nurse"
    ).length;

  const activeUsers =
    users.filter(
      (user) => user.active
    ).length;

  const reports = [
    {
      title:
        "Total Patients",
      value: patients,
      icon: Users,
    },
    {
      title:
        "Registered Doctors",
      value: doctors,
      icon: Stethoscope,
    },
    {
      title:
        "Registered Nurses",
      value: nurses,
      icon: Activity,
    },
    {
      title:
        "Active Accounts",
      value: activeUsers,
      icon: CheckCircle2,
    },
  ];

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
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(4, minmax(0, 1fr))",
            gap: "15px",
          }}
        >
          {reports.map(
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
                      "#e8f6f6",
                    color:
                      "#087b83",
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
      )}
    </AdminPage>
  );
}

/* =========================================================
   ADMIN AUDIT LOGS
========================================================= */

export function AdminAuditLogs() {
  const logs = [
    {
      action:
        "Patient account registered",
      user:
        "System",
      time:
        "Today, 09:42 AM",
    },
    {
      action:
        "Doctor approval status updated",
      user:
        "Admin",
      time:
        "Today, 09:15 AM",
    },
    {
      action:
        "Patient admission recorded",
      user:
        "Nurse",
      time:
        "Yesterday, 04:20 PM",
    },
    {
      action:
        "Appointment scheduled",
      user:
        "Doctor",
      time:
        "Yesterday, 02:10 PM",
    },
  ];

  return (
    <AdminPage
      title="Audit Logs"
      description="Review important system activities."
      icon={History}
    >
      <div
        className="panel"
        style={{
          overflow: "hidden",
        }}
      >
        {logs.map(
          (log, index) => (
            <div
              key={`${log.action}-${index}`}
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
                  {log.action}
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
                  By {log.user}
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
                {log.time}
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
        await push(
          ref(db, "adminNotifications"),
          {
            message: text,
            createdAt:
              Date.now(),
            status:
              "sent",
          }
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
            color="#087b83"
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
              color="#087b83"
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
            ? "#087b83"
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
  borderBottom: "1px solid #e7edf0",
};

const tableCell: React.CSSProperties = {
  padding: "13px 14px",
  color: "#536b7b",
  borderBottom: "1px solid #edf1f4",
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
