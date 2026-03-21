import { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
  Alert,
} from "react-native";
import * as Clipboard from "expo-clipboard";
import debounce from "lodash.debounce";
import { doc, updateDoc, deleteDoc } from "firebase/firestore";
import { db } from "../../services/firebase";
import { useAuthStore } from "../../store/authStore";
import { useGoalStore } from "../../store/goalStore";
import { reverseGeocode, searchLocations } from "../../utils/location";
import { formatProgress } from "../../utils/formatters";
import {
  Colors,
  Typography,
  Spacing,
  Radius,
  Shadows,
} from "../../constants/theme";

const ICONS = ["🚶", "🏖️", "⛰️", "✈️", "🚴", "⛺"];
const rankColors = ["#FFD700", "#A0A0A0", "#CD7F32"];
const GOAL_TYPES = ["individual", "cooperative", "race"];

export default function GoalDetailModal({ goal, visible, onDismiss }) {
  const { firebaseUser, displayUnit } = useAuthStore();
  const updateGoal = useGoalStore((s) => s.updateGoal);
  const setGoals = useGoalStore((s) => s.setGoals);
  const goals = useGoalStore((s) => s.goals);

  const [name, setName] = useState(goal?.name ?? "");
  const [icon, setIcon] = useState(goal?.icon ?? "🚶");
  const [goalType, setGoalType] = useState(goal?.type ?? "individual");
  const [isSaving, setIsSaving] = useState(false);
  const [startAddr, setStartAddr] = useState("Loading...");
  const [endAddr, setEndAddr] = useState("Loading...");
  const [showAll, setShowAll] = useState(false);
  const [startCoord, setStartCoord] = useState(goal?.startCoordinate ?? null);
  const [endCoord, setEndCoord] = useState(goal?.coordinates ?? null);
  const [editingField, setEditingField] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);

  useEffect(() => {
    if (!goal) return;
    setName(goal.name);
    setIcon(goal.icon);
    setGoalType(goal.type);
    setStartCoord(goal.startCoordinate);
    setEndCoord(goal.coordinates);
    reverseGeocode(
      goal.startCoordinate.latitude,
      goal.startCoordinate.longitude,
    ).then(setStartAddr);
    reverseGeocode(goal.coordinates.latitude, goal.coordinates.longitude).then(
      setEndAddr,
    );
  }, [goal]);

  if (!goal) return null;

  const uid = firebaseUser?.uid;
  const hasMultipleMembers = (goal.members?.length ?? 0) > 1;
  const sortedMembers = [...(goal.members ?? [])].sort(
    (a, b) => b.steps - a.steps,
  );
  const displayMembers = showAll ? sortedMembers : sortedMembers.slice(0, 5);

  const debouncedSearch = useRef(
    debounce(async (query, setResults) => {
      if (query.length > 2) {
        const results = await searchLocations(query);
        setResults(results);
      } else {
        setResults([]);
      }
    }, 400)
  ).current;

  const handleLocationSearch = (query) => {
    setSearchQuery(query);
    debouncedSearch(query, setSearchResults);
  };

  const selectLocation = (item) => {
    const coord = { latitude: item.latitude, longitude: item.longitude };
    if (editingField === "start") {
      setStartCoord(coord);
      setStartAddr(item.name);
    } else {
      setEndCoord(coord);
      setEndAddr(item.name);
    }
    setEditingField(null);
    setSearchQuery("");
    setSearchResults([]);
  };

  const handleSave = async () => {
    if (!goal.id) return;
    setIsSaving(true);
    try {
      const isGroupGoal = goalType !== "individual";
      await updateDoc(doc(db, "goals", goal.id), {
        name,
        icon,
        type: goalType,
        isGroupGoal,
        startCoordinate: startCoord,
        coordinates: endCoord,
      });
      updateGoal(goal.id, {
        name,
        icon,
        type: goalType,
        isGroupGoal,
        startCoordinate: startCoord,
        coordinates: endCoord,
      });
      onDismiss();
    } catch (err) {
      console.error("Save error:", err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = () => {
    const isCreator = uid === goal.creatorUID;
    const isGroupGoal = goal.isGroupGoal;

    const title = isGroupGoal && !isCreator ? "Exit Group" : "Delete Journey";
    const message =
      isGroupGoal && !isCreator
        ? "You will be removed from this group. Other members keep their progress."
        : "This will permanently delete this journey for all members.";

    Alert.alert(title, message, [
      { text: "Cancel", style: "cancel" },
      {
        text: title,
        style: "destructive",
        onPress: async () => {
          onDismiss();
          setTimeout(async () => {
            if (!goal.id) return;

            if (isGroupGoal && !isCreator) {
              // Member leaving: remove only themselves from the goal
              const updatedMembers = (goal.members ?? []).filter(
                (m) => m.id !== uid,
              );
              const updatedMemberUIDs = updatedMembers
                .map((m) => m.id)
                .filter(Boolean);
              await updateDoc(doc(db, "goals", goal.id), {
                members: updatedMembers,
                memberUIDs: updatedMemberUIDs,
              });
              setGoals(goals.filter((g) => g.id !== goal.id));
            } else {
              // Creator deleting: remove the entire document
              setGoals(goals.filter((g) => g.id !== goal.id));
              await deleteDoc(doc(db, "goals", goal.id));
            }
          }, 300);
        },
      },
    ]);
  };

  return (
    <>
      <Modal
        visible={visible}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={onDismiss}>
              <Text style={styles.cancel}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Edit Journey</Text>
            <TouchableOpacity onPress={handleSave} disabled={isSaving}>
              {isSaving ? (
                <ActivityIndicator />
              ) : (
                <Text style={styles.done}>Done</Text>
              )}
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={styles.content}>
            {/* General */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>GENERAL</Text>
              <View style={styles.card}>
                <View>
                  <Text style={styles.fieldLabel}>Journey Name</Text>
                  <TextInput
                    style={styles.editableInput}
                    value={name}
                    onChangeText={setName}
                    placeholder="Journey Name"
                    placeholderTextColor={Colors.textTertiary}
                    autoCorrect={false}
                  />
                </View>

                <View style={styles.divider} />

                <View>
                  <Text style={styles.fieldLabel}>Journey Type</Text>
                  <View
                    style={[
                      styles.segmented,
                      hasMultipleMembers && styles.segmentedDisabled,
                    ]}
                  >
                    {GOAL_TYPES.map((type) => (
                      <TouchableOpacity
                        key={type}
                        style={[
                          styles.segment,
                          goalType === type && styles.segmentActive,
                        ]}
                        onPress={() => !hasMultipleMembers && setGoalType(type)}
                        disabled={hasMultipleMembers}
                      >
                        <Text
                          style={[
                            styles.segmentText,
                            goalType === type && styles.segmentTextActive,
                          ]}
                        >
                          {type.charAt(0).toUpperCase() + type.slice(1)}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                  {hasMultipleMembers && (
                    <Text style={styles.disabledHint}>
                      Journey type cannot be changed once members have joined.
                    </Text>
                  )}
                </View>

                {goal.isGroupGoal && (
                  <>
                    <View style={styles.divider} />
                    <View style={styles.row}>
                      <Text style={styles.rowLabel}>Group Code</Text>
                      <View style={styles.codeRow}>
                        <Text style={styles.shareCode}>{goal.shareCode}</Text>
                        <TouchableOpacity
                          onPress={() => Clipboard.setStringAsync(goal.shareCode)}
                        >
                          <Text style={styles.copyIcon}>📋</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </>
                )}
              </View>
            </View>

            {/* Leaderboard */}
            {goal.isGroupGoal && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>LEADERBOARD</Text>
                <View style={styles.card}>
                  {displayMembers.map((member, index) => (
                    <View key={member.id ?? index} style={styles.memberRow}>
                      <View
                        style={[
                          styles.rankBadge,
                          {
                            backgroundColor:
                              rankColors[index] ?? Colors.primary,
                          },
                        ]}
                      >
                        <Text style={styles.rankText}>{index + 1}</Text>
                      </View>
                      <Text
                        style={[
                          styles.memberName,
                          member.id === uid && styles.memberNameMe,
                        ]}
                      >
                        {member.firstName}
                      </Text>
                      <Text style={styles.memberSteps}>
                        {formatProgress(member.steps, displayUnit)}
                      </Text>
                    </View>
                  ))}
                  {goal.members?.length > 5 && !showAll && (
                    <TouchableOpacity onPress={() => setShowAll(true)}>
                      <Text style={styles.viewAll}>
                        View All Members ({goal.members.length})
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            )}

            {/* Icon */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>JOURNEY ICON</Text>
              <View style={styles.card}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View style={styles.iconRow}>
                    {ICONS.map((i) => (
                      <TouchableOpacity
                        key={i}
                        style={[
                          styles.iconButton,
                          icon === i && styles.iconButtonActive,
                        ]}
                        onPress={() => setIcon(i)}
                      >
                        <Text style={styles.iconEmoji}>{i}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </ScrollView>
              </View>
            </View>

            {/* Route */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>ROUTE</Text>
              <View style={styles.card}>
                <TouchableOpacity
                  onPress={() => {
                    setEditingField("start");
                    setSearchQuery(startAddr);
                  }}
                >
                  <Text style={styles.routeLabel}>Start Point</Text>
                  <Text style={[styles.routeValue, styles.editableRoute]}>
                    {startAddr}
                  </Text>
                </TouchableOpacity>
                <View style={styles.divider} />
                <TouchableOpacity
                  onPress={() => {
                    setEditingField("end");
                    setSearchQuery(endAddr);
                  }}
                >
                  <Text style={styles.routeLabel}>Destination</Text>
                  <Text style={[styles.routeValue, styles.editableRoute]}>
                    {endAddr}
                  </Text>
                </TouchableOpacity>
                <View style={styles.divider} />
                <View style={styles.row}>
                  <Text style={styles.rowLabel}>Total Steps</Text>
                  <Text style={styles.rowValue}>
                    {formatProgress(goal.totalSteps, displayUnit)}
                  </Text>
                </View>
              </View>
            </View>

            {/* Delete */}
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={handleDelete}
            >
              <Text style={styles.deleteText}>
                {goal.isGroupGoal ? "Exit Group" : "Delete Journey"}
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </Modal>

      {/* Location search modal */}
      <Modal
        visible={!!editingField}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.container}>
          <View style={styles.header}>
            <TouchableOpacity
              onPress={() => {
                setEditingField(null);
                setSearchResults([]);
                setSearchQuery("");
              }}
            >
              <Text style={styles.cancel}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>
              {editingField === "start" ? "Set Start Point" : "Set Destination"}
            </Text>
            <View style={{ width: 60 }} />
          </View>

          <View style={{ padding: Spacing.base }}>
            <TextInput
              style={styles.searchInput}
              value={searchQuery}
              onChangeText={handleLocationSearch}
              placeholder="Search location..."
              placeholderTextColor={Colors.textTertiary}
              autoFocus
              autoCorrect={false}
            />
          </View>

          <ScrollView>
            {searchResults.map((item, index) => (
              <TouchableOpacity
                key={index}
                style={styles.resultRow}
                onPress={() => selectLocation(item)}
              >
                <Text style={styles.resultName}>{item.name}</Text>
                <Text style={styles.resultFull} numberOfLines={1}>
                  {item.fullName}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.backgroundAlt },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: Spacing.base,
    paddingTop: Spacing.xl,
    backgroundColor: Colors.background,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  headerTitle: {
    fontSize: Typography.md,
    fontWeight: "700",
    color: Colors.textPrimary,
  },
  cancel: { fontSize: Typography.base, color: Colors.primary },
  done: { fontSize: Typography.base, color: Colors.primary, fontWeight: "700" },
  content: { padding: Spacing.base, gap: Spacing.base, paddingBottom: 40 },
  section: { gap: Spacing.xs },
  sectionTitle: {
    fontSize: 11,
    fontWeight: "700",
    color: Colors.textSecondary,
    letterSpacing: 0.5,
    marginLeft: Spacing.xs,
  },
  card: {
    backgroundColor: Colors.background,
    borderRadius: Radius.md,
    padding: Spacing.base,
    gap: Spacing.sm,
    ...Shadows.sm,
  },
  divider: { height: 1, backgroundColor: Colors.divider },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  rowLabel: { fontSize: Typography.base, color: Colors.textPrimary },
  rowValue: { fontSize: Typography.base, color: Colors.textSecondary },
  fieldLabel: {
    fontSize: Typography.xs,
    color: Colors.textSecondary,
    fontWeight: "600",
    marginBottom: Spacing.xs,
  },
  editableInput: {
    fontSize: Typography.base,
    color: Colors.textPrimary,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    paddingVertical: Spacing.xs,
  },
  segmented: {
    flexDirection: "row",
    backgroundColor: Colors.backgroundAlt,
    borderRadius: Radius.sm,
    padding: 2,
    marginTop: Spacing.xs,
  },
  segmentedDisabled: { opacity: 0.5 },
  segment: {
    flex: 1,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.sm - 2,
    alignItems: "center",
  },
  segmentActive: { backgroundColor: Colors.background, ...Shadows.sm },
  segmentText: {
    fontSize: Typography.xs,
    color: Colors.textSecondary,
    fontWeight: "500",
  },
  segmentTextActive: { color: Colors.textPrimary, fontWeight: "700" },
  disabledHint: {
    fontSize: Typography.xs,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
  },
  codeRow: { flexDirection: "row", alignItems: "center", gap: Spacing.sm },
  shareCode: {
    fontSize: Typography.base,
    fontWeight: "700",
    fontFamily: "monospace",
    color: Colors.primary,
    letterSpacing: 2,
  },
  copyIcon: { fontSize: 16 },
  memberRow: { flexDirection: "row", alignItems: "center", gap: Spacing.sm },
  rankBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  rankText: { fontSize: 10, fontWeight: "700", color: Colors.textInverse },
  memberName: { flex: 1, fontSize: Typography.base, color: Colors.textPrimary },
  memberNameMe: { fontWeight: "700" },
  memberSteps: { fontSize: Typography.sm, color: Colors.textSecondary },
  viewAll: {
    fontSize: Typography.sm,
    color: Colors.primary,
    fontWeight: "600",
    textAlign: "center",
    paddingTop: Spacing.xs,
  },
  routeLabel: {
    fontSize: Typography.xs,
    color: Colors.textSecondary,
    fontWeight: "600",
  },
  routeValue: {
    fontSize: Typography.base,
    color: Colors.textPrimary,
    marginTop: 2,
  },
  editableRoute: { color: Colors.primary },
  iconRow: {
    flexDirection: "row",
    gap: Spacing.md,
    paddingVertical: Spacing.xs,
  },
  iconButton: {
    padding: Spacing.sm,
    borderRadius: Radius.full,
    backgroundColor: Colors.backgroundAlt,
  },
  iconButtonActive: {
    backgroundColor: `${Colors.primary}20`,
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  iconEmoji: { fontSize: 24 },
  deleteButton: { alignItems: "center", padding: Spacing.base },
  deleteText: {
    fontSize: Typography.base,
    color: Colors.error,
    fontWeight: "600",
  },
  searchInput: {
    fontSize: Typography.base,
    color: Colors.textPrimary,
    backgroundColor: Colors.backgroundAlt,
    borderRadius: Radius.sm,
    padding: Spacing.md,
  },
  resultRow: {
    padding: Spacing.base,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
    backgroundColor: Colors.background,
  },
  resultName: {
    fontSize: Typography.base,
    fontWeight: "600",
    color: Colors.textPrimary,
  },
  resultFull: {
    fontSize: Typography.xs,
    color: Colors.textSecondary,
    marginTop: 2,
  },
});
