import {
  ClipboardList,
  Database,
  Users,
  MessageCircle,
  ArrowRight,
  HeartPulse,
  CheckCircle2,
  ShieldCheck,
  Activity,
  ClipboardCheck,
  ChevronRight,
  Mail,
  Phone,
  MapPin,
  Clock3,
} from "lucide-react";
import { Link } from "react-router-dom";

export default function HowItWorks() {
  const steps = [
    {
      number: "01",
      title: "Patient records information",
      text: "Patients can enter their daily information such as symptoms, pain, food, water, medication status and changes in their condition.",
      icon: ClipboardList,
    },
    {
      number: "02",
      title: "Information is organized",
      text: "The entered information is stored digitally and organized into the patient's record for easier review.",
      icon: Database,
    },
    {
      number: "03",
      title: "Care team reviews",
      text: "Authorized nurses and doctors can review relevant patient information through their role-based dashboards.",
      icon: Users,
    },
    {
      number: "04",
      title: "Communication continues",
      text: "Doctors and nurses can communicate with patients through questions, responses and voice-based information.",
      icon: MessageCircle,
    },
  ];

  return (
    <>
      <main className="how-page">
        {/* =========================
            HERO
        ========================== */}
        <section className="how-hero">
          <div className="how-hero-copy">
            <span className="how-eyebrow">
              <HeartPulse size={15} />
              HOW CARETRACK WORKS
            </span>

            <h1>
              One simple
              <br />
              <em>information flow.</em>
            </h1>

            <p>
              CareTrack connects patient self-reporting with organized
              information and care-team communication through a clear,
              step-by-step digital workflow.
            </p>

            <div className="how-hero-actions">
              <Link to="/demo" className="how-primary-button">
                Explore CareTrack
                <ArrowRight size={17} />
              </Link>
            </div>
          </div>

          <div className="how-hero-card">
            <div className="how-hero-card-icon">
              <Activity size={25} />
            </div>

            <span>THE CARETRACK FLOW</span>

            <h3>
              Record → Organize → Review → Communicate
            </h3>

            <p>
              A straightforward workflow designed to keep patient
              information visible and accessible to authorized users.
            </p>

            <div className="how-flow-line">
              <div className="how-flow-dot active" />
              <div className="how-flow-connector" />
              <div className="how-flow-dot" />
              <div className="how-flow-connector" />
              <div className="how-flow-dot" />
              <div className="how-flow-connector" />
              <div className="how-flow-dot" />
            </div>
          </div>
        </section>

        {/* =========================
            WORKFLOW
        ========================== */}
        <section className="how-workflow">
          <div className="how-section-heading">
            <span className="how-section-label">
              THE WORKFLOW
            </span>

            <h2>
              From patient input
              <br />
              to connected care.
            </h2>

            <p>
              Each stage has a clear purpose, helping users understand what
              happens to information after it is entered.
            </p>
          </div>

          <div className="how-steps">
            {steps.map((step) => {
              const Icon = step.icon;

              return (
                <article className="how-step" key={step.number}>
                  <div className="how-step-number">
                    {step.number}
                  </div>

                  <div className="how-step-icon">
                    <Icon size={22} />
                  </div>

                  <h3>{step.title}</h3>

                  <p>{step.text}</p>

                  <div className="how-step-line" />
                </article>
              );
            })}
          </div>
        </section>

        {/* =========================
            ROLES
        ========================== */}
        <section className="how-roles">
          <div className="how-roles-heading">
            <span className="how-section-label">
              ROLE-BASED EXPERIENCE
            </span>

            <h2>
              Everyone sees what
              <br />
              they need.
            </h2>

            <p>
              CareTrack separates the experience according to the
              responsibilities of each user.
            </p>
          </div>

          <div className="how-role-list">
            <div className="how-role-card">
              <div className="how-role-icon">
                <HeartPulse size={20} />
              </div>

              <div>
                <h3>Patient</h3>
                <p>
                  Records daily information, views appointments and
                  communicates with the care team.
                </p>
              </div>
            </div>

            <div className="how-role-card">
              <div className="how-role-icon">
                <Activity size={20} />
              </div>

              <div>
                <h3>Nurse</h3>
                <p>
                  Reviews patient information, monitoring records and
                  communication requiring attention.
                </p>
              </div>
            </div>

            <div className="how-role-card">
              <div className="how-role-icon">
                <Users size={20} />
              </div>

              <div>
                <h3>Doctor</h3>
                <p>
                  Reviews patient records and communicates with patients
                  through questions and responses.
                </p>
              </div>
            </div>

            <div className="how-role-card">
              <div className="how-role-icon">
                <ShieldCheck size={20} />
              </div>

              <div>
                <h3>Admin</h3>
                <p>
                  Manages appropriate system-level access and staff
                  approval workflows.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* =========================
            DESIGN PRINCIPLES
        ========================== */}
        <section className="how-principles">
          <div className="how-principle-icon">
            <CheckCircle2 size={25} />
          </div>

          <div>
            <span>DESIGNED FOR CLARITY</span>

            <h2>
              Simple steps. Clear feedback. Organized information.
            </h2>

            <p>
              CareTrack follows user-centered design principles by keeping
              navigation clear, information readable and important system
              states visible. The platform supports information recording
              and communication without making autonomous medical
              decisions.
            </p>
          </div>
        </section>
      </main>

      {/* =========================
          SAME HOME FOOTER
      ========================== */}
      <footer className="caretrack-footer">
        <div className="footer-main">
          {/* BRAND */}
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
              <span>
                Information-focused healthcare support
              </span>
            </div>
          </div>

          {/* QUICK LINKS */}
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

          {/* PLATFORM */}
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

          {/* CONTACT */}
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
          STYLES
      ========================== */}
      <style>{`
        .how-page {
          width: 100%;
          overflow: hidden;
          background: #ffffff;
          color: #193f42;
        }

        /* =========================
           HERO
        ========================== */

        .how-hero {
          width: min(1200px, calc(100% - 48px));
          margin: 0 auto;
          padding: 75px 0 70px;
          min-height: 450px;
          display: grid;
          grid-template-columns: 1.1fr 0.9fr;
          gap: 75px;
          align-items: center;
        }

        .how-hero-copy {
          animation: howFadeUp 0.7s ease both;
        }

        .how-eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          margin-bottom: 17px;
          color: #159a9c;
          font-size: 12px;
          font-weight: 800;
          letter-spacing: 1.5px;
        }

        .how-hero h1 {
          margin: 0;
          color: #173c40;
          font-size: clamp(42px, 5vw, 60px);
          line-height: 1.07;
          letter-spacing: -2px;
        }

        .how-hero h1 em {
          color: #159a9c;
          font-style: normal;
        }

        .how-hero-copy > p {
          max-width: 620px;
          margin: 23px 0 0;
          color: #687d80;
          font-size: 16px;
          line-height: 1.8;
        }

        .how-hero-actions {
          margin-top: 27px;
        }

        .how-primary-button {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          min-height: 46px;
          padding: 0 20px;
          border-radius: 12px;
          background: #159a9c;
          color: white;
          text-decoration: none;
          font-size: 13px;
          font-weight: 700;
          box-shadow: 0 10px 25px rgba(21, 154, 156, 0.2);
          transition:
            transform 0.25s ease,
            background 0.25s ease,
            box-shadow 0.25s ease;
        }

        .how-primary-button:hover {
          transform: translateY(-3px);
          background: #117f81;
          box-shadow: 0 15px 30px rgba(21, 154, 156, 0.27);
        }

        /* =========================
           HERO FLOW CARD
        ========================== */

        .how-hero-card {
          padding: 32px;
          border: 1px solid #dceced;
          border-radius: 25px;
          background: linear-gradient(
            145deg,
            #f3fbfb 0%,
            #ffffff 75%
          );
          box-shadow: 0 20px 45px rgba(28, 74, 77, 0.08);
          animation: howFadeRight 0.8s ease both;
        }

        .how-hero-card-icon {
          width: 55px;
          height: 55px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 22px;
          border-radius: 15px;
          background: #e5f7f7;
          color: #159a9c;
        }

        .how-hero-card > span {
          display: block;
          margin-bottom: 9px;
          color: #159a9c;
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 1.2px;
        }

        .how-hero-card h3 {
          margin: 0;
          color: #24494c;
          font-size: 21px;
          line-height: 1.45;
        }

        .how-hero-card p {
          margin: 13px 0 25px;
          color: #718487;
          font-size: 13px;
          line-height: 1.75;
        }

        .how-flow-line {
          display: flex;
          align-items: center;
          width: 100%;
        }

        .how-flow-dot {
          width: 12px;
          height: 12px;
          flex: 0 0 12px;
          border-radius: 50%;
          background: #c9dddd;
        }

        .how-flow-dot.active {
          width: 15px;
          height: 15px;
          flex-basis: 15px;
          background: #159a9c;
          box-shadow: 0 0 0 5px #e1f5f5;
        }

        .how-flow-connector {
          height: 2px;
          flex: 1;
          background: #d8e9e9;
        }

        /* =========================
           WORKFLOW
        ========================== */

        .how-workflow {
          width: min(1200px, calc(100% - 48px));
          margin: 0 auto;
          padding: 75px 0 90px;
          border-top: 1px solid #edf2f2;
        }

        .how-section-heading {
          max-width: 650px;
          margin-bottom: 42px;
        }

        .how-section-label {
          display: inline-block;
          margin-bottom: 12px;
          color: #159a9c;
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 1.4px;
        }

        .how-section-heading h2 {
          margin: 0;
          color: #1c4447;
          font-size: 36px;
          line-height: 1.2;
          letter-spacing: -1px;
        }

        .how-section-heading p {
          max-width: 620px;
          margin: 17px 0 0;
          color: #718487;
          font-size: 14px;
          line-height: 1.8;
        }

        .how-steps {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 17px;
        }

        .how-step {
          position: relative;
          min-height: 275px;
          padding: 24px;
          border: 1px solid #e2eeee;
          border-radius: 18px;
          background: #ffffff;
          box-shadow: 0 8px 25px rgba(28, 74, 77, 0.05);
          transition:
            transform 0.25s ease,
            box-shadow 0.25s ease,
            border-color 0.25s ease;
        }

        .how-step:hover {
          transform: translateY(-5px);
          border-color: #cce6e6;
          box-shadow: 0 17px 35px rgba(28, 74, 77, 0.1);
        }

        .how-step-number {
          color: #9ab0b2;
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 1px;
        }

        .how-step-icon {
          width: 45px;
          height: 45px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-top: 22px;
          border-radius: 12px;
          background: #e9f8f8;
          color: #159a9c;
        }

        .how-step h3 {
          margin: 20px 0 9px;
          color: #24494c;
          font-size: 15px;
          line-height: 1.4;
        }

        .how-step p {
          margin: 0;
          color: #788b8e;
          font-size: 12px;
          line-height: 1.7;
        }

        .how-step-line {
          width: 32px;
          height: 3px;
          margin-top: 20px;
          border-radius: 10px;
          background: #159a9c;
          opacity: 0.7;
        }

        /* =========================
           ROLES
        ========================== */

        .how-roles {
          width: min(1100px, calc(100% - 48px));
          margin: 0 auto;
          padding: 15px 0 90px;
          display: grid;
          grid-template-columns: 0.85fr 1.15fr;
          gap: 80px;
          align-items: start;
        }

        .how-roles-heading h2 {
          margin: 0;
          color: #1c4447;
          font-size: 36px;
          line-height: 1.15;
          letter-spacing: -1px;
        }

        .how-roles-heading p {
          margin-top: 18px;
          color: #718487;
          font-size: 14px;
          line-height: 1.8;
        }

        .how-role-list {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 15px;
        }

        .how-role-card {
          display: grid;
          grid-template-columns: 43px 1fr;
          gap: 13px;
          padding: 19px;
          border: 1px solid #e4eeee;
          border-radius: 16px;
          background: #ffffff;
          box-shadow: 0 7px 22px rgba(28, 74, 77, 0.04);
          transition:
            transform 0.25s ease,
            box-shadow 0.25s ease;
        }

        .how-role-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 13px 28px rgba(28, 74, 77, 0.08);
        }

        .how-role-icon {
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 11px;
          background: #e9f8f8;
          color: #159a9c;
        }

        .how-role-card h3 {
          margin: 1px 0 5px;
          color: #26484b;
          font-size: 14px;
        }

        .how-role-card p {
          margin: 0;
          color: #7b8c8f;
          font-size: 11px;
          line-height: 1.65;
        }

        /* =========================
           PRINCIPLES
        ========================== */

        .how-principles {
          width: min(1100px, calc(100% - 48px));
          margin: 0 auto 90px;
          padding: 28px 32px;
          display: flex;
          align-items: flex-start;
          gap: 18px;
          border: 1px solid #cfe6e6;
          border-radius: 20px;
          background: #f3fbfb;
        }

        .how-principle-icon {
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

        .how-principles > div:last-child > span {
          display: block;
          margin-bottom: 6px;
          color: #159a9c;
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 1.2px;
        }

        .how-principles h2 {
          margin: 0;
          color: #24494c;
          font-size: 18px;
          line-height: 1.4;
        }

        .how-principles p {
          max-width: 850px;
          margin: 8px 0 0;
          color: #718487;
          font-size: 12px;
          line-height: 1.7;
        }

        /* =========================
           EXACT HOME FOOTER
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

        @keyframes howFadeUp {
          from {
            opacity: 0;
            transform: translateY(18px);
          }

          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes howFadeRight {
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
          .how-hero {
            grid-template-columns: 1fr;
            gap: 40px;
          }

          .how-hero-card {
            max-width: 650px;
          }

          .how-steps {
            grid-template-columns: repeat(2, 1fr);
          }

          .how-roles {
            grid-template-columns: 1fr;
            gap: 40px;
          }

          .footer-main {
            grid-template-columns: 1.5fr 1fr 1fr;
          }

          .footer-brand {
            grid-column: 1 / -1;
          }
        }

        @media (max-width: 650px) {
          .how-hero,
          .how-workflow,
          .how-roles,
          .how-principles,
          .footer-main,
          .footer-bottom {
            width: calc(100% - 30px);
          }

          .how-hero {
            padding: 45px 0 55px;
          }

          .how-hero h1 {
            font-size: 38px;
            letter-spacing: -1.2px;
          }

          .how-hero-card {
            padding: 25px;
          }

          .how-flow-connector {
            min-width: 12px;
          }

          .how-workflow {
            padding-top: 55px;
          }

          .how-section-heading h2,
          .how-roles-heading h2 {
            font-size: 30px;
          }

          .how-steps {
            grid-template-columns: 1fr;
          }

          .how-step {
            min-height: auto;
          }

          .how-role-list {
            grid-template-columns: 1fr;
          }

          .how-principles {
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
          .how-hero-copy,
          .how-hero-card {
            animation: none;
          }

          .how-primary-button,
          .how-step,
          .how-role-card,
          .footer-column > a {
            transition: none;
          }
        }
      `}</style>
    </>
  );
}