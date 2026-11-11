import { useEffect, useRef, useState } from "react";
import { CheckCircle2, Mic, MessageSquareText } from "lucide-react";
import { get, push, ref, set } from "firebase/database";

import { useAuth } from "../context/AuthContext";
import { db } from "../lib/firebase";
import { createNotification } from "../services/notifications";

import "../patient-pages.css";

declare global {
  interface Window {
    SpeechRecognition?: new () => SpeechRecognitionLike;
    webkitSpeechRecognition?: new () => SpeechRecognitionLike;
  }
}

interface SpeechRecognitionLike {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((event: any) => void) | null;
  onerror: ((event: any) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
}

export default function PatientVoiceResponses() {
  const { user, profile } = useAuth();
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);

  const [transcript, setTranscript] = useState("");
  const [listening, setListening] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {
          // no-op
        }
      }
    };
  }, []);

  const stopListening = () => {
    setListening(false);
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // no-op
      }
      recognitionRef.current = null;
    }
  };

  const startListening = () => {
    if (!user?.uid) {
      setError("Please sign in again to use voice responses.");
      return;
    }

    const SpeechRecognitionCtor =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognitionCtor) {
      setError(
        "Speech recognition is not supported in this browser. Please use Chrome or Edge and allow microphone access."
      );
      return;
    }

    setError("");
    setSuccess(false);

    const recognition = new SpeechRecognitionCtor();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onresult = (event: any) => {
      let finalText = "";
      for (let index = event.resultIndex; index < event.results.length; index += 1) {
        const text = event.results[index][0]?.transcript || "";
        if (event.results[index].isFinal) {
          finalText += `${text} `;
        }
      }

      if (finalText.trim()) {
        setTranscript((current) => {
          const merged = `${current.trim()} ${finalText.trim()}`.trim();
          return merged;
        });
      }
    };

    recognition.onerror = (event: any) => {
      const message =
        event?.error === "not-allowed" || event?.error === "service-not-allowed"
          ? "Microphone permission was denied. Please allow microphone access and try again."
          : event?.error === "no-speech"
            ? "No speech was detected. Please try again."
            : "Speech recognition is currently unavailable. Please try again.";

      setError(message);
      setListening(false);
    };

    recognition.onend = () => {
      if (recognitionRef.current) {
        setListening(false);
      }
    };

    recognitionRef.current = recognition;
    setListening(true);
    try {
      recognition.start();
    } catch {
      setError("The microphone is already in use. Please try again after a moment.");
      setListening(false);
    }
  };

  const handleSubmit = async () => {
    const trimmed = transcript.trim();
    if (!trimmed) {
      setError("Please speak or type a response before submitting.");
      return;
    }

    if (!user?.uid) {
      setError("Please sign in again before submitting your response.");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      const responseRef = push(ref(db, `patientVoiceResponses/${user.uid}`));
      if (!responseRef.key) {
        throw new Error("Could not create the voice response record.");
      }

      const responseId = responseRef.key;
      const payload = {
        patientId: user.uid,
        responseId,
        text: trimmed,
        transcript: trimmed,
        createdAt: Date.now(),
        submittedAt: Date.now(),
        status: "submitted",
        source: "browser-speech-recognition",
        metadata: {
          language: "en-US",
          browserSupport: "speech-recognition",
          patientName: profile?.fullName || user.displayName || "Patient",
        },
      };

      await set(responseRef, payload);

      const assignmentSnapshot = await get(ref(db, `patientDoctors/${user.uid}`));
      const assignment = assignmentSnapshot.val() as { doctorUid?: string } | string | null;
      const doctorUid =
        profile?.assignedDoctorId ??
        (typeof assignment === "string" ? assignment : assignment?.doctorUid);

      if (doctorUid) {
        await createNotification(
          doctorUid,
          "New patient voice response",
          `${profile?.fullName || user.displayName || "Your patient"} submitted a voice response for review.`,
          "voice_response",
          responseId,
          {
            patientUid: user.uid,
          }
        );
      }

      setSuccess(true);
      setTranscript("");
      stopListening();
    } catch (submitError) {
      console.error("Unable to save patient voice response:", submitError);
      setError("Unable to save your voice response. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="patient-page">
      <div className="patient-page-heading">
        <h1>Voice Responses</h1>
        <p>Use your microphone to speak a response and review the text before submitting it.</p>
      </div>

      <div className="voice-response-layout">
        <div className="patient-inner-card">
          <div className="patient-card-title">
            <Mic size={20} color="#006ee6" />
            Record Your Response
          </div>

          <p className="patient-card-description">
            The browser will convert your speech to editable text. Review it before sending it to your care team.
          </p>

          <div className={`voice-recorder ${listening ? "recording" : ""}`}>
            <div className="voice-mic-circle">
              <Mic size={32} />
            </div>

            <h3>{listening ? "Listening in progress" : "Ready to record"}</h3>
            <p>
              {listening
                ? "Speak clearly so the transcript can be captured accurately."
                : "Press the button below to start dictation."}
            </p>

            <button
              type="button"
              className={listening ? "voice-stop-button" : "voice-record-button"}
              onClick={listening ? stopListening : startListening}
            >
              <Mic size={16} />
              {listening ? "Stop Listening" : "Start Listening"}
            </button>
          </div>

          {error && (
            <div className="voice-submit-note" style={{ color: "#b42318", background: "#fef3f2", borderColor: "#fecdca" }}>
              {error}
            </div>
          )}
        </div>

        <div className="patient-inner-card">
          <div className="patient-card-title">
            <MessageSquareText size={19} color="#006ee6" />
            Editable Transcript
          </div>

          <p className="patient-card-description">
            Review or edit the generated transcript before submitting it.
          </p>

          <textarea
            className="report-textarea voice-transcript"
            value={transcript}
            onChange={(event) => setTranscript(event.target.value)}
            placeholder="Your converted text will appear here..."
          />

          {success && (
            <div className="voice-submit-note">
              <CheckCircle2 size={16} />
              Your voice response was saved successfully.
            </div>
          )}

          <button
            type="button"
            className="report-save-button"
            disabled={isSubmitting || !transcript.trim()}
            onClick={handleSubmit}
          >
            {isSubmitting ? "Submitting..." : "Submit Response"}
          </button>
        </div>
      </div>
    </div>
  );
}