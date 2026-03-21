export const ActivityTypes = [
  { key: "running", label: "Running", baseMultiplier: 150 },
  { key: "swimming", label: "Swimming", baseMultiplier: 120 },
  { key: "tennis", label: "Tennis", baseMultiplier: 100 },
  { key: "cycling", label: "Cycling", baseMultiplier: 80 },
  { key: "walking", label: "Walking", baseMultiplier: 100 },
];

export const calculateSteps = (activityKey, duration, intensity) => {
  const activity = ActivityTypes.find((a) => a.key === activityKey);
  if (!activity) return 0;
  const intensityFactor = (intensity + 1) * 0.5 + 0.5;
  return Math.floor(duration * activity.baseMultiplier * intensityFactor);
};
