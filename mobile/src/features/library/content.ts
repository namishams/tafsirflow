import { ISLAM, islamUi, type IslamChapter, type IslamDoc, type IslamUi } from "@/web/islam";
import { guideText, type Guide, type GuideText } from "@/web/guides";
import { secretsContent, type SecretsContent } from "@/web/secrets/content";
import { aboutContent, type AboutContent } from "@/web/aboutContent";
import { useLang } from "@/i18n";
import { useAsyncValue } from "./motion";

// The website's own content modules (mirrored in src/web): German and English live in the chapter files themselves
// (d.de / d.en, guide.title_de …), exactly as loadChapter() and guideText() return them on the website.
export const chapterOf = (d: IslamDoc, lang: string): IslamChapter => (lang === "de" ? d.de : d.en);
export const chaptersOf = (lang: string) => ISLAM.map((d) => chapterOf(d, lang));
export const guideOf = (g: Guide, lang: string): GuideText => guideText(g, lang);

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
