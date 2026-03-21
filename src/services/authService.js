import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  reload,
  sendEmailVerification,
} from "firebase/auth";
import {
  doc,
  setDoc,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { auth, db } from "./firebase";
import { useAuthStore } from "../store/authStore";
import { useGoalStore } from "../store/goalStore";
import { fetchProfile } from "./userService";
import { fetchAllGoals } from "./goalService";

// ─── Auth State Listener ───────────────────────────────────────────────
export const initAuthListener = (onReady) => {
  return onAuthStateChanged(auth, async (user) => {
    if (!user) {
      useAuthStore.getState().resetAuth();
      useGoalStore.getState().clearGoals();
      onReady?.();
      return;
    }

    try {
      await reload(user);
    } catch (e) {
      useAuthStore.getState().resetAuth();
      onReady?.();
      return;
    }

    const freshUser = auth.currentUser;

    if (!freshUser?.emailVerified) {
      await firebaseSignOut(auth);
      useAuthStore.getState().resetAuth();
      onReady?.();
      return;
    }

    useAuthStore.getState().setAuthUser(freshUser);
    fetchProfile(freshUser.uid);
    fetchAllGoals(freshUser.uid);
    onReady?.();
  });
};

// ─── Sign Up ───────────────────────────────────────────────────────────
export const signUp = async ({ email, password, username }) => {
  const cleanUsername = username.trim().toLowerCase();

  const available = await isUsernameAvailable(cleanUsername);
  if (!available)
    throw new Error(`Username '@${cleanUsername}' is already taken.`);

  const result = await createUserWithEmailAndPassword(auth, email, password);
  const uid = result.user.uid;

  await setDoc(
    doc(db, "users", uid),
    {
      userName: cleanUsername,
      totalStepsAllTime: 0,
      hasTeamPlayerBadge: false,
      hasCompletedOnboarding: false,
      emailVerified: false,
    },
    { merge: true },
  );

  await sendEmailVerification(result.user);
  useAuthStore.getState().setProfile({ userName: cleanUsername });
};

// ─── Sign In ───────────────────────────────────────────────────────────
export const signIn = async ({ email, password }) => {
  const result = await signInWithEmailAndPassword(auth, email, password);

  if (!result.user.emailVerified) {
    await sendEmailVerification(result.user);
    await firebaseSignOut(auth);
    throw new Error(
      "Please verify your email before logging in. We've resent the verification link.",
    );
  }
};

// ─── Sign Out ──────────────────────────────────────────────────────────
export const signOut = async () => {
  await firebaseSignOut(auth);
};

// ─── Username Check ────────────────────────────────────────────────────
export const isUsernameAvailable = async (username) => {
  const clean = username.trim().toLowerCase();
  if (!clean) return false;

  const q = query(collection(db, "users"), where("userName", "==", clean));
  const snapshot = await getDocs(q);
  return snapshot.empty;
};

// ─── Check & Reload Email Verification ────────────────────────────────
export const checkEmailVerification = async () => {
  await reload(auth.currentUser);
  const verified = auth.currentUser?.emailVerified ?? false;

  if (verified) {
    const uid = auth.currentUser.uid;
    // Write to Firestore as source of truth
    await setDoc(
      doc(db, "users", uid),
      { emailVerified: true },
      { merge: true },
    );
    useAuthStore.getState().setProfile({ isEmailVerified: true });
    fetchProfile(uid);
  }
  return verified;
};

// ─── Resend Verification Email ─────────────────────────────────────────
export const resendVerificationEmail = async () => {
  await sendEmailVerification(auth.currentUser);
};
