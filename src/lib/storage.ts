let onWrite: ((key: string) => void) | null = null;
export const setWriteHook = (fn: ((key: string) => void) | null) => { onWrite = fn; };

// Listeners for screens that re-render when stored learning data changes (src/lib/learn/store.ts). Only notifies;
// reading and writing behave exactly as before.
const listeners = new Set<() => void>();
let version = 0;
export const storageVersion = () => version;
export function subscribeStorage(l: () => void) { listeners.add(l); return () => { listeners.delete(l); }; }
export function notifyStorage() { version++; listeners.forEach((l) => l()); }

export function readJSON<T>(key: string, fallback: T): T {
  try {
    const v = localStorage.getItem(key);
    return v ? (JSON.parse(v) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function writeJSON(key: string, value: unknown, silent = false) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage unavailable (private mode) – feature degrades silently */
  }
  notifyStorage();
  if (!silent) onWrite?.(key);
}
