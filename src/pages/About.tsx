import {
  Activity,
  ClipboardCheck,
  MessageCircle,
  ShieldCheck,
  HeartPulse,
  Users,
  ArrowRight,
  ChevronRight,
  Mail,
  Phone,
  MapPin,
  Clock3,
} from "lucide-react";
import { Link } from "react-router-dom";

export default function About() {
  const bullets = [
    {
      icon: Activity,
      title: "Patient Self-Reporting",
      text: "Patients can record daily health information digitally.",
    },
    {
      icon: ClipboardCheck,
      title: "Organized Monitoring",
      text: "Nurses can review patient reports and monitoring information.",
    },
    {
      icon: MessageCircle,
      title: "Care Communication",
      text: "Doctors can review reports and communicate through questions and responses.",
    },
    {
      icon: ShieldCheck,
      title: "Information Focused",
      text: "The system supports information management rather than diagnosis or autonomous treatment decisions.",
    },
  ];

  return (
    <>
      <main className="about-page">
        {/* =========================
            ABOUT HERO
        ========================== */}
        <section className="about-hero">
          <div className="about-hero-content">
            <span className="about-eyebrow">
              <HeartPulse size={15} />
              ABOUT CARETRACK
            </span>

            <h1>
              Designed around
              <br />
              <em>better patient information.</em>
            </h1>

            <p>
              CareTrack is an HCI-focused patient self-monitoring system
              designed to improve how everyday patient information is
              recorded, organized and communicated inside a hospital.
            </p>

            <div className="about-actions">
              <Link to="/demo" className="about-primary-button">
                Explore CareTrack
                <ArrowRight size={17} />
              </Link>
            </div>
          </div>

          <div className="about-hero-card">
            <div className="about-card-icon">
              <Users size={25} />
            </div>

            <h3>Connected Care Experience</h3>

            <p>
              Bringing patients, nurses and doctors together through a
              simple digital information flow.
            </p>

            <div className="about-mini-status">
              <span />
              Patient-centered platform
            </div>
          </div>
        </section>

        {/* =========================
            WHAT CARETRACK DOES
        ========================== */}
        <section className="about-section">
          <div className="about-section-heading">
            <span className="about-section-label">
              WHAT CARETRACK DOES
            </span>

            <h2>
              One place for everyday
              <br />
              patient information.
            </h2>

            <p>
              The system focuses on making information recording and
              communication easier while keeping the experience simple
              for each type of user.
            </p>
          </div>

          <div className="about-info-grid">
            {bullets.map((item, index) => {
              const Icon = item.icon;

              return (
                <article className="about-info-card" key={item.title}>
                  <div className="about-card-top">
                    <span className="about-number">
                      {String(index + 1).padStart(2, "0")}
                    </span>

                    <div className="about-info-icon">
                      <Icon size={21} />
                    </div>
                  </div>

                  <h3>{item.title}</h3>

                  <p>{item.text}</p>
                </article>
              );
            })}
          </div>
        </section>

        {/* =========================
            USER ROLES
        ========================== */}
        <section className="about-roles">
          <div className="about-roles-heading">
            <span className="about-section-label">
              DESIGNED FOR THE CARE TEAM
            </span>

            <h2>Different roles, one connected experience.</h2>

            <p>
              CareTrack provides role-based access so each user can focus
              on the information relevant to their responsibilities.
            </p>
          </div>

          <div className="role-cards">
            <div className="role-card">
              <div className="role-icon">
                <HeartPulse size={21} />
              </div>

              <h3>Patient</h3>

              <p>
                Records daily information, reports changes and responds
                to questions from the care team.
              </p>
            </div>

            <div className="role-card">
              <div className="role-icon">
                <ClipboardCheck size={21} />
              </div>

              <h3>Nurse</h3>

              <p>
                Reviews patient information and monitoring records to
                support organized care communication.
              </p>
            </div>

            <div className="role-card">
              <div className="role-icon">
                <MessageCircle size={21} />
              </div>

              <h3>Doctor</h3>

              <p>
                Reviews patient information and communicates through
                questions and responses.
              </p>
            </div>

            <div className="role-card">
              <div className="role-icon">
                <ShieldCheck size={21} />
              </div>

              <h3>Admin</h3>

              <p>
                Supports system administration and role-based access
                management.
              </p>
            </div>
          </div>
        </section>

        {/* =========================
            SYSTEM SCOPE
        ========================== */}
        <section className="about-scope">
          <div className="scope-icon">
            <ShieldCheck size={25} />
          </div>

          <div className="scope-content">
            <span>IMPORTANT SYSTEM SCOPE</span>

            <h2>
              Information support, not automated medical decisions.
            </h2>

            <p>
              CareTrack is designed for recording, monitoring and
              communication. It does not diagnose patients, prescribe
              medicines or make autonomous treatment decisions.
            </p>
          </div>
        </section>
      </main>

      {/* =========================
          SAME FOOTER AS HOME
      ========================== */}
      <footer className="caretrack-footer">
        <div className="footer-main">
          <div className="footer-brand">
            <div className="footer-logo">
              <div className="footer-logo-icon">
                <HeartPulse size={23} />
              </div>

              <div>
                <h2>CareTrack</h2>
                <span>Smart Patient Self-Monitoring</span>
              </div>
            </div>

            <p>
              A patient-centered digital platform designed to make daily
              patient information recording, monitoring and communication
              simpler for everyone involved in care.
            </p>

            <div className="footer-trust">
              <ShieldCheck size={17} />
              <span>Information-focused healthcare support</span>
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
              <span>caretrack@healthcare.com</span>
            </div>

            <div className="footer-info">
              <Phone size={16} />
              <span>+92 300 0000000</span>
            </div>

            <div className="footer-info">
              <MapPin size={16} />
              <span>Healthcare Support Center</span>
            </div>

            <div className="footer-info">
              <Clock3 size={16} />
              <span>Available for care teams</span>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <p>
            © {new Date().getFullYear()} CareTrack. All rights reserved.
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

      {/* =========================
          ABOUT PAGE STYLES
      ========================== */}
      <style>{`
        .about-page {
          width: 100%;
          min-height: 100vh;
          background: #ffffff;
          color: #193f42;
          overflow: hidden;
        }

        /* =========================
           ABOUT HERO
        ========================== */

        .about-hero {
          width: min(1200px, calc(100% - 48px));
          margin: 0 auto;
          padding: 70px 0 65px;
          display: grid;
          grid-template-columns: 1.1fr 0.9fr;
          align-items: center;
          gap: 70px;
        }

        .about-hero-content {
          animation: aboutFadeUp 0.7s ease both;
        }

        .about-eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          margin-bottom: 15px;
          color: #159a9c;
          font-size: 12px;
          font-weight: 800;
          letter-spacing: 1.5px;
        }

        .about-hero h1 {
          margin: 0;
          color: #163a3d;
          font-size: clamp(40px, 5vw, 58px);
          line-height: 1.08;
          letter-spacing: -2px;
        }

        .about-hero h1 em {
          color: #159a9c;
          font-style: normal;
        }

        .about-hero-content > p {
          max-width: 650px;
          margin: 23px 0;
          color: #63777a;
          font-size: 16px;
          line-height: 1.8;
        }

        .about-actions {
          margin-top: 26px;
        }

        .about-primary-button {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          min-height: 46px;
          padding: 0 20px;
          border-radius: 12px;
          background: #159a9c;
          color: #ffffff;
          text-decoration: none;
          font-size: 13px;
          font-weight: 700;
          box-shadow: 0 10px 25px rgba(21, 154, 156, 0.2);
          transition:
            transform 0.25s ease,
            background 0.25s ease,
            box-shadow 0.25s ease;
        }

        .about-primary-button:hover {
          transform: translateY(-2px);
          background: #117f81;
          box-shadow: 0 14px 30px rgba(21, 154, 156, 0.28);
        }

        /* =========================
           HERO CARD
        ========================== */

        .about-hero-card {
          position: relative;
          padding: 35px;
          border: 1px solid #dceced;
          border-radius: 25px;
          background: linear-gradient(
            145deg,
            #f4fbfb 0%,
            #ffffff 70%
          );
          box-shadow: 0 20px 45px rgba(28, 74, 77, 0.08);
          animation: aboutFadeRight 0.75s ease both;
        }

        .about-hero-card::before {
          content: "";
          position: absolute;
          width: 100px;
          height: 100px;
          top: -35px;
          right: -30px;
          border-radius: 50%;
          background: rgba(21, 154, 156, 0.07);
          pointer-events: none;
        }

        .about-card-icon {
          position: relative;
          width: 53px;
          height: 53px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 22px;
          border-radius: 15px;
          background: #e5f7f7;
          color: #159a9c;
        }

        .about-hero-card h3 {
          position: relative;
          margin: 0;
          color: #21474a;
          font-size: 20px;
        }

        .about-hero-card p {
          position: relative;
          margin: 12px 0 22px;
          color: #708386;
          font-size: 13px;
          line-height: 1.75;
        }

        .about-mini-status {
          position: relative;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 8px 12px;
          border-radius: 20px;
          background: #eaf8f3;
          color: #43816d;
          font-size: 11px;
          font-weight: 700;
        }

        .about-mini-status span {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #45b98d;
        }

        /* =========================
           WHAT CARETRACK DOES
        ========================== */

        .about-section {
          width: min(1200px, calc(100% - 48px));
          margin: 0 auto;
          padding: 65px 0 85px;
          border-top: 1px solid #edf2f2;
        }

        .about-section-heading {
          max-width: 650px;
          margin-bottom: 40px;
        }

        .about-section-label {
          display: inline-block;
          margin-bottom: 12px;
          color: #159a9c;
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 1.4px;
        }

        .about-section-heading h2,
        .about-roles-heading h2 {
          margin: 0;
          color: #193f42;
          font-size: 36px;
          line-height: 1.15;
          letter-spacing: -1px;
        }

        .about-section-heading p,
        .about-roles-heading p {
          max-width: 620px;
          margin: 17px 0 0;
          color: #718487;
          font-size: 14px;
          line-height: 1.8;
        }

        /* =========================
           INFORMATION CARDS
        ========================== */

        .about-info-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 18px;
        }

        .about-info-card {
          min-height: 225px;
          padding: 23px;
          border: 1px solid #e4eeee;
          border-radius: 17px;
          background: #ffffff;
          box-shadow: 0 8px 25px rgba(28, 74, 77, 0.05);
          transition:
            transform 0.25s ease,
            box-shadow 0.25s ease,
            border-color 0.25s ease;
        }

        .about-info-card:hover {
          transform: translateY(-4px);
          border-color: #cce6e6;
          box-shadow: 0 14px 32px rgba(28, 74, 77, 0.1);
        }

        .about-card-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .about-number {
          color: #9ab0b2;
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 1px;
        }

        .about-info-icon {
          width: 45px;
          height: 45px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 13px;
          background: #e9f8f8;
          color: #159a9c;
        }

        .about-info-card h3 {
          margin: 24px 0 9px;
          color: #24494c;
          font-size: 15px;
        }

        .about-info-card p {
          margin: 0;
          color: #788b8e;
          font-size: 12px;
          line-height: 1.7;
        }

        /* =========================
           ROLES
        ========================== */

        .about-roles {
          width: 100%;
          padding: 75px 24px 85px;
          background: #f7fbfb;
        }

        .about-roles-heading {
          width: min(1200px, 100%);
          margin: 0 auto 40px;
        }

        .role-cards {
          width: min(1200px, 100%);
          margin: 0 auto;
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 18px;
        }

        .role-card {
          padding: 25px;
          border: 1px solid #e0eeee;
          border-radius: 17px;
          background: #ffffff;
          transition:
            transform 0.25s ease,
            box-shadow 0.25s ease;
        }

        .role-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 15px 30px rgba(28, 74, 77, 0.08);
        }

        .role-icon {
          width: 43px;
          height: 43px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 18px;
          border-radius: 12px;
          background: #e8f7f7;
          color: #159a9c;
        }

        .role-card h3 {
          margin: 0 0 8px;
          color: #24494c;
          font-size: 15px;
        }

        .role-card p {
          margin: 0;
          color: #77898c;
          font-size: 12px;
          line-height: 1.7;
        }

        /* =========================
           SCOPE
        ========================== */

        .about-scope {
          width: min(1100px, calc(100% - 48px));
          margin: 70px auto 90px;
          padding: 28px 32px;
          display: flex;
          align-items: flex-start;
          gap: 18px;
          border: 1px solid #cfe6e6;
          border-radius: 20px;
          background: #f3fbfb;
        }

        .scope-icon {
          width: 48px;
          height: 48px;
          flex: 0 0 48px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 13px;
          background: #dff4f4;
          color: #159a9c;
        }

        .scope-content > span {
          display: block;
          margin-bottom: 6px;
          color: #159a9c;
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 1.2px;
        }

        .about-scope h2 {
          margin: 0;
          color: #24494c;
          font-size: 18px;
        }

        .about-scope p {
          max-width: 800px;
          margin: 8px 0 0;
          color: #718487;
          font-size: 12px;
          line-height: 1.7;
        }

        /* =========================
           SAME FOOTER AS HOME
        ========================== */

        .caretrack-footer {
          width: 100%;
          background: #123f43;
          color: white;
          margin-top: 20px;
        }

        .footer-main {
          width: min(1200px, calc(100% - 48px));
          margin: 0 auto;
          padding: 65px 0 48px;
          display: grid;
          grid-template-columns: 1.5fr 0.8fr 1fr 1.1fr;
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
          color: #ffffff;
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
          width: min(1200px, calc(100% - 48px));
          margin: 0 auto;
          min-height: 70px;
          border-top: 1px solid rgba(255, 255, 255, 0.12);
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
        ========================== */

        @keyframes aboutFadeUp {
          from {
            opacity: 0;
            transform: translateY(18px);
          }

          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes aboutFadeRight {
          from {
            opacity: 0;
            transform: translateX(18px);
          }

          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        /* =========================
           RESPONSIVE
        ========================== */

        @media (max-width: 1000px) {
          .about-hero {
            grid-template-columns: 1fr;
            gap: 40px;
          }

          .about-hero-card {
            max-width: 600px;
          }

          .about-info-grid,
          .role-cards {
            grid-template-columns: repeat(2, 1fr);
          }

          .footer-main {
            grid-template-columns: 1.5fr 1fr 1fr;
          }

          .footer-brand {
            grid-column: 1 / -1;
            max-width: 600px;
          }
        }

        @media (max-width: 650px) {
          .about-hero,
          .about-section,
          .about-scope,
          .footer-main,
          .footer-bottom {
            width: calc(100% - 30px);
          }

          .about-hero {
            padding: 40px 0 55px;
          }

          .about-hero h1 {
            font-size: 38px;
            letter-spacing: -1.2px;
          }

          .about-section-heading h2,
          .about-roles-heading h2 {
            font-size: 30px;
          }

          .about-info-grid,
          .role-cards {
            grid-template-columns: 1fr;
          }

          .about-info-card {
            min-height: auto;
          }

          .about-roles {
            padding-left: 15px;
            padding-right: 15px;
          }

          .about-scope {
            margin-top: 50px;
            margin-bottom: 60px;
            padding: 22px;
            flex-direction: column;
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
          .about-hero-content,
          .about-hero-card {
            animation: none;
          }

          .about-primary-button,
          .about-info-card,
          .role-card,
          .footer-column > a {
            transition: none;
          }
        }
      `}</style>
    </>
  );
}