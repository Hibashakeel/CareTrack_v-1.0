import { useEffect, useState, type FormEvent } from "react";
import {
  BadgeCheck,
  CalendarDays,
  CheckCircle2,
  KeyRound,
  Mail,
  MapPin,
  Phone,
  Save,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import { ref, update } from "firebase/database";

import { useAuth } from "../context/AuthContext";
import { db } from "../lib/firebase";
import { resetPassword } from "../services/auth";

function formatRole(role: string) {
  return role.charAt(0).toUpperCase() + role.slice(1);
}

export function UserProfilePage() {
  const { user, profile, loading, refreshProfile } = useAuth();
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [gender, setGender] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    setPhone(profile?.phone ?? "");
    setAddress(profile?.address ?? "");
    setDateOfBirth(profile?.dateOfBirth ?? "");
    setGender(profile?.gender ?? "");
  }, [
    profile?.uid,
    profile?.phone,
    profile?.address,
    profile?.dateOfBirth,
    profile?.gender,
  ]);

  async function handleSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!user?.uid || !profile) {
      setError("Your account profile could not be loaded.");
      return;
    }

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      await update(ref(db), {
        [`users/${user.uid}/phone`]: phone.trim(),
        [`users/${user.uid}/address`]: address.trim(),
        [`users/${user.uid}/dateOfBirth`]: dateOfBirth.trim(),
        [`users/${user.uid}/gender`]: gender.trim(),
      });
      await refreshProfile();
      setSuccess("Your profile has been updated.");
    } catch (saveError) {
      console.error("Could not save your profile:", saveError);
      setError(
        saveError instanceof Error
          ? saveError.message
          : "Unable to save your profile. Please try again."
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading || !profile) {
    return (
      <div className="account-page">
        <div className="account-panel account-loading" role="status">
          Loading your profile...
        </div>
      </div>
    );
  }

  const infoItems = [
    {
      key: "phone",
      label: "Phone number",
      value: phone,
      icon: Phone,
    },
    {
      key: "address",
      label: "Address",
      value: address,
      icon: MapPin,
    },
    {
      key: "dateOfBirth",
      label: "Date of birth",
      value: dateOfBirth,
      icon: CalendarDays,
    },
    {
      key: "gender",
      label: "Gender",
      value: gender,
      icon: UserRound,
    },
  ] as const;

  const readOnlyItems = [
    { label: "Account ID", value: profile.uid },
    { label: "Account status", value: profile.active ? "Active" : "Inactive" },
    ...(profile.specialization
      ? [{ label: "Specialization", value: profile.specialization }]
      : []),
    ...(profile.department
      ? [{ label: "Department", value: profile.department }]
      : []),
    ...(profile.availability
      ? [{ label: "Availability", value: profile.availability }]
      : []),
    ...(profile.createdAt
      ? [
          {
            label: "Member since",
            value: new Date(profile.createdAt).toLocaleDateString(),
          },
        ]
      : []),
  ];

  return (
    <div className="account-page">
      <header className="account-page-heading">
        <span className="account-eyebrow">YOUR ACCOUNT</span>
        <h1>My Profile</h1>
        <p>Review and update your personal information.</p>
      </header>

      {error && (
        <div className="account-alert account-alert-error" role="alert">
          {error}
        </div>
      )}
      {success && (
        <div className="account-alert account-alert-success" role="status">
          <CheckCircle2 size={18} />
          {success}
        </div>
      )}

      <div className="account-profile-grid">
        <section className="account-panel">
          <div className="account-identity">
            <div className="account-avatar" aria-hidden="true">
              <UserRound size={27} />
            </div>
            <div className="account-identity-copy">
              <h2>{profile.fullName || user?.displayName || "CareTrack User"}</h2>
              <p>{formatRole(profile.role)} account</p>
            </div>
            <BadgeCheck className="account-verified-icon" size={22} />
          </div>

          <div className="account-readonly-grid">
            <div className="account-readonly-item">
              <Mail size={17} />
              <div>
                <span>Email address</span>
                <strong>{user?.email || profile.email || "Not available"}</strong>
              </div>
            </div>
            <div className="account-readonly-item">
              <ShieldCheck size={17} />
              <div>
                <span>Role</span>
                <strong>{formatRole(profile.role)}</strong>
              </div>
            </div>
          </div>

          <form className="account-form" onSubmit={handleSave}>
            <h3>Contact and personal details</h3>
            <p className="account-section-description">
              Email, role, and account ID are read-only.
            </p>

            {infoItems.map(({ key, label, value, icon: Icon }) => (
              <label className="account-field" key={key}>
                <span>
                  <Icon size={16} />
                  {label}
                </span>
                {key === "address" ? (
                  <textarea
                    value={value}
                    onChange={(event) => setAddress(event.target.value)}
                    rows={3}
                    maxLength={300}
                    autoComplete="street-address"
                  />
                ) : key === "gender" ? (
                  <select
                    value={value}
                    onChange={(event) => setGender(event.target.value)}
                  >
                    <option value="">Select an option</option>
                    <option value="Female">Female</option>
                    <option value="Male">Male</option>
                    <option value="Other">Other</option>
                    <option value="Prefer not to say">Prefer not to say</option>
                  </select>
                ) : (
                  <input
                    type={key === "dateOfBirth" ? "date" : "tel"}
                    value={value}
                    onChange={(event) =>
                      key === "phone"
                        ? setPhone(event.target.value)
                        : setDateOfBirth(event.target.value)
                    }
                    maxLength={key === "phone" ? 30 : undefined}
                    autoComplete={key === "phone" ? "tel" : "bday"}
                  />
                )}
              </label>
            ))}

            <button className="account-primary-button" type="submit" disabled={saving}>
              <Save size={17} />
              {saving ? "Saving..." : "Save profile"}
            </button>
          </form>
        </section>

        <aside className="account-panel account-details-panel">
          <div className="account-details-heading">
            <ShieldCheck size={20} />
            <h3>Account information</h3>
          </div>
          {readOnlyItems.map((item) => (
            <div className="account-detail-row" key={item.label}>
              <span>{item.label}</span>
              <strong>{item.value}</strong>
            </div>
          ))}
          <p className="account-privacy-note">
            <ShieldCheck size={16} />
            Your account identity and role are managed securely by CareTrack.
          </p>
        </aside>
      </div>
    </div>
  );
}

export function AccountSettingsPage() {
  const { user, profile, loading } = useAuth();
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handlePasswordReset() {
    const email = user?.email;
    if (!email) {
      setError("A verified account email is not available.");
      return;
    }

    setSending(true);
    setError("");
    setSuccess("");
    try {
      await resetPassword(email);
      setSuccess(`A secure password reset link was sent to ${email}.`);
    } catch (resetError) {
      console.error("Could not send password reset email:", resetError);
      setError(
        resetError instanceof Error
          ? resetError.message
          : "Unable to send a password reset email. Please try again."
      );
    } finally {
      setSending(false);
    }
  }

  if (loading || !profile) {
    return (
      <div className="account-page">
        <div className="account-panel account-loading" role="status">
          Loading account settings...
        </div>
      </div>
    );
  }

  return (
    <div className="account-page">
      <header className="account-page-heading">
        <span className="account-eyebrow">SECURITY & PREFERENCES</span>
        <h1>Account Settings</h1>
        <p>Manage your sign-in security and account access.</p>
      </header>

      {error && (
        <div className="account-alert account-alert-error" role="alert">
          {error}
        </div>
      )}
      {success && (
        <div className="account-alert account-alert-success" role="status">
          <CheckCircle2 size={18} />
          {success}
        </div>
      )}

      <section className="account-panel account-security-card">
        <div className="account-security-icon">
          <KeyRound size={22} />
        </div>
        <div className="account-security-copy">
          <h2>Password and sign-in</h2>
          <p>
            Send a password reset link to the email address linked to your
            signed-in Firebase account. The link is handled securely by Firebase.
          </p>
          <div className="account-security-email">
            <Mail size={16} />
            {user?.email || profile.email || "Email unavailable"}
          </div>
        </div>
        <button
          className="account-primary-button"
          type="button"
          onClick={handlePasswordReset}
          disabled={sending || !user?.email}
        >
          <KeyRound size={17} />
          {sending ? "Sending..." : "Send password reset link"}
        </button>
      </section>

      <section className="account-panel account-security-note">
        <ShieldCheck size={19} />
        <div>
          <strong>Protected account</strong>
          <p>
            Your account is managed through Firebase Authentication. For your
            protection, email and account ID cannot be changed here.
          </p>
        </div>
      </section>
    </div>
  );
}
