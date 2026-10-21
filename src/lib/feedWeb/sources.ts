// External sources of the web feed, on the server: Quran.com (tafsir passages, word by word, surah introductions),
// Hisnul Muslim and fitrahive (duas), the Quranic Arabic Corpus lemma card and Wikipedia / Wikimedia Commons.
// Server port of mobile/src/content/sources/{quran,duas}.ts and mobile/src/content/extra/{wiki,sources}.ts: same
// requests, same excerpt lengths, same languages, same attribution. Every fetch has a 6 s timeout, a Next fetch cache
// hint and an in-process cache (net.ts); a failed source gives null and the card is left out, never a partial text.
import { getChapters } from "@/lib/quran";
import { DAY, HOUR, excerpt, getJson, memo, peek, poke, polite, stripHtml, withTimeout } from "./net";

const QC = "https://api.quran.com/api/v4";
const KEY = /^\d{1,3}:\d{1,3}$/;

// app language -> Quran.com language_name used in the tafsir resource list
export const TAFSIR_LANG: Record<string, string> = {
  en: "english", ar: "arabic", bn: "bengali", ru: "russian", ur: "urdu", ku: "kurdish",
  id: "indonesian", tr: "turkish", fr: "french", de: "german", fa: "persian", ms: "malay",
};
const LANG_CODE: Record<string, string> = Object.fromEntries(Object.entries(TAFSIR_LANG).map(([k, v]) => [v, k]));

/** a text card of an external source before it becomes a WebCard */
export type SourceText = { title: string; body: string; arabic?: string; lang: string; source: string; sourceUrl: string };

const chaptersEn = () => memo("qc:chapters:en", DAY, () => withTimeout(getChapters("en")).then((c) => (c.length ? c : null)), HOUR);

// ---------- tafsir ----------
type TafsirRes = { id: number; name: string; author: string; slug: string; lang: string };
type RawTafsirList = { tafsirs?: { id: number; name: string; author_name: string; slug: string; language_name: string; translated_name?: { name?: string } }[] };
const tafsirList = () =>
  memo<TafsirRes[]>("qc:tafsirs", DAY, async () => {
    const r = await getJson<RawTafsirList>(`${QC}/resources/tafsirs`, { revalidate: 7 * 86_400 });
    return r?.tafsirs?.length
      ? r.tafsirs.map((t) => ({ id: t.id, name: t.translated_name?.name ?? t.name, author: t.author_name, slug: t.slug, lang: String(t.language_name).toLowerCase() }))
      : null;
  }, HOUR);

/** the passage of a Quran.com tafsir work for a verse (the API answers with the passage of the verse's group); the card
 *  and its link carry the group's first verse, so a group is one card (mobile tafsirByRef) */
export async function tafsirByRef(tafsirId: number, key: string): Promise<(SourceText & { firstKey: string }) | null> {
  if (!KEY.test(key) || !Number.isInteger(tafsirId)) return null;
  const [list, chs] = await Promise.all([tafsirList(), chaptersEn()]);
  const t = list?.find((x) => x.id === tafsirId);
  if (!t) return null;
  const data = await memo<{ text: string; keys: string[] }>(`qc:tafsir:${t.id}:${key}`, 12 * HOUR, async () => {
    const raw = await getJson<{ tafsir?: { text?: string; verses?: Record<string, unknown> } }>(`${QC}/tafsirs/${t.id}/by_ayah/${key}`, { revalidate: 30 * 86_400 });
    const txt = stripHtml(String(raw?.tafsir?.text ?? ""));
    const keys = Object.keys(raw?.tafsir?.verses ?? {}).filter((k) => /^\d+:\d+$/.test(k)).sort((x, y) => Number(x.split(":")[1]) - Number(y.split(":")[1]));
    return txt ? { text: excerpt(txt, 700), keys } : null;
  });
  if (!data) return null;
  const first = data.keys[0] ?? key, last = data.keys[data.keys.length - 1] ?? key;
  const ch = chs?.find((c) => c.id === Number(first.split(":")[0]));
  const range = first === last ? first : `${first}–${last.split(":")[1]}`;
  return {
    title: `${t.name} – ${ch ? `${ch.name_simple} ` : ""}${range}`, body: data.text, lang: LANG_CODE[t.lang] ?? "en",
    source: `Quran.com – ${t.name} (${t.author})`, sourceUrl: `https://quran.com/${first}/tafsirs/${t.slug}`, firstKey: first,
  };
}

// ---------- word by word ----------
// Word-by-word translation languages offered by Quran.com
const WBW = new Set(["en", "ur", "bn", "id", "tr", "fa", "hi", "ta", "ms", "ml"]);
type VWord = { ar: string; tr: string; tl: string; pos: number };
type RawWords = { verse?: { words?: { char_type_name?: string; text_uthmani?: string; position: number; translation?: { text?: string }; transliteration?: { text?: string } }[] } };
/** the words of a verse with word-by-word translation (Quran.com) */
const verseWords = (key: string, wl: string) =>
  memo<VWord[]>(`qc:words:${key}:${wl}`, 12 * HOUR, async () => {
    const raw = await getJson<RawWords>(`${QC}/verses/by_key/${key}?words=true&language=${wl}&word_fields=text_uthmani`, { revalidate: 30 * 86_400 });
    const words = (raw?.verse?.words ?? []).filter((w) => w.char_type_name === "word").map((w) => ({ ar: w.text_uthmani ?? "", tr: w.translation?.text ?? "", tl: w.transliteration?.text ?? "", pos: w.position }));
    return words.length ? words : null;
  });

/** one word of a verse by its 1-based position; null when the verse has no such word (mobile wordByRef) */
export async function wordByRef(key: string, pos: number, lang: string): Promise<{ word: VWord; total: number; lang: string } | null> {
  if (!KEY.test(key) || !Number.isInteger(pos)) return null;
  const wl = WBW.has(lang) ? lang : "en";
  const words = await verseWords(key, wl);
  const w = words?.find((x) => x.pos === pos);
  if (!w?.ar || !w.tr) return null;
  return { word: w, total: words?.length ?? 0, lang: wl };
}

/** a lemma of the Quranic Arabic Corpus with its root and count (all from the server reference, nothing is loaded) */
export function lemmaCard(ref: { l?: unknown; r?: unknown; n?: unknown; k?: unknown }, lang: string): (SourceText & { key: string }) | null {
  const lemma = typeof ref.l === "string" ? ref.l : "", root = typeof ref.r === "string" ? ref.r : "", n = Number(ref.n), key = typeof ref.k === "string" ? ref.k : "";
  if (!lemma || !root || !Number.isInteger(n) || n < 1 || !KEY.test(key)) return null;
  const spaced = [...root].join(" ");
  const de = lang === "de";
  return {
    title: `${lemma}: ${n}×`, arabic: lemma, key,
    body: de
      ? `Das Wort ${lemma} (Wurzel ${spaced}) kommt ${n}-mal im Koran vor. Erstes Vorkommen: ${key}.`
      : `The word ${lemma} (root ${spaced}) appears ${n} times in the Quran. First occurrence: ${key}.`,
    lang: de ? "de" : "en", source: "Quranic Arabic Corpus (GPL), via quran-morphology",
    sourceUrl: `https://corpus.quran.com/qurandictionary.jsp?q=${encodeURIComponent(root)}`,
  };
}

// ---------- surah introduction (the surah of the day) ----------
/** the short introduction of a surah in the reader's language (Quran.com chapter info); null when there is none */
export const surahInfo = (surah: number, lang: string) =>
  memo<{ text: string; lang: string; src: string }>(`qc:info:${surah}:${lang}`, 12 * HOUR, async () => {
    const raw = await getJson<{ chapter_info?: { short_text?: string; text?: string; language_name?: string; source?: string } }>(
      `${QC}/chapters/${surah}/info?language=${encodeURIComponent(lang)}`, { revalidate: 30 * 86_400 });
    const ci = raw?.chapter_info;
    if (!ci) return null;
    const txt = stripHtml(String(ci.short_text || ci.text || ""));
    return txt ? { text: excerpt(txt, 700), lang: LANG_CODE[String(ci.language_name)] ?? "en", src: String(ci.source ?? "") } : null;
  }, HOUR);

// ---------- duas ----------
// Hisnul Muslim via hisnmuslim.com (English and Arabic) and fitrahive/dua-dhikr (English, Indonesian).
const HM = "https://www.hisnmuslim.com/api";
const FH = "https://raw.githubusercontent.com/fitrahive/dua-dhikr/main/data/dua-dhikr";
const FH_CATS = ["morning-dhikr", "evening-dhikr", "dhikr-after-salah", "daily-dua", "selected-dua"];

type HmChapter = { id: number; title: string };
type HmDua = { ar: string; tr: string; repeat: number };
const hmChapters = (lang: "en" | "ar") =>
  memo<HmChapter[]>(`hm:chapters:${lang}`, DAY, async () => {
    const r = await getJson<Record<string, { ID: string | number; TITLE: string }[]>>(`${HM}/${lang}/husn_${lang}.json`, { revalidate: 30 * 86_400 });
    const list = r ? Object.values(r)[0] : null;
    return list?.length ? list.map((c) => ({ id: Number(c.ID), title: String(c.TITLE) })) : null;
  }, HOUR);
const hmDuas = (lang: "en" | "ar", id: number) =>
  memo<HmDua[]>(`hm:duas:${lang}:${id}`, DAY, async () => {
    const r = await getJson<Record<string, { ARABIC_TEXT?: string; TRANSLATED_TEXT?: string; REPEAT?: number }[]>>(`${HM}/${lang}/${id}.json`, { revalidate: 60 * 86_400 });
    const list = r ? Object.values(r)[0] : null;
    return list ? list.map((d) => ({ ar: String(d.ARABIC_TEXT ?? "").trim(), tr: String(d.TRANSLATED_TEXT ?? "").trim(), repeat: Number(d.REPEAT) || 1 })) : null;
  }, HOUR);
type FhDua = { title: string; arabic: string; latin: string; translation: string; source: string; notes: string };
const fhList = (slug: string, lang: "en" | "id") =>
  memo<FhDua[]>(`fh:${slug}:${lang}`, DAY, async () => {
    const r = await getJson<{ title: string; arabic: string; latin: string; translation: string; source?: string; notes?: string }[]>(`${FH}/${slug}/${lang}.json`, { revalidate: 30 * 86_400 });
    return Array.isArray(r) ? r.map((d) => ({ title: d.title, arabic: d.arabic, latin: d.latin, translation: d.translation, source: d.source ?? "", notes: d.notes ?? "" })) : null;
  }, HOUR);

/** one dua by the corpus reference: Hisnul Muslim {h: chapter, i: index} or fitrahive {f: category, i: index} (mobile duaByRef) */
export async function duaByRef(ref: { h?: unknown; f?: unknown; i?: unknown }, lang: string): Promise<SourceText | null> {
  const i = Number(ref.i);
  if (!Number.isInteger(i) || i < 0) return null;
  if (typeof ref.f === "string") {
    if (!FH_CATS.includes(ref.f)) return null;
    const fl: "en" | "id" = lang === "id" ? "id" : "en";
    const d = (await fhList(ref.f, fl))?.[i];
    if (!d || (!d.arabic && !d.translation)) return null;
    return {
      title: d.title, arabic: d.arabic || undefined, body: [d.latin, d.translation, d.notes].filter(Boolean).join("\n\n"), lang: fl,
      source: `${d.source ? d.source + " – " : ""}fitrahive/dua-dhikr`, sourceUrl: "https://github.com/fitrahive/dua-dhikr",
    };
  }
  const id = Number(ref.h);
  if (!Number.isInteger(id)) return null;
  const hl: "en" | "ar" = lang === "ar" ? "ar" : "en";
  const c = (await hmChapters(hl))?.find((x) => x.id === id);
  if (!c) return null;
  const d = (await hmDuas(hl, id))?.[i];
  if (!d || (!d.ar && !d.tr)) return null;
  const body = [hl === "ar" ? "" : d.tr, d.repeat > 1 ? `(${d.repeat}×)` : ""].filter(Boolean).join("\n\n");
  return {
    title: c.title, arabic: d.ar || undefined, body: body || d.ar, lang: hl,
    source: "Hisnul Muslim (Sa'id al-Qahtani) – hisnmuslim.com", sourceUrl: "https://www.hisnmuslim.com",
  };
}

// ---------- Wikipedia and Wikimedia Commons ----------
// Texts: Wikipedia, CC BY-SA 4.0 (attribution: the article link). Images: only Commons files whose licence is free
// (pilicense=free, then checked again via the file's own extmetadata); the author and licence form the credit line.
// Requests are one at a time per host with a gap, small (max 20 titles / 40 files), carry the Api-User-Agent as
// Wikimedia asks, and the results are cached in process (net.ts), so a page of feed cards costs a handful of requests.
export const WIKI_LICENSE = "CC BY-SA 4.0";
export const WIKI_LICENSE_URL = "https://creativecommons.org/licenses/by-sa/4.0/";
const WIKI_GAP = 150;
const wikiGet = <T,>(url: string) => polite("wikimedia", WIKI_GAP, () => getJson<T>(url, { revalidate: 7 * 86_400 }));

const qs = (p: Record<string, string>) => Object.entries(p).map(([k, v]) => `${k}=${encodeURIComponent(v)}`).join("&");
const api = (host: string, p: Record<string, string>) => `https://${host}/w/api.php?` + qs({ format: "json", formatversion: "2", ...p });

type WikiPage = { title: string; lang: string; extract: string; url: string; imageFile?: string };
type QPage = { title: string; missing?: boolean; extract?: string; pageimage?: string; langlinks?: { lang: string; title: string }[] };
type QRes = { query?: { pages?: QPage[]; redirects?: { from: string; to: string }[]; normalized?: { from: string; to: string }[] } };

async function queryPages(lang: string, titles: string[], withLinks: string | null): Promise<Map<string, QPage>> {
  const p: Record<string, string> = {
    action: "query", titles: titles.join("|"), redirects: "1", prop: "extracts|pageimages" + (withLinks ? "|langlinks" : ""),
    exintro: "1", explaintext: "1", exlimit: "20", piprop: "name", pilicense: "free",
  };
  if (withLinks) { p.lllang = withLinks; p.lllimit = "max"; }
  const j = await wikiGet<QRes>(api(`${lang}.wikipedia.org`, p));
  const alias = new Map<string, string>();
  for (const n of [...(j?.query?.normalized ?? []), ...(j?.query?.redirects ?? [])]) alias.set(n.from, n.to);
  const byTitle = new Map((j?.query?.pages ?? []).filter((x) => !x.missing).map((x) => [x.title, x]));
  const out = new Map<string, QPage>();
  for (const t of titles) {
    let r = t; for (let i = 0; i < 3 && alias.has(r); i++) r = alias.get(r)!;
    const page = byTitle.get(r); if (page) out.set(t, page);
  }
  return out;
}

const pageUrl = (lang: string, title: string) => `https://${lang}.wikipedia.org/wiki/${encodeURIComponent(title.replace(/ /g, "_"))}`;
/** trims an intro to a feed-sized body (whole sentences, ~600 chars) */
function trimText(s: string, max = 600): string {
  const t = s.replace(/\s+/g, " ").replace(/\s*\([^()]*\)/g, (m) => (m.length > 60 ? "" : m)).trim();
  if (t.length <= max) return t;
  const cut = t.slice(0, max); const end = cut.lastIndexOf(". ");
  return end > 200 ? cut.slice(0, end + 1) : cut.replace(/\s+\S*$/, "") + " …";
}

/** English titles -> pages in `lang` (falls back to the English article where that edition has none) */
async function wikiPages(enTitles: string[], lang: string): Promise<Map<string, WikiPage>> {
  const out = new Map<string, WikiPage>();
  const l = /^[a-z-]{2,12}$/.test(lang) ? lang : "en";
  for (let i = 0; i < enTitles.length; i += 20) {
    const batch = enTitles.slice(i, i + 20);
    const en = await queryPages("en", batch, l === "en" ? null : l);
    const local = new Map<string, QPage>();
    if (l !== "en") {
      const want = new Map<string, string>(); // local title -> en title
      for (const [t, p] of en) { const ll = p.langlinks?.find((x) => x.lang === l); if (ll) want.set(ll.title, t); }
      if (want.size) { const got = await queryPages(l, [...want.keys()], null); for (const [lt, p] of got) local.set(want.get(lt)!, p); }
    }
    for (const t of batch) {
      const e = en.get(t); if (!e) continue;
      const lp = local.get(t);
      const use = lp?.extract ? lp : e; const ul = lp?.extract ? l : "en";
      if (!use.extract) continue;
      out.set(t, { title: use.title, lang: ul, extract: trimText(use.extract), url: pageUrl(ul, use.title), imageFile: use.pageimage ?? e.pageimage });
    }
  }
  return out;
}

export type FreeImage = { url: string; credit: string; licenseUrl?: string };
type IIRes = { query?: { pages?: { title: string; missing?: boolean; imageinfo?: { thumburl?: string; descriptionurl?: string; extmetadata?: Record<string, { value: string }> }[] }[]; normalized?: { from: string; to: string }[] } };
const FREE = /^(public domain|pd|cc0|cc[- ]by(-sa)?([- ]\d(\.\d)?)?([- ][a-z]{2,})?)/i;
const strip = (h: string) => h.replace(/<[^>]+>/g, "").replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#0?39;/g, "'").replace(/\s+/g, " ").trim();

/** Commons files -> thumbnail + credit; files not on Commons or without a free licence are left out */
async function commonsImages(files: string[]): Promise<Map<string, FreeImage>> {
  const out = new Map<string, FreeImage>();
  const names = [...new Set(files)];
  for (let i = 0; i < names.length; i += 40) {
    const batch = names.slice(i, i + 40);
    const j = await wikiGet<IIRes>(api("commons.wikimedia.org", { action: "query", titles: batch.map((f) => "File:" + f).join("|"), prop: "imageinfo", iiprop: "url|extmetadata", iiurlwidth: "800", iiextmetadatafilter: "Artist|Credit|LicenseShortName|LicenseUrl|NonFree|Copyrighted" }));
    const norm = new Map((j?.query?.normalized ?? []).map((n) => [n.to, n.from]));
    for (const p of j?.query?.pages ?? []) {
      const ii = p.imageinfo?.[0]; const m = ii?.extmetadata;
      if (p.missing || !ii?.thumburl || !m) continue;
      const lic = strip(m.LicenseShortName?.value ?? "");
      if (m.NonFree?.value || !FREE.test(lic)) continue;
      const artist = strip(m.Artist?.value ?? "") || strip(m.Credit?.value ?? "") || "Unknown author";
      const file = (norm.get(p.title) ?? p.title).replace(/^File:/, "");
      // the API may name the thumbnail host thumb.wikimedia.org (with tracking parameters); both hosts serve the same file and
      // the site's Content-Security-Policy allows upload.wikimedia.org
      const url = ii.thumburl.replace(/^https:\/\/thumb\.wikimedia\.org\//, "https://upload.wikimedia.org/").replace(/\?utm_[^#]*$/, "");
      const img: FreeImage = { url, licenseUrl: m.LicenseUrl?.value, credit: `${artist.slice(0, 120)}, ${lic}, via Wikimedia Commons` };
      out.set(file, img);
      out.set(p.title.replace(/^File:/, ""), img);
    }
  }
  return out;
}

const wl = (lang: string) => (/^[a-z-]{2,12}$/.test(lang) ? lang : "en");
const wikiRuns = new Map<string, Promise<void>>();
/** loads the pages (and free images) of English titles into the process cache, in batches; call once per page of cards */
export function prefetchWiki(enTitles: string[], lang: string): Promise<void> {
  const l = wl(lang);
  const missing = [...new Set(enTitles)].filter((t) => peek(`wp:${l}:${t}`) === undefined).sort();
  if (!missing.length) return Promise.resolve();
  // two requests for the same articles at the same time share one run
  const key = `${l}|${missing.join("|")}`;
  let run = wikiRuns.get(key);
  if (!run) {
    run = loadWiki(missing, l).finally(() => wikiRuns.delete(key));
    wikiRuns.set(key, run);
  }
  return run;
}
async function loadWiki(missing: string[], l: string): Promise<void> {
  let pages: Map<string, WikiPage> | null = null;
  try { pages = await wikiPages(missing, l); } catch { pages = null; }
  for (const t of missing) poke(`wp:${l}:${t}`, pages?.get(t) ?? null, pages ? 2 * DAY : 5 * 60_000);
  if (!pages) return;
  const files = [...pages.values()].map((p) => p.imageFile).filter((f): f is string => !!f && peek(`wi:${f}`) === undefined);
  if (!files.length) return;
  let imgs: Map<string, FreeImage> | null = null;
  try { imgs = await commonsImages(files); } catch { imgs = null; }
  for (const f of new Set(files)) poke(`wi:${f}`, imgs?.get(f) ?? null, imgs ? 2 * DAY : 5 * 60_000);
}

const wikiSource = (lang: string) => (lang === "de" ? "Wikipedia (Autorinnen und Autoren)" : "Wikipedia contributors");
export type WikiCardData = { title: string; body: string; lang: string; source: string; sourceUrl: string; license: string; licenseUrl: string; image?: FreeImage };
/** the Wikipedia article for an English title in `lang` (English where that edition has none), with its free image */
export async function wikiCard(enTitle: string, lang: string): Promise<WikiCardData | null> {
  const l = wl(lang);
  await prefetchWiki([enTitle], l);
  const p = peek<WikiPage>(`wp:${l}:${enTitle}`);
  if (!p) return null;
  const image = p.imageFile ? peek<FreeImage>(`wi:${p.imageFile}`) ?? undefined : undefined;
  return { title: p.title, body: p.extract, lang: p.lang, source: wikiSource(p.lang), sourceUrl: p.url, license: WIKI_LICENSE, licenseUrl: WIKI_LICENSE_URL, ...(image ? { image } : {}) };
}
