import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { AuthProvider } from '../src/context/AuthContext';

SplashScreen.preventAutoHideAsync().catch(() => {});

export default function RootLayout() {
  useEffect(() => {
    SplashScreen.hideAsync().catch(() => {});
  }, []);

  return (
    <AuthProvider>
      <StatusBar style="light" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="login" />
        <Stack.Screen name="register" />
        <Stack.Screen name="pending" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="admin/index" />
        <Stack.Screen name="admin/create-course" />
        <Stack.Screen name="admin/create-news" />
        <Stack.Screen name="admin/users" />
        <Stack.Screen name="admin/quiz-results/[id]" />
        <Stack.Screen name="course/[id]" />
        <Stack.Screen name="notifications/index" />
        <Stack.Screen name="super-admin/index" />
        <Stack.Screen name="super-admin/manage-roles" />
        <Stack.Screen name="super-admin/settings" />
      </Stack>
    </AuthProvider>
  );
}
