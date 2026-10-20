import { useRef } from "react";
import { Pressable, Text, View, type ScrollViewInstance } from "react-native";
import { Stack } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { DUA_GROUPS } from "@/web/duas";
import { useLang } from "@/i18n";
import { useWebT } from "@/i18n/web";
import { RECITERS, audioUrl } from "@/lib/quran";
import { ARABIC_FONT, FONT, R, goldButton, useTheme, AR_RIGHT, FWD } from "@/lib/theme";
import { GoldCard } from "@/components/brand";
import { Icon } from "@/components/icons";
import SunnahDuas from "@/features/practice/duas/SunnahDuas";
import { DarkChip, Hero, PageScroll, LightChip, MoreTiles, PStar, go, useGold } from "@/features/practice/art";
import { useSimpleAudio } from "@/features/practice/audio";
import { useVerses } from "@/features/practice/verses";
import { HEROES } from "@/features/practice/web/heroes";

// /duas – supplications of the Prophet ﷺ and of the Quran (website: app/[locale]/(app)/duas). The Quran duas are
// loaded by verse key from the Quran store; recitation by Mishary Alafasy as on the website.
export default function DuasScreen() {
  const t = useWebT("duas");
  const th = useTheme();
  const g = useGold();
  const { lang } = useLang();
  const scroll = useRef<ScrollViewInstance>(null);
  const pos = useRef<Record<string, number>>({});
  const at = (id: string) => (e: { nativeEvent: { layout: { y: number } } }) => { pos.current[id] = e.nativeEvent.layout.y; };
  const base = useRef(0);
  const jump = (id: string) => scroll.current?.scrollTo({ y: Math.max(0, base.current + (pos.current[id] ?? 0) - 12), animated: true });
  const keys = DUA_GROUPS.flatMap((x) => x.verses);
  const verses = useVerses(keys, lang);
  const audio = useSimpleAudio();
  const loaded = (k: string) => verses[k];
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <PageScroll scrollRef={scroll}>
        <Hero art="window" lamp word={HEROES.duas.word} title={t("title")} lead={t("lead")}>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
            <DarkChip label={t("sunnahTitle")} on onPress={() => jump("sunnah")} />
            <DarkChip label={t("quranTitle")} onPress={() => jump("quran")} />
          </View>
        </Hero>
        <View style={{ paddingHorizontal: 16, paddingTop: 48 }} onLayout={(e) => { base.current = e.nativeEvent.layout.y; }}>
          <View onLayout={at("sunnah")}>
            <Text accessibilityRole="header" style={{ fontFamily: FONT.display, fontSize: 30, lineHeight: 36, letterSpacing: -0.6, color: th.ink }}>{t("sunnahTitle")}</Text>
            <Text style={{ fontFamily: FONT.regular, fontSize: 15, lineHeight: 24, color: th.muted, marginTop: 12 }}>{t("sunnahLead")}</Text>
            <View style={{ marginTop: 24 }}><SunnahDuas /></View>
          </View>

          <View onLayout={at("quran")} style={{ marginTop: 80 }}>
            <Text accessibilityRole="header" style={{ fontFamily: FONT.display, fontSize: 30, lineHeight: 36, letterSpacing: -0.6, color: th.ink }}>{t("quranTitle")}</Text>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 24 }}>
              {DUA_GROUPS.map((x) => <LightChip key={x.id} label={t(x.id)} onPress={() => jump(x.id)} />)}
            </View>
          </View>
          {DUA_GROUPS.map((grp) => (
            <View key={grp.id} onLayout={(e) => { pos.current[grp.id] = e.nativeEvent.layout.y; }} style={{ marginTop: 48 }}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
                <PStar size={14} />
                <Text accessibilityRole="header" style={{ flex: 1, fontFamily: FONT.display, fontSize: 24, lineHeight: 29, color: th.ink }}>{t(grp.id)}</Text>
              </View>
              <View style={{ gap: 20, marginTop: 20 }}>
                {grp.verses.map((k) => {
                  const v = loaded(k);
                  if (v === null) return null;
                  const [s, a] = k.split(":").map(Number);
                  const url = audioUrl(RECITERS[0], s, a);
                  const on = audio.url === url && audio.playing;
                  return (
                    <GoldCard key={k} style={{ paddingHorizontal: 20, paddingBottom: 20, paddingTop: 24 }}>
                      {v === undefined ? <View style={{ height: 120, borderRadius: R.md, backgroundColor: th.line, opacity: 0.4 }} /> : (
                        <>
                          <Text style={{ fontFamily: ARABIC_FONT, fontSize: 29, lineHeight: 62, color: th.arabic, writingDirection: "rtl", textAlign: AR_RIGHT }}>{v.text_uthmani}</Text>
                          {v.translation ? <Text style={{ fontFamily: FONT.regular, fontSize: 15.5, lineHeight: 25, color: th.ink, opacity: 0.8, marginTop: 12 }}>{v.translation}</Text> : null}
                        </>
                      )}
                      <View style={{ flexDirection: "row", flexWrap: "wrap", alignItems: "center", gap: 12, marginTop: 20, paddingTop: 16, borderTopWidth: 1, borderTopColor: `rgba(${g},0.2)` }}>
                        <Pressable onPress={() => audio.toggle(url)} accessibilityRole="button" accessibilityLabel={`${t("listen")} ${k}`} style={({ pressed }) => ({ transform: [{ scale: pressed ? 0.98 : 1 }] })}>
                          <LinearGradient colors={[goldButton.from, goldButton.to]} style={{ height: 44, borderRadius: R.pill, paddingHorizontal: 18, flexDirection: "row", alignItems: "center", gap: 8 }}>
                            <Icon name={on ? "pause" : "play"} color={goldButton.text} size={16} />
                            <Text style={{ fontFamily: FONT.bold, fontSize: 14, color: goldButton.text }}>{t("listen")}</Text>
                          </LinearGradient>
                        </Pressable>
                        <LightChip label={`${k} ${FWD}`} onPress={() => go(`/surah/${s}?v=${a}`)} style={{ minHeight: 44 }} />
                      </View>
                    </GoldCard>
                  );
                })}
              </View>
            </View>
          ))}
          <Text style={{ fontFamily: FONT.regular, fontSize: 14, lineHeight: 22, color: th.muted, marginTop: 48 }}>{t("note")}</Text>
        </View>
        <MoreTiles keys={["salah", "prayer", "islam", "radio"]} />
      </PageScroll>
    </>
  );
}
