import { useState } from "react";
import {
  Mic,
  Square,
  Play,
  Pause,
  CheckCircle2,
  MessageSquareText,
} from "lucide-react";

import "../patient-pages.css";

export default function PatientVoiceResponses() {
  const [recording, setRecording] = useState(false);
  const [recorded, setRecorded] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [transcript, setTranscript] = useState("");

  const startRecording = () => {
    setRecording(true);
    setRecorded(false);
  };

  const stopRecording = () => {
    setRecording(false);
    setRecorded(true);

    setTranscript(
      "Sample transcription will appear here after voice processing."
    );
  };

  const togglePlayback = () => {
    setPlaying((current) => !current);
  };

  return (
    <div className="patient-page">
      <div className="patient-page-heading">
        <h1>Voice Responses</h1>
        <p>
          Record a voice response to a question from your care team.
        </p>
      </div>

      <div className="voice-response-layout">
        <div className="patient-inner-card">
          <div className="patient-card-title">
            <Mic size={20} color="#159a9c" />
            Record Your Response
          </div>

          <p className="patient-card-description">
            Voice responses can help patients provide information
            without typing a long response.
          </p>

          <div
            className={`voice-recorder ${
              recording ? "recording" : ""
            }`}
          >
            <div className="voice-mic-circle">
              <Mic size={32} />
            </div>

            {recording ? (
              <>
                <h3>Recording in progress</h3>

                <p>
                  Speak clearly and provide your response.
                </p>

                <button
                  type="button"
                  className="voice-stop-button"
                  onClick={stopRecording}
                >
                  <Square size={15} />
                  Stop Recording
                </button>
              </>
            ) : (
              <>
                <h3>
                  {recorded
                    ? "Recording Completed"
                    : "Ready to Record"}
                </h3>

                <p>
                  {recorded
                    ? "You can review your recording below."
                    : "Press the button to start your voice response."}
                </p>

                {!recorded && (
                  <button
                    type="button"
                    className="voice-record-button"
                    onClick={startRecording}
                  >
                    <Mic size={16} />
                    Start Recording
                  </button>
                )}
              </>
            )}
          </div>

          {recorded && (
            <div className="voice-review">
              <div className="voice-review-header">
                <div>
                  <strong>Your Recording</strong>
                  <span>Voice response</span>
                </div>

                <button
                  type="button"
                  className="voice-play-button"
                  onClick={togglePlayback}
                >
                  {playing ? (
                    <Pause size={16} />
                  ) : (
                    <Play size={16} />
                  )}

                  {playing ? "Pause" : "Play"}
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="patient-inner-card">
          <div className="patient-card-title">
            <MessageSquareText size={19} color="#159a9c" />
            Editable Transcript
          </div>

          <p className="patient-card-description">
            A transcript can be reviewed and edited before it is
            submitted.
          </p>

          <textarea
            className="report-textarea voice-transcript"
            value={transcript}
            onChange={(e) => setTranscript(e.target.value)}
            placeholder="Your converted text will appear here..."
          />

          {recorded && (
            <div className="voice-submit-note">
              <CheckCircle2 size={16} />
              Review the transcript before submitting it to your care
              team.
            </div>
          )}

          <button
            type="button"
            className="report-save-button"
            disabled={!recorded}
          >
            Submit Response
          </button>
        </div>
      </div>
    </div>
  );
}