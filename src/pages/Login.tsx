import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  HeartPulse,
  Eye,
  EyeOff,
  ShieldCheck,
  Activity,
} from "lucide-react";
import { loginUser } from "../services/auth";

export default function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setLoading(true);

    try {
      const result = await loginUser(
        email.trim(),
        password,
        remember
      );

      console.log("Login successful:", result);

      const role = result.profile.role;

      if (role === "patient") {
        navigate("/patient/dashboard", { replace: true });
      } else if (role === "nurse") {
        navigate("/nurse/dashboard", { replace: true });
      } else if (role === "doctor") {
        navigate("/doctor/dashboard", { replace: true });
      } else if (role === "admin") {
        navigate("/admin/dashboard", { replace: true });
      } else {
        setError("Your account has an invalid role.");
      }
    } catch (error: any) {
      console.error("Login error:", error);

      setError(
        error?.message ||
          "Unable to sign in. Please check your email and password."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={styles.page}>
      <div style={styles.backgroundShapeOne} />
      <div style={styles.backgroundShapeTwo} />

      <div style={styles.layout}>

        {/* =========================
            LEFT SIDE
        ========================== */}

        <section style={styles.brandSection}>
          <Link to="/" style={styles.logo}>
            <span style={styles.logoIcon}>
              <HeartPulse size={21} strokeWidth={2.2} />
            </span>

            <span>CareTrack</span>
          </Link>

          <div style={styles.brandContent}>
            <div style={styles.smallBadge}>
              <Activity size={15} />
              Smart Patient Self-Monitoring
            </div>

            <h1 style={styles.brandTitle}>
              Better patient
              <br />
              <span style={styles.brandHighlight}>
                monitoring starts here.
              </span>
            </h1>

            <p style={styles.brandDescription}>
              A simple and connected platform for
              patients and healthcare staff to record,
              review and communicate daily health
              information.
            </p>

            <div style={styles.featureList}>
              <Feature
                icon={<ShieldCheck size={18} />}
                text="Secure patient information"
              />

              <Feature
                icon={<Activity size={18} />}
                text="Centralized health monitoring"
              />

              <Feature
                icon={<HeartPulse size={18} />}
                text="Connected care communication"
              />
            </div>
          </div>

          <p style={styles.brandFooter}>
            © {new Date().getFullYear()} CareTrack
          </p>
        </section>

        {/* =========================
            RIGHT SIDE
        ========================== */}

        <section style={styles.formSection}>
          <div style={styles.card}>

            {/* MOBILE LOGO */}

            <div style={styles.mobileLogo}>
              <span style={styles.logoIcon}>
                <HeartPulse size={20} />
              </span>

              <span>CareTrack</span>
            </div>

            {/* HEADER */}

            <div style={styles.formHeader}>
              <div style={styles.welcomeIcon}>
                <HeartPulse size={21} />
              </div>

              <div>
                <h2 style={styles.title}>
                  Welcome back
                </h2>

                <p style={styles.subtitle}>
                  Sign in to continue to your CareTrack
                  account.
                </p>
              </div>
            </div>

            {/* ERROR */}

            {error && (
              <div style={styles.errorBox}>
                <strong>Sign in unsuccessful</strong>

                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit}>

              {/* EMAIL */}

              <div style={styles.field}>
                <label style={styles.label}>
                  Email address
                </label>

                <input
                  type="email"
                  value={email}
                  onChange={(event) =>
                    setEmail(event.target.value)
                  }
                  placeholder="you@example.com"
                  required
                  style={styles.input}
                />
              </div>

              {/* PASSWORD */}

              <div style={styles.field}>
                <div style={styles.passwordLabelRow}>
                  <label style={styles.label}>
                    Password
                  </label>

                  <Link
                    to="/forgot-password"
                    style={styles.forgotLink}
                  >
                    Forgot password?
                  </Link>
                </div>

                <div style={styles.passwordWrapper}>
                  <input
                    type={
                      showPassword
                        ? "text"
                        : "password"
                    }
                    value={password}
                    onChange={(event) =>
                      setPassword(event.target.value)
                    }
                    placeholder="Enter your password"
                    required
                    style={{
                      ...styles.input,
                      paddingRight: "48px",
                    }}
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword(!showPassword)
                    }
                    aria-label={
                      showPassword
                        ? "Hide password"
                        : "Show password"
                    }
                    style={styles.eyeButton}
                  >
                    {showPassword ? (
                      <EyeOff size={19} />
                    ) : (
                      <Eye size={19} />
                    )}
                  </button>
                </div>
              </div>

              {/* REMEMBER ME */}

              <label style={styles.rememberRow}>
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(event) =>
                    setRemember(event.target.checked)
                  }
                  style={styles.checkbox}
                />

                <span>Remember me</span>
              </label>

              {/* SIGN IN */}

              <button
                type="submit"
                disabled={loading}
                style={{
                  ...styles.signInButton,
                  opacity: loading ? 0.75 : 1,
                  cursor: loading
                    ? "not-allowed"
                    : "pointer",
                }}
              >
                {loading
                  ? "Signing in..."
                  : "Sign In"}

                {!loading && (
                  <span style={styles.arrow}>
                    →
                  </span>
                )}
              </button>
            </form>

            {/* DIVIDER */}

            <div style={styles.divider}>
              <span style={styles.dividerLine} />

              <small>CareTrack</small>

              <span style={styles.dividerLine} />
            </div>

            {/* REGISTER */}

            <p style={styles.registerText}>
              Don't have an account?{" "}
              <Link
                to="/register"
                style={styles.registerLink}
              >
                Create an account
              </Link>
            </p>

            {/* SECURITY */}

            <div style={styles.securityNote}>
              <ShieldCheck size={16} />

              <span>
                Your account information is protected
                and accessible only to authorized users.
              </span>
            </div>

          </div>
        </section>
      </div>
    </main>
  );
}

// =========================
// FEATURE COMPONENT
// =========================

function Feature({
  icon,
  text,
}: {
  icon: React.ReactNode;
  text: string;
}) {
  return (
    <div style={styles.feature}>
      <span style={styles.featureIcon}>
        {icon}
      </span>

      <span>{text}</span>
    </div>
  );
}

// =========================
// STYLES
// =========================

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    background:
      "linear-gradient(135deg, #f4f8ff 0%, #eef5ff 50%, #f8fbff 100%)",
    position: "relative",
    overflow: "hidden",
    fontFamily:
      "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  },

  backgroundShapeOne: {
    position: "absolute",
    width: "420px",
    height: "420px",
    borderRadius: "50%",
    background: "rgba(20, 105, 225, 0.055)",
    top: "-180px",
    left: "-150px",
  },

  backgroundShapeTwo: {
    position: "absolute",
    width: "500px",
    height: "500px",
    borderRadius: "50%",
    background: "rgba(45, 125, 235, 0.045)",
    bottom: "-260px",
    right: "-180px",
  },

  layout: {
    minHeight: "100vh",
    maxWidth: "1180px",
    margin: "0 auto",
    padding: "36px 28px",
    display: "grid",
    gridTemplateColumns:
      "minmax(0, 1fr) minmax(390px, 480px)",
    gap: "70px",
    alignItems: "center",
    position: "relative",
    zIndex: 1,
  },

  brandSection: {
    minHeight: "600px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    padding: "15px 0",
  },

  logo: {
    display: "inline-flex",
    alignItems: "center",
    gap: "10px",
    textDecoration: "none",
    color: "#24344d",
    fontSize: "24px",
    fontWeight: 750,
    width: "fit-content",
  },

  logoIcon: {
    width: "44px",
    height: "44px",
    borderRadius: "13px",
    background:
      "linear-gradient(135deg, #0878e8, #075bbd)",
    color: "#ffffff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow:
      "0 8px 20px rgba(8, 120, 232, 0.18)",
  },

  brandContent: {
    maxWidth: "570px",
    marginTop: "30px",
  },

  smallBadge: {
    display: "inline-flex",
    alignItems: "center",
    gap: "7px",
    padding: "8px 12px",
    borderRadius: "30px",
    background: "#e8f2ff",
    color: "#0878e8",
    fontSize: "12px",
    fontWeight: 650,
    marginBottom: "22px",
  },

  brandTitle: {
    margin: 0,
    fontSize: "48px",
    lineHeight: 1.1,
    letterSpacing: "-1.5px",
    color: "#24344d",
    fontWeight: 750,
  },

  brandHighlight: {
    color: "#0878e8",
  },

  brandDescription: {
    margin: "22px 0 28px",
    maxWidth: "500px",
    fontSize: "16px",
    lineHeight: 1.7,
    color: "#64748b",
  },

  featureList: {
    display: "flex",
    flexDirection: "column",
    gap: "13px",
  },

  feature: {
    display: "flex",
    alignItems: "center",
    gap: "11px",
    color: "#3f5065",
    fontSize: "14px",
    fontWeight: 550,
  },

  featureIcon: {
    width: "34px",
    height: "34px",
    borderRadius: "9px",
    background: "#ffffff",
    border: "1px solid #dbe7f5",
    color: "#0878e8",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow:
      "0 3px 10px rgba(36, 67, 105, 0.04)",
  },

  brandFooter: {
    margin: 0,
    color: "#94a3b8",
    fontSize: "12px",
  },

  formSection: {
    width: "100%",
  },

  card: {
    background: "rgba(255, 255, 255, 0.97)",
    border: "1px solid #dfe8f2",
    borderRadius: "22px",
    padding: "34px",
    boxShadow:
      "0 20px 55px rgba(36, 67, 105, 0.08)",
  },

  mobileLogo: {
    display: "none",
    alignItems: "center",
    gap: "9px",
    color: "#24344d",
    fontSize: "21px",
    fontWeight: 750,
    marginBottom: "25px",
  },

  formHeader: {
    display: "flex",
    alignItems: "center",
    gap: "13px",
    marginBottom: "27px",
  },

  welcomeIcon: {
    width: "45px",
    height: "45px",
    borderRadius: "12px",
    background: "#e8f2ff",
    color: "#0878e8",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },

  title: {
    margin: 0,
    fontSize: "26px",
    lineHeight: 1.2,
    color: "#24344d",
    fontWeight: 720,
  },

  subtitle: {
    margin: "5px 0 0",
    color: "#69798d",
    fontSize: "13px",
    lineHeight: 1.5,
  },

  errorBox: {
    display: "flex",
    flexDirection: "column",
    gap: "3px",
    background: "#fff5f5",
    border: "1px solid #f1cccc",
    color: "#a33a3a",
    borderRadius: "10px",
    padding: "11px 13px",
    marginBottom: "18px",
    fontSize: "12px",
    lineHeight: 1.45,
  },

  field: {
    marginBottom: "18px",
  },

  label: {
    display: "block",
    marginBottom: "7px",
    fontSize: "13px",
    fontWeight: 650,
    color: "#3d4d60",
  },

  input: {
    width: "100%",
    height: "47px",
    boxSizing: "border-box",
    border: "1px solid #d5e0ec",
    borderRadius: "10px",
    padding: "0 13px",
    background: "#ffffff",
    color: "#24344d",
    outline: "none",
    fontSize: "14px",
  },

  passwordLabelRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },

  forgotLink: {
    color: "#0878e8",
    textDecoration: "none",
    fontSize: "12px",
    fontWeight: 600,
  },

  passwordWrapper: {
    position: "relative",
  },

  eyeButton: {
    position: "absolute",
    right: "5px",
    top: "5px",
    width: "38px",
    height: "37px",
    border: "none",
    background: "transparent",
    color: "#718198",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    borderRadius: "8px",
  },

  rememberRow: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    color: "#68798c",
    fontSize: "13px",
    cursor: "pointer",
    marginBottom: "20px",
  },

  checkbox: {
    width: "15px",
    height: "15px",
    accentColor: "#0878e8",
    cursor: "pointer",
  },

  signInButton: {
    width: "100%",
    height: "48px",
    border: "none",
    borderRadius: "10px",
    background:
      "linear-gradient(135deg, #0878e8, #075bbd)",
    color: "#ffffff",
    fontSize: "14px",
    fontWeight: 650,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "10px",
    boxShadow:
      "0 8px 18px rgba(8, 120, 232, 0.18)",
  },

  arrow: {
    fontSize: "19px",
    lineHeight: 1,
  },

  divider: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    margin: "24px 0 20px",
    color: "#9aa8b8",
  },

  dividerLine: {
    flex: 1,
    height: "1px",
    background: "#e3eaf2",
  },

  registerText: {
    textAlign: "center",
    margin: 0,
    color: "#68798c",
    fontSize: "13px",
  },

  registerLink: {
    color: "#0878e8",
    textDecoration: "none",
    fontWeight: 650,
  },

  securityNote: {
    marginTop: "22px",
    padding: "11px 12px",
    borderRadius: "9px",
    background: "#f3f7fc",
    color: "#718198",
    display: "flex",
    alignItems: "flex-start",
    gap: "8px",
    fontSize: "11px",
    lineHeight: 1.5,
  },
};