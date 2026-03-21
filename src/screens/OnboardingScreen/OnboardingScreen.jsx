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
import { Colors } from "../../constants/theme";
import styles from "./OnboardingScreen.styles";

const SEX_OPTIONS = ["Male", "Female", "Non-binary", "Other"];

const defaultBirthDate = () => {
  const d = new Date();
  d.setFullYear(d.getFullYear() - 20);
  return d;
};

export default function OnboardingScreen() {
  const { userName, totalStepsAllTime, hasTeamPlayerBadge } = useAuthStore();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [selectedSex, setSelectedSex] = useState("Other");
  const [birthDate, setBirthDate] = useState(defaultBirthDate());
  const [height, setHeight] = useState(170);
  const [weight, setWeight] = useState(70);
  const [imageUri, setImageUri] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
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
      // Mirror Swift: saveProfile → saveUserDetails → mark onboarding complete
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
      // authStore.hasCompletedOnboarding = true → _layout.jsx routes to (tabs)
    } catch (err) {
      setErrorMessage("Failed to save profile. Please try again.");
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
      {/* Header & Avatar — mirrors SwiftUI PhotosPicker block */}
      <View style={styles.header}>
        <Text style={styles.title}>Create Profile</Text>
        <TouchableOpacity style={styles.avatarWrapper} onPress={pickImage}>
          {imageUri ? (
            <Image source={{ uri: imageUri }} style={styles.avatarImage} />
          ) : (
            <Text style={styles.avatarPlaceholderIcon}>👤</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Form Fields */}
      <View style={styles.form}>
        {/* First Name */}
        <View style={styles.fieldRow}>
          <Ionicons name="person" size={20} color={Colors.primary} />
          <TextInput
            style={styles.input}
            placeholder="First Name"
            placeholderTextColor={Colors.textTertiary}
            value={firstName}
            onChangeText={setFirstName}
            autoCorrect={false}
            autoCapitalize="words"
          />
        </View>

        {/* Last Name */}
        <View style={styles.fieldRow}>
          <Ionicons name="person" size={20} color={Colors.primary} />
          <TextInput
            style={styles.input}
            placeholder="Last Name"
            placeholderTextColor={Colors.textTertiary}
            value={lastName}
            onChangeText={setLastName}
            autoCorrect={false}
            autoCapitalize="words"
          />
        </View>

        {/* Sex Picker — mirrors SwiftUI Picker(.menu) */}
        <View style={styles.pickerRow}>
          <Ionicons name="people" size={20} color={Colors.primary} />
          <Picker
            selectedValue={selectedSex}
            onValueChange={setSelectedSex}
            style={styles.picker}
          >
            {SEX_OPTIONS.map((opt) => (
              <Picker.Item key={opt} label={opt} value={opt} />
            ))}
          </Picker>
        </View>

        {/* Birthdate — mirrors SwiftUI DatePicker */}
        <TouchableOpacity
          style={styles.dateCard}
          onPress={() => setShowDatePicker(true)}
        >
          <Text style={styles.pickerLabel}>
            Birthdate: {birthDate.toLocaleDateString()}
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

        {/* Height & Weight Sliders — mirrors SwiftUI Slider blocks */}
        <View style={styles.sliderCard}>
          <View style={styles.sliderRow}>
            <Text style={styles.sliderLabel}>
              Height: {Math.round(height)} cm
            </Text>
            <Slider
              style={styles.slider}
              minimumValue={100}
              maximumValue={250}
              step={1}
              value={height}
              onValueChange={setHeight}
              minimumTrackTintColor={Colors.primary}
              maximumTrackTintColor={Colors.border}
              thumbTintColor={Colors.primary}
            />
          </View>
          <View style={styles.sliderRow}>
            <Text style={styles.sliderLabel}>
              Weight: {Math.round(weight)} kg
            </Text>
            <Slider
              style={styles.slider}
              minimumValue={30}
              maximumValue={200}
              step={1}
              value={weight}
              onValueChange={setWeight}
              minimumTrackTintColor={Colors.primary}
              maximumTrackTintColor={Colors.border}
              thumbTintColor={Colors.primary}
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
          { backgroundColor: formIsValid ? Colors.primary : Colors.disabled },
        ]}
        onPress={handleCompleteOnboarding}
        disabled={!formIsValid || isLoading}
        activeOpacity={0.85}
      >
        {isLoading ? (
          <ActivityIndicator color={Colors.textInverse} />
        ) : (
          <Text style={styles.primaryButtonText}>Start Journey</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}
