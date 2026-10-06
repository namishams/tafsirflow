import { readJSON, setWriteHook, writeJSON } from "./storage";
import type { Srs } from "./learning";

type Last = { chapter: number; verse: number; at?: number };
type Days = Record<string, number>;

export type Me = { id: number; email: string; name: string | null; role: "user" | "admin"; plan: string; emailVerified: boolean; birthYear?: number | null };

export async function fetchMe(): Promise<{ user: Me | null; available: boolean; secure: boolean; mailEnabled?: boolean }> {
  try {
    const r = await fetch("/api/auth/me", { cache: "no-store" });
    return await r.json();
  } catch {
    return { user: null, available: false, secure: true };
  }
}

const bestScores = (a: unknown, b: unknown) => {
  const out: Record<string, number> = { ...((b as Record<string, number>) ?? {}) };
  for (const [k, v] of Object.entries((a as Record<string, number>) ?? {})) out[k] = Math.max(out[k] ?? 0, v);
  return out;
};
// Arabic course progress: per lesson the best score and stars, xp and mistake counters never go down when two devices meet
type ArabicP = { done?: Record<string, { best: number; stars: number; at?: number }>; xp?: number; mistakes?: Record<string, number> };
function mergeArabic(a: ArabicP | undefined, b: ArabicP | undefined) {
  if (!a || !b) return a ?? b;
  const done = { ...(b.done ?? {}) };
  for (const [k, v] of Object.entries(a.done ?? {})) { const o = done[k]; done[k] = o ? { best: Math.max(o.best, v.best), stars: Math.max(o.stars, v.stars), at: Math.max(o.at ?? 0, v.at ?? 0) } : v; }
  const mistakes = { ...(b.mistakes ?? {}) };
  for (const [k, v] of Object.entries(a.mistakes ?? {})) mistakes[k] = Math.max(mistakes[k] ?? 0, v);
  return { ...b, ...a, done, xp: Math.max(a.xp ?? 0, b.xp ?? 0), mistakes };
}

// Merge rules: bookmarks = union, srs/last = newest entry wins, days = highest count per day
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
  // academy progress and khatm plan: the newer copy wins
  const newer = (k: string) => { const x = local[k] as { at?: number } | null | undefined, y = remote[k] as { at?: number } | null | undefined; return (x?.at ?? 0) >= (y?.at ?? 0) ? x : y; };
  return { "tf:bookmarks": bm, "tf:srs": srs, "tf:days": days, "tf:notes": notes, "tf:academy": newer("tf:academy") ?? undefined, "tf:khatm": newer("tf:khatm") ?? undefined, "tf:plan": newer("tf:plan") ?? undefined, "tf:goal": newer("tf:goal") ?? undefined, "tf:mnemo": { ...((remote["tf:mnemo"] as object) ?? {}), ...((local["tf:mnemo"] as object) ?? {}) }, "tf:vocab": { ...((remote["tf:vocab"] as object) ?? {}), ...((local["tf:vocab"] as object) ?? {}) }, "tf:tajweed": bestScores(local["tf:tajweed"], remote["tf:tajweed"]), "tf:arabic": mergeArabic(local["tf:arabic"] as ArabicP | undefined, remote["tf:arabic"] as ArabicP | undefined), "tf:duafav": Array.from(new Set([...((local["tf:duafav"] as string[]) ?? []), ...((remote["tf:duafav"] as string[]) ?? [])])), ...(last ? { "tf:last": last } : {}) } as Record<string, unknown>;
}

const KEYS = ["tf:last", "tf:bookmarks", "tf:srs", "tf:days", "tf:notes", "tf:academy", "tf:khatm", "tf:plan", "tf:mnemo", "tf:vocab", "tf:tajweed", "tf:duafav", "tf:arabic", "tf:goal"] as const;
type Notes = Record<string, { text: string; at: number }>;
const snapshot = (): Record<string, unknown> => ({
  "tf:last": readJSON<Last | null>("tf:last", null) ?? undefined,
  "tf:bookmarks": readJSON<string[]>("tf:bookmarks", []),
  "tf:srs": readJSON<Srs>("tf:srs", {}),
  "tf:days": readJSON<Days>("tf:days", {}),
  "tf:notes": readJSON<Notes>("tf:notes", {}),
  "tf:academy": readJSON<unknown>("tf:academy", null) ?? undefined,
  "tf:khatm": readJSON<unknown>("tf:khatm", null) ?? undefined,
  "tf:plan": readJSON<unknown>("tf:plan", null) ?? undefined,
  "tf:mnemo": readJSON<Record<string, string>>("tf:mnemo", {}),
  "tf:vocab": readJSON<Record<string, unknown>>("tf:vocab", {}),
  "tf:tajweed": readJSON<Record<string, number>>("tf:tajweed", {}),
  "tf:arabic": readJSON<unknown>("tf:arabic", null) ?? undefined,
  "tf:goal": readJSON<unknown>("tf:goal", null) ?? undefined,
  "tf:duafav": readJSON<string[]>("tf:duafav", []),
});

let timer: ReturnType<typeof setTimeout> | null = null;

async function push() {
  await fetch("/api/sync", { method: "PUT", headers: { "content-type": "application/json" }, body: JSON.stringify(snapshot()) }).catch(() => undefined);
}

// Call after sign-in or page load: merges the account's data into this browser and starts auto-upload
export async function startSync(): Promise<boolean> {
  try {
    const r = await fetch("/api/sync", { cache: "no-store" });
    if (!r.ok) { setWriteHook(null); return false; }
    const merged = merge(snapshot(), (await r.json()) as Record<string, unknown>);
    for (const k of KEYS) if (merged[k] !== undefined) writeJSON(k, merged[k], true);
    await push();
    setWriteHook(() => {
      if (timer) clearTimeout(timer);
      timer = setTimeout(push, 1500);
    });
    return true;
  } catch {
    return false;
  }
}

export const stopSync = () => setWriteHook(null);
