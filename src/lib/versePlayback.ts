import { writeJSON } from "./storage";
import { trackListen, trackVerseDone } from "./listen";

// One audio element for verse-by-verse playback that outlives the surah page (SoundCloud-style).
// While the Player component is mounted it receives the media events; when the visitor leaves the page the
// session carries on here ("headless"): repeat, advance to the next verse, loop range.
export type Item = { url: string; remote: string };
export type Session = {
  chapterId: number; chapterName: string; reciterName: string;
  items: Item[]; idx: number; repeat: number; playsDone: number;
  mode: "learn" | "continuous"; loopOn: boolean; loopFrom: number; loopTo: number; speed: number;
};
export type Handlers = Partial<Record<"loadedmetadata" | "canplay" | "error" | "waiting" | "stalled" | "timeupdate" | "ended" | "pause" | "play", (e: Event) => void>> & { next?: () => void; prev?: () => void };

type Snap = { session: Session | null; playing: boolean; attached: boolean };
let audio: HTMLAudioElement | null = null;
let session: Session | null = null;
let attached: { current: Handlers } | null = null;
let snap: Snap = { session: null, playing: false, attached: false };
const subs = new Set<() => void>();

function publish() {
  snap = { session: session ? { ...session } : null, playing: !!audio && !audio.paused, attached: !!attached };
  subs.forEach((f) => f());
}
export const subscribe = (f: () => void) => { subs.add(f); return () => { subs.delete(f); }; };
export const getSnapshot = () => snap;
export const serverSnapshot: Snap = { session: null, playing: false, attached: false };

const abs = (u: string) => { try { return new URL(u, location.href).href; } catch { return u; } };

function setSrc(item: Item) {
  const a = getAudio();
  if (a.src !== abs(item.url)) { a.src = item.url; }
}

function mediaSession() {
  if (typeof navigator === "undefined" || !("mediaSession" in navigator) || !session) return;
  const s = session;
  navigator.mediaSession.metadata = new MediaMetadata({ title: `${s.chapterName} · ${s.idx + 1}`, artist: s.reciterName, album: "Quran Masterclass" });
  navigator.mediaSession.setActionHandler("play", () => { void getAudio().play(); });
  navigator.mediaSession.setActionHandler("pause", () => getAudio().pause());
  navigator.mediaSession.setActionHandler("nexttrack", () => (attached?.current.next ? attached.current.next() : step(1)));
  navigator.mediaSession.setActionHandler("previoustrack", () => (attached?.current.prev ? attached.current.prev() : step(-1)));
}

// move to another verse without the Player (verse mini bar / lock screen)
export function step(d: number, play = true) {
  if (!session) return;
  const i = Math.min(Math.max(session.idx + d, 0), session.items.length - 1);
  go(i, play);
}
function go(i: number, play = true) {
  if (!session) return;
  session.idx = i; session.playsDone = 0;
  const a = getAudio();
  setSrc(session.items[i]);
  a.playbackRate = session.speed;
  writeJSON("tf:last", { chapter: session.chapterId, verse: i + 1, at: Date.now() });
  if (play) void a.play().catch(() => undefined);
  mediaSession();
  publish();
}

function headlessEnded() {
  const s = session;
  if (!s) return;
  s.playsDone += 1;
  const a = getAudio();
  if (s.playsDone < s.repeat) { a.playbackRate = s.speed; void a.play(); return; }
  if (s.mode === "learn") { publish(); return; } // learn mode waits for the learner
  if (s.loopOn && s.idx >= s.loopTo - 1) { go(Math.max(0, s.loopFrom - 1)); return; }
  if (s.idx < s.items.length - 1) { go(s.idx + 1); return; }
  publish();
}

const EVENTS = ["loadedmetadata", "canplay", "error", "waiting", "stalled", "timeupdate", "ended", "pause", "play"] as const;

// listening statistics: only time that really played counts (jumps and seeks are left out)
let lastT = -1;
function countListening(ev: string) {
  const a = audio;
  if (!a) return;
  if (ev === "timeupdate" && !a.paused && session) {
    const d = a.currentTime - lastT;
    if (lastT >= 0 && d > 0 && d < 2) trackListen(d / (a.playbackRate || 1), session.chapterId, session.reciterName);
    lastT = a.currentTime;
  } else if (ev === "play" || ev === "loadedmetadata") lastT = a.currentTime;
  else if (ev === "pause") lastT = -1;
  else if (ev === "ended" && session) { trackVerseDone(session.chapterId, session.reciterName); lastT = -1; }
}

export function getAudio(): HTMLAudioElement {
  if (audio) return audio;
  audio = new Audio();
  audio.preload = "auto";
  audio.addEventListener("seeking", () => { lastT = -1; });
  for (const ev of EVENTS) {
    audio.addEventListener(ev, (e) => {
      countListening(ev);
      if (ev === "play") window.dispatchEvent(new Event("tf-audio-start"));
      if (attached) attached.current[ev]?.(e);
      else if (ev === "ended") headlessEnded();
      else if (ev === "error" && session) {
        const it = session.items[session.idx];
        if (it.remote && audio && audio.src !== abs(it.remote)) { audio.src = it.remote; void audio.play().catch(() => undefined); }
      }
      if (ev === "play" || ev === "pause" || ev === "ended") publish();
    });
  }
  // single voice: the radio started
  window.addEventListener("tf-radio-start", () => audio?.pause());
  return audio;
}

export function attach(h: { current: Handlers }) { getAudio(); attached = h; publish(); }
export function detach(h: { current: Handlers }, playsDone: number) {
  if (attached !== h) return;
  attached = null;
  if (session) session.playsDone = playsDone;
  if (audio && audio.paused && !audio.ended) {
    // nothing is playing: no background session (learn mode waiting, paused)
    session = null;
    if (typeof navigator !== "undefined" && "mediaSession" in navigator) navigator.mediaSession.metadata = null;
  } else mediaSession();
  publish();
}
export function sync(s: Session) {
  session = { ...s };
  publish();
}
export function stop() {
  if (audio) { audio.pause(); audio.removeAttribute("src"); audio.load(); }
  session = null;
  publish();
}
export const setPlaybackSrc = setSrc;
