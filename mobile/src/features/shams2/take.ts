import { useCallback, useEffect, useRef, useState } from "react";
import { Platform } from "react-native";
import { Directory, File, Paths } from "expo-file-system";
import { hydrateStore, readJSON, writeJSON } from "@/lib/store";
import { iosSupportsOnDevice } from "../../../modules/qmc-speech-check";
import type { HeardWord } from "./blindAlign";
import { K2, addTake, readTakes, removeTake, type Take, type TakeKind } from "./store2";

// One recitation take (Shams 3.0): on-device Arabic speech recognition over a whole passage, with the audio kept as a
// file on this device (recordingOptions.persist, 16 kHz 16-bit on iOS, 16 kHz on Android). Returns the transcript, a
// time for every heard word (the recogniser's word segments where it gives them, otherwise when the word first
// appeared, a little earlier for the recogniser's delay – timing only), the audio parts and the duration.
// On-device recognition is confirmed for Arabic before every take (onDeviceArabic): iOS asks the recogniser of ar-SA
// itself (local module modules/qmc-speech-check), Android needs API 33+ and an installed Arabic model. Without that
// confirmation the take does not start (state "unavailable": the screen offers the self check), so nothing is ever
// sent to a server. Engine errors that mean "no recognition here" (language not supported, network, audio capture)
// end the same way; a take of more than 5 s with no word at all is "nothing heard" (state silent: try again).
// When the recogniser ends by itself (silence limits, iOS 18 final results), the take restarts and the next audio file
// becomes a further part; only rapid restarts (more than 3 within 2 s) end it, so a failing engine cannot loop.
// Files: Paths.cache/shams-takes (not in the iCloud or Android backup; the system may clear it when space runs low).
// The index lives in store2.ts; here the takes are capped by whole takes (MAX_TAKES) and total size (MAX_BYTES), parts
// that never reached the index (interrupted or failed takes) are deleted, and the takes belong to one account
// (claimTakes: another account signing in on this device starts without them).

type SR = typeof import("expo-speech-recognition");
let sr: SR | null | undefined;
function speech(): SR | null {
  if (sr === undefined) { try { sr = require("expo-speech-recognition") as SR; } catch { sr = null; } } // eslint-disable-line @typescript-eslint/no-require-imports
  return sr;
}

const DIR = "shams-takes";
/** the folder of the take files (created when needed); in the cache, so it is not part of a device backup */
export function takeDir(): Directory {
  const d = new Directory(Paths.cache, DIR);
  try { if (!d.exists) d.create({ intermediates: true, idempotent: true }); } catch { /* exists */ }
  return d;
}
/** where takes were kept before (in the backed-up documents folder); only ever emptied */
const legacyDir = () => new Directory(Paths.document, DIR);
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

/** at most this many whole takes and this many bytes stay on the device (oldest go first) */
export const MAX_TAKES = 40;
export const MAX_BYTES = 200 * 1024 * 1024;
const sizeOf = (uri: string) => { try { const f = new File(uri); return f.exists ? f.size ?? 0 : 0; } catch { return 0; } };
/** keeps the newest whole takes within MAX_TAKES and MAX_BYTES (the newest one always stays) */
export function pruneTakes() {
  const groups: { base: string; bytes: number }[] = [];
  const at = new Map<string, number>();
  for (const t of readTakes()) { // newest first
    const b = takeBase(t.id);
    let k = at.get(b);
    if (k === undefined) { k = groups.length; at.set(b, k); groups.push({ base: b, bytes: 0 }); }
    groups[k].bytes += sizeOf(t.uri);
  }
  let bytes = 0;
  groups.forEach((g, k) => {
    bytes += g.bytes;
    if (k > 0 && (k >= MAX_TAKES || bytes > MAX_BYTES)) deleteTake(g.base);
  });
}

// ---------- the takes belong to the account that made them ----------
const OWNER = "qmc.shams2.takesOwner.v1"; // user id of the takes on this device (not synced)
let recording = 0; // takes recording right now
let clearPending = false; // a clear asked for while a take was recording: done when it ends
function clearFolders() {
  for (const d of [new Directory(Paths.cache, DIR), legacyDir()]) { try { if (d.exists) d.delete(); } catch { /* nothing there */ } }
}
/** on sign-out, account deletion and an expired session: every own recording on this device is removed (files and
 *  index). A take that is recording keeps its folder until it ends and is then discarded. */
export function clearTakeFiles() {
  writeJSON(K2.takes, []);
  writeJSON(OWNER, null, true);
  if (recording > 0) { clearPending = true; return; }
  clearFolders();
}
/** a signed-in account: takes made by another account on this device are removed; takes from before any sign-in
 *  become this account's */
export async function claimTakes(userId: number) {
  await hydrateStore();
  const owner = readJSON<number | null>(OWNER, null);
  if (owner !== null && owner !== userId) clearTakeFiles();
  writeJSON(OWNER, userId, true);
}

// ---------- is Arabic recognised on this device? ----------
export type OnDevice = { ok: boolean; lang: string; pkg?: string };
const AR = "ar-SA";
const norm = (l: string) => l.replace(/_/g, "-").toLowerCase();
let support: Promise<OnDevice> | null = null;
async function check(): Promise<OnDevice> {
  const no: OnDevice = { ok: false, lang: AR };
  const m = speech()?.ExpoSpeechRecognitionModule;
  if (!m) return no;
  try { if (!m.isRecognitionAvailable()) return no; } catch { return no; }
  if (Platform.OS === "ios") return { ok: iosSupportsOnDevice(AR) === true, lang: AR };
  if (Platform.OS !== "android" || Number(Platform.Version) < 33) return no;
  // the installed (offline) languages of the default service, else of Google's on-device service
  for (const pkg of [undefined, "com.google.android.as"]) {
    try {
      const { installedLocales } = await m.getSupportedLocales(pkg ? { androidRecognitionServicePackage: pkg } : {});
      const list = installedLocales ?? [];
      const hit = list.find((l) => norm(l) === norm(AR)) ?? list.find((l) => norm(l).startsWith("ar"));
      if (hit) return { ok: true, lang: hit, pkg };
    } catch { /* this service cannot tell */ }
  }
  return no;
}
/** whether Arabic is recognised on this device (asked once per app start; a failed answer is asked again) */
export function onDeviceArabic(): Promise<OnDevice> {
  support ??= check().then((r) => { if (!r.ok) support = null; return r; });
  return support;
}
/** null while asking; the "on this device" copy appears only with true */
export function useOnDeviceArabic(): boolean | null {
  const [ok, setOk] = useState<boolean | null>(null);
  useEffect(() => { let alive = true; void onDeviceArabic().then((r) => { if (alive) setOk(r.ok); }); return () => { alive = false; }; }, []);
  return ok;
}

export type TakePart = { uri: string; offset: number; ms: number }; // offset: ms from the start of the take
export type TakeOut = { transcript: string; words: HeardWord[]; parts: TakePart[]; ms: number; id: string | null };
/** silent: the take ran more than 5 s and nothing was heard ("please try again", back to ready) */
export type TakeState = "idle" | "listening" | "stopping" | "done" | "silent" | "unavailable" | "denied";
export type TakeOptions = {
  contextual?: string[]; // words of the range, as hints for the recogniser
  persist?: boolean; // keep the audio as a file (index in store2)
  kind?: TakeKind;
  range?: { s: number; from: number; to: number };
};

const MARKS = /[ؐ-ًؚ-ٰٟۖ-ۭـ]/g;
/** up to 100 distinct words without vowel signs (what the recogniser writes) */
export function contextualOf(words: string[]): string[] {
  const out = new Set<string>();
  for (const w of words) { const x = w.replace(MARKS, "").replace(/ٱ/g, "ا").trim(); if (x) out.add(x); if (out.size >= 100) break; }
  return [...out];
}

const LATENCY = 350; // a word appears in the interim results a little after it was said
/** errors after which this device has no usable recognition: the self check takes over */
const UNAVAILABLE = new Set(["language-not-supported", "network", "audio-capture"]);
const SILENT_MS = 5000; // a take this long without a single word: nothing heard, the learner tries again
const RAPID = { n: 3, ms: 2000 }; // more than 3 restarts within 2 s: the engine is failing
type Chunk = { words: HeardWord[] };

export function useTake(opts: TakeOptions) {
  const [state, setState] = useState<TakeState>("idle");
  const [count, setCount] = useState(0);
  const [result, setResult] = useState<TakeOut | null>(null);
  const live = useRef(false);
  const active = useRef(false); // counted in `recording`
  const startAt = useRef(0);
  const done = useRef<Chunk[]>([]);
  const cur = useRef<HeardWord[]>([]);
  const parts = useRef<{ uri: string | null; offset: number }[]>([]);
  const subs = useRef<{ remove: () => void }[]>([]);
  const optsRef = useRef(opts); optsRef.current = opts;
  const base = useRef("");
  const finished = useRef(false);
  const restarts = useRef<number[]>([]);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const cleanup = useCallback(() => { subs.current.forEach((x) => x.remove()); subs.current = []; if (timer.current) clearTimeout(timer.current); timer.current = null; }, []);
  /** the take no longer records: a clear asked for meanwhile now empties the folder */
  const release = useCallback(() => {
    if (!active.current) return;
    active.current = false;
    recording = Math.max(0, recording - 1);
    if (!recording && clearPending) { clearPending = false; clearFolders(); }
  }, []);
  /** the parts of this take that never reached the index (the recogniser may still close a file: a moment later) */
  const discardParts = useCallback((later = false) => {
    const uris = parts.current.map((p) => p.uri).filter((u): u is string => !!u);
    parts.current = [];
    if (!uris.length) return;
    const go = () => { for (const u of uris) deleteTakeFile(u); };
    if (later) setTimeout(go, 1500); else go();
  }, []);
  /** the recogniser cannot be used here: no file stays, the screen offers the self check */
  const fail = useCallback((s: "unavailable" | "denied" | "silent") => {
    live.current = false;
    finished.current = true;
    cleanup();
    try { speech()?.ExpoSpeechRecognitionModule.abort(); } catch { /* not running */ }
    discardParts(true);
    release();
    setState(s);
  }, [cleanup, discardParts, release]);

  useEffect(() => () => {
    const wasOpen = !finished.current && (live.current || parts.current.length > 0);
    live.current = false;
    cleanup();
    try { speech()?.ExpoSpeechRecognitionModule.abort(); } catch { /* not running */ }
    if (wasOpen) { finished.current = true; discardParts(true); } // interrupted: nothing reached the index
    release();
  }, [cleanup, discardParts, release]);

  const total = () => done.current.reduce((a, c) => a + c.words.length, 0) + cur.current.length;
  const commit = () => { if (cur.current.length) done.current.push({ words: cur.current }); cur.current = []; };

  const finish = useCallback(() => {
    if (finished.current) return;
    commit();
    const words = done.current.flatMap((c) => c.words);
    const ms = Math.max(0, Date.now() - startAt.current);
    if (!words.length && ms > SILENT_MS) { fail("silent"); return; }
    finished.current = true;
    live.current = false;
    cleanup();
    const o = optsRef.current;
    const withFile = parts.current.filter((p): p is { uri: string; offset: number } => !!p.uri);
    const out: TakePart[] = withFile.map((p, i) => ({ uri: p.uri, offset: Math.max(0, p.offset), ms: Math.max(0, (withFile[i + 1]?.offset ?? ms) - p.offset) }));
    let id: string | null = null;
    if (o.persist && out.length && !clearPending) {
      id = base.current;
      const gone = new Set<string>();
      out.forEach((p, i) => {
        const { dropped } = addTake({ id: i ? `${base.current}~${i}` : base.current, uri: p.uri, kind: o.kind ?? "blind", ms: p.ms, ...(o.range ?? {}) });
        for (const d of dropped) { deleteTakeFile(d.uri); gone.add(takeBase(d.id)); }
      });
      // a take whose parts fell out of the index goes as a whole
      for (const b of gone) if (b !== base.current) deleteTake(b);
      parts.current = [];
      pruneTakes();
    } else discardParts(); // not kept: no file stays behind
    release();
    setResult({ transcript: words.map((w) => w.w).join(" "), words, parts: id ? out : [], ms, id });
    setState("done");
  }, [cleanup, discardParts, fail, release]);

  const begin = useCallback((m: SR["ExpoSpeechRecognitionModule"], sup: OnDevice) => {
    const o = optsRef.current;
    const n = parts.current.length;
    m.start({
      lang: sup.lang, interimResults: true, continuous: true, requiresOnDeviceRecognition: true, addsPunctuation: false,
      ...(sup.pkg ? { androidRecognitionServicePackage: sup.pkg } : {}),
      contextualStrings: o.contextual?.length ? o.contextual.slice(0, 100) : undefined,
      recordingOptions: o.persist ? {
        persist: true, outputDirectory: takeDir().uri, outputFileName: `${base.current}${n ? `~${n}` : ""}.wav`,
        outputSampleRate: 16000, outputEncoding: "pcmFormatInt16", // iOS; Android records 16 kHz already
      } : undefined,
    });
  }, []);

  const start = useCallback(async () => {
    const m = speech()?.ExpoSpeechRecognitionModule;
    try {
      const sup = m ? await onDeviceArabic() : null;
      if (!m || !sup?.ok) { setState("unavailable"); return; }
      const p = await m.requestPermissionsAsync();
      if (!p.granted) { setState("denied"); return; }
      cleanup();
      done.current = []; cur.current = []; parts.current = []; finished.current = false; restarts.current = [];
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
          if (finished.current) return;
          // ended by itself: keep listening into the next file, unless the engine keeps ending at once
          const now = Date.now();
          restarts.current = [...restarts.current.filter((x) => now - x < RAPID.ms), now];
          if (live.current && restarts.current.length <= RAPID.n) { try { begin(m, sup); } catch { finish(); } }
          else finish();
        }),
        m.addListener("error", (e) => {
          if (e.error === "not-allowed" || e.error === "service-not-allowed") { fail("denied"); return; }
          if (UNAVAILABLE.has(e.error)) { fail("unavailable"); return; }
          if (!live.current) finish();
        }),
      ];
      startAt.current = Date.now();
      live.current = true;
      if (!active.current) { active.current = true; recording++; }
      begin(m, sup);
      setState("listening");
    } catch { fail("unavailable"); }
  }, [begin, cleanup, fail, finish]);

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
