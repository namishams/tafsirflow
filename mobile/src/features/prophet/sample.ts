import { useMemo } from "react";
import { RECITERS, audioUrl, type Reciter } from "@/lib/quran";
import { isFreeReciter, useReciterList } from "@/features/quran/reciter";
import type { ReciterBio } from "@/web/reciters";

// The voice of a reciter biography that can be heard in the app: the four built-in voices by their playerSlug, any
// other only when the server's reciter list has exactly that name. Free voices play a short sample (al-Fatiha 1:1–2),
// Pro voices open the Pro sheet.
const norm = (s: string) => s.toLowerCase().normalize("NFKD").replace(/[^a-z]/g, "");

export function usePlayableReciter(bio: ReciterBio | undefined): { reciter: Reciter; free: boolean } | null {
  const list = useReciterList();
  return useMemo(() => {
    if (!bio) return null;
    const r = (bio.playerSlug && [...list, ...RECITERS].find((x) => x.slug === bio.playerSlug)) || list.find((x) => norm(x.name) === norm(bio.name));
    return r ? { reciter: r, free: isFreeReciter(r) } : null;
  }, [bio, list]);
}

export const sampleUrls = (r: Reciter) => [audioUrl(r, 1, 1), audioUrl(r, 1, 2)];
