import { useState } from "react";
import {
  Pill,
  CheckCircle2,
  Clock3,
  CalendarDays,
} from "lucide-react";

import "../patient-pages.css";

type Medication = {
  id: number;
  name: string;
  dosage: string;
  time: string;
  status: "Taken" | "Pending";
};

export default function PatientMedications() {
  const [medications, setMedications] = useState<Medication[]>([
    {
      id: 1,
      name: "Medication A",
      dosage: "As prescribed",
      time: "08:00 AM",
      status: "Taken",
    },
    {
      id: 2,
      name: "Medication B",
      dosage: "As prescribed",
      time: "02:00 PM",
      status: "Pending",
    },
    {
      id: 3,
      name: "Medication C",
      dosage: "As prescribed",
      time: "08:00 PM",
      status: "Pending",
    },
  ]);

  const markAsTaken = (id: number) => {
    setMedications((current) =>
      current.map((medication) =>
        medication.id === id
          ? {
              ...medication,
              status: "Taken",
            }
          : medication
      )
    );
  };

  const takenCount = medications.filter(
    (medication) => medication.status === "Taken"
  ).length;

  const totalCount = medications.length;

  const progress =
    totalCount > 0
      ? Math.round((takenCount / totalCount) * 100)
      : 0;

  return (
    <div className="patient-page">

      {/* =========================
          PAGE HEADER
      ========================== */}
      <div className="patient-page-heading">
        <div>
          <h1>My Medications</h1>

          <p>
            View your recorded medication schedule and keep your
            medication status updated.
          </p>
        </div>
      </div>

      {/* =========================
          TODAY'S MEDICATIONS
      ========================== */}
      <div className="patient-inner-card">

        <div className="patient-card-title">
          <Pill size={20} color="#159a9c" />
          Today's Medication Schedule
        </div>

        <p className="patient-card-description">
          {takenCount} of {totalCount} doses marked as taken today.
        </p>

        {/* Medication List */}
        <div className="medication-list">

          {medications.map((medication) => (
            <div
              className="medication-item"
              key={medication.id}
            >

              {/* Medication Information */}
              <div className="medication-main">

                <div className="medication-icon">
                  <Pill size={20} />
                </div>

                <div className="medication-details">
                  <h3>{medication.name}</h3>

                  <p>{medication.dosage}</p>

                  <div className="medication-time">
                    <Clock3 size={14} />
                    <span>{medication.time}</span>
                  </div>
                </div>
              </div>

              {/* Medication Status */}
              <div className="medication-action">

                {medication.status === "Taken" ? (
                  <span className="medication-status taken">
                    <CheckCircle2 size={15} />
                    Taken
                  </span>
                ) : (
                  <button
                    type="button"
                    className="medication-take-button"
                    onClick={() =>
                      markAsTaken(medication.id)
                    }
                  >
                    Mark as Taken
                  </button>
                )}

              </div>
            </div>
          ))}

        </div>
      </div>

      {/* =========================
          BOTTOM INFORMATION
      ========================== */}
      <div className="medication-bottom-grid">

        {/* Medication Record */}
        <div className="patient-inner-card">

          <div className="patient-card-title">
            <CalendarDays
              size={19}
              color="#159a9c"
            />

            Medication Record
          </div>

          <p className="patient-card-description">
            Your recorded medication information can be reviewed by
            your care team when needed.
          </p>

          <div className="medication-info-box">
            <strong>Important</strong>

            <p>
              CareTrack records medication information and dose
              status. It does not prescribe medication or change
              your treatment.
            </p>
          </div>

        </div>

        {/* Today's Progress */}
        <div className="patient-inner-card">

          <div className="patient-card-title">
            <CheckCircle2
              size={19}
              color="#159a9c"
            />

            Today's Progress
          </div>

          <div className="medication-progress">

            <div className="medication-progress-number">
              {takenCount}/{totalCount}
            </div>

            <div className="medication-progress-text">
              <strong>Doses recorded</strong>

              <span>
                {progress}% of today's medication doses have
                been recorded as taken.
              </span>
            </div>

          </div>

          {/* Progress Bar */}
          <div className="medication-progress-bar">
            <div
              className="medication-progress-fill"
              style={{
                width: `${progress}%`,
              }}
            />
          </div>

        </div>

      </div>
    </div>
  );
}