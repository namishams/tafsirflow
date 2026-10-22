import { Pressable, StyleSheet, Text, View, useWindowDimensions } from "react-native";
import { useGlobalSearchParams, usePathname } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useStored } from "@/lib/store";
import { FONT, useTheme } from "@/lib/theme";
import { openTutor } from "./AskTutor";
import { TutorFace } from "./Face";
import { useTutor } from "./hooks";
import { BUBBLE_KEY, screenContext } from "./next";
import { GOLD, alpha } from "./Parts";

// "Ask the tutor" on every learning screen (website: src/components/tutor/TutorBubble.tsx): a small glass tab with the
// tutor's face, snapped to the trailing edge at mid height inside the safe area – never over the tab bar, the mini
// player, docks or primary buttons at the bottom. It opens the tutor with the screen's context (screen, surah:ayah,
// course and lesson id). Hidden in the tutor's settings. Quotas, consent and the AI note stay in the chat.
export function TutorBubble() {
  const t = useTheme();
  const path = usePathname();
  const q = useGlobalSearchParams<{ v?: string; s?: string }>();
  const insets = useSafeAreaInsets();
  const { height } = useWindowDimensions();
  const { ui, f, persona } = useTutor();
  const pref = useStored<{ hidden?: boolean }>(BUBBLE_KEY, {});
  const ctx = screenContext(path, { v: typeof q.v === "string" ? q.v : undefined, s: typeof q.s === "string" ? q.s : undefined });
  if (pref.hidden || !ctx) return null;
  const top = Math.max(insets.top + 60, Math.min(height - insets.bottom - 160, height * 0.58));
  const label = `${f(ui.ask)} (${ui.ai})`;
  return (
    <View pointerEvents="box-none" style={[StyleSheet.absoluteFill, { zIndex: 40 }]}>
      <Pressable onPress={() => openTutor(ctx)} accessibilityRole="button" accessibilityLabel={label} hitSlop={6}
        style={({ pressed }) => ({ position: "absolute", top, end: Math.max(0, insets.right), flexDirection: "row", alignItems: "center", gap: 4, paddingVertical: 4, paddingStart: 4, paddingEnd: 6,
          borderTopStartRadius: 999, borderBottomStartRadius: 999, borderWidth: StyleSheet.hairlineWidth, borderEndWidth: 0, borderColor: alpha(GOLD, 0.7),
          backgroundColor: t.dark ? "rgba(12,40,32,0.9)" : "rgba(255,255,255,0.92)", opacity: pressed ? 0.85 : 1,
          shadowColor: "#06281e", shadowOpacity: 0.18, shadowRadius: 12, shadowOffset: { width: 0, height: 6 }, elevation: 6 })}>
        <TutorFace persona={persona} size={40} still />
        <Text style={{ fontFamily: FONT.semibold, fontSize: 9.5, letterSpacing: 1, color: GOLD }}>{ui.ai}</Text>
      </Pressable>
    </View>
  );
}
