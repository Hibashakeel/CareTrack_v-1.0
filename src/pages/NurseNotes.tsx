import {
  FileText,
  Plus,
  Search,
  UserRound,
  Clock3,
  CheckCircle2,
  Edit3,
  Trash2,
} from "lucide-react";

import { useEffect, useMemo, useState } from "react";

import "../role-dashboards.css";

import { get, push, ref, remove, serverTimestamp } from "firebase/database";
import { auth, db } from "../lib/firebase";

type Patient = {
  uid: string;
  fullName?: string;
  email?: string;
  role?: string;
  patientId?: string;
};

type PatientNote = {
  id: string;
  patientId: string;
  patientName: string;
  patientCode: string;
  note: string;
  authorId: string;
  authorName: string;
  createdAt: number;
};

function formatDateTime(timestamp: number) {
  if (!timestamp) return "Just now";

  return new Date(timestamp).toLocaleString("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export default function NurseNotes() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [notes, setNotes] = useState<PatientNote[]>([]);

  const [showForm, setShowForm] = useState(false);

  const [patient, setPatient] = useState("");
  const [note, setNote] = useState("");

  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [error, setError] = useState("");

  // --------------------------------------------------
  // LOAD PATIENTS + NOTES
  // --------------------------------------------------

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");

      // -------------------------
      // LOAD PATIENTS
      // -------------------------

      const usersSnapshot = await get(ref(db, "users"));

      const loadedPatients: Patient[] = [];

      if (usersSnapshot.exists()) {
        const usersData = usersSnapshot.val();

        Object.entries(usersData).forEach(([uid, value]) => {
        const user = value as Patient;

        if (user.role === "patient") {
          loadedPatients.push({
            ...user,
            uid: String(uid),
          });
        }
      });
      }

      loadedPatients.sort((a, b) =>
        (a.fullName || "").localeCompare(b.fullName || "")
      );

      setPatients(loadedPatients);

      // -------------------------
      // LOAD NURSE NOTES
      // -------------------------

      const notesSnapshot = await get(ref(db, "nurseNotes"));

      const loadedNotes: PatientNote[] = [];

      if (notesSnapshot.exists()) {
        const notesData = notesSnapshot.val();

        Object.entries(notesData).forEach(([id, value]) => {
          const item = value as Omit<PatientNote, "id">;

          loadedNotes.push({
            id,
            ...item,
          });
        });
      }

      loadedNotes.sort((a, b) => {
        const timeA = a.createdAt || 0;
        const timeB = b.createdAt || 0;

        return timeB - timeA;
      });

      setNotes(loadedNotes);
    } catch (err) {
      console.error("Error loading nurse notes:", err);
      setError("Unable to load patients or notes.");
    } finally {
      setLoading(false);
    }
  };

  // --------------------------------------------------
  // SAVE NOTE
  // --------------------------------------------------

  const handleSave = async () => {
    if (!patient || !note.trim()) {
      setError("Please select a patient and enter a note.");
      return;
    }

    if (!auth.currentUser) {
      setError("You must be logged in as a nurse.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      const selectedPatient = patients.find(
        (item) => item.uid === patient
      );

      if (!selectedPatient) {
        setError("Selected patient could not be found.");
        return;
      }

      const nurseName =
        auth.currentUser.displayName ||
        auth.currentUser.email ||
        "Nurse";

      const notesRef = ref(db, "nurseNotes");

      const newNoteRef = push(notesRef);

      const patientCode =
        selectedPatient.patientId ||
        `PT-${selectedPatient.uid.slice(0, 6).toUpperCase()}`;

      await push(ref(db, "nurseNotes"), {
        patientId: selectedPatient.uid,
        patientName: selectedPatient.fullName || "Patient",
        patientCode,
        note: note.trim(),
        authorId: auth.currentUser.uid,
        authorName: nurseName,
        createdAt: serverTimestamp(),
      });

      // Clear form
      setPatient("");
      setNote("");

      setSaved(true);

      // Reload notes from Firebase
      await loadData();

      setTimeout(() => {
        setSaved(false);
        setShowForm(false);
      }, 1200);
    } catch (err) {
      console.error("Error saving nurse note:", err);
      setError("Unable to save the note. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  // --------------------------------------------------
  // DELETE NOTE
  // --------------------------------------------------

  const handleDelete = async (noteId: string) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this note?"
    );

    if (!confirmed) return;

    try {
      await remove(ref(db, `nurseNotes/${noteId}`));

      setNotes((previous) =>
        previous.filter((item) => item.id !== noteId)
      );
    } catch (err) {
      console.error("Error deleting note:", err);
      setError("Unable to delete the note.");
    }
  };

  // --------------------------------------------------
  // SEARCH
  // --------------------------------------------------

  const filteredNotes = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return notes;
    }

    return notes.filter((item) => {
      return (
        item.patientName?.toLowerCase().includes(query) ||
        item.patientCode?.toLowerCase().includes(query) ||
        item.note?.toLowerCase().includes(query) ||
        item.authorName?.toLowerCase().includes(query)
      );
    });
  }, [notes, search]);

  // --------------------------------------------------
  // UI
  // --------------------------------------------------

  return (
    <div className="role-dashboard">

      {/* HEADER */}

      <div className="role-dashboard-header">

        <div>

          <p className="role-eyebrow">
            NURSING DOCUMENTATION
          </p>

          <h1>
            Patient Notes
          </h1>

          <p>
            Record important patient observations and care-related
            communication.
          </p>

        </div>

        <button
          type="button"
          className="role-primary-button"
          onClick={() => {
            setShowForm(!showForm);
            setError("");
          }}
          style={{
            border: "none",
            cursor: "pointer",
          }}
        >
          <Plus size={17} />

          Add Note
        </button>

      </div>

      {/* SUCCESS */}

      {saved && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "9px",
            padding: "12px 15px",
            borderRadius: "10px",
            background: "#eaf8f1",
            border: "1px solid #ccebdd",
            color: "#26845b",
            fontSize: "12px",
            fontWeight: 700,
          }}
        >
          <CheckCircle2 size={17} />

          Patient note saved successfully.
        </div>
      )}

      {/* ERROR */}

      {error && (
        <div
          style={{
            padding: "12px 15px",
            borderRadius: "10px",
            background: "#fff3f3",
            border: "1px solid #f2cccc",
            color: "#b44747",
            fontSize: "12px",
            fontWeight: 600,
          }}
        >
          {error}
        </div>
      )}

      {/* ADD NOTE FORM */}

      {showForm && (
        <section className="role-card">

          <div className="role-card-header">

            <div>

              <h2>
                Add Patient Note
              </h2>

              <p>
                Enter a brief observation or communication record.
              </p>

            </div>

            <Edit3
              size={21}
              color="#159a9c"
            />

          </div>

          <div
            style={{
              display: "grid",
              gap: "16px",
            }}
          >

            {/* PATIENT */}

            <div>

              <label
                style={{
                  display: "block",
                  marginBottom: "7px",
                  color: "#183b56",
                  fontSize: "12px",
                  fontWeight: 700,
                }}
              >
                Patient
              </label>

              <select
                value={patient}
                onChange={(event) =>
                  setPatient(event.target.value)
                }
                style={{
                  width: "100%",
                  padding: "11px 12px",
                  border: "1px solid #dceaf2",
                  borderRadius: "9px",
                  outline: "none",
                  color: "#183b56",
                  background: "#fff",
                  fontSize: "12px",
                }}
              >

                <option value="">
                  Select a patient
                </option>

                {patients.map((item) => {

                  const patientCode =
                    item.patientId ||
                    `PT-${item.uid.slice(0, 6).toUpperCase()}`;

                  return (
                    <option
                      key={item.uid}
                      value={item.uid}
                    >
                      {item.fullName || "Patient"} — {patientCode}
                    </option>
                  );
                })}

              </select>

              {patients.length === 0 && !loading && (
                <p
                  style={{
                    marginTop: "7px",
                    color: "#8293a0",
                    fontSize: "11px",
                  }}
                >
                  No registered patients found.
                </p>
              )}

            </div>

            {/* NOTE */}

            <div>

              <label
                style={{
                  display: "block",
                  marginBottom: "7px",
                  color: "#183b56",
                  fontSize: "12px",
                  fontWeight: 700,
                }}
              >
                Note
              </label>

              <textarea
                value={note}
                onChange={(event) =>
                  setNote(event.target.value)
                }
                placeholder="Write an observation or care-related note..."
                rows={5}
                style={{
                  width: "100%",
                  boxSizing: "border-box",
                  resize: "vertical",
                  padding: "12px",
                  border: "1px solid #dceaf2",
                  borderRadius: "9px",
                  outline: "none",
                  color: "#183b56",
                  fontSize: "12px",
                  fontFamily: "inherit",
                }}
              />

            </div>

            {/* BUTTONS */}

            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: "9px",
              }}
            >

              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setError("");
                }}
                style={{
                  padding: "10px 15px",
                  border: "1px solid #dceaf2",
                  borderRadius: "9px",
                  background: "#fff",
                  color: "#718696",
                  fontSize: "12px",
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleSave}
                className="role-primary-button"
                disabled={saving}
                style={{
                  border: "none",
                  cursor: saving ? "not-allowed" : "pointer",
                  opacity: saving ? 0.7 : 1,
                }}
              >

                <CheckCircle2 size={16} />

                {saving ? "Saving..." : "Save Note"}

              </button>

            </div>

          </div>

        </section>
      )}

      {/* SEARCH */}

      <section className="role-card">

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            padding: "11px 14px",
            border: "1px solid #dceaf2",
            borderRadius: "10px",
          }}
        >

          <Search
            size={17}
            color="#8293a0"
          />

          <input
            type="text"
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
            placeholder="Search notes or patient..."
            style={{
              width: "100%",
              border: "none",
              outline: "none",
              background: "transparent",
              color: "#183b56",
              fontSize: "13px",
            }}
          />

        </div>

      </section>

      {/* NOTES */}

      <section className="role-card">

        <div className="role-card-header">

          <div>

            <h2>
              Recent Notes
            </h2>

            <p>
              Latest nursing observations and communication records
            </p>

          </div>

          <FileText
            size={21}
            color="#159a9c"
          />

        </div>

        {loading ? (

          <div
            style={{
              padding: "30px 0",
              textAlign: "center",
              color: "#8293a0",
              fontSize: "12px",
            }}
          >
            Loading patient notes...
          </div>

        ) : filteredNotes.length === 0 ? (

          <div
            style={{
              padding: "30px 0",
              textAlign: "center",
              color: "#8293a0",
              fontSize: "12px",
            }}
          >
            <FileText
              size={30}
              style={{
                marginBottom: "8px",
                opacity: 0.5,
              }}
            />

            <div>
              {search
                ? "No notes match your search."
                : "No patient notes have been added yet."}
            </div>
          </div>

        ) : (

          <div>

            {filteredNotes.map((item) => (

              <div
                key={item.id}
                style={{
                  display: "flex",
                  gap: "14px",
                  padding: "17px 0",
                  borderTop: "1px solid #edf3f6",
                }}
              >

                {/* ICON */}

                <div className="role-stat-icon">

                  <UserRound size={18} />

                </div>

                {/* CONTENT */}

                <div
                  style={{
                    flex: 1,
                  }}
                >

                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      gap: "15px",
                    }}
                  >

                    <div>

                      <strong
                        style={{
                          display: "block",
                          color: "#183b56",
                          fontSize: "13px",
                        }}
                      >
                        {item.patientName}
                      </strong>

                      <span
                        style={{
                          display: "block",
                          marginTop: "3px",
                          color: "#8293a0",
                          fontSize: "10px",
                        }}
                      >
                        {item.patientCode}
                      </span>

                    </div>

                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "5px",
                        color: "#91a0aa",
                        fontSize: "10px",
                      }}
                    >

                      <Clock3 size={13} />

                      {formatDateTime(item.createdAt)}

                    </div>

                  </div>

                  <p
                    style={{
                      margin: "9px 0 0",
                      color: "#5f7484",
                      fontSize: "12px",
                      lineHeight: 1.6,
                    }}
                  >
                    {item.note}
                  </p>

                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: "10px",
                      marginTop: "9px",
                    }}
                  >

                    <span
                      style={{
                        display: "inline-block",
                        padding: "4px 8px",
                        borderRadius: "15px",
                        background: "#eaf8f8",
                        color: "#159a9c",
                        fontSize: "9px",
                        fontWeight: 700,
                      }}
                    >
                      {item.authorName || "Nurse"}
                    </span>

                    <button
                      type="button"
                      onClick={() =>
                        handleDelete(item.id)
                      }
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "5px",
                        border: "none",
                        background: "transparent",
                        color: "#a16b6b",
                        fontSize: "10px",
                        fontWeight: 700,
                        cursor: "pointer",
                      }}
                    >
                      <Trash2 size={13} />

                      Delete
                    </button>

                  </div>

                </div>

              </div>

            ))}

          </div>

        )}

      </section>

    </div>
  );
}