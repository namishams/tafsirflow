// Resolves verse / hadith references of feed items for the website. Text always comes from the source
// (Quran.com via lib/quran, hadith-api and Thaqalayn as in the app's features/hadith/data.ts); nothing is typed by hand.
import { getChapter, getResources, getVerseByKey, pickTranslation } from "@/lib/quran";
import type { FeedItem } from "./types";

export type ResolvedVerse = { key: string; arabic: string; translation: string; chapter: string; chapterArabic: string };
export type ResolvedHadith = { arabic?: string; text: string; textLang: string; reference: string; url?: string };
export type WebFeedItem = FeedItem & { verse?: ResolvedVerse; hadith?: ResolvedHadith };

const SUNNAH_CDN = "https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1";
const THAQALAYN_API = "https://www.thaqalayn-api.net/api/v2";
const SUNNI: Record<string, { name: string; editions: string[] }> = {
  bukhari: { name: "Sahih al-Bukhari", editions: ["ben", "eng", "fra", "ind", "rus", "tur", "urd"] },
  muslim: { name: "Sahih Muslim", editions: ["ben", "eng", "fra", "ind", "rus", "tur", "urd"] },
  nawawi: { name: "The Forty Hadith of an-Nawawi", editions: ["ben", "eng", "fra", "tur"] },
};
const PREFIX: Record<string, string> = { en: "eng", tr: "tur", ur: "urd", bn: "ben", ru: "rus", fr: "fra", id: "ind" };
const LANG: Record<string, string> = { eng: "en", tur: "tr", urd: "ur", ben: "bn", rus: "ru", fra: "fr", ind: "id" };

async function getJson<T>(url: string): Promise<T | null> {
  try {
    const r = await fetch(url, { next: { revalidate: 86_400 }, signal: AbortSignal.timeout(6000) });
    return r.ok ? ((await r.json()) as T) : null;
  } catch { return null; }
}

type SunnahDoc = { hadiths: { hadithnumber: number; text: string; reference?: { book: number; hadith: number } }[] };
type TqHadith = { bookId: string; id: number; book: string; chapter?: string; englishText?: string; arabicText?: string; frenchText?: string; URL?: string };

async function resolveHadith(id: string, locale: string): Promise<ResolvedHadith | null> {
  const parts = id.split(":");
  if (parts[0] === "thaqalayn" && parts.length === 3) {
    const h = await getJson<TqHadith>(`${THAQALAYN_API}/${encodeURIComponent(parts[1])}/${Number(parts[2])}`);
    if (!h) return null;
    const br = (s?: string) => (s ?? "").replace(/<br\s*\/?>/gi, "\n").trim();
    const fr = locale === "fr" ? br(h.frenchText) : "";
    const text = locale === "ar" ? "" : fr || br(h.englishText);
    const arabic = br(h.arabicText);
    if (!arabic || (locale !== "ar" && !text)) return null;
    return { arabic, text, textLang: fr ? "fr" : text ? "en" : "ar", reference: `${h.book}${h.chapter ? ` · ${h.chapter}` : ""} · No. ${h.id}`, url: h.URL || "https://thaqalayn.net" };
  }
  const c = SUNNI[parts[0]], n = Number(parts[1]);
  if (!c || !Number.isInteger(n)) return null;
  const p = PREFIX[locale];
  const trEd = locale === "ar" ? null : `${p && c.editions.includes(p) ? p : "eng"}-${parts[0]}`;
  const [ar, tr] = await Promise.all([
    getJson<SunnahDoc>(`${SUNNAH_CDN}/editions/ara-${parts[0]}/${n}.min.json`),
    trEd ? getJson<SunnahDoc>(`${SUNNAH_CDN}/editions/${trEd}/${n}.min.json`) : Promise.resolve(null),
  ]);
  const a = ar?.hadiths[0], t = tr?.hadiths[0];
  const text = (t?.text ?? "").trim(), arabic = (a?.text ?? "").trim();
  if (!arabic || (locale !== "ar" && !text)) return null;
  const ref = (t ?? a)?.reference;
  return {
    arabic, text, textLang: trEd ? LANG[trEd.split("-")[0]] ?? "en" : "ar",
    reference: `${c.name} ${n}${ref && ref.book > 0 ? ` · Book ${ref.book}, Hadith ${ref.hadith}` : ""}`,
    url: `https://sunnah.com/${parts[0] === "nawawi" ? "nawawi40" : parts[0]}:${n}`,
  };
}

async function resolveVerse(key: string, locale: string, tr: number): Promise<ResolvedVerse | null> {
  try {
    const [v, ch] = await Promise.all([getVerseByKey(key, locale, tr), getChapter(Number(key.split(":")[0]), locale)]);
    return { key, arabic: v.text_uthmani, translation: v.translation.replace(/<[^>]+>/g, ""), chapter: ch.name_simple, chapterArabic: ch.name_arabic };
  } catch { return null; }
}

/** adds resolved text; scripture items whose text cannot be loaded are dropped (never shown without the source text) */
export async function resolveFeed(items: FeedItem[], locale: string): Promise<WebFeedItem[]> {
  const tr = await getResources().then((r) => pickTranslation(locale, r.translations)).catch(() => 0);
  const out = await Promise.all(items.map(async (i): Promise<WebFeedItem | null> => {
    if (i.verseKey) { const verse = tr ? await resolveVerse(i.verseKey, locale, tr) : null; return verse ? { ...i, verse } : null; }
    if (i.hadithId) { const hadith = await resolveHadith(i.hadithId, locale); return hadith ? { ...i, hadith } : null; }
    return i;
  }));
  return out.filter((x): x is WebFeedItem => !!x);
}
