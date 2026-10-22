import { readJSON, writeJSON } from "../storage";
import { readSrs, today } from "../learning";
import { POSTURE_KEY, readTraditionChoice } from "../identity";

// "Für Schwestern" – the sister's own choices, ON THIS DEVICE ONLY (owner and lead, 22.10.2026):
//   consent  – she agreed to the sisters' onboarding (null = not asked yet, false = declined: nothing female-specific
//              is asked again, the reading pages stay open to everyone)
//   madhhab  – the school whose rules the "Meine Tage" switch follows ("unknown" = the majority, cautious view)
//   days     – "Meine Tage": a plain yes/no. No dates, no history, no cycle. Health data (GDPR Art. 9).
//   strict   – her own choice: on those days pause everything except listening and dua
// The key is in no sync list, never sent to a server or the AI, and removed on sign-out (clearDeviceOnly).
// `shiftDay` is a technical marker only while "days" is on: the day the review dates were last moved forward by one
// (so they move once a day instead of piling up). It is today's day number at most, overwritten daily, and deleted
// together with the switch – never a history.
export const SISTERS_KEY = "qmc.sisters.v1";
export const MADHHABS = ["hanafi", "maliki", "shafii", "hanbali", "jafari", "unknown"] as const;
export type Madhhab = (typeof MADHHABS)[number];
export type SistersState = { consent: boolean | null; madhhab: Madhhab | null; days: boolean; strict: boolean; shiftDay?: number };
const EMPTY: SistersState = { consent: null, madhhab: null, days: false, strict: false };

export function readSisters(): SistersState {
  const o = readJSON<Record<string, unknown> | null>(SISTERS_KEY, null) ?? {};
  return {
    consent: o.consent === true ? true : o.consent === false ? false : null,
    madhhab: typeof o.madhhab === "string" && (MADHHABS as readonly string[]).includes(o.madhhab) ? (o.madhhab as Madhhab) : null,
    days: o.days === true && o.consent === true,
    strict: o.strict === true,
    ...(typeof o.shiftDay === "number" && o.days === true ? { shiftDay: o.shiftDay } : {}),
  };
}
/** silent write: this key never triggers or joins the account sync */
export function saveSisters(patch: Partial<SistersState>): SistersState {
  const cur = readSisters();
  let next: SistersState = { ...cur, ...patch };
  // the one tradition setting preselects the school: Ja'fari for Shia (she can still choose another one)
  if (next.consent === true && !next.madhhab && readTraditionChoice() === "shia") next.madhhab = "jafari";
  if (next.consent !== true) next = { ...EMPTY, consent: next.consent }; // declined: nothing else is kept
  if (!next.days) delete next.shiftDay;
  writeJSON(SISTERS_KEY, next, true);
  return next;
}
/** sign-out and "delete my data": the device-only sensitive keys go (sisters, prayer posture, listening days) */
export function clearDeviceOnly() {
  for (const k of [SISTERS_KEY, POSTURE_KEY, LISTEN_KEY]) writeJSON(k, null, true);
}

// ---------- listening and understanding days (the pause mode, neutral: anyone may use it) ----------
// A plain switch like the travel mode: the Shams plan shows "listen + understand" days; a finished listening day keeps
// the streak and grows the garden. No dates. Device only. "Meine Tage" turns it on as well.
export const LISTEN_KEY = "qmc.shams.listenDays.v1";
export const readListenSwitch = () => readJSON<{ on?: boolean } | null>(LISTEN_KEY, null)?.on === true;
export const setListenSwitch = (on: boolean) => writeJSON(LISTEN_KEY, { on }, true);
/** is today a listening day (her own switch, or "Meine Tage")? */
export const listenDaysOn = (s: SistersState = readSisters()) => readListenSwitch() || s.days;

// ---------- gates: what pauses while "Meine Tage" is on ----------
// recite   – reciting the Quran aloud from memory (Shams session check, blind recitation, talaqqi repetition, word and
//            phrase drills, weak-spot practice, formal ʿarḍ tests, speech scoring)
// practice – articulation of single letters and tajweed theory exercises without Quran text (makhraj coach)
// study    – meaning, tafsir, vocabulary, tajweed theory
// listen, dua – always open
export type GateKind = "recite" | "practice" | "study" | "listen" | "dua";
export type GateReason = "majority" | "maliki" | "jafari" | "strict";
export type Gate = { state: "open" } | { state: "paused"; reason: GateReason } | { state: "note"; reason: GateReason };

/** the four verses of obligatory prostration in the ʿazāʾim surahs (al-Sistani, Islamic Laws 354(5)) */
export const AZAIM = ["32:15", "41:37", "53:62", "96:19"] as const;
export const isAzaim = (s: number, v: number) => (AZAIM as readonly string[]).includes(`${s}:${v}`);

export function gateFor(kind: GateKind, s: SistersState = readSisters()): Gate {
  if (!s.days) return { state: "open" };
  if (kind === "listen" || kind === "dua") return { state: "open" };
  if (s.strict) return { state: "paused", reason: "strict" };
  if (kind !== "recite") return { state: "open" };
  // reciting from memory: the Maliki school allows it while the bleeding continues (Dar al-Ifta 12343); Ja'fari fiqh
  // (al-Sistani) forbids only the four sajda verses; Hanafi, Shafi'i, Hanbali and "I don't know" follow the majority
  if (s.madhhab === "maliki") return { state: "note", reason: "maliki" };
  if (s.madhhab === "jafari") return { state: "note", reason: "jafari" };
  return { state: "paused", reason: "majority" };
}

// ---------- review dates move forward instead of piling up ----------
/** while "Meine Tage" is on, the verse reviews of the Shams Method (tf:srs) move forward one day per day, so nothing
 *  piles up as overdue; call it when a Shams screen opens and when the switch changes. Idempotent within a day. */
export function shiftReviews(day = today()): number {
  const s = readSisters();
  if (!s.days) return 0;
  const n = s.shiftDay === undefined ? 0 : Math.max(0, Math.min(60, day - s.shiftDay));
  if (s.shiftDay === day) return 0;
  if (n > 0) {
    const srs = readSrs();
    const next: typeof srs = {};
    for (const [k, v] of Object.entries(srs)) next[k] = { ...v, due: v.due + n };
    writeJSON("tf:srs", next);
  }
  saveSisters({ shiftDay: day });
  return n;
}
/** "Meine Tage" on or off; switching off moves the reviews one last time and forgets the marker */
export function setDays(on: boolean): SistersState {
  if (on) { const s = saveSisters({ days: true }); shiftReviews(); return s; }
  shiftReviews();
  return saveSisters({ days: false });
}
