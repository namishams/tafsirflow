// mirrors mobile/src/features/quran/reciter.ts – the chosen reciter, shared with the website's Quran player:
// "tf:reciter" holds the reciter's folder. On the website every reciter is free.
import { useCallback, useEffect, useSyncExternalStore } from "react";
import { readJSON, useStored, writeJSON } from "./store";
import { RECITERS, getReciters, type Reciter } from "./quran";

const KEY = "tf:reciter";
let list: Reciter[] = RECITERS;
let loading = false;
const subs = new Set<() => void>();
function ensureList() {
  if (loading) return;
  loading = true;
  getReciters().then((l) => { if (l.length) { list = l; subs.forEach((f) => f()); } }).catch(() => { loading = false; });
}
const subscribe = (f: () => void) => { subs.add(f); return () => { subs.delete(f); }; };

export const isFreeReciter = (_r: Reciter) => true;
export function useReciterList(): Reciter[] {
  useEffect(ensureList, []);
  return useSyncExternalStore(subscribe, () => list, () => RECITERS);
}
export function allowedReciter(chosen: Reciter | undefined, _pro = true, all: Reciter[] = list): Reciter {
  return chosen ?? all[0] ?? RECITERS[0];
}
export const freeReciter = () => {
  const folder = readJSON<string>(KEY, "");
  return list.find((r) => r.folder === folder) ?? RECITERS[0];
};
export function useReciter(): [Reciter, (r: Reciter) => void, Reciter[]] {
  const all = useReciterList();
  const folder = useStored<string>(KEY, "");
  const r = all.find((x) => x.folder === folder) ?? RECITERS.find((x) => x.folder === folder) ?? all[0] ?? RECITERS[0];
  const set = useCallback((x: Reciter) => writeJSON(KEY, x.folder, true), []);
  return [r, set, all];
}
export const useAllowedReciter = () => useReciter()[0];
export const useReciterGuard = () => ({ guard: (r: Reciter) => r });
