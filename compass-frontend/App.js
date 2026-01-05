import React, { useState } from 'react';
import { View, StatusBar } from 'react-native';
import { ThemeProvider, useTheme } from './src/theme/ThemeContext';

// Screens
import LobbyScreen from './src/screens/LobbyScreen';
import StatsScreen from './src/screens/StatsScreen';
import MissionMapScreen from './src/screens/MissionMapScreen';
import MissionBriefScreen from './src/screens/MissionBriefScreen';
import DamageReportScreen from './src/screens/DamageReportScreen';
import CareerSelectionScreen from './src/screens/CareerSelectionScreen';
import MissionLogScreen from './src/screens/MissionLogScreen';
import SplashScreen from './src/screens/SplashScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import HelpScreen from './src/screens/HelpScreen';

import { SafeAreaProvider } from 'react-native-safe-area-context';

import { registerRootComponent } from 'expo';

// ... imports

export default function AppWrapper() {
  return (
    <ThemeProvider>
      <App />
    </ThemeProvider>
  );
}

registerRootComponent(AppWrapper);

function App() {
  const { theme, isDarkMode } = useTheme();
  const [currentScreen, setCurrentScreen] = useState('Splash');
  const [screenParams, setScreenParams] = useState({});

  // Tutorial State per Screen
  const [tutorialState, setTutorialState] = useState({
    'Lobby': true,
    'Stats': true,
    'Career': true,
    'Map': true,
    'MissionPreview': true,
    'PvP': true,
    'DamageReport': true,
    'Profile': true,
    'FieldManual': true
  });

  const [savedMissions, setSavedMissions] = useState([]);

  const markSeen = (screen) => {
    setTutorialState(prev => ({ ...prev, [screen]: false }));
  };

  const resetTutorials = () => {
    setTutorialState({
      'Lobby': false, 'Stats': true, 'Career': true, 'Map': true, 'MissionPreview': true, 'PvP': true, 'DamageReport': true, 'Profile': true, 'FieldManual': true
    });
  };

  const saveMission = (mission) => {
    setSavedMissions(prev => [mission, ...prev]);
  };

  const clearMissions = () => {
    setSavedMissions([]);
  };

  // Mock Navigation Object
  const navigation = {
    navigate: (screenName, params) => {
      setScreenParams(prev => ({ ...prev, [screenName]: params }));
      setCurrentScreen(screenName);
    },
    replace: (screenName, params) => {
      setScreenParams(prev => ({ ...prev, [screenName]: params }));
      setCurrentScreen(screenName);
    },
    goBack: () => {
      // Simple back logic
      if (currentScreen === 'Stats') setCurrentScreen('Lobby');
      if (currentScreen === 'MissionMap') setCurrentScreen('Stats');
      if (currentScreen === 'MissionBrief') setCurrentScreen('Lobby');
      if (currentScreen === 'DamageReportScreen') setCurrentScreen('CareerSelectionScreen'); // Fix: Go back to Career Select
      if (currentScreen === 'MissionLogScreen') setCurrentScreen('Lobby');
      if (currentScreen === 'CareerSelectionScreen') setCurrentScreen('MissionMap'); // Fix: Route back to Map
    }
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case 'Splash':
        return <SplashScreen navigation={navigation} />;
      case 'Lobby':
        return <LobbyScreen
          navigation={navigation}
          showTutorial={tutorialState['Lobby']}
          closeTutorial={() => markSeen('Lobby')}
        />;
      case 'Profile':
        return <ProfileScreen
          navigation={navigation}
          resetTutorial={resetTutorials}
          savedMissions={savedMissions}
          showTutorial={tutorialState['Profile']}
          closeTutorial={() => markSeen('Profile')}
          clearMissions={clearMissions}
        />;
      case 'Stats':
        return <StatsScreen
          navigation={navigation}
          route={{ params: screenParams.Stats }}
          showTutorial={tutorialState['Stats']}
          closeTutorial={() => markSeen('Stats')}
        />;
      case 'MissionMap':
        return <MissionMapScreen
          navigation={navigation}
          route={{ params: screenParams.MissionMap }}
          showTutorial={tutorialState['Map']}
          closeTutorial={() => markSeen('Map')}
          saveMission={saveMission}
          showPvPTutorial={tutorialState['PvP']}
          closePvPTutorial={() => markSeen('PvP')}
          showPreviewTutorial={tutorialState['MissionPreview']}
          closePreviewTutorial={() => markSeen('MissionPreview')}
        />;
      case 'CareerSelectionScreen':
        return <CareerSelectionScreen
          navigation={navigation}
          route={{ params: screenParams.CareerSelectionScreen }}
          showTutorial={tutorialState['Career']}
          closeTutorial={() => markSeen('Career')}
        />;
      case 'MissionBrief':
        return <MissionBriefScreen navigation={navigation} route={{ params: screenParams.MissionBrief }} />;
      case 'DamageReportScreen':
        return <DamageReportScreen
          navigation={navigation}
          route={{ params: screenParams.DamageReportScreen }}
          showTutorial={tutorialState['DamageReport']}
          setShowTutorial={(val) => val ? resetTutorials() : markSeen('DamageReport')}
          saveMission={saveMission}
        />;
      case 'MissionLogScreen':
        return <MissionLogScreen
          navigation={navigation}
          route={{ params: screenParams.MissionLogScreen }}
          showTutorial={tutorialState['DamageReport']}
          closeTutorial={() => markSeen('DamageReport')}
          saveMission={saveMission}
        />;
      case 'HelpScreen':
        return <HelpScreen navigation={navigation} />;
      default:
        return <LobbyScreen navigation={navigation} />;
    }
  };

  return (
    <SafeAreaProvider>
      <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
        <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} backgroundColor={theme.colors.background} />
        {renderScreen()}
      </View>
    </SafeAreaProvider>
  );
}
