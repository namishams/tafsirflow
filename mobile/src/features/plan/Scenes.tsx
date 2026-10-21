// DESIGN FROZEN (owner approved, tag garten-design-v1) — do not change visuals; only bug fixes.
import { memo, useEffect, useState } from "react";
import { View } from "react-native";
import Svg, { Circle, Defs, G, Line, Path, RadialGradient, Stop, Text as SvgText } from "react-native-svg";
import Animated, { Easing, cancelAnimation, interpolate, useAnimatedStyle, useSharedValue, withDelay, withRepeat, withSequence, withSpring, withTiming, type SharedValue } from "react-native-reanimated";
import { Icon, type IconName } from "@/components/icons";
import { ARABIC_FONT, FONT, stage } from "@/lib/theme";
import { TreeArt } from "@/features/garden/Tree";

// Illustrated, gently animated scenes for the Shams Method screens and the personal path: an arcade of five arches
// that light up one after another (the five steps), a girih rosette with rings of sound, meaning and voice, trees
// growing on terraces at sunrise, an astrolabe that turns to the learner's goals, and the winding path of the 30 days
// as a map. Static under Reduce Motion.

const GOLD = "#d6b46c", CREAM = "#f3e2b6";

function useLoop(still: boolean, ms: number, delay = 0): SharedValue<number> {
  const v = useSharedValue(0);
  useEffect(() => {
    if (still) { v.value = 0.5; return; }
    v.value = withDelay(delay, withRepeat(withTiming(1, { duration: ms, easing: Easing.linear }), -1, false));
    return () => cancelAnimation(v);
  }, [still, ms, delay, v]);
  return v;
}
const glowDef = (id: string, c = "#ffe2a0", o = 0.7) => <RadialGradient id={id} cx="0.5" cy="0.5" r="0.5"><Stop offset="0" stopColor={c} stopOpacity={o} /><Stop offset="1" stopColor={c} stopOpacity={0} /></RadialGradient>;

/** an Andalusian horseshoe arch, as a frame */
const archPath = (w: number, h: number, inset = 0) => { const x0 = inset, x1 = w - inset, r = (x1 - x0) / 2; return `M${x0} ${h} V${h * 0.42} A${r * 1.04} ${r * 1.1} 0 1 1 ${x1} ${h * 0.42} V${h} Z`; };

/** 1 — the five steps as an arcade: a light walks from arch to arch */
export const ArcadeOfSteps = memo(function ArcadeOfSteps({ icons, still, width }: { icons: IconName[]; still: boolean; width: number }) {
  const t = useLoop(still, 5200);
  const n = icons.length, gap = 8, w = Math.min(64, (width - gap * (n - 1)) / n), h = w * 1.45;
  return (
    <View accessible={false} style={{ flexDirection: "row", justifyContent: "center", alignItems: "flex-end", gap, height: h + 22 }}>
      {icons.map((ic, i) => <Arch key={i} i={i} n={n} t={t} w={w} h={h} icon={ic} still={still} />)}
    </View>
  );
});
function Arch({ i, n, t, w, h, icon, still }: { i: number; n: number; t: SharedValue<number>; w: number; h: number; icon: IconName; still: boolean }) {
  const lit = useAnimatedStyle(() => {
    if (still) return { opacity: 0.55 };
    const d = Math.abs(t.value * (n + 1) - (i + 0.8));
    return { opacity: Math.max(0.12, 1 - d * 0.9) };
  });
  const rise = useSharedValue(still ? 1 : 0);
  useEffect(() => { if (!still) rise.value = withDelay(120 + i * 110, withSpring(1, { damping: 13 })); }, [still, i, rise]);
  const enter = useAnimatedStyle(() => ({ opacity: rise.value, transform: [{ translateY: (1 - rise.value) * 18 }] }));
  return (
    <Animated.View style={[{ width: w, height: h + 22, alignItems: "center" }, enter]}>
      <Svg width={w} height={h} style={{ position: "absolute", top: 0 }}>
        <Path d={archPath(w, h)} fill="rgba(6,30,23,0.85)" stroke={GOLD} strokeWidth={1.4} />
        <Path d={archPath(w, h, 5)} fill="none" stroke={GOLD} strokeWidth={0.6} opacity={0.6} />
        <Path d={`M${w / 2 - 4} ${h - 8} l4 -4 l4 4 l-4 4 Z`} fill={GOLD} opacity={0.8} />
      </Svg>
      <Animated.View style={[{ position: "absolute", top: h * 0.4 - w * 0.8, width: w * 1.6, height: w * 1.6 }, lit]}>
        <Svg width={w * 1.6} height={w * 1.6}><Defs>{glowDef(`ag${i}`)}</Defs><Circle cx={w * 0.8} cy={w * 0.8} r={w * 0.8} fill={`url(#ag${i})`} /></Svg>
      </Animated.View>
      <View style={{ position: "absolute", top: h * 0.4 - 11 }}><Icon name={icon} color={CREAM} size={22} /></View>
      <Svg width={w} height={18} style={{ position: "absolute", bottom: 0 }}><SvgText x={w / 2} y={13} fontSize={11} fill={GOLD} textAnchor="middle" fontWeight="700">{String(i + 1)}</SvgText></Svg>
    </Animated.View>
  );
}

/** 2 — why it works: a girih rosette turning slowly, rings of sound, meaning and voice pulsing out from it */
export const Rosette = memo(function Rosette({ still, size = 200 }: { still: boolean; size?: number }) {
  const turn = useLoop(still, 60000);
  const rot = useAnimatedStyle(() => ({ transform: [{ rotate: `${turn.value * 360}deg` }] }));
  const c = size / 2;
  const sq = (r: number, rot: number) => [0, 1, 2, 3].map((i) => { const a = rot + (i * Math.PI) / 2 + Math.PI / 4; return `${i ? "L" : "M"}${(c + Math.cos(a) * r).toFixed(1)} ${(c + Math.sin(a) * r).toFixed(1)}`; }).join(" ") + " Z";
  return (
    <View accessible={false} style={{ width: size, height: size, alignSelf: "center", alignItems: "center", justifyContent: "center" }}>
      {[0, 1, 2].map((i) => <Ring key={i} i={i} size={size} still={still} />)}
      <Svg width={size} height={size} style={{ position: "absolute" }}><Defs>{glowDef("rc", "#ffe2a0", 0.45)}</Defs><Circle cx={c} cy={c} r={c * 0.7} fill="url(#rc)" /></Svg>
      <Animated.View style={[{ position: "absolute", width: size, height: size }, rot]}>
        <Svg width={size} height={size}>
          {/* the Rub el Hizb: two interlaced squares, then a girih ring of eight kites */}
          <Path d={sq(c * 0.62, 0) + " " + sq(c * 0.62, Math.PI / 4)} fill="rgba(6,30,23,0.9)" stroke={GOLD} strokeWidth={1.6} strokeLinejoin="round" />
          <Path d={sq(c * 0.5, 0) + " " + sq(c * 0.5, Math.PI / 4)} fill="none" stroke={GOLD} strokeWidth={0.7} opacity={0.65} strokeLinejoin="round" />
          {Array.from({ length: 8 }, (_, i) => { const a = (i * Math.PI) / 4 + Math.PI / 8, r0 = c * 0.66, r1 = c * 0.82; return <Path key={`k${i}`} d={`M${c + Math.cos(a) * r0} ${c + Math.sin(a) * r0} L${c + Math.cos(a + 0.12) * (r0 + r1) / 2} ${c + Math.sin(a + 0.12) * (r0 + r1) / 2} L${c + Math.cos(a) * r1} ${c + Math.sin(a) * r1} L${c + Math.cos(a - 0.12) * (r0 + r1) / 2} ${c + Math.sin(a - 0.12) * (r0 + r1) / 2} Z`} fill={GOLD} opacity={0.75} />; })}
          {Array.from({ length: 8 }, (_, i) => { const a = (i * Math.PI) / 4; return <Line key={i} x1={c + Math.cos(a) * c * 0.18} y1={c + Math.sin(a) * c * 0.18} x2={c + Math.cos(a) * c * 0.6} y2={c + Math.sin(a) * c * 0.6} stroke={GOLD} strokeWidth={0.6} opacity={0.6} />; })}
          <Circle cx={c} cy={c} r={c * 0.2} fill="none" stroke={CREAM} strokeWidth={1} />
        </Svg>
      </Animated.View>
      <Icon name="sun" color={CREAM} size={30} />
    </View>
  );
});
function Ring({ i, size, still }: { i: number; size: number; still: boolean }) {
  const v = useLoop(still, 3600, i * 1200);
  const st = useAnimatedStyle(() => ({ opacity: still ? 0.3 - i * 0.08 : interpolate(v.value, [0, 0.2, 1], [0, 0.7, 0]), transform: [{ scale: still ? 0.7 + i * 0.15 : 0.5 + v.value * 0.5 }] }));
  return <Animated.View style={[{ position: "absolute", width: size, height: size, borderRadius: size / 2, borderWidth: 1.2, borderColor: i === 1 ? CREAM : GOLD }, st]} />;
}

/** 3 — your tree grows with you: three terraces at sunrise, the trees growing one after another */
export const GrowingTerraces = memo(function GrowingTerraces({ still, width }: { still: boolean; width: number }) {
  const stages = [1, 4, 7];
  const sun = useSharedValue(still ? 1 : 0);
  useEffect(() => { if (!still) sun.value = withTiming(1, { duration: 2400, easing: Easing.out(Easing.cubic) }); }, [still, sun]);
  const sunSt = useAnimatedStyle(() => ({ opacity: 0.4 + sun.value * 0.6, transform: [{ translateY: (1 - sun.value) * 60 }] }));
  const H = 210, sizes = [92, 118, 150];
  return (
    <View accessible={false} style={{ width, height: H, alignSelf: "center" }}>
      <Animated.View style={[{ position: "absolute", left: width / 2 - 120, top: -10, width: 240, height: 240 }, sunSt]}>
        <Svg width={240} height={240}><Defs>{glowDef("ts", "#ffd98a", 0.75)}</Defs><Circle cx={120} cy={120} r={120} fill="url(#ts)" /><Circle cx={120} cy={120} r={22} fill="#fff1c8" opacity={0.9} /></Svg>
      </Animated.View>
      <Svg width={width} height={H} style={{ position: "absolute" }}>
        {[0, 1, 2].map((i) => { const x = width * (0.18 + i * 0.32), y = H - 18 - i * 10; return <G key={i}><Path d={`M${x - 52} ${y} h104 l-6 10 h-92 Z`} fill="#0f4a39" stroke={GOLD} strokeWidth={1} /><Path d={`M${x - 52} ${y} h104`} stroke={CREAM} strokeWidth={0.8} opacity={0.6} /></G>; })}
      </Svg>
      {stages.map((st, i) => <GrowTree key={st} i={i} stage={st} size={sizes[i]} x={width * (0.18 + i * 0.32)} bottom={18 + i * 10} still={still} />)}
    </View>
  );
});
function GrowTree({ i, stage: st, size, x, bottom, still }: { i: number; stage: number; size: number; x: number; bottom: number; still: boolean }) {
  const g = useSharedValue(still ? 1 : 0);
  useEffect(() => { if (!still) g.value = withDelay(300 + i * 450, withSpring(1, { damping: 11, stiffness: 90 })); }, [still, i, g]);
  const h = size * 1.2;
  const st2 = useAnimatedStyle(() => ({ opacity: Math.min(1, g.value * 2), transform: [{ translateY: h * 0.43 }, { scale: 0.2 + g.value * 0.8 }, { translateY: -h * 0.43 }] }));
  return <Animated.View style={[{ position: "absolute", left: x - size / 2, bottom: bottom - size * 0.12 }, st2]}><TreeArt id="onboarding" type="olive" stage={st} size={size} still={still} /></Animated.View>;
}

/** 4 — made for your goals: an astrolabe whose rings turn and settle on the learner's direction */
export const Astrolabe = memo(function Astrolabe({ still, size = 190, marks }: { still: boolean; size?: number; marks: number }) {
  const a = useSharedValue(still ? 1 : 0), idle = useLoop(still, 14000);
  useEffect(() => { if (!still) a.value = withSequence(withTiming(1.12, { duration: 1500, easing: Easing.out(Easing.cubic) }), withSpring(1, { damping: 8 })); }, [still, a]);
  const outer = useAnimatedStyle(() => ({ transform: [{ rotate: `${(1 - a.value) * -220 + Math.sin(idle.value * Math.PI * 2) * 3}deg` }] }));
  const inner = useAnimatedStyle(() => ({ transform: [{ rotate: `${(1 - a.value) * 300 - Math.sin(idle.value * Math.PI * 2) * 4}deg` }] }));
  const c = size / 2, n = Math.max(1, Math.min(5, marks));
  return (
    <View accessible={false} style={{ width: size, height: size, alignSelf: "center" }}>
      <Svg width={size} height={size} style={{ position: "absolute" }}><Defs>{glowDef("ab", "#ffe2a0", 0.35)}</Defs><Circle cx={c} cy={c} r={c} fill="url(#ab)" /></Svg>
      <Animated.View style={[{ position: "absolute", width: size, height: size }, outer]}>
        <Svg width={size} height={size}>
          <Circle cx={c} cy={c} r={c * 0.9} fill="rgba(6,30,23,0.85)" stroke={GOLD} strokeWidth={1.6} />
          <Circle cx={c} cy={c} r={c * 0.8} fill="none" stroke={GOLD} strokeWidth={0.6} opacity={0.7} />
          {Array.from({ length: 48 }, (_, i) => { const t = (i * Math.PI * 2) / 48, l = i % 4 ? 0.05 : 0.1; return <Line key={i} x1={c + Math.cos(t) * c * 0.9} y1={c + Math.sin(t) * c * 0.9} x2={c + Math.cos(t) * c * (0.9 - l)} y2={c + Math.sin(t) * c * (0.9 - l)} stroke={GOLD} strokeWidth={i % 4 ? 0.6 : 1.2} />; })}
          {Array.from({ length: n }, (_, i) => { const t = -Math.PI / 2 + (i - (n - 1) / 2) * 0.42; return <Circle key={i} cx={c + Math.cos(t) * c * 0.7} cy={c + Math.sin(t) * c * 0.7} r={4} fill={CREAM} />; })}
        </Svg>
      </Animated.View>
      <Animated.View style={[{ position: "absolute", width: size, height: size }, inner]}>
        <Svg width={size} height={size}>
          <Circle cx={c} cy={c} r={c * 0.55} fill="none" stroke={GOLD} strokeWidth={1} strokeDasharray="2 4" />
          <Path d={`M${c} ${c - c * 0.62} L${c + 7} ${c} L${c} ${c + c * 0.3} L${c - 7} ${c} Z`} fill={GOLD} />
          <Path d={`M${c} ${c - c * 0.62} L${c + 7} ${c} L${c} ${c} Z`} fill={CREAM} opacity={0.7} />
          <Circle cx={c} cy={c} r={6} fill="#0b3d2e" stroke={CREAM} strokeWidth={1.4} />
        </Svg>
      </Animated.View>
    </View>
  );
});

/** a slowly turning eight-pointed star of gold (the "building your plan" moment) */
export function GoldStarSpinner({ still, size = 72 }: { still: boolean; size?: number }) {
  const t = useLoop(still, 6000);
  const st = useAnimatedStyle(() => ({ transform: [{ rotate: `${t.value * 360}deg` }] }));
  const p = useLoop(still, 1800);
  const glow = useAnimatedStyle(() => ({ opacity: 0.5 + Math.sin(p.value * Math.PI * 2) * 0.3 }));
  const c = size / 2;
  const star = (r: number, k: number, r0 = 0) => Array.from({ length: 16 }, (_, i) => { const a = r0 + (i * Math.PI) / 8 - Math.PI / 2, rr = i % 2 ? r * k : r; return `${i ? "L" : "M"}${(c + Math.cos(a) * rr).toFixed(1)} ${(c + Math.sin(a) * rr).toFixed(1)}`; }).join(" ") + " Z";
  return (
    <View style={{ width: size * 2, height: size * 2, alignItems: "center", justifyContent: "center" }}>
      <Animated.View style={[{ position: "absolute", width: size * 2, height: size * 2 }, glow]}><Svg width={size * 2} height={size * 2}><Defs>{glowDef("sp", "#ffe2a0", 0.6)}</Defs><Circle cx={size} cy={size} r={size} fill="url(#sp)" /></Svg></Animated.View>
      <Animated.View style={st}>
        <Svg width={size} height={size}>
          <Path d={star(c * 0.95, 0.62)} fill="none" stroke={GOLD} strokeWidth={2} />
          <Path d={star(c * 0.66, 0.6, Math.PI / 8)} fill={GOLD} opacity={0.35} />
          <Circle cx={c} cy={c} r={c * 0.16} fill={CREAM} />
        </Svg>
      </Animated.View>
    </View>
  );
}

/** the winding gold path of the 30 days behind the week cards, with a medallion at each week */
export function MapPath({ ys, height, still }: { ys: number[]; height: number; still: boolean }) {
  const draw = useSharedValue(still ? 1 : 0);
  useEffect(() => { if (!still) draw.value = withDelay(300, withTiming(1, { duration: 1800, easing: Easing.inOut(Easing.cubic) })); }, [still, draw]);
  const [len] = useState(2400);
  const mask = useAnimatedStyle(() => ({ height: height * draw.value }));
  if (!ys.length) return null;
  const X = 22;
  let d = `M${X} 0`;
  ys.forEach((y, i) => { const prev = i ? ys[i - 1] : 0, mid = (prev + y) / 2; d += ` C${X + (i % 2 ? -14 : 14)} ${mid} ${X + (i % 2 ? 14 : -14)} ${mid} ${X} ${y}`; });
  d += ` L${X} ${height}`;
  return (
    <View pointerEvents="none" style={{ position: "absolute", left: 0, top: 0, width: 44, height }}>
      <Animated.View style={[{ overflow: "hidden", width: 44 }, mask]}>
        <Svg width={44} height={height}>
          <Path d={d} stroke="rgba(214,180,108,0.25)" strokeWidth={6} fill="none" strokeLinecap="round" />
          <Path d={d} stroke={GOLD} strokeWidth={1.6} fill="none" strokeDasharray="1 7" strokeLinecap="round" strokeDashoffset={len % 8} />
        </Svg>
      </Animated.View>
      {ys.map((y, i) => (
        <View key={i} style={{ position: "absolute", left: X - 15, top: y - 15, width: 30, height: 30 }}>
          <Svg width={30} height={30}>
            <Path d={Array.from({ length: 16 }, (_, k) => { const a = (k * Math.PI) / 8 - Math.PI / 2, r = k % 2 ? 10 : 14.5; return `${k ? "L" : "M"}${(15 + Math.cos(a) * r).toFixed(1)} ${(15 + Math.sin(a) * r).toFixed(1)}`; }).join(" ") + " Z"} fill="#0b3d2e" stroke={GOLD} strokeWidth={1.3} />
            <SvgText x={15} y={19} fontSize={11} fontWeight="700" fill={CREAM} textAnchor="middle">{String(i + 1)}</SvgText>
          </Svg>
        </View>
      ))}
    </View>
  );
}

/** the story's opening picture: an open mushaf on a carved wooden stand (rahle), light rising from its pages */
export const QuranStand = memo(function QuranStand({ still, size = 200 }: { still: boolean; size?: number }) {
  const v = useLoop(still, 4200);
  const glow = useAnimatedStyle(() => ({ opacity: 0.55 + Math.sin(v.value * Math.PI * 2) * 0.25, transform: [{ scale: 0.95 + Math.sin(v.value * Math.PI * 2) * 0.04 }] }));
  const w = size, h = size * 0.9, c = w / 2;
  return (
    <View accessible={false} style={{ width: w, height: h, alignSelf: "center" }}>
      <Animated.View style={[{ position: "absolute", left: c - w * 0.6, top: -h * 0.2, width: w * 1.2, height: w * 1.2 }, glow]}>
        <Svg width={w * 1.2} height={w * 1.2}><Defs>{glowDef("qs", "#ffe2a0", 0.6)}</Defs><Circle cx={w * 0.6} cy={w * 0.6} r={w * 0.6} fill="url(#qs)" /></Svg>
      </Animated.View>
      <Svg width={w} height={h} style={{ position: "absolute" }}>
        {/* the rahle: two crossed boards */}
        <Path d={`M${c - w * 0.32} ${h * 0.98} L${c + w * 0.18} ${h * 0.5} L${c + w * 0.26} ${h * 0.56} L${c - w * 0.22} ${h * 0.98} Z`} fill="#6b4a26" stroke={GOLD} strokeWidth={1} />
        <Path d={`M${c + w * 0.32} ${h * 0.98} L${c - w * 0.18} ${h * 0.5} L${c - w * 0.26} ${h * 0.56} L${c + w * 0.22} ${h * 0.98} Z`} fill="#7a5530" stroke={GOLD} strokeWidth={1} />
        {/* the open book */}
        <Path d={`M${c} ${h * 0.58} Q${c - w * 0.18} ${h * 0.46} ${c - w * 0.38} ${h * 0.52} L${c - w * 0.36} ${h * 0.24} Q${c - w * 0.18} ${h * 0.18} ${c} ${h * 0.3} Z`} fill="#f6ead0" stroke={GOLD} strokeWidth={1.2} />
        <Path d={`M${c} ${h * 0.58} Q${c + w * 0.18} ${h * 0.46} ${c + w * 0.38} ${h * 0.52} L${c + w * 0.36} ${h * 0.24} Q${c + w * 0.18} ${h * 0.18} ${c} ${h * 0.3} Z`} fill="#fbf2dc" stroke={GOLD} strokeWidth={1.2} />
        {[0, 1, 2, 3, 4].map((i) => <G key={i}>
          <Path d={`M${c - w * 0.31} ${h * (0.3 + i * 0.045)} Q${c - w * 0.17} ${h * (0.26 + i * 0.045)} ${c - w * 0.05} ${h * (0.34 + i * 0.045)}`} stroke="#8a6a2c" strokeWidth={1.1} fill="none" opacity={0.55} />
          <Path d={`M${c + w * 0.05} ${h * (0.34 + i * 0.045)} Q${c + w * 0.17} ${h * (0.26 + i * 0.045)} ${c + w * 0.31} ${h * (0.3 + i * 0.045)}`} stroke="#8a6a2c" strokeWidth={1.1} fill="none" opacity={0.55} />
        </G>)}
        <Path d={`M${c} ${h * 0.3} V${h * 0.58}`} stroke={GOLD} strokeWidth={1.4} />
        <Path d={`M${c - w * 0.34} ${h * 0.22} q${w * 0.02} -${h * 0.03} ${w * 0.05} 0 M${c + w * 0.29} ${h * 0.22} q${w * 0.02} -${h * 0.03} ${w * 0.05} 0`} stroke={GOLD} strokeWidth={1.2} fill="none" />
      </Svg>
    </View>
  );
});

/** a quiet quotation with its reference (hadith or verse) */
export function RefQuote({ text, source, arabic }: { text: string; source: string; arabic?: string }) {
  return (
    <View style={{ borderLeftWidth: 2, borderLeftColor: GOLD, paddingLeft: 12, paddingVertical: 4, gap: 4 }}>
      {arabic ? <SvgFreeArabic text={arabic} /> : null}
      <Animated.Text style={{ fontFamily: FONT.italic, fontSize: 15.5, lineHeight: 23, color: CREAM }}>{text}</Animated.Text>
      <Animated.Text style={{ fontFamily: FONT.semibold, fontSize: 12, letterSpacing: 0.4, color: "rgba(214,180,108,0.9)" }}>{source}</Animated.Text>
    </View>
  );
}
function SvgFreeArabic({ text }: { text: string }) {
  return <Animated.Text style={{ fontFamily: ARABIC_FONT, fontSize: 26, lineHeight: 50, color: CREAM, writingDirection: "rtl", textAlign: "right" }}>{text}</Animated.Text>;
}
