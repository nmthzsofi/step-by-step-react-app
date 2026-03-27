import { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Modal,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useGoalStore } from "../../store/goalStore";
import { useAuthStore } from "../../store/authStore";
import GoalCard from "../../components/GoalCard/GoalCard";
import GoalDetailModal from "../../components/GoalDetailModal/GoalDetailModal";
import CreateGoalModal from "../../components/CreateGoalModal/CreateGoalModal";
import JoinGroupModal from "../../components/JoinGroupModal/JoinGroupModal";
import { useTranslation } from "react-i18next";
import { Colors, Typography, Spacing, Radius } from "../../constants/theme";

export default function GoalsScreen() {
  const { t } = useTranslation();
  const goals = useGoalStore((s) => s.goals);
  const uid = useAuthStore((s) => s.firebaseUser?.uid);

  const getGoalProgress = (goal) => {
    if (!goal.totalSteps || !goal.members?.length) return 0;
    if (goal.type === "cooperative") {
      return goal.members.reduce((s, m) => s + m.steps, 0) / goal.totalSteps;
    }
    return (goal.members.find((m) => m.id === uid)?.steps ?? 0) / goal.totalSteps;
  };

  const activeGoals = goals.filter((g) => getGoalProgress(g) < 1);
  const completedGoals = goals.filter((g) => getGoalProgress(g) >= 1);

  const [selectedGoal, setSelectedGoal] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [showJoin, setShowJoin] = useState(false);
  const [showGoalDetail, setShowGoalDetail] = useState(false);
  const [showActionSheet, setShowActionSheet] = useState(false);

  const openGoal = (goal) => {
    setSelectedGoal(goal);
    setShowGoalDetail(true);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>{t("progress.your_goals")}</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setShowActionSheet(true)}
        >
          <Ionicons name="add" size={22} color={Colors.accent} />
        </TouchableOpacity>
      </View>

      {/* Goal list */}
      <ScrollView
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      >
        {goals.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="map-outline" size={56} color={Colors.textTertiary} />
            <Text style={styles.emptyTitle}>{t("journey.no_journeys_title")}</Text>
            <Text style={styles.emptySubtitle}>
              {t("journey.no_journeys_subtitle")}
            </Text>
          </View>
        ) : (
          <>
            {activeGoals.map((goal) => (
              <TouchableOpacity
                key={goal.id}
                onPress={() => openGoal(goal)}
                activeOpacity={0.85}
              >
                <GoalCard goal={goal} isSelected={false} />
              </TouchableOpacity>
            ))}

            {completedGoals.length > 0 && (
              <>
                <View style={styles.sectionSeparator}>
                  <View style={styles.sectionLine} />
                  <Text style={styles.sectionLabel}>{t("progress.finished_goals").toUpperCase()}</Text>
                  <View style={styles.sectionLine} />
                </View>
                {completedGoals.map((goal) => (
                  <TouchableOpacity
                    key={goal.id}
                    onPress={() => openGoal(goal)}
                    activeOpacity={0.85}
                  >
                    <GoalCard goal={goal} isSelected={false} />
                  </TouchableOpacity>
                ))}
              </>
            )}
          </>
        )}
      </ScrollView>

      {/* Action sheet modal */}
      <Modal
        visible={showActionSheet}
        transparent
        animationType="slide"
        onRequestClose={() => setShowActionSheet(false)}
      >
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={() => setShowActionSheet(false)}
        >
          <View style={styles.actionSheet}>
            <View style={styles.actionHandle} />
            <TouchableOpacity
              style={styles.actionRow}
              onPress={() => {
                setShowActionSheet(false);
                setShowCreate(true);
              }}
            >
              <Ionicons name="add-circle-outline" size={22} color={Colors.accent} />
              <Text style={styles.actionText}>{t("journey.create_new_journey")}</Text>
            </TouchableOpacity>
            <View style={styles.actionDivider} />
            <TouchableOpacity
              style={styles.actionRow}
              onPress={() => {
                setShowActionSheet(false);
                setShowJoin(true);
              }}
            >
              <Ionicons name="key-outline" size={22} color={Colors.accent} />
              <Text style={styles.actionText}>{t("journey.join_existing")}</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Modals */}
      <CreateGoalModal
        visible={showCreate}
        onDismiss={() => setShowCreate(false)}
      />
      <JoinGroupModal visible={showJoin} onDismiss={() => setShowJoin(false)} />
      <GoalDetailModal
        goal={selectedGoal}
        visible={showGoalDetail}
        onDismiss={() => {
          setShowGoalDetail(false);
          setSelectedGoal(null);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.backgroundAlt },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: Spacing.base,
    paddingTop: 60,
    paddingBottom: Spacing.base,
    backgroundColor: Colors.background,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  title: {
    fontFamily: Typography.fontDisplay,
    fontSize: Typography.xxl,
    color: Colors.textPrimary,
    letterSpacing: Typography.tight,
  },
  addButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1,
    borderColor: Colors.accentBorder,
    alignItems: "center",
    justifyContent: "center",
  },
  list: { flexGrow: 1, padding: Spacing.base, gap: Spacing.base, paddingBottom: 100 },
  emptyState: { flex: 1, alignItems: "center", justifyContent: "center", gap: Spacing.md },
  emptyTitle: {
    fontFamily: Typography.fontDisplayItalic,
    fontSize: Typography.xl,
    color: Colors.textSecondary,
    letterSpacing: Typography.tight,
  },
  emptySubtitle: {
    fontFamily: Typography.fontBody,
    fontSize: Typography.sm,
    color: Colors.textTertiary,
    textAlign: "center",
    paddingHorizontal: Spacing.xl,
    lineHeight: 20,
  },
  sectionSeparator: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    marginVertical: Spacing.xs,
  },
  sectionLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.divider,
  },
  sectionLabel: {
    fontFamily: Typography.fontLabel,
    fontSize: Typography.xs,
    color: Colors.textTertiary,
    letterSpacing: Typography.widest,
  },
  backdrop: {
    flex: 1,
    backgroundColor: Colors.overlay,
    justifyContent: "flex-end",
  },
  actionSheet: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: Radius.lg,
    borderTopRightRadius: Radius.lg,
    paddingBottom: 40,
    borderTopWidth: 1,
    borderTopColor: Colors.accentBorder,
  },
  actionHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.borderMid,
    alignSelf: "center",
    marginTop: Spacing.md,
    marginBottom: Spacing.sm,
  },
  actionRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.base,
    gap: Spacing.md,
  },
  actionText: {
    fontFamily: Typography.fontBody,
    fontSize: Typography.base,
    color: Colors.textPrimary,
  },
  actionDivider: {
    height: 1,
    backgroundColor: Colors.divider,
    marginHorizontal: Spacing.base,
  },
});
