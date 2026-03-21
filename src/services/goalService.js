import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  query,
  where,
  onSnapshot,
  arrayContains,
} from "firebase/firestore";
import { db } from "./firebase";
import { useGoalStore } from "../store/goalStore";
import { useAuthStore } from "../store/authStore";
import { generateShareCode } from "../utils/formatters";

const goalListeners = {};

// ─── Fetch All Goals ───────────────────────────────────────────────────
export const fetchAllGoals = async (userUID) => {
  const q = query(
    collection(db, "goals"),
    where("memberUIDs", "array-contains", userUID),
  );
  const snapshot = await getDocs(q);

  const goals = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
  useGoalStore.getState().setGoals(goals);

  goals.forEach((goal) => listenToGoal(goal.id));
};

// ─── Real-time Goal Listener ───────────────────────────────────────────
export const listenToGoal = (goalId) => {
  if (goalListeners[goalId]) return;

  goalListeners[goalId] = onSnapshot(doc(db, "goals", goalId), (snapshot) => {
    if (!snapshot.exists()) return;
    const updatedGoal = { id: snapshot.id, ...snapshot.data() };

    // Update currentSteps based on goal type
    switch (updatedGoal.type) {
      case "individual":
        updatedGoal.currentSteps = updatedGoal.members?.[0]?.steps ?? 0;
        break;
      case "cooperative":
        updatedGoal.currentSteps = (updatedGoal.members ?? []).reduce(
          (s, m) => s + m.steps,
          0,
        );
        break;
      case "race":
        updatedGoal.currentSteps = Math.max(
          ...(updatedGoal.members ?? []).map((m) => m.steps),
          0,
        );
        break;
    }

    useGoalStore.getState().updateGoal(goalId, updatedGoal);
  });
};

// ─── Add Steps ─────────────────────────────────────────────────────────
export const addSteps = async (steps, userUID) => {
  const { goals, updateGoal, triggerCelebration } = useGoalStore.getState();

  for (const goal of goals) {
    if (goal.isFullyCompleted) continue;

    const memberIndex = goal.members?.findIndex((m) => m.id === userUID);
    if (memberIndex === -1 || memberIndex === undefined) continue;
    if (goal.members[memberIndex].hasFinished) continue;

    const updatedMembers = [...goal.members];
    const oldSteps = updatedMembers[memberIndex].steps;
    updatedMembers[memberIndex] = {
      ...updatedMembers[memberIndex],
      steps: oldSteps + steps,
    };

    if (
      oldSteps < goal.totalSteps &&
      updatedMembers[memberIndex].steps >= goal.totalSteps
    ) {
      updatedMembers[memberIndex].hasFinished = true;
      if (!goal.hasShownCelebration) {
        triggerCelebration(
          goal.type === "race" ? "Champion! 🏆" : "Goal Reached! 🎉",
          goal.type === "race"
            ? `You crossed the finish line first in ${goal.name}!`
            : `Congratulations! You've completed the ${goal.name} journey.`,
        );
      }
    }

    const allFinished = updatedMembers.every((m) => m.steps >= goal.totalSteps);
    updateGoal(goal.id, {
      members: updatedMembers,
      isFullyCompleted: allFinished,
      hasShownCelebration: true,
    });

    await updateStepsInFirebase(goal.id, userUID, steps);
  }
};

// ─── Update Steps in Firestore ─────────────────────────────────────────
const updateStepsInFirebase = async (goalId, memberUID, newSteps) => {
  const goalRef = doc(db, "goals", goalId);
  const snapshot = await getDoc(goalRef);
  if (!snapshot.exists()) return;

  const goal = { id: snapshot.id, ...snapshot.data() };
  const updatedMembers = [...goal.members];
  const memberIndex = updatedMembers.findIndex((m) => m.id === memberUID);
  if (memberIndex === -1) return;

  updatedMembers[memberIndex] = {
    ...updatedMembers[memberIndex],
    steps: updatedMembers[memberIndex].steps + newSteps,
  };

  const allFinished = updatedMembers.every((m) => m.steps >= goal.totalSteps);
  if (allFinished) updatedMembers[memberIndex].hasFinished = true;

  const payload = { members: updatedMembers };
  if (allFinished) payload.isFullyCompleted = true;

  await updateDoc(goalRef, payload);

  // Update lifetime steps
  const userRef = doc(db, "users", memberUID);
  const userSnap = await getDoc(userRef);
  if (userSnap.exists()) {
    const current = userSnap.data().totalStepsAllTime ?? 0;
    await updateDoc(userRef, { totalStepsAllTime: current + newSteps });
  }
};

// ─── Save Goal ─────────────────────────────────────────────────────────
export const saveGoal = async (goal) => {
  const memberUIDs = goal.members.map((m) => m.id).filter(Boolean);
  const goalData = {
    name: goal.name,
    startCoordinate: goal.startCoordinate,
    coordinates: goal.coordinates,
    totalSteps: goal.totalSteps,
    currentSteps: goal.currentSteps ?? 0,
    icon: goal.icon,
    isGroupGoal: goal.isGroupGoal,
    shareCode: goal.shareCode,
    type: goal.type,
    isFullyCompleted: goal.isFullyCompleted ?? false,
    hasShownCelebration: goal.hasShownCelebration ?? false,
    members: goal.members,
    memberUIDs,
  };

  const ref = await addDoc(collection(db, "goals"), goalData);
  const newGoal = { ...goalData, id: ref.id };

  useGoalStore.getState().appendGoal(newGoal);
  useGoalStore
    .getState()
    .setSelectedIndex(useGoalStore.getState().goals.length - 1);
  listenToGoal(ref.id);

  return newGoal;
};

// ─── Join Goal ─────────────────────────────────────────────────────────
export const joinGoal = async (code, userProfile) => {
  const cleanCode = code.trim().toUpperCase();
  const q = query(collection(db, "goals"), where("shareCode", "==", cleanCode));
  const snapshot = await getDocs(q);

  if (snapshot.empty) throw new Error("No goal found for that code.");

  const goalDoc = snapshot.docs[0];
  const goal = { id: goalDoc.id, ...goalDoc.data() };

  if (goal.members?.some((m) => m.id === userProfile.id)) {
    throw new Error("You are already a member of this goal.");
  }

  const updatedMembers = [...(goal.members ?? []), userProfile];
  const memberUIDs = updatedMembers.map((m) => m.id).filter(Boolean);

  await updateDoc(doc(db, "goals", goal.id), {
    members: updatedMembers,
    memberUIDs,
  });

  const newGoal = { ...goal, members: updatedMembers, memberUIDs };
  useGoalStore.getState().appendGoal(newGoal);
  listenToGoal(goal.id);

  return newGoal;
};

// ─── Unsubscribe All Listeners ─────────────────────────────────────────
export const clearGoalListeners = () => {
  Object.values(goalListeners).forEach((unsub) => unsub());
  Object.keys(goalListeners).forEach((k) => delete goalListeners[k]);
};
