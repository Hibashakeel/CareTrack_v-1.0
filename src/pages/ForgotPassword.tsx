import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import {
  HeartPulse,
  Mail,
  ArrowLeft,
  ShieldCheck,
  Send,
} from "lucide-react";
import { resetPassword } from "../services/auth";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setMsg("");
    setErr("");
    setLoading(true);

    try {
      await resetPassword(email);

      setMsg(
        "If an account exists for this email, a password reset email has been sent."
      );
    } catch (e: any) {
      setErr(e?.message || "Unable to send reset email.");
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
              <HeartPulse
                size={21}
                strokeWidth={2.2}
              />
            </span>

            <span>CareTrack</span>
          </Link>

          <div style={styles.brandContent}>
            <div style={styles.smallBadge}>
              <Mail size={15} />
              Account Recovery
            </div>

            <h1 style={styles.brandTitle}>
              Get back to
              <br />
              <span style={styles.brandHighlight}>
                your CareTrack account.
              </span>
            </h1>

            <p style={styles.brandDescription}>
              Forgot your password? No problem.
              Enter the email address associated with
              your account and we will help you reset
              your password securely.
            </p>

            <div style={styles.infoCard}>
              <div style={styles.infoIcon}>
                <ShieldCheck size={20} />
              </div>

              <div>
                <strong style={styles.infoTitle}>
                  Secure account recovery
                </strong>

                <p style={styles.infoText}>
                  Password reset instructions are sent
                  to the email address associated with
                  your CareTrack account.
                </p>
              </div>
            </div>
          </div>

          <p style={styles.brandFooter}>
            © {new Date().getFullYear()} CareTrack
          </p>
        </section>

        {/* =========================
            FORM CARD
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
              <div style={styles.headerIcon}>
                <Mail size={21} />
              </div>

              <div>
                <h2 style={styles.title}>
                  Reset password
                </h2>

                <p style={styles.subtitle}>
                  Enter your email to receive a reset
                  link.
                </p>
              </div>
            </div>

            {/* SUCCESS MESSAGE */}

            {msg && (
              <div style={styles.successBox}>
                <div style={styles.successIcon}>
                  <Mail size={16} />
                </div>

                <div>
                  <strong>
                    Check your email
                  </strong>

                  <span>{msg}</span>
                </div>
              </div>
            )}

            {/* ERROR MESSAGE */}

            {err && (
              <div style={styles.errorBox}>
                <strong>
                  Unable to send reset email
                </strong>

                <span>{err}</span>
              </div>
            )}

            <form onSubmit={submit}>

              {/* EMAIL */}

              <div style={styles.field}>
                <label style={styles.label}>
                  Email address
                </label>

                <div style={styles.inputWrapper}>
                  <Mail
                    size={17}
                    style={styles.inputIcon}
                  />

                  <input
                    type="email"
                    value={email}
                    onChange={(e) =>
                      setEmail(e.target.value)
                    }
                    placeholder="you@example.com"
                    required
                    style={styles.input}
                  />
                </div>
              </div>

              {/* BUTTON */}

              <button
                type="submit"
                disabled={loading}
                style={{
                  ...styles.resetButton,
                  opacity: loading ? 0.75 : 1,
                  cursor: loading
                    ? "not-allowed"
                    : "pointer",
                }}
              >
                {loading
                  ? "Sending..."
                  : "Send Reset Email"}

                {!loading && (
                  <Send size={17} />
                )}
              </button>
            </form>

            {/* DIVIDER */}

            <div style={styles.divider}>
              <span style={styles.dividerLine} />

              <small>CareTrack</small>

              <span style={styles.dividerLine} />
            </div>

            {/* BACK TO LOGIN */}

            <Link
              to="/login"
              style={styles.backLink}
            >
              <ArrowLeft size={16} />
              Back to Sign In
            </Link>

            {/* SECURITY NOTE */}

            <div style={styles.securityNote}>
              <ShieldCheck size={16} />

              <span>
                For your security, CareTrack does not
                reveal whether an email address has an
                account.
              </span>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

/* =========================
   STYLES
========================= */

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
    flexShrink: 0,
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
    fontSize: "47px",
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

  infoCard: {
    display: "flex",
    alignItems: "flex-start",
    gap: "12px",
    maxWidth: "470px",
    padding: "15px",
    borderRadius: "12px",
    background: "rgba(255,255,255,0.72)",
    border: "1px solid #dbe7f5",
  },

  infoIcon: {
    width: "38px",
    height: "38px",
    borderRadius: "10px",
    background: "#e8f2ff",
    color: "#0878e8",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },

  infoTitle: {
    display: "block",
    color: "#3d5068",
    fontSize: "13px",
    marginBottom: "4px",
  },

  infoText: {
    margin: 0,
    color: "#718198",
    fontSize: "12px",
    lineHeight: 1.55,
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
    background:
      "rgba(255, 255, 255, 0.97)",
    border: "1px solid #dfe8f2",
    borderRadius: "22px",
    padding: "35px",
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
    marginBottom: "28px",
  },

  headerIcon: {
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

  field: {
    marginBottom: "20px",
  },

  label: {
    display: "block",
    marginBottom: "8px",
    fontSize: "13px",
    fontWeight: 650,
    color: "#3d4d60",
  },

  inputWrapper: {
    position: "relative",
  },

  inputIcon: {
    position: "absolute",
    left: "13px",
    top: "50%",
    transform: "translateY(-50%)",
    color: "#718198",
    pointerEvents: "none",
  },

  input: {
    width: "100%",
    height: "48px",
    boxSizing: "border-box",
    border: "1px solid #d5e0ec",
    borderRadius: "10px",
    padding: "0 13px 0 42px",
    background: "#ffffff",
    color: "#24344d",
    outline: "none",
    fontSize: "14px",
  },

  successBox: {
    display: "flex",
    alignItems: "flex-start",
    gap: "10px",
    background: "#eef6ff",
    border: "1px solid #cfe0f5",
    color: "#0878e8",
    borderRadius: "10px",
    padding: "12px 13px",
    marginBottom: "19px",
    fontSize: "12px",
    lineHeight: 1.45,
  },

  successIcon: {
    width: "30px",
    height: "30px",
    borderRadius: "8px",
    background: "#e0edff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
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

  resetButton: {
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
    gap: "9px",
    boxShadow:
      "0 8px 18px rgba(8, 120, 232, 0.18)",
  },

  divider: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    margin: "25px 0 20px",
    color: "#9aa8b8",
  },

  dividerLine: {
    flex: 1,
    height: "1px",
    background: "#e3eaf2",
  },

  backLink: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "7px",
    color: "#0878e8",
    textDecoration: "none",
    fontSize: "13px",
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
