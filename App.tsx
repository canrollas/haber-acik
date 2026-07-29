import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFonts } from 'expo-font';
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
} from '@expo-google-fonts/inter';
import {
  SourceSerif4_600SemiBold,
  SourceSerif4_700Bold,
} from '@expo-google-fonts/source-serif-4';
import HomeScreen from './src/screens/HomeScreen';
import DiscoverScreen from './src/screens/DiscoverScreen';
import GazetelerScreen from './src/screens/GazetelerScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import OnboardingCategoriesScreen from './src/screens/OnboardingCategoriesScreen';
import OnboardingNewspapersScreen from './src/screens/OnboardingNewspapersScreen';
import BottomNavBar, { NavTab } from './src/components/BottomNavBar';
import { ThemeProvider, useAppTheme } from './src/theme/ThemeContext';
import { PreferencesProvider } from './src/context/PreferencesContext';
import { usePushNotifications } from './src/hooks/usePushNotifications';

const ONBOARDING_COMPLETE_KEY = 'haberacik.onboardingComplete';

type OnboardingStatus = 'checking' | 'categories' | 'newspapers' | 'done';

function MainApp() {
  usePushNotifications();
  const [activeTab, setActiveTab] = useState<NavTab>('home');
  const [onboardingStatus, setOnboardingStatus] = useState<OnboardingStatus>('checking');
  const { theme } = useAppTheme();

  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    SourceSerif4_600SemiBold,
    SourceSerif4_700Bold,
  });

  useEffect(() => {
    AsyncStorage.getItem(ONBOARDING_COMPLETE_KEY).then(value => {
      setOnboardingStatus(value === 'true' ? 'done' : 'categories');
    });
  }, []);

  const finishOnboarding = () => {
    AsyncStorage.setItem(ONBOARDING_COMPLETE_KEY, 'true');
    setOnboardingStatus('done');
  };

  if (!fontsLoaded || onboardingStatus === 'checking') {
    return null; // Or a loading screen
  }

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.surfaceContainerLowest }]} edges={['left', 'right']}>
      <StatusBar style={theme.isDark ? "light" : "dark"} />

      {onboardingStatus === 'categories' && (
        <OnboardingCategoriesScreen onNext={() => setOnboardingStatus('newspapers')} />
      )}
      {onboardingStatus === 'newspapers' && (
        <OnboardingNewspapersScreen onFinish={finishOnboarding} />
      )}
      {onboardingStatus === 'done' && (
        <>
          <View style={styles.content}>
            {activeTab === 'home' && <HomeScreen />}
            {activeTab === 'discover' && <DiscoverScreen />}
            {activeTab === 'gazeteler' && <GazetelerScreen />}
            {activeTab === 'settings' && <SettingsScreen />}
          </View>
          <BottomNavBar active={activeTab} onNavigate={setActiveTab} />
        </>
      )}
    </SafeAreaView>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <PreferencesProvider>
        <SafeAreaProvider>
          <MainApp />
        </SafeAreaProvider>
      </PreferencesProvider>
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
});
