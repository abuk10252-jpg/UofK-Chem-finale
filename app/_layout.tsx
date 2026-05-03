import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { AuthProvider, useAuth } from '../src/context/AuthContext';

// منع SplashScreen من الاختفاء التلقائي
SplashScreen.preventAutoHideAsync().catch(() => {});

function RootLayoutInner() {
  const { loading } = useAuth();

  useEffect(() => {
    if (!loading) {
      // تأخير بسيط عشان الشاشة ما تومض
      const timer = setTimeout(() => {
        SplashScreen.hideAsync().catch(() => {});
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [loading]);

  return (
    <>
      <Stack
        screenOptions={{
          headerShown: false,
          animation: 'fade',
          // منع الشاشة البيضاء بين الصفحات
          contentStyle: { backgroundColor: '#002147' },
        }}
      />
      <StatusBar style="light" />
    </>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <RootLayoutInner />
    </AuthProvider>
  );
}
