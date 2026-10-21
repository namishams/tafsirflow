import { cachedFetch, DAY, isoDay } from "./net";
import type { SourceItem } from "./types";

const AL = "https://api.aladhan.com/v1";

type Name = { n: number; ar: string; tl: string; en: string };

async function names(): Promise<Name[]> {
  return cachedFetch<Name[]>(`${AL}/asmaAlHusna`, {
    ttlMs: 180 * DAY,
    transform: (r) => (r.data as any[]).map((x) => ({ n: x.number, ar: x.name, tl: x.transliteration, en: x.en?.meaning ?? "" })),
  });
}

export async function asmaItems(_lang: string, page: number, size: number, dayIndex: number): Promise<SourceItem[]> {
  const all = await names();
  if (!all.length) return [];
  // start at "name of the day" so the first card changes daily
  return Array.from({ length: size }, (_, k) => all[(dayIndex + page * size + k) % all.length]).map((x) => ({
    id: `asma:${x.n}`, kind: "asma", title: `${x.n}. ${x.tl}`, arabic: x.ar, body: x.en, lang: "en",
    source: "Aladhan API – Asma al-Husna", sourceUrl: "https://aladhan.com/asma-al-husna-api", tradition: "all",
    tags: [String(x.n)],
  }));
}

type Hijri = { d: string; m: number; mEn: string; mAr: string; y: number; days: number; hol: string[]; wd: string };

function parseHijri(h: any): Hijri {
  return {
    d: h.day, m: h.month.number, mEn: h.month.en, mAr: h.month.ar, y: Number(h.year), days: h.month.days ?? 30,
    hol: [...(h.holidays ?? []), ...(h.adjustedHolidays ?? [])], wd: h.weekday?.en ?? "",
  };
}

export async function islamicDateItems(_lang: string, page: number, now: Date): Promise<SourceItem[]> {
  const g = `${String(now.getDate()).padStart(2, "0")}-${String(now.getMonth() + 1).padStart(2, "0")}-${now.getFullYear()}`;
  const today = await cachedFetch<Hijri>(`${AL}/gToH/${g}`, { ttlMs: 12 * 3_600_000, transform: (r) => parseHijri(r.data.hijri) });
  const out: SourceItem[] = [];
  if (page === 0) {
    out.push({
      id: `hijri:${isoDay(now)}`, kind: "islamic-date", title: `${today.d} ${today.mEn} ${today.y} AH`, arabic: today.mAr,
      body: today.hol.length ? today.hol.join(", ") : `${today.wd}`, lang: "en", source: "Aladhan API",
      sourceUrl: "https://aladhan.com/islamic-calendar", tradition: "all", date: isoDay(now),
    });
  }
  // upcoming holidays: page 0 = this and next Hijri month, page 1 = the two after, ...
  for (let k = 0; k < 2; k++) {
    const off = page * 2 + k;
    const m0 = today.m - 1 + off;
    const month = (m0 % 12) + 1;
    const year = today.y + Math.floor(m0 / 12);
    const days = await cachedFetch<{ g: string; hol: string[]; d: string; mEn: string }[]>(`${AL}/hToGCalendar/${month}/${year}`, {
      ttlMs: 30 * DAY,
      transform: (r) =>
        (r.data as any[])
          .map((x) => ({ g: x.gregorian.date as string, hol: (x.hijri.holidays ?? []) as string[], d: x.hijri.day, mEn: x.hijri.month.en }))
          .filter((x) => x.hol.length),
    }).catch(() => []);
    for (const x of days) {
      const [dd, mm, yy] = x.g.split("-");
      const iso = `${yy}-${mm}-${dd}`;
      if (iso < isoDay(now)) continue;
      for (const h of x.hol) {
        out.push({
          id: `hol:${year}:${month}:${x.d}:${h}`, kind: "islamic-date", title: h, body: `${x.d} ${x.mEn} ${year} AH – ${iso}`,
          lang: "en", source: "Aladhan API (calculated, may differ by local moon sighting)",
          sourceUrl: "https://aladhan.com/islamic-calendar", tradition: "all", date: iso,
        });
      }
    }
  }
  return out;
}
