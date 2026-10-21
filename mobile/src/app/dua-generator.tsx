import { useRef } from "react";
import { Text, View, type ScrollViewInstance } from "react-native";
import { Stack, useLocalSearchParams } from "expo-router";
import { useWebT } from "@/i18n/web";
import { FONT, R, useTheme } from "@/lib/theme";
import DuaGenerator from "@/features/practice/DuaGenerator";
import { Callout, Hero, PageScroll, MoreTiles, go } from "@/features/practice/art";
import { HEROES } from "@/features/practice/web/heroes";

// /dua-generator – a personal dua for a concern with the duas of the Quran and the Sunnah (website:
// app/[locale]/(app)/dua-generator), then when duas are answered and how to make dua
export default function DuaGeneratorScreen() {
  const t = useWebT("duagen");
  const th = useTheme();
  const scroll = useRef<ScrollViewInstance>(null);
  // the feed opens the generator with the topic of the dua post it came from (?topic=worry)
  const { topic } = useLocalSearchParams<{ topic?: string }>();
  const base = useRef(0);
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <PageScroll scrollRef={scroll}>
        <Hero kicker={t("kicker")} title={t("title")} lead={t("lead")} word={HEROES.duaGenerator.word} arabic={HEROES.duaGenerator.ar} arabicRef={HEROES.duaGenerator.ref} arcade={false} />
        <View style={{ paddingHorizontal: 16, paddingVertical: 40 }} onLayout={(e) => { base.current = e.nativeEvent.layout.y; }}>
          <DuaGenerator initialTopic={topic} scrollTo={(y) => scroll.current?.scrollTo({ y: Math.max(0, base.current + y - 16), animated: true })} />
        </View>
        <View style={{ borderTopWidth: 1, borderBottomWidth: 1, borderColor: th.line, backgroundColor: th.surface, paddingHorizontal: 20, paddingVertical: 56, gap: 40 }}>
          <View>
            <Text accessibilityRole="header" style={{ fontFamily: FONT.display, fontSize: 30, lineHeight: 36, letterSpacing: -0.6, color: th.ink }}>{t("timesTitle")}</Text>
            <View style={{ gap: 16, marginTop: 24 }}>
              {[1, 2, 3, 4, 5].map((i) => (
                <View key={i} style={{ flexDirection: "row", gap: 12 }}>
                  <View style={{ width: 32, height: 32, borderRadius: 16, borderWidth: 1, borderColor: "rgba(201,166,94,0.5)", alignItems: "center", justifyContent: "center" }}>
                    <Text style={{ fontFamily: FONT.display, fontSize: 14, color: th.gold }}>{i}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontFamily: FONT.bold, fontSize: 15, lineHeight: 21, color: th.ink }}>{t(`time${i}`)}</Text>
                    <Text style={{ fontFamily: FONT.regular, fontSize: 14, lineHeight: 22, color: th.muted }}>{t(`time${i}d`)}</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
          <View>
            <Text accessibilityRole="header" style={{ fontFamily: FONT.display, fontSize: 30, lineHeight: 36, letterSpacing: -0.6, color: th.ink }}>{t("adabTitle")}</Text>
            <View style={{ gap: 12, marginTop: 24 }}>
              {[1, 2, 3, 4].map((i) => <Callout key={i} radius={R.md} style={{ padding: 16 }}><Text style={{ fontFamily: FONT.regular, fontSize: 15, lineHeight: 24, color: th.ink }}>{t(`adab${i}`)}</Text></Callout>)}
            </View>
            <Text onPress={() => go("/duas")} accessibilityRole="link" style={{ fontFamily: FONT.semibold, fontSize: 14, color: th.accent, marginTop: 24, alignSelf: "flex-start" }}>{t("more")}</Text>
          </View>
        </View>
        <MoreTiles keys={["duas", "prayer", "salah", "community"]} />
      </PageScroll>
    </>
  );
}
