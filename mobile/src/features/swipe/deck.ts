import { Platform } from "react-native";
import { ApiError, SITE, api } from "@/lib/api";
import { readJSON, writeJSON } from "@/lib/store";
import { readTradition } from "@/lib/tradition";
import { today } from "@/web/learning";
import { VOCAB_DECKS, type Word } from "@/web/vocab";
import { VERSES_OF_THE_DAY } from "@/web/votd";
import { sourceFeedItems, type SourceItem } from "@/content/sources";
import { hadithFeedItems, type HadithFeedItem } from "@/features/hadith/data";
import { installSeed, resolveAll, type FeedPageResponse } from "@/features/feed/remote";
import { knowText } from "@/features/feed/knowTexts";
import type { KnowItem, KnowKind } from "@/features/feed/knowledge";
import type { LibItem } from "@/features/feed/library";
import { buildQueue, readSrsState } from "@/features/srs/store";
import { sijillApi, type Moment } from "@/features/sijill/api";
import { mashaState, wasShown } from "./store";
import { profile, SOURCES, type Profile, type Source } from "./personal";
/** the knowledge builders load on first use (they import courses and the Madrasa, which import gamify.ts) */
// eslint-disable-next-line @typescript-eslint/no-require-imports
const knowledge = () => require("@/features/feed/knowledge") as typeof import("@/features/feed/knowledge");

// The endless stack of Swipe & Learn. Order: the review cards due today first (the SRS), then a weighted mix of
// learning bites from the app's own data (Quran words, verses of the day, tajweed examples, names of Allah, exam
// questions, course insights, maqasid, grammar), the synced sources (hadith by reference, tafsir, Hisnul Muslim duas)
// and the server corpus (/api/feed/page?v=2, resolved on the device like the feed). After about every fifth learning
// card an achievement moment of another learner (people the member follows first, then the community).
// Every card id is kept for 7 days (store.ts): nothing repeats in that window while there is something new; a pool
// that has run through its catalogue starts again rather than running dry. Quran and hadith text never lives here:
// verses are keys, rendered from the Quran data; hadith come from their sources with the reference.
export type CardKind = "srs" | "word" | "verse" | "tajweed" | "name" | "quiz" | "course" | "maqasid" | "grammar" | "hadith" | "tafsir" | "dua" | "insight" | "moment";
export type MomentCard = Moment & { follow: boolean };
export type SCard = {
  /** the id of the content (7-day window) */
  id: string;
  kind: CardKind;
  /** review card id of the SRS ("word:…", "verse:…" …) */
  srs?: string;
  word?: Word;
  verse?: string;
  lib?: LibItem;
  hadith?: HadithFeedItem;
  moment?: MomentCard;
};

const hash = (s: string) => { let h = 2166136261; for (const ch of s) h = Math.imul(h ^ ch.charCodeAt(0), 16777619) >>> 0; return h; };
function shuffleBy<T>(a: readonly T[], seed: number): T[] {
  let x = seed || 1;
  const r = () => { x ^= x << 13; x ^= x >>> 17; x ^= x << 5; return ((x >>> 0) % 100000) / 100000; };
  const out = [...a];
  for (let i = out.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [out[i], out[j]] = [out[j], out[i]]; }
  return out;
}
const tradition = (): "all" | "sunni" | "shia" => { try { const t = readTradition(); return t === "sunni" || t === "shia" ? t : "all"; } catch { return "all"; } };

/** a library item (knowledge post, source item or resolved corpus item) as a card kind; null = not a learning card */
export function kindOfLib(it: LibItem): CardKind | null {
  if ((it as KnowItem).quiz) return "quiz";
  switch (it.kind) {
    case "kn-tajweed": return "tajweed";
    case "kn-names": case "asma": return "name";
    case "kn-exam": return "quiz";
    case "kn-course": case "kn-abrahamic": case "kn-haramain": return "course";
    case "kn-tadabbur": return "maqasid";
    case "kn-grammar": return "grammar";
    case "hadith": case "hadith-of-day": case "shia-hadith": case "kn-nahj": return "hadith";
    case "tafsir": return "tafsir";
    case "dua": return "dua";
    case "word-of-day": case "word-root": case "kn-arabic-word": case "surah-info": return "insight";
    default: return null;
  }
}
const libCard = (it: LibItem): SCard | null => { const k = kindOfLib(it); return k ? { id: it.id, kind: k, lib: it, verse: (it as KnowItem).verse } : null; };

/** the learning kinds of the server corpus (no articles or images): /api/feed/page?v=2&kinds=… */
const LEARN_KINDS = "verse,word,tafsir,hadith,shia-hadith,name,quiz,course,lemma,maqasid,dua";
async function corpusPage(lang: string, cursor: string | null): Promise<{ ok: true; page: FeedPageResponse } | { ok: false; badCursor: boolean }> {
  const q = new URLSearchParams({ locale: lang, tradition: tradition(), v: "2", seed: installSeed(), limit: "12", kinds: LEARN_KINDS, ...(cursor ? { cursor } : {}) });
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 10000);
  try {
    const res = await fetch(`${SITE}/api/feed/page?${q.toString()}`, { headers: { Accept: "application/json", "x-qmc-app": Platform.OS }, signal: ctrl.signal });
    if (!res.ok) return { ok: false, badCursor: res.status === 400 };
    const page = (await res.json()) as FeedPageResponse;
    return Array.isArray(page?.items) ? { ok: true, page } : { ok: false, badCursor: false };
  } catch {
    return { ok: false, badCursor: false };
  } finally { clearTimeout(timer); }
}

/** when the JS thread is idle (requestIdleCallback; InteractionManager is gone from React Native) */
const idle = (f: () => void) => { const r = (globalThis as { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => void }).requestIdleCallback; if (r) r(f, { timeout: 1500 }); else setTimeout(f, 0); };

type Pool = { items: SCard[]; page: number; loading: boolean; retryAt: number; empty: number; cursor: string | null; relaxed: boolean };
const KNOW: Partial<Record<Source, KnowKind>> = { tajweed: "kn-tajweed", name: "kn-names", quiz: "kn-exam", course: "kn-course", maqasid: "kn-tadabbur", grammar: "kn-grammar" };
const CORPUS_KEY = "qmc.swipe.corpus-cursor";
const PUBLIC_MOMENTS = (q: string) => api<{ moments: Moment[]; more: string | null }>(`/api/community/moments?${q}`);

export class SwipeDeck {
  private pools = new Map<Source, Pool>();
  private due: string[] = [];
  private used = new Set<string>();
  private last: CardKind | null = null;
  private sinceMoment = 0;
  private prof: Profile;
  private moments: MomentCard[] = [];
  private mom = { scope: "friends" as "friends" | "public", before: null as string | null, loading: false, done: false, retryAt: 0 };
  private subs = new Set<() => void>();
  private known = new Set<string>();
  private alive = true;
  private momentEvery: number;
  private momentsOn: boolean;

  constructor(private lang: string, opts: { unlimited: boolean; signedIn: boolean; momentEvery: number }) {
    this.prof = profile();
    this.momentEvery = opts.momentEvery;
    this.momentsOn = opts.signedIn;
    // due review cards first (the free daily limit of new cards stays with the card trainer; reviews are always open)
    try { this.due = buildQueue(readSrsState(), { unlimited: opts.unlimited }).due.slice(0, 60); } catch { this.due = []; }
    // the light local sources at once; the others one after the other, so the first card is never held up by the
    // knowledge builders (they read whole course catalogues on first use)
    for (const s of SOURCES.filter((x) => this.warm.has(x))) this.fill(s);
    SOURCES.filter((x) => !this.warm.has(x)).forEach((s, i) => this.timers.push(setTimeout(() => {
      idle(() => { this.warm.add(s); this.fill(s); });
    }, 900 + i * 450)));
    if (this.momentsOn) this.timers.push(setTimeout(() => this.loadMoments(), 1200));
  }
  private warm = new Set<Source>(["word", "verse"]);
  private timers: ReturnType<typeof setTimeout>[] = [];
  dispose() { this.alive = false; this.subs.clear(); this.timers.forEach(clearTimeout); }
  onChange(f: () => void) { this.subs.add(f); return () => { this.subs.delete(f); }; }
  private emit() { if (this.alive) this.subs.forEach((f) => f()); }
  /** moments off for this session (no Talents profile, or the day's cap reached) */
  stopMoments() { this.momentsOn = false; this.moments = []; }
  get dueLeft() { return this.due.length; }

  private pool(s: Source): Pool {
    let p = this.pools.get(s);
    if (!p) { p = { items: [], page: 0, loading: false, retryAt: 0, empty: 0, cursor: s === "corpus" ? readJSON<string | null>(CORPUS_KEY, null) : null, relaxed: false }; this.pools.set(s, p); }
    return p;
  }
  private fresh(c: SCard, relaxed: boolean) { return !this.used.has(c.id) && (relaxed || !wasShown(c.id)); }

  /** loads the next page of a source when its queue runs low */
  private fill(s: Source) {
    const p = this.pool(s);
    if (!this.warm.has(s) || p.loading || p.items.length >= 3 || Date.now() < p.retryAt || !this.alive) return;
    p.loading = true;
    const page = p.page++;
    void this.load(s, page, p).then((got) => {
      if (!this.alive) return;
      const add = got.filter((c) => this.fresh(c, p.relaxed));
      if (!got.length) {
        // past the end of a catalogue (or offline): start again, accepting cards shown in the last 7 days
        p.empty++;
        p.page = 0;
        p.relaxed = p.empty >= 1;
        p.retryAt = Date.now() + Math.min(120000, 4000 * p.empty * p.empty);
        return;
      }
      p.empty = 0;
      p.items.push(...add);
      if (add.length) this.emit();
      else if (page < 60) setTimeout(() => this.fill(s), 0);
    }).catch(() => { p.retryAt = Date.now() + 20000; }).finally(() => { p.loading = false; });
  }

  private async load(s: Source, page: number, p: Pool): Promise<SCard[]> {
    const lang = this.lang;
    switch (s) {
      case "word": {
        const have = readSrsState().cards;
        const all = VOCAB_DECKS.filter((d) => d.id !== "allah").flatMap((d) => d.words).filter((w) => !have[`word:${w.id}`]);
        const juz = (w: Word) => Number(w.ex?.key?.split(":")[0] ?? 0) >= 78;
        const seed = hash(`w:${today()}`);
        const list = this.prof.juzAmmaFirst ? [...shuffleBy(all.filter(juz), seed), ...shuffleBy(all.filter((w) => !juz(w)), seed)] : shuffleBy(all, seed);
        return list.slice(page * 8, page * 8 + 8).map((w) => ({ id: `w:${w.id}`, kind: "word", word: w, verse: w.ex?.key }));
      }
      case "verse":
        return shuffleBy(VERSES_OF_THE_DAY, hash(`v:${today()}`)).slice(page * 6, page * 6 + 6).map((k) => ({ id: `v:${k}`, kind: "verse", verse: k }));
      case "hadith": {
        if (page > 0 && !p.cursor) return [];
        const r = await hadithFeedItems(lang, readTradition(), p.cursor, 6);
        p.cursor = r.cursor;
        return r.items.map((h) => ({ id: `h:${h.id}`, kind: "hadith", hadith: h }));
      }
      case "tafsir": case "dua": {
        const got = await sourceFeedItems(s, lang, page, { tradition: tradition() });
        return got.map((it: SourceItem) => libCard({ ...it, kind: it.kind } as LibItem)).filter((c): c is SCard => !!c);
      }
      case "corpus": {
        const res = await corpusPage(lang, p.cursor);
        if (!res.ok) { if (res.badCursor) { p.cursor = null; writeJSON(CORPUS_KEY, null, true); } return []; }
        p.cursor = res.page.nextCursor;
        if (p.cursor?.startsWith("c2.")) writeJSON(CORPUS_KEY, p.cursor, true);
        const posts = await resolveAll(res.page.items, lang, this.known);
        const out: SCard[] = [];
        for (const x of posts) {
          if (x.feedId.startsWith("v:")) { out.push({ id: x.feedId, kind: "verse", verse: x.feedId.slice(2) }); continue; }
          const it = x.items?.[0];
          const c = it ? libCard(it) : null;
          if (c) out.push(c);
        }
        // a page of only other kinds (articles, images): ask for the next one
        return out.length || !p.cursor ? out : this.load(s, page + 1, p);
      }
      default: {
        const kind = KNOW[s];
        if (!kind) return [];
        const items = (await knowledge().knowledgeFeedItems(kind, lang, page, knowText(lang))) as LibItem[];
        return items.map(libCard).filter((c): c is SCard => !!c);
      }
    }
  }

  // ---------- moments of other learners ----------
  private loadMoments() {
    const m = this.mom;
    if (!this.momentsOn || m.loading || m.done || this.moments.length >= 3 || Date.now() < m.retryAt) return;
    m.loading = true;
    const q = new URLSearchParams({ scope: m.scope, locale: this.lang, ...(m.before ? { before: m.before } : {}) }).toString();
    const req = m.scope === "friends" ? sijillApi.moments({ scope: "friends", locale: this.lang, before: m.before ?? undefined }) : PUBLIC_MOMENTS(q);
    void req.then((r) => {
      if (!this.alive) return;
      const follow = m.scope === "friends";
      const got = r.moments.filter((x) => !x.own && !x.mine && !wasShown(`m:${x.id}`) && !this.used.has(`m:${x.id}`) && !this.moments.some((y) => y.id === x.id));
      this.moments.push(...got.map((x) => ({ ...x, follow })));
      m.before = r.more;
      if (!r.more) {
        // the people one follows first, then the community; after both: pause and look again later
        if (m.scope === "friends") { m.scope = "public"; m.before = null; } else { m.done = true; }
      }
      if (got.length) this.emit();
      else if (!m.done) setTimeout(() => this.loadMoments(), 0);
    }).catch((e: unknown) => {
      // signed out, under 13 or no age confirmed: no moments in this session
      if (e instanceof ApiError && (e.status === 401 || e.status === 403)) { this.stopMoments(); return; }
      m.retryAt = Date.now() + 60000;
      if (m.scope === "friends") { m.scope = "public"; m.before = null; }
    }).finally(() => { m.loading = false; });
  }
  private takeMoment(): SCard | null {
    if (!this.momentsOn) return null;
    while (this.moments.length) {
      const x = this.moments.shift()!;
      if (mashaState(x.author.username) === "dayFull") { this.stopMoments(); return null; }
      this.loadMoments();
      return { id: `m:${x.id}`, kind: "moment", moment: x };
    }
    this.loadMoments();
    return null;
  }

  /** the next card, or null while every source is still loading */
  take(): SCard | null {
    // 1) the review cards due today
    while (this.due.length) {
      const id = this.due.shift()!;
      if (this.used.has(`s:${id}`)) continue;
      this.used.add(`s:${id}`);
      this.last = "srs";
      return { id: `s:${id}`, kind: "srs", srs: id };
    }
    // 2) an achievement of another learner after about every fifth card
    if (this.sinceMoment >= this.momentEvery) {
      const m = this.takeMoment();
      if (m) { this.sinceMoment = 0; this.used.add(m.id); this.last = "moment"; return m; }
    }
    // 3) a weighted pick among the sources that have cards ready, never the same kind twice in a row
    const ready = SOURCES.filter((s) => { this.fill(s); return this.pool(s).items.some((c) => this.fresh(c, true)); });
    if (!ready.length) return null;
    let pool = ready.filter((s) => this.pool(s).items[0]?.kind !== this.last);
    // only the kind of the last card is ready while other sources still load: wait for them rather than repeat
    if (!pool.length && SOURCES.some((s) => !ready.includes(s) && (!this.warm.has(s) || this.pool(s).loading))) return null;
    if (!pool.length) pool = ready;
    const w = pool.map((s) => this.prof.weights[s]);
    const sum = w.reduce((a, b) => a + b, 0);
    let x = Math.random() * sum, src = pool[pool.length - 1];
    for (let i = 0; i < pool.length; i++) { x -= w[i]; if (x <= 0) { src = pool[i]; break; } }
    const p = this.pool(src);
    let card: SCard | undefined;
    while (p.items.length && !card) { const c = p.items.shift()!; if (this.fresh(c, true)) card = c; }
    this.fill(src);
    if (!card) return this.take();
    this.used.add(card.id);
    this.last = card.kind;
    this.sinceMoment++;
    return card;
  }
}

/** for the entry cards: review cards due today */
export function dueToday(unlimited: boolean): number {
  try { return buildQueue(readSrsState(), { unlimited }).due.length; } catch { return 0; }
}
