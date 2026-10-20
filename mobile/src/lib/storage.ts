import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

// Small persistent values (settings, progress). The session token lives in the keychain (SecureStore).
export async function load<T>(key: string, fallback: T): Promise<T> {
  try {
    const v = await AsyncStorage.getItem(key);
    return v ? (JSON.parse(v) as T) : fallback;
  } catch {
    return fallback;
  }
}
export async function save(key: string, value: unknown) {
  try { await AsyncStorage.setItem(key, JSON.stringify(value)); } catch { /* storage full or unavailable */ }
}
export async function remove(key: string) {
  try { await AsyncStorage.removeItem(key); } catch { /* ignore */ }
}

const TOKEN = "qmc.session";
export async function getToken(): Promise<string | null> {
  if (Platform.OS === "web") return load<string | null>(TOKEN, null);
  return SecureStore.getItemAsync(TOKEN).catch(() => null);
}
export async function setToken(token: string | null) {
  if (Platform.OS === "web") return token ? save(TOKEN, token) : remove(TOKEN);
  if (token) await SecureStore.setItemAsync(TOKEN, token);
  else await SecureStore.deleteItemAsync(TOKEN).catch(() => undefined);
}
