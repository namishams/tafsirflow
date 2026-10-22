import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform, TurboModuleRegistry } from "react-native";
import { perfBaseline, perfLog } from "./perf";

// The app's key-value storage engine: MMKV (synchronous, memory-mapped, no bridge round trip) with AsyncStorage as the
// safety net. Same strings in, same strings out, byte for byte.
//
// Switching engines must never lose a value, so:
// - On the first start with MMKV, every key in AsyncStorage is copied into MMKV and read back. Only when every value
//   reads back identical is the copy marked complete (MIGRATED) and MMKV used for reading. Any error or difference:
//   this start reads AsyncStorage as before and the next start tries again (copying again is harmless).
// - AsyncStorage is never cleared. Every write still goes to AsyncStorage too (in the background, as before), so it
//   stays a complete, current copy and a later fallback to it loses nothing.
// - A start that had to fall back to AsyncStorage (MMKV missing or failing) marks AsyncStorage DIRTY; the next start
//   with MMKV then copies everything again before reading from MMKV, so writes made meanwhile are not lost.
// - Without MMKV (web, an app binary built before MMKV) everything works on AsyncStorage exactly as before.
// Two caches still talk to AsyncStorage directly and are not read through here (features/feed/remote.ts, prefix
// "qmc.feed-remote:", and content/sources/net.ts, prefix "tf:src:"): their MMKV copies are a snapshot from the
// migration. Moving them onto this module needs a fresh copy of those prefixes first.

type MMKVLike = {
  set: (k: string, v: string) => void;
  getString: (k: string) => string | undefined;
  getAllKeys: () => string[];
  remove: (k: string) => boolean;
};

const MIGRATED = "__kv.migrated.v1"; // in MMKV: the copy from AsyncStorage is complete and verified
const DIRTY = "__kv.dirty.v1"; // in AsyncStorage: a start ran on AsyncStorage alone after the copy
const INTERNAL = new Set([MIGRATED, DIRTY]);

let mmkv: MMKVLike | null = null;
let engine: "mmkv" | "async" = "async";
let ready: Promise<void> | null = null;
let settled = false;

function openMMKV(): MMKVLike | null {
  if (Platform.OS === "web") return null;
  try {
    // an app binary built before MMKV has no Nitro module: do not even load the package (its import would throw)
    if (!TurboModuleRegistry.get("NitroModules")) { perfLog("[perf] kv: no NitroModules in this binary"); return null; }
    // required here, not imported: an app binary without the native module must still start
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { createMMKV } = require("react-native-mmkv") as { createMMKV: (c: { id: string }) => MMKVLike };
    const s = createMMKV({ id: "qmc.kv" });
    // a quick write / read / remove proves the native side works
    s.set("__kv.probe", "ok");
    const ok = s.getString("__kv.probe") === "ok";
    s.remove("__kv.probe");
    return ok ? s : null;
  } catch (e) {
    perfLog(`[perf] kv: MMKV failed: ${String(e)}`);
    return null;
  }
}

/** copies every AsyncStorage value into MMKV and reads each one back; true when all are identical */
async function copyAll(s: MMKVLike): Promise<boolean> {
  const keys = (await AsyncStorage.getAllKeys()).filter((k) => !INTERNAL.has(k));
  const pairs = keys.length ? await AsyncStorage.multiGet(keys) : [];
  for (const [k, v] of pairs) if (v !== null) s.set(k, v);
  for (const [k, v] of pairs) if (v !== null && s.getString(k) !== v) return false;
  return true;
}

/** picks the engine for this start (once); awaited before the first screen renders (lib/store.ts hydrateStore) */
export function initKV(): Promise<void> {
  ready ??= (async () => {
    try { await choose(); } finally { settled = true; }
  })();
  return ready;
}

async function choose() {
  if (Platform.OS === "web") return; // the website build: AsyncStorage (localStorage) as always
  // (a measurement start with -perfBaseline runs on AsyncStorage, through the same safe fallback path)
  const s = perfBaseline ? null : openMMKV();
  if (!s) {
    engine = "async";
    // writes of this start reach AsyncStorage only: a later start with MMKV must copy again first
    await AsyncStorage.setItem(DIRTY, "1").catch(() => undefined);
    return;
  }
  try {
    const dirty = (await AsyncStorage.getItem(DIRTY)) === "1";
    if (s.getString(MIGRATED) !== "1" || dirty) {
      if (!(await copyAll(s))) { engine = "async"; return; }
      s.set(MIGRATED, "1");
      if (dirty) await AsyncStorage.removeItem(DIRTY);
    }
    mmkv = s;
    engine = "mmkv";
  } catch {
    engine = "async";
    mmkv = null;
  }
}

export const kvEngine = () => engine;

/** every stored key (internal markers left out) */
export async function getAllKeys(): Promise<string[]> {
  await initKV();
  if (mmkv) {
    try { return mmkv.getAllKeys().filter((k) => !INTERNAL.has(k)); } catch { /* fall through */ }
  }
  return (await AsyncStorage.getAllKeys()).filter((k) => !INTERNAL.has(k));
}

export async function multiGet(keys: readonly string[]): Promise<[string, string | null][]> {
  await initKV();
  if (mmkv) {
    try { return keys.map((k) => [k, mmkv!.getString(k) ?? null]); } catch { /* fall through */ }
  }
  return (await AsyncStorage.multiGet(keys)) as [string, string | null][];
}

export async function getItem(key: string): Promise<string | null> {
  await initKV();
  if (mmkv) {
    try { return mmkv.getString(key) ?? null; } catch { /* fall through */ }
  }
  return AsyncStorage.getItem(key);
}

/** MMKV at once (when it is the engine), AsyncStorage in the background as the safety copy */
export function setItem(key: string, value: string): Promise<void> {
  toMMKV((s) => s.set(key, value));
  return AsyncStorage.setItem(key, value);
}

export function removeItem(key: string): Promise<void> {
  toMMKV((s) => { s.remove(key); });
  return AsyncStorage.removeItem(key);
}

// a write while the engine is still being chosen is applied to MMKV after the copy (in order), so the copy cannot
// overwrite it with the older value
function toMMKV(op: (s: MMKVLike) => void) {
  const run = () => {
    if (!mmkv) return;
    try { op(mmkv); } catch { markDirty(); }
  };
  if (settled) run();
  else void initKV().then(run);
}

// MMKV refused a write: from now on this start reads AsyncStorage (which has every write), and the next start copies again
function markDirty() {
  mmkv = null;
  engine = "async";
  AsyncStorage.setItem(DIRTY, "1").catch(() => undefined);
}

/** development and measurement builds: compares every value in MMKV with its AsyncStorage copy (logged as "[perf] kv") */
export async function verifyMirror(): Promise<{ keys: number; missing: number; different: number; examples: string[] } | null> {
  await initKV();
  if (!mmkv) return null;
  // the two caches that still write to AsyncStorage themselves (see the top of this file) are not compared
  const keys = (await AsyncStorage.getAllKeys()).filter((k) => !INTERNAL.has(k) && !k.startsWith("tf:src:") && !k.startsWith("qmc.feed-remote:"));
  let missing = 0, different = 0;
  const examples: string[] = [];
  for (const [k, v] of await AsyncStorage.multiGet(keys)) {
    if (v === null) continue;
    const m = mmkv.getString(k);
    if (m === undefined) { missing++; if (examples.length < 12) examples.push(`-${k}`); }
    else if (m !== v) { different++; if (examples.length < 12) examples.push(`~${k}`); }
  }
  return { keys: keys.length, missing, different, examples };
}
