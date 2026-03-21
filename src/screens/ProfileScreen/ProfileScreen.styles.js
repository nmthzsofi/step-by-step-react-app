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
    backgroundColor: Colors.background,
    alignItems: "center",
    paddingVertical: Spacing.xl,
    gap: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  avatarWrapper: { width: 100, height: 100 },
  avatar: { width: 100, height: 100, borderRadius: 50 },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.backgroundAlt,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarPlaceholderText: { fontSize: 60 },
  editBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: Colors.background,
    borderRadius: 15,
    width: 30,
    height: 30,
    alignItems: "center",
    justifyContent: "center",
    ...Shadows.sm,
  },
  editBadgeText: { fontSize: 16 },
  fullName: {
    fontSize: Typography.xl,
    fontWeight: "700",
    color: Colors.textPrimary,
  },
  username: { fontSize: Typography.sm, color: Colors.textSecondary },

  // Section
  section: { marginTop: Spacing.lg },
  sectionHeader: {
    fontSize: 11,
    fontWeight: "700",
    color: Colors.textSecondary,
    letterSpacing: 0.5,
    paddingHorizontal: Spacing.base,
    paddingBottom: Spacing.xs,
  },
  card: {
    backgroundColor: Colors.background,
    marginHorizontal: 0,
    ...Shadows.sm,
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
    backgroundColor: Colors.backgroundAlt,
    borderRadius: Radius.md,
    padding: Spacing.md,
    gap: Spacing.xs,
  },
  tileHeader: { flexDirection: "row", alignItems: "center", gap: Spacing.xs },
  tileIcon: { fontSize: 14 },
  tileTitle: { fontSize: Typography.xs, color: Colors.textSecondary },
  tileValue: {
    fontSize: Typography.md,
    fontWeight: "700",
    color: Colors.textPrimary,
  },

  // List rows
  listRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.background,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  listRowLast: { borderBottomWidth: 0 },
  listIconBox: { width: 30, alignItems: "center", marginRight: Spacing.sm },
  listIcon: { fontSize: 18 },
  listLabel: { flex: 1, fontSize: Typography.base, color: Colors.textPrimary },
  listValue: {
    fontSize: Typography.base,
    fontWeight: "700",
    color: Colors.textPrimary,
  },
  listChevron: {
    fontSize: 14,
    color: Colors.textTertiary,
    marginLeft: Spacing.xs,
  },

  // Badge row
  badgeCheck: { fontSize: 16, color: Colors.success },

  // Sign out
  signOutRow: {
    alignItems: "center",
    padding: Spacing.base,
    backgroundColor: Colors.background,
  },
  signOutText: {
    fontSize: Typography.base,
    color: Colors.error,
    fontWeight: "600",
  },
});
