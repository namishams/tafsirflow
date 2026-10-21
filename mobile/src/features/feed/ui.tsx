import { useEffect, useRef, useState } from "react";
import { tick } from "./haptics";
import { ActivityIndicator, Animated, Easing, Pressable, Text, View } from "react-native";
import { Icon, type IconName } from "@/components/icons";
import { FONT, R, stage, useTheme } from "@/lib/theme";
import { HEART } from "@/features/extra/SocialBar";
import { useFeedText } from "./texts";

// Small parts shared by every feed page: the round action buttons of the side column and the heart that pops on a
// double tap.

export function Action({ icon, color, label, a11y, onPress, filled, selected, disabled, scale, custom }: {
  icon?: IconName; color: string; label: string; a11y: string; onPress: () => void; filled?: boolean; selected?: boolean; disabled?: boolean; scale?: Animated.Value; custom?: React.ReactNode;
}) {
  return (
    <Pressable onPress={onPress} disabled={disabled} accessibilityRole="button" accessibilityLabel={a11y} accessibilityState={{ selected, disabled }} hitSlop={6}
      style={({ pressed }) => ({ alignItems: "center", gap: 4, opacity: disabled ? 0.5 : pressed ? 0.7 : 1, width: 70 })}>
      <View style={{ width: 46, height: 46, borderRadius: 23, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(5,28,21,0.45)", borderWidth: 1, borderColor: "rgba(214,180,108,0.35)" }}>
        <Animated.View style={scale ? { transform: [{ scale }] } : undefined}>{custom ?? (icon ? <Icon name={icon} filled={filled} color={color} size={22} /> : null)}</Animated.View>
      </View>
      <Text numberOfLines={2} style={{ fontFamily: FONT.semibold, fontSize: 11, lineHeight: 13, color: "#fff", textAlign: "center", textShadowColor: "rgba(0,0,0,0.5)", textShadowRadius: 3 }}>{label}</Text>
    </Pressable>
  );
}

/** the gold heart of a double tap (a calm fade, no bounce); `n` changes for every burst. Reduce Motion: shown briefly without movement. */
export function HeartBurst({ n, reduce }: { n: number; reduce: boolean }) {
  const v = useRef(new Animated.Value(0)).current;
  const [on, setOn] = useState(false);
  useEffect(() => {
    if (!n) return;
    tick();
    setOn(true);
    if (reduce) { v.setValue(1); const id = setTimeout(() => setOn(false), 650); return () => clearTimeout(id); }
    v.setValue(0);
    const a = Animated.sequence([
      Animated.timing(v, { toValue: 1, duration: 260, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      Animated.delay(320),
      Animated.timing(v, { toValue: 2, duration: 320, easing: Easing.in(Easing.quad), useNativeDriver: true }),
    ]);
    a.start(() => setOn(false));
    return () => a.stop();
  }, [n, reduce, v]);
  if (!on) return null;
  const scale = reduce ? 1 : v.interpolate({ inputRange: [0, 1, 2], outputRange: [0.8, 1, 1.06] });
  const opacity = reduce ? 0.95 : v.interpolate({ inputRange: [0, 0.4, 1, 2], outputRange: [0, 1, 1, 0] });
  return (
    <View pointerEvents="none" style={{ position: "absolute", left: 0, right: 0, top: 0, bottom: 0, alignItems: "center", justifyContent: "center" }} accessibilityElementsHidden>
      <Animated.View style={{ opacity, transform: [{ scale }] }}><Icon name="heart" filled color={HEART} size={104} /></Animated.View>
    </View>
  );
}

/** tap, double tap and long press on one surface (Instagram Reels): single taps wait briefly for a second tap */
export function useTapGestures({ onTap, onDouble, onHoldStart, onHoldEnd }: { onTap: () => void; onDouble: () => void; onHoldStart?: () => void; onHoldEnd?: () => void }) {
  const last = useRef(0);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const holding = useRef(false);
  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);
  return {
    onPress: () => {
      const now = Date.now();
      if (now - last.current < 280) {
        last.current = 0;
        if (timer.current) { clearTimeout(timer.current); timer.current = null; }
        onDouble();
        return;
      }
      last.current = now;
      timer.current = setTimeout(() => { timer.current = null; onTap(); }, 280);
    },
    onLongPress: () => { holding.current = true; onHoldStart?.(); },
    onPressOut: () => { if (holding.current) { holding.current = false; onHoldEnd?.(); } },
    delayLongPress: 380,
  };
}

/** how long an empty list may wait for its first posts before it says that nothing arrived (offline, a source down) */
export const STALL_MS = 9000;
/** true when `empty` has lasted STALL_MS; restarts whenever one of `deps` (topic, retry …) changes */
export function useStalled(empty: boolean, deps: unknown[]): [boolean, (v: boolean) => void] {
  const [stalled, setStalled] = useState(false);
  useEffect(() => {
    setStalled(false);
    if (!empty) return;
    const id = setTimeout(() => setStalled(true), STALL_MS);
    return () => clearTimeout(id);
  }, [empty, ...deps]); // eslint-disable-line react-hooks/exhaustive-deps
  return [stalled, setStalled];
}

/**
 * The empty state of a feed list: a spinner while the first posts load, then (nothing arrived) the reason with
 * "Try again", or a plain message (no search results). `onDark`: white text on the emerald stage (Reels).
 */
export function FeedEmpty({ state, message, onRetry, onDark }: { state: "loading" | "failed" | "message"; message?: string; onRetry?: () => void; onDark?: boolean }) {
  const t = useTheme();
  const tx = useFeedText();
  const ink = onDark ? "#fff" : t.ink;
  const muted = onDark ? stage.textSoft : t.muted;
  if (state === "loading") {
    return (
      <View style={{ alignItems: "center", justifyContent: "center", paddingVertical: 56, gap: 12 }} accessible accessibilityLabel={tx.loadingPosts} accessibilityRole="progressbar">
        <ActivityIndicator color={onDark ? stage.gold : t.accent} />
        <Text style={{ fontFamily: FONT.regular, fontSize: 13.5, color: muted }}>{tx.loadingPosts}</Text>
      </View>
    );
  }
  return (
    <View style={{ alignItems: "center", justifyContent: "center", paddingVertical: 48, paddingHorizontal: 32, gap: 14 }}>
      <Icon name={state === "failed" ? "globe" : "search"} color={muted} size={28} />
      <Text accessibilityLiveRegion="polite" style={{ fontFamily: FONT.regular, fontSize: 15, lineHeight: 22, color: state === "failed" ? muted : ink, textAlign: "center" }}>{message ?? tx.loadFailed}</Text>
      {state === "failed" && onRetry ? (
        <Pressable onPress={() => { tick(); onRetry(); }} accessibilityRole="button" hitSlop={6}
          style={({ pressed }) => ({ minHeight: 44, paddingHorizontal: 22, borderRadius: R.pill, justifyContent: "center", borderWidth: 1, borderColor: onDark ? stage.goldSoft : t.gold, backgroundColor: pressed ? (onDark ? "rgba(214,180,108,0.16)" : t.accentSoft) : "transparent" })}>
          <Text style={{ fontFamily: FONT.semibold, fontSize: 14.5, color: ink }}>{tx.retry}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}
