import { RECITERS } from "@/lib/quran";
import { VOCAB_DECKS, type Word } from "@/web/vocab";
import { meaning } from "@/web/vocabI18n";
import { ART, HISTORY, MOSQUES, RECITER_ARTICLES, SCHOLARS, SEERAH, WORKS, type CatalogEntry } from "./catalog";
import type { ExtraItem, ExtraKind } from "./types";
import { WIKI_LICENSE, WIKI_LICENSE_URL, cached, claimDate, claimItem, claimYear, commonsImages, getJSON, label, wikiPages, wikidataEntities } from "./wiki";

export const PAGE_SIZE = 6;
const dayIndex = () => Math.floor(Date.now() / 86400000);
const todayMD = () => new Date().toISOString().slice(5, 10);
/** rotates a list by the day, so every day starts somewhere else but paging stays stable within a day */
const rotate = <T,>(a: T[]) => (a.length ? [...a.slice(dayIndex() % a.length), ...a.slice(0, dayIndex() % a.length)] : a);
const slice = <T,>(a: T[], page: number) => (a.length ? a.slice((page * PAGE_SIZE) % a.length, ((page * PAGE_SIZE) % a.length) + PAGE_SIZE) : []);

const wikiSource = (lang: string) => (lang === "de" ? "Wikipedia (Autorinnen und Autoren)" : "Wikipedia contributors");

/** Wikipedia items for a catalog slice, with a free Commons image when the article has one */
async function wikiItems(kind: ExtraKind, entries: CatalogEntry[], lang: string, extra?: (e: CatalogEntry) => Partial<ExtraItem>): Promise<ExtraItem[]> {
  const pages = await wikiPages(entries.map((e) => e.title), lang);
  const imgs = await commonsImages([...pages.values()].map((p) => p.imageFile).filter((f): f is string => !!f)).catch(() => new Map());
  const out: ExtraItem[] = [];
  for (const e of entries) {
    const p = pages.get(e.title); if (!p) continue;
    const img = p.imageFile ? imgs.get(p.imageFile) : undefined;
    out.push({
      id: `${kind}:${p.qid ?? e.title}`, kind, title: p.title, body: p.extract, lang: p.lang,
      ...(img ? { image: img.url, imageCredit: img.credit, imageLicenseUrl: img.licenseUrl } : {}),
      source: wikiSource(p.lang), sourceUrl: p.url, license: WIKI_LICENSE, licenseUrl: WIKI_LICENSE_URL, tradition: e.tradition,
      ...extra?.(e),
    });
  }
  return out;
}

// ---------- "this day" ordering for seerah and history (dates from Wikidata, CC0) ----------
async function datedOrder(name: string, list: CatalogEntry[]): Promise<{ entry: CatalogEntry; date?: string }[]> {
  const dates = await cached(`dates.${name}.v1`, async () => {
    const qids = new Map<string, string>();
    for (let i = 0; i < list.length; i += 50) {
      const j = await getJSON<{ query?: { pages?: { title: string; pageprops?: { wikibase_item?: string } }[]; redirects?: { from: string; to: string }[]; normalized?: { from: string; to: string }[] } }>(
        `https://en.wikipedia.org/w/api.php?format=json&formatversion=2&origin=*&action=query&redirects=1&prop=pageprops&ppprop=wikibase_item&titles=${encodeURIComponent(list.slice(i, i + 50).map((e) => e.title).join("|"))}`);
      const alias = new Map<string, string>([...(j.query?.normalized ?? []), ...(j.query?.redirects ?? [])].map((r) => [r.to, r.from]));
      for (const p of j.query?.pages ?? []) { let t = p.title; for (let k = 0; k < 3 && alias.has(t); k++) t = alias.get(t)!; if (p.pageprops?.wikibase_item) qids.set(t, p.pageprops.wikibase_item); }
    }
    const ents = await wikidataEntities([...qids.values()], [], "claims");
    const res: Record<string, string> = {};
    for (const [t, q] of qids) { const d = claimDate(ents[q], "P585") ?? claimDate(ents[q], "P580") ?? claimDate(ents[q], "P571"); if (d) res[t] = d; }
    return res;
  }).catch(() => ({} as Record<string, string>));
  const md = todayMD();
  const dist = (d?: string) => { if (!d) return 999; const [m, dd] = d.slice(-5).split("-").map(Number); const [tm, td] = md.split("-").map(Number); const a = (m - 1) * 30.5 + dd, b = (tm - 1) * 30.5 + td; const x = (a - b + 366) % 366; return x; };
  const rot = rotate(list);
  // dated entries from today onward first (closest upcoming anniversary first), the undated ones after in daily rotation
  return [...rot].map((entry) => ({ entry, date: dates[entry.title] })).sort((a, b) => dist(a.date) - dist(b.date));
}

async function datedItems(kind: "seerah" | "history", list: CatalogEntry[], lang: string, page: number) {
  const order = await datedOrder(kind, list);
  const part = slice(order, page);
  const md = todayMD();
  const byTitle = new Map(part.map((o) => [o.entry.title, o.date]));
  return wikiItems(kind, part.map((o) => o.entry), lang, (e) => { const d = byTitle.get(e.title); return d ? { date: d, onThisDay: d.slice(-5) === md } : {}; });
}

// ---------- reciters ----------
type RecRef = { folder: string; id: number; title: string };
function reciterRefs(): RecRef[] {
  const seen = new Set<string>(); const out: RecRef[] = [];
  for (const [folder, title] of Object.entries(RECITER_ARTICLES)) {
    if (seen.has(title)) continue; seen.add(title);
    out.push({ folder, title, id: RECITERS.find((r) => r.folder === folder)?.id ?? 0 });
  }
  return out;
}

async function reciterFacts(lang: string, page: number): Promise<ExtraItem[]> {
  const refs = slice(rotate(reciterRefs()), page);
  const pages = await wikiPages(refs.map((r) => r.title), lang);
  const qids = refs.map((r) => pages.get(r.title)?.qid).filter((q): q is string => !!q);
  const ents = await wikidataEntities(qids, [lang], "claims|labels");
  const refQ = qids.flatMap((q) => ["P19", "P27", "P20"].map((p) => claimItem(ents[q], p)).filter((x): x is string => !!x));
  const labels = await wikidataEntities(refQ, [lang], "labels");
  const de = lang === "de";
  const out: ExtraItem[] = [];
  for (const r of refs) {
    const p = pages.get(r.title); const q = p?.qid; const e = q ? ents[q] : undefined; if (!e || !q) continue;
    const born = claimYear(e, "P569"); const died = claimYear(e, "P570");
    const place = label(labels[claimItem(e, "P19") ?? ""], lang); const country = label(labels[claimItem(e, "P27") ?? ""], lang);
    const lines: string[] = [];
    if (born) lines.push(de ? `Geboren ${born}${place ? ` in ${place}` : ""}.` : `Born ${born}${place ? ` in ${place}` : ""}.`);
    else if (place) lines.push(de ? `Geburtsort: ${place}.` : `Born in ${place}.`);
    if (country) lines.push(de ? `Staatsangehörigkeit: ${country}.` : `Citizenship: ${country}.`);
    if (died) lines.push(de ? `Gestorben ${died}.` : `Died ${died}.`);
    if (!lines.length) continue;
    out.push({
      id: `reciter-fact:${q}`, kind: "reciter-fact", title: label(e, lang) ?? p.title, body: lines.join(" "), lang: e.labels?.[lang] ? lang : "en",
      source: "Wikidata", sourceUrl: `https://www.wikidata.org/wiki/${q}`, license: "CC0 1.0", licenseUrl: "https://creativecommons.org/publicdomain/zero/1.0/",
      tradition: "all", reciterFolder: r.folder, reciterId: r.id,
    });
  }
  return out;
}

async function reciterBios(lang: string, page: number): Promise<ExtraItem[]> {
  const refs = slice(rotate(reciterRefs()), page);
  const by = new Map(refs.map((r) => [r.title, r]));
  return wikiItems("reciter-bio", refs.map((r) => ({ title: r.title, tradition: "all" })), lang, (e) => ({ reciterFolder: by.get(e.title)!.folder, reciterId: by.get(e.title)!.id }));
}

// ---------- scholar timeline (Wikidata, CC0): all scholars sorted by birth (or death) year ----------
type Person = { title: string; qid: string; tradition: CatalogEntry["tradition"]; born?: number; died?: number; birthPlace?: string; deathPlace?: string };
async function scholarTimeline(lang: string, page: number): Promise<ExtraItem[]> {
  const people = await cached(`timeline.${lang}.v1`, async () => {
    const qids = new Map<string, string>();
    for (let i = 0; i < SCHOLARS.length; i += 50) {
      const j = await getJSON<{ query?: { pages?: { title: string; pageprops?: { wikibase_item?: string } }[]; redirects?: { from: string; to: string }[]; normalized?: { from: string; to: string }[] } }>(
        `https://en.wikipedia.org/w/api.php?format=json&formatversion=2&origin=*&action=query&redirects=1&prop=pageprops&ppprop=wikibase_item&titles=${encodeURIComponent(SCHOLARS.slice(i, i + 50).map((e) => e.title).join("|"))}`);
      const alias = new Map<string, string>([...(j.query?.normalized ?? []), ...(j.query?.redirects ?? [])].map((r) => [r.to, r.from]));
      for (const p of j.query?.pages ?? []) { let t = p.title; for (let k = 0; k < 3 && alias.has(t); k++) t = alias.get(t)!; if (p.pageprops?.wikibase_item) qids.set(t, p.pageprops.wikibase_item); }
    }
    const ents = await wikidataEntities([...qids.values()], [lang], "claims|labels");
    const places = await wikidataEntities([...qids.values()].flatMap((q) => [claimItem(ents[q], "P19"), claimItem(ents[q], "P20")]).filter((x): x is string => !!x), [lang], "labels");
    const out: Person[] = [];
    for (const e of SCHOLARS) {
      const q = qids.get(e.title); const en = q ? ents[q] : undefined; if (!q || !en) continue;
      const born = claimYear(en, "P569"), died = claimYear(en, "P570"); if (born == null && died == null) continue;
      out.push({ title: label(en, lang) ?? e.title, qid: q, tradition: e.tradition, born, died, birthPlace: label(places[claimItem(en, "P19") ?? ""], lang), deathPlace: label(places[claimItem(en, "P20") ?? ""], lang) });
    }
    return out.sort((a, b) => (a.born ?? (a.died ?? 0) - 60) - (b.born ?? (b.died ?? 0) - 60));
  }).catch(() => [] as Person[]);
  const de = lang === "de";
  return slice(people, page).map((p) => ({
    id: `scholar-timeline:${p.qid}`, kind: "scholar-timeline" as const, lang: de || lang === "en" ? lang : "en",
    title: `${p.title} (${p.born ?? "?"}–${p.died ?? ""})`,
    body: [
      p.born != null && (de ? `Geboren ${p.born}${p.birthPlace ? ` in ${p.birthPlace}` : ""}.` : `Born ${p.born}${p.birthPlace ? ` in ${p.birthPlace}` : ""}.`),
      p.died != null && (de ? `Gestorben ${p.died}${p.deathPlace ? ` in ${p.deathPlace}` : ""}.` : `Died ${p.died}${p.deathPlace ? ` in ${p.deathPlace}` : ""}.`),
    ].filter(Boolean).join(" "),
    source: "Wikidata", sourceUrl: `https://www.wikidata.org/wiki/${p.qid}`, license: "CC0 1.0", licenseUrl: "https://creativecommons.org/publicdomain/zero/1.0/", tradition: p.tradition,
  }));
}

// ---------- The Met, Islamic Art department (Open Access: only isPublicDomain objects, CC0) ----------
const MET = "https://collectionapi.metmuseum.org/public/collection/v1";
const MET_QUERIES = ["calligraphy", "Quran manuscript page", "tile", "mosque lamp", "astrolabe", "carpet", "ceramic", "metalwork", "manuscript illumination", "textile"];
type MetObj = { objectID: number; isPublicDomain: boolean; primaryImageSmall?: string; title: string; objectDate?: string; culture?: string; medium?: string; dynasty?: string; period?: string; country?: string; city?: string; objectURL?: string; artistDisplayName?: string };
async function metItems(lang: string, page: number): Promise<ExtraItem[]> {
  const q = MET_QUERIES[(dayIndex() + Math.floor(page / 4)) % MET_QUERIES.length];
  const offset = (page % 4) * PAGE_SIZE * 2;
  const ids = await cached(`met.${q}.${offset}`, async () =>
    (await getJSON<{ objectIDs?: number[] }>(`${MET}.1/search?departmentId=14&hasImages=true&q=${encodeURIComponent(q)}&offset=${offset}&limit=${PAGE_SIZE * 2}`)).objectIDs ?? []);
  const de = lang === "de"; const out: ExtraItem[] = [];
  for (const id of ids) {
    if (out.length >= PAGE_SIZE) break;
    const o = await cached(`met.obj.${id}`, () => getJSON<MetObj>(`${MET}/objects/${id}`)).catch(() => null);
    if (!o?.isPublicDomain || !o.primaryImageSmall) continue; // only CC0 objects with an image
    const parts = [
      o.objectDate && `${de ? "Datierung" : "Date"}: ${o.objectDate}`,
      (o.dynasty || o.period) && `${de ? "Epoche" : "Period"}: ${[o.dynasty, o.period].filter(Boolean).join(", ")}`,
      (o.city || o.country || o.culture) && `${de ? "Herkunft" : "Origin"}: ${[o.city, o.country, o.culture].filter(Boolean).join(", ")}`,
      o.artistDisplayName && `${de ? "Künstler" : "Artist"}: ${o.artistDisplayName}`,
      o.medium && `${de ? "Material" : "Medium"}: ${o.medium}`,
    ].filter(Boolean);
    out.push({
      id: `met:${o.objectID}`, kind: "met-art", title: o.title, body: parts.join("\n"), lang: "en",
      image: o.primaryImageSmall, imageCredit: "The Metropolitan Museum of Art, CC0", imageLicenseUrl: "https://creativecommons.org/publicdomain/zero/1.0/",
      source: "The Metropolitan Museum of Art", sourceUrl: o.objectURL ?? `https://www.metmuseum.org/art/collection/search/${o.objectID}`,
      license: "CC0 1.0", licenseUrl: "https://creativecommons.org/publicdomain/zero/1.0/", tradition: "all",
    });
  }
  return out;
}

// ---------- Arabic word and root of the day (the app's own vocabulary) ----------
function wordItems(lang: string, page: number): ExtraItem[] {
  const words: Word[] = VOCAB_DECKS.flatMap((d) => d.words).filter((w) => w.root);
  const de = lang === "de";
  return slice(rotate(words), page).map((w) => {
    const sameRoot = words.filter((x) => x.root === w.root && x.id !== w.id).slice(0, 4).map((x) => `${x.ar} (${meaning(x, lang)})`);
    return {
      id: `word:${w.id}`, kind: "arabic-word" as const, title: `${w.ar} · ${w.tr}`, lang: de || lang === "en" ? lang : "en",
      body: [meaning(w, lang), `${de ? "Wurzel" : "Root"}: ${w.root}`, sameRoot.length ? `${de ? "Gleiche Wurzel" : "Same root"}: ${sameRoot.join(", ")}` : ""].filter(Boolean).join("\n"),
      source: "Quran Masterclass", sourceUrl: "https://quranmasterclass.com", license: "© Quran Masterclass", tradition: "all" as const,
    };
  });
}

export async function loadKind(kind: ExtraKind, lang: string, page: number): Promise<ExtraItem[]> {
  switch (kind) {
    case "arabic-word": return wordItems(lang, page);
    case "met-art": return metItems(lang, page);
    case "reciter-fact": return cached(`v1.${kind}.${lang}.${page % 50}.${dayIndex()}`, () => reciterFacts(lang, page));
    case "reciter-bio": return cached(`v1.${kind}.${lang}.${page % 50}.${dayIndex()}`, () => reciterBios(lang, page));
    case "seerah": return cached(`v1.${kind}.${lang}.${page % 50}.${dayIndex()}`, () => datedItems("seerah", SEERAH, lang, page));
    case "history": return cached(`v1.${kind}.${lang}.${page % 50}.${dayIndex()}`, () => datedItems("history", HISTORY, lang, page));
    case "mosque": return cached(`v1.${kind}.${lang}.${page % 50}.${dayIndex()}`, () => wikiItems(kind, slice(rotate(MOSQUES), page), lang));
    case "art": return cached(`v1.${kind}.${lang}.${page % 50}.${dayIndex()}`, () => wikiItems(kind, slice(rotate(ART), page), lang));
    case "scholar-bio": return cached(`v1.${kind}.${lang}.${page % 50}.${dayIndex()}`, () => wikiItems(kind, slice(rotate(SCHOLARS), page), lang));
    case "scholar-work": return cached(`v1.${kind}.${lang}.${page % 50}.${dayIndex()}`, () => wikiItems(kind, slice(rotate(WORKS), page), lang));
    case "scholar-timeline": return scholarTimeline(lang, page);
  }
}
