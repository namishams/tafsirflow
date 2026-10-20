import { useEffect, useRef, useState, type ReactNode } from "react";
import { AccessibilityInfo, Animated, Easing, View, type StyleProp, type ViewStyle } from "react-native";
import Svg, { Defs, Path, RadialGradient, Stop } from "react-native-svg";
import { stage } from "@/lib/theme";

// The small animations of the website's achievements (globals.css): sticker-pop, sticker-rays, step-in and the pulse
// around the next station of the learning journey. All of them stand still when "Reduce motion" is on.

export function useReduceMotion() {
  const [reduce, setReduce] = useState(false);
  useEffect(() => {
    let off = false;
    AccessibilityInfo.isReduceMotionEnabled().then((r) => { if (!off) setReduce(r); }).catch(() => undefined);
    const sub = AccessibilityInfo.addEventListener("reduceMotionChanged", setReduce);
    return () => { off = true; sub.remove(); };
  }, []);
  return reduce;
}

/** .sticker-pop: grows from a small, turned seal into place */
export function StickerPop({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  const reduce = useReduceMotion();
  const v = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (reduce) { v.setValue(1); return; }
    Animated.timing(v, { toValue: 1, duration: 1100, easing: Easing.bezier(0.2, 0.9, 0.25, 1.25), useNativeDriver: true }).start();
  }, [reduce, v]);
  return (
    <Animated.View style={[style, {
      opacity: v.interpolate({ inputRange: [0, 0.3, 1], outputRange: [0, 1, 1], extrapolate: "clamp" }),
      transform: [{ scale: v.interpolate({ inputRange: [0, 1], outputRange: [0.3, 1] }) }, { rotate: v.interpolate({ inputRange: [0, 1], outputRange: ["-35deg", "0deg"] }) }],
    }]}>{children}</Animated.View>
  );
}

/** .step-in: fades in and rises a little */
export function StepIn({ children, delay = 0, style }: { children: ReactNode; delay?: number; style?: StyleProp<ViewStyle> }) {
  const reduce = useReduceMotion();
  const v = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (reduce) { v.setValue(1); return; }
    Animated.timing(v, { toValue: 1, duration: 500, delay, easing: Easing.bezier(0.2, 0.7, 0.2, 1), useNativeDriver: true }).start();
  }, [reduce, v, delay]);
  return <Animated.View style={[style, { opacity: v, transform: [{ translateY: v.interpolate({ inputRange: [0, 1], outputRange: [10, 0] }) }] }]}>{children}</Animated.View>;
}

// .sticker-rays: gold wedges (6° of every 18°) fading out from the centre, turning once in 30 s
const WEDGES = Array.from({ length: 20 }, (_, i) => {
  const a1 = ((i * 18 - 90) * Math.PI) / 180, a2 = ((i * 18 + 6 - 90) * Math.PI) / 180;
  return `M50 50L${(50 + 70 * Math.cos(a1)).toFixed(2)} ${(50 + 70 * Math.sin(a1)).toFixed(2)}L${(50 + 70 * Math.cos(a2)).toFixed(2)} ${(50 + 70 * Math.sin(a2)).toFixed(2)}Z`;
}).join("");
export function Rays({ size, style }: { size: number; style?: StyleProp<ViewStyle> }) {
  const reduce = useReduceMotion();
  const v = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (reduce) return;
    const loop = Animated.loop(Animated.timing(v, { toValue: 1, duration: 30000, easing: Easing.linear, useNativeDriver: true }));
    loop.start();
    return () => loop.stop();
  }, [reduce, v]);
  return (
    <Animated.View pointerEvents="none" style={[{ position: "absolute", width: size, height: size }, style, { transform: [{ rotate: v.interpolate({ inputRange: [0, 1], outputRange: ["0deg", "360deg"] }) }] }]}>
      <Svg width={size} height={size} viewBox="0 0 100 100">
        <Defs>
          <RadialGradient id="rays" cx="50" cy="50" r="50" gradientUnits="userSpaceOnUse">
            <Stop offset="0" stopColor={stage.gold} stopOpacity={0.16} />
            <Stop offset="0.62" stopColor={stage.gold} stopOpacity={0} />
          </RadialGradient>
        </Defs>
        <Path d={WEDGES} fill="url(#rays)" />
      </Svg>
    </Animated.View>
  );
}

/** .jn-glow + .jn-pulse: a soft gold glow and a ring that keeps widening around the next step */
export function Pulse({ size }: { size: number }) {
  const reduce = useReduceMotion();
  const v = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (reduce) return;
    const loop = Animated.loop(Animated.timing(v, { toValue: 1, duration: 2800, easing: Easing.bezier(0.2, 0.7, 0.2, 1), useNativeDriver: true }));
    loop.start();
    return () => loop.stop();
  }, [reduce, v]);
  const inner = size * 0.88;
  return (
    <View pointerEvents="none" style={{ position: "absolute", width: size, height: size, alignItems: "center", justifyContent: "center" }}>
      <Svg width={size * 1.36} height={size * 1.36} viewBox="0 0 100 100" style={{ position: "absolute" }}>
        <Defs>
          <RadialGradient id="glow" cx="50" cy="50" r="50" gradientUnits="userSpaceOnUse">
            <Stop offset="0" stopColor={stage.gold} stopOpacity={0.22} />
            <Stop offset="0.65" stopColor={stage.gold} stopOpacity={0} />
          </RadialGradient>
        </Defs>
        <Path d="M0 0H100V100H0Z" fill="url(#glow)" />
      </Svg>
      <Animated.View style={{
        position: "absolute", width: inner, height: inner, borderRadius: inner / 2, borderWidth: 2, borderColor: "rgba(214,180,108,0.5)",
        opacity: reduce ? 0.5 : v.interpolate({ inputRange: [0, 0.7, 1], outputRange: [0.9, 0, 0] }),
        transform: [{ scale: reduce ? 1.06 : v.interpolate({ inputRange: [0, 0.7, 1], outputRange: [1, 1 + 32 / inner, 1 + 32 / inner] }) }],
      }} />
    </View>
  );
}
