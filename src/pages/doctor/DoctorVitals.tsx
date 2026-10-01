import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  Activity,
  ArrowLeft,
  HeartPulse,
  Search,
  Thermometer,
  Wind,
} from "lucide-react";
import { get, ref } from "firebase/database";

import { db } from "../../lib/firebase";

interface Patient {
  uid: string;
  fullName?: string;
  email?: string;
  role?: string;
}

interface VitalRecord {
  id: string;
  patientId: string;
  temperature: string;
  heartRate: string;
  bloodPressure: string;
  oxygenLevel: string;
  severity: string;
  updatedAt: string | number;
  updatedBy: string;
}

const DoctorVitals = () => {
  const [searchParams] = useSearchParams();
  const selectedPatientId = searchParams.get("patientId");

  const [patients, setPatients] = useState<Patient[]>([]);
  const [vitals, setVitals] = useState<VitalRecord[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError("");

        // =========================
        // LOAD PATIENTS
        // =========================
        const usersSnapshot = await get(ref(db, "users"));

        const patientList: Patient[] = [];

        if (usersSnapshot.exists()) {
          const users = usersSnapshot.val();

          Object.entries(users).forEach(([uid, value]) => {
            const user = value as Record<string, any>;

            if (user?.role === "patient") {
              patientList.push({
                uid,
                fullName:
                  user.fullName ||
                  user.name ||
                  user.displayName ||
                  "Unknown Patient",
                email: user.email || "",
                role: user.role,
              });
            }
          });
        }

        setPatients(patientList);

        // =========================
        // LOAD ACTUAL VITALS
        // =========================
        // Firebase structure:
        //
        // patientMonitoring
        //   └── patient UID
        //       ├── temperature
        //       ├── heartRate
        //       ├── bloodPressure
        //       ├── oxygenLevel
        //       ├── severity
        //       ├── updatedAt
        //       └── updatedBy
        //
        const monitoringSnapshot = await get(
          ref(db, "patientMonitoring")
        );

        if (!monitoringSnapshot.exists()) {
          setVitals([]);
          return;
        }

        const monitoringData = monitoringSnapshot.val();

        const records: VitalRecord[] = [];

        Object.entries(monitoringData).forEach(
          ([patientId, value]) => {
            // If coming from a specific patient
            if (
              selectedPatientId &&
              patientId !== selectedPatientId
            ) {
              return;
            }

            const data = value as Record<string, any>;

            if (
              !data ||
              typeof data !== "object"
            ) {
              return;
            }

            records.push({
              id: patientId,
              patientId: patientId,

              temperature: String(
                data.temperature ??
                  data.bodyTemperature ??
                  data.temp ??
                  ""
              ),

              heartRate: String(
                data.heartRate ??
                  data.heart_rate ??
                  data.pulse ??
                  ""
              ),

              bloodPressure: String(
                data.bloodPressure ??
                  data.blood_pressure ??
                  data.bp ??
                  ""
              ),

              oxygenLevel: String(
                data.oxygenLevel ??
                  data.oxygenSaturation ??
                  data.oxygen ??
                  data.spo2 ??
                  data.spO2 ??
                  ""
              ),

              severity: String(
                data.severity ?? ""
              ),

              updatedAt:
                data.updatedAt ??
                data.recordedAt ??
                data.createdAt ??
                data.timestamp ??
                "",

              updatedBy: String(
                data.updatedBy ?? ""
              ),
            });
          }
        );

        setVitals(records);
      } catch (err) {
        console.error(
          "Doctor vitals error:",
          err
        );

        setError(
          "Unable to load patient monitoring data."
        );
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [selectedPatientId]);

  // =========================
  // SEARCH
  // =========================
  const filteredVitals = useMemo(() => {
    const query = search
      .toLowerCase()
      .trim();

    if (!query) {
      return vitals;
    }

    return vitals.filter((vital) => {
      const patient = patients.find(
        (p) =>
          p.uid === vital.patientId
      );

      const patientName =
        patient?.fullName?.toLowerCase() ||
        "";

      const patientEmail =
        patient?.email?.toLowerCase() ||
        "";

      return (
        patientName.includes(query) ||
        patientEmail.includes(query) ||
        vital.temperature
          .toLowerCase()
          .includes(query) ||
        vital.heartRate
          .toLowerCase()
          .includes(query) ||
        vital.bloodPressure
          .toLowerCase()
          .includes(query) ||
        vital.oxygenLevel
          .toLowerCase()
          .includes(query) ||
        vital.severity
          .toLowerCase()
          .includes(query)
      );
    });
  }, [search, patients, vitals]);

  // =========================
  // PATIENT NAME
  // =========================
  const getPatientName = (
    patientId: string
  ) => {
    const patient = patients.find(
      (p) =>
        p.uid === patientId
    );

    return (
      patient?.fullName ||
      patient?.email ||
      "Unknown Patient"
    );
  };

  // =========================
  // DATE FORMAT
  // =========================
  const formatDate = (
    value: string | number
  ) => {
    if (!value) {
      return "Not available";
    }

    const timestamp = Number(value);

    if (!Number.isNaN(timestamp)) {
      const date = new Date(timestamp);

      if (!Number.isNaN(date.getTime())) {
        return date.toLocaleString();
      }
    }

    return String(value);
  };

  // =========================
  // SEVERITY
  // =========================
  const getSeverityClass = (
    severity: string
  ) => {
    const value =
      severity.toLowerCase();

    if (
      value === "urgent" ||
      value === "critical"
    ) {
      return "vital-severity vital-severity-danger";
    }

    if (
      value === "attention" ||
      value === "warning"
    ) {
      return "vital-severity vital-severity-warning";
    }

    if (
      value === "stable" ||
      value === "normal"
    ) {
      return "vital-severity vital-severity-normal";
    }

    return "vital-severity";
  };

  // =========================
  // PAGE
  // =========================
  return (
    <div className="doctor-vitals-page">

      {/* =========================
          HEADER
      ========================== */}
      <div className="doctor-vitals-header">

        <div className="doctor-vitals-title-row">

          {selectedPatientId && (
            <Link
              to={`/doctor/patients/${selectedPatientId}`}
              className="doctor-vitals-back"
            >
              <ArrowLeft size={18} />
            </Link>
          )}

          <div>
            <h1>Patient Vitals</h1>

            <p>
              View the latest health monitoring
              information recorded for patients.
            </p>
          </div>

        </div>

      </div>

      {/* =========================
          SEARCH
      ========================== */}
      <div className="doctor-vitals-toolbar">

        <div className="doctor-vitals-search">

          <Search size={18} />

          <input
            type="text"
            placeholder="Search patient or vital information..."
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
          />

        </div>

        <div className="doctor-vitals-count">
          {filteredVitals.length} record
          {filteredVitals.length !== 1
            ? "s"
            : ""}
        </div>

      </div>

      {/* =========================
          LOADING
      ========================== */}
      {loading && (
        <div className="doctor-vitals-empty">

          <Activity size={32} />

          <h3>
            Loading patient vitals...
          </h3>

          <p>
            Please wait while the monitoring
            data is loaded.
          </p>

        </div>
      )}

      {/* =========================
          ERROR
      ========================== */}
      {!loading && error && (
        <div className="doctor-vitals-empty">

          <Activity size={32} />

          <h3>
            Unable to load vitals
          </h3>

          <p>{error}</p>

        </div>
      )}

      {/* =========================
          NO DATA
      ========================== */}
      {!loading &&
        !error &&
        filteredVitals.length === 0 && (
          <div className="doctor-vitals-empty">

            <HeartPulse size={36} />

            <h3>
              No patient vitals found
            </h3>

            <p>
              No monitoring information is
              available.
            </p>

          </div>
        )}

      {/* =========================
          VITAL CARDS
      ========================== */}
      {!loading &&
        !error &&
        filteredVitals.length > 0 && (
          <div className="doctor-vitals-grid">

            {filteredVitals.map(
              (vital) => (
                <div
                  className="doctor-vital-card"
                  key={vital.id}
                >

                  {/* Patient Header */}
                  <div className="doctor-vital-card-header">

                    <div>

                      <h2>
                        {getPatientName(
                          vital.patientId
                        )}
                      </h2>

                      <p>
                        {patients.find(
                          (p) =>
                            p.uid ===
                            vital.patientId
                        )?.email ||
                          "Patient"}
                      </p>

                    </div>

                    {vital.severity && (
                      <span
                        className={getSeverityClass(
                          vital.severity
                        )}
                      >
                        {vital.severity}
                      </span>
                    )}

                  </div>

                  {/* Vital Values */}
                  <div className="doctor-vital-values">

                    {/* Temperature */}
                    <div className="doctor-vital-item">

                      <div className="doctor-vital-icon">
                        <Thermometer
                          size={20}
                        />
                      </div>

                      <div>
                        <span>
                          Temperature
                        </span>

                        <strong>
                          {vital.temperature
                            ? `${vital.temperature} °C`
                            : "Not recorded"}
                        </strong>
                      </div>

                    </div>

                    {/* Heart Rate */}
                    <div className="doctor-vital-item">

                      <div className="doctor-vital-icon">
                        <HeartPulse
                          size={20}
                        />
                      </div>

                      <div>
                        <span>
                          Heart Rate
                        </span>

                        <strong>
                          {vital.heartRate
                            ? `${vital.heartRate} bpm`
                            : "Not recorded"}
                        </strong>
                      </div>

                    </div>

                    {/* Blood Pressure */}
                    <div className="doctor-vital-item">

                      <div className="doctor-vital-icon">
                        <Activity
                          size={20}
                        />
                      </div>

                      <div>
                        <span>
                          Blood Pressure
                        </span>

                        <strong>
                          {vital.bloodPressure ||
                            "Not recorded"}
                        </strong>
                      </div>

                    </div>

                    {/* Oxygen */}
                    <div className="doctor-vital-item">

                      <div className="doctor-vital-icon">
                        <Wind size={20} />
                      </div>

                      <div>
                        <span>
                          Oxygen Level
                        </span>

                        <strong>
                          {vital.oxygenLevel
                            ? `${vital.oxygenLevel}%`
                            : "Not recorded"}
                        </strong>
                      </div>

                    </div>

                  </div>

                  {/* Footer */}
                  <div className="doctor-vital-card-footer">

                    <div>
                      <span>
                        Last Updated
                      </span>

                      <strong>
                        {formatDate(
                          vital.updatedAt
                        )}
                      </strong>
                    </div>

                    <div>
                      <span>
                        Updated By
                      </span>

                      <strong>
                        {vital.updatedBy ||
                          "Not available"}
                      </strong>
                    </div>

                    <Link
                      to={`/doctor/patients/${vital.patientId}`}
                      className="doctor-vital-view-button"
                    >
                      View Patient
                    </Link>

                  </div>

                </div>
              )
            )}

          </div>
        )}

    </div>
  );
};

export default DoctorVitals;