import { initializeApp, getApps, getApp } from "firebase/app";
import { initializeAuth, getAuth, Auth } from "firebase/auth";

import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";

const firebaseConfig = {
  apiKey: "AIzaSyBBq6jJ_25f6zPAxKPZew_kh-4UFAQLIEM",
  authDomain: "uofk-chem.firebaseapp.com",
  projectId: "uofk-chem",
  storageBucket: "uofk-chem.firebasestorage.app",
  messagingSenderId: "647909218035",
  appId: "1:647909218035:web:6838d2e4e6508c60b44986",
};

let auth: Auth;

try {
  const app =
    getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

  if (Platform.OS === "web") {
    auth = getAuth(app);
  } else {
    auth = initializeAuth(app, {
      persistence: getReactNativePersistence(AsyncStorage),
    });
  }

  console.log("✅ Firebase initialized:", firebaseConfig.projectId);
} catch (error) {
  console.error("❌ Firebase init error:", error);
  const app =
    getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
  auth = getAuth(app);
}

export { auth };
