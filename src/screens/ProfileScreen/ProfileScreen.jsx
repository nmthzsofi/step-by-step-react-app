import { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useAuthStore } from "../../store/authStore";
import { useGoalStore } from "../../store/goalStore";
import { saveProfileImage } from "../../services/userService";
import { signOut } from "../../services/authService";
import { caloriesBurned, earnedBadges } from "../../utils/formatters";
import { useTranslation } from "react-i18next";
import { Colors, Spacing } from "../../constants/theme";
import styles from "./ProfileScreen.styles";
import SettingsModal from "../../components/SettingsModal/SettingsModal";

const BADGES = {
  firstSteps: { label: "First Steps", ionicon: "walk" },
  century: { label: "Century", ionicon: "star" },
  globetrotter: { label: "Globetrotter", ionicon: "earth" },
  teamPlayer: { label: "Team Player", ionicon: "people" },
};

const formatLargeNumber = (n) => {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`;
  return `${n}`;
};

export default function ProfileScreen() {
  const { t } = useTranslation();
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
                <Ionicons name="person" size={40} color={Colors.textTertiary} />
              </View>
            )}
            <View style={styles.editBadge}>
              <Ionicons name="pencil" size={13} color={Colors.accent} />
            </View>
          </TouchableOpacity>
          <Text style={styles.fullName}>
            {firstName} {lastName}
          </Text>
          {userName ? <Text style={styles.username}>@{userName}</Text> : null}
        </View>

        {/* Achievements */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>{t("progress.your_progress").toUpperCase()}</Text>
          <View style={styles.tilesRow}>
            <View style={styles.tile}>
              <View style={styles.tileHeader}>
                <Ionicons name="walk" size={14} color={Colors.accent} style={styles.tileIcon} />
                <Text style={styles.tileTitle}>{t("fitness.total_steps")}</Text>
              </View>
              <Text style={styles.tileValue}>
                {formatLargeNumber(totalStepsAllTime)}
              </Text>
            </View>
            <View style={styles.tile}>
              <View style={styles.tileHeader}>
                <Ionicons name="flame" size={14} color={Colors.accent} style={styles.tileIcon} />
                <Text style={styles.tileTitle}>{t("fitness.calories")}</Text>
              </View>
              <Text style={styles.tileValue}>
                {formatLargeNumber(calories)}
              </Text>
            </View>
          </View>
          <View style={styles.tilesRow}>
            <View style={styles.tile}>
              <View style={styles.tileHeader}>
                <Ionicons name="medal" size={14} color={Colors.accent} style={styles.tileIcon} />
                <Text style={styles.tileTitle}>{t("progress.top_badge")}</Text>
              </View>
              <Text style={styles.tileValue}>
                {topBadge ? BADGES[topBadge]?.label : t("progress.none_yet")}
              </Text>
            </View>
            <View style={styles.tile}>
              <View style={styles.tileHeader}>
                <Ionicons name="checkmark-circle" size={14} color={Colors.accent} style={styles.tileIcon} />
                <Text style={styles.tileTitle}>{t("progress.goals_met")}</Text>
              </View>
              <Text style={styles.tileValue}>{completedGoals}</Text>
            </View>
          </View>
        </View>

        {/* Badges */}
        {badges.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionHeader}>{t("progress.badges").toUpperCase()}</Text>
            {badges.map((badge, index) => (
              <View
                key={badge}
                style={[
                  styles.listRow,
                  index === badges.length - 1 && styles.listRowLast,
                ]}
              >
                <View style={styles.listIconBox}>
                  <Ionicons
                    name={BADGES[badge]?.ionicon ?? "ribbon"}
                    size={18}
                    color={Colors.accent}
                  />
                </View>
                <Text style={styles.listLabel}>{BADGES[badge]?.label}</Text>
                <Ionicons name="checkmark-circle" size={16} color={Colors.success} />
              </View>
            ))}
          </View>
        )}

        {/* Physical Stats */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>{t("fitness.physical_stats").toUpperCase()}</Text>
          {[
            { label: t("profile.age"), value: `${age}`, ionicon: "calendar-outline" },
            { label: t("fitness.height"), value: `${Math.round(userHeight)} cm`, ionicon: "resize-outline" },
            { label: t("fitness.weight"), value: `${Math.round(userWeight)} kg`, ionicon: "barbell-outline" },
            { label: t("profile.sex"), value: t(`profile.${sex.toLowerCase().replace("-", "_").replace(" ", "_")}`), ionicon: "person-outline" },
          ].map((row, index, arr) => (
            <View
              key={row.label}
              style={[
                styles.listRow,
                index === arr.length - 1 && styles.listRowLast,
              ]}
            >
              <View style={styles.listIconBox}>
                <Ionicons name={row.ionicon} size={18} color={Colors.accent} />
              </View>
              <Text style={styles.listLabel}>{row.label}</Text>
              <Text style={styles.listValue}>{row.value}</Text>
            </View>
          ))}
        </View>

        {/* Account Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>{t("profile.account_settings").toUpperCase()}</Text>
          <TouchableOpacity
            style={[styles.listRow, styles.listRowLast]}
            onPress={() => setShowSettings(true)}
          >
            <View style={styles.listIconBox}>
              <Ionicons name="settings-outline" size={18} color={Colors.accent} />
            </View>
            <Text style={styles.listLabel}>{t("profile.edit_personal_details")}</Text>
            <Text style={styles.listChevron}>›</Text>
          </TouchableOpacity>
        </View>

        {/* Sign Out */}
        <View style={[styles.section, { marginTop: Spacing.xl }]}>
          <TouchableOpacity style={styles.signOutRow} onPress={signOut}>
            <Text style={styles.signOutText}>{t("auth.sign_out").toUpperCase()}</Text>
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
