import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  ActivityIndicator,
  Platform,
} from "react-native";
import Slider from "@react-native-community/slider";
import { Picker } from "@react-native-picker/picker";
import DateTimePicker from "@react-native-community/datetimepicker";
import * as ImagePicker from "expo-image-picker";
import { Ionicons } from "@expo/vector-icons";
import { auth } from "../../services/firebase";

import {
  saveProfile,
  saveUserDetails,
  saveProfileImage,
  completeOnboarding,
} from "../../services/userService";
import { useAuthStore } from "../../store/authStore";
import { useTranslation } from "react-i18next";
import { Colors } from "../../constants/theme";
import styles from "./OnboardingScreen.styles";

const defaultBirthDate = () => {
  const d = new Date();
  d.setFullYear(d.getFullYear() - 20);
  return d;
};

export default function OnboardingScreen() {
  const { t, i18n } = useTranslation();
  const { userName, totalStepsAllTime, hasTeamPlayerBadge } = useAuthStore();

  const SEX_OPTIONS = [
    { value: "Male", label: t("profile.male") },
    { value: "Female", label: t("profile.female") },
    { value: "Non-binary", label: t("profile.non_binary") },
    { value: "Other", label: t("profile.other") },
  ];

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [selectedSex, setSelectedSex] = useState("Female");
  const [birthDate, setBirthDate] = useState(defaultBirthDate());
  const [height, setHeight] = useState(170);
  const [weight, setWeight] = useState(70);
  const [imageUri, setImageUri] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [showSexPicker, setShowSexPicker] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const formIsValid = firstName.trim().length > 0 && lastName.trim().length > 0;

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled) setImageUri(result.assets[0].uri);
  };

  const handleCompleteOnboarding = async () => {
    setIsLoading(true);
    setErrorMessage("");

    const uid = auth.currentUser?.uid;
    if (!uid) {
      setErrorMessage("Authentication error. Please sign out and try again.");
      setIsLoading(false);
      return;
    }

    try {
      await saveProfile({ uid, firstName, steps: 0, hasFinished: false });

      await saveUserDetails({
        uid,
        userName,
        firstName,
        lastName,
        sex: selectedSex,
        birthDate,
        height,
        weight,
        totalStepsAllTime,
        hasTeamPlayerBadge,
      });

      if (imageUri) await saveProfileImage(uid, imageUri);

      await completeOnboarding(uid);
    } catch (err) {
      setErrorMessage(t("general.save_failed"));
      console.error("Onboarding error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.inner}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      {/* Header & Avatar */}
      <View style={styles.header}>
        <Text style={styles.title}>{t("profile.create_profile")}</Text>
        <TouchableOpacity style={styles.avatarWrapper} onPress={pickImage}>
          {imageUri ? (
            <Image source={{ uri: imageUri }} style={styles.avatarImage} />
          ) : (
            <Ionicons name="person" size={44} color={Colors.textTertiary} />
          )}
        </TouchableOpacity>
      </View>

      {/* Form Fields */}
      <View style={styles.form}>
        {/* First Name */}
        <View style={styles.fieldRow}>
          <Ionicons name="person-outline" size={20} color={Colors.accent} />
          <TextInput
            style={styles.input}
            placeholder={t("profile.first_name")}
            placeholderTextColor={Colors.textTertiary}
            value={firstName}
            onChangeText={setFirstName}
            autoCorrect={false}
            autoCapitalize="words"
          />
        </View>

        {/* Last Name */}
        <View style={styles.fieldRow}>
          <Ionicons name="person-outline" size={20} color={Colors.accent} />
          <TextInput
            style={styles.input}
            placeholder={t("profile.last_name")}
            placeholderTextColor={Colors.textTertiary}
            value={lastName}
            onChangeText={setLastName}
            autoCorrect={false}
            autoCapitalize="words"
          />
        </View>

        {/* Sex Picker */}
        <TouchableOpacity
          style={styles.dateCard}
          onPress={() => { setShowSexPicker((v) => !v); setShowDatePicker(false); }}
        >
          <Text style={styles.pickerLabel}>
            {t("profile.sex")}: {SEX_OPTIONS.find((o) => o.value === selectedSex)?.label}
          </Text>
        </TouchableOpacity>
        {showSexPicker && (
          <Picker
            selectedValue={selectedSex}
            onValueChange={(val) => { setSelectedSex(val); setShowSexPicker(false); }}
            style={styles.picker}
          >
            {SEX_OPTIONS.map((opt) => (
              <Picker.Item key={opt.value} label={opt.label} value={opt.value} />
            ))}
          </Picker>
        )}

        {/* Birthdate */}
        <TouchableOpacity
          style={styles.dateCard}
          onPress={() => { setShowDatePicker((v) => !v); setShowSexPicker(false); }}
        >
          <Text style={styles.pickerLabel}>
            {t("profile.birthdate")}: {birthDate.toLocaleDateString()}
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

        {/* Height & Weight Sliders */}
        <View style={styles.sliderCard}>
          <View style={styles.sliderRow}>
            <Text style={styles.sliderLabel}>
              {t("fitness.height_cm", { count: Math.round(height) })}
            </Text>
            <Slider
              style={styles.slider}
              minimumValue={100}
              maximumValue={250}
              step={1}
              value={height}
              onValueChange={setHeight}
              minimumTrackTintColor={Colors.accent}
              maximumTrackTintColor={Colors.border}
              thumbTintColor={Colors.accent}
            />
          </View>
          <View style={styles.sliderRow}>
            <Text style={styles.sliderLabel}>
              {t("fitness.weight_kg", { count: Math.round(weight) })}
            </Text>
            <Slider
              style={styles.slider}
              minimumValue={30}
              maximumValue={200}
              step={1}
              value={weight}
              onValueChange={setWeight}
              minimumTrackTintColor={Colors.accent}
              maximumTrackTintColor={Colors.border}
              thumbTintColor={Colors.accent}
            />
          </View>
        </View>
      </View>

      {/* Error */}
      {errorMessage.length > 0 && (
        <Text style={styles.errorText}>{errorMessage}</Text>
      )}

      {/* Submit */}
      <TouchableOpacity
        style={[
          styles.primaryButton,
          { backgroundColor: formIsValid ? Colors.accent : Colors.disabled },
        ]}
        onPress={handleCompleteOnboarding}
        disabled={!formIsValid || isLoading}
        activeOpacity={0.85}
      >
        {isLoading ? (
          <ActivityIndicator color={Colors.textInverse} />
        ) : (
          <Text style={styles.primaryButtonText}>{t("journey.start_journey").toUpperCase()}</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}
