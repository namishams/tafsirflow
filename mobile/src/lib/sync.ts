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

// Progress sync with the account, the same merge rules as the website (src/lib/sync.ts): what you learn in the app
// shows up on quranmasterclass.com and the other way round.
type Last = { chapter: number; verse: number; at?: number };
type Days = Record<string, number>;
type Notes = Record<string, { text: string; at: number }>;

const bestScores = (a: unknown, b: unknown) => {
  const out: Record<string, number> = { ...((b as Record<string, number>) ?? {}) };
  for (const [k, v] of Object.entries((a as Record<string, number>) ?? {})) out[k] = Math.max(out[k] ?? 0, v);
  return out;
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

export const SYNC_KEYS = ["tf:last", "tf:bookmarks", "tf:srs", "tf:days", "tf:notes", "tf:academy", "tf:khatm", "tf:plan", "tf:mnemo", "tf:vocab", "tf:tajweed", "tf:duafav", "tf:arabic", "tf:goal", "tf:wudu", "tf:points", "tf:listen", "tf:jv"] as const;
const snapshot = (): Record<string, unknown> => {
  const out: Record<string, unknown> = {};
  for (const k of SYNC_KEYS) { const v = readJSON<unknown>(k, undefined); if (v !== undefined && v !== null) out[k] = v; }
  for (const k of ["tf:bookmarks", "tf:duafav"]) out[k] ??= [];
  for (const k of ["tf:srs", "tf:days", "tf:notes", "tf:mnemo", "tf:vocab", "tf:tajweed", "tf:jv"]) out[k] ??= {};
  return out;
};

let timer: ReturnType<typeof setTimeout> | null = null;
const push = () => api("/api/sync", { method: "PUT", body: snapshot() }).catch(() => undefined);

export async function startSync(): Promise<boolean> {
  try {
    const remote = await api<Record<string, unknown>>("/api/sync");
    const merged = merge(snapshot(), remote);
    for (const k of SYNC_KEYS) if (merged[k] !== undefined) writeJSON(k, merged[k], true);
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
  useEffect(() => {
    if (!user) { setWriteHook(null); return; }
    void startSync();
    const sub = AppState.addEventListener("change", (s) => { if (s === "active") void startSync(); else if (s === "background") void push(); });
    return () => sub.remove();
  }, [user?.id]); // eslint-disable-line react-hooks/exhaustive-deps
  return null;
}
