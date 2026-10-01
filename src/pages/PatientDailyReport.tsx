import {
  ClipboardList,
  CheckCircle2,
  Save,
  Utensils,
  Droplets,
  HeartPulse,
  Activity,
} from "lucide-react";

import {
  useEffect,
  useState,
  type FormEvent,
} from "react";

import {
  push,
  ref,
  serverTimestamp,
} from "firebase/database";

import { useAuth } from "../context/AuthContext";
import { db } from "../lib/firebase";

export default function PatientDailyReport() {
  const { user, profile } = useAuth();

  const [submitted, setSubmitted] = useState(false);
  const [saving, setSaving] = useState(false);

  const [pain, setPain] = useState("2");
  const [water, setWater] = useState("5");
  const [food, setFood] = useState("");
  const [symptoms, setSymptoms] = useState("");
  const [condition, setCondition] = useState("Feeling better");

  const [today, setToday] = useState("");

  useEffect(() => {
    const currentDate = new Date();

    const formattedDate = currentDate.toLocaleDateString(
      "en-US",
      {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      }
    );

    setToday(formattedDate);
  }, []);

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (!user?.uid) {
      alert("Please login again before submitting your report.");
      return;
    }

    try {
      setSaving(true);

      const reportData = {
        patientId: user.uid,
        patientName:
          profile?.fullName ||
          user.displayName ||
          "Patient",
        patientEmail: user.email || "",

        reportDate: new Date().toISOString().split("T")[0],

        condition,
        pain: Number(pain),
        waterGlasses: Number(water),
        food: food.trim(),
        symptoms: symptoms.trim(),

        submittedAt: serverTimestamp(),
        status: "submitted",
      };

      await push(
        ref(db, `patientDailyReports/${user.uid}`),
        reportData
      );

      setSubmitted(true);

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    } catch (error) {
      console.error(
        "Daily report save error:",
        error
      );

      alert(
        "Unable to save your daily report. Please try again."
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="patient-page">
      <div className="patient-page-heading">
        <div>
          <p className="dashboard-eyebrow">
            DAILY SELF-REPORT
          </p>

          <h1>Today's Health Report</h1>

          <p>
            Record how you are feeling and share your
            daily information with your care team.
          </p>

          {today && (
            <p
              style={{
                marginTop: "8px",
                fontSize: "13px",
                opacity: 0.7,
              }}
            >
              {today}
            </p>
          )}
        </div>
      </div>

      {submitted && (
        <div className="patient-success-message">
          <CheckCircle2 size={19} />

          <div>
            <strong>
              Daily report saved successfully
            </strong>

            <span>
              Your information has been recorded and is
              now available to your care team.
            </span>
          </div>
        </div>
      )}

      <form
        className="daily-report-layout"
        onSubmit={handleSubmit}
      >
        {/* LEFT */}

        <div className="patient-main-column">

          {/* Condition */}

          <section className="patient-card">
            <div className="patient-card-header">
              <div>
                <p className="card-kicker">
                  01 · CONDITION
                </p>

                <h2>
                  How are you feeling today?
                </h2>

                <p>
                  Select the option that best describes
                  your current condition.
                </p>
              </div>

              <Activity
                size={22}
                className="section-icon"
              />
            </div>

            <div className="condition-options">
              {[
                "Feeling better",
                "Feeling the same",
                "Feeling worse",
              ].map((option) => (
                <label
                  key={option}
                  className={
                    condition === option
                      ? "condition-option selected"
                      : "condition-option"
                  }
                >
                  <input
                    type="radio"
                    name="condition"
                    value={option}
                    checked={
                      condition === option
                    }
                    onChange={(e) =>
                      setCondition(
                        e.target.value
                      )
                    }
                  />

                  <span>
                    {option}
                  </span>
                </label>
              ))}
            </div>
          </section>

          {/* Pain */}

          <section className="patient-card">
            <div className="patient-card-header">
              <div>
                <p className="card-kicker">
                  02 · PAIN
                </p>

                <h2>
                  How would you rate your pain?
                </h2>

                <p>
                  Use the scale from 0 to 10.
                </p>
              </div>

              <HeartPulse
                size={22}
                className="section-icon"
              />
            </div>

            <div className="pain-value">
              <strong>{pain}</strong>
              <span>/ 10</span>
            </div>

            <input
              type="range"
              min="0"
              max="10"
              value={pain}
              onChange={(e) =>
                setPain(e.target.value)
              }
              className="pain-range"
            />

            <div className="range-labels">
              <span>No pain</span>
              <span>Severe pain</span>
            </div>
          </section>

          {/* Food */}

          <section className="patient-card">
            <div className="patient-card-header">
              <div>
                <p className="card-kicker">
                  03 · FOOD
                </p>

                <h2>
                  What did you eat today?
                </h2>

                <p>
                  Add a short description of your meals.
                </p>
              </div>

              <Utensils
                size={22}
                className="section-icon"
              />
            </div>

            <textarea
              className="patient-textarea"
              value={food}
              onChange={(e) =>
                setFood(e.target.value)
              }
              placeholder="Example: Breakfast - eggs and toast. Lunch - rice and vegetables..."
              rows={4}
            />
          </section>

          {/* Symptoms */}

          <section className="patient-card">
            <div className="patient-card-header">
              <div>
                <p className="card-kicker">
                  04 · SYMPTOMS
                </p>

                <h2>
                  Any symptoms or changes?
                </h2>

                <p>
                  Describe any changes you noticed today.
                </p>
              </div>
            </div>

            <textarea
              className="patient-textarea"
              value={symptoms}
              onChange={(e) =>
                setSymptoms(e.target.value)
              }
              placeholder="Describe any symptoms or changes you noticed..."
              rows={4}
            />
          </section>
        </div>

        {/* RIGHT */}

        <aside className="patient-side-column">

          {/* Water */}

          <section className="patient-card">
            <div className="patient-card-header">
              <div>
                <p className="card-kicker">
                  05 · WATER
                </p>

                <h2>
                  Water intake
                </h2>
              </div>

              <Droplets
                size={22}
                className="section-icon"
              />
            </div>

            <div className="water-value">
              <strong>{water}</strong>
              <span>glasses</span>
            </div>

            <div className="water-buttons">
              {[3, 5, 8].map((amount) => (
                <button
                  key={amount}
                  type="button"
                  className={
                    water === String(amount)
                      ? "water-button selected"
                      : "water-button"
                  }
                  onClick={() =>
                    setWater(String(amount))
                  }
                >
                  {amount}
                </button>
              ))}
            </div>

            <p className="form-helper">
              Select the number closest to your
              intake today.
            </p>
          </section>

          {/* Help */}

          <section className="patient-card report-help">
            <ClipboardList size={22} />

            <h2>
              Why complete this?
            </h2>

            <p>
              Your daily report helps your care team
              understand changes in your condition without
              requiring repeated manual questions.
            </p>
          </section>

          {/* Save */}

          <button
            type="submit"
            className="patient-primary-button report-save-button"
            disabled={saving}
            style={{
              opacity: saving ? 0.7 : 1,
              cursor: saving
                ? "not-allowed"
                : "pointer",
            }}
          >
            <Save size={18} />

            {saving
              ? "Saving Report..."
              : "Save Daily Report"}
          </button>
        </aside>
      </form>
    </div>
  );
}
