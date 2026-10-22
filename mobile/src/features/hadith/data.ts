import { readJSON, writeJSON } from "@/lib/store";
import type { TraditionChoice } from "@/lib/tradition";
import { SHIA_BOOKS, SUNNI_COLLECTIONS, type ShiaBook, type SunniCollection } from "./catalog";
import { cachedJSON, cachedValue } from "./cache";
import { NAHJ_MACHINE, nahjAt, nahjEdition, nahjPosition, type NahjPassage } from "./nahj";
import { hadithLabel, hadithLink, usualHadithNumber } from "@/web/hadithNumber";

// Hadith, only from published sources – nothing here is typed or generated:
// - Sunni collections: fawazahmed0/hadith-api (The Unlicense), Arabic plus the reader's language where the API has
//   it (English otherwise). Grades are shown when the API gives them.
// - Shia collections: the Thaqalayn API (texts and English translations of thaqalayn.net, translator named per
//   book), with the gradings the API carries.
// - Nahj al-Balagha (Shia mode only): the owner's editions, see nahj.ts.
// Everything fetched is cached on the device (cache.ts).

export const SUNNAH_CDN = "https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1";
export const THAQALAYN_API = "https://www.thaqalayn-api.net/api/v2";

export type HadithGrade = { by: string; grade: string };
export type HadithItem = {
  /** "sunnah:bukhari:1" | "thaqalayn:Al-Kafi-Volume-1-Kulayni:20" | "nahj:de:h12" */
  id: string;
  source: "sunnah" | "thaqalayn" | "nahj";
  /** collection key ("bukhari") or Thaqalayn bookId */
  collection: string;
  collectionName: string;
  collectionArabic?: string;
  /** book / chapter inside the collection, as the source names it */
  chapter?: string;
  number: string;
  arabic?: string;
  /** the translation ("" when the app language is Arabic and only the Arabic is shown) */
  text: string;
  /** language of `text` (ISO 639-1) */
  textLang: string;
  translator?: string;
  grades: HadithGrade[];
  /** "Sahih al-Bukhari 1 · Book 1, Hadith 1" */
  reference: string;
  url?: string;
  /** credit line for shared images */
  credit: string;
};

// --- Sunni collections (fawazahmed0/hadith-api) ----------------------------------------------------------------
export const SUNNI_NAMES: Record<string, { en: string; ar: string }> = {
  bukhari: { en: "Sahih al-Bukhari", ar: "صحيح البخاري" },
  muslim: { en: "Sahih Muslim", ar: "صحيح مسلم" },
  nawawi: { en: "The Forty Hadith of an-Nawawi", ar: "الأربعون النووية" },
  abudawud: { en: "Sunan Abi Dawud", ar: "سنن أبي داود" },
  tirmidhi: { en: "Jami' at-Tirmidhi", ar: "جامع الترمذي" },
  nasai: { en: "Sunan an-Nasa'i", ar: "سنن النسائي" },
  ibnmajah: { en: "Sunan Ibn Majah", ar: "سنن ابن ماجه" },
  malik: { en: "Muwatta Malik", ar: "موطأ مالك" },
  qudsi: { en: "The 40 Hadith Qudsi", ar: "الأربعون القدسية" },
  dehlawi: { en: "Dehlawi's 40 Hadith", ar: "أربعون الدهلوي" },
};
/** the collection's name and one-line description in the app language (texts.ts "collections"); English names as fallback */
export function collectionInfo(x: { collections: Record<string, { name: string; desc: string }> }, key: string, fallback: string) {
  const own = x.collections[key];
  return { name: own?.name ?? SUNNI_NAMES[key]?.en ?? fallback, desc: own?.desc ?? "", arabic: SUNNI_NAMES[key]?.ar };
}
/** app language → edition prefix of the API (only languages the API publishes) */
const PREFIX: Record<string, string> = { en: "eng", tr: "tur", ur: "urd", bn: "ben", ru: "rus", fr: "fra", id: "ind" };
export const sunniCollection = (key: string): SunniCollection | undefined => SUNNI_COLLECTIONS.find((c) => c.key === key);
/** the translation edition for this language, English when the API has none; null = Arabic only (app in Arabic) */
export function translationEdition(c: SunniCollection, lang: string): string | null {
  if (lang === "ar") return null;
  const p = PREFIX[lang];
  return p && c.editions.includes(`${p}-${c.key}`) ? `${p}-${c.key}` : `eng-${c.key}`;
}
const editionLang = (ed: string | null) => (!ed ? "ar" : ({ eng: "en", tur: "tr", urd: "ur", ben: "bn", rus: "ru", fra: "fr", ind: "id" } as Record<string, string>)[ed.split("-")[0]] ?? "en");

type SunnahHadith = { hadithnumber: number; arabicnumber?: number | string | null; text: string; grades?: { name: string; grade: string }[]; reference?: { book: number; hadith: number } };
type SunnahDoc = { metadata: { name: string; section?: Record<string, string> }; hadiths: SunnahHadith[] };

function sunniItem(c: SunniCollection, ar: SunnahHadith | undefined, tr: SunnahHadith | undefined, trEd: string | null, chapter?: string): HadithItem | null {
  const h = tr ?? ar;
  if (!h) return null;
  const text = (tr?.text ?? "").trim();
  const arabic = (ar?.text ?? "").trim();
  if (!arabic && !text) return null;
  const names = SUNNI_NAMES[c.key] ?? { en: c.name, ar: "" };
  const ref = h.reference && h.reference.book > 0 ? ` · Book ${h.reference.book}, Hadith ${h.reference.hadith}` : "";
  // label and link by the usual number (Sahih Muslim 804, not the API's 1874; web/hadithNumber.ts, as on the website);
  // id and number stay the API's, by which the text is fetched
  const num = usualHadithNumber(c.key, h.hadithnumber, ar?.arabicnumber ?? tr?.arabicnumber);
  const label = hadithLabel(names.en, num);
  return {
    id: `sunnah:${c.key}:${h.hadithnumber}`, source: "sunnah", collection: c.key, collectionName: names.en, collectionArabic: names.ar,
    chapter, number: String(h.hadithnumber), arabic: arabic || undefined, text, textLang: editionLang(trEd),
    grades: (tr?.grades ?? ar?.grades ?? []).filter((g) => g.grade).map((g) => ({ by: g.name, grade: g.grade })),
    reference: `${label}${ref}`,
    url: hadithLink(c.key, h.hadithnumber, num, trEd ?? `ara-${c.key}`),
    credit: label,
  };
}

/** one book (section) of a Sunni collection: Arabic and translation side by side */
export async function sunniSection(key: string, section: number, lang: string): Promise<HadithItem[]> {
  const c = sunniCollection(key);
  if (!c) return [];
  const trEd = translationEdition(c, lang);
  const url = (ed: string) => `${SUNNAH_CDN}/editions/${ed}/sections/${section}.min.json`;
  const [ar, tr] = await Promise.all([
    cachedJSON<SunnahDoc>(`ara-${key}-s${section}`, url(`ara-${key}`)),
    trEd ? cachedJSON<SunnahDoc>(`${trEd}-s${section}`, url(trEd)).catch(() => null) : Promise.resolve(null),
  ]);
  const chapter = c.sections.find((s) => s.n === section)?.name;
  const byNum = new Map(ar.hadiths.map((h) => [h.hadithnumber, h]));
  const list = (tr ?? ar).hadiths;
  // the API's book table has gaps and overlaps: a number twice in one file is shown once, a book without text gives []
  const seen = new Set<number>();
  return list.filter((h) => !seen.has(h.hadithnumber) && !!seen.add(h.hadithnumber))
    .map((h) => sunniItem(c, byNum.get(h.hadithnumber), tr ? h : undefined, tr ? trEd : null, chapter)).filter((x): x is HadithItem => !!x);
}

/** one hadith by number */
export async function sunniHadith(key: string, n: number, lang: string): Promise<HadithItem | null> {
  const c = sunniCollection(key);
  if (!c) return null;
  let trEd = translationEdition(c, lang);
  const url = (ed: string) => `${SUNNAH_CDN}/editions/${ed}/${n}.min.json`;
  const [ar, local] = await Promise.all([
    cachedJSON<SunnahDoc>(`ara-${key}-${n}`, url(`ara-${key}`)).catch(() => null),
    trEd ? cachedJSON<SunnahDoc>(`${trEd}-${n}`, url(trEd)).catch(() => null) : Promise.resolve(null),
  ]);
  let tr = local;
  // the partial translation editions (tur-muslim 879, rus-muslim 4223 …) carry hadiths with an empty text: then the
  // English edition, as for a language without its own edition (website: resolveHadith in src/lib/feed/resolve.ts)
  if (trEd && !trEd.startsWith("eng-") && !(tr?.hadiths[0]?.text ?? "").trim()) {
    const eng = await cachedJSON<SunnahDoc>(`eng-${key}-${n}`, url(`eng-${key}`)).catch(() => null);
    if ((eng?.hadiths[0]?.text ?? "").trim()) { tr = eng; trEd = `eng-${key}`; }
  }
  if (!ar && !tr) throw new Error("offline");
  const chapter = Object.values((tr ?? ar)?.metadata.section ?? {})[0];
  const item = sunniItem(c, ar?.hadiths[0], tr?.hadiths[0], tr ? trEd : null, chapter);
  // a translation without text (some numbers are empty in an edition) is not shown on its own
  return item && (item.text || lang === "ar") ? item : null;
}

// --- Shia collections (Thaqalayn API) -----------------------------------------------------------------------------
type TqHadith = {
  bookId: string; id: number; book: string; volume: number; category: string; chapter: string; author: string; translator: string;
  englishText: string; arabicText: string; frenchText?: string; URL?: string;
  gradingsFull?: { author?: { name_en?: string | null; name_ar?: string | null }; grade_en?: string | null; grade_ar?: string | null }[];
};
export const shiaBook = (id: string): ShiaBook | undefined => SHIA_BOOKS.find((b) => b.id === id);
const multiVolume = (b: ShiaBook) => /Volume-\d/.test(b.id);
export const shiaBookTitle = (b: ShiaBook) => `${b.name}${multiVolume(b) ? ` · ${b.volume}` : ""}`;

function shiaItem(h: TqHadith, lang: string): HadithItem | null {
  // the API marks line breaks with <br>; nothing else is changed
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
    reference: `${title} · ${h.chapter ? `${h.chapter} · ` : ""}No. ${h.id}`,
    url: h.URL || undefined,
    credit: `${title} · No. ${h.id} · thaqalayn.net`,
  };
}

export async function shiaHadith(bookId: string, id: number, lang: string): Promise<HadithItem | null> {
  const h = await cachedJSON<TqHadith>(`tq-${bookId}-${id}`, `${THAQALAYN_API}/${encodeURIComponent(bookId)}/${id}`);
  return shiaItem(h, lang);
}

export const SHIA_PAGE = 10;
/** one reader page of a Thaqalayn book (ids page*10+1 …), cached as a whole once complete */
export async function shiaPage(bookId: string, page: number, lang: string): Promise<HadithItem[]> {
  const b = shiaBook(bookId);
  if (!b) return [];
  const from = page * SHIA_PAGE + 1, to = Math.min(b.max, from + SHIA_PAGE - 1);
  const raw = await cachedValue<TqHadith[]>(`tq-${bookId}-p${page}`, async () => {
    const got = await Promise.all(Array.from({ length: to - from + 1 }, (_, i) =>
      fetch(`${THAQALAYN_API}/${encodeURIComponent(bookId)}/${from + i}`).then((r) => (r.ok ? (r.json() as Promise<TqHadith>) : null)).catch(() => null)));
    if (got.some((x) => x === null)) throw new Error("offline");
    return got as TqHadith[];
  });
  return raw.map((h) => shiaItem(h, lang)).filter((x): x is HadithItem => !!x);
}
export const shiaPages = (bookId: string) => Math.ceil((shiaBook(bookId)?.max ?? 0) / SHIA_PAGE);

// --- picks: daily, random, endless feed ----------------------------------------------------------------------------
const SUNNI_PICK = ["bukhari", "muslim", "nawawi"];
// books with short, general narrations for the daily card and the feed (all others stay in the reader)
const SHIA_PICK = ["Al-Kafi-Volume-1-Kulayni", "Al-Kafi-Volume-2-Kulayni", "Al-Amali-Saduq", "Al-Khisal-Saduq", "Kitab-al-Mumin-Ahwazi", "Kitab-al-Zuhd-Ahwazi", "Sifat-al-Shia-Saduq", "Thawab-al-Amal-wa-iqab-al-Amal-Saduq"]
  .filter((id) => !!shiaBook(id));

function hash(...xs: (number | string)[]) {
  let h = 2166136261;
  for (const ch of xs.join("|")) { h ^= ch.charCodeAt(0); h = Math.imul(h, 16777619); }
  return h >>> 0;
}
type Pick = { kind: "sunni"; key: string } | { kind: "shia"; book: string } | { kind: "nahj" };
function schedule(t: TraditionChoice | null): Pick[] {
  const sunni: Pick[] = SUNNI_PICK.map((key) => ({ kind: "sunni", key }));
  const shia: Pick[] = SHIA_PICK.map((book) => ({ kind: "shia", book }));
  if (t === "sunni") return sunni;
  if (t === "shia") return shia.flatMap((p, i) => (i % 2 === 0 ? [p, { kind: "nahj" } as Pick] : [p]));
  return sunni.flatMap((p, i) => [p, shia[i % shia.length]]);
}

/** a hadith for pick p and seed: tries a few numbers, as some numbers are empty in an edition */
async function pickOne(p: Exclude<Pick, { kind: "nahj" }>, seed: number, lang: string): Promise<HadithItem | null> {
  for (let attempt = 0; attempt < 4; attempt++) {
    const h = hash(seed, attempt);
    try {
      if (p.kind === "sunni") {
        const c = sunniCollection(p.key);
        if (!c) return null;
        const item = await sunniHadith(p.key, 1 + (h % c.max), lang);
        if (item) return item;
      } else {
        const b = shiaBook(p.book);
        if (!b) return null;
        // skip the books' introductions (the first ids)
        const item = await shiaHadith(p.book, Math.min(b.max, 20 + (h % Math.max(1, b.max - 20))), lang);
        if (item && item.text.length < 1600) return item;
      }
    } catch (e) {
      if (attempt === 3) throw e;
    }
  }
  return null;
}

const dayNumber = (d = new Date()) => Math.floor((d.getTime() - d.getTimezoneOffset() * 60000) / 86400000);

/** the hadith of the day: the same for everyone with the same tradition and language on a given day */
export async function getDailyHadith(lang: string, tradition: TraditionChoice | null): Promise<HadithItem | null> {
  const day = dayNumber();
  const picks = schedule(tradition).filter((p): p is Exclude<Pick, { kind: "nahj" }> => p.kind !== "nahj");
  return pickOne(picks[day % picks.length], hash("day", day), lang);
}

/** any hadith of the tradition's collections */
export async function randomHadith(lang: string, tradition: TraditionChoice | null): Promise<HadithItem | null> {
  const picks = schedule(tradition).filter((p): p is Exclude<Pick, { kind: "nahj" }> => p.kind !== "nahj");
  return pickOne(picks[Math.floor(Math.random() * picks.length)], Math.floor(Math.random() * 1e9), lang);
}

/** a Nahj passage as a feed item (its own edition's credit; German text also in other app languages when chosen) */
export function nahjItem(p: NahjPassage): HadithItem {
  return {
    id: `nahj:${p.edition}:${p.id}`, source: "nahj", collection: `nahj-${p.edition}`, collectionName: p.title, number: p.id,
    arabic: p.arabic, text: p.text, textLang: p.edition, grades: [], reference: p.ref, url: p.link || undefined,
    credit: p.machine ? `${p.credit} · ${NAHJ_MACHINE[p.edition]}` : p.credit,
  };
}

/** the shape the Quran feed renders (features/feed/hadith.ts: HadithFeedItem) plus the full item */
export type HadithFeedItem = { id: string; arabic?: string; text: string; source: string; narrator?: string; grade?: string; item: HadithItem };
export type HadithFeedPage = { items: HadithFeedItem[]; cursor: string | null };
export const toFeedItem = (h: HadithItem): HadithFeedItem => ({
  id: h.id, arabic: h.arabic, text: h.text, source: h.reference, item: h,
  grade: h.grades.length ? h.grades.map((g) => `${g.by}: ${g.grade}`).join(" · ") : undefined,
});

/**
 * An endless hadith stream for the feed: Sunni → Bukhari, Muslim, an-Nawawi; Shia → Thaqalayn books and Nahj al-Balagha
 * passages; both → Sunni and Thaqalayn (no Nahj). cursor: null to start, then the returned cursor. It never ends: the
 * picks go on with a new seed, and the Nahj passages start a fresh shuffle after the last one. Items that cannot be
 * loaded (offline, empty number) are skipped; a page may be shorter than `size` but is empty only when offline.
 */
export async function hadithFeedItems(lang: string, tradition: TraditionChoice | null, cursor: string | null, size = 6): Promise<HadithFeedPage> {
  const plan = schedule(tradition);
  const ed = nahjEdition(lang);
  const pos = !cursor && plan.some((p) => p.kind === "nahj") ? nahjPosition(ed) : { seed: 0, k: 0 };
  // cursor = seed : next index : next Nahj passage : Nahj seed (the Nahj part starts where the Nahj reader stopped)
  const [seed, i0, nahjK, nahjSeed] = cursor ? cursor.split(":").map(Number) : [Math.floor(Math.random() * 1e9), 0, pos.k, pos.seed];
  let k = nahjK;
  const jobs = Array.from({ length: size }, (_, j) => {
    const i = i0 + j;
    const p = plan[i % plan.length];
    if (p.kind === "nahj") { const at = k++; const np = nahjAt(ed, nahjSeed, at); return Promise.resolve(np ? nahjItem(np) : null); }
    return pickOne(p, hash(seed, i), lang).catch(() => null);
  });
  const got = (await Promise.all(jobs)).filter((x): x is HadithItem => !!x);
  return { items: got.map(toFeedItem), cursor: `${seed}:${i0 + size}:${k}:${nahjSeed}` };
}

// --- saved -----------------------------------------------------------------------------------------------------------
export const SAVED_KEY = "qmc.hadithSaved"; // local only: the whole item, so a saved hadith also opens offline
export const readSaved = () => readJSON<HadithItem[]>(SAVED_KEY, []);
export const isSaved = (id: string) => readSaved().some((x) => x.id === id);
export function toggleSaved(h: HadithItem): boolean {
  const all = readSaved();
  const on = !all.some((x) => x.id === h.id);
  writeJSON(SAVED_KEY, on ? [h, ...all].slice(0, 500) : all.filter((x) => x.id !== h.id));
  return on;
}
