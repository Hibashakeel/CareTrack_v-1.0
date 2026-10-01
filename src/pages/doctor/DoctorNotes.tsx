import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  FileText,
  Search,
  User,
  CalendarDays,
} from "lucide-react";
import { get, ref } from "firebase/database";
import { db } from "../../lib/firebase";

interface Patient {
  uid: string;
  fullName?: string;
  email?: string;
  role?: string;
}

interface NurseNote {
  patientId: string;
  noteId: string;
  note?: string;
  nurseId?: string;
  createdAt?: string;
}

export default function DoctorNotes() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [notes, setNotes] = useState<NurseNote[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);

        const usersSnapshot = await get(ref(db, "users"));
        const usersData = usersSnapshot.val() || {};

        const patientList: Patient[] = Object.entries(usersData)
          .map(([uid, value]) => ({
            ...(value as Omit<Patient, "uid">),
            uid,
          }))
          .filter((user) => user.role === "patient");

        setPatients(patientList);

        const allNotes: NurseNote[] = [];

        for (const patient of patientList) {
          const notesSnapshot = await get(
            ref(db, `nurseNotes/${patient.uid}`)
          );

          const notesData = notesSnapshot.val();

          if (!notesData) continue;

          Object.entries(notesData).forEach(([noteId, value]) => {
            allNotes.push({
              ...(value as Omit<NurseNote, "patientId" | "noteId">),
              patientId: patient.uid,
              noteId,
            });
          });
        }

        allNotes.sort((a, b) => {
          const dateA = a.createdAt
            ? new Date(a.createdAt).getTime()
            : 0;

          const dateB = b.createdAt
            ? new Date(b.createdAt).getTime()
            : 0;

          return dateB - dateA;
        });

        setNotes(allNotes);
      } catch (error) {
        console.error("Error loading doctor notes:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const filteredNotes = useMemo(() => {
    const query = search.toLowerCase().trim();

    if (!query) return notes;

    return notes.filter((note) => {
      const patient = patients.find(
        (item) => item.uid === note.patientId
      );

      const patientName = patient?.fullName || "";
      const patientEmail = patient?.email || "";
      const noteText = note.note || "";

      return (
        patientName.toLowerCase().includes(query) ||
        patientEmail.toLowerCase().includes(query) ||
        noteText.toLowerCase().includes(query)
      );
    });
  }, [notes, patients, search]);

  const getPatientName = (patientId: string) => {
    const patient = patients.find(
      (item) => item.uid === patientId
    );

    return patient?.fullName || patient?.email || "Unknown Patient";
  };

  const formatDate = (value?: string) => {
    if (!value) return "Date unavailable";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return value;
    }

    return date.toLocaleString();
  };

  return (
    <div className="doctor-notes-page">

      {/* HEADER */}
      <section className="doctor-notes-header">
        <div>
          <Link
            to="/doctor/dashboard"
            className="doctor-notes-back-link"
          >
            <ArrowLeft size={17} />
            Back to Dashboard
          </Link>

          <p className="doctor-notes-eyebrow">
            DOCTOR / CARE NOTES
          </p>

          <h1>Patient Notes</h1>

          <p>
            Review notes recorded by the nursing team
            for patient care and monitoring.
          </p>
        </div>

        <div className="doctor-notes-header-icon">
          <FileText size={27} />
        </div>
      </section>

      {/* SEARCH */}
      <div className="doctor-notes-search">
        <Search size={19} />

        <input
          type="text"
          placeholder="Search patient or note..."
          value={search}
          onChange={(event) =>
            setSearch(event.target.value)
          }
        />
      </div>

      {/* COUNT */}
      {!loading && filteredNotes.length > 0 && (
        <div className="doctor-notes-count">
          <FileText size={16} />

          {filteredNotes.length} note
          {filteredNotes.length !== 1 ? "s" : ""} found
        </div>
      )}

      {/* LOADING */}
      {loading ? (
        <div className="doctor-notes-state">
          <div className="doctor-notes-spinner" />
          <p>Loading patient notes...</p>
        </div>
      ) : filteredNotes.length === 0 ? (

        /* EMPTY */
        <div className="doctor-notes-state doctor-notes-empty">
          <FileText size={44} />

          <h2>No Notes Found</h2>

          <p>
            No nurse notes are available for the selected
            patients.
          </p>
        </div>

      ) : (

        /* NOTES */
        <div className="doctor-notes-list">

          {filteredNotes.map((note) => (
            <article
              className="doctor-note-card"
              key={`${note.patientId}-${note.noteId}`}
            >

              {/* CARD HEADER */}
              <div className="doctor-note-card-header">

                <div className="doctor-note-patient">

                  <div className="doctor-note-avatar">
                    <User size={19} />
                  </div>

                  <div>
                    <h3>
                      {getPatientName(note.patientId)}
                    </h3>

                    <span>
                      Patient Care Note
                    </span>
                  </div>

                </div>

                <div className="doctor-note-label">
                  <FileText size={16} />
                  Nurse Note
                </div>

              </div>

              {/* NOTE CONTENT */}
              <div className="doctor-note-content">

                <p className="doctor-note-text">
                  {note.note ||
                    "No note text available."}
                </p>

                {note.createdAt && (
                  <div className="doctor-note-date">
                    <CalendarDays size={15} />
                    <span>
                      {formatDate(note.createdAt)}
                    </span>
                  </div>
                )}

              </div>

              {/* FOOTER */}
              <div className="doctor-note-footer">

                <span>
                  Nursing team record
                </span>

                <Link
                  to={`/doctor/patients/${note.patientId}`}
                  className="doctor-note-view-btn"
                >
                  <User size={16} />
                  View Patient
                </Link>

              </div>

            </article>
          ))}

        </div>
      )}

    </div>
  );
}