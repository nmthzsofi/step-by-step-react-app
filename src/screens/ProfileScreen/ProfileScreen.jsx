import { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  StyleSheet,
  Alert,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useAuthStore } from "../../store/authStore";
import { useGoalStore } from "../../store/goalStore";
import { saveProfileImage, saveDisplayUnit } from "../../services/userService";
import { signOut } from "../../services/authService";
import { caloriesBurned, earnedBadges } from "../../utils/formatters";
import { Colors, Spacing } from "../../constants/theme";
import styles from "./ProfileScreen.styles";
import SettingsModal from "../../components/SettingsModal/SettingsModal";

const BADGES = {
  firstSteps: { label: "First Steps", icon: "👟", color: Colors.primary },
  century: { label: "Century", icon: "⭐", color: Colors.warning },
  globetrotter: { label: "Globetrotter", icon: "🌍", color: Colors.success },
  teamPlayer: { label: "Team Player", icon: "👥", color: "#9B59B6" },
};

const formatLargeNumber = (n) => {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`;
  return `${n}`;
};

export default function ProfileScreen() {
  const {
    firstName,
    lastName,
    userName,
    profileImageURL,
    totalStepsAllTime,
    userHeight,
    userWeight,
    sex,
    birthDate,
    displayUnit,
    firebaseUser,
    hasTeamPlayerBadge,
  } = useAuthStore();

  const goals = useGoalStore((s) => s.goals);
  const [showSettings, setShowSettings] = useState(false);

  const uid = firebaseUser?.uid;
  const completedGoals = goals.filter((g) => g.isFullyCompleted).length;
  const calories = caloriesBurned(totalStepsAllTime, userWeight, userHeight);
  const badges = earnedBadges(totalStepsAllTime, hasTeamPlayerBadge);
  const topBadge = badges.length > 0 ? badges[badges.length - 1] : null;

  const age = birthDate
    ? (() => {
        const today = new Date();
        const birth = new Date(birthDate);
        let a = today.getFullYear() - birth.getFullYear();
        if (
          today.getMonth() < birth.getMonth() ||
          (today.getMonth() === birth.getMonth() &&
            today.getDate() < birth.getDate())
        )
          a--;
        return a;
      })()
    : "--";

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled && uid) {
      await saveProfileImage(uid, result.assets[0].uri);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.headerSection}>
          <TouchableOpacity style={styles.avatarWrapper} onPress={pickImage}>
            {profileImageURL ? (
              <Image source={{ uri: profileImageURL }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarPlaceholderText}>👤</Text>
              </View>
            )}
            <View style={styles.editBadge}>
              <Text style={styles.editBadgeText}>✏️</Text>
            </View>
          </TouchableOpacity>
          <Text style={styles.fullName}>
            {firstName} {lastName}
          </Text>
          {userName ? <Text style={styles.username}>@{userName}</Text> : null}
        </View>

        {/* Achievements */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>YOUR PROGRESS</Text>
          <View style={styles.tilesRow}>
            <View style={styles.tile}>
              <View style={styles.tileHeader}>
                <Text style={styles.tileIcon}>🚶</Text>
                <Text style={styles.tileTitle}>Total Steps</Text>
              </View>
              <Text style={styles.tileValue}>
                {formatLargeNumber(totalStepsAllTime)}
              </Text>
            </View>
            <View style={styles.tile}>
              <View style={styles.tileHeader}>
                <Text style={styles.tileIcon}>🔥</Text>
                <Text style={styles.tileTitle}>Calories</Text>
              </View>
              <Text style={styles.tileValue}>
                {formatLargeNumber(calories)}
              </Text>
            </View>
          </View>
          <View style={styles.tilesRow}>
            <View style={styles.tile}>
              <View style={styles.tileHeader}>
                <Text style={styles.tileIcon}>
                  {topBadge ? BADGES[topBadge]?.icon : "🏅"}
                </Text>
                <Text style={styles.tileTitle}>Top Badge</Text>
              </View>
              <Text style={styles.tileValue}>
                {topBadge ? BADGES[topBadge]?.label : "None yet"}
              </Text>
            </View>
            <View style={styles.tile}>
              <View style={styles.tileHeader}>
                <Text style={styles.tileIcon}>✅</Text>
                <Text style={styles.tileTitle}>Goals Met</Text>
              </View>
              <Text style={styles.tileValue}>{completedGoals}</Text>
            </View>
          </View>
        </View>

        {/* Badges */}
        {badges.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionHeader}>BADGES</Text>
            {badges.map((badge, index) => (
              <View
                key={badge}
                style={[
                  styles.listRow,
                  index === badges.length - 1 && styles.listRowLast,
                ]}
              >
                <View style={styles.listIconBox}>
                  <Text style={styles.listIcon}>{BADGES[badge]?.icon}</Text>
                </View>
                <Text style={styles.listLabel}>{BADGES[badge]?.label}</Text>
                <Text style={styles.badgeCheck}>✓</Text>
              </View>
            ))}
          </View>
        )}

        {/* Physical Stats */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>PHYSICAL STATS</Text>
          {[
            { label: "Age", value: `${age}`, icon: "📅" },
            {
              label: "Height",
              value: `${Math.round(userHeight)} cm`,
              icon: "📏",
            },
            {
              label: "Weight",
              value: `${Math.round(userWeight)} kg`,
              icon: "⚖️",
            },
            { label: "Sex", value: sex, icon: "👤" },
          ].map((row, index, arr) => (
            <View
              key={row.label}
              style={[
                styles.listRow,
                index === arr.length - 1 && styles.listRowLast,
              ]}
            >
              <View style={styles.listIconBox}>
                <Text style={styles.listIcon}>{row.icon}</Text>
              </View>
              <Text style={styles.listLabel}>{row.label}</Text>
              <Text style={styles.listValue}>{row.value}</Text>
            </View>
          ))}
        </View>

        {/* Account Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>ACCOUNT SETTINGS</Text>
          <TouchableOpacity
            style={[styles.listRow, styles.listRowLast]}
            onPress={() => setShowSettings(true)}
          >
            <View style={styles.listIconBox}>
              <Text style={styles.listIcon}>⚙️</Text>
            </View>
            <Text style={styles.listLabel}>Edit Personal Details</Text>
            <Text style={styles.listChevron}>›</Text>
          </TouchableOpacity>
        </View>

        {/* Sign Out */}
        <View style={[styles.section, { marginTop: Spacing.xl }]}>
          <TouchableOpacity style={styles.signOutRow} onPress={signOut}>
            <Text style={styles.signOutText}>Sign Out</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <SettingsModal
        visible={showSettings}
        onDismiss={() => setShowSettings(false)}
      />
    </View>
  );
}
