import { useEffect, useState } from "react";
import { View, ActivityIndicator } from "react-native";
import { Slot, useRouter, useSegments } from "expo-router";
import { useAuthStore } from "../src/store/authStore";
import { initAuthListener } from "../src/services/authService";
import { Colors } from "../src/constants/theme";

export default function RootLayout() {
  const router = useRouter();
  const segments = useSegments();
  const [isReady, setIsReady] = useState(false);

  const isLoggedIn = useAuthStore((s) => s.isLoggedIn);
  const isEmailVerified = useAuthStore((s) => s.isEmailVerified);
  const hasCompletedOnboarding = useAuthStore((s) => s.hasCompletedOnboarding);
  const isProfileLoaded = useAuthStore((s) => s.isProfileLoaded);

  useEffect(() => {
    const unsubscribe = initAuthListener(() => setIsReady(true));
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (!isReady) return;
    // If logged in, wait for profile before routing
    if (isLoggedIn && !isProfileLoaded) return;

    const inTabs = segments[0] === "(tabs)";
    if (!isLoggedIn) {
      router.replace("/auth");
    } else if (!isEmailVerified) {
      router.replace("/email-verification");
    } else if (!hasCompletedOnboarding) {
      router.replace("/onboarding");
    } else if (!inTabs) {
      router.replace("/(tabs)");
    }
  }, [
    isReady,
    isLoggedIn,
    isEmailVerified,
    hasCompletedOnboarding,
    isProfileLoaded,
  ]);

  // Show spinner only while auth is initializing or profile is loading
  if (!isReady || (isLoggedIn && !isProfileLoaded)) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: Colors.background,
        }}
      >
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return <Slot />;
}
