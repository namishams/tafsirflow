// mirrors mobile/src/features/srs/store.ts (copied for the website; keep both in step)
import { useMemo } from "react";
import { freeLimits } from "@/lib/learn/free";
import { readJSON, useStored, writeJSON } from "@/lib/learn/store";
import { today } from "@/lib/learning";
import { nextMemory, type Grade, type Memory } from "./fsrs";
import { useSrsLimits } from "./gate";
import { DECK_IDS, FREE_DECKS, deckItems, deckOf, type DeckId } from "./decks";

// Local card store (this device; "qmc." keys are not synced). Bounded: at most MAX_CARDS cards, the review log keeps
// LOG_DAYS days, the test history MAX_RESULTS results. A card is stored once it was introduced or created from the
// feed / saved verses; deck cards that were never shown stay out of storage.
export type Card = { m: Memory | null; added: number; own?: 1 };
type DayLog = { n: number; nw: number; again: number };
export type SrsState = { cards: Record<string, Card>; decks: DeckId[]; log: Record<string, DayLog>; seen?: string[] };

const KEY = "qmc.srs.v1";
export const MAX_CARDS = 5000;
const LOG_DAYS = 400;
/** free users: new cards a day (10, or the number in the remote feed config) */
export const freeNewPerDay = () => { try { return freeLimits().cardsPerDay; } catch { return 10; } };
const EMPTY: SrsState = { cards: {}, decks: ["juzamma"], log: {} };

export const readSrsState = (): SrsState => readJSON<SrsState>(KEY, EMPTY);
// website: not silent, so the account sync (src/lib/learn/sync.ts) uploads the cards
const writeState = (s: SrsState) => writeJSON(KEY, s);
export const useSrsState = () => useStored<SrsState>(KEY, EMPTY);

function trim(s: SrsState): SrsState {
  const ids = Object.keys(s.cards);
  if (ids.length > MAX_CARDS) {
    // drop the best-known cards first (longest stability), then the oldest never-studied ones
    const order = ids.sort((a, b) => (s.cards[b].m?.s ?? -s.cards[b].added) - (s.cards[a].m?.s ?? -s.cards[a].added));
    for (const id of order.slice(0, ids.length - MAX_CARDS)) delete s.cards[id];
  }
  const days = Object.keys(s.log).map(Number).sort((a, b) => a - b);
  for (const d of days.slice(0, Math.max(0, days.length - LOG_DAYS))) delete s.log[d];
  return s;
}

/** add cards created from the feed, saved verses or the vocabulary trainer; returns how many were new */
export function addOwnCards(ids: string[]): number {
  const s = readSrsState();
  const day = today();
  let n = 0;
  const cards = { ...s.cards };
  for (const id of ids) if (!cards[id]) { cards[id] = { m: null, added: day, own: 1 }; n++; }
  if (n) writeState(trim({ ...s, cards }));
  return n;
}
/** for the feed: a Quran word the person liked or learned (verse key and word position) */
export const addWordCard = (verseKey: string, position: number) => addOwnCards([`qword:${verseKey}:${position}`]);
/** for the feed / reader: a verse to memorise */
export const addVerseCard = (verseKey: string) => addOwnCards([`verse:${verseKey}`]);

export function setDecks(decks: DeckId[]) { writeState({ ...readSrsState(), decks: [...new Set(decks)] }); }

export function rateCard(id: string, g: Grade) {
  const s = readSrsState();
  const day = today();
  const prev = s.cards[id];
  const wasNew = !prev?.m;
  const cards = { ...s.cards, [id]: { ...(prev ?? { added: day }), m: nextMemory(prev?.m ?? null, g, day) } };
  const l = s.log[day] ?? { n: 0, nw: 0, again: 0 };
  const log = { ...s.log, [day]: { n: l.n + 1, nw: l.nw + (wasNew ? 1 : 0), again: l.again + (g === 1 ? 1 : 0) } };
  writeState(trim({ ...s, cards, log }));
}

/** the free / Pro rules: which decks can be studied and how many new cards today */
export type Limits = { unlimited: boolean };
export const deckOpen = (d: DeckId, lim: Limits) => lim.unlimited || FREE_DECKS.includes(d);
const cardOpen = (id: string, c: Card | undefined, lim: Limits) => lim.unlimited || !!c?.own || deckOpen(deckOf(id), lim);

export type Queue = { due: string[]; fresh: string[]; newToday: number; newLeft: number };
export function buildQueue(s: SrsState, lim: Limits, day = today(), only?: DeckId): Queue {
  const inDeck = (id: string, c?: Card) => !only || (only === "mine" ? !!c?.own : deckOf(id) === only && !c?.own);
  const due = Object.entries(s.cards).filter(([id, c]) => c.m && c.m.due <= day && inDeck(id, c) && cardOpen(id, c, lim))
    .sort((a, b) => a[1].m!.due - b[1].m!.due).map(([id]) => id);
  const newToday = s.log[day]?.nw ?? 0;
  const newLeft = lim.unlimited ? Infinity : Math.max(0, freeNewPerDay() - newToday);
  const fresh: string[] = [];
  const cap = Math.min(newLeft, lim.unlimited ? 30 : freeNewPerDay());
  // own cards first (what the person chose), then the active decks in order
  for (const [id, c] of Object.entries(s.cards)) if (fresh.length < cap && !c.m && inDeck(id, c) && cardOpen(id, c, lim)) fresh.push(id);
  for (const d of only ? [only] : s.decks) {
    if (!deckOpen(d, lim)) continue;
    for (const id of deckItems(d)) { if (fresh.length >= cap) break; if (!s.cards[id] && !fresh.includes(id)) fresh.push(id); }
  }
  return { due, fresh, newToday, newLeft: lim.unlimited ? fresh.length : newLeft };
}

/** consecutive days with at least one review, ending today (or yesterday when nothing was reviewed yet today) */
export function streakOf(s: SrsState, day = today()): number {
  let d = s.log[day]?.n ? day : day - 1, n = 0;
  while (s.log[d]?.n) { n++; d--; }
  return n;
}
/** reviews due on each of the next `days` days (index 0 = today, overdue included) */
export function forecast(s: SrsState, days = 7, day = today()): number[] {
  const out = Array.from({ length: days }, () => 0);
  for (const c of Object.values(s.cards)) if (c.m) out[Math.min(days - 1, Math.max(0, c.m.due - day))] += c.m.due - day < days ? 1 : 0;
  return out;
}

/** cards to study today (due reviews plus the new cards still allowed), for badges and the feed's stories ring */
export function useDueCount(): number {
  const s = useSrsState();
  const { unlimited } = useSrsLimits();
  return useMemo(() => { const q = buildQueue(s, { unlimited }); return q.due.length + q.fresh.length; }, [s, unlimited]);
}

export { DECK_IDS };
