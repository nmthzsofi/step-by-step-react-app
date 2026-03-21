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
  const scale = useRef(new Animated.Value(0.8)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const bounceY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Entry animation — mirrors SwiftUI .spring()
    Animated.parallel([
      Animated.spring(scale, {
        toValue: 1,
        damping: 10,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();

    // Bounce emoji — mirrors SwiftUI phaseAnimator
    Animated.loop(
      Animated.sequence([
        Animated.timing(bounceY, {
          toValue: -20,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(bounceY, {
          toValue: 0,
          duration: 1000,
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
              <Text style={styles.buttonText}>Awesome!</Text>
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
    borderRadius: 30,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.5)",
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
    fontSize: 28,
    fontWeight: "900",
    textAlign: "center",
    color: Colors.textPrimary,
  },
  message: {
    fontSize: Typography.base,
    color: Colors.textSecondary,
    textAlign: "center",
  },
  button: {
    backgroundColor: Colors.primary,
    borderRadius: Radius.full,
    height: 50,
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    color: Colors.textInverse,
    fontSize: Typography.base,
    fontWeight: "700",
  },
});
