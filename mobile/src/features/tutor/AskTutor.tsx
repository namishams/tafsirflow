import { Platform, Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from "react-native";
import { router, type Href } from "expo-router";
import { GlassView, isLiquidGlassAvailable } from "expo-glass-effect";
import { FONT, useTheme } from "@/lib/theme";
import type { TutorContext } from "./api";
import { TutorFace } from "./Face";
import { useTutor } from "./hooks";
import { GOLD, alpha } from "./Parts";

// The entry to the tutor from a learning context (lesson, quiz, Shams verse, reader verse, carousel): a Liquid Glass
// capsule with the tutor's face. It opens the one chat screen with the context and, when given, a first question.
const GLASS = Platform.OS === "ios" && isLiquidGlassAvailable();

export function openTutor(context?: TutorContext | null, question?: string) {
  const params: Record<string, string> = {};
  if (context) params.ctx = JSON.stringify(context);
  if (question) params.q = question;
  router.push({ pathname: "/assistant", params } as unknown as Href);
}

export function AskTutor({ context, question, label, onStage, style }: { context: TutorContext; question?: string; label?: string; onStage?: boolean; style?: StyleProp<ViewStyle> }) {
  const t = useTheme();
  const { persona, ui, f } = useTutor();
  const title = label ?? f(ui.ask);
  const color = onStage ? "#ffffff" : t.ink;
  const row = (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 8, paddingVertical: 6, paddingStart: 6, paddingEnd: 14 }}>
      <TutorFace persona={persona} size={28} still />
      <Text numberOfLines={1} style={{ fontFamily: FONT.semibold, fontSize: 14, color }}>{title}</Text>
    </View>
  );
  const shape = { borderRadius: 999, overflow: "hidden" as const, borderWidth: StyleSheet.hairlineWidth, borderColor: onStage ? "rgba(255,255,255,0.25)" : alpha(GOLD, 0.6) };
  return (
    <Pressable onPress={() => openTutor(context, question)} accessibilityRole="button" accessibilityLabel={title}
      style={({ pressed }) => [{ alignSelf: "flex-start", transform: [{ scale: pressed ? 0.97 : 1 }] }, style]}>
      {GLASS
        ? <GlassView glassEffectStyle={onStage || t.dark ? "clear" : "regular"} isInteractive tintColor={onStage ? "rgba(4,32,24,0.35)" : alpha(GOLD, 0.10)} style={shape}>{row}</GlassView>
        : <View style={[shape, { backgroundColor: onStage ? "rgba(255,255,255,0.06)" : alpha(GOLD, 0.08) }]}>{row}</View>}
    </Pressable>
  );
}

/** "Explain this verse" (Quran reader): asks the tutor about one verse; its translation and classical tafsir are sources */
export function AskAboutVerse({ verseKey, title, style }: { verseKey: string; title?: string; style?: StyleProp<ViewStyle> }) {
  const { ui } = useTutor();
  return <AskTutor context={{ kind: "verse", verse: verseKey, title: title ?? verseKey }} question={ui.explainVerse} label={ui.explainVerse} style={style} />;
}
