import { useState } from "react";
import { View, Text, TouchableOpacity, ActivityIndicator } from "react-native";
import { reload, sendEmailVerification } from "firebase/auth";
import { auth } from "../../services/firebase";
import { useAuthStore } from "../../store/authStore";
import {
  fetchProfile,
  signOut,
  checkEmailVerification,
} from "../../services/authService";
import { Colors } from "../../constants/theme";
import styles from "./EmailVerificationScreen.styles";

export default function EmailVerificationScreen() {
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
          <Text style={styles.icon}>📧</Text>
          <View style={styles.textBlock}>
            <Text style={styles.title}>Check your email</Text>
            <Text style={styles.subtitle}>
              {`We sent a verification link to\n${currentEmail}`}
            </Text>
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
                I've verified my email
              </Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.resendButton} onPress={resendEmail}>
              <Text style={styles.resendButtonText}>Resend email</Text>
            </TouchableOpacity>
          </View>
          {message.length > 0 && <Text style={styles.message}>{message}</Text>}
        </View>
        <TouchableOpacity style={styles.signOutButton} onPress={signOut}>
          <Text style={styles.signOutText}>Sign out</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
