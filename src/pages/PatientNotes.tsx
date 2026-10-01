
import {
  ArrowLeft,
  Clock,
  FileText,
} from "lucide-react";

import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { get, ref } from "firebase/database";

import { useAuth } from "../context/AuthContext";
import { db } from "../lib/firebase";

interface NurseNote {
  noteId: string;
  patientId?: string;
  note?: string;
  nurseId?: string;
  createdAt?: string;
}

export default function PatientNotes() {
  const { user } = useAuth();

  const [notes, setNotes] = useState<NurseNote[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadNotes() {
      if (!user?.uid) {
        setLoading(false);
        return;
      }

      try {
        const snapshot = await get(
          ref(db, `nurseNotes/${user.uid}`)
        );

        if (!snapshot.exists()) {
          setNotes([]);
          setLoading(false);
          return;
        }

        const data = snapshot.val() as Record<
          string,
          Omit<NurseNote, "noteId">
        >;

        const notesList: NurseNote[] =
          Object.entries(data).map(
            ([noteId, value]) => ({
              noteId,
              ...value,
            })
          );

        notesList.sort((a, b) => {
          const timeA = a.createdAt
            ? new Date(a.createdAt).getTime()
            : 0;

          const timeB = b.createdAt
            ? new Date(b.createdAt).getTime()
            : 0;

          return timeB - timeA;
        });

        setNotes(notesList);
      } catch (error) {
        console.error(
          "Unable to load patient notes:",
          error
        );
      } finally {
        setLoading(false);
      }
    }

    loadNotes();
  }, [user?.uid]);

  return (
    <div className="patient-dashboard">

      {/* HEADER */}
      <section className="patient-welcome">

        <div className="patient-welcome-text">

          <p className="dashboard-eyebrow">
            CARE INFORMATION
          </p>

          <h1>
            My Notes
          </h1>

          <p>
            View notes recorded by your nursing
            care team.
          </p>

        </div>

        <Link
          to="/patient/dashboard"
          className="patient-secondary-button"
        >
          <ArrowLeft size={17} />
          Back to Dashboard
        </Link>

      </section>

      {/* NOTES */}
      <section className="patient-card">

        <div className="patient-card-header">

          <div>

            <p className="card-kicker">
              NURSE NOTES
            </p>

            <h2>
              Care Team Notes
            </h2>

            <p>
              Notes recorded about your care
              and daily observations.
            </p>

          </div>

          <div className="quick-action-icon">
            <FileText size={21} />
          </div>

        </div>

        {loading ? (
          <div
            style={{
              padding: "30px",
              textAlign: "center",
              color: "#718096",
            }}
          >
            Loading notes...
          </div>
        ) : notes.length === 0 ? (
          <div
            style={{
              padding: "30px",
              textAlign: "center",
              background: "#f7fafc",
              borderRadius: "12px",
              color: "#718096",
            }}
          >
            <FileText
              size={32}
              style={{
                marginBottom: "10px",
              }}
            />

            <h3
              style={{
                margin: "0 0 6px",
                color: "#34495e",
              }}
            >
              No notes yet
            </h3>

            <p
              style={{
                margin: 0,
              }}
            >
              Your care team has not added
              any notes yet.
            </p>
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gap: "14px",
              marginTop: "10px",
            }}
          >
            {notes.map((item) => (
              <div
                key={item.noteId}
                style={{
                  padding: "18px",
                  background: "#f8fafc",
                  border: "1px solid #e5eaf0",
                  borderRadius: "12px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    marginBottom: "10px",
                    color: "#52606d",
                    fontSize: "13px",
                    fontWeight: 600,
                  }}
                >
                  <FileText size={17} />

                  Nurse Care Note
                </div>

                <p
                  style={{
                    margin: 0,
                    color: "#34495e",
                    fontSize: "14px",
                    lineHeight: 1.7,
                    whiteSpace: "pre-wrap",
                  }}
                >
                  {item.note ||
                    "No note text available."}
                </p>

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    marginTop: "12px",
                    color: "#8997a6",
                    fontSize: "11px",
                  }}
                >
                  <Clock size={13} />

                  {item.createdAt
                    ? new Date(
                        item.createdAt
                      ).toLocaleString()
                    : "Date unavailable"}
                </div>
              </div>
            ))}
          </div>
        )}

      </section>

    </div>
  );
}
