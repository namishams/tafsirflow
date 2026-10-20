import { memo, useCallback, useRef, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions, type NativeScrollEvent, type NativeSyntheticEvent } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Stack, router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import Svg, { Defs, RadialGradient, Rect, Stop } from "react-native-svg";
import { FONT, R, stage, useTheme } from "@/lib/theme";
import { Arcade, OutlineButton, Stage } from "@/components/brand";
import { Icon } from "@/components/icons";
import { SITE } from "@/lib/api";
import { openPro } from "@/lib/pro";
import { useLang } from "@/i18n";
import { useWebT } from "@/i18n/web";
import { GROUPS, POSTER, STATIONS } from "./stations";
import { currentReciter, initials, radio, reciterAllowed, stationAllowed, useRadio, type Sleep } from "./engine";
import { useSurahText } from "./useSurahText";
import { Callout, Kicker, QuranSeal, RadioOrb, useQ } from "./art";
import { StationPoster } from "./StationPoster";
import { Check, Choices, FieldLabel, GoldPlay, RoundButton, StagePill, goBack, shareLink } from "./controls";
import { GoldSlider } from "./Slider";
import { RadioMiniPlayer, MINI_SPACE } from "./MiniPlayer";
import { useAppT } from "./strings";
import { useReduceMotion } from "./motion";
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
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const reciter = currentReciter(r);
  const { verses } = useSurahText(r.now.s, lang, reciter);
  const verse = verses?.find((v) => v.verse_number === r.now.v);
  const chapter = r.chapters.find((c) => c.id === r.now.s);
  const nameOf = (s: number) => r.chapters.find((c) => c.id === s)?.name_simple ?? String(s);
  const upNext = r.started ? radio.upNext() : null;
  const [past, setPast] = useState(false);
  const pastRef = useRef(false);
  const heroEnd = useRef(600);
  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const p = e.nativeEvent.contentOffset.y > heroEnd.current;
    if (p !== pastRef.current) { pastRef.current = p; setPast(p); }
  };
  const orb = Math.min(width - 72, 272);
  const stationTitle = t(`st_${r.station.id}`);

  const choose = useCallback((id: string) => {
    const st = STATIONS.find((s) => s.id === id)!;
    if (!radio.chooseStation(st)) openPro("radio");
  }, []);
  const pickReciter = useCallback((folder: string) => { if (!radio.changeReciter(folder)) openPro("reciters"); }, []);
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
              <View style={{ flexDirection: "row", alignItems: "center", gap: 6, borderRadius: 3, paddingHorizontal: 8, paddingVertical: 3, backgroundColor: r.playing ? "rgb(220,38,38)" : "rgba(255,255,255,0.1)" }}
                accessibilityLabel={r.playing ? t("onAir") : t("off")}>
                {r.playing ? <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: "#ffffff" }} /> : null}
                <Text style={{ fontFamily: FONT.display, fontSize: 11, letterSpacing: 1.2, color: r.playing ? "#ffffff" : "rgba(255,255,255,0.6)" }}>{r.playing ? t("onAir") : t("off")}</Text>
              </View>
              <Text style={{ flexShrink: 1, fontFamily: FONT.semibold, fontSize: 12, letterSpacing: 2.2, textTransform: "uppercase", color: stage.gold }}>{t("title")} · {stationTitle}</Text>
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

            <View style={{ marginTop: 26, flexDirection: "row", direction: "ltr", flexWrap: "wrap", alignItems: "center", gap: 12 }}>
              <RoundButton icon="prev" label={t("prev")} onPress={radio.prevVerse} />
              <GoldPlay playing={r.playing} onPress={radio.toggle} labels={[t("pause"), t("play")]} />
              <RoundButton icon="next" label={t("nextVerse")} onPress={radio.skipVerse} />
              <StagePill title={t("nextSurah")} onPress={radio.skipSurah} />
              <RoundButton icon="share" label={ts("share")} onPress={share} />
            </View>
            <View style={{ marginTop: 14, flexDirection: "row", alignItems: "center", gap: 12 }}>
              <Icon name="volume" color="rgba(255,255,255,0.6)" size={18} />
              <View style={{ flex: 1, maxWidth: 260 }}>
                <GoldSlider value={r.vol} onChange={(v) => radio.setVolume(v, false)} onDone={(v) => radio.setVolume(v)} label={t("volume")} valueText={`${Math.round(r.vol * 100)} %`} />
              </View>
            </View>
            {upNext ? (
              <Text style={{ fontFamily: FONT.regular, fontSize: 14, lineHeight: 20, color: "rgba(255,255,255,0.6)", marginTop: 14 }}>
                <Text style={{ fontFamily: FONT.semibold, color: "#ffffff" }}>{t("upNext")}:</Text> {upNext.s}. {nameOf(upNext.s)} · {upNext.v}
              </Text>
            ) : null}

            <View style={{ alignItems: "center", marginTop: 34 }} onLayout={(e) => { heroEnd.current = e.nativeEvent.layout.y; }}>
              <Pressable onPress={() => router.push("/radio/now" as never)} accessibilityRole="button" accessibilityLabel={`${a("openNowPlaying")}: ${reciterName(reciter, lang)}`}>
                <RadioOrb on={r.playing} size={orb} label={initials(reciter.name)} reduce={reduce} />
              </Pressable>
            </View>
          </View>

          {/* reciters strip */}
          <View style={{ paddingHorizontal: 16, paddingTop: 30, paddingBottom: 34 }}>
            <Text style={{ fontFamily: FONT.semibold, fontSize: 12, letterSpacing: 2.1, textTransform: "uppercase", color: "rgba(255,255,255,0.5)" }}>{t("reciters")}</Text>
            <View style={{ flexDirection: "row", flexWrap: "wrap", marginTop: 12, marginHorizontal: -4 }}>
              {r.reciters.map((x) => (
                <ReciterButton key={x.folder} folder={x.folder} name={reciterName(x, lang)} mono={initials(x.name)} on={x.folder === r.folder} locked={!reciterAllowed(x, r.pro)} onPick={pickReciter} />
              ))}
            </View>
          </View>
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

          {/* stations as posters, grouped */}
          <Text accessibilityRole="header" style={{ fontFamily: FONT.display, fontSize: 30, lineHeight: 34, letterSpacing: -0.7, color: th.ink }}>{t("stations")}</Text>
          <Text style={{ fontFamily: FONT.regular, fontSize: 15, lineHeight: 22, color: th.muted, marginTop: 8 }}>{t("stationsLead", { n: STATIONS.length })}</Text>
          {GROUPS.map((g) => {
            const list = STATIONS.filter((st) => st.group === g);
            const rows: (typeof list)[] = [];
            list.forEach((st, i) => { if (i % 2 === 0) rows.push([]); rows[rows.length - 1].push(st); });
            return (
              <View key={g} style={{ marginTop: 30 }}>
                <Text accessibilityRole="header" style={{ fontFamily: FONT.semibold, fontSize: 12, letterSpacing: 1.9, textTransform: "uppercase", color: th.muted }}>{t(`g_${g}`)}</Text>
                <View style={{ gap: 12, marginTop: 12 }}>
                  {rows.map((row, i) => (
                    <View key={i} style={{ flexDirection: "row", gap: 12 }}>
                      {row.map((st) => {
                        const p = POSTER[st.id] ?? POSTER.quran;
                        const on = r.station.id === st.id && r.playing;
                        const locked = !stationAllowed(st, r.pro);
                        const title = t(`st_${st.id}`), desc = t(`sd_${st.id}`);
                        return (
                          <StationPoster key={st.id} id={st.id} title={title} desc={desc} word={p.ar} bg={p.bg} on={on} mix={st.mix} mixLabel={t("mixBadge")} locked={locked} reduce={reduce}
                            label={`${title}. ${desc}${on ? `. ${t("onAir")}` : ""}${locked ? ". Pro" : ""}`} onChoose={choose} />
                        );
                      })}
                      {row.length === 1 ? <View style={{ flex: 1 }} /> : null}
                    </View>
                  ))}
                </View>
              </View>
            );
          })}

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
        </View>
      </ScrollView>
      <RadioMiniPlayer visible={past} />
    </View>
  );
}

/** a reciter in the strip on the stage: seal with initials, name; a gold lock when the voice is part of Pro */
const ReciterButton = memo(function ReciterButton({ folder, name, mono, on, locked, onPick }: { folder: string; name: string; mono: string; on: boolean; locked: boolean; onPick: (folder: string) => void }) {
  return (
    <View style={{ width: "33.333%", padding: 4 }}>
      <Pressable onPress={() => onPick(folder)} accessibilityRole="button" accessibilityState={{ selected: on }} accessibilityLabel={`${name}${locked ? ", Pro" : ""}`}
        style={({ pressed }) => ({ alignItems: "center", gap: 8, padding: 10, borderRadius: R.lg, backgroundColor: on ? "rgba(255,255,255,0.07)" : pressed ? "rgba(255,255,255,0.05)" : "transparent", borderWidth: 1, borderColor: on ? "rgba(214,180,108,0.35)" : "transparent" })}>
        <QuranSeal size={60} on={on} locked={locked}>{mono}</QuranSeal>
        <Text numberOfLines={2} style={{ fontFamily: FONT.semibold, fontSize: 12, lineHeight: 15.5, textAlign: "center", color: on ? "#ffffff" : "rgba(255,255,255,0.7)" }}>{name}</Text>
      </Pressable>
    </View>
  );
});
