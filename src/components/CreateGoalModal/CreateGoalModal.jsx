import { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  ScrollView,
  FlatList,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import * as Clipboard from "expo-clipboard";
import debounce from "lodash.debounce";
import { useAuthStore } from "../../store/authStore";
import { saveGoal } from "../../services/goalService";
import { searchLocations, calculateSteps } from "../../utils/location";
import { generateShareCode } from "../../utils/formatters";
import {
  Colors,
  Typography,
  Spacing,
  Radius,
  Shadows,
} from "../../constants/theme";

const ICONS = ["🚶", "🏖️", "⛰️", "✈️", "🚴", "⛺"];
const GOAL_TYPES = ["individual", "cooperative", "race"];
const GOAL_TYPE_LABELS = {
  individual: "Individual",
  cooperative: "Cooperative",
  race: "Race",
};

const DEFAULT_START = { latitude: 47.4979, longitude: 19.0402 }; // Budapest

export default function CreateGoalModal({ visible, onDismiss }) {
  const { firebaseUser, currentUserProfile } = useAuthStore();

  const [goalName, setGoalName] = useState("");
  const [selectedIcon, setSelectedIcon] = useState("🚶");
  const [selectedType, setSelectedType] = useState("individual");
  const [shareCode, setShareCode] = useState("");
  const [fromText, setFromText] = useState("");
  const [toText, setToText] = useState("");
  const [fromCoord, setFromCoord] = useState(null);
  const [toCoord, setToCoord] = useState(null);
  const [searchResults, setSearchResults] = useState([]);
  const [activeField, setActiveField] = useState("to");
  const [isCreating, setIsCreating] = useState(false);

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

  const estimatedSteps =
    fromCoord && toCoord
      ? calculateSteps(fromCoord ?? DEFAULT_START, toCoord)
      : toCoord
        ? calculateSteps(DEFAULT_START, toCoord)
        : 0;

  const canCreate = toCoord && goalName.trim().length > 0;

  useEffect(() => {
    if (selectedType !== "individual" && !shareCode) {
      setShareCode(generateShareCode());
    }
  }, [selectedType]);

  const handleSearch = (query, field) => {
    setActiveField(field);
    if (field === "from") setFromText(query);
    else setToText(query);
    debouncedSearch(query, setSearchResults);
  };

  const selectLocation = (item) => {
    const coord = { latitude: item.latitude, longitude: item.longitude };
    if (activeField === "from") {
      setFromCoord(coord);
      setFromText(item.name);
    } else {
      setToCoord(coord);
      setToText(item.name);
      if (!goalName) setGoalName(item.name);
    }
    setSearchResults([]);
  };

  const handleCreate = async () => {
    if (!canCreate || !currentUserProfile) return;
    setIsCreating(true);

    const startCoord = fromCoord ?? DEFAULT_START;

    const newGoal = {
      name: goalName.trim(),
      startCoordinate: startCoord,
      coordinates: toCoord,
      totalSteps: estimatedSteps,
      currentSteps: 0,
      icon: selectedIcon,
      isGroupGoal: selectedType !== "individual",
      shareCode: selectedType !== "individual" ? shareCode : "",
      type: selectedType,
      isFullyCompleted: false,
      hasShownCelebration: false,
      members: [
        {
          id: firebaseUser?.uid,
          firstName: currentUserProfile.firstName,
          steps: 0,
          hasFinished: false,
        },
      ],
    };

    try {
      await saveGoal(newGoal);
      resetForm();
      onDismiss();
    } catch (err) {
      console.error("Create goal error:", err);
    } finally {
      setIsCreating(false);
    }
  };

  const resetForm = () => {
    setGoalName("");
    setSelectedIcon("🚶");
    setSelectedType("individual");
    setShareCode("");
    setFromText("");
    setToText("");
    setFromCoord(null);
    setToCoord(null);
    setSearchResults([]);
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => {
              resetForm();
              onDismiss();
            }}
          >
            <Text style={styles.cancel}>Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>New Journey</Text>
          <View style={{ width: 60 }} />
        </View>

        {/* Search fields */}
        <View style={styles.searchBlock}>
          <View style={styles.searchRow}>
            <Text style={styles.searchDot}>🔵</Text>
            <TextInput
              style={styles.searchInput}
              placeholder="From... (optional)"
              placeholderTextColor={Colors.textTertiary}
              value={fromText}
              onChangeText={(v) => handleSearch(v, "from")}
              onFocus={() => setActiveField("from")}
              autoCorrect={false}
            />
          </View>
          <View style={styles.searchRow}>
            <Text style={styles.searchDot}>📍</Text>
            <TextInput
              style={styles.searchInput}
              placeholder="To..."
              placeholderTextColor={Colors.textTertiary}
              value={toText}
              onChangeText={(v) => handleSearch(v, "to")}
              onFocus={() => setActiveField("to")}
              autoCorrect={false}
            />
          </View>
        </View>

        {/* Search results */}
        {searchResults.length > 0 ? (
          <FlatList
            data={searchResults}
            keyExtractor={(_, i) => i.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.resultRow}
                onPress={() => selectLocation(item)}
              >
                <Text style={styles.resultName}>{item.name}</Text>
                <Text style={styles.resultFull} numberOfLines={1}>
                  {item.fullName}
                </Text>
              </TouchableOpacity>
            )}
          />
        ) : (
          <ScrollView contentContainerStyle={styles.formContent}>
            {/* Journey name */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>JOURNEY DETAILS</Text>
              <View style={styles.card}>
                <TextInput
                  style={styles.nameInput}
                  placeholder="Name your trip (e.g. Summer Trek)"
                  placeholderTextColor={Colors.textTertiary}
                  value={goalName}
                  onChangeText={setGoalName}
                  autoCorrect={false}
                />
              </View>
            </View>

            {/* Journey type */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>JOURNEY TYPE</Text>
              <View style={styles.segmented}>
                {GOAL_TYPES.map((type) => (
                  <TouchableOpacity
                    key={type}
                    style={[
                      styles.segment,
                      selectedType === type && styles.segmentActive,
                    ]}
                    onPress={() => setSelectedType(type)}
                  >
                    <Text
                      style={[
                        styles.segmentText,
                        selectedType === type && styles.segmentTextActive,
                      ]}
                    >
                      {GOAL_TYPE_LABELS[type]}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Share code */}
            {selectedType !== "individual" && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>INVITE FRIENDS</Text>
                <View style={styles.card}>
                  <Text style={styles.shareCaption}>
                    Share this code with friends to let them join this{" "}
                    {selectedType} journey.
                  </Text>
                  <View style={styles.shareRow}>
                    <Text style={styles.shareCode}>{shareCode}</Text>
                    <TouchableOpacity
                      style={styles.copyButton}
                      onPress={() => Clipboard.setStringAsync(shareCode)}
                    >
                      <Text style={styles.copyButtonText}>Copy</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            )}

            {/* Icon picker */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>CHOOSE AN ICON</Text>
              <View style={styles.card}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View style={styles.iconRow}>
                    {ICONS.map((icon) => (
                      <TouchableOpacity
                        key={icon}
                        style={[
                          styles.iconButton,
                          selectedIcon === icon && styles.iconButtonActive,
                        ]}
                        onPress={() => setSelectedIcon(icon)}
                      >
                        <Text style={styles.iconEmoji}>{icon}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </ScrollView>
              </View>
            </View>

            {/* Summary */}
            {toCoord && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>SUMMARY</Text>
                <View style={styles.card}>
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Estimated Distance</Text>
                    <Text style={styles.summaryValue}>
                      {estimatedSteps.toLocaleString()} steps
                    </Text>
                  </View>
                </View>
              </View>
            )}
          </ScrollView>
        )}

        {/* Create button */}
        {canCreate && searchResults.length === 0 && (
          <TouchableOpacity
            style={[
              styles.createButton,
              isCreating && styles.createButtonDisabled,
            ]}
            onPress={handleCreate}
            disabled={isCreating}
            activeOpacity={0.85}
          >
            {isCreating ? (
              <ActivityIndicator color={Colors.textInverse} />
            ) : (
              <Text style={styles.createButtonText}>Create Journey</Text>
            )}
          </TouchableOpacity>
        )}
      </View>
    </Modal>
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
  cancel: { fontSize: Typography.base, color: Colors.primary, width: 60 },
  searchBlock: {
    backgroundColor: Colors.background,
    padding: Spacing.base,
    gap: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.backgroundAlt,
    borderRadius: Radius.sm,
    paddingHorizontal: Spacing.sm,
    gap: Spacing.sm,
  },
  searchDot: { fontSize: 16 },
  searchInput: {
    flex: 1,
    height: 44,
    fontSize: Typography.base,
    color: Colors.textPrimary,
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
  formContent: { padding: Spacing.base, gap: Spacing.base, paddingBottom: 100 },
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
  nameInput: { fontSize: Typography.base, color: Colors.textPrimary },
  segmented: {
    flexDirection: "row",
    backgroundColor: Colors.backgroundAlt,
    borderRadius: Radius.sm,
    padding: 2,
  },
  segment: {
    flex: 1,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.sm - 2,
    alignItems: "center",
  },
  segmentActive: { backgroundColor: Colors.background, ...Shadows.sm },
  segmentText: {
    fontSize: Typography.sm,
    color: Colors.textSecondary,
    fontWeight: "500",
  },
  segmentTextActive: { color: Colors.textPrimary, fontWeight: "700" },
  shareCaption: {
    fontSize: Typography.xs,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  shareRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  shareCode: {
    fontSize: 24,
    fontWeight: "700",
    fontFamily: "monospace",
    color: Colors.primary,
    letterSpacing: 4,
  },
  copyButton: {
    backgroundColor: Colors.backgroundAlt,
    borderRadius: Radius.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
  },
  copyButtonText: {
    fontSize: Typography.sm,
    color: Colors.primary,
    fontWeight: "600",
  },
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
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  summaryLabel: { fontSize: Typography.base, color: Colors.textPrimary },
  summaryValue: {
    fontSize: Typography.base,
    fontWeight: "700",
    color: Colors.textPrimary,
  },
  createButton: {
    margin: Spacing.base,
    backgroundColor: Colors.textPrimary,
    borderRadius: Radius.lg,
    height: 55,
    alignItems: "center",
    justifyContent: "center",
    ...Shadows.md,
  },
  createButtonDisabled: { backgroundColor: Colors.disabled },
  createButtonText: {
    color: Colors.textInverse,
    fontSize: Typography.base,
    fontWeight: "700",
  },
});
