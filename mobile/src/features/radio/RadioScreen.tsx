import { memo, useCallback, useRef, useState } from "react";
import { Animated, Pressable, ScrollView, StyleSheet, Text, View, type NativeScrollEvent, type NativeSyntheticEvent } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Stack, router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import Svg, { Defs, RadialGradient, Rect, Stop } from "react-native-svg";
import { FONT, R, stage, useTheme } from "@/lib/theme";
import { Arcade, OutlineButton, Stage } from "@/components/brand";
import { Icon } from "@/components/icons";
import { SITE } from "@/lib/api";
import { useLang } from "@/i18n";
import { useWebT } from "@/i18n/web";
import { GROUPS, POSTER, STATIONS } from "./stations";
import { currentReciter, initials, radio, useBackToLive, useRadio, type Sleep } from "./engine";
import { useSurahText } from "./useSurahText";
import { Callout, Kicker, QuranSeal, useQ } from "./art";
import { Check, Choices, FieldLabel, GoldPlay, RoundButton, StagePill, goBack, shareLink } from "./controls";
import { RadioMiniPlayer, MINI_SPACE } from "./MiniPlayer";
import { useAppT } from "./strings";
import { useLoop, useReduceMotion } from "./motion";
import { VerseArabic } from "./VerseText";
import { reciterName } from "@/lib/quran";

// /radio – the website's RadioPlayer.tsx: the on-air stage with the verse on screen, the reciter orb and the reciters,
// the stations as posters, settings (sleep timer, adhan, mixed voices, text) and what was played recently.
export default function RadioScreen() {
  const r = useRadio();
  const t = useWebT("radio");
  const ts = useWebT("social");
  const a = useAppT();
  const th = useTheme();
  const q = useQ();
  const { lang } = useLang();
  const reduce = useReduceMotion();
  const back = useBackToLive();
  const insets = useSafeAreaInsets();
  const reciter = currentReciter(r);
  const { verses } = useSurahText(r.now.s, lang, reciter);
  const verse = verses?.find((v) => v.verse_number === r.now.v);
  const chapter = r.chapters.find((c) => c.id === r.now.s);
  const nameOf = (s: number) => r.chapters.find((c) => c.id === s)?.name_simple ?? String(s);
  const [past, setPast] = useState(false);
  const pastRef = useRef(false);
  const heroEnd = useRef(600);
  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const p = e.nativeEvent.contentOffset.y > heroEnd.current;
    if (p !== pastRef.current) { pastRef.current = p; setPast(p); }
  };
  const stationTitle = t(`st_${r.station.id}`);

  const [more, setMore] = useState(false);
  const choose = useCallback((id: string) => {
    const st = STATIONS.find((s) => s.id === id)!;
    // one tap: a new station starts at once, the current one pauses / resumes
    if (st.id === r.station.id && r.started) radio.toggle(); else radio.chooseStation(st);
  }, [r.station.id, r.started]);
  const pickReciter = useCallback((folder: string) => { radio.changeReciter(folder); }, []);
  const share = () => {
    const title = `${t("title")} – ${stationTitle} | Quran Masterclass`;
    const url = `${SITE}/${lang}/radio`;
    shareLink(title, url);
  };
  const sleepOptions: [Sleep, string][] = [[0, t("off")], [15, `15 ${t("min")}`], [30, `30 ${t("min")}`], [60, `60 ${t("min")}`], ["eos", a("sleepEnd")]];

  return (
    <View style={{ flex: 1, backgroundColor: th.bg }}>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar style="light" />
      <ScrollView onScroll={onScroll} scrollEventThrottle={64} contentContainerStyle={{ paddingBottom: (r.started ? MINI_SPACE : 0) + 48 + insets.bottom }}>
        {/* on-air stage */}
        <Stage hairlines={false}>
          <Svg style={StyleSheet.absoluteFill} pointerEvents="none">
            <Defs>
              <RadialGradient id="rg1" cx="75%" cy="30%" r="45%"><Stop offset="0" stopColor="rgb(214,180,108)" stopOpacity={0.14} /><Stop offset="1" stopColor="rgb(214,180,108)" stopOpacity={0} /></RadialGradient>
              <RadialGradient id="rg2" cx="5%" cy="95%" r="45%"><Stop offset="0" stopColor="rgb(58,190,146)" stopOpacity={0.25} /><Stop offset="1" stopColor="rgb(58,190,146)" stopOpacity={0} /></RadialGradient>
            </Defs>
            <Rect width="100%" height="100%" fill="url(#rg1)" />
            <Rect width="100%" height="100%" fill="url(#rg2)" />
          </Svg>
          <View style={{ paddingTop: insets.top + 6, paddingHorizontal: 18 }}>
            <Pressable onPress={() => goBack()} accessibilityRole="button" accessibilityLabel={a("back")} hitSlop={12} style={{ width: 40, height: 40, justifyContent: "center", marginStart: -6 }}>
              <Icon name="chevronLeft" color="#ffffff" size={24} />
            </Pressable>
            <View style={{ flexDirection: "row", flexWrap: "wrap", alignItems: "center", gap: 10, marginTop: 6 }}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 6, borderRadius: 3, paddingHorizontal: 8, paddingVertical: 3, backgroundColor: "rgb(220,38,38)" }}
                accessibilityLabel={t("onAir")}>
                <LiveDot on={r.playing && !reduce} />
                <Text style={{ fontFamily: FONT.display, fontSize: 11, letterSpacing: 1.2, color: "#ffffff" }}>{t("onAir")}</Text>
              </View>
              <Text style={{ flexShrink: 1, fontFamily: FONT.semibold, fontSize: 12, letterSpacing: 2.2, textTransform: "uppercase", color: stage.gold }}>{t("title")} · {stationTitle}</Text>
              {back ? <Text accessibilityLiveRegion="polite" style={{ fontFamily: FONT.semibold, fontSize: 12.5, color: "#ffffff" }}>{a("backToLive")}</Text> : null}
            </View>
            <Text accessibilityRole="header" style={{ fontFamily: FONT.display, fontSize: 44, lineHeight: 47, letterSpacing: -1, color: "#eef0f3", marginTop: 16 }}>
              {chapter ? chapter.name_simple : `${r.now.s}`}<Text style={{ color: "rgba(255,255,255,0.4)" }}> · {r.now.v}</Text>
            </Text>
            <Text style={{ fontFamily: FONT.regular, fontSize: 16, color: "rgba(255,255,255,0.6)", marginTop: 8 }}>{reciterName(reciter, lang)}</Text>

            {r.showText && verse ? (
              <View style={{ marginTop: 22, borderRadius: R.md, borderWidth: 1, borderColor: "rgba(255,255,255,0.1)", backgroundColor: "rgba(255,255,255,0.04)", padding: 18 }}>
                <VerseArabic verse={verse} size={28} />
                {verse.translation ? <Text style={{ fontFamily: FONT.regular, fontSize: 15, lineHeight: 24, color: "rgba(255,255,255,0.7)", marginTop: 10 }}>{verse.translation}</Text> : null}
              </View>
            ) : null}

            {r.offline ? (
              <View style={{ marginTop: 18, borderRadius: R.md, borderWidth: 1, borderColor: stage.goldSoft, padding: 14, gap: 10 }} accessibilityLiveRegion="polite">
                <Text style={{ fontFamily: FONT.regular, fontSize: 14.5, lineHeight: 21, color: "rgba(255,255,255,0.8)" }}>{a("offline")}</Text>
                <OutlineButton title={a("tryAgain")} onPress={radio.retry} onStage compact />
              </View>
            ) : null}

            {/* one big play / pause */}
            <View style={{ alignItems: "center", marginTop: 30 }} onLayout={(e) => { heroEnd.current = e.nativeEvent.layout.y + e.nativeEvent.layout.height; }}>
              <GoldPlay playing={r.playing} onPress={radio.toggle} labels={[t("pause"), t("play")]} size={104} />
              <View style={{ flexDirection: "row", flexWrap: "wrap", justifyContent: "center", gap: 10, marginTop: 22 }}>
                <StagePill title={t("nextSurah")} onPress={radio.skipSurah} />
                <StagePill title={a("nowPlaying")} onPress={() => router.push("/radio/now" as never)} />
                <RoundButton icon="send" label={ts("share")} onPress={share} />
              </View>
            </View>
          </View>
          <View style={{ height: 30 }} />
          <View style={{ opacity: 0.6 }}><Arcade /></View>
        </Stage>

        <View style={{ paddingHorizontal: 16, paddingTop: 30 }}>
          {r.banner ? (
            <Callout style={{ marginBottom: 26, padding: 16 }}>
              <View accessibilityLiveRegion="assertive">
                <Text style={{ fontFamily: FONT.bold, fontSize: 13, color: th.accent }}>{t("adhanNow")}</Text>
                <Text style={{ fontFamily: FONT.display, fontSize: 24, color: th.ink, marginTop: 2 }}>{t(`p_${r.banner}`)}</Text>
                {r.adhanCredit ? <Text style={{ fontFamily: FONT.regular, fontSize: 12, color: th.muted, marginTop: 4 }}>{r.adhanCredit}</Text> : null}
              </View>
            </Callout>
          ) : null}

          {/* stations: one clear list, one tap to switch; every station is live and free */}
          <Text accessibilityRole="header" style={{ fontFamily: FONT.display, fontSize: 30, lineHeight: 34, letterSpacing: -0.7, color: th.ink }}>{t("stations")}</Text>
          <Text style={{ fontFamily: FONT.regular, fontSize: 15, lineHeight: 22, color: th.muted, marginTop: 8 }}>{t("stationsLead", { n: STATIONS.length })}</Text>
          {GROUPS.map((g) => (
            <View key={g} style={{ marginTop: 26 }}>
              <Text accessibilityRole="header" style={{ fontFamily: FONT.semibold, fontSize: 12, letterSpacing: 1.9, textTransform: "uppercase", color: th.muted }}>{t(`g_${g}`)}</Text>
              <View style={{ gap: 8, marginTop: 10 }}>
                {STATIONS.filter((x) => x.group === g).map((x) => {
                  const p = POSTER[x.id] ?? POSTER.quran;
                  const title = t(`st_${x.id}`), desc = t(`sd_${x.id}`);
                  return <StationRow key={x.id} id={x.id} title={title} desc={desc} word={p.ar} bg={p.bg} current={r.station.id === x.id} playing={r.station.id === x.id && r.playing}
                    onAir={t("onAir")} reduce={reduce} onChoose={choose} />;
                })}
              </View>
            </View>
          ))}

          {/* everything else, folded away */}
          <Pressable onPress={() => setMore((m) => !m)} accessibilityRole="button" accessibilityState={{ expanded: more }}
            style={{ marginTop: 32, flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: 14, borderTopWidth: 1, borderBottomWidth: more ? 0 : 1, borderColor: th.line }}>
            <Text style={{ fontFamily: FONT.semibold, fontSize: 16, color: th.ink }}>{t("settings")} · {t("reciters")}</Text>
            <View style={{ transform: [{ rotate: more ? "180deg" : "0deg" }] }}><Icon name="chevronDown" color={th.muted} size={20} /></View>
          </Pressable>
          {more ? (<>
          <View style={{ flexDirection: "row", flexWrap: "wrap", marginTop: 6, marginHorizontal: -4 }}>
            {r.reciters.map((x) => (
              <ReciterButton key={x.folder} folder={x.folder} name={reciterName(x, lang)} mono={initials(x.name)} on={x.folder === r.folder} onPick={pickReciter} ink={th.ink} />
            ))}
          </View>
          {/* settings */}
          <Callout style={{ marginTop: 36 }}>
            <Kicker>{t("settings")}</Kicker>
            <View style={{ marginTop: 16, gap: 18 }}>
              <View>
                <FieldLabel>{t("sleep")}</FieldLabel>
                <Choices value={r.sleep} options={sleepOptions} onChange={radio.setSleep} label={t("sleep")} />
                {r.sleep && r.sleepLeft ? <Text style={{ fontFamily: FONT.regular, fontSize: 13, color: th.muted, marginTop: 8 }}>{a("sleepLeft", { m: Math.ceil(r.sleepLeft / 60) })}</Text> : null}
              </View>
              <View>
                <FieldLabel>{t("adhan")}</FieldLabel>
                <Choices value={r.adhanMode} onChange={radio.setAdhanMode} label={t("adhan")}
                  options={[["off", t("off")], ["makkah", t("adhanMakkah")], ["dubai", t("adhanDubai")], ["mine", t("adhanMine")]]} />
              </View>
              <View>
                <FieldLabel>{t("adhanVoice")}</FieldLabel>
                <Choices value={r.voice} onChange={radio.setVoice} label={t("adhanVoice")}
                  options={[["random", t("random")], ...r.adhanFiles.map((f) => [f.id, f.label] as [string, string])]} />
                <OutlineButton title={t("test")} onPress={radio.testAdhan} disabled={r.adhanFiles.length === 0} compact style={{ marginTop: 10 }} />
              </View>
              <View>
                <Check checked={r.mix} onChange={radio.setMix} label={t("mixAll")}>{t("mixAll")}</Check>
                <Check checked={r.showText} onChange={radio.setShowText} label={t("showText")}>{t("showText")}</Check>
              </View>
            </View>
            {r.adhanMode !== "off" && r.adhanFiles.length === 0 ? <Text style={{ fontFamily: FONT.regular, fontSize: 14, lineHeight: 20, color: th.muted, marginTop: 14 }}>{t("adhanMissing")}</Text> : null}
            {r.adhanCredit && !r.banner ? <Text style={{ fontFamily: FONT.regular, fontSize: 12, color: th.muted, marginTop: 10 }}>{r.adhanCredit}</Text> : null}
          </Callout>

          {/* recently played */}
          <Callout style={{ marginTop: 18 }}>
            <Kicker>{t("recent")}</Kicker>
            {r.history.length > 1 ? (
              <View style={{ marginTop: 8 }}>
                {r.history.slice(1).map((h, i) => (
                  <View key={`${h.s}:${h.v}:${i}`} style={{ flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 10, borderTopWidth: i ? 1 : 0, borderTopColor: "rgba(201,166,94,0.18)" }}
                    accessible accessibilityLabel={`${nameOf(h.s)} ${h.v}`}>
                    <Text style={{ width: 28, textAlign: "right", fontFamily: FONT.semibold, fontSize: 12, color: q.inkGold }}>{h.s}</Text>
                    <Text numberOfLines={1} style={{ flex: 1, fontFamily: FONT.regular, fontSize: 14, color: th.ink }}>{nameOf(h.s)}</Text>
                    <Text style={{ fontFamily: FONT.regular, fontSize: 14, color: th.muted }}>{h.v}</Text>
                  </View>
                ))}
              </View>
            ) : <Text style={{ fontFamily: FONT.regular, fontSize: 14, lineHeight: 20, color: th.muted, marginTop: 8 }}>{t("recentNone")}</Text>}
          </Callout>
          </>) : null}
        </View>
      </ScrollView>
      <RadioMiniPlayer visible={past} />
    </View>
  );
}

/** a reciter: seal with initials and name (on the radio every voice is free) */
const ReciterButton = memo(function ReciterButton({ folder, name, mono, on, onPick, ink }: { folder: string; name: string; mono: string; on: boolean; onPick: (folder: string) => void; ink: string }) {
  return (
    <View style={{ width: "33.333%", padding: 4 }}>
      <Pressable onPress={() => onPick(folder)} accessibilityRole="button" accessibilityState={{ selected: on }} accessibilityLabel={name}
        style={({ pressed }) => ({ alignItems: "center", gap: 8, padding: 10, borderRadius: R.lg, opacity: pressed ? 0.7 : 1, borderWidth: 1, borderColor: on ? "rgba(214,180,108,0.6)" : "transparent" })}>
        <QuranSeal size={56} on={on}>{mono}</QuranSeal>
        <Text numberOfLines={2} style={{ fontFamily: FONT.semibold, fontSize: 12, lineHeight: 15.5, textAlign: "center", color: ink }}>{name}</Text>
      </Pressable>
    </View>
  );
});

/** a station in the list: colour seal with its Arabic word, title, description and a live badge (red and pulsing while heard) */
const StationRow = memo(function StationRow({ id, title, desc, word, bg, current, playing, onAir, reduce, onChoose }: {
  id: string; title: string; desc: string; word: string; bg: string; current: boolean; playing: boolean; onAir: string; reduce: boolean; onChoose: (id: string) => void;
}) {
  const th = useTheme();
  return (
    <Pressable onPress={() => onChoose(id)} accessibilityRole="button" accessibilityState={{ selected: current }} accessibilityLabel={`${title}. ${desc}${playing ? `. ${onAir}` : ""}`}
      style={({ pressed }) => ({ flexDirection: "row", alignItems: "center", gap: 14, padding: 12, borderRadius: R.lg, borderWidth: 1,
        borderColor: current ? "rgba(214,180,108,0.7)" : th.line, backgroundColor: current ? "rgba(214,180,108,0.08)" : th.card, opacity: pressed ? 0.8 : 1 })}>
      <View style={{ width: 52, height: 52, borderRadius: 14, backgroundColor: bg, alignItems: "center", justifyContent: "center" }}>
        <Text style={{ fontSize: 20, color: "#f3e2b6" }} numberOfLines={1}>{word}</Text>
      </View>
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text numberOfLines={1} style={{ fontFamily: FONT.semibold, fontSize: 16, color: th.ink }}>{title}</Text>
        <Text numberOfLines={2} style={{ fontFamily: FONT.regular, fontSize: 13, lineHeight: 18, color: th.muted, marginTop: 2 }}>{desc}</Text>
      </View>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 5, borderRadius: 3, paddingHorizontal: 7, paddingVertical: 3,
        backgroundColor: playing ? "rgb(220,38,38)" : "transparent", borderWidth: 1, borderColor: playing ? "rgb(220,38,38)" : "rgba(220,38,38,0.55)" }}>
        {playing ? <LiveDot on={!reduce} /> : null}
        <Text style={{ fontFamily: FONT.display, fontSize: 10, letterSpacing: 1.1, color: playing ? "#ffffff" : "rgb(220,38,38)" }}>{onAir}</Text>
      </View>
    </Pressable>
  );
});

/** the small white dot of the on-air badge: pulses while the station is heard, stands still otherwise (and with Reduce Motion) */
function LiveDot({ on }: { on: boolean }) {
  const v = useLoop(on, 1600);
  const opacity = on ? v.interpolate({ inputRange: [0, 0.5, 1], outputRange: [1, 0.3, 1] }) : 1;
  return <Animated.View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: "#ffffff", opacity }} />;
}
