import { useState, type ReactNode } from "react";
import { Animated, StyleSheet, Text, View, type StyleProp, type ViewStyle } from "react-native";
import Svg, { Circle, Defs, G, Path, Pattern } from "react-native-svg";
import { CALLIG_FONT, stage } from "@/lib/theme";
import { turn, useLoop, useSpin } from "@/features/radio/motion";

// The ornaments of the website's surah page (components/Ornaments.tsx, globals.css): corner rosettes, margin medallions,
// the surah cartouche, the illuminated double frame, the gold corner brackets of the active verse, the turning rosette
// around the play button and the small equaliser.
const GOLD = stage.gold; // rgb(214,180,108) – the gold on the stage
const pts = (n: number, r1: number, r2: number, c: number) =>
  Array.from({ length: n }, (_, i) => { const a = ((Math.PI * 2) / n) * i - Math.PI / 2, r = i % 2 ? r2 : r1; return `${(c + r * Math.cos(a)).toFixed(2)},${(c + r * Math.sin(a)).toFixed(2)}`; });

/** Rosette: sixteen-pointed star with a ring and a small star inside */
export function Rosette({ size = 26, color = GOLD, style }: { size?: number; color?: string; style?: StyleProp<ViewStyle> }) {
  return (
    <View style={style} pointerEvents="none">
      <Svg width={size} height={size} viewBox="0 0 32 32">
        <Path d={`M${pts(32, 14, 9, 16).join("L")}Z`} fill={color} fillOpacity={0.18} stroke={color} strokeWidth={0.8} />
        <Circle cx={16} cy={16} r={6.5} fill="none" stroke={color} strokeWidth={0.8} />
        <Path d="M16 11.5l1.4 3.1 3.1 1.4-3.1 1.4-1.4 3.1-1.4-3.1-3.1-1.4 3.1-1.4z" fill={color} />
      </Svg>
    </View>
  );
}

/** margin medallion (like the hizb markers beside the text of a mushaf): a rosette with a petal pointing outwards */
export function Medallion({ width = 40, flip, color = GOLD }: { width?: number; flip?: boolean; color?: string }) {
  return (
    <View style={{ transform: flip ? [{ scaleX: -1 }] : undefined }} pointerEvents="none">
      <Svg width={width} height={(width * 40) / 64} viewBox="0 0 64 40">
        <G fill="none" stroke={color} strokeWidth={1}>
          <Path d="M24 6c-2 8-2 20 0 28C14 30 6 25 2 20 6 15 14 10 24 6z" fill={color} fillOpacity={0.12} />
          <Circle cx={40} cy={20} r={15} fill={color} fillOpacity={0.1} />
          <Circle cx={40} cy={20} r={11} strokeDasharray="1.2 2.2" />
          <Path d="M40 10l2.6 7.4L50 20l-7.4 2.6L40 30l-2.6-7.4L30 20l7.4-2.6z" fill={color} fillOpacity={0.55} />
          <Path d="M2 20h-2" />
        </G>
      </Svg>
    </View>
  );
}

/** the surah cartouche on the stage (SurahBanner dark): pointed ends with gold diamonds, girih inside */
export function Cartouche({ arabic }: { arabic: string }) {
  return (
    <View style={{ flex: 1, minWidth: 0, aspectRatio: 600 / 96, justifyContent: "center" }}>
      <Svg style={StyleSheet.absoluteFill} viewBox="0 0 600 96" preserveAspectRatio="none">
        <Defs>
          <Pattern id="sb-girih" width={24} height={24} patternUnits="userSpaceOnUse">
            <Path d="M6 6h12v12H6zM12 2.5l9.5 9.5L12 21.5 2.5 12z" fill="none" stroke={GOLD} strokeOpacity={0.22} strokeWidth={0.8} />
          </Pattern>
        </Defs>
        <Path d="M40 6H560L594 48 560 90H40L6 48Z" fill="url(#sb-girih)" />
        <Path d="M40 6H560L594 48 560 90H40L6 48Z" fill="none" stroke={GOLD} strokeWidth={2} />
        <Path d="M46 13H554L582 48 554 83H46L18 48Z" fill="rgb(5,28,21)" fillOpacity={0.72} stroke={GOLD} strokeWidth={1} />
        <G fill={GOLD} transform="translate(0 5)"><Path d="M6 48l-5-5 5-5 5 5zM594 48l-5-5 5-5 5 5z" /></G>
      </Svg>
      <Text allowFontScaling={false} numberOfLines={1} adjustsFontSizeToFit style={{ fontFamily: CALLIG_FONT, fontSize: 26, lineHeight: 40, paddingBottom: 2, paddingHorizontal: "9%", textAlign: "center", color: GOLD, writingDirection: "rtl" }}>{arabic}</Text>
    </View>
  );
}

/** .illum-frame: a gold hairline 7px inside the edge and, 12px inside, a 7px band of small gold stars between two hairlines */
const roundRect = (x: number, y: number, w: number, h: number, r: number) =>
  `M${x + r} ${y}H${x + w - r}A${r} ${r} 0 0 1 ${x + w} ${y + r}V${y + h - r}A${r} ${r} 0 0 1 ${x + w - r} ${y + h}H${x + r}A${r} ${r} 0 0 1 ${x} ${y + h - r}V${y + r}A${r} ${r} 0 0 1 ${x + r} ${y}Z`;
export function IllumFrame({ radius = 16 }: { radius?: number }) {
  const [box, setBox] = useState({ w: 0, h: 0 });
  const W = box.w - 24, H = box.h - 24, r = Math.max(2, radius - 7);
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill} onLayout={(e) => setBox({ w: e.nativeEvent.layout.width, h: e.nativeEvent.layout.height })}>
      <View style={{ position: "absolute", top: 7, left: 7, right: 7, bottom: 7, borderRadius: Math.max(0, radius - 4), borderWidth: 1, borderColor: "rgba(201,166,94,0.45)" }} />
      {W > 20 && H > 20 ? (
        <Svg width={W} height={H} style={{ position: "absolute", left: 12, top: 12 }}>
          <Defs>
            <Pattern id="illum-stars" width={14} height={14} patternUnits="userSpaceOnUse">
              <Path d="M7 1.5l1.3 3.2 3.2 1.3-3.2 1.3L7 10.5 5.7 7.3 2.5 6l3.2-1.3z" fill="#c9a65e" fillOpacity={0.55} />
            </Pattern>
          </Defs>
          <Path d={`${roundRect(0, 0, W, H, r)}${roundRect(7, 7, W - 14, H - 14, Math.max(1, r - 4))}`} fill="url(#illum-stars)" fillRule="evenodd" />
          <Path d={roundRect(0.5, 0.5, W - 1, H - 1, r)} fill="none" stroke="rgba(201,166,94,0.5)" strokeWidth={1} />
          <Path d={roundRect(7.5, 7.5, W - 15, H - 15, Math.max(1, r - 4))} fill="none" stroke="rgba(201,166,94,0.5)" strokeWidth={1} />
        </Svg>
      ) : null}
    </View>
  );
}

/** the four gold corner brackets of the active verse (.frame-corner) */
export function FrameCorners({ color = "rgba(201,166,94,0.7)", inset = 8, size = 14 }: { color?: string; inset?: number; size?: number }) {
  const c = { position: "absolute" as const, width: size, height: size, borderColor: color, borderRadius: 2 };
  return (
    <>
      <View pointerEvents="none" style={[c, { top: inset, left: inset, borderTopWidth: 1, borderLeftWidth: 1 }]} />
      <View pointerEvents="none" style={[c, { top: inset, right: inset, borderTopWidth: 1, borderRightWidth: 1 }]} />
      <View pointerEvents="none" style={[c, { bottom: inset, left: inset, borderBottomWidth: 1, borderLeftWidth: 1 }]} />
      <View pointerEvents="none" style={[c, { bottom: inset, right: inset, borderBottomWidth: 1, borderRightWidth: 1 }]} />
    </>
  );
}

/** the verse number in a star of two squares (the website's verse badge); filled with gold on the active verse */
export function VerseStar({ n, active, gold, surface, label }: { n: number; active: boolean; gold: string; surface: string; label: string }) {
  const sq = { position: "absolute" as const, top: 4, left: 4, right: 4, bottom: 4, borderRadius: 4, borderWidth: 1, borderColor: active ? withAlpha(gold, 0.7) : withAlpha(gold, 0.4), backgroundColor: active ? withAlpha(gold, 0.15) : surface };
  return (
    <View style={{ width: 36, height: 36, alignItems: "center", justifyContent: "center" }} accessible accessibilityLabel={label}>
      <View style={[sq, { transform: [{ rotate: "45deg" }] }]} />
      <View style={sq} />
      <Text allowFontScaling={false} style={{ fontFamily: "PlusJakartaSans_700Bold", fontSize: 12, color: gold }}>{n}</Text>
    </View>
  );
}
const withAlpha = (rgb: string, a: number) => rgb.replace(/^rgb\(([^)]+)\)$/, `rgba($1,${a})`);

/** the rosette around the play button: turns slowly while the recitation plays (static with reduced motion) */
export function PlayRosette({ on, reduce, size = 64, children }: { on: boolean; reduce: boolean; size?: number; children: ReactNode }) {
  const spin = useSpin(on && !reduce, 18_000);
  return (
    <View style={{ width: size, height: size, alignItems: "center", justifyContent: "center" }}>
      <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, { opacity: on ? 1 : 0.55, transform: [{ rotate: turn(spin) }] }]}>
        <Svg width={size} height={size} viewBox="0 0 64 64">
          <Path d={`M${pts(32, 31, 27, 32).join("L")}Z`} fill="none" stroke="rgb(201,166,94)" strokeWidth={1} strokeOpacity={0.7} />
        </Svg>
      </Animated.View>
      {children}
    </View>
  );
}

/** four small gold bars that move while the recitation plays (.eq) */
export function Eq({ on, color = "rgb(201,166,94)" }: { on: boolean; color?: string }) {
  return (
    <View style={{ flexDirection: "row", alignItems: "flex-end", gap: 2, height: 14 }} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      {[0, 1, 2, 3].map((i) => <EqBar key={i} i={i} on={on} color={color} />)}
    </View>
  );
}
function EqBar({ i, on, color }: { i: number; on: boolean; color: string }) {
  const v = useLoop(on, 1400, [0, 450, 900, 220][i]);
  const scaleY = on ? v.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0.28, 1, 0.28] }) : 0.28;
  const translateY = on ? v.interpolate({ inputRange: [0, 0.5, 1], outputRange: [5, 0, 5] }) : 5;
  return <Animated.View style={{ width: 2.5, height: 14, borderRadius: 1, backgroundColor: color, opacity: on ? 1 : 0.6, transform: [{ translateY }, { scaleY }] }} />;
}
