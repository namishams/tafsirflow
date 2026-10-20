import { useEffect, useRef, useState, type ReactNode } from "react";
import { Animated, Easing, Pressable, StyleSheet, Text, View, type LayoutChangeEvent, type StyleProp, type ViewStyle } from "react-native";
import Svg, { Circle, ClipPath, Defs, G, Line, LinearGradient as SvgLinear, Mask, Path, Pattern, RadialGradient, Rect, Stop } from "react-native-svg";
import { CALLIG_FONT, FONT, stage, useTheme, type Theme } from "@/lib/theme";
import { useReduceMotion, useTurn } from "./motion";

// The website's practice art (src/components/art/PracticeArt.tsx and art-practice.css), drawn natively: the arch
// window, the illuminated medallion for scores, numbers in an eight-pointed star, the arched gates of the learning
// path, the dashed gold rail, the illuminated frame of the stage card and the gentle rising stars of a result.

/** website --gold for the current canvas (light 150 116 52, dark 214 178 106); on the stage always 214 180 108 */
export const goldA = (t: Theme, a: number) => (t.dark ? `rgba(214,178,106,${a})` : `rgba(150,116,52,${a})`);
export const stageGoldA = (a: number) => `rgba(214,180,108,${a})`;
/** the fixed gold of answers and frames: rgb(201 166 94) */
export const solidGoldA = (a: number) => `rgba(201,166,94,${a})`;
export const ROSE = "rgb(190,84,104)";
export const roseA = (a: number) => `rgba(190,84,104,${a})`;

// a pointed arch between x0 and x1: springs at ySpring, apex at yApex, standing on yBase (PracticeArt.archPath)
export function archPath(x0: number, x1: number, yBase: number, ySpring: number, yApex: number) {
  const w = x1 - x0, mid = (x0 + x1) / 2, rise = ySpring - yApex;
  const f = (n: number) => n.toFixed(1);
  return `M${f(x0)} ${f(yBase)}V${f(ySpring)}C${f(x0)} ${f(ySpring - rise * 0.55)} ${f(mid - w * 0.22)} ${f(yApex + rise * 0.18)} ${f(mid)} ${f(yApex)}C${f(mid + w * 0.22)} ${f(yApex + rise * 0.18)} ${f(x1)} ${f(ySpring - rise * 0.55)} ${f(x1)} ${f(ySpring)}V${f(yBase)}`;
}

export function starPath(cx: number, cy: number, R: number, r: number, n = 8, rot = -Math.PI / 2) {
  const pts: string[] = [];
  for (let i = 0; i < n * 2; i++) { const a = (Math.PI / n) * i + rot, rad = i % 2 ? r : R; pts.push(`${(cx + rad * Math.cos(a)).toFixed(2)},${(cy + rad * Math.sin(a)).toFixed(2)}`); }
  return `M${pts.join("L")}Z`;
}

/** metallic gold, as on the medallions of the website */
function Metal({ id }: { id: string }) {
  return (
    <SvgLinear id={id} x1="0" y1="0" x2="1" y2="1">
      <Stop offset="0" stopColor="#f6e7bf" /><Stop offset="0.45" stopColor="#c9a65e" /><Stop offset="0.72" stopColor="#efe2bf" /><Stop offset="1" stopColor="#8f7238" />
    </SvgLinear>
  );
}

/** small gold star (bullets, stars of a lesson) */
export function PracticeStar({ size = 12, color, dim }: { size?: number; color?: string; dim?: boolean }) {
  const t = useTheme();
  return (
    <Svg width={size} height={size} viewBox="0 0 12 12" style={dim ? { opacity: 0.2 } : undefined}>
      <Path d="M6 .5l1.4 3.1L10.5 5 7.4 6.4 6 9.5 4.6 6.4 1.5 5l3.1-1.4z" fill={color ?? t.gold} />
    </Svg>
  );
}

/** a number inside an eight-pointed star (lesson numbers, steps); filled = passed */
export function PracticeStarNum({ n, size = 40, filled = false, onStage = false }: { n: ReactNode; size?: number; filled?: boolean; onStage?: boolean }) {
  const t = useTheme();
  const gold = onStage ? stage.gold : t.gold;
  const ga = (a: number) => (onStage ? stageGoldA(a) : goldA(t, a));
  return (
    <View style={{ width: size, height: size, alignItems: "center", justifyContent: "center" }}>
      <Svg width={size} height={size} viewBox="0 0 40 40" style={StyleSheet.absoluteFill}>
        <Path d={starPath(20, 20, 19.5, 15.2)} fill={filled ? "#d6b46c" : ga(0.08)} stroke={gold} strokeOpacity={filled ? 0 : 0.7} strokeWidth={1} />
        {!filled ? <Circle cx={20} cy={20} r={11.5} fill="none" stroke={gold} strokeOpacity={0.3} strokeWidth={0.7} /> : null}
      </Svg>
      <Text allowFontScaling={false} style={{ fontFamily: FONT.display, fontSize: size * 0.36, color: filled ? "rgb(8,38,29)" : gold, fontVariant: ["tabular-nums"] }}>{n}</Text>
    </View>
  );
}

/** illuminated medallion: gilded sixteen-point rosette, dark enamel disc, a gold ring that fills to pct */
export function PracticeMedallion({ pct, size = 140, children, turn = false, enter = false }: { pct?: number; size?: number; children?: ReactNode; turn?: boolean; enter?: boolean }) {
  const reduce = useReduceMotion();
  const C = 2 * Math.PI * 33;
  const p = pct === undefined ? null : Math.max(0, Math.min(1, pct));
  const spin = useTurn(turn, 80000);
  const fill = useRef(new Animated.Value(0)).current;
  const appear = useRef(new Animated.Value(enter ? 0 : 1)).current;
  const [shown, setShown] = useState(reduce || p === null ? p ?? 0 : 0);
  useEffect(() => {
    if (p === null) return;
    if (reduce) { setShown(p); return; }
    const id = fill.addListener(({ value }) => setShown(value));
    const a = Animated.timing(fill, { toValue: p, duration: 1400, easing: Easing.bezier(0.2, 0.7, 0.2, 1), useNativeDriver: false });
    a.start();
    return () => { a.stop(); fill.removeListener(id); };
  }, [p, reduce, fill]);
  useEffect(() => {
    if (!enter) return;
    if (reduce) { appear.setValue(1); return; }
    Animated.timing(appear, { toValue: 1, duration: 900, easing: Easing.bezier(0.2, 0.7, 0.2, 1), useNativeDriver: true }).start();
  }, [enter, reduce, appear]);
  return (
    <Animated.View style={{ width: size, height: size, alignItems: "center", justifyContent: "center", opacity: appear, transform: [{ scale: appear.interpolate({ inputRange: [0, 1], outputRange: [0.8, 1] }) }],
      shadowColor: "#000", shadowOpacity: 0.28, shadowRadius: 9, shadowOffset: { width: 0, height: 10 } }}>
      <Animated.View style={[StyleSheet.absoluteFill, { transform: [{ rotate: spin }] }]}>
        <Svg width={size} height={size} viewBox="0 0 100 100">
          <Defs><Metal id="pm-m" /></Defs>
          <Path d={starPath(50, 50, 49.5, 42, 16)} fill="url(#pm-m)" />
          <Path d={starPath(50, 50, 46, 40, 16, -Math.PI / 2 + Math.PI / 16)} fill="url(#pm-m)" opacity={0.7} />
        </Svg>
      </Animated.View>
      <Svg width={size} height={size} viewBox="0 0 100 100" style={StyleSheet.absoluteFill}>
        <Defs>
          <Metal id="pm-m" />
          <RadialGradient id="pm-e" cx="38%" cy="30%" r="80%"><Stop offset="0" stopColor="#14533f" /><Stop offset="1" stopColor="#06231a" /></RadialGradient>
        </Defs>
        <Circle cx={50} cy={50} r={38.5} fill="url(#pm-e)" stroke="#5c4519" strokeOpacity={0.55} />
        <Circle cx={50} cy={50} r={33} fill="none" stroke="#f3e2b6" strokeOpacity={0.16} strokeWidth={2.4} />
        {p !== null ? (
          <Circle cx={50} cy={50} r={33} fill="none" stroke="url(#pm-m)" strokeWidth={2.6} strokeLinecap="round"
            strokeDasharray={`${Math.max(0.01, shown * C).toFixed(2)} ${C.toFixed(1)}`} transform="rotate(-90 50 50)" />
        ) : null}
        <Circle cx={50} cy={50} r={28.5} fill="none" stroke="#f3e2b6" strokeOpacity={0.3} strokeWidth={0.6} strokeDasharray="1 2.4" />
        <Path d="M22 40a30 30 0 0 1 30-20" stroke="#fff" strokeOpacity={0.16} strokeWidth={3} fill="none" strokeLinecap="round" />
      </Svg>
      <View style={{ alignItems: "center", justifyContent: "center" }}>{children}</View>
    </Animated.View>
  );
}

/** text in the medallion: display face in pale gold */
export function MedalText({ children, size = 26, small }: { children: ReactNode; size?: number; small?: string }) {
  return (
    <Text allowFontScaling={false} style={{ fontFamily: FONT.display, fontSize: size, color: "#f3e2b6", fontVariant: ["tabular-nums"] }}>
      {children}{small ? <Text style={{ fontSize: size * 0.58, color: "rgba(243,226,182,0.6)" }}>{small}</Text> : null}
    </Text>
  );
}

/** the arch window: a gilded pointed arch with capitals, a lattice of stars inside, light from above, an optional
 *  lamp and a word at its foot. The word comes from the website modules (never typed here). */
export function PracticeWindow({ word, height = 220, lamp = false, opacity = 1, style }: { word?: string; height?: number; lamp?: boolean; opacity?: number; style?: StyleProp<ViewStyle> }) {
  const reduce = useReduceMotion();
  const breathe = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (reduce) return;
    const a = Animated.loop(Animated.sequence([
      Animated.timing(breathe, { toValue: 1, duration: 4500, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      Animated.timing(breathe, { toValue: 0, duration: 4500, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
    ]));
    a.start();
    return () => a.stop();
  }, [reduce, breathe]);
  const width = (height * 240) / 320;
  const outer = archPath(8, 232, 320, 128, 6), inner = archPath(20, 220, 320, 132, 22), clip = archPath(28, 212, 300, 135, 34);
  const fs = !word ? 0 : word.length <= 4 ? 62 : word.length <= 6 ? 50 : word.length <= 9 ? 40 : 32;
  const scale = height / 320;
  return (
    <View pointerEvents="none" style={[{ width, height, opacity }, style]} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      <Animated.View style={[StyleSheet.absoluteFill, { opacity: reduce ? 0.8 : breathe.interpolate({ inputRange: [0, 1], outputRange: [0.55, 1] }) }]}>
        <Svg width={width} height={height} viewBox="0 0 240 320">
          <Defs>
            <RadialGradient id="pw-l" cx="50%" cy="26%" r="68%">
              <Stop offset="0" stopColor="#fff4d6" stopOpacity={0.7} /><Stop offset="0.35" stopColor="#e9cf99" stopOpacity={0.28} /><Stop offset="1" stopColor="#e9cf99" stopOpacity={0} />
            </RadialGradient>
            <ClipPath id="pw-c"><Path d={`${clip}Z`} /></ClipPath>
          </Defs>
          <G clipPath="url(#pw-c)"><Rect x={0} y={0} width={240} height={320} fill="url(#pw-l)" /></G>
        </Svg>
      </Animated.View>
      <Svg width={width} height={height} viewBox="0 0 240 320" style={StyleSheet.absoluteFill}>
        <Defs>
          <Metal id="pw-m" />
          <Pattern id="pw-p" width={30} height={30} patternUnits="userSpaceOnUse">
            <G fill="none" stroke="#e9cf99" strokeWidth={0.7} strokeOpacity={0.36}>
              <Path d="M8 8h14v14H8z" /><Path d="M15 5.1L24.9 15 15 24.9 5.1 15z" /><Path d="M0 0l5 5M30 0l-5 5M0 30l5-5M30 30l-5-5" />
            </G>
          </Pattern>
          <Pattern id="pw-r" width={16} height={48} patternUnits="userSpaceOnUse">
            <Path d="M4 2v7M12 26v5" stroke="#fff1cc" strokeOpacity={0.45} strokeWidth={1} strokeLinecap="round" />
          </Pattern>
          <ClipPath id="pw-c2"><Path d={`${clip}Z`} /></ClipPath>
        </Defs>
        <Path d={`${inner}Z`} fill="rgba(255,255,255,0.035)" />
        <G clipPath="url(#pw-c2)">
          <Rect x={-20} y={0} width={280} height={320} fill="url(#pw-p)" />
          <Rect x={0} y={-48} width={240} height={380} fill="url(#pw-r)" />
        </G>
        <Path d={outer} fill="none" stroke="url(#pw-m)" strokeWidth={2} />
        <Path d={inner} fill="none" stroke="#d6b46c" strokeOpacity={0.55} strokeWidth={1} />
        <Path d={clip} fill="none" stroke="#d6b46c" strokeOpacity={0.25} strokeWidth={0.8} strokeDasharray="2 4" />
        <G fill="url(#pw-m)"><Rect x={3} y={124} width={22} height={5} rx={1} /><Rect x={215} y={124} width={22} height={5} rx={1} /></G>
        <Path d={starPath(120, 6, 7, 3)} fill="url(#pw-m)" />
        {lamp ? (
          <G>
            <Path d="M120 36v38" stroke="#d6b46c" strokeOpacity={0.6} strokeWidth={0.8} />
            <Circle cx={120} cy={92} r={22} fill="#ffe7a8" fillOpacity={0.14} />
            <Path d="M108 78h24l-3 6h-18zM111 84h18l-2 18c-.6 5-13.4 5-14 0z" fill="none" stroke="url(#pw-m)" strokeWidth={1.3} />
            <Path d="M120 88c3.4 3.2 3.4 8 0 10.6-3.4-2.6-3.4-7.4 0-10.6z" fill="#ffe7a8" fillOpacity={0.85} />
          </G>
        ) : null}
        {word ? (
          <G>
            <Path d="M44 300h152" stroke="#d6b46c" strokeOpacity={0.45} strokeWidth={0.8} />
            <Path d={starPath(120, 300, 5, 2.2)} fill="#d6b46c" />
          </G>
        ) : null}
      </Svg>
      {word ? (
        <Text allowFontScaling={false} numberOfLines={1}
          style={{ position: "absolute", left: 0, right: 0, bottom: (320 - 292) * scale, textAlign: "center", fontFamily: CALLIG_FONT, fontSize: fs * scale, lineHeight: fs * scale * 1.5, color: "#e3c88a", writingDirection: "rtl" }}>
          {word}
        </Text>
      ) : null}
    </View>
  );
}

// gentle celebration: a few small gold stars rise and fade behind a result (PracticeCelebrate)
const RISE: [number, number, number][] = [[8, 0, 1], [18, 0.5, 0.8], [27, 1.1, 1.2], [36, 0.2, 0.7], [46, 0.8, 1], [55, 1.4, 0.8], [63, 0.3, 1.3], [72, 1, 0.9], [81, 0.6, 1.1], [90, 1.2, 0.8], [14, 1.7, 0.9], [68, 1.8, 1]];
function RisingStar({ left, delay, scale }: { left: number; delay: number; scale: number }) {
  const v = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const a = Animated.timing(v, { toValue: 1, duration: 3600, delay: delay * 1000, easing: Easing.out(Easing.quad), useNativeDriver: true });
    a.start();
    return () => a.stop();
  }, [v, delay]);
  return (
    <Animated.View style={{
      position: "absolute", bottom: -12, left: `${left}%`, width: 10, height: 10,
      opacity: v.interpolate({ inputRange: [0, 0.15, 1], outputRange: [0, 1, 0] }),
      transform: [
        { translateY: v.interpolate({ inputRange: [0, 1], outputRange: [0, -260] }) },
        { scale: v.interpolate({ inputRange: [0, 1], outputRange: [0.5 * scale, 1.15 * scale] }) },
        { rotate: v.interpolate({ inputRange: [0, 1], outputRange: ["0deg", "140deg"] }) },
      ],
    }}>
      <Svg width={10} height={10} viewBox="0 0 12 12"><Path d="M6 .5l1.4 3.1L10.5 5 7.4 6.4 6 9.5 4.6 6.4 1.5 5l3.1-1.4z" fill="#d6b46c" /></Svg>
    </Animated.View>
  );
}
export function PracticeCelebrate() {
  const reduce = useReduceMotion();
  if (reduce) return null;
  return (
    <View pointerEvents="none" style={[StyleSheet.absoluteFill, { overflow: "hidden" }]} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      {RISE.map(([l, d, s]) => <RisingStar key={l} left={l} delay={d} scale={s} />)}
    </View>
  );
}

// ---------- arched shapes (pa-gate, pa-arch-soft, niche) ----------
/** outline of a box whose top is a half ellipse of height ry and whose lower corners are rounded by rb */
export function archBox(x: number, y: number, w: number, h: number, ry: number, rb: number) {
  const f = (n: number) => n.toFixed(2);
  ry = Math.max(0, Math.min(ry, h - rb));
  return `M${f(x)} ${f(y + h - rb)}V${f(y + ry)}A${f(w / 2)} ${f(ry)} 0 0 1 ${f(x + w / 2)} ${f(y)}A${f(w / 2)} ${f(ry)} 0 0 1 ${f(x + w)} ${f(y + ry)}V${f(y + h - rb)}Q${f(x + w)} ${f(y + h)} ${f(x + w - rb)} ${f(y + h)}H${f(x + rb)}Q${f(x)} ${f(y + h)} ${f(x)} ${f(y + h - rb)}Z`;
}

function useSize(): [{ w: number; h: number }, (e: LayoutChangeEvent) => void] {
  const [size, setSize] = useState({ w: 0, h: 0 });
  const onLayout = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    setSize((s) => (Math.abs(s.w - width) < 0.5 && Math.abs(s.h - height) < 0.5 ? s : { w: width, h: height }));
  };
  return [size, onLayout];
}

/** a gate of the learning path (pa-gate): arched top, gold hairline and an inner frame; current / done / locked */
export function Gate({ children, current, done, locked, onPress, accessibilityLabel, style }: {
  children: ReactNode; current?: boolean; done?: boolean; locked?: boolean; onPress?: () => void; accessibilityLabel?: string; style?: StyleProp<ViewStyle>;
}) {
  const t = useTheme();
  const [{ w, h }, onLayout] = useSize();
  // CSS: border-radius 999px 999px 14px 14px / 74px 74px 14px 14px, scaled down to the width of the gate
  const shape = (inset: number) => archBox(inset, inset, w - inset * 2, h - inset * 2, 74 * ((w - inset * 2) / 1998), Math.max(1, 14 * ((w - inset * 2) / 1998)));
  const body = (
    <View onLayout={onLayout} style={{ flexGrow: 1, minHeight: 184, opacity: locked ? 0.62 : 1 }}>
      {w > 0 ? (
        <Svg width={w + 8} height={h + 8} style={{ position: "absolute", left: -4, top: -4 }} pointerEvents="none">
          <Defs>
            <SvgLinear id="g-f" x1="0" y1="0" x2="0" y2="1">
              {done
                ? [<Stop key="a" offset="0" stopColor="rgb(201,166,94)" stopOpacity={0.16} />, <Stop key="b" offset="0.7" stopColor="rgb(201,166,94)" stopOpacity={0.04} />, <Stop key="c" offset="1" stopColor="rgb(201,166,94)" stopOpacity={0.04} />]
                : [<Stop key="a" offset="0" stopColor={t.gold} stopOpacity={0.07} />, <Stop key="b" offset="0.55" stopColor={t.gold} stopOpacity={0} />]}
            </SvgLinear>
          </Defs>
          <G transform="translate(4 4)">
            {current ? <Path d={shape(-1.5)} fill="none" stroke="rgb(201,166,94)" strokeOpacity={0.16} strokeWidth={3} /> : null}
            <Path d={shape(0.5)} fill={t.surface} />
            <Path d={shape(0.5)} fill="url(#g-f)" stroke={current ? "rgb(201,166,94)" : goldA(t, 0.3)} strokeWidth={1} />
            <Path d={shape(5)} fill="none" stroke={goldA(t, 0.16)} strokeWidth={1} />
          </G>
        </Svg>
      ) : null}
      {children}
    </View>
  );
  if (!onPress) return <View accessible={!!accessibilityLabel} accessibilityLabel={accessibilityLabel} style={style}>{body}</View>;
  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={accessibilityLabel}
      style={({ pressed }) => [current ? { shadowColor: "rgb(201,166,94)", shadowOpacity: 0.45, shadowRadius: 16, shadowOffset: { width: 0, height: 10 } } : null, { transform: [{ scale: pressed ? 0.985 : 1 }] }, style]}>
      {body}
    </Pressable>
  );
}

/** box with a soft arched top (pa-arch-soft: 50% 50% 12px 12px / 64px 64px 12px 12px) or a niche frame */
export function ArchSoft({ children, style, fill, stroke, strokeWidth = 1, ry = 64, rb = 12, niche }: {
  children?: ReactNode; style?: StyleProp<ViewStyle>; fill?: string; stroke?: string; strokeWidth?: number; ry?: number; rb?: number; niche?: string;
}) {
  const [{ w, h }, onLayout] = useSize();
  return (
    <View onLayout={onLayout} style={style}>
      {w > 0 ? (
        <Svg width={w} height={h} style={StyleSheet.absoluteFill} pointerEvents="none">
          <Path d={archBox(strokeWidth / 2, strokeWidth / 2, w - strokeWidth, h - strokeWidth, ry, rb)} fill={fill ?? "none"} stroke={stroke ?? "none"} strokeWidth={strokeWidth} />
          {niche ? <Path d={archBox(10, 10, w - 20, h - 20, (h - 20) * 0.22, 10)} fill="none" stroke={niche} strokeWidth={1} /> : null}
        </Svg>
      ) : null}
      {children}
    </View>
  );
}

/** the dashed gold rail that links the units of the path (pa-rail) */
export function Rail({ left, top = 56, bottom = -40 }: { left: number; top?: number; bottom?: number }) {
  const t = useTheme();
  return (
    <View pointerEvents="none" style={{ position: "absolute", left, top, bottom, width: 1 }}>
      <Svg width={1} height="100%"><Line x1={0.5} y1={0} x2={0.5} y2="100%" stroke={goldA(t, 0.55)} strokeWidth={1} strokeDasharray="6 6" /></Svg>
    </View>
  );
}

/** illuminated frame inside a stage card (globals.css .illum-frame): a gold rule and a band of small stars */
export function IllumFrame() {
  const [{ w, h }, onLayout] = useSize();
  return (
    <View pointerEvents="none" onLayout={onLayout} style={StyleSheet.absoluteFill}>
      {w > 0 ? (
        <Svg width={w} height={h}>
          <Defs>
            <Pattern id="if-p" width={14} height={14} patternUnits="userSpaceOnUse" x={12} y={12}>
              <Path d="M7 1.5l1.3 3.2 3.2 1.3-3.2 1.3L7 10.5 5.7 7.3 2.5 6l3.2-1.3z" fill="#c9a65e" fillOpacity={0.55} />
            </Pattern>
            <Mask id="if-m" x={0} y={0} width={w} height={h} maskUnits="userSpaceOnUse">
              <Rect x={12} y={12} width={w - 24} height={h - 24} rx={9} fill="#fff" />
              <Rect x={19} y={19} width={w - 38} height={h - 38} rx={3} fill="#000" />
            </Mask>
          </Defs>
          <Rect x={7.5} y={7.5} width={w - 15} height={h - 15} rx={12} fill="none" stroke="rgba(201,166,94,0.45)" strokeWidth={1} />
          <Rect x={12} y={12} width={w - 24} height={h - 24} rx={9} fill="url(#if-p)" mask="url(#if-m)" />
          <Rect x={12.5} y={12.5} width={w - 25} height={h - 25} rx={9} fill="none" stroke="rgba(201,166,94,0.5)" strokeWidth={1} />
        </Svg>
      ) : null}
    </View>
  );
}

/** the girih-like lattice of the website's .stage .girih (a quiet layer of stars and squares) */
export function Girih({ opacity = 0.13 }: { opacity?: number }) {
  return (
    <Svg style={StyleSheet.absoluteFill} pointerEvents="none">
      <Defs>
        <Pattern id="gh" width={96} height={96} patternUnits="userSpaceOnUse">
          <G fill="none" stroke="#d6b46c" strokeOpacity={opacity} strokeWidth={1}>
            {[[48, 48], [0, 0], [96, 0], [0, 96], [96, 96]].map(([x, y]) => (
              <G key={`${x}-${y}`} transform={`translate(${x} ${y})`}><Path d="M-22-22h44v44h-44z" /><Path d="M0-31L31 0 0 31-31 0z" /><Circle r={7} /></G>
            ))}
            <Path d="M48 0v17M48 79v17M0 48h17M79 48h17M22 22l4 4M74 22l-4 4M22 74l4-4M74 74l-4-4" />
          </G>
        </Pattern>
      </Defs>
      <Rect width="100%" height="100%" fill="url(#gh)" />
    </Svg>
  );
}
