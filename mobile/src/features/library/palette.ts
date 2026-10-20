import { Platform } from "react-native";
import { useTheme } from "@/lib/theme";

// Colours of the "Islam & knowledge" pages (src/styles/art-islam.css): ivory marble, gold and inlaid stones
// (jade, lapis, garnet), the same values for light and dark mode as the website.
export type Isl = {
  dark: boolean;
  paper: string; paper2: string; gold: string; goldSoft: string; jade: string; lapis: string; garnet: string; head: string;
  /** rgba() of a palette entry with alpha */
  a: (k: "paper" | "paper2" | "gold" | "goldSoft" | "jade" | "lapis" | "garnet" | "head" | "ink" | "muted" | "accent" | "surface", alpha: number) => string;
  ink: string; muted: string; accent: string; surface: string;
};

const LIGHT = { paper: "252 248 238", paper2: "246 238 221", gold: "176 138 62", goldSoft: "201 166 94", jade: "22 104 76", lapis: "40 74 136", garnet: "158 56 70", head: "32 26 14" };
const DARK = { paper: "15 32 26", paper2: "11 25 20", gold: "214 180 108", goldSoft: "214 180 108", jade: "74 170 128", lapis: "120 152 214", garnet: "214 120 132", head: "245 236 214" };
// globals.css: ink, muted, accent, surface
const BASE_L = { ink: "13 31 25", muted: "90 103 98", accent: "6 108 78", surface: "255 255 255" };
const BASE_D = { ink: "236 238 242", muted: "140 147 158", accent: "58 190 146", surface: "13 33 26" };

const rgba = (s: string, a = 1) => `rgba(${s.split(" ").join(",")},${a})`;

function make(dark: boolean): Isl {
  const v = { ...(dark ? DARK : LIGHT), ...(dark ? BASE_D : BASE_L) };
  return {
    dark,
    paper: rgba(v.paper), paper2: rgba(v.paper2), gold: rgba(v.gold), goldSoft: rgba(v.goldSoft), jade: rgba(v.jade), lapis: rgba(v.lapis), garnet: rgba(v.garnet), head: rgba(v.head),
    ink: rgba(v.ink), muted: rgba(v.muted), accent: rgba(v.accent), surface: rgba(v.surface),
    a: (k, alpha) => rgba(v[k], alpha),
  };
}
const L = make(false), D = make(true);

export function useIsl(): Isl {
  return useTheme().dark ? D : L;
}

/** gold on the dark stage (rgb 233 207 153 in the website's art) */
export const STAGE_GOLD = "rgb(233,207,153)";
export const stageGold = (a: number) => `rgba(233,207,153,${a})`;
/** text colour on the stage */
export const STAGE_TEXT = "#eef0f3";

// The website sets headings, quotations and initials in Fraunces (a soft serif). The app bundles no Fraunces yet,
// so the platform's book serif stands in (Georgia on iOS, Noto Serif on Android) – see the report.
export const SERIF = "Fraunces_400Regular";
export const SERIF_ITALIC = "Fraunces_400Regular_Italic";
export const SERIF_BOLD = "Fraunces_600SemiBold";
