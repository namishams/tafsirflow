import { useEffect, useSyncExternalStore } from "react";
import { createAudioPlayer, createAudioPlaylist, setAudioModeAsync, type AudioMetadata, type AudioPlayer, type AudioPlaylist, type AudioPlaylistStatus, type AudioStatus } from "expo-audio";
import { api, SITE } from "@/lib/api";
import { RECITERS, getChapters, type Chapter, type Reciter } from "@/lib/quran";
import { FREE, usePro } from "@/lib/pro";
import { readJSON, writeJSON } from "@/lib/store";
import { onWebEvent } from "@/lib/webshim";
import { useLang } from "@/i18n";
import { countOf } from "@/web/counts";
import { JUZ_START, indexOf, keyAt } from "@/web/quranIndex";
import { adhanUrl, pickAdhan, type AdhanFile } from "@/web/adhan";
import { CITIES, PRAYERS, dayFor, type Day, type Prayer, type Spot } from "@/web/prayer";
import { STATIONS, type Pos, type Station } from "./stations";

// The radio of quranmasterclass.com (src/components/RadioProvider.tsx) as one engine for the whole app: it plays the
// Quran verse by verse from the server audio, station by station, and keeps playing while the listener moves through
// the app or locks the phone. It lives outside React so leaving the radio screen never stops it.
//
// Audio: one native queue (expo-audio AudioPlaylist = AVQueuePlayer on iOS, ExoPlayer playlist on Android). The next
// verses are always queued ahead, so the system preloads the next file and hands over without a gap, also on the lock
// screen where JavaScript may be paused. Lock screen / Control Center: play, pause, previous and next verse.
//
// Same rules as the website: stations never end, mixed stations change the voice with every surah, missing files are
// skipped, adhan at prayer time pauses the recitation, sleep timer, the website's storage keys (tf:radio-station,
// tf:radio-vol, tf:radio-mix, tf:reciter, tf:adhan, tf:adhanVoice). App additions: speed, repeat verse/surah, sleep at
// the end of the surah, previous surah, resume where the listener stopped (qmc.radio.last).

export type AdhanMode = "off" | "makkah" | "dubai" | "mine";
export type Repeat = "off" | "verse" | "surah";
export type Sleep = 0 | 15 | 30 | 60 | "eos";
type Item = { pos: Pos; folder: string };
type Last = { station: string; s: number; v: number; folder: string; at: number };

export type RadioState = {
  station: Station;
  reciters: Reciter[];
  folder: string;
  playing: boolean;
  started: boolean;
  now: Pos;
  history: Pos[];
  chapters: Chapter[];
  sleep: Sleep;
  sleepLeft: number;
  mix: boolean;
  vol: number;
  rate: number;
  repeat: Repeat;
  showText: boolean;
  offline: boolean;
  adhanMode: AdhanMode;
  adhanFiles: AdhanFile[];
  adhanCredit: string;
  voice: string;
  banner: Prayer | null;
  pro: boolean;
};

// ---------- stations (RadioProvider.tsx) ----------
const pad = (n: number) => String(n).padStart(3, "0");
const randSurah = () => 1 + Math.floor(Math.random() * 114);

// "Juz of the day": every day another of the 30 parts – in 30 days once through the Quran
function juzToday(): [Pos, Pos] {
  const j = Math.floor(Date.now() / 86400000) % 30;
  const [s, v] = JUZ_START[j].split(":").map(Number);
  const end = j < 29 ? keyAt(indexOf(...(JUZ_START[j + 1].split(":").map(Number) as [number, number])) - 1) : { s: 114, v: 6 };
  return [{ s, v }, end];
}
// the station never ends: after the last surah it starts again (or picks the next random surah)
export function nextPos(p: Pos, st: Station): Pos {
  if (st.mode === "juzday") { const [a, b] = juzToday(); if (p.s === b.s && p.v === b.v) return a; }
  if (p.v < countOf(p.s)) return { s: p.s, v: p.v + 1 };
  if (st.mode === "random") return { s: randSurah(), v: 1 };
  if (st.mode === "single") return { s: st.from, v: 1 };
  if (st.mode === "list" && st.list) { const i = st.list.indexOf(p.s); return { s: st.list[(i + 1) % st.list.length], v: 1 }; }
  return { s: p.s >= st.to ? st.from : p.s + 1, v: 1 };
}
export const startOf = (st: Station): Pos => (st.mode === "juzday" ? juzToday()[0] : { s: st.mode === "random" ? randSurah() : st.mode === "list" && st.list ? st.list[0] : st.from, v: 1 });

// app: one surah back within the station
function prevSurahPos(p: Pos, st: Station, history: Pos[]): Pos {
  if (st.mode === "single") return { s: st.from, v: 1 };
  if (st.mode === "list" && st.list) { const i = Math.max(0, st.list.indexOf(p.s)); return { s: st.list[(i - 1 + st.list.length) % st.list.length], v: 1 }; }
  if (st.mode === "random") { const h = history.find((x) => x.s !== p.s); return { s: h ? h.s : randSurah(), v: 1 }; }
  if (st.mode === "juzday") { const [a] = juzToday(); return p.s - 1 > a.s ? { s: p.s - 1, v: 1 } : a; }
  return { s: p.s <= st.from ? st.to : p.s - 1, v: 1 };
}

// ---------- Free and Pro ----------
export const isFreeReciter = (r: Reciter) => r.id > 0 && FREE.reciterIds.includes(r.id);
export const reciterAllowed = (r: Reciter, pro: boolean) => pro || isFreeReciter(r);
export const stationAllowed = (st: Station, pro: boolean) => pro || STATIONS.indexOf(st) < FREE.radioStations;

// ---------- state ----------
let state: RadioState = {
  station: STATIONS[0], reciters: RECITERS, folder: RECITERS[0].folder, playing: false, started: false, now: { s: 1, v: 1 },
  history: [], chapters: [], sleep: 0, sleepLeft: 0, mix: false, vol: 1, rate: 1, repeat: "off", showText: true, offline: false,
  adhanMode: "makkah", adhanFiles: [], adhanCredit: "", voice: "random", banner: null, pro: false,
};
const listeners = new Set<() => void>();
function set(patch: Partial<RadioState>) {
  state = { ...state, ...patch };
  listeners.forEach((l) => l());
}
const subscribe = (l: () => void) => { listeners.add(l); return () => { listeners.delete(l); }; };
export const getRadioState = () => state;

const reciterOf = (folder: string) => state.reciters.find((r) => r.folder === folder);
const allowedReciters = () => state.reciters.filter((r) => reciterAllowed(r, state.pro));
function effectiveFolder(folder = state.folder): string {
  const r = reciterOf(folder);
  if (r && reciterAllowed(r, state.pro)) return r.folder;
  return (allowedReciters()[0] ?? state.reciters[0] ?? RECITERS[0]).folder;
}

let inited = false;
let resumable = false;
function init() {
  if (inited) return;
  inited = true;
  const sid = readJSON<string>("tf:radio-station", "");
  const station = STATIONS.find((s) => s.id === sid) ?? STATIONS[0];
  const last = readJSON<Last | null>("qmc.radio.last", null);
  state = {
    ...state,
    station,
    vol: readJSON<number>("tf:radio-vol", 1),
    mix: readJSON<boolean>("tf:radio-mix", false),
    rate: readJSON<number>("qmc.radio.rate", 1),
    adhanMode: readJSON<AdhanMode>("tf:adhan", "makkah"),
    voice: readJSON<string>("tf:adhanVoice", "random"),
    folder: readJSON<string>("tf:reciter", "") || RECITERS[0].folder,
  };
  if (last && last.station === station.id && last.s >= 1 && last.s <= 114 && last.v >= 1 && last.v <= countOf(last.s)) {
    state.now = { s: last.s, v: last.v };
    resumable = true;
  }
  // reciters whose complete audio is on the server (the website's /api/reciters)
  api<{ reciters?: Reciter[] }>("/api/reciters").then((d) => {
    if (!d.reciters?.length) return;
    const folder = d.reciters.some((r) => r.folder === state.folder) ? state.folder : d.reciters[0].folder;
    set({ reciters: d.reciters, folder });
    if (!state.started) radio.setPro(state.pro);
  }).catch(() => undefined);
  // installed adhan recordings (the website's lib/adhan.ts adhanList, against the site)
  fetch(`${SITE}/api/adhan`).then((r) => (r.ok ? r.json() : { files: [] })).then((d: { files?: AdhanFile[] }) => set({ adhanFiles: d.files ?? [] })).catch(() => undefined);
  // single voice in the app: whatever else starts to play (Quran reader, lessons) pauses the radio
  onWebEvent("tf-audio-start", () => { if (state.playing) pause(); });
}

// ---------- audio ----------
let modeSet = false;
async function ensureMode() {
  if (modeSet) return;
  modeSet = true;
  await setAudioModeAsync({ playsInSilentMode: true, shouldPlayInBackground: true, interruptionMode: "doNotMix" }).catch(() => { modeSet = false; });
}

const AHEAD = 8; // verses queued after the one on air
let pl: AudioPlaylist | null = null;
let subs: { remove: () => void }[] = [];
let queue: Item[] = [];
let idx = 0;
let capped = false;  // the queue stops at the end of the surah (sleep: end of surah)
let ended = false;   // the queue ran out because of the sleep option
let wantPlay = false;
let pausedAt = 0;
let stall = 0, extPause = 0, errors = 0, ticks = 0;
let lastRemain = 99;
let ticker: ReturnType<typeof setInterval> | null = null;
let sleepUntil = 0;

export const audioUrlOf = (folder: string, p: Pos) => `${SITE}/audio/${folder}/${pad(p.s)}${pad(p.v)}.mp3`;
const src = (it: Item) => ({ uri: audioUrlOf(it.folder, it.pos) });

function chapterName(s: number) {
  return state.chapters.find((c) => c.id === s)?.name_simple ?? `Surah ${s}`;
}
function meta(p: Pos, folder: string): AudioMetadata {
  return { title: `${chapterName(p.s)} · ${p.v}`, artist: reciterOf(folder)?.name ?? "", albumTitle: "Quran Masterclass", artworkUrl: `${SITE}/icon-512.png` };
}

function following(p: Pos): Pos {
  if (state.repeat === "surah" && p.v >= countOf(p.s)) return { s: p.s, v: 1 };
  return nextPos(p, state.station);
}
function nextItem(last: Item): Item | null {
  const np = following(last.pos);
  if (state.sleep === "eos" && (np.s !== last.pos.s || np.v <= last.pos.v)) return null;
  let folder = last.folder;
  // mixed stations: a new surah gets a new voice (a random one of the reciters this listener may play)
  if (np.s !== last.pos.s && (state.station.mix || state.mix)) {
    const others = allowedReciters().filter((r) => r.folder !== folder);
    if (others.length) folder = others[Math.floor(Math.random() * others.length)].folder;
  }
  return { pos: np, folder };
}
function topUp() {
  if (!pl) return;
  while (!capped && queue.length - 1 - idx < AHEAD) {
    const it = nextItem(queue[queue.length - 1]);
    if (!it) { capped = true; break; }
    queue.push(it);
    try { pl.add(src(it)); } catch { /* player gone */ }
  }
}
/** the rules changed (repeat, mix, sleep): replace what is queued after the verse on air */
function rebuildFuture() {
  if (!pl) return;
  for (let i = queue.length - 1; i > idx; i--) { try { pl.remove(i); } catch { /* ignore */ } }
  queue.length = idx + 1;
  capped = false;
  topUp();
}

function persistLast(p: Pos, folder: string) {
  writeJSON("qmc.radio.last", { station: state.station.id, s: p.s, v: p.v, folder, at: Date.now() } satisfies Last, true);
}

function teardown() {
  subs.forEach((s) => s.remove());
  subs = [];
  if (pl) {
    try { pl.clearLockScreenControls(); } catch { /* ignore */ }
    try { pl.pause(); pl.destroy(); } catch { /* ignore */ }
  }
  pl = null;
}

function start(p: Pos, autoplay = true, folderOverride?: string) {
  void ensureMode();
  const folder = folderOverride ?? effectiveFolder();
  teardown();
  queue = [{ pos: p, folder }];
  idx = 0; capped = false; ended = false; stall = 0; extPause = 0; lastRemain = 99;
  while (queue.length <= AHEAD) {
    const it = nextItem(queue[queue.length - 1]);
    if (!it) { capped = true; break; }
    queue.push(it);
  }
  const list = createAudioPlaylist({ sources: queue.map(src), updateInterval: 250, loop: state.repeat === "verse" ? "single" : "none" });
  pl = list;
  try { list.volume = state.vol; list.playbackRate = state.rate; } catch { /* ignore */ }
  subs = [
    list.addListener("trackChanged", (e: { currentIndex: number }) => onIndex(e.currentIndex)),
    list.addListener("playlistStatusUpdate", (st: AudioPlaylistStatus) => onStatus(st)),
  ];
  resumable = true;
  set({ now: p, folder, started: true, offline: false, history: state.history[0]?.s === p.s && state.history[0]?.v === p.v ? state.history : [p, ...state.history].slice(0, 6) });
  persistLast(p, folder);
  try { list.setActiveForLockScreen(true, meta(p, folder), { showNextTrack: true, showPreviousTrack: true }); } catch { /* not supported here */ }
  if (autoplay) play(); else { wantPlay = false; set({ playing: false }); }
  startTicker();
  // no network at all: say so right away instead of waiting for the player
  if (autoplay) void probe(audioUrlOf(folder, p)).then((r) => { if (r === "offline" && pl === list) { pause(); set({ offline: true }); } });
}

function onIndex(ci: number) {
  if (!pl || ci === idx || ci < 0 || ci >= queue.length) return;
  idx = ci; errors = 0; stall = 0;
  const it = queue[idx];
  set({ now: it.pos, folder: it.folder, history: [it.pos, ...state.history].slice(0, 6) });
  persistLast(it.pos, it.folder);
  try { pl.updateLockScreenMetadata(meta(it.pos, it.folder)); } catch { /* ignore */ }
  // a station can run for hours: start a fresh queue now and then, at the beginning of a surah
  if ((idx >= 120 && it.pos.v === 1) || idx >= 300) { start(it.pos, wantPlay, it.folder); return; }
  topUp();
}

function onStatus(st: AudioPlaylistStatus & { error?: unknown }) {
  if (typeof st.currentIndex === "number") onIndex(st.currentIndex);
  if (st.playing && Date.now() - pausedAt > 800) {
    stall = 0; extPause = 0; errors = 0;
    if (!state.playing || !wantPlay) { wantPlay = true; set({ playing: true }); }
    if (state.offline) set({ offline: false });
  }
  if (st.error) void recover();
  if (st.didJustFinish && idx >= queue.length - 1) finishQueue();
}

function finishQueue() {
  if (capped) {
    // sleep "end of surah": stop here; play continues with the next surah
    wantPlay = false; ended = true;
    set({ playing: false, sleep: 0, sleepLeft: 0 });
    return;
  }
  // the queue ran dry (the app was asleep): go on with the next verse
  start(following(queue[idx].pos), true, queue[idx].folder);
}

async function probe(url: string): Promise<"ok" | "missing" | "offline"> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 6000);
  try {
    const r = await fetch(url, { method: "HEAD", signal: ctrl.signal });
    return r.ok ? "ok" : "missing";
  } catch {
    return "offline";
  } finally {
    clearTimeout(timer);
  }
}

let recovering = false;
// the verse did not start: skip a missing file so the station keeps running, or report that the network is gone
async function recover() {
  if (recovering || !pl) return;
  recovering = true;
  const it = queue[idx];
  try {
    errors += 1;
    const r = await probe(audioUrlOf(it.folder, it.pos));
    if (!pl || queue[idx] !== it) return;
    if (r === "offline") { pause(); set({ offline: true }); errors = 0; return; }
    if (errors > 8) { pause(); errors = 0; return; }
    if (r === "missing" || idx >= queue.length - 1) start(following(it.pos), true, it.folder);
    else start(it.pos, true, it.folder);
  } finally {
    recovering = false;
  }
}

function startTicker() {
  if (ticker) return;
  ticker = setInterval(tick, 500);
}
function stopTicker() {
  if (ticker) clearInterval(ticker);
  ticker = null;
}

function tick() {
  const now = Date.now();
  if (sleepUntil) {
    if (now >= sleepUntil) { sleepUntil = 0; pause(); set({ sleep: 0, sleepLeft: 0 }); }
    else { const left = Math.ceil((sleepUntil - now) / 1000); if (left !== state.sleepLeft) set({ sleepLeft: left }); }
  }
  if (++ticks % 2 === 0) adhanTick();
  if (!pl) return;
  // a few cheap reads of the native player (twice a second); time and loading state only when they matter
  let playing = false, ci = idx, t = 0, d = 0;
  try { playing = pl.playing; ci = pl.currentIndex; } catch { return; }
  onIndex(ci);
  const last = idx >= queue.length - 1;
  if (last) { try { t = pl.currentTime; d = pl.duration; } catch { /* ignore */ } }
  if (playing) {
    stall = 0; extPause = 0;
    if (!state.playing && now - pausedAt > 800) { wantPlay = true; set({ playing: true }); }
  } else if (wantPlay && !adhanBusy) {
    let loaded = false, buffering = false;
    try { loaded = pl.isLoaded; buffering = pl.isBuffering; } catch { /* ignore */ }
    if (last && lastRemain < 1.5) finishQueue();
    else if (loaded && !buffering) { if (++extPause >= 3) { wantPlay = false; set({ playing: false }); } } // paused from the lock screen, a call, headphones out
    else if (++stall >= 24) { stall = 0; void recover(); } // 12 s without sound
  }
  lastRemain = last && d > 0 ? d - t : 99;
}

// ---------- adhan at prayer time (RadioProvider.tsx) ----------
let adhanPlayer: AudioPlayer | null = null;
let adhanDone: (() => void) | null = null;
let adhanBusy = false;
let adhanSafety: ReturnType<typeof setTimeout> | null = null;
const fired = new Set<string>();
let dayCache: { key: string; day: Day } | null = null;

function playAdhan(id: string, done: (() => void) | null) {
  if (!adhanPlayer) {
    adhanPlayer = createAudioPlayer(null, { updateInterval: 1000 });
    adhanPlayer.addListener("playbackStatusUpdate", (s: AudioStatus) => { if (s.didJustFinish) finishAdhan(); });
  }
  adhanDone = done;
  adhanBusy = !!done;
  adhanPlayer.replace({ uri: `${SITE}${adhanUrl(id)}` });
  adhanPlayer.play();
  if (adhanSafety) clearTimeout(adhanSafety);
  adhanSafety = setTimeout(finishAdhan, 6 * 60_000); // a recording that never ends or never loads
}
function finishAdhan() {
  if (adhanSafety) clearTimeout(adhanSafety);
  adhanSafety = null;
  adhanBusy = false;
  const d = adhanDone;
  adhanDone = null;
  d?.();
}
function adhanTick() {
  if (state.adhanMode === "off" || !state.started) return;
  const spot: Spot | undefined = state.adhanMode === "mine" ? readJSON<Spot | null>("tf:myspot", null) ?? undefined : CITIES.find((c) => c.id === state.adhanMode);
  if (!spot) return;
  const now = new Date();
  const key = `${spot.id}-${Math.floor(now.getTime() / 60000)}`;
  if (dayCache?.key !== key) { try { dayCache = { key, day: dayFor(spot, now) }; } catch { return; } }
  const day = dayCache.day;
  for (const p of PRAYERS) {
    if (p === "sunrise") continue;
    const at = day.times[p].getTime();
    const k = `${spot.id}-${day.times[p].toDateString()}-${p}`;
    if (now.getTime() >= at && now.getTime() - at < 90_000 && !fired.has(k)) {
      fired.add(k);
      const resume = state.playing;
      const pick = pickAdhan(state.voice, state.adhanFiles); // "random": a different muezzin each time
      set({ adhanCredit: pick ? `${pick.label}${pick.credit ? ` · ${pick.credit}` : ""}` : "", banner: p });
      const done = () => { set({ banner: null }); if (resume) play(); };
      if (pick) { if (resume) pause(); playAdhan(pick.id, done); }
      else setTimeout(done, 15_000); // no recording installed: show the notice only
    }
  }
}

// ---------- actions ----------
function play() {
  if (!pl) { start(resumePos()); return; }
  (globalThis as unknown as { window: { dispatchEvent: (e: Event) => void } }).window.dispatchEvent(new Event("tf-radio-start"));
  void ensureMode();
  wantPlay = true; stall = 0; extPause = 0;
  try { pl.play(); } catch { /* ignore */ }
  set({ playing: true, offline: false });
}
function pause() {
  wantPlay = false;
  pausedAt = Date.now();
  try { pl?.pause(); } catch { /* ignore */ }
  set({ playing: false });
}
function resumePos(): Pos {
  return resumable ? state.now : startOf(state.station);
}

export const radio = {
  play,
  pause,
  toggle() {
    if (!pl || !state.started) {
      if (!stationAllowed(state.station, state.pro)) { set({ station: STATIONS[0] }); resumable = false; }
      start(resumePos());
      return;
    }
    if (ended) { ended = false; start(following(queue[idx].pos), true, queue[idx].folder); return; }
    if (state.playing) pause(); else play();
  },
  stop() {
    teardown();
    stopTicker();
    wantPlay = false; sleepUntil = 0;
    set({ started: false, playing: false, sleep: 0, sleepLeft: 0, banner: null, offline: false });
  },
  /** false when the station is part of Pro */
  chooseStation(st: Station): boolean {
    if (!stationAllowed(st, state.pro)) return false;
    set({ station: st });
    writeJSON("tf:radio-station", st.id, true);
    start(startOf(st));
    return true;
  },
  skipVerse() {
    if (!pl || !state.started) { radio.toggle(); return; }
    if (idx < queue.length - 1) { try { pl.next(); } catch { /* ignore */ } play(); }
    else start(following(queue[idx].pos), true, queue[idx].folder);
  },
  prevVerse() {
    const p = state.now;
    start(p.v > 1 ? { s: p.s, v: p.v - 1 } : p, true, state.started ? state.folder : undefined);
  },
  skipSurah() {
    const p = state.now, st = state.station;
    start(st.mode === "random" ? { s: randSurah(), v: 1 } : nextPos({ s: p.s, v: countOf(p.s) }, st));
  },
  prevSurah() {
    start(prevSurahPos(state.now, state.station, state.history));
  },
  /** "Listen on the radio" from a reciter's page: this voice, on the current station, where the listener was; false when Pro */
  listenWith(folder: string): boolean {
    const r = reciterOf(folder);
    if (!r || !reciterAllowed(r, state.pro)) return false;
    set({ folder });
    writeJSON("tf:reciter", folder, true);
    if (!stationAllowed(state.station, state.pro)) { set({ station: STATIONS[0] }); resumable = false; }
    start(state.started ? state.now : resumePos(), true, folder);
    return true;
  },
  seek(seconds: number) {
    if (!pl) return;
    void pl.seekTo(Math.max(0, seconds)).catch(() => undefined);
  },
  /** the verse queued after the one on air */
  upNext(): Pos | null {
    if (!pl) return null;
    if (state.repeat === "verse") return queue[idx]?.pos ?? null;
    return queue[idx + 1]?.pos ?? null;
  },
  progress(): { t: number; d: number } {
    if (!pl) return { t: 0, d: 0 };
    try { return { t: pl.currentTime || 0, d: pl.duration || 0 }; } catch { return { t: 0, d: 0 }; }
  },
  /** false when the reciter is part of Pro */
  changeReciter(folder: string): boolean {
    const r = reciterOf(folder);
    if (r && !reciterAllowed(r, state.pro)) return false;
    set({ folder });
    writeJSON("tf:reciter", folder, true);
    if (state.started) start(state.now, state.playing, folder);
    return true;
  },
  setVolume(v: number, persist = true) {
    const vol = Math.max(0, Math.min(1, v));
    set({ vol });
    try { if (pl) pl.volume = vol; } catch { /* ignore */ }
    if (persist) writeJSON("tf:radio-vol", vol, true);
  },
  setRate(rate: number) {
    set({ rate });
    try { if (pl) pl.playbackRate = rate; } catch { /* ignore */ }
    writeJSON("qmc.radio.rate", rate, true);
  },
  setRepeat(repeat: Repeat) {
    set({ repeat });
    try { if (pl) pl.loop = repeat === "verse" ? "single" : "none"; } catch { /* ignore */ }
    rebuildFuture();
  },
  setSleep(sleep: Sleep) {
    sleepUntil = typeof sleep === "number" && sleep > 0 ? Date.now() + sleep * 60_000 : 0;
    set({ sleep, sleepLeft: sleepUntil ? (sleep as number) * 60 : 0 });
    rebuildFuture();
  },
  setMix(mix: boolean) {
    set({ mix });
    writeJSON("tf:radio-mix", mix, true);
    rebuildFuture();
  },
  setShowText(showText: boolean) { set({ showText }); },
  setAdhanMode(adhanMode: AdhanMode) { set({ adhanMode }); writeJSON("tf:adhan", adhanMode, true); },
  setVoice(voice: string) { set({ voice }); writeJSON("tf:adhanVoice", voice, true); },
  testAdhan() {
    const pick = pickAdhan(state.voice, state.adhanFiles);
    if (!pick) return;
    set({ adhanCredit: `${pick.label}${pick.credit ? ` · ${pick.credit}` : ""}` });
    playAdhan(pick.id, null);
  },
  stopAdhan() { try { adhanPlayer?.pause(); } catch { /* ignore */ } finishAdhan(); },
  retry() {
    set({ offline: false });
    start(state.started ? state.now : resumePos(), true, state.started ? state.folder : undefined);
  },
  setLang(lang: string) {
    getChapters(lang).then((chapters) => {
      set({ chapters });
      if (pl && queue[idx]) { try { pl.updateLockScreenMetadata(meta(queue[idx].pos, queue[idx].folder)); } catch { /* ignore */ } }
    }).catch(() => { lastLang = ""; });
  },
  setPro(pro: boolean) {
    if (pro !== state.pro) set({ pro });
    if (state.started) return;
    // before anything plays: a Pro station or voice chosen earlier (or on the website) falls back to a free one
    const patch: Partial<RadioState> = {};
    if (pro) {
      // Pro became known (the account loads after the first screen): bring back the listener's own choices
      const st = STATIONS.find((x) => x.id === readJSON<string>("tf:radio-station", ""));
      if (st && st !== state.station) {
        patch.station = st;
        const last = readJSON<Last | null>("qmc.radio.last", null);
        if (last && last.station === st.id && last.s >= 1 && last.s <= 114 && last.v >= 1 && last.v <= countOf(last.s)) { patch.now = { s: last.s, v: last.v }; resumable = true; }
      }
      const saved = readJSON<string>("tf:reciter", "");
      if (saved && reciterOf(saved)) patch.folder = saved;
      if (Object.keys(patch).length) set(patch);
      return;
    }
    if (!stationAllowed(state.station, pro)) { patch.station = STATIONS[0]; resumable = false; }
    const folder = effectiveFolder();
    if (folder !== state.folder) patch.folder = folder;
    if (Object.keys(patch).length) set(patch);
  },
};

let lastLang = "";
/** the radio state for a screen; keeps the engine in step with the language and the Pro status */
export function useRadio(): RadioState {
  init();
  const { pro } = usePro();
  const { lang } = useLang();
  useEffect(() => { radio.setPro(pro); }, [pro]);
  useEffect(() => { if (lang !== lastLang) { lastLang = lang; radio.setLang(lang); } }, [lang]);
  return useSyncExternalStore(subscribe, () => state, () => state);
}

/** one value of the radio state; the screen only re-renders when that value changes (e.g. `started` for padding) */
export function useRadioSelect<T>(select: (s: RadioState) => T): T {
  init();
  return useSyncExternalStore(subscribe, () => select(state), () => select(state));
}

/** the reciter on air (or chosen) */
export const currentReciter = (s: RadioState): Reciter => s.reciters.find((r) => r.folder === s.folder) ?? s.reciters[0] ?? RECITERS[0];

/** initials for the orb and the seals (RadioPlayer.tsx) */
export const initials = (name: string) => {
  const words = name.split(/\s+/).filter(Boolean);
  if (/[؀-ۿ]/.test(name)) return words.length > 1 ? `${words[0][0]}${words[words.length - 1][0]}` : words[0]?.[0] ?? "";
  return words.filter((w) => /^[A-Z]/.test(w)).slice(0, 2).map((w) => w[0]).join("");
};
