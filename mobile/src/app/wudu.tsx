import { Text, View } from "react-native";
import { Stack } from "expo-router";
import { useLang, pick } from "@/i18n";
import { ARABIC_FONT, FONT, useTheme, AR_RIGHT, FWD } from "@/lib/theme";
import { Divider, Eyebrow, GoldCard } from "@/components/brand";
import WuduTrainer from "@/features/practice/WuduTrainer";
import { Callout, Hero, PageScroll, LightChip, LinkList, MoreTiles, PStar, go, useGold } from "@/features/practice/art";
import { useVerses, verseEnd } from "@/features/practice/verses";
import { HEROES } from "@/features/practice/web/heroes";
import { C } from "@/features/practice/web/wuduPage";

// /wudu – the ablution step by step (website: app/[locale]/(app)/wudu): trainer, the wudu verse (5:6) from the
// Quran store, what breaks wudu, tayammum, the virtue of wudu with its sources
export default function WuduScreen() {
  const { lang } = useLang();
  const c = pick(C, lang);
  const th = useTheme();
  const g = useGold();
  const v = useVerses(["5:6"], lang)["5:6"];
  const body = { fontFamily: FONT.regular, fontSize: 16, lineHeight: 26, color: th.ink };
  const ar = lang === "ar";
  // the translator line names the German and English translations; other languages read their own (translationFor)
  const showTrBy = lang === "de" || lang === "en";
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <PageScroll>
        <Hero word={HEROES.wudu.word} kicker={c.kicker} title={c.title} lead={c.lead} />
        <View style={{ paddingHorizontal: 16, paddingTop: 32 }}>
          <WuduTrainer />

          <Callout style={{ padding: 20, marginTop: 56 }}>
            <Eyebrow>{c.verseKicker}</Eyebrow>
            <Text accessibilityRole="header" style={{ fontFamily: FONT.display, fontSize: 30, lineHeight: 35, letterSpacing: -0.6, color: th.ink, marginTop: 8 }}>{c.verseTitle}</Text>
            <Text style={{ fontFamily: FONT.regular, fontSize: 16, lineHeight: 25, color: th.muted, marginTop: 12 }}>{c.verseLead}</Text>
            {v?.text_uthmani ? (
              <Text style={{ fontFamily: ARABIC_FONT, fontSize: 24, lineHeight: 52, color: th.arabic, writingDirection: "rtl", textAlign: AR_RIGHT, marginTop: 24 }}>
                {v.text_uthmani} <Text style={{ color: th.gold, fontSize: 17 }}>{verseEnd(6)}</Text>
              </Text>
            ) : null}
            {v?.translation && !ar ? <Text style={[body, { opacity: 0.9, marginTop: 16 }]}>{v.translation}</Text> : null}
            <View style={{ flexDirection: "row", flexWrap: "wrap", alignItems: "center", columnGap: 20, rowGap: 4, marginTop: 16 }}>
              <Text style={{ fontFamily: FONT.semibold, fontSize: 14, color: th.gold }}>{c.verseRef}</Text>
              {v?.translation && showTrBy && c.trBy ? <Text style={{ fontFamily: FONT.regular, fontSize: 14, color: th.muted }}>{c.trBy}</Text> : null}
              <Text onPress={() => go("/surah/5?v=6")} accessibilityRole="link" style={{ fontFamily: FONT.semibold, fontSize: 14, color: th.accent, paddingVertical: 8 }}>{c.listen} {FWD}</Text>
            </View>
          </Callout>

          <View style={{ gap: 20, marginTop: 56 }}>
            <GoldCard style={{ padding: 20, paddingTop: 24 }}>
              <Text accessibilityRole="header" style={{ fontFamily: FONT.display, fontSize: 24, lineHeight: 29, color: th.ink }}>{c.breaksTitle}</Text>
              <Text style={{ fontFamily: FONT.regular, fontSize: 15, color: th.muted, marginTop: 8 }}>{c.breaksLead}</Text>
              <View style={{ gap: 10, marginTop: 16 }}>
                {c.breaks.map((b) => (
                  <View key={b} style={{ flexDirection: "row", alignItems: "flex-start", gap: 12 }}>
                    <View style={{ marginTop: 4 }}><PStar size={14} /></View>
                    <Text style={{ flex: 1, fontFamily: FONT.regular, fontSize: 16, lineHeight: 22, color: th.ink }}>{b}</Text>
                  </View>
                ))}
              </View>
              <Text style={{ fontFamily: FONT.regular, fontSize: 14.5, lineHeight: 23, color: th.muted, marginTop: 20, paddingTop: 16, borderTopWidth: 1, borderTopColor: `rgba(${g},0.2)` }}>{c.breaksNote}</Text>
            </GoldCard>
            <GoldCard style={{ padding: 20, paddingTop: 24 }}>
              <Text accessibilityRole="header" style={{ fontFamily: FONT.display, fontSize: 24, lineHeight: 29, color: th.ink }}>{c.tayTitle}</Text>
              <Text style={[body, { opacity: 0.9, marginTop: 12 }]}>{c.tay}</Text>
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 16 }}>
                {[["/surah/5?v=6", "5:6"], ["/surah/4?v=43", "4:43"]].map(([h, l]) => <LightChip key={h} label={ar ? (l === "5:6" ? "المائدة: 6" : "النساء: 43") : `Quran ${l}`} onPress={() => go(h)} />)}
              </View>
            </GoldCard>
          </View>

          <Divider style={{ marginTop: 56 }} />

          <Text accessibilityRole="header" style={{ fontFamily: FONT.display, fontSize: 30, lineHeight: 36, letterSpacing: -0.6, color: th.ink, marginTop: 40 }}>{c.virtueTitle}</Text>
          <View style={{ gap: 16, marginTop: 28 }}>
            {c.virtues.map((x) => (
              <GoldCard key={x.src} style={{ padding: 20, paddingTop: 28 }}>
                {ar && x.text ? <Text style={{ fontFamily: FONT.regular, fontSize: 15, lineHeight: 24, color: th.muted, marginBottom: 4 }}>{x.text}</Text> : null}
                <Text style={{ fontFamily: ARABIC_FONT, fontSize: 23, lineHeight: 46, color: th.arabic, writingDirection: "rtl", textAlign: AR_RIGHT }}>{x.ar}</Text>
                {!ar ? <Text style={{ fontFamily: FONT.regular, fontSize: 15.5, lineHeight: 25, color: th.ink, opacity: 0.9, marginTop: 8 }}>{x.text}</Text> : null}
                <Text onPress={x.href ? () => go(x.href!) : undefined} accessibilityRole={x.href ? "link" : "text"} style={{ fontFamily: FONT.semibold, fontSize: 13, color: th.gold, marginTop: 16 }}>{x.src}</Text>
              </GoldCard>
            ))}
          </View>

          <View style={{ marginTop: 48 }}><LinkList title={c.more} links={c.links} /></View>
        </View>
        <MoreTiles keys={["salah", "prayer", "duas", "islam"]} />
      </PageScroll>
    </>
  );
}
