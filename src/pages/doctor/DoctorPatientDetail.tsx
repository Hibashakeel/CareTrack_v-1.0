import {
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { Link, useParams } from "react-router-dom";
import {
  Activity,
  ArrowLeft,
  CheckCircle2,
  ClipboardList,
  Clock3,
  Droplets,
  Eye,
  HeartPulse,
  Loader2,
  Mail,
  MessageCircleQuestion,
  Mic,
  NotebookPen,
  Phone,
  Pill,
  Play,
  Send,
  Square,
  Trash2,
  User,
  X,
} from "lucide-react";

import { get, push, ref, set } from "firebase/database";

import { useAuth } from "../../context/AuthContext";
import { db } from "../../lib/firebase";

import "../../patient-pages.css";

/* =========================================================
   TYPES
========================================================= */

interface PatientProfile {
  uid?: string;
  fullName?: string;
  name?: string;
  displayName?: string;
  email?: string;
  phone?: string;
  role?: string;
  gender?: string;
  age?: string | number;
  bloodGroup?: string;
}

interface DailyReport {
  id?: string;
  date?: string | number;
  createdAt?: string | number;
  timestamp?: string | number;
  submittedAt?: string | number;
  recordedAt?: string | number;
  pain?: string | number;
  painLevel?: string | number;
  symptoms?: string;
  food?: string;
  meals?: string;
  meal?: string;
  water?: string | number;
  waterConsumption?: string | number;
  medicineTaken?: boolean | string;
  medication?: string;
  medicine?: string;
  medicineGiven?: string;
  notes?: string;
  dailyNotes?: string;
}

interface VitalRecord {
  id?: string;
  temperature?: string | number;
  temp?: string | number;
  heartRate?: string | number;
  pulse?: string | number;
  bloodPressure?: string;
  bp?: string;
  oxygenLevel?: string | number;
  oxygenSaturation?: string | number;
  oxygen?: string | number;
  spo2?: string | number;
  respiratoryRate?: string | number;
  respirationRate?: string | number;
  respiratory?: string | number;
  recordedAt?: string | number;
  createdAt?: string | number;
  timestamp?: string | number;
  date?: string | number;
  severity?: string;
}

interface NurseNote {
  id?: string;
  note?: string;
  text?: string;
  content?: string;
  message?: string;
  createdAt?: string | number;
  timestamp?: string | number;
  recordedAt?: string | number;
  date?: string | number;
  nurseName?: string;
  createdBy?: string;
  nurse?: string;
  createdByName?: string;
  authorName?: string;
  userName?: string;
  author?: string;
  name?: string;
  fullName?: string;
  displayName?: string;
  nurseFullName?: string;
  staffName?: string;
}

interface PatientQuestion {
  id: string;

  /* Doctor question */
  question: string;
  doctor: string;
  doctorId?: string;

  questionVoiceUrl?: string;
  questionVoiceFileName?: string;
  questionTranscript?: string;
  questionResponseType?:
    | "text"
    | "voice"
    | "text-and-voice"
    | "";

  date?: string | number;
  createdAt?: string | number;

  /* Patient answer */
  status?: "Pending" | "Answered";
  answer?: string;
  transcript?: string;
  voiceUrl?: string;
  voiceFileName?: string;
  responseType?: "text" | "voice" | "text-and-voice" | "";
  answeredAt?: string | number;

  /* Existing reply fields */
  replyVoiceUrl?: string;
  replyVoiceFileName?: string;
  replyTranscript?: string;
  replyAt?: string | number;
  replyBy?: string;
}

type OpenSection =
  | "reports"
  | "vitals"
  | "notes"
  | "questions"
  | null;

interface UserRecord {
  uid?: string;
  name?: string;
  fullName?: string;
  displayName?: string;
  role?: string;
}

/* =========================================================
   HELPERS
========================================================= */

function getTime(value: unknown): string {
  if (
    value === undefined ||
    value === null ||
    value === ""
  ) {
    return "Date not available";
  }

  const date = new Date(
    typeof value === "number"
      ? value
      : String(value),
  );

  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  return date.toLocaleString();
}

function getRecordTime(record: any): string {
  return getTime(
    record?.recordedAt ??
      record?.createdAt ??
      record?.timestamp ??
      record?.submittedAt ??
      record?.date ??
      record?.updatedAt,
  );
}

function displayValue(
  value: unknown,
  fallback = "Not recorded",
): string {
  if (
    value === undefined ||
    value === null ||
    value === ""
  ) {
    return fallback;
  }

  return String(value);
}

/* =========================================================
   NORMALIZERS
========================================================= */

function normalizeReports(data: any): DailyReport[] {
  if (!data) return [];

  if (Array.isArray(data)) {
    return data.map((item, index) => ({
      ...(item || {}),
      id: item?.id || String(index),
    }));
  }

  if (typeof data === "object") {
    const looksLikeSingleReport =
      "pain" in data ||
      "painLevel" in data ||
      "symptoms" in data ||
      "food" in data ||
      "meals" in data ||
      "meal" in data ||
      "water" in data ||
      "waterConsumption" in data ||
      "medicineTaken" in data ||
      "medication" in data ||
      "medicine" in data ||
      "notes" in data ||
      "dailyNotes" in data;

    if (looksLikeSingleReport) {
      return [
        {
          ...data,
          id: data.id || "report-1",
        },
      ];
    }

    return Object.entries(data).map(
      ([id, value]) => ({
        ...(value as object),
        id,
      }),
    ) as DailyReport[];
  }

  return [];
}

function normalizeVitals(data: any): VitalRecord[] {
  if (!data) return [];

  if (Array.isArray(data)) {
    return data.map((item, index) => ({
      ...(item || {}),
      id: item?.id || String(index),
    }));
  }

  if (typeof data === "object") {
    const looksLikeSingleVital =
      "temperature" in data ||
      "temp" in data ||
      "heartRate" in data ||
      "pulse" in data ||
      "bloodPressure" in data ||
      "bp" in data ||
      "oxygenLevel" in data ||
      "oxygenSaturation" in data ||
      "oxygen" in data ||
      "spo2" in data ||
      "respiratoryRate" in data ||
      "respirationRate" in data ||
      "respiratory" in data ||
      "severity" in data;

    if (looksLikeSingleVital) {
      return [
        {
          ...data,
          id: data.id || "vital-1",
        },
      ];
    }

    return Object.entries(data).map(
      ([id, value]) => ({
        ...(value as object),
        id,
      }),
    ) as VitalRecord[];
  }

  return [];
}

function normalizeNotes(data: any): NurseNote[] {
  if (!data) return [];

  if (Array.isArray(data)) {
    return data.map((item, index) => ({
      ...(item || {}),
      id: item?.id || String(index),
    }));
  }

  if (typeof data === "object") {
    const looksLikeSingleNote =
      "note" in data ||
      "text" in data ||
      "content" in data ||
      "message" in data ||
      "nurseName" in data ||
      "nurse" in data ||
      "createdBy" in data ||
      "createdByName" in data ||
      "authorName" in data ||
      "userName" in data ||
      "name" in data ||
      "fullName" in data ||
      "displayName" in data;

    if (looksLikeSingleNote) {
      return [
        {
          ...data,
          id: data.id || "note-1",
        },
      ];
    }

    return Object.entries(data).map(
      ([id, value]) => ({
        ...(value as object),
        id,
      }),
    ) as NurseNote[];
  }

  return [];
}

/* =========================================================
   REPORT HELPERS
========================================================= */

function getReportMedicine(report: DailyReport) {
  if (typeof report.medicineTaken === "boolean") {
    return report.medicineTaken
      ? "Taken"
      : "Not taken";
  }

  return (
    report.medicineTaken ||
    report.medication ||
    report.medicine ||
    report.medicineGiven ||
    "Not recorded"
  );
}

function getReportPain(report: DailyReport) {
  return (
    report.painLevel ??
    report.pain ??
    "Not recorded"
  );
}

function getReportFood(report: DailyReport) {
  return (
    report.food ||
    report.meals ||
    report.meal ||
    "Not recorded"
  );
}

function getReportWater(report: DailyReport) {
  return (
    report.waterConsumption ??
    report.water ??
    "Not recorded"
  );
}

function getReportSymptoms(report: DailyReport) {
  return (
    report.symptoms ||
    "No symptoms recorded"
  );
}

function getReportNotes(report: DailyReport) {
  return (
    report.dailyNotes ||
    report.notes ||
    ""
  );
}

/* =========================================================
   NURSE NAME HELPERS
========================================================= */

function getNameFromUser(
  userRecord: UserRecord | undefined,
): string {
  if (!userRecord) {
    return "";
  }

  return (
    userRecord.fullName ||
    userRecord.name ||
    userRecord.displayName ||
    ""
  );
}

function getNurseName(
  note: NurseNote,
  usersMap: Record<string, UserRecord>,
): string {
  const directName =
    note.nurseName ||
    note.fullName ||
    note.name ||
    note.displayName ||
    note.nurse ||
    note.createdByName ||
    note.authorName ||
    note.userName ||
    note.author ||
    note.nurseFullName ||
    note.staffName;

  if (
    directName &&
    String(directName)
      .trim()
      .toLowerCase() !== "nurse"
  ) {
    return String(directName);
  }

  const createdBy = note.createdBy;

  if (createdBy) {
    const matchingUser =
      usersMap[String(createdBy)];

    const firebaseUserName =
      getNameFromUser(
        matchingUser,
      );

    if (firebaseUserName) {
      return firebaseUserName;
    }
  }

  return "Nurse";
}

function getNurseNoteText(
  note: NurseNote,
): string {
  return (
    note.note ||
    note.text ||
    note.content ||
    note.message ||
    "No note content available."
  );
}

/* =========================================================
   INFO ITEM
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
    <div className="doctor-info-box">
      <div className="doctor-info-icon">
        {icon}
      </div>

      <div>
        <span>{label}</span>
        <strong>{value}</strong>
      </div>
    </div>
  );
}

/* =========================================================
   MAIN COMPONENT
========================================================= */

export default function DoctorPatientDetail() {
  const { patientId } = useParams();
  const { user } = useAuth();

  const [patient, setPatient] =
    useState<PatientProfile | null>(null);

  const [reports, setReports] =
    useState<DailyReport[]>([]);

  const [vitals, setVitals] =
    useState<VitalRecord[]>([]);

  const [notes, setNotes] =
    useState<NurseNote[]>([]);

  const [questions, setQuestions] =
    useState<PatientQuestion[]>([]);

  const [usersMap, setUsersMap] =
    useState<Record<string, UserRecord>>({});

  const [loading, setLoading] =
    useState(true);

  const [openSection, setOpenSection] =
    useState<OpenSection>(null);

  const [
    showPatientInfo,
    setShowPatientInfo,
  ] = useState(false);

  /* =======================================================
     QUESTION COMPOSER
  ======================================================= */

  const [
    showQuestionComposer,
    setShowQuestionComposer,
  ] = useState(false);

  const [
    questionText,
    setQuestionText,
  ] = useState("");

  const [
    questionError,
    setQuestionError,
  ] = useState("");

  const [
    questionSuccess,
    setQuestionSuccess,
  ] = useState("");

  const [
    sendingQuestion,
    setSendingQuestion,
  ] = useState(false);

  /* =======================================================
     QUESTION VOICE RECORDING
  ======================================================= */

  const [
    questionVoiceUrl,
    setQuestionVoiceUrl,
  ] = useState("");

  const [
    questionVoiceFileName,
    setQuestionVoiceFileName,
  ] = useState("");

  const [
    questionTranscript,
    setQuestionTranscript,
  ] = useState("");

  const [
    isRecordingQuestion,
    setIsRecordingQuestion,
  ] = useState(false);

  const [
    isTranscribingQuestion,
    setIsTranscribingQuestion,
  ] = useState(false);

  const questionRecorderRef =
    useRef<MediaRecorder | null>(null);

  const questionChunksRef =
    useRef<Blob[]>([]);

  const questionStreamRef =
    useRef<MediaStream | null>(null);

  const questionRecognitionRef =
    useRef<any>(null);

  const questionFinalTranscriptRef =
    useRef("");

  const questionInterimTranscriptRef =
    useRef("");

  /* =======================================================
     LOAD DATA
  ======================================================= */

  useEffect(() => {
    if (!patientId) {
      return;
    }

    let mounted = true;

    async function loadData() {
      setLoading(true);

      try {
        const [
          patientSnapshot,
          reportsSnapshot,
          vitalsSnapshot,
          notesSnapshot,
          usersSnapshot,
          questionsSnapshot,
        ] = await Promise.all([
          get(
            ref(
              db,
              `users/${patientId}`,
            ),
          ),

          get(
            ref(
              db,
              `patientDailyReports/${patientId}`,
            ),
          ),

          get(
            ref(
              db,
              `patientMonitoring/${patientId}`,
            ),
          ),

          get(
            ref(
              db,
              `nurseNotes/${patientId}`,
            ),
          ),

          get(ref(db, "users")),

          get(
            ref(
              db,
              `patientQuestions/${patientId}`,
            ),
          ),
        ]);

        if (!mounted) {
          return;
        }

        /* PATIENT */

        if (patientSnapshot.exists()) {
          setPatient({
            uid: patientId,
            ...patientSnapshot.val(),
          });
        } else {
          setPatient(null);
        }

        /* REPORTS */

        if (reportsSnapshot.exists()) {
          setReports(
            normalizeReports(
              reportsSnapshot.val(),
            ),
          );
        } else {
          setReports([]);
        }

        /* VITALS */

        if (vitalsSnapshot.exists()) {
          setVitals(
            normalizeVitals(
              vitalsSnapshot.val(),
            ),
          );
        } else {
          setVitals([]);
        }

        /* NURSE NOTES */

        if (notesSnapshot.exists()) {
          setNotes(
            normalizeNotes(
              notesSnapshot.val(),
            ),
          );
        } else {
          setNotes([]);
        }

        /* USERS MAP */

        if (usersSnapshot.exists()) {
          const usersData =
            usersSnapshot.val();

          const map: Record<
            string,
            UserRecord
          > = {};

          Object.entries(
            usersData || {},
          ).forEach(
            ([uid, value]) => {
              if (
                value &&
                typeof value === "object"
              ) {
                map[uid] = {
                  uid,
                  ...(value as object),
                };
              }
            },
          );

          setUsersMap(map);
        } else {
          setUsersMap({});
        }

        /* QUESTIONS */

        if (questionsSnapshot.exists()) {
          const questionData =
            questionsSnapshot.val();

          const loadedQuestions: PatientQuestion[] =
            Object.entries(
              questionData || {},
            ).map(
              ([id, value]: [
                string,
                any,
              ]) => ({
                id,

                question:
                  value?.question || "",

                doctor:
                  value?.doctor ||
                  "Doctor",

                doctorId:
                  value?.doctorId || "",

                questionVoiceUrl:
                  value?.questionVoiceUrl ||
                  "",

                questionVoiceFileName:
                  value?.questionVoiceFileName ||
                  "",

                questionTranscript:
                  value?.questionTranscript ||
                  "",

                questionResponseType:
                  value?.questionResponseType ||
                  "",

                date:
                  value?.date ||
                  value?.createdAt ||
                  "",

                createdAt:
                  value?.createdAt || "",

                status:
                  value?.status ||
                  "Pending",

                answer:
                  value?.answer || "",

                transcript:
                  value?.transcript || "",

                voiceUrl:
                  value?.voiceUrl || "",

                voiceFileName:
                  value?.voiceFileName ||
                  "",

                responseType:
                  value?.responseType || "",

                answeredAt:
                  value?.answeredAt || "",

                replyVoiceUrl:
                  value?.replyVoiceUrl || "",

                replyVoiceFileName:
                  value?.replyVoiceFileName ||
                  "",

                replyTranscript:
                  value?.replyTranscript ||
                  "",

                replyAt:
                  value?.replyAt || "",

                replyBy:
                  value?.replyBy || "",
              }),
            );

          loadedQuestions.sort(
            (a, b) =>
              new Date(
                String(
                  b.date ||
                    b.createdAt ||
                    "",
                ),
              ).getTime() -
              new Date(
                String(
                  a.date ||
                    a.createdAt ||
                    "",
                ),
              ).getTime(),
          );

          setQuestions(
            loadedQuestions,
          );
        } else {
          setQuestions([]);
        }
      } catch (error) {
        console.error(
          "Failed to load patient detail:",
          error,
        );

        if (mounted) {
          setPatient(null);
          setReports([]);
          setVitals([]);
          setNotes([]);
          setQuestions([]);
          setUsersMap({});
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadData();

    return () => {
      mounted = false;
    };
  }, [patientId]);

  /* =======================================================
     CLEANUP RECORDING
  ======================================================= */

  useEffect(() => {
    return () => {
      try {
        questionRecognitionRef.current?.stop();
      } catch {
        // Ignore recognition cleanup errors.
      }

      try {
        questionRecorderRef.current?.stop();
      } catch {
        // Ignore recorder cleanup errors.
      }

      questionStreamRef.current
        ?.getTracks()
        .forEach((track) => {
          track.stop();
        });
    };
  }, []);

  /* =======================================================
     RESET QUESTION COMPOSER
  ======================================================= */

  function resetQuestionComposer() {
    try {
      questionRecognitionRef.current?.stop();
    } catch {
      // Ignore.
    }

    try {
      if (
        questionRecorderRef.current &&
        questionRecorderRef.current.state !==
          "inactive"
      ) {
        questionRecorderRef.current.stop();
      }
    } catch {
      // Ignore.
    }

    questionStreamRef.current
      ?.getTracks()
      .forEach((track) => {
        track.stop();
      });

    questionStreamRef.current = null;

    questionRecorderRef.current = null;

    questionChunksRef.current = [];

    questionRecognitionRef.current = null;

    questionFinalTranscriptRef.current = "";

    questionInterimTranscriptRef.current = "";

    setIsRecordingQuestion(false);
    setIsTranscribingQuestion(false);

    setQuestionText("");
    setQuestionVoiceUrl("");
    setQuestionVoiceFileName("");
    setQuestionTranscript("");
    setQuestionError("");
    setQuestionSuccess("");
  }

  /* =======================================================
     START SPEECH RECOGNITION
  ======================================================= */

  function startQuestionSpeechRecognition() {
    const SpeechRecognitionConstructor =
      (window as any).SpeechRecognition ||
      (window as any)
        .webkitSpeechRecognition;

    if (!SpeechRecognitionConstructor) {
      setIsTranscribingQuestion(false);
      return;
    }

    try {
      const recognition =
        new SpeechRecognitionConstructor();

      questionRecognitionRef.current =
        recognition;

      questionFinalTranscriptRef.current =
        "";

      questionInterimTranscriptRef.current =
        "";

      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = "en-US";

      recognition.onstart = () => {
        setIsTranscribingQuestion(true);
      };

      recognition.onresult = (
        event: any,
      ) => {
        let interim = "";

        for (
          let i = event.resultIndex;
          i < event.results.length;
          i++
        ) {
          const transcript =
            event.results[i][0]
              ?.transcript || "";

          if (
            event.results[i].isFinal
          ) {
            questionFinalTranscriptRef.current +=
              transcript + " ";
          } else {
            interim += transcript;
          }
        }

        questionInterimTranscriptRef.current =
          interim;

        setQuestionTranscript(
          (
            questionFinalTranscriptRef.current +
            questionInterimTranscriptRef.current
          ).trim(),
        );
      };

      recognition.onerror = (
        event: any,
      ) => {
        console.warn(
          "Speech recognition error:",
          event?.error,
        );

        setIsTranscribingQuestion(false);
      };

      recognition.onend = () => {
        setIsTranscribingQuestion(false);
      };

      recognition.start();
    } catch (error) {
      console.warn(
        "Speech recognition could not start:",
        error,
      );

      setIsTranscribingQuestion(false);
    }
  }

  /* =======================================================
     STOP SPEECH RECOGNITION
  ======================================================= */

  function stopQuestionSpeechRecognition() {
    try {
      questionRecognitionRef.current?.stop();
    } catch {
      // Ignore.
    }

    questionRecognitionRef.current =
      null;

    setIsTranscribingQuestion(false);
  }

  /* =======================================================
     START QUESTION RECORDING
  ======================================================= */

  async function startQuestionRecording() {
    setQuestionError("");
    setQuestionSuccess("");

    if (
      typeof navigator === "undefined" ||
      !navigator.mediaDevices ||
      !navigator.mediaDevices.getUserMedia
    ) {
      setQuestionError(
        "Voice recording is not supported by this browser.",
      );
      return;
    }

    if (
      typeof MediaRecorder ===
      "undefined"
    ) {
      setQuestionError(
        "Media recording is not supported by this browser.",
      );
      return;
    }

    try {
      const stream =
        await navigator.mediaDevices.getUserMedia(
          {
            audio: true,
          },
        );

      questionStreamRef.current =
        stream;

      questionChunksRef.current = [];

      let recorderOptions:
        | MediaRecorderOptions
        | undefined;

      if (
        MediaRecorder.isTypeSupported(
          "audio/webm;codecs=opus",
        )
      ) {
        recorderOptions = {
          mimeType:
            "audio/webm;codecs=opus",
        };
      } else if (
        MediaRecorder.isTypeSupported(
          "audio/webm",
        )
      ) {
        recorderOptions = {
          mimeType: "audio/webm",
        };
      }

      const recorder =
        recorderOptions
          ? new MediaRecorder(
              stream,
              recorderOptions,
            )
          : new MediaRecorder(stream);

      questionRecorderRef.current =
        recorder;

      recorder.ondataavailable = (
        event: BlobEvent,
      ) => {
        if (
          event.data &&
          event.data.size > 0
        ) {
          questionChunksRef.current.push(
            event.data,
          );
        }
      };

      recorder.onstop = () => {
        const mimeType =
          recorder.mimeType ||
          "audio/webm";

        const audioBlob =
          new Blob(
            questionChunksRef.current,
            {
              type: mimeType,
            },
          );

        questionChunksRef.current = [];

        /* Approx. 3 MB raw recording limit */
        const MAX_AUDIO_SIZE =
          3 * 1024 * 1024;

        if (
          audioBlob.size >
          MAX_AUDIO_SIZE
        ) {
          setQuestionError(
            "Recording is too large. Please record a shorter voice question.",
          );

          setQuestionVoiceUrl("");
          setQuestionVoiceFileName("");

          questionStreamRef.current
            ?.getTracks()
            .forEach((track) => {
              track.stop();
            });

          questionStreamRef.current =
            null;

          return;
        }

        const reader =
          new FileReader();

        reader.onloadend = () => {
          const result =
            reader.result;

          if (
            typeof result ===
            "string"
          ) {
            setQuestionVoiceUrl(
              result,
            );

            setQuestionVoiceFileName(
              `doctor-question-${Date.now()}.webm`,
            );
          }
        };

        reader.readAsDataURL(
          audioBlob,
        );

        questionStreamRef.current
          ?.getTracks()
          .forEach((track) => {
            track.stop();
          });

        questionStreamRef.current =
          null;

        setIsRecordingQuestion(false);
      };

      recorder.onerror = () => {
        setQuestionError(
          "Unable to record the voice. Please try again.",
        );

        setIsRecordingQuestion(false);

        questionStreamRef.current
          ?.getTracks()
          .forEach((track) => {
            track.stop();
          });

        questionStreamRef.current =
          null;
      };

      recorder.start();

      setIsRecordingQuestion(true);

      startQuestionSpeechRecognition();
    } catch (error) {
      console.error(
        "Microphone access error:",
        error,
      );

      setQuestionError(
        "Microphone permission was not granted. Please allow microphone access and try again.",
      );

      setIsRecordingQuestion(false);
    }
  }

  /* =======================================================
     STOP QUESTION RECORDING
  ======================================================= */

  function stopQuestionRecording() {
    stopQuestionSpeechRecognition();

    const recorder =
      questionRecorderRef.current;

    if (
      recorder &&
      recorder.state !== "inactive"
    ) {
      recorder.stop();
    } else {
      questionStreamRef.current
        ?.getTracks()
        .forEach((track) => {
          track.stop();
        });

      questionStreamRef.current =
        null;

      setIsRecordingQuestion(false);
    }
  }

  /* =======================================================
     DELETE QUESTION RECORDING
  ======================================================= */

  function deleteQuestionRecording() {
    if (isRecordingQuestion) {
      stopQuestionRecording();
    }

    setQuestionVoiceUrl("");
    setQuestionVoiceFileName("");
    setQuestionTranscript("");

    questionFinalTranscriptRef.current =
      "";

    questionInterimTranscriptRef.current =
      "";

    setQuestionError("");
    setQuestionSuccess("");
  }

  /* =======================================================
     SEND QUESTION
  ======================================================= */

  async function sendQuestion() {
    const cleanQuestion =
      questionText.trim();

    const cleanTranscript =
      questionTranscript.trim();

    const hasVoice =
      Boolean(
        questionVoiceUrl.trim(),
      );

    setQuestionError("");
    setQuestionSuccess("");

    if (
      !cleanQuestion &&
      !hasVoice
    ) {
      setQuestionError(
        "Please type a question or record a voice question.",
      );
      return;
    }

    if (isRecordingQuestion) {
      setQuestionError(
        "Please stop the recording before sending the question.",
      );
      return;
    }

    if (
      !patientId ||
      !user?.uid
    ) {
      setQuestionError(
        "Doctor information is not available.",
      );
      return;
    }

    setSendingQuestion(true);

    try {
      const questionRef =
        push(
          ref(
            db,
            `patientQuestions/${patientId}`,
          ),
        );

      const createdDate =
        new Date().toISOString();

      const doctorName =
        user.displayName ||
        (user as any)?.fullName ||
        (user as any)?.name ||
        "Doctor";

      let questionResponseType:
        | "text"
        | "voice"
        | "text-and-voice";

      if (
        cleanQuestion &&
        hasVoice
      ) {
        questionResponseType =
          "text-and-voice";
      } else if (hasVoice) {
        questionResponseType =
          "voice";
      } else {
        questionResponseType =
          "text";
      }

      const questionData = {
        /* =================================================
           DOCTOR QUESTION
        ================================================= */

        question:
          cleanQuestion,

        questionVoiceUrl:
          questionVoiceUrl || "",

        questionVoiceFileName:
          questionVoiceFileName || "",

        questionTranscript:
          cleanTranscript,

        questionResponseType,

        /* =================================================
           PATIENT INFORMATION
        ================================================= */

        patientName:
          patient?.fullName ||
          patient?.name ||
          "Patient",

        patientId,

        /* =================================================
           DOCTOR INFORMATION
        ================================================= */

        doctor:
          doctorName,

        doctorId:
          user.uid,

        date:
          createdDate,

        createdAt:
          createdDate,

        /* =================================================
           PATIENT ANSWER
           THESE FIELDS ARE UNCHANGED
        ================================================= */

        status:
          "Pending",

        answer:
          "",

        transcript:
          "",

        voiceUrl:
          "",

        voiceFileName:
          "",

        responseType:
          "",

        answeredAt:
          "",

        /* =================================================
           EXISTING REPLY FIELDS
        ================================================= */

        replyVoiceUrl:
          "",

        replyVoiceFileName:
          "",

        replyTranscript:
          "",

        replyAt:
          "",

        replyBy:
          "",
      };

      await set(
        questionRef,
        questionData,
      );

      /* =================================================
         IMMEDIATELY SHOW NEW QUESTION
      ================================================= */

      setQuestions((current) => [
        {
          id:
            questionRef.key ||
            Date.now().toString(),

          question:
            cleanQuestion,

          doctor:
            doctorName,

          doctorId:
            user.uid,

          questionVoiceUrl:
            questionVoiceUrl || "",

          questionVoiceFileName:
            questionVoiceFileName ||
            "",

          questionTranscript:
            cleanTranscript,

          questionResponseType,

          date:
            createdDate,

          createdAt:
            createdDate,

          status:
            "Pending",

          /* Patient answer fields */
          answer:
            "",

          transcript:
            "",

          voiceUrl:
            "",

          voiceFileName:
            "",

          responseType:
            "",

          answeredAt:
            "",

          replyVoiceUrl:
            "",

          replyVoiceFileName:
            "",

          replyTranscript:
            "",

          replyAt:
            "",

          replyBy:
            "",
        },
        ...current,
      ]);

      setQuestionText("");
      setQuestionVoiceUrl("");
      setQuestionVoiceFileName("");
      setQuestionTranscript("");

      questionFinalTranscriptRef.current =
        "";

      questionInterimTranscriptRef.current =
        "";

      setQuestionSuccess(
        "Question sent successfully.",
      );

      setTimeout(() => {
        setShowQuestionComposer(
          false,
        );

        setQuestionSuccess("");
      }, 1200);
    } catch (error) {
      console.error(
        "Failed to send question:",
        error,
      );

      setQuestionError(
        "Unable to send question. Please try again.",
      );
    } finally {
      setSendingQuestion(false);
    }
  }

  /* =======================================================
     TOGGLE
  ======================================================= */

  function toggleSection(
    section: OpenSection,
  ) {
    setOpenSection(
      (current) =>
        current === section
          ? null
          : section,
    );
  }

  const patientName =
    patient?.fullName ||
    patient?.name ||
    patient?.displayName ||
    "Patient";

  /* =======================================================
     LOADING
  ======================================================= */

  if (loading) {
    return (
      <div className="doctor-page">
        <div className="doctor-loading-card">
          <Loader2
            className="doctor-loading-spinner"
            size={22}
          />

          <span>
            Loading patient information...
          </span>
        </div>
      </div>
    );
  }

  /* =======================================================
     PATIENT NOT FOUND
  ======================================================= */

  if (!patient) {
    return (
      <div className="doctor-page">
        <div className="doctor-empty-card">
          <User size={42} />

          <h2>
            Patient Not Found
          </h2>

          <p>
            The requested patient
            information could not
            be found.
          </p>

          <Link
            to="/doctor/patients"
            className="doctor-primary-btn"
          >
            <ArrowLeft size={16} />
            Back to Patients
          </Link>
        </div>
      </div>
    );
  }

  /* =======================================================
     PAGE
  ======================================================= */

  return (
    <div className="doctor-page">

      {/* =================================================
          HEADER
      ================================================= */}

      <div className="doctor-detail-header">

        <Link
          to="/doctor/patients"
          className="doctor-back-link"
        >
          <ArrowLeft size={17} />
          Back to Patients
        </Link>

        <div className="doctor-title-row">

          <div className="doctor-patient-avatar">
            <User size={30} />
          </div>

          <div>
            <h1>
              {patientName}
            </h1>

            <p>
              Patient Medical Record
            </p>
          </div>

        </div>
      </div>

      {/* =================================================
          SUMMARY CARDS
      ================================================= */}

      <div
        className="doctor-summary-grid"
        style={{
          gridTemplateColumns:
            "repeat(4, minmax(0, 1fr))",
          gap: "16px",
        }}
      >

        <button
          type="button"
          className={`doctor-summary-card ${
            openSection === "reports"
              ? "active"
              : ""
          }`}
          onClick={() =>
            toggleSection("reports")
          }
        >
          <div className="doctor-summary-icon">
            <ClipboardList size={22} />
          </div>

          <div>
            <strong>
              Daily Reports
            </strong>

            <span>
              {reports.length} record
              {reports.length !== 1
                ? "s"
                : ""}
            </span>
          </div>
        </button>

        <button
          type="button"
          className={`doctor-summary-card ${
            openSection === "vitals"
              ? "active"
              : ""
          }`}
          onClick={() =>
            toggleSection("vitals")
          }
        >
          <div className="doctor-summary-icon">
            <HeartPulse size={22} />
          </div>

          <div>
            <strong>
              Vital Records
            </strong>

            <span>
              {vitals.length} record
              {vitals.length !== 1
                ? "s"
                : ""}
            </span>
          </div>
        </button>

        <button
          type="button"
          className={`doctor-summary-card ${
            openSection === "notes"
              ? "active"
              : ""
          }`}
          onClick={() =>
            toggleSection("notes")
          }
        >
          <div className="doctor-summary-icon">
            <NotebookPen size={22} />
          </div>

          <div>
            <strong>
              Nurse Notes
            </strong>

            <span>
              {notes.length} note
              {notes.length !== 1
                ? "s"
                : ""}
            </span>
          </div>
        </button>

        <button
          type="button"
          className={`doctor-summary-card ${
            openSection === "questions"
              ? "active"
              : ""
          }`}
          onClick={() =>
            toggleSection("questions")
          }
        >
          <div className="doctor-summary-icon">
            <MessageCircleQuestion
              size={22}
            />
          </div>

          <div>
            <strong>
              Questions & Answers
            </strong>

            <span>
              {questions.length} question
              {questions.length !== 1
                ? "s"
                : ""}
            </span>
          </div>
        </button>

      </div>

      {/* =================================================
          DAILY REPORTS
      ================================================= */}

      {openSection === "reports" && (
        <section className="doctor-section-card">

          <div className="doctor-section-heading">

            <div>
              <h2>
                <ClipboardList size={20} />
                Daily Reports
              </h2>

              <p>
                Patient self-reported
                daily information.
              </p>
            </div>

            <span className="doctor-result-count">
              {reports.length} record
              {reports.length !== 1
                ? "s"
                : ""}
            </span>

          </div>

          {reports.length === 0 ? (
            <div className="doctor-empty-inline">
              No daily reports have
              been recorded yet.
            </div>
          ) : (
            <div className="doctor-report-detail-grid">

              {reports.map(
                (report, index) => (
                  <div
                    className="doctor-record-card doctor-horizontal-record-card"
                    key={
                      report.id ||
                      index
                    }
                  >

                    <div className="doctor-horizontal-record-header">

                      <div className="doctor-record-main-icon">
                        <ClipboardList
                          size={22}
                        />
                      </div>

                      <div>
                        <strong>
                          Daily Report #
                          {reports.length -
                            index}
                        </strong>

                        <span>
                          <Clock3 size={13} />
                          {getRecordTime(
                            report,
                          )}
                        </span>
                      </div>

                    </div>

                    <div className="doctor-horizontal-record-items">

                      <div className="doctor-horizontal-item">
                        <div className="doctor-small-icon">
                          <Activity size={17} />
                        </div>

                        <div>
                          <span>
                            Pain Level
                          </span>

                          <strong>
                            {displayValue(
                              getReportPain(
                                report,
                              ),
                            )}
                          </strong>
                        </div>
                      </div>

                      <div className="doctor-horizontal-item">
                        <div className="doctor-small-icon">
                          <ClipboardList
                            size={17}
                          />
                        </div>

                        <div>
                          <span>
                            Food / Meals
                          </span>

                          <strong>
                            {displayValue(
                              getReportFood(
                                report,
                              ),
                            )}
                          </strong>
                        </div>
                      </div>

                      <div className="doctor-horizontal-item">
                        <div className="doctor-small-icon">
                          <Droplets size={17} />
                        </div>

                        <div>
                          <span>
                            Water
                          </span>

                          <strong>
                            {displayValue(
                              getReportWater(
                                report,
                              ),
                            )}
                          </strong>
                        </div>
                      </div>

                      <div className="doctor-horizontal-item">
                        <div className="doctor-small-icon">
                          <Pill size={17} />
                        </div>

                        <div>
                          <span>
                            Medicine
                          </span>

                          <strong>
                            {displayValue(
                              getReportMedicine(
                                report,
                              ),
                            )}
                          </strong>
                        </div>
                      </div>

                      <div className="doctor-horizontal-item doctor-horizontal-wide">
                        <div className="doctor-small-icon">
                          <HeartPulse
                            size={17}
                          />
                        </div>

                        <div>
                          <span>
                            Symptoms
                          </span>

                          <strong>
                            {displayValue(
                              getReportSymptoms(
                                report,
                              ),
                            )}
                          </strong>
                        </div>
                      </div>

                    </div>

                    {getReportNotes(
                      report,
                    ) && (
                      <div className="doctor-record-note">
                        <strong>
                          Patient Notes
                        </strong>

                        <p>
                          {getReportNotes(
                            report,
                          )}
                        </p>
                      </div>
                    )}

                  </div>
                ),
              )}

            </div>
          )}

        </section>
      )}

      {/* =================================================
          VITAL RECORDS
      ================================================= */}

      {openSection === "vitals" && (
        <section className="doctor-section-card">

          <div className="doctor-section-heading">

            <div>
              <h2>
                <HeartPulse size={20} />
                Vital Records
              </h2>

              <p>
                Patient vital information
                recorded by the care team.
              </p>
            </div>

            <span className="doctor-result-count">
              {vitals.length} record
              {vitals.length !== 1
                ? "s"
                : ""}
            </span>

          </div>

          {vitals.length === 0 ? (
            <div className="doctor-empty-inline">
              No vital records have
              been recorded yet.
            </div>
          ) : (
            <div className="doctor-vital-grid">

              {vitals.map(
                (vital, index) => (
                  <div
                    className="doctor-vital-box doctor-horizontal-vital-card"
                    key={
                      vital.id ||
                      index
                    }
                  >

                    <div className="doctor-horizontal-vital-header">

                      <div className="doctor-record-main-icon">
                        <HeartPulse size={22} />
                      </div>

                      <div>
                        <strong>
                          Vital Record #
                          {vitals.length -
                            index}
                        </strong>

                        <span>
                          <Clock3 size={13} />
                          {getRecordTime(
                            vital,
                          )}
                        </span>
                      </div>

                      {vital.severity && (
                        <span className="doctor-severity-badge">
                          {vital.severity}
                        </span>
                      )}

                    </div>

                    <div className="doctor-horizontal-vital-items">

                      <div className="doctor-horizontal-item">
                        <div className="doctor-small-icon">
                          <Activity size={17} />
                        </div>

                        <div>
                          <span>
                            Temperature
                          </span>

                          <strong>
                            {displayValue(
                              vital.temperature ??
                                vital.temp,
                            )}
                          </strong>
                        </div>
                      </div>

                      <div className="doctor-horizontal-item">
                        <div className="doctor-small-icon">
                          <HeartPulse size={17} />
                        </div>

                        <div>
                          <span>
                            Heart Rate
                          </span>

                          <strong>
                            {displayValue(
                              vital.heartRate ??
                                vital.pulse,
                            )}
                          </strong>
                        </div>
                      </div>

                      <div className="doctor-horizontal-item">
                        <div className="doctor-small-icon">
                          <Activity size={17} />
                        </div>

                        <div>
                          <span>
                            Blood Pressure
                          </span>

                          <strong>
                            {displayValue(
                              vital.bloodPressure ??
                                vital.bp,
                            )}
                          </strong>
                        </div>
                      </div>

                      <div className="doctor-horizontal-item">
                        <div className="doctor-small-icon">
                          <Activity size={17} />
                        </div>

                        <div>
                          <span>
                            Oxygen Level
                          </span>

                          <strong>
                            {displayValue(
                              vital.oxygenLevel ??
                                vital.oxygenSaturation ??
                                vital.oxygen ??
                                vital.spo2,
                            )}
                          </strong>
                        </div>
                      </div>

                      <div className="doctor-horizontal-item">
                        <div className="doctor-small-icon">
                          <Activity size={17} />
                        </div>

                        <div>
                          <span>
                            Respiratory Rate
                          </span>

                          <strong>
                            {displayValue(
                              vital.respiratoryRate ??
                                vital.respirationRate ??
                                vital.respiratory,
                            )}
                          </strong>
                        </div>
                      </div>

                    </div>

                  </div>
                ),
              )}

            </div>
          )}

        </section>
      )}

      {/* =================================================
          NURSE NOTES
      ================================================= */}

      {openSection === "notes" && (
        <section className="doctor-section-card">

          <div className="doctor-section-heading">

            <div>
              <h2>
                <NotebookPen size={20} />
                Nurse Notes
              </h2>

              <p>
                Notes recorded by the
                nursing staff.
              </p>
            </div>

            <span className="doctor-result-count">
              {notes.length} note
              {notes.length !== 1
                ? "s"
                : ""}
            </span>

          </div>

          {notes.length === 0 ? (
            <div className="doctor-empty-inline">
              No nurse notes have
              been recorded yet.
            </div>
          ) : (
            <div className="doctor-records-stack">

              {notes.map(
                (note, index) => (
                  <div
                    className="doctor-record-card"
                    key={
                      note.id ||
                      index
                    }
                  >

                    <div className="doctor-note-header">

                      <div className="doctor-note-author">

                        <div className="doctor-note-icon">
                          <NotebookPen
                            size={18}
                          />
                        </div>

                        <div>

                          <strong>
                            {getNurseName(
                              note,
                              usersMap,
                            )}
                          </strong>

                          <span>
                            <Clock3 size={12} />
                            {getRecordTime(
                              note,
                            )}
                          </span>

                        </div>

                      </div>

                    </div>

                    <div className="doctor-note-expanded">
                      {getNurseNoteText(
                        note,
                      )}
                    </div>

                  </div>
                ),
              )}

            </div>
          )}

        </section>
      )}

      {/* =================================================
          QUESTIONS + ANSWERS
      ================================================= */}

      {openSection === "questions" && (
        <section className="doctor-section-card">

          <div className="doctor-section-heading">

            <div>
              <h2>
                <MessageCircleQuestion
                  size={20}
                />
                Questions & Answers
              </h2>

              <p>
                Ask this patient questions
                and review their responses.
              </p>
            </div>

            <span className="doctor-result-count">
              {questions.length} question
              {questions.length !== 1
                ? "s"
                : ""}
            </span>

          </div>

          {/* =================================================
              ASK NEW QUESTION
          ================================================= */}

          {!showQuestionComposer ? (
            <div className="doctor-question-start">

              <MessageCircleQuestion
                size={34}
              />

              <div>
                <h3>
                  Ask the Patient
                </h3>

                <p>
                  Send a text or voice
                  question that the patient
                  can answer from their account.
                </p>
              </div>

              <button
                type="button"
                className="doctor-primary-btn"
                onClick={() => {
                  setShowQuestionComposer(
                    true,
                  );

                  setQuestionError("");
                  setQuestionSuccess("");
                }}
              >
                <MessageCircleQuestion
                  size={16}
                />

                Ask Patient
              </button>

            </div>
          ) : (
            <div
              className="doctor-inline-question-box"
              style={{
                position: "relative",
              }}
            >

              {/* HEADER */}

              <div className="doctor-inline-question-header">

                <div>
                  <strong>
                    Ask {patientName}
                  </strong>

                  <span>
                    Type a question or record
                    a voice question below.
                  </span>
                </div>

                <button
                  type="button"
                  className="doctor-inline-question-close"
                  onClick={() => {
                    resetQuestionComposer();

                    setShowQuestionComposer(
                      false,
                    );
                  }}
                  aria-label="Close question box"
                >
                  <X size={17} />
                </button>

              </div>

              {/* TEXT QUESTION */}

              <div
                style={{
                  marginTop: "16px",
                }}
              >
                <label
                  style={{
                    display: "block",
                    fontSize: "13px",
                    fontWeight: 600,
                    marginBottom: "7px",
                  }}
                >
                  Question Text
                </label>

                <textarea
                  className="doctor-inline-question-input"
                  value={questionText}
                  onChange={(event) =>
                    setQuestionText(
                      event.target.value,
                    )
                  }
                  placeholder="Type your question for the patient..."
                  style={{
                    minHeight: "105px",
                    width: "100%",
                  }}
                />
              </div>

              {/* =================================================
                  VOICE QUESTION AREA
              ================================================= */}

              <div
                style={{
                  marginTop: "16px",
                  padding: "16px",
                  border: "1px solid #e5e7eb",
                  borderRadius: "12px",
                  background: "#f8fafc",
                }}
              >

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent:
                      "space-between",
                    gap: "12px",
                    flexWrap: "wrap",
                    marginBottom: "12px",
                  }}
                >

                  <div>
                    <strong
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "7px",
                        fontSize: "14px",
                      }}
                    >
                      <Mic size={17} />
                      Voice Question
                    </strong>

                    <span
                      style={{
                        display: "block",
                        marginTop: "4px",
                        fontSize: "12px",
                        opacity: 0.7,
                      }}
                    >
                      Record your question for
                      the patient.
                    </span>
                  </div>

                  {!isRecordingQuestion ? (
                    <button
                      type="button"
                      className="doctor-primary-btn"
                      onClick={
                        startQuestionRecording
                      }
                      disabled={
                        sendingQuestion
                      }
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "7px",
                      }}
                    >
                      <Mic size={16} />
                      Record Voice
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="doctor-secondary-btn"
                      onClick={
                        stopQuestionRecording
                      }
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "7px",
                      }}
                    >
                      <Square size={15} />
                      Stop Recording
                    </button>
                  )}

                </div>

                {/* RECORDING INDICATOR */}

                {isRecordingQuestion && (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "9px",
                      padding: "10px 12px",
                      marginBottom: "12px",
                      borderRadius: "9px",
                      background:
                        "rgba(220, 38, 38, 0.08)",
                      color: "#b91c1c",
                      fontSize: "13px",
                      fontWeight: 600,
                    }}
                  >
                    <span
                      style={{
                        width: "9px",
                        height: "9px",
                        borderRadius: "50%",
                        background: "#dc2626",
                        display: "inline-block",
                        animation:
                          "doctorVoicePulse 1s infinite",
                      }}
                    />

                    Recording in progress...

                    {isTranscribingQuestion && (
                      <span
                        style={{
                          marginLeft: "auto",
                          fontWeight: 500,
                          opacity: 0.8,
                        }}
                      >
                        Transcribing...
                      </span>
                    )}
                  </div>
                )}

                {/* RECORDED AUDIO */}

                {questionVoiceUrl && (
                  <div
                    style={{
                      padding: "12px",
                      borderRadius: "10px",
                      background: "#ffffff",
                      border:
                        "1px solid #e5e7eb",
                      marginBottom: "12px",
                    }}
                  >

                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        marginBottom: "9px",
                      }}
                    >
                      <Play size={16} />

                      <strong
                        style={{
                          fontSize: "13px",
                        }}
                      >
                        Recorded Voice
                      </strong>

                      <button
                        type="button"
                        onClick={
                          deleteQuestionRecording
                        }
                        style={{
                          marginLeft: "auto",
                          border: "none",
                          background:
                            "transparent",
                          cursor: "pointer",
                          display: "inline-flex",
                          alignItems:
                            "center",
                          gap: "5px",
                          color: "#dc2626",
                          fontSize: "12px",
                          fontWeight: 600,
                        }}
                      >
                        <Trash2 size={15} />
                        Delete
                      </button>
                    </div>

                    <audio
                      controls
                      preload="metadata"
                      src={questionVoiceUrl}
                      style={{
                        width: "100%",
                        display: "block",
                      }}
                    >
                      Your browser does not
                      support audio playback.
                    </audio>

                    {questionVoiceFileName && (
                      <div
                        style={{
                          marginTop: "7px",
                          fontSize: "11px",
                          opacity: 0.65,
                        }}
                      >
                        {questionVoiceFileName}
                      </div>
                    )}

                  </div>
                )}

                {/* EDITABLE TRANSCRIPT */}

                {questionVoiceUrl && (
                  <div>
                    <label
                      style={{
                        display: "block",
                        fontSize: "13px",
                        fontWeight: 600,
                        marginBottom: "7px",
                      }}
                    >
                      Voice Transcript
                    </label>

                    <textarea
                      value={
                        questionTranscript
                      }
                      onChange={(event) =>
                        setQuestionTranscript(
                          event.target.value,
                        )
                      }
                      placeholder="Your voice transcript will appear here. You can edit it before sending."
                      style={{
                        width: "100%",
                        minHeight: "90px",
                        resize: "vertical",
                        border:
                          "1px solid #d1d5db",
                        borderRadius: "9px",
                        padding: "10px 12px",
                        fontSize: "13px",
                        lineHeight: 1.5,
                        outline: "none",
                        boxSizing:
                          "border-box",
                        background:
                          "#ffffff",
                      }}
                    />

                    <div
                      style={{
                        marginTop: "5px",
                        fontSize: "11px",
                        opacity: 0.65,
                      }}
                    >
                      You can correct or edit
                      the transcript before
                      sending.
                    </div>
                  </div>
                )}

                {!questionVoiceUrl &&
                  !isRecordingQuestion && (
                    <div
                      style={{
                        padding: "10px 12px",
                        borderRadius: "9px",
                        background:
                          "#ffffff",
                        border:
                          "1px dashed #d1d5db",
                        fontSize: "12px",
                        opacity: 0.7,
                      }}
                    >
                      No voice recording added.
                      Text-only questions are
                      also supported.
                    </div>
                  )}

              </div>

              {/* =================================================
                  SEND AREA
              ================================================= */}

              <div className="doctor-inline-question-bottom">

                <span>
                  {questionVoiceUrl
                    ? "Your text, voice recording and transcript will be sent to the patient."
                    : "Your question will be sent to the patient."}
                </span>

                <div
                  style={{
                    display: "flex",
                    gap: "8px",
                    flexWrap: "wrap",
                  }}
                >

                  <button
                    type="button"
                    className="doctor-secondary-btn"
                    onClick={() => {
                      resetQuestionComposer();

                      setShowQuestionComposer(
                        false,
                      );
                    }}
                    disabled={
                      sendingQuestion
                    }
                  >
                    Cancel
                  </button>

                  <button
                    type="button"
                    className="doctor-primary-btn"
                    onClick={sendQuestion}
                    disabled={
                      sendingQuestion ||
                      isRecordingQuestion
                    }
                  >
                    {sendingQuestion ? (
                      <>
                        <Loader2
                          size={16}
                          className="doctor-button-spinner"
                        />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send size={16} />
                        Send Question
                      </>
                    )}
                  </button>

                </div>

              </div>

              {/* ERROR */}

              {questionError && (
                <div className="doctor-inline-question-error">
                  <X size={15} />
                  {questionError}
                </div>
              )}

              {/* SUCCESS */}

              {questionSuccess && (
                <div className="doctor-inline-question-success">
                  <CheckCircle2 size={15} />
                  {questionSuccess}
                </div>
              )}

            </div>
          )}

          {/* =================================================
              EXISTING CONVERSATION
          ================================================= */}

          <div
            style={{
              marginTop: "24px",
              display: "flex",
              flexDirection: "column",
              gap: "16px",
            }}
          >

            {questions.length === 0 ? (
              <div className="doctor-empty-inline">
                No questions have been sent
                to this patient yet.
              </div>
            ) : (
              questions.map(
                (item, index) => {

                  /* ==========================================
                     PATIENT ANSWER STATUS
                     ONLY PATIENT RESPONSE FIELDS ARE USED
                  ========================================== */

                  const hasText =
                    Boolean(
                      item.answer &&
                      item.answer.trim(),
                    );

                  const hasTranscript =
                    Boolean(
                      item.transcript &&
                      item.transcript.trim(),
                    );

                  const hasVoice =
                    Boolean(
                      item.voiceUrl &&
                      item.voiceUrl.trim(),
                    );

                  const answered =
                    item.status ===
                      "Answered" ||
                    hasText ||
                    hasTranscript ||
                    hasVoice;

                  /* ==========================================
                     DOCTOR VOICE QUESTION
                  ========================================== */

                  const hasQuestionVoice =
                    Boolean(
                      item.questionVoiceUrl &&
                      item.questionVoiceUrl.trim(),
                    );

                  const hasQuestionTranscript =
                    Boolean(
                      item.questionTranscript &&
                      item.questionTranscript.trim(),
                    );

                  return (
                    <div
                      key={`${item.id}-${index}`}
                      style={{
                        border:
                          "1px solid #e5e7eb",
                        borderRadius:
                          "14px",
                        overflow:
                          "hidden",
                        background:
                          "#ffffff",
                      }}
                    >

                      {/* =================================================
                          DOCTOR QUESTION
                      ================================================= */}

                      <div
                        style={{
                          padding:
                            "16px 18px",
                          background:
                            "#f8fafc",
                          borderBottom:
                            "1px solid #e5e7eb",
                        }}
                      >

                        <div
                          style={{
                            display:
                              "flex",
                            justifyContent:
                              "space-between",
                            alignItems:
                              "flex-start",
                            gap:
                              "12px",
                          }}
                        >

                          <div
                            style={{
                              display:
                                "flex",
                              gap:
                                "10px",
                              flex:
                                1,
                            }}
                          >

                            <MessageCircleQuestion
                              size={19}
                            />

                            <div
                              style={{
                                flex: 1,
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
                                Doctor Question
                              </strong>

                              {/* TEXT QUESTION */}

                              {item.question ? (
                                <p
                                  style={{
                                    margin:
                                      0,
                                    lineHeight:
                                      1.6,
                                    whiteSpace:
                                      "pre-wrap",
                                  }}
                                >
                                  {
                                    item.question
                                  }
                                </p>
                              ) : (
                                !hasQuestionVoice && (
                                  <p
                                    style={{
                                      margin:
                                        0,
                                      lineHeight:
                                        1.6,
                                      opacity:
                                        0.7,
                                    }}
                                  >
                                    No question
                                    text
                                    available.
                                  </p>
                                )
                              )}

                              {/* VOICE QUESTION */}

                              {hasQuestionVoice && (
                                <div
                                  style={{
                                    marginTop:
                                      "13px",
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
                                        "flex",
                                      alignItems:
                                        "center",
                                      gap:
                                        "7px",
                                      marginBottom:
                                        "9px",
                                      fontSize:
                                        "13px",
                                    }}
                                  >
                                    <Mic
                                      size={
                                        16
                                      }
                                    />

                                    Voice Question
                                  </strong>

                                  <audio
                                    controls
                                    preload="metadata"
                                    src={
                                      item.questionVoiceUrl
                                    }
                                    style={{
                                      width:
                                        "100%",
                                      maxWidth:
                                        "520px",
                                    }}
                                  >
                                    Your browser
                                    does not
                                    support
                                    audio
                                    playback.
                                  </audio>

                                  {item.questionVoiceFileName && (
                                    <div
                                      style={{
                                        marginTop:
                                          "6px",
                                        fontSize:
                                          "11px",
                                        opacity:
                                          0.65,
                                      }}
                                    >
                                      {
                                        item.questionVoiceFileName
                                      }
                                    </div>
                                  )}

                                </div>
                              )}

                              {/* QUESTION TRANSCRIPT */}

                              {hasQuestionTranscript && (
                                <div
                                  style={{
                                    marginTop:
                                      "10px",
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
                                      fontSize:
                                        "13px",
                                    }}
                                  >
                                    Voice Transcript
                                  </strong>

                                  <p
                                    style={{
                                      margin:
                                        0,
                                      lineHeight:
                                        1.6,
                                      whiteSpace:
                                        "pre-wrap",
                                      fontSize:
                                        "13px",
                                    }}
                                  >
                                    {
                                      item.questionTranscript
                                    }
                                  </p>

                                </div>
                              )}

                            </div>

                          </div>

                          <span
                            className={`doctor-question-status ${
                              answered
                                ? "answered"
                                : "pending"
                            }`}
                          >
                            {answered ? (
                              <>
                                <CheckCircle2
                                  size={14}
                                />
                                Answered
                              </>
                            ) : (
                              <>
                                <Clock3
                                  size={14}
                                />
                                Pending
                              </>
                            )}
                          </span>

                        </div>

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
                          <Clock3
                            size={12}
                            style={{
                              verticalAlign:
                                "middle",
                              marginRight:
                                "5px",
                            }}
                          />

                          {getTime(
                            item.date ||
                              item.createdAt,
                          )}
                        </div>

                      </div>

                      {/* =================================================
                          PATIENT ANSWER
                          EXISTING FUNCTIONALITY PRESERVED
                      ================================================= */}

                      <div
                        style={{
                          padding:
                            "16px 18px",
                        }}
                      >

                        <div
                          style={{
                            display:
                              "flex",
                            alignItems:
                              "center",
                            gap:
                              "8px",
                            marginBottom:
                              "12px",
                            fontWeight:
                              600,
                          }}
                        >

                          <User size={17} />

                          Patient Response

                        </div>

                        {!answered ? (
                          <div
                            style={{
                              padding:
                                "14px",
                              borderRadius:
                                "10px",
                              background:
                                "#f8fafc",
                              fontSize:
                                "14px",
                              opacity:
                                0.75,
                            }}
                          >
                            The patient has
                            not responded
                            to this question
                            yet.
                          </div>
                        ) : (
                          <div
                            style={{
                              display:
                                "flex",
                              flexDirection:
                                "column",
                              gap:
                                "12px",
                            }}
                          >

                            {/* TEXT ANSWER */}

                            {hasText && (
                              <div
                                style={{
                                  padding:
                                    "14px",
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
                                      "7px",
                                  }}
                                >
                                  Text Response
                                </strong>

                                <p
                                  style={{
                                    margin:
                                      0,
                                    lineHeight:
                                      1.6,
                                    whiteSpace:
                                      "pre-wrap",
                                  }}
                                >
                                  {item.answer}
                                </p>

                              </div>
                            )}

                            {/* VOICE ANSWER */}

                            {hasVoice && (
                              <div
                                style={{
                                  padding:
                                    "14px",
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
                                      "flex",
                                    alignItems:
                                      "center",
                                    gap:
                                      "7px",
                                    marginBottom:
                                      "10px",
                                  }}
                                >
                                  <MessageCircleQuestion
                                    size={17}
                                  />

                                  Voice Response
                                </strong>

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
                                        "7px",
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

                            {/* PATIENT TRANSCRIPT */}

                            {hasTranscript && (
                              <div
                                style={{
                                  padding:
                                    "14px",
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
                                      "7px",
                                  }}
                                >
                                  Voice Transcript
                                </strong>

                                <p
                                  style={{
                                    margin:
                                      0,
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

                            {item.answeredAt && (
                              <div
                                style={{
                                  fontSize:
                                    "12px",
                                  opacity:
                                    0.7,
                                }}
                              >
                                Answered on{" "}
                                {getTime(
                                  item.answeredAt,
                                )}
                              </div>
                            )}

                            {!hasText &&
                              !hasVoice &&
                              !hasTranscript && (
                                <div
                                  style={{
                                    padding:
                                      "14px",
                                    borderRadius:
                                      "10px",
                                    background:
                                      "#f8fafc",
                                  }}
                                >
                                  Response received,
                                  but no response
                                  content is
                                  available.
                                </div>
                              )}

                          </div>
                        )}

                      </div>

                    </div>
                  );
                },
              )
            )}

          </div>

        </section>
      )}

      {/* =================================================
          PATIENT INFORMATION
      ================================================= */}

      <section className="doctor-section-card doctor-patient-info-card">

        <div className="doctor-section-heading">

          <div>
            <h2>
              <User size={20} />
              Patient Information
            </h2>

            <p>
              Basic information about
              the selected patient.
            </p>
          </div>

          <button
            type="button"
            className="doctor-info-eye-btn"
            onClick={() =>
              setShowPatientInfo(
                (current) => !current,
              )
            }
            aria-label={
              showPatientInfo
                ? "Hide patient information"
                : "Show patient information"
            }
          >
            <Eye size={18} />
          </button>

        </div>

        {showPatientInfo && (
          <div className="doctor-info-grid">

            <InfoItem
              icon={
                <Mail size={18} />
              }
              label="Email"
              value={displayValue(
                patient.email,
              )}
            />

            <InfoItem
              icon={
                <Phone size={18} />
              }
              label="Phone"
              value={displayValue(
                patient.phone,
              )}
            />

            <InfoItem
              icon={
                <User size={18} />
              }
              label="Age"
              value={displayValue(
                patient.age,
              )}
            />

            <InfoItem
              icon={
                <User size={18} />
              }
              label="Gender"
              value={displayValue(
                patient.gender,
              )}
            />

            <InfoItem
              icon={
                <HeartPulse size={18} />
              }
              label="Blood Group"
              value={displayValue(
                patient.bloodGroup,
              )}
            />

          </div>
        )}

      </section>

      {/* =================================================
          SMALL RECORDING ANIMATION
      ================================================= */}

      <style>
        {`
          @keyframes doctorVoicePulse {
            0% {
              transform: scale(1);
              opacity: 1;
            }

            50% {
              transform: scale(1.35);
              opacity: 0.55;
            }

            100% {
              transform: scale(1);
              opacity: 1;
            }
          }
        `}
      </style>

    </div>
  );
}