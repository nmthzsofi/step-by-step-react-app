import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { signIn, signUp } from "../../services/authService";
import { Colors, Spacing } from "../../constants/theme";
import styles from "./AuthScreen.styles";

// ─── Sub-components ────────────────────────────────────────────────────

const FieldRow = ({
  icon,
  placeholder,
  value,
  onChangeText,
  secureTextEntry,
  keyboardType,
}) => (
  <View style={styles.fieldRow}>
    <View style={styles.fieldIcon}>
      <Ionicons name={icon} size={20} color={Colors.accent} />
    </View>
    <TextInput
      style={styles.input}
      placeholder={placeholder}
      placeholderTextColor={Colors.textTertiary}
      value={value}
      onChangeText={onChangeText}
      secureTextEntry={secureTextEntry}
      keyboardType={keyboardType ?? "default"}
      autoCapitalize="none"
      autoCorrect={false}
      textContentType="oneTimeCode"
      autoComplete="off"
    />
  </View>
);

const ConfirmPasswordRow = ({ value, onChangeText, passwordsMatch }) => {
  const { t } = useTranslation();
  return (
  <View
    style={[
      styles.fieldRow,
      value.length > 0 && !passwordsMatch && styles.fieldRowError,
    ]}
  >
    <View style={styles.fieldIcon}>
      <Ionicons name="lock-closed" size={20} color={Colors.accent} />
    </View>
    <TextInput
      style={styles.input}
      placeholder={t("auth.confirm_password")}
      placeholderTextColor={Colors.textTertiary}
      value={value}
      onChangeText={onChangeText}
      secureTextEntry
      autoCapitalize="none"
      textContentType="oneTimeCode"
      autoComplete="off"
    />
    {value.length > 0 && (
      <Ionicons
        name={passwordsMatch ? "checkmark-circle" : "close-circle"}
        size={20}
        color={passwordsMatch ? Colors.success : Colors.error}
      />
    )}
  </View>
  );
};

// ─── Main Screen ───────────────────────────────────────────────────────

export default function AuthScreen() {
  const { t } = useTranslation();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [username, setUsername] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const passwordsMatch = password.length > 0 && password === confirmPassword;

  const handleAuth = async () => {
    setIsLoading(true);
    setErrorMessage("");

    try {
      if (isSignUp) {
        const cleanUsername = username.trim().toLowerCase();

        if (!cleanUsername) throw new Error("Please enter a username.");
        if (!passwordsMatch)
          throw new Error("Passwords don't match. Please try again.");
        if (password.length < 6)
          throw new Error("Password must be at least 6 characters.");

        await signUp({ email, password, username: cleanUsername });
      } else {
        await signIn({ email, password });
      }
    } catch (err) {
      setErrorMessage(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMode = () => {
    setIsSignUp((prev) => !prev);
    setErrorMessage("");
    setConfirmPassword("");
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        style={styles.inner}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Ionicons name="walk" size={28} color={Colors.accent} style={{ marginBottom: Spacing.xs }} />
          <Text style={styles.title}>
            {isSignUp ? t("auth.create_account") : t("auth.welcome_back")}
          </Text>
          <View style={styles.accentLine} />
          <Text style={styles.subtitle}>
            {isSignUp ? t("auth.start_journey_subtitle") : t("auth.login_subtitle")}
          </Text>
        </View>

        {/* Fields */}
        <View style={styles.fields}>
          {isSignUp && (
            <FieldRow
              icon="at"
              placeholder={t("profile.username")}
              value={username}
              onChangeText={setUsername}
            />
          )}

          <FieldRow
            icon="mail-outline"
            placeholder={t("profile.email")}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
          />

          <FieldRow
            icon="lock-closed-outline"
            placeholder={t("auth.password")}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          {isSignUp && (
            <ConfirmPasswordRow
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              passwordsMatch={passwordsMatch}
            />
          )}
        </View>

        {/* Error message */}
        {errorMessage.length > 0 && (
          <Text style={styles.errorText}>{errorMessage}</Text>
        )}

        {/* Primary CTA */}
        <TouchableOpacity
          style={[
            styles.primaryButton,
            isLoading && styles.primaryButtonDisabled,
          ]}
          onPress={handleAuth}
          disabled={isLoading}
          activeOpacity={0.85}
        >
          {isLoading && <ActivityIndicator color={Colors.textInverse} />}
          <Text style={styles.primaryButtonText}>
            {isSignUp ? t("auth.signup").toUpperCase() : t("auth.login").toUpperCase()}
          </Text>
        </TouchableOpacity>

        {/* Toggle sign up / login */}
        <TouchableOpacity style={styles.switchButton} onPress={toggleMode}>
          <Text style={styles.switchButtonText}>
            {isSignUp ? t("auth.already_have_account") : t("auth.no_account")}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
