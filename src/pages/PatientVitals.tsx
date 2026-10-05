import { useEffect, useState } from "react";
import {
  Activity,
  HeartPulse,
  Thermometer,
  Droplets,
  Clock3,
  Gauge,
  UserRound,
} from "lucide-react";

import { get, ref } from "firebase/database";
import { useAuth } from "../context/AuthContext";
import { db } from "../lib/firebase";

import "../patient-pages.css";

type PatientMonitoring = {
  bloodPressure?: string;
  heartRate?: string | number;
  temperature?: string | number;
  oxygenLevel?: string | number;
  severity?: string;
  updatedAt?: number | string;
  updatedBy?: string;
};

export default function PatientVitals() {
  const { user } = useAuth();

  const [vitals, setVitals] = useState<PatientMonitoring | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadVitals = async () => {
      if (!user?.uid) {
        setLoading(false);
        return;
      }

      try {
        const snapshot = await get(
          ref(db, `patientMonitoring/${user.uid}`)
        );

        if (snapshot.exists()) {
          setVitals(snapshot.val());
        } else {
          setVitals(null);
        }
      } catch (error) {
        console.error("Error loading patient vitals:", error);
        setVitals(null);
      } finally {
        setLoading(false);
      }
    };

    loadVitals();
  }, [user?.uid]);

  const formatUpdatedTime = (value?: number | string) => {
    if (!value) return "Not available";

    const date = new Date(Number(value));

    if (Number.isNaN(date.getTime())) {
      return "Not available";
    }

    return date.toLocaleString();
  };

  if (loading) {
    return (
      <div className="patient-page">
        <div className="patient-page-heading">
          <h1>My Vitals</h1>
          <p>Loading your latest vital information...</p>
        </div>

        <div className="patient-inner-card">
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="patient-page">
      <div className="patient-page-heading">
        <h1>My Vitals</h1>
        <p>
          View the latest vital measurements recorded by your healthcare team.
        </p>
      </div>

      {!vitals ? (
        <div className="patient-inner-card">
          <div className="patient-card-title">
            <Activity size={20} color="#006ee6" />
            No Vital Records Yet
          </div>

          <p className="patient-card-description">
            Your nurse has not recorded any vital measurements yet.
            Your latest readings will appear here after they are recorded.
          </p>
        </div>
      ) : (
        <>
          <div
            className="patient-inner-card"
            style={{
              marginBottom: "20px",
              background:
                "linear-gradient(135deg, rgba(21,154,156,0.08), rgba(21,154,156,0.02))",
            }}
          >
            <div className="patient-card-title">
              <Activity size={20} color="#006ee6" />
              Latest Vital Information
            </div>

            <p className="patient-card-description">
              These measurements were recorded by your healthcare team.
            </p>

            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fit, minmax(190px, 1fr))",
                gap: "16px",
                marginTop: "20px",
              }}
            >
              {/* Blood Pressure */}
              <div
                style={{
                  border: "1px solid #e5e7eb",
                  borderRadius: "14px",
                  padding: "18px",
                  background: "#ffffff",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    marginBottom: "12px",
                  }}
                >
                  <Gauge size={20} color="#006ee6" />
                  <strong>Blood Pressure</strong>
                </div>

                <div
                  style={{
                    fontSize: "25px",
                    fontWeight: 700,
                  }}
                >
                  {vitals.bloodPressure || "Not recorded"}
                </div>

                <div
                  style={{
                    marginTop: "5px",
                    color: "#6b7280",
                    fontSize: "13px",
                  }}
                >
                  mmHg
                </div>
              </div>

              {/* Heart Rate */}
              <div
                style={{
                  border: "1px solid #e5e7eb",
                  borderRadius: "14px",
                  padding: "18px",
                  background: "#ffffff",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    marginBottom: "12px",
                  }}
                >
                  <HeartPulse size={20} color="#006ee6" />
                  <strong>Heart Rate</strong>
                </div>

                <div
                  style={{
                    fontSize: "25px",
                    fontWeight: 700,
                  }}
                >
                  {vitals.heartRate ?? "Not recorded"}
                </div>

                <div
                  style={{
                    marginTop: "5px",
                    color: "#6b7280",
                    fontSize: "13px",
                  }}
                >
                  BPM
                </div>
              </div>

              {/* Temperature */}
              <div
                style={{
                  border: "1px solid #e5e7eb",
                  borderRadius: "14px",
                  padding: "18px",
                  background: "#ffffff",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    marginBottom: "12px",
                  }}
                >
                  <Thermometer size={20} color="#006ee6" />
                  <strong>Temperature</strong>
                </div>

                <div
                  style={{
                    fontSize: "25px",
                    fontWeight: 700,
                  }}
                >
                  {vitals.temperature ?? "Not recorded"}
                </div>

                <div
                  style={{
                    marginTop: "5px",
                    color: "#6b7280",
                    fontSize: "13px",
                  }}
                >
                  °C
                </div>
              </div>

              {/* Oxygen */}
              <div
                style={{
                  border: "1px solid #e5e7eb",
                  borderRadius: "14px",
                  padding: "18px",
                  background: "#ffffff",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    marginBottom: "12px",
                  }}
                >
                  <Droplets size={20} color="#006ee6" />
                  <strong>Oxygen Level</strong>
                </div>

                <div
                  style={{
                    fontSize: "25px",
                    fontWeight: 700,
                  }}
                >
                  {vitals.oxygenLevel ?? "Not recorded"}
                </div>

                <div
                  style={{
                    marginTop: "5px",
                    color: "#6b7280",
                    fontSize: "13px",
                  }}
                >
                  %
                </div>
              </div>
            </div>
          </div>

          {/* Update Information */}
          <div className="daily-report-layout">
            <div className="patient-inner-card">
              <div className="patient-card-title">
                <Clock3 size={20} color="#006ee6" />
                Record Information
              </div>

              <div className="report-help-item">
                <div className="report-help-icon">
                  <Clock3 size={16} />
                </div>

                <div>
                  <h4>Last Updated</h4>
                  <p>
                    {formatUpdatedTime(vitals.updatedAt)}
                  </p>
                </div>
              </div>

              <div className="report-help-item">
                <div className="report-help-icon">
                  <UserRound size={16} />
                </div>

                <div>
                  <h4>Recorded By</h4>
                  <p>
                    {vitals.updatedBy || "Healthcare team"}
                  </p>
                </div>
              </div>
            </div>

            <div className="patient-inner-card report-help">
              <div className="patient-card-title">
                About Your Vitals
              </div>

              <p className="patient-card-description">
                Your healthcare team records your vital measurements
                during your care. This page displays the latest
                information available in your CareTrack record.
              </p>

              <div className="report-help-item">
                <div className="report-help-icon">
                  <Activity size={16} />
                </div>

                <div>
                  <h4>CareTrack Monitoring</h4>
                  <p>
                    New measurements will appear here when your
                    healthcare team updates your record.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}