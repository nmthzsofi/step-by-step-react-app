import { Tabs } from "expo-router";
import { Colors } from "../../src/constants/theme";
import { BlurView } from "expo-blur";
import { StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";

const TabIcon = ({ name, color }) => (
  <Ionicons name={name} size={24} color={color} />
);

export default function TabLayout() {
  const { t } = useTranslation();
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors.textPrimary,
        tabBarInactiveTintColor: Colors.textTertiary,
        tabBarStyle: styles.tabBar,
        tabBarBackground: () => (
          <BlurView
            intensity={80}
            tint="light"
            style={StyleSheet.absoluteFill}
          />
        ),
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t("journey.map"),
          tabBarIcon: ({ color }) => <TabIcon name="map" color={color} />,
        }}
      />
      <Tabs.Screen
        name="goals"
        options={{
          title: t("progress.goals"),
          tabBarIcon: ({ color }) => <TabIcon name="flag" color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: t("profile.title"),
          tabBarIcon: ({ color }) => (
            <TabIcon name="person-circle" color={color} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    position: "absolute",
    backgroundColor: "transparent",
    borderTopWidth: 0,
    elevation: 0,
  },
});
