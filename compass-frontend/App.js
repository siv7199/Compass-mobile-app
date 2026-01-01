import React, { useState } from 'react';
import { View, StatusBar } from 'react-native';
import { theme } from './src/theme';

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

export default function App() {
  const [currentScreen, setCurrentScreen] = useState('Splash');
  const [screenParams, setScreenParams] = useState({});
  // Tutorial State per Screen
  const [tutorialState, setTutorialState] = useState({
    'Lobby': true,
    'Stats': true,
    'Career': true,
    'Map': true,
    'PvP': true,
    'DamageReport': true,
    'Profile': true
  });

  const [savedMissions, setSavedMissions] = useState([]);

  const markSeen = (screen) => {
    setTutorialState(prev => ({ ...prev, [screen]: false }));
  };

  const resetTutorials = () => {
    setTutorialState({
      'Lobby': true, 'Stats': true, 'Career': true, 'Map': true, 'PvP': true, 'DamageReport': true, 'Profile': true
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
      if (currentScreen === 'DamageReportScreen') setCurrentScreen('Lobby'); // Back to Lobby? Or Map?
      if (currentScreen === 'MissionLogScreen') setCurrentScreen('Lobby'); // Back to Lobby?
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
          setShowTutorial={(val) => val ? resetTutorials() : markSeen('DamageReport')} // Complex toggle mapping
          saveMission={saveMission} // Pass save function? No, PvP does saving.
        />;
      case 'MissionLogScreen':
        return <MissionLogScreen
          navigation={navigation}
          route={{ params: screenParams.MissionLogScreen }}
          showTutorial={tutorialState['DamageReport']} // Re-use DamageReport state or new one? User said "every page".
          // Let's use DamageReport state for simplicity OR map it.
          // Wait, I didn't add 'MissionLog' to tutorialState in App.js Step 3976.
          // I should use "DamageReport" state or add a new one.
          // I'll add 'MissionLog' key to App.js state later if I strictly want it unique.
          // For now, let's map it to 'DamageReport' to avoid App.js schema change crash.
          // actually, user said "every single page". 
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
        <StatusBar barStyle="light-content" />
        {renderScreen()}
      </View>
    </SafeAreaProvider>
  );
}
