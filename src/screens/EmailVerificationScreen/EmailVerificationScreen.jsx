import { useState } from "react";
import { View, Text, TouchableOpacity, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { sendEmailVerification } from "firebase/auth";
import { auth } from "../../services/firebase";
import {
  checkEmailVerification,
  signOut,
} from "../../services/authService";
import { Colors } from "../../constants/theme";
import styles from "./EmailVerificationScreen.styles";

export default function EmailVerificationScreen() {
  const { t } = useTranslation();
  const [isChecking, setIsChecking] = useState(false);
  const [message, setMessage] = useState("");

  const currentEmail = auth.currentUser?.email ?? "";

  const checkVerification = async () => {
    setIsChecking(true);
    setMessage("");
    try {
      const verified = await checkEmailVerification();
      if (!verified) {
        setMessage(
          "Email not verified yet. Please check your inbox and click the link.",
        );
      }
    } catch (err) {
      setMessage(err.message);
    } finally {
      setIsChecking(false);
    }
  };

  const resendEmail = async () => {
    try {
      await sendEmailVerification(auth.currentUser);
      setMessage("Verification email resent. Please check your inbox.");
    } catch (err) {
      setMessage(err.message);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.inner}>
        <View style={styles.centerBlock}>
          <View style={styles.iconWrapper}>
            <Ionicons name="mail-outline" size={40} color={Colors.accent} />
          </View>
          <View style={styles.textBlock}>
            <Text style={styles.title}>{t("auth.check_email")}</Text>
            <Text style={styles.subtitle}>
              {t("auth.verify_sent_to", { email: currentEmail })}
            </Text>
          </View>
          <View style={styles.spamBanner}>
            <Ionicons name="warning-outline" size={18} color={Colors.warning} />
            <Text style={styles.spamBannerText}>{t("auth.check_spam")}</Text>
          </View>

          <View style={styles.actionsBlock}>
            <TouchableOpacity
              style={[
                styles.primaryButton,
                isChecking && styles.primaryButtonDisabled,
              ]}
              onPress={checkVerification}
              disabled={isChecking}
              activeOpacity={0.85}
            >
              {isChecking && <ActivityIndicator color={Colors.textInverse} />}
              <Text style={styles.primaryButtonText}>
                {t("auth.verified_button").toUpperCase()}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.resendButton} onPress={resendEmail}>
              <Text style={styles.resendButtonText}>{t("auth.resend_email").toUpperCase()}</Text>
            </TouchableOpacity>
          </View>
          {message.length > 0 && <Text style={styles.message}>{message}</Text>}
        </View>
        <TouchableOpacity style={styles.signOutButton} onPress={signOut}>
          <Text style={styles.signOutText}>{t("auth.sign_out")}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
