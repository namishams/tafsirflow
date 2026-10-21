import { type ReactNode } from "react";
import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Svg, { Circle, Defs, G, LinearGradient as SvgGradient, Path, Stop } from "react-native-svg";
import { FONT, stage, useTheme, type Theme } from "@/lib/theme";

// The ornaments of the website's progress pages (Rewards.tsx, Ranking.tsx, art/HomeOrnaments.tsx, art/QuranArt.tsx,
// globals.css .callout / .illum-frame, art-home.css .hm-bar), drawn with react-native-svg.

export const HM_GOLD = "rgb(201,166,94)";
export const HM_GOLD_L = "rgb(233,207,153)";
export const STAGE = "rgb(8,38,29)";
export const RED = "rgb(178,72,64)";
export const hmIvory = (t: Theme) => (t.dark ? "rgb(15,35,28)" : "rgb(252,249,241)");
export const hmGoldD = (t: Theme) => (t.dark ? "rgb(214,178,106)" : "rgb(150,116,52)");
/** text in --q-ink-gold */
export const inkGold = (t: Theme) => (t.dark ? "rgb(222,190,124)" : "rgb(128,96,38)");

/** the same colour with another opacity: alpha("rgba(6,108,78,1)", .7) / alpha("#c9a65e", .4) */
export function alpha(c: string, a: number): string {
  const m = /rgba?\(([^)]+)\)/.exec(c);
  if (m) { const [r, g, b] = m[1].split(",").map((x) => x.trim()); return `rgba(${r},${g},${b},${a})`; }
  const h = /^#([0-9a-f]{6})$/i.exec(c);
  if (h) { const n = parseInt(h[1], 16); return `rgba(${n >> 16},${(n >> 8) & 255},${n & 255},${a})`; }
  return c;
}

// eight-pointed star (two overlapping squares) as one path: 8 outer points, 8 inner corners
export function khatam(cx: number, cy: number, R: number) {
  const r = R * 0.7654;
  const pts = Array.from({ length: 16 }, (_, i) => { const a = (Math.PI / 8) * i - Math.PI / 2, rad = i % 2 ? r : R; return `${(cx + rad * Math.cos(a)).toFixed(2)},${(cy + rad * Math.sin(a)).toFixed(2)}`; });
  return `M${pts.join("L")}Z`;
}
/** star polygon with n points between radius R and r around (cx, cy) */
export function starPolygon(cx: number, cy: number, R: number, r: number, n: number) {
  const pts: string[] = [];
  for (let i = 0; i < n * 2; i++) {
    const a = (Math.PI / n) * i - Math.PI / 2, rad = i % 2 ? r : R;
    pts.push(`${(cx + rad * Math.cos(a)).toFixed(2)},${(cy + rad * Math.sin(a)).toFixed(2)}`);
  }
  return `M${pts.join("L")}Z`;
}

const MEDAL_STOPS = [["0", "#f6e7bf"], ["0.45", "#c9a65e"], ["0.7", "#efe2bf"], ["1", "#8f7238"]] as const;

/** level seal: a gilded 24-point rosette with the level number (Rewards.tsx LevelSeal) */
export function LevelSeal({ n, size = 148 }: { n: number; size?: number }) {
  return (
    <View style={{ width: size, height: size, alignItems: "center", justifyContent: "center" }} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      <Svg width={size} height={size} viewBox="0 0 100 100" style={StyleSheet.absoluteFill}>
        <Defs>
          <SvgGradient id="lvl" x1="0" y1="0" x2="1" y2="1">{MEDAL_STOPS.map(([o, c]) => <Stop key={o} offset={o} stopColor={c} />)}</SvgGradient>
        </Defs>
        <Path d={starPolygon(50, 50, 49, 40, 12)} fill="url(#lvl)" />
        <Circle cx={50} cy={50} r={35} fill="#0f2d20" stroke="#5c4519" strokeOpacity={0.5} />
        <Circle cx={50} cy={50} r={30} fill="none" stroke="#f3e2b6" strokeOpacity={0.35} strokeDasharray="1 2.6" />
      </Svg>
      <Text allowFontScaling={false} style={{ fontFamily: FONT.display, fontSize: size * 0.34, lineHeight: size * 0.42, color: "#f3e2b6", marginTop: size * 0.02 }}>{n}</Text>
    </View>
  );
}

/** podium medal of the ranking (Ranking.tsx Medal) */
export function Medal({ place, color, size }: { place: number; color: string; size: number }) {
  return (
    <View style={{ width: size, height: size, alignItems: "center", justifyContent: "center" }}>
      <Svg width={size} height={size} viewBox="0 0 100 100" style={StyleSheet.absoluteFill}>
        <Path d={starPolygon(50, 50, 49, 40, 8)} fill={color} stroke="#8f7238" strokeOpacity={0.5} />
        <Circle cx={50} cy={50} r={33} fill={STAGE} />
        <Circle cx={50} cy={50} r={28} fill="none" stroke={color} strokeOpacity={0.5} strokeDasharray="1 2.6" />
      </Svg>
      <Text allowFontScaling={false} style={{ fontFamily: FONT.bold, fontSize: size * 0.32, color }}>{place}</Text>
    </View>
  );
}

/** gold progress ring with a crown of small stars (HomeOrnaments.tsx HomeRing) */
export function HomeRing({ value, size = 96, dark = true, stroke = 6, children }: { value: number; size?: number; dark?: boolean; stroke?: number; children?: ReactNode }) {
  const r = 40, c = 2 * Math.PI * r, v = Math.max(0, Math.min(1, value));
  return (
    <View style={{ width: size, height: size, alignItems: "center", justifyContent: "center" }}>
      <Svg width={size} height={size} viewBox="0 0 100 100" style={StyleSheet.absoluteFill}>
        <Defs>
          <SvgGradient id="ring" x1="0" y1="0" x2="1" y2="1"><Stop offset="0" stopColor="#f3e2b6" /><Stop offset="0.5" stopColor="#c9a65e" /><Stop offset="1" stopColor="#e9cf99" /></SvgGradient>
        </Defs>
        <G fill={dark ? "#e9cf99" : "#c9a65e"} fillOpacity={dark ? 0.35 : 0.45}>
          {Array.from({ length: 16 }, (_, i) => { const a = (Math.PI / 8) * i; return <Path key={i} d={khatam(50 + 48 * Math.sin(a), 50 - 48 * Math.cos(a), i % 2 ? 1.4 : 2.2)} />; })}
        </G>
        <Circle cx={50} cy={50} r={r} fill="none" stroke={dark ? "rgba(255,255,255,0.13)" : "rgba(201,166,94,0.18)"} strokeWidth={stroke} />
        <Circle cx={50} cy={50} r={r - stroke / 2 - 3} fill="none" stroke={dark ? "#e9cf99" : "#c9a65e"} strokeOpacity={0.3} strokeWidth={0.6} strokeDasharray="1 2.4" />
        {v > 0 ? <Circle cx={50} cy={50} r={r} fill="none" stroke="url(#ring)" strokeWidth={stroke} strokeLinecap="round" strokeDasharray={`${(v * c).toFixed(1)} ${c.toFixed(1)}`} transform="rotate(-90 50 50)" /> : null}
      </Svg>
      <View style={{ alignItems: "center" }}>{children}</View>
    </View>
  );
}

/** a number inside an eight-pointed star medallion (HomeOrnaments.tsx HomeStar, tones light and gold) */
export function HomeStar({ n, size = 46, tone = "light" }: { n: number | string; size?: number; tone?: "light" | "gold" }) {
  const t = useTheme();
  const gold = tone === "gold";
  return (
    <View style={{ width: size, height: size, alignItems: "center", justifyContent: "center" }}>
      <Svg width={size} height={size} viewBox="0 0 40 40" style={StyleSheet.absoluteFill}>
        <Path d={khatam(20, 20, 19)} fill={gold ? "rgb(218,190,128)" : hmIvory(t)} stroke={gold ? "rgb(150,116,52)" : HM_GOLD} strokeWidth={1.1} />
        <Path d={khatam(20, 20, 15.6)} fill="none" stroke={gold ? "rgba(255,255,255,0.55)" : "rgba(201,166,94,0.55)"} strokeWidth={0.7} />
        <Circle cx={20} cy={20} r={10.5} fill={gold ? "rgba(255,255,255,0.12)" : "rgba(201,166,94,0.08)"} stroke={gold ? "rgba(120,90,30,0.35)" : "rgba(201,166,94,0.45)"} strokeWidth={0.6} strokeDasharray="1 1.6" />
      </Svg>
      <Text allowFontScaling={false} style={{ fontFamily: FONT.display, fontSize: 17, letterSpacing: -0.3, color: gold ? STAGE : hmGoldD(t) }}>{n}</Text>
    </View>
  );
}

const pt = (r: number, deg: number, cx: number, cy: number) => { const a = (deg * Math.PI) / 180; return `${(cx + r * Math.cos(a)).toFixed(2)},${(cy + r * Math.sin(a)).toFixed(2)}`; };
const octagram = (a: number, cx: number, cy: number) => `M${Array.from({ length: 16 }, (_, i) => pt(i % 2 ? a / Math.cos(Math.PI / 8) : a * Math.SQRT2, i * 22.5 - 90, cx, cy)).join("L")}Z`;
const RING_STAR = octagram(30, 60, 60);
const TICKS = Array.from({ length: 32 }, (_, i) => `M${pt(i % 4 ? 49 : 47, i * 11.25 - 90, 60, 60)}L${pt(51, i * 11.25 - 90, 60, 60)}`).join("");
const Q_STAR = octagram(11.6, 26, 26);

/** large gold progress ring around an eight-pointed star (QuranArt.tsx QuranRing, learning plans) */
export function QuranRing({ pct, size = 128, children }: { pct: number; size?: number; children?: ReactNode }) {
  const t = useTheme();
  const p = Math.max(0, Math.min(100, pct));
  const c = 2 * Math.PI * 56;
  return (
    <View style={{ width: size, height: size, alignItems: "center", justifyContent: "center" }}>
      <Svg width={size} height={size} viewBox="0 0 120 120" style={StyleSheet.absoluteFill}>
        <Defs>
          <SvgGradient id="qr" x1="0" y1="0" x2="1" y2="1"><Stop offset="0" stopColor="#e9cf99" /><Stop offset="0.5" stopColor="#c9a65e" /><Stop offset="1" stopColor="#a8803a" /></SvgGradient>
        </Defs>
        <Path d={RING_STAR} fill="rgba(201,166,94,0.07)" stroke="rgba(201,166,94,0.35)" strokeWidth={0.8} />
        <Path d={TICKS} fill="none" stroke={t.gold} strokeOpacity={0.5} strokeWidth={0.8} />
        <Circle cx={60} cy={60} r={56} fill="none" stroke="rgba(201,166,94,0.22)" strokeWidth={3} />
        {p > 0 ? <Circle cx={60} cy={60} r={56} fill="none" stroke="url(#qr)" strokeWidth={4} strokeLinecap="round" strokeDasharray={`${((Math.max(p, 1.5) / 100) * c).toFixed(1)} ${c.toFixed(1)}`} transform="rotate(-90 60 60)" /> : null}
      </Svg>
      <View style={{ alignItems: "center" }}>{children}</View>
    </View>
  );
}

/** a step number inside an eight-pointed star (QuranArt.tsx QuranStar) */
export function QuranStar({ n, size = 36 }: { n: number | string; size?: number }) {
  const t = useTheme();
  return (
    <View style={{ width: size, height: size, alignItems: "center", justifyContent: "center" }}>
      <Svg width={size} height={size} viewBox="0 0 52 52" style={StyleSheet.absoluteFill}>
        <Circle cx={26} cy={26} r={24.5} fill="none" stroke="rgba(201,166,94,0.4)" strokeWidth={1} strokeDasharray=".6 3.2" strokeLinecap="round" />
        <Path d={Q_STAR} fill="rgba(201,166,94,0.1)" stroke={t.gold} strokeWidth={1} strokeLinejoin="round" />
        <Circle cx={26} cy={26} r={9.6} fill="none" stroke="rgba(201,166,94,0.4)" strokeWidth={0.7} />
      </Svg>
      <Text allowFontScaling={false} style={{ fontFamily: FONT.bold, fontSize: size * 0.28, color: t.ink }}>{n}</Text>
    </View>
  );
}

/** small gilded rosette for the corners of a card (Ornaments.tsx Rosette) */
export function Rosette({ size = 20, color = stage.gold }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 32 32">
      <Path d={starPolygon(16, 16, 14, 9, 16)} fill={color} fillOpacity={0.18} stroke={color} strokeWidth={0.8} />
      <Circle cx={16} cy={16} r={6.5} fill="none" stroke={color} strokeWidth={0.8} />
      <Path d="M16 11.5l1.4 3.1 3.1 1.4-3.1 1.4-1.4 3.1-1.4-3.1-3.1-1.4 3.1-1.4z" fill={color} />
    </Svg>
  );
}

/** small star used as a bullet (HomeOrnaments.tsx StarGlyph) */
export function StarGlyph({ size = 12, color }: { size?: number; color: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d={khatam(12, 12, 11.5)} fill={color} fillOpacity={0.25} stroke={color} strokeWidth={1.2} />
      <Circle cx={12} cy={12} r={3} fill={color} />
    </Svg>
  );
}

/** the Pro seal: a gilded star with a five-pointed star inside (PremiumPanel.tsx Seal) */
export function ProSeal({ size = 16 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <Defs><SvgGradient id="seal" x1="0" y1="0" x2="1" y2="1"><Stop offset="0" stopColor="#f6e7bf" /><Stop offset="0.45" stopColor="#c9a65e" /><Stop offset="0.75" stopColor="#efe2bf" /><Stop offset="1" stopColor="#8f7238" /></SvgGradient></Defs>
      <Path d={starPolygon(50, 50, 48, 38, 8)} fill="url(#seal)" />
      <Circle cx={50} cy={50} r={27} fill="#0f2d20" />
      <Path d="M50 33l4.5 9.5 10.5 1.4-7.6 7.3 1.9 10.4L50 56.6l-9.3 5 1.9-10.4-7.6-7.3 10.5-1.4z" fill="url(#seal)" />
    </Svg>
  );
}

/** .callout: surface with a gold border, a gold wash from the top and a gold hairline on the top edge */
export function Callout({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  const t = useTheme();
  return (
    <View style={[{ borderRadius: 8, borderWidth: 1, borderColor: alpha(t.gold, 0.28), backgroundColor: t.surface, overflow: "hidden" }, style]}>
      <LinearGradient pointerEvents="none" colors={[alpha(t.gold, 0.07), alpha(t.gold, 0)]} locations={[0, 0.7]} style={StyleSheet.absoluteFill} />
      <LinearGradient pointerEvents="none" colors={[alpha(t.gold, 0), alpha(t.gold, 0.95), alpha(t.gold, 0)]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={{ position: "absolute", top: 0, left: 22, right: 22, height: 1 }} />
      {children}
    </View>
  );
}

/** .illum-frame: two fine gold frames inside a dark card */
export function IllumFrame() {
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <View style={{ position: "absolute", top: 7, left: 7, right: 7, bottom: 7, borderRadius: 12, borderWidth: 1, borderColor: "rgba(201,166,94,0.45)" }} />
      <View style={{ position: "absolute", top: 12, left: 12, right: 12, bottom: 12, borderRadius: 9, borderWidth: 1, borderColor: "rgba(201,166,94,0.22)" }} />
    </View>
  );
}

/** .hm-bar: rounded progress bar (accent or gold) with a small gold diamond at its end */
export function HmBar({ value, gold, onStage, style }: { value: number; gold?: boolean; onStage?: boolean; style?: StyleProp<ViewStyle> }) {
  const t = useTheme();
  const v = Math.max(0, Math.min(1, value));
  return (
    <View style={[{ height: 6, borderRadius: 3, backgroundColor: onStage ? "rgba(255,255,255,0.12)" : "rgba(201,166,94,0.14)" }, style]}
      accessibilityRole="progressbar" accessibilityValue={{ min: 0, max: 100, now: Math.round(v * 100) }}>
      <View style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: `${v * 100}%` }}>
        <LinearGradient colors={gold ? ["#c6a65e", "#e3cb93"] : [t.accent, alpha(t.accent, 0.75)]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={{ flex: 1, borderRadius: 3 }} />
        {v > 0 ? <View style={{ position: "absolute", right: -5, top: -2, width: 10, height: 10, borderRadius: 2, transform: [{ rotate: "45deg" }], backgroundColor: HM_GOLD, borderWidth: 2, borderColor: onStage ? STAGE : t.surface }} /> : null}
      </View>
    </View>
  );
}

/** thin full-width bar (rounded-full bg-white/10 with a gold fill), used for the level progress */
export function LevelBar({ value, height = 10, track = "rgba(255,255,255,0.1)", fill = stage.gold }: { value: number; height?: number; track?: string; fill?: string }) {
  const v = Math.max(0, Math.min(1, value));
  return (
    <View style={{ height, borderRadius: height / 2, backgroundColor: track, overflow: "hidden" }} accessibilityRole="progressbar" accessibilityValue={{ min: 0, max: 100, now: Math.round(v * 100) }}>
      <View style={{ height, width: `${v * 100}%`, borderRadius: height / 2, backgroundColor: fill }} />
    </View>
  );
}
