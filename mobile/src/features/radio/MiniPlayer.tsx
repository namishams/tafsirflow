import { useTabBarSpace } from "@/components/TabBar";
import { useEffect, useState } from "react";
import { Animated, Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router, usePathname, type Href } from "expo-router";
import { FONT, R, useTheme } from "@/lib/theme";
import { Icon } from "@/components/icons";
import { useWebT } from "@/i18n/web";
import { currentReciter, radio, useRadio } from "./engine";
import { useAppT } from "./strings";
import { useLoop, useReduceMotion } from "./motion";

// The persistent mini player (RadioProvider.tsx MiniBar): what is on air, play/pause, next verse, stop. Tapping it
// opens the full "now playing" view. Shown on the radio, reciter and khatm screens while the radio runs; it can also be
// mounted once in the root layout with `global` (then the per-screen copies step aside).
let globals = 0;
const globalListeners = new Set<() => void>();
function useGlobalMounted() {
  const [n, setN] = useState(globals);
  useEffect(() => { const l = () => setN(globals); globalListeners.add(l); return () => { globalListeners.delete(l); }; }, []);
  return n > 0;
}
const TAB_ROOTS = ["/quran", "/learn", "/library", "/account"];
const READER = ["/quran/", "/shams/"];

export function RadioMiniPlayer({ global = false, visible = true, bottomOffset }: { global?: boolean; visible?: boolean; bottomOffset?: number }) {
  const r = useRadio();
  const t = useWebT("radio");
  const a = useAppT();
  const th = useTheme();
  const insets = useSafeAreaInsets();
  const tabSpace = useTabBarSpace();
  const path = usePathname();
  const reduce = useReduceMotion();
  const hasGlobal = useGlobalMounted();
  const pulse = useLoop(r.playing && !reduce, 1800);
  useEffect(() => {
    if (!global) return;
    globals += 1; globalListeners.forEach((l) => l());
    return () => { globals -= 1; globalListeners.forEach((l) => l()); };
  }, [global]);

  if (!r.started || !visible) return null;
  // a global copy hides on the radio screens (they have their own); screen copies hide when a global one exists
  if (global ? path.startsWith("/radio") : hasGlobal && !path.startsWith("/radio")) return null;
  // like the website: in the Quran reader the reader's own player is in charge, so a paused radio stays out of sight,
  // and a playing one sits at the top, above the reader's audio bar
  const reader = global && READER.some((p) => path.startsWith(p));
  if (reader && !r.playing) return null;
  const onTabs = path === "/" || TAB_ROOTS.some((p) => path === p || path.startsWith(`${p}/`));
  const bottom = bottomOffset ?? (global && onTabs ? tabSpace : insets.bottom + 10);
  const place = reader ? { top: insets.top + 56 } : { bottom };
  const ch = r.chapters.find((c) => c.id === r.now.s);
  const title = `${ch ? `${ch.id}. ${ch.name_simple}` : `${r.now.s}`} · ${r.now.v}`;
  const sub = `${t(`st_${r.station.id}`)} · ${currentReciter(r).name}`;
  const dot = { opacity: r.playing && !reduce ? pulse.interpolate({ inputRange: [0, 0.5, 1], outputRange: [1, 0.35, 1] }) : 1 };

  return (
    <View pointerEvents="box-none" style={[{ position: "absolute", left: 12, right: 12 }, place]}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 10, padding: 8, paddingEnd: 10, borderRadius: R.lg, borderWidth: 1, borderColor: th.line, backgroundColor: th.surface,
        shadowColor: "#000", shadowOpacity: th.dark ? 0.5 : 0.16, shadowRadius: 16, shadowOffset: { width: 0, height: 8 }, elevation: 8 }}>
        <Pressable onPress={() => router.push("/radio/now" as Href)} accessibilityRole="button" accessibilityLabel={`${a("openNowPlaying")}: ${title}, ${sub}`} accessibilityHint={t("openRadio")}
          style={{ flex: 1, minWidth: 0, flexDirection: "row", alignItems: "center", gap: 12 }}>
          <View style={{ width: 44, height: 44, borderRadius: R.sm, backgroundColor: th.ink, alignItems: "center", justifyContent: "center", opacity: r.playing ? 1 : 0.7 }}>
            <Text style={{ fontFamily: FONT.display, fontSize: 10, letterSpacing: 1, color: th.bg }}>{r.playing ? "LIVE" : "FM"}</Text>
            {r.playing ? <Animated.View style={[{ position: "absolute", right: -4, top: -4, width: 10, height: 10, borderRadius: 5, backgroundColor: "rgb(239,68,68)", borderWidth: 2, borderColor: th.surface }, dot]} /> : null}
          </View>
          <View style={{ flex: 1, minWidth: 0 }}>
            <Text numberOfLines={1} style={{ fontFamily: FONT.bold, fontSize: 14, color: th.ink }}>{title}</Text>
            <Text numberOfLines={1} style={{ fontFamily: FONT.regular, fontSize: 12, color: th.muted, marginTop: 1 }}>{sub}</Text>
          </View>
        </Pressable>
        <Pressable onPress={radio.toggle} accessibilityRole="button" accessibilityLabel={r.playing ? t("pause") : t("play")} hitSlop={4}
          style={({ pressed }) => ({ width: 44, height: 44, borderRadius: 22, backgroundColor: th.accent, alignItems: "center", justifyContent: "center", opacity: pressed ? 0.85 : 1 })}>
          <Icon name={r.playing ? "pause" : "play"} color={th.dark ? th.onAccent : "#ffffff"} size={20} />
        </Pressable>
        <Pressable onPress={radio.skipVerse} accessibilityRole="button" accessibilityLabel={t("nextVerse")} hitSlop={4}
          style={({ pressed }) => ({ width: 40, height: 40, borderRadius: 20, borderWidth: 1, borderColor: pressed ? th.ink : th.line, alignItems: "center", justifyContent: "center" })}>
          <Icon name="next" color={th.ink} size={18} />
        </Pressable>
        <Pressable onPress={radio.stop} accessibilityRole="button" accessibilityLabel={t("stop")} hitSlop={6}
          style={{ width: 34, height: 36, alignItems: "center", justifyContent: "center" }}>
          <Icon name="close" color={th.muted} size={18} />
        </Pressable>
      </View>
    </View>
  );
}

/** height to keep free at the bottom of a scrolling screen while the mini player shows */
export const MINI_SPACE = 84;
