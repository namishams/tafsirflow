// Hidaya (هداية, "guidance"), the AI tutor for sisters: a serene ustadha in a dark khimar and niqab with a thin gold
// trim, only the eyes visible, drawn as the same circular emerald badge as Dalil (react-native-svg gradients, soft layered
// shapes, 200 x 200 viewBox). Same artwork (same paths) as the website's src/components/tutor/TutorAvatarHidaya.tsx.
// Layers: static disc with khatam star → bust that breathes (Reanimated, UI thread) with an eyelid layer toggled for
// a blink every 4–6 s → gold ring (pulses softly while speaking). Static under Reduce Motion or with `still`.
import { memo, useEffect, useId, useState } from "react";
import { View } from "react-native";
import Svg, { Circle, ClipPath, Defs, Ellipse, G, LinearGradient as SvgLinear, Path, RadialGradient, Stop } from "react-native-svg";
import Animated, { Easing, cancelAnimation, useAnimatedStyle, useSharedValue, withRepeat, withSequence, withTiming } from "react-native-reanimated";
import { useReducedMotion } from "@/features/library/motion";

const STAR_OUTER = "M100.0 10.0L121.7 31.7L152.3 31.7L152.3 62.3L174.0 84.0L152.3 105.7L152.3 136.3L121.7 136.3L100.0 158.0L78.3 136.3L47.7 136.3L47.7 105.7L26.0 84.0L47.7 62.3L47.7 31.7L78.3 31.7Z";
const STAR_INNER = "M100.0 32.0L115.2 47.2L136.8 47.2L136.8 68.8L152.0 84.0L136.8 99.2L136.8 120.8L115.2 120.8L100.0 136.0L84.8 120.8L63.2 120.8L63.2 99.2L48.0 84.0L63.2 68.8L63.2 47.2L84.8 47.2Z";

type Ids = (n: string) => string;

const Disc = memo(function Disc({ size, uid }: { size: number; uid: string }) {
  const id: Ids = (n) => `hidaya-${uid}-${n}`;
  return (
    <Svg width={size} height={size} viewBox="0 0 200 200" style={{ position: "absolute" }}>
      <Defs>
        <RadialGradient id={id("bg")} cx="50%" cy="40%" r="62%"><Stop offset="0" stopColor="#3f9a68" /><Stop offset="0.55" stopColor="#1f6b4a" /><Stop offset="1" stopColor="#0c4a37" /></RadialGradient>
        <ClipPath id={id("clip")}><Circle cx="100" cy="100" r="97" /></ClipPath>
      </Defs>
      <Circle cx="100" cy="100" r="98" fill={`url(#${id("bg")})`} />
      <G clipPath={`url(#${id("clip")})`}>
        <Path d={STAR_OUTER} fill="none" stroke="#e8c877" strokeWidth={1.2} opacity={0.22} />
        <Path d={STAR_INNER} fill="#e8c877" opacity={0.07} />
      </G>
    </Svg>
  );
});

const Bust = memo(function Bust({ size, uid }: { size: number; uid: string }) {
  const id: Ids = (n) => `hidaya-${uid}-${n}`;
  const u = (n: string) => `url(#${id(n)})`;
  return (
    <Svg width={size} height={size} viewBox="0 0 200 200">
      <Defs>
        <SvgLinear id={id("trim")} x1="0" y1="0" x2="0" y2="1"><Stop offset="0" stopColor="#f3dfa2" /><Stop offset="1" stopColor="#c9a14a" /></SvgLinear>
        <SvgLinear id={id("khimar")} x1="0" y1="0" x2="1" y2="0"><Stop offset="0" stopColor="#171c19" /><Stop offset="0.38" stopColor="#2c3530" /><Stop offset="0.62" stopColor="#2c3530" /><Stop offset="1" stopColor="#141916" /></SvgLinear>
        <SvgLinear id={id("niqab")} x1="0" y1="0" x2="0" y2="1"><Stop offset="0" stopColor="#323c36" /><Stop offset="1" stopColor="#1f2622" /></SvgLinear>
        <SvgLinear id={id("skin")} x1="0" y1="0" x2="0" y2="1"><Stop offset="0" stopColor="#d4a080" /><Stop offset="0.6" stopColor="#c89474" /><Stop offset="1" stopColor="#b8826a" /></SvgLinear>
        <ClipPath id={id("clip")}><Circle cx="100" cy="100" r="97" /></ClipPath>
      </Defs>
      <G clipPath={u("clip")}>
        {/* khimar (back), soft highlight on the crown, drape shadows */}
        <Path d="M100 26C139 26 159 55 159 92C159 120 162 138 175 152C189 166 197 184 200 200L0 200C3 184 11 166 25 152C38 138 41 120 41 92C41 55 61 26 100 26Z" fill={u("khimar")} />
        <Path d="M66 50C76 38 88 32 100 31.5C112 32 124 38 134 50" fill="none" stroke="#6f7d75" strokeWidth={2.4} strokeLinecap="round" opacity={0.3} />
        <Path d="M48 112C47 134 41 150 30 162M152 112C153 134 159 150 170 162" fill="none" stroke="#000" strokeWidth={1.6} opacity={0.3} />
        {/* inner panel and the khimar's front edges with gold trim (echoes Dalil's bisht) */}
        <Path d="M64 132C59 154 56 178 57 200L143 200C144 178 141 154 136 132Z" fill="#181d1a" />
        <Path d="M64 132C59 154 56 178 57 200M136 132C141 154 144 178 143 200" fill="none" stroke={u("trim")} strokeWidth={3} strokeLinecap="round" />
        <Path d="M58.5 140C55 158 53 178 53 196M141.5 140C145 158 147 178 147 196" fill="none" stroke="#c9a14a" strokeWidth={1.2} strokeLinecap="round" opacity={0.6} />
        {/* shadowed lining and the face opening */}
        <Ellipse cx="100" cy="99" rx="35" ry="42" fill="#121613" />
        <Ellipse cx="100" cy="99" rx="28" ry="32" fill={u("skin")} />
        {/* eyes with soft lashes */}
        <Path d="M78.5 95.5Q87 89.4 95.5 95.5Q87 100.2 78.5 95.5Z" fill="#fbf7ee" />
        <Circle cx="87.2" cy="95.4" r="3.3" fill="#4a2e1b" />
        <Circle cx="87.2" cy="95.4" r="1.5" fill="#140c08" />
        <Circle cx="88.3" cy="94.3" r="0.9" fill="#fff" />
        <Path d="M77.6 96Q87 88.2 96 95.2" fill="none" stroke="#24180f" strokeWidth={2} strokeLinecap="round" />
        <Path d="M78.2 95.6L75.4 93.6" fill="none" stroke="#24180f" strokeWidth={1.4} strokeLinecap="round" />
        <Path d="M104.5 95.5Q113 89.4 121.5 95.5Q113 100.2 104.5 95.5Z" fill="#fbf7ee" />
        <Circle cx="112.8" cy="95.4" r="3.3" fill="#4a2e1b" />
        <Circle cx="112.8" cy="95.4" r="1.5" fill="#140c08" />
        <Circle cx="113.9" cy="94.3" r="0.9" fill="#fff" />
        <Path d="M122.4 96Q113 88.2 104 95.2" fill="none" stroke="#24180f" strokeWidth={2} strokeLinecap="round" />
        <Path d="M121.8 95.6L124.6 93.6" fill="none" stroke="#24180f" strokeWidth={1.4} strokeLinecap="round" />
        <Path d="M80 98.8Q87 100.8 94 98.8M106 98.8Q113 100.8 120 98.8" fill="none" stroke="#a8765a" strokeWidth={0.8} opacity={0.7} />
        {/* calm brows */}
        <Path d="M79 87.8Q87 84 95.5 86.6" fill="none" stroke="#2b211c" strokeWidth={2.1} strokeLinecap="round" />
        <Path d="M121 87.8Q113 84 104.5 86.6" fill="none" stroke="#2b211c" strokeWidth={2.1} strokeLinecap="round" />
        {/* niqab with a gentle fold line */}
        <Path d="M66 102.5C80 105 90 104.2 100 102.4C110 104.2 120 105 134 102.5C140 122 142 148 139 174C126 186 74 186 61 174C58 148 60 122 66 102.5Z" fill={u("niqab")} />
        <Path d="M67 103C80 105.4 90 104.6 100 102.9C110 104.6 120 105.4 133 103" fill="none" stroke="#56635c" strokeWidth={1.3} strokeLinecap="round" opacity={0.8} />
        <Path d="M100 106Q102.5 124 99.5 144M83 114Q85 138 80 162M117 114Q115 138 120 162" fill="none" stroke="#0f1311" strokeWidth={1.3} strokeLinecap="round" opacity={0.45} />
        <Path d="M88 108Q100 112 112 108" fill="none" stroke="#56635c" strokeWidth={1} strokeLinecap="round" opacity={0.35} />
        {/* khimar front over the forehead with a thin gold edge */}
        <Path d="M57 104C55 67 75 48 100 48C125 48 145 67 143 104C139 89 126 80.5 100 79.5C74 80.5 61 89 57 104Z" fill={u("khimar")} />
        <Path d="M59.5 99C63.5 88 76 81 100 80.2C124 81 136.5 88 140.5 99" fill="none" stroke={u("trim")} strokeWidth={1.4} strokeLinecap="round" opacity={0.8} />
        <Path d="M74 60C82 54 90 51.5 100 51.2" fill="none" stroke="#6f7d75" strokeWidth={1.6} strokeLinecap="round" opacity={0.3} />
      </G>
    </Svg>
  );
});

// only the eyelids, drawn over the open eyes for a blink (same coordinates as the bust)
const Lids = memo(function Lids({ size }: { size: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 200 200" style={{ position: "absolute" }}>
      <Path d="M77.5 96Q87 88.6 96.5 95.5Q87 100.8 77.5 96Z" fill="#c89474" />
      <Path d="M103.5 95.5Q113 88.6 122.5 96Q113 100.8 103.5 95.5Z" fill="#c89474" />
      <Path d="M78.5 96.6Q87 99.6 95.5 96.6M104.5 96.6Q113 99.6 121.5 96.6" fill="none" stroke="#24180f" strokeWidth={1.7} strokeLinecap="round" />
    </Svg>
  );
});

const Ring = memo(function Ring({ size, uid }: { size: number; uid: string }) {
  const gid = `hidaya-${uid}-gold`;
  return (
    <Svg width={size} height={size} viewBox="0 0 200 200" style={{ position: "absolute" }}>
      <Defs>
        <SvgLinear id={gid} x1="0" y1="0" x2="1" y2="1"><Stop offset="0" stopColor="#f3dfa2" /><Stop offset="0.5" stopColor="#c9a14a" /><Stop offset="1" stopColor="#e8c877" /></SvgLinear>
      </Defs>
      <Circle cx="100" cy="100" r="96" fill="none" stroke={`url(#${gid})`} strokeWidth={2.4} />
      <Circle cx="100" cy="100" r="92.5" fill="none" stroke="#e8c877" strokeWidth={0.6} opacity={0.45} />
    </Svg>
  );
});

const Glow = memo(function Glow({ size }: { size: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 200 200">
      <Circle cx="100" cy="100" r="95" fill="none" stroke="#f3dfa2" strokeWidth={5} />
    </Svg>
  );
});

export const TutorAvatarHidaya = memo(function TutorAvatarHidaya({ size = 40, still = false, speaking = false }: { size?: number; still?: boolean; speaking?: boolean }) {
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, "");
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
    <View style={{ width: size, height: size }} accessible accessibilityRole="image" accessibilityLabel="Hidaya">
      <Disc size={size} uid={uid} />
      <Animated.View style={[{ position: "absolute", width: size, height: size }, breathStyle]}>
        <Bust size={size} uid={uid} />
        {blink && <Lids size={size} />}
      </Animated.View>
      {speaking && <Animated.View pointerEvents="none" style={[{ position: "absolute", width: size, height: size }, glowStyle]}><Glow size={size} /></Animated.View>}
      <Ring size={size} uid={uid} />
    </View>
  );
});
