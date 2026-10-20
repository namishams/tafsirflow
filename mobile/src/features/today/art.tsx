import { type ReactNode } from "react";
import { Text, View } from "react-native";
import Svg, { Circle, Defs, LinearGradient as SvgGradient, Stop } from "react-native-svg";
import { FONT, useTheme } from "@/lib/theme";

// Small ornaments of the website's home and academy (art/HomeOrnaments.tsx): the gold ring that fills and the
// eight-pointed star badge (light, gold or emerald).
export function GoldRing({ value, size = 96, stroke = 6, dark = true, children }: { value: number; size?: number; stroke?: number; dark?: boolean; children?: ReactNode }) {
  const t = useTheme();
  const r = size / 2 - stroke - 2, c = 2 * Math.PI * r, mid = size / 2;
  return (
    <View style={{ width: size, height: size, alignItems: "center", justifyContent: "center" }}>
      <Svg width={size} height={size} style={{ position: "absolute" }}>
        <Defs><SvgGradient id="gring" x1="0" y1="0" x2="1" y2="1"><Stop offset="0" stopColor="#f3e2b6" /><Stop offset="1" stopColor="#c6a65e" /></SvgGradient></Defs>
        <Circle cx={mid} cy={mid} r={r} stroke={dark ? "rgba(255,255,255,0.12)" : t.line} strokeWidth={stroke} fill="none" />
        <Circle cx={mid} cy={mid} r={r} stroke="url(#gring)" strokeWidth={stroke} fill="none" strokeLinecap="round" strokeDasharray={`${c * Math.max(0.001, Math.min(1, value))} ${c}`} rotation={-90} origin={`${mid},${mid}`} />
      </Svg>
      {children}
    </View>
  );
}

export function StarBadge({ tone = "light", size = 40, children }: { tone?: "emerald" | "gold" | "light"; size?: number; children?: ReactNode }) {
  const t = useTheme();
  const fill = tone === "emerald" ? "rgb(6,108,78)" : tone === "gold" ? "#d8bd80" : t.surface;
  const stroke = tone === "light" ? "rgba(150,116,52,0.5)" : "transparent";
  const s = size * 0.7;
  return (
    <View style={{ width: size, height: size, alignItems: "center", justifyContent: "center" }}>
      <View style={{ position: "absolute", width: s, height: s, backgroundColor: fill, borderWidth: 1, borderColor: stroke, transform: [{ rotate: "45deg" }], borderRadius: size / 10 }} />
      <View style={{ position: "absolute", width: s, height: s, backgroundColor: fill, borderWidth: 1, borderColor: stroke, borderRadius: size / 10 }} />
      {typeof children === "string" || typeof children === "number"
        ? <Text style={{ fontFamily: FONT.bold, fontSize: size * 0.32, color: tone === "light" ? t.gold : tone === "gold" ? "rgb(8,38,29)" : "#fff" }}>{children}</Text>
        : children}
    </View>
  );
}
