// mirrors mobile/src/features/mishary/maqam.ts – maqam ear training: the seven main maqamat, their lower jins, the
// five drill stages and the statistics under the app's key "qmc.mishary.ear" (same shape, same scoring). The app
// writes small WAV files with its synthesiser; the website plays the same tones live with WebAudio (OscillatorNodes
// for the fundamental and the same three partials, quick attack and gentle decay, quarter tones by exact frequency).
import { readJSON, useStored, writeJSON } from "@/lib/learn/store";
import { announceAudio } from "@/components/learn/media";
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
/** D3 as the common tonic (fair comparison); later stages move it by up to ±3 semitones */
const BASE = 146.83;
const NOTE_S = 0.55, GAP_S = 0.05, TAIL_S = 0.25;
const PARTIALS: [number, number][] = [[1, 1], [2, 0.45], [3, 0.2], [4, 0.08]];

let ctx: AudioContext | null = null;
let out: GainNode | null = null;
function audio(): AudioContext | null {
  if (typeof window === "undefined") return null;
  try {
    const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AC) return null;
    ctx ??= new AC();
    if (ctx.state === "suspended") void ctx.resume().catch(() => undefined);
    return ctx;
  } catch { return null; }
}
export function stopJins() {
  const g = out;
  out = null;
  if (!g || !ctx) return;
  try { g.gain.cancelScheduledValues(ctx.currentTime); g.gain.setTargetAtTime(0, ctx.currentTime, 0.02); setTimeout(() => { try { g.disconnect(); } catch { /* gone */ } }, 200); } catch { /* closed */ }
}

/** plays a maqam's lower jins (up, or up and down); false when sound is unavailable */
export function playJins(m: Maqam, opts: { updown?: boolean; shift?: number } = {}): boolean {
  const ac = audio();
  if (!ac) return false;
  try {
    stopJins();
    announceAudio();
    const base = BASE * Math.pow(2, Math.round(opts.shift ?? 0) / 12);
    const cents = JINS[m];
    const seq = opts.updown ? [...cents, ...cents.slice(0, -1).reverse()] : cents;
    const master = ac.createGain();
    master.gain.value = 0.22;
    master.connect(ac.destination);
    out = master;
    const t0 = ac.currentTime + 0.05;
    seq.forEach((c, k) => {
      const f = base * Math.pow(2, c / 1200);
      const start = t0 + k * (NOTE_S + GAP_S);
      const stop = start + NOTE_S + TAIL_S;
      const env = ac.createGain();
      // quick attack (12 ms), then an exponential decay like exp(-3.2 t)
      env.gain.setValueAtTime(0.0001, start);
      env.gain.linearRampToValueAtTime(1, start + 0.012);
      env.gain.setTargetAtTime(0.0001, start + 0.012, 1 / 3.2);
      env.connect(master);
      for (const [h, amp] of PARTIALS) {
        const o = ac.createOscillator();
        const g = ac.createGain();
        o.type = "sine";
        o.frequency.value = f * h;
        g.gain.value = amp / 1.73;
        o.connect(g).connect(env);
        o.start(start);
        o.stop(stop);
      }
    });
    return true;
  } catch { return false; }
}
