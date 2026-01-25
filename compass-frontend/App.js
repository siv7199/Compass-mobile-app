import React, { useState } from 'react';
import { View, StatusBar } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { ThemeProvider, useTheme } from './src/theme/ThemeContext';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { registerRootComponent } from 'expo';
import { Home, Briefcase, Compass, User } from 'lucide-react-native';

// Screens - New Onboarding Flow
import WelcomeScreen from './src/screens/WelcomeScreen';
import UserProfileScreen from './src/screens/UserProfileScreen';
import ModeSelectionScreen from './src/screens/ModeSelectionScreen';
import OnboardingScreen from './src/screens/OnboardingScreen';

// Screens - Main App (Renamed for clarity)
import LobbyScreen from './src/screens/LobbyScreen'; // Career Selection
import StatsScreen from './src/screens/StatsScreen'; // Profile Setup
import MissionMapScreen from './src/screens/MissionMapScreen'; // Results
import DamageReportScreen from './src/screens/DamageReportScreen'; // Cost Analysis
import MissionLogScreen from './src/screens/MissionLogScreen'; // Summary
import ProfileScreen from './src/screens/ProfileScreen';
import HelpScreen from './src/screens/HelpScreen';
import PortfolioScreen from './src/screens/PortfolioScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

export default function AppWrapper() {
  return (
    <ThemeProvider>
      <SafeAreaProvider>
        <App />
      </SafeAreaProvider>
    </ThemeProvider>
  );
}

registerRootComponent(AppWrapper);

// Shared state context
const AppContext = React.createContext();

function App() {
  const { theme, isDarkMode } = useTheme();

  // App flow state: welcome -> userProfile -> modeSelection -> onboarding -> main
  const [appState, setAppState] = useState('welcome');

  // User Info (name, email, username, age, profilePic)
  const [userInfo, setUserInfo] = useState(null);

  // User Profile (GPA, SAT, career, budget, preferences from onboarding)
  const [userProfile, setUserProfile] = useState(null);

  // Saved colleges (renamed from savedMissions)
  const [savedColleges, setSavedColleges] = useState([]);

  // Saved scenarios
  const [savedScenarios, setSavedScenarios] = useState([]);

  const saveCollege = (college) => {
    const collegeWithId = {
      ...college,
      id: Date.now().toString(),
      favorite: false,
      savedAt: new Date().toISOString()
    };
    setSavedColleges(prev => [collegeWithId, ...prev]);
  };

  const deleteCollege = (collegeId) => {
    setSavedColleges(prev => prev.filter(c => c.id !== collegeId));
  };

  const toggleFavorite = (collegeId) => {
    setSavedColleges(prev => prev.map(c =>
      c.id === collegeId ? { ...c, favorite: !c.favorite } : c
    ));
  };

  const clearColleges = () => {
    setSavedColleges([]);
  };

  // Scenario management
  const saveScenario = (scenario) => {
    const scenarioWithId = {
      ...scenario,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setSavedScenarios(prev => [scenarioWithId, ...prev]);
    return scenarioWithId.id;
  };

  const updateScenario = (scenarioId, updates) => {
    setSavedScenarios(prev => prev.map(s =>
      s.id === scenarioId
        ? { ...s, ...updates, updatedAt: new Date().toISOString() }
        : s
    ));
  };

  const deleteScenario = (scenarioId) => {
    setSavedScenarios(prev => prev.filter(s => s.id !== scenarioId));
  };

  // Handle user profile (name, age, etc.) completion
  const handleUserInfoComplete = (info) => {
    setUserInfo(info);
    setAppState('modeSelection');
  };

  // Handle mode selection
  const handleModeSelect = (mode) => {
    if (mode === 'strategy') {
      setAppState('onboarding');
    }
    // Discovery mode would go elsewhere when implemented
  };

  // Handle onboarding (chatbot) completion
  const handleOnboardingComplete = (userData) => {
    setUserProfile(userData);
    setAppState('main');
  };

  // Show Welcome screen
  if (appState === 'welcome') {
    return (
      <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
        <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} backgroundColor={theme.colors.background} />
        <WelcomeScreen onComplete={() => setAppState('userProfile')} />
      </View>
    );
  }

  // Show User Profile screen (name, email, age)
  if (appState === 'userProfile') {
    return (
      <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
        <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} backgroundColor={theme.colors.background} />
        <UserProfileScreen onComplete={handleUserInfoComplete} />
      </View>
    );
  }

  // Show Mode Selection screen
  if (appState === 'modeSelection') {
    return (
      <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
        <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} backgroundColor={theme.colors.background} />
        <ModeSelectionScreen userInfo={userInfo} onSelectMode={handleModeSelect} />
      </View>
    );
  }

  // Show Onboarding screen (chatbot)
  if (appState === 'onboarding') {
    return (
      <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
        <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} backgroundColor={theme.colors.background} />
        <OnboardingScreen onComplete={handleOnboardingComplete} userInfo={userInfo} />
      </View>
    );
  }

  const resetApp = () => {
    setSavedColleges([]);
    setSavedScenarios([]);
    setUserProfile(null);
    setUserInfo(null);
    setAppState('welcome');
  };

  // Go back to onboarding chatbot (keeps user info, clears profile)
  const restartOnboarding = () => {
    setUserProfile(null);
    setAppState('onboarding');
  };

  const appContext = {
    userInfo,
    userProfile,
    savedColleges,
    saveCollege,
    deleteCollege,
    toggleFavorite,
    clearColleges,
    savedScenarios,
    saveScenario,
    updateScenario,
    deleteScenario,
    resetApp,
    restartOnboarding
  };

  return (
    <AppContext.Provider value={appContext}>
      <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
        <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} backgroundColor={theme.colors.background} />
        <NavigationContainer>
          <Tab.Navigator
            screenOptions={({ route }) => ({
              headerShown: false,
              tabBarStyle: {
                backgroundColor: theme.colors.background,
                borderTopColor: theme.colors.glassBorder,
                borderTopWidth: 1,
                paddingTop: 8,
                paddingBottom: 8,
                height: 70,
              },
              tabBarActiveTintColor: theme.colors.primary,
              tabBarInactiveTintColor: theme.colors.textDim,
              tabBarLabelStyle: {
                fontSize: 11,
                fontWeight: '500',
                marginTop: 4,
              },
              tabBarIcon: ({ focused, color }) => {
                if (route.name === 'ExploreTab') {
                  return <Compass size={24} color={color} />;
                } else if (route.name === 'SavedTab') {
                  return <Briefcase size={24} color={color} />;
                } else if (route.name === 'ProfileTab') {
                  return <User size={24} color={color} />;
                }
              },
            })}
          >
            <Tab.Screen
              name="ExploreTab"
              options={{ tabBarLabel: 'Explore' }}
            >
              {() => <ExploreStack appContext={appContext} />}
            </Tab.Screen>
            <Tab.Screen
              name="SavedTab"
              options={{ tabBarLabel: 'Saved' }}
            >
              {() => <SavedStack appContext={appContext} />}
            </Tab.Screen>
            <Tab.Screen
              name="ProfileTab"
              options={{ tabBarLabel: 'Profile' }}
            >
              {() => <ProfileStack appContext={appContext} />}
            </Tab.Screen>
          </Tab.Navigator>
        </NavigationContainer>
      </View>
    </AppContext.Provider>
  );
}

// Explore Tab Stack (Main Search Flow)
function ExploreStack({ appContext }) {
  const { userProfile } = appContext;
  // Check if we have complete profile data (including specific career SOC)
  const hasCompleteProfile = userProfile?.gpa && userProfile?.budget && userProfile?.career?.soc;

  // Force reset when user profile changes
  React.useEffect(() => {
    // If profile is complete, we can navigate or the initialRouteName logic will handle it on remount
  }, [userProfile]);

  return (
    <Stack.Navigator
      screenOptions={{ headerShown: false }}
      initialRouteName={hasCompleteProfile ? "Results" : "CareerSelect"}
      key={hasCompleteProfile ? "results-flow" : "onboarding-flow"}
    >
      <Stack.Screen name="CareerSelect">
        {(props) => (
          <LobbyScreen
            {...props}
            showTutorial={false}
            closeTutorial={() => { }}
          />
        )}
      </Stack.Screen>
      <Stack.Screen name="Stats">
        {(props) => (
          <StatsScreen
            {...props}
            showTutorial={false}
            closeTutorial={() => { }}
          />
        )}
      </Stack.Screen>
      <Stack.Screen
        name="Results"
        initialParams={hasCompleteProfile ? { userProfile } : undefined}
      >
        {(props) => (
          <MissionMapScreen
            {...props}
            showTutorial={false}
            closeTutorial={() => { }}
            saveMission={appContext.saveCollege}
            savedMissions={appContext.savedColleges}
            deleteMission={appContext.deleteCollege}
            restartOnboarding={appContext.restartOnboarding}
            showPvPTutorial={false}
            closePvPTutorial={() => { }}
            showPreviewTutorial={false}
            closePreviewTutorial={() => { }}
          />
        )}
      </Stack.Screen>
      <Stack.Screen name="CostAnalysis">
        {(props) => (
          <DamageReportScreen
            {...props}
            showTutorial={false}
            saveMission={appContext.saveCollege}
            savedMissions={appContext.savedColleges}
            deleteMission={appContext.deleteCollege}
            saveScenario={appContext.saveScenario}
            userProfile={appContext.userProfile}
          />
        )}
      </Stack.Screen>
      <Stack.Screen name="Summary">
        {(props) => (
          <MissionLogScreen
            {...props}
            showTutorial={false}
            closeTutorial={() => { }}
            saveMission={appContext.saveCollege}
          />
        )}
      </Stack.Screen>
    </Stack.Navigator>
  );
}

// Saved Tab Stack
function SavedStack({ appContext }) {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="SavedColleges">
        {(props) => (
          <PortfolioScreen
            {...props}
            savedMissions={appContext.savedColleges}
            deleteMission={appContext.deleteCollege}
            toggleFavorite={appContext.toggleFavorite}
            savedScenarios={appContext.savedScenarios}
            deleteScenario={appContext.deleteScenario}
            updateScenario={appContext.updateScenario}
          />
        )}
      </Stack.Screen>
      <Stack.Screen name="CostAnalysis">
        {(props) => (
          <DamageReportScreen
            {...props}
            showTutorial={false}
            saveMission={appContext.saveCollege}
            savedMissions={appContext.savedColleges}
            deleteMission={appContext.deleteCollege}
            saveScenario={appContext.saveScenario}
            userProfile={appContext.userProfile}
          />
        )}
      </Stack.Screen>
    </Stack.Navigator>
  );
}

// Profile Tab Stack
function ProfileStack({ appContext }) {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Profile">
        {(props) => (
          <ProfileScreen
            {...props}
            resetTutorial={() => { }}
            savedMissions={[]}
            showTutorial={false}
            closeTutorial={() => { }}
            clearMissions={appContext.clearColleges}
            resetApp={appContext.resetApp}
          />
        )}
      </Stack.Screen>
      <Stack.Screen name="Help" component={HelpScreen} />
    </Stack.Navigator>
  );
}

export { AppContext };
