# lepesrol-lepesre-react

A React Native (Expo) fitness tracking app. Users set walking/fitness goals between two real-world locations, log activities to earn steps, and track progress on a live map. Supports solo goals, cooperative group challenges, and head-to-head races.

Backend: Firebase (Auth, Firestore, Storage). State management: Zustand.

---

## Project Structure

```
lepesrol-lepesre-react/
|
|- index.js                          # App entry point — registers the root component with Expo
|- app.json                          # Expo configuration (app name, slug, plugins)
|- package.json                      # Dependencies and npm scripts
|- CLAUDE.md                         # AI assistant persona and instructions
|
|- app/                              # Expo Router — file-based navigation
|   |- _layout.jsx                   # Root layout — listens to auth state, guards routes (redirects to auth/onboarding/tabs)
|   |- auth.jsx                      # Route file for /auth — re-exports AuthScreen
|   |- email-verification.jsx        # Route file for /email-verification — re-exports EmailVerificationScreen
|   |- onboarding.jsx                # Route file for /onboarding — re-exports OnboardingScreen
|   |
|   |- (tabs)/                       # Tab navigator group — visible after login
|       |- _layout.jsx               # Defines the 3-tab bar (Map, Goals, Profile) with blur background
|       |- index.jsx                 # Tab 1: Map — re-exports MapScreen
|       |- goals.jsx                 # Tab 2: Goals — re-exports GoalsScreen
|       |- profile.jsx               # Tab 3: Profile — re-exports ProfileScreen
|
|- src/
|   |
|   |- screens/                      # Full-screen UI components (one per route)
|   |   |
|   |   |- MapScreen/
|   |   |   |- MapScreen.jsx         # Main map view — shows goal route as a polyline, animated member position bubbles, scrollable goal progress cards, and "Add Activity" button
|   |   |
|   |   |- GoalsScreen/
|   |   |   |- GoalsScreen.jsx       # Lists all the user's goals; buttons to create a new journey or join a group via share code
|   |   |
|   |   |- ProfileScreen/
|   |   |   |- ProfileScreen.jsx     # Shows user stats (steps, calories, badges, completed goals), physical info, and links to settings
|   |   |   |- ProfileScreen.styles.js  # Styles for ProfileScreen
|   |   |
|   |   |- AuthScreen/
|   |   |   |- AuthScreen.jsx        # Login and sign-up form — toggles between two modes, validates input, calls Firebase auth
|   |   |   |- AuthScreen.styles.js  # Styles for AuthScreen
|   |   |
|   |   |- OnboardingScreen/
|   |   |   |- OnboardingScreen.jsx  # First-time profile setup — collects name, sex, birthdate, height/weight, and optional profile photo
|   |   |   |- OnboardingScreen.styles.js  # Styles for OnboardingScreen
|   |   |
|   |   |- EmailVerificationScreen/
|   |       |- EmailVerificationScreen.jsx   # Shown after sign-up — prompts user to verify email, handles resend and verification check
|   |       |- EmailVerificationScreen.styles.js  # Styles for EmailVerificationScreen
|   |
|   |- components/                   # Reusable UI pieces used inside screens
|   |   |
|   |   |- GoalProgressCard/
|   |   |   |- GoalProgressCard.jsx  # Compact card shown on the map overlay — displays goal name, progress bar, percentage, and mini leaderboard for group goals
|   |   |
|   |   |- GoalCard/
|   |   |   |- GoalCard.jsx          # Card shown in the Goals list — shows icon, name, remaining steps, progress bar, and race leaderboard if applicable
|   |   |
|   |   |- AddActivityModal/
|   |   |   |- AddActivityModal.jsx  # Sheet modal to log a workout — pick activity type, duration, and intensity; calculates steps and adds them to all active goals
|   |   |
|   |   |- CreateGoalModal/
|   |   |   |- CreateGoalModal.jsx   # Sheet modal to create a new journey — search start/end locations, pick goal type (individual/cooperative/race), choose icon, generates share code for group goals
|   |   |
|   |   |- GoalDetailModal/
|   |   |   |- GoalDetailModal.jsx   # Sheet modal to view and edit an existing goal — shows leaderboard, editable name/type/route, share code, and delete/exit option
|   |   |
|   |   |- JoinGroupModal/
|   |   |   |- JoinGroupModal.jsx    # Sheet modal to join a group goal — enter a 6-character share code; awards the Team Player badge on success
|   |   |
|   |   |- CelebrationView/
|   |   |   |- CelebrationView.jsx   # Animated overlay shown when a goal is completed — bouncing emoji, spring-in card with blur background, dismiss button
|   |   |
|   |   |- SettingsModal/
|   |       |- SettingsModal.jsx     # Edit profile sheet — update username, name, sex, birthdate, height/weight, and display unit (Steps vs Kilometers)
|   |
|   |- services/                     # All Firebase and external API calls
|   |   |- firebase.js               # Initializes the Firebase app — exports auth, Firestore db, and Storage instances
|   |   |- authService.js            # Handles sign-up, sign-in, sign-out, email verification, and the real-time auth state listener that bootstraps the app on launch
|   |   |- goalService.js            # CRUD for goals — fetch, create, join, add steps, real-time Firestore listeners per goal, and step-to-Firestore sync
|   |   |- userService.js            # CRUD for user profiles — fetch (real-time listener), save details, upload profile image, complete onboarding, update display unit, grant badges
|   |
|   |- store/                        # Global client-side state (Zustand)
|   |   |- authStore.js              # Stores the logged-in user, email verification status, onboarding flag, and all profile fields (name, height, weight, badges, etc.)
|   |   |- goalStore.js              # Stores the list of goals, the selected goal index for the map, and celebration modal state
|   |
|   |- constants/                    # App-wide static values
|   |   |- theme.js                  # Design tokens — Colors, Typography sizes, Spacing scale, Border radii, Shadow presets
|   |   |- activityTypes.js          # Activity definitions (running, swimming, cycling, etc.) with step multipliers and a calculateSteps() helper
|   |   |- layout.js                 # Exports SCREEN_WIDTH and SCREEN_HEIGHT from React Native Dimensions
|   |
|   |- utils/                        # Pure helper functions
|       |- formatters.js             # Formatting utilities — stride length, calories burned, progress display (steps or km), age calculation, badge list, share code generator
|       |- location.js               # Location utilities — Haversine distance-to-steps calculator, reverse geocoding via Nominatim, location search via Nominatim, share code generator
```

---

## Navigation Flow

```
App Launch
    |
    v
_layout.jsx (root) -- auth not ready --> Loading spinner
    |
    +-- not logged in        --> /auth
    +-- logged in, unverified --> /email-verification
    +-- logged in, no onboarding --> /onboarding
    +-- fully set up         --> /(tabs)
                                    |
                                    +-- index    (Map)
                                    +-- goals    (Goals list)
                                    +-- profile  (User profile)
```

---

## Key Dependencies

| Package | Purpose |
|---|---|
| `expo-router` | File-based navigation |
| `firebase` | Auth, Firestore database, file Storage |
| `zustand` | Lightweight global state management |
| `react-native-maps` | Interactive map with markers and polylines |
| `expo-blur` | Frosted-glass blur effects on tab bar and celebration modal |
| `expo-image-picker` | Profile photo selection from device gallery |
| `@react-native-community/slider` | Height, weight, and activity duration sliders |
| `@react-native-picker/picker` | Sex selector dropdown |
| `@react-native-community/datetimepicker` | Birthdate picker |
