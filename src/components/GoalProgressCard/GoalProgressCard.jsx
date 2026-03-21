import { View, Text, StyleSheet } from "react-native";
import { useAuthStore } from "../../store/authStore";
import { formatProgress } from "../../utils/formatters";
import {
  Colors,
  Typography,
  Spacing,
  Radius,
  Shadows,
} from "../../constants/theme";

const rankColors = ["#FFD700", "#A0A0A0", "#CD7F32"];

export default function GoalProgressCard({ goal }) {
  const { firebaseUser, displayUnit, userHeight } = useAuthStore();
  const uid = firebaseUser?.uid;

  const personalSteps = goal.members?.find((m) => m.id === uid)?.steps ?? 0;

  const cooperativeSteps = (goal.members ?? []).reduce(
    (s, m) => s + m.steps,
    0,
  );

  const displayProgress = (() => {
    if (!goal.totalSteps) return 0;
    switch (goal.type) {
      case "race":
      case "individual":
        return personalSteps / goal.totalSteps;
      case "cooperative":
        return cooperativeSteps / goal.totalSteps;
      default:
        return 0;
    }
  })();

  const safeProgress = Math.min(Math.max(displayProgress, 0), 1);
  const isMeFinished = goal.totalSteps > 0 && personalSteps >= goal.totalSteps;
  const showCheck =
    isMeFinished ||
    (goal.type === "cooperative" && cooperativeSteps >= goal.totalSteps);

  const progressColor = goal.isFullyCompleted
    ? Colors.success
    : goal.type === "race"
      ? Colors.warning
      : Colors.primary;

  const displaySteps =
    goal.type === "cooperative" ? cooperativeSteps : personalSteps;

  const topThree = [...(goal.members ?? [])]
    .sort((a, b) => b.steps - a.steps)
    .slice(0, 3);

  return (
    <View style={[styles.card, goal.isFullyCompleted && styles.cardCompleted]}>
      {/* Header */}
      <View style={styles.header}>
        <Text
          style={[
            styles.icon,
            { color: showCheck ? Colors.success : Colors.primary },
          ]}
        >
          {showCheck ? "✅" : "🎯"}
        </Text>
        <View style={styles.headerText}>
          <Text style={styles.goalName}>{goal.name}</Text>
          {goal.type === "race" && (
            <Text style={styles.raceTag}>Race Mode</Text>
          )}
        </View>
        <Text style={[styles.percent, { color: progressColor }]}>
          {Math.floor(safeProgress * 100)}%
        </Text>
      </View>

      {/* Progress bar */}
      <View style={styles.progressTrack}>
        <View
          style={[
            styles.progressFill,
            {
              width: `${safeProgress * 100}%`,
              backgroundColor: progressColor,
            },
          ]}
        />
      </View>

      {/* Leaderboard — mirrors SwiftUI leaderboardPreview */}
      {goal.isGroupGoal && topThree.length > 0 && (
        <View style={styles.leaderboard}>
          <View style={styles.divider} />
          <View style={styles.leaderboardRow}>
            {topThree.map((member, index) => (
              <View key={member.id ?? index} style={styles.leaderboardItem}>
                {member.steps >= goal.totalSteps ? (
                  <Text style={styles.checkmark}>✓</Text>
                ) : (
                  <View
                    style={[
                      styles.rankDot,
                      { backgroundColor: rankColors[index] ?? Colors.primary },
                    ]}
                  />
                )}
                <Text style={styles.memberName}>{member.firstName}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Footer stats */}
      <View style={styles.footer}>
        <View>
          <Text style={styles.statLabel}>
            {goal.type === "race" ? "MY PROGRESS" : "TEAM PROGRESS"}
          </Text>
          <Text
            style={[
              styles.statValue,
              isMeFinished && { color: Colors.success },
            ]}
          >
            {formatProgress(displaySteps, displayUnit)}
          </Text>
        </View>
        <View style={{ alignItems: "flex-end" }}>
          <Text style={styles.statLabel}>TARGET</Text>
          <Text style={styles.statValue}>
            {formatProgress(goal.totalSteps, displayUnit)}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "rgba(255,255,255,0.95)",
    borderRadius: 20,
    padding: Spacing.base,
    gap: Spacing.sm,
    ...Shadows.md,
  },
  cardCompleted: {
    borderWidth: 3,
    borderColor: Colors.success,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  icon: {
    fontSize: 18,
  },
  headerText: {
    flex: 1,
  },
  goalName: {
    fontSize: Typography.base,
    fontWeight: "700",
    color: Colors.textPrimary,
  },
  raceTag: {
    fontSize: 10,
    fontWeight: "700",
    color: Colors.warning,
  },
  percent: {
    fontSize: Typography.base,
    fontWeight: "700",
  },
  progressTrack: {
    height: 6,
    backgroundColor: Colors.backgroundAlt,
    borderRadius: Radius.full,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: Radius.full,
  },
  leaderboard: {
    gap: Spacing.xs,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.divider,
    marginVertical: Spacing.xs,
  },
  leaderboardRow: {
    flexDirection: "row",
    gap: Spacing.md,
  },
  leaderboardItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
  },
  rankDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  checkmark: {
    fontSize: 10,
    color: Colors.success,
    fontWeight: "700",
  },
  memberName: {
    fontSize: 10,
    color: Colors.textSecondary,
    fontWeight: "500",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: Spacing.xs,
  },
  statLabel: {
    fontSize: 9,
    fontWeight: "700",
    color: Colors.textSecondary,
    letterSpacing: 0.5,
  },
  statValue: {
    fontSize: Typography.sm,
    fontWeight: "700",
    color: Colors.textPrimary,
  },
});
