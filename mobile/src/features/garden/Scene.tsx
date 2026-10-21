import { memo, useEffect, useMemo, type ReactNode } from "react";
import { View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Svg, { Circle, Defs, Ellipse, G, LinearGradient as SvgLinear, Path, Pattern, Polygon, Rect, Stop } from "react-native-svg";
import Animated, { Easing, cancelAnimation, interpolate, useAnimatedStyle, useSharedValue, withDelay, withRepeat, withTiming, type SharedValue } from "react-native-reanimated";
import { dayFor } from "@/web/prayer";
import { spotNow } from "@/features/feed/Extras";
import { Star8 } from "./Tree";

// The courtyard around the trees: a sky that follows the prayer times (dawn at Fajr, day, golden light towards
// Maghrib, a starry night with a crescent after Isha), soft light rays, Andalusian arches and domes far behind
// (parallax), a zellige border, a small fountain with ripples and a few falling petals. Particles are limited (6) and
// all layers are memoised; Reduce Motion freezes everything.
export type Phase = "dawn" | "day" | "golden" | "night";
export function phaseNow(now = new Date()): Phase {
  try {
    const t = dayFor(spotNow(), now).times;
    const ms = now.getTime(), at = (p: keyof typeof t) => t[p]?.getTime() ?? 0;
    if (ms < at("fajr") || ms >= at("isha")) return "night";
    if (ms < at("sunrise") + 40 * 60000) return "dawn";
    if (ms >= at("maghrib") - 75 * 60000) return ms < at("maghrib") + 30 * 60000 ? "golden" : "night";
    return "day";
  } catch {
    const h = now.getHours();
    return h < 5 || h >= 21 ? "night" : h < 8 ? "dawn" : h >= 17 ? "golden" : "day";
  }
}
const SKY: Record<Phase, [string, string, string]> = {
  dawn: ["#2b3a67", "#c98a7a", "#f6d6a8"],
  day: ["#5aa6d6", "#a9d6ea", "#e8f1e6"],
  golden: ["#5b3b6e", "#e0844c", "#f7d08a"],
  night: ["#040d1c", "#0b2238", "#123b3a"],
};
export const skyInk = (p: Phase) => (p === "day" ? "rgb(8,38,29)" : "#f3e2b6");

export function Sky({ phase, children }: { phase: Phase; children?: ReactNode }) {
  return <LinearGradient colors={SKY[phase]} style={{ position: "absolute", inset: 0 }}>{children}</LinearGradient>;
}

/** stars and the crescent at night; a soft sun disc otherwise */
export const Celestial = memo(function Celestial({ phase, width, height }: { phase: Phase; width: number; height: number }) {
  const stars = useMemo(() => Array.from({ length: 40 }, (_, i) => ({ x: ((i * 97) % 100) / 100 * width, y: ((i * 53) % 60) / 100 * height, r: i % 7 === 0 ? 1.6 : 0.8 })), [width, height]);
  return (
    <Svg width={width} height={height} style={{ position: "absolute" }}>
      <Defs>
        <SvgLinear id="ray" x1="0" y1="0" x2="0" y2="1"><Stop offset="0" stopColor="#fff4d0" stopOpacity={0.35} /><Stop offset="1" stopColor="#fff4d0" stopOpacity={0} /></SvgLinear>
      </Defs>
      {phase === "night" ? (
        <G>
          {stars.map((s, i) => <Circle key={i} cx={s.x} cy={s.y} r={s.r} fill="#fff" opacity={0.5 + (i % 3) * 0.2} />)}
          <Path d={`M${width * 0.8} ${height * 0.1} a22 22 0 1 0 0 40 a17 17 0 1 1 0 -40 Z`} fill="#f3e2b6" />
          <Star8 x={width * 0.8 + 26} y={height * 0.1 + 6} r={4} fill="#f3e2b6" />
        </G>
      ) : (
        <G>
          <Circle cx={phase === "dawn" ? width * 0.15 : phase === "golden" ? width * 0.85 : width * 0.7} cy={phase === "day" ? height * 0.1 : height * 0.3} r={28} fill="#fff1c2" opacity={phase === "day" ? 0.7 : 0.9} />
          {/* light rays */}
          {[0, 1, 2, 3].map((i) => { const x = phase === "dawn" ? width * 0.15 : phase === "golden" ? width * 0.85 : width * 0.7; return <Polygon key={i} points={`${x},0 ${x - 40 + i * 70},${height} ${x + i * 70},${height}`} fill="url(#ray)" opacity={0.5} />; })}
        </G>
      )}
    </Svg>
  );
});

/** far layer: arcade with horseshoe arches and two domes (moves slower than the garden when panning) */
export const FarLayer = memo(function FarLayer({ width, phase }: { width: number; phase: Phase }) {
  const ink = phase === "night" ? "#0a1f2a" : phase === "golden" ? "#7a4b3e" : phase === "dawn" ? "#6a5068" : "#cdbf9f";
  const n = Math.ceil(width / 46) + 2;
  return (
    <Svg width={width * 1.3} height={150} viewBox={`0 0 ${width * 1.3} 150`}>
      <Path d={`M${width * 0.25} 70 a40 40 0 0 1 80 0 Z M${width * 0.95} 60 a50 50 0 0 1 100 0 Z`} fill={ink} opacity={0.75} />
      <Rect x={width * 0.25 + 36} y={20} width={8} height={30} fill={ink} opacity={0.75} />
      <Rect x={0} y={70} width={width * 1.3} height={80} fill={ink} opacity={0.85} />
      {Array.from({ length: n }, (_, i) => <Path key={i} d={`M${i * 46 + 8} 150 V100 a15 17 0 1 1 30 0 V150 Z`} fill={phase === "night" ? "#123b3a" : "#00000033"} />)}
    </Svg>
  );
});

/** zellige border: a band of eight-pointed stars in emerald, white and gold */
export const Zellige = memo(function Zellige({ width, height = 34 }: { width: number; height?: number }) {
  return (
    <Svg width={width} height={height}>
      <Defs>
        <Pattern id="zl" x="0" y="0" width="34" height="34" patternUnits="userSpaceOnUse">
          <Rect width="34" height="34" fill="#0b3d2e" />
          <Path d="M17 2 L21 13 L32 17 L21 21 L17 32 L13 21 L2 17 L13 13 Z" fill="#f4efe2" />
          <Path d="M17 9 L19.5 14.5 L25 17 L19.5 19.5 L17 25 L14.5 19.5 L9 17 L14.5 14.5 Z" fill="#1d6b52" />
          <Circle cx="17" cy="17" r="2.2" fill="#c6a65e" />
          <Path d="M0 0 L5 0 L0 5 Z M34 0 L29 0 L34 5 Z M0 34 L5 34 L0 29 Z M34 34 L29 34 L34 29 Z" fill="#c6a65e" />
        </Pattern>
      </Defs>
      <Rect width={width} height={height} fill="url(#zl)" />
      <Rect width={width} height={2} fill="#c6a65e" />
    </Svg>
  );
});

/** the courtyard floor with a fountain (animated ripples) */
export function Courtyard({ width, fountain, bench, still }: { width: number; fountain: boolean; bench: boolean; still: boolean }) {
  return (
    <View style={{ width, height: 70 }}>
      <Svg width={width} height={70} style={{ position: "absolute" }}>
        <Defs><SvgLinear id="fl" x1="0" y1="0" x2="0" y2="1"><Stop offset="0" stopColor="#d9c7a0" /><Stop offset="1" stopColor="#b59f74" /></SvgLinear></Defs>
        <Rect width={width} height={70} fill="url(#fl)" />
        {Array.from({ length: Math.ceil(width / 24) }, (_, i) => <Path key={i} d={`M${i * 24} 0 L${i * 24 - 18} 70`} stroke="#a38d62" strokeWidth={0.6} opacity={0.6} />)}
        {bench ? <G><Rect x={width * 0.08} y={22} width={58} height={7} rx={2} fill="#7a5634" /><Rect x={width * 0.08 + 4} y={29} width={4} height={14} fill="#5a3e24" /><Rect x={width * 0.08 + 50} y={29} width={4} height={14} fill="#5a3e24" /><Rect x={width * 0.08} y={12} width={58} height={4} rx={2} fill="#8a6440" /></G> : null}
        {fountain ? <G><Ellipse cx={width * 0.85} cy={40} rx={34} ry={11} fill="#f4efe2" /><Ellipse cx={width * 0.85} cy={39} rx={29} ry={8} fill="#3d8fa6" /><Rect x={width * 0.85 - 3} y={18} width={6} height={20} fill="#f4efe2" /><Ellipse cx={width * 0.85} cy={18} rx={10} ry={3} fill="#f4efe2" /></G> : null}
      </Svg>
      {fountain ? <Ripples x={width * 0.85} y={39} still={still} /> : null}
    </View>
  );
}
function Ripples({ x, y, still }: { x: number; y: number; still: boolean }) {
  return <>{[0, 1].map((i) => <Ripple key={i} x={x} y={y} delay={i * 1200} still={still} />)}</>;
}
function Ripple({ x, y, delay, still }: { x: number; y: number; delay: number; still: boolean }) {
  const v = useSharedValue(0);
  useEffect(() => { if (still) return; v.value = withDelay(delay, withRepeat(withTiming(1, { duration: 2400, easing: Easing.out(Easing.quad) }), -1, false)); return () => cancelAnimation(v); }, [still, delay, v]);
  const st = useAnimatedStyle(() => ({ opacity: 0.7 * (1 - v.value), transform: [{ scaleX: 0.3 + v.value * 0.8 }, { scaleY: 0.3 + v.value * 0.8 }] }));
  return <Animated.View pointerEvents="none" style={[{ position: "absolute", left: x - 28, top: y - 8, width: 56, height: 16, borderRadius: 28, borderWidth: 1, borderColor: "#e6f6fa" }, st]} />;
}

/** a few falling petals or leaves (max 6), drifting with the wind */
export function Petals({ width, height, color, still }: { width: number; height: number; color: string; still: boolean }) {
  if (still) return null;
  return <View pointerEvents="none" style={{ position: "absolute", inset: 0 }}>{[0, 1, 2, 3, 4, 5].map((i) => <Petal key={i} i={i} width={width} height={height} color={color} />)}</View>;
}
function Petal({ i, width, height, color }: { i: number; width: number; height: number; color: string }) {
  const t = useSharedValue(0);
  useEffect(() => { t.value = withDelay(i * 1700, withRepeat(withTiming(1, { duration: 9000 + i * 900, easing: Easing.linear }), -1, false)); return () => cancelAnimation(t); }, [i, t]);
  const x0 = ((i * 37) % 80) / 100 * width + width * 0.1;
  const st = useAnimatedStyle(() => ({
    opacity: interpolate(t.value, [0, 0.1, 0.85, 1], [0, 0.9, 0.9, 0]),
    transform: [{ translateX: x0 + Math.sin(t.value * 6 + i) * 22 + Math.sin(t.value * 17 + i * 2) * 5 + t.value * 40 }, { translateY: height * 0.15 + t.value * height * 0.8 - Math.abs(Math.sin(t.value * 6 + i)) * 10 }, { rotate: `${t.value * 540 + i * 40}deg` }, { scaleX: Math.cos(t.value * (14 + i * 2) + i) }],
  }));
  return <Animated.View style={[{ position: "absolute", width: 7, height: 4, borderRadius: 4, backgroundColor: color }, st]} />;
}

/** parallax helper: a layer that moves with the pan by a factor */
export function Parallax({ x, factor, children, style }: { x: SharedValue<number>; factor: number; children: ReactNode; style?: object }) {
  const st = useAnimatedStyle(() => ({ transform: [{ translateX: x.value * factor }] }));
  return <Animated.View style={[style, st]}>{children}</Animated.View>;
}
