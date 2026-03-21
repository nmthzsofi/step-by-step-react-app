// ─── High-Energy Fitness Design System ──────────────────────────────────────
// Palette: "Electric Peak" — Vibrant Lime, Deep Slate, and Crisp White.
// This aesthetic triggers energy, progress, and clarity.

export const Colors = {
  // Foundations — Clean, bright, and breathable
  background: "#FFFFFF", // Pure white for a "fresh start" feel
  backgroundAlt: "#F4F7F5", // Very subtle minty-grey for depth
  surface: "#FFFFFF",
  surfaceHigh: "#FDFDFD",

  // Action System — The "Dopamine" Colors
  // This "Electric Lime" is the international color for fitness and high-visibility
  accent: "#9fbe03", // Electric Lime / Bolt
  accentDim: "#738902",
  accentGlow: "rgba(185, 221, 4, 0.35)",
  accentBorder: "rgba(177, 212, 2, 0.5)",

  // Supporting "Happy" Palette
  energy: "#FF5C00", // Vivid Orange for "Burn/Heat"
  stamina: "#007AFF", // Bright Blue for "Recovery/Water"

  // Borders & dividers
  border: "#E2E8F0",
  borderMid: "#CBD5E1",
  divider: "#F1F5F9",

  // Typography — High contrast for readability during movement
  textPrimary: "#0F172A", // Deep Navy/Slate (Less harsh than pure black)
  textSecondary: "#475569", // Muted slate
  textTertiary: "#94A3B8", // Light slate
  textAccent: "#8EAB00", // Darker version of lime for text readability
  textInverse: "#FFFFFF", // White text on dark buttons

  // Semantic
  success: "#10B981",
  warning: "#F59E0B",
  error: "#EF4444",
  disabled: "#E2E8F0",

  // Overlays
  overlay: "rgba(15, 23, 42, 0.8)",
};

export const Typography = {
  // Font families — Geometric & Sporty
  // Using 'Inter' or 'System' for body, and a Bold Sans for display.
  // Pro Tip: Apply 'fontStyle: italic' in your components for a "fast" look.
  fontDisplay: "System", // Ideally: 'Archivo Black' or 'Inter ExtraBold'
  fontHeading: "System", // Ideally: 'Inter SemiBold'
  fontBody: "System", // Ideally: 'Inter Regular'
  fontLabel: "System", // Ideally: 'Inter Bold'

  // Sizes (Slightly larger for easy reading while exercising)
  xs: 12,
  sm: 14,
  base: 16,
  md: 18,
  lg: 22,
  xl: 28,
  xxl: 38,
  hero: 64,

  // Letter spacing
  tight: -0.8, // Tighter headings look more "designed"
  normal: 0,
  wide: 1,
  wider: 2,
};

export const Spacing = {
  xxs: 4,
  xs: 8,
  sm: 12,
  md: 16,
  base: 20,
  lg: 24,
  xl: 32,
  xxl: 40,
  huge: 80,
};

export const Radius = {
  sm: 4,
  md: 12, // Softer, "friendlier" corners for a happy app
  lg: 24,
  xl: 32,
  full: 9999,
};

export const Shadows = {
  // Soft, colorful shadows feel more modern and "happy" than grey ones
  sm: {
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  md: {
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  // The "Hero" shadow — makes elements look like they are floating
  glow: {
    shadowColor: "#D4FF00",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 10,
  },
};
