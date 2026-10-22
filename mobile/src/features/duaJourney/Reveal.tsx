import { useEffect, useMemo, useRef, useState } from "react";
import { Pressable, StyleSheet, Text, View, useWindowDimensions } from "react-native";
import Svg, { Circle, Defs, Path, RadialGradient, Stop } from "react-native-svg";
import Animated, { Easing, FadeIn, FadeInDown, cancelAnimation, interpolate, useAnimatedProps, useAnimatedStyle, useSharedValue, withDelay, withRepeat, withSequence, withTiming } from "react-native-reanimated";
import { TreeArt } from "@/features/garden/Tree";
import { tick, success } from "@/features/feed/haptics";
import { ARABIC_FONT, CALLIG_FONT, FONT, stage } from "@/lib/theme";
import { LANTERN, LEAF_PATH, NICHE_INNER, NICHE_LEN, NICHE_PATH, REVEAL, REVEAL_TREE, splitLines } from "@/web/duaJourney";

// The reveal of a personal dua (website components/dua/DuaReveal.tsx draws the same scene): a niche (mihrab) draws
// itself in gold, motes of light gather into a hanging lantern, a small tree grows beneath it, leaves drift down, the
// word دعاء appears in calligraphy and then the personal words, line by line. It waits for the server (the light keeps
// gathering) and never ends before REVEAL.min. Reduce Motion: a still scene, the words at once.
const AnimatedPath = Animated.createAnimatedComponent(Path);
const VB_W = 300, VB_H = 360;

export function DuaReveal({ lines, arabic, still, phrases, label, onDone, continueLabel }: {
  /** the personal words; null while the server is still composing */
  lines: string | null;
  arabic?: string | null;
  still: boolean;
  /** three short sentences shown while the light gathers */
  phrases: [string, string, string];
  label: string;
  continueLabel: string;
  onDone: () => void;
}) {
  const { width } = useWindowDimensions();
  const size = Math.min(width - 48, 340);
  const scale = size / VB_W;
  const [t0] = useState(() => Date.now());
  const [elapsed, setElapsed] = useState(0);
  const done = useRef(false);
  useEffect(() => {
    const id = setInterval(() => setElapsed(Date.now() - t0), 200);
    return () => clearInterval(id);
  }, [t0]);
  const ready = lines !== null && (still || elapsed >= REVEAL.word);
  const parts = useMemo(() => (lines ? splitLines(lines) : []), [lines]);
  const treeStage = still ? REVEAL_TREE[REVEAL_TREE.length - 1] : REVEAL_TREE[Math.min(REVEAL_TREE.length - 1, Math.max(0, Math.floor(((elapsed - REVEAL.niche) / (REVEAL.tree - REVEAL.niche)) * REVEAL_TREE.length)))];
  const phrase = phrases[Math.min(2, Math.floor(elapsed / 2200) % 3)];

  // haptics: a soft tick when the word appears, success when the last line is there
  const wordAt = useRef(0);
  useEffect(() => { if (ready && !wordAt.current) { wordAt.current = Date.now(); if (!still) tick(); } }, [ready, still]);
  const linesEnd = wordAt.current ? wordAt.current + 900 + parts.length * REVEAL.line + 1600 : 0;
  useEffect(() => {
    if (!ready || done.current) return;
    const wait = Math.max(still ? 400 : 0, linesEnd - Date.now(), REVEAL.min - (Date.now() - t0));
    const id = setTimeout(() => { if (!done.current) { done.current = true; if (!still) success(); onDone(); } }, wait + (still ? 0 : 1800));
    return () => clearTimeout(id);
  }, [ready, linesEnd, still, t0, onDone]);

  // the niche drawing itself
  const draw = useSharedValue(still ? 1 : 0);
  const glow = useSharedValue(still ? 1 : 0.2);
  useEffect(() => {
    if (still) return;
    draw.value = withTiming(1, { duration: REVEAL.niche, easing: Easing.inOut(Easing.cubic) });
    glow.value = withDelay(REVEAL.niche * 0.6, withRepeat(withSequence(withTiming(1, { duration: 1300, easing: Easing.inOut(Easing.sin) }), withTiming(0.7, { duration: 1300, easing: Easing.inOut(Easing.sin) })), -1, true));
    return () => { cancelAnimation(draw); cancelAnimation(glow); };
  }, [still, draw, glow]);
  const outer = useAnimatedProps(() => ({ strokeDashoffset: NICHE_LEN * (1 - draw.value) }));
  const inner = useAnimatedProps(() => ({ strokeDashoffset: NICHE_LEN * (1 - Math.max(0, draw.value * 1.25 - 0.25)) }));
  const halo = useAnimatedStyle(() => ({ opacity: interpolate(glow.value, [0, 1], [0.15, 0.95]), transform: [{ scale: interpolate(glow.value, [0, 1], [0.7, 1.08]) }] }));
  const lx = LANTERN.cx * scale, ly = LANTERN.cy * scale;

  return (
    <View style={{ alignItems: "center", paddingTop: 8 }} accessibilityLiveRegion="polite">
      <View style={{ width: size, height: VB_H * scale }} accessible accessibilityLabel={ready ? label : phrase}>
        {/* the halo of the lantern */}
        <Animated.View pointerEvents="none" style={[{ position: "absolute", left: lx - size * 0.55, top: ly - size * 0.55, width: size * 1.1, height: size * 1.1 }, halo]}>
          <Svg width="100%" height="100%" viewBox="0 0 100 100">
            <Defs>
              <RadialGradient id="djHalo" cx="50%" cy="50%" r="50%">
                <Stop offset="0" stopColor="#ffe6a8" stopOpacity={0.85} />
                <Stop offset="0.25" stopColor="#f3c86a" stopOpacity={0.35} />
                <Stop offset="1" stopColor="#f3c86a" stopOpacity={0} />
              </RadialGradient>
            </Defs>
            <Circle cx={50} cy={50} r={50} fill="url(#djHalo)" />
          </Svg>
        </Animated.View>
        <Svg width={size} height={VB_H * scale} viewBox={`0 0 ${VB_W} ${VB_H}`} style={StyleSheet.absoluteFill}>
          <AnimatedPath d={NICHE_PATH} stroke={stage.gold} strokeWidth={2} fill="none" strokeDasharray={NICHE_LEN} animatedProps={outer} strokeLinecap="round" />
          <AnimatedPath d={NICHE_INNER} stroke="rgba(214,180,108,0.45)" strokeWidth={1} fill="none" strokeDasharray={NICHE_LEN} animatedProps={inner} />
          <Path d={LANTERN.chain} stroke="rgba(214,180,108,0.7)" strokeWidth={1.2} />
          <Path d={LANTERN.cap} fill="#c9a65e" />
          <Path d={LANTERN.body} fill="rgba(255,226,150,0.28)" stroke="#d6b46c" strokeWidth={1.4} />
          <Circle cx={LANTERN.cx} cy={LANTERN.cy} r={7} fill="#fff1c4" opacity={0.95} />
          <Path d={LANTERN.base} fill="#c9a65e" />
        </Svg>
        {/* the little tree grows under the niche */}
        <View pointerEvents="none" style={{ position: "absolute", left: size * 0.5 - size * 0.32, bottom: 0, width: size * 0.64 }}>
          <TreeArt id="dua-reveal" type="olive" stage={treeStage} size={size * 0.64} still={still} />
        </View>
        {!still ? <Gather size={size} to={{ x: lx, y: ly }} /> : null}
        {!still ? <Leaves size={size} /> : null}
      </View>

      {ready ? (
        <Animated.View entering={still ? undefined : FadeIn.duration(1100)} style={{ alignItems: "center", marginTop: -8 }}>
          <Text allowFontScaling={false} style={{ fontFamily: CALLIG_FONT, fontSize: 54, lineHeight: 84, color: stage.gold, textShadowColor: "rgba(255,214,130,0.6)", textShadowRadius: 18 }}>دعاء</Text>
        </Animated.View>
      ) : (
        <Animated.Text key={phrase} entering={still ? undefined : FadeIn.duration(700)} style={{ fontFamily: FONT.medium, fontSize: 15, lineHeight: 22, color: stage.textSoft, textAlign: "center", marginTop: 20, minHeight: 44 }}>{phrase}</Animated.Text>
      )}
      {ready ? (
        <View style={{ gap: 6, maxWidth: 520, paddingHorizontal: 8 }}>
          {parts.map((l, i) => (
            <Animated.Text key={i} entering={still ? undefined : FadeInDown.delay(900 + i * REVEAL.line).duration(800)}
              style={{ fontFamily: FONT.regular, fontSize: 18, lineHeight: 28, color: "#f6ead0", textAlign: "center" }}>{l}</Animated.Text>
          ))}
          {arabic ? (
            <Animated.Text entering={still ? undefined : FadeInDown.delay(900 + parts.length * REVEAL.line).duration(800)}
              style={{ fontFamily: ARABIC_FONT, fontSize: 22, lineHeight: 42, color: stage.cream, textAlign: "center", writingDirection: "rtl", marginTop: 8 }}>{arabic}</Animated.Text>
          ) : null}
          <Pressable onPress={() => { if (!done.current) { done.current = true; onDone(); } }} accessibilityRole="button" hitSlop={12} style={{ alignSelf: "center", marginTop: 18, paddingVertical: 8, paddingHorizontal: 14 }}>
            <Text style={{ fontFamily: FONT.semibold, fontSize: 14, color: stage.gold }}>{continueLabel}</Text>
          </Pressable>
        </View>
      ) : null}
    </View>
  );
}

/** motes of light that gather from the edges into the lantern, again and again while the dua is composed */
function Gather({ size, to }: { size: number; to: { x: number; y: number } }) {
  return <View pointerEvents="none" style={StyleSheet.absoluteFill}>{Array.from({ length: 14 }, (_, i) => <Mote key={i} i={i} size={size} to={to} />)}</View>;
}
function Mote({ i, size, to }: { i: number; size: number; to: { x: number; y: number } }) {
  const t = useSharedValue(0);
  useEffect(() => {
    t.value = withDelay(300 + i * 230, withRepeat(withTiming(1, { duration: 2200 + (i % 5) * 320, easing: Easing.in(Easing.cubic) }), -1, false));
    return () => cancelAnimation(t);
  }, [i, t]);
  const a = (i / 14) * Math.PI * 2 + (i % 3) * 0.4;
  const r = size * (0.5 + (i % 4) * 0.08);
  const x0 = to.x + Math.cos(a) * r, y0 = to.y + Math.sin(a) * r * 0.9 + size * 0.2;
  const st = useAnimatedStyle(() => {
    const k = t.value;
    return { opacity: interpolate(k, [0, 0.2, 0.85, 1], [0, 1, 0.9, 0]), transform: [{ translateX: x0 + (to.x - x0) * k + Math.sin(k * 6 + i) * 6 }, { translateY: y0 + (to.y - y0) * k }, { scale: 1 - k * 0.5 }] };
  });
  const s = 3 + (i % 3);
  return <Animated.View style={[{ position: "absolute", left: -s / 2, top: -s / 2, width: s, height: s, borderRadius: s, backgroundColor: "#ffe9b0", shadowColor: "#ffd27a", shadowOpacity: 1, shadowRadius: 5, shadowOffset: { width: 0, height: 0 } }, st]} />;
}
/** a few leaves drifting down past the niche */
function Leaves({ size }: { size: number }) {
  return <View pointerEvents="none" style={StyleSheet.absoluteFill}>{Array.from({ length: 6 }, (_, i) => <Leaf key={i} i={i} size={size} />)}</View>;
}
function Leaf({ i, size }: { i: number; size: number }) {
  const t = useSharedValue(0);
  useEffect(() => {
    t.value = withDelay(REVEAL.niche + i * 900, withRepeat(withTiming(1, { duration: 6200 + (i % 3) * 1400, easing: Easing.linear }), -1, false));
    return () => cancelAnimation(t);
  }, [i, t]);
  const x0 = (((i * 47 + 13) % 80) / 100 + 0.1) * size;
  const h = size * 1.2;
  const st = useAnimatedStyle(() => {
    const k = t.value;
    return { opacity: interpolate(k, [0, 0.1, 0.85, 1], [0, 0.9, 0.8, 0]), transform: [{ translateX: x0 + Math.sin(k * Math.PI * 3 + i) * 22 }, { translateY: -20 + k * h }, { rotate: `${k * 300 + i * 40}deg` }] };
  });
  const green = i % 2 === 0;
  return (
    <Animated.View style={[{ position: "absolute", left: 0, top: 0, width: 20, height: 10 }, st]}>
      <Svg width={20} height={10} viewBox="-1 -5 20 10"><Path d={LEAF_PATH} fill={green ? "#7fb48a" : "#d6b46c"} opacity={0.85} /></Svg>
    </Animated.View>
  );
}
