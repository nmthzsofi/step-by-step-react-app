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
      setErrorMessage(
        "No journey found with this code. Please check and try again.",
      );
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
            <Text style={styles.cancel}>Cancel</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          <Text style={styles.icon}>🗝️</Text>
          <Text style={styles.title}>Join a Group Journey</Text>
          <Text style={styles.subtitle}>
            Enter the 6-digit code shared by your friend to join their progress.
          </Text>

          <TextInput
            style={styles.codeInput}
            value={code}
            onChangeText={(val) => setCode(val.toUpperCase().slice(0, 6))}
            placeholder="E.G. XY789"
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
              <Text style={styles.joinButtonText}>Join Journey</Text>
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
    fontSize: Typography.base,
    color: Colors.primary,
  },
  content: {
    flex: 1,
    alignItems: "center",
    paddingTop: 40,
    paddingHorizontal: Spacing.xxl,
    gap: Spacing.md,
  },
  icon: {
    fontSize: 60,
  },
  title: {
    fontSize: Typography.xxl,
    fontWeight: "700",
    textAlign: "center",
    color: Colors.textPrimary,
  },
  subtitle: {
    fontSize: Typography.sm,
    color: Colors.textSecondary,
    textAlign: "center",
    lineHeight: 20,
  },
  codeInput: {
    fontSize: 32,
    fontWeight: "700",
    fontFamily: "monospace",
    textAlign: "center",
    backgroundColor: Colors.backgroundAlt,
    borderRadius: Radius.md,
    padding: Spacing.base,
    width: "100%",
    marginTop: Spacing.lg,
    color: Colors.textPrimary,
    letterSpacing: 8,
  },
  error: {
    fontSize: Typography.xs,
    color: Colors.error,
    textAlign: "center",
  },
  joinButton: {
    backgroundColor: Colors.textPrimary,
    borderRadius: Radius.lg,
    height: 55,
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    marginTop: Spacing.lg,
  },
  joinButtonDisabled: {
    backgroundColor: Colors.disabled,
  },
  joinButtonText: {
    color: Colors.textInverse,
    fontSize: Typography.base,
    fontWeight: "700",
  },
});
