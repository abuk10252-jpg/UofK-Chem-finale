import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiCall, apiPost } from '../utils/api';
import { auth } from "../firebase";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
} from "firebase/auth";

export interface User {
  id: string;
  email: string;
  university_id: string;
  name: string;
  role: string;
  status: string;
  language: string;
  profile_pic: string;
  subscribed_courses: string[];
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (data: {
    email: string;
    university_id: string;
    name: string;
    password: string;
  }) => Promise<User>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
}

export const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        if (firebaseUser) {
          // احصل على توكن طازج مع force refresh
          const freshToken = await firebaseUser.getIdToken(true);
          await AsyncStorage.setItem("token", freshToken);

          // اجلب بيانات المستخدم من السيرفر
          const data = await apiCall("/auth/me");

          if (data?.user) {
            setUser(data.user);
            await AsyncStorage.setItem("user", JSON.stringify(data.user));
          } else {
            // لو السيرفر فشل، استخدم البيانات المحفوظة
            const savedUser = await AsyncStorage.getItem("user");
            if (savedUser) {
              try {
                setUser(JSON.parse(savedUser));
              } catch {
                await AsyncStorage.multiRemove(["user", "token"]);
                setUser(null);
              }
            }
          }
        } else {
          // لا يوجد مستخدم في Firebase
          const savedUser = await AsyncStorage.getItem("user");
          const savedToken = await AsyncStorage.getItem("token");

          if (savedUser && savedToken) {
            try {
              setUser(JSON.parse(savedUser));
            } catch {
              await AsyncStorage.multiRemove(["user", "token"]);
              setUser(null);
            }
          } else {
            setUser(null);
          }
        }
      } catch (error) {
        console.warn("onAuthStateChanged handler error:", error);
        // تحميل احتياطي من AsyncStorage
        try {
          const savedUser = await AsyncStorage.getItem("user");
          if (savedUser) {
            setUser(JSON.parse(savedUser));
          } else {
            setUser(null);
          }
        } catch {
          setUser(null);
        }
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  /**
   * تسجيل الدخول
   */
  async function login(email: string, password: string): Promise<User> {
    try {
      const cred = await signInWithEmailAndPassword(auth, email, password);

      const idToken = await cred.user.getIdToken(true);
      await AsyncStorage.setItem("token", idToken);

      const data = await apiCall('/auth/me');

      if (!data?.user) {
        throw new Error("Invalid user data from server");
      }

      setUser(data.user);
      await AsyncStorage.setItem("user", JSON.stringify(data.user));

      return data.user;
    } catch (error) {
      console.error("Login Error:", error);
      throw error;
    }
  }

  /**
   * تسجيل حساب جديد
   */
  async function register(regData: {
    email: string;
    university_id: string;
    name: string;
    password: string;
  }): Promise<User> {
    try {
      const cred = await createUserWithEmailAndPassword(
        auth,
        regData.email,
        regData.password
      );

      const idToken = await cred.user.getIdToken(true);
      await AsyncStorage.setItem("token", idToken);

      const data = await apiPost('/auth/register', {
        email: regData.email,
        university_id: regData.university_id,
        name: regData.name,
      });

      if (!data?.user) {
        throw new Error("Invalid user data from server");
      }

      setUser(data.user);
      await AsyncStorage.setItem("user", JSON.stringify(data.user));

      return data.user;
    } catch (error) {
      console.error("Register Error:", error);
      throw error;
    }
  }

  /**
   * تسجيل الخروج
   */
  async function logout() {
    try {
      await signOut(auth);
      await AsyncStorage.multiRemove(["token", "user"]);
      setUser(null);
    } catch (error) {
      console.error("Logout Error:", error);
      throw error;
    }
  }

  /**
   * تحديث بيانات المستخدم
   */
  async function refreshUser() {
    try {
      const data = await apiCall('/auth/me');
      if (data?.user) {
        setUser(data.user);
        await AsyncStorage.setItem("user", JSON.stringify(data.user));
      }
    } catch (error) {
      console.warn("Could not refresh user data:", error);
    }
  }

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      login,
      register,
      logout,
      refreshUser,
      setUser,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
