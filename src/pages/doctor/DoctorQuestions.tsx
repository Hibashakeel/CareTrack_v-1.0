import { useEffect, useMemo, useRef, useState } from "react";
import {
  CheckCircle2,
  Clock3,
  MessageCircleQuestion,
  Search,
  User,
  Mic,
  Square,
  Volume2,
  Send,
  Trash2,
  Play,
  Pause,
} from "lucide-react";

import { get, ref, set } from "firebase/database";

import { useAuth } from "../../context/AuthContext";
import { db } from "../../lib/firebase";

import "../../patient-pages.css";

type ResponseType =
  | "text"
  | "voice"
  | "text-and-voice"
  | "";

type Question = {
  id: string;
  patientId: string;
  patientName: string;
  question: string;
  doctor: string;
  doctorId: string;
  date: string | number;
  status: "Pending" | "Answered";
  answer: string;
  transcript: string;
  voiceUrl: string;
  voiceFileName: string;
  responseType: ResponseType;
  answeredAt: string | number;

  // Doctor reply fields
  doctorReply?: string;
  doctorReplyTranscript?: string;
  doctorReplyVoiceUrl?: string;
  doctorReplyVoiceFileName?: string;
  doctorReplyType?: ResponseType;
  doctorReplyAt?: string | number;
  doctorReplyBy?: string;
};

declare global {
  interface Window {
    SpeechRecognition?: any;
    webkitSpeechRecognition?: any;
  }
}

/* =========================================================
   HELPERS
========================================================= */

function getDateValue(value: unknown): number {
  if (typeof value === "number") {
    return value;
  }

  if (typeof value === "string") {
    const parsed = new Date(value).getTime();

    if (!Number.isNaN(parsed)) {
      return parsed;
    }
  }

  return 0;
}

function formatDate(value: string | number): string {
  if (!value) return "Recently";

  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    return "Recently";
  }

  return parsed.toLocaleString();
}

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onloadend = () => {
      if (typeof reader.result === "string") {
        resolve(reader.result);
      } else {
        reject(
          new Error("Could not convert voice recording."),
        );
      }
    };

    reader.onerror = () => {
      reject(
        new Error("Could not read voice recording."),
      );
    };

    reader.readAsDataURL(blob);
  });
}

/* =========================================================
   MAIN COMPONENT
========================================================= */

export default function DoctorQuestions() {
  const { user } = useAuth();

  const [questions, setQuestions] =
    useState<Question[]>([]);

  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");

  /* =======================================================
     DOCTOR REPLY STATES
  ======================================================= */

  const [replyText, setReplyText] = useState<
    Record<string, string>
  >({});

  const [replyTranscript, setReplyTranscript] =
    useState<Record<string, string>>({});

  const [replyAudioBlob, setReplyAudioBlob] =
    useState<Record<string, Blob | null>>({});

  const [replyAudioUrl, setReplyAudioUrl] =
    useState<Record<string, string | null>>({});

  const [recordingQuestion, setRecordingQuestion] =
    useState<string | null>(null);

  const [savingReply, setSavingReply] =
    useState<string | null>(null);

  const [voiceError, setVoiceError] =
    useState("");

  const [playingReply, setPlayingReply] =
    useState<string | null>(null);

  /* =======================================================
     REFS
  ======================================================= */

  const mediaRecorderRef =
    useRef<MediaRecorder | null>(null);

  const audioChunksRef =
    useRef<Blob[]>([]);

  const speechRecognitionRef =
    useRef<any>(null);

  const shouldContinueRecognitionRef =
    useRef(false);

  const audioElementRefs =
    useRef<Record<string, HTMLAudioElement | null>>(
      {},
    );

  /* =========================================================
     LOAD QUESTIONS
  ========================================================= */

  useEffect(() => {
    const loadQuestions = async () => {
      if (!user?.uid) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        const snapshot = await get(
          ref(db, "patientQuestions"),
        );

        if (!snapshot.exists()) {
          setQuestions([]);
          return;
        }

        const rootData = snapshot.val() || {};

        const loadedQuestions: Question[] = [];

        Object.entries(rootData).forEach(
          ([patientId, patientQuestions]: [
            string,
            any,
          ]) => {
            if (
              !patientQuestions ||
              typeof patientQuestions !==
                "object"
            ) {
              return;
            }

            Object.entries(
              patientQuestions,
            ).forEach(
              ([questionId, value]: [
                string,
                any,
              ]) => {
                if (
                  !value ||
                  typeof value !== "object"
                ) {
                  return;
                }

                /*
                 * Only show questions belonging to
                 * currently logged-in doctor.
                 */
                if (
                  value.doctorId &&
                  value.doctorId !== user.uid
                ) {
                  return;
                }

                const hasAnswer =
                  typeof value.answer ===
                    "string" &&
                  value.answer.trim()
                    .length > 0;

                const hasTranscript =
                  typeof value.transcript ===
                    "string" &&
                  value.transcript.trim()
                    .length > 0;

                const hasVoice =
                  typeof value.voiceUrl ===
                    "string" &&
                  value.voiceUrl.trim()
                    .length > 0;

                const hasResponse =
                  hasAnswer ||
                  hasTranscript ||
                  hasVoice ||
                  value.status ===
                    "Answered";

                const status:
                  | "Pending"
                  | "Answered" =
                  hasResponse
                    ? "Answered"
                    : "Pending";

                loadedQuestions.push({
                  id: questionId,

                  patientId,

                  patientName:
                    value.patientName ||
                    value.patient ||
                    "Unknown Patient",

                  question:
                    value.question || "",

                  doctor:
                    value.doctor ||
                    "Doctor",

                  doctorId:
                    value.doctorId ||
                    user.uid,

                  date:
                    value.date ||
                    value.createdAt ||
                    value.timestamp ||
                    "",

                  status,

                  answer:
                    value.answer || "",

                  transcript:
                    value.transcript || "",

                  voiceUrl:
                    value.voiceUrl || "",

                  voiceFileName:
                    value.voiceFileName ||
                    "",

                  responseType:
                    value.responseType ||
                    "",

                  answeredAt:
                    value.answeredAt || "",

                  /* DOCTOR REPLY */

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
                    value.doctorReplyType ||
                    "",

                  doctorReplyAt:
                    value.doctorReplyAt || "",

                  doctorReplyBy:
                    value.doctorReplyBy || "",
                });
              },
            );
          },
        );

        loadedQuestions.sort((a, b) => {
          return (
            getDateValue(b.date) -
            getDateValue(a.date)
          );
        });

        setQuestions(
          loadedQuestions,
        );
      } catch (error) {
        console.error(
          "Error loading doctor questions:",
          error,
        );

        setQuestions([]);
      } finally {
        setLoading(false);
      }
    };

    loadQuestions();
  }, [user?.uid]);

  /* =========================================================
     SEARCH
  ========================================================= */

  const filteredQuestions =
    useMemo(() => {
      const cleanSearch =
        search.trim().toLowerCase();

      if (!cleanSearch) {
        return questions;
      }

      return questions.filter((item) =>
        item.patientName
          .toLowerCase()
          .includes(cleanSearch),
      );
    }, [questions, search]);

  const pendingCount =
    questions.filter(
      (item) =>
        item.status === "Pending",
    ).length;

  const answeredCount =
    questions.filter(
      (item) =>
        item.status === "Answered",
    ).length;

  /* =========================================================
     STOP SPEECH RECOGNITION
  ========================================================= */

  const stopSpeechRecognition =
    () => {
      shouldContinueRecognitionRef.current =
        false;

      if (speechRecognitionRef.current) {
        try {
          speechRecognitionRef.current.stop();
        } catch {
          // Ignore stop errors
        }

        speechRecognitionRef.current =
          null;
      }
    };

  /* =========================================================
     START SPEECH RECOGNITION
  ========================================================= */

  const startSpeechRecognition = (
    questionKey: string,
  ) => {
    const SpeechRecognition =
      window.SpeechRecognition ||
      window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setVoiceError(
        "Voice transcription is not supported in this browser. Please use Google Chrome.",
      );
      return;
    }

    setVoiceError("");

    const recognition =
      new SpeechRecognition();

    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    shouldContinueRecognitionRef.current =
      true;

    recognition.onresult = (
      event: any,
    ) => {
      let finalText = "";

      for (
        let i = event.resultIndex;
        i < event.results.length;
        i++
      ) {
        const text =
          event.results[i][0]
            ?.transcript || "";

        if (
          event.results[i].isFinal
        ) {
          finalText +=
            text + " ";
        }
      }

      if (finalText.trim()) {
        setReplyTranscript(
          (prev) => ({
            ...prev,

            [questionKey]:
              `${(
                prev[
                  questionKey
                ] || ""
              ).trim()} ${finalText.trim()}`.trim(),
          }),
        );
      }
    };

    recognition.onerror = (
      event: any,
    ) => {
      console.error(
        "Speech recognition error:",
        event,
      );

      if (
        event.error ===
          "not-allowed" ||
        event.error ===
          "service-not-allowed"
      ) {
        setVoiceError(
          "Microphone permission was denied. Please allow microphone access.",
        );
      }
    };

    recognition.onend = () => {
      if (
        shouldContinueRecognitionRef.current &&
        recordingQuestion ===
          questionKey
      ) {
        try {
          recognition.start();
        } catch {
          // Browser may reject immediate restart
        }
      }
    };

    speechRecognitionRef.current =
      recognition;

    try {
      recognition.start();
    } catch (error) {
      console.error(
        "Could not start speech recognition:",
        error,
      );
    }
  };

  /* =========================================================
     START DOCTOR VOICE RECORDING
  ========================================================= */

  const startRecording = async (
    questionKey: string,
  ) => {
    try {
      setVoiceError("");

      if (
        !navigator.mediaDevices ||
        !navigator.mediaDevices
          .getUserMedia
      ) {
        setVoiceError(
          "Voice recording is not supported in this browser.",
        );
        return;
      }

      /*
       * If another recording is active,
       * stop it first.
       */
      if (
        mediaRecorderRef.current &&
        mediaRecorderRef.current
          .state !== "inactive"
      ) {
        try {
          mediaRecorderRef.current.stop();
        } catch {
          // Ignore
        }
      }

      const stream =
        await navigator.mediaDevices.getUserMedia(
          {
            audio: true,
          },
        );

      audioChunksRef.current = [];

      /*
       * Remove previous recording for this
       * question when starting a new recording.
       */
      const oldUrl =
        replyAudioUrl[questionKey];

      if (
        oldUrl &&
        oldUrl.startsWith("blob:")
      ) {
        URL.revokeObjectURL(oldUrl);
      }

      setReplyAudioBlob(
        (prev) => ({
          ...prev,
          [questionKey]: null,
        }),
      );

      setReplyAudioUrl(
        (prev) => ({
          ...prev,
          [questionKey]: null,
        }),
      );

      /*
       * Start a fresh transcript.
       */
      setReplyTranscript(
        (prev) => ({
          ...prev,
          [questionKey]: "",
        }),
      );

      let mimeType = "";

      if (
        MediaRecorder.isTypeSupported(
          "audio/webm;codecs=opus",
        )
      ) {
        mimeType =
          "audio/webm;codecs=opus";
      } else if (
        MediaRecorder.isTypeSupported(
          "audio/webm",
        )
      ) {
        mimeType = "audio/webm";
      }

      const recorder = mimeType
        ? new MediaRecorder(
            stream,
            {
              mimeType,
            },
          )
        : new MediaRecorder(
            stream,
          );

      mediaRecorderRef.current =
        recorder;

      recorder.ondataavailable = (
        event,
      ) => {
        if (
          event.data &&
          event.data.size > 0
        ) {
          audioChunksRef.current.push(
            event.data,
          );
        }
      };

      recorder.onstop = () => {
        const finalMimeType =
          recorder.mimeType ||
          mimeType ||
          "audio/webm";

        const blob = new Blob(
          audioChunksRef.current,
          {
            type: finalMimeType,
          },
        );

        /*
         * Do not create an unusable recording.
         */
        if (blob.size === 0) {
          setVoiceError(
            "No audio was recorded. Please try again.",
          );

          stream
            .getTracks()
            .forEach((track) =>
              track.stop(),
            );

          audioChunksRef.current =
            [];

          return;
        }

        /*
         * Realtime Database media limit
         * for this prototype.
         */
        const MAX_AUDIO_BYTES =
          3 * 1024 * 1024;

        if (
          blob.size >
          MAX_AUDIO_BYTES
        ) {
          setVoiceError(
            "Voice recording is too large. Please record a shorter voice message.",
          );

          stream
            .getTracks()
            .forEach((track) =>
              track.stop(),
            );

          audioChunksRef.current =
            [];

          return;
        }

        const localUrl =
          URL.createObjectURL(
            blob,
          );

        setReplyAudioBlob(
          (prev) => ({
            ...prev,
            [questionKey]: blob,
          }),
        );

        setReplyAudioUrl(
          (prev) => ({
            ...prev,
            [questionKey]:
              localUrl,
          }),
        );

        stream
          .getTracks()
          .forEach((track) =>
            track.stop(),
          );

        audioChunksRef.current =
          [];
      };

      recorder.onerror = () => {
        setVoiceError(
          "There was a problem while recording the voice.",
        );

        stream
          .getTracks()
          .forEach((track) =>
            track.stop(),
          );

        setRecordingQuestion(
          null,
        );

        stopSpeechRecognition();
      };

      recorder.start();

      setRecordingQuestion(
        questionKey,
      );

      startSpeechRecognition(
        questionKey,
      );
    } catch (error) {
      console.error(
        "Microphone error:",
        error,
      );

      setVoiceError(
        "Could not access the microphone. Please allow microphone permission.",
      );
    }
  };

  /* =========================================================
     STOP DOCTOR VOICE RECORDING
  ========================================================= */

  const stopRecording = () => {
    const recorder =
      mediaRecorderRef.current;

    shouldContinueRecognitionRef.current =
      false;

    stopSpeechRecognition();

    if (
      recorder &&
      recorder.state !== "inactive"
    ) {
      recorder.stop();
    }

    mediaRecorderRef.current =
      null;

    setRecordingQuestion(null);
  };

  /* =========================================================
     DELETE RECORDED VOICE
  ========================================================= */

  const deleteRecording = (
    questionKey: string,
  ) => {
    /*
     * If currently recording this question,
     * stop recording first.
     */
    if (
      recordingQuestion ===
      questionKey
    ) {
      stopRecording();
    }

    const url =
      replyAudioUrl[questionKey];

    /*
     * Release browser-created blob URL.
     */
    if (
      url &&
      url.startsWith("blob:")
    ) {
      URL.revokeObjectURL(url);
    }

    setReplyAudioBlob(
      (prev) => ({
        ...prev,
        [questionKey]: null,
      }),
    );

    setReplyAudioUrl(
      (prev) => ({
        ...prev,
        [questionKey]: null,
      }),
    );

    /*
     * Clear transcript as well because it belongs
     * to the deleted recording.
     */
    setReplyTranscript(
      (prev) => ({
        ...prev,
        [questionKey]: "",
      }),
    );

    setVoiceError("");
  };

  /* =========================================================
     PLAY / PAUSE LOCAL RECORDING
  ========================================================= */

  const togglePlayback = (
    questionKey: string,
  ) => {
    const audio =
      audioElementRefs.current[
        questionKey
      ];

    if (!audio) {
      return;
    }

    if (audio.paused) {
      /*
       * Pause any other recording preview.
       */
      Object.entries(
        audioElementRefs.current,
      ).forEach(
        ([key, element]) => {
          if (
            key !== questionKey &&
            element
          ) {
            element.pause();
          }
        },
      );

      audio
        .play()
        .then(() => {
          setPlayingReply(
            questionKey,
          );
        })
        .catch((error) => {
          console.error(
            "Could not play recording:",
            error,
          );
        });
    } else {
      audio.pause();
      setPlayingReply(null);
    }
  };

  /* =========================================================
     SAVE DOCTOR REPLY
  ========================================================= */

  const saveDoctorReply = async (
    item: Question,
  ) => {
    if (!user?.uid) {
      return;
    }

    const questionKey =
      `${item.patientId}_${item.id}`;

    const text =
      replyText[
        questionKey
      ]?.trim() || "";

    const transcript =
      replyTranscript[
        questionKey
      ]?.trim() || "";

    const audioBlob =
      replyAudioBlob[
        questionKey
      ] || null;

    if (!text && !audioBlob) {
      setVoiceError(
        "Please enter a text reply or record a voice reply first.",
      );
      return;
    }

    try {
      setSavingReply(
        questionKey,
      );

      setVoiceError("");

      let doctorReplyVoiceUrl =
        item.doctorReplyVoiceUrl ||
        "";

      let doctorReplyVoiceFileName =
        item.doctorReplyVoiceFileName ||
        "";

      /*
       * Convert the recorded voice into
       * a Data URL for Firebase Realtime Database.
       */
      if (audioBlob) {
        const MAX_AUDIO_BYTES =
          3 * 1024 * 1024;

        if (
          audioBlob.size >
          MAX_AUDIO_BYTES
        ) {
          setVoiceError(
            "Voice recording is too large. Please record a shorter voice message.",
          );

          setSavingReply(null);

          return;
        }

        doctorReplyVoiceUrl =
          await blobToDataUrl(
            audioBlob,
          );

        doctorReplyVoiceFileName =
          `doctor-reply-${Date.now()}.webm`;
      }

      let doctorReplyType:
        | "text"
        | "voice"
        | "text-and-voice" =
        "text";

      if (
        text &&
        audioBlob
      ) {
        doctorReplyType =
          "text-and-voice";
      } else if (
        audioBlob
      ) {
        doctorReplyType =
          "voice";
      }

      const replyTime =
        new Date().toISOString();

      const questionRef =
        ref(
          db,
          `patientQuestions/${item.patientId}/${item.id}`,
        );

      /*
       * Preserve all existing patient data.
       */
      const snapshot =
        await get(
          questionRef,
        );

      if (!snapshot.exists()) {
        throw new Error(
          "Question no longer exists.",
        );
      }

      const currentData =
        snapshot.val() || {};

      await set(
        questionRef,
        {
          ...currentData,

          doctorReply:
            text,

          doctorReplyTranscript:
            transcript,

          doctorReplyVoiceUrl:
            doctorReplyVoiceUrl,

          doctorReplyVoiceFileName:
            doctorReplyVoiceFileName,

          doctorReplyType:
            doctorReplyType,

          doctorReplyAt:
            replyTime,

          doctorReplyBy:
            user.uid,
        },
      );

      /*
       * Update UI immediately.
       */
      setQuestions(
        (prev) =>
          prev.map(
            (question) => {
              if (
                question.patientId ===
                  item.patientId &&
                question.id ===
                  item.id
              ) {
                return {
                  ...question,

                  doctorReply:
                    text,

                  doctorReplyTranscript:
                    transcript,

                  doctorReplyVoiceUrl:
                    doctorReplyVoiceUrl,

                  doctorReplyVoiceFileName:
                    doctorReplyVoiceFileName,

                  doctorReplyType:
                    doctorReplyType,

                  doctorReplyAt:
                    replyTime,

                  doctorReplyBy:
                    user.uid,
                };
              }

              return question;
            },
          ),
      );

      /*
       * Release local blob URL after successful save.
       */
      const localUrl =
        replyAudioUrl[
          questionKey
        ];

      if (
        localUrl &&
        localUrl.startsWith("blob:")
      ) {
        URL.revokeObjectURL(
          localUrl,
        );
      }

      /*
       * Clear composer.
       */
      setReplyText(
        (prev) => ({
          ...prev,
          [questionKey]: "",
        }),
      );

      setReplyTranscript(
        (prev) => ({
          ...prev,
          [questionKey]: "",
        }),
      );

      setReplyAudioBlob(
        (prev) => ({
          ...prev,
          [questionKey]: null,
        }),
      );

      setReplyAudioUrl(
        (prev) => ({
          ...prev,
          [questionKey]: null,
        }),
      );

      setPlayingReply(null);
    } catch (error) {
      console.error(
        "Error saving doctor reply:",
        error,
      );

      setVoiceError(
        "Could not save the doctor reply. Please try again.",
      );
    } finally {
      setSavingReply(null);
    }
  };

  /* =========================================================
     CLEANUP
  ========================================================= */

  useEffect(() => {
    return () => {
      shouldContinueRecognitionRef.current =
        false;

      if (
        speechRecognitionRef.current
      ) {
        try {
          speechRecognitionRef.current.stop();
        } catch {
          // Ignore cleanup errors
        }
      }

      if (
        mediaRecorderRef.current
      ) {
        try {
          if (
            mediaRecorderRef.current
              .state !==
            "inactive"
          ) {
            mediaRecorderRef.current.stop();
          }
        } catch {
          // Ignore cleanup errors
        }
      }

      /*
       * Release local blob URLs.
       */
      Object.values(
        replyAudioUrl,
      ).forEach((url) => {
        if (
          url &&
          url.startsWith("blob:")
        ) {
          URL.revokeObjectURL(
            url,
          );
        }
      });
    };
  }, [replyAudioUrl]);

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <div className="doctor-questions-page">

      {/* PAGE HEADER */}

      <div className="doctor-questions-heading">
        <div>
          <span className="doctor-questions-eyebrow">
            CARETRACK
          </span>

          <h1>
            Patient Questions
          </h1>

          <p>
            Review questions you have
            sent to patients and
            their responses.
          </p>
        </div>

        <div className="doctor-question-summary">

          <div className="doctor-question-summary-item">
            <span>
              {questions.length}
            </span>

            <small>Total</small>
          </div>

          <div className="doctor-question-summary-item pending-summary">
            <span>
              {pendingCount}
            </span>

            <small>Pending</small>
          </div>

          <div className="doctor-question-summary-item answered-summary">
            <span>
              {answeredCount}
            </span>

            <small>Answered</small>
          </div>

        </div>
      </div>

      {/* SEARCH */}

      <div className="doctor-question-search-card">

        <div className="doctor-question-search">

          <Search size={19} />

          <input
            type="text"
            placeholder="Search by patient name..."
            value={search}
            onChange={(e) =>
              setSearch(
                e.target.value,
              )
            }
          />

          {search && (
            <button
              type="button"
              onClick={() =>
                setSearch("")
              }
              aria-label="Clear search"
            >
              ×
            </button>
          )}

        </div>

        <span className="doctor-question-result-count">
          {filteredQuestions.length}{" "}
          {filteredQuestions.length ===
          1
            ? "question"
            : "questions"}
        </span>

      </div>

      {/* CONTENT */}

      {loading ? (
        <div className="doctor-question-state-card">

          <div className="doctor-question-loading">
            Loading patient questions...
          </div>

        </div>
      ) : filteredQuestions.length ===
        0 ? (
        <div className="doctor-question-state-card">

          <MessageCircleQuestion
            size={40}
          />

          <h3>
            {search
              ? "No questions found"
              : "No patient questions yet"}
          </h3>

          <p>
            {search
              ? "No questions match this patient name."
              : "Questions you send from a patient record will appear here."}
          </p>

        </div>
      ) : (
        <div className="doctor-question-list">

          {filteredQuestions.map(
            (item) => {

              const hasText =
                item.answer.trim()
                  .length > 0;

              const hasTranscript =
                item.transcript
                  .trim()
                  .length > 0;

              const hasVoice =
                item.voiceUrl
                  .trim()
                  .length > 0;

              const questionKey =
                `${item.patientId}_${item.id}`;

              const doctorReplyText =
                item.doctorReply
                  ?.trim() || "";

              const doctorReplyTranscript =
                item.doctorReplyTranscript
                  ?.trim() || "";

              const doctorReplyVoice =
                item.doctorReplyVoiceUrl
                  ?.trim() || "";

              const hasDoctorReply =
                doctorReplyText.length >
                  0 ||
                doctorReplyTranscript.length >
                  0 ||
                doctorReplyVoice.length >
                  0;

              const isRecording =
                recordingQuestion ===
                questionKey;

              const isSaving =
                savingReply ===
                questionKey;

              const localVoiceUrl =
                replyAudioUrl[
                  questionKey
                ];

              const localTranscript =
                (
                  replyTranscript[
                    questionKey
                  ] || ""
                ).trim();

              return (
                <article
                  className="doctor-question-card"
                  key={`${item.patientId}-${item.id}`}
                >

                  {/* =================================================
                      CARD HEADER
                  ================================================= */}

                  <div className="doctor-question-card-header">

                    <div className="doctor-question-patient">

                      <div className="doctor-question-avatar">
                        <User size={19} />
                      </div>

                      <div>
                        <span>
                          Patient
                        </span>

                        <h3>
                          {item.patientName}
                        </h3>
                      </div>

                    </div>

                    <div
                      className={`doctor-question-status ${
                        item.status ===
                        "Answered"
                          ? "answered"
                          : "pending"
                      }`}
                    >
                      {item.status ===
                      "Answered" ? (
                        <CheckCircle2
                          size={14}
                        />
                      ) : (
                        <Clock3
                          size={14}
                        />
                      )}

                      {item.status}
                    </div>

                  </div>

                  {/* =================================================
                      QUESTION
                  ================================================= */}

                  <div className="doctor-question-section">

                    <div className="doctor-question-label">

                      <MessageCircleQuestion
                        size={16}
                      />

                      <span>
                        Question Sent to Patient
                      </span>

                    </div>

                    <div className="doctor-question-text">
                      {item.question ||
                        "No question text available."}
                    </div>

                    <div className="doctor-question-date">

                      <Clock3
                        size={13}
                      />

                      {formatDate(
                        item.date,
                      )}

                    </div>

                  </div>

                  {/* =================================================
                      PATIENT RESPONSE
                  ================================================= */}

                  <div
                    className={`doctor-patient-response ${
                      item.status ===
                      "Answered"
                        ? "has-response"
                        : "waiting-response"
                    }`}
                  >

                    <div className="doctor-response-header">

                      <div>

                        <span className="doctor-response-label">
                          Patient Response
                        </span>

                        <strong>
                          {item.status ===
                          "Answered"
                            ? "Response received"
                            : "Waiting for patient response"}
                        </strong>

                      </div>

                      {item.status ===
                        "Answered" && (
                        <CheckCircle2
                          size={19}
                        />
                      )}

                    </div>

                    {item.status ===
                    "Answered" ? (
                      <div
                        style={{
                          display:
                            "flex",
                          flexDirection:
                            "column",
                          gap: "16px",
                        }}
                      >

                        {/* TEXT RESPONSE */}

                        {hasText && (
                          <div
                            style={{
                              padding:
                                "15px 16px",
                              borderRadius:
                                "12px",
                              background:
                                "#ffffff",
                              border:
                                "1px solid #e5e7eb",
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
                                  "8px",
                                fontWeight:
                                  600,
                              }}
                            >

                              <MessageCircleQuestion
                                size={17}
                              />

                              <span>
                                Text Response
                              </span>

                            </div>

                            <p
                              className="doctor-response-text"
                              style={{
                                margin: 0,
                              }}
                            >
                              {item.answer}
                            </p>

                          </div>
                        )}

                        {/* VOICE RESPONSE */}

                        {hasVoice && (
                          <div
                            style={{
                              padding:
                                "15px 16px",
                              borderRadius:
                                "12px",
                              background:
                                "#ffffff",
                              border:
                                "1px solid #e5e7eb",
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
                                  "10px",
                                fontWeight:
                                  600,
                              }}
                            >

                              <Mic size={17} />

                              <span>
                                Voice Response
                              </span>

                            </div>

                            <audio
                              controls
                              preload="metadata"
                              src={
                                item.voiceUrl
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

                            {item.voiceFileName && (
                              <div
                                style={{
                                  marginTop:
                                    "8px",
                                  fontSize:
                                    "12px",
                                  opacity:
                                    0.7,
                                }}
                              >
                                {
                                  item.voiceFileName
                                }
                              </div>
                            )}

                          </div>
                        )}

                        {/* TRANSCRIPT */}

                        {hasTranscript && (
                          <div
                            style={{
                              padding:
                                "15px 16px",
                              borderRadius:
                                "12px",
                              background:
                                "#ffffff",
                              border:
                                "1px solid #e5e7eb",
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
                                  "8px",
                                fontWeight:
                                  600,
                              }}
                            >

                              <Volume2
                                size={17}
                              />

                              <span>
                                Voice Transcript
                              </span>

                            </div>

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
                                item.transcript
                              }
                            </p>

                          </div>
                        )}

                        {/* RESPONSE TYPE */}

                        {(hasText ||
                          hasVoice) && (
                          <div
                            style={{
                              fontSize:
                                "12px",
                              opacity:
                                0.7,
                            }}
                          >
                            Response type:{" "}
                            {item.responseType ===
                            "text-and-voice"
                              ? "Text + Voice"
                              : item.responseType ===
                                "voice"
                              ? "Voice"
                              : "Text"}
                          </div>
                        )}

                        {/* ANSWER DATE */}

                        {item.answeredAt && (
                          <div className="doctor-response-date">
                            Answered on{" "}
                            {formatDate(
                              item.answeredAt,
                            )}
                          </div>
                        )}

                        {!hasText &&
                          !hasVoice &&
                          !hasTranscript && (
                            <p className="doctor-response-text">
                              Response received,
                              but no response
                              content is available.
                            </p>
                          )}

                      </div>
                    ) : (
                      <p className="doctor-waiting-text">
                        The patient has not
                        responded to this
                        question yet.
                      </p>
                    )}

                  </div>

                  {/* =================================================
                      DOCTOR REPLY
                  ================================================= */}

                  <div
                    style={{
                      marginTop:
                        "16px",
                      padding:
                        "16px",
                      borderRadius:
                        "12px",
                      background:
                        "#ffffff",
                      border:
                        "1px solid #e5e7eb",
                    }}
                  >

                    {/* REPLY HEADER */}

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
                        size={17}
                      />

                      <span>
                        Doctor Reply
                      </span>

                    </div>

                    {/* EXISTING DOCTOR REPLY */}

                    {hasDoctorReply && (
                      <div
                        style={{
                          display:
                            "flex",
                          flexDirection:
                            "column",
                          gap: "12px",
                          marginBottom:
                            "16px",
                        }}
                      >

                        {doctorReplyText && (
                          <div
                            style={{
                              padding:
                                "12px",
                              borderRadius:
                                "10px",
                              background:
                                "#f8fafc",
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
                                doctorReplyText
                              }
                            </p>

                          </div>
                        )}

                        {doctorReplyVoice && (
                          <div
                            style={{
                              padding:
                                "12px",
                              borderRadius:
                                "10px",
                              background:
                                "#f8fafc",
                              border:
                                "1px solid #e5e7eb",
                            }}
                          >

                            <strong
                              style={{
                                display:
                                  "flex",
                                alignItems:
                                  "center",
                                gap: "7px",
                                marginBottom:
                                  "8px",
                              }}
                            >

                              <Mic
                                size={16}
                              />

                              Voice Reply

                            </strong>

                            <audio
                              controls
                              preload="metadata"
                              src={
                                doctorReplyVoice
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

                        {doctorReplyTranscript && (
                          <div
                            style={{
                              padding:
                                "12px",
                              borderRadius:
                                "10px",
                              background:
                                "#f8fafc",
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
                                doctorReplyTranscript
                              }
                            </p>

                          </div>
                        )}

                        {item.doctorReplyAt && (
                          <div
                            style={{
                              fontSize:
                                "12px",
                              opacity:
                                0.7,
                            }}
                          >
                            Replied on{" "}
                            {formatDate(
                              item.doctorReplyAt,
                            )}
                          </div>
                        )}

                      </div>
                    )}

                    {/* =================================================
                        TEXT REPLY
                    ================================================= */}

                    <textarea
                      value={
                        replyText[
                          questionKey
                        ] || ""
                      }
                      onChange={(e) =>
                        setReplyText(
                          (prev) => ({
                            ...prev,
                            [questionKey]:
                              e.target
                                .value,
                          }),
                        )
                      }
                      placeholder="Write a reply to the patient..."
                      rows={3}
                      style={{
                        width:
                          "100%",
                        boxSizing:
                          "border-box",
                        resize:
                          "vertical",
                        padding:
                          "12px",
                        borderRadius:
                          "10px",
                        border:
                          "1px solid #d1d5db",
                        fontFamily:
                          "inherit",
                        outline:
                          "none",
                      }}
                    />

                    {/* =================================================
                        VOICE TRANSCRIPT
                    ================================================= */}

                    {localTranscript && (
                      <div
                        style={{
                          marginTop:
                            "10px",
                          padding:
                            "12px",
                          borderRadius:
                            "10px",
                          background:
                            "#f8fafc",
                          border:
                            "1px solid #e5e7eb",
                        }}
                      >

                        <div
                          style={{
                            display:
                              "flex",
                            alignItems:
                              "center",
                            gap: "7px",
                            marginBottom:
                              "7px",
                            fontWeight:
                              600,
                          }}
                        >

                          <Volume2
                            size={16}
                          />

                          <span>
                            Voice Transcript
                          </span>

                        </div>

                        <textarea
                          value={
                            replyTranscript[
                              questionKey
                            ] || ""
                          }
                          onChange={(e) =>
                            setReplyTranscript(
                              (prev) => ({
                                ...prev,
                                [questionKey]:
                                  e.target
                                    .value,
                              }),
                            )
                          }
                          rows={3}
                          style={{
                            width:
                              "100%",
                            boxSizing:
                              "border-box",
                            resize:
                              "vertical",
                            padding:
                              "10px",
                            borderRadius:
                              "8px",
                            border:
                              "1px solid #d1d5db",
                            fontFamily:
                              "inherit",
                            outline:
                              "none",
                          }}
                        />

                      </div>
                    )}

                    {/* =================================================
                        RECORDED VOICE
                    ================================================= */}

                    {localVoiceUrl && (
                      <div
                        style={{
                          marginTop:
                            "10px",
                          padding:
                            "14px",
                          borderRadius:
                            "10px",
                          background:
                            "#f8fafc",
                          border:
                            "1px solid #e5e7eb",
                        }}
                      >

                        <div
                          style={{
                            display:
                              "flex",
                            alignItems:
                              "center",
                            justifyContent:
                              "space-between",
                            gap: "10px",
                            marginBottom:
                              "10px",
                          }}
                        >

                          <div
                            style={{
                              display:
                                "flex",
                              alignItems:
                                "center",
                              gap: "8px",
                              fontWeight:
                                600,
                            }}
                          >

                            <Mic
                              size={17}
                            />

                            <span>
                              Recorded Voice
                            </span>

                          </div>

                          <button
                            type="button"
                            onClick={() =>
                              deleteRecording(
                                questionKey,
                              )
                            }
                            disabled={
                              isSaving
                            }
                            style={{
                              display:
                                "inline-flex",
                              alignItems:
                                "center",
                              gap: "6px",
                              padding:
                                "7px 10px",
                              borderRadius:
                                "8px",
                              border:
                                "1px solid #fecaca",
                              background:
                                "#fff1f2",
                              color:
                                "#b91c1c",
                              cursor:
                                isSaving
                                  ? "not-allowed"
                                  : "pointer",
                              fontFamily:
                                "inherit",
                              fontSize:
                                "12px",
                              fontWeight:
                                600,
                            }}
                          >

                            <Trash2
                              size={14}
                            />

                            Delete

                          </button>

                        </div>

                        <audio
                          ref={(element) => {
                            audioElementRefs.current[
                              questionKey
                            ] =
                              element;
                          }}
                          src={
                            localVoiceUrl
                          }
                          preload="metadata"
                          onPlay={() =>
                            setPlayingReply(
                              questionKey,
                            )
                          }
                          onPause={() => {
                            if (
                              playingReply ===
                              questionKey
                            ) {
                              setPlayingReply(
                                null,
                              );
                            }
                          }}
                          onEnded={() =>
                            setPlayingReply(
                              null,
                            )
                          }
                          style={{
                            display:
                              "none",
                          }}
                        />

                        <div
                          style={{
                            display:
                              "flex",
                            alignItems:
                              "center",
                            gap: "10px",
                          }}
                        >

                          <button
                            type="button"
                            onClick={() =>
                              togglePlayback(
                                questionKey,
                              )
                            }
                            aria-label={
                              playingReply ===
                              questionKey
                                ? "Pause recorded voice"
                                : "Play recorded voice"
                            }
                            style={{
                              width:
                                "42px",
                              height:
                                "42px",
                              borderRadius:
                                "50%",
                              border:
                                "none",
                              background:
                                "#006ee6",
                              color:
                                "#ffffff",
                              display:
                                "inline-flex",
                              alignItems:
                                "center",
                              justifyContent:
                                "center",
                              cursor:
                                "pointer",
                              flexShrink:
                                0,
                            }}
                          >

                            {playingReply ===
                            questionKey ? (
                              <Pause
                                size={18}
                              />
                            ) : (
                              <Play
                                size={18}
                              />
                            )}

                          </button>

                          <div
                            style={{
                              flex: 1,
                            }}
                          >

                            <div
                              style={{
                                fontSize:
                                  "13px",
                                fontWeight:
                                  600,
                                marginBottom:
                                  "3px",
                              }}
                            >
                              {playingReply ===
                              questionKey
                                ? "Playing voice..."
                                : "Voice recording ready"}
                            </div>

                            <div
                              style={{
                                fontSize:
                                  "12px",
                                opacity:
                                  0.65,
                              }}
                            >
                              You can play or
                              delete this
                              recording before
                              sending.
                            </div>

                          </div>

                        </div>

                      </div>
                    )}

                    {/* =================================================
                        VOICE ERROR
                    ================================================= */}

                    {voiceError && (
                      <div
                        style={{
                          marginTop:
                            "10px",
                          padding:
                            "10px 12px",
                          borderRadius:
                            "8px",
                          background:
                            "#fff1f2",
                          border:
                            "1px solid #fecaca",
                          color:
                            "#b91c1c",
                          fontSize:
                            "13px",
                        }}
                      >
                        {voiceError}
                      </div>
                    )}

                    {/* =================================================
                        ACTION BUTTONS
                    ================================================= */}

                    <div
                      style={{
                        display:
                          "flex",
                        flexWrap:
                          "wrap",
                        gap: "10px",
                        marginTop:
                          "12px",
                      }}
                    >

                      {!isRecording ? (
                        <button
                          type="button"
                          onClick={() =>
                            startRecording(
                              questionKey,
                            )
                          }
                          disabled={
                            isSaving
                          }
                          style={{
                            display:
                              "inline-flex",
                            alignItems:
                              "center",
                            gap: "7px",
                            padding:
                              "10px 14px",
                            borderRadius:
                              "9px",
                            border:
                              "1px solid #d1d5db",
                            background:
                              "#ffffff",
                            color:
                              "#374151",
                            cursor:
                              isSaving
                                ? "not-allowed"
                                : "pointer",
                            fontFamily:
                              "inherit",
                            fontWeight:
                              500,
                          }}
                        >

                          <Mic
                            size={16}
                          />

                          Record Voice

                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={
                            stopRecording
                          }
                          style={{
                            display:
                              "inline-flex",
                            alignItems:
                              "center",
                            gap: "7px",
                            padding:
                              "10px 14px",
                            borderRadius:
                              "9px",
                            border:
                              "1px solid #d1d5db",
                            background:
                              "#ffffff",
                            color:
                              "#374151",
                            cursor:
                              "pointer",
                            fontFamily:
                              "inherit",
                            fontWeight:
                              500,
                          }}
                        >

                          <Square
                            size={15}
                          />

                          Stop Recording

                        </button>
                      )}

                      {localVoiceUrl && (
                        <button
                          type="button"
                          onClick={() =>
                            deleteRecording(
                              questionKey,
                            )
                          }
                          disabled={
                            isSaving
                          }
                          style={{
                            display:
                              "inline-flex",
                            alignItems:
                              "center",
                            gap: "7px",
                            padding:
                              "10px 14px",
                            borderRadius:
                              "9px",
                            border:
                              "1px solid #fecaca",
                            background:
                              "#fff1f2",
                            color:
                              "#b91c1c",
                            cursor:
                              isSaving
                                ? "not-allowed"
                                : "pointer",
                            fontFamily:
                              "inherit",
                            fontWeight:
                              500,
                          }}
                        >

                          <Trash2
                            size={16}
                          />

                          Delete Voice

                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() =>
                          saveDoctorReply(
                            item,
                          )
                        }
                        disabled={
                          isSaving
                        }
                        style={{
                          display:
                            "inline-flex",
                          alignItems:
                            "center",
                          gap: "7px",
                          padding:
                            "10px 16px",
                          borderRadius:
                            "9px",
                          border:
                            "none",
                          background:
                            "#006ee6",
                          color:
                            "#ffffff",
                          cursor:
                            isSaving
                              ? "not-allowed"
                              : "pointer",
                          fontFamily:
                            "inherit",
                          fontWeight:
                            600,
                          opacity:
                            isSaving
                              ? 0.7
                              : 1,
                        }}
                      >

                        <Send
                          size={16}
                        />

                        {isSaving
                          ? "Sending..."
                          : "Send Reply"}

                      </button>

                    </div>

                    {/* =================================================
                        RECORDING INDICATOR
                    ================================================= */}

                    {isRecording && (
                      <div
                        style={{
                          marginTop:
                            "12px",
                          display:
                            "flex",
                          alignItems:
                            "center",
                          gap: "8px",
                          padding:
                            "10px 12px",
                          borderRadius:
                            "9px",
                          background:
                            "#f8fafc",
                          border:
                            "1px solid #e5e7eb",
                          fontSize:
                            "13px",
                          fontWeight:
                            500,
                        }}
                      >

                        <span
                          style={{
                            width:
                              "9px",
                            height:
                              "9px",
                            borderRadius:
                              "50%",
                            background:
                              "#ef4444",
                            display:
                              "inline-block",
                          }}
                        />

                        Recording voice and
                        generating transcript...

                      </div>
                    )}

                  </div>

                </article>
              );
            },
          )}

        </div>
      )}

    </div>
  );
}