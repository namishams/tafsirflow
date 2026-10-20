import { useRef } from "react";
import { View, type ScrollViewInstance } from "react-native";
import { Stack } from "expo-router";
import { useLang } from "@/i18n";
import { namesText } from "@/web/names";
import { useTheme } from "@/lib/theme";
import NameGenerator from "@/features/practice/names/NameGenerator";
import { Hero, PageScroll, MoreTiles } from "@/features/practice/art";
import { HEROES } from "@/features/practice/web/heroes";

// /names – Muslim names with meanings (website: app/[locale]/(app)/names)
export default function NamesScreen() {
  const { lang } = useLang();
  const t = namesText(lang);
  const th = useTheme();
  const scroll = useRef<ScrollViewInstance>(null);
  const base = useRef(0);
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <PageScroll scrollRef={scroll}>
        <Hero kicker={t("kicker")} title={t("title")} lead={t("lead")} word={HEROES.names.word} arabic={HEROES.names.ar} arabicRef={`(${t("heroRef")})`} arcade={false} />
        <View style={{ paddingHorizontal: 16, paddingTop: 40 }} onLayout={(e) => { base.current = e.nativeEvent.layout.y; }}>
          <NameGenerator scrollTo={(y) => scroll.current?.scrollTo({ y: Math.max(0, base.current + y - 12), animated: true })} />
        </View>
        <MoreTiles keys={["duagen", "duas", "islam", "community"]} />
      </PageScroll>
    </>
  );
}
