import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type FormEvent,
} from "react";
import { onValue, ref, update } from "firebase/database";
import { Plus, Save, X } from "lucide-react";

import { auth, db } from "../../lib/firebase";
import {
  assignDoctorToPatient,
  type HospitalUser,
  type PatientDoctorAssignment,
} from "../../services/hospital";
import { createManagedUser } from "../../services/adminUsers";

type ManagedRole = "patient" | "doctor" | "nurse";

const fieldStyle: CSSProperties = {
  boxSizing: "border-box",
  width: "100%",
  minHeight: 40,
  border: "1px solid #dce5ea",
  borderRadius: 9,
  padding: "8px 10px",
  color: "#334e60",
  background: "#fff",
  font: "inherit",
};

const labelStyle: CSSProperties = {
  display: "grid",
  gap: 5,
  color: "#536b7b",
  fontSize: 12,
  fontWeight: 700,
};

export default function AdminUserManagement({
  role,
}: {
  role: ManagedRole;
}) {
  const [users, setUsers] = useState<HospitalUser[]>([]);
  const [assignments, setAssignments] = useState<
    Record<string, PatientDoctorAssignment>
  >({});
  const [doctorChoices, setDoctorChoices] = useState<HospitalUser[]>([]);
  const [wardAssignments, setWardAssignments] = useState<
    Record<string, Record<string, boolean>>
  >({});
  const [wardNames, setWardNames] = useState<Record<string, string>>({});
  const [selectedDoctors, setSelectedDoctors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [search, setSearch] = useState("");
  const [editingUid, setEditingUid] = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [specialization, setSpecialization] = useState("");
  const [department, setDepartment] = useState("");
  const [availability, setAvailability] = useState<"available" | "unavailable">(
    "available"
  );
  const migrationStarted = useRef(false);
  const [active, setActive] = useState(true);
  const [approvalStatus, setApprovalStatus] = useState<
    "approved" | "pending" | "rejected"
  >("approved");

  useEffect(() => {
    let userRecords: Record<string, Omit<HospitalUser, "uid">> | null = null;
    let assignmentRecords: Record<string, PatientDoctorAssignment> | null = null;
    let usersLoaded = false;
    let assignmentsLoaded = role !== "patient";
    const migrateLegacyAssignments = async () => {
      if (
        role !== "patient" ||
        !usersLoaded ||
        !assignmentsLoaded ||
        migrationStarted.current
      ) {
        return;
      }
      migrationStarted.current = true;
      const updatedBy = auth.currentUser?.uid;
      if (!updatedBy) {
        migrationStarted.current = false;
        setError("Sign in as an administrator to migrate existing assignments.");
        return;
      }
      const updates: Record<string, unknown> = {};
      const now = Date.now();
      for (const [patientUid, profile] of Object.entries(userRecords ?? {})) {
        if (profile.role !== "patient") continue;
        const doctorUid =
          profile.assignedDoctorId ??
          assignmentRecords?.[patientUid]?.doctorUid;
        if (!doctorUid) continue;
        const doctor = userRecords?.[doctorUid];
        if (
          doctor?.role !== "doctor" ||
          doctor.active !== true ||
          doctor.approvalStatus !== "approved"
        ) {
          continue;
        }
        updates[`users/${patientUid}/assignedDoctorId`] = doctorUid;
        updates[`doctorPatients/${doctorUid}/${patientUid}`] = true;
        const legacyDoctorUid = assignmentRecords?.[patientUid]?.doctorUid;
        if (legacyDoctorUid && legacyDoctorUid !== doctorUid) {
          updates[`doctorPatients/${legacyDoctorUid}/${patientUid}`] = null;
        }
        if (legacyDoctorUid !== doctorUid) {
          updates[`patientDoctors/${patientUid}`] = {
            doctorUid,
            updatedAt: now,
            updatedBy,
          } satisfies PatientDoctorAssignment;
        }
      }
      if (Object.keys(updates).length) {
        try {
          await update(ref(db), updates);
        } catch (migrationError) {
          migrationStarted.current = false;
          console.error("Could not migrate existing doctor assignments:", migrationError);
          setError(
            migrationError instanceof Error
              ? `Could not migrate doctor assignments: ${migrationError.message}`
              : "Could not migrate doctor assignments."
          );
        }
      }
    };
    const unsubscribeUsers = onValue(
      ref(db, "users"),
      (snapshot) => {
        const values = snapshot.val() as
          | Record<string, Omit<HospitalUser, "uid">>
          | null;
        userRecords = values ?? {};
        usersLoaded = true;
        const allUsers = values
          ? Object.entries(values).map(([uid, value]) => ({
              uid,
              ...value,
            }))
          : [];
        setUsers(allUsers);
        setDoctorChoices(
          allUsers.filter(
            (user) =>
              user.role === "doctor" &&
              user.active &&
              user.approvalStatus === "approved"
          )
        );
        setLoading(false);
        void migrateLegacyAssignments();
      },
      (loadError) => {
        console.error("Could not load user accounts:", loadError);
        setError(`Could not load user accounts: ${loadError.message}`);
        setLoading(false);
      }
    );

    const unsubscribeAssignments =
      role === "patient"
        ? onValue(
            ref(db, "patientDoctors"),
            (snapshot) => {
              const values = snapshot.val() as
                | Record<string, PatientDoctorAssignment>
                | null;
              assignmentRecords = values ?? {};
              assignmentsLoaded = true;
              setAssignments(values ?? {});
              void migrateLegacyAssignments();
            },
            (loadError) => {
              console.error("Could not load doctor assignments:", loadError);
              setError(`Could not load doctor assignments: ${loadError.message}`);
            }
          )
        : () => undefined;

    const unsubscribeWardAssignments =
      role === "nurse"
        ? onValue(
            ref(db, "wardNurses"),
            (snapshot) => {
              setWardAssignments(
                (snapshot.val() as
                  | Record<string, Record<string, boolean>>
                  | null) ?? {}
              );
            },
            (loadError) => {
              console.error("Could not load nurse ward assignments:", loadError);
              setError(
                `Could not load nurse ward assignments: ${loadError.message}`
              );
            }
          )
        : () => undefined;
    const unsubscribeWards =
      role === "nurse"
        ? onValue(
            ref(db, "wards"),
            (snapshot) => {
              const wards = snapshot.val() as
                | Record<string, { name?: string }>
                | null;
              setWardNames(
                Object.fromEntries(
                  Object.entries(wards ?? {}).map(([wardId, ward]) => [
                    wardId,
                    ward.name ?? "Unnamed ward",
                  ])
                )
              );
            },
            (loadError) => {
              console.error("Could not load ward names:", loadError);
              setError(`Could not load ward names: ${loadError.message}`);
            }
          )
        : () => undefined;

    return () => {
      unsubscribeUsers();
      unsubscribeAssignments();
      unsubscribeWardAssignments();
      unsubscribeWards();
    };
  }, [role]);

  const filteredUsers = useMemo(() => {
    const query = search.trim().toLowerCase();
    return users
      .filter((user) => user.role === role)
      .filter((user) => {
        if (!query) return true;
        return [user.fullName, user.email, user.phone, user.specialization]
          .some((value) => value?.toLowerCase().includes(query));
      })
      .sort((a, b) => a.fullName.localeCompare(b.fullName));
  }, [users, role, search]);

  const title =
    role === "doctor" ? "Doctors" : role === "nurse" ? "Nurses" : "Patients";

  function resetForm() {
    setEditingUid("");
    setFullName("");
    setEmail("");
    setPhone("");
    setPassword("");
    setSpecialization("");
    setDepartment("");
    setAvailability("available");
    setActive(true);
    setApprovalStatus("approved");
  }

  function editUser(user: HospitalUser) {
    setEditingUid(user.uid);
    setFullName(user.fullName ?? "");
    setEmail(user.email ?? "");
    setPhone(user.phone ?? "");
    setPassword("");
    setSpecialization(user.specialization ?? "");
    setDepartment(user.department ?? "");
    setAvailability(user.availability ?? "available");
    setActive(user.active);
    setApprovalStatus(user.approvalStatus);
    setError("");
    setNotice("");
  }

  async function submitUser(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setNotice("");

    try {
      if (editingUid) {
        await update(ref(db, `users/${editingUid}`), {
          fullName: fullName.trim(),
          phone: phone.trim(),
          active,
          approvalStatus,
          specialization: role === "doctor" ? specialization.trim() : null,
          department: role === "doctor" ? department.trim() || null : null,
          availability: role === "doctor" ? availability : null,
        });
        setNotice(`${title.slice(0, -1)} account updated.`);
      } else {
        await createManagedUser({
          fullName,
          email,
          phone,
          password,
          role,
          specialization,
          department,
          availability,
        });
        setNotice(`${title.slice(0, -1)} account created.`);
      }
      resetForm();
    } catch (submitError) {
      console.error(`Could not save ${role} account:`, submitError);
      setError(
        submitError instanceof Error
          ? submitError.message
          : `Could not save ${role} account.`
      );
    } finally {
      setSaving(false);
    }
  }

  async function saveDoctorAssignment(patientUid: string) {
    setSaving(true);
    setError("");
    setNotice("");
    try {
      await assignDoctorToPatient(
        patientUid,
        selectedDoctors[patientUid] || null
      );
      setNotice("Patient's doctor assignment saved.");
    } catch (assignmentError) {
      console.error("Could not assign doctor to patient:", assignmentError);
      setError(
        assignmentError instanceof Error
          ? assignmentError.message
          : "Could not save doctor assignment."
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div style={{ padding: 22, maxWidth: 1400, margin: "0 auto" }}>
      <header style={{ marginBottom: 22 }}>
        <h1 style={{ margin: 0, color: "#17324d", fontSize: 23 }}>{title}</h1>
        <p style={{ margin: "4px 0 0", color: "#8293a0", fontSize: 12 }}>
          Create, update, and manage {title.toLowerCase()} accounts in Firebase.
        </p>
      </header>
      <section className="panel" style={{ padding: 18, marginBottom: 16 }}>
        <h2 style={{ margin: "0 0 14px", color: "#17324d", fontSize: 17 }}>
          {editingUid ? `Edit ${title.slice(0, -1)}` : `Create ${role} account`}
        </h2>
        <form
          onSubmit={submitUser}
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))",
            gap: 12,
            alignItems: "end",
          }}
        >
          <label style={labelStyle}>
            Full name
            <input
              style={fieldStyle}
              value={fullName}
              onChange={(event) => setFullName(event.target.value)}
              required
            />
          </label>
          {!editingUid && (
            <label style={labelStyle}>
              Email
              <input
                style={fieldStyle}
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
            </label>
          )}
          <label style={labelStyle}>
            Phone
            <input
              style={fieldStyle}
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              required
            />
          </label>
          {role === "doctor" && (
            <label style={labelStyle}>
              Specialization
              <input
                style={fieldStyle}
                value={specialization}
                onChange={(event) => setSpecialization(event.target.value)}
                placeholder="e.g. Cardiology"
                required
              />
            </label>
          )}
          {role === "doctor" && (
            <>
              <label style={labelStyle}>
                Department
                <input
                  style={fieldStyle}
                  value={department}
                  onChange={(event) => setDepartment(event.target.value)}
                  placeholder="e.g. Cardiology"
                />
              </label>
              <label style={labelStyle}>
                Availability
                <select
                  style={fieldStyle}
                  value={availability}
                  onChange={(event) =>
                    setAvailability(
                      event.target.value as "available" | "unavailable"
                    )
                  }
                >
                  <option value="available">Available</option>
                  <option value="unavailable">Unavailable</option>
                </select>
              </label>
            </>
          )}
          {!editingUid && (
            <label style={labelStyle}>
              Temporary password
              <input
                style={fieldStyle}
                type="password"
                minLength={8}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
              />
            </label>
          )}
          {editingUid && (
            <>
              <label style={labelStyle}>
                Approval
                <select
                  style={fieldStyle}
                  value={approvalStatus}
                  onChange={(event) =>
                    setApprovalStatus(
                      event.target.value as "approved" | "pending" | "rejected"
                    )
                  }
                >
                  <option value="approved">Approved</option>
                  <option value="pending">Pending</option>
                  <option value="rejected">Rejected</option>
                </select>
              </label>
              <label style={{ ...labelStyle, gridTemplateColumns: "auto 1fr", alignItems: "center" }}>
                <input
                  type="checkbox"
                  checked={active}
                  onChange={(event) => setActive(event.target.checked)}
                />
                Active account
              </label>
            </>
          )}
          <div style={{ display: "flex", gap: 8 }}>
            <button type="submit" disabled={saving} className="primary-button">
              {editingUid ? <Save size={15} /> : <Plus size={15} />}
              {saving ? "Saving..." : editingUid ? "Save changes" : "Create account"}
            </button>
            {editingUid && (
              <button type="button" onClick={resetForm} className="secondary-button">
                <X size={15} />
                Cancel
              </button>
            )}
          </div>
        </form>
        {error && <p role="alert" style={{ color: "#b42318", marginBottom: 0 }}>{error}</p>}
        {notice && <p role="status" style={{ color: "#16804b", marginBottom: 0 }}>{notice}</p>}
      </section>

      <section className="panel" style={{ padding: 16 }}>
        <div style={{ display: "flex", gap: 10, marginBottom: 14 }}>
          <input
            style={{ ...fieldStyle, maxWidth: 420 }}
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder={`Search ${title.toLowerCase()}...`}
            aria-label={`Search ${title.toLowerCase()}`}
          />
        </div>
        {loading ? (
          <p>Loading {title.toLowerCase()}...</p>
        ) : filteredUsers.length === 0 ? (
          <p>No {title.toLowerCase()} accounts found.</p>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr style={{ textAlign: "left", color: "#718491" }}>
                  <th style={{ padding: 10 }}>Name / Specialty</th>
                  <th style={{ padding: 10 }}>Email</th>
                  <th style={{ padding: 10 }}>Phone</th>
                  <th style={{ padding: 10 }}>Status</th>
                  {role === "patient" && <th style={{ padding: 10 }}>Assigned doctor</th>}
                  {role === "nurse" && <th style={{ padding: 10 }}>Assigned wards</th>}
                  <th style={{ padding: 10 }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => {
                  const assignedDoctor =
                    selectedDoctors[user.uid] ??
                    user.assignedDoctorId ??
                    assignments[user.uid]?.doctorUid ??
                    "";
                  return (
                    <tr key={user.uid} style={{ borderTop: "1px solid #edf1f4" }}>
                      <td style={{ padding: 10 }}>
                        <strong>{user.fullName}</strong>
                        {role === "doctor" && (
                          <span style={{ display: "block", color: "#718491", marginTop: 3 }}>
                            {[
                              user.specialization || "Specialization not set",
                              user.department || "Department not set",
                              user.availability === "unavailable"
                                ? "Unavailable"
                                : "Available",
                            ].join(" · ")}
                          </span>
                        )}
                      </td>
                      <td style={{ padding: 10 }}>{user.email}</td>
                      <td style={{ padding: 10 }}>{user.phone}</td>
                      <td style={{ padding: 10 }}>
                        {user.approvalStatus} · {user.active ? "Active" : "Inactive"}
                      </td>
                      {role === "patient" && (
                        <td style={{ padding: 10, minWidth: 210 }}>
                          <select
                            style={fieldStyle}
                            aria-label={`Doctor for ${user.fullName}`}
                            value={assignedDoctor}
                            onChange={(event) =>
                              setSelectedDoctors((current) => ({
                                ...current,
                                [user.uid]: event.target.value,
                              }))
                            }
                          >
                            <option value="">Unassigned</option>
                            {doctorChoices.map((doctor) => (
                              <option key={doctor.uid} value={doctor.uid}>
                                {doctor.fullName} · {doctor.specialization || "No specialty"} ·{" "}
                                {doctor.availability === "unavailable"
                                  ? "Unavailable"
                                  : "Available"}{" "}
                                · {doctor.department || "No department"}
                              </option>
                            ))}
                          </select>
                          <button
                            type="button"
                            className="secondary-button"
                            disabled={
                              saving ||
                              assignedDoctor ===
                                (user.assignedDoctorId ??
                                  assignments[user.uid]?.doctorUid ??
                                  "")
                            }
                            onClick={() => saveDoctorAssignment(user.uid)}
                            style={{ marginTop: 6 }}
                          >
                            <Save size={14} /> Save assignment
                          </button>
                        </td>
                      )}
                      {role === "nurse" && (
                        <td style={{ padding: 10 }}>
                          {Object.keys(wardAssignments[user.uid] ?? {})
                            .filter((wardId) => wardAssignments[user.uid][wardId])
                            .map((wardId) => wardNames[wardId] ?? "Unnamed ward")
                            .join(", ") || "No wards assigned"}
                        </td>
                      )}
                      <td style={{ padding: 10 }}>
                        <button
                          type="button"
                          className="secondary-button"
                          onClick={() => editUser(user)}
                        >
                          Edit
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
