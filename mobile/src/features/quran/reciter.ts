import { useCallback } from "react";
import { usePro, FREE } from "@/lib/pro";
import { useStored, writeJSON } from "@/lib/store";
import { RECITERS, type Reciter } from "@/lib/quran";

// The chosen reciter (kept on this device). Without Pro only the free reciters can be chosen; a Pro reciter chosen
// earlier falls back to the first free one when Pro ends.
const KEY = "qmc.reciter";

export const isFreeReciter = (r: Reciter) => FREE.reciterIds.includes(r.id);

export function useReciter(): [Reciter, (r: Reciter) => void] {
  const { pro } = usePro();
  const slug = useStored<string | null>(KEY, null);
  const chosen = RECITERS.find((r) => r.slug === slug) ?? RECITERS[0];
  const reciter = pro || isFreeReciter(chosen) ? chosen : RECITERS.find(isFreeReciter) ?? RECITERS[0];
  const set = useCallback((r: Reciter) => writeJSON(KEY, r.slug, true), []);
  return [reciter, set];
}
