import "../i18n/i18n";
import { useEffect, useState } from "react";
import { View } from "react-native";
import { Slot, useRouter, useSegments } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useFonts } from "expo-font";
import {
  Cormorant_600SemiBold,
  Cormorant_700Bold,
  Cormorant_500Medium_Italic,
} from "@expo-google-fonts/cormorant";
import {
  Montserrat_400Regular,
  Montserrat_500Medium,
  Montserrat_600SemiBold,
  Montserrat_700Bold,
} from "@expo-google-fonts/montserrat";
import { useAuthStore } from "../src/store/authStore";
import { initAuthListener } from "../src/services/authService";
import { Colors } from "../src/constants/theme";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const router = useRouter();
  const segments = useSegments();
  const [isReady, setIsReady] = useState(false);
  const [isNavigated, setIsNavigated] = useState(false);

  const isLoggedIn = useAuthStore((s) => s.isLoggedIn);
  const isEmailVerified = useAuthStore((s) => s.isEmailVerified);
  const hasCompletedOnboarding = useAuthStore((s) => s.hasCompletedOnboarding);
  const isProfileLoaded = useAuthStore((s) => s.isProfileLoaded);

  const [fontsLoaded] = useFonts({
    Cormorant_600SemiBold,
    Cormorant_700Bold,
    Cormorant_500Medium_Italic,
    Montserrat_400Regular,
    Montserrat_500Medium,
    Montserrat_600SemiBold,
    Montserrat_700Bold,
  });

  useEffect(() => {
    const unsubscribe = initAuthListener(() => setIsReady(true));
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (fontsLoaded && isReady && !(isLoggedIn && !isProfileLoaded)) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, isReady, isLoggedIn, isProfileLoaded]);

  useEffect(() => {
    if (!isReady || !fontsLoaded) return;
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
    setIsNavigated(true);
  }, [
    isReady,
    fontsLoaded,
    isLoggedIn,
    isEmailVerified,
    hasCompletedOnboarding,
    isProfileLoaded,
  ]);

  if (!isReady || !fontsLoaded || (isLoggedIn && !isProfileLoaded) || !isNavigated) {
    return <View style={{ flex: 1, backgroundColor: Colors.background }} />;
  }

  return <Slot />;
}
