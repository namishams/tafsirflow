import { useEffect, useState } from "react";
import { AccessibilityInfo } from "react-native";

// "Reduce motion" of the system: the website stops the turning domes, the rain of light and the count-up animations
// under prefers-reduced-motion; the app does the same.
export function useReducedMotion(): boolean {
  const [on, setOn] = useState(false);
  useEffect(() => {
    let alive = true;
    AccessibilityInfo.isReduceMotionEnabled().then((v) => { if (alive) setOn(v); }).catch(() => undefined);
    const sub = AccessibilityInfo.addEventListener("reduceMotionChanged", setOn);
    return () => { alive = false; sub.remove(); };
  }, []);
  return on;
}

/** a value that resolves once (the website's content loaders are async but answer at once for German and English) */
export function useAsyncValue<T>(load: () => Promise<T>, deps: unknown[]): T | null {
  const [v, setV] = useState<T | null>(null);
  useEffect(() => {
    let alive = true;
    load().then((x) => { if (alive) setV(x); }).catch(() => undefined);
    return () => { alive = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
  return v;
}
