import {
  useMemo,
  useState,
  type FormEvent,
} from "react";
import {
  Link,
  useNavigate,
} from "react-router-dom";
import {
  HeartPulse,
  Eye,
  EyeOff,
  ShieldCheck,
  UserPlus,
  Check,
} from "lucide-react";
import { registerUser } from "../services/auth";

export default function Register() {
  const nav = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [pw, setPw] = useState("");

  const [role, setRole] = useState<
    "patient" | "nurse" | "doctor"
  >("patient");

  const [show, setShow] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const rules = useMemo(
    () => ({
      len: pw.length >= 8,
      upper: /[A-Z]/.test(pw),
      lower: /[a-z]/.test(pw),
      num: /\d/.test(pw),
      special: /[^A-Za-z0-9]/.test(pw),
    }),
    [pw]
  );

  const valid = Object.values(rules).every(Boolean);

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setError("");

    if (!valid) {
      setError("Please meet all password requirements.");
      return;
    }

    setLoading(true);

    try {
      const p = await registerUser({
        fullName: name,
        email,
        phone,
        password: pw,
        role,
      });

      if (role === "patient") {
        nav(`/${p.role}/dashboard`);
      } else {
        setError(
          "Registration submitted. Staff accounts require administrator approval before sign in."
        );
      }
    } catch (e: any) {
      setError(
        e?.code === "auth/email-already-in-use"
          ? "An account with this email already exists."
          : e?.message || "Registration failed."
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
              <HeartPulse
                size={21}
                strokeWidth={2.2}
              />
            </span>

            <span>CareTrack</span>
          </Link>

          <div style={styles.brandContent}>
            <div style={styles.smallBadge}>
              <UserPlus size={15} />
              Join CareTrack
            </div>

            <h1 style={styles.brandTitle}>
              Start your
              <br />
              <span style={styles.brandHighlight}>
                care journey.
              </span>
            </h1>

            <p style={styles.brandDescription}>
              Create your CareTrack account to keep
              daily patient information organized and
              make communication between patients and
              healthcare staff easier.
            </p>

            <div style={styles.featureList}>
              <Feature
                icon={<HeartPulse size={18} />}
                text="Simple daily health monitoring"
              />

              <Feature
                icon={<ShieldCheck size={18} />}
                text="Secure patient information"
              />

              <Feature
                icon={<Check size={18} />}
                text="Connected healthcare communication"
              />
            </div>
          </div>

          <p style={styles.brandFooter}>
            © {new Date().getFullYear()} CareTrack
          </p>
        </section>

        {/* =========================
            REGISTER CARD
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
                <UserPlus size={21} />
              </div>

              <div>
                <h2 style={styles.title}>
                  Create account
                </h2>

                <p style={styles.subtitle}>
                  Enter your details to get started
                  with CareTrack.
                </p>
              </div>
            </div>

            {/* ERROR / STATUS */}

            {error && (
              <div style={styles.errorBox}>
                <strong>
                  {role === "patient"
                    ? "Registration message"
                    : "Registration status"}
                </strong>

                <span>{error}</span>
              </div>
            )}

            <form onSubmit={submit}>

              {/* FULL NAME */}

              <div style={styles.field}>
                <label style={styles.label}>
                  Full name
                </label>

                <input
                  value={name}
                  onChange={(e) =>
                    setName(e.target.value)
                  }
                  placeholder="Enter your full name"
                  required
                  style={styles.input}
                />
              </div>

              {/* EMAIL + PHONE */}

              <div style={styles.twoColumn}>
                <div style={styles.field}>
                  <label style={styles.label}>
                    Email address
                  </label>

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

                <div style={styles.field}>
                  <label style={styles.label}>
                    Phone number
                  </label>

                  <input
                    value={phone}
                    onChange={(e) =>
                      setPhone(e.target.value)
                    }
                    placeholder="03XX XXXXXXX"
                    required
                    style={styles.input}
                  />
                </div>
              </div>

              {/* ROLE */}

              <div style={styles.field}>
                <label style={styles.label}>
                  Account role
                </label>

                <select
                  value={role}
                  onChange={(e) =>
                    setRole(
                      e.target.value as
                        | "patient"
                        | "nurse"
                        | "doctor"
                    )
                  }
                  style={styles.input}
                >
                  <option value="patient">
                    Patient
                  </option>

                  <option value="nurse">
                    Nurse
                  </option>

                  <option value="doctor">
                    Doctor
                  </option>
                </select>

                <p style={styles.roleHint}>
                  {role === "patient"
                    ? "Patient accounts can access CareTrack after registration."
                    : "Staff accounts are submitted for administrator approval."}
                </p>
              </div>

              {/* PASSWORD */}

              <div style={styles.field}>
                <label style={styles.label}>
                  Password
                </label>

                <div style={styles.passwordWrapper}>
                  <input
                    type={show ? "text" : "password"}
                    value={pw}
                    onChange={(e) =>
                      setPw(e.target.value)
                    }
                    placeholder="Create a strong password"
                    required
                    style={{
                      ...styles.input,
                      paddingRight: "48px",
                    }}
                  />

                  <button
                    type="button"
                    onClick={() => setShow(!show)}
                    aria-label={
                      show
                        ? "Hide password"
                        : "Show password"
                    }
                    style={styles.eyeButton}
                  >
                    {show ? (
                      <EyeOff size={19} />
                    ) : (
                      <Eye size={19} />
                    )}
                  </button>
                </div>
              </div>

              {/* PASSWORD REQUIREMENTS */}

              <div style={styles.passwordBox}>
                <p style={styles.passwordTitle}>
                  Password requirements
                </p>

                <div style={styles.passwordRules}>
                  <PasswordRule
                    valid={rules.len}
                    text="8+ characters"
                  />

                  <PasswordRule
                    valid={rules.upper}
                    text="Uppercase"
                  />

                  <PasswordRule
                    valid={rules.lower}
                    text="Lowercase"
                  />

                  <PasswordRule
                    valid={rules.num}
                    text="Number"
                  />

                  <PasswordRule
                    valid={rules.special}
                    text="Special character"
                  />
                </div>
              </div>

              {/* SUBMIT */}

              <button
                type="submit"
                disabled={loading}
                style={{
                  ...styles.createButton,
                  opacity: loading ? 0.75 : 1,
                  cursor: loading
                    ? "not-allowed"
                    : "pointer",
                }}
              >
                {loading
                  ? "Creating account..."
                  : "Create Account"}

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

            {/* LOGIN */}

            <p style={styles.loginText}>
              Already have an account?{" "}
              <Link
                to="/login"
                style={styles.loginLink}
              >
                Sign in
              </Link>
            </p>

            {/* SECURITY NOTE */}

            <div style={styles.securityNote}>
              <ShieldCheck size={16} />

              <span>
                Your account information is securely
                stored and available according to your
                assigned CareTrack role.
              </span>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

/* =========================
   FEATURE COMPONENT
========================= */

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

/* =========================
   PASSWORD RULE
========================= */

function PasswordRule({
  valid,
  text,
}: {
  valid: boolean;
  text: string;
}) {
  return (
    <span
      style={{
        ...styles.passwordRule,
        ...(valid ? styles.passwordRuleValid : {}),
      }}
    >
      <Check size={13} />
      {text}
    </span>
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
    background:
      "rgba(8, 120, 232, 0.055)",
    top: "-180px",
    left: "-150px",
  },

  backgroundShapeTwo: {
    position: "absolute",
    width: "500px",
    height: "500px",
    borderRadius: "50%",
    background:
      "rgba(45, 125, 235, 0.045)",
    bottom: "-260px",
    right: "-180px",
  },

  layout: {
    minHeight: "100vh",
    maxWidth: "1180px",
    margin: "0 auto",
    padding: "30px 28px",
    display: "grid",
    gridTemplateColumns:
      "minmax(0, 1fr) minmax(460px, 530px)",
    gap: "65px",
    alignItems: "center",
    position: "relative",
    zIndex: 1,
  },

  brandSection: {
    minHeight: "620px",
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
    maxWidth: "560px",
    marginTop: "25px",
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
    marginBottom: "21px",
  },

  brandTitle: {
    margin: 0,
    fontSize: "46px",
    lineHeight: 1.1,
    letterSpacing: "-1.5px",
    color: "#24344d",
    fontWeight: 750,
  },

  brandHighlight: {
    color: "#0878e8",
  },

  brandDescription: {
    margin: "20px 0 27px",
    maxWidth: "500px",
    fontSize: "15px",
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
    background:
      "rgba(255, 255, 255, 0.97)",
    border: "1px solid #dfe8f2",
    borderRadius: "22px",
    padding: "31px 34px",
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
    marginBottom: "24px",
  },

  formHeader: {
    display: "flex",
    alignItems: "center",
    gap: "13px",
    marginBottom: "24px",
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
    fontSize: "25px",
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
    marginBottom: "17px",
    fontSize: "12px",
    lineHeight: 1.45,
  },

  field: {
    marginBottom: "15px",
  },

  twoColumn: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "13px",
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
    height: "45px",
    boxSizing: "border-box",
    border: "1px solid #d5e0ec",
    borderRadius: "10px",
    padding: "0 13px",
    background: "#ffffff",
    color: "#24344d",
    outline: "none",
    fontSize: "13px",
  },

  roleHint: {
    margin: "6px 0 0",
    color: "#8492a6",
    fontSize: "11px",
    lineHeight: 1.4,
  },

  passwordWrapper: {
    position: "relative",
  },

  eyeButton: {
    position: "absolute",
    right: "5px",
    top: "4px",
    width: "37px",
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

  passwordBox: {
    background: "#f3f7fc",
    border: "1px solid #dfe8f2",
    borderRadius: "10px",
    padding: "11px 12px",
    marginBottom: "17px",
  },

  passwordTitle: {
    margin: "0 0 8px",
    color: "#4b5d73",
    fontSize: "11px",
    fontWeight: 650,
  },

  passwordRules: {
    display: "flex",
    flexWrap: "wrap",
    gap: "7px 13px",
  },

  passwordRule: {
    display: "inline-flex",
    alignItems: "center",
    gap: "4px",
    color: "#8b99aa",
    fontSize: "10.5px",
    transition: "all 0.2s ease",
  },

  passwordRuleValid: {
    color: "#0878e8",
    fontWeight: 600,
  },

  createButton: {
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
    margin: "21px 0 17px",
    color: "#9aa8b8",
  },

  dividerLine: {
    flex: 1,
    height: "1px",
    background: "#e3eaf2",
  },

  loginText: {
    textAlign: "center",
    margin: 0,
    color: "#68798c",
    fontSize: "13px",
  },

  loginLink: {
    color: "#0878e8",
    textDecoration: "none",
    fontWeight: 650,
  },

  securityNote: {
    marginTop: "19px",
    padding: "10px 12px",
    borderRadius: "9px",
    background: "#f3f7fc",
    color: "#718198",
    display: "flex",
    alignItems: "flex-start",
    gap: "8px",
    fontSize: "10.5px",
    lineHeight: 1.5,
  },
};