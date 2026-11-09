import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type FormEvent,
} from "react";
import { onValue, ref } from "firebase/database";
import { Save } from "lucide-react";

import { auth, db } from "../../lib/firebase";
import {
  createAdmission,
  dischargeAdmission,
  reconcileHospitalAssignmentIndexes,
  saveWard,
  transferAdmission,
  type Admission,
  type HospitalUser,
  type Ward,
} from "../../services/hospital";

const inputStyle: CSSProperties = {
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

const buttonStyle: CSSProperties = {
  minHeight: 38,
  border: "none",
  borderRadius: 9,
  padding: "0 14px",
  background: "#0056dd",
  color: "#fff",
  fontWeight: 700,
  cursor: "pointer",
};

function formatHospitalOperationError(
  action: string,
  error: unknown
) {
  const message =
    error instanceof Error ? error.message : "Unexpected Firebase error.";
  if (
    message.toLowerCase().includes("permission_denied") ||
    message.toLowerCase().includes("permission denied")
  ) {
    const uid = auth.currentUser?.uid;
    return `${action} was denied by Realtime Database rules. Verify admins/${uid || "<admin-uid>"} is true in Firebase and deploy the current database.rules.json.`;
  }
  return message;
}

function useAdminHospitalData() {
  const [users, setUsers] = useState<HospitalUser[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);
  const [admissions, setAdmissions] = useState<Admission[]>([]);
  const [bedOccupancy, setBedOccupancy] = useState<
    Record<string, Record<string, Record<string, unknown>>>
  >({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const reconciliationStarted = useRef(false);
  const loadFailed = useRef(false);

  useEffect(() => {
    let remaining = 4;
    const markLoaded = () => {
      remaining -= 1;
      if (remaining === 0) setLoading(false);
    };
    const listeners = [
      onValue(
        ref(db, "users"),
        (snapshot) => {
          const records = snapshot.val() as
            | Record<string, Omit<HospitalUser, "uid">>
            | null;
          setUsers(
            Object.entries(records ?? {}).map(([uid, value]) => ({
              uid,
              ...value,
            }))
          );
          markLoaded();
        },
        (loadError) => {
          console.error("Could not load hospital user records:", loadError);
          loadFailed.current = true;
          setError(formatHospitalOperationError("Loading hospital users", loadError));
          markLoaded();
        }
      ),
      onValue(
        ref(db, "wards"),
        (snapshot) => {
          const records = snapshot.val() as
            | Record<string, Omit<Ward, "id">>
            | null;
          setWards(
            Object.entries(records ?? {}).map(([id, value]) => ({
              id,
              ...value,
            }))
          );
          markLoaded();
        },
        (loadError) => {
          console.error("Could not load wards:", loadError);
          loadFailed.current = true;
          setError(formatHospitalOperationError("Loading wards", loadError));
          markLoaded();
        }
      ),
      onValue(
        ref(db, "admissions"),
        (snapshot) => {
          const records = snapshot.val() as
            | Record<string, Omit<Admission, "id">>
            | null;
          setAdmissions(
            Object.entries(records ?? {}).map(([id, value]) => ({
              id,
              ...value,
            }))
          );
          markLoaded();
        },
        (loadError) => {
          console.error("Could not load admissions:", loadError);
          loadFailed.current = true;
          setError(formatHospitalOperationError("Loading admissions", loadError));
          markLoaded();
        }
      ),
      onValue(
        ref(db, "bedOccupancy"),
        (snapshot) => {
          setBedOccupancy(
            (snapshot.val() as
              | Record<string, Record<string, Record<string, unknown>>>
              | null) ?? {}
          );
          markLoaded();
        },
        (loadError) => {
          console.error("Could not load bed availability:", loadError);
          loadFailed.current = true;
          setError(formatHospitalOperationError("Loading bed availability", loadError));
          markLoaded();
        }
      ),
    ];

    return () => listeners.forEach((unsubscribe) => unsubscribe());
  }, []);

  useEffect(() => {
    if (loading || loadFailed.current || reconciliationStarted.current) return;
    reconciliationStarted.current = true;
    reconcileHospitalAssignmentIndexes().catch((reconcileError) => {
      console.error("Could not reconcile hospital assignment indexes:", reconcileError);
      setError(
        `Could not reconcile existing hospital assignments: ${formatHospitalOperationError("Reconciling hospital assignments", reconcileError)}`
      );
    });
  }, [loading]);

  return { users, wards, admissions, bedOccupancy, loading, error, setError };
}

export function AdminWardManagement() {
  const { users, wards, admissions, loading, error, setError } =
    useAdminHospitalData();
  const [wardId, setWardId] = useState("");
  const [name, setName] = useState("");
  const [roomCount, setRoomCount] = useState("1");
  const [bedsPerRoom, setBedsPerRoom] = useState("1");
  const [nurseUids, setNurseUids] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState("");

  const nurses = useMemo(
    () =>
      users.filter(
        (user) =>
          user.role === "nurse" &&
          user.active &&
          user.approvalStatus === "approved"
      ),
    [users]
  );

  function startEdit(ward: Ward) {
    setWardId(ward.id);
    setName(ward.name);
    setRoomCount(String(ward.roomCount));
    setBedsPerRoom(String(ward.bedsPerRoom));
    setNurseUids(
      Object.keys(ward.nurseUids ?? {}).length
        ? Object.keys(ward.nurseUids ?? {})
        : ward.nurseUid
          ? [ward.nurseUid]
          : []
    );
    setNotice("");
    setError("");
  }

  function clearForm() {
    setWardId("");
    setName("");
    setRoomCount("1");
    setBedsPerRoom("1");
    setNurseUids([]);
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setNotice("");
    try {
      await saveWard({
        id: wardId || undefined,
        name,
        roomCount: Number(roomCount),
        bedsPerRoom: Number(bedsPerRoom),
        nurseUids,
      });
      setNotice("Ward saved.");
      clearForm();
    } catch (saveError) {
      console.error("Could not save ward:", saveError);
      setError(formatHospitalOperationError("Saving ward", saveError));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div style={{ padding: 22, maxWidth: 1400, margin: "0 auto" }}>
      <header style={{ marginBottom: 22 }}>
        <h1 style={{ margin: 0, color: "#17324d", fontSize: 23 }}>Wards</h1>
        <p style={{ margin: "4px 0 0", color: "#8293a0", fontSize: 12 }}>
          Manage ward capacity and assigned nurses. Capacity cannot be reduced below occupied beds.
        </p>
      </header>
      <section className="panel" style={{ padding: 18, marginBottom: 16 }}>
        <h2 style={{ margin: "0 0 14px", color: "#17324d", fontSize: 17 }}>
          {wardId ? "Edit ward" : "Create ward"}
        </h2>
        <form
          onSubmit={submit}
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            gap: 12,
            alignItems: "end",
          }}
        >
          <label style={labelStyle}>
            Ward name
            <input style={inputStyle} value={name} onChange={(e) => setName(e.target.value)} required />
          </label>
          <label style={labelStyle}>
            Rooms
            <input style={inputStyle} type="number" min="1" value={roomCount} onChange={(e) => setRoomCount(e.target.value)} required />
          </label>
          <label style={labelStyle}>
            Beds per room
            <input style={inputStyle} type="number" min="1" value={bedsPerRoom} onChange={(e) => setBedsPerRoom(e.target.value)} required />
          </label>
          <label style={labelStyle}>
            Assigned nurses
            <select
              style={{ ...inputStyle, minHeight: 88 }}
              multiple
              value={nurseUids}
              onChange={(event) =>
                setNurseUids(
                  Array.from(event.target.selectedOptions, (option) => option.value)
                )
              }
            >
              {nurses.map((nurse) => (
                <option key={nurse.uid} value={nurse.uid}>{nurse.fullName}</option>
              ))}
            </select>
          </label>
          <div style={{ display: "flex", gap: 8 }}>
            <button type="submit" disabled={saving} style={buttonStyle}>
              <Save size={15} /> {saving ? "Saving..." : "Save ward"}
            </button>
            {wardId && (
              <button type="button" className="secondary-button" onClick={clearForm}>Cancel</button>
            )}
          </div>
        </form>
        {error && <p role="alert" style={{ color: "#b42318" }}>{error}</p>}
        {notice && <p role="status" style={{ color: "#16804b" }}>{notice}</p>}
      </section>

      <section className="panel" style={{ padding: 16 }}>
        <h2 style={{ marginTop: 0, color: "#17324d", fontSize: 17 }}>Ward directory</h2>
        {loading ? <p>Loading wards...</p> : wards.length === 0 ? <p>No wards created.</p> : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead><tr style={{ textAlign: "left" }}>
                <th style={{ padding: 10 }}>Ward</th><th style={{ padding: 10 }}>Capacity</th>
                <th style={{ padding: 10 }}>Assigned nurses</th><th style={{ padding: 10 }}>Active beds</th>
                <th style={{ padding: 10 }}>Action</th>
              </tr></thead>
              <tbody>{wards.map((ward) => (
                <tr key={ward.id} style={{ borderTop: "1px solid #edf1f4" }}>
                  <td style={{ padding: 10 }}>{ward.name}</td>
                  <td style={{ padding: 10 }}>{ward.roomCount} rooms · {ward.bedsPerRoom} beds/room</td>
                  <td style={{ padding: 10 }}>
                    {(
                      Object.keys(ward.nurseUids ?? {}).length
                        ? Object.keys(ward.nurseUids ?? {})
                        : ward.nurseUid
                          ? [ward.nurseUid]
                          : []
                    )
                      .map((nurseUid) =>
                        nurses.find((nurse) => nurse.uid === nurseUid)?.fullName
                      )
                      .filter(Boolean)
                      .join(", ") || "Unassigned"}
                  </td>
                  <td style={{ padding: 10 }}>{admissions.filter((admission) => admission.wardId === ward.id && admission.status === "active").length}</td>
                  <td style={{ padding: 10 }}><button type="button" className="secondary-button" onClick={() => startEdit(ward)}>Edit</button></td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

export function AdminAdmissionManagement() {
  const { users, wards, admissions, bedOccupancy, loading, error, setError } =
    useAdminHospitalData();
  const [patientUid, setPatientUid] = useState("");
  const [wardId, setWardId] = useState("");
  const [bedKey, setBedKey] = useState("");
  const [transferAdmissionId, setTransferAdmissionId] = useState("");
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState("");
  const patients = users.filter(
    (user) => user.role === "patient" && user.active
  );
  const availableWards = wards.filter((ward) => ward.active);
  const availableBeds = useMemo(
    () =>
      availableWards.flatMap((ward) => {
        const beds = [];
        for (let roomNumber = 1; roomNumber <= ward.roomCount; roomNumber += 1) {
          for (
            let bedNumber = 1;
            bedNumber <= ward.bedsPerRoom;
            bedNumber += 1
          ) {
            if (
              bedOccupancy[ward.id]?.[String(roomNumber)]?.[
                String(bedNumber)
              ] == null
            ) {
              beds.push({
                key: `${ward.id}|${roomNumber}|${bedNumber}`,
                wardId: ward.id,
                room: roomNumber,
                bed: bedNumber,
                wardName: ward.name,
              });
            }
          }
        }
        return beds;
      }),
    [availableWards, bedOccupancy]
  );
  const selectableBeds = availableBeds.filter(
    (availableBed) => !wardId || availableBed.wardId === wardId
  );

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const [selectedWardId, room, bed] = bedKey.split("|");
    if (!selectedWardId || !room || !bed) {
      setError("Select an available bed.");
      return;
    }
    setSaving(true);
    setError("");
    setNotice("");
    try {
      if (transferAdmissionId) {
        const currentAdmission = admissions.find(
          (admission) => admission.id === transferAdmissionId
        );
        if (!currentAdmission) {
          throw new Error("The admission selected for transfer is no longer available.");
        }
        await transferAdmission(currentAdmission, {
          wardId: selectedWardId,
          room,
          bed,
        });
        setNotice("Patient transferred and the bed allocation was updated.");
      } else {
        await createAdmission({
          patientUid,
          wardId: selectedWardId,
          room,
          bed,
        });
        setNotice("Admission created and bed reserved.");
      }
      setPatientUid("");
      setWardId("");
      setBedKey("");
      setTransferAdmissionId("");
    } catch (admissionError) {
      console.error("Could not admit patient:", admissionError);
      setError(
        formatHospitalOperationError("Saving admission", admissionError)
      );
    } finally {
      setSaving(false);
    }
  }

  function startTransfer(admission: Admission) {
    setTransferAdmissionId(admission.id);
    setPatientUid(admission.patientId);
    setWardId("");
    setBedKey("");
    setError("");
    setNotice("");
  }

  async function discharge(admission: Admission) {
    setSaving(true);
    setError("");
    setNotice("");
    try {
      await dischargeAdmission(admission);
      setNotice(`${admission.patientName} was discharged.`);
    } catch (dischargeError) {
      console.error("Could not discharge patient:", dischargeError);
      setError(
        formatHospitalOperationError("Discharging patient", dischargeError)
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div style={{ padding: 22, maxWidth: 1400, margin: "0 auto" }}>
      <header style={{ marginBottom: 22 }}>
        <h1 style={{ margin: 0, color: "#17324d", fontSize: 23 }}>Admissions</h1>
        <p style={{ margin: "4px 0 0", color: "#8293a0", fontSize: 12 }}>
          Admit patients into a specific ward, room, and bed. Occupied beds and duplicate active patient admissions are rejected.
        </p>
      </header>
      <section className="panel" style={{ padding: 18, marginBottom: 16 }}>
        <h2 style={{ margin: "0 0 14px", color: "#17324d", fontSize: 17 }}>
          {transferAdmissionId ? "Transfer patient" : "Admit patient"}
        </h2>
        <form
          onSubmit={submit}
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))",
            gap: 12,
            alignItems: "end",
          }}
        >
          {!transferAdmissionId && <label style={labelStyle}>
            Patient
            <select style={inputStyle} value={patientUid} onChange={(e) => setPatientUid(e.target.value)} required>
              <option value="">Select patient</option>
              {patients.map((patient) => <option key={patient.uid} value={patient.uid}>{patient.fullName}</option>)}
            </select>
          </label>}
          <label style={labelStyle}>
            Ward
            <select
              style={inputStyle}
              value={wardId}
              onChange={(e) => {
                setWardId(e.target.value);
                setBedKey("");
              }}
              required
            >
              <option value="">Select ward</option>
              {availableWards.map((ward) => <option key={ward.id} value={ward.id}>{ward.name}</option>)}
            </select>
          </label>
          <label style={labelStyle}>
            Available bed
            <select
              style={inputStyle}
              value={bedKey}
              onChange={(event) => setBedKey(event.target.value)}
              required
            >
              <option value="">Select an available bed</option>
              {selectableBeds.map((availableBed) => (
                <option key={availableBed.key} value={availableBed.key}>
                  {availableBed.wardName} · Room {availableBed.room} · Bed{" "}
                  {availableBed.bed}
                </option>
              ))}
            </select>
          </label>
          <button type="submit" disabled={saving || !selectableBeds.length} style={buttonStyle}>
            {saving
              ? "Saving..."
              : transferAdmissionId
                ? "Transfer patient"
                : "Create admission"}
          </button>
          {transferAdmissionId && (
            <button
              type="button"
              className="secondary-button"
              onClick={() => {
                setTransferAdmissionId("");
                setPatientUid("");
                setWardId("");
                setBedKey("");
              }}
            >
              Cancel transfer
            </button>
          )}
        </form>
        {!selectableBeds.length && (
          <p role="status" style={{ color: "#8293a0" }}>
            No available beds match the selected ward.
          </p>
        )}
        {error && <p role="alert" style={{ color: "#b42318" }}>{error}</p>}
        {notice && <p role="status" style={{ color: "#16804b" }}>{notice}</p>}
      </section>

      <section className="panel" style={{ padding: 16 }}>
        <h2 style={{ marginTop: 0, color: "#17324d", fontSize: 17 }}>Admission history</h2>
        {loading ? <p>Loading admissions...</p> : admissions.length === 0 ? <p>No admissions recorded.</p> : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead><tr style={{ textAlign: "left" }}>
                <th style={{ padding: 10 }}>Patient</th><th style={{ padding: 10 }}>Ward</th>
                <th style={{ padding: 10 }}>Room / Bed</th><th style={{ padding: 10 }}>Admitted</th>
                <th style={{ padding: 10 }}>Status</th><th style={{ padding: 10 }}>Action</th>
              </tr></thead>
              <tbody>{[...admissions].sort((a, b) => b.admittedAt - a.admittedAt).map((admission) => (
                <tr key={admission.id} style={{ borderTop: "1px solid #edf1f4" }}>
                  <td style={{ padding: 10 }}>{admission.patientName}</td>
                  <td style={{ padding: 10 }}>{admission.ward}</td>
                  <td style={{ padding: 10 }}>{admission.room} / {admission.bed}</td>
                  <td style={{ padding: 10 }}>{new Date(admission.admittedAt).toLocaleString()}</td>
                  <td style={{ padding: 10 }}>{admission.status}</td>
                  <td style={{ padding: 10, display: "flex", gap: 6 }}>
                    {admission.status === "active" && (
                      <>
                        <button type="button" className="secondary-button" disabled={saving} onClick={() => startTransfer(admission)}>Transfer</button>
                        <button type="button" className="secondary-button" disabled={saving} onClick={() => discharge(admission)}>Discharge</button>
                      </>
                    )}
                  </td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
