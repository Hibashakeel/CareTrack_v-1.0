import {
  Activity,
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  ClipboardCheck,
  ClipboardList,
  Clock3,
  HeartPulse,
  Mail,
  MapPin,
  MessageCircle,
  Mic,
  Phone,
  ShieldCheck,
  Users,
} from "lucide-react";
import { Link } from "react-router-dom";

export default function Features() {
  return (
    <div className="features-page">
      <style>{`
        * {
          box-sizing: border-box;
        }

        .features-page {
          min-height: 100vh;
          background: #f7fbfb;
          color: #183b3e;

          font-family:
            Inter,
            system-ui,
            -apple-system,
            BlinkMacSystemFont,
            "Segoe UI",
            sans-serif;
        }

        .features-container {
          width: min(1200px, calc(100% - 48px));
          margin: 0 auto;
        }

        /* =========================
           HERO
        ========================= */

        .features-hero {
          padding: 78px 0 68px;

          background:
            radial-gradient(
              circle at 85% 20%,
              rgba(21, 154, 156, 0.10),
              transparent 30%
            ),
            linear-gradient(
              180deg,
              #f8fcfc 0%,
              #f2f9f9 100%
            );
        }

        .features-hero-grid {
          display: grid;
          grid-template-columns: 1.1fr 0.9fr;

          align-items: center;

          gap: 60px;
        }

        .features-eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 8px;

          margin-bottom: 16px;

          color: #159a9c;

          font-size: 11px;
          font-weight: 800;
          letter-spacing: 1.6px;
        }

        .features-eyebrow::before {
          content: "";

          width: 25px;
          height: 2px;

          background: #159a9c;

          border-radius: 20px;
        }

        .features-hero h1 {
          max-width: 700px;

          margin: 0;

          color: #123f43;

          font-size: clamp(42px, 5vw, 64px);
          line-height: 1.03;
          letter-spacing: -2px;
          font-weight: 850;
        }

        .features-hero-description {
          max-width: 650px;

          margin: 23px 0 28px;

          color: #607b7d;

          font-size: 15px;
          line-height: 1.8;
        }

        .features-primary-button {
          display: inline-flex;
          align-items: center;
          gap: 9px;

          padding: 12px 18px;

          border-radius: 10px;

          background: #159a9c;
          color: white;

          text-decoration: none;

          font-size: 13px;
          font-weight: 750;

          box-shadow:
            0 10px 25px rgba(21, 154, 156, 0.18);

          transition:
            transform 0.22s ease,
            box-shadow 0.22s ease,
            background 0.22s ease;
        }

        .features-primary-button:hover {
          transform: translateY(-2px);

          background: #117f81;

          box-shadow:
            0 14px 30px rgba(21, 154, 156, 0.23);
        }

        /* =========================
           CONSISTENT HERO CARD
        ========================= */

        .features-hero-card {
          position: relative;

          min-height: 300px;

          overflow: hidden;

          border: 1px solid #e1eeee;
          border-radius: 20px;

          background: #fbfefe;

          box-shadow:
            0 10px 30px rgba(18, 63, 67, 0.07);

          animation: heroCardIn 0.65s ease both;

          transition:
            transform 0.22s ease,
            box-shadow 0.22s ease,
            border-color 0.22s ease;
        }

        .features-hero-card:hover {
          transform: translateY(-5px);

          border-color: #b9dcdc;

          box-shadow:
            0 18px 40px rgba(18, 63, 67, 0.08);
        }

        .features-hero-card-top {
          position: relative;

          min-height: 125px;

          padding: 25px 26px;

          overflow: hidden;

          background:
            linear-gradient(
              135deg,
              #123f43,
              #17666a
            );

          color: white;
        }

        .features-hero-card-top::after {
          content: "";

          position: absolute;

          width: 130px;
          height: 130px;

          right: -45px;
          top: -55px;

          border-radius: 50%;

          background:
            rgba(255, 255, 255, 0.07);

          transition:
            transform 0.4s ease,
            background 0.4s ease;
        }

        .features-hero-card:hover
          .features-hero-card-top::after {
          transform: scale(1.12);

          background:
            rgba(255, 255, 255, 0.10);
        }

        .features-hero-card-label {
          position: relative;
          z-index: 1;

          margin-bottom: 9px;

          color: #9bd6d5;

          font-size: 9px;
          font-weight: 800;
          letter-spacing: 1.4px;
        }

        .features-hero-card-top h2 {
          position: relative;
          z-index: 1;

          max-width: 330px;

          margin: 0;

          color: white;

          font-size: 22px;
          line-height: 1.22;
        }

        .features-hero-card-body {
          padding: 13px 25px 17px;
        }

        .feature-mini-row {
          display: flex;
          align-items: center;

          gap: 12px;

          padding: 11px 0;

          border-bottom: 1px solid #edf3f3;

          transition:
            transform 0.2s ease,
            padding-left 0.2s ease;
        }

        .feature-mini-row:last-child {
          border-bottom: none;
        }

        .feature-mini-row:hover {
          transform: translateX(4px);

          padding-left: 3px;
        }

        .feature-mini-icon {
          width: 36px;
          height: 36px;

          flex-shrink: 0;

          display: flex;
          align-items: center;
          justify-content: center;

          border-radius: 11px;

          background: #e8f7f7;

          color: #159a9c;

          transition:
            transform 0.25s ease,
            background 0.25s ease;
        }

        .feature-mini-row:hover
          .feature-mini-icon {
          transform: translateY(-2px);

          background: #dff3f3;
        }

        .feature-mini-row strong {
          display: block;

          color: #21494c;

          font-size: 12px;
          font-weight: 750;
        }

        .feature-mini-row span {
          display: block;

          margin-top: 2px;

          color: #799294;

          font-size: 10px;
          line-height: 1.4;
        }

        /* =========================
           CORE FEATURES
        ========================= */

        .features-section {
          padding: 82px 0;

          background: white;
        }

        .features-section-header {
          max-width: 700px;

          margin-bottom: 40px;
        }

        .features-section-header span {
          color: #159a9c;

          font-size: 11px;
          font-weight: 800;
          letter-spacing: 1.5px;
        }

        .features-section-header h2 {
          margin: 10px 0 14px;

          color: #123f43;

          font-size: clamp(30px, 4vw, 43px);
          line-height: 1.12;
          letter-spacing: -1px;
        }

        .features-section-header p {
          margin: 0;

          color: #71888a;

          font-size: 14px;
          line-height: 1.8;
        }

        .features-grid {
          display: grid;

          grid-template-columns:
            repeat(3, 1fr);

          gap: 22px;
        }

        .feature-card {
          min-height: 250px;

          padding: 27px;

          border: 1px solid #e1eeee;
          border-radius: 20px;

          background: #fbfefe;

          animation: featureCardIn 0.55s ease both;

          transition:
            transform 0.22s ease,
            box-shadow 0.22s ease,
            border-color 0.22s ease;
        }

        .feature-card:hover {
          transform: translateY(-5px);

          border-color: #b9dcdc;

          box-shadow:
            0 18px 40px rgba(18, 63, 67, 0.08);
        }

        .feature-card-icon {
          width: 48px;
          height: 48px;

          display: flex;
          align-items: center;
          justify-content: center;

          margin-bottom: 22px;

          border-radius: 14px;

          background: #e8f7f7;

          color: #159a9c;

          transition:
            transform 0.25s ease,
            background 0.25s ease;
        }

        .feature-card:hover
          .feature-card-icon {
          transform: translateY(-3px);

          background: #dff3f3;
        }

        .feature-card h3 {
          margin: 0 0 10px;

          color: #1b4649;

          font-size: 18px;
        }

        .feature-card p {
          margin: 0;

          color: #72888a;

          font-size: 13px;
          line-height: 1.75;
        }

        /* =========================
           EXPERIENCE
        ========================= */

        .experience-section {
          padding: 82px 0;

          background: #f5fafa;
        }

        .experience-grid {
          display: grid;

          grid-template-columns:
            0.85fr 1.15fr;

          align-items: center;

          gap: 70px;
        }

        .experience-heading span {
          color: #159a9c;

          font-size: 11px;
          font-weight: 800;
          letter-spacing: 1.5px;
        }

        .experience-heading h2 {
          margin: 12px 0 17px;

          color: #123f43;

          font-size: clamp(32px, 4vw, 45px);
          line-height: 1.1;
          letter-spacing: -1.2px;
        }

        .experience-heading p {
          margin: 0;

          color: #708789;

          font-size: 14px;
          line-height: 1.8;
        }

        .experience-list {
          display: grid;
          gap: 14px;
        }

        .experience-item {
          display: flex;
          align-items: flex-start;

          gap: 17px;

          padding: 20px;

          border: 1px solid #dceaea;
          border-radius: 17px;

          background: white;

          box-shadow:
            0 8px 25px rgba(18, 63, 67, 0.035);

          transition:
            transform 0.22s ease,
            box-shadow 0.22s ease;
        }

        .experience-item:hover {
          transform: translateY(-3px);

          box-shadow:
            0 14px 30px rgba(18, 63, 67, 0.07);
        }

        .experience-check {
          width: 35px;
          height: 35px;

          flex-shrink: 0;

          display: flex;
          align-items: center;
          justify-content: center;

          border-radius: 10px;

          background: #e8f7f7;

          color: #159a9c;
        }

        .experience-item h3 {
          margin: 0 0 5px;

          color: #21494c;

          font-size: 14px;
        }

        .experience-item p {
          margin: 0;

          color: #778d8f;

          font-size: 12px;
          line-height: 1.65;
        }

        /* =========================
           SCOPE
        ========================= */

        .scope-section {
          padding: 70px 0;

          background: #123f43;
        }

        .scope-box {
          display: flex;

          align-items: center;
          justify-content: space-between;

          gap: 35px;
        }

        .scope-content {
          max-width: 750px;
        }

        .scope-label {
          display: block;

          margin-bottom: 10px;

          color: #80cecc;

          font-size: 10px;
          font-weight: 800;
          letter-spacing: 1.5px;
        }

        .scope-content h2 {
          margin: 0 0 12px;

          color: white;

          font-size: clamp(28px, 4vw, 40px);
          line-height: 1.15;
        }

        .scope-content p {
          margin: 0;

          color: #b2cdce;

          font-size: 13px;
          line-height: 1.8;
        }

        .scope-icon {
          width: 72px;
          height: 72px;

          flex-shrink: 0;

          display: flex;
          align-items: center;
          justify-content: center;

          border: 1px solid rgba(
            255,
            255,
            255,
            0.15
          );

          border-radius: 20px;

          background:
            rgba(255, 255, 255, 0.08);

          color: #80cecc;
        }

        /* =========================
           FOOTER
        ========================= */

        .caretrack-footer {
          width: 100%;

          background: #123f43;

          color: white;

          margin-top: 20px;
        }

        .footer-main {
          width: min(
            1200px,
            calc(100% - 48px)
          );

          margin: 0 auto;

          padding: 65px 0 48px;

          display: grid;

          grid-template-columns:
            1.5fr 0.8fr 1fr 1.1fr;

          gap: 55px;
        }

        .footer-brand {
          max-width: 370px;
        }

        .footer-logo {
          display: flex;
          align-items: center;

          gap: 12px;

          margin-bottom: 20px;
        }

        .footer-logo-icon {
          width: 47px;
          height: 47px;

          display: flex;
          align-items: center;
          justify-content: center;

          border-radius: 13px;

          background: #159a9c;

          color: white;
        }

        .footer-logo h2 {
          margin: 0;

          font-size: 22px;
          line-height: 1.1;
        }

        .footer-logo span {
          display: block;

          margin-top: 4px;

          color: #a9c7c9;

          font-size: 10px;
          letter-spacing: 0.3px;
        }

        .footer-brand > p {
          margin: 0;

          color: #b3cbcd;

          font-size: 13px;
          line-height: 1.8;
        }

        .footer-trust {
          display: flex;
          align-items: center;

          gap: 8px;

          margin-top: 20px;

          color: #8ed3d2;

          font-size: 11px;
        }

        .footer-column {
          display: flex;
          flex-direction: column;

          align-items: flex-start;
        }

        .footer-column h3 {
          margin: 3px 0 20px;

          color: white;

          font-size: 14px;
          font-weight: 800;
        }

        .footer-column > a {
          display: flex;
          align-items: center;

          gap: 5px;

          margin-bottom: 13px;

          color: #b4cbcd;

          font-size: 12px;

          text-decoration: none;

          transition:
            color 0.2s ease,
            transform 0.2s ease;
        }

        .footer-column > a:hover {
          color: white;

          transform: translateX(3px);
        }

        .footer-column > a svg {
          color: #61c4c3;
        }

        .footer-info {
          display: flex;
          align-items: flex-start;

          gap: 9px;

          margin-bottom: 14px;

          color: #b4cbcd;

          font-size: 12px;
          line-height: 1.4;
        }

        .footer-info svg {
          flex-shrink: 0;

          color: #61c4c3;

          margin-top: 1px;
        }

        .footer-bottom {
          width: min(
            1200px,
            calc(100% - 48px)
          );

          margin: 0 auto;

          min-height: 70px;

          border-top:
            1px solid rgba(
              255,
              255,
              255,
              0.12
            );

          display: flex;

          align-items: center;
          justify-content: space-between;

          gap: 20px;
        }

        .footer-bottom p {
          margin: 0;

          color: #91afb1;

          font-size: 11px;
        }

        .footer-bottom-links {
          display: flex;
          align-items: center;

          gap: 9px;

          color: #91afb1;

          font-size: 11px;
        }

        /* =========================
           ANIMATIONS
        ========================= */

        @keyframes heroCardIn {
          from {
            opacity: 0;
            transform: translateY(22px);
          }

          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes featureCardIn {
          from {
            opacity: 0;
            transform: translateY(18px);
          }

          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        /* =========================
           RESPONSIVE
        ========================= */

        @media (max-width: 950px) {
          .features-hero-grid,
          .experience-grid {
            grid-template-columns: 1fr;

            gap: 45px;
          }

          .features-hero-card {
            max-width: 650px;
          }

          .features-grid {
            grid-template-columns:
              repeat(2, 1fr);
          }

          .footer-main {
            grid-template-columns:
              1.5fr 1fr 1fr;
          }

          .footer-brand {
            grid-column: 1 / -1;

            max-width: 600px;
          }
        }

        @media (max-width: 650px) {
          .features-container {
            width: min(
              100% - 30px,
              1200px
            );
          }

          .features-hero {
            padding: 60px 0 55px;
          }

          .features-hero h1 {
            font-size: 42px;

            letter-spacing: -1.5px;
          }

          .features-grid {
            grid-template-columns: 1fr;
          }

          .features-section,
          .experience-section {
            padding: 60px 0;
          }

          .scope-box {
            flex-direction: column;

            align-items: flex-start;
          }

          .footer-main,
          .footer-bottom {
            width: min(
              100% - 30px,
              1200px
            );
          }

          .footer-main {
            grid-template-columns: 1fr;

            gap: 35px;

            padding: 48px 0 35px;
          }

          .footer-brand {
            grid-column: auto;
          }

          .footer-bottom {
            min-height: auto;

            padding: 20px 0;

            flex-direction: column;

            align-items: flex-start;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .features-primary-button,
          .features-hero-card,
          .feature-card,
          .feature-mini-row,
          .feature-mini-icon,
          .experience-item,
          .footer-column > a {
            transition: none;
            animation: none;
          }
        }
      `}</style>

      {/* =========================
          HERO
      ========================= */}

      <section className="features-hero">
        <div className="features-container features-hero-grid">

          <div>
            <div className="features-eyebrow">
              WHAT CARETRACK PROVIDES
            </div>

            <h1>
              Features designed around
              the patient journey.
            </h1>

            <p className="features-hero-description">
              CareTrack brings daily patient information,
              monitoring, communication and care-team access
              together in one easy-to-understand digital platform.
            </p>

            <Link
              to="/demo"
              className="features-primary-button"
            >
              Explore CareTrack
              <ArrowRight size={16} />
            </Link>
          </div>

          {/* HERO CARD */}

          <div className="features-hero-card">

            <div className="features-hero-card-top">
              <div className="features-hero-card-label">
                CARETRACK EXPERIENCE
              </div>

              <h2>
                Information in one connected place.
              </h2>
            </div>

            <div className="features-hero-card-body">

              <div className="feature-mini-row">
                <div className="feature-mini-icon">
                  <Activity size={18} />
                </div>

                <div>
                  <strong>
                    Patient Monitoring
                  </strong>

                  <span>
                    Daily information at a glance
                  </span>
                </div>
              </div>

              <div className="feature-mini-row">
                <div className="feature-mini-icon">
                  <ClipboardList size={18} />
                </div>

                <div>
                  <strong>
                    Digital Records
                  </strong>

                  <span>
                    Organized patient information
                  </span>
                </div>
              </div>

              <div className="feature-mini-row">
                <div className="feature-mini-icon">
                  <MessageCircle size={18} />
                </div>

                <div>
                  <strong>
                    Care Communication
                  </strong>

                  <span>
                    Simple patient-care team interaction
                  </span>
                </div>
              </div>

            </div>
          </div>

        </div>
      </section>

      {/* =========================
          CORE FEATURES
      ========================= */}

      <section className="features-section">
        <div className="features-container">

          <div className="features-section-header">
            <span>CORE FEATURES</span>

            <h2>
              Everything organized around
              everyday patient care.
            </h2>

            <p>
              CareTrack focuses on making routine patient
              information easier to record, understand and
              share with the appropriate care team.
            </p>
          </div>

          <div className="features-grid">

            <div className="feature-card">
              <div className="feature-card-icon">
                <ClipboardList size={23} />
              </div>

              <h3>Daily Reports</h3>

              <p>
                Patients can record daily information such as
                food, water, medicine status, pain and changes
                in their condition.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-card-icon">
                <Activity size={23} />
              </div>

              <h3>Patient Monitoring</h3>

              <p>
                Nurses and doctors can view centralized patient
                information and follow reported changes over time.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-card-icon">
                <MessageCircle size={23} />
              </div>

              <h3>Care Communication</h3>

              <p>
                Patients and care teams can communicate through
                structured questions and responses inside the platform.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-card-icon">
                <Mic size={23} />
              </div>

              <h3>Voice Responses</h3>

              <p>
                Patients can provide voice responses while the
                corresponding transcript can be reviewed as editable text.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-card-icon">
                <CalendarDays size={23} />
              </div>

              <h3>Appointments</h3>

              <p>
                Appointment information can be organized so patients
                and care teams can easily recognize upcoming activities.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-card-icon">
                <Users size={23} />
              </div>

              <h3>Role-Based Access</h3>

              <p>
                Patient, nurse, doctor and admin areas provide
                information relevant to each role and their workflow.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* =========================
          EXPERIENCE
      ========================= */}

      <section className="experience-section">
        <div className="features-container experience-grid">

          <div className="experience-heading">
            <span>DESIGNED FOR PEOPLE</span>

            <h2>
              A simpler experience
              for everyday use.
            </h2>

            <p>
              The interface follows practical HCI principles so
              users can understand what is happening, recognize
              available actions and move through the system without
              unnecessary complexity.
            </p>
          </div>

          <div className="experience-list">

            <div className="experience-item">
              <div className="experience-check">
                <CheckCircle2 size={18} />
              </div>

              <div>
                <h3>Clear navigation</h3>

                <p>
                  Important patient and care functions remain easy
                  to find through consistent navigation.
                </p>
              </div>
            </div>

            <div className="experience-item">
              <div className="experience-check">
                <CheckCircle2 size={18} />
              </div>

              <div>
                <h3>Readable information</h3>

                <p>
                  Information is grouped into cards, sections and
                  meaningful labels to reduce unnecessary cognitive load.
                </p>
              </div>
            </div>

            <div className="experience-item">
              <div className="experience-check">
                <CheckCircle2 size={18} />
              </div>

              <div>
                <h3>Helpful feedback</h3>

                <p>
                  Actions provide visible feedback so users can
                  understand whether information has been saved or updated.
                </p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* =========================
          SCOPE
      ========================= */}

      <section className="scope-section">
        <div className="features-container scope-box">

          <div className="scope-content">
            <span className="scope-label">
              SYSTEM SCOPE
            </span>

            <h2>
              Information support,
              not automated medical decisions.
            </h2>

            <p>
              CareTrack is designed for recording, monitoring and
              communication. It does not diagnose conditions,
              prescribe medicines or automatically make treatment
              decisions.
            </p>
          </div>

          <div className="scope-icon">
            <ShieldCheck size={32} />
          </div>

        </div>
      </section>

      {/* =========================
          FOOTER
      ========================= */}

      <footer className="caretrack-footer">

        <div className="footer-main">

          <div className="footer-brand">

            <div className="footer-logo">

              <div className="footer-logo-icon">
                <HeartPulse size={23} />
              </div>

              <div>
                <h2>CareTrack</h2>

                <span>
                  Smart Patient Self-Monitoring
                </span>
              </div>

            </div>

            <p>
              A patient-centered digital platform designed
              to make daily patient information recording,
              monitoring and communication simpler for
              everyone involved in care.
            </p>

            <div className="footer-trust">
              <ShieldCheck size={17} />

              <span>
                Information-focused healthcare support
              </span>
            </div>

          </div>

          <div className="footer-column">

            <h3>Quick Links</h3>

            <Link to="/">
              <ChevronRight size={15} />
              Home
            </Link>

            <Link to="/about">
              <ChevronRight size={15} />
              About CareTrack
            </Link>

            <Link to="/demo">
              <ChevronRight size={15} />
              Explore Demo
            </Link>

          </div>

          <div className="footer-column">

            <h3>Platform</h3>

            <div className="footer-info">
              <Activity size={16} />
              <span>Patient Monitoring</span>
            </div>

            <div className="footer-info">
              <ClipboardCheck size={16} />
              <span>Digital Records</span>
            </div>

            <div className="footer-info">
              <MessageCircle size={16} />
              <span>Care Communication</span>
            </div>

            <div className="footer-info">
              <Users size={16} />
              <span>Care Team Access</span>
            </div>

          </div>

          <div className="footer-column">

            <h3>Contact</h3>

            <div className="footer-info">
              <Mail size={16} />
              <span>
                caretrack@healthcare.com
              </span>
            </div>

            <div className="footer-info">
              <Phone size={16} />
              <span>
                +92 300 0000000
              </span>
            </div>

            <div className="footer-info">
              <MapPin size={16} />
              <span>
                Healthcare Support Center
              </span>
            </div>

            <div className="footer-info">
              <Clock3 size={16} />
              <span>
                Available for care teams
              </span>
            </div>

          </div>

        </div>

        <div className="footer-bottom">

          <p>
            © {new Date().getFullYear()} CareTrack.
            All rights reserved.
          </p>

          <div className="footer-bottom-links">
            <span>Patient-focused</span>
            <span>•</span>
            <span>Simple</span>
            <span>•</span>
            <span>Connected</span>
          </div>

        </div>

      </footer>
    </div>
  );
}