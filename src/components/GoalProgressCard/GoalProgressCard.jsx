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

export default function GoalProgressCard({ goal }) {
  const { t } = useTranslation();
  const { firebaseUser, displayUnit } = useAuthStore();
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

  const progressColor = goal.isFullyCompleted ? Colors.success : Colors.accent;

  const displaySteps =
    goal.type === "cooperative" ? cooperativeSteps : personalSteps;

  const topThree = [...(goal.members ?? [])]
    .sort((a, b) => b.steps - a.steps)
    .slice(0, 3);

  return (
    <View style={[styles.card, goal.isFullyCompleted && styles.cardCompleted]}>
      {/* Header */}
      <View style={styles.header}>
        <Ionicons
          name={showCheck ? "checkmark-circle" : "navigate"}
          size={18}
          color={showCheck ? Colors.success : Colors.accent}
        />
        <View style={styles.headerText}>
          <Text style={styles.goalName}>{goal.name}</Text>
          {goal.type === "race" && (
            <Text style={styles.raceTag}>{t("journey.race_mode").toUpperCase()}</Text>
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

      {/* Leaderboard */}
      {goal.isGroupGoal && topThree.length > 0 && (
        <View style={styles.leaderboard}>
          <View style={styles.divider} />
          <View style={styles.leaderboardRow}>
            {topThree.map((member, index) => (
              <View key={member.id ?? index} style={styles.leaderboardItem}>
                {member.steps >= goal.totalSteps ? (
                  <Ionicons
                    name="checkmark-circle"
                    size={10}
                    color={Colors.success}
                  />
                ) : (
                  <Text style={styles.rankLabel}>#{index + 1}</Text>
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
            {goal.type === "cooperative" ? t("progress.team_progress").toUpperCase() : t("progress.my_progress").toUpperCase()}
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
          <Text style={styles.statLabel}>{t("progress.target").toUpperCase()}</Text>
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
    backgroundColor: "rgba(255,255,255,0.92)",
    borderRadius: Radius.lg,
    padding: Spacing.base,
    gap: Spacing.sm,
    ...Shadows.md,
  },
  cardCompleted: {
    borderWidth: 1.5,
    borderColor: Colors.success,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  headerText: {
    flex: 1,
  },
  goalName: {
    fontFamily: Typography.fontBodyMedium,
    fontSize: Typography.base,
    color: Colors.textPrimary,
  },
  raceTag: {
    fontFamily: Typography.fontLabel,
    fontSize: Typography.xs,
    color: Colors.textAccent,
    letterSpacing: Typography.wider,
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
  rankLabel: {
    fontFamily: Typography.fontLabel,
    fontSize: Typography.xs,
    color: Colors.textAccent,
  },
  memberName: {
    fontFamily: Typography.fontBody,
    fontSize: Typography.xs,
    color: Colors.textSecondary,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: Spacing.xs,
  },
  statLabel: {
    fontFamily: Typography.fontLabel,
    fontSize: Typography.xs,
    color: Colors.textSecondary,
    letterSpacing: Typography.wider,
  },
  statValue: {
    fontFamily: Typography.fontBodyMedium,
    fontSize: Typography.sm,
    color: Colors.textPrimary,
  },
});
