// Website: loads the scripture of a carousel / wisdom post from its sources (Quran.com, hadith-api, hisnmuslim.com),
// on the server, cached. A post whose scripture cannot be loaded is not shown (never a slide without its source text).
import { resolveHadith, resolveVerse, translationIdFor } from "@/lib/feed/resolve";
import type { CarouselPayload, WisdomPayload } from "./types";

/** the text of a reference slide, as the app shows it */
export type SlideScripture = {
  arabic?: string;
  /** the translation in the reader's language (or English where the source has none); empty in Arabic */
  text?: string;
  textLang?: string;
  /** "Al-Baqarah 2:255", "Sahih al-Bukhari 6018 · Book 78, Hadith 26", "Hisnul Muslim 27" */
  ref: string;
  url?: string;
  /** a verse: the surah names, for the reference line */
  chapter?: string;
  chapterArabic?: string;
  /** a dua: how often it is said */
  repeat?: number;
};
export type ResolvedCarousel = CarouselPayload & {
  /** slide number → its scripture (a pair has two) */
  texts: Record<number, SlideScripture[]>;
};
export type ResolvedWisdom = WisdomPayload & { scripture?: SlideScripture };

const AR_DIGITS = "٠١٢٣٤٥٦٧٨٩";
const toAr = (n: number) => String(n).replace(/\d/g, (d) => AR_DIGITS[Number(d)]);
const memo = new Map<string, { at: number; v: Promise<unknown> }>();
function cached<T>(key: string, ms: number, f: () => Promise<T>): Promise<T> {
  const hit = memo.get(key);
  if (hit && Date.now() - hit.at < ms) return hit.v as Promise<T>;
  const v = f().catch((e) => { memo.delete(key); throw e; });
  memo.set(key, { at: Date.now(), v });
  if (memo.size > 4000) for (const k of [...memo.keys()].slice(0, 1000)) memo.delete(k);
  return v;
}

async function verses(key: string, to: number | undefined, locale: string, tr: number): Promise<SlideScripture | null> {
  const [s, a] = key.split(":").map(Number);
  const keys = Array.from({ length: Math.max(1, (to ?? a) - a + 1) }, (_, i) => `${s}:${a + i}`);
  const got = await Promise.all(keys.map((k) => resolveVerse(k, locale, tr)));
  if (got.some((v) => !v)) return null;
  const vs = got as NonNullable<(typeof got)[number]>[];
  const multi = vs.length > 1;
  return {
    arabic: vs.map((v) => `${v.arabic.trim()}${multi ? ` ﴿${toAr(v.v)}﴾` : ""}`).join(" "),
    text: locale === "ar" ? "" : vs.map((v) => (multi ? `(${v.v}) ${v.translation}` : v.translation)).join(" "),
    textLang: locale,
    ref: `${vs[0].chapter} ${key}${multi ? `–${vs[vs.length - 1].v}` : ""}`,
    url: `https://quran.com/${s}/${a}${multi ? `-${vs[vs.length - 1].v}` : ""}`,
    chapter: vs[0].chapter,
    chapterArabic: vs[0].chapterArabic,
  };
}

type HisnDua = { ARABIC_TEXT?: string; TRANSLATED_TEXT?: string; REPEAT?: number | string };
/** one chapter of Hisnul Muslim (the source has stray control characters and a BOM; both are tolerated here) */
function hisnChapter(lang: "en" | "ar", h: number): Promise<HisnDua[] | null> {
  return cached(`hisn:${lang}:${h}`, 7 * 86_400_000, async () => {
    try {
      const r = await fetch(`https://www.hisnmuslim.com/api/${lang}/${h}.json`, { next: { revalidate: 30 * 86_400 }, signal: AbortSignal.timeout(8000) });
      if (!r.ok) return null;
      const raw = (await r.text()).replace(/^﻿/, "").replace(/[\u0000-\u001f]/g, " ");
      const list = Object.values(JSON.parse(raw) as Record<string, HisnDua[]>)[0];
      return Array.isArray(list) ? list : null;
    } catch { return null; }
  });
}
async function dua(h: number, i: number, locale: string): Promise<SlideScripture | null> {
  const ar = locale === "ar";
  const list = await hisnChapter(ar ? "ar" : "en", h);
  const d = list?.[i];
  const arabic = (d?.ARABIC_TEXT ?? "").trim(), text = ar ? "" : (d?.TRANSLATED_TEXT ?? "").replace(/\s+/g, " ").trim();
  if (!arabic && !text) return null;
  const repeat = Number(d?.REPEAT) || 1;
  return { arabic: arabic || undefined, text, textLang: ar ? "ar" : "en", ref: `Hisnul Muslim ${h}`, url: "https://www.hisnmuslim.com", repeat };
}
async function hadith(c: string, n: number, locale: string): Promise<SlideScripture | null> {
  const h = await resolveHadith(`${c}:${n}`, locale);
  if (!h) return null;
  return { arabic: h.arabic, text: h.text, textLang: h.textLang, ref: h.reference, url: h.url };
}

/** the carousel with its scripture; null when a referenced text cannot be loaded */
export async function resolveCarousel(c: CarouselPayload, locale: string): Promise<ResolvedCarousel | null> {
  const tr = c.slides.some((s) => s.t === "verse" || s.t === "pair") ? await translationIdFor(locale).catch(() => 0) : 0;
  const texts: Record<number, SlideScripture[]> = {};
  const ok = await Promise.all(c.slides.map(async (s) => {
    let got: (SlideScripture | null)[] = [];
    if (s.t === "verse" && s.key) got = [tr ? await verses(s.key, s.to, locale, tr) : null];
    else if (s.t === "pair" && s.keys) got = tr ? await Promise.all(s.keys.map((k) => verses(k, undefined, locale, tr))) : [null];
    else if (s.t === "hadith" && s.c && s.num) got = [await hadith(s.c, s.num, locale)];
    else if (s.t === "dua" && s.h !== undefined && s.i !== undefined) got = [await dua(s.h, s.i, locale)];
    else return true;
    if (got.some((x) => !x)) return false;
    texts[s.n] = got as SlideScripture[];
    return true;
  }));
  return ok.every(Boolean) ? { ...c, texts } : null;
}

export async function resolveWisdom(w: WisdomPayload, locale: string): Promise<ResolvedWisdom | null> {
  if (w.key) {
    const tr = await translationIdFor(locale).catch(() => 0);
    const v = tr ? await verses(w.key, w.to, locale, tr) : null;
    return v ? { ...w, scripture: v } : null;
  }
  if (w.c && w.num) {
    const h = await hadith(w.c, w.num, locale);
    return h ? { ...w, scripture: h } : null;
  }
  return w.text ? { ...w } : null;
}
