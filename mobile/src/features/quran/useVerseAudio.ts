import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { createAudioPlayer, setAudioModeAsync, type AudioPlayer, type AudioStatus } from "expo-audio";
import { onWebEvent } from "@/lib/webshim";
import { RECITERS, type Reciter } from "@/lib/quran";
import { trackListen, trackVerseDone } from "@/web/listen";
import { reportPlaying } from "@/features/progress/Rewards";

let nextId = 1;

// One verse player for the reader and the Shams Method (the website's lib/versePlayback.ts): plays a verse file,
// reports the position every 50 ms for word highlighting, can start at a word (backward build-up), and falls back
// to Quran.com audio when a self-hosted file is missing. Radio and reader never play at the same time.
// Listening statistics like the website: only time that really played counts, in small steps (seeks left out), and
// every finished verse counts once; surah and reciter come from the verse file (…/<folder>/<SSSAAA>.mp3).

let modeSet = false;
async function ensureMode() {
  if (modeSet) return;
  modeSet = true;
  await setAudioModeAsync({ playsInSilentMode: true, shouldPlayInBackground: true, interruptionMode: "doNotMix" }).catch(() => { modeSet = false; });
}

// reciter folder -> name (the website reports the reciter's name to the listening statistics)
const names = new Map<string, string>(RECITERS.map((r) => [r.folder, r.name]));
export function registerReciters(list: Reciter[]) { for (const r of list) names.set(r.folder, r.name); }
type Track = { surah: number; reciter: string };
function trackOf(url: string): Track | null {
  const m = url.match(/\/([^/?#]+)\/(\d{3})(\d{3})\.mp3(?:[?#]|$)/);
  if (!m) return null;
  const surah = Number(m[2]);
  if (!(surah >= 1 && surah <= 114)) return null;
  const folder = decodeURIComponent(m[1]);
  return { surah, reciter: names.get(folder) ?? folder };
}

export type PlayOpts = { fallback?: string; fromMs?: number; rate?: number; title?: string; artist?: string; track?: Track | false };
export type VerseSnap = { playing: boolean; positionMs: number; durationMs: number; ended: boolean; loadedUrl: string; fallback: boolean };

export type VerseAudio = VerseSnap & {
  /** load a verse file and play it (from = ms offset); onEnd fires when it finished */
  play: (url: string, opts?: PlayOpts) => void;
  /** play the current file again from a position */
  seekPlay: (fromMs: number) => void;
  /** move to a position without changing play/pause */
  seek: (ms: number) => void;
  pause: () => void;
  resume: () => void;
  stop: () => void;
  setRate: (rate: number) => void;
  onEnd: { current: (() => void) | null };
};

/** A verse player outside React: one per screen (useVerseAudio) or one shared session (features/reader/versePlayback). */
export class VerseEngine {
  readonly id = nextId++;
  readonly onEnd: { current: (() => void) | null } = { current: null };
  private p: AudioPlayer | null = null;
  private cur: { url: string; fallback?: string; rate: number; startAt: number; triedFallback: boolean; track: Track | null; loaded: string } | null = null;
  private loadTimer: ReturnType<typeof setTimeout> | null = null;
  private snap: VerseSnap = { playing: false, positionMs: 0, durationMs: 0, ended: false, loadedUrl: "", fallback: false };
  private subs = new Set<() => void>();
  private offs: (() => void)[] = [];
  private lastT = -1;

  subscribe = (f: () => void) => { this.subs.add(f); return () => { this.subs.delete(f); }; };
  getSnapshot = () => this.snap;
  private set(p: Partial<VerseSnap>) {
    let changed = false;
    for (const k of Object.keys(p) as (keyof VerseSnap)[]) if (this.snap[k] !== p[k]) { changed = true; break; }
    if (!changed) return;
    this.snap = { ...this.snap, ...p };
    this.subs.forEach((f) => f());
  }

  private count(s: AudioStatus) {
    const tr = this.cur?.track;
    if (!tr) return;
    if (s.playing) {
      const d = s.currentTime - this.lastT;
      if (this.lastT >= 0 && d > 0 && d < 2) trackListen(d / (this.cur?.rate || 1), tr.surah, tr.reciter);
      this.lastT = s.currentTime;
    } else this.lastT = -1;
  }

  private get(): AudioPlayer {
    if (this.p) return this.p;
    if (!this.offs.length) {
      this.offs.push(onWebEvent("tf-radio-start", () => this.p?.pause()));
      // another player started (a lesson word, the verse of the day, the reader): only one recitation at a time
      this.offs.push(onWebEvent("tf-audio-start", (e) => { if (e.detail !== this.id) this.p?.pause(); }));
    }
    const p = createAudioPlayer(null, { updateInterval: 50 });
    p.addListener("playbackStatusUpdate", (s: AudioStatus) => {
      if (s.playing !== this.snap.playing) reportPlaying(s.playing); // listening counts as active learning time (points, streak)
      this.count(s);
      const c = this.cur;
      const patch: Partial<VerseSnap> = { playing: s.playing, positionMs: Math.round(s.currentTime * 1000) };
      if (s.duration) patch.durationMs = Math.round(s.duration * 1000);
      if (s.playing) patch.ended = false;
      if (s.isLoaded && c && c.startAt >= 0) {
        const at = c.startAt; c.startAt = -1;
        patch.loadedUrl = c.loaded; patch.fallback = c.loaded !== c.url;
        if (this.loadTimer) { clearTimeout(this.loadTimer); this.loadTimer = null; }
        this.lastT = -1;
        void p.seekTo(at / 1000).then(() => { p.setPlaybackRate(c.rate); p.play(); });
      }
      if (s.didJustFinish) {
        patch.playing = false; patch.ended = true;
        this.lastT = -1;
        if (c?.track) trackVerseDone(c.track.surah, c.track.reciter);
      }
      this.set(patch);
      if (s.didJustFinish) this.onEnd.current?.();
    });
    this.p = p;
    return p;
  }

  private load(url: string) {
    const p = this.get();
    if (this.cur) this.cur.loaded = url;
    p.replace({ uri: url });
    // a missing self-hosted file never loads: switch to Quran.com audio after a few seconds
    if (this.loadTimer) clearTimeout(this.loadTimer);
    this.loadTimer = setTimeout(() => {
      const c = this.cur;
      if (c && c.startAt >= 0 && c.fallback && !c.triedFallback) { c.triedFallback = true; c.loaded = c.fallback; p.replace({ uri: c.fallback }); }
    }, 6000);
  }

  play = (url: string, opts: PlayOpts = {}) => {
    void ensureMode();
    (globalThis as unknown as { window: { dispatchEvent: (e: unknown) => void } }).window.dispatchEvent(new CustomEvent("tf-audio-start", { detail: this.id }));
    const p = this.get();
    const rate = opts.rate ?? 1;
    const track = opts.track === false ? null : opts.track ?? trackOf(url);
    this.lastT = -1;
    if (this.cur?.url === url && p.isLoaded) {
      this.cur.rate = rate; this.cur.track = track;
      void p.seekTo((opts.fromMs ?? 0) / 1000).then(() => { p.setPlaybackRate(rate); p.play(); });
    } else {
      this.cur = { url, fallback: opts.fallback || undefined, rate, startAt: opts.fromMs ?? 0, triedFallback: false, track, loaded: url };
      this.set({ durationMs: 0, positionMs: opts.fromMs ?? 0, ended: false });
      this.load(url);
    }
    if (opts.title) { try { p.setActiveForLockScreen(true, { title: opts.title, artist: opts.artist ?? "Quran Masterclass" }); } catch { /* not supported */ } }
  };
  seekPlay = (fromMs: number) => {
    const p = this.get();
    const rate = this.cur?.rate ?? 1;
    this.lastT = -1;
    (globalThis as unknown as { window: { dispatchEvent: (e: unknown) => void } }).window.dispatchEvent(new CustomEvent("tf-audio-start", { detail: this.id }));
    void p.seekTo(fromMs / 1000).then(() => { p.setPlaybackRate(rate); p.play(); });
  };
  seek = (ms: number) => { this.lastT = -1; const p = this.p; if (p) void p.seekTo(Math.max(0, ms) / 1000); };
  pause = () => { this.p?.pause(); };
  resume = () => {
    void ensureMode();
    (globalThis as unknown as { window: { dispatchEvent: (e: unknown) => void } }).window.dispatchEvent(new CustomEvent("tf-audio-start", { detail: this.id }));
    this.p?.play();
  };
  stop = () => { this.p?.pause(); this.set({ playing: false }); };
  setRate = (r: number) => { if (this.cur) this.cur.rate = r; this.p?.setPlaybackRate(r); };
  /** the file that is loaded (or loading) */
  get url() { return this.cur?.url ?? ""; }
  /** lock screen entry off (the session ended) */
  clearLockScreen() { try { this.p?.clearLockScreenControls(); } catch { /* not supported */ } }

  dispose() {
    this.offs.forEach((f) => f()); this.offs = [];
    if (this.loadTimer) clearTimeout(this.loadTimer);
    if (this.snap.playing) reportPlaying(false);
    this.p?.remove(); this.p = null;
    this.cur = null;
  }
}

/** state + controls of an engine for a component */
export function useEngine(engine: VerseEngine): VerseAudio {
  const s = useSyncExternalStore(engine.subscribe, engine.getSnapshot);
  return { ...s, play: engine.play, seekPlay: engine.seekPlay, seek: engine.seek, pause: engine.pause, resume: engine.resume, stop: engine.stop, setRate: engine.setRate, onEnd: engine.onEnd };
}

/** a verse player that belongs to one screen and stops with it */
export function useVerseAudio(): VerseAudio {
  const [engine] = useState(() => new VerseEngine());
  const live = useRef(engine);
  useEffect(() => () => live.current.dispose(), []);
  return useEngine(engine);
}

/** Arabic-Indic digits for verse numbers (the website's toAr) */
export const toAr = (n: number) => String(n).replace(/\d/g, (d) => "٠١٢٣٤٥٦٧٨٩"[Number(d)]);
