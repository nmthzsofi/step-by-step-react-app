import i18n from "../../i18n/i18n";

// Mirrors UserManager computed properties and formatting methods

export const strideLength = (heightCm) => (heightCm * 0.415) / 100;

export const caloriesBurned = (steps, weightKg, heightCm) => {
  const distance = steps * strideLength(heightCm);
  return Math.floor(distance * weightKg * 0.0005);
};

export const formatProgress = (steps, displayUnit, heightCm) => {
  if (displayUnit === "Kilometers") {
    const km = steps * 0.000762;
    return `${km.toFixed(2)} km`;
  }
  return `${steps.toLocaleString()} ${i18n.t("fitness.steps")}`;
};

export const calculateAge = (birthDate) => {
  if (!birthDate) return 0;
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
};

export const earnedBadges = (totalSteps, hasTeamPlayerBadge) => {
  const badges = [];
  if (totalSteps > 0) badges.push("firstSteps");
  if (totalSteps >= 100_000) badges.push("century");
  if (totalSteps >= 1_000_000) badges.push("globetrotter");
  if (hasTeamPlayerBadge) badges.push("teamPlayer");
  return badges;
};

export const generateShareCode = () => {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  return Array.from(
    { length: 6 },
    () => chars[Math.floor(Math.random() * chars.length)],
  ).join("");
};
