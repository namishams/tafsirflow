import { useEffect, useRef, useState } from "react";
import { AccessibilityInfo, Animated, Easing } from "react-native";

// Calm motion for the radio, reciter and khatm screens: slow turns and soft pulses, nothing that bounces.
// Everything stands still when the system asks for reduced motion.

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

/** a value that turns 0 → 1 → 2 … while `on`, and pauses where it is when `on` becomes false (CSS animation-play-state) */
export function useSpin(on: boolean, durationMs: number): Animated.Value {
  const v = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (!on) { v.stopAnimation(); return; }
    let stopped = false;
    const run = (from: number) => {
      const to = Math.floor(from) + 1;
      Animated.timing(v, { toValue: to, duration: Math.max(1, durationMs * (to - from)), easing: Easing.linear, useNativeDriver: true })
        .start(({ finished }) => { if (finished && !stopped) run(to); });
    };
    v.stopAnimation((cur) => run(cur));
    return () => { stopped = true; v.stopAnimation(); };
  }, [on, durationMs, v]);
  return v;
}

export const turn = (v: Animated.Value, dir: 1 | -1 = 1) =>
  v.interpolate({ inputRange: [0, 1], outputRange: ["0deg", `${dir * 360}deg`], extrapolate: "extend" });

/** 0 → 1 repeating (for pulses and equaliser bars); rests at `rest` when off */
export function useLoop(on: boolean, durationMs: number, delayMs = 0, rest = 0): Animated.Value {
  const v = useRef(new Animated.Value(rest)).current;
  useEffect(() => {
    if (!on) { v.stopAnimation(); v.setValue(rest); return; }
    v.setValue(0);
    const anim = Animated.sequence([
      Animated.delay(delayMs),
      Animated.loop(Animated.sequence([
        Animated.timing(v, { toValue: 1, duration: durationMs, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(v, { toValue: 0, duration: 0, useNativeDriver: true }),
      ])),
    ]);
    anim.start();
    return () => anim.stop();
  }, [on, durationMs, delayMs, rest, v]);
  return v;
}

/** soft fade-in on mount */
export function useFadeIn(reduce: boolean, durationMs = 1600): Animated.Value {
  const v = useRef(new Animated.Value(reduce ? 1 : 0)).current;
  useEffect(() => {
    if (reduce) { v.setValue(1); return; }
    Animated.timing(v, { toValue: 1, duration: durationMs, easing: Easing.out(Easing.cubic), useNativeDriver: true }).start();
  }, [reduce, durationMs, v]);
  return v;
}
