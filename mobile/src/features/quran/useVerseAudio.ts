import { useCallback, useEffect, useRef, useState } from "react";
import { createAudioPlayer, setAudioModeAsync, type AudioPlayer, type AudioStatus } from "expo-audio";
import { onWebEvent } from "@/lib/webshim";
import { reportPlaying } from "@/features/progress/Rewards";

let nextId = 1;

// One verse player for the reader and the Shams Method (the website's lib/versePlayback.ts): plays a verse file,
// reports the position every 50 ms for word highlighting, can start at a word (backward build-up), and falls back
// to Quran.com audio when a self-hosted file is missing. Radio and reader never play at the same time.

let modeSet = false;
async function ensureMode() {
  if (modeSet) return;
  modeSet = true;
  await setAudioModeAsync({ playsInSilentMode: true, shouldPlayInBackground: true, interruptionMode: "doNotMix" }).catch(() => { modeSet = false; });
}

export type VerseAudio = {
  playing: boolean;
  positionMs: number;
  durationMs: number;
  /** load a verse file and play it (from = ms offset); onEnd fires when it finished */
  play: (url: string, opts?: { fallback?: string; fromMs?: number; rate?: number; title?: string; artist?: string }) => void;
  /** play the current file again from a position */
  seekPlay: (fromMs: number) => void;
  pause: () => void;
  resume: () => void;
  stop: () => void;
  setRate: (rate: number) => void;
  onEnd: React.MutableRefObject<(() => void) | null>;
};

export function useVerseAudio(): VerseAudio {
  const player = useRef<AudioPlayer | null>(null);
  const onEnd = useRef<(() => void) | null>(null);
  const current = useRef<{ url: string; fallback?: string; rate: number; startAt: number; triedFallback: boolean } | null>(null);
  const loadTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [playing, setPlaying] = useState(false);
  const id = useRef(nextId++);
  const [positionMs, setPos] = useState(0);
  const [durationMs, setDur] = useState(0);

  const get = useCallback(() => {
    if (!player.current) {
      const p = createAudioPlayer(null, { updateInterval: 50 });
      p.addListener("playbackStatusUpdate", (s: AudioStatus) => {
        setPlaying(s.playing);
        reportPlaying(s.playing); // listening counts as active learning time (points, streak)
        setPos(Math.round(s.currentTime * 1000));
        if (s.duration) setDur(Math.round(s.duration * 1000));
        const c = current.current;
        if (s.isLoaded && c && c.startAt >= 0) {
          const at = c.startAt; c.startAt = -1;
          if (loadTimer.current) { clearTimeout(loadTimer.current); loadTimer.current = null; }
          void p.seekTo(at / 1000).then(() => { p.setPlaybackRate(c.rate); p.play(); });
        }
        if (s.didJustFinish) { setPlaying(false); onEnd.current?.(); }
      });
      player.current = p;
    }
    return player.current;
  }, []);

  useEffect(() => {
    const offRadio = onWebEvent("tf-radio-start", () => player.current?.pause());
    // another player started (a lesson word, the verse of the day, the reader): only one recitation at a time
    const offAudio = onWebEvent("tf-audio-start", (e) => { if (e.detail !== id.current) player.current?.pause(); });
    return () => { offRadio(); offAudio(); if (loadTimer.current) clearTimeout(loadTimer.current); reportPlaying(false); player.current?.remove(); player.current = null; };
  }, []);

  const load = useCallback((url: string) => {
    const p = get();
    p.replace({ uri: url });
    // a missing self-hosted file never loads: switch to Quran.com audio after a few seconds
    if (loadTimer.current) clearTimeout(loadTimer.current);
    loadTimer.current = setTimeout(() => {
      const c = current.current;
      if (c && c.startAt >= 0 && c.fallback && !c.triedFallback) { c.triedFallback = true; p.replace({ uri: c.fallback }); }
    }, 6000);
  }, [get]);

  const play = useCallback<VerseAudio["play"]>((url, opts = {}) => {
    void ensureMode();
    (globalThis as unknown as { window: { dispatchEvent: (e: unknown) => void } }).window.dispatchEvent(new CustomEvent("tf-audio-start", { detail: id.current }));
    const p = get();
    const rate = opts.rate ?? 1;
    if (current.current?.url === url && p.isLoaded) {
      current.current.rate = rate;
      void p.seekTo((opts.fromMs ?? 0) / 1000).then(() => { p.setPlaybackRate(rate); p.play(); });
    } else {
      current.current = { url, fallback: opts.fallback || undefined, rate, startAt: opts.fromMs ?? 0, triedFallback: false };
      load(url);
    }
    if (opts.title) { try { p.setActiveForLockScreen(true, { title: opts.title, artist: opts.artist ?? "Quran Masterclass" }); } catch { /* not supported */ } }
  }, [get, load]);

  const seekPlay = useCallback((fromMs: number) => {
    const p = get();
    const rate = current.current?.rate ?? 1;
    void p.seekTo(fromMs / 1000).then(() => { p.setPlaybackRate(rate); p.play(); });
  }, [get]);

  const pause = useCallback(() => player.current?.pause(), []);
  const resume = useCallback(() => { void ensureMode(); player.current?.play(); }, []);
  const stop = useCallback(() => { player.current?.pause(); setPlaying(false); }, []);
  const setRate = useCallback((r: number) => { if (current.current) current.current.rate = r; player.current?.setPlaybackRate(r); }, []);

  return { playing, positionMs, durationMs, play, seekPlay, pause, resume, stop, setRate, onEnd };
}

/** Arabic-Indic digits for verse numbers (the website's toAr) */
export const toAr = (n: number) => String(n).replace(/\d/g, (d) => "٠١٢٣٤٥٦٧٨٩"[Number(d)]);
