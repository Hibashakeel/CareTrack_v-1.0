import { get, push, ref, serverTimestamp } from "firebase/database";

import { auth, db } from "../lib/firebase";

export interface AuditEntry {
  actorUid: string;
  actorName: string;
  actorRole: string;
  action: string;
  recordType: string;
  recordId: string;
  createdAt: object;
  details?: Record<string, string | number | boolean | null>;
}

export async function createAuditEntry(
  action: string,
  recordType: string,
  recordId: string,
  details?: Record<string, string | number | boolean | null>
) {
  const actor = auth.currentUser;
  if (!actor) throw new Error("You must be signed in to record this action.");

  const profileSnapshot = await get(ref(db, `users/${actor.uid}`));
  const entryRef = push(ref(db, "auditLogs"));
  const profile = profileSnapshot.val() as
    | { fullName?: string; role?: string }
    | null;
  if (!profile?.role || !entryRef.key) {
    throw new Error("The signed-in user's audit identity could not be verified.");
  }

  const entry: AuditEntry = {
    actorUid: actor.uid,
    actorName: profile.fullName || actor.displayName || actor.email || actor.uid,
    actorRole: profile.role,
    action,
    recordType,
    recordId,
    createdAt: serverTimestamp(),
    ...(details ? { details } : {}),
  };

  return {
    path: `auditLogs/${entryRef.key}`,
    value: entry,
  };
}
