import type { ReactNode } from "react";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { GlassView, isLiquidGlassAvailable } from "expo-glass-effect";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ARABIC_FONT, FONT, R, useTheme } from "@/lib/theme";

// Small building blocks of the recitation trainer (Shams 3.0): the bottom dock that keeps the main action in thumb
// reach (Liquid Glass on current iOS), status pills, the 1–4 rating chips and the coloured verse words.
const GLASS = Platform.OS === "ios" && isLiquidGlassAvailable();
export const RED = "rgb(160,58,52)";

/** floating dock at the bottom of the screen for the primary action(s); the page leaves room for it */
export function Dock({ children }: { children: ReactNode }) {
  const t = useTheme();
  const insets = useSafeAreaInsets();
  const inner = <View style={{ flexDirection: "row", gap: 10, alignItems: "center", padding: 10 }}>{children}</View>;
  return (
    <View pointerEvents="box-none" style={{ position: "absolute", left: 0, right: 0, bottom: 0, paddingHorizontal: 14, paddingBottom: Math.max(insets.bottom, 12) }}>
      {GLASS ? (
        <GlassView glassEffectStyle={t.dark ? "clear" : "regular"} tintColor={t.dark ? "rgba(5,28,21,0.55)" : "rgba(255,255,255,0.6)"}
          style={{ borderRadius: 30, borderWidth: StyleSheet.hairlineWidth, borderColor: t.line, overflow: "hidden" }}>{inner}</GlassView>
      ) : (
        <View style={{ borderRadius: 30, borderWidth: 1, borderColor: t.line, backgroundColor: t.surface, shadowColor: "#000", shadowOpacity: 0.12, shadowRadius: 18, shadowOffset: { width: 0, height: 6 }, elevation: 6 }}>{inner}</View>
      )}
    </View>
  );
}
/** the room a page leaves under its content for the dock */
export const DOCK_SPACE = 120;

/** capsule button for the dock: primary = emerald (recording) or gold; quiet = hairline */
export function Capsule({ title, onPress, tone = "gold", disabled, flex = 1, icon }: { title: string; onPress: () => void; tone?: "gold" | "emerald" | "red" | "quiet"; disabled?: boolean; flex?: number; icon?: ReactNode }) {
  const t = useTheme();
  const bg = tone === "gold" ? "#d4b877" : tone === "emerald" ? t.accent : tone === "red" ? RED : "transparent";
  const fg = tone === "gold" ? "rgb(8,38,29)" : tone === "quiet" ? t.ink : tone === "emerald" ? t.onAccent : "#ffffff";
  return (
    <Pressable onPress={onPress} disabled={disabled} accessibilityRole="button" accessibilityLabel={title} accessibilityState={{ disabled: !!disabled }}
      style={({ pressed }) => ({ flex, minHeight: 52, borderRadius: R.pill, paddingHorizontal: 18, alignItems: "center", justifyContent: "center", flexDirection: "row", gap: 8,
        backgroundColor: bg, borderWidth: tone === "quiet" ? 1 : 0, borderColor: t.line, opacity: disabled ? 0.45 : pressed ? 0.85 : 1, transform: [{ scale: pressed ? 0.98 : 1 }] })}>
      {icon}
      <Text numberOfLines={1} style={{ fontFamily: FONT.bold, fontSize: 15.5, color: fg }}>{title}</Text>
    </Pressable>
  );
}

export function Pill({ label, tone }: { label: string; tone: "ok" | "warn" | "bad" | "info" }) {
  const t = useTheme();
  const c = tone === "ok" ? t.accent : tone === "warn" ? t.gold : tone === "bad" ? RED : t.muted;
  const bg = tone === "ok" ? t.accentSoft : tone === "warn" ? "rgba(201,166,94,0.16)" : tone === "bad" ? "rgba(160,58,52,0.12)" : t.bg;
  return (
    <View style={{ paddingHorizontal: 10, height: 24, borderRadius: R.pill, justifyContent: "center", backgroundColor: bg }}>
      <Text style={{ fontFamily: FONT.semibold, fontSize: 11.5, color: c }}>{label}</Text>
    </View>
  );
}

/** 1–4 chips (again, hesitant, good, easy) */
export function RateChips({ value, onChange, labels }: { value: number; onChange: (v: 1 | 2 | 3 | 4) => void; labels: [string, string, string, string] }) {
  const t = useTheme();
  return (
    <View style={{ flexDirection: "row", gap: 6 }}>
      {([1, 2, 3, 4] as const).map((v) => {
        const on = value === v;
        const c = v === 1 ? RED : v === 2 ? t.gold : t.accent;
        return (
          <Pressable key={v} onPress={() => onChange(v)} accessibilityRole="radio" accessibilityState={{ selected: on }} accessibilityLabel={labels[v - 1]}
            style={{ flex: 1, height: 36, borderRadius: R.pill, borderWidth: 1, borderColor: on ? c : t.line, backgroundColor: on ? (v === 1 ? "rgba(160,58,52,0.12)" : v === 2 ? "rgba(201,166,94,0.16)" : t.accentSoft) : t.surface, alignItems: "center", justifyContent: "center" }}>
            <Text numberOfLines={1} style={{ fontFamily: FONT.semibold, fontSize: 12.5, color: on ? c : t.ink }}>{labels[v - 1]}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

/** a verse's words, coloured: heard (ink), possibly missed (gold, underlined); tap for playback */
export function MarkedWords({ words, marks, onWord, active, size = 24 }: { words: { position: number; text: string }[]; marks: Map<number, boolean>; onWord?: (position: number) => void; active?: number | null; size?: number }) {
  const t = useTheme();
  return (
    <View style={{ flexDirection: "row", direction: "rtl", flexWrap: "wrap", gap: 4 }}>
      {words.map((w) => {
        const ok = marks.get(w.position);
        const missed = ok === false;
        const inner = (
          <Text style={{ fontFamily: ARABIC_FONT, fontSize: size, lineHeight: size * 1.85, color: missed ? t.gold : t.ink, writingDirection: "rtl", textDecorationLine: missed ? "underline" : "none", textDecorationColor: t.gold }}>{w.text}</Text>
        );
        const style = { paddingHorizontal: 5, borderRadius: R.md, backgroundColor: active === w.position ? t.accentSoft : missed ? "rgba(201,166,94,0.12)" : "transparent" };
        return onWord ? <Pressable key={w.position} onPress={() => onWord(w.position)} accessibilityRole="button" style={style}>{inner}</Pressable> : <View key={w.position} style={style}>{inner}</View>;
      })}
    </View>
  );
}

/** a small stepper (− value +) for verse numbers */
export function Stepper({ label, value, min, max, onChange, format }: { label: string; value: number; min: number; max: number; onChange: (v: number) => void; format: (n: number) => string }) {
  const t = useTheme();
  const b = (d: number, sym: string) => (
    <Pressable onPress={() => onChange(Math.min(max, Math.max(min, value + d)))} disabled={value + d < min || value + d > max} accessibilityRole="button" accessibilityLabel={`${label} ${sym}`} hitSlop={6}
      style={({ pressed }) => ({ width: 36, height: 36, borderRadius: 18, borderWidth: 1, borderColor: t.line, alignItems: "center", justifyContent: "center", opacity: value + d < min || value + d > max ? 0.35 : pressed ? 0.7 : 1, backgroundColor: t.surface })}>
      <Text style={{ fontFamily: FONT.bold, fontSize: 18, color: t.ink }}>{sym}</Text>
    </Pressable>
  );
  return (
    <View style={{ flex: 1, gap: 6 }}>
      <Text style={{ fontFamily: FONT.semibold, fontSize: 12, color: t.muted }}>{label}</Text>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
        {b(-1, "−")}
        <Text style={{ flex: 1, textAlign: "center", fontFamily: FONT.bold, fontSize: 17, color: t.ink }}>{format(value)}</Text>
        {b(1, "+")}
      </View>
    </View>
  );
}
