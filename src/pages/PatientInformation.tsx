import {
  User,
  Phone,
  Mail,
  MapPin,
  CalendarDays,
  Edit3,
  ShieldCheck,
  BadgeCheck,
} from "lucide-react";

import { useEffect, useState } from "react";
import type { ReactNode } from "react";
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
  role?: string;
}

export default function PatientInformation() {
  const { user, profile } = useAuth();

  const realProfile = profile as ExtendedProfile | null;

  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  const [phone, setPhone] = useState(
    realProfile?.phone || ""
  );

  const [address, setAddress] = useState(
    realProfile?.address || ""
  );

  useEffect(() => {
    setPhone(realProfile?.phone || "");
    setAddress(realProfile?.address || "");
  }, [profile]);

  const fullName =
    realProfile?.fullName ||
    user?.displayName ||
    "Patient";

  const email =
    realProfile?.email ||
    user?.email ||
    "Not available";

  const patientId =
    realProfile?.uid ||
    user?.uid ||
    "Not available";

  const dateOfBirth =
    realProfile?.dateOfBirth || "";

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
      });

      setSaved(true);
      setEditing(false);

      setTimeout(() => {
        setSaved(false);
      }, 3000);
    } catch (err) {
      console.error("Unable to update patient information:", err);
      setError(
        "Unable to save your information. Please try again."
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="patient-page patient-information-page">

      {/* PAGE HEADER */}
      <div className="patient-page-heading information-heading">

        <div>
          <p className="dashboard-eyebrow">
            MY INFORMATION
          </p>

          <h1>Personal Information</h1>

          <p>
            View and update the personal information
            associated with your CareTrack profile.
          </p>
        </div>

        {!editing && (
          <button
            className="patient-primary-button information-edit-button"
            onClick={() => {
              setEditing(true);
              setError("");
            }}
          >
            <Edit3 size={17} />
            Edit Information
          </button>
        )}

      </div>


      {/* SUCCESS */}
      {saved && (
        <div className="patient-success-message information-success">
          <ShieldCheck size={18} />

          <div>
            <strong>Information updated</strong>

            <span>
              Your information has been saved successfully.
            </span>
          </div>
        </div>
      )}


      {/* ERROR */}
      {error && (
        <div
          style={{
            marginBottom: "20px",
            padding: "13px 16px",
            borderRadius: "12px",
            background: "#fff4f4",
            border: "1px solid #f0cccc",
            color: "#a94442",
            fontSize: "13px",
          }}
        >
          {error}
        </div>
      )}


      {/* REAL PROFILE HEADER */}
      <section className="patient-profile-banner">

        <div className="profile-avatar">
          <User size={30} />
        </div>

        <div className="profile-banner-content">

          <p>CARETRACK PATIENT</p>

          <h2>{fullName}</h2>

          <span>
            {email}
          </span>

        </div>

        <div className="profile-verified">
          <BadgeCheck size={17} />
          {realProfile?.role || "patient"}
        </div>

      </section>


      {/* MAIN INFORMATION */}
      <div className="patient-information-grid">

        {/* BASIC INFORMATION */}
        <section className="patient-card information-main-card">

          <div className="patient-card-header information-card-header">

            <div>
              <p className="card-kicker">
                PROFILE DETAILS
              </p>

              <h2>Basic Information</h2>

              <p>
                Information currently stored in your
                CareTrack account.
              </p>
            </div>

          </div>


          <div className="patient-info-list">

            <InfoItem
              icon={<User size={18} />}
              label="Full Name"
              value={fullName}
            />

            <InfoItem
              icon={<Mail size={18} />}
              label="Email Address"
              value={email}
            />


            {/* PHONE */}
            <div className="patient-info-item">

              <div className="info-item-icon">
                <Phone size={18} />
              </div>

              <div className="info-item-content">

                <span>Phone Number</span>

                {editing ? (
                  <input
                    className="patient-input"
                    value={phone}
                    placeholder="Enter phone number"
                    onChange={(e) =>
                      setPhone(e.target.value)
                    }
                  />
                ) : (
                  <strong>
                    {phone || "Not added yet"}
                  </strong>
                )}

              </div>

            </div>


            {/* ADDRESS */}
            <div className="patient-info-item">

              <div className="info-item-icon">
                <MapPin size={18} />
              </div>

              <div className="info-item-content">

                <span>Address</span>

                {editing ? (
                  <input
                    className="patient-input"
                    value={address}
                    placeholder="Enter address"
                    onChange={(e) =>
                      setAddress(e.target.value)
                    }
                  />
                ) : (
                  <strong>
                    {address || "Not added yet"}
                  </strong>
                )}

              </div>

            </div>


            {/* DOB */}
            <InfoItem
              icon={<CalendarDays size={18} />}
              label="Date of Birth"
              value={
                dateOfBirth || "Not added yet"
              }
            />

          </div>


          {/* EDIT ACTIONS */}
          {editing && (
            <div className="patient-form-actions">

              <button
                className="patient-secondary-button"
                onClick={() => {
                  setPhone(realProfile?.phone || "");
                  setAddress(realProfile?.address || "");
                  setEditing(false);
                  setError("");
                }}
                disabled={saving}
              >
                Cancel
              </button>

              <button
                className="patient-primary-button"
                onClick={handleSave}
                disabled={saving}
              >
                <ShieldCheck size={17} />

                {saving
                  ? "Saving..."
                  : "Save Changes"}
              </button>

            </div>
          )}

        </section>


        {/* SIDE COLUMN */}
        <div className="information-side-column">

          {/* REAL FIREBASE UID */}
          <section className="patient-card patient-id-card">

            <div className="information-side-icon">
              <BadgeCheck size={21} />
            </div>

            <p className="card-kicker">
              PATIENT RECORD
            </p>

            <h2>CareTrack Patient ID</h2>

            <p className="information-side-description">
              This is the unique ID of your registered
              CareTrack account.
            </p>

            <div className="patient-id-box">

              <span>Firebase Patient ID</span>

              <strong
                style={{
                  fontSize: "13px",
                  wordBreak: "break-all",
                }}
              >
                {patientId}
              </strong>

            </div>

          </section>


          {/* PRIVACY */}
          <section className="patient-card privacy-card">

            <div className="privacy-card-icon">
              <ShieldCheck size={21} />
            </div>

            <div>

              <p className="card-kicker">
                PRIVACY
              </p>

              <h3>Information Privacy</h3>

              <p>
                Your personal information is stored in
                your CareTrack account and is available
                according to your assigned role.
              </p>

            </div>

          </section>

        </div>

      </div>

    </div>
  );
}


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