import { useEffect } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View, useWindowDimensions } from "react-native";
import Svg, { Circle, Defs, G, LinearGradient as SvgLinear, Path, RadialGradient, Rect, Stop } from "react-native-svg";
import { LinearGradient } from "expo-linear-gradient";
import Animated, { Easing, FadeIn, FadeInDown, cancelAnimation, interpolate, useAnimatedStyle, useSharedValue, withRepeat, withSequence, withTiming, type SharedValue } from "react-native-reanimated";
import { CALLIG_FONT, FONT, R, goldButton, stage } from "@/lib/theme";

// The paywall moment of the personal dua (owner, 22.10.2026): the dua waits as an illuminated scroll closed with a
// gold seal in the garden night; the answers glow on it as calligraphic chips and a soft light breathes behind the
// seal. Opening the seal is the purchase (the price only from the store). After a purchase the seal breaks with a
// burst of gold light (SealBreak), then the reveal follows. Reduce Motion: still light, no burst.

/** the sealed scroll with the answers as glowing chips */
export function SealScene({ chips, arabic, still }: { chips: string[]; arabic: string; still: boolean }) {
  const { width } = useWindowDimensions();
  const W = Math.min(width - 40, 380), H = W * 0.86;
  const pulse = useSharedValue(still ? 0.6 : 0);
  const float = useSharedValue(0);
  useEffect(() => {
    if (still) return;
    pulse.value = withRepeat(withSequence(withTiming(1, { duration: 1800, easing: Easing.inOut(Easing.sin) }), withTiming(0.25, { duration: 1800, easing: Easing.inOut(Easing.sin) })), -1, true);
    float.value = withRepeat(withSequence(withTiming(1, { duration: 3200, easing: Easing.inOut(Easing.sin) }), withTiming(0, { duration: 3200, easing: Easing.inOut(Easing.sin) })), -1, true);
    return () => { cancelAnimation(pulse); cancelAnimation(float); };
  }, [still, pulse, float]);
  const glow = useAnimatedStyle(() => ({ opacity: interpolate(pulse.value, [0, 1], [0.35, 1]), transform: [{ scale: interpolate(pulse.value, [0, 1], [0.85, 1.12]) }] }));
  const bob = useAnimatedStyle(() => ({ transform: [{ translateY: interpolate(float.value, [0, 1], [0, -6]) }] }));
  const sx = W / 2, sy = H * 0.66;
  return (
    <Animated.View entering={still ? undefined : FadeIn.duration(1200)} style={{ alignItems: "center" }} accessible accessibilityLabel={chips.join(", ")}>
      <Animated.View style={[{ width: W, height: H }, bob]}>
        {/* the light behind the seal */}
        <Animated.View pointerEvents="none" style={[{ position: "absolute", left: sx - W * 0.42, top: sy - W * 0.42, width: W * 0.84, height: W * 0.84 }, glow]}>
          <Svg width="100%" height="100%" viewBox="0 0 100 100">
            <Defs>
              <RadialGradient id="sealHalo" cx="50%" cy="50%" r="50%">
                <Stop offset="0" stopColor="#ffe6a8" stopOpacity={0.9} />
                <Stop offset="0.3" stopColor="#f3c86a" stopOpacity={0.35} />
                <Stop offset="1" stopColor="#f3c86a" stopOpacity={0} />
              </RadialGradient>
            </Defs>
            <Circle cx={50} cy={50} r={50} fill="url(#sealHalo)" />
          </Svg>
        </Animated.View>
        <Svg width={W} height={H} viewBox="0 0 300 258" style={StyleSheet.absoluteFill}>
          <Defs>
            <SvgLinear id="parch" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor="#f6e7bf" />
              <Stop offset="1" stopColor="#e2c98d" />
            </SvgLinear>
            <SvgLinear id="roll" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor="#c9a65e" />
              <Stop offset="0.5" stopColor="#f3e2b6" />
              <Stop offset="1" stopColor="#8a6a2c" />
            </SvgLinear>
            <RadialGradient id="wax" cx="40%" cy="35%" r="70%">
              <Stop offset="0" stopColor="#f3e2b6" />
              <Stop offset="0.45" stopColor="#d6b46c" />
              <Stop offset="1" stopColor="#8a6a2c" />
            </RadialGradient>
          </Defs>
          {/* the scroll: rolls at top and bottom, parchment between, a gold frame and a niche */}
          <Rect x={34} y={22} width={232} height={200} rx={6} fill="url(#parch)" opacity={0.96} />
          <Rect x={44} y={32} width={212} height={180} rx={4} fill="none" stroke="#b98f45" strokeWidth={1.2} opacity={0.7} />
          <Path d="M90 212 L90 112 C90 78 120 56 150 46 C180 56 210 78 210 112 L210 212" fill="none" stroke="#b98f45" strokeWidth={1} opacity={0.45} />
          <Rect x={20} y={10} width={260} height={18} rx={9} fill="url(#roll)" />
          <Rect x={20} y={216} width={260} height={18} rx={9} fill="url(#roll)" />
          <Circle cx={20} cy={19} r={9} fill="#8a6a2c" /><Circle cx={280} cy={19} r={9} fill="#8a6a2c" />
          <Circle cx={20} cy={225} r={9} fill="#8a6a2c" /><Circle cx={280} cy={225} r={9} fill="#8a6a2c" />
          {/* the ribbon and the gold seal */}
          <Path d="M150 128 L150 222" stroke="#0f5a43" strokeWidth={10} opacity={0.85} />
          <G>
            <Circle cx={150} cy={170} r={30} fill="url(#wax)" />
            <Circle cx={150} cy={170} r={23} fill="none" stroke="#8a6a2c" strokeWidth={1.4} />
            <Path d="M150 152 L155 165 L168 170 L155 175 L150 188 L145 175 L132 170 L145 165 Z" fill="#8a6a2c" opacity={0.8} />
          </G>
        </Svg>
        {/* the calligraphy of the dua's word on the parchment */}
        <Text allowFontScaling={false} style={{ position: "absolute", top: H * 0.17, left: 0, right: 0, textAlign: "center", fontFamily: CALLIG_FONT, fontSize: W * 0.12, lineHeight: W * 0.18, color: "#6b4f1d" }}>{arabic}</Text>
      </Animated.View>
      {/* the answers as glowing chips */}
      <View style={{ flexDirection: "row", flexWrap: "wrap", justifyContent: "center", gap: 8, marginTop: 14, maxWidth: W + 20 }}>
        {chips.map((c, i) => (
          <Animated.View key={c} entering={still ? undefined : FadeInDown.delay(500 + i * 160).duration(600)}
            style={{ paddingHorizontal: 14, height: 34, borderRadius: R.pill, justifyContent: "center", borderWidth: 1, borderColor: "rgba(214,180,108,0.6)", backgroundColor: "rgba(214,180,108,0.12)", shadowColor: "#ffd27a", shadowOpacity: 0.55, shadowRadius: 10, shadowOffset: { width: 0, height: 0 } }}>
            <Text style={{ fontFamily: FONT.semibold, fontSize: 13.5, color: "#f6ead0" }} numberOfLines={1}>{c}</Text>
          </Animated.View>
        ))}
      </View>
    </Animated.View>
  );
}

/** the primary gold action with the store price; disabled with a quiet line until the store has answered */
export function SealButton({ title, onPress, busy, disabled }: { title: string; onPress: () => void; busy?: boolean; disabled?: boolean }) {
  return (
    <Pressable onPress={onPress} disabled={disabled || busy} accessibilityRole="button" accessibilityLabel={title} accessibilityState={{ disabled: !!(disabled || busy), busy: !!busy }}
      style={({ pressed }) => ({ opacity: disabled ? 0.5 : 1, transform: [{ scale: pressed ? 0.985 : 1 }], shadowColor: "#f3c86a", shadowOpacity: 0.45, shadowRadius: 18, shadowOffset: { width: 0, height: 4 } })}>
      <LinearGradient colors={["#f3e2b6", goldButton.from, goldButton.to]} locations={[0, 0.35, 1]} style={{ height: 56, borderRadius: R.lg, alignItems: "center", justifyContent: "center", flexDirection: "row", gap: 10 }}>
        {busy ? <ActivityIndicator color={goldButton.text} /> : (
          <>
            <Svg width={20} height={20} viewBox="0 0 24 24"><Circle cx={12} cy={12} r={10} fill="none" stroke={goldButton.text} strokeWidth={1.6} /><Path d="M12 6 L13.6 10.4 L18 12 L13.6 13.6 L12 18 L10.4 13.6 L6 12 L10.4 10.4 Z" fill={goldButton.text} /></Svg>
            <Text style={{ fontFamily: FONT.bold, fontSize: 16.5, color: goldButton.text, fontVariant: ["tabular-nums"] }}>{title}</Text>
          </>
        )}
      </LinearGradient>
    </Pressable>
  );
}

/** the 5-pack: a quiet glass row with a subtle ribbon */
export function PackRow({ title, ribbon, onPress, busy, disabled }: { title: string; ribbon: string; onPress: () => void; busy?: boolean; disabled?: boolean }) {
  return (
    <Pressable onPress={onPress} disabled={disabled || busy} accessibilityRole="button" accessibilityLabel={`${title}, ${ribbon}`}
      style={({ pressed }) => ({ height: 52, borderRadius: R.lg, borderWidth: 1, borderColor: "rgba(214,180,108,0.55)", backgroundColor: pressed ? "rgba(214,180,108,0.16)" : "rgba(6,30,23,0.6)", alignItems: "center", justifyContent: "center", opacity: disabled ? 0.5 : 1 })}>
      {busy ? <ActivityIndicator color={stage.gold} /> : <Text style={{ fontFamily: FONT.semibold, fontSize: 15.5, color: "#ffffff", fontVariant: ["tabular-nums"] }}>{title}</Text>}
      <View style={{ position: "absolute", top: -9, right: 14, paddingHorizontal: 8, height: 18, borderRadius: 9, backgroundColor: stage.gold, justifyContent: "center" }}>
        <Text style={{ fontFamily: FONT.bold, fontSize: 10.5, letterSpacing: 0.6, color: goldButton.text }}>{ribbon}</Text>
      </View>
    </Pressable>
  );
}

/** the seal breaks: a ring of light and gold particles fly out, then onDone (instant under Reduce Motion) */
export function SealBreak({ still, onDone }: { still: boolean; onDone: () => void }) {
  const t = useSharedValue(0);
  useEffect(() => {
    if (still) { const id = setTimeout(onDone, 200); return () => clearTimeout(id); }
    t.value = withTiming(1, { duration: 1500, easing: Easing.out(Easing.cubic) });
    const id = setTimeout(onDone, 1550);
    return () => { clearTimeout(id); cancelAnimation(t); };
  }, [still, t, onDone]);
  const ring = useAnimatedStyle(() => ({ opacity: interpolate(t.value, [0, 0.15, 1], [0, 1, 0]), transform: [{ scale: interpolate(t.value, [0, 1], [0.2, 3.2]) }] }));
  const flash = useAnimatedStyle(() => ({ opacity: interpolate(t.value, [0, 0.12, 0.5], [0, 0.85, 0]) }));
  if (still) return null;
  return (
    <View pointerEvents="none" style={[StyleSheet.absoluteFill, { alignItems: "center", justifyContent: "center" }]}>
      <Animated.View style={[StyleSheet.absoluteFill, { backgroundColor: "#fff1c4" }, flash]} />
      <Animated.View style={[{ width: 140, height: 140, borderRadius: 70, borderWidth: 3, borderColor: "#f3d48e" }, ring]} />
      {Array.from({ length: 28 }, (_, i) => <Spark key={i} i={i} t={t} />)}
    </View>
  );
}
function Spark({ i, t }: { i: number; t: SharedValue<number> }) {
  const a = (i / 28) * Math.PI * 2 + (i % 3) * 0.2, d = 110 + (i % 5) * 34, s = 3 + (i % 4);
  const st = useAnimatedStyle(() => ({
    opacity: interpolate(t.value, [0, 0.1, 0.8, 1], [0, 1, 0.8, 0]),
    transform: [{ translateX: Math.cos(a) * d * t.value }, { translateY: Math.sin(a) * d * t.value + 60 * t.value * t.value }, { scale: 1 - t.value * 0.5 }],
  }));
  return <Animated.View style={[{ position: "absolute", width: s, height: s, borderRadius: s, backgroundColor: i % 3 ? "#f3d48e" : "#fff6dc", shadowColor: "#ffd27a", shadowOpacity: 1, shadowRadius: 6, shadowOffset: { width: 0, height: 0 } }, st]} />;
}

