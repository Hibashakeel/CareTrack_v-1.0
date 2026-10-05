import { useEffect, useRef, useState } from "react";
import {
  MessageCircleQuestion,
  Clock3,
  CheckCircle2,
  Send,
  Mic,
  Square,
  Play,
  Pause,
  Trash2,
  Volume2,
} from "lucide-react";

import {
  get,
  onValue,
  ref,
  set,
} from "firebase/database";

import { useAuth } from "../context/AuthContext";
import { db } from "../lib/firebase";

import "../patient-pages.css";

type Question = {
  id: string;
  question: string;
  doctor: string;
  doctorId?: string;
  date: string;
  status: "Pending" | "Answered";

  // Patient response
  answer?: string;
  transcript?: string;
  voiceUrl?: string;
  voiceFileName?: string;
  responseType?: "text" | "voice" | "text-and-voice";
  answeredAt?: string;

  // Doctor reply
  doctorReply?: string;
  doctorReplyTranscript?: string;
  doctorReplyVoiceUrl?: string;
  doctorReplyVoiceFileName?: string;
  doctorReplyType?:
    | "text"
    | "voice"
    | "text-and-voice"
    | "";
  doctorReplyAt?: string;
  doctorReplyBy?: string;
};

export default function PatientQuestions() {
  const { user } = useAuth();

  const [questions, setQuestions] = useState<Question[]>(
    []
  );

  const [loading, setLoading] = useState(true);

  const [answer, setAnswer] = useState("");

  const [activeQuestion, setActiveQuestion] =
    useState<string | null>(null);

  const [saving, setSaving] = useState(false);

  /* =====================================================
     VOICE STATE
  ===================================================== */

  const [recording, setRecording] = useState(false);

  const [recordingQuestion, setRecordingQuestion] =
    useState<string | null>(null);

  const [audioBlob, setAudioBlob] =
    useState<Blob | null>(null);

  const [audioUrl, setAudioUrl] =
    useState<string | null>(null);

  const [transcript, setTranscript] =
    useState("");

  const [isPlaying, setIsPlaying] =
    useState(false);

  const [voiceError, setVoiceError] =
    useState("");

  const mediaRecorderRef =
    useRef<MediaRecorder | null>(null);

  const mediaStreamRef =
    useRef<MediaStream | null>(null);

  const audioChunksRef =
    useRef<Blob[]>([]);

  const audioRef =
    useRef<HTMLAudioElement | null>(null);

  const recognitionRef =
    useRef<any>(null);

  /* =====================================================
     LOAD QUESTIONS + REAL-TIME DOCTOR REPLIES
  ===================================================== */

  useEffect(() => {
    if (!user?.uid) {
      setQuestions([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    const questionsRef = ref(
      db,
      `patientQuestions/${user.uid}`
    );

    const unsubscribe = onValue(
      questionsRef,
      (snapshot) => {
        try {
          if (!snapshot.exists()) {
            setQuestions([]);
            setLoading(false);
            return;
          }

          const data = snapshot.val();

          const loadedQuestions: Question[] =
            Object.entries(data).map(
              ([id, value]: [string, any]) => ({
                id,

                question:
                  value.question || "",

                doctor:
                  value.doctor || "Care Team",

                doctorId:
                  value.doctorId || "",

                date:
                  value.date ||
                  value.createdAt ||
                  "",

                status:
                  value.status === "Answered"
                    ? "Answered"
                    : "Pending",

                // Patient response
                answer:
                  value.answer || "",

                transcript:
                  value.transcript || "",

                voiceUrl:
                  value.voiceUrl || "",

                voiceFileName:
                  value.voiceFileName || "",

                responseType:
                  value.responseType ||
                  "text",

                answeredAt:
                  value.answeredAt || "",

                // Doctor reply
                doctorReply:
                  value.doctorReply || "",

                doctorReplyTranscript:
                  value.doctorReplyTranscript ||
                  "",

                doctorReplyVoiceUrl:
                  value.doctorReplyVoiceUrl ||
                  "",

                doctorReplyVoiceFileName:
                  value.doctorReplyVoiceFileName ||
                  "",

                doctorReplyType:
                  value.doctorReplyType || "",

                doctorReplyAt:
                  value.doctorReplyAt || "",

                doctorReplyBy:
                  value.doctorReplyBy || "",
              })
            );

          loadedQuestions.sort((a, b) => {
            const dateA =
              new Date(a.date).getTime();

            const dateB =
              new Date(b.date).getTime();

            return dateB - dateA;
          });

          setQuestions(loadedQuestions);
        } catch (error) {
          console.error(
            "Error loading questions:",
            error
          );

          setQuestions([]);
        } finally {
          setLoading(false);
        }
      },
      (error) => {
        console.error(
          "Realtime question listener error:",
          error
        );

        setQuestions([]);
        setLoading(false);
      }
    );

    return () => {
      unsubscribe();
    };
  }, [user?.uid]);

  /* =====================================================
     START RECORDING
  ===================================================== */

  const startRecording = async (
    questionId: string
  ) => {
    try {
      setVoiceError("");

      if (
        !navigator.mediaDevices ||
        !navigator.mediaDevices.getUserMedia
      ) {
        setVoiceError(
          "Your browser does not support microphone recording."
        );
        return;
      }

      if (
        typeof MediaRecorder ===
        "undefined"
      ) {
        setVoiceError(
          "Voice recording is not supported by this browser."
        );
        return;
      }

      const stream =
        await navigator.mediaDevices.getUserMedia(
          {
            audio: true,
          }
        );

      mediaStreamRef.current = stream;

      audioChunksRef.current = [];

      let mimeType = "";

      if (
        MediaRecorder.isTypeSupported(
          "audio/webm;codecs=opus"
        )
      ) {
        mimeType =
          "audio/webm;codecs=opus";
      } else if (
        MediaRecorder.isTypeSupported(
          "audio/webm"
        )
      ) {
        mimeType = "audio/webm";
      }

      const recorder = mimeType
        ? new MediaRecorder(stream, {
            mimeType,
          })
        : new MediaRecorder(stream);

      mediaRecorderRef.current =
        recorder;

      recorder.ondataavailable = (
        event
      ) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(
            event.data
          );
        }
      };

      recorder.onstop = () => {
        const blob =
          new Blob(
            audioChunksRef.current,
            {
              type:
                recorder.mimeType ||
                "audio/webm",
            }
          );

        const url =
          URL.createObjectURL(blob);

        setAudioBlob(blob);
        setAudioUrl(url);

        if (
          mediaStreamRef.current
        ) {
          mediaStreamRef.current
            .getTracks()
            .forEach((track) =>
              track.stop()
            );
        }

        mediaStreamRef.current =
          null;
      };

      recorder.onerror = () => {
        setVoiceError(
          "There was a problem while recording your voice."
        );

        if (
          mediaStreamRef.current
        ) {
          mediaStreamRef.current
            .getTracks()
            .forEach((track) =>
              track.stop()
            );

          mediaStreamRef.current =
            null;
        }

        setRecording(false);
        setRecordingQuestion(null);
      };

      recorder.start();

      setRecording(true);
      setRecordingQuestion(
        questionId
      );

      /* =================================================
         SPEECH RECOGNITION
      ================================================= */

      const SpeechRecognition =
        (window as any).SpeechRecognition ||
        (window as any)
          .webkitSpeechRecognition;

      if (SpeechRecognition) {
        const recognition =
          new SpeechRecognition();

        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = "en-US";

        let finalTranscript =
          "";

        recognition.onresult = (
          event: any
        ) => {
          let interim = "";

          for (
            let i =
              event.resultIndex;
            i < event.results.length;
            i++
          ) {
            const text =
              event.results[i][0]
                ?.transcript || "";

            if (
              event.results[i].isFinal
            ) {
              finalTranscript +=
                text + " ";
            } else {
              interim += text;
            }
          }

          setTranscript(
            (
              finalTranscript +
              interim
            ).trim()
          );
        };

        recognition.onerror = (
          event: any
        ) => {
          console.warn(
            "Speech recognition:",
            event.error
          );
        };

        recognition.onend = () => {
          if (
            mediaRecorderRef.current &&
            mediaRecorderRef.current.state ===
              "recording"
          ) {
            try {
              recognition.start();
            } catch {
              // Recognition may already be restarting.
            }
          }
        };

        recognitionRef.current =
          recognition;

        try {
          recognition.start();
        } catch {
          // Ignore recognition startup errors.
        }
      } else {
        setVoiceError(
          "Speech-to-text is not supported in this browser. You can still record your voice."
        );
      }
    } catch (error) {
      console.error(
        "Microphone error:",
        error
      );

      setVoiceError(
        "Microphone permission was not granted. Please allow microphone access and try again."
      );

      setRecording(false);
      setRecordingQuestion(null);
    }
  };

  /* =====================================================
     STOP RECORDING
  ===================================================== */

  const stopRecording = () => {
    try {
      if (
        recognitionRef.current
      ) {
        try {
          recognitionRef.current.stop();
        } catch {
          // Ignore if already stopped.
        }

        recognitionRef.current =
          null;
      }

      if (
        mediaRecorderRef.current &&
        mediaRecorderRef.current.state !==
          "inactive"
      ) {
        mediaRecorderRef.current.stop();
      }

      setRecording(false);
      setRecordingQuestion(null);
    } catch (error) {
      console.error(
        "Error stopping recording:",
        error
      );

      setRecording(false);
      setRecordingQuestion(null);
    }
  };

  /* =====================================================
     CLEAR VOICE
  ===================================================== */

  const clearVoice = () => {
    if (recording) {
      stopRecording();
    }

    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }

    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }

    setAudioBlob(null);
    setAudioUrl(null);
    setTranscript("");
    setVoiceError("");
    setIsPlaying(false);
  };

  /* =====================================================
     PLAY / PAUSE
  ===================================================== */

  const togglePlayback = () => {
    if (!audioUrl) return;

    if (!audioRef.current) {
      audioRef.current =
        new Audio(audioUrl);

      audioRef.current.onended = () => {
        setIsPlaying(false);
      };
    }

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current
        .play()
        .then(() => {
          setIsPlaying(true);
        })
        .catch((error) => {
          console.error(
            "Audio playback error:",
            error
          );
        });
    }
  };

  /* =====================================================
     BLOB -> BASE64 DATA URL
  ===================================================== */

  const blobToDataUrl = (
    blob: Blob
  ): Promise<string> => {
    return new Promise(
      (resolve, reject) => {
        const reader =
          new FileReader();

        reader.onloadend = () => {
          if (
            typeof reader.result ===
            "string"
          ) {
            resolve(
              reader.result
            );
          } else {
            reject(
              new Error(
                "Unable to convert audio."
              )
            );
          }
        };

        reader.onerror = () => {
          reject(
            new Error(
              "Unable to convert audio."
            )
          );
        };

        reader.readAsDataURL(blob);
      }
    );
  };

  /* =====================================================
     SUBMIT ANSWER
  ===================================================== */

  const submitAnswer = async (
    questionId: string
  ) => {
    const cleanAnswer =
      answer.trim();

    const cleanTranscript =
      transcript.trim();

    const hasText =
      cleanAnswer.length > 0;

    const hasVoice =
      !!audioBlob;

    const hasTranscript =
      cleanTranscript.length > 0;

    if (
      !hasText &&
      !hasVoice &&
      !hasTranscript
    ) {
      return;
    }

    if (!user?.uid || saving) {
      return;
    }

    setSaving(true);
    setVoiceError("");

    try {
      const questionRef =
        ref(
          db,
          `patientQuestions/${user.uid}/${questionId}`
        );

      const currentSnapshot =
        await get(questionRef);

      if (!currentSnapshot.exists()) {
        throw new Error(
          "Question no longer exists."
        );
      }

      const currentData =
        currentSnapshot.val();

      let voiceUrl =
        currentData.voiceUrl ||
        "";

      let voiceFileName =
        currentData.voiceFileName ||
        "";

      if (audioBlob) {
        const MAX_AUDIO_BYTES =
          3 * 1024 * 1024;

        if (
          audioBlob.size >
          MAX_AUDIO_BYTES
        ) {
          throw new Error(
            "Voice recording is too large. Please record a shorter response."
          );
        }

        voiceUrl =
          await blobToDataUrl(
            audioBlob
          );

        voiceFileName =
          `patient-${user.uid}-${questionId}-${Date.now()}.webm`;
      }

      const answeredAt =
        new Date().toISOString();

      let responseType:
        | "text"
        | "voice"
        | "text-and-voice";

      if (
        hasText &&
        hasVoice
      ) {
        responseType =
          "text-and-voice";
      } else if (hasVoice) {
        responseType =
          "voice";
      } else {
        responseType =
          "text";
      }

      const finalAnswer =
        hasText
          ? cleanAnswer
          : cleanTranscript;

      await set(questionRef, {
        ...currentData,

        answer:
          finalAnswer,

        transcript:
          cleanTranscript,

        voiceUrl,

        voiceFileName,

        responseType,

        status:
          "Answered",

        answeredAt,
      });

      setAnswer("");
      setTranscript("");

      clearVoice();

      setActiveQuestion(null);
    } catch (error) {
      console.error(
        "Error submitting answer:",
        error
      );

      const message =
        error instanceof Error
          ? error.message
          : "";

      if (
        message.includes(
          "Voice recording is too large"
        )
      ) {
        alert(message);
      } else {
        alert(
          "Unable to submit your response. Please try again."
        );
      }
    } finally {
      setSaving(false);
    }
  };

  /* =====================================================
     CLEANUP
  ===================================================== */

  useEffect(() => {
    return () => {
      if (
        mediaStreamRef.current
      ) {
        mediaStreamRef.current
          .getTracks()
          .forEach((track) =>
            track.stop()
          );
      }

      if (audioUrl) {
        URL.revokeObjectURL(
          audioUrl
        );
      }

      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }

      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {
          // Ignore cleanup errors.
        }
      }
    };
  }, [audioUrl]);

  /* =====================================================
     UI
  ===================================================== */

  return (
    <div className="patient-page">
      <div className="patient-page-heading">
        <h1>Doctor Questions</h1>

        <p>
          Review questions from your
          care team and provide your
          responses.
        </p>
      </div>

      <div className="patient-inner-card">
        <div className="patient-card-title">
          <MessageCircleQuestion
            size={20}
            color="#006ee6"
          />

          Questions From Your Care
          Team
        </div>

        <p className="patient-card-description">
          Your responses are recorded
          as part of your patient
          information.
        </p>

        {loading ? (
          <div className="question-empty-state">
            Loading questions...
          </div>
        ) : questions.length ===
          0 ? (
          <div className="question-empty-state">
            <MessageCircleQuestion
              size={32}
            />

            <h3>
              No questions yet
            </h3>

            <p>
              Your doctor has not sent
              any questions yet.
            </p>
          </div>
        ) : (
          <div className="question-list">
            {questions.map(
              (item) => {
                const hasDoctorReply =
                  !!(
                    item.doctorReply?.trim() ||
                    item.doctorReplyTranscript?.trim() ||
                    item.doctorReplyVoiceUrl?.trim()
                  );

                return (
                  <div
                    className="question-item"
                    key={item.id}
                  >
                    {/* QUESTION HEADER */}

                    <div className="question-item-header">
                      <div className="question-icon">
                        <MessageCircleQuestion
                          size={18}
                        />
                      </div>

                      <div className="question-meta">
                        <span>
                          {item.doctor}
                        </span>

                        <small>
                          <Clock3
                            size={12}
                          />

                          {item.date
                            ? new Date(
                                item.date
                              ).toLocaleString()
                            : "Recently"}
                        </small>
                      </div>

                      <span
                        className={`question-status ${
                          item.status ===
                          "Answered"
                            ? "answered"
                            : "pending"
                        }`}
                      >
                        {item.status ===
                        "Answered" ? (
                          <CheckCircle2
                            size={13}
                          />
                        ) : (
                          <Clock3
                            size={13}
                          />
                        )}

                        {item.status}
                      </span>
                    </div>

                    {/* QUESTION */}

                    <p className="question-text">
                      {item.question}
                    </p>

                    {/* =================================================
                       PATIENT'S EXISTING RESPONSE
                    ================================================= */}

                    {item.status ===
                      "Answered" && (
                      <div className="question-existing-answer">
                        <strong>
                          Your Response
                        </strong>

                        {item.answer && (
                          <p>
                            {item.answer}
                          </p>
                        )}

                        {item.transcript && (
                          <div
                            style={{
                              marginTop:
                                "10px",
                            }}
                          >
                            <strong>
                              Voice Transcript
                            </strong>

                            <p>
                              {
                                item.transcript
                              }
                            </p>
                          </div>
                        )}

                        {item.voiceUrl && (
                          <div
                            style={{
                              marginTop:
                                "12px",
                            }}
                          >
                            <audio
                              controls
                              src={
                                item.voiceUrl
                              }
                              style={{
                                width:
                                  "100%",
                                maxWidth:
                                  "500px",
                              }}
                            />
                          </div>
                        )}

                        {item.answeredAt && (
                          <small>
                            Answered on{" "}
                            {new Date(
                              item.answeredAt
                            ).toLocaleString()}
                          </small>
                        )}
                      </div>
                    )}

                    {/* =================================================
                       DOCTOR REPLY
                    ================================================= */}

                    {hasDoctorReply && (
                      <div
                        style={{
                          marginTop:
                            "16px",
                          padding:
                            "16px",
                          borderRadius:
                            "12px",
                          background:
                            "#f0fafa",
                          border:
                            "1px solid #cfe8e8",
                        }}
                      >
                        <div
                          style={{
                            display:
                              "flex",
                            alignItems:
                              "center",
                            gap: "8px",
                            marginBottom:
                              "12px",
                            fontWeight:
                              600,
                          }}
                        >
                          <MessageCircleQuestion
                            size={18}
                          />

                          <span>
                            Doctor Reply
                          </span>
                        </div>

                        {/* TEXT REPLY */}

                        {item.doctorReply?.trim() && (
                          <div
                            style={{
                              padding:
                                "12px",
                              borderRadius:
                                "10px",
                              background:
                                "#ffffff",
                              border:
                                "1px solid #e5e7eb",
                              marginBottom:
                                "10px",
                            }}
                          >
                            <strong
                              style={{
                                display:
                                  "block",
                                marginBottom:
                                  "6px",
                              }}
                            >
                              Text Reply
                            </strong>

                            <p
                              style={{
                                margin: 0,
                                lineHeight:
                                  1.6,
                                whiteSpace:
                                  "pre-wrap",
                              }}
                            >
                              {
                                item.doctorReply
                              }
                            </p>
                          </div>
                        )}

                        {/* VOICE REPLY */}

                        {item.doctorReplyVoiceUrl?.trim() && (
                          <div
                            style={{
                              padding:
                                "12px",
                              borderRadius:
                                "10px",
                              background:
                                "#ffffff",
                              border:
                                "1px solid #e5e7eb",
                              marginBottom:
                                "10px",
                            }}
                          >
                            <strong
                              style={{
                                display:
                                  "block",
                                marginBottom:
                                  "8px",
                              }}
                            >
                              Voice Reply
                            </strong>

                            <audio
                              controls
                              preload="metadata"
                              src={
                                item.doctorReplyVoiceUrl
                              }
                              style={{
                                width:
                                  "100%",
                                maxWidth:
                                  "500px",
                              }}
                            >
                              Your browser does
                              not support
                              audio playback.
                            </audio>

                            {item.doctorReplyVoiceFileName && (
                              <div
                                style={{
                                  marginTop:
                                    "7px",
                                  fontSize:
                                    "12px",
                                  opacity:
                                    0.7,
                                }}
                              >
                                {
                                  item.doctorReplyVoiceFileName
                                }
                              </div>
                            )}
                          </div>
                        )}

                        {/* VOICE TRANSCRIPT */}

                        {item.doctorReplyTranscript?.trim() && (
                          <div
                            style={{
                              padding:
                                "12px",
                              borderRadius:
                                "10px",
                              background:
                                "#ffffff",
                              border:
                                "1px solid #e5e7eb",
                            }}
                          >
                            <strong
                              style={{
                                display:
                                  "block",
                                marginBottom:
                                  "6px",
                              }}
                            >
                              Voice Transcript
                            </strong>

                            <p
                              style={{
                                margin: 0,
                                lineHeight:
                                  1.6,
                                whiteSpace:
                                  "pre-wrap",
                              }}
                            >
                              {
                                item.doctorReplyTranscript
                              }
                            </p>
                          </div>
                        )}

                        {/* REPLY TYPE */}

                        {item.doctorReplyType && (
                          <div
                            style={{
                              marginTop:
                                "10px",
                              fontSize:
                                "12px",
                              opacity:
                                0.7,
                            }}
                          >
                            Reply type:{" "}
                            {item.doctorReplyType ===
                            "text-and-voice"
                              ? "Text + Voice"
                              : item.doctorReplyType ===
                                "voice"
                              ? "Voice"
                              : "Text"}
                          </div>
                        )}

                        {/* REPLY DATE */}

                        {item.doctorReplyAt && (
                          <small
                            style={{
                              display:
                                "block",
                              marginTop:
                                "10px",
                              opacity:
                                0.7,
                            }}
                          >
                            Replied on{" "}
                            {new Date(
                              item.doctorReplyAt
                            ).toLocaleString()}
                          </small>
                        )}
                      </div>
                    )}

                    {/* =================================================
                       ANSWER AREA
                    ================================================= */}

                    {item.status ===
                      "Pending" &&
                      activeQuestion ===
                        item.id && (
                        <div className="question-answer-area">
                          {/* TEXT RESPONSE */}

                          <textarea
                            className="report-textarea"
                            placeholder="Write your response or use voice recording below..."
                            value={
                              answer
                            }
                            onChange={(
                              e
                            ) =>
                              setAnswer(
                                e.target
                                  .value
                              )
                            }
                            disabled={
                              saving ||
                              recording
                            }
                          />

                          {/* VOICE CONTROLS */}

                          <div
                            style={{
                              marginTop:
                                "16px",
                              padding:
                                "16px",
                              border:
                                "1px solid #dfe7e7",
                              borderRadius:
                                "12px",
                              background:
                                "#f8fbfb",
                            }}
                          >
                            <div
                              style={{
                                display:
                                  "flex",
                                alignItems:
                                  "center",
                                gap: "8px",
                                marginBottom:
                                  "12px",
                                fontWeight:
                                  600,
                              }}
                            >
                              <Volume2
                                size={
                                  18
                                }
                              />

                              Voice Response
                            </div>

                            <div
                              style={{
                                display:
                                  "flex",
                                flexWrap:
                                  "wrap",
                                gap: "10px",
                              }}
                            >
                              {!recording ? (
                                <button
                                  type="button"
                                  className="question-submit-button"
                                  onClick={() =>
                                    startRecording(
                                      item.id
                                    )
                                  }
                                  disabled={
                                    saving
                                  }
                                >
                                  <Mic
                                    size={
                                      15
                                    }
                                  />

                                  Record Voice
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  className="question-submit-button"
                                  onClick={
                                    stopRecording
                                  }
                                >
                                  <Square
                                    size={
                                      15
                                    }
                                  />

                                  Stop Recording
                                </button>
                              )}

                              {audioUrl &&
                                !recording && (
                                  <>
                                    <button
                                      type="button"
                                      className="question-submit-button"
                                      onClick={
                                        togglePlayback
                                      }
                                    >
                                      {isPlaying ? (
                                        <Pause
                                          size={
                                            15
                                          }
                                        />
                                      ) : (
                                        <Play
                                          size={
                                            15
                                          }
                                        />
                                      )}

                                      {isPlaying
                                        ? "Pause"
                                        : "Play Recording"}
                                    </button>

                                    <button
                                      type="button"
                                      className="question-submit-button"
                                      onClick={
                                        clearVoice
                                      }
                                    >
                                      <Trash2
                                        size={
                                          15
                                        }
                                      />

                                      Remove Recording
                                    </button>
                                  </>
                                )}
                            </div>

                            {recording && (
                              <p
                                style={{
                                  margin:
                                    "12px 0 0",
                                  fontWeight:
                                    600,
                                }}
                              >
                                🔴 Recording...
                                Speak clearly.
                              </p>
                            )}

                            {/* TRANSCRIPT */}

                            <div
                              style={{
                                marginTop:
                                  "16px",
                              }}
                            >
                              <label
                                style={{
                                  display:
                                    "block",
                                  fontWeight:
                                    600,
                                  marginBottom:
                                    "7px",
                                }}
                              >
                                Voice Transcript
                              </label>

                              <textarea
                                className="report-textarea"
                                placeholder="Your spoken response will appear here. You can edit it before submitting."
                                value={
                                  transcript
                                }
                                onChange={(
                                  e
                                ) =>
                                  setTranscript(
                                    e.target
                                      .value
                                  )
                                }
                                rows={
                                  4
                                }
                                disabled={
                                  saving
                                }
                              />
                            </div>

                            {voiceError && (
                              <p
                                style={{
                                  marginTop:
                                    "10px",
                                  color:
                                    "#b42318",
                                }}
                              >
                                {
                                  voiceError
                                }
                              </p>
                            )}
                          </div>

                          {/* SUBMIT */}

                          <button
                            type="button"
                            className="question-submit-button"
                            onClick={() =>
                              submitAnswer(
                                item.id
                              )
                            }
                            disabled={
                              saving ||
                              recording ||
                              (!answer.trim() &&
                                !audioBlob &&
                                !transcript.trim())
                            }
                          >
                            <Send
                              size={15}
                            />

                            {saving
                              ? "Submitting..."
                              : "Submit Response"}
                          </button>
                        </div>
                      )}

                    {/* ANSWER BUTTON */}

                    {item.status ===
                      "Pending" &&
                      activeQuestion !==
                        item.id && (
                        <button
                          type="button"
                          className="question-answer-button"
                          onClick={() => {
                            setActiveQuestion(
                              item.id
                            );

                            setAnswer(
                              ""
                            );

                            setTranscript(
                              ""
                            );

                            clearVoice();
                          }}
                        >
                          Answer Question
                        </button>
                      )}
                  </div>
                );
              }
            )}
          </div>
        )}
      </div>
    </div>
  );
}