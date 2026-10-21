import { cachedFetch, DAY, rng, settle } from "./net";
import type { SourceItem, TimeOfDay } from "./types";

// Hisnul Muslim via hisnmuslim.com (English and Arabic) and fitrahive/dua-dhikr (English, Indonesian).
const HM = "https://www.hisnmuslim.com/api";
const FH = "https://raw.githubusercontent.com/fitrahive/dua-dhikr/main/data/dua-dhikr";
const FH_CATS: { slug: string; time: TimeOfDay; title: string }[] = [
  { slug: "morning-dhikr", time: "morning", title: "Morning dhikr" },
  { slug: "evening-dhikr", time: "evening", title: "Evening dhikr" },
  { slug: "dhikr-after-salah", time: "prayer", title: "Dhikr after salah" },
  { slug: "daily-dua", time: "any", title: "Daily dua" },
  { slug: "selected-dua", time: "any", title: "Selected dua" },
];

export function timeOfDayFor(title: string): TimeOfDay {
  const t = title.toLowerCase();
  if (/morning and evening|morning/.test(t)) return /evening/.test(t) ? "morning" : "morning";
  if (/evening/.test(t)) return "evening";
  if (/sleep|bed|night|wak(e|ing) up|dream/.test(t)) return "sleep";
  if (/travel|journey|mount|vehicle|returning/.test(t)) return "travel";
  if (/prayer|salah|mosque|adhan|ablution|wudu|call to prayer|prostration|tashahhud|witr/.test(t)) return "prayer";
  return "any";
}

/** Current time slot, used to bring matching adhkar first. */
export function currentSlot(now: Date): TimeOfDay {
  const h = now.getHours();
  if (h >= 4 && h < 11) return "morning";
  if (h >= 15 && h < 21) return "evening";
  if (h >= 21 || h < 4) return "sleep";
  return "prayer";
}

type HmChapter = { id: number; title: string; time: TimeOfDay };
type HmDua = { ar: string; tr: string; repeat: number };

async function hmChapters(lang: "en" | "ar"): Promise<HmChapter[]> {
  return cachedFetch<HmChapter[]>(`${HM}/${lang}/husn_${lang}.json`, {
    ttlMs: 30 * DAY,
    transform: (r) => {
      const list = Object.values(r)[0] as any[];
      return list.map((c) => ({ id: Number(c.ID), title: String(c.TITLE), time: "any" as TimeOfDay }));
    },
  });
}

async function hmDuas(lang: "en" | "ar", id: number): Promise<HmDua[]> {
  return cachedFetch<HmDua[]>(`${HM}/${lang}/${id}.json`, {
    ttlMs: 60 * DAY,
    transform: (r) =>
      ((Object.values(r)[0] as any[]) ?? []).map((d) => ({
        ar: String(d.ARABIC_TEXT ?? "").trim(),
        tr: String(d.TRANSLATED_TEXT ?? "").trim(),
        repeat: Number(d.REPEAT) || 1,
      })),
  });
}

type FhDua = { title: string; arabic: string; latin: string; translation: string; source: string; notes?: string };

async function fhList(slug: string, lang: "en" | "id"): Promise<FhDua[]> {
  return cachedFetch<FhDua[]>(`${FH}/${slug}/${lang}.json`, {
    ttlMs: 30 * DAY,
    transform: (r) =>
      (r as any[]).map((d) => ({
        title: d.title, arabic: d.arabic, latin: d.latin, translation: d.translation, source: d.source ?? "", notes: d.notes ?? "",
      })),
  });
}

export async function duaItems(lang: string, page: number, size: number, seed: string, now: Date): Promise<SourceItem[]> {
  const slot = currentSlot(now);
  // Every third page comes from fitrahive (and always for Indonesian), the rest from Hisnul Muslim.
  if (lang === "id" || page % 3 === 2) {
    const fl: "en" | "id" = lang === "id" ? "id" : "en";
    const cats = [...FH_CATS].sort((a, b) => Number(b.time === slot) - Number(a.time === slot));
    const all = (await settle(cats.map((c) => async () => (await fhList(c.slug, fl)).map((d, i) => ({ c, d, i })))))
      .flat();
    if (!all.length) return [];
    const start = (lang === "id" ? page : Math.floor(page / 3)) * size;
    return Array.from({ length: Math.min(size, all.length) }, (_, k) => all[(start + k) % all.length]).map(({ c, d, i }) => ({
      id: `dua:fh:${c.slug}:${i}:${fl}`, kind: "dua" as const, title: d.title, arabic: d.arabic,
      body: [d.latin, d.translation, d.notes].filter(Boolean).join("\n\n"), lang: fl,
      source: `${d.source ? d.source + " – " : ""}fitrahive/dua-dhikr`, sourceUrl: `https://github.com/fitrahive/dua-dhikr`,
      tradition: "all" as const, timeOfDay: c.time, tags: [c.slug],
    }));
  }
  const hl: "en" | "ar" = lang === "ar" ? "ar" : "en";
  const chs = (await hmChapters(hl)).map((c) => ({ ...c, time: timeOfDayFor(c.title) }));
  // English titles drive the time tag also for Arabic (same IDs)
  if (hl === "ar") {
    const en = await hmChapters("en").catch(() => []);
    const byId = new Map(en.map((c) => [c.id, timeOfDayFor(c.title)]));
    for (const c of chs) c.time = byId.get(c.id) ?? "any";
  }
  const r = rng(`dua:${seed}`);
  const matching = chs.filter((c) => c.time === slot);
  const rest = chs.filter((c) => c.time !== slot).sort(() => r() - 0.5);
  const ordered = [...matching, ...rest];
  const hmPage = page - Math.floor((page + 1) / 3);
  const pick = Array.from({ length: size }, (_, k) => ordered[(hmPage * size + k) % ordered.length]);
  const tasks = pick.map((c) => async (): Promise<SourceItem | null> => {
    const duas = await hmDuas(hl, c.id);
    if (!duas.length) return null;
    const idx = Math.floor(r() * duas.length);
    const d = duas[idx];
    if (!d.ar && !d.tr) return null;
    const body = [hl === "ar" ? "" : d.tr, d.repeat > 1 ? `(${d.repeat}×)` : ""].filter(Boolean).join("\n\n");
    return {
      id: `dua:hm:${c.id}:${idx}:${hl}`, kind: "dua", title: c.title, arabic: d.ar || undefined, body: body || d.ar,
      lang: hl, source: "Hisnul Muslim (Sa'id al-Qahtani) – hisnmuslim.com", sourceUrl: "https://www.hisnmuslim.com",
      tradition: "sunni", timeOfDay: c.time, tags: [`hisn:${c.id}`],
    };
  });
  return settle(tasks);
}

/** one dua by the server corpus reference: Hisnul Muslim {h: chapter, i: index} or fitrahive {f: category, i: index} */
export async function duaByRef(ref: { h?: unknown; f?: unknown; i?: unknown }, lang: string): Promise<SourceItem | null> {
  const i = Number(ref.i);
  if (!Number.isInteger(i) || i < 0) return null;
  if (typeof ref.f === "string") {
    const c = FH_CATS.find((x) => x.slug === ref.f);
    if (!c) return null;
    const fl: "en" | "id" = lang === "id" ? "id" : "en";
    const d = (await fhList(c.slug, fl))[i];
    if (!d || (!d.arabic && !d.translation)) return null;
    return {
      id: `dua:fh:${c.slug}:${i}:${fl}`, kind: "dua", title: d.title, arabic: d.arabic,
      body: [d.latin, d.translation, d.notes].filter(Boolean).join("\n\n"), lang: fl,
      source: `${d.source ? d.source + " – " : ""}fitrahive/dua-dhikr`, sourceUrl: "https://github.com/fitrahive/dua-dhikr",
      tradition: "all", timeOfDay: c.time, tags: [c.slug],
    };
  }
  const id = Number(ref.h);
  if (!Number.isInteger(id)) return null;
  const hl: "en" | "ar" = lang === "ar" ? "ar" : "en";
  const [chs, en] = await Promise.all([hmChapters(hl), hl === "ar" ? hmChapters("en").catch(() => []) : Promise.resolve([] as HmChapter[])]);
  const c = chs.find((x) => x.id === id);
  if (!c) return null;
  const d = (await hmDuas(hl, id))[i];
  if (!d || (!d.ar && !d.tr)) return null;
  const body = [hl === "ar" ? "" : d.tr, d.repeat > 1 ? `(${d.repeat}×)` : ""].filter(Boolean).join("\n\n");
  return {
    id: `dua:hm:${id}:${i}:${hl}`, kind: "dua", title: c.title, arabic: d.ar || undefined, body: body || d.ar,
    lang: hl, source: "Hisnul Muslim (Sa'id al-Qahtani) – hisnmuslim.com", sourceUrl: "https://www.hisnmuslim.com",
    tradition: "sunni", timeOfDay: timeOfDayFor((en.find((x) => x.id === id) ?? c).title), tags: [`hisn:${id}`],
  };
}
