
import { useEffect, useMemo, useState } from "react";
import { get, ref, update } from "firebase/database";
import {
  CheckCircle2,
  Clock3,
  RefreshCw,
  Search,
  ShieldCheck,
  Stethoscope,
  UserCheck,
  UserRound,
  XCircle,
} from "lucide-react";

import { db } from "../lib/firebase";

interface StaffUser {
  uid: string;
  fullName: string;
  email: string;
  phone: string;
  role: "nurse" | "doctor";
  active: boolean;
  approvalStatus: "approved" | "pending" | "rejected";
  createdAt?: number;
}

export default function AdminDashboard() {
  const [users, setUsers] = useState<StaffUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState("");
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  async function loadUsers() {
    try {
      setLoading(true);
      setError("");

      const snapshot = await get(ref(db, "users"));

      if (!snapshot.exists()) {
        setUsers([]);
        return;
      }

      const data = snapshot.val();

      const staffUsers: StaffUser[] = Object.entries(data)
        .map(([uid, value]: [string, any]) => ({
          uid,
          ...value,
        }))
        .filter(
          (user) =>
            (user.role === "nurse" || user.role === "doctor") &&
            user.approvalStatus === "pending"
        );

      setUsers(staffUsers);
    } catch (err: any) {
      console.error("Failed to load staff:", err);

      setError(
        err?.message || "Unable to load pending registrations."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadUsers();
  }, []);

  async function approveUser(uid: string) {
    try {
      setProcessing(uid);

      await update(ref(db, `users/${uid}`), {
        active: true,
        approvalStatus: "approved",
      });

      setUsers((current) =>
        current.filter((user) => user.uid !== uid)
      );
    } catch (err: any) {
      console.error("Approval failed:", err);

      setError(
        err?.message || "Unable to approve account."
      );
    } finally {
      setProcessing("");
    }
  }

  async function rejectUser(uid: string) {
    try {
      setProcessing(uid);

      await update(ref(db, `users/${uid}`), {
        active: false,
        approvalStatus: "rejected",
      });

      setUsers((current) =>
        current.filter((user) => user.uid !== uid)
      );
    } catch (err: any) {
      console.error("Rejection failed:", err);

      setError(
        err?.message || "Unable to reject account."
      );
    } finally {
      setProcessing("");
    }
  }

  const filteredUsers = useMemo(() => {
    const term = search.toLowerCase().trim();

    if (!term) {
      return users;
    }

    return users.filter(
      (user) =>
        user.fullName.toLowerCase().includes(term) ||
        user.email.toLowerCase().includes(term) ||
        user.role.toLowerCase().includes(term)
    );
  }, [users, search]);

  const nurseCount = users.filter(
    (user) => user.role === "nurse"
  ).length;

  const doctorCount = users.filter(
    (user) => user.role === "doctor"
  ).length;

  return (
    <div className="admin-dashboard-page">
      <style>{`
        /* =========================================================
           ADMIN DASHBOARD
           ========================================================= */

        .admin-dashboard-page {
          width: 100%;
          max-width: 1500px;
          margin: 0 auto;
          padding: 4px;
          color: #172033;
        }

        /* ================= PAGE INTRO ================= */

        .admin-page-heading {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 20px;
          margin-bottom: 24px;
        }

        .admin-heading-left {
          display: flex;
          align-items: center;
          gap: 14px;
        }

        .admin-heading-icon {
          width: 52px;
          height: 52px;
          border-radius: 15px;
          background: #e8f5f5;
          color: #087b83;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .admin-heading-text h1 {
          margin: 0;
          font-size: 27px;
          font-weight: 800;
          letter-spacing: -0.5px;
          color: #17324d;
        }

        .admin-heading-text p {
          margin: 5px 0 0;
          color: #718493;
          font-size: 14px;
        }

        .admin-refresh {
          height: 42px;
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 0 15px;
          border-radius: 11px;
          border: 1px solid #dbe5ea;
          background: white;
          color: #334d61;
          font-weight: 700;
          cursor: pointer;
          transition: 0.2s ease;
        }

        .admin-refresh:hover {
          background: #f5fafb;
          border-color: #bfd9dc;
        }

        /* =========================================================
           CARETRACK THEME WELCOME CARD
           ========================================================= */

        .admin-welcome {
          border-radius: 20px;
          padding: 26px 28px;
          margin-bottom: 22px;
          color: white;

          background:
            linear-gradient(
              135deg,
              #17324d 0%,
              #214b63 58%,
              #087b83 100%
            );

          position: relative;
          overflow: hidden;

          box-shadow:
            0 12px 30px
            rgba(23, 50, 77, 0.16);
        }

        .admin-welcome::before {
          content: "";
          position: absolute;
          width: 240px;
          height: 240px;
          border-radius: 50%;
          right: -80px;
          top: -100px;
          background: rgba(255, 255, 255, 0.055);
        }

        .admin-welcome::after {
          content: "";
          position: absolute;
          width: 150px;
          height: 150px;
          border-radius: 50%;
          right: 120px;
          bottom: -100px;
          background: rgba(20, 154, 156, 0.12);
        }

        .admin-welcome-content {
          position: relative;
          z-index: 1;
        }

        .admin-welcome-label {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          padding: 6px 10px;
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.11);
          border: 1px solid rgba(255, 255, 255, 0.12);
          font-size: 11px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .admin-welcome h2 {
          margin: 12px 0 5px;
          font-size: 23px;
          font-weight: 800;
          color: #ffffff;
        }

        .admin-welcome p {
          margin: 0;
          max-width: 650px;
          color: rgba(255, 255, 255, 0.82);
          font-size: 13px;
          line-height: 1.6;
        }

        /* ================= STATS ================= */

        .admin-stats {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 16px;
          margin-bottom: 22px;
        }

        .admin-stat {
          background: white;
          border: 1px solid #e2ebef;
          border-radius: 17px;
          padding: 19px;
          display: flex;
          align-items: center;
          gap: 14px;
          box-shadow:
            0 5px 20px
            rgba(23, 50, 77, 0.035);
        }

        .admin-stat-icon {
          width: 45px;
          height: 45px;
          border-radius: 13px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .admin-stat-icon.pending {
          background: #fff7ed;
          color: #d97706;
        }

        .admin-stat-icon.nurse {
          background: #eaf8f8;
          color: #087b83;
        }

        .admin-stat-icon.doctor {
          background: #edf5fa;
          color: #3f6f8f;
        }

        .admin-stat-label {
          margin: 0;
          color: #718493;
          font-size: 12px;
          font-weight: 700;
        }

        .admin-stat-value {
          margin: 3px 0 0;
          font-size: 24px;
          font-weight: 800;
          color: #17324d;
        }

        /* ================= APPROVAL CARD ================= */

        .admin-approval-card {
          background: white;
          border: 1px solid #e2ebef;
          border-radius: 20px;
          overflow: hidden;
          box-shadow:
            0 7px 25px
            rgba(23, 50, 77, 0.04);
        }

        .admin-card-header {
          padding: 21px 23px;
          border-bottom: 1px solid #edf2f4;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 18px;
        }

        .admin-card-title {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .admin-card-title-icon {
          width: 41px;
          height: 41px;
          border-radius: 12px;
          background: #e8f5f5;
          color: #087b83;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .admin-card-title h3 {
          margin: 0;
          font-size: 17px;
          font-weight: 800;
          color: #17324d;
        }

        .admin-card-title p {
          margin: 4px 0 0;
          color: #718493;
          font-size: 12px;
        }

        .admin-pending-badge {
          padding: 7px 11px;
          border-radius: 999px;
          background: #fff7ed;
          border: 1px solid #fed7aa;
          color: #c2410c;
          font-size: 11px;
          font-weight: 800;
          white-space: nowrap;
        }

        /* ================= SEARCH ================= */

        .admin-search-area {
          padding: 15px 23px;
          background: #fafcfd;
          border-bottom: 1px solid #edf2f4;
        }

        .admin-search {
          position: relative;
          max-width: 430px;
        }

        .admin-search svg {
          position: absolute;
          left: 13px;
          top: 50%;
          transform: translateY(-50%);
          color: #94a5ae;
        }

        .admin-search input {
          width: 100%;
          height: 41px;
          border: 1px solid #dbe5ea;
          border-radius: 10px;
          outline: none;
          padding: 0 13px 0 39px;
          font-size: 13px;
          background: white;
          color: #29445a;
          box-sizing: border-box;
        }

        .admin-search input:focus {
          border-color: #5aa9ad;
          box-shadow:
            0 0 0 3px
            rgba(8, 123, 131, 0.08);
        }

        /* ================= USERS ================= */

        .admin-users {
          padding: 18px 23px 23px;
          display: grid;
          gap: 12px;
        }

        .admin-user-card {
          border: 1px solid #e2ebef;
          border-radius: 15px;
          padding: 16px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 18px;
          transition: 0.2s ease;
        }

        .admin-user-card:hover {
          border-color: #bcdadd;
          box-shadow:
            0 7px 20px
            rgba(8, 123, 131, 0.06);
        }

        .admin-user-info {
          display: flex;
          align-items: center;
          gap: 13px;
          min-width: 0;
        }

        .admin-avatar {
          width: 46px;
          height: 46px;
          min-width: 46px;
          border-radius: 13px;
          background: #edf5f7;
          color: #087b83;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .admin-user-name {
          margin: 0;
          font-size: 14px;
          font-weight: 800;
          color: #20394f;
        }

        .admin-user-email {
          margin: 4px 0 0;
          color: #647b89;
          font-size: 12px;
        }

        .admin-user-phone {
          margin: 3px 0 0;
          color: #94a5ae;
          font-size: 11px;
        }

        .admin-role {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          margin-top: 7px;
          padding: 5px 9px;
          border-radius: 999px;
          font-size: 10px;
          font-weight: 800;
          text-transform: capitalize;
        }

        .admin-role.nurse {
          background: #eaf8f8;
          color: #087b83;
        }

        .admin-role.doctor {
          background: #edf5fa;
          color: #3f6f8f;
        }

        .admin-actions {
          display: flex;
          gap: 8px;
          flex-shrink: 0;
        }

        .admin-action {
          height: 38px;
          padding: 0 13px;
          border-radius: 9px;
          border: none;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          font-size: 12px;
          font-weight: 800;
          cursor: pointer;
        }

        .admin-approve {
          background: #168b72;
          color: white;
        }

        .admin-approve:hover {
          background: #11745f;
        }

        .admin-reject {
          background: #fff1f2;
          color: #be123c;
          border: 1px solid #fecdd3;
        }

        .admin-reject:hover {
          background: #ffe4e6;
        }

        .admin-action:disabled {
          opacity: 0.55;
          cursor: not-allowed;
        }

        /* ================= EMPTY ================= */

        .admin-empty {
          text-align: center;
          padding: 60px 20px;
        }

        .admin-empty-icon {
          width: 62px;
          height: 62px;
          margin: 0 auto 14px;
          border-radius: 17px;
          background: #eaf8f1;
          color: #168b72;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .admin-empty h3 {
          margin: 0 0 6px;
          font-size: 16px;
          color: #20394f;
        }

        .admin-empty p {
          margin: 0;
          color: #718493;
          font-size: 12px;
        }

        .admin-loading {
          text-align: center;
          padding: 60px;
          color: #718493;
          font-size: 13px;
        }

        .admin-error {
          margin-bottom: 18px;
          padding: 13px 16px;
          border-radius: 11px;
          background: #fff1f2;
          border: 1px solid #fecdd3;
          color: #be123c;
          font-size: 13px;
        }

        /* ================= RESPONSIVE ================= */

        @media (max-width: 900px) {
          .admin-stats {
            grid-template-columns: 1fr;
          }

          .admin-user-card {
            align-items: flex-start;
            flex-direction: column;
          }

          .admin-actions {
            width: 100%;
          }

          .admin-action {
            flex: 1;
          }
        }

        @media (max-width: 600px) {
          .admin-page-heading {
            flex-direction: column;
          }

          .admin-refresh {
            width: 100%;
            justify-content: center;
          }

          .admin-welcome {
            padding: 22px;
          }

          .admin-welcome h2 {
            font-size: 20px;
          }

          .admin-card-header {
            align-items: flex-start;
            flex-direction: column;
          }

          .admin-search-area,
          .admin-users {
            padding-left: 15px;
            padding-right: 15px;
          }

          .admin-user-info {
            width: 100%;
          }
        }
      `}</style>

      {/* PAGE HEADING */}

      <div className="admin-page-heading">
        <div className="admin-heading-left">
          <div className="admin-heading-icon">
            <ShieldCheck size={25} />
          </div>

          <div className="admin-heading-text">
            <h1>Admin Dashboard</h1>

            <p>
              Manage staff access and CareTrack administration.
            </p>
          </div>
        </div>

        <button
          className="admin-refresh"
          onClick={loadUsers}
          disabled={loading}
        >
          <RefreshCw size={15} />
          Refresh
        </button>
      </div>

      {/* WELCOME */}

      <section className="admin-welcome">
        <div className="admin-welcome-content">
          <span className="admin-welcome-label">
            <ShieldCheck size={13} />
            Administration Portal
          </span>

          <h2>
            Welcome to CareTrack Administration
          </h2>

          <p>
            Review staff registration requests and manage
            access for nurses and doctors in the CareTrack system.
          </p>
        </div>
      </section>

      {/* ERROR */}

      {error && (
        <div className="admin-error">
          {error}
        </div>
      )}

      {/* STAT CARDS */}

      <div className="admin-stats">
        <div className="admin-stat">
          <div className="admin-stat-icon pending">
            <Clock3 size={21} />
          </div>

          <div>
            <p className="admin-stat-label">
              Pending Requests
            </p>

            <p className="admin-stat-value">
              {users.length}
            </p>
          </div>
        </div>

        <div className="admin-stat">
          <div className="admin-stat-icon nurse">
            <UserRound size={21} />
          </div>

          <div>
            <p className="admin-stat-label">
              Nurse Requests
            </p>

            <p className="admin-stat-value">
              {nurseCount}
            </p>
          </div>
        </div>

        <div className="admin-stat">
          <div className="admin-stat-icon doctor">
            <Stethoscope size={21} />
          </div>

          <div>
            <p className="admin-stat-label">
              Doctor Requests
            </p>

            <p className="admin-stat-value">
              {doctorCount}
            </p>
          </div>
        </div>
      </div>

      {/* APPROVAL CARD */}

      <section className="admin-approval-card">
        <div className="admin-card-header">
          <div className="admin-card-title">
            <div className="admin-card-title-icon">
              <UserCheck size={20} />
            </div>

            <div>
              <h3>
                Staff Registration Requests
              </h3>

              <p>
                Review nurse and doctor accounts awaiting approval.
              </p>
            </div>
          </div>

          <span className="admin-pending-badge">
            {users.length} Pending
          </span>
        </div>

        {/* SEARCH */}

        <div className="admin-search-area">
          <div className="admin-search">
            <Search size={16} />

            <input
              type="text"
              placeholder="Search staff by name, email or role"
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
            />
          </div>
        </div>

        {/* DATA */}

        {loading ? (
          <div className="admin-loading">
            Loading staff registrations...
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="admin-empty">
            <div className="admin-empty-icon">
              <CheckCircle2 size={29} />
            </div>

            <h3>
              No Pending Registrations
            </h3>

            <p>
              There are currently no nurse or doctor accounts
              waiting for approval.
            </p>
          </div>
        ) : (
          <div className="admin-users">
            {filteredUsers.map((user) => (
              <div
                className="admin-user-card"
                key={user.uid}
              >
                <div className="admin-user-info">
                  <div className="admin-avatar">
                    {user.role === "doctor" ? (
                      <Stethoscope size={21} />
                    ) : (
                      <UserRound size={21} />
                    )}
                  </div>

                  <div>
                    <h4 className="admin-user-name">
                      {user.fullName}
                    </h4>

                    <p className="admin-user-email">
                      {user.email}
                    </p>

                    <p className="admin-user-phone">
                      {user.phone}
                    </p>

                    <span
                      className={`admin-role ${user.role}`}
                    >
                      {user.role === "doctor" ? (
                        <Stethoscope size={11} />
                      ) : (
                        <UserRound size={11} />
                      )}

                      {user.role}
                    </span>
                  </div>
                </div>

                <div className="admin-actions">
                  <button
                    className="admin-action admin-approve"
                    onClick={() => approveUser(user.uid)}
                    disabled={processing === user.uid}
                  >
                    <CheckCircle2 size={15} />

                    {processing === user.uid
                      ? "Processing..."
                      : "Approve"}
                  </button>

                  <button
                    className="admin-action admin-reject"
                    onClick={() => rejectUser(user.uid)}
                    disabled={processing === user.uid}
                  >
                    <XCircle size={15} />

                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
