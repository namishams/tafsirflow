import { memo, useEffect } from "react";
import { View } from "react-native";
import Svg, { Circle, ClipPath, Defs, G, LinearGradient as SvgLinear, Path, Stop, Text as SvgText } from "react-native-svg";
import Animated, { Easing, cancelAnimation, useAnimatedStyle, useSharedValue, withRepeat, withTiming } from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import { ARABIC_FONT, CALLIG_FONT, FONT } from "@/lib/theme";
import { hashId, itemById, rarityOf, type Rarity, type Series } from "./catalog";

// Procedural sticker art: frame shape × geometric pattern × palette × rarity, all from the id. Only text and
// geometry (no people, faces or living beings; no Quran text — verse stickers show the verse key and surah name).
const FRAMES = ["circle", "octagon", "arch", "star", "hex", "rosette"] as const;
type Frame = (typeof FRAMES)[number];
const PALETTES: [string, string, string][] = [
  ["#0b3d2e", "#1d6b52", "#e9cf99"], ["#1f2b47", "#3e5a8c", "#f3e2b6"], ["#47301f", "#b0662a", "#f6e2b8"], ["#2b1f47", "#5a3e8c", "#e9d6ff"],
  ["#0b2f3d", "#1d5a6b", "#d7f0f2"], ["#3d0b1f", "#8c1d3e", "#f7d7de"], ["#2a3a14", "#5f7d2a", "#eef3c8"], ["#3d2a0b", "#8c6a1d", "#fff1c2"],
];
const SERIES_FRAME: Partial<Record<Series, Frame>> = { surah: "arch", juz: "octagon", names: "star", prophets: "arch", months: "circle", letters: "hex", roots: "hex", tajweed: "rosette", places: "arch", scholars: "octagon" };
const RIM: Record<Rarity, [string, string]> = { common: ["#9aa5a0", "#d8dedb"], rare: ["#8fb7d6", "#e6f3ff"], epic: ["#8a5ad6", "#e8d4ff"], legendary: ["#c6a65e", "#fff1c2"] };

function framePath(f: Frame, c: number, r: number): string {
  const poly = (n: number, rot: number, inner?: number) => Array.from({ length: inner ? n * 2 : n }, (_, i) => { const a = rot + (i * Math.PI * 2) / (inner ? n * 2 : n), rr = inner && i % 2 ? inner : r; return `${i ? "L" : "M"}${(c + Math.cos(a) * rr).toFixed(1)} ${(c + Math.sin(a) * rr).toFixed(1)}`; }).join(" ") + " Z";
  switch (f) {
    case "circle": return `M${c - r} ${c} a${r} ${r} 0 1 0 ${2 * r} 0 a${r} ${r} 0 1 0 ${-2 * r} 0 Z`;
    case "octagon": return poly(8, Math.PI / 8);
    case "hex": return poly(6, 0);
    case "star": return poly(8, -Math.PI / 2, r * 0.8);
    case "rosette": return poly(12, 0, r * 0.88);
    case "arch": return `M${c - r * 0.8} ${c + r} V${c - r * 0.1} Q${c - r * 0.8} ${c - r} ${c} ${c - r} Q${c + r * 0.8} ${c - r} ${c + r * 0.8} ${c - r * 0.1} V${c + r} Z`;
  }
}

export const CatalogArt = memo(function CatalogArt({ id, size = 84, locked = false }: { id: string; size?: number; locked?: boolean }) {
  const it = itemById(id);
  const h = hashId(id);
  const rarity = rarityOf(id);
  const frame: Frame = (it && SERIES_FRAME[it.series]) ?? FRAMES[h % FRAMES.length];
  const [deep, mid, light] = PALETTES[(h >>> 3) % PALETTES.length];
  const pat = (h >>> 7) % 4;
  const c = 50, r = 46;
  const d = framePath(frame, c, r);
  const big = it?.ar ?? (it?.series === "ayah" ? it.label : it?.series === "surah" ? it.sub : null);
  const sub = it?.series === "ayah" ? it.sub : it?.series === "surah" ? it.label : it?.ar ? it.label : it?.label;
  const arabicBig = !!it?.ar && it.series !== "juz";
  if (locked) return (
    <Svg width={size} height={size} viewBox="0 0 100 100" accessible={false}>
      <Path d={d} fill="rgba(127,127,127,0.12)" stroke="rgba(127,127,127,0.35)" strokeWidth={1.5} strokeDasharray="4 3" />
    </Svg>
  );
  return (
    <View style={{ width: size, height: size }} accessible={false}>
      <Svg width={size} height={size} viewBox="0 0 100 100">
        <Defs>
          <SvgLinear id={`bg${h}`} x1="0" y1="0" x2="1" y2="1"><Stop offset="0" stopColor={mid} /><Stop offset="1" stopColor={deep} /></SvgLinear>
          <SvgLinear id={`rim${h}`} x1="0" y1="0" x2="1" y2="1"><Stop offset="0" stopColor={RIM[rarity][1]} /><Stop offset="0.5" stopColor={RIM[rarity][0]} /><Stop offset="1" stopColor={RIM[rarity][1]} /></SvgLinear>
          <ClipPath id={`cl${h}`}><Path d={d} /></ClipPath>
        </Defs>
        <Path d={d} fill={`url(#bg${h})`} />
        <G clipPath={`url(#cl${h})`} opacity={rarity === "common" ? 0.12 : 0.22}>
          {pat === 0 ? Array.from({ length: 12 }, (_, i) => <Path key={i} d={`M${i * 10 - 20} 0 L${i * 10 + 20} 100`} stroke={light} strokeWidth={2} />) : null}
          {pat === 1 ? Array.from({ length: 5 }, (_, i) => <Circle key={i} cx={50} cy={50} r={10 + i * 9} stroke={light} strokeWidth={1.4} fill="none" />) : null}
          {pat === 2 ? Array.from({ length: 25 }, (_, i) => <Circle key={i} cx={10 + (i % 5) * 20} cy={10 + Math.floor(i / 5) * 20} r={2.5} fill={light} />) : null}
          {pat === 3 ? Array.from({ length: 9 }, (_, i) => <Path key={i} d={`M0 ${i * 12} l12 -8 l12 8 l12 -8 l12 8 l12 -8 l12 8 l12 -8 l12 8`} stroke={light} strokeWidth={1.4} fill="none" />) : null}
        </G>
        <Path d={d} fill="none" stroke={`url(#rim${h})`} strokeWidth={rarity === "common" ? 2 : rarity === "rare" ? 3 : 4} />
        {rarity === "legendary" || rarity === "epic" ? <Path d={framePath(frame, c, r - 6)} fill="none" stroke={RIM[rarity][1]} strokeWidth={0.7} opacity={0.7} /> : null}
        {big ? <SvgText x={50} y={arabicBig ? 56 : 54} fontSize={arabicBig ? (big.length > 6 ? 16 : 26) : big.length > 6 ? 15 : 20} fontFamily={arabicBig ? (it?.series === "letters" || it?.series === "roots" ? ARABIC_FONT : CALLIG_FONT) : FONT.bold} fill={light} textAnchor="middle">{big}</SvgText> : null}
        {sub ? <SvgText x={50} y={big ? 74 : 54} fontSize={big ? 8 : sub.length > 14 ? 8.5 : 11} fontFamily={FONT.semibold} fill={light} opacity={big ? 0.85 : 1} textAnchor="middle">{sub.length > 20 ? `${sub.slice(0, 19)}…` : sub}</SvgText> : null}
      </Svg>
      {rarity === "legendary" ? <Foil size={size} /> : null}
    </View>
  );
});

/** the moving foil shine of legendary stickers */
function Foil({ size }: { size: number }) {
  const x = useSharedValue(-1);
  useEffect(() => { x.value = withRepeat(withTiming(1, { duration: 2800, easing: Easing.inOut(Easing.quad) }), -1, false); return () => cancelAnimation(x); }, [x]);
  const st = useAnimatedStyle(() => ({ transform: [{ translateX: x.value * size }, { rotate: "20deg" }] }));
  return (
    <View pointerEvents="none" style={{ position: "absolute", inset: 0, overflow: "hidden", borderRadius: size / 2 }}>
      <Animated.View style={[{ position: "absolute", top: -size * 0.2, width: size * 0.35, height: size * 1.4 }, st]}>
        <LinearGradient start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} colors={["rgba(255,255,255,0)", "rgba(255,248,220,0.45)", "rgba(255,255,255,0)"]} style={{ flex: 1 }} />
      </Animated.View>
    </View>
  );
}
export const rarityColor = (r: Rarity) => RIM[r][0];
