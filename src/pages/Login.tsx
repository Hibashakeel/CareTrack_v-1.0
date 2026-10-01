import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
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
    <main className="auth-page">
      <div className="auth-card">
        <Link to="/" className="brand centered">
          <span className="brand-mark">
            <Eye size={19} />
          </span>
          <span>CareTrack</span>
        </Link>

        <h1>Welcome back</h1>

        <p>Sign in to your CareTrack account.</p>

        {error && (
          <div className="form-error">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <label>
            Email

            <input
              type="email"
              value={email}
              onChange={(event) =>
                setEmail(event.target.value)
              }
              placeholder="you@example.com"
              required
            />
          </label>

          <label>
            Password

            <div className="password-field">
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
                required
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
              >
                {showPassword ? (
                  <EyeOff size={18} />
                ) : (
                  <Eye size={18} />
                )}
              </button>
            </div>
          </label>

          <label className="check">
            <input
              type="checkbox"
              checked={remember}
              onChange={(event) =>
                setRemember(event.target.checked)
              }
            />

            Remember me
          </label>

          <button
            type="submit"
            className="button primary full"
            disabled={loading}
          >
            {loading
              ? "Signing in..."
              : "Sign In"}
          </button>
        </form>

        <Link to="/forgot-password">
          Forgot password?
        </Link>

        <p className="auth-footer">
          Don't have an account?{" "}
          <Link to="/register">
            Create account
          </Link>
        </p>
      </div>
    </main>
  );
}