import { initializeApp, getApps, getApp } from "firebase/app";
import {
  initializeAuth,
  getAuth,
  getReactNativePersistence,
  Auth
} from "firebase/auth/react-native";

import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY || "AIzaSyBBq6jJ_25f6zPAxKPZew_kh-4UFAQLIEM",
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN || "uofk-chem.firebaseapp.com",
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || "uofk-chem",
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET || "uofk-chem.firebasestorage.app",
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "647909218035",
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID || "1:647909218035:web:6838d2e4e6508c60b44986",
};

let auth: Auth;

try {
  const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

  if (Platform.OS === "web") {
    // الويب مو محتاج ReactNative persistence
    const { getAuth: getWebAuth } = require("firebase/auth");
    auth = getWebAuth(app);
  } else {
    // موبايل - نستخدم AsyncStorage للحفاظ على الجلسة
    auth = initializeAuth(app, {
      persistence: getReactNativePersistence(AsyncStorage),
    });
  }

  console.log("✅ Firebase initialized:", firebaseConfig.projectId);

} catch (error: any) {
  // لو Firebase اتهيأ قبل كده نرجع الـ instance الموجود
  if (error?.code === 'auth/already-initialized') {
    const app = getApp();
    const { getAuth: getWebAuth } = require("firebase/auth");
    auth = getWebAuth(app);
  } else {
    console.error("❌ Firebase init error:", error);
    const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
    const { getAuth: getWebAuth } = require("firebase/auth");
    auth = getWebAuth(app);
  }
}

export { auth };
