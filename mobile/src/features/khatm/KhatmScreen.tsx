import { useEffect, useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View, useWindowDimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Stack, router, type Href } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import Svg, { Circle, Defs, Ellipse, G, Path, RadialGradient, Rect, Stop } from "react-native-svg";
import { CALLIG_FONT, FONT, R, goldButton, stage, useTheme } from "@/lib/theme";
import { GoldButton, Stage } from "@/components/brand";
import { Icon } from "@/components/icons";
import { useAuth } from "@/lib/auth";
import { getChapters, type Chapter } from "@/lib/quran";
import { useStored, writeJSON } from "@/lib/store";
import { useLang } from "@/i18n";
import { useWebT } from "@/i18n/web";
import { TOTAL_VERSES, juzOf, keyAt } from "@/web/quranIndex";
import { today } from "@/web/learning";
import { Callout, Kicker, QArcade, QuranRing, QuranShamsa, useQ } from "@/features/radio/art";
import { Choices, goBack } from "@/features/radio/controls";
import { useReduceMotion } from "@/features/radio/motion";
import { RadioMiniPlayer, MINI_SPACE } from "@/features/radio/MiniPlayer";
import { useRadioSelect } from "@/features/radio/engine";
import { useAppT } from "@/features/radio/strings";
import { MEDALLION_LINES } from "./texts";

// /khatm – the website's khatm planner (KhatmPlanner.tsx, khatm/page.tsx): read the whole Quran in N days, today's
// portion, progress, and a plan that recalculates the portion when you fall behind or read ahead. Stored under
// tf:khatm in the website's shape, so it syncs with the account and the website.
type Plan = { startDay: number; days: number; pos: number; log: Record<string, number>; at: number; round: number };
const KEY = "tf:khatm";
const PRESETS = [7, 15, 30, 60, 90, 180, 365];

export default function KhatmScreen() {
  const t = useWebT("khatm");
  const ta = useWebT("app");
  const th = useTheme();
  const q = useQ();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const reduce = useReduceMotion();
  const started = useRadioSelect((s) => s.started);
  const a = useAppT();
  const medal = width < 360 ? 100 : 128;

  return (
    <View style={{ flex: 1, backgroundColor: th.bg }}>
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingBottom: (started ? MINI_SPACE : 0) + 48 + insets.bottom }}>
        {/* hero: white marble with gold and the shamsa medallion */}
        <View style={{ overflow: "hidden", borderBottomWidth: 1, borderBottomColor: "rgba(201,166,94,0.45)" }}>
          <LinearGradient colors={[q.marbleA, q.marbleB]} style={StyleSheet.absoluteFill} />
          <Svg style={StyleSheet.absoluteFill} pointerEvents="none">
            <Defs>
              <RadialGradient id="kh1" cx="82%" cy="38%" rx="70%" ry="90%">
                <Stop offset="0" stopColor={th.dark ? "rgb(214,180,108)" : "rgb(255,233,178)"} stopOpacity={th.dark ? 0.16 : 0.55} />
                <Stop offset="0.62" stopColor={th.dark ? "rgb(214,180,108)" : "rgb(255,233,178)"} stopOpacity={0} />
              </RadialGradient>
              <RadialGradient id="kh2" cx="0%" cy="100%" rx="50%" ry="70%"><Stop offset="0" stopColor="rgb(214,180,108)" stopOpacity={0.14} /><Stop offset="0.7" stopColor="rgb(214,180,108)" stopOpacity={0} /></RadialGradient>
            </Defs>
            <Rect width="100%" height="100%" fill="url(#kh1)" />
            <Rect width="100%" height="100%" fill="url(#kh2)" />
          </Svg>
          <Inlay />
          <View style={{ paddingTop: insets.top + 6, paddingHorizontal: 16, paddingBottom: 54 }}>
            <Pressable onPress={() => goBack()} accessibilityRole="button" accessibilityLabel={a("back")} hitSlop={12} style={{ width: 40, height: 40, justifyContent: "center", marginLeft: -6 }}>
              <Icon name="chevronLeft" color={th.ink} size={24} />
            </Pressable>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 12, marginTop: 6 }}>
              <View style={{ flex: 1, minWidth: 0 }}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                  <Svg width={12} height={12} viewBox="0 0 24 24"><Path d="M12 1l2.8 8.2L23 12l-8.2 2.8L12 23l-2.8-8.2L1 12l8.2-2.8z" fill={q.inkGold} /></Svg>
                  <Kicker style={{ flexShrink: 1 }}>{ta("name")}</Kicker>
                </View>
                <Text accessibilityRole="header" style={{ fontFamily: FONT.display, fontSize: width < 360 ? 32 : 40, lineHeight: width < 360 ? 34 : 42, letterSpacing: -1, color: th.ink, marginTop: 12 }}>{t("title")}</Text>
              </View>
              <QuranShamsa lines={MEDALLION_LINES} size={medal} reduce={reduce} />
            </View>
            <Text style={{ fontFamily: FONT.regular, fontSize: 15.5, lineHeight: 25, color: th.muted, marginTop: 20 }}>{t("lead")}</Text>
          </View>
          <QArcade />
        </View>

        <View style={{ paddingHorizontal: 16 }}>
          <Planner />
          <View style={{ marginTop: 44, borderRadius: R.card, borderWidth: 1, borderColor: "rgba(201,166,94,0.25)", backgroundColor: th.surface, padding: 20 }}>
            <Text accessibilityRole="header" style={{ fontFamily: FONT.display, fontSize: 24, lineHeight: 29, letterSpacing: -0.5, color: th.ink }}>{t("aboutTitle")}</Text>
            <Text style={{ fontFamily: FONT.regular, fontSize: 15, lineHeight: 24, color: th.muted, marginTop: 12 }}>{t("about1")}</Text>
            <Text style={{ fontFamily: FONT.regular, fontSize: 15, lineHeight: 24, color: th.muted, marginTop: 12 }}>{t("about2")}</Text>
          </View>
        </View>
      </ScrollView>
      <RadioMiniPlayer />
    </View>
  );
}

function Planner() {
  const t = useWebT("khatm");
  const a = useAppT();
  const th = useTheme();
  const q = useQ();
  const { lang } = useLang();
  const { user } = useAuth();
  const stored = useStored<(Plan & { deleted?: boolean }) | null>(KEY, null);
  const plan = stored && !stored.deleted ? stored : null;
  const [days, setDays] = useState(30);
  const [custom, setCustom] = useState("30");
  const [chapters, setChapters] = useState<Chapter[]>([]);
  useEffect(() => { getChapters(lang).then(setChapters).catch(() => undefined); }, [lang]);
  const save = (p: Plan | null) => writeJSON(KEY, p ?? { deleted: true, at: Date.now() }); // marker: see lib/plans.ts
  const name = (s: number) => chapters.find((c) => c.id === s)?.name_simple ?? `Surah ${s}`;
  const pick = (d: number) => { setDays(d); setCustom(String(d)); };
  // numbers in messages are formatted for the language, like next-intl does on the website
  const num = (n: number) => n.toLocaleString(lang === "de" ? "de-DE" : "en-US");
  const hint = !user ? (
    <Text style={{ fontFamily: FONT.regular, fontSize: 13, lineHeight: 19, color: th.muted, marginTop: 14 }}>
      {a("syncHint")} <Text onPress={() => router.push("/sign-in" as Href)} accessibilityRole="link" style={{ fontFamily: FONT.semibold, color: th.accent }}>{a("signIn")}</Text>
    </Text>
  ) : null;

  if (!plan) {
    return (
      <>
        <Callout style={{ marginTop: 30 }}>
          <Text accessibilityRole="header" style={{ fontFamily: FONT.display, fontSize: 24, lineHeight: 28, letterSpacing: -0.5, color: th.ink }}>{t("newPlan")}</Text>
          <Text style={{ fontFamily: FONT.regular, fontSize: 14, lineHeight: 20, color: th.muted, marginTop: 4 }}>{t("newPlanD")}</Text>
          <View style={{ marginTop: 18 }}>
            <Choices value={PRESETS.includes(days) ? days : -1} options={PRESETS.map((d) => [d, t("days", { n: d })] as [number, string])} onChange={pick} label={t("newPlanD")} />
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginTop: 10 }}>
              <Text style={{ fontFamily: FONT.regular, fontSize: 14, color: th.muted }}>{t("custom")}</Text>
              <TextInput value={custom} keyboardType="number-pad" inputMode="numeric" maxLength={4} accessibilityLabel={t("custom")}
                onChangeText={(v) => { const d = v.replace(/\D/g, ""); setCustom(d); if (d) setDays(Math.max(1, Math.min(2000, Number(d)))); }}
                onBlur={() => setCustom(String(days))}
                style={{ height: 40, width: 80, borderRadius: R.pill, borderWidth: 1, borderColor: "rgba(201,166,94,0.45)", backgroundColor: th.surface, textAlign: "center", fontFamily: FONT.semibold, fontSize: 15, color: th.ink }} />
            </View>
          </View>
          <View style={{ flexDirection: "row", alignItems: "flex-start", gap: 12, marginTop: 18, borderRadius: R.md, backgroundColor: "rgba(201,166,94,0.09)", padding: 14 }}>
            <View style={{ width: 10, height: 10, marginTop: 7, transform: [{ rotate: "45deg" }], backgroundColor: th.gold }} />
            <Text style={{ flex: 1, fontFamily: FONT.regular, fontSize: 15, lineHeight: 23, color: th.ink }}>
              {t("perDay", { verses: num(Math.ceil(TOTAL_VERSES / days)), pages: num(Math.round((604 / days) * 10) / 10), minutes: num(Math.round((604 / days) * 2)) })}
            </Text>
          </View>
          <GoldButton title={t("start")} onPress={() => save({ startDay: today(), days, pos: 0, log: {}, at: Date.now(), round: 1 })} style={{ marginTop: 20, alignSelf: "flex-start" }} />
        </Callout>
        {hint}
      </>
    );
  }

  const dayNo = Math.min(plan.days, today() - plan.startDay + 1);
  const target = Math.min(TOTAL_VERSES, Math.round((TOTAL_VERSES / plan.days) * dayNo)); // where you should be by tonight
  const daysLeft = Math.max(1, plan.days - dayNo + 1);
  const portion = Math.max(0, Math.ceil((TOTAL_VERSES - plan.pos) / daysLeft)); // adapts if you are behind or ahead
  const end = Math.min(TOTAL_VERSES, plan.pos + portion);
  const a0 = keyAt(plan.pos), b = keyAt(end - 1);
  const pct = Math.round((plan.pos / TOTAL_VERSES) * 100);
  const behind = target - plan.pos;
  const finished = plan.pos >= TOTAL_VERSES;
  const markRead = () => save({ ...plan, pos: end, log: { ...plan.log, [today()]: (plan.log[today()] ?? 0) + (end - plan.pos) }, at: Date.now() });
  const reset = () => Alert.alert(t("resetConfirm"), undefined, [
    { text: a("cancel"), style: "cancel" },
    { text: a("delete"), style: "destructive", onPress: () => save(null) },
  ]);
  const status = finished ? t("done") : behind > 0 ? t("behind", { n: num(behind) }) : t("onTrack");
  const portionTitle = `${name(a0.s)} ${a0.v} – ${a0.s !== b.s ? `${name(b.s)} ` : ""}${b.v}`;

  return (
    <>
      <Callout style={{ marginTop: 30, alignItems: "center", gap: 20, paddingVertical: 24 }}>
        <QuranRing pct={pct} size={128}>
          <Text style={{ fontFamily: FONT.display, fontSize: 30, color: th.ink, fontVariant: ["tabular-nums"] }}>{pct}%</Text>
          <Kicker color={th.muted} style={{ fontSize: 10, marginTop: 4 }}>{t("progress")}</Kicker>
        </QuranRing>
        <View style={{ alignItems: "center" }} accessible accessibilityLabel={`${t("day")} ${dayNo} / ${plan.days}. ${t("juzNow", { n: juzOf(Math.min(plan.pos, TOTAL_VERSES - 1)) })}`}>
          <Kicker>{t("day")}</Kicker>
          <Text style={{ fontFamily: FONT.display, fontSize: 30, color: th.ink, marginTop: 6, fontVariant: ["tabular-nums"] }}>{dayNo} <Text style={{ fontSize: 18, color: th.muted }}>/ {plan.days}</Text></Text>
          <Text style={{ fontFamily: FONT.regular, fontSize: 12, color: th.muted, marginTop: 6 }}>{t("juzNow", { n: juzOf(Math.min(plan.pos, TOTAL_VERSES - 1)) })}</Text>
        </View>
        <View style={{ alignItems: "center" }} accessible accessibilityLabel={`${t("status")}: ${status}`}>
          <Kicker>{t("status")}</Kicker>
          <Text style={{ fontFamily: FONT.bold, fontSize: 18, color: behind > 0 && !finished ? q.inkGold : th.accent, marginTop: 6 }}>{status}</Text>
        </View>
      </Callout>

      {finished ? (
        <Stage rounded={R.card} style={{ marginTop: 16 }}>
          <View pointerEvents="none" style={{ position: "absolute", top: 7, left: 7, right: 7, bottom: 7, borderRadius: 12, borderWidth: 1, borderColor: "rgba(201,166,94,0.45)" }} />
          <View pointerEvents="none" style={{ position: "absolute", top: 12, left: 12, right: 12, bottom: 12, borderRadius: 9, borderWidth: 1, borderColor: "rgba(201,166,94,0.22)", borderStyle: "dashed" }} />
          <View style={{ padding: 30, alignItems: "center" }}>
            <Icon name="moon" color={stage.gold} size={26} />
            <Text accessibilityRole="header" style={{ fontFamily: FONT.display, fontSize: 28, lineHeight: 32, letterSpacing: -0.6, color: "#eef0f3", textAlign: "center", marginTop: 12 }}>{t("khatmDone")}</Text>
            <Text style={{ fontFamily: FONT.regular, fontSize: 15, lineHeight: 23, color: "rgba(255,255,255,0.7)", textAlign: "center", marginTop: 8 }}>{t("khatmDoneD")}</Text>
            <GoldButton title={t("again")} onPress={() => save({ startDay: today(), days: plan.days, pos: 0, log: {}, at: Date.now(), round: plan.round + 1 })} style={{ marginTop: 22, alignSelf: "center" }} />
          </View>
        </Stage>
      ) : (
        <Stage rounded={R.card} hairlines={false} style={{ marginTop: 16 }}>
          <LinearGradient pointerEvents="none" colors={["rgba(233,207,153,0)", "rgba(233,207,153,0.9)", "rgba(233,207,153,0)"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={{ position: "absolute", top: 0, left: 24, right: 24, height: 1 }} />
          <View style={{ padding: 20 }}>
            <View style={{ flexDirection: "row", alignItems: "flex-start", gap: 16 }}>
              <Window text={chapters.find((c) => c.id === a0.s)?.name_arabic ?? String(a0.s)} />
              <View style={{ flex: 1, minWidth: 0 }}>
                <Kicker color={stage.gold}>{t("today")}</Kicker>
                <Text accessibilityRole="header" style={{ fontFamily: FONT.display, fontSize: 24, lineHeight: 28, letterSpacing: -0.5, color: "#eef0f3", marginTop: 8 }}>{portionTitle}</Text>
                <Text style={{ fontFamily: FONT.regular, fontSize: 14, color: "rgba(255,255,255,0.6)", marginTop: 4 }}>{t("portion", { n: end - plan.pos })}</Text>
                <View style={{ height: 3, borderRadius: 3, backgroundColor: "rgba(255,255,255,0.12)", overflow: "hidden", marginTop: 14 }} accessibilityRole="progressbar" accessibilityValue={{ min: 0, max: 100, now: pct }}>
                  <LinearGradient colors={["#b98f45", "#f3e2b6"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={{ height: 3, width: `${pct}%` }} />
                </View>
              </View>
            </View>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12, marginTop: 22 }}>
              <GoldButton title={t("read")} onPress={() => router.push(`/quran/${a0.s}?v=${a0.v}` as Href)} style={{ alignSelf: "flex-start" }} />
              <Pressable onPress={markRead} accessibilityRole="button" accessibilityLabel={t("markRead")}
                style={({ pressed }) => ({ height: 52, borderRadius: R.md, borderWidth: 1, borderColor: "rgba(214,180,108,0.6)", paddingHorizontal: 20, justifyContent: "center", backgroundColor: pressed ? "rgba(255,255,255,0.05)" : "transparent" })}>
                <Text style={{ fontFamily: FONT.bold, fontSize: 15, color: "#f3e2b6" }}>{t("markRead")}</Text>
              </Pressable>
            </View>
            <Text style={{ fontFamily: FONT.regular, fontSize: 12.5, lineHeight: 18, color: "rgba(255,255,255,0.55)", marginTop: 16 }}>{t("adaptive")}</Text>
          </View>
        </Stage>
      )}
      <Pressable onPress={reset} accessibilityRole="button" accessibilityLabel={t("reset")} style={{ alignSelf: "flex-start", marginTop: 22, paddingVertical: 4 }}>
        <Text style={{ fontFamily: FONT.regular, fontSize: 14, color: th.muted, textDecorationLine: "underline", textDecorationColor: "rgba(201,166,94,0.6)" }}>{t("reset")}</Text>
      </Pressable>
      {plan.pos > 0 && plan.pos < TOTAL_VERSES ? <Text style={{ fontFamily: FONT.regular, fontSize: 12, color: th.muted, marginTop: 6 }}>{t("position", { key: `${keyAt(plan.pos).s}:${keyAt(plan.pos).v}` })}</Text> : null}
      {hint}
    </>
  );
}

/** .q-window: a pointed window with the surah's name in calligraphy */
function Window({ text }: { text: string }) {
  return (
    <View style={{ width: 64, height: 80, alignItems: "center", justifyContent: "center" }} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      <Svg width={64} height={80} viewBox="0 0 64 80" style={StyleSheet.absoluteFill}>
        <Defs><RadialGradient id="kw" cx="50%" cy="30%" r="70%"><Stop offset="0" stopColor="#e9cf99" stopOpacity={0.18} /><Stop offset="1" stopColor="#e9cf99" stopOpacity={0} /></RadialGradient></Defs>
        <Path d="M0.5 79.5V26C0.5 12 15 2 32 0.5 49 2 63.5 12 63.5 26v53.5z" fill="url(#kw)" stroke="rgba(233,207,153,0.55)" strokeWidth={1} />
        <Path d="M5 75V27C5 15 17 7 32 5.5 47 7 59 15 59 27v48z" fill="none" stroke="rgba(233,207,153,0.2)" strokeWidth={1} />
      </Svg>
      <Text allowFontScaling={false} numberOfLines={2} adjustsFontSizeToFit style={{ fontFamily: CALLIG_FONT, fontSize: 17, lineHeight: 23, color: "#e9cf99", textAlign: "center", writingDirection: "rtl", paddingHorizontal: 4, paddingTop: 8 }}>{text}</Text>
    </View>
  );
}

/** QuranInlay: floral inlay (pietra dura) in the corner of the hero */
function Inlay() {
  const leaves: [number, number, number][] = [[34, 160, -40], [58, 118, -70], [66, 92, 200], [96, 34, -10], [108, 152, -20], [134, 124, -55], [20, 182, -15]];
  const c = goldButton.line;
  return (
    <Svg width={160} height={160} viewBox="0 0 200 200" style={{ position: "absolute", left: -24, bottom: -16, opacity: 0.5 }} pointerEvents="none">
      <G fill={c} fillOpacity={0.08} stroke={c} strokeWidth={1} strokeLinecap="round" strokeLinejoin="round">
        <Path d="M4 198C52 176 78 128 70 76C66 46 88 22 118 16" fill="none" />
        <Path d="M30 186C82 182 124 160 150 112" fill="none" />
        {leaves.map(([x, y, r], i) => <Path key={i} d="M0 0C7-9 21-10 30-2C21 4 8 5 0 0Z" transform={`translate(${x} ${y}) rotate(${r})`} />)}
        <G transform="translate(70 76)">
          {Array.from({ length: 8 }, (_, i) => <Ellipse key={i} cx={0} cy={-11} rx={5.2} ry={10} transform={`rotate(${i * 45})`} />)}
          <Circle r={5.5} fillOpacity={0.25} />
        </G>
        <Path d="M118 30c-11-6-12-19-6-27 3 5 6 7 6 11 0-4 3-6 6-11 6 8 5 21-6 27z" transform="translate(4 -6)" fillOpacity={0.16} />
        <G transform="translate(150 112)">
          {Array.from({ length: 6 }, (_, i) => <Ellipse key={i} cx={0} cy={-6.5} rx={3.2} ry={6} transform={`rotate(${i * 60})`} />)}
          <Circle r={3} fillOpacity={0.3} />
        </G>
        <Circle cx={34} cy={128} r={2.2} fillOpacity={0.4} /><Circle cx={112} cy={70} r={2.2} fillOpacity={0.4} /><Circle cx={160} cy={150} r={2.2} fillOpacity={0.4} />
      </G>
    </Svg>
  );
}
