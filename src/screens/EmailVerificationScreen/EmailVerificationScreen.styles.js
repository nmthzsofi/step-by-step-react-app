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
  icon: {
    fontSize: 80,
  },
  textBlock: {
    alignItems: "center",
    gap: Spacing.sm,
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
    textAlign: "center",
    lineHeight: 20,
  },
  actionsBlock: {
    width: "100%",
    gap: Spacing.md,
  },
  primaryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.primary,
    borderRadius: Radius.lg,
    height: 55,
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
  resendButton: {
    alignItems: "center",
    paddingVertical: Spacing.sm,
  },
  resendButtonText: {
    fontSize: Typography.xs,
    color: Colors.primary,
  },
  message: {
    fontSize: Typography.xs,
    color: Colors.textSecondary,
    textAlign: "center",
  },
  signOutButton: {
    paddingBottom: Spacing.sm,
  },
  signOutText: {
    fontSize: Typography.xs,
    color: Colors.error,
  },
});
