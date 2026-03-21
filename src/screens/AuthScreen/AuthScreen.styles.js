import { StyleSheet } from "react-native";
import { Colors, Typography, Spacing, Radius } from "../../constants/theme";

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  inner: {
    flex: 1,
    paddingHorizontal: Spacing.xxl,
  },
  header: {
    paddingTop: Spacing.huge,
    paddingBottom: Spacing.xl,
    gap: Spacing.sm,
  },
  icon: {
    fontSize: 28,
    marginBottom: Spacing.xs,
  },
  title: {
    fontFamily: Typography.fontDisplay,
    fontSize: Typography.xxxl,
    color: Colors.textPrimary,
    letterSpacing: Typography.tight,
    lineHeight: Typography.xxxl * 1.1,
  },
  accentLine: {
    width: 32,
    height: 1.5,
    backgroundColor: Colors.accent,
    marginTop: Spacing.sm,
    marginBottom: Spacing.md,
  },
  subtitle: {
    fontFamily: Typography.fontBody,
    fontSize: Typography.sm,
    color: Colors.textSecondary,
    letterSpacing: Typography.normal,
  },
  fields: {
    gap: Spacing.lg,
    marginBottom: Spacing.xl,
  },
  fieldRow: {
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    paddingBottom: Spacing.sm,
    gap: Spacing.sm,
  },
  fieldRowError: {
    borderBottomColor: Colors.error,
  },
  fieldIcon: {
    width: 24,
    alignItems: "center",
  },
  input: {
    flex: 1,
    fontFamily: Typography.fontBody,
    fontSize: Typography.base,
    color: Colors.textPrimary,
    paddingVertical: Spacing.sm,
  },
  errorText: {
    fontFamily: Typography.fontBody,
    fontSize: Typography.xs,
    color: Colors.error,
    marginBottom: Spacing.base,
    letterSpacing: Typography.wide,
  },
  primaryButton: {
    backgroundColor: Colors.textPrimary,
    borderRadius: Radius.sm,
    height: 52,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
    marginBottom: Spacing.base,
  },
  primaryButtonDisabled: {
    backgroundColor: Colors.disabled,
  },
  primaryButtonText: {
    fontFamily: Typography.fontLabel,
    fontSize: Typography.xs,
    color: Colors.textInverse,
    letterSpacing: Typography.widest,
  },
  switchButton: {
    alignItems: "center",
    paddingVertical: Spacing.base,
  },
  switchButtonText: {
    fontFamily: Typography.fontBody,
    fontSize: Typography.sm,
    color: Colors.textSecondary,
  },
});
