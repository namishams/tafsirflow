import { View } from "react-native";
import { Stack, router, type Href } from "expo-router";
import { Page, PageHero } from "@/components/page";
import { Poster, PosterGrid, SectionTitle, gradientColors } from "@/components/brand";
import { useWebT } from "@/i18n/web";
import { GROUPS, routeOf, tile } from "@/lib/features";

// Discover: every course and tool of the website as poster tiles, grouped like the website menu
export default function Discover() {
  const w = useWebT();
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
                {g.keys.map((k) => tile(k)).filter((t) => !!t).map((t) => (
                  <Poster key={t!.key} title={w(`nav.${t!.key}`)} desc={w(`home2.${t!.desc}`)} badge={w(`home2.badge_${t!.badge}`)} arabic={t!.ar}
                    colors={gradientColors(t!.bg)} cta={w("home2.open")} onPress={() => router.push(routeOf(t!) as Href)} />
                ))}
              </PosterGrid>
            </View>
          ))}
        </View>
      </Page>
    </>
  );
}
