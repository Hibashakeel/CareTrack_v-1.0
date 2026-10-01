import {
  ArrowLeft,
  ArrowRight,
  Search,
  Users,
} from "lucide-react";

import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { get, ref } from "firebase/database";

import { db } from "../../lib/firebase";

interface UserProfile {
  uid: string;
  fullName?: string;
  email?: string;
  role?: string;
  active?: boolean;
  approvalStatus?: string;
}

export default function DoctorPatients() {
  const [patients, setPatients] = useState<UserProfile[]>(
    []
  );

  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPatients() {
      try {
        const snapshot = await get(ref(db, "users"));

        if (!snapshot.exists()) {
          setPatients([]);
          return;
        }

        const data = snapshot.val() as Record<
          string,
          Omit<UserProfile, "uid">
        >;

        const patientList: UserProfile[] =
          Object.entries(data)
            .filter(
              ([, item]) =>
                item.role === "patient"
            )
            .map(([uid, item]) => ({
              uid,
              ...item,
            }));

        setPatients(patientList);
      } catch (error) {
        console.error(
          "Unable to load doctor patients:",
          error
        );
      } finally {
        setLoading(false);
      }
    }

    loadPatients();
  }, []);

  const filteredPatients = patients.filter(
    (patient) => {
      const search = searchTerm
        .trim()
        .toLowerCase();

      if (!search) {
        return true;
      }

      return (
        patient.fullName
          ?.toLowerCase()
          .includes(search) ||
        patient.email
          ?.toLowerCase()
          .includes(search)
      );
    }
  );

  return (
    <div className="patient-dashboard">

      {/* HEADER */}
      <section className="patient-welcome">

        <div className="patient-welcome-text">

          <p className="dashboard-eyebrow">
            DOCTOR
          </p>

          <h1>
            Patients
          </h1>

          <p>
            View and access patient records,
            reports and monitoring information.
          </p>

        </div>

        <Link
          to="/doctor/dashboard"
          className="patient-secondary-button"
        >
          <ArrowLeft size={17} />
          Dashboard
        </Link>

      </section>

      {/* SEARCH */}
      <section className="patient-card">

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            border: "1px solid #e2e8f0",
            borderRadius: "12px",
            padding: "12px 15px",
          }}
        >

          <Search
            size={19}
            color="#718096"
          />

          <input
            type="text"
            value={searchTerm}
            onChange={(event) =>
              setSearchTerm(event.target.value)
            }
            placeholder="Search patient by name or email..."
            style={{
              width: "100%",
              border: "none",
              outline: "none",
              fontSize: "14px",
              background: "transparent",
            }}
          />

        </div>

      </section>

      {/* PATIENT LIST */}
      <section className="patient-card">

        <div className="patient-card-header">

          <div>
            <p className="card-kicker">
              PATIENT RECORDS
            </p>

            <h2>
              All Patients
            </h2>

            <p>
              {filteredPatients.length} patient
              {filteredPatients.length === 1
                ? ""
                : "s"} found.
            </p>
          </div>

          <div className="quick-action-icon">
            <Users size={21} />
          </div>

        </div>

        {loading ? (
          <div
            style={{
              padding: "35px",
              textAlign: "center",
              color: "#718096",
            }}
          >
            Loading patients...
          </div>
        ) : filteredPatients.length === 0 ? (
          <div
            style={{
              padding: "35px",
              textAlign: "center",
              background: "#f7fafc",
              borderRadius: "12px",
              color: "#718096",
            }}
          >
            <Users
              size={34}
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
              No patients found
            </h3>

            <p
              style={{
                margin: 0,
              }}
            >
              Try another patient name or email.
            </p>
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gap: "12px",
            }}
          >
            {filteredPatients.map(
              (patient) => (
                <Link
                  key={patient.uid}
                  to={`/doctor/patients/${patient.uid}`}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent:
                      "space-between",
                    padding: "17px",
                    border:
                      "1px solid #e5eaf0",
                    borderRadius: "12px",
                    textDecoration: "none",
                    color: "inherit",
                  }}
                >

                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "13px",
                    }}
                  >

                    <div className="quick-action-icon">
                      <Users size={20} />
                    </div>

                    <div>
                      <strong>
                        {patient.fullName ||
                          "Unnamed Patient"}
                      </strong>

                      <div
                        style={{
                          marginTop: "4px",
                          fontSize: "12px",
                          color: "#718096",
                        }}
                      >
                        {patient.email ||
                          "No email available"}
                      </div>
                    </div>

                  </div>

                  <ArrowRight size={17} />

                </Link>
              )
            )}
          </div>
        )}

      </section>

    </div>
  );
}