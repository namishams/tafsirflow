"use client";
// The endless stack of Swipe & Learn on the website; mirrors mobile/src/features/swipe/deck.ts. Order: the review cards
// due today first (the SRS of this browser), then a weighted mix of learning bites from the site's own data (Quran
// words, verses of the day, tajweed examples, grammar spotted in a verse) and the server corpus (/api/feed/web?v=2 with
// the learning kinds only: verse, word, tafsir, hadith by reference, Hisnul Muslim duas, names of Allah, exam questions,
// course insights, maqasid; every text resolved on the server from its source). After about every fifth learning card
// an achievement moment of another learner (people the member follows first, then the community).
// Card ids are kept for 7 days (src/lib/learn/swipe/store.ts), so nothing repeats in that window while there is something new.
import { readTradition } from "@/lib/learn/tradition";
import { today } from "@/lib/learning";
import { VOCAB_DECKS, type Word } from "@/lib/vocab";
import { VERSES_OF_THE_DAY } from "@/lib/votd";
import { tajweedFor } from "@/lib/tajweed";
import { LESSONS as AR_LESSONS } from "@/lib/learn/arabic-lang/curriculum";
import { tx as arTx } from "@/lib/learn/arabic-lang/types";
import { buildQueue, readSrsState } from "@/lib/learn/srs/store";
import { installSeed } from "@/lib/feedWeb/client";
import type { WebCard, WebFeedPage } from "@/lib/feedWeb/types";
import { readJSON, writeJSON } from "@/lib/learn/store";
import { mashaState, wasShown } from "@/lib/learn/swipe/store";
import { profile, type Profile, type Source } from "@/lib/learn/swipe/personal";

export type CardKind = "srs" | "word" | "verse" | "tajweed" | "name" | "quiz" | "course" | "maqasid" | "grammar" | "hadith" | "tafsir" | "dua" | "insight" | "moment";
export type Reaction = "like" | "mashallah" | "barakallah" | "barik";
export type Moment = {
  id: string; kind: string; ref: string; data: Record<string, unknown>; at: string; title: string | null;
  total: number; mine: Reaction | null; own: boolean; counts: Record<Reaction, number>;
  author: { username: string; name: string; badge: string | null; avatar: string | null };
};
export type MomentCard = Moment & { follow: boolean };
/** a bite of the site's own data (tajweed example, grammar spot) */
export type LocalBite = { title: string; body: string; arabic?: string; note?: string; ask?: string; verse: string; words?: number[]; href: string; source: string };
export type SCard = {
  id: string;
  kind: CardKind;
  srs?: string;
  word?: Word;
  verse?: string;
  bite?: LocalBite;
  web?: WebCard;
  moment?: MomentCard;
};

const SOURCES: Source[] = ["word", "verse", "tajweed", "grammar", "corpus"];
const LEARN_KINDS = "verse,word,tafsir,hadith,shia-hadith,name,quiz,course,lemma,maqasid,dua";
const CORPUS_KEY = "qmc.swipe.corpus-cursor";
const BRAND = "Quran Masterclass";

const hash = (s: string) => { let h = 2166136261; for (const ch of s) h = Math.imul(h ^ ch.charCodeAt(0), 16777619) >>> 0; return h; };
function shuffleBy<T>(a: readonly T[], seed: number): T[] {
  let x = seed || 1;
  const r = () => { x ^= x << 13; x ^= x >>> 17; x ^= x << 5; return ((x >>> 0) % 100000) / 100000; };
  const out = [...a];
  for (let i = out.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [out[i], out[j]] = [out[j], out[i]]; }
  return out;
}
const tradition = (): "all" | "sunni" | "shia" => { const t = readTradition(); return t === "sunni" || t === "shia" ? t : "all"; };
const cut = (s: string, n: number) => (s.length <= n ? s : `${s.slice(0, n).replace(/\s+\S*$/, "")} …`);
const clean = (s: string) => s.replace(/\*\*/g, "").replace(/\s+/g, " ").trim();

/** a resolved corpus card as a learning card; null = not a learning card here (articles, images, groups) */
function fromWeb(c: WebCard): SCard | null {
  if (c.quiz) return { id: c.id, kind: "quiz", web: c, verse: c.verse?.key };
  switch (c.kind) {
    case "verse": return c.verse ? { id: `v:${c.verse.key}`, kind: "verse", web: c, verse: c.verse.key } : null;
    case "word": case "lemma": return { id: c.id, kind: "insight", web: c };
    case "tafsir": return { id: c.id, kind: "tafsir", web: c };
    case "hadith": return { id: c.id, kind: "hadith", web: c };
    case "dua": return { id: c.id, kind: "dua", web: c };
    case "name": return { id: c.id, kind: "name", web: c };
    case "course": return { id: c.id, kind: "course", web: c };
    case "maqasid": return { id: c.id, kind: "maqasid", web: c };
    default: return null;
  }
}

type Pool = { items: SCard[]; page: number; loading: boolean; retryAt: number; empty: number; cursor: string | null; relaxed: boolean };

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
  private alive = true;
  private momentEvery: number;
  private momentsOn: boolean;

  constructor(private lang: string, opts: { momentEvery: number }) {
    this.prof = profile(SOURCES);
    this.momentEvery = opts.momentEvery;
    this.momentsOn = true;
    // the website has no limits (src/lib/learn/free.ts): every due review card first
    try { this.due = buildQueue(readSrsState(), { unlimited: true }).due.slice(0, 60); } catch { this.due = []; }
    for (const s of SOURCES) this.fill(s);
    this.loadMoments();
  }
  dispose() { this.alive = false; this.subs.clear(); }
  onChange(f: () => void) { this.subs.add(f); return () => { this.subs.delete(f); }; }
  private emit() { if (this.alive) this.subs.forEach((f) => f()); }
  stopMoments() { this.momentsOn = false; this.moments = []; }

  private pool(s: Source): Pool {
    let p = this.pools.get(s);
    if (!p) { p = { items: [], page: 0, loading: false, retryAt: 0, empty: 0, cursor: s === "corpus" ? readJSON<string | null>(CORPUS_KEY, null) : null, relaxed: false }; this.pools.set(s, p); }
    return p;
  }
  private fresh(c: SCard, relaxed: boolean) { return !this.used.has(c.id) && (relaxed || !wasShown(c.id)); }

  private fill(s: Source) {
    const p = this.pool(s);
    if (p.loading || p.items.length >= 3 || Date.now() < p.retryAt || !this.alive) return;
    p.loading = true;
    const page = p.page++;
    void this.load(s, page, p).then((got) => {
      if (!this.alive) return;
      if (!got.length) {
        // past the end of a catalogue (or offline): start again, accepting cards shown in the last 7 days
        p.empty++; p.page = 0; p.relaxed = true;
        p.retryAt = Date.now() + Math.min(120000, 4000 * p.empty * p.empty);
        return;
      }
      p.empty = 0;
      const add = got.filter((c) => this.fresh(c, p.relaxed));
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
      case "tajweed": {
        const de = lang === "de";
        const all = tajweedFor(lang).flatMap((l) => l.examples.filter((e) => e.key).map((e, i): SCard => ({
          id: `kn:tajweed:${l.id}:${i}`, kind: "tajweed", verse: e.key,
          bite: { title: de ? l.title_de : l.title_en, body: cut(de ? l.summary_de : l.summary_en, 300), arabic: e.ar, note: de ? e.note_de : e.note_en, verse: e.key!, href: `/tajweed/${l.id}`, source: `${BRAND} · Tajweed` },
        })));
        return shuffleBy(all, hash(`t:${today()}`)).slice(page * 6, page * 6 + 6);
      }
      case "grammar": {
        const all = AR_LESSONS.flatMap((l) => (l.spot ?? []).map((sp, i): SCard => ({
          id: `kn:grammar:${l.id}:${i}`, kind: "grammar", verse: sp.key,
          bite: { title: arTx(l.title, lang), body: cut(clean(arTx(l.expl, lang)), 320), ask: arTx(sp.ask, lang), verse: sp.key, words: sp.pos, href: `/arabic/lang/${l.id}`, source: `${BRAND} · Arabic` },
        })));
        return shuffleBy(all, hash(`g:${today()}`)).slice(page * 6, page * 6 + 6);
      }
      case "corpus": {
        const q = new URLSearchParams({ v: "2", locale: lang, tradition: tradition(), limit: "12", seed: installSeed(), kinds: LEARN_KINDS, ...(p.cursor ? { cursor: p.cursor } : {}) });
        const res = await fetch(`/api/feed/web?${q}`, { headers: { Accept: "application/json" } });
        if (!res.ok) { if (res.status === 400) { p.cursor = null; writeJSON(CORPUS_KEY, null, true); } return []; }
        const pg = (await res.json()) as WebFeedPage;
        if (!Array.isArray(pg?.items)) return [];
        p.cursor = pg.nextCursor;
        if (p.cursor?.startsWith("c2.")) writeJSON(CORPUS_KEY, p.cursor, true);
        const out = pg.items.map(fromWeb).filter((c): c is SCard => !!c);
        return out.length || !p.cursor ? out : this.load(s, page + 1, p);
      }
      default: return [];
    }
  }

  // ---------- moments of other learners ----------
  private loadMoments() {
    const m = this.mom;
    if (!this.momentsOn || m.loading || m.done || this.moments.length >= 3 || Date.now() < m.retryAt) return;
    m.loading = true;
    const q = new URLSearchParams({ scope: m.scope, locale: this.lang, ...(m.before ? { before: m.before } : {}) });
    void fetch(`/api/community/moments?${q}`, { headers: { Accept: "application/json" }, credentials: "same-origin" }).then(async (res) => {
      // signed out, under 13 or no age confirmed: no moments in this session
      if (res.status === 401 || res.status === 403) { this.stopMoments(); return; }
      if (!res.ok) throw new Error("http");
      const r = (await res.json()) as { moments: Moment[]; more: string | null };
      if (!this.alive) return;
      const follow = m.scope === "friends";
      const got = r.moments.filter((x) => !x.own && !x.mine && !wasShown(`m:${x.id}`) && !this.used.has(`m:${x.id}`) && !this.moments.some((y) => y.id === x.id));
      this.moments.push(...got.map((x) => ({ ...x, follow })));
      m.before = r.more;
      if (!r.more) { if (m.scope === "friends") { m.scope = "public"; m.before = null; } else m.done = true; }
      if (got.length) this.emit();
      else if (!m.done) setTimeout(() => this.loadMoments(), 0);
    }).catch(() => {
      m.retryAt = Date.now() + 60000;
      if (m.scope === "friends") { m.scope = "public"; m.before = null; }
    }).finally(() => { m.loading = false; });
  }
  private takeMoment(): SCard | null {
    if (!this.momentsOn) return null;
    const x = this.moments.shift();
    this.loadMoments();
    if (!x) return null;
    if (mashaState(x.author.username) === "dayFull") { this.stopMoments(); return null; }
    return { id: `m:${x.id}`, kind: "moment", moment: x };
  }

  /** the next card, or null while every source is still loading */
  take(): SCard | null {
    while (this.due.length) {
      const id = this.due.shift()!;
      if (this.used.has(`s:${id}`)) continue;
      this.used.add(`s:${id}`);
      this.last = "srs";
      return { id: `s:${id}`, kind: "srs", srs: id };
    }
    if (this.sinceMoment >= this.momentEvery) {
      const m = this.takeMoment();
      if (m) { this.sinceMoment = 0; this.used.add(m.id); this.last = "moment"; return m; }
    }
    // the corpus carries most kinds (hadith, tafsir, duas, names, questions, courses, maqasid): its weight is the sum of them
    const w = this.prof.weights;
    const weight = (s: Source) => (s === "corpus" ? w.corpus + w.hadith + w.tafsir + w.dua + w.name + w.quiz + w.course + w.maqasid : w[s]);
    const ready = SOURCES.filter((s) => { this.fill(s); return this.pool(s).items.some((c) => this.fresh(c, true)); });
    if (!ready.length) return null;
    let pool = ready.filter((s) => this.pool(s).items[0]?.kind !== this.last);
    // only the kind of the last card is ready while other sources still load: wait for them rather than repeat
    if (!pool.length && SOURCES.some((s) => !ready.includes(s) && this.pool(s).loading)) return null;
    if (!pool.length) pool = ready;
    const ws = pool.map(weight);
    let x = Math.random() * ws.reduce((a, b) => a + b, 0), src = pool[pool.length - 1];
    for (let i = 0; i < pool.length; i++) { x -= ws[i]; if (x <= 0) { src = pool[i]; break; } }
    const p = this.pool(src);
    let card: SCard | undefined;
    // inside the corpus: prefer a kind that differs from the last card and fits the learner's weights
    if (src === "corpus" && p.items.length > 1) {
      const kw = (c: SCard) => (c.kind === this.last ? 0.2 : 1) * (({ hadith: w.hadith, tafsir: w.tafsir, dua: w.dua, name: w.name, quiz: w.quiz, course: w.course, maqasid: w.maqasid, verse: w.verse, insight: w.word } as Partial<Record<CardKind, number>>)[c.kind] ?? 1);
      const cand = p.items.slice(0, 5);
      const best = cand.reduce((a, c) => (kw(c) * (0.75 + Math.random() * 0.5) > kw(a) * (0.75 + Math.random() * 0.5) ? c : a));
      p.items.splice(p.items.indexOf(best), 1);
      if (this.fresh(best, true)) card = best;
    }
    while (!card && p.items.length) { const c = p.items.shift()!; if (this.fresh(c, true)) card = c; }
    this.fill(src);
    if (!card) return this.take();
    this.used.add(card.id);
    this.last = card.kind;
    this.sinceMoment++;
    return card;
  }
}
