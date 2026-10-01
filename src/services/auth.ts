import {
  browserLocalPersistence,
  browserSessionPersistence,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  sendPasswordResetEmail,
  setPersistence,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  type User,
} from "firebase/auth";

import {
  get,
  ref,
  set,
} from "firebase/database";

import { auth, db } from "../lib/firebase";

export type UserRole =
  | "patient"
  | "nurse"
  | "doctor"
  | "admin";

export interface UserProfile {
  uid: string;
  fullName: string;
  email: string;
  phone: string;
  role: UserRole;
  active: boolean;
  approvalStatus: "approved" | "pending";
  createdAt?: number;
}

function getFirebaseError(error: any): string {
  console.error("Firebase Error:", error);
  console.error("Firebase Error Code:", error?.code);
  console.error("Firebase Error Message:", error?.message);

  switch (error?.code) {
    case "auth/email-already-in-use":
      return "This email is already registered. Please use another email or sign in.";

    case "auth/invalid-email":
      return "Please enter a valid email address.";

    case "auth/weak-password":
      return "Password is too weak. Please use a stronger password.";

    case "auth/invalid-credential":
      return "Incorrect email or password.";

    case "auth/user-not-found":
      return "No account was found with this email.";

    case "auth/wrong-password":
      return "Incorrect password.";

    case "auth/operation-not-allowed":
      return "Email/password authentication is not enabled in Firebase.";

    case "auth/network-request-failed":
      return "Network error. Please check your internet connection.";

    case "auth/too-many-requests":
      return "Too many attempts. Please wait and try again.";

    case "PERMISSION_DENIED":
      return "Database permission denied. Please check Realtime Database rules.";

    default:
      return (
        error?.message ||
        "Something went wrong. Please try again."
      );
  }
}


// ============================================
// REGISTER USER
// ============================================

export async function registerUser(data: {
  fullName: string;
  email: string;
  phone: string;
  password: string;
  role: UserRole;
}) {
  try {
    const fullName = data.fullName.trim();
    const email = data.email.trim().toLowerCase();
    const phone = data.phone.trim();

    console.log("Starting registration...");
    console.log("Email:", email);
    console.log("Role:", data.role);

    // Create Firebase Authentication account
    const credential =
      await createUserWithEmailAndPassword(
        auth,
        email,
        data.password
      );

    console.log(
      "Authentication account created:",
      credential.user.uid
    );

    // Save display name
    await updateProfile(credential.user, {
      displayName: fullName,
    });

    const staff =
      data.role === "nurse" ||
      data.role === "doctor";

    const profile: UserProfile = {
      uid: credential.user.uid,
      fullName,
      email,
      phone,
      role: data.role,
      active: !staff,
      approvalStatus: staff
        ? "pending"
        : "approved",
      createdAt: Date.now(),
    };

    // Save profile to Realtime Database
    await set(
      ref(db, `users/${credential.user.uid}`),
      profile
    );

    console.log(
      "User profile saved to Realtime Database."
    );

    return profile;

  } catch (error: any) {
    console.error(
      "Registration failed:",
      error
    );

    throw new Error(
      getFirebaseError(error)
    );
  }
}


// ============================================
// GET USER PROFILE
// ============================================

export async function getUserProfile(
  uid: string
): Promise<UserProfile | null> {

  try {
    console.log(
      "Loading user profile:",
      uid
    );

    const snapshot = await get(
      ref(db, `users/${uid}`)
    );

    if (!snapshot.exists()) {
      console.warn(
        "User profile does not exist."
      );

      return null;
    }

    const data =
      snapshot.val() as UserProfile;

    console.log(
      "User profile loaded:",
      data
    );

    return data;

  } catch (error: any) {
    console.error(
      "Failed to load user profile:",
      error
    );

    throw new Error(
      getFirebaseError(error)
    );
  }
}


// ============================================
// LOGIN USER
// ============================================

export async function loginUser(
  email: string,
  password: string,
  remember = false
) {

  try {
    console.log(
      "Starting login:",
      email
    );

    // Remember me
    await setPersistence(
      auth,
      remember
        ? browserLocalPersistence
        : browserSessionPersistence
    );

    // Firebase Authentication
    const credential =
      await signInWithEmailAndPassword(
        auth,
        email.trim().toLowerCase(),
        password
      );

    console.log(
      "Authentication successful:",
      credential.user.uid
    );

    // Get profile from Realtime Database
    const profile =
      await getUserProfile(
        credential.user.uid
      );

    if (!profile) {
      await signOut(auth);

      throw new Error(
        "Account profile not found. Please register again."
      );
    }

    // Check account status
    if (!profile.active) {
      await signOut(auth);

      if (
        profile.approvalStatus === "pending"
      ) {
        throw new Error(
          "Your staff registration is pending administrator approval."
        );
      }

      throw new Error(
        "Your account is inactive."
      );
    }

    console.log(
      "Login completed successfully."
    );

    return {
      user: credential.user,
      profile,
    };

  } catch (error: any) {
    console.error(
      "Login failed:",
      error
    );

    if (
      error?.message?.includes(
        "pending administrator"
      )
    ) {
      throw error;
    }

    if (
      error?.message?.includes(
        "Account profile not found"
      )
    ) {
      throw error;
    }

    if (
      error?.message?.includes(
        "account is inactive"
      )
    ) {
      throw error;
    }

    throw new Error(
      getFirebaseError(error)
    );
  }
}


// ============================================
// RESET PASSWORD
// ============================================

export async function resetPassword(
  email: string
) {

  try {
    await sendPasswordResetEmail(
      auth,
      email.trim().toLowerCase()
    );

  } catch (error: any) {
    throw new Error(
      getFirebaseError(error)
    );
  }
}


// ============================================
// LOGOUT
// ============================================

export async function logoutUser() {
  await signOut(auth);
}


// ============================================
// AUTH LISTENER
// ============================================

export function listenToAuth(
  callback: (user: User | null) => void
) {
  return onAuthStateChanged(
    auth,
    callback
  );
}