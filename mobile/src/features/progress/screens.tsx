import { Pressable, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Circle, Defs, Path, Pattern, RadialGradient, Rect, Stop } from "react-native-svg";
import { LinearGradient } from "expo-linear-gradient";
import { Arcade } from "@/components/brand";
import { Icon } from "@/components/icons";
import { Page } from "@/components/page";
import { FONT, useTheme } from "@/lib/theme";
import { useWebT } from "@/i18n/web";
import { StatsView } from "./StatsView";
import { Ranking } from "./Ranking";
import { MoreTiles } from "./MoreTiles";
import { ProfileView, PROFILE_TABS, type ProfileTab } from "./ProfileView";
import { PlanBoard } from "./PlanBoard";
import { RequireAccount } from "./RequireAccount";
import { Markdown } from "./Markdown";
import { inkGold, khatam } from "./art";
import { goBack } from "@/components/page";

/** /stats – level, stickers, achievements, listening, points, learning (website: stats/page.tsx) */
export function StatsScreen() {
  return (
    <Page>
      <StatsView hero />
      <MoreTiles keys={["map", "shams", "arabic", "radio"]} />
    </Page>
  );
}

/** /ranking – global ranking (website: ranking/page.tsx) */
export function RankingScreen() {
  return (
    <Page>
      <Ranking />
      <MoreTiles keys={["shams", "map", "arabic", "radio"]} />
    </Page>
  );
}

function BackButton({ color }: { color: string }) {
  return (
    <Pressable onPress={() => (router.canGoBack() ? goBack() : router.navigate("/"))} accessibilityRole="button" accessibilityLabel="Back" hitSlop={12}
      style={{ width: 40, height: 40, justifyContent: "center", marginStart: -6 }}>
      <Icon name="chevronLeft" color={color} size={24} />
    </Pressable>
  );
}

/** /profile – my profile (website: profile/page.tsx); ?tab=stats|badges|ranking|learning|account opens a tab */
export function ProfileScreen({ tab }: { tab?: string }) {
  const t = useTheme();
  const tr = useWebT("profile");
  const insets = useSafeAreaInsets();
  const initial = (PROFILE_TABS as readonly string[]).includes(tab ?? "") ? (tab as ProfileTab) : "overview";
  return (
    <Page style={{ paddingHorizontal: 16, paddingTop: insets.top + 8, paddingBottom: 96 }}>
      <BackButton color={t.ink} />
      <Text accessibilityRole="header" style={{ fontFamily: FONT.display, fontSize: 40, lineHeight: 42, letterSpacing: -1, color: t.ink, marginTop: 8 }}>{tr("title")}</Text>
      <RequireAccount feature={tr("title")}><ProfileView initialTab={initial} /></RequireAccount>
    </Page>
  );
}

// eight-pointed star medallion of the plan hero (the website's shamsa; its ring of verses is left out in the app)
function Medal({ size }: { size: number }) {
  const t = useTheme();
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <Circle cx={50} cy={50} r={47} fill="none" stroke="rgba(201,166,94,0.55)" strokeWidth={1} strokeDasharray="1.5 4" />
      <Path d={khatam(50, 50, 44)} fill="rgba(201,166,94,0.08)" stroke="rgba(201,166,94,0.7)" strokeWidth={1} />
      <Path d={khatam(50, 50, 34)} fill="none" stroke="rgba(201,166,94,0.45)" strokeWidth={0.8} />
      <Circle cx={50} cy={50} r={21} fill={t.dark ? "rgba(8,38,29,0.8)" : "rgba(255,255,255,0.7)"} stroke="rgba(201,166,94,0.8)" strokeWidth={1.2} />
      <Path d="M50 38L52.8 47.2L62 50L52.8 52.8L50 62L47.2 52.8L38 50L47.2 47.2Z" fill={t.gold} />
    </Svg>
  );
}

/** the light "marble" hero of the Quran pages (art-quran.css .q-hero): kicker, title, lead, medallion, arcade */
export function MarbleHero({ eyebrow, title, lead }: { eyebrow: string; title: string; lead: string }) {
  const t = useTheme();
  const insets = useSafeAreaInsets();
  const [a, b] = t.dark ? ["rgb(14,42,33)", "rgb(8,28,22)"] : ["rgb(252,249,241)", "rgb(244,236,218)"];
  return (
    <View style={{ overflow: "hidden", borderBottomWidth: 1, borderBottomColor: "rgba(201,166,94,0.45)" }}>
      <LinearGradient colors={[a, b]} style={StyleSheet.absoluteFill} />
      <Svg style={StyleSheet.absoluteFill} pointerEvents="none">
        <Defs>
          <RadialGradient id="light" cx="82%" cy="38%" rx="70%" ry="90%">
            <Stop offset="0" stopColor={t.dark ? "rgb(214,180,108)" : "rgb(255,233,178)"} stopOpacity={t.dark ? 0.16 : 0.55} />
            <Stop offset="0.62" stopColor={t.dark ? "rgb(214,180,108)" : "rgb(255,233,178)"} stopOpacity={0} />
          </RadialGradient>
          <Pattern id="lat" width={120} height={120} patternUnits="userSpaceOnUse">
            <Path d="M60 8l15 37 37 15-37 15-15 37-15-37-37-15 37-15z" fill="none" stroke="#b08a3e" strokeOpacity={0.12} />
            <Path d="M23 23h74v74H23z" fill="none" stroke="#b08a3e" strokeOpacity={0.12} />
            <Circle cx={60} cy={60} r={17} fill="none" stroke="#b08a3e" strokeOpacity={0.12} />
          </Pattern>
        </Defs>
        <Rect width="100%" height="100%" fill="url(#light)" />
        <Rect width="100%" height="100%" fill="url(#lat)" />
      </Svg>
      <View style={{ paddingHorizontal: 16, paddingTop: insets.top + 8, paddingBottom: 56 }}>
        <BackButton color={t.ink} />
        <View style={{ flexDirection: "row", alignItems: "center", gap: 12, marginTop: 8 }}>
          <View style={{ flex: 1, minWidth: 0 }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
              <Svg width={12} height={12} viewBox="0 0 24 24"><Path d="M12 1l2.8 8.2L23 12l-8.2 2.8L12 23l-2.8-8.2L1 12l8.2-2.8z" fill={inkGold(t)} /></Svg>
              <Text style={{ flex: 1, fontFamily: FONT.semibold, fontSize: 11.5, letterSpacing: 2, textTransform: "uppercase", color: inkGold(t) }}>{eyebrow}</Text>
            </View>
            <Text accessibilityRole="header" style={{ fontFamily: FONT.display, fontSize: 36, lineHeight: 38, letterSpacing: -0.9, color: t.ink, marginTop: 12 }}>{title}</Text>
          </View>
          <Medal size={104} />
        </View>
        <Text style={{ fontFamily: FONT.regular, fontSize: 15, lineHeight: 24, color: t.muted, marginTop: 20 }}>{lead}</Text>
      </View>
      <View style={{ position: "absolute", left: 0, right: 0, bottom: 0 }}><Arcade color="#b08a3e" /></View>
    </View>
  );
}

/** /plan – the 365-day plan (website: plan/page.tsx) */
export function PlanScreen() {
  const tr = useWebT("plan");
  return (
    <Page>
      <MarbleHero eyebrow={tr("eyebrow")} title={tr("title")} lead={tr("lead")} />
      <View style={{ paddingHorizontal: 16, paddingBottom: 64 }}>
        <RequireAccount feature={tr("title")}><PlanBoard /></RequireAccount>
        <View style={{ marginTop: 56 }}><Markdown text={tr("about")} /></View>
      </View>
    </Page>
  );
}
