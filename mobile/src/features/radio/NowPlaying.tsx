import { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Stack, router, type Href } from "expo-router";
import { StatusBar } from "expo-status-bar";
import Svg, { Defs, RadialGradient, Rect, Stop } from "react-native-svg";
import { CALLIG_FONT, FONT, R, stage } from "@/lib/theme";
import { OutlineButton, Stage } from "@/components/brand";
import { Icon } from "@/components/icons";
import { SITE } from "@/lib/api";
import { intlLocale, useLang } from "@/i18n";
import { useWebT } from "@/i18n/web";
import { countOf } from "@/web/counts";
import { currentReciter, initials, radio, useRadio, type Repeat, type Sleep } from "./engine";
import { useSurahText } from "./useSurahText";
import { RadioOrb } from "./art";
import { Choices, GoldPlay, RoundButton, fmtTime, shareLink } from "./controls";
import { GoldSlider } from "./Slider";
import { VerseArabic, wordAt } from "./VerseText";
import { useAppT } from "./strings";
import { useReduceMotion } from "./motion";
import { goBack } from "@/components/page";
import { reciterName } from "@/lib/quran";

// Full-screen "now playing" (app): the reciter orb, the surah in calligraphy, the verse being recited with the word
// lit in gold and its translation, position in the verse, previous/next verse and surah, speed, repeat and sleep timer.
// Same dark green stage and gold as the website's radio; everything moves slowly or not at all.

function useProgress(started: boolean, playing: boolean) {
  const [p, setP] = useState(() => radio.progress());
  useEffect(() => {
    if (!started) { setP({ t: 0, d: 0 }); return; }
    setP(radio.progress());
    const id = setInterval(() => setP(radio.progress()), playing ? 150 : 600);
    return () => clearInterval(id);
  }, [started, playing]);
  return p;
}

export default function NowPlaying() {
  const r = useRadio();
  const t = useWebT("radio");
  const a = useAppT();
  const { lang } = useLang();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const reduce = useReduceMotion();
  const reciter = currentReciter(r);
  const { verses, failed, retry } = useSurahText(r.now.s, lang, reciter);
  const verse = verses?.find((v) => v.verse_number === r.now.v);
  const chapter = r.chapters.find((c) => c.id === r.now.s);
  const p = useProgress(r.started, r.playing);
  const [drag, setDrag] = useState<number | null>(null);
  const active = reciter.id > 0 && r.started ? wordAt(verse, p.t * 1000) : null;
  const orb = Math.min(width - 140, 230);
  const next = r.started ? radio.upNext() : null;
  const close = () => { if (router.canGoBack()) goBack(); else router.replace("/radio" as Href); };
  const share = () => {
    const title = `Quran Masterclass Radio – ${t(`st_${r.station.id}`)}`;
    const url = `${SITE}/${lang}/radio`;
    shareLink(title, url);
  };
  const dec = (n: number) => { try { return n.toLocaleString(intlLocale(lang)); } catch { return String(n); } };
  const speeds: [number, string][] = [[0.75, `${dec(0.75)}×`], [1, "1×"], [1.25, `${dec(1.25)}×`]];
  const repeats: [Repeat, string][] = [["off", a("repeatOff")], ["verse", a("repeatVerse")], ["surah", a("repeatSurah")]];
  const sleeps: [Sleep, string][] = [[0, t("off")], [15, `15 ${t("min")}`], [30, `30 ${t("min")}`], [60, `60 ${t("min")}`], ["eos", a("sleepEnd")]];
  const pos = drag ?? (p.d > 0 ? p.t / p.d : 0);

  return (
    <Stage hairlines={false} style={{ flex: 1 }}>
      <Stack.Screen options={{ headerShown: false, animation: "slide_from_bottom", gestureEnabled: true }} />
      <StatusBar style="light" />
      <Svg style={StyleSheet.absoluteFill} pointerEvents="none">
        <Defs>
          <RadialGradient id="np1" cx="50%" cy="22%" r="55%"><Stop offset="0" stopColor="rgb(214,180,108)" stopOpacity={0.13} /><Stop offset="1" stopColor="rgb(214,180,108)" stopOpacity={0} /></RadialGradient>
          <RadialGradient id="np2" cx="0%" cy="100%" r="50%"><Stop offset="0" stopColor="rgb(58,190,146)" stopOpacity={0.2} /><Stop offset="1" stopColor="rgb(58,190,146)" stopOpacity={0} /></RadialGradient>
        </Defs>
        <Rect width="100%" height="100%" fill="url(#np1)" />
        <Rect width="100%" height="100%" fill="url(#np2)" />
      </Svg>
      <ScrollView contentContainerStyle={{ paddingTop: insets.top + 4, paddingBottom: insets.bottom + 36, paddingHorizontal: 20 }}>
        {/* top bar */}
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          <Pressable onPress={close} accessibilityRole="button" accessibilityLabel={a("close")} hitSlop={10} style={{ width: 44, height: 44, justifyContent: "center", marginStart: -8 }}>
            <Icon name="chevronDown" color="#ffffff" size={26} />
          </Pressable>
          <View style={{ flex: 1, alignItems: "center" }}>
            <Text style={{ fontFamily: FONT.semibold, fontSize: 11, letterSpacing: 2, textTransform: "uppercase", color: stage.gold }}>{a("nowPlaying")}</Text>
            <Text numberOfLines={1} style={{ fontFamily: FONT.semibold, fontSize: 13, color: "rgba(255,255,255,0.75)", marginTop: 2 }}>{t("title")} · {t(`st_${r.station.id}`)}</Text>
          </View>
          <Pressable onPress={share} accessibilityRole="button" accessibilityLabel={a("shareRadio")} hitSlop={10} style={{ width: 44, height: 44, alignItems: "flex-end", justifyContent: "center", marginEnd: -6 }}>
            <Icon name="share" color="#ffffff" size={20} />
          </Pressable>
        </View>

        {/* orb */}
        <View style={{ alignItems: "center", marginTop: 26 }}>
          <RadioOrb on={r.playing} size={orb} label={initials(reciter.name)} reduce={reduce} />
        </View>

        {/* surah in calligraphy, verse counter, reciter */}
        <View style={{ alignItems: "center", marginTop: 22 }} accessible accessibilityRole="header"
          accessibilityLabel={`${chapter ? `${chapter.id}. ${chapter.name_simple}` : r.now.s}, ${a("verseOf", { v: r.now.v, n: countOf(r.now.s) })}, ${reciter.name}`}>
          {chapter?.name_arabic ? <Text allowFontScaling={false} style={{ fontFamily: CALLIG_FONT, fontSize: 40, lineHeight: 64, color: stage.gold, writingDirection: "rtl", textAlign: "center" }}>{chapter.name_arabic}</Text> : null}
          <Text style={{ fontFamily: FONT.display, fontSize: 24, lineHeight: 28, letterSpacing: -0.5, color: "#eef0f3", textAlign: "center" }}>
            {chapter ? `${chapter.id}. ${chapter.name_simple}` : `${r.now.s}`}
          </Text>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginTop: 8 }}>
            <View style={{ borderRadius: R.pill, borderWidth: 1, borderColor: stage.goldSoft, paddingHorizontal: 10, paddingVertical: 3 }}>
              <Text style={{ fontFamily: FONT.semibold, fontSize: 12.5, color: "#f3e2b6" }}>{a("verseOf", { v: r.now.v, n: countOf(r.now.s) })}</Text>
            </View>
            <Text numberOfLines={1} style={{ flexShrink: 1, fontFamily: FONT.regular, fontSize: 13.5, color: "rgba(255,255,255,0.6)" }}>{reciterName(reciter, lang)}</Text>
          </View>
        </View>

        {/* the verse being recited */}
        <View style={{ marginTop: 22, borderRadius: R.card, borderWidth: 1, borderColor: "rgba(214,180,108,0.22)", backgroundColor: "rgba(255,255,255,0.04)", padding: 18, minHeight: 120, justifyContent: "center" }}>
          {verse ? (
            <>
              <VerseArabic verse={verse} activeWord={active} size={28} />
              {verse.translation ? <Text style={{ fontFamily: FONT.regular, fontSize: 15.5, lineHeight: 24, color: "rgba(255,255,255,0.72)", marginTop: 10 }}>{verse.translation}</Text> : null}
            </>
          ) : failed ? (
            <View style={{ gap: 10 }}>
              <Text style={{ fontFamily: FONT.regular, fontSize: 14.5, lineHeight: 21, color: "rgba(255,255,255,0.7)" }}>{a("textUnavailable")}</Text>
              <OutlineButton title={a("tryAgain")} onPress={retry} onStage compact />
            </View>
          ) : <ActivityIndicator color={stage.gold} accessibilityLabel="…" />}
        </View>

        {r.offline ? (
          <View style={{ marginTop: 14, borderRadius: R.md, borderWidth: 1, borderColor: stage.goldSoft, padding: 14, gap: 10 }} accessibilityLiveRegion="polite">
            <Text style={{ fontFamily: FONT.regular, fontSize: 14.5, lineHeight: 21, color: "rgba(255,255,255,0.8)" }}>{a("offline")}</Text>
            <OutlineButton title={a("tryAgain")} onPress={radio.retry} onStage compact />
          </View>
        ) : null}
        {r.banner ? (
          <View style={{ marginTop: 14, borderRadius: R.md, borderWidth: 1, borderColor: stage.goldSoft, padding: 14 }} accessibilityLiveRegion="assertive">
            <Text style={{ fontFamily: FONT.bold, fontSize: 13, color: stage.gold }}>{t("adhanNow")}</Text>
            <Text style={{ fontFamily: FONT.display, fontSize: 22, color: "#ffffff", marginTop: 2 }}>{t(`p_${r.banner}`)}</Text>
            {r.adhanCredit ? <Text style={{ fontFamily: FONT.regular, fontSize: 12, color: "rgba(255,255,255,0.6)", marginTop: 4 }}>{r.adhanCredit}</Text> : null}
          </View>
        ) : null}

        {/* position in the verse */}
        <View style={{ marginTop: 18 }}>
          <GoldSlider value={pos} label={a("seek")} valueText={a("elapsed", { a: fmtTime(pos * p.d), b: fmtTime(p.d) })} step={0.1}
            onChange={(x) => setDrag(x)} onDone={(x) => { setDrag(null); if (p.d > 0) radio.seek(x * p.d); }} />
          <View style={{ flexDirection: "row", direction: "ltr", justifyContent: "space-between" }} importantForAccessibility="no-hide-descendants" accessibilityElementsHidden>
            <Text style={{ fontFamily: FONT.medium, fontSize: 12, color: "rgba(255,255,255,0.55)", fontVariant: ["tabular-nums"] }}>{fmtTime(pos * p.d)}</Text>
            <Text style={{ fontFamily: FONT.medium, fontSize: 12, color: "rgba(255,255,255,0.55)", fontVariant: ["tabular-nums"] }}>{p.d > 0 ? fmtTime(p.d) : "–:––"}</Text>
          </View>
        </View>

        {/* transport */}
        <View style={{ marginTop: 14, flexDirection: "row", direction: "ltr", alignItems: "center", justifyContent: "space-between" }}>
          <RoundButton icon="prev" label={a("prevSurah")} onPress={radio.prevSurah} size={44} />
          <RoundButton icon="chevronLeft" fixed label={t("prev")} onPress={radio.prevVerse} size={52} />
          <GoldPlay playing={r.playing} onPress={radio.toggle} labels={[t("pause"), t("play")]} size={78} />
          <RoundButton icon="chevronRight" fixed label={t("nextVerse")} onPress={radio.skipVerse} size={52} />
          <RoundButton icon="next" label={a("nextSurah")} onPress={radio.skipSurah} size={44} />
        </View>
        {next ? (
          <Text style={{ textAlign: "center", fontFamily: FONT.regular, fontSize: 13.5, color: "rgba(255,255,255,0.55)", marginTop: 14 }}>
            <Text style={{ fontFamily: FONT.semibold, color: "rgba(255,255,255,0.85)" }}>{t("upNext")}:</Text> {next.s}. {r.chapters.find((c) => c.id === next.s)?.name_simple ?? next.s} · {next.v}
          </Text>
        ) : null}

        {/* speed, repeat, sleep */}
        <View style={{ marginTop: 26, borderRadius: R.card, borderWidth: 1, borderColor: "rgba(214,180,108,0.22)", padding: 16, gap: 16 }}>
          <View>
            <Text style={labelStyle}>{a("speed")}</Text>
            <Choices onStage value={r.rate} options={speeds} onChange={radio.setRate} label={a("speed")} />
          </View>
          <View>
            <Text style={labelStyle}>{a("repeat")}</Text>
            <Choices onStage value={r.repeat} options={repeats} onChange={radio.setRepeat} label={a("repeat")} />
          </View>
          <View>
            <Text style={labelStyle}>{t("sleep")}</Text>
            <Choices onStage value={r.sleep} options={sleeps} onChange={radio.setSleep} label={t("sleep")} />
            {r.sleep && r.sleepLeft ? <Text style={{ fontFamily: FONT.regular, fontSize: 13, color: "rgba(255,255,255,0.6)", marginTop: 8 }}>{a("sleepLeft", { m: Math.ceil(r.sleepLeft / 60) })}</Text> : null}
          </View>
        </View>
      </ScrollView>
    </Stage>
  );
}

const labelStyle = { fontFamily: FONT.semibold, fontSize: 11.5, letterSpacing: 1.8, textTransform: "uppercase" as const, color: "rgba(255,255,255,0.5)", marginBottom: 8 };
