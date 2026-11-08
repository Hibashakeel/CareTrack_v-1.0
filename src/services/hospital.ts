import {
  get,
  push,
  ref,
  runTransaction,
  set,
  update,
} from "firebase/database";

import { auth, db } from "../lib/firebase";

export interface HospitalUser {
  uid: string;
  fullName: string;
  email: string;
  phone: string;
  role: "patient" | "nurse" | "doctor" | "admin";
  active: boolean;
  approvalStatus: "approved" | "pending";
  specialization?: string;
  department?: string;
  availability?: "available" | "unavailable";
  assignedDoctorId?: string;
  createdAt?: number;
}

export interface Ward {
  id: string;
  name: string;
  roomCount: number;
  bedsPerRoom: number;
  nurseUid?: string;
  nurseUids?: Record<string, true>;
  active: boolean;
  createdAt?: number;
  updatedAt?: number;
}

export interface Admission {
  id: string;
  patientId: string;
  patientName: string;
  wardId: string;
  ward: string;
  room: string;
  bed: string;
  doctorUid?: string;
  nurseUid?: string;
  nurseUids?: string[];
  status: "active" | "discharged" | "transferred";
  admittedAt: number;
  dischargedAt?: number;
  transferredAt?: number;
  transferToAdmissionId?: string;
  transferFromAdmissionId?: string;
}

export interface PatientDoctorAssignment {
  doctorUid: string;
  updatedAt: number;
  updatedBy: string;
}

export async function assignDoctorToPatient(
  patientUid: string,
  doctorUid: string | null
) {
  const updatedBy = auth.currentUser?.uid;
  if (!updatedBy) throw new Error("You must be signed in to assign a doctor.");

  const [patientSnapshot, existingAssignmentSnapshot] = await Promise.all([
    get(ref(db, `users/${patientUid}`)),
    get(ref(db, `patientDoctors/${patientUid}`)),
  ]);
  if (!patientSnapshot.exists() || patientSnapshot.val().role !== "patient") {
    throw new Error("Select a valid patient account.");
  }

  const patient = patientSnapshot.val() as HospitalUser;
  const previousDoctorUid =
    patient.assignedDoctorId ??
    (existingAssignmentSnapshot.val() as PatientDoctorAssignment | null)
      ?.doctorUid;
  if (doctorUid) {
    const doctorSnapshot = await get(ref(db, `users/${doctorUid}`));
    const doctor = doctorSnapshot.val() as HospitalUser | null;
    if (
      !doctor ||
      doctor.role !== "doctor" ||
      doctor.active !== true ||
      doctor.approvalStatus !== "approved" ||
      doctor.availability === "unavailable"
    ) {
      throw new Error("Select an available, active, approved doctor.");
    }
  }

  const timestamp = Date.now();
  const updates: Record<string, unknown> = {
    [`users/${patientUid}/assignedDoctorId`]: doctorUid,
    [`patientDoctors/${patientUid}`]: doctorUid
      ? {
          doctorUid,
          updatedAt: timestamp,
          updatedBy,
        } satisfies PatientDoctorAssignment
      : null,
    ...(previousDoctorUid && previousDoctorUid !== doctorUid
      ? { [`doctorPatients/${previousDoctorUid}/${patientUid}`]: null }
      : {}),
    ...(doctorUid
      ? { [`doctorPatients/${doctorUid}/${patientUid}`]: true }
      : {}),
  };

  const admissionsSnapshot = await get(ref(db, "admissions"));
  const admissions = admissionsSnapshot.val() as Record<string, Admission> | null;
  for (const [admissionId, admission] of Object.entries(admissions ?? {})) {
    if (admission.patientId === patientUid && admission.status === "active") {
      updates[`admissions/${admissionId}/doctorUid`] = doctorUid;
    }
  }
  await update(ref(db), updates);
}

export async function getDoctorPatients(doctorUid: string) {
  const assignmentsSnapshot = await get(
    ref(db, `doctorPatients/${doctorUid}`)
  );
  const patientIds = Object.entries(
    assignmentsSnapshot.val() as Record<string, boolean> | null ?? {}
  )
    .filter(([, assigned]) => assigned === true)
    .map(([patientUid]) => patientUid);
  const patientRecords = await Promise.all(
    patientIds.map(async (patientUid) => {
      const [patientSnapshot, assignmentSnapshot] = await Promise.all([
        get(ref(db, `users/${patientUid}`)),
        get(ref(db, `patientDoctors/${patientUid}`)),
      ]);
      return {
        patientUid,
        patient: patientSnapshot.val() as HospitalUser | null,
        assignment: assignmentSnapshot.val() as PatientDoctorAssignment | null,
      };
    })
  );
  return patientRecords.flatMap(({ patientUid, patient, assignment }) => {
    return patient?.role === "patient" &&
      patient.active === true &&
      patient.assignedDoctorId === doctorUid &&
      assignment?.doctorUid === doctorUid
      ? [{ ...patient, uid: patientUid }]
      : [];
  });
}

export async function getNursePatients(nurseUid: string) {
  const wardAssignmentsSnapshot = await get(
    ref(db, `wardNurses/${nurseUid}`)
  );
  const wardIds = Object.entries(
    wardAssignmentsSnapshot.val() as Record<string, boolean> | null ?? {}
  )
    .filter(([, assigned]) => assigned === true)
    .map(([wardId]) => wardId);
  const patientSets = await Promise.all(
    wardIds.map((wardId) => get(ref(db, `wardPatients/${wardId}`)))
  );
  const patientIds = new Set<string>();
  for (const snapshot of patientSets) {
    const patients = snapshot.val() as Record<string, boolean> | null;
    for (const [patientUid, assigned] of Object.entries(patients ?? {})) {
      if (assigned === true) patientIds.add(patientUid);
    }
  }
  const patientIdList = [...patientIds];
  const patientRecords = await Promise.all(
    patientIdList.map(async (patientUid) => {
      const admission = await getPatientActiveAdmission(patientUid);
      if (!admission || admission.status !== "active" || !wardIds.includes(admission.wardId)) {
        return { patientUid, patient: null, admission };
      }
      const patientSnapshot = await get(ref(db, `users/${patientUid}`));
      return {
        patientUid,
        patient: patientSnapshot.val() as HospitalUser | null,
        admission,
      };
    })
  );
  return patientRecords.flatMap(({ patientUid, patient, admission }) =>
    patient?.role === "patient" &&
    patient.active === true &&
    admission?.status === "active" &&
    wardIds.includes(admission.wardId)
      ? [{ ...patient, uid: patientUid }]
      : []
  );
}

export async function getPatientActiveAdmission(patientUid: string) {
  const admissionIdSnapshot = await get(
    ref(db, `activeAdmissions/${patientUid}`)
  );
  const admissionId = admissionIdSnapshot.val() as string | null;
  if (!admissionId) return null;
  const admissionSnapshot = await get(ref(db, `admissions/${admissionId}`));
  const admission = admissionSnapshot.val() as Omit<Admission, "id"> | null;
  return admission ? { ...admission, id: admissionId } : null;
}

export async function reconcileHospitalAssignmentIndexes() {
  if (!auth.currentUser?.uid) {
    throw new Error("You must be signed in to reconcile hospital assignments.");
  }
  const [usersSnapshot, wardsSnapshot, admissionsSnapshot, nurseIndexSnapshot] =
    await Promise.all([
      get(ref(db, "users")),
      get(ref(db, "wards")),
      get(ref(db, "admissions")),
      get(ref(db, "wardNurses")),
    ]);
  const users = usersSnapshot.val() as Record<string, HospitalUser> | null;
  const wards = wardsSnapshot.val() as Record<string, Omit<Ward, "id">> | null;
  const admissions = admissionsSnapshot.val() as
    | Record<string, Omit<Admission, "id">>
    | null;
  const nurseIndexes = nurseIndexSnapshot.val() as
    | Record<string, Record<string, boolean>>
    | null;
  const updates: Record<string, unknown> = {};
  const activePatientIds = new Set<string>();
  const activeWardPatients: Record<string, Set<string>> = {};

  for (const [wardId, ward] of Object.entries(wards ?? {})) {
    const nurseUids = Object.keys(ward.nurseUids ?? {}).filter(
      (nurseUid) => ward.nurseUids?.[nurseUid] === true
    );
    if (!nurseUids.length && ward.nurseUid) nurseUids.push(ward.nurseUid);
    if (!ward.nurseUids && nurseUids.length) {
      updates[`wards/${wardId}/nurseUids`] = Object.fromEntries(
        nurseUids.map((nurseUid) => [nurseUid, true])
      );
    }
    for (const nurseUid of Object.keys(nurseIndexes ?? {})) {
      if (nurseIndexes?.[nurseUid]?.[wardId] && !nurseUids.includes(nurseUid)) {
        updates[`wardNurses/${nurseUid}/${wardId}`] = null;
      }
    }
    for (const nurseUid of nurseUids) {
      const nurse = users?.[nurseUid];
      if (
        nurse?.role !== "nurse" ||
        nurse.active !== true ||
        nurse.approvalStatus !== "approved"
      ) {
        throw new Error(`Ward ${ward.name} references an inactive or invalid nurse.`);
      }
      updates[`wardNurses/${nurseUid}/${wardId}`] = true;
    }
  }

  for (const [admissionId, rawAdmission] of Object.entries(admissions ?? {})) {
    if (rawAdmission.status !== "active") {
      if (rawAdmission.wardId && rawAdmission.room && rawAdmission.bed) {
        await runTransaction(
          ref(
            db,
            `bedOccupancy/${rawAdmission.wardId}/${rawAdmission.room}/${rawAdmission.bed}`
          ),
          (current) =>
            current?.admissionId === admissionId ? null : undefined
        );
      }
      continue;
    }
    const admission = { ...rawAdmission, id: admissionId };
    const patient = users?.[admission.patientId];
    const ward = wards?.[admission.wardId];
    if (!patient || patient.role !== "patient" || !ward) {
      throw new Error(`Active admission ${admissionId} references a missing patient or ward.`);
    }
    if (
      !admission.room ||
      !admission.bed ||
      !Number.isInteger(Number(admission.room)) ||
      !Number.isInteger(Number(admission.bed)) ||
      Number(admission.room) < 1 ||
      Number(admission.room) > ward.roomCount ||
      Number(admission.bed) < 1 ||
      Number(admission.bed) > ward.bedsPerRoom
    ) {
      throw new Error(`Active admission ${admissionId} has an invalid room or bed.`);
    }

    const activeAdmissionRef = ref(
      db,
      `activeAdmissions/${admission.patientId}`
    );
    const currentPointer = (
      await get(activeAdmissionRef)
    ).val() as string | null;
    if (currentPointer && currentPointer !== admissionId) {
      throw new Error(`Patient ${patient.fullName} has conflicting active admissions.`);
    }
    const pointerResult = await runTransaction(activeAdmissionRef, (current) =>
      current === null ? admissionId : current === admissionId ? current : undefined
    );
    if (!pointerResult.committed) {
      throw new Error(`Could not reserve the active admission for ${patient.fullName}.`);
    }

    const occupancyRef = ref(
      db,
      `bedOccupancy/${admission.wardId}/${admission.room}/${admission.bed}`
    );
    const occupancyResult = await runTransaction(occupancyRef, (current) =>
      current === null
        ? { admissionId, patientId: admission.patientId }
        : current?.admissionId === admissionId
          ? current
          : undefined
    );
    if (!occupancyResult.committed) {
      if (!currentPointer) {
        await runTransaction(activeAdmissionRef, (current) =>
          current === admissionId ? null : current
        );
      }
      throw new Error(
        `Bed ${admission.room}/${admission.bed} in ${ward.name} is already occupied.`
      );
    }

    const nurseUids = Object.keys(ward.nurseUids ?? {}).filter(
      (nurseUid) => ward.nurseUids?.[nurseUid] === true
    );
    if (!nurseUids.length && ward.nurseUid) nurseUids.push(ward.nurseUid);
    for (const nurseUid of admission.nurseUids ??
      (admission.nurseUid ? [admission.nurseUid] : [])) {
      if (!nurseUids.includes(nurseUid)) {
        updates[`patientNurses/${admission.patientId}/${nurseUid}`] = null;
      }
    }
    for (const nurseUid of nurseUids) {
      updates[`patientNurses/${admission.patientId}/${nurseUid}`] = true;
    }
    updates[`admissions/${admissionId}/nurseUid`] = nurseUids[0] ?? null;
    updates[`admissions/${admissionId}/nurseUids`] = nurseUids;
    updates[`admissions/${admissionId}/doctorUid`] =
      patient.assignedDoctorId ?? null;
    updates[`patientWards/${admission.patientId}`] = {
      wardId: admission.wardId,
      updatedAt: admission.admittedAt ?? Date.now(),
    };
    updates[`wardPatients/${admission.wardId}/${admission.patientId}`] = true;
    activePatientIds.add(admission.patientId);
    (activeWardPatients[admission.wardId] ??= new Set()).add(
      admission.patientId
    );
  }

  for (const [admissionId, admission] of Object.entries(admissions ?? {})) {
    if (admission.status === "active" || activePatientIds.has(admission.patientId)) {
      continue;
    }
    const activeAdmissionRef = ref(
      db,
      `activeAdmissions/${admission.patientId}`
    );
    await runTransaction(activeAdmissionRef, (current) =>
      current === admissionId ? null : current
    );
    updates[`patientWards/${admission.patientId}`] = null;
    for (const nurseUid of admission.nurseUids ??
      (admission.nurseUid ? [admission.nurseUid] : [])) {
      updates[`patientNurses/${admission.patientId}/${nurseUid}`] = null;
    }
  }

  const wardPatientIndexes = await Promise.all(
    Object.keys(wards ?? {}).map(async (wardId) => ({
      wardId,
      snapshot: await get(ref(db, `wardPatients/${wardId}`)),
    }))
  );
  for (const { wardId, snapshot } of wardPatientIndexes) {
    const indexedPatients = snapshot.val() as Record<string, boolean> | null;
    for (const [patientUid, assigned] of Object.entries(indexedPatients ?? {})) {
      if (assigned && !activeWardPatients[wardId]?.has(patientUid)) {
        updates[`wardPatients/${wardId}/${patientUid}`] = null;
      }
    }
  }

  if (Object.keys(updates).length) await update(ref(db), updates);
}

export async function saveWard(input: {
  id?: string;
  name: string;
  roomCount: number;
  bedsPerRoom: number;
  nurseUid?: string;
  nurseUids?: string[];
}) {
  const updatedBy = auth.currentUser?.uid;
  if (!updatedBy) throw new Error("You must be signed in to manage wards.");

  const name = input.name.trim();
  if (!name || input.roomCount < 1 || input.bedsPerRoom < 1) {
    throw new Error("Enter a ward name and positive room and bed counts.");
  }

  const nurseUids = [...new Set(input.nurseUids ?? (input.nurseUid ? [input.nurseUid] : []))];
  const nurseSnapshots = await Promise.all(
    nurseUids.map((nurseUid) => get(ref(db, `users/${nurseUid}`)))
  );
  for (const snapshot of nurseSnapshots) {
    const nurse = snapshot.val() as HospitalUser | null;
    if (
      !nurse ||
      nurse.role !== "nurse" ||
      nurse.active !== true ||
      nurse.approvalStatus !== "approved"
    ) {
      throw new Error("Select only active, approved nurses.");
    }
  }

  const wardRef = input.id ? ref(db, `wards/${input.id}`) : push(ref(db, "wards"));
  const id = input.id ?? wardRef.key;
  if (!id) throw new Error("Could not allocate a ward record.");

  const existingSnapshot = input.id
    ? await get(wardRef)
    : null;
  const existing = existingSnapshot?.val() as Ward | null;
  if (input.id && existing) {
    const occupancySnapshot = await get(
      ref(db, `bedOccupancy/${input.id}`)
    );
    const occupancy = occupancySnapshot.val() as
      | Record<string, Record<string, unknown>>
      | null;
    for (const [room, beds] of Object.entries(occupancy ?? {})) {
      if (Number(room) > input.roomCount) {
        throw new Error("Cannot reduce room capacity while a bed in that room is occupied.");
      }
      for (const bed of Object.keys(beds ?? {})) {
        if (Number(bed) > input.bedsPerRoom) {
          throw new Error("Cannot reduce bed capacity while that bed is occupied.");
        }
      }
    }
  }
  const previousNurseUids = Object.keys(existing?.nurseUids ?? {});
  if (!previousNurseUids.length && existing?.nurseUid) {
    previousNurseUids.push(existing.nurseUid);
  }
  const ward: Omit<Ward, "id"> = {
    name,
    roomCount: input.roomCount,
    bedsPerRoom: input.bedsPerRoom,
    ...(nurseUids.length ? { nurseUid: nurseUids[0] } : {}),
    nurseUids: Object.fromEntries(nurseUids.map((nurseUid) => [nurseUid, true])),
    active: existing?.active ?? true,
    createdAt: existing?.createdAt ?? Date.now(),
    updatedAt: Date.now(),
  };

  const changes: Record<string, unknown> = {
    [`wards/${id}`]: ward,
  };
  for (const nurseUid of previousNurseUids) {
    if (!nurseUids.includes(nurseUid)) {
      changes[`wardNurses/${nurseUid}/${id}`] = null;
    }
  }
  for (const nurseUid of nurseUids) {
    changes[`wardNurses/${nurseUid}/${id}`] = true;
  }
  if (previousNurseUids.join("|") !== nurseUids.join("|")) {
    const admissionsSnapshot = await get(ref(db, "admissions"));
    const admissions = admissionsSnapshot.val() as
      | Record<string, Admission>
      | null;
    for (const [admissionId, admission] of Object.entries(admissions ?? {})) {
      if (
        admission.wardId !== id ||
        admission.status !== "active"
      ) {
        continue;
      }
      const admissionNurseUids =
        admission.nurseUids ??
        (admission.nurseUid ? [admission.nurseUid] : previousNurseUids);
      changes[`admissions/${admissionId}/nurseUid`] = nurseUids[0] ?? null;
      changes[`admissions/${admissionId}/nurseUids`] = nurseUids;
      for (const nurseUid of admissionNurseUids) {
        if (!nurseUids.includes(nurseUid)) {
          changes[`patientNurses/${admission.patientId}/${nurseUid}`] = null;
        }
      }
      for (const nurseUid of nurseUids) {
        changes[`patientNurses/${admission.patientId}/${nurseUid}`] = true;
      }
    }
  }
  await update(ref(db), changes);
}

export async function createAdmission(input: {
  patientUid: string;
  wardId: string;
  room: string;
  bed: string;
}) {
  const updatedBy = auth.currentUser?.uid;
  if (!updatedBy) throw new Error("You must be signed in to admit a patient.");

  const [patientSnapshot, wardSnapshot, assignmentSnapshot] = await Promise.all([
    get(ref(db, `users/${input.patientUid}`)),
    get(ref(db, `wards/${input.wardId}`)),
    get(ref(db, `patientDoctors/${input.patientUid}`)),
  ]);
  const patient = patientSnapshot.val() as HospitalUser | null;
  const ward = wardSnapshot.val() as Omit<Ward, "id"> | null;
  if (!patient || patient.role !== "patient" || patient.active !== true) {
    throw new Error("Select an active patient account.");
  }
  if (!ward || ward.active !== true) {
    throw new Error("Select an active ward.");
  }

  const room = input.room.trim();
  const bed = input.bed.trim();
  const roomNumber = Number(room);
  const bedNumber = Number(bed);
  if (
    !Number.isInteger(roomNumber) ||
    roomNumber < 1 ||
    roomNumber > ward.roomCount ||
    !Number.isInteger(bedNumber) ||
    bedNumber < 1 ||
    bedNumber > ward.bedsPerRoom
  ) {
    throw new Error("Room or bed is outside the selected ward's capacity.");
  }

  const admissionRef = push(ref(db, "admissions"));
  const admissionId = admissionRef.key;
  if (!admissionId) throw new Error("Could not allocate an admission record.");

  const activeAdmissionRef = ref(db, `activeAdmissions/${patient.uid}`);
  const patientReservation = await runTransaction(activeAdmissionRef, (current) =>
    current === null ? admissionId : undefined
  );
  if (!patientReservation.committed) {
    throw new Error("This patient already has an active admission.");
  }

  const occupancyRef = ref(
    db,
    `bedOccupancy/${input.wardId}/${roomNumber}/${bedNumber}`
  );
  let result;
  try {
    result = await runTransaction(occupancyRef, (current) =>
      current === null ? { admissionId, patientId: patient.uid } : undefined
    );
  } catch (error) {
    await runTransaction(activeAdmissionRef, (current) =>
      current === admissionId ? null : current
    );
    throw error;
  }
  if (!result.committed) {
    await runTransaction(activeAdmissionRef, (current) =>
      current === admissionId ? null : current
    );
    throw new Error("That bed is already occupied.");
  }

  const wardNurseUids = Object.keys(ward.nurseUids ?? {});
  if (!wardNurseUids.length && ward.nurseUid) {
    wardNurseUids.push(ward.nurseUid);
  }
  const doctorUid =
    patient.assignedDoctorId ??
    (assignmentSnapshot.val() as PatientDoctorAssignment | null)?.doctorUid;
  const admission: Admission = {
    id: admissionId,
    patientId: patient.uid,
    patientName: patient.fullName,
    wardId: input.wardId,
    ward: ward.name,
    room: String(roomNumber),
    bed: String(bedNumber),
    ...(doctorUid ? { doctorUid } : {}),
    ...(wardNurseUids[0] ? { nurseUid: wardNurseUids[0] } : {}),
    nurseUids: wardNurseUids,
    status: "active",
    admittedAt: Date.now(),
  };

  try {
    await update(ref(db), {
      [`admissions/${admissionId}`]: admission,
      [`patientWards/${patient.uid}`]: {
        wardId: input.wardId,
        updatedAt: admission.admittedAt,
      },
      [`wardPatients/${input.wardId}/${patient.uid}`]: true,
      ...Object.fromEntries(
        wardNurseUids.map((nurseUid) => [
          `patientNurses/${patient.uid}/${nurseUid}`,
          true,
        ])
      ),
    });
  } catch (error) {
    const rollback = await runTransaction(occupancyRef, (current) =>
      current?.admissionId === admissionId ? null : current
    );
    await runTransaction(activeAdmissionRef, (current) =>
      current === admissionId ? null : current
    );
    if (!rollback.committed) {
      console.error("Could not release bed occupancy after admission save failed.");
    }
    throw error;
  }
}

export async function transferAdmission(
  currentAdmission: Admission,
  input: { wardId: string; room: string; bed: string }
) {
  if (!auth.currentUser?.uid) {
    throw new Error("You must be signed in to transfer a patient.");
  }
  if (currentAdmission.status !== "active") {
    throw new Error("Only an active admission can be transferred.");
  }

  const [patientSnapshot, wardSnapshot] = await Promise.all([
    get(ref(db, `users/${currentAdmission.patientId}`)),
    get(ref(db, `wards/${input.wardId}`)),
  ]);
  const patient = patientSnapshot.val() as HospitalUser | null;
  const ward = wardSnapshot.val() as Omit<Ward, "id"> | null;
  if (!patient || patient.role !== "patient" || patient.active !== true) {
    throw new Error("The patient account is not active.");
  }
  if (!ward || ward.active !== true) {
    throw new Error("Select an active ward.");
  }

  const roomNumber = Number(input.room);
  const bedNumber = Number(input.bed);
  if (
    !Number.isInteger(roomNumber) ||
    roomNumber < 1 ||
    roomNumber > ward.roomCount ||
    !Number.isInteger(bedNumber) ||
    bedNumber < 1 ||
    bedNumber > ward.bedsPerRoom
  ) {
    throw new Error("Room or bed is outside the selected ward's capacity.");
  }
  if (
    currentAdmission.wardId === input.wardId &&
    currentAdmission.room === String(roomNumber) &&
    currentAdmission.bed === String(bedNumber)
  ) {
    throw new Error("Choose a different bed for the transfer.");
  }

  const admissionRef = push(ref(db, "admissions"));
  const admissionId = admissionRef.key;
  if (!admissionId) throw new Error("Could not allocate an admission record.");

  const nextOccupancyRef = ref(
    db,
    `bedOccupancy/${input.wardId}/${roomNumber}/${bedNumber}`
  );
  const reservation = await runTransaction(nextOccupancyRef, (current) =>
    current === null ? { admissionId, patientId: patient.uid } : undefined
  );
  if (!reservation.committed) {
    throw new Error("That bed is already occupied.");
  }

  const previousOccupancyRef = ref(
    db,
    `bedOccupancy/${currentAdmission.wardId}/${currentAdmission.room}/${currentAdmission.bed}`
  );
  const transferToken = admissionId;
  const previousOccupancy = await runTransaction(
    previousOccupancyRef,
    (current) => {
      if (
        current?.admissionId === currentAdmission.id &&
        current.transferPending !== true
      ) {
        return { ...current, transferPending: true, transferToken };
      }
      return current;
    }
  );
  if (
    !previousOccupancy.committed ||
    previousOccupancy.snapshot.val()?.transferToken !== transferToken
  ) {
    await runTransaction(nextOccupancyRef, (current) =>
      current?.admissionId === admissionId ? null : current
    );
    throw new Error("The patient's current bed reservation has changed.");
  }

  const activeAdmissionRef = ref(
    db,
    `activeAdmissions/${patient.uid}`
  );
  const pointer = await runTransaction(activeAdmissionRef, (current) =>
    current === currentAdmission.id ? admissionId : current
  );
  if (!pointer.committed || pointer.snapshot.val() !== admissionId) {
    await runTransaction(previousOccupancyRef, (current) =>
      current?.admissionId === currentAdmission.id &&
      current.transferToken === transferToken
        ? { admissionId: currentAdmission.id, patientId: patient.uid }
        : current
    );
    await runTransaction(nextOccupancyRef, (current) =>
      current?.admissionId === admissionId ? null : current
    );
    throw new Error("The active admission changed before transfer.");
  }

  const previousNurseUids =
    currentAdmission.nurseUids ??
    (currentAdmission.nurseUid ? [currentAdmission.nurseUid] : []);
  const nextNurseUids = Object.keys(ward.nurseUids ?? {});
  if (!nextNurseUids.length && ward.nurseUid) {
    nextNurseUids.push(ward.nurseUid);
  }
  const transferredAt = Date.now();
  const nextAdmission: Admission = {
    id: admissionId,
    patientId: patient.uid,
    patientName: patient.fullName,
    wardId: input.wardId,
    ward: ward.name,
    room: String(roomNumber),
    bed: String(bedNumber),
    ...(patient.assignedDoctorId
      ? { doctorUid: patient.assignedDoctorId }
      : {}),
    ...(nextNurseUids[0] ? { nurseUid: nextNurseUids[0] } : {}),
    nurseUids: nextNurseUids,
    status: "active",
    admittedAt: transferredAt,
    transferFromAdmissionId: currentAdmission.id,
  };
  const updates: Record<string, unknown> = {
    [`admissions/${currentAdmission.id}/status`]: "transferred",
    [`admissions/${currentAdmission.id}/transferredAt`]: transferredAt,
    [`admissions/${currentAdmission.id}/transferToAdmissionId`]: admissionId,
    [`admissions/${admissionId}`]: nextAdmission,
    [`patientWards/${patient.uid}`]: {
      wardId: input.wardId,
      updatedAt: transferredAt,
    },
    [`wardPatients/${currentAdmission.wardId}/${patient.uid}`]: null,
    [`wardPatients/${input.wardId}/${patient.uid}`]: true,
  };
  for (const nurseUid of previousNurseUids) {
    updates[`patientNurses/${patient.uid}/${nurseUid}`] = null;
  }
  for (const nurseUid of nextNurseUids) {
    updates[`patientNurses/${patient.uid}/${nurseUid}`] = true;
  }

  try {
    await update(ref(db), updates);
  } catch (error) {
    await runTransaction(activeAdmissionRef, (current) =>
      current === admissionId ? currentAdmission.id : current
    );
    const restoredOccupancy = await runTransaction(
      previousOccupancyRef,
      (current) =>
        current?.admissionId === currentAdmission.id &&
        current.transferToken === transferToken
          ? {
              admissionId: currentAdmission.id,
              patientId: patient.uid,
            }
          : current
    );
    const releasedNewBed = await runTransaction(nextOccupancyRef, (current) =>
      current?.admissionId === admissionId ? null : current
    );
    if (!restoredOccupancy.committed || !releasedNewBed.committed) {
      console.error("Could not fully roll back bed reservations after transfer save failed.");
    }
    throw error;
  }

  const releasedPreviousBed = await runTransaction(
    previousOccupancyRef,
    (current) =>
      current?.admissionId === currentAdmission.id &&
      current.transferToken === transferToken
        ? null
        : current
  );
  if (!releasedPreviousBed.committed) {
    throw new Error(
      "The transfer completed, but the previous bed could not be released. Reconcile hospital assignments to repair occupancy."
    );
  }
}

export async function dischargeAdmission(admission: Admission) {
  if (admission.status !== "active") return;
  const activeAdmissionRef = ref(
    db,
    `activeAdmissions/${admission.patientId}`
  );
  const occupancyRef = ref(
    db,
    `bedOccupancy/${admission.wardId}/${admission.room}/${admission.bed}`
  );
  const dischargeToken = push(ref(db, "activeAdmissions")).key;
  if (!dischargeToken) {
    throw new Error("Could not allocate a discharge reservation.");
  }
  const occupancyRelease = await runTransaction(occupancyRef, (current) => {
    if (
      current?.admissionId === admission.id &&
      current.dischargePending !== true
    ) {
      return { ...current, dischargePending: true, dischargeToken };
    }
    return current;
  });
  if (
    !occupancyRelease.committed ||
    occupancyRelease.snapshot.val()?.dischargeToken !== dischargeToken
  ) {
    throw new Error("The patient's bed reservation changed before discharge.");
  }
  const activeAdmissionRelease = await runTransaction(
    activeAdmissionRef,
    (current) => (current === admission.id ? null : current)
  );
  if (
    !activeAdmissionRelease.committed ||
    activeAdmissionRelease.snapshot.val() !== null
  ) {
    const restored = await runTransaction(occupancyRef, (current) =>
      current?.admissionId === admission.id &&
      current.dischargeToken === dischargeToken
        ? { admissionId: admission.id, patientId: admission.patientId }
        : current
    );
    if (!restored.committed) {
      console.error("Could not restore bed occupancy after discharge reservation failed.");
    }
    throw new Error("The active admission changed before discharge.");
  }

  let nurseUids =
    admission.nurseUids ??
    (admission.nurseUid ? [admission.nurseUid] : []);
  if (!nurseUids.length) {
    const wardSnapshot = await get(ref(db, `wards/${admission.wardId}`));
    const ward = wardSnapshot.val() as Ward | null;
    nurseUids = Object.keys(ward?.nurseUids ?? {});
    if (!nurseUids.length && ward?.nurseUid) nurseUids.push(ward.nurseUid);
  }
  const dischargedAt = Date.now();
  const updates: Record<string, unknown> = {
    [`admissions/${admission.id}/status`]: "discharged",
    [`admissions/${admission.id}/dischargedAt`]: dischargedAt,
    [`wardPatients/${admission.wardId}/${admission.patientId}`]: null,
    [`patientWards/${admission.patientId}`]: null,
  };
  for (const nurseUid of nurseUids) {
    updates[`patientNurses/${admission.patientId}/${nurseUid}`] = null;
  }
  try {
    await update(ref(db), updates);
  } catch (error) {
    const restoredPointer = await runTransaction(
      activeAdmissionRef,
      (current) => (current === null ? admission.id : current)
    );
    const restoredOccupancy = await runTransaction(occupancyRef, (current) =>
      current?.admissionId === admission.id &&
      current.dischargeToken === dischargeToken
        ? { admissionId: admission.id, patientId: admission.patientId }
        : current
    );
    if (!restoredPointer.committed || !restoredOccupancy.committed) {
      console.error("Could not fully roll back admission discharge after save failed.");
    }
    throw error;
  }
  const releasedBed = await runTransaction(occupancyRef, (current) =>
    current?.admissionId === admission.id &&
    current.dischargeToken === dischargeToken
      ? null
      : current
  );
  if (!releasedBed.committed) {
    throw new Error(
      "The patient was discharged, but the bed could not be released. Reconcile hospital assignments to repair occupancy."
    );
  }
}
