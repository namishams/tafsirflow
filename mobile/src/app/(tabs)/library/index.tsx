import { View } from "react-native";
import { Stack, router, type Href } from "expo-router";
import { Page, PageHero } from "@/components/page";
import { useWebT } from "@/i18n/web";
import { FeedSpotlight } from "@/features/feed/EntryCards";
import { StoryRails } from "@/features/prophet/Rails";
import { HadithSpotlight } from "@/features/hadith/cards";
import { CommunityCard } from "@/features/community/ui";
import { TalentsCard } from "@/features/talents/ui";
import { AbrahamicCard } from "@/features/abrahamic/AbrahamicScreen";
import { HaramainCard } from "@/features/haramain/HaramainScreen";
import { DiscoverRows } from "@/features/library/Discover";
import { Poster, PosterGrid, SectionTitle, gradientColors } from "@/components/brand";
import { useLang } from "@/i18n";
import { calText } from "@/web/hijri";
import { namesText } from "@/web/names";
import { GROUPS, extraTool, routeOf, tile } from "@/lib/features";

// Discover: one endless scroll in the Masterclass design. Spotlights first, then every course, tool and section as
// poster cards in themed rows (no "more" button); the endless discovery lives in the Feed.
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
        <View style={{ marginTop: 20, gap: 20 }}>
          <View style={{ paddingHorizontal: 16 }}><FeedSpotlight /></View>
          <View style={{ paddingHorizontal: 16 }}><HadithSpotlight /></View>
          <View style={{ paddingHorizontal: 16 }}><TalentsCard /></View>
          <View style={{ paddingHorizontal: 16 }}><CommunityCard /></View>
          <View style={{ paddingHorizontal: 16 }}><AbrahamicCard onPress={() => router.push("/abrahamic" as Href)} /></View>
          <View style={{ paddingHorizontal: 16 }}><HaramainCard onPress={() => router.push("/haramain" as Href)} /></View>
          <StoryRails />
        </View>
        {/* every course and tool of the website as poster tiles, grouped like the website menu */}
        <View style={{ paddingHorizontal: 16, gap: 32, marginTop: 28 }}>
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
        {/* the app's own sections (reciter path, cards, Arabic courses, Haramain …) in themed rows */}
        <View style={{ marginTop: 28 }}><DiscoverRows /></View>
      </Page>
    </>
  );
}
