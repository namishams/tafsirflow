import { View } from "react-native";
import { Stack, router, type Href } from "expo-router";
import { Page, PageHero } from "@/components/page";
import { Poster, PosterGrid, SectionTitle, gradientColors } from "@/components/brand";
import { useLang } from "@/i18n";
import { useWebT } from "@/i18n/web";
import { calText } from "@/web/hijri";
import { namesText } from "@/web/names";
import { GROUPS, extraTool, routeOf, tile } from "@/lib/features";

// Discover: every course and tool of the website as poster tiles, grouped like the website menu; search, the
// Islamic calendar and the names finder (website menu items without a poster) in the same look
export default function Discover() {
  const w = useWebT();
  const { lang } = useLang();
  const cal = calText(lang).t;
  const nm = namesText(lang);
  const extraText = (k: string): [string, string] =>
    k === "search" ? [w("nav.search"), w("search.title")] : k === "calendar" ? [cal("title"), cal("lead")] : [nm("title"), nm("lead")];
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <Page>
        <PageHero topInset eyebrow="Quran Masterclass" title={w("home2.toolsTitle") === "home2.toolsTitle" ? w("nav.more") : w("home2.toolsTitle")} />
        <View style={{ paddingHorizontal: 16, gap: 32, marginTop: 24 }}>
          {GROUPS.map((g) => (
            <View key={g.id}>
              <SectionTitle title={w(g.title)} />
              <PosterGrid>
                {g.keys.map((k) => {
                  const t = tile(k);
                  if (t) {
                    return <Poster key={k} title={w(`nav.${t.key}`)} desc={w(`home2.${t.desc}`)} badge={w(`home2.badge_${t.badge}`)} arabic={t.ar}
                      colors={gradientColors(t.bg)} cta={w("home2.open")} onPress={() => router.push(routeOf(t) as Href)} />;
                  }
                  const x = extraTool(k);
                  if (!x) return null;
                  const [title, desc] = extraText(k);
                  return <Poster key={k} title={title} desc={desc} badge={w(`home2.badge_${x.badge}`)} arabic={x.ar}
                    colors={gradientColors(x.bg)} cta={w("home2.open")} onPress={() => router.push(routeOf(x) as Href)} />;
                }).filter((p) => p !== null)}
              </PosterGrid>
            </View>
          ))}
        </View>
      </Page>
    </>
  );
}
