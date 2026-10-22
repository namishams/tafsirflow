// Dalil, the AI tutor: a calm sheikh in white ghutra, dark agal and a black bisht with gold trim, drawn as a
// circular emerald badge in the garden style (react-native-svg gradients, soft layered shapes, 200 x 200 viewBox).
// Same artwork (same paths) as the website's src/components/tutor/TutorAvatar.tsx.
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
  const id: Ids = (n) => `dalil-${uid}-${n}`;
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
  const id: Ids = (n) => `dalil-${uid}-${n}`;
  const u = (n: string) => `url(#${id(n)})`;
  return (
    <Svg width={size} height={size} viewBox="0 0 200 200">
      <Defs>
        <RadialGradient id={id("bg")} cx="50%" cy="40%" r="62%"><Stop offset="0" stopColor="#3f9a68" /><Stop offset="0.55" stopColor="#1f6b4a" /><Stop offset="1" stopColor="#0c4a37" /></RadialGradient>
        <SvgLinear id={id("gold")} x1="0" y1="0" x2="1" y2="1"><Stop offset="0" stopColor="#f3dfa2" /><Stop offset="0.5" stopColor="#c9a14a" /><Stop offset="1" stopColor="#e8c877" /></SvgLinear>
        <SvgLinear id={id("trim")} x1="0" y1="0" x2="0" y2="1"><Stop offset="0" stopColor="#f3dfa2" /><Stop offset="1" stopColor="#c9a14a" /></SvgLinear>
        <SvgLinear id={id("ghutra")} x1="0" y1="0" x2="1" y2="0"><Stop offset="0" stopColor="#e4dfd3" /><Stop offset="0.35" stopColor="#f7f4ec" /><Stop offset="0.65" stopColor="#f7f4ec" /><Stop offset="1" stopColor="#ddd7ca" /></SvgLinear>
        <SvgLinear id={id("bisht")} x1="0" y1="0" x2="0" y2="1"><Stop offset="0" stopColor="#2c2f33" /><Stop offset="1" stopColor="#121416" /></SvgLinear>
        <SvgLinear id={id("skin")} x1="0" y1="0" x2="0" y2="1"><Stop offset="0" stopColor="#d4a080" /><Stop offset="0.6" stopColor="#c89474" /><Stop offset="1" stopColor="#b8826a" /></SvgLinear>
        <SvgLinear id={id("beard")} x1="0" y1="0" x2="0" y2="1"><Stop offset="0" stopColor="#2e2520" /><Stop offset="0.75" stopColor="#3a302a" /><Stop offset="1" stopColor="#6b635b" /></SvgLinear>
        <SvgLinear id={id("thobe")} x1="0" y1="0" x2="1" y2="0"><Stop offset="0" stopColor="#dcd6c9" /><Stop offset="0.5" stopColor="#f7f4ec" /><Stop offset="1" stopColor="#dcd6c9" /></SvgLinear>
        <ClipPath id={id("clip")}><Circle cx="100" cy="100" r="97" /></ClipPath>
      </Defs>
      <G clipPath={u("clip")}>
        {/* ghutra (back), shadowed lining around the face */}
        <Path d="M100 24C135 24 153 45 154 76C155 104 158 128 168 150L170 176L30 176L32 150C42 128 45 104 46 76C47 45 65 24 100 24Z" fill={u("ghutra")} />
        <Ellipse cx="100" cy="102" rx="34" ry="44" fill="#cfc8b9" />
        {/* thobe, neck, collar and tassel */}
        <Path d="M66 152C80 146 120 146 134 152L134 200L66 200Z" fill={u("thobe")} />
        <Path d="M86 126L86 150C94 157 106 157 114 150L114 126Z" fill="#a8765a" />
        <Path d="M85 149C92 157 108 157 115 149" fill="none" stroke="#d6d0c2" strokeWidth={2.4} strokeLinecap="round" />
        <Path d="M100 156L100 182" stroke="#e2dccf" strokeWidth={2} strokeLinecap="round" />
        <Ellipse cx="100" cy="185" rx="2.2" ry="3.4" fill="#e2dccf" />
        {/* bisht with gold trim */}
        <Path d="M2 200C6 172 32 156 64 151C72 150 78 150 83 152C85 170 89 186 92 200Z" fill={u("bisht")} />
        <Path d="M198 200C194 172 168 156 136 151C128 150 122 150 117 152C115 170 111 186 108 200Z" fill={u("bisht")} />
        <Path d="M83 152C85 170 89 186 92 200" fill="none" stroke={u("trim")} strokeWidth={3.4} strokeLinecap="round" />
        <Path d="M117 152C115 170 111 186 108 200" fill="none" stroke={u("trim")} strokeWidth={3.4} strokeLinecap="round" />
        <Path d="M78.5 153C80 160 81 166 83.5 172" fill="none" stroke="#c9a14a" strokeWidth={1.4} strokeLinecap="round" opacity={0.8} />
        <Path d="M121.5 153C120 160 119 166 116.5 172" fill="none" stroke="#c9a14a" strokeWidth={1.4} strokeLinecap="round" opacity={0.8} />
        <Path d="M40 162C46 170 50 182 52 200" fill="none" stroke="#000" strokeWidth={1.4} opacity={0.25} />
        <Path d="M160 162C154 170 150 182 148 200" fill="none" stroke="#000" strokeWidth={1.4} opacity={0.25} />
        {/* face */}
        <Ellipse cx="100" cy="100" rx="26" ry="33" fill={u("skin")} />
        <Ellipse cx="83" cy="110" rx="5" ry="3.5" fill="#d98a72" opacity={0.25} />
        <Ellipse cx="117" cy="110" rx="5" ry="3.5" fill="#d98a72" opacity={0.25} />
        {/* beard with a touch of grey */}
        <Path d="M74 96C74.5 110 79.5 117.5 88 120C94 121.6 106 121.6 112 120C120.5 117.5 125.5 110 126 96C129.5 119 127 136 118 145C112 150 105.5 152.5 100 152.5C94.5 152.5 88 150 82 145C73 136 70.5 119 74 96Z" fill={u("beard")} />
        <Path d="M94 136Q96 144 95 150M106 136Q104 144 105 150M100 140L100 151.5" fill="none" stroke="#cfc9c0" strokeWidth={1} strokeLinecap="round" opacity={0.5} />
        <Path d="M76 116Q78 124 81 129M124 116Q122 124 119 129" fill="none" stroke="#c7c1b8" strokeWidth={0.9} strokeLinecap="round" opacity={0.4} />
        {/* gentle smile, moustache, nose */}
        <Path d="M94 125Q100 130 106 125Q100 127.6 94 125Z" fill="#b0705c" />
        <Path d="M92.3 123.6Q100 127.6 107.7 123.6" fill="none" stroke="#6e4031" strokeWidth={1.1} strokeLinecap="round" />
        <Path d="M86.5 121C90 115 97 114.5 100 117C103 114.5 110 115 113.5 121C109 122.8 104 122.3 100 120.8C96 122.3 91 122.8 86.5 121Z" fill="#2a221d" />
        <Path d="M98.6 98C98.4 104 97.4 108 96.2 110.8" fill="none" stroke="#a06c52" strokeWidth={1.3} strokeLinecap="round" opacity={0.8} />
        <Path d="M95.2 111.6Q96.5 114.2 100 114.2Q103.5 114.2 104.8 111.6" fill="none" stroke="#93604a" strokeWidth={1.4} strokeLinecap="round" />
        <Path d="M101.5 100C102 104 102.6 107 103.2 109" fill="none" stroke="#e2b394" strokeWidth={1.2} strokeLinecap="round" opacity={0.6} />
        {/* eyes */}
        <Path d="M81.5 96Q88 91.6 94.5 96Q88 99.4 81.5 96Z" fill="#fbf7ee" />
        <Circle cx="88.3" cy="95.7" r="2.7" fill="#3b2617" />
        <Circle cx="88.3" cy="95.7" r="1.3" fill="#140c08" />
        <Circle cx="89.2" cy="94.8" r="0.7" fill="#fff" />
        <Path d="M81 96.2Q88 90.8 95 96" fill="none" stroke="#2f2119" strokeWidth={1.5} strokeLinecap="round" />
        <Path d="M105.5 96Q112 91.6 118.5 96Q112 99.4 105.5 96Z" fill="#fbf7ee" />
        <Circle cx="111.7" cy="95.7" r="2.7" fill="#3b2617" />
        <Circle cx="111.7" cy="95.7" r="1.3" fill="#140c08" />
        <Circle cx="112.6" cy="94.8" r="0.7" fill="#fff" />
        <Path d="M105 96Q112 90.8 119 96.2" fill="none" stroke="#2f2119" strokeWidth={1.5} strokeLinecap="round" />
        <Path d="M83 99.3Q88 101 93 99.3M107 99.3Q112 101 117 99.3" fill="none" stroke="#a8765a" strokeWidth={0.8} opacity={0.7} />
        {/* brows */}
        <Path d="M79.5 88.5Q87 83.5 95.5 87" fill="none" stroke="#2b211c" strokeWidth={3} strokeLinecap="round" />
        <Path d="M120.5 88.5Q113 83.5 104.5 87" fill="none" stroke="#2b211c" strokeWidth={3} strokeLinecap="round" />
        {/* ghutra front fold over the forehead */}
        <Path d="M58 96C57 64 76 46 100 46C124 46 143 64 142 96C138 78 124 67 104 65.5L100 68L96 65.5C76 67 62 78 58 96Z" fill={u("ghutra")} />
        <Path d="M62 86C68 74 82 68 96 67L100 69.5L104 67C118 68 132 74 138 86" fill="none" stroke="#6b5a48" strokeWidth={2.5} opacity={0.18} />
        {/* agal */}
        <Path d="M55 58Q100 32 145 58" fill="none" stroke="#1a1a1c" strokeWidth={5.5} strokeLinecap="round" />
        <Path d="M57 48Q100 22 143 48" fill="none" stroke="#1a1a1c" strokeWidth={5} strokeLinecap="round" />
        <Path d="M60 56Q100 33 140 56M62 46Q100 23.5 138 46" fill="none" stroke="#5a5a60" strokeWidth={1} opacity={0.6} />
      </G>
    </Svg>
  );
});

// only the eyelids, drawn over the open eyes for a blink (same coordinates as the bust)
const Lids = memo(function Lids({ size }: { size: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 200 200" style={{ position: "absolute" }}>
      <Path d="M80.5 96.2Q88 90.4 95.5 96Q88 100 80.5 96.2Z" fill="#c89474" />
      <Path d="M104.5 96Q112 90.4 119.5 96.2Q112 100 104.5 96Z" fill="#c89474" />
      <Path d="M81.5 96.8Q88 99.2 94.5 96.8M105.5 96.8Q112 99.2 118.5 96.8" fill="none" stroke="#2f2119" strokeWidth={1.5} strokeLinecap="round" />
    </Svg>
  );
});

const Ring = memo(function Ring({ size, uid }: { size: number; uid: string }) {
  const gid = `dalil-${uid}-gold`;
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

export const TutorAvatar = memo(function TutorAvatar({ size = 40, still = false, speaking = false }: { size?: number; still?: boolean; speaking?: boolean }) {
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
    <View style={{ width: size, height: size }} accessible accessibilityRole="image" accessibilityLabel="Dalil">
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
