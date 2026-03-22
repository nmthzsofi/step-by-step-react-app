import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  reload,
  sendEmailVerification,
  sendPasswordResetEmail,
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
import { fetchAllGoals, clearGoalListeners } from "./goalService";
import i18n from "../../i18n/i18n";

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
    useAuthStore.getState().setAuthUser(freshUser);

    if (freshUser?.emailVerified) {
      await setDoc(doc(db, "users", freshUser.uid), { emailVerified: true }, { merge: true });
      fetchProfile(freshUser.uid);
      fetchAllGoals(freshUser.uid);
    } else {
      useAuthStore.getState().setProfileLoaded(true);
    }

    onReady?.();
  });
};

// ─── Sign Up ───────────────────────────────────────────────────────────
export const signUp = async ({ email, password, username }) => {
  const cleanUsername = username.trim().toLowerCase();

  const available = await isUsernameAvailable(cleanUsername);
  if (!available)
    throw new Error(i18n.t("profile.username_taken", { name: cleanUsername }));

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
    // Do not sign out or throw — initAuthListener will route to /email-verification
  }
};

// ─── Sign Out ──────────────────────────────────────────────────────────
export const signOut = async () => {
  clearGoalListeners();
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

// ─── Password Reset ────────────────────────────────────────────────────
// Always resolves — never reveals whether the email exists.
// A randomised delay (1000–2500 ms) normalises response time so attackers
// cannot distinguish a found vs. not-found email via timing.
export const resetPassword = async (email) => {
  const jitter = 1000 + Math.random() * 1500;
  const delayPromise = new Promise((resolve) => setTimeout(resolve, jitter));
  const firebasePromise = sendPasswordResetEmail(auth, email).catch(() => {});
  await Promise.all([firebasePromise, delayPromise]);
};
