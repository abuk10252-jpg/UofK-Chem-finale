import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { AuthProvider } from '../src/context/AuthContext';

SplashScreen.preventAutoHideAsync().catch(() => {});

export default function RootLayout() {
  useEffect(() => {
    // أعطِ الأب وقت يحمّل قبل ما تخفي السبلاش
    const timer = setTimeout(() => {
      SplashScreen.hideAsync().catch(() => {});
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <AuthProvider>
      <Stack screenOptions={{ headerShown: false }} />
      <StatusBar style="auto" />
    </AuthProvider>
  );
}
