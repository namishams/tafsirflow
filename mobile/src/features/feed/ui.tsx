import { useEffect, useRef, useState } from "react";
import { tick } from "./haptics";
import { Animated, Easing, Pressable, Text, View } from "react-native";
import { Icon, type IconName } from "@/components/icons";
import { FONT } from "@/lib/theme";
import { HEART } from "@/features/extra/SocialBar";

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
