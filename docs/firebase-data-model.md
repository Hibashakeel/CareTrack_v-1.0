# Firebase data model and deployment

CareTrack uses Firebase Authentication for identity and Realtime Database for application records. The database uses normalized relationships rather than copying mutable profile data into every record.

| Path | Purpose |
| --- | --- |
| `users/{uid}` | Auth-linked profile, role, approval/activity state, doctor details, and a patient's `assignedDoctorId` |
| `patientDoctors/{patientUid}` | Canonical patient-to-doctor assignment and assignment audit fields |
| `doctorPatients/{doctorUid}/{patientUid}` | Doctor-scoped reverse index for assigned patient lists |
| `patientDailyReports/{patientUid}/{reportId}` | Patient-authored daily health report history |
| `wards/{wardId}` | Ward name, room/bed capacity, active state, and a set of assigned nurse UIDs |
| `wardNurses/{nurseUid}/{wardId}` | Nurse-to-ward lookup index |
| `wardPatients/{wardId}/{patientUid}` | Ward-scoped index for active patients assigned to nurses |
| `admissions/{admissionId}` | Patient, ward, room, bed, doctor/nurse IDs, status, and admission/transfer/discharge timestamps; each transfer creates a new history record |
| `activeAdmissions/{patientUid}` | Transactional pointer preventing a patient from having two active admissions |
| `bedOccupancy/{wardId}/{room}/{bed}` | Transactional reservation preventing two active admissions from using one bed |
| `patientWards/{patientUid}` / `patientNurses/{patientUid}/{nurseUid}` | Patient-side ward/nurse lookup indexes used by database authorization |
| `appointments/{appointmentId}` | Canonical appointment record; patient and doctor indexes reference its key |
| `appointmentsByPatient/{patientUid}/{appointmentId}` / `appointmentsByDoctor/{doctorUid}/{appointmentId}` | Appointment lookup indexes for the patient and assigned doctor |
| `nurseNotes/{patientUid}/{noteId}` | Patient-scoped nursing notes |
| `notifications/{uid}/{notificationId}` | Recipient-specific notification and read state |
| `auditLogs/{logId}` | Append-only authenticated actor, action, record ID, and server timestamp for completed application operations |

## Initial administrator bootstrap

Administrator privileges are deliberately not self-selectable during public registration. Before using the Admin screens, create an administrator Firebase Authentication account through the trusted Firebase Console/Auth workflow, then add its UID in the Realtime Database as `admins/{uid}: true` and create `users/{uid}` with matching `uid`, `fullName`, `email`, `role: "admin"`, `active: true`, and `approvalStatus: "approved"` fields. The `admins` path is not writable by client rules; only an operator with Firebase Console or privileged server access can bootstrap or revoke an administrator.

The client considers a user an administrator only when the authenticated UID is present in `admins/{uid}`. An `admin` role in `users/{uid}` alone does not grant database access. If an Admin screen reports `PERMISSION_DENIED`, verify this bootstrap entry and deploy the current `database.rules.json`; do not work around the denial with broader read/write rules.

## Deploying Realtime Database rules

Review `database.rules.json` against the enabled CareTrack workflows and deploy it to the correct Firebase project. With Firebase CLI configured for that project, run:

```sh
firebase deploy --only database
```

The rules default to deny and require administrator bootstrap before admin-authorized records can be changed. Administrator bootstrap and revocation remain restricted to trusted Firebase Console or privileged server access. Realtime Database rules do not filter list results. Collection reads of `users`, `admissions`, and management indexes are restricted to administrators. Doctors can read a patient only when `users/{patientUid}/assignedDoctorId`, `patientDoctors/{patientUid}/doctorUid`, and `doctorPatients/{doctorUid}/{patientUid}` agree. Nurses can read patient data only when their ward index, patient-to-nurse index, and active-admission pointer agree. Patients can read their own records; user profile writes cannot alter UID, email, role, activity/approval state, or doctor assignment. Admin ward/admission screens reconcile legacy assignment and occupancy indexes on load. Deploy the rules before enabling these workflows, and test them with separate role accounts in a Firebase Emulator or a dedicated non-production project before production deployment.

Daily reports are create-only for their owning patient. Audit events are also append-only and may be created only by the authenticated actor whose role matches their user profile; only administrators can read them. For database operations, the client includes the event in the same multi-location update as the corresponding report, assignment, ward, admission, or account change. Account provisioning spans Firebase Authentication and Realtime Database, so its audit event is recorded after the profile write succeeds.

The admin Patients screen migrates existing `patientDoctors` links to `assignedDoctorId` and `doctorPatients`. The Wards/Admissions screens reconcile legacy single-nurse assignments and active admissions into nurse, ward, and bed indexes. Conflicting active admissions, invalid nurse references, or legacy admissions without a valid ward/room/bed are reported and must be resolved by an administrator before relying on occupancy checks.
