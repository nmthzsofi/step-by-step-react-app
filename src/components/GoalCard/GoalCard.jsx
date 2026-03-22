import { useTranslation } from "react-i18next";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAuthStore } from "../../store/authStore";
import { formatProgress } from "../../utils/formatters";
import {
  Colors,
  Typography,
  Spacing,
  Radius,
  Shadows,
} from "../../constants/theme";

export default function GoalCard({ goal, isSelected }) {
  const { t } = useTranslation();
  const { displayUnit, firebaseUser } = useAuthStore();
  const uid = firebaseUser?.uid;

  const personalSteps = goal.members?.find((m) => m.id === uid)?.steps ?? 0;
  const cooperativeSteps = (goal.members ?? []).reduce((s, m) => s + m.steps, 0);
  const currentSteps = goal.type === "cooperative" ? cooperativeSteps : personalSteps;

  const progress =
    goal.totalSteps > 0 ? Math.min(currentSteps / goal.totalSteps, 1) : 0;

  const remainingSteps = Math.max(0, goal.totalSteps - currentSteps);
  const isComplete = remainingSteps === 0 && goal.totalSteps > 0;
  const themeColor = goal.isFullyCompleted ? Colors.success : Colors.accent;

  const topThree = [...(goal.members ?? [])]
    .sort((a, b) => b.steps - a.steps)
    .slice(0, 3);

  return (
    <View
      style={[
        styles.card,
        isSelected && styles.cardSelected,
        goal.isFullyCompleted && styles.cardCompleted,
      ]}
    >
      <View style={styles.header}>
        <View style={[styles.iconBox, { backgroundColor: Colors.accentGlow }]}>
          {goal.isFullyCompleted ? (
            <Ionicons
              name="checkmark-circle"
              size={24}
              color={Colors.success}
            />
          ) : (
            <Text style={styles.icon}>{goal.icon}</Text>
          )}
        </View>
        <View style={styles.headerText}>
          <Text style={styles.name}>{goal.name}</Text>
          <Text style={styles.remaining}>
            {isComplete
              ? t("progress.goal_reached_short")
              : t("common.remaining", { time: formatProgress(remainingSteps, displayUnit) })}
          </Text>
        </View>
        <Text style={[styles.percent, { color: themeColor }]}>
          {Math.floor(progress * 100)}%
        </Text>
      </View>

      {/* Progress bar */}
      <View style={styles.progressTrack}>
        <View
          style={[
            styles.progressFill,
            { width: `${progress * 100}%`, backgroundColor: themeColor },
          ]}
        />
      </View>

      {/* Race leaderboard */}
      {goal.type === "race" && topThree.length > 0 && (
        <View style={styles.leaderboard}>
          <View style={styles.divider} />
          <Text style={styles.leaderboardTitle}>{t("progress.leaderboard").toUpperCase()}</Text>
          {topThree.map((member, index) => (
            <View key={member.id ?? index} style={styles.leaderboardRow}>
              <Text style={styles.rankText}>#{index + 1}</Text>
              <Text style={styles.memberName}>{member.firstName}</Text>
              <Text style={styles.memberSteps}>
                {formatProgress(member.steps, displayUnit)}
              </Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.base,
    gap: Spacing.sm,
    ...Shadows.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cardSelected: { borderColor: Colors.accentBorder },
  cardCompleted: { borderColor: Colors.success },
  header: { flexDirection: "row", alignItems: "center", gap: Spacing.md },
  iconBox: {
    width: 50,
    height: 50,
    borderRadius: Radius.md,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: Colors.accentBorder,
  },
  icon: { fontSize: 22 },
  headerText: { flex: 1 },
  name: {
    fontFamily: Typography.fontBodyMedium,
    fontSize: Typography.base,
    color: Colors.textPrimary,
  },
  remaining: {
    fontFamily: Typography.fontBody,
    fontSize: Typography.xs,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  percent: {
    fontFamily: Typography.fontDisplay,
    fontSize: Typography.md,
    letterSpacing: Typography.tight,
  },
  progressTrack: {
    height: 4,
    backgroundColor: Colors.borderMid,
    borderRadius: Radius.full,
    overflow: "hidden",
  },
  progressFill: { height: "100%", borderRadius: Radius.full },
  leaderboard: { gap: Spacing.xs },
  divider: { height: 1, backgroundColor: Colors.divider },
  leaderboardTitle: {
    fontFamily: Typography.fontLabel,
    fontSize: Typography.xs,
    color: Colors.textSecondary,
    letterSpacing: Typography.widest,
  },
  leaderboardRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  rankText: {
    fontFamily: Typography.fontLabel,
    fontSize: Typography.xs,
    color: Colors.textAccent,
    width: 24,
  },
  memberName: {
    flex: 1,
    fontFamily: Typography.fontBody,
    fontSize: Typography.xs,
    color: Colors.textPrimary,
  },
  memberSteps: {
    fontFamily: Typography.fontBody,
    fontSize: Typography.xs,
    color: Colors.textSecondary,
  },
});
