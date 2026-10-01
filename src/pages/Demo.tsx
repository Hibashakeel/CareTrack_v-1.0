import { Link } from "react-router-dom";
import {
  Activity,
  Users,
  Stethoscope,
  ShieldCheck,
  ArrowRight,
  HeartPulse,
  Mail,
  Phone,
  MapPin,
  Facebook,
  Instagram,
  Linkedin,
} from "lucide-react";

export default function Demo() {
  const roles = [
    {
      role: "patient",
      name: "Patient",
      tag: "PATIENT",
      description:
        "Track daily information and communicate with your care team.",
      icon: Activity,
      image:
        "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=700&q=85",
    },
    {
      role: "nurse",
      name: "Nurse",
      tag: "NURSING",
      description:
        "Review patients, reports, severity and daily care information.",
      icon: Users,
      image:
        "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=700&q=85",
    },
    {
      role: "doctor",
      name: "Doctor",
      tag: "DOCTOR",
      description:
        "Review patient records and communicate with patients.",
      icon: Stethoscope,
      image:
        "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=700&q=85",
    },
    {
      role: "admin",
      name: "Admin",
      tag: "ADMIN",
      description:
        "Manage users, approvals and the CareTrack platform.",
      icon: ShieldCheck,
      image:
        "https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&w=700&q=85",
    },
  ];

  return (
    <main className="demo-page">
      <style>{`
        * {
          box-sizing: border-box;
        }

        .demo-page {
          min-height: 100vh;
          padding: 55px 24px 0;
          background:
            radial-gradient(
              circle at 10% 5%,
              rgba(21,154,156,.10),
              transparent 25%
            ),
            #f7fbfb;
          color: #183b3e;
        }

        .demo-container {
          width: min(1180px, 100%);
          margin: 0 auto;
          padding-bottom: 60px;
        }

        /* =========================
           HEADER
        ========================= */

        .demo-header {
          text-align: center;
          max-width: 700px;
          margin: 0 auto 38px;
          animation: demoFade .6s ease both;
        }

        .demo-logo {
          width: 52px;
          height: 52px;
          margin: 0 auto 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 15px;
          background: linear-gradient(135deg, #159a9c, #117578);
          color: white;
          box-shadow: 0 9px 25px rgba(21,154,156,.20);
          animation: floating 4s ease-in-out infinite;
        }

        .demo-eyebrow {
          display: block;
          margin-bottom: 9px;
          color: #159a9c;
          font-size: 9px;
          font-weight: 800;
          letter-spacing: 1.7px;
        }

        .demo-header h1 {
          margin: 0;
          color: #123f43;
          font-size: clamp(31px, 4vw, 45px);
          line-height: 1.08;
          letter-spacing: -1.5px;
        }

        .demo-header p {
          margin: 14px auto 0;
          max-width: 620px;
          color: #718789;
          font-size: 12px;
          line-height: 1.7;
        }

        .demo-notice {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          margin-top: 15px;
          padding: 7px 11px;
          border: 1px solid #d6e8e8;
          border-radius: 20px;
          background: white;
          color: #648082;
          font-size: 9px;
        }

        .demo-notice svg {
          color: #159a9c;
        }

        /* =========================
           ROLE CARDS
        ========================= */

        .demo-role-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 18px;
        }

        .demo-role-card {
          position: relative;
          height: 285px;
          overflow: hidden;
          display: flex;
          align-items: flex-end;
          border: 1px solid #dbeaea;
          border-radius: 19px;
          background: #123f43;
          text-decoration: none;
          color: white;
          box-shadow: 0 10px 30px rgba(18,63,67,.08);
          isolation: isolate;
          animation: cardIn .65s ease both;
          transition:
            transform .3s ease,
            box-shadow .3s ease;
        }

        .demo-role-card:nth-child(1) {
          animation-delay: .05s;
        }

        .demo-role-card:nth-child(2) {
          animation-delay: .12s;
        }

        .demo-role-card:nth-child(3) {
          animation-delay: .19s;
        }

        .demo-role-card:nth-child(4) {
          animation-delay: .26s;
        }

        .demo-role-card:hover {
          transform: translateY(-6px);
          box-shadow: 0 20px 40px rgba(18,63,67,.16);
        }

        .demo-card-image {
          position: absolute;
          inset: 0;
          z-index: -3;
        }

        .demo-card-image img {
          width: 100%;
          height: 100%;
          display: block;
          object-fit: cover;
          transition:
            transform .6s ease,
            filter .4s ease;
        }

        .demo-role-card:hover .demo-card-image img {
          transform: scale(1.06);
          filter: saturate(1.08);
        }

        .demo-card-overlay {
          position: absolute;
          inset: 0;
          z-index: -2;
          background:
            linear-gradient(
              to bottom,
              rgba(10,45,48,.02) 20%,
              rgba(8,38,41,.20) 40%,
              rgba(7,34,37,.94) 100%
            );
        }

        .demo-floating-icon {
          position: absolute;
          top: 15px;
          left: 15px;
          width: 39px;
          height: 39px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1px solid rgba(255,255,255,.25);
          border-radius: 11px;
          background: rgba(18,63,67,.55);
          backdrop-filter: blur(8px);
          color: white;
          animation: iconFloat 3.5s ease-in-out infinite;
        }

        .demo-card-content {
          width: 100%;
          padding: 18px;
        }

        .demo-card-tag {
          display: inline-block;
          margin-bottom: 6px;
          padding: 4px 7px;
          border: 1px solid rgba(255,255,255,.18);
          border-radius: 12px;
          background: rgba(255,255,255,.10);
          color: #bfe0e0;
          font-size: 7px;
          font-weight: 800;
          letter-spacing: 1px;
          backdrop-filter: blur(7px);
        }

        .demo-card-title-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
        }

        .demo-card-title-row h2 {
          margin: 0;
          font-size: 21px;
          line-height: 1.1;
          color: white;
        }

        .demo-card-content p {
          margin: 7px 0 0;
          color: rgba(255,255,255,.78);
          font-size: 9.5px;
          line-height: 1.55;
        }

        .demo-arrow {
          width: 31px;
          height: 31px;
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          background: #159a9c;
          color: white;
          transition:
            transform .25s ease,
            background .25s ease;
        }

        .demo-role-card:hover .demo-arrow {
          transform: translateX(4px);
          background: #1aaeb0;
        }

        /* =========================
           DEMO NOTICE
        ========================= */

        .demo-bottom {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 7px;
          margin-top: 23px;
          color: #819496;
          font-size: 9px;
        }

        .demo-bottom svg {
          color: #159a9c;
        }

        /* =========================
           FOOTER
        ========================= */

        .demo-footer {
          margin-top: 25px;
          margin-left: -24px;
          margin-right: -24px;
          background: #103b3e;
          color: white;
        }

        .demo-footer-inner {
          width: min(1180px, 100%);
          margin: 0 auto;
          padding: 48px 24px 24px;
        }

        .demo-footer-grid {
          display: grid;
          grid-template-columns: 1.5fr 1fr 1fr 1.2fr;
          gap: 45px;
          padding-bottom: 35px;
        }

        .demo-footer-brand {
          max-width: 330px;
        }

        .demo-footer-brand-row {
          display: flex;
          align-items: center;
          gap: 11px;
          margin-bottom: 14px;
        }

        .demo-footer-brand-icon {
          width: 42px;
          height: 42px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 12px;
          background: linear-gradient(135deg, #159a9c, #117578);
          color: white;
        }

        .demo-footer-brand-name {
          font-size: 20px;
          font-weight: 800;
          letter-spacing: -.5px;
        }

        .demo-footer-brand p {
          margin: 0;
          color: rgba(255,255,255,.65);
          font-size: 11px;
          line-height: 1.7;
        }

        .demo-footer-title {
          margin: 0 0 15px;
          color: white;
          font-size: 12px;
          font-weight: 800;
          letter-spacing: .4px;
        }

        .demo-footer-links {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .demo-footer-links a {
          color: rgba(255,255,255,.62);
          text-decoration: none;
          font-size: 10.5px;
          transition: color .2s ease, transform .2s ease;
        }

        .demo-footer-links a:hover {
          color: #6ed5d6;
          transform: translateX(3px);
        }

        .demo-footer-contact {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .demo-footer-contact-item {
          display: flex;
          align-items: flex-start;
          gap: 9px;
          color: rgba(255,255,255,.65);
          font-size: 10.5px;
          line-height: 1.5;
        }

        .demo-footer-contact-item svg {
          flex-shrink: 0;
          margin-top: 1px;
          color: #48bfc1;
        }

        .demo-footer-social {
          display: flex;
          gap: 8px;
          margin-top: 16px;
        }

        .demo-footer-social a {
          width: 31px;
          height: 31px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1px solid rgba(255,255,255,.13);
          border-radius: 9px;
          color: rgba(255,255,255,.7);
          text-decoration: none;
          transition:
            background .2s ease,
            color .2s ease,
            transform .2s ease;
        }

        .demo-footer-social a:hover {
          background: #159a9c;
          color: white;
          transform: translateY(-2px);
        }

        .demo-footer-divider {
          height: 1px;
          background: rgba(255,255,255,.10);
        }

        .demo-footer-bottom {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
          padding-top: 20px;
        }

        .demo-footer-copyright {
          color: rgba(255,255,255,.48);
          font-size: 9.5px;
        }

        .demo-footer-bottom-right {
          display: flex;
          align-items: center;
          gap: 6px;
          color: rgba(255,255,255,.48);
          font-size: 9.5px;
        }

        .demo-footer-bottom-right svg {
          color: #48bfc1;
        }

        /* =========================
           ANIMATIONS
        ========================= */

        @keyframes demoFade {
          from {
            opacity: 0;
            transform: translateY(15px);
          }

          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes cardIn {
          from {
            opacity: 0;
            transform: translateY(22px);
          }

          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes floating {
          0%, 100% {
            transform: translateY(0);
          }

          50% {
            transform: translateY(-5px);
          }
        }

        @keyframes iconFloat {
          0%, 100% {
            transform: translateY(0);
          }

          50% {
            transform: translateY(-3px);
          }
        }

        /* =========================
           TABLET
        ========================= */

        @media (max-width: 1000px) {
          .demo-role-grid {
            grid-template-columns: repeat(2, 1fr);
          }

          .demo-role-card {
            height: 270px;
          }

          .demo-footer-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 35px;
          }
        }

        /* =========================
           MOBILE
        ========================= */

        @media (max-width: 600px) {
          .demo-page {
            padding: 40px 15px 0;
          }

          .demo-container {
            padding-bottom: 45px;
          }

          .demo-role-grid {
            grid-template-columns: 1fr;
            max-width: 390px;
            margin: 0 auto;
          }

          .demo-role-card {
            height: 270px;
          }

          .demo-header {
            margin-bottom: 30px;
          }

          .demo-footer {
            margin-left: -15px;
            margin-right: -15px;
          }

          .demo-footer-inner {
            padding: 40px 20px 22px;
          }

          .demo-footer-grid {
            grid-template-columns: 1fr;
            gap: 30px;
          }

          .demo-footer-bottom {
            flex-direction: column;
            align-items: flex-start;
            gap: 9px;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .demo-logo,
          .demo-floating-icon,
          .demo-role-card {
            animation: none;
          }
        }
      `}</style>

      <div className="demo-container">

        {/* =========================
            HEADER
        ========================= */}

        <header className="demo-header">
          <div className="demo-logo">
            <HeartPulse size={25} />
          </div>

          <span className="demo-eyebrow">
            INTERACTIVE CARETRACK DEMO
          </span>

          <h1>Explore CareTrack without an account.</h1>

          <p>
            Choose a role to explore the CareTrack workflow and
            experience how each member of the care team interacts
            with the platform.
          </p>

          <div className="demo-notice">
            <ShieldCheck size={13} />
            Demo data is temporary and is never saved to Firebase.
          </div>
        </header>

        {/* =========================
            ROLE CARDS
        ========================= */}

        <section className="demo-role-grid">
          {roles.map((role) => {
            const Icon = role.icon;

            return (
              <Link
                key={role.role}
                to={`/demo/${role.role}`}
                className="demo-role-card"
              >
                <div className="demo-card-image">
                  <img
                    src={role.image}
                    alt={`${role.name} role`}
                    loading="lazy"
                  />
                </div>

                <div className="demo-card-overlay" />

                <div className="demo-floating-icon">
                  <Icon size={19} />
                </div>

                <div className="demo-card-content">
                  <span className="demo-card-tag">
                    {role.tag}
                  </span>

                  <div className="demo-card-title-row">
                    <h2>{role.name}</h2>

                    <span className="demo-arrow">
                      <ArrowRight size={15} />
                    </span>
                  </div>

                  <p>{role.description}</p>
                </div>
              </Link>
            );
          })}
        </section>

        <div className="demo-bottom">
          <ShieldCheck size={12} />
          Fictional demonstration data · No real patient information
        </div>
      </div>

      {/* =========================
          FOOTER
      ========================= */}

      <footer className="demo-footer">
        <div className="demo-footer-inner">

          <div className="demo-footer-grid">

            {/* BRAND */}

            <div className="demo-footer-brand">
              <div className="demo-footer-brand-row">
                <div className="demo-footer-brand-icon">
                  <HeartPulse size={21} />
                </div>

                <div className="demo-footer-brand-name">
                  CareTrack
                </div>
              </div>

              <p>
                A smart patient self-monitoring and communication
                platform designed to make healthcare information
                easier to record, review and share.
              </p>

              <div className="demo-footer-social">
                <a href="#" aria-label="Facebook">
                  <Facebook size={14} />
                </a>

                <a href="#" aria-label="Instagram">
                  <Instagram size={14} />
                </a>

                <a href="#" aria-label="LinkedIn">
                  <Linkedin size={14} />
                </a>
              </div>
            </div>

            {/* QUICK LINKS */}

            <div>
              <h3 className="demo-footer-title">
                Quick Links
              </h3>

              <div className="demo-footer-links">
                <Link to="/">Home</Link>
                <Link to="/about">About CareTrack</Link>
                <Link to="/features">Features</Link>
                <Link to="/how-it-works">How It Works</Link>
                <Link to="/demo">Explore Demo</Link>
              </div>
            </div>

            {/* ROLES */}

            <div>
              <h3 className="demo-footer-title">
                Explore Roles
              </h3>

              <div className="demo-footer-links">
                <Link to="/demo/patient">Patient Demo</Link>
                <Link to="/demo/nurse">Nurse Demo</Link>
                <Link to="/demo/doctor">Doctor Demo</Link>
                <Link to="/demo/admin">Admin Demo</Link>
                <Link to="/login">Sign In</Link>
              </div>
            </div>

            {/* CONTACT */}

            <div>
              <h3 className="demo-footer-title">
                CareTrack
              </h3>

              <div className="demo-footer-contact">

                <div className="demo-footer-contact-item">
                  <Mail size={14} />
                  <span>support@caretrack.demo</span>
                </div>

                <div className="demo-footer-contact-item">
                  <Phone size={14} />
                  <span>Healthcare Support</span>
                </div>

                <div className="demo-footer-contact-item">
                  <MapPin size={14} />
                  <span>
                    Smart Patient Monitoring Platform
                  </span>
                </div>

              </div>
            </div>

          </div>

          <div className="demo-footer-divider" />

          <div className="demo-footer-bottom">

            <div className="demo-footer-copyright">
              © 2026 CareTrack. All rights reserved.
            </div>

            <div className="demo-footer-bottom-right">
              <ShieldCheck size={12} />
              <span>
                Demo environment · No real patient data
              </span>
            </div>

          </div>

        </div>
      </footer>
    </main>
  );
}