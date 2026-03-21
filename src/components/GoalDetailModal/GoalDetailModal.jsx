import { useTranslation } from "react-i18next";
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
import { Ionicons } from "@expo/vector-icons";
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
const GOAL_TYPES = ["individual", "cooperative", "race"];

export default function GoalDetailModal({ goal, visible, onDismiss }) {
  const { t } = useTranslation();
  const { firebaseUser, displayUnit } = useAuthStore();
  const updateGoal = useGoalStore((s) => s.updateGoal);
  const setGoals = useGoalStore((s) => s.setGoals);
  const goals = useGoalStore((s) => s.goals);

  const [name, setName] = useState(goal?.name ?? "");
  const [icon, setIcon] = useState(goal?.icon ?? "🚶");
  const [goalType, setGoalType] = useState(goal?.type ?? "individual");
  const [isSaving, setIsSaving] = useState(false);
  const [startAddr, setStartAddr] = useState(null);
  const [endAddr, setEndAddr] = useState(null);
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

  const debouncedSearch = useRef(
    debounce(async (query, setResults) => {
      if (query.length > 2) {
        const results = await searchLocations(query);
        setResults(results);
      } else {
        setResults([]);
      }
    }, 400),
  ).current;

  if (!goal) return null;

  const uid = firebaseUser?.uid;
  const hasMultipleMembers = (goal.members?.length ?? 0) > 1;
  const sortedMembers = [...(goal.members ?? [])].sort(
    (a, b) => b.steps - a.steps,
  );
  const displayMembers = showAll ? sortedMembers : sortedMembers.slice(0, 5);

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

    const title = isGroupGoal && !isCreator ? t("journey.exit_group") : t("journey.delete_journey");
    const message =
      isGroupGoal && !isCreator
        ? t("journey.exit_warning")
        : t("journey.delete_warning");

    Alert.alert(title, message, [
      { text: t("general.cancel"), style: "cancel" },
      {
        text: title,
        style: "destructive",
        onPress: async () => {
          onDismiss();
          setTimeout(async () => {
            if (!goal.id) return;

            if (isGroupGoal && !isCreator) {
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
              <Text style={styles.cancel}>{t("general.cancel")}</Text>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>{t("journey.edit_journey")}</Text>
            <TouchableOpacity onPress={handleSave} disabled={isSaving}>
              {isSaving ? (
                <ActivityIndicator />
              ) : (
                <Text style={styles.done}>{t("general.done")}</Text>
              )}
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={styles.content}>
            {/* General */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{t("general.general").toUpperCase()}</Text>
              <View style={styles.card}>
                <View>
                  <Text style={styles.fieldLabel}>{t("journey.journey_name")}</Text>
                  <TextInput
                    style={styles.editableInput}
                    value={name}
                    onChangeText={setName}
                    placeholder={t("journey.journey_name")}
                    placeholderTextColor={Colors.textTertiary}
                    autoCorrect={false}
                  />
                </View>

                <View style={styles.divider} />

                <View>
                  <Text style={styles.fieldLabel}>{t("journey.journey_type")}</Text>
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
                          {t(`journey.${type}`)}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                  {hasMultipleMembers && (
                    <Text style={styles.disabledHint}>
                      {t("journey.journey_type_locked")}
                    </Text>
                  )}
                </View>

                {goal.isGroupGoal && (
                  <>
                    <View style={styles.divider} />
                    <View style={styles.row}>
                      <Text style={styles.rowLabel}>{t("journey.group_code")}</Text>
                      <View style={styles.codeRow}>
                        <Text style={styles.shareCode}>{goal.shareCode}</Text>
                        <TouchableOpacity
                          onPress={() =>
                            Clipboard.setStringAsync(goal.shareCode)
                          }
                        >
                          <Ionicons
                            name="copy-outline"
                            size={18}
                            color={Colors.accent}
                          />
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
                <Text style={styles.sectionTitle}>{t("progress.leaderboard").toUpperCase()}</Text>
                <View style={styles.card}>
                  {displayMembers.map((member, index) => (
                    <View key={member.id ?? index} style={styles.memberRow}>
                      <Text style={styles.rankText}>#{index + 1}</Text>
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
                        {t("progress.view_all_members", { count: goal.members.length })}
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            )}

            {/* Icon */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{t("journey.journey_icon").toUpperCase()}</Text>
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
              <Text style={styles.sectionTitle}>{t("journey.route").toUpperCase()}</Text>
              <View style={styles.card}>
                <TouchableOpacity
                  onPress={() => {
                    setEditingField("start");
                    setSearchQuery(startAddr);
                  }}
                >
                  <Text style={styles.routeLabel}>{t("journey.start_point")}</Text>
                  <Text style={[styles.routeValue, styles.editableRoute]}>
                    {startAddr ?? t("general.loading")}
                  </Text>
                </TouchableOpacity>
                <View style={styles.divider} />
                <TouchableOpacity
                  onPress={() => {
                    setEditingField("end");
                    setSearchQuery(endAddr);
                  }}
                >
                  <Text style={styles.routeLabel}>{t("journey.destination")}</Text>
                  <Text style={[styles.routeValue, styles.editableRoute]}>
                    {endAddr ?? t("general.loading")}
                  </Text>
                </TouchableOpacity>
                <View style={styles.divider} />
                <View style={styles.row}>
                  <Text style={styles.rowLabel}>{t("fitness.total_steps")}</Text>
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
                {goal.isGroupGoal ? t("journey.exit_group") : t("journey.delete_journey")}
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
              <Text style={styles.cancel}>{t("general.cancel")}</Text>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>
              {editingField === "start" ? t("journey.start_point") : t("journey.destination")}
            </Text>
            <View style={{ width: 60 }} />
          </View>

          <View style={{ padding: Spacing.base }}>
            <TextInput
              style={styles.searchInput}
              value={searchQuery}
              onChangeText={handleLocationSearch}
              placeholder={t("journey.search_location")}
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
    fontFamily: Typography.fontHeading,
    fontSize: Typography.md,
    color: Colors.textPrimary,
    letterSpacing: Typography.tight,
  },
  cancel: {
    fontFamily: Typography.fontBody,
    fontSize: Typography.base,
    color: Colors.accent,
  },
  done: {
    fontFamily: Typography.fontBodyMedium,
    fontSize: Typography.base,
    color: Colors.accent,
  },
  content: { padding: Spacing.base, gap: Spacing.base, paddingBottom: 40 },
  section: { gap: Spacing.xs },
  sectionTitle: {
    fontFamily: Typography.fontLabel,
    fontSize: Typography.xs,
    color: Colors.textSecondary,
    letterSpacing: Typography.widest,
    marginLeft: Spacing.xs,
  },
  card: {
    backgroundColor: Colors.surface,
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
  rowLabel: {
    fontFamily: Typography.fontBody,
    fontSize: Typography.base,
    color: Colors.textPrimary,
  },
  rowValue: {
    fontFamily: Typography.fontBody,
    fontSize: Typography.base,
    color: Colors.textSecondary,
  },
  fieldLabel: {
    fontFamily: Typography.fontLabel,
    fontSize: Typography.xs,
    color: Colors.textSecondary,
    letterSpacing: Typography.wider,
    marginBottom: Spacing.xs,
  },
  editableInput: {
    fontFamily: Typography.fontBody,
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
  segmentActive: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.accentBorder,
    ...Shadows.sm,
  },
  segmentText: {
    fontFamily: Typography.fontBody,
    fontSize: Typography.xs,
    color: Colors.textSecondary,
  },
  segmentTextActive: {
    fontFamily: Typography.fontBodyMedium,
    color: Colors.textPrimary,
  },
  disabledHint: {
    fontFamily: Typography.fontBody,
    fontSize: Typography.xs,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
  },
  codeRow: { flexDirection: "row", alignItems: "center", gap: Spacing.sm },
  shareCode: {
    fontFamily: Typography.fontDisplay,
    fontSize: Typography.base,
    color: Colors.textAccent,
    letterSpacing: 2,
  },
  memberRow: { flexDirection: "row", alignItems: "center", gap: Spacing.sm },
  rankText: {
    fontFamily: Typography.fontLabel,
    fontSize: Typography.xs,
    color: Colors.textAccent,
    width: 28,
  },
  memberName: {
    flex: 1,
    fontFamily: Typography.fontBody,
    fontSize: Typography.base,
    color: Colors.textPrimary,
  },
  memberNameMe: { fontFamily: Typography.fontBodyMedium },
  memberSteps: {
    fontFamily: Typography.fontBody,
    fontSize: Typography.sm,
    color: Colors.textSecondary,
  },
  viewAll: {
    fontFamily: Typography.fontBodyMedium,
    fontSize: Typography.sm,
    color: Colors.accent,
    textAlign: "center",
    paddingTop: Spacing.xs,
  },
  routeLabel: {
    fontFamily: Typography.fontLabel,
    fontSize: Typography.xs,
    color: Colors.textSecondary,
    letterSpacing: Typography.wider,
  },
  routeValue: {
    fontFamily: Typography.fontBody,
    fontSize: Typography.base,
    color: Colors.textPrimary,
    marginTop: 2,
  },
  editableRoute: { color: Colors.textAccent },
  iconRow: {
    flexDirection: "row",
    gap: Spacing.md,
    paddingVertical: Spacing.xs,
  },
  iconButton: {
    padding: Spacing.sm,
    borderRadius: Radius.full,
    backgroundColor: Colors.backgroundAlt,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  iconButtonActive: {
    backgroundColor: Colors.accentGlow,
    borderWidth: 2,
    borderColor: Colors.accent,
  },
  iconEmoji: { fontSize: 24 },
  deleteButton: { alignItems: "center", padding: Spacing.base },
  deleteText: {
    fontFamily: Typography.fontBodyMedium,
    fontSize: Typography.base,
    color: Colors.error,
  },
  searchInput: {
    fontFamily: Typography.fontBody,
    fontSize: Typography.base,
    color: Colors.textPrimary,
    backgroundColor: Colors.surfaceHigh,
    borderRadius: Radius.sm,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.md,
  },
  resultRow: {
    padding: Spacing.base,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
    backgroundColor: Colors.background,
  },
  resultName: {
    fontFamily: Typography.fontBodyMedium,
    fontSize: Typography.base,
    color: Colors.textPrimary,
  },
  resultFull: {
    fontFamily: Typography.fontBody,
    fontSize: Typography.xs,
    color: Colors.textSecondary,
    marginTop: 2,
  },
});
