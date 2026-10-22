import { useCallback, useEffect, useRef, useState } from "react";
import { Directory, File, Paths } from "expo-file-system";
import { writeJSON } from "@/lib/store";
import type { HeardWord } from "./blindAlign";
import { K2, addTake, readTakes, removeTake, type Take, type TakeKind } from "./store2";

// One recitation take (Shams 3.0): on-device Arabic speech recognition over a whole passage, with the audio kept as a
// file on this device (recordingOptions.persist, folder Paths.document/shams-takes). Returns the transcript, a time
// for every heard word (the recogniser's word segments where it gives them, otherwise when the word first appeared,
// a little earlier for the recogniser's delay – timing only), the audio parts and the duration.
// When the recogniser ends by itself (silence limits, iOS 18 final results), the take restarts and the next audio
// file becomes a further part. Nothing leaves the device: requiresOnDeviceRecognition, no network fallback.
// The index of the takes lives in store2.ts (the last 100); dropped and deleted takes have their files removed here.

type SR = typeof import("expo-speech-recognition");
let sr: SR | null | undefined;
function speech(): SR | null {
  if (sr === undefined) { try { sr = require("expo-speech-recognition") as SR; } catch { sr = null; } } // eslint-disable-line @typescript-eslint/no-require-imports
  return sr;
}

const DIR = "shams-takes";
/** the folder of the take files (created when needed) */
export function takeDir(): Directory {
  const d = new Directory(Paths.document, DIR);
  try { if (!d.exists) d.create({ intermediates: true, idempotent: true }); } catch { /* exists */ }
  return d;
}
export function deleteTakeFile(uri: string) {
  try { const f = new File(uri); if (f.exists) f.delete(); } catch { /* gone */ }
}
/** the takes recorded together (parts of one take share the id before "~") */
export const takeBase = (id: string) => id.split("~")[0];
/** deletes a take with all its parts: index entries and files */
export function deleteTake(id: string) {
  const base = takeBase(id);
  for (const t of readTakes().filter((x) => takeBase(x.id) === base)) { removeTake(t.id); deleteTakeFile(t.uri); }
}
/** on sign-out: every own recording on this device is removed (files and index) */
export function clearTakeFiles() {
  try { const d = new Directory(Paths.document, DIR); if (d.exists) d.delete(); } catch { /* nothing there */ }
  writeJSON(K2.takes, []);
}

export type TakePart = { uri: string; offset: number; ms: number }; // offset: ms from the start of the take
export type TakeOut = { transcript: string; words: HeardWord[]; parts: TakePart[]; ms: number; id: string | null };
export type TakeState = "idle" | "listening" | "stopping" | "done" | "unavailable" | "denied";
export type TakeOptions = {
  contextual?: string[]; // words of the range, as hints for the recogniser
  persist?: boolean; // keep the audio as a file (index in store2)
  kind?: TakeKind;
  range?: { s: number; from: number; to: number };
};

const MARKS = /[ؐ-ًؚ-ٰٟۖ-ۭـ]/g;
/** up to 100 distinct words without vowel signs (what the recogniser writes) */
export function contextualOf(words: string[]): string[] {
  const out = new Set<string>();
  for (const w of words) { const x = w.replace(MARKS, "").replace(/ٱ/g, "ا").trim(); if (x) out.add(x); if (out.size >= 100) break; }
  return [...out];
}

const LATENCY = 350; // a word appears in the interim results a little after it was said
type Chunk = { words: HeardWord[] };

export function useTake(opts: TakeOptions) {
  const [state, setState] = useState<TakeState>("idle");
  const [count, setCount] = useState(0);
  const [result, setResult] = useState<TakeOut | null>(null);
  const live = useRef(false);
  const startAt = useRef(0);
  const done = useRef<Chunk[]>([]);
  const cur = useRef<HeardWord[]>([]);
  const parts = useRef<{ uri: string | null; offset: number }[]>([]);
  const subs = useRef<{ remove: () => void }[]>([]);
  const optsRef = useRef(opts); optsRef.current = opts;
  const base = useRef("");
  const finished = useRef(false);
  const restarts = useRef(0);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const cleanup = useCallback(() => { subs.current.forEach((x) => x.remove()); subs.current = []; if (timer.current) clearTimeout(timer.current); timer.current = null; }, []);
  useEffect(() => () => { live.current = false; cleanup(); try { speech()?.ExpoSpeechRecognitionModule.abort(); } catch { /* not running */ } }, [cleanup]);

  const total = () => done.current.reduce((a, c) => a + c.words.length, 0) + cur.current.length;
  const commit = () => { if (cur.current.length) done.current.push({ words: cur.current }); cur.current = []; };

  const finish = useCallback(() => {
    if (finished.current) return;
    finished.current = true;
    live.current = false;
    cleanup();
    commit();
    const words = done.current.flatMap((c) => c.words);
    const ms = Math.max(0, Date.now() - startAt.current);
    const o = optsRef.current;
    const withFile = parts.current.filter((p): p is { uri: string; offset: number } => !!p.uri);
    const out: TakePart[] = withFile.map((p, i) => ({ uri: p.uri, offset: Math.max(0, p.offset), ms: Math.max(0, (withFile[i + 1]?.offset ?? ms) - p.offset) }));
    let id: string | null = null;
    if (o.persist && out.length) {
      id = base.current;
      out.forEach((p, i) => {
        const { dropped } = addTake({ id: i ? `${base.current}~${i}` : base.current, uri: p.uri, kind: o.kind ?? "blind", ms: p.ms, ...(o.range ?? {}) });
        for (const d of dropped) deleteTakeFile(d.uri);
      });
    } else for (const p of out) deleteTakeFile(p.uri); // not kept: no file stays behind
    setResult({ transcript: words.map((w) => w.w).join(" "), words, parts: o.persist ? out : [], ms, id });
    setState("done");
  }, [cleanup]);

  const begin = useCallback((m: SR["ExpoSpeechRecognitionModule"]) => {
    const o = optsRef.current;
    const n = parts.current.length;
    m.start({
      lang: "ar-SA", interimResults: true, continuous: true, requiresOnDeviceRecognition: true, addsPunctuation: false,
      contextualStrings: o.contextual?.length ? o.contextual.slice(0, 100) : undefined,
      recordingOptions: o.persist ? { persist: true, outputDirectory: takeDir().uri, outputFileName: `${base.current}${n ? `~${n}` : ""}.wav` } : undefined,
    });
  }, []);

  const start = useCallback(async () => {
    const m = speech()?.ExpoSpeechRecognitionModule;
    try {
      if (!m || !m.isRecognitionAvailable() || !m.supportsOnDeviceRecognition()) { setState("unavailable"); return; }
      const p = await m.requestPermissionsAsync();
      if (!p.granted) { setState("denied"); return; }
      cleanup();
      done.current = []; cur.current = []; parts.current = []; finished.current = false; restarts.current = 0;
      base.current = `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
      setResult(null); setCount(0);
      subs.current = [
        m.addListener("audiostart", (e) => { parts.current.push({ uri: e.uri ?? null, offset: (e.timestamp || Date.now()) - startAt.current }); }),
        m.addListener("result", (e) => {
          const r = e.results[0];
          if (!r) return;
          const ws = r.transcript.split(/\s+/).filter(Boolean);
          const prev = cur.current;
          // iOS 18 starts a fresh transcript after a final-like result: keep what was heard before
          if (prev.length >= 2 && ws.length < prev.length / 2) commit();
          const now = Date.now() - startAt.current;
          const before = cur.current;
          const partOffset = parts.current.at(-1)?.offset ?? 0;
          const segs = r.segments?.length === ws.length ? r.segments : null;
          cur.current = ws.map((w, k) => ({ w, t: segs ? Math.max(0, Math.round(partOffset + segs[k].startTimeMillis)) : before[k]?.t ?? Math.max(0, now - LATENCY) }));
          if (e.isFinal) commit();
          setCount(total());
        }),
        m.addListener("end", () => {
          // ended by itself: keep listening into the next file (a few times at most, so a failing engine cannot loop)
          if (live.current && ++restarts.current <= 20) { try { begin(m); } catch { finish(); } }
          else finish();
        }),
        m.addListener("error", (e) => {
          if (e.error === "not-allowed" || e.error === "service-not-allowed") { live.current = false; cleanup(); setState("denied"); return; }
          if (!live.current) finish();
        }),
      ];
      startAt.current = Date.now();
      live.current = true;
      begin(m);
      setState("listening");
    } catch { live.current = false; cleanup(); setState("unavailable"); }
  }, [begin, cleanup, finish]);

  const stop = useCallback(() => {
    if (!live.current) return;
    live.current = false;
    setState("stopping");
    try { speech()?.ExpoSpeechRecognitionModule.stop(); } catch { finish(); return; }
    // the final result and the file arrive with "end"; never wait for ever
    timer.current = setTimeout(finish, 4000);
  }, [finish]);

  const reset = useCallback(() => { setResult(null); setCount(0); setState((s) => (s === "unavailable" || s === "denied" ? s : "idle")); }, []);
  return { state, count, result, start, stop, reset };
}

export type { Take };
