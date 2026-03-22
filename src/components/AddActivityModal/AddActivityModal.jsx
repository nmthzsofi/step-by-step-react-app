import { useTranslation } from "react-i18next";
import { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  ScrollView,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
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

const INTENSITY_KEYS = ["low", "medium", "high"];

export default function AddActivityModal({ visible, onDismiss }) {
  const { t } = useTranslation();
  const { firebaseUser, displayUnit } = useAuthStore();
  const goals = useGoalStore((s) => s.goals);

  const [selectedActivity, setSelectedActivity] = useState("running");
  const [duration, setDuration] = useState(30);
  const [intensity, setIntensity] = useState(1);
  const [dailyLimitReached, setDailyLimitReached] = useState(false);

  const calculatedSteps = calculateSteps(selectedActivity, duration, intensity);

  const handleAdd = async () => {
    if (!firebaseUser?.uid || goals.length === 0) return;
    try {
      await addSteps(calculatedSteps, firebaseUser.uid);
      onDismiss();
    } catch (err) {
      if (err?.code === "permission-denied") {
        setDailyLimitReached(true);
      }
    }
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
          <Text style={styles.title}>{t("fitness.new_activity")}</Text>
          <TouchableOpacity onPress={onDismiss}>
            <Text style={styles.cancel}>{t("general.cancel")}</Text>
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.content}>
          {/* Activity type picker */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t("fitness.exercise_details").toUpperCase()}</Text>
            <View style={styles.card}>
              <Text style={styles.fieldLabel}>{t("fitness.activity")}</Text>
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
                      {t(`fitness.${a.key}`)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <View style={styles.divider} />

              {/* Duration slider */}
              <Text style={styles.fieldLabel}>
                {t("fitness.duration_minutes", { count: Math.round(duration) })}
              </Text>
              <Slider
                minimumValue={5}
                maximumValue={120}
                step={5}
                value={duration}
                onValueChange={setDuration}
                minimumTrackTintColor={Colors.accent}
                maximumTrackTintColor={Colors.border}
                thumbTintColor={Colors.accent}
                style={styles.slider}
              />

              <View style={styles.divider} />

              {/* Intensity segmented control */}
              <Text style={styles.fieldLabel}>{t("fitness.intensity")}</Text>
              <View style={styles.segmented}>
                {INTENSITY_KEYS.map((key, i) => (
                  <TouchableOpacity
                    key={key}
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
                      {t(`fitness.${key}`)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>

          {/* Estimated progress */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t("progress.estimated_progress").toUpperCase()}</Text>
            <View style={styles.card}>
              <View style={styles.estimateRow}>
                <Ionicons name="walk" size={22} color={Colors.accent} />
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
              (goals.length === 0 || dailyLimitReached) && styles.submitButtonDisabled,
            ]}
            onPress={handleAdd}
            disabled={goals.length === 0 || dailyLimitReached}
            activeOpacity={0.85}
          >
            <Text style={styles.submitText}>
              {dailyLimitReached
                ? t("fitness.daily_limit_reached").toUpperCase()
                : t("fitness.add_steps").toUpperCase()}
            </Text>
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
  content: {
    padding: Spacing.base,
    gap: Spacing.base,
    paddingBottom: 40,
  },
  section: {
    gap: Spacing.xs,
  },
  sectionTitle: {
    fontFamily: Typography.fontLabel,
    fontSize: Typography.xs,
    color: Colors.textSecondary,
    letterSpacing: Typography.widest,
    marginLeft: Spacing.xs,
    marginBottom: Spacing.xs,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    padding: Spacing.base,
    gap: Spacing.md,
    ...Shadows.sm,
  },
  fieldLabel: {
    fontFamily: Typography.fontBodyMedium,
    fontSize: Typography.base,
    color: Colors.textPrimary,
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
    borderWidth: 1,
    borderColor: Colors.border,
  },
  activityChipActive: {
    backgroundColor: Colors.accent,
    borderColor: Colors.accent,
  },
  activityChipText: {
    fontFamily: Typography.fontBody,
    fontSize: Typography.sm,
    color: Colors.textSecondary,
  },
  activityChipTextActive: {
    fontFamily: Typography.fontBodyMedium,
    color: Colors.textInverse,
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
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.accentBorder,
    ...Shadows.sm,
  },
  segmentText: {
    fontFamily: Typography.fontBody,
    fontSize: Typography.sm,
    color: Colors.textSecondary,
  },
  segmentTextActive: {
    fontFamily: Typography.fontBodyMedium,
    color: Colors.textPrimary,
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
  estimateText: {
    fontFamily: Typography.fontDisplay,
    fontSize: Typography.xl,
    color: Colors.textAccent,
    letterSpacing: Typography.tight,
  },
  submitButton: {
    backgroundColor: Colors.accent,
    borderRadius: Radius.sm,
    height: 52,
    alignItems: "center",
    justifyContent: "center",
    marginTop: Spacing.sm,
  },
  submitButtonDisabled: {
    backgroundColor: Colors.disabled,
  },
  submitText: {
    fontFamily: Typography.fontLabel,
    fontSize: Typography.xs,
    color: Colors.textInverse,
    letterSpacing: Typography.widest,
  },
});
