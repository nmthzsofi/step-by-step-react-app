import { StyleSheet } from "react-native";
import { Colors, Typography, Spacing, Radius } from "../../constants/theme";

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  inner: {
    flex: 1,
    paddingHorizontal: Spacing.base,
  },
  header: {
    alignItems: "center",
    paddingTop: 50,
    gap: Spacing.sm,
  },
  icon: {
    fontSize: 80,
  },
  title: {
    fontSize: Typography.xxxl,
    fontWeight: "700",
    letterSpacing: 0.3,
    color: Colors.textPrimary,
  },
  subtitle: {
    fontSize: Typography.sm,
    color: Colors.textSecondary,
  },
  fields: {
    gap: Spacing.md,
    marginTop: Spacing.xl,
  },
  fieldRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.backgroundAlt,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.md,
    gap: Spacing.sm,
  },
  fieldRowError: {
    borderWidth: 1.5,
    borderColor: "rgba(255,59,48,0.5)",
  },
  fieldIcon: {
    width: 25,
    alignItems: "center",
  },
  input: {
    flex: 1,
    fontSize: Typography.base,
    color: Colors.textPrimary,
  },
  errorText: {
    fontSize: Typography.xs,
    color: Colors.error,
    textAlign: "center",
    paddingHorizontal: Spacing.base,
    marginTop: Spacing.xs,
  },
  primaryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.primary,
    borderRadius: Radius.lg,
    height: 55,
    marginTop: Spacing.base,
    gap: Spacing.sm,
  },
  primaryButtonDisabled: {
    opacity: 0.6,
  },
  primaryButtonText: {
    fontSize: Typography.base,
    fontWeight: "700",
    color: Colors.textInverse,
  },
  switchButton: {
    alignItems: "center",
    marginTop: Spacing.base,
    paddingVertical: Spacing.sm,
  },
  switchButtonText: {
    fontSize: Typography.xs,
    color: Colors.primary,
  },
});
