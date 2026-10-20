import { api } from "@/lib/api";
import { VERSES } from "@/web/arabicQuran";
import { same } from "@/web/recite";

// The app version of syncQuranText() in src/lib/arabicQuran.ts: the course text in @/web/arabicQuran is the fallback;
// before units 7 and 8 the app swaps in Quran.com's own text_uthmani from our /api/q store, word by word, so
// learners always read the exact mushaf text. Same rule as the website: a word is only replaced when the verse key
// and the word count match and the letters agree – the vowel signs may change, never the word itself.
// (The website module fetches the relative path /api/q, which only works in a browser; the logic is identical.)
let synced: Promise<void> | null = null;

export function syncQuranTextApp(timeoutMs = 8000): Promise<void> {
  synced ??= (async () => {
    await Promise.all([...new Set(VERSES.map((v) => v.s))].map(async (s) => {
      try {
        const d = await api<{ verses?: { verse_key: string; words?: { char_type_name: string; text_uthmani?: string }[] }[] }>(
          `/api/q/verses/by_chapter/${s}?words=true&word_fields=text_uthmani&per_page=300`);
        for (const v of VERSES.filter((x) => x.s === s)) {
          const remote = d.verses?.find((x) => x.verse_key === `${v.s}:${v.a}`);
          const ws = (remote?.words ?? []).filter((w) => w.char_type_name === "word");
          if (ws.length !== v.words.length) continue;
          ws.forEach((w, i) => { if (w.text_uthmani && same(v.words[i].ar, w.text_uthmani)) v.words[i].ar = w.text_uthmani; });
        }
      } catch { /* offline: keep the fallback */ }
    }));
  })();
  // never keep a learner waiting on a slow connection: after the timeout the lesson starts with the fallback text
  return Promise.race([synced, new Promise<void>((r) => setTimeout(r, timeoutMs))]);
}
