import { useCallback, useEffect, useRef, useState } from "react";
import { Platform } from "react-native";
import { clearPreloadedSource, createAudioPlayer, preload as prepareSource, setAudioModeAsync, type AudioPlayer, type AudioStatus } from "expo-audio";
import { Directory, File, Paths } from "expo-file-system";
import * as Speech from "expo-speech";
import { SITE } from "@/lib/api";

// Sound for the courses, like ArabicLesson.tsx on the website: one recording at a time (word recordings from
// Quran.com, verse recordings from our own server), a quiet hint when a file cannot be loaded, and two tiny
// feedback tones for right and wrong (the website synthesises them with WebAudio; here the same tones are written
// once as small WAV files).
//
// Loading rules (measured on the iPhone simulator, 21.10.2026: a word recording streamed with AVPlayer took about
// 0.9 s to the first sound, the same file from disk about 0.1 s):
//   - one player for the whole app: a new recording releases the previous one, whichever card started it
//   - word recordings (audio.qurancdn.com/wbw) are downloaded once into the cache folder (LRU, at most 400 files /
//     24 MB) and played from disk; lessons preload the next ones with preloadClips()
//   - the first sound has 5 s: after that the button stops spinning and shows an error (or the card's fallback, the
//     device voice, speaks); the download keeps running, so "try again" plays from disk
//   - the audio session is checked before every sound: the speech recognition of the reading checks leaves iOS in
//     "playAndRecord / measurement" (quiet, and the ring/silent switch rules again); without the playback category
//     a learner with the switch on hears nothing

// ---------- audio session ----------
// expo-audio replaces the whole mode on every call (missing fields fall back to defaults), so this is the same mode
// the Quran player sets (features/quran/useVerseAudio.ts) – otherwise a lesson would switch off its background playback.
const MODE = { playsInSilentMode: true, shouldPlayInBackground: true, interruptionMode: "doNotMix" } as const;
type SessionInfo = { category?: string; mode?: string };
type SessionReader = { getAudioSessionCategoryAndOptionsIOS?: () => SessionInfo };
let reader: SessionReader | null | undefined;
/** the current iOS audio session (read through expo-speech-recognition, which is in the app anyway) */
function sessionInfo(): SessionInfo | null {
  if (Platform.OS !== "ios") return null;
  if (reader === undefined) {
    try { reader = (require("expo-speech-recognition") as { ExpoSpeechRecognitionModule?: SessionReader }).ExpoSpeechRecognitionModule ?? null; } // eslint-disable-line @typescript-eslint/no-require-imports
    catch { reader = null; }
  }
  try { return reader?.getAudioSessionCategoryAndOptionsIOS?.() ?? null; } catch { return null; }
}
let modeSet = false;
let modeJob: Promise<void> | null = null;
/** call after anything that changes the audio session itself (speech recognition, recording) */
export function markAudioSessionChanged() { modeSet = false; }
/** playback category (plays with the ring/silent switch on), set again when something else changed it */
export function ensureAudioSession(): Promise<void> {
  if (Platform.OS === "web") return Promise.resolve();
  if (modeSet) {
    const s = sessionInfo();
    if (!s || (s.category === "playback" && (s.mode ?? "default") === "default")) return Promise.resolve();
    modeSet = false;
  }
  modeJob ??= setAudioModeAsync(MODE).then(() => { modeSet = true; }, () => { modeSet = false; }).finally(() => { modeJob = null; });
  return modeJob;
}

/** pauses the Quran player and the radio (they listen for this event, as on the website) */
export function announceAudio() {
  (globalThis as unknown as { window: { dispatchEvent: (e: unknown) => void } }).window.dispatchEvent(new Event("tf-audio-start"));
}

/** the website's relative audio paths ("/audio/…") live on quranmasterclass.com */
export const absUrl = (url: string) => (url.startsWith("/") ? `${SITE}${url}` : url);

// ---------- word recordings on disk ----------
const WBW = /^https:\/\/(?:audio\.qurancdn\.com|verses\.quran\.com)\/wbw\/(\d{3}_\d{3}_\d{3})\.mp3$/;
// the same files under Quran.com's second host name (same CDN, own DNS name and TLS connection)
const altHost = (url: string) => url.replace("https://audio.qurancdn.com/", "https://verses.quran.com/");
const MAX_FILES = 400;
const MAX_BYTES = 24 * 1024 * 1024;
const canCache = Platform.OS !== "web";
const nameOf = (url: string) => { const m = WBW.exec(url); return m ? `${m[1]}.mp3` : null; };

let dir: Directory | null = null;
function clipDir(): Directory | null {
  if (!canCache) return null;
  if (!dir) {
    try {
      const d = new Directory(Paths.cache, "qmc-clips-v1");
      if (!d.exists) d.create({ intermediates: true, idempotent: true });
      dir = d;
    } catch { return null; }
  }
  return dir;
}
type Entry = { t: number; n: number };
let index: Map<string, Entry> | null = null;
function clipIndex(): Map<string, Entry> {
  if (index) return index;
  index = new Map();
  const d = clipDir();
  if (!d) return index;
  let saved: Record<string, [number, number]> = {};
  try { const f = new File(d, "index.json"); if (f.exists) saved = JSON.parse(f.textSync()) as Record<string, [number, number]>; } catch { saved = {}; }
  try {
    for (const e of d.list()) {
      if (!(e instanceof File) || !e.name.endsWith(".mp3")) continue;
      const s = saved[e.name];
      index.set(e.name, { t: s?.[0] ?? 0, n: s?.[1] ?? e.size ?? 0 });
    }
  } catch { /* an empty cache */ }
  return index;
}
let saveTimer: ReturnType<typeof setTimeout> | null = null;
function saveIndex() {
  if (saveTimer) return;
  saveTimer = setTimeout(() => {
    saveTimer = null;
    const d = clipDir();
    if (!d || !index) return;
    try {
      const f = new File(d, "index.json");
      f.create({ overwrite: true });
      f.writeSync(JSON.stringify(Object.fromEntries([...index].map(([k, v]) => [k, [v.t, v.n]]))));
    } catch { /* the index is rebuilt from the folder */ }
  }, 2000);
}
/** least recently used files go first once the folder is over its limit */
function evict() {
  const idx = clipIndex();
  let bytes = 0;
  for (const v of idx.values()) bytes += v.n;
  if (idx.size <= MAX_FILES && bytes <= MAX_BYTES) return;
  const d = clipDir();
  for (const [name, v] of [...idx.entries()].sort((a, b) => a[1].t - b[1].t)) {
    if (idx.size <= MAX_FILES * 0.9 && bytes <= MAX_BYTES * 0.9) break;
    try { if (d) new File(d, name).delete(); } catch { /* already gone */ }
    idx.delete(name);
    bytes -= v.n;
  }
}
/** the file on disk for a word recording, or null */
function cachedClip(url: string): string | null {
  const name = nameOf(url);
  const d = clipDir();
  if (!name || !d) return null;
  const e = clipIndex().get(name);
  if (!e) return null;
  const f = new File(d, name);
  if (!f.exists) { clipIndex().delete(name); return null; } // the system emptied the cache folder
  e.t = Date.now();
  saveIndex();
  return f.uri;
}
/** the HTTP status in a download error ("… status 404", "… status: 404", "… HTTP 404"), 0 when the request did not get an answer */
const httpStatus = (e: unknown) => Number(/(?:status|HTTP):? (\d{3})/.exec(String((e as Error | null)?.message ?? e))?.[1] ?? 0);
/** a file the server does not have (4xx): streaming it would only fail again */
const isMissing = (e: unknown) => { const st = httpStatus(e); return st >= 400 && st < 500; };
const jobs = new Map<string, Promise<string>>();
const missing = new Set<string>(); // recordings the server does not have (this app session)
/** downloads a word recording once (second host name when the first gives no answer); resolves with the file's uri */
function fetchClip(url: string): Promise<string> {
  const hit = cachedClip(url);
  if (hit) return Promise.resolve(hit);
  const name = nameOf(url);
  const d = clipDir();
  if (!name || !d) return Promise.reject(new Error("not a cached recording"));
  if (missing.has(url)) return Promise.reject(new Error("response has status 404"));
  let job = jobs.get(name);
  if (!job) {
    job = (async () => {
      let last: unknown = null;
      for (const [src, ms] of [[url, 10_000], [altHost(url), 8_000]] as const) {
        const ctrl = new AbortController();
        const timer = setTimeout(() => ctrl.abort(), ms);
        try {
          const f = await File.downloadFileAsync(src, new File(d, name), { idempotent: true, signal: ctrl.signal });
          clipIndex().set(name, { t: Date.now(), n: f.size || 0 });
          saveIndex();
          evict();
          return f.uri;
        } catch (e) { last = e; } finally { clearTimeout(timer); }
        if (altHost(url) === url || isMissing(last)) break;
      }
      if (isMissing(last)) missing.add(url);
      throw last ?? new Error("download failed");
    })().finally(() => jobs.delete(name));
    jobs.set(name, job);
  }
  return job;
}

// a native player prepared ahead (expo-audio preload) for the next few files on disk: createAudioPlayer takes it over
// and starts without opening the file first
const warm: string[] = [];
function warmUp(uri: string) {
  if (warm.includes(uri)) return;
  warm.push(uri);
  void prepareSource({ uri }).catch(() => undefined);
  while (warm.length > 3) { const old = warm.shift()!; void clearPreloadedSource({ uri: old }).catch(() => undefined); }
}

const waiting: string[] = [];
const warmSoon = new Set<string>();
let running = 0;
function pump() {
  while (running < 2 && waiting.length) {
    const u = waiting.shift()!;
    running++;
    void fetchClip(u)
      .then((uri) => { if (warmSoon.delete(u)) warmUp(uri); })
      .catch(() => undefined)
      .finally(() => { running--; pump(); });
  }
}
/** downloads the recordings a lesson needs next (two at a time; the newest request first) and prepares a player for
 *  the first three of them; also sets the audio session, so the first tap does not wait for it */
export function preloadClips(urls: string[]) {
  void ensureAudioSession();
  if (!canCache || !clipDir()) return;
  const fresh: string[] = [];
  const near = new Set(urls.slice(0, 3).map(absUrl));
  for (const raw of urls) {
    const u = absUrl(raw);
    const name = nameOf(u);
    if (!name || fresh.includes(u) || missing.has(u)) continue;
    if (clipIndex().has(name)) {
      if (near.has(u)) { const uri = cachedClip(u); if (uri) warmUp(uri); }
      continue;
    }
    if (jobs.has(name)) continue;
    if (near.has(u)) warmSoon.add(u);
    const at = waiting.indexOf(u);
    if (at >= 0) waiting.splice(at, 1);
    fresh.push(u);
  }
  waiting.unshift(...fresh);
  waiting.length = Math.min(waiting.length, 40);
  pump();
}

/** whether the device voice (voice.ts) has an utterance queued or speaking */
export const voiceActivity = { busy: false };

// ---------- the one player ----------
export type ClipState = "idle" | "loading" | "playing" | "error" | "fallback";
/** fallback: called when the recording cannot be played in time; true when it handled the sound (device voice) */
export type ClipOpts = { fallback?: () => boolean };
const FIRST_SOUND_MS = 5000;
type Active = { owner: number; url: string; player: AudioPlayer | null; sub: { remove: () => void } | null; phase: "loading" | "playing" | "done"; timer: ReturnType<typeof setTimeout> | null };
let active: Active | null = null;
let ownerSeq = 0;
const owners = new Map<number, (s: ClipState) => void>();
const tell = (owner: number, s: ClipState) => owners.get(owner)?.(s);

function release(a: Active) {
  if (a.timer) { clearTimeout(a.timer); a.timer = null; }
  try { a.sub?.remove(); } catch { /* gone */ }
  const p = a.player;
  a.player = null; a.sub = null;
  if (p) { try { p.pause(); } catch { /* released */ } try { p.remove(); } catch { /* released */ } }
}
/** stops the course recording that is playing (its button goes back to idle) */
export function stopClips() {
  const a = active;
  if (!a) return;
  active = null;
  release(a);
  tell(a.owner, "idle");
}

function playClip(owner: number, raw: string, opts: ClipOpts) {
  const url = absUrl(raw);
  const cur = active;
  if (cur && cur.owner === owner && cur.url === url) {
    if (cur.phase === "loading") return; // a second tap while it loads changes nothing
    const p = cur.player;
    if (p) { // playing or finished: from the start again
      announceAudio();
      if (voiceActivity.busy) { voiceActivity.busy = false; void Speech.stop().catch(() => undefined); }
      tell(owner, "playing");
      const go = () => { if (active === cur) { try { p.play(); } catch { /* released meanwhile */ } } };
      void ensureAudioSession().then(() => p.seekTo(0)).then(go, go);
      return;
    }
  }
  if (cur) { active = null; release(cur); if (cur.owner !== owner) tell(cur.owner, "idle"); }
  if (voiceActivity.busy) { voiceActivity.busy = false; void Speech.stop().catch(() => undefined); } // the device voice and a recording never talk at once
  const a: Active = { owner, url, player: null, sub: null, phase: "loading", timer: null };
  active = a;
  const live = () => active === a;
  tell(owner, "loading");
  announceAudio();
  const fail = () => {
    if (!live()) return;
    active = null;
    release(a);
    tell(owner, opts.fallback?.() ? "fallback" : "error");
  };
  // a recording that does not start in time counts as unavailable (never an endless spinner)
  a.timer = setTimeout(fail, FIRST_SOUND_MS);
  void (async () => {
    try {
      await ensureAudioSession();
      if (!live()) return;
      // word recordings from disk; when the download fails the player tries the network file itself
      const src = nameOf(url) && canCache ? await fetchClip(url).catch((e: unknown) => (isMissing(e) ? null : url)) : url;
      if (!src) { fail(); return; } // the server does not have this recording
      if (!live()) return;
      const w = warm.indexOf(src);
      if (w >= 0) warm.splice(w, 1); // the prepared player is taken over now
      const p = createAudioPlayer({ uri: src });
      a.player = p;
      a.sub = p.addListener("playbackStatusUpdate", (s: AudioStatus) => {
        if (!live()) return;
        if (s.error) { fail(); return; }
        if (s.didJustFinish) {
          if (a.timer) { clearTimeout(a.timer); a.timer = null; }
          a.phase = "done";
          tell(owner, "idle");
          return;
        }
        if (s.playing && a.phase !== "playing") {
          if (a.timer) { clearTimeout(a.timer); a.timer = null; }
          a.phase = "playing";
          tell(owner, "playing");
        }
      });
      p.play();
    } catch { fail(); }
  })();
}

/** one recording at a time (app-wide); a file that cannot be played in time turns the state into "error", or into
 *  "fallback" when opts.fallback spoke instead */
export function useClip() {
  const id = useRef(0);
  if (!id.current) id.current = ++ownerSeq;
  const [state, setState] = useState<ClipState>("idle");
  useEffect(() => {
    const me = id.current;
    owners.set(me, setState);
    return () => {
      owners.delete(me);
      const a = active;
      if (a && a.owner === me) { active = null; release(a); }
    };
  }, []);
  const play = useCallback((url: string, opts: ClipOpts = {}) => playClip(id.current, url, opts), []);
  const stop = useCallback(() => {
    const a = active;
    if (a && a.owner === id.current) stopClips();
    else setState((s) => (s === "loading" || s === "playing" ? "idle" : s));
  }, []);
  return { state, play, stop };
}

// ---------- feedback tones (ArabicLesson.tsx tone(): 660 → 880 Hz for right, 220 Hz for wrong) ----------
function wav(ok: boolean): Uint8Array {
  const rate = 22050, len = Math.round(rate * 0.3);
  const data = new Int16Array(len);
  const end = ok ? 0.28 : 0.25, peak = 0.16, floor = 0.0001;
  let phase = 0;
  for (let i = 0; i < len; i++) {
    const t = i / rate;
    const f = ok ? (t < 0.09 ? 660 : 880) : 220;
    phase += (2 * Math.PI * f) / rate;
    // exponential ramps like the website: 0.0001 → peak in 20 ms, then back to 0.0001
    const g = t < 0.02 ? floor * Math.pow(peak / floor, t / 0.02) : t < end ? peak * Math.pow(floor / peak, (t - 0.02) / (end - 0.02)) : 0;
    data[i] = Math.round(Math.sin(phase) * g * 32767);
  }
  const bytes = new Uint8Array(44 + len * 2);
  const v = new DataView(bytes.buffer);
  const str = (o: number, s: string) => { for (let i = 0; i < s.length; i++) v.setUint8(o + i, s.charCodeAt(i)); };
  str(0, "RIFF"); v.setUint32(4, 36 + len * 2, true); str(8, "WAVE"); str(12, "fmt ");
  v.setUint32(16, 16, true); v.setUint16(20, 1, true); v.setUint16(22, 1, true); v.setUint32(24, rate, true);
  v.setUint32(28, rate * 2, true); v.setUint16(32, 2, true); v.setUint16(34, 16, true); str(36, "data"); v.setUint32(40, len * 2, true);
  new Int16Array(bytes.buffer, 44, len).set(data);
  return bytes;
}

const tones: { ok?: AudioPlayer; bad?: AudioPlayer } = {};
function tonePlayer(ok: boolean): AudioPlayer | null {
  const k = ok ? "ok" : "bad";
  if (tones[k]) return tones[k]!;
  try {
    const f = new File(Paths.cache, `qmc-tone-${k}-1.wav`);
    if (!f.exists) { f.create({ overwrite: true }); f.writeSync(wav(ok)); }
    tones[k] = createAudioPlayer({ uri: f.uri });
    return tones[k]!;
  } catch { return null; }
}

/** a tiny tone for a right or a wrong answer (sound is optional: failures are silent; tones never change the audio
 *  mode themselves and never pause the Quran player or the radio) */
export function tone(ok: boolean) {
  try {
    const p = tonePlayer(ok);
    if (!p) return;
    void p.seekTo(0).then(() => p.play()).catch(() => p.play());
  } catch { /* sound is optional */ }
}
