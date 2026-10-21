import { View } from "react-native";
import { Stack, router, type Href } from "expo-router";
import { Page, PageHero } from "@/components/page";
import { useWebT } from "@/i18n/web";
import { FeedSpotlight } from "@/features/feed/EntryCards";
import { StoryRails } from "@/features/prophet/Rails";
import { HadithSpotlight } from "@/features/hadith/cards";
import { CommunityCard } from "@/features/community/ui";
import { AbrahamicCard } from "@/features/abrahamic/AbrahamicScreen";
import { HaramainCard } from "@/features/haramain/HaramainScreen";
import { DiscoverRows } from "@/features/library/Discover";

// Discover: one endless scroll in the Masterclass design. Spotlights first, then every course, tool and section as
// poster cards in themed rows (no "more" button); the endless discovery lives in the Feed.
export default function Discover() {
  const w = useWebT();
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <Page>
        <PageHero topInset eyebrow="Quran Masterclass" title={w("home2.toolsTitle") === "home2.toolsTitle" ? w("nav.more") : w("home2.toolsTitle")} />
        <View style={{ marginTop: 20, gap: 20 }}>
          <View style={{ paddingHorizontal: 16 }}><FeedSpotlight /></View>
          <View style={{ paddingHorizontal: 16 }}><HadithSpotlight /></View>
          <View style={{ paddingHorizontal: 16 }}><CommunityCard /></View>
          <View style={{ paddingHorizontal: 16 }}><AbrahamicCard onPress={() => router.push("/abrahamic" as Href)} /></View>
          <View style={{ paddingHorizontal: 16 }}><HaramainCard onPress={() => router.push("/haramain" as Href)} /></View>
          <StoryRails />
        </View>
        <View style={{ marginTop: 28 }}><DiscoverRows /></View>
      </Page>
    </>
  );
}
