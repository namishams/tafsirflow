import { useMemo } from "react";
import { View } from "react-native";
import { Stack } from "expo-router";
import { Page } from "@/components/page";
import { CampusRailsView, HERO_RECORD_HREFS, MadrasaHero, StudyWisdom, useCampusRails } from "@/features/campus/Campus";
import { useWebT } from "@/i18n/web";
import { FeedSpotlight } from "@/features/feed/EntryCards";
import { StoryRails } from "@/features/prophet/Rails";
import { HadithSpotlight } from "@/features/hadith/cards";
import { CommunityCard } from "@/features/community/ui";
import { TalentsCard } from "@/features/talents/ui";
import { DiscoverRows } from "@/features/library/Discover";
import { SectionTitle } from "@/components/brand";
import { SistersEntryCard } from "@/features/sisters/ui";

// Discover: one endless scroll in the Masterclass design. The Madrasa first (stage, next step, records), the study
// wisdom, every faculty, course and tool with the learner's progress, the spotlights, then every remaining course,
// tool and section as poster cards in themed rows (no "more" button). Each place is shown once: the rails, the
// spotlights and the poster rows share one set of hrefs, and a tile whose href already appeared above is left out
// (every destination stays reachable; the Abrahamic and Haramain courses live in the heritage rail, the website's
// tool groups in the themed rows). The endless discovery lives in the Feed.

/** places the spotlights open: the Feed ("/" in the app, "/feed" as a tile), the prophet stories, Talents, Community people */
const SPOTLIGHT_HREFS = ["/feed", "/prophet-stories", "/talents", "/community/people"];

export default function Discover() {
  const w = useWebT();
  const campus = useCampusRails();
  const heroRecords = useMemo(() => new Set<string>(HERO_RECORD_HREFS), []);
  // every href shown above the poster rows: the hero's records, the campus rails, the spotlights
  const shown = useMemo(() => {
    const s = new Set<string>([...HERO_RECORD_HREFS, "/school", ...SPOTLIGHT_HREFS]);
    for (const r of campus.rails) for (const i of r.items) s.add(i.href.split("?")[0]);
    for (const i of campus.stageItems) s.add(i.href.split("?")[0]);
    return s;
  }, [campus]);
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <Page>
        {/* the Madrasa first: stage, next step, today's wird, faculties and records */}
        <MadrasaHero eyebrow="Quran Masterclass" />
        <View style={{ marginTop: 28 }}><StudyWisdom /></View>
        {/* "Für Schwestern": only for sisters (identity), not after she declined the setup; the page itself is open to all */}
        <View style={{ paddingHorizontal: 16, marginTop: 24 }}><SistersEntryCard /></View>
        {/* every faculty, course and tool with the learner's progress (the hero's records are not repeated) */}
        <View style={{ marginTop: 32 }}><CampusRailsView data={campus} skip={heroRecords} /></View>
        <View style={{ paddingHorizontal: 16, marginTop: 36 }}>
          <SectionTitle title={w("home2.toolsTitle") === "home2.toolsTitle" ? w("nav.more") : w("home2.toolsTitle")} style={{ marginBottom: 0 }} />
        </View>
        <View style={{ marginTop: 16, gap: 20 }}>
          <View style={{ paddingHorizontal: 16 }}><FeedSpotlight /></View>
          <View style={{ paddingHorizontal: 16 }}><HadithSpotlight /></View>
          <View style={{ paddingHorizontal: 16 }}><TalentsCard /></View>
          <View style={{ paddingHorizontal: 16 }}><CommunityCard /></View>
          <StoryRails />
        </View>
        {/* every remaining course, tool and section (the website's menu groups included) in themed rows */}
        <View style={{ marginTop: 28 }}><DiscoverRows skip={shown} /></View>
      </Page>
    </>
  );
}
