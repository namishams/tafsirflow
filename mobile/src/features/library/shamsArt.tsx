import { useEffect, useRef, useState, type ReactNode } from "react";
import { Animated, Easing, Pressable, Text, View, type StyleProp, type ViewStyle } from "react-native";
import Svg, { Circle, Defs, G, Line, LinearGradient as SvgLinear, Path, RadialGradient, Rect, Stop, Text as SvgText } from "react-native-svg";
import { ARABIC_FONT, CALLIG_FONT, FONT, stage } from "@/lib/theme";
import { useWebT } from "@/i18n/web";
import type { ShamsContent } from "@/web/shamsContent";
import { IslCard, starPath, useSvgId } from "./art";
import { STAGE_GOLD, stageGold, useIsl } from "./palette";
import { useReducedMotion } from "./motion";
import { GOALS, PER_DAY } from "./content/shams";

// The pictures of the Shams Method page (src/components/art/IslamShams.tsx, IslamShamsDemo.tsx, ShamsPlanner.tsx and the
// Curve / Ladder / PrincipleIcon / DayIcon drawings of src/app/[locale]/(app)/shams/page.tsx), drawn with react-native-svg.

function useTurn(duration: number, reverse = false) {
  const reduce = useReducedMotion();
  const v = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (reduce) return;
    const a = Animated.loop(Animated.timing(v, { toValue: 1, duration, easing: Easing.linear, useNativeDriver: true }));
    a.start();
    return () => a.stop();
  }, [reduce, v, duration]);
  return v.interpolate({ inputRange: [0, 1], outputRange: ["0deg", reverse ? "-360deg" : "360deg"] });
}

/** the sun of the Shams Method: girih rays around a sixteen-point rosette, the word شمس in the middle (IslamSun) */
export function Sun({ size, word = "شمس", style }: { size: number; word?: string; style?: StyleProp<ViewStyle> }) {
  const id = useSvgId("sun");
  const reduce = useReducedMotion();
  const outer = useTurn(160000);
  const inner = useTurn(240000, true);
  const pulse = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (reduce) return;
    const a = Animated.loop(Animated.sequence([
      Animated.timing(pulse, { toValue: 1, duration: 3500, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      Animated.timing(pulse, { toValue: 0, duration: 3500, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
    ]));
    a.start();
    return () => a.stop();
  }, [reduce, pulse]);
  const rays = Array.from({ length: 48 }, (_, i) => {
    const a = (Math.PI * 2 * i) / 48, r1 = 124, r2 = i % 2 ? 160 : 181;
    return `M${(200 + r1 * Math.cos(a)).toFixed(1)} ${(200 + r1 * Math.sin(a)).toFixed(1)}L${(200 + r2 * Math.cos(a)).toFixed(1)} ${(200 + r2 * Math.sin(a)).toFixed(1)}`;
  }).join("");
  const metal = (
    <Defs>
      <SvgLinear id={`${id}m`} x1="0" y1="0" x2="1" y2="1">
        <Stop offset="0" stopColor="#f6e7bf" /><Stop offset="0.45" stopColor="#d6b46c" /><Stop offset="0.72" stopColor="#f3e2b6" /><Stop offset="1" stopColor="#b8924a" />
      </SvgLinear>
    </Defs>
  );
  const box = { position: "absolute" as const, width: size, height: size };
  return (
    <View pointerEvents="none" style={[{ width: size, height: size }, style]} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      <Animated.View style={[box, reduce ? null : { opacity: pulse.interpolate({ inputRange: [0, 1], outputRange: [0.55, 1] }), transform: [{ scale: pulse.interpolate({ inputRange: [0, 1], outputRange: [0.97, 1.03] }) }] }]}>
        <Svg width={size} height={size} viewBox="0 0 400 400">
          <Defs>
            <RadialGradient id={`${id}g`} cx="50%" cy="50%" r="50%">
              <Stop offset="0" stopColor="rgb(255,228,160)" stopOpacity={0.55} /><Stop offset="0.45" stopColor="rgb(233,190,110)" stopOpacity={0.16} /><Stop offset="1" stopColor="rgb(233,190,110)" stopOpacity={0} />
            </RadialGradient>
          </Defs>
          <Circle cx={200} cy={200} r={200} fill={`url(#${id}g)`} />
        </Svg>
      </Animated.View>
      <Animated.View style={[box, { transform: [{ rotate: outer }] }]}>
        <Svg width={size} height={size} viewBox="0 0 400 400">
          {metal}
          <Path d={starPath(200, 200, 194, 168, 24)} fill="rgb(233,207,153)" fillOpacity={0.05} stroke={`url(#${id}m)`} strokeOpacity={0.55} strokeWidth={1} />
          <Path d={rays} stroke={`url(#${id}m)`} strokeOpacity={0.7} strokeWidth={1.2} strokeLinecap="round" />
          <Circle cx={200} cy={200} r={146} fill="none" stroke={`url(#${id}m)`} strokeOpacity={0.55} />
        </Svg>
      </Animated.View>
      <Animated.View style={[box, { transform: [{ rotate: inner }] }]}>
        <Svg width={size} height={size} viewBox="0 0 400 400">
          {metal}
          <Circle cx={200} cy={200} r={136} fill="none" stroke="rgb(233,207,153)" strokeOpacity={0.35} strokeDasharray="1.5 5" />
          <Path d={starPath(200, 200, 122, 98, 16)} fill="rgb(233,207,153)" fillOpacity={0.07} stroke={`url(#${id}m)`} strokeWidth={1.1} />
          <Rect x={128} y={128} width={144} height={144} fill="none" stroke="rgb(233,207,153)" strokeOpacity={0.4} />
          <Rect x={128} y={128} width={144} height={144} transform="rotate(45 200 200)" fill="none" stroke="rgb(233,207,153)" strokeOpacity={0.4} />
        </Svg>
      </Animated.View>
      <Svg width={size} height={size} viewBox="0 0 400 400" style={{ position: "absolute" }}>
        {metal}
        <Circle cx={200} cy={200} r={84} fill="rgb(5,28,21)" fillOpacity={0.72} stroke={`url(#${id}m)`} strokeWidth={1.4} />
        <Circle cx={200} cy={200} r={76} fill="none" stroke="rgb(233,207,153)" strokeOpacity={0.35} strokeDasharray="2 4" />
      </Svg>
      {word ? (
        <View style={[box, { alignItems: "center", justifyContent: "center" }]}>
          <Text allowFontScaling={false} style={{ fontFamily: CALLIG_FONT, fontSize: size * 0.175, lineHeight: size * 0.3, color: "#ecd7a2", writingDirection: "rtl", textAlign: "center", marginTop: size * 0.01 }}>{word}</Text>
        </View>
      ) : null}
    </View>
  );
}

/** small line pictures for the seven steps (IslamStepIcon), drawn still */
export function StepIcon({ n, size = 38, color }: { n: number; size?: number; color: string }) {
  const common = { fill: "none", stroke: color, strokeWidth: 1.6, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  const block = (x: number, opacity = 1) => <Rect key={x} x={x} y={20} width={10} height={8} rx={2} fill={color} fillOpacity={0.25 * opacity} stroke={color} strokeOpacity={opacity} strokeWidth={1.2} />;
  let body: ReactNode = null;
  if (n === 1) body = (
    <G {...common}>
      <Path d="M8 20h5l6-5v18l-6-5H8z" fill={color} fillOpacity={0.18} />
      <Path d="M24 19a7 7 0 0 1 0 10" /><Path d="M28 15a13 13 0 0 1 0 18" /><Path d="M32 11a19 19 0 0 1 0 26" />
    </G>
  );
  else if (n === 2) body = <G>{block(5)}{block(19)}{block(33)}<Path d="M7 35h33m-4-3 4 3-4 3" {...common} strokeWidth={1.3} strokeOpacity={0.7} /></G>;
  else if (n === 3) body = <G>{block(5)}{block(19)}{block(33)}<Rect x={33} y={32} width={10} height={2.4} rx={1.2} fill={color} /></G>;
  else if (n === 4) body = (
    <G {...common}>
      <Path d="M24 6v4M18 10h12" /><Path d="M16 14h16l-2.5 17c-.8 4-10.2 4-11 0z" fill={color} fillOpacity={0.12} />
      <Path d="M24 18c2.6 3.4 2.8 6.6 0 9-2.8-2.4-2.6-5.6 0-9z" fill={color} fillOpacity={0.55} />
      <Path d="M20 40h8" />
    </G>
  );
  else if (n === 5) body = (
    <G {...common}>
      <Path d="M24 15c-5-3-11-3-16-1v21c5-2 11-2 16 1 5-3 11-3 16-1V14c-5-2-11-2-16 1z" fill={color} fillOpacity={0.1} />
      <Path d="M24 15v21" /><Path d="M28 20h8" /><Path d="M28 24h8" /><Path d="M28 28h6" />
      <Path d="M12 20h7M12 24h7M12 28h5" strokeOpacity={0.45} />
    </G>
  );
  else if (n === 6) body = (
    <G>
      {[5, 19, 33].map((x) => <Rect key={`o${x}`} x={x} y={20} width={10} height={8} rx={2} fill="none" stroke={color} strokeOpacity={0.35} strokeWidth={1} strokeDasharray="2 2" />)}
      {block(5, 1)}<Rect x={19} y={20} width={6} height={8} rx={2} fill={color} fillOpacity={0.2} stroke={color} strokeWidth={1.2} /><Rect x={33} y={20} width={3} height={8} rx={1.5} fill={color} fillOpacity={0.12} stroke={color} strokeOpacity={0.4} strokeWidth={1.2} />
    </G>
  );
  else body = (
    <G {...common}>
      <Path d="M24 37c-8-5-12-9-12-14a6 6 0 0 1 12-2 6 6 0 0 1 12 2c0 5-4 9-12 14z" fill={color} fillOpacity={0.12} />
      <Path d="M36 8l1.2 2.8L40 12l-2.8 1.2L36 16l-1.2-2.8L32 12l2.8-1.2z" fill={color} stroke="none" />
    </G>
  );
  return <Svg width={size} height={size} viewBox="0 0 48 48">{body}</Svg>;
}

/** line pictures for the learning principles (PrincipleIcon) */
export function PrincipleIcon({ n, color }: { n: number; color: string }) {
  const map: Record<number, number> = { 1: 1, 2: 2, 3: 3, 5: 6, 7: 7, 8: 6, 10: 4 };
  if (map[n]) return <StepIcon n={map[n]} size={36} color={color} />;
  const c = { fill: "none", stroke: color, strokeWidth: 1.6, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  return (
    <Svg width={36} height={36} viewBox="0 0 48 48">
      {n === 4 ? <G {...c}><Circle cx={19} cy={24} r={10} fill={color} fillOpacity={0.12} /><Circle cx={29} cy={24} r={10} fill={color} fillOpacity={0.12} /></G> : null}
      {n === 6 ? <G {...c}><Path d="M8 38h32" />{[1, 3, 7, 14, 30].map((d, i) => <Rect key={d} x={9 + i * 6.4} y={36 - (6 + i * 5)} width={4.2} height={6 + i * 5} rx={1} fill={color} fillOpacity={0.15 + i * 0.12} />)}</G> : null}
      {n === 9 ? <G {...c}><Path d="M8 38h32M8 38V10" strokeOpacity={0.5} /><Path d="M10 14c4 14 7 18 10 18 3 0 5-10 8-10s5 6 10 6" /><Circle cx={20} cy={32} r={1.8} fill={color} /><Circle cx={28} cy={22} r={1.8} fill={color} /><Circle cx={38} cy={28} r={1.8} fill={color} /></G> : null}
    </Svg>
  );
}

/** the four parts of a learning day, as the sun moves (DayIcon) */
export function DayIcon({ n, color }: { n: number; color: string }) {
  const c = { fill: "none", stroke: color, strokeWidth: 1.6, strokeLinecap: "round" as const };
  return (
    <Svg width={40} height={40} viewBox="0 0 48 48">
      <Path d="M6 34h36" {...c} strokeOpacity={0.5} />
      {n === 1 ? <G {...c}><Path d="M15 34a9 9 0 0 1 18 0" fill={color} fillOpacity={0.15} /><Path d="M24 18v4M14 24l2.5 2.5M34 24l-2.5 2.5" /></G> : null}
      {n === 2 ? <G {...c}><Circle cx={24} cy={18} r={6} fill={color} fillOpacity={0.2} />{Array.from({ length: 8 }, (_, i) => { const a = (Math.PI / 4) * i; return <Path key={i} d={`M${24 + 9 * Math.cos(a)} ${18 + 9 * Math.sin(a)}L${24 + 12 * Math.cos(a)} ${18 + 12 * Math.sin(a)}`} />; })}</G> : null}
      {n === 3 ? <G {...c}><Path d="M17 34a7 7 0 0 1 14 0" fill={color} fillOpacity={0.2} /><Path d="M10 40h28" strokeOpacity={0.35} /><Path d="M31 22l3-3M17 22l-3-3" /></G> : null}
      {n === 4 ? <G {...c}><Path d="M28 12a10 10 0 1 0 6 18 8 8 0 1 1-6-18z" fill={color} fillOpacity={0.2} /><Path d="M14 14l.8 1.8 1.8.8-1.8.8-.8 1.8-.8-1.8-1.8-.8 1.8-.8z" fill={color} stroke="none" /></G> : null}
    </Svg>
  );
}

/** schematic forgetting curves: without review, and with reviews on day 1, 3, 7, 14 and 30 (Curve) */
export function Curve({ c }: { c: ShamsContent }) {
  const isl = useIsl();
  const ink = isl.ink;
  const X = (d: number) => 40 + (d / 35) * 540, Y = (p: number) => 20 + (1 - p) * 200;
  const without = Array.from({ length: 36 }, (_, d) => `${d ? "L" : "M"}${X(d).toFixed(1)},${Y(Math.exp(-d / 2.2)).toFixed(1)}`).join(" ");
  const reviews = [0, 1, 3, 7, 14, 30];
  let path = "";
  reviews.forEach((r, i) => {
    const next = reviews[i + 1] ?? 35, s = 1.2 * Math.pow(2.2, i);
    for (let d = r; d <= next; d += 0.25) path += `${path ? "L" : "M"}${X(d).toFixed(1)},${Y(Math.exp(-(d - r) / s)).toFixed(1)} `;
  });
  return (
    <View style={{ width: "100%", aspectRatio: 600 / 260 }} accessible accessibilityRole="image" accessibilityLabel={c.curveTitle}>
      <Svg width="100%" height="100%" viewBox="0 0 600 260">
        <Defs>
          <SvgLinear id="curvefill" x1="0" y1="0" x2="0" y2="1"><Stop offset="0" stopColor={isl.goldSoft} stopOpacity={0.28} /><Stop offset="1" stopColor={isl.goldSoft} stopOpacity={0} /></SvgLinear>
        </Defs>
        <Line x1={40} y1={220} x2={585} y2={220} stroke={ink} strokeOpacity={0.25} />
        <Line x1={40} y1={20} x2={40} y2={220} stroke={ink} strokeOpacity={0.25} />
        {reviews.slice(1).map((r) => (
          <G key={r}>
            <Line x1={X(r)} y1={20} x2={X(r)} y2={220} stroke={isl.goldSoft} strokeOpacity={0.22} strokeDasharray="2 4" />
            <Path d={starPath(X(r), 220, 5, 2.2)} fill={isl.goldSoft} />
            <SvgText x={X(r)} y={240} textAnchor="middle" fontSize={14} fill={ink} fillOpacity={0.6}>{r}</SvgText>
          </G>
        ))}
        <Path d={`${path} L${X(35)},220 L${X(0)},220 Z`} fill="url(#curvefill)" />
        <Path d={without} fill="none" stroke={ink} strokeOpacity={0.35} strokeWidth={2} strokeDasharray="5 5" />
        <Path d={path} fill="none" stroke={isl.goldSoft} strokeWidth={3} strokeLinejoin="round" />
        <SvgText x={585} y={256} textAnchor="end" fontSize={14} fill={ink} fillOpacity={0.6}>{c.curveAxis.x}</SvgText>
        <SvgText x={44} y={14} fontSize={14} fill={ink} fillOpacity={0.6}>{c.curveAxis.y}</SvgText>
        <G>
          <Rect x={360} y={30} width={14} height={3} fill={isl.goldSoft} /><SvgText x={380} y={36} fontSize={14} fill={ink}>{c.curveAxis.with}</SvgText>
          <Rect x={360} y={52} width={14} height={2} fill={ink} fillOpacity={0.35} /><SvgText x={380} y={58} fontSize={14} fill={ink} fillOpacity={0.7}>{c.curveAxis.without}</SvgText>
        </G>
      </Svg>
    </View>
  );
}

/** the review ladder: the gaps a verse travels through when every review succeeds (days, log scale) (Ladder) */
export function Ladder({ day }: { day: string }) {
  const gaps = [1, 3, 7, 14, 30, 90];
  const X = (d: number) => 40 + (Math.log(d + 1) / Math.log(91)) * 530;
  const ink = "#ffffff";
  return (
    <View style={{ width: "100%", aspectRatio: 600 / 230 }} accessible accessibilityRole="image" accessibilityLabel="1 · 3 · 7 · 14 · 30 · 90">
      <Svg width="100%" height="100%" viewBox="0 0 600 230">
        <Line x1={30} y1={190} x2={590} y2={190} stroke={ink} strokeOpacity={0.25} />
        <Line x1={X(0)} y1={190} x2={X(0)} y2={60} stroke={ink} strokeOpacity={0.3} strokeDasharray="4 3" />
        <SvgText x={X(0)} y={210} textAnchor="middle" fontSize={15} fill={ink} fillOpacity={0.6}>{day} 0</SvgText>
        {gaps.map((d, i) => {
          const h = 50 + i * 22;
          return (
            <G key={d}>
              <Path d={`M${X(d) - 14} 190V${190 - h + 12}Q${X(d) - 14} ${190 - h} ${X(d)} ${190 - h - 8}Q${X(d) + 14} ${190 - h} ${X(d) + 14} ${190 - h + 12}V190Z`} fill="rgb(233,207,153)" fillOpacity={0.45 + i * 0.09} />
              <SvgText x={X(d)} y={190 - h - 16} textAnchor="middle" fontSize={16} fontWeight="700" fill={ink}>{`${i + 1}.`}</SvgText>
              <SvgText x={X(d)} y={210} textAnchor="middle" fontSize={15} fill={ink} fillOpacity={0.7}>{`${day} ${d}`}</SvgText>
            </G>
          );
        })}
        <Path d={`M${X(0)} 175 ${gaps.map((d, i) => `L${X(d)} ${190 - (50 + i * 22) - 10}`).join(" ")}`} fill="none" stroke={ink} strokeOpacity={0.35} strokeWidth={1.5} strokeDasharray="3 3" />
      </Svg>
    </View>
  );
}

/** "One verse, four stages" (IslamShamsDemo): plays through the stages on its own until a stage is picked */
export function ShamsDemo({ words, cues, stages, title }: { words: string[]; cues: string[]; stages: string[]; title: string }) {
  const isl = useIsl();
  const reduce = useReducedMotion();
  const [stageN, setStage] = useState(0);
  const [tick, setTick] = useState(0);
  const [auto, setAuto] = useState(true);
  useEffect(() => {
    if (reduce) return;
    const id = setInterval(() => setTick((t) => t + 1), 900);
    return () => clearInterval(id);
  }, [reduce]);
  useEffect(() => {
    if (!auto || tick === 0) return;
    if (tick % 6 === 0) setStage((s) => (s + 1) % 4);
  }, [tick, auto]);
  const pick = (i: number) => { setAuto(false); setStage(i); setTick(0); };
  const n = words.length;
  const local = tick % 6;
  const gold = STAGE_GOLD;
  const cream = "#f3ead6";
  return (
    <IslCard style={{ padding: 16 }}>
      <Text style={{ fontFamily: FONT.semibold, fontSize: 11, letterSpacing: 2, textTransform: "uppercase", color: isl.gold }}>{title} · 1:2</Text>
      <View style={{ marginTop: 12, flexDirection: "row", flexWrap: "wrap", gap: 6 }} accessibilityRole="tablist">
        {stages.map((s, i) => {
          const on = stageN === i;
          return (
            <Pressable key={s} onPress={() => pick(i)} accessibilityRole="tab" accessibilityState={{ selected: on }} accessibilityLabel={s}
              style={{ width: "48.5%", flexDirection: "row", alignItems: "center", gap: 8, overflow: "hidden", borderRadius: 8, borderWidth: 1, paddingHorizontal: 10, paddingVertical: 8,
                borderColor: on ? isl.goldSoft : isl.a("muted", 0.25), backgroundColor: on ? isl.a("goldSoft", 0.15) : "transparent" }}>
              <View style={{ width: 20, height: 20, borderRadius: 10, alignItems: "center", justifyContent: "center", backgroundColor: on ? isl.goldSoft : isl.a("muted", 0.18) }}>
                <Text style={{ fontFamily: FONT.bold, fontSize: 10, color: on ? "#ffffff" : isl.ink }}>{i + 1}</Text>
              </View>
              <Text style={{ flex: 1, fontFamily: FONT.semibold, fontSize: 12.5, lineHeight: 15, color: on ? isl.ink : isl.muted }}>{s}</Text>
              {on && auto && !reduce ? <View style={{ position: "absolute", left: 0, bottom: 0, height: 2, width: `${((local + 1) / 6) * 100}%`, backgroundColor: isl.goldSoft }} /> : null}
            </Pressable>
          );
        })}
      </View>
      <View style={{ marginTop: 16, minHeight: 168, borderRadius: 12, borderWidth: 1, borderColor: isl.a("goldSoft", 0.25), backgroundColor: stage.bg, paddingHorizontal: 12, paddingVertical: 20, alignItems: "center", justifyContent: "center" }}>
        <View pointerEvents="none" style={{ position: "absolute", top: 5, left: 5, right: 5, bottom: 5, borderRadius: 8, borderWidth: 1, borderColor: stageGold(0.15) }} />
        {stageN === 0 ? (
          <Text style={{ fontFamily: ARABIC_FONT, fontSize: 26, lineHeight: 52, color: cream, textAlign: "center", writingDirection: "rtl" }}>
            {words.map((w, i) => <Text key={i} style={i === local % n ? { color: gold, backgroundColor: "rgba(255,255,255,0.1)" } : undefined}>{w} </Text>)}
          </Text>
        ) : null}
        {stageN === 1 ? (
          <View style={{ gap: 4, alignSelf: "stretch" }}>
            {[1, 2, 3, 4].map((k) => (
              <Text key={k} style={{ fontFamily: ARABIC_FONT, fontSize: 19, lineHeight: 33, color: cream, textAlign: "center", writingDirection: "rtl", opacity: reduce || k <= Math.min(4, local + 1) ? 1 : 0 }}>
                {words.map((w, i) => <Text key={i} style={i < n - k ? { opacity: 0.15, color: "rgba(243,234,214,0.15)" } : k === Math.min(4, local + 1) ? { color: gold } : undefined}>{w} </Text>)}
              </Text>
            ))}
          </View>
        ) : null}
        {stageN === 2 ? (
          <Text style={{ fontFamily: ARABIC_FONT, fontSize: 28, lineHeight: 56, color: gold, textAlign: "center", writingDirection: "rtl" }}>{cues.join("   ")}</Text>
        ) : null}
        {stageN === 3 ? (
          <View style={{ flexDirection: "row", direction: "rtl", flexWrap: "wrap", justifyContent: "center", gap: 10, paddingVertical: 12 }}>
            {words.map((w, i) => <View key={i} style={{ height: 32, width: w.length * 10, borderRadius: 6, backgroundColor: i <= local - 2 ? stageGold(0.35) : "rgba(255,255,255,0.12)" }} />)}
          </View>
        ) : null}
      </View>
    </IslCard>
  );
}

/** how long a goal takes at a given daily amount (ShamsPlanner) */
export function ShamsPlanner({ lang }: { lang: string }) {
  const t = useWebT("shams");
  const isl = useIsl();
  const [goal, setGoal] = useState<(typeof GOALS)[number]["id"]>("juzamma");
  const [per, setPer] = useState(3);
  const g = GOALS.find((x) => x.id === goal)!;
  const days = Math.ceil(g.verses / per);
  const minutes = per * 4 + 5; // ~4 minutes per new verse in seven steps + ~5 minutes of review
  const span = days < 60 ? t("planDays", { n: days }) : days < 730 ? t("planMonths", { n: Math.round(days / 30.4) }) : t("planYears", { n: (days / 365).toFixed(1) });
  const chip = (on: boolean, label: string, onPress: () => void, key: string | number) => (
    <Pressable key={key} onPress={onPress} accessibilityRole="button" accessibilityState={{ selected: on }} accessibilityLabel={label}
      style={{ height: 40, borderRadius: 999, borderWidth: on ? 2 : 1, paddingHorizontal: on ? 15 : 16, justifyContent: "center", borderColor: on ? "rgb(201,166,94)" : isl.a("muted", 0.25), backgroundColor: on ? "rgba(201,166,94,0.15)" : isl.a("surface", 0.7) }}>
      <Text style={{ fontFamily: FONT.semibold, fontSize: 14, color: isl.ink }}>{label}</Text>
    </Pressable>
  );
  const num = (v: number) => { try { return v.toLocaleString(lang); } catch { return String(v); } };
  const cell = (label: string, value: string) => (
    <View style={{ backgroundColor: stage.bg, padding: 16 }}>
      <Text style={{ fontFamily: FONT.regular, fontSize: 12, color: "rgba(255,255,255,0.55)" }}>{label}</Text>
      <Text style={{ marginTop: 4, fontFamily: FONT.display, fontSize: 24, lineHeight: 30, color: STAGE_GOLD }}>{value}</Text>
    </View>
  );
  return (
    <View style={{ borderRadius: 16, borderWidth: 1, borderColor: "rgba(201,166,94,0.35)", backgroundColor: isl.a("surface", 0.8), padding: 20 }}>
      <Text style={{ fontFamily: FONT.semibold, fontSize: 14, color: isl.muted }}>{t("planGoal")}</Text>
      <View style={{ marginTop: 8, flexDirection: "row", flexWrap: "wrap", gap: 8 }}>{GOALS.map((x) => chip(goal === x.id, t(`g_${x.id}`), () => setGoal(x.id), x.id))}</View>
      <Text style={{ marginTop: 20, fontFamily: FONT.semibold, fontSize: 14, color: isl.muted }}>{t("planPer")}</Text>
      <View style={{ marginTop: 8, flexDirection: "row", flexWrap: "wrap", gap: 8 }}>{PER_DAY.map((v) => chip(per === v, String(v), () => setPer(v), v))}</View>
      <View style={{ marginTop: 24, borderRadius: 12, borderWidth: 1, borderColor: "rgba(201,166,94,0.3)", backgroundColor: "rgba(201,166,94,0.25)", overflow: "hidden", gap: 1 }}>
        {cell(t("planVerses"), num(g.verses))}
        {cell(t("planTime"), span)}
        {cell(t("planDaily"), `≈ ${minutes} ${t("min")}`)}
      </View>
      <Text style={{ marginTop: 16, fontFamily: FONT.regular, fontSize: 12, lineHeight: 19.5, color: isl.muted }}>{t("planNote")}</Text>
    </View>
  );
}

