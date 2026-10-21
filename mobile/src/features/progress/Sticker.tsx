import { type ReactNode } from "react";
import { StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";
import Svg, { Circle, Defs, G, LinearGradient, Path, RadialGradient, Rect, Stop, Text as SvgText } from "react-native-svg";
import { ARABIC_FONT, useTheme } from "@/lib/theme";
import type { Icon, StickerDef, Tone } from "@/web/stickers";
import { starPolygon } from "./art";

// A sticker is a small tile medallion: a gilded sixteen-point rosette, an enamel disc in the tone of the stage, and a
// line drawing in the middle (website: src/components/Sticker.tsx). Locked stickers are grey and faint, with a gold
// ring showing how close they are.
const TONES: Record<Tone, [string, string, string]> = {
  earth: ["#a8834a", "#33250f", "#f3dcb6"],
  leaf: ["#46936a", "#0f2d20", "#d8f0d0"],
  gold: ["#d9b86e", "#4a3612", "#fff3d6"],
  night: ["#2f7a62", "#0d2f25", "#e6efe9"],
  dawn: ["#cfb47f", "#302715", "#f7f0e1"],
  sun: ["#e2c27d", "#5c4210", "#fff6dc"],
  sea: ["#3fa989", "#0e3126", "#e0f6ef"],
  rose: ["#bd9c5a", "#3a2c0f", "#f8f1e2"],
};
const MEDAL = ["#f6e7bf", "#c9a65e", "#efe2bf", "#8f7238"];

// CSS grayscale(): the same colour as a grey of equal luminance
function gray(hex: string) {
  const n = parseInt(hex.slice(1), 16);
  const y = Math.round(0.2126 * (n >> 16) + 0.7152 * ((n >> 8) & 255) + 0.0722 * (n & 255));
  const h = y.toString(16).padStart(2, "0");
  return `#${h}${h}${h}`;
}

const rays = (n: number, r1: number, r2: number) => Array.from({ length: n }, (_, i) => {
  const a = ((Math.PI * 2) / n) * i;
  return `M${(50 + r1 * Math.cos(a)).toFixed(1)} ${(50 + r1 * Math.sin(a)).toFixed(1)}L${(50 + r2 * Math.cos(a)).toFixed(1)} ${(50 + r2 * Math.sin(a)).toFixed(1)}`;
}).join("");

const ICONS: Record<Icon, (c: string) => ReactNode> = {
  seed: () => <><Path d="M51 34c9 7 11 18 6 26-3 5-9 7-13 5-5-3-6-10-4-18 2-6 6-10 11-13z" /><Path d="M49 40c2 8 2 16 0 23" /></>,
  drop: () => <><Path d="M50 32c7 9 12 16 12 23a12 12 0 0 1-24 0c0-7 5-14 12-23z" /><Path d="M44 57a6 6 0 0 0 5 6" /></>,
  sprout: () => <><Path d="M50 67V50" /><Path d="M50 53c-9 0-14-5-14-13 8 0 14 5 14 13z" /><Path d="M50 49c0-8 5-14 13-14 0 8-5 14-13 14z" /><Path d="M40 67h20" /></>,
  branch: () => <><Path d="M35 66C46 58 54 48 63 33" /><Path d="M44 58c-6-2-9-7-8-12 6 1 9 6 8 12z" /><Path d="M52 48c-1-6 2-11 8-12 0 6-3 10-8 12z" /><Path d="M56 43c6 1 10 5 10 10-6 0-9-4-10-10z" /></>,
  tree: () => <><Path d="M50 70V50" /><Path d="M50 58l-7-6M50 55l7-6" /><Circle cx={50} cy={41} r={13} /><Path d="M41 70h18" /></>,
  fruit: () => <><Circle cx={50} cy={55} r={13} /><Path d="M45 42l1-6 4 4 4-4 1 6" /><Path d="M44 55c3 4 9 4 12 0" /></>,
  lamp: () => <><Path d="M50 29v6" /><Path d="M42 35h16" /><Path d="M41 39h18l-3 20c-1 5-11 5-12 0z" /><Path d="M50 45c3 3 3 7 0 9-3-2-3-6 0-9z" /><Path d="M43 66h14" /></>,
  star: () => <><Rect x={39} y={39} width={22} height={22} /><Rect x={39} y={39} width={22} height={22} transform="rotate(45 50 50)" /><Circle cx={50} cy={50} r={4} /></>,
  crescent: () => <><Path d="M57 33a17 17 0 1 0 0 34 13 13 0 1 1 0-34z" /><Path d="M64 45l1.5 3.2 3.3 1.4-3.3 1.4L64 54.2l-1.5-3.2-3.3-1.4 3.3-1.4z" /></>,
  moon: () => <><Circle cx={50} cy={50} r={16} /><Circle cx={45} cy={45} r={3} /><Circle cx={56} cy={56} r={2.2} /><Circle cx={55} cy={43} r={1.4} /></>,
  dawn: () => <><Path d="M31 60h38" /><Path d="M38 60a12 12 0 0 1 24 0" /><Path d="M50 41v-6M39 46l-3-3M61 46l3-3M33 53h-3M67 53h3" /><Path d="M38 66h24" /></>,
  sun: () => <><Circle cx={50} cy={50} r={10} /><Path d={rays(12, 14, 20)} /></>,
  ear: () => <><Path d="M38 45v10M44 39v22M50 43v14M56 35v30M62 41v18" /></>,
  book: () => <><Path d="M50 40c-6-4-12-4-17-2v24c5-2 11-2 17 2 6-4 12-4 17-2V38c-5-2-11-2-17 2z" /><Path d="M50 40v24" /></>,
  open: () => <><Path d="M37 66V46a13 13 0 0 1 26 0v20" /><Path d="M34 66h32" /><Path d="M44 66V50a6 6 0 0 1 12 0v16" /></>,
  layers: () => <><Path d="M33 45l17-8 17 8-17 8z" /><Path d="M33 53l17 8 17-8" /><Path d="M33 61l17 8 17-8" /></>,
  path: () => <><Path d="M35 66c9-4 4-12 15-16s7-12 15-16" /><Circle cx={35} cy={66} r={2.5} /><Circle cx={65} cy={34} r={2.5} /></>,
  flame: () => <Path d="M50 31c2 8 12 12 12 23a12 12 0 0 1-24 0c0-6 4-9 6-12 1 4 3 6 5 6-1-6 0-11 1-17z" />,
  letters: (c) => <SvgText x={50} y={60} textAnchor="middle" fontSize={25} fill={c} stroke="none" fontFamily={ARABIC_FONT}>أ ب</SvgText>,
  water: () => <><Path d="M50 31c4 5 6 8 6 11a6 6 0 0 1-12 0c0-3 2-6 6-11z" /><Path d="M35 54c4 7 9 10 15 10s11-3 15-10" /><Path d="M35 54h9M56 54h9" /></>,
  compass: () => <><Circle cx={50} cy={50} r={15} /><Path d="M50 37l4 13-4 13-4-13z" /></>,
  sunrise: () => <><Path d="M31 62h38" /><Path d="M40 62a10 10 0 0 1 20 0" /><Path d="M50 45v-7M41 49l-3-3M59 49l3-3" /><Path d="M58 34a6 6 0 1 0 0 9 4.5 4.5 0 1 1 0-9z" /></>,
  heart: () => <Path d="M50 64c-12-8-16-14-16-20a8 8 0 0 1 16-3 8 8 0 0 1 16 3c0 6-4 12-16 20z" />,
};

export function Sticker({ def, size = 96, locked = false, pct = 0, style }: { def: StickerDef; size?: number; locked?: boolean; pct?: number; style?: StyleProp<ViewStyle> }) {
  const t = useTheme();
  const tone = TONES[def.tone];
  const [a, b, c] = locked ? tone.map(gray) : tone;
  const m = locked ? MEDAL.map(gray) : MEDAL;
  return (
    <View style={[{ width: size, height: size }, style]} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      <Svg width={size} height={size} viewBox="0 0 100 100" style={[StyleSheet.absoluteFill, locked && { opacity: 0.3 }]}>
        <Defs>
          <RadialGradient id="e" cx="35%" cy="30%" r="85%"><Stop offset="0" stopColor={a} /><Stop offset="1" stopColor={b} /></RadialGradient>
          <LinearGradient id="m" x1="0" y1="0" x2="1" y2="1"><Stop offset="0" stopColor={m[0]} /><Stop offset="0.45" stopColor={m[1]} /><Stop offset="0.7" stopColor={m[2]} /><Stop offset="1" stopColor={m[3]} /></LinearGradient>
        </Defs>
        <Path d={starPolygon(50, 50, 49, 41, 8)} fill="url(#m)" />
        <Path d={starPolygon(50, 50, 46, 39, 8)} transform="rotate(22.5 50 50)" fill="url(#m)" opacity={0.8} />
        <Circle cx={50} cy={50} r={36} fill="url(#e)" stroke="#5c4519" strokeOpacity={0.5} strokeWidth={1} />
        <Circle cx={50} cy={50} r={31.5} fill="none" stroke={c} strokeOpacity={0.35} strokeWidth={0.7} strokeDasharray="1 2.6" />
        <G stroke={c} fill="none" strokeWidth={2.3} strokeLinecap="round" strokeLinejoin="round">{ICONS[def.icon](c)}</G>
        <Path d="M24 38a29 29 0 0 1 36-20" stroke="#fff" strokeOpacity={0.22} strokeWidth={3} fill="none" strokeLinecap="round" />
      </Svg>
      {locked && pct > 0 ? (
        <Svg width={size} height={size} viewBox="0 0 100 100" style={StyleSheet.absoluteFill}>
          <Circle cx={50} cy={50} r={47} fill="none" stroke={t.gold} strokeWidth={3} strokeLinecap="round" strokeDasharray={`${(Math.min(1, pct) * 295).toFixed(1)} 400`} transform="rotate(-90 50 50)" />
        </Svg>
      ) : null}
    </View>
  );
}

export default Sticker;
