// mirrors mobile/src/content/extra/wiki.ts (copied for the website; keep both in step)
// Wikipedia / Wikidata / Wikimedia Commons access. Texts: Wikipedia, CC BY-SA 4.0 (attribution: article link).
// Data: Wikidata, CC0. Images: only Commons files whose license is free (pilicense=free, then checked again via the
// file's own extmetadata); the author and license are returned for the credit line. Requests are sequential and small
// (max 20 titles), carry an Api-User-Agent as Wikimedia asks, and the results are cached (memory + store, 7 days).
import { readJSON, writeJSON } from "@/lib/learn/store";

const UA = "QuranMasterclass/1.0 (https://quranmasterclass.com; contact@namishams.com)";
const TTL = 7 * 24 * 3600 * 1000;
export const WIKI_LICENSE = "CC BY-SA 4.0";
export const WIKI_LICENSE_URL = "https://creativecommons.org/licenses/by-sa/4.0/";

const mem = new Map<string, unknown>();
export async function cached<T>(key: string, load: () => Promise<T>): Promise<T> {
  const k = "qmc.extra." + key;
  if (mem.has(k)) return mem.get(k) as T;
  const hit = readJSON<{ t: number; v: T } | null>(k, null);
  if (hit && Date.now() - hit.t < TTL) { mem.set(k, hit.v); return hit.v; }
  try {
    const v = await load();
    mem.set(k, v);
    writeJSON(k, { t: Date.now(), v }, true);
    return v;
  } catch (e) {
    if (hit) return hit.v; // stale is better than nothing offline
    throw e;
  }
}

let last = 0;
export async function getJSON<T>(url: string): Promise<T> {
  const wait = last + 200 - Date.now(); // at most ~5 requests per second, well inside Wikimedia's limits
  if (wait > 0) await new Promise((r) => setTimeout(r, wait));
  last = Date.now();
  const res = await fetch(url, { headers: { "Api-User-Agent": UA, "User-Agent": UA, Accept: "application/json" } });
  if (!res.ok) throw new Error(`${res.status} ${url}`);
  return (await res.json()) as T;
}

const qs = (p: Record<string, string>) => Object.entries(p).map(([k, v]) => `${k}=${encodeURIComponent(v)}`).join("&");
const api = (host: string, p: Record<string, string>) => `https://${host}/w/api.php?` + qs({ format: "json", formatversion: "2", origin: "*", ...p });

export type WikiPage = { title: string; lang: string; extract: string; url: string; qid?: string; imageFile?: string };

type QPage = { title: string; missing?: boolean; extract?: string; pageimage?: string; pageprops?: { wikibase_item?: string }; langlinks?: { lang: string; title: string }[] };
type QRes = { query?: { pages?: QPage[]; redirects?: { from: string; to: string }[]; normalized?: { from: string; to: string }[] } };

async function queryPages(lang: string, titles: string[], withLinks: string | null): Promise<Map<string, QPage>> {
  const p: Record<string, string> = {
    action: "query", titles: titles.join("|"), redirects: "1", prop: "extracts|pageimages|pageprops" + (withLinks ? "|langlinks" : ""),
    exintro: "1", explaintext: "1", exlimit: "20", piprop: "name", pilicense: "free", ppprop: "wikibase_item",
  };
  if (withLinks) { p.lllang = withLinks; p.lllimit = "max"; }
  const j = await getJSON<QRes>(api(`${lang}.wikipedia.org`, p));
  const alias = new Map<string, string>();
  for (const n of [...(j.query?.normalized ?? []), ...(j.query?.redirects ?? [])]) alias.set(n.from, n.to);
  const byTitle = new Map((j.query?.pages ?? []).filter((x) => !x.missing).map((x) => [x.title, x]));
  const out = new Map<string, QPage>();
  for (const t of titles) {
    let r = t; for (let i = 0; i < 3 && alias.has(r); i++) r = alias.get(r)!;
    const page = byTitle.get(r); if (page) out.set(t, page);
  }
  return out;
}

const pageUrl = (lang: string, title: string) => `https://${lang}.wikipedia.org/wiki/${encodeURIComponent(title.replace(/ /g, "_"))}`;
/** trims an intro to a feed-sized body (whole sentences, ~600 chars) */
export function trimText(s: string, max = 600): string {
  const t = s.replace(/\s+/g, " ").replace(/\s*\([^()]*\)/g, (m) => (m.length > 60 ? "" : m)).trim();
  if (t.length <= max) return t;
  const cut = t.slice(0, max); const end = cut.lastIndexOf(". ");
  return end > 200 ? cut.slice(0, end + 1) : cut.replace(/\s+\S*$/, "") + " …";
}

/** English titles -> pages in `lang` (falls back to the English article where that edition has none) */
export async function wikiPages(enTitles: string[], lang: string): Promise<Map<string, WikiPage>> {
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
      out.set(t, { title: use.title, lang: ul, extract: trimText(use.extract), url: pageUrl(ul, use.title), qid: e.pageprops?.wikibase_item, imageFile: use.pageimage ?? e.pageimage });
    }
  }
  return out;
}

export type FreeImage = { url: string; credit: string; license: string; licenseUrl?: string; page: string };
type IIRes = { query?: { pages?: { title: string; missing?: boolean; imageinfo?: { thumburl?: string; descriptionurl?: string; extmetadata?: Record<string, { value: string }> }[] }[]; normalized?: { from: string; to: string }[] } };
const FREE = /^(public domain|pd|cc0|cc[- ]by(-sa)?([- ]\d(\.\d)?)?([- ][a-z]{2,})?)/i;
const strip = (h: string) => h.replace(/<[^>]+>/g, "").replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#0?39;/g, "'").replace(/\s+/g, " ").trim();

/** Commons files -> thumbnail + credit; files not on Commons or without a free license are left out */
export async function commonsImages(files: string[]): Promise<Map<string, FreeImage>> {
  const out = new Map<string, FreeImage>();
  const names = [...new Set(files)];
  for (let i = 0; i < names.length; i += 40) {
    const batch = names.slice(i, i + 40);
    const j = await getJSON<IIRes>(api("commons.wikimedia.org", { action: "query", titles: batch.map((f) => "File:" + f).join("|"), prop: "imageinfo", iiprop: "url|extmetadata", iiurlwidth: "800", iiextmetadatafilter: "Artist|Credit|LicenseShortName|LicenseUrl|NonFree|Copyrighted" }));
    const norm = new Map((j.query?.normalized ?? []).map((n) => [n.to, n.from]));
    for (const p of j.query?.pages ?? []) {
      const ii = p.imageinfo?.[0]; const m = ii?.extmetadata;
      if (p.missing || !ii?.thumburl || !m) continue;
      const lic = strip(m.LicenseShortName?.value ?? "");
      if (m.NonFree?.value || !FREE.test(lic)) continue;
      const artist = strip(m.Artist?.value ?? "") || strip(m.Credit?.value ?? "") || "Unknown author";
      const file = (norm.get(p.title) ?? p.title).replace(/^File:/, "");
      out.set(file, { url: ii.thumburl, license: lic, licenseUrl: m.LicenseUrl?.value, credit: `${artist.slice(0, 120)}, ${lic}, via Wikimedia Commons`, page: ii.descriptionurl ?? "" });
      out.set(p.title.replace(/^File:/, ""), out.get(file)!);
    }
  }
  return out;
}

// ---- Wikidata (CC0) ----
type Claim = { mainsnak?: { datavalue?: { value: unknown } } };
type Entity = { claims?: Record<string, Claim[]>; labels?: Record<string, { value: string }> };
export async function wikidataEntities(ids: string[], langs: string[], props: "claims" | "labels" | "claims|labels"): Promise<Record<string, Entity>> {
  const out: Record<string, Entity> = {};
  const uniq = [...new Set(ids)].filter((x) => /^Q\d+$/.test(x));
  for (let i = 0; i < uniq.length; i += 50) {
    const j = await getJSON<{ entities?: Record<string, Entity> }>(api("www.wikidata.org", { action: "wbgetentities", ids: uniq.slice(i, i + 50).join("|"), props, languages: [...new Set([...langs, "en"])].join("|") }));
    Object.assign(out, j.entities ?? {});
  }
  return out;
}
/** first time value of a property as YYYY-MM-DD (day precision only) */
export function claimDate(e: Entity | undefined, prop: string): string | undefined {
  const v = e?.claims?.[prop]?.[0]?.mainsnak?.datavalue?.value as { time?: string; precision?: number } | undefined;
  if (!v?.time || (v.precision ?? 0) < 11) return undefined;
  const m = /^\+?(-?\d+)-(\d\d)-(\d\d)/.exec(v.time); return m ? `${m[1].padStart(4, "0")}-${m[2]}-${m[3]}` : undefined;
}
export function claimYear(e: Entity | undefined, prop: string): number | undefined {
  const v = e?.claims?.[prop]?.[0]?.mainsnak?.datavalue?.value as { time?: string; precision?: number } | undefined;
  const m = v?.time && (v.precision ?? 0) >= 9 ? /^\+?(-?\d+)-/.exec(v.time) : null; return m ? Number(m[1]) : undefined;
}
export function claimItem(e: Entity | undefined, prop: string): string | undefined {
  const v = e?.claims?.[prop]?.[0]?.mainsnak?.datavalue?.value as { id?: string } | undefined; return v?.id;
}
export const label = (e: Entity | undefined, lang: string) => e?.labels?.[lang]?.value ?? e?.labels?.en?.value;
