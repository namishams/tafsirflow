import { type ReactNode } from "react";
import { Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { router, type Href } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Arcade, Display, Eyebrow, GoldButton, SmallStar, Stage } from "@/components/brand";
import { Icon, type IconName } from "@/components/icons";
import { openPro, type ProFeature } from "@/lib/pro";
import { useT } from "@/i18n";
import { FONT, R, goldButton, stage, useTheme } from "@/lib/theme";
import { Girih, PracticeWindow, goldA } from "./art";
import { goBack } from "@/components/page";

// Buttons and frames shared by the course screens, in the website's shapes: btn-gold, the rose "continue" after a
// wrong answer, pa-chip, the callout, the practice hero and the Pro card.

type Variant = "gold" | "rose" | "ink" | "outline";
/** big lesson button (h-14 rounded-xl on the website) */
export function BigButton({ title, onPress, variant = "gold", disabled, height = 56, radius = R.sm, icon, style }: {
  title: string; onPress: () => void; variant?: Variant; disabled?: boolean; height?: number; radius?: number; icon?: IconName; style?: StyleProp<ViewStyle>;
}) {
  const t = useTheme();
  const color = variant === "gold" ? goldButton.text : variant === "outline" ? t.ink : variant === "ink" ? t.bg : "#ffffff";
  const inner = (
    <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, paddingHorizontal: 16 }}>
      {icon ? <Icon name={icon} size={16} color={color} /> : null}
      <Text numberOfLines={1} style={{ fontFamily: FONT.bold, fontSize: 16, color }}>{title}</Text>
    </View>
  );
  return (
    <Pressable onPress={onPress} disabled={disabled} accessibilityRole="button" accessibilityLabel={title} accessibilityState={{ disabled: !!disabled }}
      style={({ pressed }) => [{ opacity: disabled ? 0.4 : 1, transform: [{ scale: pressed && !disabled ? 0.985 : 1 }] }, style]}>
      {variant === "gold" ? (
        <LinearGradient colors={[goldButton.from, goldButton.to]} style={{ height, borderRadius: radius, justifyContent: "center", overflow: "hidden" }}>
          <View pointerEvents="none" style={{ position: "absolute", top: 0, left: 0, right: 0, height: 1, backgroundColor: "rgba(255,255,255,0.3)" }} />
          {inner}
        </LinearGradient>
      ) : (
        <View style={{ height, borderRadius: radius, justifyContent: "center",
          backgroundColor: variant === "rose" ? "rgb(150,52,48)" : variant === "ink" ? t.ink : t.surface,
          borderWidth: variant === "outline" ? 1 : 0, borderColor: t.line }}>
          {inner}
        </View>
      )}
    </Pressable>
  );
}

/** pa-chip: hairline pill with muted text */
export function ChipButton({ title, onPress, accent, icon, style }: { title: string; onPress: () => void; accent?: boolean; icon?: IconName; style?: StyleProp<ViewStyle> }) {
  const t = useTheme();
  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={title}
      style={({ pressed }) => [{ height: 44, paddingHorizontal: 16, borderRadius: R.pill, borderWidth: 1, borderColor: pressed ? goldA(t, 0.6) : t.line, backgroundColor: t.surface, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, alignSelf: "flex-start" }, style]}>
      <Text numberOfLines={1} style={{ fontFamily: FONT.semibold, fontSize: 15, color: accent ? t.accent : t.muted }}>{title}</Text>
      <Icon name={icon ?? "chevronRight"} size={14} color={accent ? t.accent : t.muted} />
    </Pressable>
  );
}

/** callout: gold hairline frame with a brighter line on top */
export function Callout({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  const t = useTheme();
  return (
    <View style={[{ borderRadius: R.sm, borderWidth: 1, borderColor: goldA(t, 0.28), backgroundColor: t.surface, padding: 16, overflow: "hidden" }, style]}>
      <LinearGradient pointerEvents="none" colors={[goldA(t, 0.07), "transparent"]} style={StyleSheet.absoluteFill} />
      <LinearGradient pointerEvents="none" colors={["transparent", goldA(t, 0.95), "transparent"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={{ position: "absolute", top: 0, left: 22, right: 22, height: 1 }} />
      {children}
    </View>
  );
}

/** dark hero of a practice page (PracticeHero): kicker, title, lead, actions; the arch window stands quietly behind */
export function CourseHero({ kicker, title, lead, word, children, back, backLabel, topInset = true, windowOpacity = 0.3, extra }: {
  kicker?: string; title: string; lead?: string; word?: string; children?: ReactNode; back?: boolean; backLabel?: string; topInset?: boolean; windowOpacity?: number; extra?: ReactNode;
}) {
  const insets = useSafeAreaInsets();
  const tr = useT();
  return (
    <Stage hairlines={false} pattern={false}>
      <Girih />
      <PracticeWindow word={word} height={230} opacity={windowOpacity} style={{ position: "absolute", right: -40, top: (topInset ? insets.top : 0) + 16 }} />
      <View style={{ paddingHorizontal: 20, paddingTop: (topInset ? insets.top : 0) + (back ? 8 : 40), paddingBottom: 40 }}>
        {back ? (
          <Pressable onPress={() => (router.canGoBack() ? goBack() : router.replace("/" as Href))} accessibilityRole="button" accessibilityLabel={backLabel ?? tr("common.back")} hitSlop={10}
            style={{ minHeight: 40, flexDirection: "row", alignItems: "center", gap: 6, alignSelf: "flex-start", marginBottom: 12 }}>
            <Icon name="chevronLeft" color="rgba(255,255,255,0.7)" size={18} />
            {backLabel ? <Text style={{ fontFamily: FONT.semibold, fontSize: 14, color: "rgba(255,255,255,0.7)" }}>{backLabel}</Text> : null}
          </Pressable>
        ) : null}
        {extra}
        {kicker ? <Eyebrow onStage style={{ fontSize: 12, letterSpacing: 2.6, marginBottom: 12 }}>{kicker}</Eyebrow> : null}
        <Text accessibilityRole="header" style={{ fontFamily: FONT.display, fontSize: 36, lineHeight: 39, letterSpacing: -0.9, color: "#eef0f3" }}>{title}</Text>
        {lead ? <Text style={{ fontFamily: FONT.regular, fontSize: 17, lineHeight: 27, color: "rgba(255,255,255,0.7)", marginTop: 18 }}>{lead}</Text> : null}
        {children ? <View style={{ marginTop: 26 }}>{children}</View> : null}
      </View>
      <Arcade />
    </Stage>
  );
}

/** what Pro brings here, one gold button to the Pro sheet (shown inside the course, never as a dead end) */
export function ProCard({ feature, title, text, style }: { feature: ProFeature; title: string; text: string; style?: StyleProp<ViewStyle> }) {
  const tr = useT();
  return (
    <Stage rounded={R.card} style={style}>
      <View style={{ padding: 20, gap: 10 }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}><SmallStar size={11} color={stage.gold} /><Eyebrow onStage>{tr("pro.name")}</Eyebrow></View>
        <Display size="title2" onStage>{title}</Display>
        <Text style={{ fontFamily: FONT.regular, fontSize: 15, lineHeight: 23, color: "rgba(255,255,255,0.75)" }}>{text}</Text>
        <GoldButton title={tr("pro.cta")} onPress={() => openPro(feature)} style={{ marginTop: 8 }} />
      </View>
    </Stage>
  );
}

/** small gold lock with "Pro" (a locked lesson in an overview) */
export function ProLock({ size = 15 }: { size?: number }) {
  const t = useTheme();
  return <Icon name="lock" size={size} color={t.gold} />;
}
