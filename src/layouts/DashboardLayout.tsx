import {
  Activity,
  BedDouble,
  Bell,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  FileText,
  HeartPulse,
  LayoutDashboard,
  LogOut,
  Mic,
  Menu,
  MessageCircleQuestion,
  Pill,
  Settings,
  ShieldCheck,
  Stethoscope,
  UserCircle,
  UserRound,
  Users,
  X,
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

const navigationByRole = {
  patient: [
    { label: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
    { label: "My Information", icon: UserRound, path: "/information" },
    { label: "Daily Report", icon: ClipboardList, path: "/daily-report" },
    { label: "My Vitals", icon: HeartPulse, path: "/vitals" },
    { label: "Medications", icon: Pill, path: "/medications" },
    { label: "Doctor Questions", icon: MessageCircleQuestion, path: "/questions" },
    { label: "Voice Responses", icon: Mic, path: "/voice-responses" },
    { label: "Notifications", icon: Bell, path: "/notifications" },
  ],
  nurse: [
    { label: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
    { label: "Patients", icon: Users, path: "/patients" },
    { label: "Patient Reports", icon: ClipboardList, path: "/reports" },
    { label: "Vitals", icon: HeartPulse, path: "/vitals" },
    { label: "Notes", icon: FileText, path: "/notes" },
    { label: "Notifications", icon: Bell, path: "/notifications" },
  ],
  doctor: [
    { label: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
    { label: "Patients", icon: Users, path: "/patients" },
    { label: "Doctor Questions", icon: MessageCircleQuestion, path: "/questions" },
    { label: "Voice Responses", icon: Mic, path: "/voice-responses" },
    { label: "Notes", icon: FileText, path: "/notes" },
    { label: "Reports", icon: ClipboardList, path: "/reports" },
    { label: "Notifications", icon: Bell, path: "/notifications" },
  ],
  admin: [
    { label: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
    { label: "Patients", icon: Users, path: "/patients" },
    { label: "Admissions", icon: ClipboardList, path: "/admissions" },
    { label: "Wards", icon: BedDouble, path: "/wards" },
    { label: "Doctors", icon: Stethoscope, path: "/doctors" },
    { label: "Nurses", icon: Users, path: "/nurses" },
    { label: "Notifications", icon: Bell, path: "/notifications" },
    { label: "Settings", icon: Settings, path: "/settings" },
  ],
};

type Role = keyof typeof navigationByRole;

function isRole(value: string | undefined): value is Role {
  return value === "patient" || value === "nurse" || value === "doctor" || value === "admin";
}

export default function DashboardLayout() {
  const { role: demoRole } = useParams();
  const { profile, logout } = useAuth();
  const navigate = useNavigate();
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [logoutError, setLogoutError] = useState("");
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const topbarRef = useRef<HTMLElement>(null);
  const sidebarRef = useRef<HTMLElement>(null);

  const isDemo = Boolean(demoRole);
  const role: Role = isDemo
    ? isRole(demoRole) ? demoRole : "patient"
    : isRole(profile?.role) ? profile.role : "patient";
  const roleName = role.charAt(0).toUpperCase() + role.slice(1);
  const userName = isDemo
    ? role === "patient" ? "Sarah Ahmed" : `${roleName} Portal`
    : profile?.fullName || "CareTrack User";

  const getRoute = (path: string) => isDemo
    ? path === "/dashboard" ? `/demo/${role}` : `/demo/${role}${path}`
    : `/${role}${path}`;
  const primaryNavigation = navigationByRole[role];
  const sidebarNavigation = navigationByRole[role].filter(
    (item) => item.path !== "/dashboard" && item.path !== "/notifications",
  );

  async function handleLogout() {
    try {
      await logout();
      navigate("/login", { replace: true });
    } catch (error) {
      console.error("Unable to log out:", error);
      setLogoutError("Unable to log out. Please try again.");
    }
  }

  useEffect(() => {
    if (!profileMenuOpen && !sidebarOpen) return;

    const closeOnOutsideClick = (event: MouseEvent) => {
      if (event.target instanceof Node) {
        if (!profileMenuRef.current?.contains(event.target)) {
          setProfileMenuOpen(false);
        }
        if (
          !topbarRef.current?.contains(event.target) &&
          !sidebarRef.current?.contains(event.target)
        ) {
          setSidebarOpen(false);
        }
      }
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setProfileMenuOpen(false);
        setSidebarOpen(false);
      }
    };

    document.addEventListener("mousedown", closeOnOutsideClick);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("mousedown", closeOnOutsideClick);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [profileMenuOpen, sidebarOpen]);

  return (
    <div className={`app-shell${isDemo ? " app-shell-demo" : ""}${sidebarCollapsed ? " is-sidebar-collapsed" : ""}`}>
      {sidebarOpen && (
        <button
          type="button"
          className="dashboard-sidebar-backdrop"
          aria-label="Close navigation"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      <aside
        id="dashboard-sidebar"
        className={`dashboard-sidebar${sidebarOpen ? " is-open" : ""}`}
        aria-label={`${roleName} feature navigation`}
        ref={sidebarRef}
      >
        <div className="dashboard-sidebar-heading">
          <strong>{roleName} workspace</strong>
          <button
            type="button"
            className="dashboard-sidebar-collapse"
            aria-label="Collapse navigation sidebar"
            title="Collapse navigation sidebar"
            onClick={() => setSidebarCollapsed(true)}
          >
            <ChevronLeft size={18} aria-hidden="true" />
          </button>
        </div>
        <nav className="dashboard-sidebar-nav" aria-label={`${roleName} features`}>
          {sidebarNavigation.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={getRoute(item.path)}
                className={({ isActive }) => `dashboard-sidebar-link${isActive ? " is-active" : ""}`}
                onClick={() => setSidebarOpen(false)}
              >
                <Icon size={19} aria-hidden="true" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>
        <div className="dashboard-sidebar-footer">
          <span className="dashboard-sidebar-status-dot" aria-hidden="true" />
          <span>CareTrack is available</span>
        </div>
      </aside>
      <div className="dashboard-area">
        <header className="dashboard-topbar" ref={topbarRef}>
          <button
            type="button"
            className="dashboard-sidebar-expand"
            aria-label="Expand navigation sidebar"
            title="Expand navigation sidebar"
            onClick={() => setSidebarCollapsed(false)}
          >
            <ChevronRight size={19} aria-hidden="true" />
          </button>
          <Link
            to={isDemo ? `/demo/${role}` : `/${role}/dashboard`}
            className="dashboard-brand"
            aria-label="CareTrack home"
          >
            <span className="dashboard-brand-mark"><HeartPulse size={21} /></span>
            <span className="dashboard-brand-copy">
              <strong>CareTrack</strong>
              <small>{isDemo ? "Interactive demo" : "Patient care"}</small>
            </span>
          </Link>

          <button
            type="button"
            className="dashboard-menu-toggle"
            aria-label={sidebarOpen ? "Close navigation sidebar" : "Open navigation sidebar"}
            aria-expanded={sidebarOpen}
            aria-controls="dashboard-sidebar"
            onClick={() => setSidebarOpen((open) => !open)}
          >
            {sidebarOpen ? <X size={21} /> : <Menu size={21} />}
          </button>

          <nav
            id="dashboard-navigation"
            className="dashboard-icon-nav"
            aria-label={`${roleName} navigation`}
          >
            {primaryNavigation.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={getRoute(item.path)}
                  end={item.path === "/dashboard"}
                  className={({ isActive }) => `dashboard-nav-link${isActive ? " is-active" : ""}`}
                  aria-label={item.label}
                  data-tooltip={item.label}
                >
                  <Icon size={20} aria-hidden="true" />
                  <span className="dashboard-nav-label">{item.label}</span>
                </NavLink>
              );
            })}
          </nav>

          <div className="topbar-user">
            {isDemo && <span className="demo-mode-chip">Demo</span>}
            <div className="profile-menu" ref={profileMenuRef}>
              <button
                type="button"
                className="topbar-profile profile-menu-trigger"
                aria-label="Open account menu"
                aria-haspopup="menu"
                aria-expanded={profileMenuOpen}
                onClick={() => {
                  setLogoutError("");
                  setProfileMenuOpen((open) => !open);
                }}
              >
                <UserCircle size={31} aria-hidden="true" />
                <span className="profile-trigger-copy">
                  <strong>{userName}</strong>
                  <small>{roleName}</small>
                </span>
              </button>
              {profileMenuOpen && (
                <div className="profile-dropdown" role="menu">
                  <div className="profile-dropdown-heading">
                    <strong>{userName}</strong>
                    <span>{isDemo ? "Fictional demo account" : profile?.email || "Signed-in account"}</span>
                  </div>
                  <Link to={getRoute("/profile")} role="menuitem" onClick={() => setProfileMenuOpen(false)}>
                    <UserRound size={17} /> My Profile
                  </Link>
                  <Link to={getRoute("/account-settings")} role="menuitem" onClick={() => setProfileMenuOpen(false)}>
                    <Settings size={17} /> Account Settings
                  </Link>
                  {logoutError && <p className="profile-dropdown-error" role="alert">{logoutError}</p>}
                  {isDemo ? (
                    <Link to="/demo" role="menuitem" className="profile-dropdown-logout" onClick={() => setProfileMenuOpen(false)}>
                      <LogOut size={17} /> Exit Demo
                    </Link>
                  ) : (
                    <button type="button" role="menuitem" className="profile-dropdown-logout" onClick={handleLogout}>
                      <LogOut size={17} /> Logout
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </header>

        {isDemo && (
          <div className="dashboard-demo-banner" role="status">
            <div>
              <strong>Demo mode</strong>
              <span>Explore CareTrack using fictional sample information. Changes stay in this browser session.</span>
            </div>
            <Link to="/demo">Exit demo</Link>
          </div>
        )}

        <main className="dashboard-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
