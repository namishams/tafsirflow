import { type ReactNode } from "react";
import { Animated, StyleSheet, Text, View, type StyleProp, type ViewStyle } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Svg, { Circle, Defs, G, LinearGradient as SvgLinear, Mask, Path, Pattern, RadialGradient, Rect, Stop } from "react-native-svg";
import { CALLIG_FONT, FONT, R, useTheme } from "@/lib/theme";
import { turn, useLoop, useSpin } from "./motion";

// The ornaments of the website's Quran pages (src/components/art/QuranArt.tsx, styles/art-quran.css), drawn natively:
// the reciter orb of the radio, the emerald seal with a reciter's initials, the khatm progress ring, the shamsa
// medallion, the gold "callout" panel and the arcade of pointed arches. Shared by the radio, reciter and khatm screens.

/** colours of styles/art-quran.css (marble, ink gold, emerald), light and dark */
export function useQ() {
  const t = useTheme();
  return t.dark
    ? { inkGold: "rgb(222,190,124)", tile: "rgb(14,35,28)", marbleA: "rgb(14,42,33)", marbleB: "rgb(8,28,22)", emeraldA: "rgb(13,68,52)", emeraldB: "rgb(6,36,27)", hairGold: "rgba(201,166,94,0.24)" }
    : { inkGold: "rgb(128,96,38)", tile: "rgb(255,255,255)", marbleA: "rgb(252,249,241)", marbleB: "rgb(244,236,218)", emeraldA: "rgb(13,68,52)", emeraldB: "rgb(6,36,27)", hairGold: "rgba(201,166,94,0.24)" };
}

const GOLD = "rgb(214,180,108)";

// ---------- geometry (QuranArt.tsx) ----------
const pt = (r: number, deg: number, cx = 0, cy = 0) => { const a = (deg * Math.PI) / 180; return `${(cx + r * Math.cos(a)).toFixed(2)},${(cy + r * Math.sin(a)).toFixed(2)}`; };
// khatam: union of two squares (16 vertices)
const octagram = (a: number, cx: number, cy: number) => `M${Array.from({ length: 16 }, (_, i) => pt(i % 2 ? a / Math.cos(Math.PI / 8) : a * Math.SQRT2, i * 22.5 - 90, cx, cy)).join("L")}Z`;
const RAYS = Array.from({ length: 72 }, (_, i) => { const d = i * 5; const long = i % 2 === 0; return `M${pt(172, d, 200, 200)}L${pt(long ? 194 : 183, d, 200, 200)}`; }).join("");
const DOTS = Array.from({ length: 24 }, (_, i) => pt(199, i * 15 + 2.5, 200, 200).split(",").map(Number));
const LOBES = (() => {
  const n = 16, span = 360 / n; let d = "";
  for (let i = 0; i < n; i++) {
    const a0 = i * span - 90, a1 = a0 + span, m = a0 + span / 2;
    d += `${i ? "L" : "M"}${pt(110, a0, 200, 200)}Q${pt(124, a0 + span * 0.12, 200, 200)} ${pt(130, m, 200, 200)}Q${pt(124, a1 - span * 0.12, 200, 200)} ${pt(110, a1, 200, 200)}`;
  }
  return d + "Z";
})();
const BIG_STAR = octagram(70, 200, 200);
const SEAL = octagram(17.5, 30, 30);
const RING_STAR = octagram(30, 60, 60);
const TICKS = Array.from({ length: 32 }, (_, i) => `M${pt(i % 4 ? 49 : 47, i * 11.25 - 90, 60, 60)}L${pt(51, i * 11.25 - 90, 60, 60)}`).join("");

const Layer = ({ children, rotate, size }: { children: ReactNode; rotate?: Animated.AnimatedInterpolation<string>; size: number }) => (
  <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, rotate ? { transform: [{ rotate }] } : null]}>
    <Svg width={size} height={size} viewBox="0 0 400 400">{children}</Svg>
  </Animated.View>
);

/** radio orb (QuranOrb): the shamsa's rays and scalloped band around an emerald disc; it turns while on air */
export function QuranOrb({ on, size, children, reduce }: { on: boolean; size: number; children?: ReactNode; reduce?: boolean }) {
  const run = on && !reduce;
  const rays = useSpin(run, 90_000), lobes = useSpin(run, 140_000), star = useSpin(run, 50_000);
  return (
    <View style={{ width: size, height: size, alignItems: "center", justifyContent: "center" }} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      <Layer size={size} rotate={turn(rays)}>
        <Path d={RAYS} stroke={GOLD} strokeOpacity={0.55} strokeWidth={1.2} fill="none" />
        {DOTS.map(([x, y], i) => <Circle key={i} cx={x} cy={y} r={2} fill={GOLD} fillOpacity={0.55} />)}
      </Layer>
      <Layer size={size}><Circle cx={200} cy={200} r={160} stroke={GOLD} strokeOpacity={0.55} strokeWidth={1} strokeDasharray="1.5 5" fill="none" /></Layer>
      <Layer size={size} rotate={turn(lobes, -1)}><Path d={LOBES} fill={GOLD} fillOpacity={0.1} stroke={GOLD} strokeOpacity={0.75} strokeWidth={1} /></Layer>
      <Layer size={size}>
        <Defs>
          <RadialGradient id="qo-disc" cx="50%" cy="35%" r="72%"><Stop offset="0" stopColor="#16614a" /><Stop offset="0.6" stopColor="#0a3427" /><Stop offset="1" stopColor="#04190f" /></RadialGradient>
          <SvgLinear id="qo-gold" x1="0" y1="0" x2="1" y2="1"><Stop offset="0" stopColor="#f6e7bf" /><Stop offset="0.45" stopColor="#d9b56c" /><Stop offset="0.7" stopColor="#f3e2b6" /><Stop offset="1" stopColor="#b98f45" /></SvgLinear>
        </Defs>
        <Circle cx={200} cy={200} r={106} fill="url(#qo-disc)" stroke="url(#qo-gold)" strokeWidth={2.5} />
        <Circle cx={200} cy={200} r={98} fill="none" stroke="#e9cf99" strokeOpacity={0.4} strokeWidth={0.9} strokeDasharray="1 3.5" />
      </Layer>
      <Layer size={size} rotate={turn(star)}><Path d={BIG_STAR} fill="none" stroke="#e9cf99" strokeOpacity={0.22} strokeWidth={1.2} /></Layer>
      {children}
    </View>
  );
}

function PulseRing({ inset, delay, on }: { inset: number; delay: number; on: boolean }) {
  const v = useLoop(on, 3600, delay);
  const style = on
    ? { opacity: v.interpolate({ inputRange: [0, 1], outputRange: [0.7, 0] }), transform: [{ scale: v.interpolate({ inputRange: [0, 1], outputRange: [0.85, 1.12] }) }] }
    : { opacity: 0.25 };
  return <Animated.View pointerEvents="none" style={[{ position: "absolute", top: inset, left: inset, right: inset, bottom: inset, borderRadius: 9999, borderWidth: 1, borderColor: "rgba(214,180,108,0.35)" }, style]} />;
}

function Bar({ i, on }: { i: number; on: boolean }) {
  // calm equaliser: slower than the website's 1 s, soft sine, staggered like the CSS nth-child delays
  const v = useLoop(on, 1700, (i % 2 ? 350 : 0) + (i % 3 === 2 ? 700 : 0) + i * 60);
  const scaleY = on ? v.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0.25, 1, 0.25] }) : 0.34;
  const translateY = on ? v.interpolate({ inputRange: [0, 0.5, 1], outputRange: [6.75, 0, 6.75] }) : 5.94;
  return <Animated.View style={{ width: 4, height: 18, borderRadius: 2, backgroundColor: GOLD, transform: [{ translateY }, { scaleY }] }} />;
}

/** .radio-orb: the orb with three pulsing rings and gold bars that move while the station is on air */
export function RadioOrb({ on, size, label, reduce }: { on: boolean; size: number; label: string; reduce: boolean }) {
  const live = on && !reduce;
  return (
    <View style={{ width: size, height: size, alignItems: "center", justifyContent: "center" }} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      <PulseRing inset={size * 0.12} delay={0} on={live} />
      <PulseRing inset={size * 0.04} delay={1200} on={live} />
      <PulseRing inset={-size * 0.04} delay={2400} on={live} />
      <QuranOrb on={on} size={size} reduce={reduce}>
        <Text allowFontScaling={false} numberOfLines={1}
          style={{ fontFamily: FONT.display, fontSize: size * 0.17, letterSpacing: size * 0.003, color: "#f0dca8", paddingBottom: size * 0.03, textShadowColor: "rgba(0,0,0,0.35)", textShadowRadius: 18, textShadowOffset: { width: 0, height: 2 } }}>{label}</Text>
      </QuranOrb>
      <View style={{ position: "absolute", bottom: size * 0.19, height: 18, flexDirection: "row", alignItems: "flex-end", gap: 4 }}>
        {Array.from({ length: 7 }, (_, i) => <Bar key={i} i={i} on={live} />)}
      </View>
    </View>
  );
}

/** emerald seal in the shape of an eight-pointed star with a gold rim, for a reciter's initials */
export function QuranSeal({ children, size = 60, on = false, locked }: { children: ReactNode; size?: number; on?: boolean; locked?: boolean }) {
  return (
    <View style={{ width: size, height: size, alignItems: "center", justifyContent: "center" }}>
      <Svg width={size} height={size} viewBox="0 0 60 60" style={StyleSheet.absoluteFill}>
        <Circle cx={30} cy={30} r={28.5} fill="none" stroke={on ? GOLD : "rgba(201,166,94,0.45)"} strokeWidth={1} strokeDasharray={on ? undefined : "0.8 3.2"} strokeLinecap="round" />
        <G transform={on ? "rotate(45 30 30)" : undefined}><Path d={SEAL} fill="rgb(13,68,52)" stroke="#d9b56c" strokeWidth={1.2} strokeLinejoin="round" /></G>
        <Circle cx={30} cy={30} r={15.5} fill="none" stroke="rgba(233,207,153,0.35)" strokeWidth={0.7} strokeDasharray="1 2.2" />
      </Svg>
      <Text allowFontScaling={false} numberOfLines={1} style={{ fontFamily: FONT.display, fontSize: size * 0.25, letterSpacing: 0.3, color: "#f0dca8" }}>{children}</Text>
      {locked ? (
        <View style={{ position: "absolute", right: -2, bottom: -2, width: 20, height: 20, borderRadius: 10, backgroundColor: "rgb(8,38,29)", borderWidth: 1, borderColor: "rgba(214,180,108,0.6)", alignItems: "center", justifyContent: "center" }}>
          <Svg width={11} height={11} viewBox="0 0 24 24" fill="none" stroke={GOLD} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><Rect x="5" y="10.5" width="14" height="9.5" rx="2" /><Path d="M8 10.5V8a4 4 0 0 1 8 0v2.5" /></Svg>
        </View>
      ) : null}
    </View>
  );
}

/** large gold progress ring around an eight-pointed star (khatm) */
export function QuranRing({ pct, size, children }: { pct: number; size: number; children?: ReactNode }) {
  const p = Math.max(0, Math.min(100, pct));
  const c = 2 * Math.PI * 56;
  return (
    <View style={{ width: size, height: size, alignItems: "center", justifyContent: "center" }} accessibilityRole="progressbar" accessibilityValue={{ min: 0, max: 100, now: Math.round(p) }}>
      <Svg width={size} height={size} viewBox="0 0 120 120" style={StyleSheet.absoluteFill}>
        <Defs><SvgLinear id="qr-gold" x1="0" y1="0" x2="1" y2="1"><Stop offset="0" stopColor="#e9cf99" /><Stop offset="0.5" stopColor="#c9a65e" /><Stop offset="1" stopColor="#a8803a" /></SvgLinear></Defs>
        <Path d={RING_STAR} fill="rgba(201,166,94,0.07)" stroke="rgba(201,166,94,0.35)" strokeWidth={0.8} />
        <Path d={TICKS} fill="none" stroke="rgb(201,166,94)" strokeOpacity={0.5} strokeWidth={0.8} />
        <Circle cx={60} cy={60} r={56} fill="none" stroke="rgba(201,166,94,0.22)" strokeWidth={3} />
        {p > 0 ? <Circle cx={60} cy={60} r={56} fill="none" stroke="url(#qr-gold)" strokeWidth={4} strokeLinecap="round" strokeDasharray={`${(Math.max(p, 1.5) / 100) * c} ${c}`} transform="rotate(-90 60 60)" /> : null}
      </Svg>
      <View style={{ alignItems: "center" }}>{children}</View>
    </View>
  );
}

/** the shamsa medallion of the khatm page (QuranShamsa): turning rays, scalloped band, emerald disc, gold calligraphy */
export function QuranShamsa({ lines, size, reduce }: { lines: readonly [string, string]; size: number; reduce: boolean }) {
  const t = useTheme();
  const rays = useSpin(!reduce, 220_000), star = useSpin(!reduce, 90_000);
  const glow = t.dark ? "rgba(214,180,108,0.22)" : "rgba(255,226,160,0.55)";
  const line = t.dark ? "rgb(214,180,108)" : "rgb(150,116,52)";
  return (
    <View style={{ width: size, height: size }} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      <Layer size={size}>
        <Defs><RadialGradient id="qs-glow" cx="50%" cy="50%" r="50%"><Stop offset="0" stopColor={glow} /><Stop offset="0.68" stopColor={glow} stopOpacity={0} /></RadialGradient></Defs>
        <Circle cx={200} cy={200} r={176} fill="url(#qs-glow)" />
      </Layer>
      <Layer size={size} rotate={turn(rays)}>
        <Path d={RAYS} stroke={line} strokeOpacity={0.55} strokeWidth={1} fill="none" />
        {DOTS.map(([x, y], i) => <Circle key={i} cx={x} cy={y} r={1.7} fill={line} fillOpacity={0.55} />)}
      </Layer>
      <Layer size={size}>
        <Defs>
          <RadialGradient id="qs-disc" cx="50%" cy="38%" r="70%"><Stop offset="0" stopColor="#135640" /><Stop offset="0.6" stopColor="#0a3427" /><Stop offset="1" stopColor="#05211a" /></RadialGradient>
          <SvgLinear id="qs-gold" x1="0" y1="0" x2="1" y2="1"><Stop offset="0" stopColor="#f6e7bf" /><Stop offset="0.42" stopColor="#d9b56c" /><Stop offset="0.7" stopColor="#f3e2b6" /><Stop offset="1" stopColor="#b98f45" /></SvgLinear>
          <Pattern id="qs-girih" width={28} height={28} patternUnits="userSpaceOnUse"><Path d="M7 7h14v14H7zM14 2.5L25.5 14 14 25.5 2.5 14z" fill="none" stroke="#e9cf99" strokeOpacity={0.12} strokeWidth={0.8} /></Pattern>
        </Defs>
        <Circle cx={200} cy={200} r={168} fill="none" stroke={line} strokeOpacity={0.55} strokeWidth={1.3} />
        <Circle cx={200} cy={200} r={163} fill="none" stroke={line} strokeOpacity={0.55} strokeWidth={0.6} strokeDasharray="1.5 4" />
        <Circle cx={200} cy={200} r={144} fill="none" stroke={line} strokeOpacity={0.3} strokeWidth={0.6} strokeDasharray="0.6 5" />
        <Circle cx={200} cy={200} r={134} fill="none" stroke={line} strokeOpacity={0.55} strokeWidth={1} />
        <Path d={LOBES} fill={line} fillOpacity={0.1} stroke={line} strokeOpacity={0.7} strokeWidth={1} />
        <Circle cx={200} cy={200} r={106} fill="url(#qs-disc)" stroke="url(#qs-gold)" strokeWidth={2} />
        <Circle cx={200} cy={200} r={106} fill="url(#qs-girih)" />
        <Circle cx={200} cy={200} r={99} fill="none" stroke="#e9cf99" strokeOpacity={0.45} strokeWidth={0.8} strokeDasharray="1 3" />
        <Path d="M200 116l3 7.2 7.2 3-7.2 3-3 7.2-3-7.2-7.2-3 7.2-3z" fill="url(#qs-gold)" opacity={0.85} />
      </Layer>
      <Layer size={size} rotate={turn(star)}><Path d={BIG_STAR} fill="none" stroke="#e9cf99" strokeOpacity={0.2} strokeWidth={1} /></Layer>
      {/* the words are set as text (not SVG) so the Arabic letters join correctly on every device */}
      <View style={[StyleSheet.absoluteFill, { alignItems: "center", justifyContent: "center", paddingTop: size * 0.07 }]} pointerEvents="none">
        <Text allowFontScaling={false} style={{ fontFamily: CALLIG_FONT, fontSize: size * 0.15, lineHeight: size * 0.22, color: "#e9cf99", writingDirection: "rtl", textAlign: "center" }}>{lines[0]}</Text>
        <Text allowFontScaling={false} style={{ fontFamily: CALLIG_FONT, fontSize: size * 0.09, lineHeight: size * 0.13, color: "#e9cf99", writingDirection: "rtl", textAlign: "center" }}>{lines[1]}</Text>
      </View>
    </View>
  );
}

/** .callout: surface with a gold border, a gold wash from the top and a gold hairline on the top edge */
export function Callout({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  const t = useTheme();
  const gold = t.dark ? "214,178,106" : "150,116,52";
  return (
    <View style={[{ borderRadius: R.card, borderWidth: 1, borderColor: `rgba(${gold},0.28)`, backgroundColor: t.surface, padding: 20 }, style]}>
      <LinearGradient pointerEvents="none" colors={[`rgba(${gold},0.07)`, `rgba(${gold},0)`]} locations={[0, 0.7]} style={[StyleSheet.absoluteFill, { borderRadius: R.card }]} />
      <LinearGradient pointerEvents="none" colors={[`rgba(${gold},0)`, `rgba(${gold},0.95)`, `rgba(${gold},0)`]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={{ position: "absolute", top: -1, left: 22, right: 22, height: 1 }} />
      {children}
    </View>
  );
}

/** .q-kicker: small uppercase label in ink gold */
export function Kicker({ children, color, style }: { children: ReactNode; color?: string; style?: StyleProp<import("react-native").TextStyle> }) {
  const q = useQ();
  return <Text style={[{ fontFamily: FONT.semibold, fontSize: 11.5, letterSpacing: 2, textTransform: "uppercase", color: color ?? q.inkGold }, style]}>{children}</Text>;
}

/** .q-arcade: pointed arches along the lower edge of a light hero, fading out at both ends */
export function QArcade({ opacity = 1 }: { opacity?: number }) {
  return (
    <View pointerEvents="none" style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 34, opacity }}>
      <Svg width="100%" height={34}>
        <Defs>
          <Pattern id="q-arc" width={56} height={34} patternUnits="userSpaceOnUse">
            <G fill="none" stroke="#b08a3e" strokeWidth={1}>
              <Path d="M2 34V17C2 8 14 3 28 1c14 2 26 7 26 16v17" strokeOpacity={0.55} />
              <Path d="M8 34V18c0-6 9-10 20-12 11 2 20 6 20 12v16" strokeOpacity={0.25} />
            </G>
            <Circle cx={28} cy={16} r={1.6} fill="#b08a3e" fillOpacity={0.45} />
          </Pattern>
          <SvgLinear id="q-arc-fade" x1="0" y1="0" x2="1" y2="0">
            <Stop offset="0" stopColor="#fff" stopOpacity={0} /><Stop offset="0.18" stopColor="#fff" stopOpacity={1} />
            <Stop offset="0.82" stopColor="#fff" stopOpacity={1} /><Stop offset="1" stopColor="#fff" stopOpacity={0} />
          </SvgLinear>
          <Mask id="q-arc-mask"><Rect width="100%" height={34} fill="url(#q-arc-fade)" /></Mask>
        </Defs>
        <Rect width="100%" height={34} fill="url(#q-arc)" mask="url(#q-arc-mask)" />
      </Svg>
    </View>
  );
}

/** a pill like .q-pill (styles of a reciter); `play` = the emerald "listen" pill */
export function Pill({ label, play, locked }: { label: string; play?: boolean; locked?: boolean }) {
  const t = useTheme();
  if (play) {
    return (
      <LinearGradient colors={["rgb(13,68,52)", "rgb(6,36,27)"]} style={{ flexDirection: "row", alignItems: "center", gap: 5, height: 24, paddingHorizontal: 9, borderRadius: R.pill, borderWidth: 1, borderColor: "rgba(214,180,108,0.45)" }}>
        <Svg width={12} height={12} viewBox="0 0 24 24">{locked ? <G fill="none" stroke="#f3e2b6" strokeWidth={2} strokeLinecap="round"><Rect x="5" y="10.5" width="14" height="9.5" rx="2" /><Path d="M8 10.5V8a4 4 0 0 1 8 0v2.5" /></G> : <Path d="M8 5.5v13l10.5-6.5z" fill="#f3e2b6" />}</Svg>
        <Text style={{ fontFamily: FONT.semibold, fontSize: 11.5, color: "#f3e2b6" }}>{label}</Text>
      </LinearGradient>
    );
  }
  return (
    <View style={{ height: 24, paddingHorizontal: 9, borderRadius: R.pill, borderWidth: 1, borderColor: "rgba(201,166,94,0.35)", justifyContent: "center" }}>
      <Text style={{ fontFamily: FONT.semibold, fontSize: 11.5, color: t.muted }}>{label}</Text>
    </View>
  );
}

/** small eight-pointed star used as a list bullet (.q-known li::before) */
export function StarBullet({ size = 10, color = GOLD }: { size?: number; color?: string }) {
  return <Svg width={size} height={size} viewBox="0 0 10 10"><Path d="M5 0L6.2 3.8 10 5 6.2 6.2 5 10 3.8 6.2 0 5 3.8 3.8Z" fill={color} /></Svg>;
}
