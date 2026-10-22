import { readGoal } from "@/web/coach";
import { readSettings, saveSettings, useSettings, type Settings } from "./store";

// The difficulty of the Shams method (owner 22.10.2026): "Leicht", "Mittel", "Schwer", "Sehr schwer". Chosen in the
// onboarding, changeable on the Shams page, the hub and in the wird settings. It is stored as `level` in the synced
// Shams settings (qmc.shams2.settings.v1, a new optional field) and works through what already exists:
// - daily verses, repetitions and review intensity: choosing a level writes the existing plan settings (minutes,
//   newPerDay, sabqiDays, manzilDays); they stay individually adjustable afterwards and the grade floor still applies;
// - blind recitation: the share of words a verse needs to count as held (blindAlign okShare);
// - strictness of self-ratings: how a wird mark is turned into the FSRS rating (strictRating).
// Without a stored level everything behaves as before ("medium" with the learner's own settings untouched).
export type ShamsLevel = "easy" | "medium" | "hard" | "veryHard";
export const LEVELS: readonly ShamsLevel[] = ["easy", "medium", "hard", "veryHard"];
const isLevel = (x: unknown): x is ShamsLevel => typeof x === "string" && (LEVELS as readonly string[]).includes(x);

// minutes are a factor of the learner's own daily goal from the onboarding (readGoal), so a level never ignores it
type Preset = Pick<Settings, "newPerDay" | "sabqiDays" | "manzilDays"> & { minutesX: number; okShare: number };
export const LEVEL_PRESET: Record<ShamsLevel, Preset> = {
  easy: { minutesX: 0.5, newPerDay: 1, sabqiDays: 14, manzilDays: 30, okShare: 0.75 },
  medium: { minutesX: 1, newPerDay: 0, sabqiDays: 30, manzilDays: 0, okShare: 0.85 },
  hard: { minutesX: 1.5, newPerDay: 3, sabqiDays: 30, manzilDays: 14, okShare: 0.9 },
  veryHard: { minutesX: 2, newPerDay: 5, sabqiDays: 60, manzilDays: 7, okShare: 0.95 },
};

export const levelOf = (s: Partial<Settings>): ShamsLevel => (isLevel(s.level) ? s.level : "medium");
export const readLevel = (): ShamsLevel => levelOf(readSettings());
/** the level was chosen explicitly (otherwise "medium" is only the default) */
export const levelChosen = (): boolean => isLevel(readSettings().level);
export function setLevel(level: ShamsLevel) {
  const { okShare: _ok, minutesX, ...plan } = LEVEL_PRESET[level];
  const goal = readGoal()?.minutes ?? 20;
  saveSettings({ ...plan, minutes: Math.max(5, Math.min(180, Math.round((goal * minutesX) / 5) * 5)), level });
}
export function useShamsLevel() {
  const s = useSettings();
  return { level: levelOf(s), chosen: isLevel(s.level), set: setLevel };
}
/** the share of words a verse needs in blind recitation to count as held */
export const blindOkShare = (): number => LEVEL_PRESET[readLevel()].okShare;

/** a wird mark as the FSRS rating, by level: "easy" forgives a slip (1 counts as 2), "hard" never grants "easy"
 *  (4 counts as 3), "veryHard" also counts a "good" as "hard" (3 as 2), so reviews come sooner */
export function strictRating<R extends 1 | 2 | 3 | 4>(r: R, level: ShamsLevel = readLevel()): R {
  if (level === "easy") return (r === 1 ? 2 : r) as R;
  if (level === "hard") return (r === 4 ? 3 : r) as R;
  if (level === "veryHard") return (r === 4 ? 3 : r === 3 ? 2 : r) as R;
  return r;
}
