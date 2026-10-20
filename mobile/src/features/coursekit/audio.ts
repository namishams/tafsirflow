import { useCallback, useEffect, useRef, useState } from "react";
import { createAudioPlayer, setAudioModeAsync, type AudioPlayer, type AudioStatus } from "expo-audio";
import { File, Paths } from "expo-file-system";
import { SITE } from "@/lib/api";

// Sound for the courses, like ArabicLesson.tsx on the website: one recording at a time (word recordings from
// Quran.com, verse recordings from our own server), a quiet hint when a file cannot be loaded, and two tiny
// feedback tones for right and wrong (the website synthesises them with WebAudio; here the same tones are written
// once as small WAV files).

let modeSet = false;
function ensureMode() {
  if (modeSet) return;
  modeSet = true;
  // a learner with the ring/silent switch on still has to hear the word in "Which word do you hear?".
  // expo-audio replaces the whole mode on every call (missing fields fall back to defaults), so this is the same
  // mode the Quran player sets (features/quran/useVerseAudio.ts) – otherwise a lesson would switch off its
  // background playback.
  setAudioModeAsync({ playsInSilentMode: true, shouldPlayInBackground: true, interruptionMode: "doNotMix" }).catch(() => { modeSet = false; });
}

/** pauses the Quran player and the radio (they listen for this event, as on the website) */
export function announceAudio() {
  (globalThis as unknown as { window: { dispatchEvent: (e: unknown) => void } }).window.dispatchEvent(new Event("tf-audio-start"));
}

/** the website's relative audio paths ("/audio/…") live on quranmasterclass.com */
export const absUrl = (url: string) => (url.startsWith("/") ? `${SITE}${url}` : url);

export type ClipState = "idle" | "loading" | "playing" | "error";

/** one recording at a time; a file that cannot be loaded (offline, missing) turns the state into "error" */
export function useClip() {
  const player = useRef<AudioPlayer | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [state, setState] = useState<ClipState>("idle");
  const stop = useCallback(() => {
    if (timer.current) { clearTimeout(timer.current); timer.current = null; }
    const p = player.current;
    player.current = null;
    if (p) { try { p.pause(); p.remove(); } catch { /* already released */ } }
  }, []);
  const play = useCallback((url: string) => {
    stop();
    try {
      ensureMode();
      announceAudio();
      const p = createAudioPlayer({ uri: absUrl(url) });
      player.current = p;
      setState("loading");
      p.addListener("playbackStatusUpdate", (s: AudioStatus) => {
        if (player.current !== p) return;
        if (s.error) { setState("error"); return; }
        if (s.didJustFinish) { setState("idle"); return; }
        if (s.playing) setState("playing");
      });
      p.play();
      // a recording that never starts counts as unavailable
      timer.current = setTimeout(() => { if (player.current === p && !p.isLoaded) setState("error"); }, 8000);
    } catch { setState("error"); }
  }, [stop]);
  useEffect(() => stop, [stop]);
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
