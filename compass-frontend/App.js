import React, { useState } from 'react';
import { View, SafeAreaView, StatusBar } from 'react-native';
import { theme } from './src/theme';

// Screens
import LobbyScreen from './src/screens/LobbyScreen';
import StatsScreen from './src/screens/StatsScreen';
import MissionMapScreen from './src/screens/MissionMapScreen';
import MissionBriefScreen from './src/screens/MissionBriefScreen';

import { SafeAreaProvider } from 'react-native-safe-area-context';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState('Lobby');
  const [screenParams, setScreenParams] = useState({});

  // Mock Navigation Object
  const navigation = {
    navigate: (screenName, params) => {
      setScreenParams(prev => ({ ...prev, [screenName]: params }));
      setCurrentScreen(screenName);
    },
    goBack: () => {
      // Simple back logic needed? For this flow, maybe not, or hardcode.
      if (currentScreen === 'Stats') setCurrentScreen('Lobby');
      if (currentScreen === 'MissionMap') setCurrentScreen('Stats');
      if (currentScreen === 'MissionBrief') setCurrentScreen('Lobby');
    }
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case 'Lobby':
        return <LobbyScreen navigation={navigation} />;
      case 'Stats':
        return <StatsScreen navigation={navigation} route={{ params: screenParams.Stats }} />;
      case 'MissionMap':
        return <MissionMapScreen navigation={navigation} route={{ params: screenParams.MissionMap }} />;
      case 'MissionBrief':
        return <MissionBriefScreen navigation={navigation} route={{ params: screenParams.MissionBrief }} />;
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
