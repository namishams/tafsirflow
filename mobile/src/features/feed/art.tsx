import { memo, useEffect, useRef } from "react";
import { Animated, Easing, StyleSheet, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Svg, { Circle, Defs, G, Path, Pattern, RadialGradient, Rect, Stop } from "react-native-svg";
import { StarLattice } from "@/components/brand";
import { QuranInlay } from "@/features/quran/art";
import { TONES, stage } from "@/lib/theme";

// The feed's backgrounds in the app's palette: the dark stage (brand.tsx) tinted per surah (or per story group), the
// eight-point-star lattice drifting very slowly, soft beams of light and the floral inlay of the Quran page
// (features/quran/art.tsx). With Reduce Motion, and on pages that are not visible, everything stands still.

const hash = (s: string) => { let h = 0; for (const ch of s) h = (h * 31 + ch.charCodeAt(0)) >>> 0; return h; };
/** one tint per surah ("2:255" and "2:286" share it) or per story group */
export function toneOf(key: string): [string, string] {
  const base = key.includes(":") && /^\d/.test(key) ? key.split(":")[0] : key;
  const h = hash(base);
  return h % 4 === 0 ? [stage.bg, stage.deep] : TONES[h % TONES.length];
}

// a girih-like tile: eight-pointed star in a square, the classic khatam pattern
const TILE = 96;
const STAR = (() => {
  const c = TILE / 2, r1 = 30, r2 = 13;
  return `M${Array.from({ length: 16 }, (_, i) => { const a = (i * Math.PI) / 8 - Math.PI / 2; const r = i % 2 ? r2 : r1; return `${(c + r * Math.cos(a)).toFixed(1)},${(c + r * Math.sin(a)).toFixed(1)}`; }).join("L")}Z`;
})();

function Drift({ width, height, animate }: { width: number; height: number; animate: boolean }) {
  const t = useRef(new Animated.Value(0)).current;
  const beam = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (!animate) { t.stopAnimation(); beam.stopAnimation(); return; }
    const a = Animated.loop(Animated.timing(t, { toValue: 1, duration: 60000, easing: Easing.linear, useNativeDriver: true }));
    const b = Animated.loop(Animated.sequence([
      Animated.timing(beam, { toValue: 1, duration: 9000, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      Animated.timing(beam, { toValue: 0, duration: 9000, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
    ]));
    a.start(); b.start();
    return () => { a.stop(); b.stop(); };
  }, [animate, t, beam]);
  const shift = t.interpolate({ inputRange: [0, 1], outputRange: [0, -TILE] });
  const beamX = beam.interpolate({ inputRange: [0, 1], outputRange: [-width * 0.15, width * 0.15] });
  const beamO = beam.interpolate({ inputRange: [0, 1], outputRange: [0.55, 1] });
  return (
    <>
      <Animated.View style={{ position: "absolute", left: 0, top: 0, width: width + TILE, height: height + TILE, transform: [{ translateX: shift }, { translateY: shift }] }}>
        <Svg width={width + TILE} height={height + TILE}>
          <Defs>
            <Pattern id="feed-girih" width={TILE} height={TILE} patternUnits="userSpaceOnUse">
              <G fill="none" stroke="rgb(214,180,108)" strokeOpacity={0.09} strokeWidth={1}>
                <Path d={STAR} />
                <Path d={`M0 ${TILE / 2}H${TILE}M${TILE / 2} 0V${TILE}`} strokeOpacity={0.035} />
                <Circle cx={TILE / 2} cy={TILE / 2} r={5} />
              </G>
            </Pattern>
          </Defs>
          <Rect width="100%" height="100%" fill="url(#feed-girih)" />
        </Svg>
      </Animated.View>
      {/* beams of light from above, swaying slowly */}
      <Animated.View style={{ position: "absolute", top: -height * 0.1, left: width * 0.1, width: width * 0.8, height: height * 0.8, opacity: beamO, transform: [{ translateX: beamX }, { rotate: "12deg" }] }}>
        <LinearGradient colors={["rgba(233,207,153,0.13)", "rgba(233,207,153,0)"]} style={{ position: "absolute", left: "20%", width: "14%", height: "100%" }} />
        <LinearGradient colors={["rgba(233,207,153,0.09)", "rgba(233,207,153,0)"]} style={{ position: "absolute", left: "52%", width: "9%", height: "85%" }} />
        <LinearGradient colors={["rgba(233,207,153,0.07)", "rgba(233,207,153,0)"]} style={{ position: "absolute", left: "72%", width: "6%", height: "70%" }} />
      </Animated.View>
    </>
  );
}

export const FeedBackdrop = memo(function FeedBackdrop({ tone, width, height, animate = false, still = false }: { tone: [string, string]; width: number; height: number; animate?: boolean; still?: boolean }) {
  const inlay = Math.min(width, height) * 0.62;
  return (
    <View pointerEvents="none" style={[StyleSheet.absoluteFill, { overflow: "hidden" }]} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      <LinearGradient colors={tone} start={{ x: 0.2, y: 0 }} end={{ x: 0.8, y: 1 }} style={StyleSheet.absoluteFill} />
      <Svg style={StyleSheet.absoluteFill}>
        <Defs>
          <RadialGradient id="feed-glow" cx="50%" cy="0%" rx="85%" ry="60%">
            <Stop offset="0" stopColor="rgb(214,180,108)" stopOpacity={0.16} />
            <Stop offset="1" stopColor="rgb(214,180,108)" stopOpacity={0} />
          </RadialGradient>
        </Defs>
        <Rect width="100%" height="100%" fill="url(#feed-glow)" />
        <Circle cx={width / 2} cy={height * 0.46} r={Math.min(width, height) * 0.42} fill="none" stroke="rgb(214,180,108)" strokeOpacity={0.12} strokeWidth={1} />
        <Circle cx={width / 2} cy={height * 0.46} r={Math.min(width, height) * 0.44} fill="none" stroke="rgb(214,180,108)" strokeOpacity={0.06} strokeWidth={1} />
      </Svg>
      {still ? <StarLattice opacity={0.06} /> : <Drift width={width} height={height} animate={animate} />}
      <View style={{ position: "absolute", end: -inlay * 0.18, bottom: height * 0.06, opacity: 0.9 }}><QuranInlay size={inlay} color="rgb(214,180,108)" /></View>
      <View style={{ position: "absolute", start: -inlay * 0.25, top: height * 0.08, opacity: 0.5, transform: [{ rotate: "180deg" }] }}><QuranInlay size={inlay * 0.7} color="rgb(214,180,108)" /></View>
      <LinearGradient colors={["rgba(0,0,0,0)", "rgba(0,0,0,0.45)"]} style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: height * 0.35 }} />
    </View>
  );
});

/** a muted / unmuted speaker (the website's volume icon, struck through when muted) */
export function SpeakerIcon({ muted, color, size = 22 }: { muted: boolean; color: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M4 10v4h4l5 4V6L8 10z" />
      {muted ? <Path d="M16 9.5l5 5M21 9.5l-5 5" /> : <Path d="M16.5 8.5a5 5 0 0 1 0 7M19 6a8.5 8.5 0 0 1 0 12" />}
    </Svg>
  );
}
