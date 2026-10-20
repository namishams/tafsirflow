import { useEffect, useState } from "react";
import { AccessibilityInfo } from "react-native";

// "Reduce motion" of the system: the website turns its animations off under prefers-reduced-motion; the app does the same.
export function useReducedMotionX(): boolean {
  const [on, setOn] = useState(false);
  useEffect(() => {
    let alive = true;
    AccessibilityInfo.isReduceMotionEnabled().then((v) => { if (alive) setOn(v); }).catch(() => undefined);
    const sub = AccessibilityInfo.addEventListener("reduceMotionChanged", setOn);
    return () => { alive = false; sub.remove(); };
  }, []);
  return on;
}
