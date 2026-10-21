"use client";
// Sound and voice for the learning screens, mirrors mobile/src/features/coursekit/audio.ts and voice.ts and the
// recording parts of the app's exams, with browser APIs:
//   useClip()        one recording at a time (HTMLAudioElement), "error" when a file cannot be loaded
//   tone(ok)         the two tiny feedback tones (WebAudio, like ArabicLesson.tsx)
//   useArabicVoice() the device's Arabic voice (speechSynthesis) for letters and syllables, hidden without one
//   useRecorder()    MediaRecorder: record the learner, keep the Blob in this tab
//   useWordCheck()   Web Speech API (SpeechRecognition, ar-SA): which words of a verse were heard; unsupported → skipped
import { useCallback, useEffect, useRef, useState } from "react";
import { align } from "@/lib/recite";

export const announceAudio = () => { try { window.dispatchEvent(new Event("tf-audio-start")); } catch { /* server */ } };

export type ClipState = "idle" | "loading" | "playing" | "error";
export function useClip() {
  const el = useRef<HTMLAudioElement | null>(null);
  const [state, setState] = useState<ClipState>("idle");
  const stop = useCallback(() => { const a = el.current; el.current = null; if (a) { a.pause(); a.src = ""; } setState((s) => (s === "error" ? s : "idle")); }, []);
  const play = useCallback((url: string, rate = 1) => {
    if (el.current) { el.current.pause(); el.current = null; }
    const a = new Audio(url);
    a.playbackRate = rate;
    el.current = a;
    setState("loading");
    a.onplaying = () => { if (el.current === a) setState("playing"); };
    a.onended = () => { if (el.current === a) setState("idle"); };
    a.onerror = () => { if (el.current === a) setState("error"); };
    announceAudio();
    a.play().catch(() => { if (el.current === a) setState("error"); });
  }, []);
  useEffect(() => () => { el.current?.pause(); }, []);
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

export function useArabicVoice(): { canSpeak: boolean; speak: (text: string) => void } {
  const [voice, setVoice] = useState<SpeechSynthesisVoice | null>(null);
  useEffect(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    const find = () => setVoice(window.speechSynthesis.getVoices().find((v) => v.lang.toLowerCase().startsWith("ar")) ?? null);
    find();
    window.speechSynthesis.addEventListener?.("voiceschanged", find);
    return () => window.speechSynthesis.removeEventListener?.("voiceschanged", find);
  }, []);
  const speak = useCallback((text: string) => {
    if (!voice) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.voice = voice; u.lang = voice.lang; u.rate = 0.7;
    window.speechSynthesis.speak(u);
  }, [voice]);
  return { canSpeak: !!voice, speak };
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
