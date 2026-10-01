import { useState } from "react";
import {
  Mic,
  Play,
  Pause,
  CheckCircle2,
  MessageSquareText,
  User,
  CalendarDays,
} from "lucide-react";

import "../../patient-pages.css";

type VoiceResponse = {
  id: number;
  patient: string;
  question: string;
  transcript: string;
  date: string;
};

export default function DoctorVoiceResponses() {
  const [playing, setPlaying] = useState<number | null>(null);

  const [transcripts, setTranscripts] = useState<
    Record<number, string>
  >({
    1: "I am feeling better today. My pain has reduced compared with yesterday.",
    2: "I have noticed some improvement since yesterday.",
  });

  const responses: VoiceResponse[] = [
    {
      id: 1,
      patient: "Sarah Ahmed",
      question: "How are you feeling today?",
      transcript:
        "I am feeling better today. My pain has reduced compared with yesterday.",
      date: "Today, 9:30 AM",
    },
    {
      id: 2,
      patient: "Ali Raza",
      question: "Have you noticed any changes in your symptoms?",
      transcript:
        "I have noticed some improvement since yesterday.",
      date: "Yesterday, 4:15 PM",
    },
  ];

  const togglePlayback = (id: number) => {
    setPlaying((current) => (current === id ? null : id));
  };

  const updateTranscript = (
    id: number,
    value: string
  ) => {
    setTranscripts((current) => ({
      ...current,
      [id]: value,
    }));
  };

  return (
    <div className="patient-page">
      {/* =========================
          PAGE HEADING
      ========================== */}
      <div className="patient-page-heading">
        <h1>Voice Responses</h1>

        <p>
          Review patient voice responses and edit their
          converted text transcripts.
        </p>
      </div>

      {/* =========================
          RESPONSE LIST
      ========================== */}
      <div className="voice-response-layout">
        {responses.map((response) => (
          <div
            className="patient-inner-card"
            key={response.id}
          >
            {/* =========================
                PATIENT INFORMATION
            ========================== */}
            <div className="patient-card-title">
              <User size={20} color="#159a9c" />

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
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                }}
              >
                <div
                  style={{
                    width: "44px",
                    height: "44px",
                    borderRadius: "50%",
                    background: "#e8f7f7",
                    color: "#159a9c",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <User size={21} />
                </div>

                <div>
                  <strong
                    style={{
                      display: "block",
                      fontSize: "16px",
                      color: "#243447",
                      marginBottom: "3px",
                    }}
                  >
                    {response.patient}
                  </strong>

                  <span
                    style={{
                      fontSize: "13px",
                      color: "#718096",
                    }}
                  >
                    Patient
                  </span>
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  color: "#718096",
                  fontSize: "13px",
                }}
              >
                <CalendarDays size={15} />
                {response.date}
              </div>
            </div>

            {/* =========================
                DOCTOR QUESTION
            ========================== */}
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
                Doctor Question
              </div>

              <p
                style={{
                  margin: 0,
                  color: "#2d3748",
                  fontSize: "14px",
                  lineHeight: 1.6,
                }}
              >
                {response.question}
              </p>
            </div>

            {/* =========================
                VOICE RECORDING
            ========================== */}
            <div className="voice-review">
              <div className="voice-review-header">
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "11px",
                  }}
                >
                  <div
                    style={{
                      width: "40px",
                      height: "40px",
                      borderRadius: "10px",
                      background: "#e8f7f7",
                      color: "#159a9c",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Mic size={20} />
                  </div>

                  <div>
                    <strong>Patient Recording</strong>

                    <span>
                      Voice response from patient
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  className="voice-play-button"
                  onClick={() =>
                    togglePlayback(response.id)
                  }
                >
                  {playing === response.id ? (
                    <Pause size={16} />
                  ) : (
                    <Play size={16} />
                  )}

                  {playing === response.id
                    ? "Pause"
                    : "Play"}
                </button>
              </div>
            </div>

            {/* =========================
                EDITABLE TRANSCRIPT
            ========================== */}
            <div
              style={{
                marginTop: "22px",
              }}
            >
              <div className="patient-card-title">
                <MessageSquareText
                  size={19}
                  color="#159a9c"
                />

                <span>Editable Transcript</span>
              </div>

              <p className="patient-card-description">
                Review the converted patient response and
                make corrections if needed.
              </p>

              <textarea
                className="report-textarea voice-transcript"
                value={
                  transcripts[response.id] ??
                  response.transcript
                }
                onChange={(e) =>
                  updateTranscript(
                    response.id,
                    e.target.value
                  )
                }
                placeholder="Patient voice transcript will appear here..."
              />

              <div className="voice-submit-note">
                <CheckCircle2 size={16} />

                Transcript can be reviewed and edited by
                the doctor.
              </div>
            </div>

            {/* =========================
                REVIEW STATUS
            ========================== */}
            <div
              style={{
                marginTop: "18px",
                paddingTop: "16px",
                borderTop: "1px solid #edf2f7",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                color: "#159a9c",
                fontSize: "13px",
                fontWeight: 600,
              }}
            >
              <CheckCircle2 size={16} />

              Patient response available for review
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}