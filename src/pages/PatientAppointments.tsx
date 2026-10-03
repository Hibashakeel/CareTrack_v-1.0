
import {
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock3,
  MapPin,
  UserRound,
} from "lucide-react";

import { useMemo, useState } from "react";
import "../patient-pages.css";

type Appointment = {
  id: number;
  doctor: string;
  department: string;
  date: string;
  time: string;
  location: string;
  type: string;
};

type AppointmentStatus = "upcoming" | "past";

export default function PatientAppointments() {
  const appointments: Appointment[] = [
    {
      id: 1,
      doctor: "Dr. Care Team",
      department: "General Consultation",
      date: "30 September 2026",
      time: "10:30 AM",
      location: "Consultation Room 2",
      type: "Follow-up",
    },
    {
      id: 2,
      doctor: "Dr. Care Team",
      department: "Patient Review",
      date: "05 October 2026",
      time: "11:00 AM",
      location: "Consultation Room 1",
      type: "Review",
    },
  ];

  const [activeTab, setActiveTab] =
    useState<"upcoming" | "past">("upcoming");

  const [expandedId, setExpandedId] =
    useState<number | null>(null);

  /*
   * Current system date is used only to decide whether
   * an appointment is upcoming or past.
   *
   * The appointment data itself remains unchanged.
   */
  const today = new Date(
    2026,
    9,
    2
  );

  const parseAppointmentDate = (
    dateString: string
  ) => {
    const parsed = new Date(dateString);

    return Number.isNaN(parsed.getTime())
      ? null
      : parsed;
  };

  const getStatus = (
    appointment: Appointment
  ): AppointmentStatus => {
    const appointmentDate =
      parseAppointmentDate(appointment.date);

    if (!appointmentDate) {
      return "upcoming";
    }

    return appointmentDate < today
      ? "past"
      : "upcoming";
  };

  const upcomingAppointments = useMemo(
    () =>
      appointments.filter(
        (appointment) =>
          getStatus(appointment) === "upcoming"
      ),
    [appointments]
  );

  const pastAppointments = useMemo(
    () =>
      appointments.filter(
        (appointment) =>
          getStatus(appointment) === "past"
      ),
    [appointments]
  );

  const visibleAppointments =
    activeTab === "upcoming"
      ? upcomingAppointments
      : pastAppointments;

  const toggleDetails = (id: number) => {
    setExpandedId((current) =>
      current === id ? null : id
    );
  };

  return (
    <div className="patient-page appointment-page">

      {/* =====================================================
          PAGE HEADER
      ====================================================== */}

      <div className="patient-page-heading">
        <div>
          <span className="appointment-eyebrow">
            CARE & APPOINTMENTS
          </span>

          <h1>
            My Appointments
          </h1>

          <p>
            View your scheduled consultations, appointment
            times and location details.
          </p>
        </div>
      </div>


      {/* =====================================================
          APPOINTMENT SUMMARY
      ====================================================== */}

      <div className="appointment-summary">

        <div className="appointment-summary-card">
          <div className="appointment-summary-icon">
            <CalendarDays size={20} />
          </div>

          <div>
            <strong>
              {upcomingAppointments.length}
            </strong>

            <span>
              Upcoming
            </span>
          </div>
        </div>


        <div className="appointment-summary-card">
          <div className="appointment-summary-icon">
            <CheckCircle2 size={20} />
          </div>

          <div>
            <strong>
              {pastAppointments.length}
            </strong>

            <span>
              Completed
            </span>
          </div>
        </div>

      </div>


      {/* =====================================================
          TABS
      ====================================================== */}

      <div className="appointment-tabs">

        <button
          type="button"
          className={
            activeTab === "upcoming"
              ? "appointment-tab active"
              : "appointment-tab"
          }
          onClick={() => {
            setActiveTab("upcoming");
            setExpandedId(null);
          }}
        >
          Upcoming
          <span>
            {upcomingAppointments.length}
          </span>
        </button>


        <button
          type="button"
          className={
            activeTab === "past"
              ? "appointment-tab active"
              : "appointment-tab"
          }
          onClick={() => {
            setActiveTab("past");
            setExpandedId(null);
          }}
        >
          Past
          <span>
            {pastAppointments.length}
          </span>
        </button>

      </div>


      {/* =====================================================
          APPOINTMENT LIST
      ====================================================== */}

      <div className="appointment-list">

        {visibleAppointments.length === 0 ? (
          <div className="patient-inner-card appointment-empty">

            <div className="appointment-empty-icon">
              <CalendarDays size={25} />
            </div>

            <h2>
              {activeTab === "upcoming"
                ? "No upcoming appointments"
                : "No past appointments"}
            </h2>

            <p>
              {activeTab === "upcoming"
                ? "You currently have no upcoming appointments scheduled."
                : "Your completed appointments will appear here."}
            </p>

          </div>
        ) : (
          visibleAppointments.map(
            (appointment) => {
              const status =
                getStatus(appointment);

              const isExpanded =
                expandedId === appointment.id;

              return (
                <div
                  className={
                    status === "upcoming"
                      ? "patient-inner-card appointment-card appointment-upcoming"
                      : "patient-inner-card appointment-card appointment-past"
                  }
                  key={appointment.id}
                >

                  {/* =========================================
                      DATE
                  ========================================== */}

                  <div className="appointment-date-box">

                    <CalendarDays size={22} />

                    <strong>
                      {appointment.date}
                    </strong>

                    <span>
                      {status === "upcoming"
                        ? "Scheduled"
                        : "Completed"}
                    </span>

                  </div>


                  {/* =========================================
                      MAIN INFORMATION
                  ========================================== */}

                  <div className="appointment-main">

                    <div className="appointment-title-row">

                      <div>
                        <div className="appointment-doctor-row">

                          <h2>
                            {appointment.doctor}
                          </h2>

                          <span
                            className={
                              status === "upcoming"
                                ? "appointment-status upcoming"
                                : "appointment-status past"
                            }
                          >
                            {status === "upcoming"
                              ? "Upcoming"
                              : "Past"}
                          </span>

                        </div>

                        <p>
                          {appointment.department}
                        </p>
                      </div>

                      <span className="appointment-type">
                        {appointment.type}
                      </span>

                    </div>


                    {/* =======================================
                        BASIC DETAILS
                    ======================================== */}

                    <div className="appointment-details">

                      <span>
                        <Clock3 size={15} />
                        {appointment.time}
                      </span>

                      <span>
                        <MapPin size={15} />
                        {appointment.location}
                      </span>

                      <span>
                        <UserRound size={15} />
                        Care Team
                      </span>

                    </div>


                    {/* =======================================
                        DETAILS BUTTON
                    ======================================== */}

                    <button
                      type="button"
                      className="appointment-details-button"
                      onClick={() =>
                        toggleDetails(
                          appointment.id
                        )
                      }
                    >
                      {isExpanded
                        ? "Hide Details"
                        : "View Details"}

                      {isExpanded ? (
                        <ChevronUp size={16} />
                      ) : (
                        <ChevronDown size={16} />
                      )}
                    </button>


                    {/* =======================================
                        EXPANDED DETAILS
                    ======================================== */}

                    {isExpanded && (
                      <div className="appointment-expanded">

                        <div className="appointment-expanded-item">
                          <span>
                            Appointment Type
                          </span>

                          <strong>
                            {appointment.type}
                          </strong>
                        </div>

                        <div className="appointment-expanded-item">
                          <span>
                            Department
                          </span>

                          <strong>
                            {appointment.department}
                          </strong>
                        </div>

                        <div className="appointment-expanded-item">
                          <span>
                            Doctor / Care Team
                          </span>

                          <strong>
                            {appointment.doctor}
                          </strong>
                        </div>

                        <div className="appointment-expanded-item">
                          <span>
                            Location
                          </span>

                          <strong>
                            {appointment.location}
                          </strong>
                        </div>

                      </div>
                    )}

                  </div>

                </div>
              );
            }
          )
        )}

      </div>


      {/* =====================================================
          INFORMATION NOTE
      ====================================================== */}

      <div className="appointment-info-note">

        <div className="appointment-info-icon">
          <CalendarDays size={18} />
        </div>

        <div>
          <strong>
            Appointment information
          </strong>

          <p>
            Please check your appointment date, time and
            consultation location before visiting.
          </p>
        </div>

      </div>


      {/* =====================================================
          PAGE STYLES
      ====================================================== */}

      <style>{`

        /* =====================================================
           PAGE
        ====================================================== */

        .appointment-page {
          width: 100%;
          max-width: 1180px;
          margin: 0 auto;
        }


        /* =====================================================
           HEADER
        ====================================================== */

        .appointment-eyebrow {
          display: block;
          margin-bottom: 7px;
          color: #5f7288;
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 0.09em;
        }

        .appointment-page
        .patient-page-heading h1 {
          margin: 0;
          color: #17283d;
        }

        .appointment-page
        .patient-page-heading p {
          max-width: 650px;
          margin-top: 8px;
          color: #718094;
          line-height: 1.6;
        }


        /* =====================================================
           SUMMARY
        ====================================================== */

        .appointment-summary {
          display: grid;
          grid-template-columns:
            repeat(2, minmax(0, 1fr));
          gap: 14px;
          margin: 22px 0;
        }

        .appointment-summary-card {
          display: flex;
          align-items: center;
          gap: 13px;
          padding: 17px;
          border: 1px solid #e2eaf1;
          border-radius: 14px;
          background: #ffffff;
          box-shadow:
            0 4px 14px
            rgba(28, 49, 70, 0.035);
        }

        .appointment-summary-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 42px;
          height: 42px;
          flex-shrink: 0;
          border-radius: 11px;
          background: #edf5fb;
          color: #245a89;
        }

        .appointment-summary-card div:last-child {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .appointment-summary-card strong {
          color: #263a4e;
          font-size: 19px;
          line-height: 1;
        }

        .appointment-summary-card span {
          color: #788899;
          font-size: 11px;
          font-weight: 600;
        }


        /* =====================================================
           TABS
        ====================================================== */

        .appointment-tabs {
          display: flex;
          gap: 5px;
          width: fit-content;
          margin-bottom: 15px;
          padding: 4px;
          border: 1px solid #e3eaf0;
          border-radius: 11px;
          background: #f5f8fa;
        }

        .appointment-tab {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          padding: 8px 13px;
          border: 0;
          border-radius: 8px;
          background: transparent;
          color: #718094;
          cursor: pointer;
          font-family: inherit;
          font-size: 12px;
          font-weight: 700;
          transition: 0.2s ease;
        }

        .appointment-tab:hover {
          color: #245a89;
        }

        .appointment-tab.active {
          background: #ffffff;
          color: #173b63;
          box-shadow:
            0 2px 7px
            rgba(28, 49, 70, 0.07);
        }

        .appointment-tab span {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-width: 19px;
          height: 19px;
          padding: 0 5px;
          box-sizing: border-box;
          border-radius: 20px;
          background: #eaf2f8;
          color: #4d6982;
          font-size: 10px;
        }


        /* =====================================================
           LIST
        ====================================================== */

        .appointment-list {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }


        /* =====================================================
           APPOINTMENT CARD
        ====================================================== */

        .appointment-card {
          display: grid;
          grid-template-columns: 180px minmax(0, 1fr);
          gap: 22px;
          padding: 20px;
          overflow: hidden;
          transition:
            transform 0.2s ease,
            box-shadow 0.2s ease,
            border-color 0.2s ease;
        }

        .appointment-upcoming {
          border-color: #d5e4ef;
          box-shadow:
            0 5px 18px
            rgba(28, 49, 70, 0.05);
        }

        .appointment-upcoming:hover {
          transform: translateY(-1px);
          border-color: #bfd4e4;
          box-shadow:
            0 8px 23px
            rgba(28, 49, 70, 0.075);
        }

        .appointment-past {
          opacity: 0.78;
          background: #fafbfc;
        }


        /* =====================================================
           DATE BOX
        ====================================================== */

        .appointment-date-box {
          display: flex;
          align-items: center;
          justify-content: center;
          flex-direction: column;
          gap: 7px;
          min-height: 105px;
          padding: 14px;
          box-sizing: border-box;
          border-radius: 13px;
          background: #f3f8fc;
          color: #245a89;
          text-align: center;
        }

        .appointment-past
        .appointment-date-box {
          background: #f1f3f5;
          color: #73818e;
        }

        .appointment-date-box strong {
          color: #294257;
          font-size: 12px;
          line-height: 1.4;
        }

        .appointment-date-box span {
          padding: 4px 8px;
          border-radius: 20px;
          background: #e4f0f8;
          color: #4b6d87;
          font-size: 9px;
          font-weight: 800;
        }

        .appointment-past
        .appointment-date-box span {
          background: #e5e8eb;
          color: #71808d;
        }


        /* =====================================================
           MAIN CONTENT
        ====================================================== */

        .appointment-main {
          min-width: 0;
        }

        .appointment-title-row {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 15px;
        }

        .appointment-doctor-row {
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: 8px;
        }

        .appointment-title-row h2 {
          margin: 0;
          color: #20364b;
          font-size: 17px;
          line-height: 1.35;
        }

        .appointment-title-row p {
          margin: 5px 0 0;
          color: #728294;
          font-size: 12px;
        }


        /* =====================================================
           STATUS
        ====================================================== */

        .appointment-status {
          display: inline-flex;
          align-items: center;
          padding: 4px 8px;
          border-radius: 20px;
          font-size: 9px;
          font-weight: 800;
        }

        .appointment-status.upcoming {
          background: #edf7ef;
          color: #3d7548;
        }

        .appointment-status.past {
          background: #eef0f2;
          color: #71808d;
        }

        .appointment-type {
          flex-shrink: 0;
          padding: 5px 9px;
          border: 1px solid #dbe5ed;
          border-radius: 20px;
          background: #f8fafc;
          color: #587086;
          font-size: 10px;
          font-weight: 800;
        }


        /* =====================================================
           DETAILS
        ====================================================== */

        .appointment-details {
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: 10px 20px;
          margin-top: 17px;
          padding-top: 14px;
          border-top: 1px solid #edf1f4;
        }

        .appointment-details span {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          color: #66788a;
          font-size: 11px;
        }

        .appointment-details svg {
          flex-shrink: 0;
          color: #6988a1;
        }


        /* =====================================================
           DETAILS BUTTON
        ====================================================== */

        .appointment-details-button {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          margin-top: 14px;
          padding: 0;
          border: 0;
          background: transparent;
          color: #245a89;
          cursor: pointer;
          font-family: inherit;
          font-size: 11px;
          font-weight: 800;
        }

        .appointment-details-button:hover {
          color: #173b63;
        }


        /* =====================================================
           EXPANDED DETAILS
        ====================================================== */

        .appointment-expanded {
          display: grid;
          grid-template-columns:
            repeat(2, minmax(0, 1fr));
          gap: 10px;
          margin-top: 13px;
          padding: 13px;
          border: 1px solid #e6edf2;
          border-radius: 11px;
          background: #f8fafc;
        }

        .appointment-expanded-item {
          display: flex;
          flex-direction: column;
          gap: 3px;
          min-width: 0;
        }

        .appointment-expanded-item span {
          color: #81909e;
          font-size: 9px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.04em;
        }

        .appointment-expanded-item strong {
          overflow: hidden;
          color: #344a5f;
          font-size: 11px;
          text-overflow: ellipsis;
          white-space: nowrap;
        }


        /* =====================================================
           EMPTY STATE
        ====================================================== */

        .appointment-empty {
          display: flex;
          align-items: center;
          justify-content: center;
          flex-direction: column;
          min-height: 230px;
          padding: 30px;
          text-align: center;
        }

        .appointment-empty-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 52px;
          height: 52px;
          margin-bottom: 13px;
          border-radius: 14px;
          background: #edf5fb;
          color: #245a89;
        }

        .appointment-empty h2 {
          margin: 0;
          color: #293e53;
          font-size: 16px;
        }

        .appointment-empty p {
          max-width: 430px;
          margin: 7px 0 0;
          color: #7a8998;
          font-size: 12px;
          line-height: 1.6;
        }


        /* =====================================================
           INFO NOTE
        ====================================================== */

        .appointment-info-note {
          display: flex;
          align-items: flex-start;
          gap: 11px;
          margin-top: 17px;
          padding: 14px 15px;
          border: 1px solid #e2eaf1;
          border-radius: 12px;
          background: #f8fbfd;
        }

        .appointment-info-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 34px;
          height: 34px;
          flex-shrink: 0;
          border-radius: 9px;
          background: #eaf3fa;
          color: #245a89;
        }

        .appointment-info-note strong {
          display: block;
          color: #344a5f;
          font-size: 11px;
        }

        .appointment-info-note p {
          margin: 3px 0 0;
          color: #7a8998;
          font-size: 10px;
          line-height: 1.5;
        }


        /* =====================================================
           RESPONSIVE
        ====================================================== */

        @media (max-width: 750px) {

          .appointment-card {
            grid-template-columns: 1fr;
            gap: 15px;
          }

          .appointment-date-box {
            align-items: flex-start;
            min-height: auto;
            text-align: left;
          }

          .appointment-date-box
          strong {
            text-align: left;
          }

          .appointment-title-row {
            flex-direction: column;
          }

          .appointment-expanded {
            grid-template-columns: 1fr;
          }

        }


        @media (max-width: 560px) {

          .appointment-summary {
            grid-template-columns: 1fr;
          }

          .appointment-tabs {
            width: 100%;
            box-sizing: border-box;
          }

          .appointment-tab {
            flex: 1;
            justify-content: center;
          }

          .appointment-card {
            padding: 16px;
          }

          .appointment-details {
            align-items: flex-start;
            flex-direction: column;
            gap: 9px;
          }

          .appointment-info-note {
            padding: 13px;
          }

        }

      `}</style>
    </div>
  );
}
