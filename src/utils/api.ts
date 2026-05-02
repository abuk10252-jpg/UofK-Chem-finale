import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import { auth } from '../firebase';

const BASE_URL = Constants.expoConfig?.extra?.API_URL || "";

if (!BASE_URL) {
  console.warn("⚠️ WARNING: API_URL is missing in app.json");
}

/**
 * الحصول على توكن صالح:
 * - يجرب Firebase أولاً (يجدد تلقائياً لو انتهت صلاحيته)
 * - يرجع للـ AsyncStorage كاحتياط
 */
async function getFreshToken(): Promise<string | null> {
  try {
    if (auth.currentUser) {
      const token = await auth.currentUser.getIdToken();
      await AsyncStorage.setItem("token", token);
      return token;
    }
  } catch (e) {
    console.warn("Firebase getIdToken failed, falling back to stored token:", e);
  }
  return AsyncStorage.getItem("token");
}

/**
 * دالة عامة لجميع API calls
 */
export async function apiCall(
  endpoint: string,
  options: RequestInit = {}
): Promise<any> {
  try {
    const netInfo = await NetInfo.fetch();
    if (!netInfo.isConnected) {
      return { offline: true };
    }

    const token = await getFreshToken();

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(options.headers as any),
    };

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    const response = await fetch(`${BASE_URL}${endpoint}`, {
      ...options,
      headers,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const text = await response.text();
      console.warn(`API Error ${response.status}:`, text);
      return null;
    }

    try {
      return await response.json();
    } catch {
      return null;
    }

  } catch (error) {
    console.warn(`API Call Error on ${endpoint}:`, error);
    return null;
  }
}

/**
 * GET
 */
export async function apiGet(endpoint: string) {
  return apiCall(endpoint, { method: 'GET' });
}

/**
 * POST
 */
export async function apiPost(endpoint: string, body: any) {
  return apiCall(endpoint, {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

/**
 * PUT
 */
export async function apiPut(endpoint: string, body: any) {
  return apiCall(endpoint, {
    method: 'PUT',
    body: JSON.stringify(body),
  });
}

/**
 * DELETE
 */
export async function apiDelete(endpoint: string) {
  return apiCall(endpoint, { method: 'DELETE' });
}

/**
 * رفع ملف (multipart/form-data)
 */
export async function uploadFile(endpoint: string, formData: FormData): Promise<any> {
  try {
    const netInfo = await NetInfo.fetch();
    if (!netInfo.isConnected) return { offline: true };

    const token = await getFreshToken();
    const headers: Record<string, string> = {};
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);

    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method: 'POST',
      headers,
      body: formData,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const text = await response.text();
      throw new Error(text || `Upload failed with status ${response.status}`);
    }

    return await response.json();
  } catch (error: any) {
    console.warn(`Upload Error on ${endpoint}:`, error);
    throw error;
  }
}
