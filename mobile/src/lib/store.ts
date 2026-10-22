import { useMemo, useSyncExternalStore } from "react";
import * as kv from "./kv";
import { PERF, perfLog } from "./perf";

// Same API as the website's src/lib/storage.ts (readJSON / writeJSON / setWriteHook), so the website's learning
// modules run unchanged in the app. Values live in memory and are written through to the key-value storage (MMKV with
// AsyncStorage as safety copy, lib/kv.ts); the store is hydrated once before the first screen renders (app/_layout.tsx).
const mem = new Map<string, string>();
const listeners = new Set<() => void>();
let version = 0;
let onWrite: ((key: string) => void) | null = null;
export const setWriteHook = (fn: ((key: string) => void) | null) => { onWrite = fn; };

const PREFIXES = ["tf:", "qmc."];
// the two network caches keep their own storage (features/feed/remote.ts, content/sources/net.ts) and are never read
// through the store: loading them into memory at every start only cost time (they hold hundreds of entries)
const CACHES = ["tf:src:", "qmc.feed-remote:"];
let hydrated: Promise<void> | null = null;
export function hydrateStore(): Promise<void> {
  hydrated ??= (async () => {
    const t0 = performance.now();
    try {
      const keys = (await kv.getAllKeys()).filter((k) => PREFIXES.some((p) => k.startsWith(p)) && !CACHES.some((p) => k.startsWith(p)));
      for (const [k, v] of await kv.multiGet(keys)) if (v !== null) mem.set(k, v);
    } catch { /* storage unavailable: start empty */ }
    perfLog(`[perf] hydrate ${mem.size} keys ${Math.round(performance.now() - t0)}ms engine=${kv.kvEngine()}`);
    if (PERF) setTimeout(() => { void kv.verifyMirror().then((r) => perfLog(`[perf] kv mirror ${JSON.stringify(r)}`)); }, 4000);
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
  if (s === undefined) { mem.delete(key); kv.removeItem(key).catch(() => undefined); }
  else { mem.set(key, s); kv.setItem(key, s).catch(() => undefined); }
  changed(key);
  if (!silent) onWrite?.(key);
}

export function removeKey(key: string) {
  mem.delete(key);
  kv.removeItem(key).catch(() => undefined);
  changed(key);
}

function changed(_key: string) {
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
/** a value from the store that updates the screen when it changes. It still re-renders on every write, like
 *  before (screens may read other keys during that render), but the value is parsed once per stored text: the same
 *  object until it changes, so memos and effects that depend on it no longer run on every render. */
export function useStored<T>(key: string, fallback: T): T {
  useStoreVersion();
  const raw = mem.get(key);
  const parsed = useMemo(() => {
    if (raw === undefined) return NONE;
    try { return JSON.parse(raw) as T; } catch { return NONE; }
  }, [raw]);
  return parsed === NONE ? fallback : (parsed as T);
}
const NONE = Symbol("none");
