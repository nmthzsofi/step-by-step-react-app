import { create } from "zustand";

export const useAuthStore = create((set) => ({
  // Auth state — mirrors UserManager @Published vars
  firebaseUser: null,
  isLoggedIn: false,
  isEmailVerified: false,
  isProfileLoaded: false,
  hasCompletedOnboarding: false,

  // Profile
  userName: "",
  firstName: "",
  lastName: "",
  sex: "Other",
  birthDate: null,
  userHeight: 170,
  userWeight: 70,
  profileImageURL: "",
  profileImageData: null,
  displayUnit: "Steps", // 'Steps' | 'Kilometers'
  totalStepsAllTime: 0,
  hasTeamPlayerBadge: false,
  currentUserProfile: null,

  // Setters
  setAuthUser: (user) => set({ firebaseUser: user, isLoggedIn: !!user }),
  setProfile: (data) => set(data),
  setProfileLoaded: (val) => set({ isProfileLoaded: val }),
  resetAuth: () =>
    set({
      firebaseUser: null,
      isLoggedIn: false,
      isEmailVerified: false,
      isProfileLoaded: false,
      hasCompletedOnboarding: false,
      userName: "",
      firstName: "",
      lastName: "",
      profileImageURL: "",
      profileImageData: null,
      totalStepsAllTime: 0,
      hasTeamPlayerBadge: false,
      displayUnit: "Steps",
      currentUserProfile: null,
    }),
}));
