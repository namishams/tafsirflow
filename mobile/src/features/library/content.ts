import { ISLAM, islamUi, loadChapters, type IslamChapter, type IslamUi } from "@/web/islam";
import { guideText, type Guide, type GuideText } from "@/web/guides";
import { secretsContent, type SecretsContent } from "@/web/secrets/content";
import { aboutContent, type AboutContent } from "@/web/aboutContent";
import { loadBioTexts, type BioTexts } from "@/web/reciters";
import { chapterHadithRefs, fillChapterHadith, hadithQuoteKey, loadHadithTexts } from "@/web/islam/hadithQuote";
import { sunniHadith } from "@/features/hadith/data";
import { useLang } from "@/i18n";
import { useAsyncValue } from "./motion";
import { useEffect, useMemo, useState } from "react";

// The website's own content modules (mirrored in src/web): German and English live in the chapter files themselves
// (d.de / d.en, guide.title_de …), exactly as loadChapter() and guideText() return them on the website.
// German and English live in the chapter files themselves; every other language is the website's translation in
// web/islam/i18n, read with its own loadChapters() the first time the language is opened.
const chapters = new Map<string, IslamChapter[]>([["de", ISLAM.map((d) => d.de)], ["en", ISLAM.map((d) => d.en)]]);
/** every chapter of the Islam library in the reader's language (English until a translation has been read) */
export function useChapters(): IslamChapter[] {
  const { lang } = useLang();
  const hit = chapters.get(lang);
  const loaded = useAsyncValue(() => (hit ? Promise.resolve(hit) : loadChapters(lang).then((cs) => { chapters.set(lang, cs); return cs; })), [lang]);
  return useHadithQuotes(hit ?? loaded ?? chapters.get("en")!);
}

// Hadith quotes in a chapter ({{hadith …}}, web/islam/hadithQuote.ts, as on the website) are filled in from the
// published edition, loaded like every hadith of the app (features/hadith/data.ts, kept on the device). The chapter
// shows at once; "…" stands in for the words until they are there (or while offline).
const hadithTexts: Record<string, string> = {};
function useHadithQuotes(cs: IslamChapter[]): IslamChapter[] {
  const [got, setGot] = useState(0);
  const missing = useMemo(() => cs.flatMap(chapterHadithRefs).filter((r) => !(hadithQuoteKey(r) in hadithTexts)), [cs, got]);
  useEffect(() => {
    if (!missing.length) return;
    let alive = true;
    loadHadithTexts(missing, sunniHadith).then((texts) => {
      let any = false;
      for (const [k, t] of Object.entries(texts)) if (t) { hadithTexts[k] = t; any = true; }
      if (alive && any) setGot((n) => n + 1);
    }).catch(() => undefined);
    return () => { alive = false; };
    // the same narrations are asked for again only when the chapters change (a failed one on the next visit)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cs]);
  return useMemo(() => cs.map((c) => fillChapterHadith(c, hadithTexts)), [cs, got]);
}
export const guideOf = (g: Guide, lang: string): GuideText => guideText(g, lang);

// The reciter biographies beyond German, English and Arabic (web/reciters/i18n, the website's loadBioTexts), read the
// first time the language is opened; pass the result to bioText. null = English (no translation, or not read yet).
const bios = new Map<string, BioTexts | null>();
export function useBioTexts(): BioTexts | null {
  const { lang } = useLang();
  const known = bios.has(lang);
  const loaded = useAsyncValue(() => (known ? Promise.resolve({ lang, b: bios.get(lang) ?? null }) : loadBioTexts(lang).then((b) => { bios.set(lang, b); return { lang, b }; })), [lang]);
  return known ? bios.get(lang) ?? null : loaded?.lang === lang ? loaded.b : null;
}

// The website's loaders for the hub texts, "Secrets" and "About" are async (other languages are imported on demand);
// German and English answer at once. They are resolved when the app starts, so a page opens without an empty frame.
const cache = new Map<string, unknown>();
const loaders = {
  islam: (l: string) => islamUi(l),
  secrets: (l: string) => secretsContent(l),
  about: (l: string) => aboutContent(l),
};
for (const l of ["de", "en"]) for (const [k, load] of Object.entries(loaders)) load(l).then((v) => cache.set(`${k}:${l}`, v)).catch(() => undefined);

function useLoaded<T>(kind: keyof typeof loaders): T | null {
  const { lang } = useLang();
  const key = `${kind}:${lang}`;
  const hit = cache.get(key) as T | undefined;
  const loaded = useAsyncValue(() => (hit ? Promise.resolve(hit) : (loaders[kind](lang) as Promise<T>)), [key]);
  return hit ?? loaded;
}
export const useIslamUi = () => useLoaded<IslamUi>("islam");
export const useSecrets = () => useLoaded<SecretsContent>("secrets");
export const useAbout = () => useLoaded<AboutContent>("about");

/** "6. Oktober 2026" / "6 October 2026" like the website (Gregorian calendar, Latin digits) */
export function longDate(iso: string, lang: string) {
  try {
    return new Date(iso).toLocaleDateString(lang, { calendar: "gregory", numberingSystem: "latn", day: "numeric", month: "long", year: "numeric" } as Intl.DateTimeFormatOptions);
  } catch {
    return iso;
  }
}
