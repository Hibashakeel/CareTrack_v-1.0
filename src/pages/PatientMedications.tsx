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
          ? { ...medication, status: "Taken" }
          : medication
      )
    );
  };

  const takenCount = medications.filter(
    (item) => item.status === "Taken"
  ).length;

  return (
    <div className="patient-page">
      <div className="patient-page-heading">
        <h1>My Medications</h1>
        <p>
          View your recorded medication schedule and mark your doses
          when they have been taken.
        </p>
      </div>

      <div className="patient-inner-card">
        <div className="patient-card-title">
          <Pill size={20} color="#159a9c" />
          Today's Medication Schedule
        </div>

        <p className="patient-card-description">
          {takenCount} of {medications.length} recorded doses marked as
          taken today.
        </p>

        <div className="medication-list">
          {medications.map((medication) => (
            <div className="medication-item" key={medication.id}>
              <div className="medication-main">
                <div className="medication-icon">
                  <Pill size={20} />
                </div>

                <div>
                  <h3>{medication.name}</h3>

                  <p>{medication.dosage}</p>

                  <div className="medication-time">
                    <Clock3 size={14} />
                    {medication.time}
                  </div>
                </div>
              </div>

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
                    onClick={() => markAsTaken(medication.id)}
                  >
                    Mark as Taken
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="medication-bottom-grid">
        <div className="patient-inner-card">
          <div className="patient-card-title">
            <CalendarDays size={19} color="#159a9c" />
            Medication Record
          </div>

          <p className="patient-card-description">
            Your medication information is recorded so your care team
            can review it when needed.
          </p>

          <div className="medication-info-box">
            <strong>Important</strong>
            <p>
              CareTrack only records medication information. It does
              not prescribe medication or change your treatment.
            </p>
          </div>
        </div>

        <div className="patient-inner-card">
          <div className="patient-card-title">
            <CheckCircle2 size={19} color="#159a9c" />
            Today's Progress
          </div>

          <div className="medication-progress">
            <div className="medication-progress-number">
              {takenCount}/{medications.length}
            </div>

            <div className="medication-progress-text">
              <strong>Doses recorded</strong>
              <span>
                Keep your medication information updated for your
                care team.
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}