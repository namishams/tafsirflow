import { useState, type ReactNode } from "react";
import { Platform, Pressable, ScrollView, StyleSheet, Text, View, type StyleProp, type ViewStyle } from "react-native";
import { StatusBar } from "expo-status-bar";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import { GlassView, isLiquidGlassAvailable } from "expo-glass-effect";
import { SafeAreaInsetsContext, useSafeAreaInsets } from "react-native-safe-area-context";
import { FONT, goldButton, stage, useTheme } from "@/lib/theme";

// Liquid Glass for the prayer and wudu trainers (website: the .tg-* classes in components/art/TrainerScene.tsx): Apple's
// glass material where the system has it (expo-glass-effect), a frosted blur with a specular top edge elsewhere; a gold
// "lens" marks the selected or primary control; the play controls sit in a glass dock right under the picture (part of
// the card, so they never cover any text).

const LIQUID = Platform.OS === "ios" && isLiquidGlassAvailable();

/** a glass surface on the dark stage */
export function Glass({ children, style, radius = 22, dark = false, interactive = false }: { children?: ReactNode; style?: StyleProp<ViewStyle>; radius?: number; dark?: boolean; interactive?: boolean }) {
  const flat = StyleSheet.flatten(style) ?? {};
  if (LIQUID) {
    return (
      <GlassView glassEffectStyle="clear" isInteractive={interactive} tintColor={dark ? "rgba(4,32,24,0.45)" : "rgba(255,255,255,0.06)"}
        style={[{ borderRadius: radius, borderWidth: StyleSheet.hairlineWidth, borderColor: "rgba(255,255,255,0.22)", overflow: "hidden" }, flat]}>
        {children}
      </GlassView>
    );
  }
  return (
    <View style={[{ borderRadius: radius, overflow: "hidden", borderWidth: StyleSheet.hairlineWidth, borderColor: "rgba(255,255,255,0.2)" }, flat]}>
      <BlurView intensity={28} tint="dark" style={StyleSheet.absoluteFill} />
      <LinearGradient pointerEvents="none" colors={dark ? ["rgba(6,38,28,0.62)", "rgba(4,29,22,0.5)"] : ["rgba(255,255,255,0.13)", "rgba(255,255,255,0.045)"]} style={StyleSheet.absoluteFill} />
      <LinearGradient pointerEvents="none" colors={["transparent", "rgba(255,255,255,0.55)", "transparent"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={{ position: "absolute", top: 0, left: radius * 0.6, right: radius * 0.6, height: 1 }} />
      {children}
    </View>
  );
}

/** the gold lens of a selected segment or the primary button */
export function Lens({ children, style }: { children?: ReactNode; style?: StyleProp<ViewStyle> }) {
  return (
    <LinearGradient colors={["#f2dfaa", "#c6a65e"]} style={[{ borderRadius: 999, alignItems: "center", justifyContent: "center", shadowColor: "#c6a65e", shadowOpacity: 0.6, shadowRadius: 10, shadowOffset: { width: 0, height: 4 } }, style]}>
      <LinearGradient pointerEvents="none" colors={["rgba(255,255,255,0.55)", "transparent"]} start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }} style={{ position: "absolute", top: 0, left: 10, right: 10, height: 8, borderRadius: 999 }} />
      {children}
    </LinearGradient>
  );
}

/** a segmented control in a glass capsule (tradition) */
export function Segmented<T extends string>({ options, value, onChange }: { options: { id: T; label: string }[]; value: T; onChange: (v: T) => void }) {
  return (
    <Glass dark radius={999} style={{ padding: 4, flexDirection: "row" }}>
      <View accessibilityRole="tablist" style={{ flexDirection: "row" }}>
        {options.map((o) => {
          const on = o.id === value;
          const label = <Text numberOfLines={1} style={{ fontFamily: FONT.semibold, fontSize: 13, color: on ? goldButton.text : "rgba(255,255,255,0.88)" }}>{o.label}</Text>;
          return (
            <Pressable key={o.id} onPress={() => onChange(o.id)} accessibilityRole="tab" accessibilityState={{ selected: on }} accessibilityLabel={o.label} hitSlop={4}
              style={({ pressed }) => ({ transform: [{ scale: pressed ? 0.96 : 1 }] })}>
              {on ? <Lens style={{ height: 34, paddingHorizontal: 14 }}>{label}</Lens> : <View style={{ height: 34, paddingHorizontal: 12, justifyContent: "center" }}>{label}</View>}
            </Pressable>
          );
        })}
      </View>
    </Glass>
  );
}

/** a round glass button (back / next) */
export function GlassRound({ children, onPress, disabled, label, size = 48 }: { children: ReactNode; onPress: () => void; disabled?: boolean; label: string; size?: number }) {
  return (
    <Pressable onPress={onPress} disabled={disabled} accessibilityRole="button" accessibilityLabel={label} accessibilityState={{ disabled: !!disabled }} hitSlop={4}
      style={({ pressed }) => ({ opacity: disabled ? 0.35 : 1, transform: [{ scale: pressed ? 0.94 : 1 }] })}>
      <Glass radius={size / 2} interactive style={{ width: size, height: size, alignItems: "center", justifyContent: "center" }}>{children}</Glass>
    </Pressable>
  );
}

/** a glass capsule button with a label */
export function GlassPill({ title, onPress, icon, gold = false, height = 44 }: { title: string; onPress: () => void; icon?: ReactNode; gold?: boolean; height?: number }) {
  const row = (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 16 }}>
      {icon}
      <Text numberOfLines={1} style={{ fontFamily: FONT.bold, fontSize: 14, color: gold ? goldButton.text : "#ffffff" }}>{title}</Text>
    </View>
  );
  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={title} style={({ pressed }) => ({ transform: [{ scale: pressed ? 0.97 : 1 }] })}>
      {gold ? <Lens style={{ height }}>{row}</Lens> : <Glass radius={999} interactive style={{ height, justifyContent: "center" }}>{row}</Glass>}
    </Pressable>
  );
}

// ---------- the page ----------
/** the page scroll of /salah and /wudu: the page starts below the status bar and the Dynamic Island (a calm band in
 *  the colour of what is under it), so nothing of the trainer is ever cut off at the top; the page itself then
 *  needs no top inset of its own (the hero gets an inset of 0) */
export function TrainerScroll({ children }: { children: ReactNode }) {
  const t = useTheme();
  const insets = useSafeAreaInsets();
  const [over, setOver] = useState(false);
  return (
    <View style={{ flex: 1, backgroundColor: over ? t.bg : stage.bg }}>
      <StatusBar style={over && !t.dark ? "dark" : "light"} />
      <View style={{ height: insets.top + 4 }} />
      <ScrollView style={{ flex: 1, backgroundColor: t.bg }} contentContainerStyle={{ paddingBottom: 48 + insets.bottom }} keyboardShouldPersistTaps="handled"
        scrollEventThrottle={32} onScroll={(e) => { const v = e.nativeEvent.contentOffset.y > 300; if (v !== over) setOver(v); }}>
        <SafeAreaInsetsContext.Provider value={{ ...insets, top: 0 }}>{children}</SafeAreaInsetsContext.Provider>
      </ScrollView>
    </View>
  );
}
