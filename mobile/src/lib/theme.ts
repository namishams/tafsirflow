import { Appearance, Platform, useColorScheme } from "react-native";

// Calm, Apple-like colours: system greys for surfaces and text, one deep green as the accent.
export type Theme = {
  dark: boolean;
  bg: string;          // grouped background
  card: string;        // rows and sections
  text: string;
  secondary: string;   // secondary label
  tertiary: string;
  separator: string;
  fill: string;        // quiet fills (chips, progress tracks)
  tint: string;        // accent
  tintText: string;    // text on the accent
  tintSoft: string;
  danger: string;
  arabic: string;      // colour of the Quran text
};

const light: Theme = {
  dark: false,
  bg: "#F2F2F7", card: "#FFFFFF", text: "#000000",
  secondary: "rgba(60,60,67,0.6)", tertiary: "rgba(60,60,67,0.3)", separator: "rgba(60,60,67,0.29)",
  fill: "rgba(120,120,128,0.12)", tint: "#0A6B4E", tintText: "#FFFFFF", tintSoft: "rgba(10,107,78,0.10)",
  danger: "#FF3B30", arabic: "#111111",
};
const dark: Theme = {
  dark: true,
  bg: "#000000", card: "#1C1C1E", text: "#FFFFFF",
  secondary: "rgba(235,235,245,0.6)", tertiary: "rgba(235,235,245,0.3)", separator: "rgba(84,84,88,0.6)",
  fill: "rgba(120,120,128,0.24)", tint: "#3DC495", tintText: "#00110B", tintSoft: "rgba(61,196,149,0.16)",
  danger: "#FF453A", arabic: "#F5F5F5",
};

export function useTheme(): Theme {
  return useColorScheme() === "dark" ? dark : light;
}

export type AppearanceSetting = "system" | "light" | "dark";
export function applyAppearance(a: AppearanceSetting) {
  if (Platform.OS === "web") return; // the browser follows the system setting
  Appearance.setColorScheme(a === "system" ? "unspecified" : a);
}

// iOS text styles (sizes follow Dynamic Type automatically through allowFontScaling)
export const type = {
  largeTitle: { fontSize: 34, lineHeight: 41, fontWeight: "700" as const },
  title1: { fontSize: 28, lineHeight: 34, fontWeight: "700" as const },
  title2: { fontSize: 22, lineHeight: 28, fontWeight: "700" as const },
  title3: { fontSize: 20, lineHeight: 25, fontWeight: "600" as const },
  headline: { fontSize: 17, lineHeight: 22, fontWeight: "600" as const },
  body: { fontSize: 17, lineHeight: 22 },
  callout: { fontSize: 16, lineHeight: 21 },
  subhead: { fontSize: 15, lineHeight: 20 },
  footnote: { fontSize: 13, lineHeight: 18 },
  caption: { fontSize: 12, lineHeight: 16 },
};

export const ARABIC_FONT = "Amiri_400Regular";
export const radius = Platform.OS === "ios" ? 10 : 12;
