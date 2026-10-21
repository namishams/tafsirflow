// mirrors sunniHadith / shiaHadith of mobile/src/features/hadith/data.ts, minimal for the daily hadith plan of the
// long path: one hadith by number, only from published sources (nothing is typed here).
// - Sunni collections: fawazahmed0/hadith-api (The Unlicense), Arabic plus the reader's language where the API has it.
// - Shia collections: the Thaqalayn API (thaqalayn.net), with the translator named per book.
// The app keeps fetched hadith in its documents folder; the website keeps them in memory for the visit (and the
// browser's HTTP cache).
import { SHIA_BOOKS, SUNNI_COLLECTIONS, type ShiaBook, type SunniCollection } from "./hadithCatalog";
import { hadithLabel, hadithLink, usualHadithNumber } from "@/lib/hadithNumber";

export const SUNNAH_CDN = "https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1";
export const THAQALAYN_API = "https://www.thaqalayn-api.net/api/v2";

export type HadithGrade = { by: string; grade: string };
export type HadithItem = {
  id: string; source: "sunnah" | "thaqalayn"; collection: string; collectionName: string; chapter?: string; number: string;
  arabic?: string; text: string; textLang: string; translator?: string; grades: HadithGrade[]; reference: string; url?: string; credit: string;
};

const mem = new Map<string, Promise<unknown>>();
function cachedJSON<T>(url: string): Promise<T> {
  if (!mem.has(url)) {
    const p = (async () => {
      const ctl = new AbortController();
      const t = setTimeout(() => ctl.abort(), 15000);
      try {
        const r = await fetch(url, { signal: ctl.signal, headers: { Accept: "application/json" } });
        if (!r.ok) throw new Error(`${r.status}`);
        return (await r.json()) as T;
      } finally { clearTimeout(t); }
    })();
    p.catch(() => mem.delete(url));
    mem.set(url, p);
  }
  return mem.get(url) as Promise<T>;
}

// ---------- Sunni ----------
const SUNNI_NAMES: Record<string, string> = { bukhari: "Sahih al-Bukhari", muslim: "Sahih Muslim", nawawi: "The Forty Hadith of an-Nawawi" };
const PREFIX: Record<string, string> = { en: "eng", tr: "tur", ur: "urd", bn: "ben", ru: "rus", fr: "fra", id: "ind" };
const sunniCollection = (key: string): SunniCollection | undefined => SUNNI_COLLECTIONS.find((c) => c.key === key);
function translationEdition(c: SunniCollection, lang: string): string | null {
  if (lang === "ar") return null;
  const p = PREFIX[lang];
  return p && c.editions.includes(`${p}-${c.key}`) ? `${p}-${c.key}` : `eng-${c.key}`;
}
const editionLang = (ed: string | null) => (!ed ? "ar" : ({ eng: "en", tur: "tr", urd: "ur", ben: "bn", rus: "ru", fra: "fr", ind: "id" } as Record<string, string>)[ed.split("-")[0]] ?? "en");
type SunnahHadith = { hadithnumber: number; arabicnumber?: number | string | null; text: string; grades?: { name: string; grade: string }[]; reference?: { book: number; hadith: number } };
type SunnahDoc = { metadata: { name: string; section?: Record<string, string> }; hadiths: SunnahHadith[] };

export async function sunniHadith(key: string, n: number, lang: string): Promise<HadithItem | null> {
  const c = sunniCollection(key);
  if (!c) return null;
  const trEd = translationEdition(c, lang);
  const url = (ed: string) => `${SUNNAH_CDN}/editions/${ed}/${n}.min.json`;
  const [ar, tr] = await Promise.all([
    cachedJSON<SunnahDoc>(url(`ara-${key}`)).catch(() => null),
    trEd ? cachedJSON<SunnahDoc>(url(trEd)).catch(() => null) : Promise.resolve(null),
  ]);
  if (!ar && !tr) throw new Error("offline");
  const a = ar?.hadiths[0], t = tr?.hadiths[0];
  const h = t ?? a;
  if (!h) return null;
  const text = (t?.text ?? "").trim(), arabic = (a?.text ?? "").trim();
  if (!arabic && !text) return null;
  if (lang !== "ar" && !text) return null; // a translation without text is not shown on its own
  const name = SUNNI_NAMES[c.key] ?? c.name;
  const ref = h.reference && h.reference.book > 0 ? ` · Book ${h.reference.book}, Hadith ${h.reference.hadith}` : "";
  // label and link by the usual number (Sahih Muslim 804, not the API's 1874; lib/hadithNumber.ts, as in the app);
  // id and number stay the API's, by which the text is fetched
  const num = usualHadithNumber(c.key, h.hadithnumber, a?.arabicnumber ?? t?.arabicnumber);
  const label = hadithLabel(name, num);
  return {
    id: `sunnah:${c.key}:${h.hadithnumber}`, source: "sunnah", collection: c.key, collectionName: name,
    chapter: Object.values((tr ?? ar)?.metadata.section ?? {})[0], number: String(h.hadithnumber), arabic: arabic || undefined, text,
    textLang: editionLang(tr ? trEd : null), grades: (t?.grades ?? a?.grades ?? []).filter((g) => g.grade).map((g) => ({ by: g.name, grade: g.grade })),
    reference: `${label}${ref}`, url: hadithLink(c.key, h.hadithnumber, num, trEd ?? `ara-${c.key}`), credit: label,
  };
}

// ---------- Shia (Thaqalayn) ----------
type TqHadith = {
  bookId: string; id: number; book: string; volume: number; category: string; chapter: string; author: string; translator: string;
  englishText: string; arabicText: string; frenchText?: string; URL?: string;
  gradingsFull?: { author?: { name_en?: string | null; name_ar?: string | null }; grade_en?: string | null; grade_ar?: string | null }[];
};
const shiaBook = (id: string): ShiaBook | undefined => SHIA_BOOKS.find((b) => b.id === id);
const multiVolume = (b: ShiaBook) => /Volume-\d/.test(b.id);
const shiaBookTitle = (b: ShiaBook) => `${b.name}${multiVolume(b) ? ` · ${b.volume}` : ""}`;

export async function shiaHadith(bookId: string, id: number, lang: string): Promise<HadithItem | null> {
  const h = await cachedJSON<TqHadith>(`${THAQALAYN_API}/${encodeURIComponent(bookId)}/${id}`);
  const br = (s: string | undefined | null) => (s ?? "").replace(/<br\s*\/?>/gi, "\n").trim();
  const fr = lang === "fr" ? br(h.frenchText) : "";
  const text = lang === "ar" ? "" : fr || br(h.englishText);
  const arabic = br(h.arabicText);
  if (!arabic && !text) return null;
  if (lang !== "ar" && !text) return null;
  const b = shiaBook(h.bookId);
  const title = b ? shiaBookTitle(b) : h.book;
  const grades = (h.gradingsFull ?? [])
    .map((g) => ({ by: g.author?.name_en || g.author?.name_ar || "", grade: (g.grade_en || g.grade_ar || "").trim() }))
    .filter((g) => g.grade && g.by);
  return {
    id: `thaqalayn:${h.bookId}:${h.id}`, source: "thaqalayn", collection: h.bookId, collectionName: title,
    chapter: [h.category, h.chapter].filter((x, i, a) => x && a.indexOf(x) === i).join(" · ") || undefined,
    number: String(h.id), arabic: arabic || undefined, text, textLang: fr ? "fr" : text ? "en" : "ar",
    translator: fr ? undefined : h.translator || b?.translator, grades,
    reference: `${title} · ${h.chapter ? `${h.chapter} · ` : ""}No. ${h.id}`, url: h.URL || undefined, credit: `${title} · No. ${h.id} · thaqalayn.net`,
  };
}
