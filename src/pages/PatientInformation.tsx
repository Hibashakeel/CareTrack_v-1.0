import {
  User,
  Phone,
  Mail,
  MapPin,
  CalendarDays,
  Edit3,
  ShieldCheck,
  BadgeCheck,
  Save,
  X,
  Users,
} from "lucide-react";

import {
  useEffect,
  useState,
  type ReactNode,
} from "react";

import { ref, update } from "firebase/database";

import { useAuth } from "../context/AuthContext";
import { db } from "../lib/firebase";

interface ExtendedProfile {
  uid?: string;
  fullName?: string;
  email?: string;
  phone?: string;
  address?: string;
  dateOfBirth?: string;
  gender?: string;
  role?: string;
}

export default function PatientInformation() {
  const { user, profile } = useAuth();

  const realProfile = profile as ExtendedProfile | null;

  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [gender, setGender] = useState("");

  const fullName =
    realProfile?.fullName ||
    user?.displayName ||
    "Patient";

  const email =
    realProfile?.email ||
    user?.email ||
    "Not available";

  /*
   * Create a stable numeric Patient ID from Firebase UID.
   * It will remain the same for the same patient.
   */
  const patientId = getNumericPatientId(
    realProfile?.uid || user?.uid || ""
  );

  useEffect(() => {
    setPhone(realProfile?.phone || "");
    setAddress(realProfile?.address || "");
    setDateOfBirth(realProfile?.dateOfBirth || "");
    setGender(realProfile?.gender || "");
  }, [
    realProfile?.phone,
    realProfile?.address,
    realProfile?.dateOfBirth,
    realProfile?.gender,
  ]);

  async function handleSave() {
    if (!user?.uid) {
      setError("Patient account could not be identified.");
      return;
    }

    setSaving(true);
    setError("");

    try {
      await update(ref(db, `users/${user.uid}`), {
        phone: phone.trim(),
        address: address.trim(),
        dateOfBirth: dateOfBirth.trim(),
        gender: gender.trim(),
      });

      setSaved(true);
      setEditing(false);

      setTimeout(() => {
        setSaved(false);
      }, 3000);
    } catch (err) {
      console.error(
        "Unable to update patient information:",
        err
      );

      setError(
        "Unable to save your information. Please try again."
      );
    } finally {
      setSaving(false);
    }
  }

  function handleCancel() {
    setPhone(realProfile?.phone || "");
    setAddress(realProfile?.address || "");
    setDateOfBirth(realProfile?.dateOfBirth || "");
    setGender(realProfile?.gender || "");

    setEditing(false);
    setError("");
  }

  return (
    <div className="patient-information-page">

      {/* =========================
          PAGE HEADER
      ========================== */}
      <div className="patient-information-header">
        <div>
          <div className="patient-information-title-row">
            <div className="patient-information-title-icon">
              <User size={22} />
            </div>

            <div>
              <h1>My Information</h1>

              <p>
                View and manage your personal patient information.
              </p>
            </div>
          </div>
        </div>

        {!editing && (
          <button
            type="button"
            className="patient-info-edit-button"
            onClick={() => {
              setEditing(true);
              setError("");
              setSaved(false);
            }}
          >
            <Edit3 size={17} />
            Edit Information
          </button>
        )}
      </div>

      {/* =========================
          SUCCESS MESSAGE
      ========================== */}
      {saved && (
        <div className="patient-info-alert patient-info-success">
          <BadgeCheck size={19} />

          <span>
            Your information has been updated successfully.
          </span>
        </div>
      )}

      {/* =========================
          ERROR MESSAGE
      ========================== */}
      {error && (
        <div className="patient-info-alert patient-info-error">
          <span>{error}</span>
        </div>
      )}

      {/* =========================
          PROFILE BANNER
      ========================== */}
      <section className="patient-profile-banner">
        <div className="patient-profile-avatar">
          <User size={30} />
        </div>

        <div className="patient-profile-content">
          <div className="patient-profile-name-row">
            <h2>{fullName}</h2>

            <span className="patient-profile-status">
              <span className="patient-profile-status-dot" />
              Active Patient
            </span>
          </div>

          <p>{email}</p>

          <div className="patient-profile-role">
            <ShieldCheck size={16} />
            Patient Account
          </div>
        </div>
      </section>

      {/* =========================
          MAIN CONTENT
      ========================== */}
      <div className="patient-information-grid">

        {/* =========================
            PERSONAL INFORMATION
        ========================== */}
        <section className="patient-information-card">

          <div className="patient-information-card-header">
            <div>
              <h3>Personal Information</h3>

              <p>
                Basic information associated with your patient
                account.
              </p>
            </div>

            <div className="patient-information-card-icon">
              <User size={19} />
            </div>
          </div>

          <div className="patient-information-items">

            {/* FULL NAME */}
            <InfoItem
              icon={<User size={18} />}
              label="Full Name"
              value={fullName}
            />

            {/* EMAIL */}
            <InfoItem
              icon={<Mail size={18} />}
              label="Email Address"
              value={email}
            />

            {/* DATE OF BIRTH */}
            {editing ? (
              <div className="patient-info-edit-field">
                <div className="patient-info-edit-label">
                  <div className="info-item-icon">
                    <CalendarDays size={18} />
                  </div>

                  <label htmlFor="patient-date-of-birth">
                    Date of Birth
                  </label>
                </div>

                <input
                  id="patient-date-of-birth"
                  type="date"
                  value={dateOfBirth}
                  onChange={(e) =>
                    setDateOfBirth(e.target.value)
                  }
                />
              </div>
            ) : (
              <InfoItem
                icon={<CalendarDays size={18} />}
                label="Date of Birth"
                value={
                  dateOfBirth
                    ? formatDate(dateOfBirth)
                    : "Not provided"
                }
              />
            )}

            {/* GENDER */}
            {editing ? (
              <div className="patient-info-edit-field">
                <div className="patient-info-edit-label">
                  <div className="info-item-icon">
                    <Users size={18} />
                  </div>

                  <label htmlFor="patient-gender">
                    Gender
                  </label>
                </div>

                <select
                  id="patient-gender"
                  value={gender}
                  onChange={(e) =>
                    setGender(e.target.value)
                  }
                >
                  <option value="">
                    Select gender
                  </option>

                  <option value="Male">
                    Male
                  </option>

                  <option value="Female">
                    Female
                  </option>

                  <option value="Other">
                    Other
                  </option>
                </select>
              </div>
            ) : (
              <InfoItem
                icon={<Users size={18} />}
                label="Gender"
                value={gender || "Not provided"}
              />
            )}

            {/* PHONE */}
            {editing ? (
              <div className="patient-info-edit-field">
                <div className="patient-info-edit-label">
                  <div className="info-item-icon">
                    <Phone size={18} />
                  </div>

                  <label htmlFor="patient-phone">
                    Phone Number
                  </label>
                </div>

                <input
                  id="patient-phone"
                  type="tel"
                  value={phone}
                  onChange={(e) =>
                    setPhone(e.target.value)
                  }
                  placeholder="Enter phone number"
                />
              </div>
            ) : (
              <InfoItem
                icon={<Phone size={18} />}
                label="Phone Number"
                value={phone || "Not provided"}
              />
            )}

            {/* ADDRESS */}
            {editing ? (
              <div className="patient-info-edit-field">
                <div className="patient-info-edit-label">
                  <div className="info-item-icon">
                    <MapPin size={18} />
                  </div>

                  <label htmlFor="patient-address">
                    Address
                  </label>
                </div>

                <textarea
                  id="patient-address"
                  value={address}
                  onChange={(e) =>
                    setAddress(e.target.value)
                  }
                  placeholder="Enter your address"
                  rows={3}
                />
              </div>
            ) : (
              <InfoItem
                icon={<MapPin size={18} />}
                label="Address"
                value={address || "Not provided"}
              />
            )}
          </div>

          {/* =========================
              EDIT ACTIONS
          ========================== */}
          {editing && (
            <div className="patient-information-actions">
              <button
                type="button"
                className="patient-info-cancel-button"
                onClick={handleCancel}
                disabled={saving}
              >
                <X size={17} />
                Cancel
              </button>

              <button
                type="button"
                className="patient-info-save-button"
                onClick={handleSave}
                disabled={saving}
              >
                <Save size={17} />

                {saving
                  ? "Saving..."
                  : "Save Changes"}
              </button>
            </div>
          )}
        </section>

        {/* =========================
            RIGHT SIDE
        ========================== */}
        <aside className="patient-information-side">

          {/* PATIENT ID */}
          <section className="patient-side-card">
            <div className="patient-side-card-icon">
              <BadgeCheck size={19} />
            </div>

            <div className="patient-side-card-content">
              <span>Patient ID</span>

              <strong>
                {patientId}
              </strong>
            </div>
          </section>

          {/* PRIVACY */}
          <section className="patient-privacy-card">
            <div className="patient-privacy-icon">
              <ShieldCheck size={20} />
            </div>

            <div>
              <h3>Privacy & Security</h3>

              <p>
                Your personal information is stored securely
                and is available to authorized care staff
                through the CareTrack system.
              </p>
            </div>
          </section>

          {/* ACCOUNT INFORMATION */}
          <section className="patient-side-info-card">

            <div className="patient-side-info-header">
              <User size={18} />

              <h3>Account Information</h3>
            </div>

            <div className="patient-side-info-row">
              <span>Account Type</span>

              <strong>
                Patient
              </strong>
            </div>

            <div className="patient-side-info-row">
              <span>Status</span>

              <span className="patient-account-status">
                Active
              </span>
            </div>
          </section>
        </aside>
      </div>

      {/* =========================
          PAGE STYLES
      ========================== */}
      <style>{`

        .patient-information-page {
          width: 100%;
          max-width: 1250px;
          margin: 0 auto;
          padding: 24px;
          box-sizing: border-box;
          color: #17324d;
        }

        /* HEADER */

        .patient-information-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
          margin-bottom: 20px;
        }

        .patient-information-title-row {
          display: flex;
          align-items: center;
          gap: 13px;
        }

        .patient-information-title-icon {
          width: 44px;
          height: 44px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #eaf3fb;
          color: #1d5f91;
          flex-shrink: 0;
        }

        .patient-information-header h1 {
          margin: 0;
          font-size: 25px;
          font-weight: 700;
          color: #17324d;
        }

        .patient-information-header p {
          margin: 5px 0 0;
          font-size: 13px;
          color: #708399;
        }

        /* BUTTONS */

        .patient-info-edit-button,
        .patient-info-save-button,
        .patient-info-cancel-button {
          border: none;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          min-height: 40px;
          padding: 0 15px;
          border-radius: 9px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: 0.2s ease;
        }

        .patient-info-edit-button {
          background: #174a70;
          color: white;
        }

        .patient-info-edit-button:hover {
          background: #123b59;
        }

        /* ALERTS */

        .patient-info-alert {
          display: flex;
          align-items: center;
          gap: 9px;
          padding: 11px 14px;
          border-radius: 9px;
          margin-bottom: 18px;
          font-size: 13px;
        }

        .patient-info-success {
          background: #edf8f2;
          border: 1px solid #c9e6d5;
          color: #347552;
        }

        .patient-info-error {
          background: #fff1f1;
          border: 1px solid #efcaca;
          color: #a64a4a;
        }

        /* PROFILE */

        .patient-profile-banner {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 19px 21px;
          margin-bottom: 20px;
          border: 1px solid #dce8f2;
          border-radius: 14px;
          background: linear-gradient(
            135deg,
            #f4f9fd,
            #ffffff
          );
          box-shadow: 0 3px 12px rgba(23, 50, 77, 0.04);
        }

        .patient-profile-avatar {
          width: 60px;
          height: 60px;
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #dcecf8;
          color: #1d5f91;
          flex-shrink: 0;
        }

        .patient-profile-content {
          min-width: 0;
        }

        .patient-profile-name-row {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-wrap: wrap;
        }

        .patient-profile-name-row h2 {
          margin: 0;
          font-size: 19px;
          color: #17324d;
        }

        .patient-profile-content > p {
          margin: 4px 0 7px;
          font-size: 13px;
          color: #718399;
        }

        .patient-profile-status {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 4px 9px;
          border-radius: 999px;
          background: #edf8f2;
          color: #347552;
          font-size: 11px;
          font-weight: 600;
        }

        .patient-profile-status-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #4f9b72;
        }

        .patient-profile-role {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          color: #53718b;
          font-size: 12px;
        }

        /* GRID */

        .patient-information-grid {
          display: grid;
          grid-template-columns: minmax(0, 1.7fr) minmax(270px, 0.8fr);
          gap: 20px;
          align-items: start;
        }

        .patient-information-card,
        .patient-side-card,
        .patient-privacy-card,
        .patient-side-info-card {
          background: #ffffff;
          border: 1px solid #dce7f0;
          border-radius: 14px;
          box-shadow: 0 3px 12px rgba(23, 50, 77, 0.04);
        }

        .patient-information-card {
          overflow: hidden;
        }

        /* CARD HEADER */

        .patient-information-card-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 15px;
          padding: 18px 20px;
          border-bottom: 1px solid #edf2f6;
        }

        .patient-information-card-header h3 {
          margin: 0;
          font-size: 16px;
          color: #17324d;
        }

        .patient-information-card-header p {
          margin: 4px 0 0;
          font-size: 12px;
          color: #8190a0;
        }

        .patient-information-card-icon {
          width: 36px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 9px;
          background: #edf5fb;
          color: #28658e;
          flex-shrink: 0;
        }

        /* INFO GRID */

        .patient-information-items {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0;
        }

        .patient-info-item {
          display: flex;
          align-items: center;
          gap: 11px;
          min-height: 76px;
          padding: 14px 18px;
          border-bottom: 1px solid #edf2f6;
          box-sizing: border-box;
        }

        .patient-info-item:nth-child(odd) {
          border-right: 1px solid #edf2f6;
        }

        .info-item-icon {
          width: 35px;
          height: 35px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 9px;
          background: #edf5fb;
          color: #28658e;
          flex-shrink: 0;
        }

        .info-item-content {
          min-width: 0;
        }

        .info-item-content span {
          display: block;
          margin-bottom: 4px;
          font-size: 11px;
          color: #8493a3;
        }

        .info-item-content strong {
          display: block;
          color: #29445d;
          font-size: 13px;
          font-weight: 600;
          overflow-wrap: anywhere;
        }

        /* EDIT FIELDS */

        .patient-info-edit-field {
          min-height: 76px;
          padding: 13px 18px;
          border-bottom: 1px solid #edf2f6;
          box-sizing: border-box;
        }

        .patient-info-edit-field:nth-child(odd) {
          border-right: 1px solid #edf2f6;
        }

        .patient-info-edit-label {
          display: flex;
          align-items: center;
          gap: 9px;
          margin-bottom: 7px;
        }

        .patient-info-edit-label label {
          font-size: 11px;
          color: #8493a3;
          font-weight: 600;
        }

        .patient-info-edit-field input,
        .patient-info-edit-field textarea,
        .patient-info-edit-field select {
          width: 100%;
          box-sizing: border-box;
          border: 1px solid #d4e1eb;
          border-radius: 8px;
          background: #fbfdff;
          color: #29445d;
          font-family: inherit;
          font-size: 13px;
          outline: none;
          transition: 0.2s ease;
        }

        .patient-info-edit-field input,
        .patient-info-edit-field select {
          height: 34px;
          padding: 0 10px;
        }

        .patient-info-edit-field textarea {
          padding: 8px 10px;
          resize: vertical;
          min-height: 55px;
        }

        .patient-info-edit-field input:focus,
        .patient-info-edit-field textarea:focus,
        .patient-info-edit-field select:focus {
          border-color: #76a9cd;
          box-shadow: 0 0 0 3px rgba(55, 119, 162, 0.08);
          background: #ffffff;
        }

        /* ACTIONS */

        .patient-information-actions {
          display: flex;
          justify-content: flex-end;
          align-items: center;
          gap: 9px;
          padding: 15px 18px;
          background: #fbfdff;
        }

        .patient-info-cancel-button {
          background: #f0f3f6;
          color: #52687c;
        }

        .patient-info-cancel-button:hover {
          background: #e6ebef;
        }

        .patient-info-save-button {
          background: #174a70;
          color: white;
        }

        .patient-info-save-button:hover {
          background: #123b59;
        }

        .patient-info-save-button:disabled,
        .patient-info-cancel-button:disabled {
          opacity: 0.65;
          cursor: not-allowed;
        }

        /* RIGHT SIDE */

        .patient-information-side {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        .patient-side-card {
          display: flex;
          align-items: center;
          gap: 13px;
          padding: 16px;
        }

        .patient-side-card-icon {
          width: 39px;
          height: 39px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 10px;
          background: #edf8f2;
          color: #4b8d6a;
          flex-shrink: 0;
        }

        .patient-side-card-content {
          min-width: 0;
        }

        .patient-side-card-content span {
          display: block;
          margin-bottom: 4px;
          font-size: 11px;
          color: #8291a0;
        }

        .patient-side-card-content strong {
          display: block;
          font-size: 14px;
          letter-spacing: 0.5px;
          color: #29445d;
          overflow-wrap: anywhere;
        }

        /* PRIVACY */

        .patient-privacy-card {
          display: flex;
          gap: 12px;
          padding: 17px;
          background: #f6faff;
          border-color: #dbe9f5;
        }

        .patient-privacy-icon {
          width: 38px;
          height: 38px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 10px;
          background: #e6f1fa;
          color: #28658e;
          flex-shrink: 0;
        }

        .patient-privacy-card h3 {
          margin: 1px 0 5px;
          font-size: 13px;
          color: #29445d;
        }

        .patient-privacy-card p {
          margin: 0;
          font-size: 11px;
          line-height: 1.6;
          color: #718399;
        }

        /* ACCOUNT */

        .patient-side-info-card {
          padding: 16px;
        }

        .patient-side-info-header {
          display: flex;
          align-items: center;
          gap: 8px;
          padding-bottom: 12px;
          margin-bottom: 5px;
          border-bottom: 1px solid #edf2f6;
          color: #28658e;
        }

        .patient-side-info-header h3 {
          margin: 0;
          font-size: 13px;
          color: #29445d;
        }

        .patient-side-info-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          padding: 10px 0;
          font-size: 12px;
          border-bottom: 1px solid #f0f3f6;
        }

        .patient-side-info-row:last-child {
          border-bottom: none;
          padding-bottom: 1px;
        }

        .patient-side-info-row > span:first-child {
          color: #8190a0;
        }

        .patient-side-info-row strong {
          color: #29445d;
          font-weight: 600;
        }

        .patient-account-status {
          padding: 4px 8px;
          border-radius: 999px;
          background: #edf8f2;
          color: #347552;
          font-size: 10px;
          font-weight: 700;
        }

        /* RESPONSIVE */

        @media (max-width: 850px) {
          .patient-information-grid {
            grid-template-columns: 1fr;
          }

          .patient-information-side {
            display: grid;
            grid-template-columns: 1fr 1fr;
          }

          .patient-privacy-card {
            grid-column: span 2;
          }
        }

        @media (max-width: 650px) {
          .patient-information-page {
            padding: 16px;
          }

          .patient-information-header {
            align-items: flex-start;
            flex-direction: column;
          }

          .patient-info-edit-button {
            width: 100%;
          }

          .patient-profile-banner {
            align-items: flex-start;
          }

          .patient-information-items {
            grid-template-columns: 1fr;
          }

          .patient-info-item:nth-child(odd),
          .patient-info-edit-field:nth-child(odd) {
            border-right: none;
          }

          .patient-information-side {
            display: flex;
          }

          .patient-privacy-card {
            grid-column: auto;
          }
        }

      `}</style>
    </div>
  );
}

/* =========================================================
   INFO ITEM COMPONENT
========================================================= */

function InfoItem({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="patient-info-item">
      <div className="info-item-icon">
        {icon}
      </div>

      <div className="info-item-content">
        <span>{label}</span>

        <strong>{value}</strong>
      </div>
    </div>
  );
}

/* =========================================================
   NUMERIC PATIENT ID
========================================================= */

function getNumericPatientId(uid: string): string {
  if (!uid) {
    return "00000000";
  }

  let hash = 0;

  for (let i = 0; i < uid.length; i++) {
    hash =
      (hash * 31 + uid.charCodeAt(i)) >>> 0;
  }

  const numericId = hash
    .toString()
    .padStart(8, "0")
    .slice(-8);

  return numericId;
}

/* =========================================================
   DATE FORMATTER
========================================================= */

function formatDate(date: string): string {
  if (!date) {
    return "Not provided";
  }

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return date;
  }

  return parsedDate.toLocaleDateString(
    "en-GB",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }
  );
}
