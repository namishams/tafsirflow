import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { Animated, Easing, Pressable, StyleSheet, Text, View, type LayoutChangeEvent, type StyleProp, type TextStyle, type ViewStyle } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router, type Href } from "expo-router";
import Svg, { Circle, ClipPath, Defs, G, LinearGradient as SvgLinear, Mask, Path, Pattern, RadialGradient, Rect, Stop } from "react-native-svg";
import { ARABIC_FONT, CALLIG_FONT, FONT, stage } from "@/lib/theme";
import { Icon } from "@/components/icons";
import { STAGE_GOLD, STAGE_TEXT, stageGold, useIsl } from "./palette";
import { useReducedMotion } from "./motion";
import { useIslScreen } from "./screen";
import { useT } from "@/i18n";

// The ornaments of the website's "Islam & knowledge" pages (src/components/art/IslamArt.tsx, src/styles/art-islam.css),
// drawn with react-native-svg: inlaid flowers, numbered eight-pointed medallions, the lattice dome of light, the rain of
// light, the arcade edge of the heroes, arch windows of coloured inlay and the white marble.

const abs = StyleSheet.absoluteFill;
/** unique, url()-safe id for SVG defs */
export function useSvgId(prefix: string) {
  return prefix + useId().replace(/[^a-zA-Z0-9]/g, "");
}

// points of an n-pointed star (IslamArt.tsx starPath)
export function starPath(cx: number, cy: number, R: number, r: number, n = 8, rot = -Math.PI / 2) {
  const pts: string[] = [];
  for (let i = 0; i < n * 2; i++) {
    const a = (Math.PI / n) * i + rot, rad = i % 2 ? r : R;
    pts.push(`${(cx + rad * Math.cos(a)).toFixed(2)},${(cy + rad * Math.sin(a)).toFixed(2)}`);
  }
  return `M${pts.join("L")}Z`;
}

/** "ﷺ" set in Amiri and gold, so the blessing reads as calligraphy (IslamArt.tsx saw); use inside a <Text> */
export function saw(text: string, gold: string, k = "s"): ReactNode {
  if (!text.includes("ﷺ")) return text;
  return text.split("ﷺ").flatMap((part, i) => (i ? [<Text key={`${k}${i}`} style={{ fontFamily: ARABIC_FONT, color: gold }}>ﷺ</Text>, part] : [part]));
}
export function useSaw() {
  const isl = useIsl();
  return (text: string, k?: string) => saw(text, isl.gold, k);
}

// ---------- medallions and marks ----------

/** eight-pointed medallion with a number (.isl-num); `on` = filled gold and turned like the current section */
export function IslamNum({ n, size = 28.6, fontSize = 13, on = false, color, paper, solid }: { n: number | string; size?: number; fontSize?: number; on?: boolean; color?: string; paper?: string; solid?: string }) {
  const isl = useIsl();
  const c = color ?? isl.gold;
  const fill = solid ?? c;
  const fo = solid || on ? 1 : 0.1;
  return (
    <View style={{ width: size, height: size, alignItems: "center", justifyContent: "center" }} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      <Svg width={size} height={size} viewBox="0 0 40 40" style={[abs, on ? { transform: [{ rotate: "45deg" }] } : null]}>
        <Rect x={8.5} y={8.5} width={23} height={23} rx={1.5} fill={fill} fillOpacity={fo} stroke={c} strokeWidth={1.1} />
        <Rect x={8.5} y={8.5} width={23} height={23} rx={1.5} transform="rotate(45 20 20)" fill={fill} fillOpacity={fo} stroke={c} strokeWidth={1.1} />
        <Circle cx={20} cy={20} r={10.5} fill="none" stroke={c} strokeOpacity={0.45} strokeWidth={0.7} />
      </Svg>
      {n !== "" ? <Text allowFontScaling={false} style={{ fontFamily: FONT.bold, fontSize, color: on ? (paper ?? isl.paper) : c, fontVariant: ["tabular-nums"] }}>{n}</Text> : null}
    </View>
  );
}

/** small eight-pointed star used inside verse chips and as a list mark (IslamStarMark) */
export function StarMark({ size = 12, color, center }: { size?: number; color: string; center?: string }) {
  const isl = useIsl();
  return (
    <Svg width={size} height={size} viewBox="0 0 16 16">
      <Path d={starPath(8, 8, 7.4, 3.4)} fill={color} fillOpacity={0.9} />
      <Circle cx={8} cy={8} r={1.6} fill={center ?? isl.paper} />
    </Svg>
  );
}

/** the star of a framed quotation (isl-quote-star) */
export function QuoteStar({ size = 34, color, bg }: { size?: number; color: string; bg: string }) {
  return (
    <View style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: bg, padding: 4 }}>
      <Svg width={size - 8} height={size - 8} viewBox="0 0 24 24">
        <Path d={starPath(12, 12, 11, 5)} fill={color} fillOpacity={0.25} stroke={color} strokeWidth={1} />
        <Circle cx={12} cy={12} r={2.2} fill={color} />
      </Svg>
    </View>
  );
}

/** small gilded rosette (Ornaments.tsx Rosette) */
export function Rosette({ size = 28, color, bg }: { size?: number; color: string; bg?: string }) {
  const pts = Array.from({ length: 32 }, (_, i) => { const a = (Math.PI / 16) * i - Math.PI / 2, r = i % 2 ? 9 : 14; return `${(16 + r * Math.cos(a)).toFixed(2)},${(16 + r * Math.sin(a)).toFixed(2)}`; });
  return (
    <View style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: bg }}>
      <Svg width={size} height={size} viewBox="0 0 32 32">
        <Path d={`M${pts.join("L")}Z`} fill={color} fillOpacity={0.18} stroke={color} strokeWidth={0.8} />
        <Circle cx={16} cy={16} r={6.5} fill="none" stroke={color} strokeWidth={0.8} />
        <Path d="M16 11.5l1.4 3.1 3.1 1.4-3.1 1.4-1.4 3.1-1.4-3.1-3.1-1.4 3.1-1.4z" fill={color} />
      </Svg>
    </View>
  );
}

/** a vine with an inlaid tulip in the middle (IslamFloral) */
export function Floral({ width = 132 }: { width?: number }) {
  const isl = useIsl();
  const c = isl.goldSoft;
  const half = (
    <G>
      <Path d="M115 31c-10 6-22 4-32-1-9-4-17-6-27-2-6 2-10 6-17 6" fill="none" stroke={c} strokeWidth={1.1} strokeLinecap="round" />
      <Path d="M96 33c-1-6 2-11 8-13 1 6-2 11-8 13z" fill={isl.jade} fillOpacity={0.22} stroke={c} strokeWidth={0.9} />
      <Path d="M72 28c-5-3-6-8-4-13 5 2 7 8 4 13z" fill={isl.jade} fillOpacity={0.22} stroke={c} strokeWidth={0.9} />
      <Path d="M58 26c2 5 0 10-5 12-2-5 0-10 5-12z" fill={isl.jade} fillOpacity={0.18} stroke={c} strokeWidth={0.9} />
      <Circle cx={84} cy={21} r={2.6} fill={isl.garnet} fillOpacity={0.35} stroke={c} strokeWidth={0.8} />
      <Circle cx={38} cy={34} r={2.2} fill={isl.lapis} fillOpacity={0.3} stroke={c} strokeWidth={0.8} />
      <Path d="M30 34h-6M20 34l-2.2-2.2L15.6 34l2.2 2.2z" fill={c} fillOpacity={0.6} stroke={c} strokeWidth={0.8} />
    </G>
  );
  return (
    <Svg width={width} height={(width * 48) / 240} viewBox="0 0 240 48">
      {half}
      <G transform="matrix(-1 0 0 1 240 0)">{half}</G>
      <Path d="M120 5c7 7 8 17 0 27-8-10-7-20 0-27z" fill={isl.garnet} fillOpacity={0.2} stroke={c} strokeWidth={1.1} />
      <Path d="M120 32c-10-1-16-8-16-18 6 3 12 9 16 18z" fill={isl.lapis} fillOpacity={0.18} stroke={c} strokeWidth={1} />
      <Path d="M120 32c10-1 16-8 16-18-6 3-12 9-16 18z" fill={isl.lapis} fillOpacity={0.18} stroke={c} strokeWidth={1} />
      <Path d="M120 12v16" stroke={c} strokeOpacity={0.5} strokeWidth={0.8} />
      <Path d="M120 33.5l3 3-3 3-3-3z" fill={c} />
    </Svg>
  );
}

/** ornamental break between sections: fading gold lines with the vine in the middle (.isl-break) */
export function IslBreak({ style }: { style?: StyleProp<ViewStyle> }) {
  const isl = useIsl();
  return (
    <View style={[{ flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10, marginTop: 44, marginBottom: 32 }, style]} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      <LinearGradient colors={["transparent", isl.goldSoft]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={{ height: 1, flex: 1, maxWidth: 140, opacity: 0.55 }} />
      <Floral width={132} />
      <LinearGradient colors={[isl.goldSoft, "transparent"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={{ height: 1, flex: 1, maxWidth: 140, opacity: 0.55 }} />
    </View>
  );
}

/** four corners of floral inlay for framed panels (IslamCorner, 36px on phones) */
export function Corners({ size = 36 }: { size?: number }) {
  const isl = useIsl();
  const c = isl.goldSoft;
  const corner = (
    <Svg width={size} height={size} viewBox="0 0 64 64">
      <Path d="M4 60V18C4 10 10 4 18 4h42" fill="none" stroke={c} strokeOpacity={0.55} strokeWidth={1} />
      <Path d="M9 60V20c0-6 5-11 11-11h40" fill="none" stroke={c} strokeOpacity={0.25} strokeWidth={1} />
      <Path d="M14 30c0-9 7-16 16-16" fill="none" stroke={c} strokeWidth={1} />
      <Path d="M22 18c-1 5-5 8-10 8 1-5 5-8 10-8z" fill={isl.jade} fillOpacity={0.22} stroke={c} strokeWidth={0.8} />
      <Path d="M36 14c-3 4-8 5-12 3 3-4 8-5 12-3z" fill={isl.jade} fillOpacity={0.22} stroke={c} strokeWidth={0.8} />
      <Path d="M14 38c-4-3-5-8-3-12 4 3 5 8 3 12z" fill={isl.jade} fillOpacity={0.18} stroke={c} strokeWidth={0.8} />
      <Path d={starPath(14, 14, 6.5, 3)} fill={isl.garnet} fillOpacity={0.3} stroke={c} strokeWidth={0.8} />
      <Circle cx={14} cy={14} r={1.4} fill={c} />
      <Circle cx={44} cy={12} r={1.6} fill={isl.lapis} fillOpacity={0.5} />
      <Circle cx={12} cy={44} r={1.6} fill={isl.lapis} fillOpacity={0.5} />
    </Svg>
  );
  const pos: [ViewStyle, ViewStyle["transform"]][] = [
    [{ top: 6, left: 6 }, undefined],
    [{ top: 6, right: 6 }, [{ scaleX: -1 }]],
    [{ bottom: 6, left: 6 }, [{ scaleY: -1 }]],
    [{ bottom: 6, right: 6 }, [{ scaleX: -1 }, { scaleY: -1 }]],
  ];
  return <>{pos.map(([p, tr], i) => <View key={i} pointerEvents="none" style={[{ position: "absolute", width: size, height: size }, p, tr ? { transform: tr } : null]}>{corner}</View>)}</>;
}

/** the Sheikh Zayed Grand Mosque in one gold line (IslamMosque) */
export function Mosque({ width = 240, color }: { width?: number; color: string }) {
  const minaret = (x: number) => `M${x} 120V40h7v80M${x - 2.5} 40h12M${x + 1} 40v-9h5v9M${x + 3.5} 31v-8`;
  return (
    <Svg width={width} height={(width * 128) / 240} viewBox="0 0 240 128" fill="none" stroke={color} strokeWidth={1.2} strokeLinecap="round" strokeLinejoin="round">
      <Path d={minaret(14)} /><Path d={minaret(52)} /><Path d={minaret(180)} /><Path d={minaret(218)} />
      <Path d="M66 120V86h108v34" />
      <Path d="M92 86a28 33 0 0 1 56 0M120 53v-8M117.5 45h5" />
      <Path d="M70 87a12 14 0 0 1 24 0M146 87a12 14 0 0 1 24 0" />
      <Path d="M74 120v-14a6 6 0 0 1 12 0v14M92 120v-14a6 6 0 0 1 12 0v14M112 120v-17a8 8 0 0 1 16 0v17M136 120v-14a6 6 0 0 1 12 0v14M154 120v-14a6 6 0 0 1 12 0v14" />
      <Path d="M0 120h240" strokeOpacity={0.6} /><Path d="M40 125h46M150 125h52" strokeOpacity={0.35} />
    </Svg>
  );
}

// ---------- arch window of coloured inlay (chapter cards, secrets) ----------
const ARCH = "M34 300V158C34 92 118 46 200 14C282 46 366 92 366 158V300Z";
const ARCH_OUT = "M22 300V156C22 84 110 34 200 0C290 34 378 84 378 156V300";
const JEWELS = [["#0c4a37", "#06221a"], ["#3a2f12", "#14110a"], ["#173640", "#081418"], ["#1f2b44", "#0b101b"], ["#3b1f2b", "#160b10"], ["#2c3a1a", "#10160a"], ["#30254a", "#100c19"], ["#401c14", "#170a07"]];

/** a pointed-arch window of coloured inlay with the Arabic word in gold (IslamArchWindow, aspect 4:3) */
export function ArchWindow({ i, ar }: { i: number; ar: string }) {
  const id = useSvgId("w");
  const [w, setW] = useState(0);
  const [a, b] = JEWELS[i % JEWELS.length];
  // font-size: clamp(17px, min(17, 230 / max(6, length)) cqw, 60px)
  const fs = w ? Math.max(17, Math.min(60, (Math.min(17, 230 / Math.max(6, ar.length)) * w) / 100)) : 17;
  return (
    <View style={{ aspectRatio: 4 / 3, overflow: "hidden" }} onLayout={(e) => setW(e.nativeEvent.layout.width)} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      <Svg style={abs} viewBox="0 0 400 300" preserveAspectRatio="none">
        <Defs>
          <SvgLinear id={`${id}g`} x1="0" y1="0" x2="0.4" y2="1"><Stop offset="0" stopColor={a} /><Stop offset="1" stopColor={b} /></SvgLinear>
          <RadialGradient id={`${id}l`} cx="50%" cy="18%" r="60%"><Stop offset="0" stopColor="#ffe9b8" stopOpacity={0.35} /><Stop offset="1" stopColor="#ffe9b8" stopOpacity={0} /></RadialGradient>
          <Pattern id={`${id}p`} width={50} height={50} patternUnits="userSpaceOnUse">
            <Path d={starPath(25, 25, 21, 10)} fill="none" stroke="#e9cf99" strokeOpacity={0.16} strokeWidth={1} />
            <Circle cx={25} cy={25} r={4} fill="none" stroke="#e9cf99" strokeOpacity={0.12} />
          </Pattern>
          <ClipPath id={`${id}c`}><Path d={ARCH} /></ClipPath>
        </Defs>
        <Path d={ARCH} fill={`url(#${id}g)`} />
        <G clipPath={`url(#${id}c)`}>
          <Rect x={-100} y={-100} width={600} height={500} fill={`url(#${id}p)`} />
          <Rect width={400} height={300} fill={`url(#${id}l)`} opacity={0.55} />
        </G>
        <Path d={ARCH} fill="none" stroke="#d6b46c" strokeOpacity={0.9} strokeWidth={1.6} />
        <Path d={ARCH_OUT} fill="none" stroke="#c9a65e" strokeOpacity={0.45} strokeWidth={1} />
      </Svg>
      <View style={{ position: "absolute", left: "12%", right: "12%", top: "26%", bottom: "14%", alignItems: "center", justifyContent: "center" }}>
        <Text allowFontScaling={false} style={{ fontFamily: CALLIG_FONT, fontSize: fs, lineHeight: fs * 1.45, color: "rgb(243,226,182)", textAlign: "center", writingDirection: "rtl", textShadowColor: "rgba(0,0,0,0.35)", textShadowRadius: 9, textShadowOffset: { width: 0, height: 2 } }}>{ar}</Text>
      </View>
    </View>
  );
}

// ---------- the stage hero ----------

/** the lattice dome of light: layered stars turning against each other (IslamDome) */
export function Dome({ size = 560, style, opacity = 1 }: { size?: number; style?: StyleProp<ViewStyle>; opacity?: number }) {
  const id = useSvgId("d");
  const reduce = useReducedMotion();
  const r1 = useRef(new Animated.Value(0)).current;
  const r2 = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (reduce) return;
    const a = Animated.loop(Animated.timing(r1, { toValue: 1, duration: 300000, easing: Easing.linear, useNativeDriver: true }));
    const b = Animated.loop(Animated.timing(r2, { toValue: 1, duration: 420000, easing: Easing.linear, useNativeDriver: true }));
    a.start(); b.start();
    return () => { a.stop(); b.stop(); };
  }, [reduce, r1, r2]);
  const c = "rgb(233,207,153)";
  const mask = (
    <Defs>
      <RadialGradient id={`${id}m`} cx="50%" cy="50%" r="50%">
        <Stop offset="0" stopColor="#fff" stopOpacity={0.95} /><Stop offset="0.55" stopColor="#fff" stopOpacity={0.45} /><Stop offset="1" stopColor="#fff" stopOpacity={0} />
      </RadialGradient>
      <Mask id={`${id}k`} maskUnits="userSpaceOnUse" x={0} y={0} width={400} height={400}><Circle cx={200} cy={200} r={200} fill={`url(#${id}m)`} /></Mask>
    </Defs>
  );
  return (
    <View pointerEvents="none" style={[{ position: "absolute", width: size, height: size, opacity }, style]}>
      <Svg style={abs} viewBox="0 0 400 400">
        <Defs>
          <RadialGradient id={`${id}s`} cx="50%" cy="50%" r="50%">
            <Stop offset="0" stopColor="rgb(255,236,190)" stopOpacity={0.35} /><Stop offset="0.5" stopColor={c} stopOpacity={0.08} /><Stop offset="1" stopColor={c} stopOpacity={0} />
          </RadialGradient>
        </Defs>
        <Circle cx={200} cy={200} r={200} fill={`url(#${id}s)`} />
      </Svg>
      <Animated.View style={[abs, { opacity: 0.42, transform: [{ rotate: r1.interpolate({ inputRange: [0, 1], outputRange: ["0deg", "360deg"] }) }] }]}>
        <Svg style={abs} viewBox="0 0 400 400">
          {mask}
          <Defs>
            <Pattern id={`${id}a`} width={40} height={40} patternUnits="userSpaceOnUse">
              <Path d={starPath(20, 20, 17, 8)} fill="none" stroke={c} strokeWidth={0.7} />
              <Path d="M0 0l8 8M40 0l-8 8M0 40l8-8M40 40l-8-8" stroke={c} strokeWidth={0.6} />
            </Pattern>
          </Defs>
          <Rect x={-60} y={-60} width={520} height={520} fill={`url(#${id}a)`} mask={`url(#${id}k)`} />
        </Svg>
      </Animated.View>
      <Animated.View style={[abs, { opacity: 0.42 * 0.8, transform: [{ rotate: r2.interpolate({ inputRange: [0, 1], outputRange: ["0deg", "-360deg"] }) }] }]}>
        <Svg style={abs} viewBox="0 0 400 400">
          {mask}
          <Defs>
            <Pattern id={`${id}b`} width={64} height={64} patternUnits="userSpaceOnUse" patternTransform="rotate(22.5)">
              <Rect x={14} y={14} width={36} height={36} fill="none" stroke={c} strokeWidth={0.8} />
              <Rect x={14} y={14} width={36} height={36} transform="rotate(45 32 32)" fill="none" stroke={c} strokeWidth={0.8} />
            </Pattern>
          </Defs>
          <Rect x={-60} y={-60} width={520} height={520} fill={`url(#${id}b)`} mask={`url(#${id}k)`} />
        </Svg>
      </Animated.View>
      <Svg style={abs} viewBox="0 0 400 400">
        <Circle cx={200} cy={200} r={196} fill="none" stroke={c} strokeOpacity={0.22} />
        <Circle cx={200} cy={200} r={186} fill="none" stroke={c} strokeOpacity={0.12} strokeDasharray="2 6" />
      </Svg>
    </View>
  );
}

// light flecks falling slowly through the lattice (fixed positions like the website)
const RAIN = [[8, 0, 9], [17, 3.2, 12], [26, 6.1, 10], [34, 1.4, 13], [43, 8.3, 11], [51, 4.4, 9.5], [59, 2.2, 12.5], [66, 7.1, 10.5], [74, 0.8, 13.5], [82, 5.6, 11], [90, 3.9, 9], [95, 9.4, 12]];
function Fleck({ x, delay, dur, size, fall }: { x: number; delay: number; dur: number; size: number; fall: number }) {
  const v = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = Animated.loop(Animated.timing(v, { toValue: 1, duration: dur * 1000, easing: Easing.linear, useNativeDriver: true }));
    const t = setTimeout(() => loop.start(), delay * 1000);
    return () => { clearTimeout(t); loop.stop(); };
  }, [v, delay, dur]);
  return (
    <Animated.View style={{
      position: "absolute", left: `${x}%`, top: -8, width: size, height: size, borderRadius: size / 2, backgroundColor: "rgb(255,236,190)",
      shadowColor: "rgb(233,207,153)", shadowOpacity: 0.6, shadowRadius: 5, shadowOffset: { width: 0, height: 0 },
      opacity: v.interpolate({ inputRange: [0, 0.15, 0.7, 1], outputRange: [0, 0.85, 0.5, 0] }),
      transform: [{ translateY: v.interpolate({ inputRange: [0, 1], outputRange: [0, fall] }) }],
    }} />
  );
}
export function Rain({ fall = 420, opacity = 0.7 }: { fall?: number; opacity?: number }) {
  const reduce = useReducedMotion();
  if (reduce) return null;
  return (
    <View pointerEvents="none" style={[abs, { overflow: "hidden", opacity }]} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      {RAIN.map(([x, d, t], i) => <Fleck key={i} x={x} delay={d} dur={t} size={2 + (i % 3)} fall={fall} />)}
    </View>
  );
}

/** the big Arabic word that writes itself in the corner of a hero (Ornaments.tsx CalligraphyDraw, 520×150 on phones) */
export function HeroCalligraphy({ text, top = 0 }: { text: string; top?: number }) {
  const reduce = useReducedMotion();
  const o = useRef(new Animated.Value(reduce ? 1 : 0)).current;
  useEffect(() => {
    if (reduce) { o.setValue(1); return; }
    const a = Animated.timing(o, { toValue: 1, duration: 2400, delay: 900, easing: Easing.out(Easing.quad), useNativeDriver: true });
    a.start();
    return () => a.stop();
  }, [reduce, o]);
  return (
    <Animated.View pointerEvents="none" style={{ position: "absolute", right: -1, top, width: 1200, height: 150, opacity: o }} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      <Text numberOfLines={1} allowFontScaling={false} style={{ fontFamily: CALLIG_FONT, fontSize: 108, lineHeight: 150, color: "rgba(214,180,108,0.16)", textAlign: "right", writingDirection: "rtl", textShadowColor: "rgba(214,180,108,0.22)", textShadowRadius: 1, textShadowOffset: { width: 0, height: 0 } }}>{text}</Text>
    </Animated.View>
  );
}

/** the girih lattice of the stage (.girih::before and ::after), faded towards the top corner */
function Girih({ w, h }: { w: number; h: number }) {
  const id = useSvgId("g");
  if (!w || !h) return null;
  const tile = (x: number, y: number, k: string) => (
    <G key={k} transform={`translate(${x} ${y})`}>
      <Path d="M-22-22h44v44h-44z" /><Path d="M0-31L31 0 0 31-31 0z" /><Circle r={7} />
    </G>
  );
  const far = Math.hypot(Math.max(w * 0.7, w * 0.3), Math.max(h * 0.35, h * 0.65));
  return (
    <Svg style={{ position: "absolute", top: 0, left: 0 }} width={w} height={h} pointerEvents="none">
      <Defs>
        <Pattern id={`${id}a`} width={96} height={96} patternUnits="userSpaceOnUse">
          <G fill="none" stroke="#d6b46c" strokeOpacity={0.13} strokeWidth={1}>
            {tile(48, 48, "c")}{tile(0, 0, "a")}{tile(96, 0, "b")}{tile(0, 96, "d")}{tile(96, 96, "e")}
            <Path d="M48 0v17M48 79v17M0 48h17M79 48h17M22 22l4 4M74 22l-4 4M22 74l4-4M74 74l-4-4" />
          </G>
        </Pattern>
        <Pattern id={`${id}b`} width={160} height={160} patternUnits="userSpaceOnUse">
          <G fill="none" stroke="#e9cf99" strokeOpacity={0.11} strokeWidth={1}>
            <Path d="M80 10l20 50 50 20-50 20-20 50-20-50-50-20 50-20z" /><Path d="M30 30h100v100H30z" /><Circle cx={80} cy={80} r={22} />
            <Path d="M0 0l30 30M160 0l-30 30M0 160l30-30M160 160l-30-30" />
          </G>
        </Pattern>
        <RadialGradient id={`${id}ma`} gradientUnits="userSpaceOnUse" cx={w * 0.85} cy={0} rx={w * 0.8} ry={h * 0.9} r={w * 0.8}>
          <Stop offset="0" stopColor="#fff" stopOpacity={1} /><Stop offset="0.7" stopColor="#fff" stopOpacity={0} />
        </RadialGradient>
        <RadialGradient id={`${id}mb`} gradientUnits="userSpaceOnUse" cx={w * 0.7} cy={h * 0.35} r={far}>
          <Stop offset="0" stopColor="#fff" stopOpacity={0.9} /><Stop offset="0.55" stopColor="#fff" stopOpacity={0} />
        </RadialGradient>
        <Mask id={`${id}ka`} maskUnits="userSpaceOnUse" x={0} y={0} width={w} height={h}><Rect width={w} height={h} fill={`url(#${id}ma)`} /></Mask>
        <Mask id={`${id}kb`} maskUnits="userSpaceOnUse" x={0} y={0} width={w} height={h}><Rect width={w} height={h} fill={`url(#${id}mb)`} /></Mask>
      </Defs>
      <Rect width={w} height={h} fill={`url(#${id}a)`} mask={`url(#${id}ka)`} />
      <Rect width={w} height={h} fill={`url(#${id}b)`} mask={`url(#${id}kb)`} />
    </Svg>
  );
}

/** the stage background: deep green, a glow from above and the girih lattice */
export function StageBackground({ children, style, rounded = 0 }: { children?: ReactNode; style?: StyleProp<ViewStyle>; rounded?: number }) {
  const id = useSvgId("st");
  const [size, setSize] = useState({ w: 0, h: 0 });
  const onLayout = (e: LayoutChangeEvent) => { const { width, height } = e.nativeEvent.layout; if (Math.abs(width - size.w) > 1 || Math.abs(height - size.h) > 1) setSize({ w: width, h: height }); };
  return (
    <View onLayout={onLayout} style={[{ backgroundColor: stage.bg, overflow: "hidden", borderRadius: rounded }, style]}>
      <LinearGradient colors={[stage.bg, stage.deep]} style={abs} />
      {/* SVG layers are drawn into bitmaps of their own size, so on very tall sections they cover only the top,
          where the website's glow and lattice are strongest anyway */}
      {size.w ? (
        <Svg width={size.w} height={Math.min(size.h, 800)} style={{ position: "absolute", top: 0, left: 0 }} pointerEvents="none">
          <Defs>
            <RadialGradient id={`${id}glow`} gradientUnits="userSpaceOnUse" cx={size.w / 2} cy={-0.2 * Math.min(size.h, 800)} rx={0.8 * size.w} ry={0.7 * Math.min(size.h, 800)} r={0.8 * size.w}>
              <Stop offset="0" stopColor="rgb(18,74,56)" stopOpacity={0.9} /><Stop offset="1" stopColor="rgb(18,74,56)" stopOpacity={0} />
            </RadialGradient>
          </Defs>
          <Rect width={size.w} height={Math.min(size.h, 800)} fill={`url(#${id}glow)`} />
        </Svg>
      ) : null}
      <Girih w={size.w} h={Math.min(size.h, 900)} />
      {children}
    </View>
  );
}

/** the arcade edge at the bottom of a hero (.isl-arcade mask + .isl-arcade-line): pointed arches open to the marble */
export function ArcadeEdge({ fill }: { fill: string }) {
  const [w, setW] = useState(0);
  const AW = 56, AH = 30, sx = AW / 80, sy = AH / 40;
  let main = "", outer = "", holes = "";
  if (w) {
    const first = w / 2 - AW / 2 - Math.ceil((w / 2) / AW) * AW;
    for (let ox = first; ox < w + AW; ox += AW) {
      const X = (v: number) => (ox + v * sx).toFixed(2), Y = (v: number) => (v * sy).toFixed(2);
      const arch = `M${X(9)} ${AH}V${Y(25)}C${X(9)} ${Y(14)} ${X(27)} ${Y(8)} ${X(40)} ${Y(3)} ${X(53)} ${Y(8)} ${X(71)} ${Y(14)} ${X(71)} ${Y(25)}V${AH}`;
      main += arch;
      holes += `${arch}Z`;
      outer += `M${X(5)} ${AH}V${Y(24)}C${X(5)} ${Y(12)} ${X(24)} ${Y(5)} ${X(40)} 0 ${X(56)} ${Y(5)} ${X(75)} ${Y(12)} ${X(75)} ${Y(24)}V${AH}`;
    }
  }
  return (
    <View pointerEvents="none" style={{ height: AH, marginTop: -AH }} onLayout={(e) => setW(e.nativeEvent.layout.width)} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      {w ? (
        <Svg width={w} height={AH + 1}>
          <Path d={outer} fill="none" stroke="#d6b46c" strokeOpacity={0.25} strokeWidth={1} />
          <Path d={main} fill="none" stroke="#d6b46c" strokeOpacity={0.75} strokeWidth={3} />
          <Path d={holes} fill={fill} />
          <Rect x={0} y={AH - 0.5} width={w} height={1.5} fill={fill} />
        </Svg>
      ) : null}
    </View>
  );
}

/** round back link on the stage ("← Islam verstehen") */
export function StageBackPill({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} accessibilityRole="link" accessibilityLabel={label} hitSlop={8}
      style={({ pressed }) => ({ alignSelf: "flex-start", flexDirection: "row", alignItems: "center", gap: 6, borderRadius: 999, borderWidth: 1, borderColor: pressed ? stageGold(0.6) : "rgba(255,255,255,0.15)", backgroundColor: "rgba(255,255,255,0.04)", paddingHorizontal: 12, paddingVertical: 5 })}>
      <Icon name="chevronLeft" color="rgba(255,255,255,0.7)" size={14} />
      <Text style={{ fontFamily: FONT.semibold, fontSize: 13, color: "rgba(255,255,255,0.7)" }} numberOfLines={1}>{label}</Text>
    </Pressable>
  );
}

/** back from a pushed screen; after a deep link there is nothing to go back to, so the library opens */
export function goBack() {
  if (router.canGoBack()) router.back();
  else router.replace("/library" as Href);
}

export type HeroProps = {
  callig?: string; dome?: boolean; domeTop?: number; fall?: number; rainOpacity?: number;
  arcade?: boolean; back?: boolean; children: ReactNode; paddingBottom?: number; paddingTop?: number;
};
/** the hero of the Islam pages: stage, dome of light, rain of light, calligraphy, arcade edge (marble shows in the arches) */
export function IslHero({ callig, dome = false, domeTop = -176, fall = 420, rainOpacity = 0.7, arcade = true, back = true, children, paddingBottom, paddingTop = 28 }: HeroProps) {
  const isl = useIsl();
  const insets = useSafeAreaInsets();
  const screen = useIslScreen();
  const tr = useT();
  return (
    <View onLayout={(e) => screen?.setHeroHeight(e.nativeEvent.layout.height)}>
    <StageBackground>
      {dome ? <Dome size={560} style={{ right: -160, top: domeTop + insets.top }} /> : null}
      <Rain fall={fall} opacity={rainOpacity} />
      {callig ? <HeroCalligraphy text={callig} top={insets.top} /> : null}
      <View style={{ paddingTop: insets.top + (back ? 6 : paddingTop), paddingHorizontal: 20, paddingBottom: paddingBottom ?? (arcade ? 72 : 48) }}>
        {back ? (
          <Pressable onPress={goBack} accessibilityRole="button" accessibilityLabel={tr("common.back")} hitSlop={12} style={{ width: 40, height: 40, justifyContent: "center", marginLeft: -6, marginBottom: paddingTop - 12 }}>
            <Icon name="chevronLeft" color="#ffffff" size={24} />
          </Pressable>
        ) : null}
        {children}
      </View>
      {arcade ? <ArcadeEdge fill={isl.paper} /> : null}
    </StageBackground>
    </View>
  );
}

/** small uppercase gold kicker of a hero */
export function HeroKicker({ children, style }: { children: ReactNode; style?: StyleProp<TextStyle> }) {
  return <Text style={[{ fontFamily: FONT.semibold, fontSize: 12, letterSpacing: 2.6, textTransform: "uppercase", color: stage.gold }, style]}>{children}</Text>;
}
/** the hero headline (font-display, white) */
export function HeroTitle({ children, size = 40, style }: { children: ReactNode; size?: number; style?: StyleProp<TextStyle> }) {
  return <Text accessibilityRole="header" style={[{ fontFamily: FONT.display, fontSize: size, lineHeight: size * 1.06, letterSpacing: -size * 0.022, color: STAGE_TEXT, marginTop: 14 }, style]}>{children}</Text>;
}
/** the hero lead */
export function HeroLead({ children, style }: { children: ReactNode; style?: StyleProp<TextStyle> }) {
  return <Text style={[{ fontFamily: FONT.regular, fontSize: 17, lineHeight: 27.6, color: "rgba(255,255,255,0.75)", marginTop: 18 }, style]}>{children}</Text>;
}

/** a key fact as a small cartouche on the stage (.isl-fact) */
export function FactCartouche({ n, l, nSize = 22, style }: { n: string; l: string; nSize?: number; style?: StyleProp<ViewStyle> }) {
  return (
    <View style={[{ borderRadius: 12, borderWidth: 1, borderColor: stageGold(0.22), paddingHorizontal: 14, paddingTop: 14, paddingBottom: 12, overflow: "hidden" }, style]} accessible accessibilityLabel={`${n}, ${l}`}>
      <LinearGradient colors={["rgba(255,255,255,0.06)", "rgba(255,255,255,0.02)"]} style={abs} />
      <LinearGradient colors={["transparent", stageGold(0.9), "transparent"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={{ position: "absolute", top: 0, left: 18, right: 18, height: 1 }} />
      <Text style={{ fontFamily: FONT.display, fontSize: nSize, lineHeight: nSize * 1.2, color: STAGE_GOLD }}>{n}</Text>
      <Text style={{ fontFamily: FONT.regular, fontSize: 12.5, lineHeight: 17, color: "rgba(255,255,255,0.65)", marginTop: 6 }}>{l}</Text>
    </View>
  );
}

// ---------- marble and marble cards ----------
const VEINS: [string, number, number][] = [
  ["M0 210C180 150 360 300 610 248S1010 120 1190 205S1350 232 1400 210", 7.0, 0.033],
  ["M610 248C690 300 760 372 905 392S1060 430 1120 470", 4.9, 0.021],
  ["M0 655C230 712 430 560 700 622S1090 768 1400 655", 6.3, 0.03],
  ["M700 622C760 560 860 540 960 548", 4.2, 0.018],
  ["M0 880C300 860 520 930 760 900S1180 830 1400 880", 4.9, 0.021],
  ["M240 0C260 120 220 260 300 360S420 520 380 640", 3.5, 0.013],
  ["M1080 330C1150 420 1130 520 1210 600", 3.5, 0.015],
];
const VEIN_LINES: [number, number][] = [[1.0, 0.55], [0.7, 0.35], [0.9, 0.5], [0.6, 0.3], [0.7, 0.35], [0.5, 0.22], [0.5, 0.25]];

/** white marble (.isl-marble): ivory paper, a soft gold light in the corners and fine grey-gold veins at the top */
export function Marble({ children, style, veins = true }: { children: ReactNode; style?: StyleProp<ViewStyle>; veins?: boolean }) {
  const isl = useIsl();
  const id = useSvgId("m");
  const [w, setW] = useState(0);
  const H = 760;
  return (
    <View style={[{ backgroundColor: isl.paper }, style]} onLayout={(e) => setW(e.nativeEvent.layout.width)}>
      <LinearGradient colors={[isl.paper, isl.paper2]} style={abs} />
      {w ? (
        <Svg width={w} height={H} style={{ position: "absolute", top: 0, left: 0 }} viewBox={`${700 - w / 2} 0 ${w} ${H}`} pointerEvents="none">
          <Defs>
            <RadialGradient id={`${id}g`} gradientUnits="userSpaceOnUse" cx={700 + w / 2} cy={0} r={w * 0.9}>
              <Stop offset="0" stopColor={isl.goldSoft} stopOpacity={0.1} /><Stop offset="0.6" stopColor={isl.goldSoft} stopOpacity={0} />
            </RadialGradient>
          </Defs>
          <Rect x={700 - w / 2} y={0} width={w} height={H} fill={`url(#${id}g)`} />
          {veins ? (
            <G fill="none" stroke="#9c8a64" strokeLinecap="round" opacity={isl.dark ? 0.35 : 0.55}>
              {VEINS.map(([d, sw, so], i) => <Path key={`b${i}`} d={d} strokeWidth={sw} strokeOpacity={so} />)}
              {VEINS.map(([d], i) => <Path key={`l${i}`} d={d} strokeWidth={VEIN_LINES[i][0]} strokeOpacity={VEIN_LINES[i][1]} />)}
            </G>
          ) : null}
        </Svg>
      ) : null}
      {children}
    </View>
  );
}

/** a card cut from the same marble (.isl-card), optionally pressable (.isl-card-hover) */
export function IslCard({ children, style, onPress, accessibilityLabel, highlight, radius = 14, fill }: { children: ReactNode; style?: StyleProp<ViewStyle>; onPress?: () => void; accessibilityLabel?: string; highlight?: boolean; radius?: number; fill?: boolean }) {
  const isl = useIsl();
  const frame = (pressed: boolean): StyleProp<ViewStyle> => [{
    borderRadius: radius, borderWidth: 1, borderColor: pressed || highlight ? isl.a("goldSoft", 0.65) : isl.a("goldSoft", 0.32), overflow: "hidden",
  }, fill ? { flex: 1 } : null, style];
  const inner = (
    <>
      <LinearGradient pointerEvents="none" colors={isl.dark ? ["rgba(255,255,255,0.05)", "rgba(255,255,255,0.025)"] : ["rgba(255,255,255,0.75)", "rgba(255,255,255,0.45)"]} style={abs} />
      {isl.dark ? null : <View pointerEvents="none" style={{ position: "absolute", top: 0, left: 0, right: 0, height: 1, backgroundColor: "rgba(255,255,255,0.8)" }} />}
      {children}
    </>
  );
  const shadow: ViewStyle = { borderRadius: radius, shadowColor: isl.dark ? "#000" : "rgb(80,60,20)", shadowOpacity: isl.dark ? 0.5 : 0.16, shadowRadius: 16, shadowOffset: { width: 0, height: 12 }, flex: fill ? 1 : undefined };
  if (!onPress) return <View style={shadow}><View style={frame(false)}>{inner}</View></View>;
  return (
    <Pressable onPress={onPress} accessibilityRole="link" accessibilityLabel={accessibilityLabel} style={({ pressed }) => [shadow, { transform: [{ scale: pressed ? 0.985 : 1 }] }]}>
      {({ pressed }) => <View style={frame(pressed)}>{inner}</View>}
    </Pressable>
  );
}

/** a heading in the display face on the marble */
export function IslH2({ children, size = 30, style }: { children: ReactNode; size?: number; style?: StyleProp<TextStyle> }) {
  const isl = useIsl();
  return <Text accessibilityRole="header" style={[{ fontFamily: FONT.display, fontSize: size, lineHeight: size * 1.15, letterSpacing: -size * 0.02, color: isl.ink }, style]}>{children}</Text>;
}

/** a verse reference as a gold chip that opens the verse in the reader (.isl-ref) */
export function RefChip({ label, onPress, onStage, size = 12.5 }: { label: string; onPress?: () => void; onStage?: boolean; size?: number }) {
  const isl = useIsl();
  const color = onStage ? STAGE_GOLD : isl.gold;
  const body = (pressed: boolean) => (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 4, paddingLeft: 7, paddingRight: 9, paddingVertical: 2, borderRadius: 999, borderWidth: 1,
      borderColor: onStage ? stageGold(0.4) : isl.a("goldSoft", 0.45), backgroundColor: pressed ? (onStage ? stageGold(0.25) : isl.a("goldSoft", 0.3)) : onStage ? stageGold(0.1) : isl.a("goldSoft", 0.12) }}>
      <StarMark size={size * 0.95} color={color} center={onStage ? stage.bg : isl.paper} />
      <Text allowFontScaling={false} style={{ fontFamily: FONT.bold, fontSize: size, lineHeight: size * 1.5, color, fontVariant: ["tabular-nums"] }}>{label}</Text>
    </View>
  );
  if (!onPress) return body(false);
  return <Pressable onPress={onPress} accessibilityRole="link" accessibilityLabel={label} hitSlop={4}>{({ pressed }) => body(pressed)}</Pressable>;
}


/** the illuminated frame of a panel (.illum-frame): a fine gold line and a band of small stars inside it */
export function IllumFrame({ opacity = 0.6 }: { opacity?: number }) {
  const id = useSvgId("if");
  const [s, setS] = useState({ w: 0, h: 0 });
  const rr = (x: number, y: number, w: number, h: number, r: number) => `M${x + r} ${y}H${x + w - r}Q${x + w} ${y} ${x + w} ${y + r}V${y + h - r}Q${x + w} ${y + h} ${x + w - r} ${y + h}H${x + r}Q${x} ${y + h} ${x} ${y + h - r}V${y + r}Q${x} ${y} ${x + r} ${y}Z`;
  return (
    <View pointerEvents="none" style={[abs, { opacity }]} onLayout={(e) => setS({ w: e.nativeEvent.layout.width, h: e.nativeEvent.layout.height })}>
      {s.w ? (
        <Svg width={s.w} height={s.h}>
          <Defs>
            <Pattern id={`${id}p`} width={14} height={14} patternUnits="userSpaceOnUse">
              <Path d="M7 1.5l1.3 3.2 3.2 1.3-3.2 1.3L7 10.5 5.7 7.3 2.5 6l3.2-1.3z" fill="#c9a65e" fillOpacity={0.55} />
            </Pattern>
          </Defs>
          <Path d={rr(7, 7, s.w - 14, s.h - 14, 12)} fill="none" stroke="rgb(201,166,94)" strokeOpacity={0.45} strokeWidth={1} />
          <Path d={`${rr(12, 12, s.w - 24, s.h - 24, 9)}${rr(19, 19, s.w - 38, s.h - 38, 4)}`} fill={`url(#${id}p)`} fillRule="evenodd" />
          <Path d={rr(12.5, 12.5, s.w - 25, s.h - 25, 9)} fill="none" stroke="rgb(201,166,94)" strokeOpacity={0.5} strokeWidth={1} />
        </Svg>
      ) : null}
    </View>
  );
}
