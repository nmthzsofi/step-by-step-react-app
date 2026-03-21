import { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  ScrollView,
  StyleSheet,
} from "react-native";
import Slider from "@react-native-community/slider";
import { useAuthStore } from "../../store/authStore";
import { useGoalStore } from "../../store/goalStore";
import { addSteps } from "../../services/goalService";
import { formatProgress } from "../../utils/formatters";
import { ActivityTypes, calculateSteps } from "../../constants/activityTypes";
import {
  Colors,
  Typography,
  Spacing,
  Radius,
  Shadows,
} from "../../constants/theme";

const INTENSITIES = ["Low", "Medium", "High"];

export default function AddActivityModal({ visible, onDismiss }) {
  const { firebaseUser, displayUnit } = useAuthStore();
  const goals = useGoalStore((s) => s.goals);

  const [selectedActivity, setSelectedActivity] = useState("running");
  const [duration, setDuration] = useState(30);
  const [intensity, setIntensity] = useState(1);

  const calculatedSteps = calculateSteps(selectedActivity, duration, intensity);

  const handleAdd = async () => {
    if (!firebaseUser?.uid || goals.length === 0) return;
    await addSteps(calculatedSteps, firebaseUser.uid);
    onDismiss();
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
          <Text style={styles.title}>New Activity</Text>
          <TouchableOpacity onPress={onDismiss}>
            <Text style={styles.cancel}>Cancel</Text>
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.content}>
          {/* Activity type picker */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>EXERCISE DETAILS</Text>
            <View style={styles.card}>
              <Text style={styles.fieldLabel}>Activity</Text>
              <View style={styles.activityGrid}>
                {ActivityTypes.map((a) => (
                  <TouchableOpacity
                    key={a.key}
                    style={[
                      styles.activityChip,
                      selectedActivity === a.key && styles.activityChipActive,
                    ]}
                    onPress={() => setSelectedActivity(a.key)}
                  >
                    <Text
                      style={[
                        styles.activityChipText,
                        selectedActivity === a.key &&
                          styles.activityChipTextActive,
                      ]}
                    >
                      {a.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <View style={styles.divider} />

              {/* Duration slider */}
              <Text style={styles.fieldLabel}>
                Duration: {Math.round(duration)} minutes
              </Text>
              <Slider
                minimumValue={5}
                maximumValue={120}
                step={5}
                value={duration}
                onValueChange={setDuration}
                minimumTrackTintColor={Colors.primary}
                maximumTrackTintColor={Colors.border}
                thumbTintColor={Colors.primary}
                style={styles.slider}
              />

              <View style={styles.divider} />

              {/* Intensity segmented control */}
              <Text style={styles.fieldLabel}>Intensity</Text>
              <View style={styles.segmented}>
                {INTENSITIES.map((label, i) => (
                  <TouchableOpacity
                    key={label}
                    style={[
                      styles.segment,
                      intensity === i && styles.segmentActive,
                    ]}
                    onPress={() => setIntensity(i)}
                  >
                    <Text
                      style={[
                        styles.segmentText,
                        intensity === i && styles.segmentTextActive,
                      ]}
                    >
                      {label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>

          {/* Estimated progress */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>ESTIMATED PROGRESS</Text>
            <View style={styles.card}>
              <View style={styles.estimateRow}>
                <Text style={styles.footprint}>👟</Text>
                <Text style={styles.estimateText}>
                  {formatProgress(calculatedSteps, displayUnit)}
                </Text>
              </View>
            </View>
          </View>

          {/* Submit */}
          <TouchableOpacity
            style={[
              styles.submitButton,
              goals.length === 0 && styles.submitButtonDisabled,
            ]}
            onPress={handleAdd}
            disabled={goals.length === 0}
            activeOpacity={0.85}
          >
            <Text style={styles.submitText}>Add Steps</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.backgroundAlt,
  },
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
  title: {
    fontSize: Typography.md,
    fontWeight: "700",
    color: Colors.textPrimary,
  },
  cancel: {
    fontSize: Typography.base,
    color: Colors.primary,
  },
  content: {
    padding: Spacing.base,
    gap: Spacing.base,
    paddingBottom: 40,
  },
  section: {
    gap: Spacing.xs,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: "700",
    color: Colors.textSecondary,
    letterSpacing: 0.5,
    marginLeft: Spacing.xs,
    marginBottom: Spacing.xs,
  },
  card: {
    backgroundColor: Colors.background,
    borderRadius: Radius.md,
    padding: Spacing.base,
    gap: Spacing.md,
    ...Shadows.sm,
  },
  fieldLabel: {
    fontSize: Typography.base,
    color: Colors.textPrimary,
    fontWeight: "500",
  },
  activityGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
  },
  activityChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.full,
    backgroundColor: Colors.backgroundAlt,
  },
  activityChipActive: {
    backgroundColor: Colors.primary,
  },
  activityChipText: {
    fontSize: Typography.sm,
    color: Colors.textSecondary,
    fontWeight: "500",
  },
  activityChipTextActive: {
    color: Colors.textInverse,
    fontWeight: "700",
  },
  slider: {
    width: "100%",
    height: 34,
  },
  segmented: {
    flexDirection: "row",
    backgroundColor: Colors.backgroundAlt,
    borderRadius: Radius.sm,
    padding: 2,
  },
  segment: {
    flex: 1,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.sm - 2,
    alignItems: "center",
  },
  segmentActive: {
    backgroundColor: Colors.background,
    ...Shadows.sm,
  },
  segmentText: {
    fontSize: Typography.sm,
    color: Colors.textSecondary,
    fontWeight: "500",
  },
  segmentTextActive: {
    color: Colors.textPrimary,
    fontWeight: "700",
  },
  divider: {
    height: 1,
    backgroundColor: Colors.divider,
  },
  estimateRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  footprint: {
    fontSize: 20,
  },
  estimateText: {
    fontSize: Typography.md,
    fontWeight: "700",
    color: Colors.primary,
  },
  submitButton: {
    backgroundColor: Colors.textPrimary,
    borderRadius: Radius.lg,
    height: 55,
    alignItems: "center",
    justifyContent: "center",
    marginTop: Spacing.sm,
  },
  submitButtonDisabled: {
    backgroundColor: Colors.disabled,
  },
  submitText: {
    fontSize: Typography.base,
    fontWeight: "700",
    color: Colors.textInverse,
  },
});
