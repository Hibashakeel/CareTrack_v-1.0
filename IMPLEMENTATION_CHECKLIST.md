# CareTrack Hospital Management System Implementation Checklist

## Phase 1 — Firebase relationships and security rules

- [ ] Reuse `users/{uid}` for Firebase Authentication-linked profiles and define consistent role, approval, specialty, and activity fields.
- [ ] Add a patient-to-doctor relationship keyed by patient UID.
- [ ] Add persistent wards and ward-to-nurse assignments.
- [ ] Link admissions to patient UID, ward, room, bed, and assigned doctor; prevent duplicate active bed allocations.
- [ ] Define appointment records with patient, doctor, date/time, status, and audit timestamps.
- [ ] Define recipient-specific notification records with read state and timestamps.
- [ ] Add Realtime Database rules that deny by default, protect role assignment, and authorize reads/writes by role and relationship.
- [ ] Document the required initial administrator bootstrap and rule deployment.
- [ ] Run `npm run build`.

## Phase 2 — Admin management

- [ ] Add complete create/edit/activate/deactivate forms for patient accounts.
- [ ] Add complete create/edit/approve/deactivate forms for doctor accounts, including specialization.
- [ ] Add complete create/edit/approve/deactivate forms for nurse accounts.
- [ ] Assign patients to doctors and nurses to wards.
- [ ] Admit/discharge patients with ward, room, and bed allocation and conflict validation.
- [ ] Replace hardcoded ward, appointment, and admin notification data with Firebase records.
- [ ] Run `npm run build`.

## Phase 3 — Appointments and role-specific notifications

- [ ] Persist appointments from the patient workflow and display the same records to assigned doctors and admins.
- [ ] Use Firebase subscriptions for live role-/assignment-specific notifications.
- [ ] Persist notification read/unread state.
- [ ] Run `npm run build`.

## Phase 4 — Profile and account navigation

- [ ] Add a profile dropdown to the dashboard header.
- [ ] Add a dedicated profile management page backed by Firebase Auth and Realtime Database.
- [ ] Remove profile/account controls from sidebar navigation.
- [ ] Run `npm run build`.

## Phase 5 — Verification

- [ ] Inspect the final diff and confirm routes, database paths, and security rules are consistent.
- [ ] Report build verification separately from Firebase integration checks that require deployed rules and configured project credentials.
