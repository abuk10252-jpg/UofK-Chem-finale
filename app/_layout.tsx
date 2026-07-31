import React, { useEffect, useState, useCallback } from 'react';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { AuthProvider, useAuth } from '../src/context/AuthContext';
import { NotificationProvider } from '../src/context/NotificationContext';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import * as Font from 'expo-font';
import * as Updates from 'expo-updates';

SplashScreen.preventAutoHideAsync();

function RootLayoutNav() {
  const { user, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();
  const [appIsReady, setAppIsReady] = useState(false);
  const [fontLoaded, setFontLoaded] = useState(false);

  useEffect(() => {
    async function loadFonts() {
      try {
        await Font.loadAsync({
          'SpaceMono': require('../assets/fonts/SpaceMono-Regular.ttf'),
        });
      } catch (e) {
        console.warn('Error loading fonts:', e);
      } finally {
        setFontLoaded(true);
      }
    }
    loadFonts();
  }, []);

  const checkForUpdates = useCallback(async () => {
    try {
      const update = await Updates.checkForUpdateAsync();
      if (update.isAvailable) {
        await Updates.fetchUpdateAsync();
        await Updates.reloadAsync();
      }
    } catch (e) {
      console.warn('Error checking for updates:', e);
    }
  }, []);

  useEffect(() => {
    checkForUpdates();
  }, [checkForUpdates]);

  useEffect(() => {
    if (!fontLoaded || loading) return;

    if (!user) {
      router.replace('/login');
    } else if (user && (user.role === 'pending' || !user.role)) {
      router.replace('/pending');
    } else if (user && user.role) {
      if (segments[0] === 'login' || segments[0] === 'pending' || segments[0] === undefined) {
        if (user.role === 'super-admin') {
          router.replace('/super-admin');
        } else if (user.role === 'admin') {
          router.replace('/admin');
        } else if (user.role === 'student') {
          router.replace('/(tabs)/academic');
        }
      }
    }
  }, [user, loading, fontLoaded, segments]);

  const onLayoutRootView = useCallback(async () => {
    if (fontLoaded && !loading) {
      await SplashScreen.hideAsync();
      setAppIsReady(true);
    }
  }, [fontLoaded, loading]);

  useEffect(() => {
    onLayoutRootView();
  }, [onLayoutRootView]);

  if (!appIsReady || !fontLoaded || loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>جاري التحميل...</Text>
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="login" options={{ title: 'تسجيل الدخول' }} />
      <Stack.Screen name="register" options={{ title: 'إنشاء حساب' }} />
      <Stack.Screen name="pending" options={{ title: 'قيد المراجعة' }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="admin/index" options={{ title: 'لوحة التحكم' }} />
      <Stack.Screen name="admin/create-course" options={{ title: 'إضافة مقرر' }} />
      <Stack.Screen name="admin/create-news" options={{ title: 'إضافة خبر' }} />
      <Stack.Screen name="admin/users" options={{ title: 'إدارة المستخدمين' }} />
      <Stack.Screen name="admin/quiz-results" options={{ title: 'نتائج الاختبارات' }} />
      <Stack.Screen name="super-admin/index" options={{ title: 'المشرف العام' }} />
      <Stack.Screen name="super-admin/manage-roles" options={{ title: 'إدارة الصلاحيات' }} />
      <Stack.Screen name="super-admin/settings" options={{ title: 'الإعدادات' }} />
      <Stack.Screen name="course/[id]" options={{ title: 'المقرر' }} />
      <Stack.Screen name="notifications/index" options={{ title: 'الإشعارات' }} />
      <Stack.Screen name="+html" options={{ headerShown: false }} />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <StatusBar style="auto" />
        <RootLayoutNav />
      </NotificationProvider>
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  loadingText: {
    marginTop: 20,
    fontSize: 16,
    color: '#007AFF',
    fontFamily: 'System',
  },
});
