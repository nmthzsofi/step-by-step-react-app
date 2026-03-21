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
  Switch,
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

const SEX_OPTIONS = ["Male", "Female", "Non-binary", "Other"];

export default function SettingsModal({ visible, onDismiss }) {
  const store = useAuthStore();

  const [userName, setUserName] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [sex, setSex] = useState("Other");
  const [birthDate, setBirthDate] = useState(new Date());
  const [height, setHeight] = useState(170);
  const [weight, setWeight] = useState(70);
  const [displayUnit, setDisplayUnit] = useState("Steps");
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!visible) return;
    setUserName(store.userName);
    setFirstName(store.firstName);
    setLastName(store.lastName);
    setSex(store.sex);
    setBirthDate(store.birthDate ? new Date(store.birthDate) : new Date());
    setHeight(store.userHeight);
    setWeight(store.userWeight);
    setDisplayUnit(store.displayUnit);
  }, [visible]);

  const handleSave = async () => {
    setIsSaving(true);
    const uid = store.firebaseUser?.uid;
    if (!uid) return;

    try {
      await saveUserDetails({
        uid,
        userName,
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
      console.error("Settings save error:", err);
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
            <Text style={styles.cancel}>Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Edit Profile</Text>
          <TouchableOpacity onPress={handleSave} disabled={isSaving}>
            <Text style={styles.done}>{isSaving ? "Saving..." : "Done"}</Text>
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.content}>
          {/* Public Identity */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>PUBLIC IDENTITY</Text>
            <View style={styles.card}>
              <View style={styles.fieldRow}>
                <Text style={styles.fieldLabel}>Username</Text>
                <View style={styles.fieldRight}>
                  <Text style={styles.atSign}>@</Text>
                  <TextInput
                    style={styles.fieldInput}
                    value={userName}
                    onChangeText={setUserName}
                    autoCapitalize="none"
                    autoCorrect={false}
                    placeholder="username"
                    placeholderTextColor={Colors.textTertiary}
                  />
                </View>
              </View>
              <View style={styles.divider} />
              <View style={styles.fieldRow}>
                <Text style={styles.fieldLabel}>First Name</Text>
                <TextInput
                  style={[styles.fieldInput, styles.fieldInputRight]}
                  value={firstName}
                  onChangeText={setFirstName}
                  placeholder="Required"
                  placeholderTextColor={Colors.textTertiary}
                  autoCapitalize="words"
                />
              </View>
              <View style={styles.divider} />
              <View style={styles.fieldRow}>
                <Text style={styles.fieldLabel}>Last Name</Text>
                <TextInput
                  style={[styles.fieldInput, styles.fieldInputRight]}
                  value={lastName}
                  onChangeText={setLastName}
                  placeholder="Required"
                  placeholderTextColor={Colors.textTertiary}
                  autoCapitalize="words"
                />
              </View>
            </View>
          </View>

          {/* Personal Details */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>PERSONAL DETAILS</Text>
            <View style={styles.card}>
              <View style={styles.fieldRow}>
                <Text style={styles.fieldLabel}>Sex</Text>
                <Picker
                  selectedValue={sex}
                  onValueChange={setSex}
                  style={styles.picker}
                >
                  {SEX_OPTIONS.map((o) => (
                    <Picker.Item key={o} label={o} value={o} />
                  ))}
                </Picker>
              </View>
              <View style={styles.divider} />
              <TouchableOpacity
                style={styles.fieldRow}
                onPress={() => setShowDatePicker(true)}
              >
                <Text style={styles.fieldLabel}>Birthdate</Text>
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
            <Text style={styles.sectionTitle}>PHYSICAL MEASUREMENTS</Text>
            <View style={styles.card}>
              <Text style={styles.sliderLabel}>
                Height: {Math.round(height)} cm
              </Text>
              <Slider
                minimumValue={100}
                maximumValue={250}
                step={1}
                value={height}
                onValueChange={setHeight}
                minimumTrackTintColor={Colors.primary}
                maximumTrackTintColor={Colors.border}
                thumbTintColor={Colors.primary}
                style={styles.slider}
              />
              <View style={styles.divider} />
              <Text style={styles.sliderLabel}>
                Weight: {Math.round(weight)} kg
              </Text>
              <Slider
                minimumValue={30}
                maximumValue={200}
                step={1}
                value={weight}
                onValueChange={setWeight}
                minimumTrackTintColor={Colors.primary}
                maximumTrackTintColor={Colors.border}
                thumbTintColor={Colors.primary}
                style={styles.slider}
              />
            </View>
          </View>

          {/* App Preferences */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>APP PREFERENCES</Text>
            <View style={styles.card}>
              <Text style={styles.sliderLabel}>Display Unit</Text>
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
                      {unit}
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
                <Text style={styles.signOutText}>Sign Out</Text>
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
  fieldRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    minHeight: 44,
  },
  fieldLabel: { fontSize: Typography.base, color: Colors.textSecondary },
  fieldRight: { flexDirection: "row", alignItems: "center" },
  atSign: { fontSize: Typography.base, color: Colors.primary, marginRight: 2 },
  fieldInput: { fontSize: Typography.base, color: Colors.textPrimary },
  fieldInputRight: { textAlign: "right" },
  fieldValue: {
    fontSize: Typography.base,
    color: Colors.textPrimary,
    fontWeight: "500",
  },
  picker: { flex: 1, color: Colors.textPrimary },
  sliderLabel: {
    fontSize: Typography.base,
    color: Colors.textPrimary,
    fontWeight: "500",
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
  segmentActive: { backgroundColor: Colors.background, ...Shadows.sm },
  segmentText: {
    fontSize: Typography.sm,
    color: Colors.textSecondary,
    fontWeight: "500",
  },
  segmentTextActive: { color: Colors.textPrimary, fontWeight: "700" },
  signOutRow: { alignItems: "center", paddingVertical: Spacing.sm },
  signOutText: {
    fontSize: Typography.base,
    color: Colors.error,
    fontWeight: "600",
  },
});
