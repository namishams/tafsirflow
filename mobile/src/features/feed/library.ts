import { kindsFor, sourceFeedItems, type SourceItem, type SourceKind } from "@/content/sources";
import { EXTRA_KINDS, extraFeedItems, type ExtraItem, type ExtraKind } from "@/content/extra";
import { readTradition } from "@/lib/tradition";
import { rand } from "./source";
import { markSeen, wasSeen } from "./seen";
/** articles that appear in several kinds: one post per source URL within the 7-day seen window */
const servedUrls = new Set<string>();
const urlSeen = (u: string) => !!u && (servedUrls.has(u) || wasSeen(`u:${u}`));
import { interestOf, takeBoredom } from "./interest";
import { fetchCorpusPage, fetchFeedNew, flagOn, remoteConfig, resolveAll, saveCorpusCursor, savedCorpusCursor, type RemotePost } from "./remote";
import { KNOW_KINDS, isKnowKind, knowVisible, type KnowKind, type KnowSubject } from "./knowKinds";
import type { KnowItem } from "./knowledge";
/** the knowledge builders load on first use (they import courses and the Madrasa, which import gamify.ts) */
// eslint-disable-next-line @typescript-eslint/no-require-imports
const knowledge = () => require("./knowledge") as typeof import("./knowledge");
import { knowText } from "./knowTexts";

// The weighted scheduler of the content libraries (src/content/sources and src/content/extra) for Home, Reels and
// Explore. Items become feed ids "x:<item id>" (one post) or "xc:<first id>" (a carousel of 3–5 items of the
// scholar timeline or the seerah). Variety: never the same kind twice in a row, at most two of a kind within six
// posts, kinds not shown yet in this session are boosted; each kind prefetches its next page when its queue runs low.

export type LibKind = SourceKind | ExtraKind | KnowKind;
export type LibItem = (SourceItem | ExtraItem | KnowItem) & { kind: LibKind };
export type LibPost = { id: string; kind: LibKind; items: LibItem[] };
export type LibTopic = "tafsir" | "hadith" | "duas" | "prayer" | "holy" | "seerah" | "scholars" | "history" | "art" | "quran";
export const LIB_TOPICS: LibTopic[] = ["tafsir", "hadith", "duas", "prayer", "holy", "seerah", "quran", "scholars", "history", "art"];
/** a Madrasa subject as a filter (Explore chips "sub:<subject>"): only knowledge posts of that subject */
export type SubTopic = `sub:${KnowSubject}`;
export type SchedTopic = LibTopic | "all" | SubTopic;
export const isSubTopic = (t: string): t is SubTopic => t.startsWith("sub:");

/** the known kinds per topic; any other kind (new EXTRA_KINDS) is placed by its name in topicOfKind */
const TOPIC_KINDS: Record<LibTopic, string[]> = {
  tafsir: ["tafsir", "surah-info", "word-root", "word-of-day", "kn-tadabbur", "kn-grammar", "verse-of-day", "featured-surah"],
  hadith: ["hadith", "hadith-of-day", "shia-hadith", "kn-nahj"],
  duas: ["dua", "asma", "phrases", "akhlaq", "kn-names"],
  prayer: ["salah", "pillars", "pillars-hajj", "islamic-months"],
  holy: ["mosque", "holy-places", "saudi-heritage", "kn-haramain"],
  seerah: ["seerah", "prophets", "prophet-family", "battles", "kn-course"],
  quran: ["quran-facts", "angels-unseen", "arabic-word", "kn-exam", "kn-tajweed", "kn-maqam", "kn-arabic-word"],
  scholars: ["scholar-bio", "scholar-work", "scholar-timeline", "reciter-bio", "reciter-fact", "women", "kn-faculty", "kn-adab", "kn-next", "kn-moment"],
  history: ["kn-abrahamic", "history", "islamic-date", "islam-country", "spread", "golden-age", "traditions", "islamic-finance", "halal-culture"],
  art: ["art", "met-art", "calligraphy-style", "architecture-style"],
};
const CAROUSEL = new Set<LibKind>(["scholar-timeline", "seerah"]);
const WEIGHT: Partial<Record<LibKind, number>> = { "hadith-of-day": 3, "islamic-date": 2, "word-of-day": 2, dua: 1.6, tafsir: 1.4, hadith: 1.4, mosque: 1.3, art: 1.2, "met-art": 1.2,
  // the knowledge posts (knowledge.ts): lessons and questions often, Madrasa and progress posts now and then
  "kn-course": 1.4, "kn-tadabbur": 1.3, "kn-exam": 1.3, "kn-arabic-word": 1.2, "kn-grammar": 1, "kn-tajweed": 1.1, "kn-maqam": 0.7, "kn-names": 1,
  "kn-abrahamic": 0.9, "kn-haramain": 0.9, "kn-nahj": 0.9, "kn-faculty": 0.5, "kn-adab": 0.6, "kn-next": 0.7, "kn-moment": 0.8 };
/** knowledge posts: at most this many within the last five posts (the feed stays a feed, not a classroom) */
const KNOW_MAX_IN_5 = 2;
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
export function kindsOf(topic: SchedTopic): LibKind[] {
  if (isSubTopic(topic)) return KNOW_KINDS.filter((k) => k !== "kn-moment" && knowVisible(k) && remoteEnabled(k));
  const allowed = new Set<LibKind>([...kindsFor(tradition()), ...EXTRA_KINDS, ...KNOW_KINDS.filter(knowVisible)]);
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

// ---- the server as one more source (website /api/feed): /new and the corpus of /page, resolved to feed posts ----
// They join the pool; they never replace the local libraries. De-duplicated by server id and by the 7-day seen window.
// The corpus is endless (the server wraps every stream with a new order); its cursor is kept per language and
// tradition, so the next session continues where this one stopped. The buffer is refilled ahead of the reader.
const REMOTE_LOW = 8;
const remoteState = { key: "", lang: "", items: [] as RemotePost[], cursor: null as string | null, done: false, loading: false, known: new Set<string>(), retryAt: 0, fails: 0, empty: 0 };
function remoteFor(lang: string) {
  const key = `${lang}|${tradition()}`;
  if (remoteState.key !== key) Object.assign(remoteState, { key, lang, items: [], cursor: savedCorpusCursor(key), done: false, loading: false, known: new Set<string>(), retryAt: 0, fails: 0, empty: 0 });
  return remoteState;
}
/** an article shown in several kinds, or a tafsir passage that covers several verses: once per seen window */
const postUrlSeen = (p: RemotePost) => !!p.items?.some((i) => urlSeen(i.sourceUrl));
function fetchRemotePage(lang: string) {
  const r = remoteFor(lang);
  if (r.loading || r.items.length >= REMOTE_LOW || Date.now() < r.retryAt || !flagOn("serverPage")) return;
  // an older server ends its page walk (nextCursor null): start again from the top after a pause
  if (r.done) { r.done = false; r.cursor = null; }
  r.loading = true;
  const key = r.key, cursor = r.cursor;
  void fetchCorpusPage(lang, cursor).then(async (res) => {
    if (!res.ok) {
      r.fails++;
      // a cursor the server no longer accepts starts the stream again; offline: wait a little longer each time
      if (res.badCursor) { r.cursor = null; saveCorpusCursor(key, null); }
      r.retryAt = Date.now() + Math.min(300000, 10000 * r.fails);
      return;
    }
    const p = res.page;
    r.fails = 0;
    r.cursor = p.nextCursor;
    if (p.nextCursor?.startsWith("c2.")) saveCorpusCursor(key, p.nextCursor);
    if (!p.nextCursor) { r.done = true; r.retryAt = Date.now() + 300000; }
    const got = (await resolveAll(p.items, lang, r.known)).filter((x) => !wasSeen(x.feedId) && !postUrlSeen(x) && !LIB.has(x.feedId));
    if (r.key !== key) return;
    r.items.push(...got);
    r.empty = got.length ? 0 : r.empty + 1;
    if (got.length) listeners.forEach((f) => f());
    // prefetch: keep the buffer filled while the reader scrolls (an all-seen page simply loads the next one); several
    // pages in a row without anything new (texts offline) pause the stream for a minute
    if (r.empty >= 4) { r.empty = 0; r.retryAt = Date.now() + 60000; }
    else if (r.items.length < REMOTE_LOW && !r.done) setTimeout(() => fetchRemotePage(lang), 0);
  }).catch(() => { r.fails++; r.retryAt = Date.now() + Math.min(300000, 10000 * r.fails); }).finally(() => { r.loading = false; });
}
/** the part of library posts taken from the server corpus when it has posts ready (remote config corpus.share) */
function corpusShare() {
  const v = remoteConfig()?.corpus?.share;
  const base = typeof v === "number" && v >= 0 ? Math.min(0.9, v) : 0.35;
  return Math.max(base, Math.min(0.5, weightOf("editorial") / 12));
}
/** registers a server post and returns its feed id */
function registerRemote(p: RemotePost): string {
  if (p.items?.length) LIB.set(p.feedId, { id: p.feedId, kind: p.kind as LibKind, items: p.items });
  markUrls(p.items ?? []);
  return p.feedId;
}
/** /new: resolves the newest server items and returns their feed ids (registered as posts); unseen ones first */
export async function takeRemoteNew(lang: string, since?: string): Promise<string[]> {
  const res = await fetchFeedNew(lang, since);
  if (!res) return [];
  const got = await resolveAll(res.items, lang, remoteFor(lang).known);
  const ids = got.map((p) => { if (p.items?.length) LIB.set(p.feedId, { id: p.feedId, kind: p.kind as LibKind, items: p.items }); return p.feedId; });
  return [...ids.filter((id) => !wasSeen(id)), ...ids.filter((id) => wasSeen(id))];
}
function markUrls(items: LibItem[]) {
  for (const i of items) if (i.sourceUrl && !/^https?:\/\/(www\.)?quranmasterclass/.test(i.sourceUrl) && i.sourceUrl.split("/").length > 4) { servedUrls.add(i.sourceUrl); markSeen(`u:${i.sourceUrl}`); }
}

// Endless: the sources page through their catalogs and wrap around; items not seen in the last 7 days come first, and
// when a small pool is fully seen it is served again (reshuffled) rather than running dry. Empty answers (offline)
// back off and are retried, so a kind never stops for good.
function fetchKind(kind: LibKind, lang: string, deep = false) {
  const key = `${lang}|${kind}`;
  let q = queues.get(key);
  if (!q) { q = { items: [], page: 0, loading: false, empty: 0, retryAt: 0 }; queues.set(key, q); }
  // a subject filter reads further ahead: the queue may hold items of other subjects
  if (q.loading || q.items.length >= (deep ? 40 : 4) || Date.now() < q.retryAt) return;
  q.loading = true;
  const cur = q;
  const p = cur.page++;
  const load: Promise<LibItem[]> = isKnowKind(kind) ? knowledge().knowledgeFeedItems(kind, lang, p, knowText(lang)) as Promise<LibItem[]> : isExtra(kind) ? extraFeedItems(kind, lang, p) as Promise<LibItem[]> : sourceFeedItems(kind, lang, p, { tradition: tradition() }) as Promise<LibItem[]>;
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
    else setTimeout(() => fetchKind(kind, lang, deep), 0);
  }).catch(() => { cur.retryAt = Date.now() + 30000; }).finally(() => { cur.loading = false; });
}
function shuffleSeeded<T>(a: T[]): T[] {
  const out = [...a];
  for (let i = out.length - 1; i > 0; i--) { const j = Math.floor(rand() * (i + 1)); [out[i], out[j]] = [out[j], out[i]]; }
  return out;
}

/** start loading the kinds of a topic (call on mount / topic change) */
export function warmLibrary(topic: SchedTopic, lang: string) {
  for (const k of kindsOf(topic)) fetchKind(k, lang, isSubTopic(topic));
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
  constructor(private lang: string, private topic: SchedTopic) { warmLibrary(topic, lang); }
  /** the subject of a subject filter ("sub:fiqh" → "fiqh") */
  private get subject(): KnowSubject | null { return isSubTopic(this.topic) ? (this.topic.slice(4) as KnowSubject) : null; }
  private fits = (i: LibItem) => { const s = this.subject; return !s || (i as KnowItem).subject === s; };

  /** up to `n` posts that are ready now (may be fewer while pages load) */
  take(n: number): string[] {
    const out: string[] = [];
    for (let i = 0; i < n; i++) { const id = this.one(); if (!id) break; out.push(id); }
    return out;
  }

  /** the next server post that fits the topic (a different kind than the last post when possible), or -1 */
  private remoteIndex(): number {
    if (this.subject) return -1;
    const r = remoteFor(this.lang);
    const last = this.recent[this.recent.length - 1];
    let at = -1;
    for (let k = 0; k < r.items.length; k++) {
      const p = r.items[k];
      if (wasSeen(p.feedId) || LIB.has(p.feedId) || postUrlSeen(p)) { r.items.splice(k--, 1); continue; }
      if (this.topic !== "all" && topicOfKind(p.kind) !== this.topic) continue;
      if (at < 0) at = k;
      if (p.kind !== last) { at = k; break; }
    }
    return at;
  }
  private takeRemote(at: number): string {
    const r = remoteFor(this.lang);
    const [p] = r.items.splice(at, 1);
    this.recent.push(p.kind as LibKind);
    if (this.recent.length > 12) this.recent.shift();
    this.lastText = true;
    if (r.items.length < REMOTE_LOW) fetchRemotePage(this.lang);
    return registerRemote(p);
  }

  private one(): string | null {
    // the server's corpus: about corpusShare() of the posts when it has posts ready that fit the topic
    fetchRemotePage(this.lang);
    const ri = this.remoteIndex();
    if (ri >= 0 && rand() < corpusShare()) return this.takeRemote(ri);
    const kinds = kindsOf(this.topic);
    const sub = !!this.subject;
    kinds.forEach((k) => fetchKind(k, this.lang, sub));
    const last6 = this.recent.slice(-6);
    const ready = kinds.filter((k) => { const its = queues.get(`${this.lang}|${k}`)?.items ?? []; return sub ? its.some(this.fits) : its.length >= (CAROUSEL.has(k) ? 3 : 1); });
    // the variety rule; when only one kind is loaded (a single-kind topic or a subject filter) it may repeat
    let pool = ready.filter((k) => k !== this.recent[this.recent.length - 1] && last6.filter((x) => x === k).length < 2);
    // knowledge posts between the others: at most KNOW_MAX_IN_5 of the last five posts (not inside a subject filter)
    if (!sub && this.recent.slice(-5).filter(isKnowKind).length >= KNOW_MAX_IN_5) { const rest = pool.filter((k) => !isKnowKind(k)); if (rest.length) pool = rest; }
    if (!pool.length && ready.length && (new Set(kinds).size <= 2 || sub)) pool = ready;
    if (!pool.length) {
      // nothing local is ready yet (first pages loading, offline libraries): a server post rather than an empty feed
      const at = this.remoteIndex();
      return at >= 0 ? this.takeRemote(at) : null;
    }
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
    // knowledge posts: an item of the subject filter, otherwise the learner's favourite subject among the next few
    if (isKnowKind(kind)) {
      const cand = q.items.map((it, i) => ({ i, s: (it as KnowItem).subject })).filter((c) => this.fits(q.items[c.i])).slice(0, 4);
      if (cand.length) {
        const best = cand.reduce((a, c) => (interestOf(`sub:${c.s}`) * (0.75 + rand() * 0.5) > interestOf(`sub:${a.s}`) * (0.75 + rand() * 0.5) ? c : a));
        if (best.i > 0) q.items.unshift(...q.items.splice(best.i, 1));
      }
    }
    const items = CAROUSEL.has(kind) ? q.items.splice(0, Math.min(5, q.items.length)) : q.items.splice(0, 1);
    if (q.items.length < 3) fetchKind(kind, this.lang, sub);
    this.recent.push(kind);
    if (this.recent.length > 12) this.recent.shift();
    this.shown.add(kind);
    markUrls(items);
    const id = `${items.length > 1 ? "xc" : "x"}:${items[0].id}`;
    LIB.set(id, { id, kind, items });
    return id;
  }
}
