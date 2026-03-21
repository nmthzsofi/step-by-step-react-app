import { StyleSheet } from "react-native";
import { Colors, Typography, Spacing, Radius } from "../../constants/theme";

export default StyleSheet.create({
  scroll: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  inner: {
    paddingBottom: 30,
    gap: Spacing.xl,
  },
  header: {
    alignItems: "center",
    paddingTop: Spacing.xl,
    gap: Spacing.md,
  },
  title: {
    fontSize: Typography.xxxl,
    fontWeight: "700",
    letterSpacing: 0.3,
    color: Colors.textPrimary,
  },
  avatarWrapper: {
    width: 100,
    height: 100,
    borderRadius: 50,
    overflow: "hidden",
    backgroundColor: Colors.backgroundAlt,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarImage: {
    width: 100,
    height: 100,
  },
  avatarPlaceholderIcon: {
    fontSize: 80,
  },
  form: {
    paddingHorizontal: Spacing.base,
    gap: Spacing.lg,
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
  input: {
    flex: 1,
    fontSize: Typography.base,
    color: Colors.textPrimary,
  },
  pickerRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.backgroundAlt,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.xs,
    gap: Spacing.sm,
  },
  pickerLabel: {
    fontSize: Typography.base,
    color: Colors.textPrimary,
  },
  picker: {
    flex: 1,
    color: Colors.textPrimary,
  },
  sliderCard: {
    backgroundColor: Colors.backgroundAlt,
    borderRadius: Radius.md,
    padding: Spacing.base,
    gap: Spacing.md,
  },
  sliderRow: {
    gap: Spacing.xs,
  },
  sliderLabel: {
    fontSize: Typography.sm,
    color: Colors.textPrimary,
    fontWeight: "500",
  },
  slider: {
    width: "100%",
    height: 34,
  },
  dateCard: {
    backgroundColor: Colors.backgroundAlt,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.xs,
  },
  errorText: {
    fontSize: Typography.xs,
    color: Colors.error,
    textAlign: "center",
    paddingHorizontal: Spacing.base,
  },
  primaryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: Radius.lg,
    height: 55,
    marginHorizontal: Spacing.base,
    gap: Spacing.sm,
  },
  primaryButtonText: {
    fontSize: Typography.base,
    fontWeight: "700",
    color: Colors.textInverse,
  },
});
