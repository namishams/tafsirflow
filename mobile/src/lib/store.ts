import { useSyncExternalStore } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Same API as the website's src/lib/storage.ts (readJSON / writeJSON / setWriteHook), so the website's learning
// modules run unchanged in the app. Values live in memory and are written through to AsyncStorage; the store is
// hydrated once before the first screen renders (see app/_layout.tsx).
const mem = new Map<string, string>();
const listeners = new Set<() => void>();
let version = 0;
let onWrite: ((key: string) => void) | null = null;
export const setWriteHook = (fn: ((key: string) => void) | null) => { onWrite = fn; };

const PREFIXES = ["tf:", "qmc."];
let hydrated: Promise<void> | null = null;
export function hydrateStore(): Promise<void> {
  hydrated ??= (async () => {
    try {
      const keys = (await AsyncStorage.getAllKeys()).filter((k) => PREFIXES.some((p) => k.startsWith(p)));
      for (const [k, v] of await AsyncStorage.multiGet(keys)) if (v !== null) mem.set(k, v);
    } catch { /* storage unavailable: start empty */ }
  })();
  return hydrated;
}

export function readJSON<T>(key: string, fallback: T): T {
  const v = mem.get(key);
  if (v === undefined) return fallback;
  try { return JSON.parse(v) as T; } catch { return fallback; }
}

export function writeJSON(key: string, value: unknown, silent = false) {
  const s = JSON.stringify(value);
  if (s === undefined) { mem.delete(key); AsyncStorage.removeItem(key).catch(() => undefined); }
  else { mem.set(key, s); AsyncStorage.setItem(key, s).catch(() => undefined); }
  version++;
  listeners.forEach((l) => l());
  if (!silent) onWrite?.(key);
}

export function removeKey(key: string) {
  mem.delete(key);
  AsyncStorage.removeItem(key).catch(() => undefined);
  version++;
  listeners.forEach((l) => l());
}

/** all stored learning data (used when the account is deleted or the user signs out) */
export const storedKeys = () => [...mem.keys()];

const subscribe = (l: () => void) => { listeners.add(l); return () => listeners.delete(l); };
/** re-render when anything in the store changes (progress, notes, settings) */
export function useStoreVersion(): number {
  return useSyncExternalStore(subscribe, () => version, () => version);
}
/** a value from the store that updates the screen when it changes */
export function useStored<T>(key: string, fallback: T): T {
  useStoreVersion();
  return readJSON<T>(key, fallback);
}
