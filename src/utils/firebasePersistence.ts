import AsyncStorage from "@react-native-async-storage/async-storage";

/**
 * طبقة تخزين مخصصة لـ Firebase تستخدم AsyncStorage
 * تتيح لـ Firebase حفظ حالة المستخدم وتجديد التوكن تلقائياً بعد إعادة التشغيل
 */
const asyncStoragePersistence = {
  type: "LOCAL" as const,

  _isAvailable(): Promise<boolean> {
    return AsyncStorage.getItem("__firebase_test__")
      .then(() => true)
      .catch(() => false);
  },

  async _set(key: string, value: unknown): Promise<void> {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  },

  async _get(key: string): Promise<unknown | null> {
    const item = await AsyncStorage.getItem(key);
    if (!item) return null;
    try {
      return JSON.parse(item);
    } catch {
      return null;
    }
  },

  async _remove(key: string): Promise<void> {
    await AsyncStorage.removeItem(key);
  },

  _addListener(_key: string, _listener: unknown): void {},
  _removeListener(_key: string, _listener: unknown): void {},
};

export default asyncStoragePersistence;
