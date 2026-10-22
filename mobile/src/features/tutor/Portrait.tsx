// Renders a tutor portrait from the shared art data (@/web/tutorArt, mirrored from the website's src/lib/tutorArt.ts, which
// src/components/tutor/TutorPortrait.tsx draws the same way).
// Layers: static disc and gold arch → bust that breathes (Reanimated, UI thread) with the eyes swapped for closed lids
// every 4–6 s → glow while speaking → gold ring. Static under Reduce Motion or with `still`.
import { memo, useEffect, useId, useState } from "react";
import { View } from "react-native";
import Svg, { Circle, ClipPath, Defs, G, LinearGradient, Path, RadialGradient, Stop } from "react-native-svg";
import Animated, { Easing, cancelAnimation, useAnimatedStyle, useSharedValue, withRepeat, withSequence, withTiming } from "react-native-reanimated";
import { useReducedMotion } from "@/features/library/motion";
import { TUTOR_ART, paint, shapesAt, type ArtGrad, type ArtShape, type TutorPersonaArt } from "@/web/tutorArt";

function grad(g: ArtGrad, p: string) {
  const stops = g.stops.map(([o, c, a], i) => <Stop key={i} offset={o} stopColor={c} stopOpacity={a ?? 1} />);
  return g.radial
    ? <RadialGradient key={g.id} id={p + g.id} cx={g.cx} cy={g.cy} r={g.r}>{stops}</RadialGradient>
    : <LinearGradient key={g.id} id={p + g.id} x1={g.x1} y1={g.y1} x2={g.x2} y2={g.y2}>{stops}</LinearGradient>;
}

/** one layer as its own Svg so it can sit in an Animated.View */
const Layer = memo(function Layer({ persona, shapes, size, p, absolute = true }: { persona: TutorPersonaArt; shapes: ArtShape[]; size: number; p: string; absolute?: boolean }) {
  const art = TUTOR_ART[persona];
  return (
    <Svg width={size} height={size} viewBox="0 0 200 200" style={absolute ? { position: "absolute" } : undefined}>
      <Defs>
        {art.grads.map((g) => grad(g, p))}
        <ClipPath id={p + "clip"}><Circle cx="100" cy="100" r="97" /></ClipPath>
      </Defs>
      <G clipPath={`url(#${p}clip)`}>
        {shapesAt(shapes, size).map((s, i) => <Path key={i} d={s.d} fill={paint(s.fill, p)} stroke={s.stroke ? paint(s.stroke, p) : undefined} strokeWidth={s.sw} strokeLinecap="round" strokeLinejoin="round" opacity={s.op} />)}
      </G>
    </Svg>
  );
});

const Ring = memo(function Ring({ size, p }: { size: number; p: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 200 200" style={{ position: "absolute" }}>
      <Defs><LinearGradient id={p + "ring"} x1="0" y1="0" x2="1" y2="1"><Stop offset="0" stopColor="#f6e6b4" /><Stop offset="0.5" stopColor="#c9a14a" /><Stop offset="1" stopColor="#e8c877" /></LinearGradient></Defs>
      <Circle cx="100" cy="100" r="96" fill="none" stroke={`url(#${p}ring)`} strokeWidth={2.4} />
      {size >= 40 ? <Circle cx="100" cy="100" r="92.5" fill="none" stroke="#e8c877" strokeWidth={0.6} opacity={0.45} /> : null}
    </Svg>
  );
});

export const TutorPortrait = memo(function TutorPortrait({ persona, size = 40, still = false, speaking = false }: { persona: TutorPersonaArt; size?: number; still?: boolean; speaking?: boolean }) {
  const art = TUTOR_ART[persona];
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const p = (layer: string) => `${persona}-${uid}-${layer}-`;
  const reduce = useReducedMotion();
  const animate = !still && !reduce;
  const breath = useSharedValue(0), glow = useSharedValue(0.5);
  const [blink, setBlink] = useState(false);

  useEffect(() => {
    if (!animate) { breath.value = 0; return; }
    breath.value = withRepeat(withTiming(1, { duration: 2000, easing: Easing.inOut(Easing.sin) }), -1, true);
    return () => cancelAnimation(breath);
  }, [animate, breath]);

  useEffect(() => {
    if (!animate || !speaking) { glow.value = 0.5; return; }
    glow.value = withRepeat(withSequence(withTiming(0.85, { duration: 800, easing: Easing.inOut(Easing.sin) }), withTiming(0.15, { duration: 800, easing: Easing.inOut(Easing.sin) })), -1, false);
    return () => cancelAnimation(glow);
  }, [animate, speaking, glow]);

  useEffect(() => {
    if (!animate) { setBlink(false); return; }
    let t: ReturnType<typeof setTimeout>;
    const next = () => {
      t = setTimeout(() => {
        setBlink(true);
        t = setTimeout(() => { setBlink(false); next(); }, 120);
      }, 4000 + Math.random() * 2000);
    };
    next();
    return () => clearTimeout(t);
  }, [animate]);

  // breathing: ~1.5 % scale anchored at the bottom centre, plus a slight lift
  const breathStyle = useAnimatedStyle(() => {
    const s = 1 + breath.value * 0.015;
    return { transform: [{ translateY: size / 2 }, { scale: s }, { translateY: -size / 2 }, { translateY: -breath.value * size * 0.006 }] };
  });
  const glowStyle = useAnimatedStyle(() => ({ opacity: glow.value }));

  return (
    <View style={{ width: size, height: size }} accessible accessibilityRole="image" accessibilityLabel={art.label}>
      <Layer persona={persona} shapes={art.back} size={size} p={p("b")} />
      <Animated.View style={[{ position: "absolute", width: size, height: size }, breathStyle]}>
        <Layer persona={persona} shapes={art.bust} size={size} p={p("u")} />
        <Layer persona={persona} shapes={blink ? art.lids : art.eyes} size={size} p={p("e")} />
      </Animated.View>
      {speaking && (
        <Animated.View pointerEvents="none" style={[{ position: "absolute", width: size, height: size }, glowStyle]}>
          <Svg width={size} height={size} viewBox="0 0 200 200"><Circle cx="100" cy="100" r="95" fill="none" stroke="#f3dfa2" strokeWidth={5} /></Svg>
        </Animated.View>
      )}
      <Ring size={size} p={p("r")} />
    </View>
  );
});
