import { useCallback, useEffect, useSyncExternalStore } from "react";
import { usePro, FREE, openPro } from "@/lib/pro";
import { readJSON, removeKey, useStored, writeJSON } from "@/lib/store";
import { RECITERS, getReciters, type Reciter } from "@/lib/quran";
import { registerReciters } from "./useVerseAudio";
import { setPlaybackPro } from "@/features/reader/versePlayback";

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

/**
 * The one place that decides which voice may play (every player goes through here): without Pro a Pro voice saved in
 * "tf:reciter" (chosen on the website, in the radio, on a reciter page or via ?reciter=) falls back to the first free
 * reciter (FREE.reciterIds). Used by the reader, Shams, the focus mode and – via setPlaybackPro – the background verse
 * session of the mini player, so a voice never outlives an expired Pro subscription.
 */
export function allowedReciter(chosen: Reciter | undefined, pro: boolean, all: Reciter[] = list): Reciter {
  const pool = all.length ? all : RECITERS;
  if (chosen && (pro || isFreeReciter(chosen))) return chosen;
  return pool.find(isFreeReciter) ?? RECITERS.find(isFreeReciter) ?? RECITERS[0];
}
/** the first free voice (for background sessions whose Pro ended) */
export const freeReciter = () => allowedReciter(undefined, false);

export function useReciter(): [Reciter, (r: Reciter) => void, Reciter[]] {
  const { pro } = usePro();
  const all = useReciterList();
  const folder = useStored<string>(KEY, "");
  const reciter = allowedReciter(all.find((r) => r.folder === folder) ?? all[0], pro, all);
  useEffect(() => { setPlaybackPro(pro); }, [pro]);
  // picking a locked voice anywhere opens the Pro sheet instead of switching
  const set = useCallback((r: Reciter) => { if (!pro && !isFreeReciter(r)) { openPro("reciters"); return; } writeJSON(KEY, r.folder, true); }, [pro]);
  return [reciter, set, all];
}
/** the allowed voice (alias, for players that do not pick a voice themselves) */
export const useAllowedReciter = () => useReciter()[0];

/** keeps the background verse session in step with Pro; mount once (root layout / now-playing bar) */
export function useReciterGuard() {
  const { pro } = usePro();
  useEffect(() => { setPlaybackPro(pro); }, [pro]);
}
