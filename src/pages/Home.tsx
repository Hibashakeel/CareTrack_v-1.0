import {
  Activity,
  ClipboardCheck,
  MessageCircle,
  ShieldCheck,
  ArrowRight,
  HeartPulse,
  Users,
  ChevronRight,
  Mail,
  Phone,
  MapPin,
  Clock3,
} from "lucide-react";
import { Link } from "react-router-dom";

export default function Home() {
  return (
    <>
      <main className="home">
        {/* =========================
            HERO SECTION
        ========================== */}
        <section className="hero">
          <div className="hero-copy">
            <span className="eyebrow">
              SMART PATIENT SELF-MONITORING
            </span>

            <h1>
              Better patient information.
              <br />
              <em>Better care coordination.</em>
            </h1>

            <p>
              CareTrack helps patients record daily information digitally
              while nurses and doctors can review organized patient
              information in one place.
            </p>

            <div className="hero-actions">
              <Link className="button primary" to="/demo">
                Explore CareTrack
                <ArrowRight size={17} />
              </Link>

              <Link className="button secondary" to="/about">
                Learn More
              </Link>
            </div>

            <div className="scope-note">
              <ShieldCheck size={18} />
              <span>
                CareTrack records and organizes information. It does not
                diagnose or make treatment decisions.
              </span>
            </div>
          </div>

          {/* HERO IMAGE */}
          <div className="hero-visual">
            <img
              src="https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=1200&q=85"
              alt="Healthcare team working together"
            />

            <div className="hero-image-overlay" />

            {/* TOP FLOATING CARD */}
            <div className="floating-card floating-card-top">
              <div className="floating-icon">
                <HeartPulse size={19} />
              </div>

              <div className="floating-content">
                <strong>Connected Care</strong>
                <span>Information shared securely</span>
              </div>
            </div>

            {/* BOTTOM HORIZONTAL CARD */}
            <div className="floating-card floating-card-bottom">
              <div className="floating-icon">
                <Users size={19} />
              </div>

              <div className="floating-content">
                <strong>Care Team</strong>
                <span>Patients • Nurses • Doctors</span>
              </div>

              <div className="floating-status">
                <span className="status-dot" />
                Connected
              </div>
            </div>
          </div>
        </section>

        {/* =========================
            FEATURE STRIP
        ========================== */}
        <section className="feature-strip">
          <div className="feature-item">
            <div className="feature-icon">
              <Activity size={22} />
            </div>

            <div>
              <b>Daily Monitoring</b>
              <span>Simple patient self-reporting</span>
            </div>
          </div>

          <div className="feature-item">
            <div className="feature-icon">
              <ClipboardCheck size={22} />
            </div>

            <div>
              <b>Organized Records</b>
              <span>Clear information for care teams</span>
            </div>
          </div>

          <div className="feature-item">
            <div className="feature-icon">
              <MessageCircle size={22} />
            </div>

            <div>
              <b>Communication</b>
              <span>Questions and voice responses</span>
            </div>
          </div>
        </section>

        {/* =========================
            INTRO SECTION
        ========================== */}
        <section className="caretrack-intro">
          <div className="intro-heading">
            <span className="section-label">DESIGNED AROUND PEOPLE</span>

            <h2>
              A simpler way to stay
              <br />
              connected with care.
            </h2>

            <p>
              CareTrack brings patients and authorized care staff together
              through a simple digital experience designed around clear
              information, easy communication and organized records.
            </p>
          </div>

          <div className="intro-points">
            <div className="intro-point">
              <div className="intro-number">01</div>

              <div>
                <h3>Patient-centered</h3>
                <p>
                  Patients can record their daily information in a simple
                  and understandable way.
                </p>
              </div>

              <ChevronRight size={19} />
            </div>

            <div className="intro-point">
              <div className="intro-number">02</div>

              <div>
                <h3>Clear information</h3>
                <p>
                  Care teams can review relevant patient information in an
                  organized digital record.
                </p>
              </div>

              <ChevronRight size={19} />
            </div>

            <div className="intro-point">
              <div className="intro-number">03</div>

              <div>
                <h3>Better communication</h3>
                <p>
                  Patients and care teams can communicate through questions,
                  responses and voice-based information.
                </p>
              </div>

              <ChevronRight size={19} />
            </div>
          </div>
        </section>
      </main>

      {/* =========================
          FOOTER
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
          HOME PAGE STYLES
      ========================== */}
      <style>{`
        /* =========================
           HERO
        ========================== */

        .home {
          width: 100%;
          overflow: hidden;
          background: #ffffff;
        }

        .hero {
          width: min(1200px, calc(100% - 48px));
          margin: 0 auto;
          padding: 70px 0 55px;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 55px;
          align-items: center;
        }

        .hero-copy {
          animation: heroFade 0.7s ease both;
        }

        .eyebrow,
        .section-label {
          display: inline-block;
          font-size: 12px;
          font-weight: 800;
          letter-spacing: 1.5px;
          color: #159a9c;
          margin-bottom: 15px;
        }

        .hero h1 {
          margin: 0;
          color: #163a3d;
          font-size: clamp(38px, 5vw, 62px);
          line-height: 1.08;
          letter-spacing: -2px;
        }

        .hero h1 em {
          color: #159a9c;
          font-style: normal;
        }

        .hero-copy > p {
          max-width: 590px;
          margin: 23px 0;
          color: #63777a;
          font-size: 16px;
          line-height: 1.8;
        }

        .hero-actions {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
          margin-top: 25px;
        }

        .button {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          min-height: 46px;
          padding: 0 20px;
          border-radius: 12px;
          text-decoration: none;
          font-weight: 700;
          transition:
            transform 0.25s ease,
            box-shadow 0.25s ease,
            background 0.25s ease;
        }

        .button:hover {
          transform: translateY(-2px);
        }

        .button.primary {
          background: #159a9c;
          color: white;
          box-shadow: 0 10px 25px rgba(21, 154, 156, 0.2);
        }

        .button.primary:hover {
          background: #117f81;
          box-shadow: 0 14px 30px rgba(21, 154, 156, 0.28);
        }

        .button.secondary {
          background: #f1f7f7;
          color: #236164;
        }

        .button.secondary:hover {
          background: #e4f0f0;
        }

        .scope-note {
          display: flex;
          align-items: flex-start;
          gap: 9px;
          max-width: 570px;
          margin-top: 28px;
          padding: 13px 15px;
          border: 1px solid #dceced;
          border-radius: 12px;
          background: #f8fbfb;
          color: #64787b;
          font-size: 12px;
          line-height: 1.55;
        }

        .scope-note svg {
          flex-shrink: 0;
          color: #159a9c;
          margin-top: 1px;
        }

        /* =========================
           HERO IMAGE
        ========================== */

        .hero-visual {
          position: relative;
          min-height: 470px;
          border-radius: 28px;
          overflow: visible;
          animation: imageFade 0.8s ease both;
        }

        .hero-visual > img {
          width: 100%;
          height: 470px;
          display: block;
          object-fit: cover;
          border-radius: 28px;
          box-shadow: 0 25px 60px rgba(27, 69, 73, 0.16);
        }

        .hero-image-overlay {
          position: absolute;
          inset: 0;
          border-radius: 28px;
          background: linear-gradient(
            180deg,
            rgba(12, 60, 64, 0.02) 30%,
            rgba(12, 60, 64, 0.18) 100%
          );
          pointer-events: none;
        }

        /* FLOATING CARDS */
        .floating-card {
          position: absolute;
          z-index: 3;
          display: flex;
          align-items: center;
          background: rgba(255, 255, 255, 0.97);
          border: 1px solid rgba(255, 255, 255, 0.9);
          box-shadow: 0 15px 35px rgba(20, 68, 72, 0.18);
          backdrop-filter: blur(10px);
        }

        .floating-card-top {
          top: 28px;
          left: -25px;
          min-width: 220px;
          padding: 13px 16px;
          gap: 11px;
          border-radius: 15px;
        }

        .floating-card-bottom {
          left: 25px;
          right: 25px;
          bottom: 25px;
          min-height: 68px;
          padding: 11px 15px;
          gap: 11px;
          border-radius: 16px;
        }

        .floating-icon {
          width: 40px;
          height: 40px;
          flex: 0 0 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 11px;
          background: #e7f7f7;
          color: #159a9c;
        }

        .floating-content {
          min-width: 0;
          display: flex;
          flex-direction: column;
          justify-content: center;
          gap: 4px;
        }

        .floating-content strong {
          display: block;
          color: #193f42;
          font-size: 14px;
          line-height: 1.2;
          white-space: nowrap;
        }

        .floating-content span {
          display: block;
          color: #718588;
          font-size: 11px;
          line-height: 1.35;
          white-space: nowrap;
        }

        .floating-status {
          margin-left: auto;
          flex-shrink: 0;
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 7px 10px;
          border-radius: 20px;
          background: #edf9f5;
          color: #36816a;
          font-size: 11px;
          font-weight: 700;
          white-space: nowrap;
        }

        .status-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #45b98d;
        }

        /* =========================
           FEATURE STRIP
        ========================== */

        .feature-strip {
          width: min(1200px, calc(100% - 48px));
          margin: 0 auto 70px;
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 18px;
        }

        .feature-item {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 22px;
          border: 1px solid #e4eeee;
          border-radius: 17px;
          background: #ffffff;
          box-shadow: 0 8px 25px rgba(28, 74, 77, 0.05);
          transition:
            transform 0.25s ease,
            box-shadow 0.25s ease;
        }

        .feature-item:hover {
          transform: translateY(-4px);
          box-shadow: 0 14px 32px rgba(28, 74, 77, 0.1);
        }

        .feature-icon {
          width: 45px;
          height: 45px;
          flex: 0 0 45px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 13px;
          background: #e9f8f8;
          color: #159a9c;
        }

        .feature-item b {
          display: block;
          color: #203f42;
          margin-bottom: 4px;
          font-size: 14px;
        }

        .feature-item span {
          display: block;
          color: #7b8d90;
          font-size: 12px;
          line-height: 1.4;
        }

        /* =========================
           INTRO
        ========================== */

        .caretrack-intro {
          width: min(1100px, calc(100% - 48px));
          margin: 0 auto;
          padding: 15px 0 90px;
          display: grid;
          grid-template-columns: 0.85fr 1.15fr;
          gap: 80px;
          align-items: start;
        }

        .intro-heading h2 {
          margin: 0;
          color: #193f42;
          font-size: 38px;
          line-height: 1.15;
          letter-spacing: -1px;
        }

        .intro-heading p {
          margin-top: 20px;
          color: #718487;
          font-size: 14px;
          line-height: 1.8;
        }

        .intro-points {
          display: flex;
          flex-direction: column;
        }

        .intro-point {
          display: grid;
          grid-template-columns: 45px 1fr 20px;
          align-items: center;
          gap: 15px;
          padding: 20px 0;
          border-bottom: 1px solid #e7eeee;
        }

        .intro-point:first-child {
          padding-top: 0;
        }

        .intro-number {
          color: #159a9c;
          font-size: 12px;
          font-weight: 800;
        }

        .intro-point h3 {
          margin: 0 0 5px;
          color: #26484b;
          font-size: 15px;
        }

        .intro-point p {
          margin: 0;
          color: #7b8c8f;
          font-size: 12px;
          line-height: 1.6;
        }

        .intro-point > svg {
          color: #9bb2b4;
        }

        /* =========================
           FOOTER
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

        @keyframes heroFade {
          from {
            opacity: 0;
            transform: translateY(18px);
          }

          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes imageFade {
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

        @media (max-width: 900px) {
          .hero {
            grid-template-columns: 1fr;
            gap: 40px;
            padding-top: 45px;
          }

          .hero-copy {
            max-width: 700px;
          }

          .hero-visual {
            min-height: 420px;
          }

          .hero-visual > img {
            height: 420px;
          }

          .feature-strip {
            grid-template-columns: 1fr;
          }

          .caretrack-intro {
            grid-template-columns: 1fr;
            gap: 40px;
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
          .hero,
          .feature-strip,
          .caretrack-intro,
          .footer-main,
          .footer-bottom {
            width: min(100% - 30px, 1200px);
          }

          .hero {
            padding-top: 30px;
          }

          .hero h1 {
            font-size: 38px;
            letter-spacing: -1.2px;
          }

          .hero-visual {
            min-height: 350px;
          }

          .hero-visual > img {
            height: 350px;
            border-radius: 22px;
          }

          .hero-image-overlay {
            border-radius: 22px;
          }

          .floating-card-top {
            top: 15px;
            left: 12px;
            min-width: 195px;
          }

          .floating-card-bottom {
            left: 12px;
            right: 12px;
            bottom: 15px;
          }

          .floating-status {
            display: none;
          }

          .floating-content strong {
            font-size: 13px;
          }

          .floating-content span {
            font-size: 10px;
          }

          .feature-strip {
            margin-bottom: 50px;
          }

          .caretrack-intro {
            padding-bottom: 60px;
          }

          .intro-heading h2 {
            font-size: 31px;
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
          .hero-copy,
          .hero-visual {
            animation: none;
          }

          .button,
          .feature-item,
          .footer-column > a {
            transition: none;
          }
        }
      `}</style>
    </>
  );
}