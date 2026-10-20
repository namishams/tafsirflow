import { View } from "react-native";
import { Stack } from "expo-router";
import { useLang } from "@/i18n";
import { calText } from "@/web/hijri";
import HijriCalendar from "@/features/practice/HijriCalendar";
import { Hero, PageScroll, MoreTiles } from "@/features/practice/art";
import { HEROES } from "@/features/practice/web/heroes";

// /calendar – the Islamic calendar (website: app/[locale]/(app)/calendar)
export default function CalendarScreen() {
  const { lang } = useLang();
  const { t } = calText(lang);
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <PageScroll>
        <Hero kicker={t("kicker")} title={t("title")} lead={t("lead")} word={HEROES.calendar.word} arabic={HEROES.calendar.ar} arabicRef={`(${t("heroRef")})`} arcade={false} />
        <View style={{ paddingHorizontal: 16, paddingTop: 40 }}>
          <HijriCalendar />
        </View>
        <MoreTiles keys={["prayer", "islam", "khatm", "salah"]} />
      </PageScroll>
    </>
  );
}
