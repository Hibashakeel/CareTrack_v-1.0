import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  ArrowLeft,
  ClipboardList,
  Search,
  User,
  CalendarDays,
  Pill,
  Droplets,
  Activity,
  FileText,
} from "lucide-react";
import { get, ref } from "firebase/database";
import { db } from "../../lib/firebase";

interface Patient {
  uid: string;
  fullName?: string;
  email?: string;
  role?: string;
}

interface DailyReport {
  id: string;
  patientId: string;
  date?: string;
  pain?: string | number;
  painLevel?: string | number;
  symptoms?: string;
  food?: string;
  water?: string | number;
  waterConsumption?: string | number;
  medicineTaken?: boolean | string;
  medication?: string;
  notes?: string;
  dailyNotes?: string;
  createdAt?: string;
}

export default function DoctorReports() {
  const [searchParams] = useSearchParams();

  const selectedPatientId =
    searchParams.get("patientId");

  const [patients, setPatients] =
    useState<Patient[]>([]);

  const [reports, setReports] =
    useState<DailyReport[]>([]);

  const [search, setSearch] = useState("");

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    async function loadReports() {
      try {
        setLoading(true);

        const usersSnapshot =
          await get(ref(db, "users"));

        const usersData =
          usersSnapshot.val() || {};

        const patientList: Patient[] =
          Object.entries(usersData)
            .map(([uid, value]) => ({
              ...(value as Omit<
                Patient,
                "uid"
              >),
              uid,
            }))
            .filter(
              (user) =>
                user.role === "patient"
            );

        setPatients(patientList);

        const patientsToLoad =
          selectedPatientId
            ? patientList.filter(
                (patient) =>
                  patient.uid ===
                  selectedPatientId
              )
            : patientList;

        const allReports: DailyReport[] =
          [];

        for (const patient of patientsToLoad) {
          const snapshot = await get(
            ref(
              db,
              `patientDailyReports/${patient.uid}`
            )
          );

          if (!snapshot.exists()) {
            continue;
          }

          const data =
            snapshot.val();

          if (
            Array.isArray(data)
          ) {
            data.forEach(
              (
                value: DailyReport,
                index: number
              ) => {
                if (!value) return;

                allReports.push({
                  ...value,
                  id:
                    String(index),
                  patientId:
                    patient.uid,
                });
              }
            );
          } else if (
            data &&
            typeof data === "object"
          ) {
            Object.entries(data).forEach(
              ([reportId, value]) => {
                if (!value) return;

                allReports.push({
                  ...(value as Omit<
                    DailyReport,
                    "id" | "patientId"
                  >),
                  id: reportId,
                  patientId:
                    patient.uid,
                });
              }
            );
          }
        }

        allReports.sort(
          (a, b) =>
            getTime(
              b.createdAt || b.date
            ) -
            getTime(
              a.createdAt || a.date
            )
        );

        setReports(allReports);
      } catch (error) {
        console.error(
          "Error loading doctor reports:",
          error
        );
      } finally {
        setLoading(false);
      }
    }

    loadReports();
  }, [selectedPatientId]);

  const selectedPatient =
    useMemo(
      () =>
        patients.find(
          (patient) =>
            patient.uid ===
            selectedPatientId
        ),
      [patients, selectedPatientId]
    );

  const filteredReports =
    reports.filter((report) => {
      const patient =
        patients.find(
          (item) =>
            item.uid ===
            report.patientId
        );

      const query =
        search.toLowerCase().trim();

      if (!query) {
        return true;
      }

      return (
        (
          patient?.fullName ||
          ""
        )
          .toLowerCase()
          .includes(query) ||
        (
          patient?.email ||
          ""
        )
          .toLowerCase()
          .includes(query) ||
        (
          report.symptoms ||
          ""
        )
          .toLowerCase()
          .includes(query) ||
        (
          report.notes ||
          report.dailyNotes ||
          ""
        )
          .toLowerCase()
          .includes(query)
      );
    });

  return (
    <div className="doctor-page">

      {/* HEADER */}

      <div className="doctor-page-header">

        <div>

          <Link
            to={
              selectedPatientId
                ? `/doctor/patients/${selectedPatientId}`
                : "/doctor/dashboard"
            }
            className="doctor-back-link"
          >
            <ArrowLeft size={17} />
            Back
          </Link>

          <p className="doctor-eyebrow">
            {selectedPatient
              ? "PATIENT RECORD"
              : "DOCTOR / MONITORING"}
          </p>

          <h1>
            {selectedPatient
              ? `${selectedPatient.fullName || "Patient"} — Daily Reports`
              : "Patient Daily Reports"}
          </h1>

          <p>
            Review daily information submitted
            by patients.
          </p>

        </div>

        <div className="doctor-page-header-icon">
          <ClipboardList size={28} />
        </div>

      </div>


      {/* SEARCH */}

      <div className="doctor-search-box">

        <Search size={19} />

        <input
          type="text"
          placeholder="Search reports, symptoms or notes..."
          value={search}
          onChange={(event) =>
            setSearch(
              event.target.value
            )
          }
        />

      </div>


      {/* COUNT */}

      {!loading &&
        filteredReports.length > 0 && (
          <div className="doctor-result-count">
            <FileText size={16} />

            {filteredReports.length} report
            {filteredReports.length !== 1
              ? "s"
              : ""}{" "}
            found
          </div>
        )}


      {/* CONTENT */}

      {loading ? (

        <div className="doctor-loading-card">
          <div className="doctor-spinner" />
          <span>
            Loading patient reports...
          </span>
        </div>

      ) : filteredReports.length === 0 ? (

        <div className="doctor-empty-card">

          <ClipboardList size={45} />

          <h2>
            No Reports Found
          </h2>

          <p>
            {selectedPatient
              ? "This patient has not submitted any daily reports yet."
              : "No patient daily reports are currently available."}
          </p>

        </div>

      ) : (

        <div className="doctor-report-list">

          {filteredReports.map(
            (report) => {

              const patient =
                patients.find(
                  (item) =>
                    item.uid ===
                    report.patientId
                );

              return (
                <article
                  className="doctor-report-card"
                  key={`${report.patientId}-${report.id}`}
                >

                  {/* CARD HEADER */}

                  <div className="doctor-report-card-header">

                    <div className="doctor-report-patient">

                      <div className="doctor-small-avatar">
                        <User size={19} />
                      </div>

                      <div>
                        <h3>
                          {patient?.fullName ||
                            patient?.email ||
                            "Unknown Patient"}
                        </h3>

                        <span>
                          Patient Daily Report
                        </span>
                      </div>

                    </div>

                    <div className="doctor-date-badge">
                      <CalendarDays
                        size={15}
                      />

                      {report.date ||
                        formatDate(
                          report.createdAt
                        )}
                    </div>

                  </div>


                  {/* REPORT DATA */}

                  <div className="doctor-report-grid">

                    <ReportValue
                      icon={
                        <Activity
                          size={18}
                        />
                      }
                      label="Pain Level"
                      value={
                        report.painLevel ??
                        report.pain ??
                        "Not recorded"
                      }
                    />

                    <ReportValue
                      icon={
                        <Activity
                          size={18}
                        />
                      }
                      label="Symptoms"
                      value={
                        report.symptoms ||
                        "Not recorded"
                      }
                    />

                    <ReportValue
                      icon={
                        <FileText
                          size={18}
                        />
                      }
                      label="Food / Meals"
                      value={
                        report.food ||
                        "Not recorded"
                      }
                    />

                    <ReportValue
                      icon={
                        <Droplets
                          size={18}
                        />
                      }
                      label="Water"
                      value={
                        report.water ??
                        report.waterConsumption ??
                        "Not recorded"
                      }
                    />

                    <ReportValue
                      icon={
                        <Pill size={18} />
                      }
                      label="Medication"
                      value={
                        report.medication ||
                        "Not recorded"
                      }
                    />

                    <ReportValue
                      icon={
                        <Pill size={18} />
                      }
                      label="Medicine Taken"
                      value={
                        report.medicineTaken !==
                        undefined
                          ? formatBoolean(
                              report.medicineTaken
                            )
                          : "Not recorded"
                      }
                    />

                  </div>


                  {/* NOTES */}

                  {(report.notes ||
                    report.dailyNotes) && (

                    <div className="doctor-report-notes">

                      <strong>
                        Notes
                      </strong>

                      <p>
                        {report.notes ||
                          report.dailyNotes}
                      </p>

                    </div>

                  )}


                  {/* FOOTER */}

                  <div className="doctor-card-footer">

                    <span>
                      {report.createdAt
                        ? `Submitted ${formatDate(
                            report.createdAt
                          )}`
                        : "Patient submitted report"}
                    </span>

                    <Link
                      to={`/doctor/patients/${report.patientId}`}
                      className="doctor-primary-btn"
                    >
                      <User size={16} />
                      View Patient
                    </Link>

                  </div>

                </article>
              );
            }
          )}

        </div>

      )}

    </div>
  );
}


/* =========================================================
   REPORT VALUE
========================================================= */

function ReportValue({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
}) {
  return (
    <div className="doctor-report-value">

      <div className="doctor-report-value-icon">
        {icon}
      </div>

      <div>
        <span>{label}</span>

        <strong>
          {String(value)}
        </strong>
      </div>

    </div>
  );
}


/* =========================================================
   HELPERS
========================================================= */

function getTime(value?: string) {
  if (!value) return 0;

  const time =
    new Date(value).getTime();

  return Number.isNaN(time)
    ? 0
    : time;
}


function formatDate(value?: string) {
  if (!value) {
    return "Date unavailable";
  }

  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return value;
  }

  return date.toLocaleDateString();
}


function formatBoolean(
  value: boolean | string
) {
  if (typeof value === "boolean") {
    return value ? "Yes" : "No";
  }

  const normalized =
    value.toLowerCase().trim();

  if (
    normalized === "true" ||
    normalized === "yes"
  ) {
    return "Yes";
  }

  if (
    normalized === "false" ||
    normalized === "no"
  ) {
    return "No";
  }

  return value;
}