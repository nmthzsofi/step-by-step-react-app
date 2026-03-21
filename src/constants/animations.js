import { Easing } from "react-native-reanimated";

export const SPRING_DEFAULT = { damping: 20, stiffness: 100, mass: 0.5 };
export const SPRING_SNAPPY = { damping: 15, stiffness: 140, mass: 0.4 };
export const SPRING_BOUNCY = { damping: 12, stiffness: 110, mass: 0.8 };

export const FADE_TIMING = {
  duration: 350,
  easing: Easing.bezier(0.25, 0.46, 0.45, 0.94),
};

export const STAGGER_DELAY = 70;
