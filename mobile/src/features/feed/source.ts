import { getVerses, type Reciter, type Segment, type Word } from "@/lib/quran";
import { VERSES_OF_THE_DAY } from "@/web/votd";
import { VERSE_COUNTS } from "@/web/counts";
import { wasSeen } from "./seen";

// Where the feed's pages come from. Every Quran text comes from the Quran API helpers (lib/quran.ts); every story
// from the vetted library content (features/prophet/stories.ts). This file only decides what follows what:
//   "v:S:A" a verse, "w:S:A" the word-of-the-verse card, "n:I" a name of Allah (library list), "s:<id>" a story card,
//   "pro" the Pro card after the free daily stories.
// Discover mixes the hand-picked verses of the day (web/votd.ts) with random verses and – in "For you" – story cards
// of every category; Surah mode walks through a surah verse by verse and then on into the next one.

export type FeedVerse = { key: string; s: number; v: number; arabic: string; translation: string; audio: string; fallback: string; words: Word[]; segments: Segment[] };
export type FeedMode = "discover" | "surah" | "hadith";
export type FeedCat = "foryou" | "verses" | "prophet" | "reciters" | "islam" | "tips";
export const FEED_CATS: FeedCat[] = ["foryou", "verses", "prophet", "reciters", "islam", "tips"];

const parse = (key: string) => { const [s, v] = key.split(":").map(Number); return { s, v }; };
export const validKey = (key: string) => { const { s, v } = parse(key); return s >= 1 && s <= 114 && v >= 1 && v <= VERSE_COUNTS[s - 1]; };
export const keyOfItem = (id: string) => (id.startsWith("v:") || id.startsWith("w:") ? id.slice(2) : "");

export function shuffle<T>(a: readonly T[]): T[] {
  const out = [...a];
  for (let i = out.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [out[i], out[j]] = [out[j], out[i]]; }
  return out;
}
function randomKey(): string {
  const s = 1 + Math.floor(Math.random() * 114);
  return `${s}:${1 + Math.floor(Math.random() * VERSE_COUNTS[s - 1])}`;
}

/** an endless source of verse keys: two curated verses, then a random one of all 6236 (not seen in the last days);
 *  curated ones reshuffled each round */
class VerseKeys {
  private pool: string[] = [];
  private seen = new Set<string>();
  private n = 0;
  next(): string {
    for (let guard = 0; guard < 50; guard++) {
      this.n++;
      let k: string;
      if (this.n % 3 === 0) k = randomKey();
      else { if (!this.pool.length) this.pool = shuffle(VERSES_OF_THE_DAY); k = this.pool.pop()!; }
      if (this.seen.has(k) && (this.n % 3 === 0 || this.seen.size < VERSES_OF_THE_DAY.length)) continue;
      // the whole Quran is the pool: random verses shown in the last days are skipped (curated ones may come back)
      if (this.n % 3 === 0 && guard < 40 && wasSeen(`v:${k}`)) continue;
      this.seen.add(k);
      return k;
    }
    return randomKey();
  }
  curated(): string { if (!this.pool.length) this.pool = shuffle(VERSES_OF_THE_DAY); return this.pool.pop()!; }
}

/** story ids per category, endless (reshuffled when a round is through) */
export type StoryPools = Partial<Record<"prophet" | "reciters" | "islam" | "tips" | "secrets", string[]>>;
class Rotation {
  private queue: string[] = [];
  constructor(private all: string[]) {}
  // a fresh round puts stories not seen in the last days first
  next(): string | null {
    if (!this.all.length) return null;
    if (!this.queue.length) { const s = shuffle(this.all); this.queue = [...s.filter((id) => wasSeen(`s:${id}`)), ...s.filter((id) => !wasSeen(`s:${id}`))]; }
    return this.queue.pop()!;
  }
}

/** the item sequence of Discover for one category */
export class DiscoverFeed {
  private verses = new VerseKeys();
  private rot: Record<string, Rotation> = {};
  private n = 0;
  private turn = 0;
  private stopped = false;
  private proShown = false;
  constructor(private cat: FeedCat, pools: StoryPools, private names: number, private hasWords: boolean, first?: string) {
    for (const [k, v] of Object.entries(pools)) this.rot[k] = new Rotation(v ?? []);
    if (first && validKey(first)) this.firstKey = first;
  }
  private firstKey: string | null = null;
  private story(cat: string): string | null { const id = this.rot[cat]?.next(); return id ? `s:${id}` : null; }

  /** `storiesLeft`: free stories still allowed today (Infinity with Pro) */
  next(count: number, storiesLeft: number): string[] {
    const out: string[] = [];
    if (this.firstKey) { out.push(`v:${this.firstKey}`); this.firstKey = null; }
    if (this.stopped) return out;
    let left = storiesLeft;
    const storyOr = (id: string | null): string | null => {
      if (!id) return null;
      if (left > 0) { left--; return id; }
      if (!this.proShown) { this.proShown = true; return "pro"; }
      return null;
    };
    while (out.length < count) {
      this.n++;
      if (this.cat === "verses" || this.cat === "foryou") {
        if (this.cat === "foryou" && this.n % 4 === 0) {
          const cats = ["prophet", "reciters", "islam", "tips", "secrets"];
          const id = storyOr(this.story(cats[this.turn++ % cats.length]));
          if (id) { out.push(id); continue; }
        }
        if (this.names && this.n % (this.cat === "verses" ? 7 : 11) === 0) { out.push(`n:${Math.floor(Math.random() * this.names)}`); continue; }
        if (this.hasWords && this.n % (this.cat === "verses" ? 4 : 6) === 0) { out.push(`w:${this.verses.curated()}`); continue; }
        out.push(`v:${this.verses.next()}`);
        continue;
      }
      // one category of stories only
      const id = storyOr(this.story(this.cat));
      if (!id) { this.stopped = true; break; }
      out.push(id);
      if (id === "pro") { this.stopped = true; break; }
    }
    return out;
  }
}

/** keys of one surah */
export const surahKeys = (s: number) => Array.from({ length: VERSE_COUNTS[s - 1] }, (_, i) => `v:${s}:${i + 1}`);

// verse data (with words and timings), cached per language and reciter; one request loads a whole surah
const cache = new Map<string, Promise<FeedVerse>>();
const surahs = new Map<string, Promise<void>>();
const ck = (key: string, lang: string, r: Reciter) => `${key}|${lang}|${r.folder}`;

export function preloadSurah(s: number, lang: string, reciter: Reciter): Promise<void> {
  const id = `${s}|${lang}|${reciter.folder}`;
  let p = surahs.get(id);
  if (!p) {
    p = getVerses(s, lang, reciter).then((list) => {
      for (const x of list) {
        cache.set(ck(x.verse_key, lang, reciter), Promise.resolve({
          key: x.verse_key, s, v: x.verse_number, arabic: x.text_uthmani, translation: x.translation, audio: x.audioUrl, fallback: x.remoteAudioUrl, words: x.words, segments: x.segments,
        }));
      }
    });
    p.catch(() => surahs.delete(id));
    surahs.set(id, p);
  }
  return p;
}

export async function loadVerse(key: string, lang: string, reciter: Reciter): Promise<FeedVerse> {
  const hit = cache.get(ck(key, lang, reciter));
  if (hit) return hit;
  await preloadSurah(parse(key).s, lang, reciter);
  const p = cache.get(ck(key, lang, reciter));
  if (!p) throw new Error("verse not found");
  return p;
}
