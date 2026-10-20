import { Appearance, I18nManager, Platform, useColorScheme } from "react-native";
import { readJSON, useStored } from "./store";

// The colours of quranmasterclass.com (src/app/globals.css): light grey canvas, white tiles, hairline borders,
// near-black ink, deep green accent, and the dark green "stage" with gold like the binding of a fine mushaf.
export type Theme = {
  dark: boolean;
  bg: string;          // page canvas
  surface: string;     // tiles and cards
  ink: string;         // text
  muted: string;       // secondary text
  line: string;        // hairline borders
  accent: string;      // deep green
  accentSoft: string;
  gold: string;        // gold on the current canvas
  onAccent: string;
  danger: string;
  arabic: string;      // colour of the Quran text
  // aliases used by older screens
  card: string; text: string; secondary: string; tertiary: string; separator: string; fill: string; tint: string; tintText: string; tintSoft: string;
};

const rgb = (s: string, a = 1) => `rgba(${s.split(" ").join(",")},${a})`;

function make(dark: boolean, v: Record<"bg" | "surface" | "ink" | "muted" | "line" | "accent" | "accentSoft" | "gold", string>): Theme {
  return {
    dark,
    bg: rgb(v.bg), surface: rgb(v.surface), ink: rgb(v.ink), muted: rgb(v.muted), line: rgb(v.line),
    accent: rgb(v.accent), accentSoft: rgb(v.accentSoft), gold: rgb(v.gold), onAccent: dark ? "#04140F" : "#FFFFFF",
    danger: "rgb(190,84,104)", arabic: rgb(v.ink),
    card: rgb(v.surface), text: rgb(v.ink), secondary: rgb(v.muted), tertiary: rgb(v.muted, 0.6), separator: rgb(v.line),
    fill: rgb(v.line, 0.6), tint: rgb(v.accent), tintText: dark ? "#04140F" : "#FFFFFF", tintSoft: rgb(v.accentSoft),
  };
}

export const light = make(false, { bg: "245 247 246", surface: "255 255 255", ink: "13 31 25", muted: "90 103 98", line: "226 231 228", accent: "6 108 78", accentSoft: "230 242 236", gold: "150 116 52" });
export const dark = make(true, { bg: "7 22 17", surface: "13 33 26", ink: "236 238 242", muted: "140 147 158", line: "33 56 47", accent: "58 190 146", accentSoft: "22 52 42", gold: "214 178 106" });

// The stage (hero banners, Shams card, player) looks the same in light and dark mode
export const stage = {
  bg: "rgb(8,38,29)", deep: "rgb(5,28,21)", glow: "rgba(18,74,56,0.9)",
  gold: "rgb(214,180,108)", goldSoft: "rgba(214,180,108,0.35)", cream: "#f3e2b6",
  text: "#eef0f3", textSoft: "rgba(255,255,255,0.75)", textMuted: "rgba(255,255,255,0.6)", hair: "rgba(255,255,255,0.15)",
};
// btn-gold: linear-gradient(180deg, #dcc48c, #c6a65e) with dark green text
export const goldButton = { from: "#dcc48c", to: "#c6a65e", text: "rgb(8,38,29)", line: "rgb(201,166,94)" };
// Poster tiles of the course catalogue (PosterTiles.tsx TONES)
export const TONES: [string, string][] = [
  ["#0c4a37", "#06221a"], ["#3a2f12", "#14110a"], ["#173640", "#081418"], ["#1f2b44", "#0b101b"],
  ["#3b1f2b", "#160b10"], ["#2c3a1a", "#10160a"], ["#30254a", "#100c19"], ["#401c14", "#170a07"],
];

// Kids mode (website html[data-kids="1"], key tf:kids): brighter palette, Nunito, rounder shapes; light mode only.
// The stage, gold buttons and posters keep their colours.
export const kids = make(false, { bg: "255 249 232", surface: "255 255 255", ink: "30 41 59", muted: "71 85 105", line: "250 222 160", accent: "37 99 235", accentSoft: "219 234 254", gold: "194 90 0" });
const kidsOn = () => readJSON<unknown>("tf:kids", "0") === "1";

export function useTheme(): Theme {
  const scheme = useColorScheme();
  const k = useStored<unknown>("tf:kids", "0") === "1";
  if (scheme === "dark") return dark;
  return k ? kids : light;
}

export type AppearanceSetting = "system" | "light" | "dark";
export function applyAppearance(a: AppearanceSetting) {
  if (Platform.OS === "web") return; // the browser follows the system setting
  Appearance.setColorScheme(a === "system" ? "unspecified" : a);
}

// Plus Jakarta Sans like the website (Nunito in kids mode); font-display = ExtraBold with tight letter spacing.
// Getters, so a screen that re-renders after the kids switch picks up the other face.
export const FONT = {
  get regular() { return kidsOn() ? "Nunito_400Regular" : "PlusJakartaSans_400Regular"; },
  get medium() { return kidsOn() ? "Nunito_600SemiBold" : "PlusJakartaSans_500Medium"; },
  get semibold() { return kidsOn() ? "Nunito_700Bold" : "PlusJakartaSans_600SemiBold"; },
  get bold() { return kidsOn() ? "Nunito_800ExtraBold" : "PlusJakartaSans_700Bold"; },
  get display() { return kidsOn() ? "Nunito_800ExtraBold" : "PlusJakartaSans_800ExtraBold"; },
  get italic() { return kidsOn() ? "Nunito_400Regular" : "PlusJakartaSans_400Regular_Italic"; },
};
export const ARABIC_FONT = "Amiri_400Regular";
/** right-aligned Arabic script in both layouts: React Native swaps "left" and "right" in a right-to-left layout */
export const AR_RIGHT = (I18nManager.isRTL ? "left" : "right") as "left" | "right";
/** the "go on" arrow in the reading direction */
export const FWD = I18nManager.isRTL ? "←" : "→";
/** the "go back" arrow in the reading direction */
export const BACK = I18nManager.isRTL ? "→" : "←";
export const ARABIC_BOLD = "Amiri_700Bold";
export const CALLIG_FONT = "ArefRuqaa_700Bold";

// Text styles (sizes follow Dynamic Type automatically through allowFontScaling); kids mode reads 12.5 % larger
const k = (n: number) => (kidsOn() ? Math.round(n * 1.125) : n);
const tight = (n: number) => (kidsOn() ? 0 : n);
export const type = {
  get display() { return { fontFamily: FONT.display, fontSize: k(34), lineHeight: k(38), letterSpacing: tight(-0.85) }; },
  get largeTitle() { return { fontFamily: FONT.display, fontSize: k(30), lineHeight: k(34), letterSpacing: tight(-0.75) }; },
  get title1() { return { fontFamily: FONT.display, fontSize: k(26), lineHeight: k(31), letterSpacing: tight(-0.6) }; },
  get title2() { return { fontFamily: FONT.display, fontSize: k(22), lineHeight: k(27), letterSpacing: tight(-0.5) }; },
  get title3() { return { fontFamily: FONT.bold, fontSize: k(18), lineHeight: k(24) }; },
  get headline() { return { fontFamily: FONT.bold, fontSize: k(16), lineHeight: k(22) }; },
  get body() { return { fontFamily: FONT.regular, fontSize: k(16), lineHeight: k(24) }; },
  get callout() { return { fontFamily: FONT.regular, fontSize: k(15), lineHeight: k(23) }; },
  get subhead() { return { fontFamily: FONT.regular, fontSize: k(14), lineHeight: k(20) }; },
  get footnote() { return { fontFamily: FONT.regular, fontSize: k(13), lineHeight: k(18) }; },
  get caption() { return { fontFamily: FONT.semibold, fontSize: k(11), lineHeight: k(14) }; },
  get eyebrow() { return { fontFamily: FONT.semibold, fontSize: k(11.5), lineHeight: k(15), letterSpacing: kidsOn() ? 1 : 1.8, textTransform: "uppercase" as const }; },
  get button() { return { fontFamily: FONT.bold, fontSize: k(15), lineHeight: k(20) }; },
};

// The website rounds calmly: rounded-lg/xl 6px, 2xl 8px, 3xl 10px, cards 12px, buttons fully round
export const radius = 8;
// kids mode: rounder (rounded-2xl 22px, rounded-3xl 28px on the website)
export const R = {
  get sm() { return kidsOn() ? 12 : 6; }, get md() { return kidsOn() ? 16 : 8; }, get lg() { return kidsOn() ? 22 : 10; },
  get card() { return kidsOn() ? 22 : 12; }, pill: 999,
};
