import {
Activity,
Bell,
CalendarDays,
ClipboardList,
FileText,
LayoutDashboard,
LogOut,
Settings,
UserCircle,
Users,
Stethoscope,
BedDouble,
ShieldCheck,
Pill,
MessageCircleQuestion,
HeartPulse,
UserRound,
} from "lucide-react";

import { useEffect, useRef, useState } from "react";
import {
Link,
NavLink,
Outlet,
useNavigate,
useParams,
} from "react-router-dom";

import { useAuth } from "../context/AuthContext";

export default function DashboardLayout() {
const { role: demoRole } = useParams();
const { profile, logout } = useAuth();
const navigate = useNavigate();
const [profileMenuOpen, setProfileMenuOpen] = useState(false);
const [logoutError, setLogoutError] = useState("");
const profileMenuRef = useRef<HTMLDivElement>(null);

const role = demoRole || profile?.role || "patient";
const isDemo = Boolean(demoRole);

const getRoute = (path: string) => {
if (isDemo) {
return `/demo/${role}${path}`;
}


return `/${role}${path}`;


};

// ================= PATIENT =================

const patientNavigation = [
{
label: "Dashboard",
icon: LayoutDashboard,
path: "/dashboard",
},
{
label: "My Information",
icon: UserRound,
path: "/information",
},
{
label: "Daily Report",
icon: ClipboardList,
path: "/daily-report",
},
{
label: "My Vitals",
icon: HeartPulse,
path: "/vitals",
},
{
label: "Medications",
icon: Pill,
path: "/medications",
},
{
label: "Doctor Questions",
icon: MessageCircleQuestion,
path: "/questions",
},
{
label: "Appointments",
icon: CalendarDays,
path: "/appointments",
},
{
label: "My Timeline",
icon: Activity,
path: "/timeline",
},
{
label: "Notifications",
icon: Bell,
path: "/notifications",
},
];

// ================= NURSE =================

const nurseNavigation = [
{
label: "Dashboard",
icon: LayoutDashboard,
path: "/dashboard",
},
{
label: "Patients",
icon: Users,
path: "/patients",
},
{
label: "Patient Reports",
icon: ClipboardList,
path: "/reports",
},
{
label: "Vitals",
icon: HeartPulse,
path: "/vitals",
},
{
label: "Notes",
icon: FileText,
path: "/notes",
},
{
label: "Notifications",
icon: Bell,
path: "/notifications",
},
];

// ================= DOCTOR =================

const doctorNavigation = [
{
label: "Dashboard",
icon: LayoutDashboard,
path: "/dashboard",
},
{
label: "Patients",
icon: Users,
path: "/patients",
},
{
label: "Doctor Questions",
icon: MessageCircleQuestion,
path: "/questions",
},
{
label: "Appointments",
icon: CalendarDays,
path: "/appointments",
},
{
label: "Notes",
icon: FileText,
path: "/notes",
},
{
label: "Reports",
icon: ClipboardList,
path: "/reports",
},
{
label: "Notifications",
icon: Bell,
path: "/notifications",
},
];

// ================= ADMIN =================

const adminNavigation = [
{
label: "Dashboard",
icon: LayoutDashboard,
path: "/dashboard",
},
{
label: "Patients",
icon: Users,
path: "/patients",
},
{
label: "Admissions",
icon: ClipboardList,
path: "/admissions",
},
{
label: "Wards",
icon: BedDouble,
path: "/wards",
},
{
label: "Doctors",
icon: Stethoscope,
path: "/doctors",
},
{
label: "Nurses",
icon: Users,
path: "/nurses",
},
{
label: "Appointments",
icon: CalendarDays,
path: "/appointments",
},
{
label: "Reports",
icon: FileText,
path: "/reports",
},
{
label: "Audit Logs",
icon: ShieldCheck,
path: "/audit-logs",
},
{
label: "Notifications",
icon: Bell,
path: "/notifications",
},
{
label: "Settings",
icon: Settings,
path: "/settings",
},
];

// ================= SELECT NAVIGATION =================

const navigation =
role === "patient"
? patientNavigation
: role === "nurse"
? nurseNavigation
: role === "doctor"
? doctorNavigation
: adminNavigation;

// ================= ROLE NAME =================

const roleName =
role.charAt(0).toUpperCase() + role.slice(1);

// ================= USER NAME =================

const userName = isDemo
? role === "patient"
? "Sarah Ahmed"
: role === "nurse"
? "Nurse Portal"
: role === "doctor"
? "Doctor Portal"
: "Admin Portal"
: profile?.fullName || "CareTrack User";

// ================= LOGOUT =================

const handleLogout = async () => {
try {
  await logout();
  navigate("/login", { replace: true });
} catch (error) {
  console.error("Unable to log out:", error);
  setLogoutError("Unable to log out. Please try again.");
}
};

useEffect(() => {
  if (!profileMenuOpen) return;

  const closeOnOutsideClick = (event: MouseEvent) => {
    if (
      event.target instanceof Node &&
      !profileMenuRef.current?.contains(event.target)
    ) {
      setProfileMenuOpen(false);
    }
  };
  const closeOnEscape = (event: KeyboardEvent) => {
    if (event.key === "Escape") setProfileMenuOpen(false);
  };

  document.addEventListener("mousedown", closeOnOutsideClick);
  document.addEventListener("keydown", closeOnEscape);
  return () => {
    document.removeEventListener("mousedown", closeOnOutsideClick);
    document.removeEventListener("keydown", closeOnEscape);
  };
}, [profileMenuOpen]);

return ( <div className="app-shell">

```
  {/* ================= SIDEBAR ================= */}

  <aside className="sidebar">

    {/* BRAND */}

    <div className="sidebar-brand">
      <Link
        to={
          isDemo
            ? `/demo/${role}`
            : `/${role}/dashboard`
        }
        className="brand"
        style={{ color: "white" }}
      >
        <div className="brand-mark">
          C
        </div>

        <div>
          <b>CareTrack</b>

          <small>
            Patient Care System
          </small>
        </div>
      </Link>
    </div>

    {/* ROLE */}

    <div className="sidebar-role">
      {isDemo
        ? "DEMO MODE"
        : `${roleName.toUpperCase()} PORTAL`}
    </div>

    {/* NAVIGATION */}

    <nav className="side-nav">
      {navigation.map((item) => {
        const Icon = item.icon;

        return (
          <NavLink
            key={item.path}
            to={getRoute(item.path)}
            end={item.path === "/dashboard"}
          >
            <Icon size={18} />

            <span>
              {item.label}
            </span>
          </NavLink>
        );
      })}
    </nav>

    {/* SIDEBAR BOTTOM */}

    <div className="sidebar-bottom">

      {/* SYSTEM STATUS */}

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          padding: "10px 12px",
          color: "#b9cde3",
          fontSize: "12px",
        }}
      >
        <span className="online-dot" />

        <div>
          <strong
            style={{
              display: "block",
              color: "white",
              fontSize: "12px",
            }}
          >
            System Online
          </strong>

          <span
            style={{
              fontSize: "10px",
              color: "#9eb4c2",
            }}
          >
            CareTrack is available
          </span>
        </div>
      </div>

      {/* LOGOUT */}

      {!isDemo && (
        <button
          type="button"
          onClick={handleLogout}
        >
          <LogOut size={17} />

          <span>
            Logout
          </span>
        </button>
      )}
    </div>
  </aside>

  {/* ================= MAIN AREA ================= */}

  <div className="dashboard-area">

    {/* ================= TOP BAR ================= */}

    <header className="dashboard-topbar">

      <div>
        <small>
          CARETRACK
        </small>

        <h2>
          {roleName} Portal
        </h2>
      </div>

      <div className="topbar-user">

        {/* NOTIFICATION */}

        <button
          type="button"
          style={{
            border: "0",
            background: "transparent",
            color: "#6e8291",
            padding: "7px",
            display: "flex",
            alignItems: "center",
            cursor: "pointer",
          }}
          aria-label="Notifications"
        >
          <Bell size={19} />
        </button>

        <span className="online-dot" />

        {/* USER */}

        {isDemo ? (
          <div className="topbar-profile">
            <UserCircle size={31} />
            <div>
              <strong>{userName}</strong>
              <small>{roleName}</small>
            </div>
          </div>
        ) : (
          <div className="profile-menu" ref={profileMenuRef}>
            <button
              type="button"
              className="topbar-profile profile-menu-trigger"
              aria-label="Open profile menu"
              aria-haspopup="menu"
              aria-expanded={profileMenuOpen}
              onClick={() => {
                setLogoutError("");
                setProfileMenuOpen((open) => !open);
              }}
            >
              <UserCircle size={31} />
              <span className="profile-trigger-copy">
                <strong>{userName}</strong>
                <small>{roleName}</small>
              </span>
            </button>

            {profileMenuOpen && (
              <div className="profile-dropdown" role="menu">
                <div className="profile-dropdown-heading">
                  <strong>{userName}</strong>
                  <span>{profile?.email || "Signed-in account"}</span>
                </div>
                <Link
                  to={getRoute("/profile")}
                  role="menuitem"
                  onClick={() => setProfileMenuOpen(false)}
                >
                  <UserRound size={17} />
                  My Profile
                </Link>
                <Link
                  to={getRoute("/account-settings")}
                  role="menuitem"
                  onClick={() => setProfileMenuOpen(false)}
                >
                  <Settings size={17} />
                  Account Settings
                </Link>
                {logoutError && (
                  <p className="profile-dropdown-error" role="alert">
                    {logoutError}
                  </p>
                )}
                <button
                  type="button"
                  role="menuitem"
                  className="profile-dropdown-logout"
                  onClick={handleLogout}
                >
                  <LogOut size={17} />
                  Logout
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </header>

    {/* ================= DEMO BANNER ================= */}

    {isDemo && (
      <div
        style={{
          margin: "18px 30px 0",
          padding: "12px 16px",
          borderRadius: "10px",
          background: "#eaf6f6",
          border: "1px solid #cbd7e8",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "15px",
          color: "#17324d",
        }}
      >
        <div>
          <strong
            style={{
              display: "block",
              fontSize: "13px",
              color: "#0056dd",
            }}
          >
            Demo Mode
          </strong>

          <span
            style={{
              fontSize: "12px",
              color: "#647888",
            }}
          >
            You are exploring CareTrack
            with sample data.
          </span>
        </div>

        <Link
          to="/login"
          style={{
            background: "#0056dd",
            color: "white",
            padding: "8px 14px",
            borderRadius: "8px",
            fontSize: "12px",
            fontWeight: 700,
          }}
        >
          Sign In
        </Link>
      </div>
    )}

    {/* ================= PAGE CONTENT ================= */}

    <section className="dashboard-content">
      <Outlet />
    </section>

  </div>
</div>


);
}
