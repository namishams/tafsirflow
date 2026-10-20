import { readJSON, useStored, writeJSON } from "@/lib/store";

// Kids mode, like the website's KidsToggle (localStorage "tf:kids" = "1" | "0", html[data-kids="1"]).
// The value lives in the app's store under the same key (device setting, not synced with the account).
// The theme switch itself belongs in lib/theme.ts: see KIDS_PALETTE below and the notes in mobile/docs/website-parity.md.
export const KIDS_KEY = "tf:kids";

const isOn = (v: unknown) => v === "1" || v === 1 || v === true;

/** current kids mode (re-renders when it changes) */
export function useKids(): [boolean, (on: boolean) => void] {
  const v = useStored<unknown>(KIDS_KEY, "0");
  return [isOn(v), setKids];
}

export const readKids = () => isOn(readJSON<unknown>(KIDS_KEY, "0"));

/** switch kids mode on or off (silent: not part of the account sync, like on the website) */
export function setKids(on: boolean) {
  writeJSON(KIDS_KEY, on ? "1" : "0", true);
}

/**
 * The kids palette of globals.css (html[data-kids="1"]) and art-home.css, as "r g b" triples like theme.ts uses.
 * The website only defines it for light mode; dark mode keeps the normal dark palette there.
 * Also: body font Nunito (800 for display, letter-spacing 0), root font size 112.5 %, rounder corners
 * (rounded-2xl 22px, rounded-3xl 28px instead of 8/10px). Stage, gold buttons and posters stay the same.
 */
export const KIDS_PALETTE = {
  bg: "255 249 232",
  surface: "255 255 255",
  ink: "30 41 59",
  muted: "71 85 105",
  line: "250 222 160",
  accent: "37 99 235",
  accentSoft: "219 234 254",
  gold: "194 90 0",
  heroA: "37 99 235",
  heroB: "147 51 234",
  hmIvory: "255 252 242",
  hmSand: "255 246 222",
  fontScale: 1.125,
  radius: { card: 22, sheet: 28 },
} as const;
