import { useSyncExternalStore } from "react";
import { writeJSON } from "@/lib/store";
import { VerseEngine } from "@/features/quran/useVerseAudio";

// One verse player for the reader that outlives the surah screen (the website's lib/versePlayback.ts, SoundCloud-style).
// While a reader is attached it decides what happens after a verse; when the learner leaves the reader the session
// carries on here ("headless"): repeat, next verse, loop range. The verse mini bar (VerseMiniPlayer) shows it.
export type Item = { url: string; remote: string };
export type Mode = "learn" | "continuous";
export type Session = {
  chapterId: number; chapterName: string; reciterName: string; reciterFolder: string;
  items: Item[]; idx: number; repeat: number; playsDone: number;
  mode: Mode; loopOn: boolean; loopFrom: number; loopTo: number; speed: number;
};
export type Handlers = { ended?: () => void };
type Snap = { session: Session | null; playing: boolean; attached: boolean };

let engine: VerseEngine | null = null;
let session: Session | null = null;
let attached: { current: Handlers } | null = null;
let snap: Snap = { session: null, playing: false, attached: false };
const subs = new Set<() => void>();

function publish() {
  snap = { session: session ? { ...session } : null, playing: !!engine?.getSnapshot().playing, attached: !!attached };
  subs.forEach((f) => f());
}
export const subscribe = (f: () => void) => { subs.add(f); return () => { subs.delete(f); }; };
export const getSnapshot = () => snap;

/** the shared player of the reader */
export function getEngine(): VerseEngine {
  if (engine) return engine;
  const e = new VerseEngine();
  let was = false;
  e.subscribe(() => { const p = e.getSnapshot().playing; if (p !== was) { was = p; publish(); } });
  e.onEnd.current = () => { if (attached) attached.current.ended?.(); else headlessEnded(); publish(); };
  engine = e;
  return e;
}

const title = (s: Session, i: number) => `${s.chapterName} · ${i + 1}`;

/** move to another verse without the reader (mini bar) */
export function step(d: number, play = true) {
  if (!session) return;
  go(Math.min(Math.max(session.idx + d, 0), session.items.length - 1), play);
}
function go(i: number, play = true) {
  if (!session) return;
  session.idx = i; session.playsDone = 0;
  const it = session.items[i];
  writeJSON("tf:last", { chapter: session.chapterId, verse: i + 1, at: Date.now() });
  if (play) getEngine().play(it.url, { fallback: it.remote, rate: session.speed, title: title(session, i), artist: session.reciterName });
  publish();
}

function headlessEnded() {
  const s = session;
  if (!s) return;
  s.playsDone += 1;
  if (s.playsDone < s.repeat) { getEngine().seekPlay(0); return; }
  if (s.mode === "learn") return; // learn mode waits for the learner
  if (s.loopOn && s.idx >= s.loopTo - 1) { go(Math.max(0, s.loopFrom - 1)); return; }
  if (s.idx < s.items.length - 1) go(s.idx + 1);
}

/** the reader waited between two verses ("your turn") when the learner left: carry on headless */
export function advanceHeadless() {
  const s = session;
  if (!s || attached) return;
  if (s.playsDone > 0 && s.playsDone < s.repeat) { getEngine().seekPlay(0); return; }
  if (s.loopOn && s.idx >= s.loopTo - 1) { go(Math.max(0, s.loopFrom - 1)); return; }
  if (s.idx < s.items.length - 1) go(s.idx + 1);
}

/** play / pause from the mini bar */
export function toggle() {
  const e = getEngine();
  const st = e.getSnapshot();
  if (st.playing) { e.pause(); return; }
  if (!session) return;
  if (!st.ended && st.positionMs > 0 && e.url) e.resume(); else go(session.idx);
}

export function attach(h: { current: Handlers }) { getEngine(); attached = h; publish(); }
export const isAttached = (h: { current: Handlers }) => attached === h;
export function detach(h: { current: Handlers }, playsDone: number) {
  if (attached !== h) return;
  attached = null;
  if (session) session.playsDone = playsDone;
  const st = engine?.getSnapshot();
  // nothing is playing: no background session (paused, never started)
  if (!st || (!st.playing && !st.ended)) { session = null; engine?.clearLockScreen(); }
  publish();
}
export function sync(s: Session) { session = { ...s }; publish(); }
export function current() { return session; }
export function stop() {
  engine?.stop();
  engine?.clearLockScreen();
  session = null;
  publish();
}

export function useVersePlayback() { return useSyncExternalStore(subscribe, getSnapshot); }
