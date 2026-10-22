"use client";
// mirrors mobile/src/features/shams2/take.ts for the website: one recitation take over a whole passage with the
// browser's own speech recognition (Web Speech, ar-SA) and, at the same time, a MediaRecorder recording of the
// microphone. The recording stays in this tab (an object URL, gone on reload); nothing is uploaded by this site.
// Web Speech gives no word times: a word's time is when it first appeared, a little earlier for the recogniser's delay
// (timing only). When the recogniser ends by itself, it is started again until the learner stops; only rapid restarts
// (more than 3 within 2 s) end the take. Errors that mean "no recognition here" (language not supported, network,
// audio capture) lead to the self check ("unavailable"); a take of more than 5 s without a single word is "nothing
// heard" (state silent: back to ready, try again).
import { useCallback, useEffect, useRef, useState } from "react";
import type { HeardWord } from "./blindAlign";

type Rec = { lang: string; continuous: boolean; interimResults: boolean; maxAlternatives: number; start: () => void; stop: () => void; abort: () => void;
  onresult: ((e: { resultIndex: number; results: ArrayLike<ArrayLike<{ transcript: string }> & { isFinal: boolean }> }) => void) | null; onend: (() => void) | null; onerror: ((e: { error: string }) => void) | null };
const Recognition = () => (typeof window === "undefined" ? null : ((window as unknown as Record<string, unknown>).SpeechRecognition ?? (window as unknown as Record<string, unknown>).webkitSpeechRecognition) as (new () => Rec) | null);

export type TakeOut = { transcript: string; words: HeardWord[]; url: string | null; ms: number };
export type TakeState = "idle" | "listening" | "stopping" | "done" | "silent" | "unavailable" | "denied";
const LATENCY = 350;
const UNAVAILABLE = new Set(["language-not-supported", "network", "audio-capture"]);
const SILENT_MS = 5000;
const RAPID = { n: 3, ms: 2000 };

export function useTake() {
  const [state, setState] = useState<TakeState>("idle");
  const [count, setCount] = useState(0);
  const [result, setResult] = useState<TakeOut | null>(null);
  const [supported, setSupported] = useState(true);
  useEffect(() => { setSupported(!!Recognition()); }, []);
  const rec = useRef<Rec | null>(null);
  const media = useRef<MediaRecorder | null>(null);
  const chunks = useRef<Blob[]>([]);
  const live = useRef(false);
  const startAt = useRef(0);
  const done = useRef<HeardWord[]>([]); // words of final results
  const interim = useRef<HeardWord[]>([]);
  const finished = useRef(false);
  const restarts = useRef<number[]>([]);
  const urlRef = useRef<string | null>(null);
  const mounted = useRef(true);

  /** the microphone is released and the recorder dropped (its data is not kept) */
  const dropMedia = useCallback(() => {
    const m = media.current;
    media.current = null;
    if (!m) return;
    m.ondataavailable = null; m.onstop = null;
    try { if (m.state !== "inactive") m.stop(); } catch { /* already stopped */ }
    m.stream.getTracks().forEach((t) => t.stop());
    chunks.current = [];
  }, []);
  /** no usable recognition (or no permission): nothing is kept, the screen offers the self check */
  const fail = useCallback((s: "unavailable" | "denied" | "silent") => {
    live.current = false;
    finished.current = true;
    try { rec.current?.abort(); } catch { /* not running */ }
    dropMedia();
    setState(s);
  }, [dropMedia]);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      live.current = false;
      try { rec.current?.abort(); } catch { /* not running */ }
      dropMedia();
      if (urlRef.current) URL.revokeObjectURL(urlRef.current);
      urlRef.current = null;
    };
  }, [dropMedia]);

  const finish = useCallback(() => {
    if (finished.current) return;
    const words = [...done.current, ...interim.current];
    const ms = Date.now() - startAt.current;
    if (!words.length && ms > SILENT_MS) { fail("silent"); return; }
    finished.current = true;
    live.current = false;
    const end = (url: string | null) => { if (!mounted.current) return; setResult({ transcript: words.map((w) => w.w).join(" "), words, url, ms }); setState("done"); };
    const m = media.current;
    if (m && m.state === "recording") {
      m.onstop = () => {
        m.stream.getTracks().forEach((t) => t.stop());
        if (!mounted.current) return; // gone meanwhile: no object URL is made
        const b = chunks.current.length ? new Blob(chunks.current, { type: m.mimeType || "audio/webm" }) : null;
        if (urlRef.current) URL.revokeObjectURL(urlRef.current);
        urlRef.current = b ? URL.createObjectURL(b) : null;
        end(urlRef.current);
      };
      m.stop();
    } else { m?.stream.getTracks().forEach((t) => t.stop()); end(urlRef.current); }
  }, [fail]);

  const begin = useCallback(() => {
    const R = Recognition();
    if (!R) return;
    const r = new R();
    r.lang = "ar-SA"; r.continuous = true; r.interimResults = true; r.maxAlternatives = 1;
    // a new session starts its result list from zero: what was final so far stays in `done`
    let base = done.current.length;
    r.onresult = (e) => {
      const now = Date.now() - startAt.current;
      const fin: HeardWord[] = [];
      const tmp: string[] = [];
      for (let i = 0; i < e.results.length; i++) {
        const res = e.results[i];
        const ws = res[0].transcript.split(/\s+/).filter(Boolean);
        if (res.isFinal) fin.push(...ws.map((w) => ({ w, t: null as number | null }))); else tmp.push(...ws);
      }
      const prevAll = [...done.current, ...interim.current];
      const all = [...done.current.slice(0, base), ...fin, ...tmp.map((w) => ({ w, t: null as number | null }))];
      const timed = all.map((x, k) => ({ w: x.w, t: prevAll[k]?.t ?? Math.max(0, now - LATENCY) }));
      done.current = timed.slice(0, base + fin.length);
      interim.current = timed.slice(base + fin.length);
      setCount(timed.length);
    };
    r.onerror = (e) => {
      if (e.error === "not-allowed" || e.error === "service-not-allowed") fail("denied");
      else if (UNAVAILABLE.has(e.error)) fail("unavailable");
    };
    r.onend = () => {
      if (finished.current) return;
      const now = Date.now();
      restarts.current = [...restarts.current.filter((x) => now - x < RAPID.ms), now];
      if (live.current && restarts.current.length <= RAPID.n) { done.current = [...done.current, ...interim.current]; interim.current = []; base = done.current.length; try { begin(); } catch { finish(); } }
      else finish();
    };
    rec.current = r;
    r.start();
  }, [fail, finish]);

  const start = useCallback(async () => {
    if (!Recognition()) { setState("unavailable"); return; }
    dropMedia(); // a recorder left from an earlier take
    done.current = []; interim.current = []; finished.current = false; restarts.current = []; chunks.current = [];
    setResult(null); setCount(0);
    let stream: MediaStream | null = null;
    try {
      if (typeof window.MediaRecorder !== "undefined" && navigator.mediaDevices?.getUserMedia) {
        stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        if (!mounted.current) { stream.getTracks().forEach((t) => t.stop()); return; }
        const m = new MediaRecorder(stream);
        m.ondataavailable = (e) => { if (e.data.size) chunks.current.push(e.data); };
        media.current = m;
      }
    } catch { stream?.getTracks().forEach((t) => t.stop()); fail("denied"); return; }
    startAt.current = Date.now();
    live.current = true;
    try { media.current?.start(); begin(); setState("listening"); } catch { fail("unavailable"); }
  }, [begin, dropMedia, fail]);

  const stop = useCallback(() => {
    if (!live.current) return;
    live.current = false;
    setState("stopping");
    try { rec.current?.stop(); } catch { finish(); return; }
    setTimeout(finish, 4000); // never wait for ever
  }, [finish]);

  const reset = useCallback(() => { setResult(null); setCount(0); setState((s) => (s === "unavailable" || s === "denied" ? s : "idle")); }, []);
  return { supported, state, count, result, start, stop, reset };
}
