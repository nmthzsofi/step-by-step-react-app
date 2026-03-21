import { StyleSheet } from "react-native";
import {
  Colors,
  Typography,
  Spacing,
  Radius,
  Shadows,
} from "../../constants/theme";

export default StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.backgroundAlt },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 100 },

  // Header section
  headerSection: {
    backgroundColor: Colors.surface,
    alignItems: "center",
    paddingTop: Spacing.huge,
    paddingBottom: Spacing.xl,
    gap: Spacing.md,
  },
  avatarWrapper: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 1.5,
    borderColor: Colors.accentBorder,
  },
  avatar: { width: 96, height: 96, borderRadius: 48 },
  avatarPlaceholder: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: Colors.surfaceHigh,
    alignItems: "center",
    justifyContent: "center",
    ...Shadows.sm,
  },
  avatarPlaceholderText: { fontSize: 40 },
  editBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: Colors.surface,
    borderRadius: 15,
    width: 28,
    height: 28,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: Colors.accentBorder,
    ...Shadows.sm,
  },
  editBadgeText: { fontSize: 13 },
  fullName: {
    fontFamily: Typography.fontDisplay,
    fontSize: Typography.xl,
    color: Colors.textPrimary,
    letterSpacing: Typography.tight,
  },
  username: {
    fontFamily: Typography.fontBody,
    fontSize: Typography.sm,
    color: Colors.textAccent,
    letterSpacing: Typography.wide,
  },

  // Section
  section: { marginTop: Spacing.base },
  sectionHeader: {
    fontFamily: Typography.fontLabel,
    fontSize: Typography.xs,
    color: Colors.textSecondary,
    letterSpacing: Typography.widest,
    paddingHorizontal: Spacing.base,
    paddingBottom: Spacing.xs,
    paddingTop: Spacing.base,
  },

  // Achievement tiles
  tilesRow: {
    flexDirection: "row",
    gap: Spacing.sm,
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.sm,
  },
  tile: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    padding: Spacing.md,
    gap: Spacing.xs,
    borderTopWidth: 2,
    borderTopColor: Colors.accentBorder,
    ...Shadows.sm,
  },
  tileHeader: { flexDirection: "row", alignItems: "center", gap: Spacing.xs },
  tileIcon: { marginRight: Spacing.xs },
  tileTitle: {
    fontFamily: Typography.fontLabel,
    fontSize: Typography.xs,
    color: Colors.textSecondary,
    letterSpacing: Typography.wider,
  },
  tileValue: {
    fontFamily: Typography.fontDisplay,
    fontSize: Typography.xl,
    color: Colors.textPrimary,
    letterSpacing: Typography.tight,
  },

  // List rows
  listRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  listRowLast: { borderBottomWidth: 0 },
  listIconBox: { width: 30, alignItems: "center", marginRight: Spacing.sm },
  listLabel: {
    flex: 1,
    fontFamily: Typography.fontBody,
    fontSize: Typography.base,
    color: Colors.textPrimary,
  },
  listValue: {
    fontFamily: Typography.fontBodyMedium,
    fontSize: Typography.base,
    color: Colors.textSecondary,
  },
  listChevron: {
    fontFamily: Typography.fontBody,
    fontSize: 18,
    color: Colors.textTertiary,
    marginLeft: Spacing.xs,
  },

  // Badge
  badgeCheck: { fontSize: 14, color: Colors.success },

  // Sign out
  signOutRow: {
    alignItems: "center",
    padding: Spacing.base,
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    marginHorizontal: Spacing.base,
    borderWidth: 1,
    borderColor: Colors.divider,
  },
  signOutText: {
    fontFamily: Typography.fontLabel,
    fontSize: Typography.sm,
    color: Colors.error,
    letterSpacing: Typography.wider,
  },
});
