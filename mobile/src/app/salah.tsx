import { Text, View } from "react-native";
import { Stack } from "expo-router";
import { useLang } from "@/i18n";
import { FONT, useTheme } from "@/lib/theme";
import PrayerTrainer from "@/features/practice/PrayerTrainer";
import { Hero, PageScroll, LinkList, MoreTiles, Paper } from "@/features/practice/art";
import { HEROES } from "@/features/practice/web/heroes";
import { C } from "@/features/practice/web/salahPage";

// /salah – learn the prayer step by step (website: app/[locale]/(app)/salah)
export default function SalahScreen() {
  const { lang } = useLang();
  const c = lang === "de" ? C.de : C.en;
  const th = useTheme();
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <PageScroll>
        <Hero art="window" word={HEROES.salah.word} kicker={c.kicker} title={c.title} lead={c.lead} />
        <View style={{ paddingHorizontal: 16, paddingTop: 40, gap: 32 }}>
          <PrayerTrainer />
          <Paper style={{ marginTop: 32 }}>
            <Text accessibilityRole="header" style={{ fontFamily: FONT.display, fontSize: 30, lineHeight: 36, letterSpacing: -0.6, color: th.ink }}>{c.whyTitle}</Text>
            <Text style={{ fontFamily: FONT.regular, fontSize: 17, lineHeight: 28, color: th.ink, opacity: 0.9, marginTop: 16 }}>{c.why}</Text>
          </Paper>
          <LinkList title={c.more} links={c.links} />
        </View>
        <MoreTiles keys={["arabic", "duas", "prayer", "islam"]} />
      </PageScroll>
    </>
  );
}
