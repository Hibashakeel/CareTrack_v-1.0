import {
  Activity,
  CheckCircle2,
  Droplets,
  HeartPulse,
  Minus,
  Plus,
  Save,
  Utensils,
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
  const [dailyChanges, setDailyChanges] = useState("");
  const [condition, setCondition] = useState("Feeling better");

  const [today, setToday] = useState("");

  useEffect(() => {
    setToday(
      new Date().toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    );
  }, []);

  function changeWater(amount: number) {
    setWater((current) => {
      const next = Number(current) + amount;

      if (next < 0) return "0";
      if (next > 20) return "20";

      return String(next);
    });
  }

  function getPainTheme(value: number) {
    if (value <= 3) {
      return {
        color: "#3b82c4",
        background: "#eef6fc",
        border: "#b9d8ef",
        label: "Low",
      };
    }

    if (value <= 6) {
      return {
        color: "#4f9b72",
        background: "#eef8f2",
        border: "#c4e3d0",
        label: "Moderate",
      };
    }

    if (value <= 8) {
      return {
        color: "#c9952e",
        background: "#fff8e8",
        border: "#ead9a8",
        label: "High",
      };
    }

    return {
      color: "#c65c5c",
      background: "#fff0f0",
      border: "#ebc2c2",
      label: "Severe",
    };
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (!user?.uid) {
      alert("Please login again before submitting your report.");
      return;
    }

    if (!food.trim()) {
      alert("Please enter what you ate today.");
      return;
    }

    if (!symptoms.trim()) {
      alert(
        "Please describe your symptoms, or write 'No new symptoms'."
      );
      return;
    }

    if (!dailyChanges.trim()) {
      alert(
        "Please describe today's changes, or write 'No major changes'."
      );
      return;
    }

    try {
      setSaving(true);
      setSubmitted(false);

      const now = new Date();

      await push(
        ref(db, `patientDailyReports/${user.uid}`),
        {
          patientId: user.uid,

          patientName:
            profile?.fullName ||
            user.displayName ||
            "Patient",

          patientEmail: user.email || "",

          reportDate: now.toISOString().split("T")[0],

          condition,

          pain: Number(pain),

          waterGlasses: Number(water),

          food: food.trim(),

          symptoms: symptoms.trim(),

          dailyChanges: dailyChanges.trim(),

          submittedAt: serverTimestamp(),

          status: "submitted",
        }
      );

      setSubmitted(true);

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    } catch (error) {
      console.error("Daily report save error:", error);

      alert(
        "Unable to save your daily report. Please try again."
      );
    } finally {
      setSaving(false);
    }
  }

  const painTheme = getPainTheme(Number(pain));

  return (
    <div className="patient-page">

      {/* HEADER */}

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
                marginTop: "7px",
                fontSize: "13px",
                opacity: 0.65,
              }}
            >
              {today}
            </p>
          )}
        </div>
      </div>

      {/* SUCCESS */}

      {submitted && (
        <div className="patient-success-message">
          <CheckCircle2 size={19} />

          <div>
            <strong>
              Daily report saved successfully
            </strong>

            <span>
              Your information is now available to your
              care team.
            </span>
          </div>
        </div>
      )}

      <form
        className="daily-report-form"
        onSubmit={handleSubmit}
      >

        {/* =========================
            TOP CARDS
        ========================= */}

        <div className="daily-report-top-grid">

          {/* CONDITION */}

          <section className="patient-card compact-report-card">

            <div className="patient-card-header">
              <div>
                <p className="card-kicker">
                  01 · CONDITION
                </p>

                <h2>
                  How are you feeling today?
                </h2>

                <p>
                  Select what best describes how you feel.
                </p>
              </div>

              <Activity
                size={20}
                className="section-icon"
              />
            </div>

            <div className="condition-options">

              {[
                "Feeling better",
                "Feeling same",
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
                    checked={condition === option}
                    onChange={(event) =>
                      setCondition(event.target.value)
                    }
                  />

                  <span>{option}</span>
                </label>
              ))}

            </div>

          </section>

          {/* PAIN */}

          <section className="patient-card compact-report-card">

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
                size={20}
                className="section-icon"
              />
            </div>

            <div
              className="pain-display"
              style={{
                color: painTheme.color,
                background: painTheme.background,
                borderColor: painTheme.border,
              }}
            >
              <div className="pain-number">
                <strong>{pain}</strong>
                <span>/ 10</span>
              </div>

              <span className="pain-status">
                {painTheme.label}
              </span>
            </div>

            <input
              type="range"
              min="0"
              max="10"
              value={pain}
              onChange={(event) =>
                setPain(event.target.value)
              }
              className="pain-range"
              style={{
                accentColor: painTheme.color,
              }}
            />

            <div className="range-labels">
              <span>0 · No pain</span>
              <span>10 · Severe</span>
            </div>

            <div className="pain-scale">
              <span
                style={{
                  background: "#3b82c4",
                }}
              />

              <span
                style={{
                  background: "#4f9b72",
                }}
              />

              <span
                style={{
                  background: "#c9952e",
                }}
              />

              <span
                style={{
                  background: "#c65c5c",
                }}
              />
            </div>

          </section>

          {/* WATER */}

          <section className="patient-card compact-report-card">

            <div className="patient-card-header">
              <div>
                <p className="card-kicker">
                  03 · WATER
                </p>

                <h2>
                  Water intake
                </h2>

                <p>
                  How many glasses did you drink?
                </p>
              </div>

              <Droplets
                size={20}
                className="section-icon"
              />
            </div>

            <div className="water-control">

              <button
                type="button"
                className="water-step-button"
                onClick={() => changeWater(-1)}
                disabled={Number(water) === 0}
                aria-label="Decrease water intake"
              >
                <Minus size={17} />
              </button>

              <div className="water-number">
                <strong>{water}</strong>
                <span>glasses</span>
              </div>

              <button
                type="button"
                className="water-step-button"
                onClick={() => changeWater(1)}
                disabled={Number(water) === 20}
                aria-label="Increase water intake"
              >
                <Plus size={17} />
              </button>

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

            <p className="water-helper">
              Quick select
            </p>

          </section>

        </div>

        {/* =========================
            DETAILS
        ========================= */}

        <div className="details-heading">
          <p className="card-kicker">
            DAILY DETAILS
          </p>

          <h2>Tell us about your day</h2>
        </div>

        <div className="daily-report-details-grid">

          {/* FOOD */}

          <section className="patient-card compact-report-card">

            <div className="patient-card-header">
              <div>
                <p className="card-kicker">
                  04 · FOOD
                </p>

                <h2>
                  What did you eat today?
                </h2>

                <p>
                  Add a short description of your meals.
                </p>
              </div>

              <Utensils
                size={20}
                className="section-icon"
              />
            </div>

            <textarea
              className="patient-textarea"
              value={food}
              onChange={(event) =>
                setFood(event.target.value)
              }
              placeholder="Example: Breakfast - eggs and toast. Lunch - rice and vegetables..."
              rows={4}
              maxLength={500}
            />

            <div className="field-counter">
              {food.length}/500
            </div>

          </section>

          {/* SYMPTOMS */}

          <section className="patient-card compact-report-card">

            <div className="patient-card-header">
              <div>
                <p className="card-kicker">
                  05 · SYMPTOMS
                </p>

                <h2>
                  Any symptoms or changes?
                </h2>

                <p>
                  Describe anything you noticed today.
                </p>
              </div>

              <HeartPulse
                size={20}
                className="section-icon"
              />
            </div>

            <textarea
              className="patient-textarea"
              value={symptoms}
              onChange={(event) =>
                setSymptoms(event.target.value)
              }
              placeholder="Example: Mild headache this morning. No other new symptoms."
              rows={4}
              maxLength={500}
            />

            <div className="field-counter">
              {symptoms.length}/500
            </div>

          </section>

          {/* DAILY CHANGES */}

          <section className="patient-card compact-report-card daily-changes-card">

            <div className="patient-card-header">
              <div>
                <p className="card-kicker">
                  06 · DAILY CHANGES
                </p>

                <h2>
                  What changed today?
                </h2>

                <p>
                  Share anything different from previous
                  days.
                </p>
              </div>

              <Activity
                size={20}
                className="section-icon"
              />
            </div>

            <textarea
              className="patient-textarea"
              value={dailyChanges}
              onChange={(event) =>
                setDailyChanges(event.target.value)
              }
              placeholder="Example: I feel more comfortable today and can move around more easily."
              rows={4}
              maxLength={500}
            />

            <div className="field-counter">
              {dailyChanges.length}/500
            </div>

          </section>

        </div>

        {/* SAVE */}

        <div className="daily-report-save-area">
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
        </div>

      </form>

      <style>{`

        .daily-report-form {
          width: 100%;
        }

        /* TOP CARDS */

        .daily-report-top-grid {
          display: grid;
          grid-template-columns:
            repeat(3, minmax(0, 1fr));
          gap: 16px;
          align-items: stretch;
        }

        .compact-report-card {
          height: auto;
          box-sizing: border-box;
        }

        /* CARD HEADERS */

        .compact-report-card
        .patient-card-header {
          margin-bottom: 4px;
        }

        .compact-report-card
        .patient-card-header h2 {
          font-size: 18px;
          line-height: 1.3;
        }

        .compact-report-card
        .patient-card-header p:not(.card-kicker) {
          font-size: 13px;
          line-height: 1.45;
        }

        /* CONDITION */

        .condition-options {
          display: grid;
          gap: 7px;
          margin-top: 15px;
        }

        .condition-option {
          display: flex;
          align-items: center;
          gap: 10px;
          min-width: 0;
          box-sizing: border-box;
          padding: 10px 11px;
          border: 1px solid #dce5ed;
          border-radius: 9px;
          background: #ffffff;
          cursor: pointer;
          transition:
            border-color 0.18s ease,
            background 0.18s ease,
            transform 0.18s ease;
        }

        .condition-option:hover {
          border-color: #9db2c5;
          background: #fafcfe;
        }

        .condition-option.selected {
          border-color: #315d84;
          background: #f2f7fb;
        }

        .condition-option input {
          flex: 0 0 auto;
          width: 16px;
          height: 16px;
          margin: 0;
          accent-color: #315d84;
        }

        .condition-option span {
          min-width: 0;
          font-size: 13px;
          line-height: 1.25;
          font-weight: 600;
          color: #25384a;
          white-space: normal;
          overflow-wrap: break-word;
        }

        /* PAIN */

        .pain-display {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          box-sizing: border-box;
          margin-top: 19px;
          padding: 10px 13px;
          border: 1px solid;
          border-radius: 11px;
          transition:
            color 0.2s ease,
            background 0.2s ease,
            border-color 0.2s ease;
        }

        .pain-number {
          display: flex;
          align-items: baseline;
          gap: 4px;
        }

        .pain-number strong {
          font-size: 31px;
          line-height: 1;
          font-weight: 700;
        }

        .pain-number span {
          font-size: 12px;
          opacity: 0.7;
          font-weight: 600;
        }

        .pain-status {
          padding: 4px 8px;
          border-radius: 999px;
          font-size: 11px;
          font-weight: 700;
          white-space: nowrap;
        }

        .pain-range {
          width: 100%;
          margin-top: 16px;
          cursor: pointer;
        }

        .range-labels {
          display: flex;
          justify-content: space-between;
          margin-top: 5px;
          font-size: 11px;
          color: #647789;
        }

        .pain-scale {
          display: grid;
          grid-template-columns:
            repeat(4, 1fr);
          gap: 4px;
          margin-top: 8px;
          opacity: 0.8;
        }

        .pain-scale span {
          height: 3px;
          border-radius: 99px;
        }

        /* WATER */

        .water-control {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 14px;
          margin-top: 20px;
        }

        .water-step-button {
          width: 37px;
          height: 37px;
          flex: 0 0 37px;
          border-radius: 50%;
          border: 1px solid #d7e1ea;
          background: #ffffff;
          color: #315d84;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition:
            border-color 0.18s ease,
            background 0.18s ease,
            transform 0.18s ease;
        }

        .water-step-button:hover:not(:disabled) {
          border-color: #315d84;
          background: #f1f6fa;
          transform: scale(1.04);
        }

        .water-step-button:disabled {
          opacity: 0.35;
          cursor: not-allowed;
        }

        .water-number {
          min-width: 80px;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .water-number strong {
          font-size: 38px;
          line-height: 1;
          color: #315d84;
        }

        .water-number span {
          margin-top: 4px;
          font-size: 12px;
          color: #647789;
        }

        .water-buttons {
          display: flex;
          justify-content: center;
          gap: 9px;
          margin-top: 18px;
        }

        .water-button {
          width: 48px;
          height: 40px;
          border-radius: 9px;
          border: 1px solid #d5e0e9;
          background: #ffffff;
          color: #315d84;
          font-size: 14px;
          font-weight: 700;
          cursor: pointer;
          transition:
            border-color 0.18s ease,
            background 0.18s ease,
            transform 0.18s ease;
        }

        .water-button:hover {
          border-color: #315d84;
          background: #f3f7fa;
          transform: translateY(-1px);
        }

        .water-button.selected {
          background: #315d84;
          border-color: #315d84;
          color: #ffffff;
          box-shadow: 0 4px 10px rgba(49, 93, 132, 0.16);
        }

        .water-helper {
          margin: 7px 0 0;
          text-align: center;
          font-size: 11px;
          color: #718293;
        }

        /* DETAILS */

        .details-heading {
          margin: 22px 0 12px;
        }

        .details-heading h2 {
          margin: 3px 0 0;
          font-size: 20px;
        }

        .daily-report-details-grid {
          display: grid;
          grid-template-columns:
            repeat(2, minmax(0, 1fr));
          gap: 16px;
        }

        .daily-changes-card {
          grid-column: 1 / -1;
        }

        .patient-textarea {
          width: 100%;
          box-sizing: border-box;
          min-height: 105px;
          resize: vertical;
        }

        .field-counter {
          margin-top: 5px;
          text-align: right;
          font-size: 11px;
          opacity: 0.45;
        }

        /* SAVE */

        .daily-report-save-area {
          display: flex;
          justify-content: flex-end;
          margin-top: 16px;
        }

        .report-save-button {
          min-width: 205px;
        }

        /* RESPONSIVE */

        @media (max-width: 950px) {

          .daily-report-top-grid {
            grid-template-columns:
              repeat(2, minmax(0, 1fr));
          }

          .daily-report-top-grid
          .compact-report-card:last-child {
            grid-column: 1 / -1;
          }

        }

        @media (max-width: 700px) {

          .daily-report-top-grid,
          .daily-report-details-grid {
            grid-template-columns: 1fr;
          }

          .daily-report-top-grid
          .compact-report-card:last-child {
            grid-column: auto;
          }

          .daily-changes-card {
            grid-column: auto;
          }

          .daily-report-save-area {
            justify-content: stretch;
          }

          .report-save-button {
            width: 100%;
          }

        }

      `}</style>

    </div>
  );
}
