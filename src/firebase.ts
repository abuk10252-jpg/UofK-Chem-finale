import { initializeApp, getApps, getApp } from "firebase/app";
import { initializeAuth, getAuth } from "firebase/auth";
import { Platform } from "react-native";
import asyncStoragePersistence from "./utils/firebasePersistence";

const firebaseConfig = {
  apiKey: "AIzaSyBBq6jJ_25f6zPAxKPZew_kh-4UFAQLIEM",
  authDomain: "uofk-chem.firebaseapp.com",
  projectId: "uofk-chem",
  storageBucket: "uofk-chem.firebasestorage.app",
  messagingSenderId: "647909218035",
  appId: "1:647909218035:web:6838d2e4e6508c60b44986",
};

let app;
let auth: ReturnType<typeof getAuth>;

try {
  if (getApps().length === 0) {
    app = initializeApp(firebaseConfig);

    if (Platform.OS === "web") {
      auth = getAuth(app);
    } else {
      auth = initializeAuth(app, {
        persistence: asyncStoragePersistence as any,
      });
    }
  } else {
    app = getApp();
    auth = getAuth(app);
  }

  console.log("✅ Firebase initialized with project:", firebaseConfig.projectId);
} catch (error) {
  console.error("❌ Firebase initialization error:", error);
  app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
  auth = getAuth(app);
}

export { auth };
