import { useEffect } from "react";
import { AppState, Platform } from "react-native";
import { SITE, api } from "./api";
import { useAuth } from "./auth";
import { readJSON, setWriteHook, writeJSON } from "./store";
import { mergePoints, type Points } from "@/web/points";
import { configureListen, mergeListen, type Listen } from "@/web/listen";

// the verse player's anonymous listening totals (web/listen.ts) go to the website's server, marked as app requests
configureListen({ base: SITE, headers: { "x-qmc-app": Platform.OS } });
import type { Srs } from "@/web/learning";
import { FEED_SYNC_KEYS, feedSnapshot, mergeFeed, reloadFeedCaches } from "@/features/feed/feedSync";
import { sendOfferStats } from "@/features/feed/statsStore";
import { GARDEN_KEY, mergeGarden, reloadGarden, type Garden } from "@/features/garden/garden";
import { EXTRA_KEYS, EXTRA_MERGE, mergeCourses, syncParts } from "./syncExtra";
import { CATALOG_KEY, mergeCatalog, reloadCatalog } from "@/features/garden/catalog";
import { JOURNEY_KEY, mergeJourney } from "@/features/journey/store";

// Progress sync with the account, the same merge rules as the website (src/lib/sync.ts): what you learn in the app
// shows up on quranmasterclass.com and the other way round.
type Last = { chapter: number; verse: number; at?: number };
type Days = Record<string, number>;
type Notes = Record<string, { text: string; at: number }>;

const bestScores = (a: unknown, b: unknown) => {
  const out: Record<string, number> = { ...((b as Record<string, number>) ?? {}) };
  for (const [k, v] of Object.entries((a as Record<string, number>) ?? {})) out[k] = Math.max(out[k] ?? 0, v);
  return { ...out, ...feedSnapshot(readJSON) };
};
type ArabicP = { done?: Record<string, { best: number; stars: number; at?: number }>; xp?: number; mistakes?: Record<string, number> };
function mergeArabic(a: ArabicP | undefined, b: ArabicP | undefined) {
  if (!a || !b) return a ?? b;
  const done = { ...(b.done ?? {}) };
  for (const [k, v] of Object.entries(a.done ?? {})) { const o = done[k]; done[k] = o ? { best: Math.max(o.best, v.best), stars: Math.max(o.stars, v.stars), at: Math.max(o.at ?? 0, v.at ?? 0) } : v; }
  const mistakes = { ...(b.mistakes ?? {}) };
  for (const [k, v] of Object.entries(a.mistakes ?? {})) mistakes[k] = Math.max(mistakes[k] ?? 0, v);
  return { ...b, ...a, done, xp: Math.max(a.xp ?? 0, b.xp ?? 0), mistakes };
}

function merge(local: Record<string, unknown>, remote: Record<string, unknown>) {
  const bm = Array.from(new Set([...((local["tf:bookmarks"] as string[]) ?? []), ...((remote["tf:bookmarks"] as string[]) ?? [])]));
  const srs: Srs = { ...((remote["tf:srs"] as Srs) ?? {}) };
  for (const [k, v] of Object.entries((local["tf:srs"] as Srs) ?? {})) if (!srs[k] || (v.at ?? 0) >= (srs[k].at ?? 0)) srs[k] = v;
  const days: Days = { ...((remote["tf:days"] as Days) ?? {}) };
  for (const [k, v] of Object.entries((local["tf:days"] as Days) ?? {})) days[k] = Math.max(days[k] ?? 0, v);
  const a = local["tf:last"] as Last | undefined, b = remote["tf:last"] as Last | undefined;
  const last = !a ? b : !b ? a : (a.at ?? 0) >= (b.at ?? 0) ? a : b;
  const notes: Notes = { ...((remote["tf:notes"] as Notes) ?? {}) };
  for (const [k, v] of Object.entries((local["tf:notes"] as Notes) ?? {})) if (!notes[k] || v.at >= notes[k].at) notes[k] = v;
  const newer = (k: string) => { const x = local[k] as { at?: number } | null | undefined, y = remote[k] as { at?: number } | null | undefined; return (x?.at ?? 0) >= (y?.at ?? 0) ? x : y; };
  return { "tf:bookmarks": bm, "tf:srs": srs, "tf:days": days, "tf:notes": notes, "tf:academy": newer("tf:academy") ?? undefined, "tf:khatm": newer("tf:khatm") ?? undefined, "tf:plan": newer("tf:plan") ?? undefined, "tf:goal": newer("tf:goal") ?? undefined, "tf:wudu": newer("tf:wudu") ?? undefined, "tf:jv": { ...((remote["tf:jv"] as object) ?? {}), ...((local["tf:jv"] as object) ?? {}) }, "tf:points": mergePoints(local["tf:points"] as Points | undefined, remote["tf:points"] as Points | undefined), "tf:listen": mergeListen(local["tf:listen"] as Listen | undefined, remote["tf:listen"] as Listen | undefined), "tf:mnemo": { ...((remote["tf:mnemo"] as object) ?? {}), ...((local["tf:mnemo"] as object) ?? {}) }, "tf:vocab": { ...((remote["tf:vocab"] as object) ?? {}), ...((local["tf:vocab"] as object) ?? {}) }, "tf:tajweed": bestScores(local["tf:tajweed"], remote["tf:tajweed"]), "tf:arabic": mergeArabic(local["tf:arabic"] as ArabicP | undefined, remote["tf:arabic"] as ArabicP | undefined), "tf:duafav": Array.from(new Set([...((local["tf:duafav"] as string[]) ?? []), ...((remote["tf:duafav"] as string[]) ?? [])])), ...(last ? { "tf:last": last } : {}) } as Record<string, unknown>;
}

export const SYNC_KEYS = ["tf:last", "tf:bookmarks", "tf:srs", "tf:days", "tf:notes", "tf:academy", "tf:khatm", "tf:plan", "tf:mnemo", "tf:vocab", "tf:tajweed", "tf:duafav", "tf:arabic", "tf:goal", "tf:wudu", "tf:points", "tf:listen", "tf:jv", ...FEED_SYNC_KEYS, GARDEN_KEY, CATALOG_KEY, "qmc.courses.v1", ...EXTRA_KEYS, JOURNEY_KEY] as const;
// Shams 2.0, question bank, Nahj course and the academy courses: rules in syncExtra.ts (identical to the website copy)
const extraMerge = (local: Record<string, unknown>, remote: Record<string, unknown>) => {
  const out: Record<string, unknown> = {};
  const rules: Record<string, (a: unknown, b: unknown) => unknown> = { ...EXTRA_MERGE, "qmc.courses.v1": mergeCourses };
  for (const [k, f] of Object.entries(rules)) {
    const a = local[k], b = remote[k];
    if (a === undefined && b === undefined) continue;
    try { out[k] = a === undefined ? b : b === undefined ? a : f(a, b); } catch { out[k] = a ?? b; }
  }
  return out;
};
const snapshot = (): Record<string, unknown> => {
  const out: Record<string, unknown> = {};
  for (const k of SYNC_KEYS) { const v = readJSON<unknown>(k, undefined); if (v !== undefined && v !== null) out[k] = v; }
  for (const k of ["tf:bookmarks", "tf:duafav"]) out[k] ??= [];
  for (const k of ["tf:srs", "tf:days", "tf:notes", "tf:mnemo", "tf:vocab", "tf:tajweed", "tf:jv"]) out[k] ??= {};
  return out;
};

let timer: ReturnType<typeof setTimeout> | null = null;
let retry: ReturnType<typeof setTimeout> | null = null;
let retries = 0;
// what the server accepted in this session, per key (the JSON sent): a push after a change sends only the keys that
// changed, so the request stays small. The server stores each key on its own (upsert per key, src/app/api/sync/route.ts).
// startSync forgets it, so after every pull everything goes out once, as before.
const sent = new Map<string, string>();
let running: Promise<void> | null = null;
let again = false;

// the server accepts at most 400 KB per request: the changed keys go out in parts below 300 KB (a large question bank
// alone can come close). Never an empty part, never two pushes at once (the write hook, the move to the background and
// startSync used to overlap), and a part that fails stays unsent and is retried (5 s, 30 s, 2 min) instead of dropped.
// Before (22.10.2026), PUT /api/sync sometimes reached the server with an empty or cut-off body (400, 408): the whole
// snapshot was sent again when the app went to the background and iOS suspended it during the upload.
// A part that fails does not stop the others: every part is tried, the result is false if any failed (those keys stay
// unsent and go out with the retry). A single key is never above SYNC_KEY_MAX (390 KB): "tf:srs" is cut to the most
// recently reviewed verses (capSrs), any other key that large stays on the device (syncParts in syncExtra.ts).
async function pushOnce(): Promise<boolean> {
  let ok = true;
  for (const p of syncParts(snapshot(), (k, s) => sent.get(k) === s)) {
    try { await api("/api/sync", { method: "PUT", body: p.body }); } catch { ok = false; continue; }
    for (const [k, s] of Object.entries(p.json)) sent.set(k, s);
  }
  return ok;
}
const push = (): Promise<void> => {
  if (running) { again = true; return running; }
  running = (async () => {
    try {
      let ok = true;
      do { again = false; ok = await pushOnce(); } while (ok && again);
      if (retry) { clearTimeout(retry); retry = null; }
      if (ok) retries = 0;
      else if (retries < 3 && AppState.currentState === "active") retry = setTimeout(() => { retry = null; void push(); }, [5000, 30000, 120000][retries++]);
    } finally { running = null; }
  })();
  return running;
};

export async function startSync(): Promise<boolean> {
  try {
    const remote = await api<Record<string, unknown>>("/api/sync");
    sent.clear(); retries = 0;
    const local = snapshot();
    // the garden: max growth per tree, union of decorations; the sticker collection: union of verses, max counts
    const merged: Record<string, unknown> = { ...merge(local, remote), ...extraMerge(local, remote), ...mergeFeed(local, remote), [GARDEN_KEY]: mergeGarden(local[GARDEN_KEY] as Garden | undefined, remote[GARDEN_KEY] as Garden | undefined), [CATALOG_KEY]: mergeCatalog(local[CATALOG_KEY] as Parameters<typeof mergeCatalog>[0], remote[CATALOG_KEY] as Parameters<typeof mergeCatalog>[0]), [JOURNEY_KEY]: mergeJourney(local[JOURNEY_KEY], remote[JOURNEY_KEY]) };
    for (const k of SYNC_KEYS) if (merged[k] !== undefined) writeJSON(k, merged[k], true);
    reloadFeedCaches(); reloadGarden(); reloadCatalog();
    await push();
    setWriteHook(() => { if (timer) clearTimeout(timer); timer = setTimeout(push, 1500); });
    return true;
  } catch {
    setWriteHook(null);
    return false;
  }
}

/** starts syncing when someone is signed in, again when the app returns to the foreground */
export function SyncBridge() {
  const { user } = useAuth();
  // anonymous offer counters go out once per day whether or not someone is signed in (no user id in the request)
  useEffect(() => { void sendOfferStats(async (body) => {
    // plain fetch without the session token, so the counters cannot be tied to an account
    const r = await fetch(`${SITE}/api/feed/events`, { method: "POST", headers: { "Content-Type": "application/json", "x-qmc-app": Platform.OS }, body: JSON.stringify(body) });
    if (!r.ok) throw new Error(String(r.status));
  }); }, []);
  useEffect(() => {
    if (!user) { setWriteHook(null); return; }
    void startSync();
    const sub = AppState.addEventListener("change", (s) => { if (s === "active") void startSync(); else if (s === "background") void push(); });
    return () => sub.remove();
  }, [user?.id]); // eslint-disable-line react-hooks/exhaustive-deps
  return null;
}
