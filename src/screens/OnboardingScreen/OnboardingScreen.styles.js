import { StyleSheet } from "react-native";
import { Colors, Typography, Spacing, Radius } from "../../constants/theme";

export default StyleSheet.create({
  scroll: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  inner: {
    paddingBottom: Spacing.xxxl,
    paddingHorizontal: Spacing.xxl,
    gap: Spacing.xl,
  },
  header: {
    alignItems: "center",
    paddingTop: Spacing.huge,
    gap: Spacing.md,
  },
  title: {
    fontFamily: Typography.fontDisplay,
    fontSize: Typography.xxxl,
    color: Colors.textPrimary,
    letterSpacing: Typography.tight,
  },
  accentLine: {
    width: 32,
    height: 1.5,
    backgroundColor: Colors.accent,
  },
  avatarWrapper: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 1.5,
    borderColor: Colors.accentBorder,
    backgroundColor: Colors.surfaceHigh,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  avatarImage: {
    width: 100,
    height: 100,
  },
  avatarPlaceholderIcon: {
    fontSize: 44,
  },
  form: {
    gap: Spacing.lg,
  },
  fieldRow: {
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    paddingBottom: Spacing.sm,
    gap: Spacing.sm,
  },
  input: {
    flex: 1,
    fontFamily: Typography.fontBody,
    fontSize: Typography.base,
    color: Colors.textPrimary,
    paddingVertical: Spacing.sm,
  },
  pickerRow: {
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    gap: Spacing.sm,
  },
  pickerLabel: {
    fontFamily: Typography.fontBody,
    fontSize: Typography.base,
    color: Colors.textSecondary,
  },
  picker: {
    flex: 1,
    color: Colors.textPrimary,
  },
  dateCard: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    paddingVertical: Spacing.sm,
  },
  sliderCard: {
    backgroundColor: Colors.surfaceHigh,
    borderRadius: Radius.md,
    padding: Spacing.base,
    gap: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  sliderRow: {
    gap: Spacing.xs,
  },
  sliderLabel: {
    fontFamily: Typography.fontBodyMedium,
    fontSize: Typography.sm,
    color: Colors.textPrimary,
  },
  slider: {
    width: "100%",
    height: 34,
  },
  errorText: {
    fontFamily: Typography.fontBody,
    fontSize: Typography.xs,
    color: Colors.error,
    textAlign: "center",
  },
  primaryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: Radius.sm,
    height: 52,
    gap: Spacing.sm,
  },
  primaryButtonText: {
    fontFamily: Typography.fontLabel,
    fontSize: Typography.xs,
    color: Colors.textInverse,
    letterSpacing: Typography.widest,
  },
});
