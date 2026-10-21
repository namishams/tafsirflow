import { useEffect } from "react";
import { api } from "@/lib/api";
import { useStored, writeJSON } from "@/lib/store";
import BUNDLED from "./data/ui-verses.json";

// Quran text the screens show as decoration: the basmala at the opening of a surah (1:1) and the verses around the
// medallion of the Quran tab (54:17 and 56:77–80). Never typed by hand (BLUEPRINT §4): it comes from the same data as
// the reader (/api/q, Quran.com text_uthmani), kept on the device in "qmc.uiVerses"; the bundled file
// data/ui-verses.json is a snapshot of that API answer for the first start without a connection.
export const UI_VERSE_KEYS = ["1:1", "54:17", "56:77", "56:78", "56:79", "56:80"] as const;
export type UiVerses = Record<(typeof UI_VERSE_KEYS)[number], string>;
const KEY = "qmc.uiVerses";
export const BUNDLED_UI_VERSES = BUNDLED as UiVerses;

/** the verses around the medallion, each closed by the rub al-hizb sign like on the website */
export const ringOf = (v: UiVerses) => ["54:17", "56:77", "56:78", "56:79", "56:80"].map((k) => `${v[k as keyof UiVerses]} ۞`).join(" ");

let asked = false;
function refresh() {
  if (asked) return;
  asked = true;
  Promise.all(UI_VERSE_KEYS.map((k) => api<{ verse?: { verse_key?: string; text_uthmani?: string } }>(`/api/q/verses/by_key/${k}?words=false&fields=text_uthmani`)))
    .then((list) => {
      const next = {} as UiVerses;
      for (const [i, k] of UI_VERSE_KEYS.entries()) {
        const v = list[i]?.verse;
        if (v?.verse_key !== k || !v.text_uthmani) return; // incomplete answer: keep what is there
        next[k] = v.text_uthmani;
      }
      writeJSON(KEY, next, true);
    })
    .catch(() => { asked = false; });
}

/** the decorative verses from data (stored copy, else the bundled snapshot); refreshed once per app start */
export function useUiVerses(): UiVerses {
  const stored = useStored<Partial<UiVerses> | null>(KEY, null);
  useEffect(refresh, []);
  return { ...BUNDLED_UI_VERSES, ...(stored ?? {}) };
}
