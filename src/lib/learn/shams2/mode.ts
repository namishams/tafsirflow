// mirrors mobile/src/features/shams2/mode.ts (copied for the website; keep in step with the app)
import { readJSON, useStoreVersion, writeJSON } from "@/lib/learn/store";
import { K } from "./store";

// Which Shams method a learner uses: "classic" (the Shams session of a surah in the reader, surah by surah) or "v2"
// (Shams Method 2.0, the madrasa system under /shams/method). It is only a preference: both methods keep their own data,
// so switching never loses progress. Stored as { mode, at } under its own synced key (a plain "classic" | "v2" string
// is read as well); the newer choice wins when devices are merged (syncExtra.ts).
export const SHAMS_MODE_KEY = "qmc.shamsMode.v1";
export type ShamsMode = "classic" | "v2" | "v3";
// Three named methods (owner 22.10.2026): "Shams-Methode klassisch", "Shams 2.0" and "Shams 3.0" (the recommended default).
// 2.0 and 3.0 share one engine (the madrasa wird under /shams/wird and its data); 3.0 adds the Adab of the day, the
// blind recitation and makhraj step, and the recitation coach to the daily wird (Wird screen, isV3). Decision for 2.0
// users: their wird stays as they know it (sabaq, sabqī, manzil, tathbīt, grade checks, the teacher's tasks); the 3.0
// screens stay reachable from the hub, they are just not put into the daily wird. Stored "classic" and "v2" stay valid.
export type ShamsChoice = { mode: ShamsMode; at: number };

const isMode = (x: unknown): x is ShamsMode => x === "classic" || x === "v2" || x === "v3";
/** 2.0 and 3.0 both work with the daily wird (one engine) */
export const usesWird = (mode: ShamsMode): boolean => mode !== "classic";
/** 3.0: the wird with the Adab, blind/makhraj and coach cards */
export const isV3 = (mode: ShamsMode): boolean => mode === "v3";

/** the stored value (object or plain string) as a choice, or null when there is none */
export function parseChoice(raw: unknown): ShamsChoice | null {
  if (isMode(raw)) return { mode: raw, at: 0 };
  if (raw && typeof raw === "object") {
    const r = raw as { mode?: unknown; at?: unknown };
    if (isMode(r.mode)) return { mode: r.mode, at: typeof r.at === "number" && Number.isFinite(r.at) ? r.at : 0 };
  }
  return null;
}

/** onboarding level -> method: kept for older callers; since Shams 3.0 every level starts with 3.0 */
export const modeForLevel = (level: unknown): ShamsMode | null => (level === "none" || level === "letters" || level === "slow" || level === "fluent" ? "v3" : null);

/** the method suggested before the learner has chosen: Shams 3.0 for new learners; learners from before 3.0 who never
 *  chose keep what they were using (2.0 when they already work with its wird, classic when they have classic sessions),
 *  so nobody is switched silently */
export function suggestedMode(): ShamsMode {
  if (Object.keys(readJSON<Record<string, unknown>>(K.log, {})).length) return "v2";
  if (Object.keys(readJSON<Record<string, unknown>>("tf:srs", {}) ?? {}).length) return "classic";
  return "v3";
}

// the one-time card "New: Shams 3.0 – switch now" for learners who chose 2.0 (dismissed or used once, then never again)
export const SHAMS3_OFFER_KEY = "qmc.shams3Offer.v1";
export const shams3OfferOpen = (): boolean => readShamsChoice()?.mode === "v2" && !readJSON<boolean>(SHAMS3_OFFER_KEY, false);
export const closeShams3Offer = () => writeJSON(SHAMS3_OFFER_KEY, true);

export const readShamsChoice = (): ShamsChoice | null => parseChoice(readJSON<unknown>(SHAMS_MODE_KEY, null));
/** the method in use: the learner's choice, else the suggested one */
export const readShamsMode = (): ShamsMode => readShamsChoice()?.mode ?? suggestedMode();
export const setShamsMode = (mode: ShamsMode) => writeJSON(SHAMS_MODE_KEY, { mode, at: Date.now() } satisfies ShamsChoice);

/** the method in use, whether it was chosen (otherwise it is only suggested); `ready` turns true after hydration (the
 *  stored choice lives in the browser: the server and the first paint see "classic", nothing chosen, nothing suggested) */
export function useShamsMode() {
  const v = useStoreVersion();
  if (v < 0) return { mode: "classic" as ShamsMode, chosen: false, suggested: null as ShamsMode | null, ready: false };
  const choice = readShamsChoice();
  const suggested = suggestedMode();
  return { mode: choice?.mode ?? suggested, chosen: !!choice, suggested: suggested as ShamsMode | null, ready: true };
}

/** the entry of each method on the website: the Shams session of the learner's place (or al-Fātiḥa) in the reader, or Shams Method 2.0's hub */
export const methodHref = (mode: ShamsMode, at?: { surah: number; verse?: number } | null): string =>
  usesWird(mode) ? "/shams/method" : at ? `/surah/${at.surah}?${at.verse ? `v=${at.verse}&` : ""}shams=1` : "/surah/1?shams=1";
