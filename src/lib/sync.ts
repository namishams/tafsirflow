import { readJSON, setWriteHook, writeJSON } from "./storage";
import type { Srs } from "./learning";

type Last = { chapter: number; verse: number; at?: number };
type Days = Record<string, number>;

export type Me = { id: number; email: string; name: string | null; role: "user" | "admin"; plan: string; emailVerified: boolean };

export async function fetchMe(): Promise<{ user: Me | null; available: boolean; secure: boolean; mailEnabled?: boolean }> {
  try {
    const r = await fetch("/api/auth/me", { cache: "no-store" });
    return await r.json();
  } catch {
    return { user: null, available: false, secure: true };
  }
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
  return { "tf:bookmarks": bm, "tf:srs": srs, "tf:days": days, "tf:notes": notes, "tf:academy": newer("tf:academy") ?? undefined, "tf:khatm": newer("tf:khatm") ?? undefined, ...(last ? { "tf:last": last } : {}) } as Record<string, unknown>;
}

const KEYS = ["tf:last", "tf:bookmarks", "tf:srs", "tf:days", "tf:notes", "tf:academy", "tf:khatm"] as const;
type Notes = Record<string, { text: string; at: number }>;
const snapshot = (): Record<string, unknown> => ({
  "tf:last": readJSON<Last | null>("tf:last", null) ?? undefined,
  "tf:bookmarks": readJSON<string[]>("tf:bookmarks", []),
  "tf:srs": readJSON<Srs>("tf:srs", {}),
  "tf:days": readJSON<Days>("tf:days", {}),
  "tf:notes": readJSON<Notes>("tf:notes", {}),
  "tf:academy": readJSON<unknown>("tf:academy", null) ?? undefined,
  "tf:khatm": readJSON<unknown>("tf:khatm", null) ?? undefined,
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
