import { useEffect, useState } from "react";
import { CalendarDays, CheckCircle2, Mic, User } from "lucide-react";
import { get, ref } from "firebase/database";

import { useAuth } from "../../context/AuthContext";
import { db } from "../../lib/firebase";

import "../../patient-pages.css";

type VoiceResponse = {
  id: string;
  patientId: string;
  patientName: string;
  text: string;
  createdAt: number;
  status?: string;
};

export default function DoctorVoiceResponses() {
  const { user } = useAuth();
  const [responses, setResponses] = useState<VoiceResponse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDoctorVoiceResponses() {
      if (!user?.uid) {
        setResponses([]);
        setLoading(false);
        return;
      }

      try {
        const assignedPatientsSnapshot = await get(ref(db, `doctorPatients/${user.uid}`));
        const assignedPatients = assignedPatientsSnapshot.val() as Record<string, boolean> | null;
        const patientIds = Object.entries(assignedPatients ?? {})
          .filter(([, assigned]) => assigned === true)
          .map(([patientUid]) => patientUid);

        if (patientIds.length === 0) {
          setResponses([]);
          return;
        }

        const patientResponseEntries = await Promise.all(
          patientIds.map(async (patientId) => {
            const [patientSnapshot, responseSnapshot] = await Promise.all([
              get(ref(db, `users/${patientId}`)),
              get(ref(db, `patientVoiceResponses/${patientId}`)),
            ]);

            const patient = patientSnapshot.val() as { fullName?: string } | null;
            const responseList = responseSnapshot.val() as Record<string, any> | null;
            if (!responseList) {
              return [] as VoiceResponse[];
            }

            return Object.entries(responseList)
              .filter(([, value]) => value && typeof value === "object")
              .map(([responseId, value]) => ({
                id: value.responseId || responseId,
                patientId,
                patientName: patient?.fullName || "Patient",
                text: value.text || value.transcript || "",
                createdAt: Number(value.createdAt ?? value.submittedAt ?? 0),
                status: value.status || "submitted",
              }));
          })
        );

        const allResponses = patientResponseEntries.flat().sort((a, b) => b.createdAt - a.createdAt);
        setResponses(allResponses);
      } catch (error) {
        console.error("Failed to load patient voice responses:", error);
        setResponses([]);
      } finally {
        setLoading(false);
      }
    }

    void loadDoctorVoiceResponses();
  }, [user?.uid]);

  return (
    <div className="patient-page">
      <div className="patient-page-heading">
        <h1>Voice Responses</h1>
        <p>Review genuine voice responses submitted by your assigned patients.</p>
      </div>

      <div className="voice-response-layout">
        {loading ? (
          <div className="patient-inner-card">Loading voice responses...</div>
        ) : responses.length === 0 ? (
          <div className="patient-inner-card">
            <p>No patient voice responses are currently available.</p>
          </div>
        ) : (
          responses.map((response) => (
            <div className="patient-inner-card" key={response.id}>
              <div className="patient-card-title">
                <User size={20} color="#006ee6" />
                <span>Patient Voice Response</span>
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "16px",
                  marginTop: "16px",
                  marginBottom: "20px",
                  flexWrap: "wrap",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <div
                    style={{
                      width: "44px",
                      height: "44px",
                      borderRadius: "50%",
                      background: "#eef6ff",
                      color: "#006ee6",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <User size={21} />
                  </div>

                  <div>
                    <strong style={{ display: "block", fontSize: "16px", color: "#243447", marginBottom: "3px" }}>
                      {response.patientName}
                    </strong>
                    <span style={{ fontSize: "13px", color: "#718096" }}>Assigned patient</span>
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "#718096", fontSize: "13px" }}>
                  <CalendarDays size={15} />
                  {response.createdAt ? new Date(response.createdAt).toLocaleString() : "Recently"}
                </div>
              </div>

              <div
                style={{
                  background: "#f7fafc",
                  borderRadius: "10px",
                  padding: "15px",
                  marginBottom: "18px",
                  border: "1px solid #edf2f7",
                }}
              >
                <div
                  style={{
                    fontSize: "12px",
                    fontWeight: 700,
                    color: "#718096",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                    marginBottom: "6px",
                  }}
                >
                  Response
                </div>

                <p style={{ margin: 0, color: "#2d3748", fontSize: "14px", lineHeight: 1.6 }}>
                  {response.text || "No transcript available."}
                </p>
              </div>

              <div className="voice-review">
                <div className="voice-review-header">
                  <div style={{ display: "flex", alignItems: "center", gap: "11px" }}>
                    <div
                      style={{
                        width: "40px",
                        height: "40px",
                        borderRadius: "10px",
                        background: "#eef6ff",
                        color: "#006ee6",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Mic size={20} />
                    </div>

                    <div>
                      <strong>Patient Recording</strong>
                      <span>Voice response submitted by patient</span>
                    </div>
                  </div>
                </div>
              </div>

              <div style={{ marginTop: "18px", paddingTop: "16px", borderTop: "1px solid #edf2f7", display: "flex", alignItems: "center", gap: "8px", color: "#006ee6", fontSize: "13px", fontWeight: 600 }}>
                <CheckCircle2 size={16} />
                {response.status === "submitted" ? "Patient response available for review" : "Response status: " + response.status}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
