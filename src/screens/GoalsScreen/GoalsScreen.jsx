import { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Modal,
} from "react-native";
import { useGoalStore } from "../../store/goalStore";
import GoalCard from "../../components/GoalCard/GoalCard";
import GoalDetailModal from "../../components/GoalDetailModal/GoalDetailModal";
import CreateGoalModal from "../../components/CreateGoalModal/CreateGoalModal";
import JoinGroupModal from "../../components/JoinGroupModal/JoinGroupModal";
import { Colors, Typography, Spacing } from "../../constants/theme";

export default function GoalsScreen() {
  const goals = useGoalStore((s) => s.goals);

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
        <Text style={styles.title}>Your Goals</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setShowActionSheet(true)}
        >
          <Text style={styles.addIcon}>＋</Text>
        </TouchableOpacity>
      </View>

      {/* Goal list */}
      <ScrollView
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      >
        {goals.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>🗺️</Text>
            <Text style={styles.emptyTitle}>No journeys yet</Text>
            <Text style={styles.emptySubtitle}>
              Create a new journey or join an existing group to get started.
            </Text>
          </View>
        ) : (
          goals.map((goal) => (
            <TouchableOpacity
              key={goal.id}
              onPress={() => openGoal(goal)}
              activeOpacity={0.85}
            >
              <GoalCard goal={goal} isSelected={false} />
            </TouchableOpacity>
          ))
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
            <TouchableOpacity
              style={styles.actionRow}
              onPress={() => {
                setShowActionSheet(false);
                setShowCreate(true);
              }}
            >
              <Text style={styles.actionIcon}>➕</Text>
              <Text style={styles.actionText}>Create New Journey</Text>
            </TouchableOpacity>
            <View style={styles.actionDivider} />
            <TouchableOpacity
              style={styles.actionRow}
              onPress={() => {
                setShowActionSheet(false);
                setShowJoin(true);
              }}
            >
              <Text style={styles.actionIcon}>🔑</Text>
              <Text style={styles.actionText}>Join Existing Group</Text>
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
    fontSize: Typography.xxl,
    fontWeight: "700",
    color: Colors.textPrimary,
  },
  addButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  addIcon: {
    color: Colors.textInverse,
    fontSize: 20,
    fontWeight: "700",
    lineHeight: 22,
  },
  list: { padding: Spacing.base, gap: Spacing.base, paddingBottom: 100 },
  emptyState: { alignItems: "center", paddingTop: 80, gap: Spacing.md },
  emptyIcon: { fontSize: 60 },
  emptyTitle: {
    fontSize: Typography.xl,
    fontWeight: "700",
    color: Colors.textPrimary,
  },
  emptySubtitle: {
    fontSize: Typography.sm,
    color: Colors.textSecondary,
    textAlign: "center",
    paddingHorizontal: Spacing.xl,
  },
  backdrop: {
    flex: 1,
    backgroundColor: Colors.overlay,
    justifyContent: "flex-end",
  },
  actionSheet: {
    backgroundColor: Colors.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 40,
  },
  actionRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.base,
    gap: Spacing.md,
  },
  actionIcon: { fontSize: 20 },
  actionText: {
    fontSize: Typography.base,
    color: Colors.textPrimary,
    fontWeight: "500",
  },
  actionDivider: {
    height: 1,
    backgroundColor: Colors.divider,
    marginHorizontal: Spacing.base,
  },
});
