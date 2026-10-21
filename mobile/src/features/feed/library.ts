import { kindsFor, sourceFeedItems, type SourceItem, type SourceKind } from "@/content/sources";
import { EXTRA_KINDS, extraFeedItems, type ExtraItem, type ExtraKind } from "@/content/extra";
import { readTradition } from "@/lib/tradition";
import { rand } from "./source";
import { markSeen, wasSeen } from "./seen";
/** articles that appear in several kinds: one post per source URL within the 7-day seen window */
const servedUrls = new Set<string>();
const urlSeen = (u: string) => !!u && (servedUrls.has(u) || wasSeen(`u:${u}`));
import { interestOf, takeBoredom } from "./interest";
import { fetchFeedNew, fetchFeedPage, flagOn, remoteConfig, resolveAll } from "./remote";

// The weighted scheduler of the content libraries (src/content/sources and src/content/extra) for Home, Reels and
// Explore. Items become feed ids "x:<item id>" (one post) or "xc:<first id>" (a carousel of 3–5 items of the
// scholar timeline or the seerah). Variety: never the same kind twice in a row, at most two of a kind within six
// posts, kinds not shown yet in this session are boosted; each kind prefetches its next page when its queue runs low.

export type LibKind = SourceKind | ExtraKind;
export type LibItem = (SourceItem | ExtraItem) & { kind: LibKind };
export type LibPost = { id: string; kind: LibKind; items: LibItem[] };
export type LibTopic = "tafsir" | "hadith" | "duas" | "prayer" | "holy" | "seerah" | "scholars" | "history" | "art" | "quran";
export const LIB_TOPICS: LibTopic[] = ["tafsir", "hadith", "duas", "prayer", "holy", "seerah", "quran", "scholars", "history", "art"];

/** the known kinds per topic; any other kind (new EXTRA_KINDS) is placed by its name in topicOfKind */
const TOPIC_KINDS: Record<LibTopic, string[]> = {
  tafsir: ["tafsir", "surah-info", "word-root", "word-of-day"],
  hadith: ["hadith", "hadith-of-day", "shia-hadith"],
  duas: ["dua", "asma", "phrases", "akhlaq"],
  prayer: ["salah", "pillars", "pillars-hajj", "islamic-months"],
  holy: ["mosque", "holy-places", "saudi-heritage"],
  seerah: ["seerah", "prophets", "prophet-family", "battles"],
  quran: ["quran-facts", "angels-unseen", "arabic-word"],
  scholars: ["scholar-bio", "scholar-work", "scholar-timeline", "reciter-bio", "reciter-fact", "women"],
  history: ["history", "islamic-date", "islam-country", "spread", "golden-age", "traditions", "islamic-finance", "halal-culture"],
  art: ["art", "met-art", "calligraphy-style", "architecture-style"],
};
const CAROUSEL = new Set<LibKind>(["scholar-timeline", "seerah"]);
const WEIGHT: Partial<Record<LibKind, number>> = { "hadith-of-day": 3, "islamic-date": 2, "word-of-day": 2, dua: 1.6, tafsir: 1.4, hadith: 1.4, mosque: 1.3, art: 1.2, "met-art": 1.2 };
const isExtra = (k: LibKind): k is ExtraKind => (EXTRA_KINDS as readonly string[]).includes(k);

/** every post by its feed id */
export const LIB = new Map<string, LibPost>();
export const isLibId = (id: string) => id.startsWith("x:") || id.startsWith("xc:");

type Q = { items: LibItem[]; page: number; loading: boolean; empty: number; retryAt: number };
const queues = new Map<string, Q>();
const listeners = new Set<() => void>();
export const onLibData = (f: () => void) => { listeners.add(f); return () => { listeners.delete(f); }; };

function tradition() {
  try { const t = readTradition(); return t === "sunni" || t === "shia" ? t : "all"; } catch { return "all" as const; }
}
/** the topic of any kind; new extra kinds (src/content/extra EXTRA_KINDS) plug in automatically by their name */
export function topicOfKind(kind: string): LibTopic {
  for (const g of remoteConfig()?.topicChipGroups ?? []) if ((LIB_TOPICS as string[]).includes(g.id) && g.kinds.includes(kind)) return g.id as LibTopic;
  for (const t of LIB_TOPICS) if (TOPIC_KINDS[t].includes(kind)) return t;
  if (/callig|architect|art/.test(kind)) return "art";
  if (/mosque|holy|heritage|makkah|madinah/.test(kind)) return "holy";
  if (/salah|prayer|pillar|hajj|fast|zakat/.test(kind)) return "prayer";
  if (/seerah|prophet|battle|sahab|companion/.test(kind)) return "seerah";
  if (/scholar|reciter|women|imam/.test(kind)) return "scholars";
  if (/quran|surah|angel|unseen|arabic/.test(kind)) return "quran";
  if (/dua|dhikr|phrase|akhlaq/.test(kind)) return "duas";
  if (/hadith/.test(kind)) return "hadith";
  return "history";
}
/** posts drawn as an image (format rotation and boredom switch) */
const IMAGE_KINDS = new Set<string>(["mosque", "holy-places", "saudi-heritage", "art", "met-art", "calligraphy-style", "architecture-style"]);
export function kindsOf(topic: LibTopic | "all"): LibKind[] {
  const allowed = new Set<LibKind>([...kindsFor(tradition()), ...EXTRA_KINDS]);
  const all = [...new Set<LibKind>([...(LIB_TOPICS.flatMap((t) => TOPIC_KINDS[t]) as LibKind[]), ...EXTRA_KINDS])];
  const list = topic === "all" ? all : all.filter((k) => topicOfKind(k) === topic);
  return list.filter((k) => allowed.has(k) && remoteEnabled(k));
}
/** remote enabledKinds is an allowlist over the kinds the server knows (named in its weights or chip groups);
 *  kinds it does not know (new local libraries) stay on, and without a config everything is on */
function remoteEnabled(k: string) {
  const c = remoteConfig();
  if (!c?.enabledKinds?.length) return true;
  const known = new Set([...Object.keys(c.kindWeights ?? {}), ...(c.topicChipGroups ?? []).flatMap((g) => g.kinds)]);
  return !known.has(k) || c.enabledKinds.includes(k);
}
const weightOf = (k: string) => remoteConfig()?.kindWeights?.[k] ?? WEIGHT[k as LibKind] ?? 1;

// ---- the server as one more source (website /api/feed): /new and /page items, resolved to library items ----
// They join the pool; they never replace the local libraries. De-duplicated by server id.
const remoteState = { lang: "", items: [] as LibItem[], cursor: null as string | null, done: false, loading: false, known: new Set<string>(), retryAt: 0 };
function remoteFor(lang: string) {
  if (remoteState.lang !== lang) Object.assign(remoteState, { lang, items: [], cursor: null, done: false, loading: false, known: new Set<string>(), retryAt: 0 });
  return remoteState;
}
function fetchRemotePage(lang: string) {
  const r = remoteFor(lang);
  if (r.loading || r.done || r.items.length >= 4 || Date.now() < r.retryAt || !flagOn("serverPage")) return;
  r.loading = true;
  void fetchFeedPage(lang, r.cursor).then(async (p) => {
    if (!p) { r.retryAt = Date.now() + 60000; return; }
    r.cursor = p.nextCursor; r.done = !p.nextCursor;
    const got = (await resolveAll(p.items, lang, r.known)).filter((i) => !wasSeen(`x:${i.id}`));
    if (remoteState !== r || r.lang !== lang) return;
    r.items.push(...got);
    if (got.length) listeners.forEach((f) => f()); else if (!r.done) setTimeout(() => fetchRemotePage(lang), 0);
  }).catch(() => { r.retryAt = Date.now() + 60000; }).finally(() => { r.loading = false; });
}
/** /new: resolves the newest server items and returns their feed ids (registered as posts); unseen ones first */
export async function takeRemoteNew(lang: string, since?: string): Promise<string[]> {
  const res = await fetchFeedNew(lang, since);
  if (!res) return [];
  const got = await resolveAll(res.items, lang, remoteFor(lang).known);
  const ids = got.map((i) => { const id = `x:${i.id}`; LIB.set(id, { id, kind: i.kind, items: [i] }); return id; });
  return [...ids.filter((id) => !wasSeen(id)), ...ids.filter((id) => wasSeen(id))];
}

// Endless: the sources page through their catalogs and wrap around; items not seen in the last 7 days come first, and
// when a small pool is fully seen it is served again (reshuffled) rather than running dry. Empty answers (offline)
// back off and are retried, so a kind never stops for good.
function fetchKind(kind: LibKind, lang: string) {
  const key = `${lang}|${kind}`;
  let q = queues.get(key);
  if (!q) { q = { items: [], page: 0, loading: false, empty: 0, retryAt: 0 }; queues.set(key, q); }
  if (q.loading || q.items.length >= 4 || Date.now() < q.retryAt) return;
  q.loading = true;
  const cur = q;
  const p = cur.page++;
  const load: Promise<LibItem[]> = isExtra(kind) ? extraFeedItems(kind, lang, p) as Promise<LibItem[]> : sourceFeedItems(kind, lang, p, { tradition: tradition() }) as Promise<LibItem[]>;
  void load.then((got) => {
    if (!got.length) {
      cur.empty++;
      // a source with few pages answers [] past its end: start again at page 0; offline: wait a little longer each time
      if (cur.empty >= 2) { cur.page = 0; cur.retryAt = Date.now() + Math.min(300000, 15000 * cur.empty); }
      return;
    }
    cur.empty = 0;
    const known = new Set(cur.items.map((i) => i.id));
    const got2 = got.filter((i) => !known.has(i.id));
    const unseen = got2.filter((i) => !urlSeen(i.sourceUrl) && !wasSeen(`x:${i.id}`) && !wasSeen(`xc:${i.id}`) && !LIB.has(`x:${i.id}`) && !LIB.has(`xc:${i.id}`));
    // the pool allows no unseen item on this page: after a few pages serve it again in a new order
    const add = unseen.length ? unseen : p >= 4 ? shuffleSeeded(got2.filter((i) => !servedUrls.has(i.sourceUrl))) : [];
    cur.items.push(...add);
    if (add.length) listeners.forEach((f) => f());
    else setTimeout(() => fetchKind(kind, lang), 0);
  }).catch(() => { cur.retryAt = Date.now() + 30000; }).finally(() => { cur.loading = false; });
}
function shuffleSeeded<T>(a: T[]): T[] {
  const out = [...a];
  for (let i = out.length - 1; i > 0; i--) { const j = Math.floor(rand() * (i + 1)); [out[i], out[j]] = [out[j], out[i]]; }
  return out;
}

/** start loading the kinds of a topic (call on mount / topic change) */
export function warmLibrary(topic: LibTopic | "all", lang: string) {
  for (const k of kindsOf(topic)) fetchKind(k, lang);
}

/** a scheduler per feed (Home, Reels, Explore): remembers the recent kinds for the variety rule */
export class LibScheduler {
  private recent: LibKind[] = [];
  private shown = new Set<LibKind>();
  private seenCount = new Map<LibKind, number>();
  private count = 0;
  private lastText = false;
  private boredNow = false;
  /** the reader skipped several posts fast: the next post is a different format */
  bored() { this.boredNow = true; }
  constructor(private lang: string, private topic: LibTopic | "all") { warmLibrary(topic, lang); }

  /** up to `n` posts that are ready now (may be fewer while pages load) */
  take(n: number): string[] {
    const out: string[] = [];
    for (let i = 0; i < n; i++) { const id = this.one(); if (!id) break; out.push(id); }
    return out;
  }

  private one(): string | null {
    // the server's items: with the weight of "editorial" against the local kinds, when they fit the topic
    fetchRemotePage(this.lang);
    const r = remoteFor(this.lang);
    const ri = r.items.findIndex((i) => this.topic === "all" || topicOfKind(i.kind) === this.topic);
    if (ri >= 0 && rand() < Math.min(0.5, weightOf("editorial") / 12)) {
      const [it] = r.items.splice(ri, 1);
      const id = `x:${it.id}`;
      LIB.set(id, { id, kind: it.kind, items: [it] });
      this.recent.push(it.kind);
      return id;
    }
    const kinds = kindsOf(this.topic);
    kinds.forEach((k) => fetchKind(k, this.lang));
    const last6 = this.recent.slice(-6);
    const ready = kinds.filter((k) => (queues.get(`${this.lang}|${k}`)?.items.length ?? 0) >= (CAROUSEL.has(k) ? 3 : 1));
    // the variety rule; when only one kind is loaded (a single-kind topic) it may repeat
    let pool = ready.filter((k) => k !== this.recent[this.recent.length - 1] && last6.filter((x) => x === k).length < 2);
    if (!pool.length && ready.length && new Set(kinds).size <= 2) pool = ready;
    if (!pool.length) return null;
    // personal interest × base weight, mixed with 15 % uniform exploration; every ~8th post a surprise (a kind seen
    // rarely); after fast skips (boredom) or after a text card: an image post when one is ready (format rotation)
    this.count++;
    const imgs = pool.filter((k) => IMAGE_KINDS.has(k));
    let kind: LibKind;
    const b = takeBoredom() || this.boredNow;
    if ((b || this.lastText) && imgs.length && (b || rand() < 0.6)) {
      kind = imgs[Math.floor(rand() * imgs.length)];
    } else if (this.count % 8 === 0) {
      kind = [...pool].sort((a, b) => (this.seenCount.get(a) ?? 0) * interestOf(a) - (this.seenCount.get(b) ?? 0) * interestOf(b))[0];
    } else {
      const raw = pool.map((k) => weightOf(k) * interestOf(k) * (this.shown.has(k) ? 1 : 2.5));
      const sum = raw.reduce((a, b) => a + b, 0);
      const w = raw.map((r) => 0.85 * (r / sum) + 0.15 / pool.length);
      let x = rand();
      kind = pool[pool.length - 1];
      for (let i = 0; i < pool.length; i++) { x -= w[i]; if (x <= 0) { kind = pool[i]; break; } }
    }
    this.boredNow = false;
    this.lastText = !IMAGE_KINDS.has(kind);
    this.seenCount.set(kind, (this.seenCount.get(kind) ?? 0) + 1);
    const q = queues.get(`${this.lang}|${kind}`)!;
    // duas: the one for this time of day first
    if (kind === "dua") {
      const h = new Date().getHours();
      const slot = h < 11 ? "morning" : h >= 21 ? "sleep" : h >= 16 ? "evening" : "any";
      const at = q.items.findIndex((i) => (i as SourceItem).timeOfDay === slot);
      if (at > 0) q.items.unshift(...q.items.splice(at, 1));
    }
    // history and seerah: "on this day" first
    if (kind === "history" || kind === "seerah") {
      const at = q.items.findIndex((i) => (i as ExtraItem).onThisDay);
      if (at > 0) q.items.unshift(...q.items.splice(at, 1));
    }
    const items = CAROUSEL.has(kind) ? q.items.splice(0, Math.min(5, q.items.length)) : q.items.splice(0, 1);
    if (q.items.length < 3) fetchKind(kind, this.lang);
    this.recent.push(kind);
    if (this.recent.length > 12) this.recent.shift();
    this.shown.add(kind);
    for (const i of items) if (i.sourceUrl && !/^https?:\/\/(www\.)?quranmasterclass/.test(i.sourceUrl) && i.sourceUrl.split("/").length > 4) { servedUrls.add(i.sourceUrl); markSeen(`u:${i.sourceUrl}`); }
    const id = `${items.length > 1 ? "xc" : "x"}:${items[0].id}`;
    LIB.set(id, { id, kind, items });
    return id;
  }
}
