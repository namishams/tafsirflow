import { createAudioPlayer, setAudioModeAsync, type AudioPlayer } from "expo-audio";
import { File, Paths } from "expo-file-system";
import { readJSON, useStored, writeJSON } from "@/lib/store";
import type { MtKey } from "./texts";

// Maqam ear training. The seven main maqamat with their lower jins in cents above the tonic (24-tone approximation
// of the Arabic quarter tones, as taught in standard maqam theory). Drills play these as synthesised tones, so the
// answers are exact; examples from the masters' recordings are only used once a maqam teacher has confirmed them.

export type Maqam = "ajam" | "nahawand" | "hijaz" | "rast" | "bayati" | "saba" | "sika";
export const MAQAMAT: Maqam[] = ["bayati", "saba", "hijaz", "rast", "nahawand", "sika", "ajam"];
export const MAQAM_AR: Record<Maqam, string> = { bayati: "بياتي", saba: "صبا", hijaz: "حجاز", rast: "رست", nahawand: "نهاوند", sika: "سيكاه", ajam: "عجم" };
export const nameKey = (m: Maqam) => `m_${m}` as MtKey;
export const descKey = (m: Maqam) => `d_${m}` as MtKey;

/** lower jins plus the next note (cents above the tonic) */
export const JINS: Record<Maqam, number[]> = {
  ajam: [0, 200, 400, 500, 700],
  nahawand: [0, 200, 300, 500, 700],
  hijaz: [0, 100, 400, 500, 700],
  rast: [0, 200, 350, 500, 700],
  bayati: [0, 150, 300, 500, 700],
  saba: [0, 150, 300, 400, 700],
  sika: [0, 150, 350, 550, 700],
};
/** the notes as usually written (tonic as in maqam tables; ↓ = a quarter tone lower) */
export const NOTES: Record<Maqam, string> = {
  ajam: "B♭ · C · D · E♭ · F", nahawand: "C · D · E♭ · F · G", hijaz: "D · E♭ · F♯ · G · A", rast: "C · D · E↓ · F · G",
  bayati: "D · E↓ · F · G · A", saba: "D · E↓ · F · G♭ · A", sika: "E↓ · F · G · A · B↓",
};

// ——— drills: five stages, each unlocked with 80 % in the stage before ———
export type Stage = { n: number; title: MtKey; maqamat: Maqam[]; transpose: boolean; recordings?: boolean };
export const STAGES: Stage[] = [
  { n: 1, title: "s1", maqamat: ["ajam", "nahawand"], transpose: false },
  { n: 2, title: "s2", maqamat: ["ajam", "nahawand", "hijaz"], transpose: false },
  { n: 3, title: "s3", maqamat: ["nahawand", "hijaz", "rast", "bayati"], transpose: true },
  { n: 4, title: "s4", maqamat: MAQAMAT, transpose: true },
  { n: 5, title: "s5", maqamat: MAQAMAT, transpose: false, recordings: true },
];
export const QUESTIONS = 10;
export const PASS = 0.8;

/**
 * Recording examples (verse + reciter + maqam). Only well-known, commonly cited examples, every entry marked
 * needsReview until a maqam teacher has confirmed it; stage 5 opens only when at least four confirmed examples exist.
 * Kept empty on purpose: no example could be confirmed yet, so the track teaches with the synthesised jins and the
 * explanation lessons. Add entries as { reciterId (Quran.com recitation id), verseKey, maqam, needsReview, source }.
 */
export type MaqamExample = { reciterId: number; verseKey: string; maqam: Maqam; needsReview: boolean; source: string };
export const MAQAM_EXAMPLES: MaqamExample[] = [];
export const reviewedExamples = () => MAQAM_EXAMPLES.filter((e) => !e.needsReview);

// ——— statistics (device, synced like other learning data) ———
const KEY = "qmc.mishary.ear";
export type EarStats = {
  /** maqam → [answers, correct] */
  per: Partial<Record<Maqam, [number, number]>>;
  /** "heard>answered" → count of mistakes */
  confused: Record<string, number>;
  /** stage → best score 0..1 */
  best: Record<string, number>;
  /** days with practice (YYYY-MM-DD), last 400 */
  days: string[];
};
const EMPTY: EarStats = { per: {}, confused: {}, best: {}, days: [] };
export const useEarStats = () => ({ ...EMPTY, ...useStored<EarStats>(KEY, EMPTY) });
const read = () => ({ ...EMPTY, ...readJSON<EarStats>(KEY, EMPTY) });
const todayStr = () => new Date().toISOString().slice(0, 10);

export function recordAnswer(heard: Maqam, answered: Maqam) {
  const s = read();
  const [n, ok] = s.per[heard] ?? [0, 0];
  s.per = { ...s.per, [heard]: [n + 1, ok + (heard === answered ? 1 : 0)] };
  if (heard !== answered) { const k = `${heard}>${answered}`; s.confused = { ...s.confused, [k]: (s.confused[k] ?? 0) + 1 }; }
  const d = todayStr();
  if (!s.days.includes(d)) s.days = [...s.days, d].slice(-400);
  writeJSON(KEY, s);
}
export function recordStage(n: number, score: number) {
  const s = read();
  s.best = { ...s.best, [n]: Math.max(score, s.best[n] ?? 0) };
  writeJSON(KEY, s);
}
export const stageOpen = (s: EarStats, n: number) => n === 1 || (s.best[n - 1] ?? 0) >= PASS;

// ——— synthesis: a soft plucked tone per note (fundamental + a few partials, quick attack, gentle decay) ———
const RATE = 22050;
function synth(cents: number[], baseHz: number, updown: boolean): Uint8Array {
  const seq = updown ? [...cents, ...cents.slice(0, -1).reverse()] : cents;
  const noteS = 0.55, gapS = 0.05;
  const total = Math.round(RATE * (seq.length * (noteS + gapS) + 0.3));
  const data = new Float32Array(total);
  seq.forEach((c, k) => {
    const f = baseHz * Math.pow(2, c / 1200);
    const start = Math.round(RATE * k * (noteS + gapS));
    const len = Math.round(RATE * (noteS + 0.25));
    for (let i = 0; i < len && start + i < total; i++) {
      const t = i / RATE;
      const env = Math.min(1, t / 0.012) * Math.exp(-t * 3.2);
      const w = Math.sin(2 * Math.PI * f * t) + 0.45 * Math.sin(4 * Math.PI * f * t) + 0.2 * Math.sin(6 * Math.PI * f * t) + 0.08 * Math.sin(8 * Math.PI * f * t);
      data[start + i] += w * env * 0.22;
    }
  });
  const bytes = new Uint8Array(44 + total * 2);
  const v = new DataView(bytes.buffer);
  const str = (o: number, s: string) => { for (let i = 0; i < s.length; i++) v.setUint8(o + i, s.charCodeAt(i)); };
  str(0, "RIFF"); v.setUint32(4, 36 + total * 2, true); str(8, "WAVE"); str(12, "fmt ");
  v.setUint32(16, 16, true); v.setUint16(20, 1, true); v.setUint16(22, 1, true); v.setUint32(24, RATE, true);
  v.setUint32(28, RATE * 2, true); v.setUint16(32, 2, true); v.setUint16(34, 16, true); str(36, "data"); v.setUint32(40, total * 2, true);
  for (let i = 0; i < total; i++) v.setInt16(44 + i * 2, Math.max(-1, Math.min(1, data[i])) * 32767, true);
  return bytes;
}

/** D3 as the common tonic (fair comparison); later stages move it by up to ±3 semitones */
const BASE = 146.83;
let player: AudioPlayer | null = null;
export function stopJins() { try { player?.pause(); player?.remove(); } catch { /* released */ } player = null; }

/** plays a maqam's lower jins (written once per variant as a small WAV in the cache); false when sound is unavailable */
export function playJins(m: Maqam, opts: { updown?: boolean; shift?: number } = {}): boolean {
  const shift = Math.round(opts.shift ?? 0);
  try {
    stopJins();
    const f = new File(Paths.cache, `qmc-maqam-${m}-${opts.updown ? "ud" : "up"}-${shift + 10}.wav`);
    if (!f.exists) { f.create({ overwrite: true }); f.writeSync(synth(JINS[m], BASE * Math.pow(2, shift / 12), !!opts.updown)); }
    void setAudioModeAsync({ playsInSilentMode: true, shouldPlayInBackground: true, interruptionMode: "doNotMix" }).catch(() => undefined);
    (globalThis as unknown as { window?: { dispatchEvent?: (e: unknown) => void } }).window?.dispatchEvent?.(new Event("tf-audio-start"));
    player = createAudioPlayer({ uri: f.uri });
    player.play();
    return true;
  } catch { return false; }
}
