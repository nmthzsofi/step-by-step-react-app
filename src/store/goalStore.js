import { create } from "zustand";

export const useGoalStore = create((set, get) => ({
  goals: [],
  selectedGoalIndex: 0,
  showCelebration: false,
  celebrationTitle: "",
  celebrationMessage: "",

  setGoals: (goals) => set({ goals }),
  setSelectedIndex: (i) => set({ selectedGoalIndex: i }),
  updateGoal: (id, data) =>
    set((s) => ({
      goals: s.goals.map((g) => (g.id === id ? { ...g, ...data } : g)),
    })),
  appendGoal: (goal) => set((s) => ({ goals: [...s.goals, goal] })),
  triggerCelebration: (title, message) =>
    set({
      showCelebration: true,
      celebrationTitle: title,
      celebrationMessage: message,
    }),
  dismissCelebration: () => set({ showCelebration: false }),
  clearGoals: () => set({ goals: [], selectedGoalIndex: 0 }),
}));
