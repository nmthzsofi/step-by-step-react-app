import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  ScrollView,
  StyleSheet,
  Platform,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import Slider from "@react-native-community/slider";
import { Picker } from "@react-native-picker/picker";
import { useAuthStore } from "../../store/authStore";
import { saveUserDetails, saveDisplayUnit } from "../../services/userService";
import { signOut } from "../../services/authService";
import {
  Colors,
  Typography,
  Spacing,
  Radius,
  Shadows,
} from "../../constants/theme";

const SEX_VALUES = ["Male", "Female", "Non-binary", "Other"];

export default function SettingsModal({ visible, onDismiss }) {
  const { t, i18n } = useTranslation();
  const store = useAuthStore();

  const SEX_OPTIONS = [
    { value: "Male", label: t("profile.male") },
    { value: "Female", label: t("profile.female") },
    { value: "Non-binary", label: t("profile.non_binary") },
    { value: "Other", label: t("profile.other") },
  ];

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [sex, setSex] = useState("Other");
  const [birthDate, setBirthDate] = useState(new Date());
  const [height, setHeight] = useState(170);
  const [weight, setWeight] = useState(70);
  const [displayUnit, setDisplayUnit] = useState("Steps");
  const [showSexPicker, setShowSexPicker] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!visible) return;
    setFirstName(store.firstName);
    setLastName(store.lastName);
    setSex(store.sex);
    setBirthDate(store.birthDate ? new Date(store.birthDate) : new Date());
    setHeight(store.userHeight);
    setWeight(store.userWeight);
    setDisplayUnit(store.displayUnit);
    setShowSexPicker(false);
    setShowDatePicker(false);
  }, [visible]);

  const handleSave = async () => {
    setIsSaving(true);
    const uid = store.firebaseUser?.uid;
    if (!uid) return;

    try {
      await saveUserDetails({
        uid,
        userName: store.userName,
        firstName,
        lastName,
        sex,
        birthDate,
        height,
        weight,
        totalStepsAllTime: store.totalStepsAllTime,
        hasTeamPlayerBadge: store.hasTeamPlayerBadge,
      });
      await saveDisplayUnit(uid, displayUnit);
      onDismiss();
    } catch (err) {
    } finally {
      setIsSaving(false);
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
          <TouchableOpacity onPress={onDismiss}>
            <Text style={styles.cancel}>{t("general.cancel")}</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t("profile.edit_profile")}</Text>
          <TouchableOpacity onPress={handleSave} disabled={isSaving}>
            <Text style={styles.done}>{isSaving ? t("general.saving") : t("general.done")}</Text>
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.content}>
          {/* Public Identity */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t("profile.public_identity").toUpperCase()}</Text>
            <View style={styles.card}>
              <View style={styles.fieldRow}>
                <Text style={styles.fieldLabel}>{t("profile.username")}</Text>
                <View style={styles.fieldRight}>
                  <Text style={styles.atSign}>@</Text>
                  <Text style={[styles.fieldInput, { color: Colors.textTertiary }]}>
                    {store.userName}
                  </Text>
                  <Ionicons name="lock-closed" size={13} color={Colors.textTertiary} style={{ marginLeft: 6 }} />
                </View>
              </View>
              <View style={styles.divider} />
              <View style={styles.fieldRow}>
                <Text style={styles.fieldLabel}>{t("profile.first_name")}</Text>
                <TextInput
                  style={[styles.fieldInput, styles.fieldInputRight]}
                  value={firstName}
                  onChangeText={setFirstName}
                  placeholder={t("general.required")}
                  placeholderTextColor={Colors.textTertiary}
                  autoCapitalize="words"
                />
              </View>
              <View style={styles.divider} />
              <View style={styles.fieldRow}>
                <Text style={styles.fieldLabel}>{t("profile.last_name")}</Text>
                <TextInput
                  style={[styles.fieldInput, styles.fieldInputRight]}
                  value={lastName}
                  onChangeText={setLastName}
                  placeholder={t("general.required")}
                  placeholderTextColor={Colors.textTertiary}
                  autoCapitalize="words"
                />
              </View>
            </View>
          </View>

          {/* Personal Details */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t("profile.personal_details").toUpperCase()}</Text>
            <View style={styles.card}>
              <TouchableOpacity
                style={styles.fieldRow}
                onPress={() => { setShowSexPicker((v) => !v); setShowDatePicker(false); }}
              >
                <Text style={styles.fieldLabel}>{t("profile.sex")}</Text>
                <Text style={styles.fieldValue}>{SEX_OPTIONS.find((o) => o.value === sex)?.label}</Text>
              </TouchableOpacity>
              {showSexPicker && (
                <Picker
                  selectedValue={sex}
                  onValueChange={(val) => { setSex(val); setShowSexPicker(false); }}
                  style={styles.picker}
                >
                  {SEX_OPTIONS.map((o) => (
                    <Picker.Item key={o.value} label={o.label} value={o.value} />
                  ))}
                </Picker>
              )}
              <View style={styles.divider} />
              <TouchableOpacity
                style={styles.fieldRow}
                onPress={() => { setShowDatePicker((v) => !v); setShowSexPicker(false); }}
              >
                <Text style={styles.fieldLabel}>{t("profile.birthdate")}</Text>
                <Text style={styles.fieldValue}>
                  {birthDate.toLocaleDateString()}
                </Text>
              </TouchableOpacity>
              {showDatePicker && (
                <DateTimePicker
                  value={birthDate}
                  mode="date"
                  display={Platform.OS === "ios" ? "spinner" : "default"}
                  maximumDate={new Date()}
                  locale={i18n.language}
                  onChange={(_, date) => {
                    setShowDatePicker(Platform.OS === "ios");
                    if (date) setBirthDate(date);
                  }}
                />
              )}
            </View>
          </View>

          {/* Physical Measurements */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t("fitness.physical_measurements").toUpperCase()}</Text>
            <View style={styles.card}>
              <Text style={styles.sliderLabel}>
                {t("fitness.height_cm", { count: Math.round(height) })}
              </Text>
              <Slider
                minimumValue={100}
                maximumValue={250}
                step={1}
                value={height}
                onValueChange={setHeight}
                minimumTrackTintColor={Colors.accent}
                maximumTrackTintColor={Colors.border}
                thumbTintColor={Colors.accent}
                style={styles.slider}
              />
              <View style={styles.divider} />
              <Text style={styles.sliderLabel}>
                {t("fitness.weight_kg", { count: Math.round(weight) })}
              </Text>
              <Slider
                minimumValue={30}
                maximumValue={200}
                step={1}
                value={weight}
                onValueChange={setWeight}
                minimumTrackTintColor={Colors.accent}
                maximumTrackTintColor={Colors.border}
                thumbTintColor={Colors.accent}
                style={styles.slider}
              />
            </View>
          </View>

          {/* App Preferences */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t("general.app_preferences").toUpperCase()}</Text>
            <View style={styles.card}>
              <Text style={styles.sliderLabel}>{t("general.display_unit")}</Text>
              <View style={styles.segmented}>
                {["Steps", "Kilometers"].map((unit) => (
                  <TouchableOpacity
                    key={unit}
                    style={[
                      styles.segment,
                      displayUnit === unit && styles.segmentActive,
                    ]}
                    onPress={() => setDisplayUnit(unit)}
                  >
                    <Text
                      style={[
                        styles.segmentText,
                        displayUnit === unit && styles.segmentTextActive,
                      ]}
                    >
                      {unit === "Steps" ? t("fitness.steps") : t("general.kilometers")}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>

          {/* Sign Out */}
          <View style={styles.section}>
            <View style={styles.card}>
              <TouchableOpacity
                style={styles.signOutRow}
                onPress={() => {
                  onDismiss();
                  signOut();
                }}
              >
                <Text style={styles.signOutText}>{t("auth.sign_out").toUpperCase()}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
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
  fieldRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    minHeight: 48,
  },
  fieldLabel: {
    fontFamily: Typography.fontBody,
    fontSize: Typography.base,
    color: Colors.textSecondary,
  },
  fieldRight: { flexDirection: "row", alignItems: "center" },
  atSign: {
    fontFamily: Typography.fontBody,
    fontSize: Typography.base,
    color: Colors.accent,
    marginRight: 2,
  },
  fieldInput: {
    fontFamily: Typography.fontBody,
    fontSize: Typography.base,
    color: Colors.textPrimary,
  },
  fieldInputRight: { textAlign: "right" },
  fieldValue: {
    fontFamily: Typography.fontBodyMedium,
    fontSize: Typography.base,
    color: Colors.textPrimary,
  },
  picker: { flex: 1, color: Colors.textPrimary },
  sliderLabel: {
    fontFamily: Typography.fontBodyMedium,
    fontSize: Typography.base,
    color: Colors.textPrimary,
  },
  slider: { width: "100%", height: 34 },
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
  signOutRow: { alignItems: "center", paddingVertical: Spacing.sm },
  signOutText: {
    fontFamily: Typography.fontLabel,
    fontSize: Typography.xs,
    color: Colors.error,
    letterSpacing: Typography.wider,
  },
});
