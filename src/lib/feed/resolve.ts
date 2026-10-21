// Resolves verse / hadith references of feed items for the website. Text always comes from the source
// (Quran.com via lib/quran, hadith-api and Thaqalayn as in the app's features/hadith/data.ts and
// content/sources/hadith.ts); nothing is typed by hand. Also used by the web feed's card resolver (lib/feedWeb/resolve.ts).
import { getChapter, getResources, getVerseByKey, pickTranslation } from "@/lib/quran";
import { SHIA_BOOKS } from "@/lib/learn/journey/hadithCatalog";
import { getJson, memo, stripHtml, withTimeout, DAY } from "@/lib/feedWeb/net";
import type { FeedItem } from "./types";

export type ResolvedVerse = { key: string; s: number; v: number; arabic: string; translation: string; chapter: string; chapterArabic: string };
export type ResolvedHadith = {
  arabic?: string; text: string; textLang: string; reference: string; url?: string;
  /** collection name ("Sahih al-Bukhari", "Al-Kāfi · 1"), the number in it, the chapter / category and the gradings the source gives */
  name?: string; number?: string; chapter?: string; grades?: { by: string; grade: string }[];
};
export type WebFeedItem = FeedItem & { verse?: ResolvedVerse; hadith?: ResolvedHadith };

const SUNNAH_CDN = "https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1";
const SUNNAH_RAW = "https://raw.githubusercontent.com/fawazahmed0/hadith-api/1";
const THAQALAYN_API = "https://www.thaqalayn-api.net/api/v2";
// the ten Sunni collections of hadith-api with the translation editions the API publishes (same table as the app's
// mobile/src/content/sources/hadith.ts BOOKS; Arabic is always "ara-<key>")
const SUNNI: Record<string, { name: string; editions: string[]; slug: string }> = {
  bukhari: { name: "Sahih al-Bukhari", editions: ["ben", "eng", "fra", "ind", "rus", "tur", "urd"], slug: "bukhari" },
  muslim: { name: "Sahih Muslim", editions: ["ben", "eng", "fra", "ind", "rus", "tur", "urd"], slug: "muslim" },
  abudawud: { name: "Sunan Abu Dawud", editions: ["ben", "eng", "fra", "ind", "rus", "tur", "urd"], slug: "abudawud" },
  tirmidhi: { name: "Jami at-Tirmidhi", editions: ["ben", "eng", "ind", "tur", "urd"], slug: "tirmidhi" },
  nasai: { name: "Sunan an-Nasa'i", editions: ["ben", "eng", "fra", "ind", "tur", "urd"], slug: "nasai" },
  ibnmajah: { name: "Sunan Ibn Majah", editions: ["ben", "eng", "fra", "ind", "tur", "urd"], slug: "ibnmajah" },
  malik: { name: "Muwatta Malik", editions: ["ben", "eng", "fra", "ind", "tur", "urd"], slug: "malik" },
  nawawi: { name: "The Forty Hadith of an-Nawawi", editions: ["ben", "eng", "fra", "tur"], slug: "nawawi40" },
  qudsi: { name: "40 Hadith Qudsi", editions: ["eng", "fra"], slug: "qudsi40" },
  dehlawi: { name: "40 Hadith Shah Waliullah Dehlawi", editions: ["eng", "fra"], slug: "shahwaliullah40" },
};
const PREFIX: Record<string, string> = { en: "eng", tr: "tur", ur: "urd", bn: "ben", ru: "rus", fr: "fra", id: "ind" };
const LANG: Record<string, string> = { eng: "en", tur: "tr", urd: "ur", ben: "bn", rus: "ru", fra: "fr", ind: "id" };

type SunnahDoc = { hadiths: { hadithnumber: number; text: string; grades?: { name: string; grade: string }[]; reference?: { book: number; hadith: number } }[] };
type TqHadith = {
  bookId: string; id: number; book: string; category?: string; chapter?: string; englishText?: string; arabicText?: string; frenchText?: string; URL?: string;
  gradingsFull?: { author?: { name_en?: string | null; name_ar?: string | null }; grade_en?: string | null; grade_ar?: string | null }[];
};

/** one edition file of one hadith (jsDelivr first, GitHub raw as the second source); null when the edition has no such number */
function sunnahDoc(edition: string, n: number): Promise<SunnahDoc | null> {
  return memo(`hadith:${edition}:${n}`, 7 * DAY, async () =>
    (await getJson<SunnahDoc>(`${SUNNAH_CDN}/editions/${edition}/${n}.min.json`).catch(() => null)) ?? (await getJson<SunnahDoc>(`${SUNNAH_RAW}/editions/${edition}/${n}.json`)),
  );
}

/** "Sahih al-Bukhari" / "Al-Kāfi · 2": the name of a Thaqalayn book (multi-volume books carry the volume) */
function shiaTitle(bookId: string, fallback: string): string {
  const b = SHIA_BOOKS.find((x) => x.id === bookId);
  return b ? `${b.name}${/Volume-\d/.test(b.id) ? ` · ${b.volume}` : ""}` : fallback;
}

/** "bukhari:1", "nawawi:13", "qudsi:5", "thaqalayn:<bookId>:<n>" → text from hadith-api / Thaqalayn, or null (never partial scripture) */
export async function resolveHadith(id: string, locale: string): Promise<ResolvedHadith | null> {
  const parts = id.split(":");
  if (parts[0] === "thaqalayn" && parts.length === 3) {
    const n = Number(parts[2]);
    if (!Number.isInteger(n) || n < 1) return null;
    const h = await memo(`tq:${parts[1]}:${n}`, 7 * DAY, () => getJson<TqHadith>(`${THAQALAYN_API}/${encodeURIComponent(parts[1])}/${n}`));
    if (!h) return null;
    const br = (s?: string | null) => (s ?? "").replace(/<br\s*\/?>/gi, "\n").trim();
    const fr = locale === "fr" ? br(h.frenchText) : "";
    const text = locale === "ar" ? "" : fr || br(h.englishText);
    const arabic = br(h.arabicText);
    if (!arabic || (locale !== "ar" && !text)) return null;
    const name = shiaTitle(h.bookId, h.book);
    const grades = (h.gradingsFull ?? [])
      .map((g) => ({ by: g.author?.name_en || g.author?.name_ar || "", grade: (g.grade_en || g.grade_ar || "").trim() }))
      .filter((g) => g.grade && g.by);
    return {
      arabic, text, textLang: fr ? "fr" : text ? "en" : "ar", name, number: String(h.id),
      chapter: [h.category, h.chapter].filter((x, i, a) => x && a.indexOf(x) === i).join(" · ") || undefined, grades,
      reference: `${name} · ${h.chapter ? `${h.chapter} · ` : ""}No. ${h.id}`, url: h.URL || "https://thaqalayn.net",
    };
  }
  const c = SUNNI[parts[0]], n = Number(parts[1]);
  if (!c || parts.length !== 2 || !Number.isInteger(n) || n < 1) return null;
  const p = PREFIX[locale];
  const trEd = locale === "ar" ? null : `${p && c.editions.includes(p) ? p : "eng"}-${parts[0]}`;
  const [ar, tr] = await Promise.all([sunnahDoc(`ara-${parts[0]}`, n), trEd ? sunnahDoc(trEd, n) : Promise.resolve(null)]);
  const a = ar?.hadiths[0], t = tr?.hadiths[0];
  const text = (t?.text ?? "").trim(), arabic = (a?.text ?? "").trim();
  if (!arabic || (locale !== "ar" && !text)) return null;
  const ref = (t ?? a)?.reference;
  const grades = (t?.grades ?? a?.grades ?? []).filter((g) => g.grade).map((g) => ({ by: g.name, grade: g.grade }));
  return {
    arabic, text, textLang: trEd ? LANG[trEd.split("-")[0]] ?? "en" : "ar", name: c.name, number: String(n), grades,
    reference: `${c.name} ${n}${ref && ref.book > 0 ? ` · Book ${ref.book}, Hadith ${ref.hadith}` : ""}`,
    url: `https://sunnah.com/${c.slug}:${n}`,
  };
}

/** the Quran.com translation of a language (cached per language) */
export function translationIdFor(locale: string): Promise<number> {
  return memo(`tr:${locale}`, DAY, () => withTimeout(getResources()).then((r) => pickTranslation(locale, r.translations)), 60_000).then((x) => x ?? 0);
}

export async function resolveVerse(key: string, locale: string, tr: number): Promise<ResolvedVerse | null> {
  try {
    const m = /^(\d{1,3}):(\d{1,3})$/.exec(key);
    if (!m) return null;
    const [v, ch] = await withTimeout(Promise.all([getVerseByKey(key, locale, tr), getChapter(Number(m[1]), locale)]));
    if (!v.text_uthmani) return null;
    return { key, s: Number(m[1]), v: Number(m[2]), arabic: v.text_uthmani, translation: stripHtml(v.translation), chapter: ch.name_simple, chapterArabic: ch.name_arabic };
  } catch { return null; }
}

/** adds resolved text; scripture items whose text cannot be loaded are dropped (never shown without the source text) */
export async function resolveFeed(items: FeedItem[], locale: string): Promise<WebFeedItem[]> {
  const tr = await translationIdFor(locale);
  const out = await Promise.all(items.map(async (i): Promise<WebFeedItem | null> => {
    if (i.verseKey) { const verse = tr ? await resolveVerse(i.verseKey, locale, tr) : null; return verse ? { ...i, verse } : null; }
    if (i.hadithId) { const hadith = await resolveHadith(i.hadithId, locale); return hadith ? { ...i, hadith } : null; }
    return i;
  }));
  return out.filter((x): x is WebFeedItem => !!x);
}
