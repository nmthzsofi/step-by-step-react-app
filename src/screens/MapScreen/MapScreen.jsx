import { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import MapView, { Marker, Polyline } from "react-native-maps";
import { useGoalStore } from "../../store/goalStore";
import { useAuthStore } from "../../store/authStore";
import GoalProgressCard from "../../components/GoalProgressCard/GoalProgressCard";
import AddActivityModal from "../../components/AddActivityModal/AddActivityModal";
import CelebrationView from "../../components/CelebrationView/CelebrationView";
import { useTranslation } from "react-i18next";
import { Colors, Typography, Spacing, Shadows, Radius } from "../../constants/theme";

const { width } = Dimensions.get("window");

const calculateProgressCoordinate = (progress, goal) => {
  const p = Math.min(Math.max(progress, 0), 1);
  return {
    latitude:
      goal.startCoordinate.latitude +
      (goal.coordinates.latitude - goal.startCoordinate.latitude) * p,
    longitude:
      goal.startCoordinate.longitude +
      (goal.coordinates.longitude - goal.startCoordinate.longitude) * p,
  };
};

const MemberBubble = ({ name, isSelf }) => (
  <View style={[styles.bubble, isSelf ? styles.bubbleSelf : styles.bubbleOther]}>
    <Text style={[styles.bubbleText, isSelf ? styles.bubbleTextSelf : styles.bubbleTextOther]}>
      {name.charAt(0).toUpperCase()}
    </Text>
  </View>
);

export default function MapScreen() {
  const { t } = useTranslation();
  const mapRef = useRef(null);
  const scrollRef = useRef(null);
  const [showAddActivity, setShowAddActivity] = useState(false);
  const [celebrationVisible, setCelebrationVisible] = useState(false);

  const goals = useGoalStore((s) => s.goals);
  const selectedIndex = useGoalStore((s) => s.selectedGoalIndex);
  const setSelectedIndex = useGoalStore((s) => s.setSelectedIndex);
  const showCelebration = useGoalStore((s) => s.showCelebration);
  const celebrationTitle = useGoalStore((s) => s.celebrationTitle);
  const celebrationMsg = useGoalStore((s) => s.celebrationMessage);
  const dismissCelebration = useGoalStore((s) => s.dismissCelebration);

  const { firebaseUser } = useAuthStore();
  const uid = firebaseUser?.uid;

  const visibleGoals = goals.filter((g) => !g.isFullyCompleted);

  const selectedGoal =
    visibleGoals.length > 0 && selectedIndex < visibleGoals.length
      ? visibleGoals[selectedIndex]
      : null;

  // Delay celebration rendering so the AddActivityModal sheet finishes dismissing first
  useEffect(() => {
    if (!showCelebration) {
      setCelebrationVisible(false);
      return;
    }
    const timer = setTimeout(() => setCelebrationVisible(true), 400);
    return () => clearTimeout(timer);
  }, [showCelebration]);

  // Clamp selectedIndex when a goal is removed from visibleGoals (e.g. just completed)
  useEffect(() => {
    if (visibleGoals.length === 0 || selectedIndex < visibleGoals.length) return;
    const newIndex = visibleGoals.length - 1;
    setSelectedIndex(newIndex);
    scrollRef.current?.scrollTo({ x: newIndex * width, animated: false });
  }, [visibleGoals.length]);

  // Focus map on selected goal
  useEffect(() => {
    if (!selectedGoal || !mapRef.current) return;
    mapRef.current.fitToCoordinates(
      [
        {
          latitude: selectedGoal.startCoordinate.latitude,
          longitude: selectedGoal.startCoordinate.longitude,
        },
        {
          latitude: selectedGoal.coordinates.latitude,
          longitude: selectedGoal.coordinates.longitude,
        },
      ],
      {
        edgePadding: { top: 80, right: 80, bottom: 250, left: 80 },
        animated: true,
      },
    );
  }, [selectedIndex, selectedGoal]);

  const renderMarkers = () => {
    if (!selectedGoal) return null;

    const markers = [];

    // Destination marker
    markers.push(
      <Marker
        key="destination"
        coordinate={{
          latitude: selectedGoal.coordinates.latitude,
          longitude: selectedGoal.coordinates.longitude,
        }}
        title={selectedGoal.name}
      >
        <View style={styles.destinationMarker}>
          <Ionicons name="location" size={30} color={Colors.accent} />
        </View>
      </Marker>,
    );

    // Start marker
    markers.push(
      <Marker
        key="start"
        coordinate={{
          latitude: selectedGoal.startCoordinate.latitude,
          longitude: selectedGoal.startCoordinate.longitude,
        }}
        title="Start"
        pinColor="gray"
      />,
    );

    // Member bubbles
    if (selectedGoal.type === "race") {
      selectedGoal.members?.forEach((member) => {
        const progress =
          selectedGoal.totalSteps > 0
            ? member.steps / selectedGoal.totalSteps
            : 0;
        const coord = calculateProgressCoordinate(progress, selectedGoal);
        markers.push(
          <Marker
            key={`member-${member.id}`}
            coordinate={coord}
            title={member.firstName}
          >
            <MemberBubble
              name={member.firstName}
              isSelf={member.id === uid}
            />
          </Marker>,
        );
      });
    } else {
      const myMember =
        selectedGoal.members?.find((m) => m.id === uid) ??
        selectedGoal.members?.[0];
      const progress = (() => {
        if (!selectedGoal.totalSteps) return 0;
        if (selectedGoal.type === "cooperative") {
          const total = (selectedGoal.members ?? []).reduce(
            (s, m) => s + m.steps,
            0,
          );
          return total / selectedGoal.totalSteps;
        }
        return (myMember?.steps ?? 0) / selectedGoal.totalSteps;
      })();

      const coord = calculateProgressCoordinate(progress, selectedGoal);
      const displayName =
        selectedGoal.type === "cooperative"
          ? "G"
          : (myMember?.firstName ?? "Me");
      markers.push(
        <Marker
          key="my-bubble"
          coordinate={coord}
          title={myMember?.firstName ?? "Me"}
        >
          <MemberBubble name={displayName} isSelf />
        </Marker>,
      );
    }

    return markers;
  };

  return (
    <View style={styles.container}>
      {selectedGoal ? (
        <MapView
          ref={mapRef}
          style={StyleSheet.absoluteFill}
          mapType="mutedStandard"
          showsUserLocation={false}
        >
          {renderMarkers()}
          <Polyline
            coordinates={[
              {
                latitude: selectedGoal.startCoordinate.latitude,
                longitude: selectedGoal.startCoordinate.longitude,
              },
              {
                latitude: selectedGoal.coordinates.latitude,
                longitude: selectedGoal.coordinates.longitude,
              },
            ]}
            strokeColor="rgba(201,169,110,0.45)"
            strokeWidth={4}
          />
        </MapView>
      ) : (
        <View style={styles.emptyState}>
          <Ionicons name="map-outline" size={56} color={Colors.textTertiary} />
          <Text style={styles.emptyText}>{t("journey.no_goals_map")}</Text>
        </View>
      )}

      {/* UI overlay */}
      <View style={styles.overlay} pointerEvents="box-none">
        {/* Goal cards pager */}
        {visibleGoals.length > 0 && (
          <ScrollView
            ref={scrollRef}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            style={styles.cardScroller}
            contentContainerStyle={styles.cardScrollerContent}
            onMomentumScrollEnd={(e) => {
              const index = Math.round(
                e.nativeEvent.contentOffset.x / width,
              );
              setSelectedIndex(index);
            }}
          >
            {visibleGoals.map((goal, index) => (
              <View
                key={goal.id ?? index}
                style={[
                  styles.cardWrapper,
                  { opacity: selectedIndex === index ? 1 : 0.6 },
                ]}
              >
                <GoalProgressCard goal={goal} />
              </View>
            ))}
          </ScrollView>
        )}

        <View style={styles.spacer} />

        {/* Add Activity button */}
        <TouchableOpacity
          style={[
            styles.addButton,
            goals.length === 0 && styles.addButtonDisabled,
          ]}
          onPress={() => setShowAddActivity(true)}
          disabled={goals.length === 0}
          activeOpacity={0.85}
        >
          <Ionicons name="add" size={18} color={Colors.textInverse} />
          <Text style={styles.addButtonText}>{t("fitness.add_activity").toUpperCase()}</Text>
        </TouchableOpacity>
      </View>

      {/* Add Activity modal */}
      <AddActivityModal
        visible={showAddActivity}
        onDismiss={() => setShowAddActivity(false)}
      />

      {/* Celebration overlay */}
      {celebrationVisible && (
        <CelebrationView
          title={celebrationTitle}
          message={celebrationMsg}
          onDismiss={dismissCelebration}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.backgroundAlt,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "space-between",
    paddingBottom: 90,
  },
  cardScroller: {
    flexGrow: 0,
    marginTop: 60,
  },
  cardScrollerContent: {
  },
  cardWrapper: {
    width: width,
    paddingHorizontal: Spacing.base,
  },
  spacer: {
    flex: 1,
  },
  addButton: {
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    backgroundColor: Colors.textPrimary,
    borderRadius: Radius.full,
    paddingHorizontal: 40,
    height: 60,
    justifyContent: "center",
    marginBottom: Spacing.lg,
    ...Shadows.md,
  },
  addButtonDisabled: {
    backgroundColor: Colors.disabled,
  },
  addButtonText: {
    fontFamily: Typography.fontLabel,
    color: Colors.textInverse,
    fontSize: Typography.xs,
    letterSpacing: Typography.widest,
  },
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.md,
  },
  emptyText: {
    fontFamily: Typography.fontBody,
    fontSize: Typography.base,
    color: Colors.textSecondary,
  },
  destinationMarker: {
    alignItems: "center",
    justifyContent: "center",
  },
  bubble: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    ...Shadows.sm,
  },
  bubbleSelf: {
    backgroundColor: Colors.accent,
    borderColor: Colors.surface,
  },
  bubbleOther: {
    backgroundColor: Colors.surface,
    borderColor: Colors.borderMid,
  },
  bubbleText: {
    fontSize: 13,
    fontFamily: Typography.fontLabelBold,
  },
  bubbleTextSelf: {
    color: Colors.textInverse,
  },
  bubbleTextOther: {
    color: Colors.textPrimary,
  },
});
