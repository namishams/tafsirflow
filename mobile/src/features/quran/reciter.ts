import { useCallback, useEffect, useSyncExternalStore } from "react";
import { usePro, FREE } from "@/lib/pro";
import { readJSON, removeKey, useStored, writeJSON } from "@/lib/store";
import { RECITERS, getReciters, type Reciter } from "@/lib/quran";
import { registerReciters } from "./useVerseAudio";

// The chosen reciter, shared with the radio and the website: "tf:reciter" holds the reciter's folder (like the
// website's Player.tsx and RadioProvider.tsx). The full list comes from /api/reciters (22 voices); without Pro only the
// free reciters can be chosen, and a Pro reciter chosen earlier falls back to the first free one when Pro ends.
const KEY = "tf:reciter";
const OLD_KEY = "qmc.reciter"; // the app's earlier key (slug), moved over once
const LIST_KEY = "qmc.reciters"; // last list from the server, so the reader opens with the right voice offline

export const isFreeReciter = (r: Reciter) => r.id > 0 && FREE.reciterIds.includes(r.id);

let list: Reciter[] = RECITERS;
let loading = false;
const subs = new Set<() => void>();
function setList(l: Reciter[]) {
  if (!l.length) return;
  list = l;
  registerReciters(l);
  subs.forEach((f) => f());
}
function ensureList() {
  if (loading) return;
  loading = true;
  const cached = readJSON<Reciter[] | null>(LIST_KEY, null);
  if (cached?.length) setList(cached);
  getReciters().then((l) => { if (l !== RECITERS) { setList(l); writeJSON(LIST_KEY, l, true); } }).catch(() => { loading = false; });
  // earlier app versions kept the slug under qmc.reciter
  const old = readJSON<string | null>(OLD_KEY, null);
  if (old) {
    if (!readJSON<string>(KEY, "")) { const r = [...list, ...RECITERS].find((x) => x.slug === old); if (r) writeJSON(KEY, r.folder, true); }
    removeKey(OLD_KEY);
  }
}

/** every reciter (the website's /api/reciters; the four built-in ones until it answered) */
export function useReciterList(): Reciter[] {
  useEffect(ensureList, []);
  return useSyncExternalStore((f) => { subs.add(f); return () => { subs.delete(f); }; }, () => list);
}

export function useReciter(): [Reciter, (r: Reciter) => void, Reciter[]] {
  const { pro } = usePro();
  const all = useReciterList();
  const folder = useStored<string>(KEY, "");
  const chosen = all.find((r) => r.folder === folder) ?? all[0];
  const reciter = pro || isFreeReciter(chosen) ? chosen : all.find(isFreeReciter) ?? all[0];
  const set = useCallback((r: Reciter) => writeJSON(KEY, r.folder, true), []);
  return [reciter, set, all];
}
