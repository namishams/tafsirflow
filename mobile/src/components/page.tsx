import { useEffect, useRef, type ReactNode } from "react";
import { ActivityIndicator, Pressable, ScrollView, Text, View, useWindowDimensions, type ScrollViewInstance, type ScrollViewProps, type StyleProp, type ViewStyle } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router, useGlobalSearchParams } from "expo-router";
import { ARABIC_FONT, CALLIG_FONT, FONT, R, goldButton, stage, type Theme, type, useTheme } from "@/lib/theme";
import { Arcade, Display, Eyebrow, GoldButton, OutlineButton, SmallStar, Stage, Wordmark } from "./brand";
import { Icon, type IconName } from "./icons";
import { openPro, usePro, type ProFeature } from "@/lib/pro";
import { useT } from "@/i18n";

// Page frame shared by every screen: the light canvas, a stage hero like the top of each website page, quiet
// loading and error states, and the Pro lock.

/** stack header in the website's style: canvas colour, hairline, back arrow without text */
export function stackOptions(t: Theme) {
  return {
    headerBackButtonDisplayMode: "minimal" as const,
    headerShadowVisible: false,
    headerStyle: { backgroundColor: t.surface },
    headerTintColor: t.ink,
    headerTitleStyle: { fontFamily: FONT.bold, fontSize: 16, color: t.ink },
    contentStyle: { backgroundColor: t.bg },
  };
}

/** scrolling page on the canvas */
/** reading width on wide screens (iPad, Pro Max in landscape, the unfolded iPhone): content stays centred */
export const READ_WIDTH = 860;
export function useWide() {
  const { width } = useWindowDimensions();
  return width >= 700;
}

export function Page({ children, style, padded = false, ...rest }: { children: ReactNode; style?: StyleProp<ViewStyle>; padded?: boolean } & ScrollViewProps) {
  const t = useTheme();
  const { width } = useWindowDimensions();
  const wide = width > READ_WIDTH + 40;
  // development only: `?auditY=1800` in a deep link scrolls the page, for screenshot audits of a headless simulator
  const ref = useRef<ScrollViewInstance>(null);
  const { auditY } = useGlobalSearchParams<{ auditY?: string }>();
  useEffect(() => {
    if (!__DEV__ || !auditY) return;
    const id = setTimeout(() => ref.current?.scrollTo({ y: Number(auditY) || 0, animated: false }), 1200);
    return () => clearTimeout(id);
  }, [auditY]);
  return (
    <ScrollView ref={ref} style={{ flex: 1, backgroundColor: t.bg }} contentContainerStyle={[{ paddingBottom: 130 }, wide && { width: READ_WIDTH, alignSelf: "center" }, padded && { paddingHorizontal: 16, paddingTop: 16 }, style]} keyboardShouldPersistTaps="handled" {...rest}>
      {children}
    </ScrollView>
  );
}

/** back, or to Today when the screen was opened directly (a link, a notification) */
export function goBack() {
  if (router.canGoBack()) router.back();
  else router.replace("/");
}

/** the stage hero at the top of a page: eyebrow, big title, lead, optional Arabic line and actions, arcade below */
export function PageHero({ eyebrow, title, lead, arabic, children, topInset = false, arcade = true, back = false }: {
  eyebrow?: string; title: string; lead?: string; arabic?: string; children?: ReactNode; topInset?: boolean; arcade?: boolean; back?: boolean;
}) {
  const insets = useSafeAreaInsets();
  const tr = useT();
  return (
    <Stage hairlines={false}>
      <View style={{ paddingHorizontal: 20, paddingTop: (topInset ? insets.top : 0) + (back ? 8 : 28), paddingBottom: arcade ? 8 : 28 }}>
        {back ? (
          <Pressable onPress={goBack} accessibilityRole="button" accessibilityLabel={tr("common.back")} hitSlop={12} style={{ width: 40, height: 40, justifyContent: "center", marginBottom: 12, marginStart: -6 }}>
            <Icon name="chevronLeft" color="#ffffff" size={24} />
          </Pressable>
        ) : null}
        {arabic ? <Text style={{ fontFamily: CALLIG_FONT, fontSize: 26, lineHeight: 44, color: stage.gold, textAlign: "left", marginBottom: 10 }} allowFontScaling={false}>{arabic}</Text> : null}
        {eyebrow ? <Eyebrow onStage style={{ marginBottom: 10 }}>{eyebrow}</Eyebrow> : null}
        <Display onStage>{title}</Display>
        {lead ? <Text style={{ fontFamily: FONT.regular, fontSize: 15.5, lineHeight: 24, color: "rgba(255,255,255,0.75)", marginTop: 12 }}>{lead}</Text> : null}
        {children ? <View style={{ marginTop: 22, gap: 12 }}>{children}</View> : null}
      </View>
      {arcade ? <View style={{ marginTop: 12 }}><Arcade /></View> : null}
    </Stage>
  );
}

/** app bar with the gold wordmark, like the website header (used on the Today tab) */
export function BrandBar() {
  const t = useTheme();
  const insets = useSafeAreaInsets();
  return (
    <View style={{ paddingTop: insets.top, backgroundColor: t.surface, borderBottomWidth: 1, borderBottomColor: t.line }}>
      <View style={{ height: 52, flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 16 }}>
        <View accessibilityRole="header"><Wordmark height={26} /></View>
      </View>
    </View>
  );
}

export function Loading({ label }: { label?: string }) {
  const t = useTheme();
  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: t.bg, padding: 32, gap: 12 }}>
      <ActivityIndicator color={t.accent} />
      {label ? <Text style={[type.footnote, { color: t.muted }]}>{label}</Text> : null}
    </View>
  );
}

/** calm error screen (offline, server not reachable) with one action */
export function ErrorState({ text, retry }: { text?: string; retry: () => void }) {
  const t = useTheme();
  const tr = useT();
  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: t.bg, padding: 32, gap: 18 }}>
      <Icon name="globe" color={t.muted} size={28} />
      <Text style={[type.body, { color: t.muted, textAlign: "center" }]}>{text ?? tr("common.offline")}</Text>
      <OutlineButton title={tr("common.retry")} onPress={retry} compact style={{ alignSelf: "center" }} />
    </View>
  );
}

/** list row in a white tile: icon, title, subtitle, chevron or lock */
export function LinkRow({ title, subtitle, icon, onPress, locked, right, arabic, first, last }: {
  title: string; subtitle?: string; icon?: IconName; onPress?: () => void; locked?: boolean; right?: ReactNode; arabic?: string; first?: boolean; last?: boolean;
}) {
  const t = useTheme();
  return (
    <Pressable onPress={onPress} disabled={!onPress} accessibilityRole={onPress ? "button" : undefined} accessibilityLabel={`${title}${subtitle ? `, ${subtitle}` : ""}${locked ? ", Pro" : ""}`}
      style={({ pressed }) => [{ flexDirection: "row", alignItems: "center", gap: 14, paddingHorizontal: 16, paddingVertical: 14, minHeight: 56, backgroundColor: pressed ? t.bg : t.surface },
        !first && { borderTopWidth: 1, borderTopColor: t.line }]}>
      {icon ? <View style={{ width: 36, height: 36, borderRadius: R.md, backgroundColor: t.accentSoft, alignItems: "center", justifyContent: "center" }}><Icon name={icon} color={t.accent} size={19} /></View> : null}
      <View style={{ flex: 1 }}>
        <Text style={{ fontFamily: FONT.semibold, fontSize: 15.5, color: t.ink }}>{title}</Text>
        {subtitle ? <Text style={{ fontFamily: FONT.regular, fontSize: 13, lineHeight: 18, color: t.muted, marginTop: 2 }} numberOfLines={2}>{subtitle}</Text> : null}
      </View>
      {arabic ? <Text style={{ fontFamily: ARABIC_FONT, fontSize: 20, color: t.ink }}>{arabic}</Text> : null}
      {right}
      {locked ? <Icon name="lock" color={t.gold} size={17} /> : onPress ? <Icon name="chevronRight" color={t.muted} size={16} /> : null}
    </Pressable>
  );
}

/** group of LinkRows in one bordered tile */
export function RowGroup({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  const t = useTheme();
  return <View style={[{ borderRadius: R.lg, borderWidth: 1, borderColor: t.line, overflow: "hidden", backgroundColor: t.surface }, style]}>{children}</View>;
}

/** small "Pro" label with a lock, in gold */
export function ProBadge({ onStage }: { onStage?: boolean }) {
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 8, height: 22, borderRadius: R.pill, borderWidth: 1, borderColor: onStage ? stage.goldSoft : "rgba(201,166,94,0.6)", backgroundColor: "rgba(201,166,94,0.12)" }}>
      <Icon name="lock" color={onStage ? stage.gold : goldButton.line} size={11} />
      <Text style={{ fontFamily: FONT.bold, fontSize: 10.5, letterSpacing: 0.8, color: onStage ? stage.gold : "rgb(150,116,52)" }}>PRO</Text>
    </View>
  );
}

/** a locked section: what Pro brings here, and one gold button to the Pro sheet */
export function ProGate({ feature, title, text, children }: { feature: ProFeature; title: string; text: string; children?: ReactNode }) {
  const { pro } = usePro();
  const tr = useT();
  if (pro) return <>{children}</>;
  return (
    <Stage rounded={R.card} style={{ marginHorizontal: 16, marginTop: 16 }}>
      <View style={{ padding: 20, gap: 10 }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}><SmallStar size={11} color={stage.gold} /><Eyebrow onStage>Quran Masterclass Pro</Eyebrow></View>
        <Display size="title2" onStage>{title}</Display>
        <Text style={{ fontFamily: FONT.regular, fontSize: 15, lineHeight: 23, color: "rgba(255,255,255,0.75)" }}>{text}</Text>
        <GoldButton title={tr("pro.cta")} onPress={() => openPro(feature)} style={{ marginTop: 8 }} />
      </View>
    </Stage>
  );
}

export const gap = { page: 16 };
