import { useTranslation } from "react-i18next";
import { useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  Animated,
  StyleSheet,
  Dimensions,
} from "react-native";
import { BlurView } from "expo-blur";
import { Colors, Typography, Spacing, Radius } from "../../constants/theme";

const { width } = Dimensions.get("window");

export default function CelebrationView({ title, message, onDismiss }) {
  const { t } = useTranslation();
  const scale = useRef(new Animated.Value(0.8)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const bounceY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scale, {
        toValue: 1,
        damping: 12,
        stiffness: 110,
        mass: 0.8,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 350,
        useNativeDriver: true,
      }),
    ]).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(bounceY, {
          toValue: -20,
          duration: 900,
          useNativeDriver: true,
        }),
        Animated.timing(bounceY, {
          toValue: 0,
          duration: 900,
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, []);

  return (
    <Modal transparent animationType="none">
      <TouchableOpacity
        style={styles.backdrop}
        activeOpacity={1}
        onPress={onDismiss}
      >
        <Animated.View
          style={[styles.card, { transform: [{ scale }], opacity }]}
        >
          <BlurView
            intensity={80}
            tint="light"
            style={StyleSheet.absoluteFill}
          />
          <View style={styles.cardInner}>
            <Animated.Text
              style={[styles.emoji, { transform: [{ translateY: bounceY }] }]}
            >
              🎉
            </Animated.Text>

            <View style={styles.textBlock}>
              <Text style={styles.title}>{title}</Text>
              <Text style={styles.message}>{message}</Text>
            </View>

            <TouchableOpacity style={styles.button} onPress={onDismiss}>
              <Text style={styles.buttonText}>{t("general.awesome").toUpperCase()}</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: Colors.overlay,
    alignItems: "center",
    justifyContent: "center",
  },
  card: {
    width: width - 80,
    borderRadius: Radius.xl,
    overflow: "hidden",
    borderWidth: 1.5,
    borderColor: Colors.accentBorder,
  },
  cardInner: {
    paddingVertical: 40,
    paddingHorizontal: 20,
    alignItems: "center",
    gap: Spacing.xl,
  },
  emoji: {
    fontSize: 80,
  },
  textBlock: {
    alignItems: "center",
    gap: Spacing.sm,
  },
  title: {
    fontFamily: Typography.fontDisplay,
    fontSize: Typography.xxl,
    textAlign: "center",
    color: Colors.textPrimary,
    letterSpacing: Typography.tight,
  },
  message: {
    fontFamily: Typography.fontBody,
    fontSize: Typography.base,
    color: Colors.textSecondary,
    textAlign: "center",
    lineHeight: 22,
  },
  button: {
    backgroundColor: Colors.accent,
    borderRadius: Radius.sm,
    height: 52,
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    fontFamily: Typography.fontLabel,
    color: Colors.textInverse,
    fontSize: Typography.xs,
    letterSpacing: Typography.widest,
  },
});
