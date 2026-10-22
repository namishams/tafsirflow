import { Platform, Pressable, StyleSheet, Text, View, useWindowDimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import type { BottomTabBarProps } from "expo-router/tabs";
import { GlassView, isLiquidGlassAvailable } from "expo-glass-effect";
import { BlurView } from "expo-blur";
import { useTheme } from "@/lib/theme";
import { Icon, type IconName } from "./icons";
import { useMessengerUnread } from "@/features/messenger/useUnread";

// The tab bar: icons only, like Instagram, on a floating capsule of Apple's Liquid Glass (blur on systems without it).
// The active tab is drawn heavier in the accent colour inside a small glass lens; names stay for VoiceOver.
const ICONS: Record<string, IconName> = { "(home)": "reels", quran: "book", learn: "sun", library: "compass", account: "user", foryou: "reels", explore: "compass" };
/** routes that are tabs (keep their stack and URL) without a button in the bar */
const HIDDEN = new Set(["explore"]);
export const TAB_BAR_HEIGHT = 62;
/** space a screen leaves at the bottom so nothing hides behind the floating tab bar */
export const useTabBarSpace = () => TAB_BAR_HEIGHT + Math.max(useSafeAreaInsets().bottom, 12) + 12;

export default function TabBar({ state, descriptors, navigateToTab, emitter }: BottomTabBarProps) {
  const t = useTheme();
  const insets = useSafeAreaInsets();
  const glass = Platform.OS === "ios" && isLiquidGlassAvailable();
  const { width } = useWindowDimensions();
  const capsuleWidth = Math.min(width - 36, 460); // a capsule, also on iPad and the unfolded iPhone
  // unread messages: a round red badge with a gold rim on the profile tab (owner 22.10.2026)
  const unread = useMessengerUnread();
  const bar = (
    <View style={s.row}>
      {state.routes.map((route, i) => {
        if (HIDDEN.has(route.name)) return null;
        const on = state.index === i;
        const { options } = descriptors[route.key];
        const label = typeof options.title === "string" ? options.title : route.name;
        const badge = route.name === "account" && unread > 0 ? (unread > 99 ? "99+" : String(unread)) : null;
        const name = ICONS[route.name] ?? "grid";
        return (
          <Pressable key={route.key} accessibilityRole="tab" accessibilityState={{ selected: on }} accessibilityLabel={badge ? `${label}, ${badge}` : label}
            onPress={() => { const e = emitter.emit({ type: "tabPress", target: route.key, canPreventDefault: true }); if (!on && !e.defaultPrevented) navigateToTab(route.key); }} style={s.tab} hitSlop={4}>
            {on ? (glass
              ? <GlassView glassEffectStyle="clear" tintColor={t.dark ? "rgba(58,190,146,0.18)" : "rgba(6,108,78,0.10)"} style={s.lens} />
              : <View style={[s.lens, { backgroundColor: t.dark ? "rgba(58,190,146,0.16)" : "rgba(6,108,78,0.08)" }]} />) : null}
            <Icon name={name} size={25} color={on ? t.accent : t.dark ? "rgba(236,238,242,0.78)" : "rgba(13,31,25,0.72)"} weight={on ? 2.2 : 1.6} filled={on && name !== "compass" && name !== "grid" && name !== "reels"} />
            {badge ? <View style={s.badge} accessible={false}><Text style={s.badgeText}>{badge}</Text></View> : null}
          </Pressable>
        );
      })}
    </View>
  );
  return (
    <View pointerEvents="box-none" style={[s.wrap, { bottom: Math.max(insets.bottom - 6, 12) }]}>
      {glass ? (
        <GlassView glassEffectStyle="regular" isInteractive style={[s.capsule, { width: capsuleWidth }]}>{bar}</GlassView>
      ) : (
        <View style={[s.capsule, { width: capsuleWidth, borderWidth: StyleSheet.hairlineWidth, borderColor: t.line }]}>
          <BlurView intensity={70} tint={t.dark ? "systemChromeMaterialDark" : "systemChromeMaterialLight"} style={StyleSheet.absoluteFill} />
          {bar}
        </View>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { position: "absolute", left: 0, right: 0, alignItems: "center" },
  capsule: { height: TAB_BAR_HEIGHT, borderRadius: TAB_BAR_HEIGHT / 2, overflow: "hidden" },
  row: { flex: 1, flexDirection: "row", alignItems: "center", paddingHorizontal: 6 },
  tab: { flex: 1, height: TAB_BAR_HEIGHT, alignItems: "center", justifyContent: "center" },
  lens: { position: "absolute", width: 56, height: 44, borderRadius: 22 },
  badge: { position: "absolute", top: 9, left: "52%", minWidth: 19, height: 19, borderRadius: 10, paddingHorizontal: 5, backgroundColor: "rgb(196,43,52)", borderWidth: 1.5, borderColor: "#E2C77F", alignItems: "center", justifyContent: "center" },
  badgeText: { color: "#ffffff", fontSize: 10.5, fontWeight: "700" },
});
