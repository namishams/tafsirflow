"use client";
// Sound and voice for the learning screens, mirrors mobile/src/features/coursekit/audio.ts and voice.ts and the
// recording parts of the app's exams, with browser APIs:
//   useClip()        one recording at a time on the page (one shared HTMLAudioElement), "error" / "fallback" when a
//                    file cannot be played within 5 s; preloadClips() fetches the next word recordings
//   tone(ok)         the two tiny feedback tones (WebAudio, like ArabicLesson.tsx)
//   useArabicVoice() the device's Arabic voice (speechSynthesis) for letters and syllables, hidden without one
//   useRecorder()    MediaRecorder: record the learner, keep the Blob in this tab
//   useWordCheck()   Web Speech API (SpeechRecognition, ar-SA): which words of a verse were heard; unsupported → skipped
import { useCallback, useEffect, useRef, useState } from "react";
import { align } from "@/lib/recite";

export const announceAudio = () => { try { window.dispatchEvent(new Event("tf-audio-start")); } catch { /* server */ } };

// ---------- recordings ----------
// Measured 21.10.2026: a word recording is 30–100 KB and comes from Quran.com's CDN in about 0.2 s, but a new
// <audio> element per tap, no time limit and no preloading meant a spinner that could run forever (stalled request),
// silence on iOS Safari when a fresh element was started outside a tap, and a network round trip on every tap. So:
//   - one <audio> element for the whole page (unlocked by the first tap, reused for every recording)
//   - word recordings are fetched once (second host name when the first gives no answer, 404 = missing) and kept as
//     blob URLs (at most 80); lessons preload the next ones with preloadClips()
//   - the first sound has 5 s; after that the state is "error", or "fallback" when the caller's fallback (the device
//     voice) spoke instead; the download goes on, so "try again" plays at once
const WBW = /^https:\/\/(?:audio\.qurancdn\.com|verses\.quran\.com)\/wbw\/\d{3}_\d{3}_\d{3}\.mp3$/;
const altHost = (url: string) => url.replace("https://audio.qurancdn.com/", "https://verses.quran.com/");
const MAX_BLOBS = 80;
const FIRST_SOUND_MS = 5000;
const blobs = new Map<string, string>(); // recording url → blob url, oldest first
const jobs = new Map<string, Promise<string>>();
const missing = new Set<string>();
function cachedBlob(url: string): string | null {
  const b = blobs.get(url);
  if (!b) return null;
  blobs.delete(url); blobs.set(url, b); // most recently used last
  return b;
}
function remember(url: string, blobUrl: string) {
  blobs.set(url, blobUrl);
  for (const [k, v] of blobs) {
    if (blobs.size <= MAX_BLOBS) break;
    if (shared?.src === v) continue; // never the one that is playing
    blobs.delete(k);
    URL.revokeObjectURL(v);
  }
}
function fetchClip(url: string): Promise<string> {
  const hit = cachedBlob(url);
  if (hit) return Promise.resolve(hit);
  if (missing.has(url)) return Promise.reject(new Error("missing"));
  let job = jobs.get(url);
  if (!job) {
    job = (async () => {
      let last: unknown = null;
      for (const [src, ms] of [[url, 8000], [altHost(url), 6000]] as const) {
        const ctrl = new AbortController();
        const timer = setTimeout(() => ctrl.abort(), ms);
        try {
          const r = await fetch(src, { signal: ctrl.signal });
          if (r.status >= 400 && r.status < 500) { missing.add(url); throw new Error(`HTTP ${r.status}`); }
          if (!r.ok) throw new Error(`HTTP ${r.status}`);
          const b = URL.createObjectURL(await r.blob());
          remember(url, b);
          return b;
        } catch (e) { last = e; } finally { clearTimeout(timer); }
        if (missing.has(url) || altHost(url) === url) break;
      }
      throw last ?? new Error("download failed");
    })().finally(() => jobs.delete(url));
    jobs.set(url, job);
  }
  return job;
}
const waiting: string[] = [];
let running = 0;
function pump() {
  while (running < 2 && waiting.length) {
    const u = waiting.shift()!;
    running++;
    void fetchClip(u).catch(() => undefined).finally(() => { running--; pump(); });
  }
}
/** fetches the word recordings a lesson needs next (two at a time, the newest request first) */
export function preloadClips(urls: string[]) {
  if (typeof window === "undefined") return;
  const fresh = urls.filter((u, i) => WBW.test(u) && urls.indexOf(u) === i && !blobs.has(u) && !jobs.has(u) && !missing.has(u));
  for (const u of fresh) { const at = waiting.indexOf(u); if (at >= 0) waiting.splice(at, 1); }
  waiting.unshift(...fresh);
  waiting.length = Math.min(waiting.length, 40);
  pump();
}

export type ClipState = "idle" | "loading" | "playing" | "error" | "fallback";
/** rate: playback speed; fallback: called when the recording cannot be played in time, true when it spoke instead */
export type ClipOpts = { rate?: number; fallback?: () => boolean };
let shared: HTMLAudioElement | null = null;
const audioEl = () => (shared ??= new Audio());
type Active = { owner: number; url: string; phase: "loading" | "playing" | "done"; timer: ReturnType<typeof setTimeout> | null };
let active: Active | null = null;
let ownerSeq = 0;
const owners = new Map<number, (s: ClipState) => void>();
const tell = (owner: number, s: ClipState) => owners.get(owner)?.(s);
function quiet(a: Active) {
  if (a.timer) { clearTimeout(a.timer); a.timer = null; }
  const el = shared;
  if (el) { el.onplaying = el.onended = el.onerror = null; try { el.pause(); } catch { /* not started */ } }
}
/** stops the recording that is playing (its button goes back to idle) */
export function stopClips() { const a = active; if (!a) return; active = null; quiet(a); tell(a.owner, "idle"); }

function playClip(owner: number, url: string, opts: ClipOpts) {
  const el = audioEl();
  const cur = active;
  if (cur && cur.owner === owner && cur.url === url) {
    if (cur.phase === "loading") return; // a second tap while it loads changes nothing
    announceAudio();
    stopVoice();
    el.currentTime = 0;
    tell(owner, "playing");
    void el.play().catch(() => tell(owner, "idle"));
    return;
  }
  if (cur) { active = null; quiet(cur); if (cur.owner !== owner) tell(cur.owner, "idle"); }
  stopVoice();
  const a: Active = { owner, url, phase: "loading", timer: null };
  active = a;
  const live = () => active === a;
  tell(owner, "loading");
  announceAudio();
  const fail = () => {
    if (!live()) return;
    active = null;
    quiet(a);
    tell(owner, opts.fallback?.() ? "fallback" : "error");
  };
  a.timer = setTimeout(fail, FIRST_SOUND_MS);
  let triedAlt = false;
  const start = (src: string) => {
    el.onplaying = () => { if (!live()) return; if (a.timer) { clearTimeout(a.timer); a.timer = null; } a.phase = "playing"; tell(owner, "playing"); };
    el.onended = () => { if (!live()) return; a.phase = "done"; tell(owner, "idle"); };
    el.onerror = () => {
      if (!live()) return;
      // the network file did not load: once more under Quran.com's second host name, then give up
      if (!triedAlt && src === url && altHost(url) !== url) { triedAlt = true; start(altHost(url)); return; }
      fail();
    };
    el.src = src;
    el.playbackRate = opts.rate ?? 1;
    el.play().catch((e: unknown) => {
      if (!live()) return;
      // the browser blocked sound without a tap: the button stays, the learner taps it
      if ((e as { name?: string } | null)?.name === "NotAllowedError") { active = null; quiet(a); tell(owner, "idle"); }
      // other errors arrive through onerror
    });
  };
  // the element is started inside the tap (iOS Safari allows sound only there): from the blob when it is already
  // here, otherwise from the network while the blob is fetched for the next time
  const isWord = WBW.test(url);
  const hit = isWord ? cachedBlob(url) : null;
  if (!hit && missing.has(url)) { fail(); return; }
  start(hit ?? url);
  if (isWord && !hit) void fetchClip(url).catch(() => undefined);
}

/** one recording at a time on the whole page; a file that cannot be played in time turns the state into "error", or
 *  into "fallback" when opts.fallback spoke instead */
export function useClip() {
  const id = useRef(0);
  if (!id.current) id.current = ++ownerSeq;
  const [state, setState] = useState<ClipState>("idle");
  useEffect(() => {
    const me = id.current;
    owners.set(me, setState);
    return () => { owners.delete(me); const a = active; if (a && a.owner === me) { active = null; quiet(a); } };
  }, []);
  const play = useCallback((url: string, opts: ClipOpts | number = {}) => playClip(id.current, url, typeof opts === "number" ? { rate: opts } : opts), []);
  const stop = useCallback(() => {
    const a = active;
    if (a && a.owner === id.current) stopClips();
    else setState((s) => (s === "loading" || s === "playing" ? "idle" : s));
  }, []);
  return { state, play, stop };
}

let ctx: AudioContext | null = null;
/** a tiny tone for a right (660 → 880 Hz) or a wrong (220 Hz) answer; silent when sound is unavailable */
export function tone(ok: boolean) {
  try {
    const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AC) return;
    ctx ??= new AC();
    const o = ctx.createOscillator(), g = ctx.createGain(), t = ctx.currentTime;
    o.type = "sine";
    o.frequency.setValueAtTime(ok ? 660 : 220, t);
    if (ok) o.frequency.setValueAtTime(880, t + 0.09);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.16, t + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, t + (ok ? 0.28 : 0.25));
    o.connect(g).connect(ctx.destination);
    o.start(t); o.stop(t + 0.3);
  } catch { /* sound is optional */ }
}

// ---------- the device voice ----------
// Looked up once per page (the browser lists its voices a moment after loading, "voiceschanged"); a voice on the
// device (localService) is preferred: network voices are slow and silent offline. Chrome drops an utterance that is
// spoken right after cancel(), and it forgets utterances that nothing references (no "end" event), so cancel() runs
// only when something is speaking and the current utterance is kept.
let voice: SpeechSynthesisVoice | null = null;
let voiceKnown = false;
const voiceSubs = new Set<() => void>();
function pickVoice() {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) { voiceKnown = true; return; }
  const all = window.speechSynthesis.getVoices();
  const ar = all.filter((v) => v.lang.toLowerCase().startsWith("ar"));
  const v = ar.find((x) => x.localService) ?? ar[0] ?? null;
  const had = voiceKnown;
  if (all.length) voiceKnown = true; // an empty list only means "not loaded yet"
  if (v !== voice || had !== voiceKnown) { voice = v; voiceSubs.forEach((f) => f()); }
}
let voiceWatch = false;
function watchVoices() {
  if (voiceWatch || typeof window === "undefined") return;
  voiceWatch = true;
  if (!("speechSynthesis" in window)) { voiceKnown = true; return; }
  pickVoice();
  window.speechSynthesis.addEventListener?.("voiceschanged", pickVoice);
  // some browsers never fire "voiceschanged" when they have no voices: after 1.5 s the answer counts as final
  setTimeout(() => { if (!voiceKnown) { voiceKnown = true; voiceSubs.forEach((f) => f()); } }, 1500);
}
let utter: SpeechSynthesisUtterance | null = null;
function stopVoice() {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  const s = window.speechSynthesis;
  if (s.speaking || s.pending) s.cancel();
  utter = null;
}
/** says Arabic text with the device voice (a recording stops first); false without an Arabic voice */
export function speakArabic(text: string, cb: { onStart?: () => void; onEnd?: () => void } = {}): boolean {
  watchVoices();
  if (!voice || !text) return false;
  stopClips();
  stopVoice();
  announceAudio();
  const s = window.speechSynthesis;
  const u = new SpeechSynthesisUtterance(text);
  u.voice = voice; u.lang = voice.lang; u.rate = 0.7;
  u.onstart = () => cb.onStart?.();
  u.onend = u.onerror = () => { if (utter === u) utter = null; cb.onEnd?.(); };
  utter = u;
  if (s.paused) s.resume();
  s.speak(u);
  return true;
}

export type VoiceState = "idle" | "starting" | "speaking";
export function useArabicVoice(): { canSpeak: boolean; ready: boolean; state: VoiceState; speak: (text: string) => void } {
  // known only after mounting (the server renders without a voice; no hydration mismatch)
  const [mounted, setMounted] = useState(false);
  const [, force] = useState(0);
  const [state, setState] = useState<VoiceState>("idle");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const alive = useRef(true);
  useEffect(() => {
    alive.current = true;
    const f = () => force((n) => n + 1);
    voiceSubs.add(f);
    watchVoices();
    setMounted(true);
    return () => { alive.current = false; voiceSubs.delete(f); if (timer.current) clearTimeout(timer.current); };
  }, []);
  const speak = useCallback((text: string) => {
    if (timer.current) clearTimeout(timer.current);
    const end = () => { if (timer.current) { clearTimeout(timer.current); timer.current = null; } if (alive.current) setState("idle"); };
    if (!speakArabic(text, { onStart: () => { if (alive.current) setState("speaking"); }, onEnd: end })) return;
    setState("starting");
    // a voice that never reports back does not keep the button busy
    timer.current = setTimeout(end, 3000 + text.length * 200);
  }, []);
  return { canSpeak: mounted && !!voice, ready: mounted && voiceKnown, state, speak };
}
/** the device voice, waiting at most `ms` for the browser's voice list */
export function arabicVoiceWithin(ms: number): Promise<SpeechSynthesisVoice | null> {
  watchVoices();
  if (voiceKnown) return Promise.resolve(voice);
  return new Promise((resolve) => {
    const done = () => { voiceSubs.delete(f); clearTimeout(t); resolve(voice); };
    const f = () => { if (voiceKnown) done(); };
    const t = setTimeout(done, ms);
    voiceSubs.add(f);
  });
}

export type RecState = "idle" | "recording" | "done" | "denied" | "unsupported";
export function useRecorder() {
  const [state, setState] = useState<RecState>("idle");
  const [blob, setBlob] = useState<Blob | null>(null);
  const [url, setUrl] = useState<string | null>(null);
  const media = useRef<MediaRecorder | null>(null);
  // known after hydration (false during server rendering)
  const [supported, setSupported] = useState(false);
  useEffect(() => { setSupported(typeof window.MediaRecorder !== "undefined" && !!navigator.mediaDevices?.getUserMedia); }, []);
  useEffect(() => () => { media.current?.stream.getTracks().forEach((t) => t.stop()); }, []);
  useEffect(() => () => { if (url) URL.revokeObjectURL(url); }, [url]);
  const start = useCallback(async () => {
    if (typeof window.MediaRecorder === "undefined" || !navigator.mediaDevices?.getUserMedia) { setState("unsupported"); return false; }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const m = new MediaRecorder(stream);
      const chunks: Blob[] = [];
      m.ondataavailable = (e) => { if (e.data.size) chunks.push(e.data); };
      m.onstop = () => {
        stream.getTracks().forEach((t) => t.stop());
        const b = new Blob(chunks, { type: m.mimeType || "audio/webm" });
        setBlob(b); setUrl(URL.createObjectURL(b)); setState("done");
      };
      media.current = m; setBlob(null); setUrl(null);
      m.start(); setState("recording");
      return true;
    } catch { setState("denied"); return false; }
  }, []);
  const stop = useCallback(() => { if (media.current?.state === "recording") media.current.stop(); }, []);
  const reset = useCallback(() => { setBlob(null); setUrl(null); setState("idle"); }, []);
  return { supported, state, blob, url, start, stop, reset };
}

type Rec = { lang: string; continuous: boolean; interimResults: boolean; maxAlternatives: number; start: () => void; stop: () => void; abort: () => void;
  onresult: ((e: { resultIndex: number; results: ArrayLike<ArrayLike<{ transcript: string }> & { isFinal: boolean }> }) => void) | null; onend: (() => void) | null; onerror: ((e: { error: string }) => void) | null };
const Recognition = () => (typeof window === "undefined" ? null : ((window as unknown as Record<string, unknown>).SpeechRecognition ?? (window as unknown as Record<string, unknown>).webkitSpeechRecognition) as (new () => Rec) | null);
export const speechSupported = () => !!Recognition();

export type CheckState = "idle" | "listening" | "done" | "unsupported" | "denied" | "failed";
/** listens in Arabic and marks which of the given words were recited; ok/score update while listening */
export function useWordCheck(words: string[]) {
  const [state, setState] = useState<CheckState>("idle");
  const [ok, setOk] = useState<boolean[] | null>(null);
  const [heard, setHeard] = useState("");
  const rec = useRef<Rec | null>(null);
  const finalText = useRef("");
  const key = words.join(" ");
  useEffect(() => { setOk(null); setHeard(""); setState((s) => (s === "unsupported" ? s : "idle")); }, [key]);
  useEffect(() => () => { rec.current?.abort(); }, []);
  const start = useCallback(() => {
    const R = Recognition();
    if (!R) { setState("unsupported"); return; }
    rec.current?.abort();
    finalText.current = ""; setHeard(""); setOk(null);
    const r = new R();
    r.lang = "ar-SA"; r.continuous = true; r.interimResults = true; r.maxAlternatives = 1;
    r.onresult = (e) => {
      let interim = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const res = e.results[i];
        if (res.isFinal) finalText.current += ` ${res[0].transcript}`; else interim += ` ${res[0].transcript}`;
      }
      const text = `${finalText.current} ${interim}`.trim();
      setHeard(text);
      setOk(align(words, text).ok);
    };
    r.onerror = (e) => setState(e.error === "not-allowed" || e.error === "service-not-allowed" ? "denied" : e.error === "no-speech" || e.error === "aborted" ? "done" : "failed");
    r.onend = () => setState((s) => (s === "listening" ? "done" : s));
    rec.current = r;
    try { r.start(); setState("listening"); } catch { setState("failed"); }
  }, [key]); // eslint-disable-line react-hooks/exhaustive-deps
  const stop = useCallback(() => { rec.current?.stop(); }, []);
  const score = ok && words.length ? ok.filter(Boolean).length / words.length : 0;
  const [supported, setSupported] = useState(false);
  useEffect(() => { setSupported(speechSupported()); }, []);
  return { supported, state, ok, score, heard, start, stop };
}
