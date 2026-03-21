import {
  doc,
  setDoc,
  updateDoc,
  onSnapshot,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { auth, db, storage } from "./firebase";
import { useAuthStore } from "../store/authStore";

// ─── Real-time Profile Listener ────────────────────────────────────────
let profileUnsubscribe = null;

export const fetchProfile = (uid) => {
  if (profileUnsubscribe) profileUnsubscribe();

  profileUnsubscribe = onSnapshot(doc(db, "users", uid), (snapshot) => {
    if (!snapshot.exists()) {
      useAuthStore.getState().setProfile({ hasCompletedOnboarding: false });
      return;
    }

    const data = snapshot.data();
    useAuthStore.getState().setProfile({
      userName: data.userName ?? "",
      firstName: data.firstName ?? "",
      lastName: data.lastName ?? "",
      sex: data.sex ?? "Other",
      userHeight: data.height ?? 170,
      userWeight: data.weight ?? 70,
      totalStepsAllTime: data.totalStepsAllTime ?? 0,
      hasTeamPlayerBadge: data.hasTeamPlayerBadge ?? false,
      displayUnit: data.displayUnit ?? "Steps",
      profileImageURL: data.profileImageURL ?? "",
      hasCompletedOnboarding: data.hasCompletedOnboarding ?? false,
      birthDate: data.birthDate?.toDate?.() ?? null,
      isEmailVerified: data.emailVerified ?? false,
      currentUserProfile: {
        id: uid,
        firstName: data.firstName ?? "",
        steps: data.steps ?? 0,
        hasFinished: data.hasFinished ?? false,
      },
    });
    useAuthStore.getState().setProfile({ isProfileLoaded: true });
  });
};

// ─── Save Profile (Member snapshot) ───────────────────────────────────
export const saveProfile = async ({
  uid,
  firstName,
  steps = 0,
  hasFinished = false,
}) => {
  await setDoc(
    doc(db, "users", uid),
    { firstName, steps, hasFinished },
    { merge: true },
  );
  useAuthStore.getState().setProfile({ firstName });
};

// ─── Save User Details ─────────────────────────────────────────────────
export const saveUserDetails = async ({
  uid,
  userName,
  firstName,
  lastName,
  sex,
  birthDate,
  height,
  weight,
  totalStepsAllTime = 0,
  hasTeamPlayerBadge = false,
}) => {
  await setDoc(
    doc(db, "users", uid),
    {
      userName: userName.trim().toLowerCase(),
      firstName,
      lastName,
      sex,
      birthDate: Timestamp.fromDate(new Date(birthDate)),
      height,
      weight,
      totalStepsAllTime,
      hasTeamPlayerBadge,
    },
    { merge: true },
  );
};

// ─── Save Profile Image ────────────────────────────────────────────────
export const saveProfileImage = async (uid, imageUri) => {
  useAuthStore.getState().setProfile({ profileImageURL: imageUri });

  const response = await fetch(imageUri);
  const blob = await response.blob();

  const storageRef = ref(storage, `profile_images/${uid}.jpg`);
  await uploadBytes(storageRef, blob);
  const downloadURL = await getDownloadURL(storageRef);

  await setDoc(
    doc(db, "users", uid),
    { profileImageURL: downloadURL },
    { merge: true },
  );
  useAuthStore.getState().setProfile({ profileImageURL: downloadURL });
  return downloadURL;
};

// ─── Complete Onboarding ───────────────────────────────────────────────
export const completeOnboarding = async (uid) => {
  await setDoc(
    doc(db, "users", uid),
    { hasCompletedOnboarding: true },
    { merge: true },
  );
  useAuthStore.getState().setProfile({ hasCompletedOnboarding: true });
};

// ─── Save Display Unit ─────────────────────────────────────────────────
export const saveDisplayUnit = async (uid, unit) => {
  await updateDoc(doc(db, "users", uid), { displayUnit: unit });
  useAuthStore.getState().setProfile({ displayUnit: unit });
};

// ─── Grant Team Player Badge ───────────────────────────────────────────
export const grantTeamPlayerBadge = async (uid) => {
  await setDoc(
    doc(db, "users", uid),
    { hasTeamPlayerBadge: true },
    { merge: true },
  );
  useAuthStore.getState().setProfile({ hasTeamPlayerBadge: true });
};
