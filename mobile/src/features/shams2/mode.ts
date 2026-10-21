import { readJSON, useStoreVersion, writeJSON } from "@/lib/store";
import { QUIZ_KEY } from "@/features/plan/plan";
import { K } from "./store";

// Which Shams method a learner uses: "classic" (the sessions under /shams/[surah], surah by surah) or "v2" (Shams Method
// 2.0, the madrasa system under /shams/method). It is only a preference: both methods keep their own data (the classic
// keys "tf:srs", "tf:days", "qmc.shams-program.v1" and the "qmc.shams2.*" keys), so switching never loses progress.
// The choice is stored as { mode, at } under its own synced key (a plain "classic" | "v2" string is read as well);
// the newer choice wins when devices are merged (lib/syncExtra.ts).
export const SHAMS_MODE_KEY = "qmc.shamsMode.v1";
export type ShamsMode = "classic" | "v2";
export type ShamsChoice = { mode: ShamsMode; at: number };

const isMode = (x: unknown): x is ShamsMode => x === "classic" || x === "v2";

/** the stored value (object or plain string) as a choice, or null when there is none */
export function parseChoice(raw: unknown): ShamsChoice | null {
  if (isMode(raw)) return { mode: raw, at: 0 };
  if (raw && typeof raw === "object") {
    const r = raw as { mode?: unknown; at?: unknown };
    if (isMode(r.mode)) return { mode: r.mode, at: typeof r.at === "number" && Number.isFinite(r.at) ? r.at : 0 };
  }
  return null;
}

/** onboarding level -> method: beginners ("none", "letters") start with the classic one, readers ("slow", "fluent") with 2.0 */
export const modeForLevel = (level: unknown): ShamsMode | null => (level === "none" || level === "letters" ? "classic" : level === "slow" || level === "fluent" ? "v2" : null);

/** the method suggested before the learner has chosen: by the level from the onboarding quiz; without answers, 2.0 for
 *  those who already work with its wird and the classic one for everyone else */
export function suggestedMode(): ShamsMode {
  const byLevel = modeForLevel(readJSON<{ level?: unknown } | null>(QUIZ_KEY, null)?.level);
  if (byLevel) return byLevel;
  return Object.keys(readJSON<Record<string, unknown>>(K.log, {})).length ? "v2" : "classic";
}

export const readShamsChoice = (): ShamsChoice | null => parseChoice(readJSON<unknown>(SHAMS_MODE_KEY, null));
/** the method in use: the learner's choice, else the suggested one */
export const readShamsMode = (): ShamsMode => readShamsChoice()?.mode ?? suggestedMode();
export const setShamsMode = (mode: ShamsMode) => writeJSON(SHAMS_MODE_KEY, { mode, at: Date.now() } satisfies ShamsChoice);

/** the method in use, whether it was chosen (otherwise it is only suggested) and how to change it; re-renders on change */
export function useShamsMode() {
  useStoreVersion();
  const choice = readShamsChoice();
  const suggested = suggestedMode();
  return { mode: choice?.mode ?? suggested, chosen: !!choice, suggested, set: setShamsMode };
}

/** the entry of each method: the classic session at the learner's place (or al-Fātiḥa), or Shams Method 2.0's hub */
export const methodHref = (mode: ShamsMode, at?: { surah: number; verse?: number } | null): string =>
  mode === "v2" ? "/shams/method" : at ? `/shams/${at.surah}${at.verse ? `?v=${at.verse}` : ""}` : "/shams/1";

/** where "Continue" and "Today's step" lead: today's wird (2.0) or the classic session at the learner's place */
export const continueHref = (mode: ShamsMode, at?: { surah: number; verse?: number } | null): string =>
  mode === "v2" ? "/shams/wird" : methodHref("classic", at);

/** a step of the 30-day plan: the Shams steps open today's wird in 2.0, everything else stays as planned */
export const planStepHref = (id: string, href: string, mode: ShamsMode): string =>
  mode === "v2" && (id === "shams" || id === "shamsShort" || id === "shamsLong") ? "/shams/wird" : href;
