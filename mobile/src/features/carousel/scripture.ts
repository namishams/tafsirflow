import { useEffect, useState } from "react";
import { getChapters, getVerseByKey } from "@/lib/quran";
import { sunniHadith } from "@/features/hadith/data";
import { duaByRef } from "@/content/sources/duas";
import type { CarouselPayload, CarouselSlide, Scripture, WisdomPayload } from "./types";

// The scripture of a slide, always from the app's sources: the Quran API (Arabic + the reader's translation), the
// hadith editions (features/hadith/data) and Hisnul Muslim (content/sources/duas). Nothing is typed by hand; a slide
// whose text cannot be loaded shows its reference only and is not exported.
const AR = "٠١٢٣٤٥٦٧٨٩";
const toAr = (n: number) => String(n).replace(/\d/g, (d) => AR[Number(d)]);
const cache = new Map<string, Promise<Scripture | null>>();
function once(key: string, f: () => Promise<Scripture | null>): Promise<Scripture | null> {
  let p = cache.get(key);
  if (!p) {
    p = f().catch(() => null).then((v) => { if (!v) cache.delete(key); return v; });
    cache.set(key, p);
  }
  return p;
}

async function surahName(s: number, lang: string) {
  try { return (await getChapters(lang)).find((c) => c.id === s)?.name_simple ?? String(s); } catch { return String(s); }
}

export function verseScripture(key: string, to: number | undefined, lang: string): Promise<Scripture | null> {
  return once(`v:${lang}:${key}:${to ?? ""}`, async () => {
    const [s, a] = key.split(":").map(Number);
    const n = Math.max(1, (to ?? a) - a + 1);
    const vs = await Promise.all(Array.from({ length: n }, (_, i) => getVerseByKey(`${s}:${a + i}`, lang)));
    if (vs.some((v) => !v?.text_uthmani)) return null;
    const multi = n > 1;
    const name = await surahName(s, lang);
    return {
      arabic: vs.map((v, i) => `${v.text_uthmani.trim()}${multi ? ` ﴿${toAr(a + i)}﴾` : ""}`).join(" "),
      text: vs.map((v, i) => (multi && v.translation ? `(${a + i}) ${v.translation}` : v.translation)).filter(Boolean).join(" "),
      ref: `${name} · ${key}${multi ? `–${a + n - 1}` : ""}`,
      url: `https://quran.com/${s}/${a}`,
    };
  });
}

export function hadithScripture(c: string, num: number, lang: string): Promise<Scripture | null> {
  return once(`h:${lang}:${c}:${num}`, async () => {
    const h = await sunniHadith(c, num, lang);
    if (!h || (!h.text && !h.arabic)) return null;
    return { arabic: h.arabic, text: h.text, ref: h.reference, url: h.url };
  });
}

export function duaScripture(h: number, i: number, lang: string): Promise<Scripture | null> {
  return once(`d:${lang}:${h}:${i}`, async () => {
    const d = await duaByRef({ h, i }, lang);
    if (!d) return null;
    const m = /\n\n\((\d+)×\)$/.exec(d.body ?? "");
    const text = lang === "ar" ? "" : (m ? d.body.slice(0, m.index) : d.body).trim();
    return { arabic: d.arabic, text: text === d.arabic ? "" : text, ref: `Hisnul Muslim · ${d.title}`, url: d.sourceUrl, repeat: m ? Number(m[1]) : undefined };
  });
}

/** the texts of one slide (a pair has two), or null when one could not be loaded; [] for text slides */
export async function slideScripture(s: CarouselSlide, lang: string): Promise<Scripture[] | null> {
  let got: (Scripture | null)[] = [];
  if (s.t === "verse" && s.key) got = [await verseScripture(s.key, s.to, lang)];
  else if (s.t === "pair" && s.keys) got = await Promise.all(s.keys.map((k) => verseScripture(k, undefined, lang)));
  else if (s.t === "hadith" && s.c && s.num) got = [await hadithScripture(s.c, s.num, lang)];
  else if (s.t === "dua" && s.h !== undefined && s.i !== undefined) got = [await duaScripture(s.h, s.i, lang)];
  else return [];
  return got.every(Boolean) ? (got as Scripture[]) : null;
}

export type Texts = { texts: Record<number, Scripture[]>; missing: number[]; ready: boolean };
/** loads the scripture of every reference slide (when `on`) */
export function useCarouselTexts(c: CarouselPayload | null, lang: string, on = true): Texts {
  const [st, set] = useState<Texts>({ texts: {}, missing: [], ready: false });
  useEffect(() => {
    if (!c || !on) return;
    let live = true;
    void Promise.all(c.slides.map(async (s) => [s.n, await slideScripture(s, lang).catch(() => null)] as const)).then((all) => {
      if (!live) return;
      const texts: Record<number, Scripture[]> = {};
      const missing: number[] = [];
      for (const [n, t] of all) { if (t) texts[n] = t; else missing.push(n); }
      set({ texts, missing, ready: true });
    });
    return () => { live = false; };
  }, [c?.id, c?.lang, lang, on]); // eslint-disable-line react-hooks/exhaustive-deps
  return st;
}

export function useWisdomText(w: WisdomPayload | null, lang: string): { s: Scripture | null; ready: boolean } {
  const [st, set] = useState<{ s: Scripture | null; ready: boolean }>({ s: null, ready: false });
  useEffect(() => {
    if (!w) return;
    if (!w.key && !w.c) { set({ s: null, ready: true }); return; }
    let live = true;
    const p = w.key ? verseScripture(w.key, w.to, lang) : hadithScripture(w.c!, w.num!, lang);
    void p.then((s) => { if (live) set({ s, ready: true }); });
    return () => { live = false; };
  }, [w?.id, lang]); // eslint-disable-line react-hooks/exhaustive-deps
  return st;
}
