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

export default function GoalCard({ goal, isSelected }) {
  const { displayUnit } = useAuthStore();

  const progress =
    goal.totalSteps > 0 ? Math.min(goal.currentSteps / goal.totalSteps, 1) : 0;

  const remainingSteps = Math.max(0, goal.totalSteps - goal.currentSteps);
  const isComplete = remainingSteps === 0 && goal.totalSteps > 0;
  const themeColor = goal.isFullyCompleted ? Colors.success : Colors.primary;

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
        <View style={[styles.iconBox, { backgroundColor: `${themeColor}18` }]}>
          <Text style={styles.icon}>
            {goal.isFullyCompleted ? "✅" : goal.icon}
          </Text>
        </View>
        <View style={styles.headerText}>
          <Text style={styles.name}>{goal.name}</Text>
          <Text style={styles.remaining}>
            {isComplete
              ? "Goal Reached!"
              : `${formatProgress(remainingSteps, displayUnit)} remaining`}
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
          <Text style={styles.leaderboardTitle}>LEADERBOARD</Text>
          {topThree.map((member, index) => (
            <View key={member.id ?? index} style={styles.leaderboardRow}>
              <View
                style={[
                  styles.rankBadge,
                  { backgroundColor: rankColors[index] ?? Colors.primary },
                ]}
              >
                <Text style={styles.rankText}>{index + 1}</Text>
              </View>
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
    backgroundColor: Colors.background,
    borderRadius: 16,
    padding: Spacing.base,
    gap: Spacing.sm,
    ...Shadows.sm,
    borderWidth: 2,
    borderColor: "transparent",
  },
  cardSelected: { borderColor: Colors.primary },
  cardCompleted: { borderColor: Colors.success },
  header: { flexDirection: "row", alignItems: "center", gap: Spacing.md },
  iconBox: {
    width: 50,
    height: 50,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  icon: { fontSize: 22 },
  headerText: { flex: 1 },
  name: {
    fontSize: Typography.base,
    fontWeight: "700",
    color: Colors.textPrimary,
  },
  remaining: {
    fontSize: Typography.xs,
    color: Colors.textSecondary,
    marginTop: 2,
    fontWeight: "500",
  },
  percent: { fontSize: Typography.sm, fontWeight: "700" },
  progressTrack: {
    height: 6,
    backgroundColor: Colors.backgroundAlt,
    borderRadius: Radius.full,
    overflow: "hidden",
  },
  progressFill: { height: "100%", borderRadius: Radius.full },
  leaderboard: { gap: Spacing.xs },
  divider: { height: 1, backgroundColor: Colors.divider },
  leaderboardTitle: {
    fontSize: 10,
    fontWeight: "700",
    color: Colors.textSecondary,
    letterSpacing: 0.5,
  },
  leaderboardRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  rankBadge: {
    width: 16,
    height: 16,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  rankText: { fontSize: 9, fontWeight: "700", color: Colors.textInverse },
  memberName: { flex: 1, fontSize: Typography.xs, color: Colors.textPrimary },
  memberSteps: { fontSize: 10, color: Colors.textSecondary },
});
