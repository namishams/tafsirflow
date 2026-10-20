import { Appearance, Platform, useColorScheme } from "react-native";

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

export function useTheme(): Theme {
  return useColorScheme() === "dark" ? dark : light;
}

export type AppearanceSetting = "system" | "light" | "dark";
export function applyAppearance(a: AppearanceSetting) {
  if (Platform.OS === "web") return; // the browser follows the system setting
  Appearance.setColorScheme(a === "system" ? "unspecified" : a);
}

// Plus Jakarta Sans like the website; font-display = ExtraBold with tight letter spacing
export const FONT = {
  regular: "PlusJakartaSans_400Regular", medium: "PlusJakartaSans_500Medium", semibold: "PlusJakartaSans_600SemiBold",
  bold: "PlusJakartaSans_700Bold", display: "PlusJakartaSans_800ExtraBold", italic: "PlusJakartaSans_400Regular_Italic",
};
export const ARABIC_FONT = "Amiri_400Regular";
export const ARABIC_BOLD = "Amiri_700Bold";
export const CALLIG_FONT = "ArefRuqaa_700Bold";

// Text styles (sizes follow Dynamic Type automatically through allowFontScaling)
export const type = {
  display: { fontFamily: FONT.display, fontSize: 34, lineHeight: 38, letterSpacing: -0.85 },
  largeTitle: { fontFamily: FONT.display, fontSize: 30, lineHeight: 34, letterSpacing: -0.75 },
  title1: { fontFamily: FONT.display, fontSize: 26, lineHeight: 31, letterSpacing: -0.6 },
  title2: { fontFamily: FONT.display, fontSize: 22, lineHeight: 27, letterSpacing: -0.5 },
  title3: { fontFamily: FONT.bold, fontSize: 18, lineHeight: 24 },
  headline: { fontFamily: FONT.bold, fontSize: 16, lineHeight: 22 },
  body: { fontFamily: FONT.regular, fontSize: 16, lineHeight: 24 },
  callout: { fontFamily: FONT.regular, fontSize: 15, lineHeight: 23 },
  subhead: { fontFamily: FONT.regular, fontSize: 14, lineHeight: 20 },
  footnote: { fontFamily: FONT.regular, fontSize: 13, lineHeight: 18 },
  caption: { fontFamily: FONT.semibold, fontSize: 11, lineHeight: 14 },
  eyebrow: { fontFamily: FONT.semibold, fontSize: 11.5, lineHeight: 15, letterSpacing: 1.8, textTransform: "uppercase" as const },
  button: { fontFamily: FONT.bold, fontSize: 15, lineHeight: 20 },
};

// The website rounds calmly: rounded-lg/xl 6px, 2xl 8px, 3xl 10px, cards 12px, buttons fully round
export const radius = 8;
export const R = { sm: 6, md: 8, lg: 10, card: 12, pill: 999 };
