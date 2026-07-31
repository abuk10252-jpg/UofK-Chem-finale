import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  User,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';

// ✅ أزلنا useRouter اللي مش مستخدم

type UserRole = 'student' | 'admin' | 'super-admin' | 'pending' | null;

interface AuthUser {
  uid: string;
  email: string;
  role: UserRole;
  displayName?: string;
  universityId?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ success: boolean; message: string; needsApproval?: boolean }>;
  signUp: (email: string, password: string, displayName: string, universityId: string) => Promise<{ success: boolean; message: string }>;
  logout: () => Promise<{ success: boolean; message: string }>;
  resetPassword: (email: string) => Promise<{ success: boolean; message: string }>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        if (firebaseUser) {
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setUser({
              uid: firebaseUser.uid,
              email: firebaseUser.email!,
              role: userData.role || 'pending',
              displayName: userData.displayName,
              universityId: userData.universityId,
            });
          } else {
            setUser({
              uid: firebaseUser.uid,
              email: firebaseUser.email!,
              role: 'pending',
            });
          }
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));

      if (userDoc.exists()) {
        const userData = userDoc.data();
        if (userData.role === 'pending' || !userData.role) {
          return {
            success: true,
            message: 'حسابك قيد المراجعة. سيتم تفعيل حسابك قريباً.',
            needsApproval: true,
          };
        }
        return { success: true, message: 'تم تسجيل الدخول بنجاح' };
      } else {
        await signOut(auth);
        return { success: false, message: 'بيانات المستخدم غير موجودة' };
      }
    } catch (error: any) {
      let message = 'حدث خطأ في تسجيل الدخول';
      if (error.code === 'auth/user-not-found') {
        message = 'البريد الإلكتروني غير مسجل';
      } else if (error.code === 'auth/wrong-password') {
        message = 'كلمة المرور غير صحيحة';
      } else if (error.code === 'auth/invalid-email') {
        message = 'البريد الإلكتروني غير صالح';
      } else if (error.code === 'auth/invalid-credential') {
        message = 'البريد الإلكتروني أو كلمة المرور غير صحيحة';
      } else if (error.code === 'auth/too-many-requests') {
        message = 'محاولات كثيرة. الرجاء المحاولة لاحقاً';
      }
      return { success: false, message };
    }
  };

  const signUp = async (email: string, password: string, displayName: string, universityId: string) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);

      await setDoc(doc(db, 'users', userCredential.user.uid), {
        email,
        displayName,
        universityId,
        role: 'pending',
        createdAt: new Date().toISOString(),
      });

      return {
        success: true,
        message: 'تم إنشاء الحساب بنجاح. في انتظار موافقة المشرف.',
      };
    } catch (error: any) {
      let message = 'حدث خطأ في إنشاء الحساب';
      if (error.code === 'auth/email-already-in-use') {
        message = 'البريد الإلكتروني مستخدم بالفعل';
      } else if (error.code === 'auth/weak-password') {
        message = 'كلمة المرور ضعيفة جداً';
      } else if (error.code === 'auth/invalid-email') {
        message = 'البريد الإلكتروني غير صالح';
      }
      return { success: false, message };
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      return { success: true, message: 'تم تسجيل الخروج بنجاح' };
    } catch (error) {
      return { success: false, message: 'حدث خطأ في تسجيل الخروج' };
    }
  };

  const resetPassword = async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email);
      return { success: true, message: 'تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني' };
    } catch (error: any) {
      let message = 'حدث خطأ في إرسال رابط إعادة التعيين';
      if (error.code === 'auth/user-not-found') {
        message = 'البريد الإلكتروني غير مسجل';
      }
      return { success: false, message };
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, logout, resetPassword }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
