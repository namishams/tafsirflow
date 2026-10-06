import { readJSON } from "./storage";

// The Shams Method adapts to the learner's age: children and seniors get slower audio, more listening repetitions,
// more time per test question and a gentler plan; teens and adults start with the standard track.
export type AgeGroup = "child" | "teen" | "adult" | "senior";
export type AgeProfile = { group: AgeGroup; track: "steady" | "standard"; listen: number; speed: number; testBonus: number };

export function groupOf(birthYear: number | null | undefined): AgeGroup | null {
  if (!birthYear) return null;
  const age = new Date().getFullYear() - birthYear;
  return age < 13 ? "child" : age < 18 ? "teen" : age < 60 ? "adult" : "senior";
}
const PROFILES: Record<AgeGroup, AgeProfile> = {
  child: { group: "child", track: "steady", listen: 5, speed: 0.75, testBonus: 8 },
  teen: { group: "teen", track: "standard", listen: 3, speed: 1, testBonus: 0 },
  adult: { group: "adult", track: "standard", listen: 3, speed: 1, testBonus: 2 },
  senior: { group: "senior", track: "steady", listen: 4, speed: 0.85, testBonus: 8 },
};
export const ageProfile = (): AgeProfile => PROFILES[groupOf(readJSON<number | null>("tf:age", null)) ?? "adult"];
export const MIN_YEAR = 1920;
