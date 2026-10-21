// mirrors mobile/src/lib/store.ts – the same API (readJSON / writeJSON / useStored / useStoreVersion / removeKey) on top
// of the website's localStorage helpers (src/lib/storage.ts), so the learning modules copied from the app run unchanged.
// Keys stay the app's keys ("qmc.*", "tf:*"); the account sync (src/lib/learn/sync.ts) carries the learning keys.
import { useEffect, useSyncExternalStore } from "react";
import { notifyStorage, readJSON as read, setWriteHook, storageVersion, subscribeStorage, writeJSON as write } from "../storage";

export { setWriteHook };
export const readJSON = <T,>(key: string, fallback: T): T => read<T>(key, fallback);
export const writeJSON = (key: string, value: unknown, silent = false) => write(key, value, silent);

export function removeKey(key: string) {
  try { localStorage.removeItem(key); } catch { /* storage unavailable */ }
  notifyStorage();
}

/** all stored learning keys of this browser */
export function storedKeys(): string[] {
  try { return Object.keys(localStorage).filter((k) => k.startsWith("tf:") || k.startsWith("qmc.")); } catch { return []; }
}

// another tab, the account sync ("tf-synced") or the window coming back into focus: read again
let wired = false;
function wire() {
  if (wired || typeof window === "undefined") return;
  wired = true;
  window.addEventListener("storage", notifyStorage);
  window.addEventListener("tf-synced", notifyStorage);
}

/** re-render when anything in the store changes; 0 during server rendering and the first client render */
export function useStoreVersion(): number {
  useEffect(wire, []);
  return useSyncExternalStore(subscribeStorage, storageVersion, () => -1);
}

/** a stored value that updates the screen when it changes. Server rendering and hydration see the fallback, so
 *  pages render the same markup on the server and in the browser and then show the stored progress. */
export function useStored<T>(key: string, fallback: T): T {
  const v = useStoreVersion();
  if (v < 0) return fallback;
  return readJSON<T>(key, fallback);
}

/** true after hydration (stored values are available) */
export const useHydrated = () => useStoreVersion() >= 0;
