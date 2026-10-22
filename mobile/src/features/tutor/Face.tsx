import { useEffect } from "react";
import Animated, { Easing, cancelAnimation, useAnimatedStyle, useSharedValue, withRepeat, withSequence, withTiming } from "react-native-reanimated";
import Svg, { Circle, Defs, LinearGradient, Path, RadialGradient, Stop } from "react-native-svg";
import { useReducedMotion } from "@/features/library/motion";
import { TutorAvatar } from "./TutorAvatar";
import { TutorAvatarHidaya } from "./TutorAvatarHidaya";
import type { Persona } from "./prefs";

/** the tutor's face; while thinking it nods slowly and slightly (not under Reduce Motion; website: TutorChat.tsx NOD) */
export function TutorFace({ persona, size = 40, still, speaking, thinking }: { persona: Persona; size?: number; still?: boolean; speaking?: boolean; thinking?: boolean }) {
  const reduce = useReducedMotion();
  const nod = useSharedValue(0);
  const on = !!thinking && !reduce && !still;
  useEffect(() => {
    if (!on) { cancelAnimation(nod); nod.value = withTiming(0, { duration: 200 }); return; }
    const ease = Easing.inOut(Easing.sin);
    nod.value = withRepeat(withSequence(
      withTiming(1, { duration: 470, easing: ease }), withTiming(0, { duration: 360, easing: ease }),
      withTiming(0.6, { duration: 310, easing: ease }), withTiming(0, { duration: 300, easing: ease }),
      withTiming(0, { duration: 1160 }),
    ), -1, false);
    return () => cancelAnimation(nod);
  }, [on, nod]);
  const style = useAnimatedStyle(() => ({ transform: [{ translateY: nod.value * (size / 28) }, { rotate: `${nod.value * 1.5}deg` }] }));
  const face = persona === "hidaya" ? <TutorAvatarHidaya size={size} still={still} speaking={speaking} /> : <TutorAvatar size={size} still={still} speaking={speaking} />;
  return <Animated.View style={style}>{face}<Sheen size={size} /></Animated.View>;
}

/** the premium finish over both portraits (same geometry as the website's TutorChat.tsx FaceSheen): a soft rim light
 *  from the upper left, a gold ornament halo of sixteen small lozenges inside the ring, and a gentle vignette */
const HALO = Array.from({ length: 16 }, (_, i) => { const a = (i / 16) * Math.PI * 2, r = 88.5, x = 100 + r * Math.cos(a), y = 100 + r * Math.sin(a); return `M${x.toFixed(1)} ${(y - 2.4).toFixed(1)}L${(x + 1.6).toFixed(1)} ${y.toFixed(1)}L${x.toFixed(1)} ${(y + 2.4).toFixed(1)}L${(x - 1.6).toFixed(1)} ${y.toFixed(1)}Z`; }).join("");
function Sheen({ size }: { size: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 200 200" style={{ position: "absolute" }} pointerEvents="none">
      <Defs>
        <RadialGradient id="sheenV" cx="50%" cy="45%" r="55%"><Stop offset="0.72" stopColor="#04201a" stopOpacity={0} /><Stop offset="1" stopColor="#04201a" stopOpacity={0.28} /></RadialGradient>
        <LinearGradient id="sheenRim" x1="0" y1="0" x2="1" y2="1"><Stop offset="0" stopColor="#fff6dc" stopOpacity={0.55} /><Stop offset="0.45" stopColor="#fff6dc" stopOpacity={0} /></LinearGradient>
      </Defs>
      <Circle cx="100" cy="100" r="94" fill="url(#sheenV)" />
      <Path d="M22 100A78 78 0 0 1 100 22" fill="none" stroke="url(#sheenRim)" strokeWidth={5} strokeLinecap="round" />
      {size >= 40 ? <Path d={HALO} fill="#e8c877" opacity={0.55} /> : null}
    </Svg>
  );
}
