import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, initializeAuth } from "firebase/auth";
import { getReactNativePersistence } from "firebase/auth";
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

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

let auth;

try {
  if (Platform.OS !== "web") {
    auth = initializeAuth(app, {
      persistence: getReactNativePersistence(AsyncStorage),
    });
  } else {
    auth = getAuth(app);
  }
} catch (error) {
  auth = getAuth(app);
}

export { auth, app };
