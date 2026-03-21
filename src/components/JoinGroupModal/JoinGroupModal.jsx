import { useTranslation } from "react-i18next";
import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAuthStore } from "../../store/authStore";
import { joinGoal } from "../../services/goalService";
import { grantTeamPlayerBadge } from "../../services/userService";
import {
  Colors,
  Typography,
  Spacing,
  Radius,
  Shadows,
} from "../../constants/theme";

export default function JoinGroupModal({ visible, onDismiss }) {
  const { t } = useTranslation();
  const [code, setCode] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const { firebaseUser, currentUserProfile } = useAuthStore();

  const handleJoin = async () => {
    if (!currentUserProfile) {
      setErrorMessage("Profile not loaded. Please try again.");
      return;
    }

    setIsSearching(true);
    setErrorMessage("");

    try {
      await joinGoal(code.toUpperCase(), {
        ...currentUserProfile,
        id: firebaseUser?.uid,
      });
      await grantTeamPlayerBadge(firebaseUser?.uid);
      setCode("");
      onDismiss();
    } catch (err) {
      console.error("joinGoal error:", err?.code, err?.message);
      if (err?.code === "permission-denied") {
        setErrorMessage(t("journey.join_permission_denied"));
      } else {
        setErrorMessage(t("journey.code_not_found"));
      }
    } finally {
      setIsSearching(false);
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
        </View>

        <View style={styles.content}>
          <View style={styles.iconWrapper}>
            <Ionicons name="key-outline" size={40} color={Colors.accent} />
          </View>
          <Text style={styles.title}>{t("journey.join_group_title")}</Text>
          <Text style={styles.subtitle}>{t("journey.join_instructions")}</Text>

          <TextInput
            style={styles.codeInput}
            value={code}
            onChangeText={(val) => setCode(val.toUpperCase().slice(0, 6))}
            placeholder={t("journey.group_code_hint")}
            placeholderTextColor={Colors.textTertiary}
            autoCapitalize="characters"
            autoCorrect={false}
            maxLength={6}
          />

          {errorMessage.length > 0 && (
            <Text style={styles.error}>{errorMessage}</Text>
          )}

          <TouchableOpacity
            style={[
              styles.joinButton,
              (code.length < 6 || isSearching) && styles.joinButtonDisabled,
            ]}
            onPress={handleJoin}
            disabled={code.length < 6 || isSearching}
            activeOpacity={0.85}
          >
            {isSearching ? (
              <ActivityIndicator color={Colors.textInverse} />
            ) : (
              <Text style={styles.joinButtonText}>{t("journey.join_journey").toUpperCase()}</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    padding: Spacing.base,
    paddingTop: Spacing.xl,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
    alignItems: "flex-start",
  },
  cancel: {
    fontFamily: Typography.fontBody,
    fontSize: Typography.base,
    color: Colors.accent,
  },
  content: {
    flex: 1,
    alignItems: "center",
    paddingTop: 40,
    paddingHorizontal: Spacing.xxl,
    gap: Spacing.md,
  },
  iconWrapper: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.accentGlow,
    borderWidth: 1,
    borderColor: Colors.accentBorder,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontFamily: Typography.fontDisplay,
    fontSize: Typography.xxl,
    letterSpacing: Typography.tight,
    textAlign: "center",
    color: Colors.textPrimary,
  },
  subtitle: {
    fontFamily: Typography.fontBody,
    fontSize: Typography.sm,
    color: Colors.textSecondary,
    textAlign: "center",
    lineHeight: 20,
  },
  codeInput: {
    fontFamily: Typography.fontDisplay,
    fontSize: 36,
    textAlign: "center",
    backgroundColor: Colors.surfaceHigh,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.accentBorder,
    padding: Spacing.base,
    width: "100%",
    marginTop: Spacing.lg,
    color: Colors.textAccent,
    letterSpacing: 8,
  },
  error: {
    fontFamily: Typography.fontBody,
    fontSize: Typography.xs,
    color: Colors.error,
    textAlign: "center",
  },
  joinButton: {
    backgroundColor: Colors.accent,
    borderRadius: Radius.sm,
    height: 52,
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    marginTop: Spacing.lg,
  },
  joinButtonDisabled: {
    backgroundColor: Colors.disabled,
  },
  joinButtonText: {
    fontFamily: Typography.fontLabel,
    color: Colors.textInverse,
    fontSize: Typography.xs,
    letterSpacing: Typography.widest,
  },
});
