import { getApps, initializeApp } from "firebase/app";
import {
  createUserWithEmailAndPassword,
  deleteUser,
  getAuth,
  inMemoryPersistence,
  setPersistence,
  signOut,
  updateProfile,
} from "firebase/auth";
import { ref, update } from "firebase/database";

import { db, firebaseConfig } from "../lib/firebase";
import { createAuditEntry } from "./audit";

type ManagedRole = "patient" | "doctor" | "nurse";

function getProvisioningAuth() {
  const appName = "caretrack-admin-user-provisioning";
  const app =
    getApps().find((candidate) => candidate.name === appName) ??
    initializeApp(firebaseConfig, appName);
  return getAuth(app);
}

export async function createManagedUser(data: {
  fullName: string;
  email: string;
  phone: string;
  password: string;
  role: ManagedRole;
  specialization?: string;
  department?: string;
  availability?: "available" | "unavailable";
}) {
  const fullName = data.fullName.trim();
  const email = data.email.trim().toLowerCase();
  const phone = data.phone.trim();
  const specialization = data.specialization?.trim();
  const department = data.department?.trim();

  if (!fullName || !email || !phone || !data.password) {
    throw new Error("Complete all required account fields.");
  }
  if (data.role === "doctor" && !specialization) {
    throw new Error("Enter the doctor's specialization.");
  }

  const provisioningAuth = getProvisioningAuth();
  await setPersistence(provisioningAuth, inMemoryPersistence);
  const credential = await createUserWithEmailAndPassword(
    provisioningAuth,
    email,
    data.password
  );

  try {
    await updateProfile(credential.user, { displayName: fullName });
    const audit = await createAuditEntry(
      "user_account_created",
      "user",
      credential.user.uid,
      { role: data.role }
    );
    await update(ref(db), {
      [`users/${credential.user.uid}`]: {
        uid: credential.user.uid,
        fullName,
        email,
        phone,
        role: data.role,
        ...(data.role === "doctor"
          ? {
              specialization,
              ...(department ? { department } : {}),
              availability: data.availability ?? "available",
            }
          : {}),
        active: true,
        approvalStatus: "approved",
        createdAt: Date.now(),
      },
      [audit.path]: audit.value,
    });
    return credential.user.uid;
  } catch (error) {
    try {
      await deleteUser(credential.user);
    } catch (cleanupError) {
      console.error(
        "Failed to clean up the newly created Auth account after profile creation failed:",
        cleanupError
      );
    }
    throw error;
  } finally {
    if (provisioningAuth.currentUser?.uid === credential.user.uid) {
      await signOut(provisioningAuth);
    }
  }
}
