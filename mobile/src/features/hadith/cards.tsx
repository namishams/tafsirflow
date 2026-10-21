import { useEffect, useState } from "react";
import { Pressable, Text, View, useWindowDimensions } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { router, type Href } from "expo-router";
import { Display, Segmented, Stage, StarLattice } from "@/components/brand";
import { Icon } from "@/components/icons";
import { CALLIG_FONT, FONT, R, TONES, stage, useTheme } from "@/lib/theme";
import { useLang } from "@/i18n";
import { useStored, writeJSON } from "@/lib/store";
import { shouldOnboard } from "@/features/extra/Onboarding";
import { prayerChapter, showsNahj, useTradition, type TraditionChoice } from "@/lib/tradition";
import { getDailyHadith, type HadithItem } from "./data";
import { HadithCard, LoadState } from "./ui";
import { useHadithText } from "./texts";

const go = (href: string) => router.push(href as Href);

// --- the tradition question (Today, once) and the setting (Account) -------------------------------------------
export const ASK_DONE_KEY = "qmc.traditionAsked";

/** asked once on Today, respectfully, with "I'd rather not say / show both"; "Later" also counts as asked
 *  (the choice stays in Account). Hidden while the first-run onboarding is open. */
export function TraditionAsk() {
  const x = useHadithText();
  const { lang } = useLang();
  const { asked, set } = useTradition();
  const done = useStored<boolean>(ASK_DONE_KEY, false);
  useStored<unknown>("tf:goal", null); // re-render when the first-run questions are answered
  const onboarding = shouldOnboard();
  if (asked || done || onboarding) return null;
  const choose = (t: TraditionChoice) => { set(t, lang); writeJSON(ASK_DONE_KEY, true, true); };
  const opt = (t: TraditionChoice, label: string, quiet?: boolean) => (
    <Pressable key={t} onPress={() => choose(t)} accessibilityRole="button" accessibilityLabel={label}
      style={({ pressed }) => ({ borderRadius: R.md, borderWidth: 1, paddingHorizontal: 16, paddingVertical: 14, borderColor: pressed ? stage.gold : "rgba(214,180,108,0.3)", backgroundColor: pressed ? "rgba(214,180,108,0.12)" : quiet ? "transparent" : "rgba(255,255,255,0.04)" })}>
      <Text style={{ fontFamily: quiet ? FONT.medium : FONT.semibold, fontSize: 16, color: quiet ? stage.textSoft : "#fff" }}>{label}</Text>
    </Pressable>
  );
  return (
    <Stage rounded={R.card}>
      <View style={{ padding: 22 }}>
        <Text style={{ fontFamily: FONT.semibold, fontSize: 11.5, letterSpacing: 2, textTransform: "uppercase", color: stage.gold }}>{x.tradKicker}</Text>
        <Display size="title1" onStage style={{ marginTop: 10 }}>{x.tradQ}</Display>
        <Text style={{ fontFamily: FONT.regular, fontSize: 14, lineHeight: 21, color: stage.textSoft, marginTop: 8 }}>{x.tradLead}</Text>
        <View style={{ gap: 8, marginTop: 16 }}>
          {opt("sunni", x.sunni)}
          {opt("shia", x.shia)}
          {opt("both", x.both, true)}
        </View>
        <Text onPress={() => writeJSON(ASK_DONE_KEY, true, true)} accessibilityRole="button" style={{ alignSelf: "center", fontFamily: FONT.medium, fontSize: 14, color: stage.textMuted, paddingVertical: 10, marginTop: 4 }}>{x.later}</Text>
      </View>
    </Stage>
  );
}

/** the setting in Account: three segments */
export function TraditionSetting() {
  const x = useHadithText();
  const t = useTheme();
  const { lang } = useLang();
  const { tradition, set } = useTradition();
  return (
    <View style={{ gap: 8 }}>
      <Segmented<TraditionChoice> value={tradition} options={[["sunni", x.sunni], ["shia", x.shia], ["both", x.both]]} onChange={(v) => { set(v, lang); writeJSON(ASK_DONE_KEY, true, true); }} />
      <Text style={{ fontFamily: FONT.regular, fontSize: 12.5, lineHeight: 18, color: t.muted }}>{x.tradNote}</Text>
    </View>
  );
}

// --- How to pray --------------------------------------------------------------------------------------------------
function Pill({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} accessibilityRole="link" accessibilityLabel={label}
      style={({ pressed }) => ({ flexDirection: "row", alignItems: "center", gap: 6, minHeight: 40, paddingHorizontal: 14, borderRadius: R.pill, borderWidth: 1, borderColor: stage.goldSoft, backgroundColor: pressed ? "rgba(255,255,255,0.1)" : "rgba(255,255,255,0.04)" })}>
      <Text style={{ fontFamily: FONT.semibold, fontSize: 14, color: "#fff" }}>{label}</Text>
      <Icon name="chevronRight" color={stage.gold} size={14} />
    </Pressable>
  );
}

/** prominent card: opens the prayer trainer (in the user's tradition), wudu and the library chapter */
export function HowToPrayCard() {
  const x = useHadithText();
  const { tradition } = useTradition();
  const lead = tradition === "shia" ? x.howShia : tradition === "sunni" ? x.howSunni : x.howBoth;
  return (
    <View style={{ borderRadius: R.card, overflow: "hidden", borderWidth: 1, borderColor: stage.goldSoft }}>
      <LinearGradient colors={TONES[2] ?? [stage.bg, stage.deep]} start={{ x: 0.1, y: 0 }} end={{ x: 0.9, y: 1 }} style={{ padding: 20 }}>
        <StarLattice opacity={0.07} />
        <Text allowFontScaling={false} style={{ position: "absolute", top: 4, end: 14, fontFamily: CALLIG_FONT, fontSize: 46, lineHeight: 84, color: "rgba(214,180,108,0.26)" }}>الصلاة</Text>
        <Text style={{ fontFamily: FONT.semibold, fontSize: 11.5, letterSpacing: 2, textTransform: "uppercase", color: stage.gold }}>{x.howKicker}</Text>
        <Pressable onPress={() => go("/salah")} accessibilityRole="button" accessibilityLabel={`${x.howTitle}. ${lead}`}>
          <Text style={{ fontFamily: FONT.display, fontSize: 27, letterSpacing: -0.5, color: "#fff", marginTop: 8 }}>{x.howTitle}</Text>
          <Text style={{ fontFamily: FONT.regular, fontSize: 14.5, lineHeight: 21, color: stage.textSoft, marginTop: 6, maxWidth: 520 }}>{lead}</Text>
        </Pressable>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 16 }}>
          <Pill label={x.howTrainer} onPress={() => go("/salah")} />
          <Pill label={x.howWudu} onPress={() => go("/wudu")} />
          {tradition === "sunni" || tradition === "shia"
            ? <Pill label={x.howChapter} onPress={() => go(prayerChapter(tradition))} />
            : <>
                <Pill label={`${x.howChapter} · ${x.sunni}`} onPress={() => go("/islam/prayer-sunni")} />
                <Pill label={`${x.howChapter} · ${x.shia}`} onPress={() => go("/islam/prayer-shia")} />
              </>}
        </View>
      </LinearGradient>
    </View>
  );
}

// --- Hadith of the day -------------------------------------------------------------------------------------------
export function useDailyHadith() {
  const { lang } = useLang();
  const { tradition } = useTradition();
  const [state, setState] = useState<{ item: HadithItem | null; status: "loading" | "ok" | "error" }>({ item: null, status: "loading" });
  const [tick, setTick] = useState(0);
  useEffect(() => {
    let live = true;
    setState({ item: null, status: "loading" });
    getDailyHadith(lang, tradition)
      .then((item) => live && setState({ item, status: item ? "ok" : "error" }))
      .catch(() => live && setState({ item: null, status: "error" }));
    return () => { live = false; };
  }, [lang, tradition, tick]);
  return { ...state, retry: () => setTick((n) => n + 1) };
}

/** Today: the hadith of the day with a link to the hadith screen; quiet when offline */
export function HadithOfTheDay() {
  const x = useHadithText();
  const t = useTheme();
  const d = useDailyHadith();
  if (d.status === "error") return null;
  return (
    <View>
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
        <Text accessibilityRole="header" style={{ fontFamily: FONT.display, fontSize: 23, color: t.ink }}>{x.daily}</Text>
        <Text onPress={() => go("/hadith")} accessibilityRole="link" style={{ fontFamily: FONT.bold, fontSize: 14, color: t.accent, paddingVertical: 6 }}>{x.title}</Text>
      </View>
      {d.item ? <HadithCard item={d.item} maxLines={14} /> : <LoadState state="loading" />}
    </View>
  );
}

// --- spotlight cards (Today, Discover) --------------------------------------------------------------------------
function Spot({ title, lead, cta, arabic, colors, onPress }: { title: string; lead: string; cta: string; arabic: string; colors: [string, string]; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={`${title}. ${lead}`} style={({ pressed }) => ({ flex: 1, minWidth: 260, opacity: pressed ? 0.9 : 1 })}>
      <LinearGradient colors={colors} start={{ x: 0.1, y: 0 }} end={{ x: 0.9, y: 1 }} style={{ borderRadius: R.card, padding: 18, minHeight: 170, overflow: "hidden", borderWidth: 1, borderColor: stage.goldSoft, justifyContent: "flex-end" }}>
        <StarLattice opacity={0.07} />
        <Text allowFontScaling={false} style={{ position: "absolute", top: 6, end: 14, fontFamily: CALLIG_FONT, fontSize: 40, lineHeight: 76, color: "rgba(214,180,108,0.28)" }}>{arabic}</Text>
        <Text style={{ fontFamily: FONT.display, fontSize: 23, letterSpacing: -0.4, color: "#fff" }}>{title}</Text>
        <Text style={{ fontFamily: FONT.regular, fontSize: 14, lineHeight: 20, color: stage.textSoft, marginTop: 6 }}>{lead}</Text>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginTop: 12 }}>
          <Text style={{ fontFamily: FONT.bold, fontSize: 14, color: stage.gold }}>{cta}</Text>
          <Icon name="chevronRight" color={stage.gold} size={16} />
        </View>
      </LinearGradient>
    </Pressable>
  );
}

/** the Nahj al-Balagha card – Shia mode only */
export function NahjCard() {
  const x = useHadithText();
  const { tradition } = useTradition();
  if (!showsNahj(tradition)) return null;
  return <Spot title={x.nahj} lead={x.nahjLead} cta={x.nahjOpen} arabic="نهج البلاغة" colors={TONES[3] ?? [stage.bg, stage.deep]} onPress={() => go("/nahj")} />;
}

/** Discover: How to pray, Hadith and (Shia mode) Nahj al-Balagha */
export function HadithSpotlight() {
  const x = useHadithText();
  const { width } = useWindowDimensions();
  const { tradition } = useTradition();
  return (
    <View style={{ gap: 12 }}>
      <HowToPrayCard />
      <View style={{ flexDirection: width >= 640 ? "row" : "column", gap: 12 }}>
        <Spot title={x.title} lead={x.lead} cta={x.open} arabic="حديث" colors={TONES[0] ?? [stage.bg, stage.deep]} onPress={() => go("/hadith")} />
        {showsNahj(tradition) ? <NahjCard /> : null}
      </View>
    </View>
  );
}
