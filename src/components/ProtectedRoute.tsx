import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

interface ProtectedRouteProps {
  allowedRoles?: string[];
}

export default function ProtectedRoute({
  allowedRoles,
}: ProtectedRouteProps) {
  const { user, profile, loading } = useAuth();

  // Firebase auth abhi check kar raha hai
  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "Arial, sans-serif",
          fontSize: "18px",
        }}
      >
        Loading CareTrack...
      </div>
    );
  }

  // User login nahi hai
  if (!user) {
    return (
      <Navigate
        to="/login"
        replace
      />
    );
  }

  // Firebase user hai lekin profile load nahi hui
  if (!profile) {
    return (
      <Navigate
        to="/login"
        replace
      />
    );
  }

  // Role check
  if (
    allowedRoles &&
    allowedRoles.length > 0 &&
    !allowedRoles.includes(profile.role)
  ) {
    // User ko uske actual role ke dashboard par bhejo
    if (profile.role === "patient") {
      return (
        <Navigate
          to="/patient/dashboard"
          replace
        />
      );
    }

    if (profile.role === "nurse") {
      return (
        <Navigate
          to="/nurse/dashboard"
          replace
        />
      );
    }

    if (profile.role === "doctor") {
      return (
        <Navigate
          to="/doctor/dashboard"
          replace
        />
      );
    }

    if (profile.role === "admin") {
      return (
        <Navigate
          to="/admin/dashboard"
          replace
        />
      );
    }

    return (
      <Navigate
        to="/login"
        replace
      />
    );
  }

  // Everything is correct
  return <Outlet />;
}