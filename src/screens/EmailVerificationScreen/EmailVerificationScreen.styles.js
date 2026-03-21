import { StyleSheet } from "react-native";
import { Colors, Typography, Spacing, Radius } from "../../constants/theme";

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    padding: Spacing.base,
  },
  inner: {
    flex: 1,
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: Spacing.xl,
  },
  centerBlock: {
    alignItems: "center",
    gap: Spacing.xl,
    width: "100%",
  },
  iconWrapper: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.accentGlow,
    borderWidth: 1,
    borderColor: Colors.accentBorder,
    alignItems: "center",
    justifyContent: "center",
  },
  textBlock: {
    alignItems: "center",
    gap: Spacing.sm,
  },
  title: {
    fontFamily: Typography.fontDisplay,
    fontSize: Typography.xxl,
    color: Colors.textPrimary,
    letterSpacing: Typography.tight,
  },
  subtitle: {
    fontFamily: Typography.fontBody,
    fontSize: Typography.sm,
    color: Colors.textSecondary,
    textAlign: "center",
    lineHeight: 22,
  },
  actionsBlock: {
    width: "100%",
    gap: Spacing.md,
  },
  primaryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.textPrimary,
    borderRadius: Radius.sm,
    height: 52,
    gap: Spacing.sm,
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
  resendButton: {
    alignItems: "center",
    paddingVertical: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.sm,
    height: 52,
    justifyContent: "center",
  },
  resendButtonText: {
    fontFamily: Typography.fontLabel,
    fontSize: Typography.xs,
    color: Colors.textSecondary,
    letterSpacing: Typography.wider,
  },
  message: {
    fontFamily: Typography.fontBody,
    fontSize: Typography.xs,
    color: Colors.textSecondary,
    textAlign: "center",
  },
  signOutButton: {
    paddingBottom: Spacing.sm,
  },
  signOutText: {
    fontFamily: Typography.fontBody,
    fontSize: Typography.xs,
    color: Colors.error,
  },
});
