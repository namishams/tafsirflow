import { Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import type { BottomTabBarProps } from "expo-router/tabs";
import { LinearGradient } from "expo-linear-gradient";
import { FONT, useTheme } from "@/lib/theme";
import { Icon, type IconName } from "./icons";

// Bottom navigation exactly like the website's TabBar.tsx: white bar with a hairline on top, outline icons,
// the active tab in the accent colour with a gold hairline and a small gold diamond above it.
const ICONS: Record<string, IconName> = { "(home)": "grid", quran: "book", learn: "cap", library: "compass", account: "user" };

export default function TabBar({ state, descriptors, navigateToTab }: BottomTabBarProps) {
  const t = useTheme();
  const insets = useSafeAreaInsets();
  return (
    <View style={[s.bar, { backgroundColor: t.dark ? "rgba(13,33,26,0.97)" : "rgba(255,255,255,0.97)", borderTopColor: t.line, paddingBottom: Math.max(insets.bottom, 8) }]} accessibilityRole="tablist">
      {state.routes.map((route, i) => {
        const on = state.index === i;
        const { options } = descriptors[route.key];
        const label = typeof options.title === "string" ? options.title : route.name;
        const color = on ? t.accent : t.muted;
        return (
          <Pressable key={route.key} accessibilityRole="tab" accessibilityState={{ selected: on }} accessibilityLabel={label}
            onPress={() => { if (!on) navigateToTab(route.key); }}
            style={s.tab}>
            {on ? (
              <View style={s.mark} pointerEvents="none">
                <LinearGradient colors={["transparent", "rgb(201,166,94)", "transparent"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={s.markLine} />
                <View style={[s.diamond, { backgroundColor: t.surface }]} />
              </View>
            ) : null}
            <Icon name={ICONS[route.name] ?? "grid"} color={color} />
            <Text numberOfLines={1} style={[s.label, { color }]}>{label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const s = StyleSheet.create({
  bar: { flexDirection: "row", borderTopWidth: StyleSheet.hairlineWidth },
  tab: { flex: 1, alignItems: "center", gap: 4, paddingTop: 10, paddingBottom: 2, paddingHorizontal: 2 },
  label: { fontFamily: FONT.semibold, fontSize: 10.5 },
  mark: { position: "absolute", top: 0, left: 18, right: 18, alignItems: "center" },
  markLine: { height: 2, alignSelf: "stretch", borderRadius: 1 },
  diamond: { position: "absolute", top: -3, width: 8, height: 8, transform: [{ rotate: "45deg" }], borderWidth: 1, borderColor: "rgb(201,166,94)" },
});
