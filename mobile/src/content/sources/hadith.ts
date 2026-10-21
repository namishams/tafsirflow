import { cachedFetch, DAY, HttpError, rng, settle } from "./net";
import type { SourceItem } from "./types";

// fawazahmed0/hadith-api. Single hadith files are served from GitHub raw (jsDelivr refuses the package size).
const RAW = "https://raw.githubusercontent.com/fawazahmed0/hadith-api/1/editions";

// Highest hadith number per collection (from the API's info.json metadata).
const BOOKS: Record<string, { name: string; max: number; langs: string[] }> = {
  bukhari: { name: "Sahih al-Bukhari", max: 7563, langs: ["ara", "ben", "eng", "fra", "ind", "rus", "tam", "tur", "urd"] },
  muslim: { name: "Sahih Muslim", max: 7563, langs: ["ara", "ben", "eng", "fra", "ind", "rus", "tam", "tur", "urd"] },
  abudawud: { name: "Sunan Abu Dawud", max: 5274, langs: ["ara", "ben", "eng", "fra", "ind", "rus", "tur", "urd"] },
  tirmidhi: { name: "Jami at-Tirmidhi", max: 3956, langs: ["ara", "ben", "eng", "ind", "tur", "urd"] },
  nasai: { name: "Sunan an-Nasa'i", max: 5758, langs: ["ara", "ben", "eng", "fra", "ind", "tur", "urd"] },
  ibnmajah: { name: "Sunan Ibn Majah", max: 4341, langs: ["ara", "ben", "eng", "fra", "ind", "tur", "urd"] },
  malik: { name: "Muwatta Malik", max: 1858, langs: ["ara", "ben", "eng", "fra", "ind", "tur", "urd"] },
  nawawi: { name: "40 Hadith Nawawi", max: 42, langs: ["ara", "ben", "eng", "fra", "tur"] },
  qudsi: { name: "40 Hadith Qudsi", max: 40, langs: ["ara", "eng", "fra"] },
  dehlawi: { name: "40 Hadith Shah Waliullah Dehlawi", max: 40, langs: ["ara", "eng", "fra"] },
};
const ISO3: Record<string, string> = { ar: "ara", bn: "ben", en: "eng", fr: "fra", id: "ind", ru: "rus", ta: "tam", tr: "tur", ur: "urd" };
const ISO2: Record<string, string> = Object.fromEntries(Object.entries(ISO3).map(([k, v]) => [v, k]));
const SUNNAH_SLUG: Record<string, string> = { abudawud: "abudawud", ibnmajah: "ibnmajah", nawawi: "nawawi40", qudsi: "qudsi40" };

type Raw = { text: string; grade?: string; ref?: string } | null;

async function fetchOne(edition: string, n: number): Promise<Raw> {
  try {
    return await cachedFetch<Raw>(`${RAW}/${edition}/${n}.json`, {
      ttlMs: 90 * DAY,
      transform: (r) => {
        const h = r?.hadiths?.[0];
        const text = String(h?.text ?? "").trim();
        if (!text) return null;
        const g = (h.grades as any[] | undefined)?.[0];
        const ref = h.reference ? `Book ${h.reference.book}, Hadith ${h.reference.hadith}` : undefined;
        return { text, grade: g ? `${g.grade} (${g.name})` : undefined, ref };
      },
    });
  } catch (e) {
    if (e instanceof HttpError && e.status === 404) return null;
    throw e;
  }
}

export async function sunniHadith(book: string, n: number, lang: string): Promise<SourceItem | null> {
  const b = BOOKS[book];
  if (!b) return null;
  const want = ISO3[lang];
  const l3 = want && b.langs.includes(want) && want !== "ara" ? want : "eng";
  const [tr, ar] = await Promise.all([fetchOne(`${l3}-${book}`, n), fetchOne(`ara-${book}`, n).catch(() => null)]);
  const main = tr ?? (lang === "ar" ? ar : null);
  if (!main) return null;
  const body = main.grade ? `${main.text}\n\nGrade: ${main.grade}` : main.text;
  return {
    id: `hadith:${book}:${n}`, kind: "hadith", title: `${b.name} ${n}`, body,
    arabic: tr && ar ? ar.text : undefined, lang: tr ? ISO2[l3] : "ar",
    source: `${b.name} – hadith-api (fawazahmed0)`, sourceUrl: `https://sunnah.com/${SUNNAH_SLUG[book] ?? book}:${n}`,
    tradition: "sunni", tags: [book],
  };
}

export async function hadithItems(lang: string, page: number, size: number, seed: string): Promise<SourceItem[]> {
  const keys = Object.keys(BOOKS);
  const r = rng(`hadith:${seed}:${page}`);
  const tasks = Array.from({ length: size }, (_, i) => {
    const book = keys[(page * size + i) % keys.length];
    const n = 1 + Math.floor(r() * BOOKS[book].max);
    return () => sunniHadith(book, n, lang);
  });
  return settle(tasks, 2);
}

// Thaqalayn API (Shia collections).
const TQ = "https://www.thaqalayn-api.net/api/v2";
type TqBook = { id: string; name: string; author: string; min: number; max: number };

async function tqBooks(): Promise<TqBook[]> {
  return cachedFetch<TqBook[]>(`${TQ}/allbooks`, {
    ttlMs: 14 * DAY,
    transform: (r) =>
      (r as any[]).map((b) => ({ id: b.bookId, name: b.BookName, author: b.author, min: b.idRangeMin ?? 1, max: b.idRangeMax ?? 1 })),
  });
}

export async function shiaHadith(book: TqBook, n: number, lang: string): Promise<SourceItem | null> {
  let d: any;
  try {
    d = await cachedFetch<any>(`${TQ}/${encodeURIComponent(book.id)}/${n}`, {
      ttlMs: 90 * DAY,
      transform: (h) => ({
        en: h.englishText, fr: h.frenchText, ar: h.arabicText, chapter: h.chapter, category: h.category,
        url: h.URL, grading: h.majlisiGrading || h.mohseniGrading || h.behbudiGrading || "",
        vol: h.volume, translator: h.translator,
      }),
    });
  } catch (e) {
    if (e instanceof HttpError && e.status === 404) return null;
    throw e;
  }
  const useFr = lang === "fr" && d.fr;
  const text = String((useFr ? d.fr : d.en) || "").trim();
  if (!text && !d.ar) return null;
  const body = [d.chapter ? `${d.chapter}\n` : "", text || d.ar, d.grading ? `\n\nGrading: ${d.grading}` : ""].join("");
  return {
    id: `shia:${book.id}:${n}`, kind: "shia-hadith", title: `${book.name}${d.vol ? ` vol. ${d.vol}` : ""}, ${n}`,
    body, arabic: text ? d.ar || undefined : undefined, lang: useFr ? "fr" : text ? "en" : "ar",
    source: `Thaqalayn – ${book.author}${d.translator ? `, tr. ${d.translator}` : ""}`,
    sourceUrl: d.url || "https://thaqalayn.net", tradition: "shia", tags: [book.id],
  };
}

export async function shiaItems(lang: string, page: number, size: number, seed: string): Promise<SourceItem[]> {
  const books = await tqBooks();
  if (!books.length) return [];
  const r = rng(`shia:${seed}:${page}`);
  const tasks = Array.from({ length: size }, (_, i) => {
    const b = books[(page * size + i) % books.length];
    const n = b.min + Math.floor(r() * (b.max - b.min + 1));
    return () => shiaHadith(b, n, lang);
  });
  return settle(tasks, 2);
}

/** One hadith per day, seeded by date; Shia tradition draws from Thaqalayn, "all" alternates by day. */
export async function hadithOfDay(lang: string, day: string, tradition: "all" | "sunni" | "shia"): Promise<SourceItem[]> {
  const r = rng(`hotd:${day}`);
  const dayNum = Math.floor(Date.parse(day) / 86_400_000);
  const shia = tradition === "shia" || (tradition === "all" && dayNum % 2 === 1);
  for (let attempt = 0; attempt < 4; attempt++) {
    let item: SourceItem | null = null;
    if (shia) {
      const books = await tqBooks();
      const b = books[Math.floor(r() * books.length)];
      if (b) item = await shiaHadith(b, b.min + Math.floor(r() * (b.max - b.min + 1)), lang);
    } else {
      // short, well-known collections are favoured for a daily card
      const pool = ["nawawi", "qudsi", "bukhari", "muslim", "malik", "tirmidhi"];
      const book = pool[Math.floor(r() * pool.length)];
      item = await sunniHadith(book, 1 + Math.floor(r() * BOOKS[book].max), lang);
    }
    if (item) return [{ ...item, id: `hotd:${day}`, kind: "hadith-of-day", date: day, tags: [...(item.tags ?? []), item.id] }];
  }
  return [];
}
