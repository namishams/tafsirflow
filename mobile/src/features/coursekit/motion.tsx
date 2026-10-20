import { useEffect, useRef, useState, type ReactNode } from "react";
import { AccessibilityInfo, Animated, Easing, type StyleProp, type ViewStyle } from "react-native";

// Calm motion for the courses, after the website's art-practice.css: content steps in (.step-in), a right answer
// sends out one soft gold ring (.pa-right), a wrong one nudges sideways once (.pa-shake). Nothing bounces, and
// everything stays still when the system asks for reduced motion.

export function useReduceMotion(): boolean {
  const [reduce, setReduce] = useState(false);
  useEffect(() => {
    let alive = true;
    AccessibilityInfo.isReduceMotionEnabled().then((v) => { if (alive) setReduce(v); }).catch(() => undefined);
    const sub = AccessibilityInfo.addEventListener("reduceMotionChanged", setReduce);
    return () => { alive = false; sub.remove(); };
  }, []);
  return reduce;
}

/** content fades in and rises a few points (website .step-in / .rise) */
export function StepIn({ children, style, delay = 0, distance = 10 }: { children: ReactNode; style?: StyleProp<ViewStyle>; delay?: number; distance?: number }) {
  const reduce = useReduceMotion();
  const v = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (reduce) { v.setValue(1); return; }
    const a = Animated.timing(v, { toValue: 1, duration: 450, delay, easing: Easing.bezier(0.2, 0.7, 0.2, 1), useNativeDriver: true });
    a.start();
    return () => a.stop();
  }, [reduce, v, delay]);
  return (
    <Animated.View style={[style, { opacity: v, transform: [{ translateY: v.interpolate({ inputRange: [0, 1], outputRange: [distance, 0] }) }] }]}>
      {children}
    </Animated.View>
  );
}

/** a gentle horizontal nudge for a wrong answer; returns the style and the trigger */
export function useNudge() {
  const reduce = useReduceMotion();
  const x = useRef(new Animated.Value(0)).current;
  const run = () => {
    if (reduce) return;
    x.setValue(0);
    const step = (to: number, d: number) => Animated.timing(x, { toValue: to, duration: d, easing: Easing.inOut(Easing.quad), useNativeDriver: true });
    Animated.sequence([step(-4, 105), step(4, 210), step(0, 105)]).start();
  };
  return { style: { transform: [{ translateX: x }] }, run };
}

/** one soft gold ring that spreads and fades around a right answer (website .pa-right) */
export function GoldRing({ on, radius = 12 }: { on: boolean; radius?: number }) {
  const reduce = useReduceMotion();
  const v = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (!on || reduce) return;
    v.setValue(0);
    const a = Animated.timing(v, { toValue: 1, duration: 600, easing: Easing.out(Easing.quad), useNativeDriver: true });
    a.start();
    return () => a.stop();
  }, [on, reduce, v]);
  if (!on || reduce) return null;
  return (
    <Animated.View pointerEvents="none" style={{
      position: "absolute", top: -2, left: -2, right: -2, bottom: -2, borderRadius: radius + 2, borderWidth: 2, borderColor: "rgb(201,166,94)",
      opacity: v.interpolate({ inputRange: [0, 1], outputRange: [0.55, 0] }),
      transform: [{ scale: v.interpolate({ inputRange: [0, 1], outputRange: [1, 1.06] }) }],
    }} />
  );
}

/** slow endless rotation (the medallion rosette, the alphabet ring) */
export function useTurn(on: boolean, ms: number) {
  const reduce = useReduceMotion();
  const v = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (!on || reduce) { v.setValue(0); return; }
    const a = Animated.loop(Animated.timing(v, { toValue: 1, duration: ms, easing: Easing.linear, useNativeDriver: true }));
    a.start();
    return () => a.stop();
  }, [on, reduce, ms, v]);
  return v.interpolate({ inputRange: [0, 1], outputRange: ["0deg", "360deg"] });
}
