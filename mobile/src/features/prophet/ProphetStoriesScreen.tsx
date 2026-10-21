import { useMemo, useState } from "react";
import { Pressable, ScrollView, Text, View, useWindowDimensions } from "react-native";
import { router, useLocalSearchParams, type Href } from "expo-router";
import { Page, PageHero } from "@/components/page";
import { GoldButton, SectionTitle } from "@/components/brand";
import { FONT, R, useTheme } from "@/lib/theme";
import { useStored } from "@/lib/store";
import type { StoryCat, StoryGroup } from "./stories";
import { StoryRail, StoryTile } from "./Rails";
import { StoryViewer } from "./StoryViewer";
import { useProphetText } from "./texts";
import { FREE_STORIES_PER_DAY, SAVED_KEY, useStories, useStoryQuota } from "./useStories";

// "The Prophet ﷺ" – short stories in the Discover style: a rail of story circles on top (full-screen viewer), the
// categories as chips and a grid of story cards. Every text comes from the vetted library (see stories.ts).
const CATS: StoryCat[] = ["prophet", "reciters", "islam", "tips", "secrets"];

export function ProphetStoriesScreen() {
  const t = useTheme();
  const tx = useProphetText();
  const params = useLocalSearchParams<{ cat?: string }>();
  const { width } = useWindowDimensions();
  const { groups, byId } = useStories();
  const quota = useStoryQuota();
  const savedIds = useStored<string[]>(SAVED_KEY, []);
  const [cat, setCat] = useState<StoryCat>(CATS.includes(params.cat as StoryCat) ? (params.cat as StoryCat) : "prophet");
  const [open, setOpen] = useState<{ list: StoryGroup[]; group: number; story: number } | null>(null);

  const label: Record<StoryCat, string> = { prophet: tx.catProphet, reciters: tx.catReciters, islam: tx.catIslam, tips: tx.catTips, secrets: tx.catSecrets };
  const list = groups[cat];
  const saved = useMemo(() => savedIds.map((id) => byId.get(id)).filter((s) => !!s), [savedIds, byId]);
  const savedGroup: StoryGroup | null = saved.length ? { id: "saved", cat, title: tx.saved, arabic: "محفوظ", stories: saved as StoryGroup["stories"] } : null;

  const cols = width >= 1000 ? 4 : width >= 700 ? 3 : 2;
  const tileW = Math.floor((Math.min(width, 1100) - 32 - (cols - 1) * 12) / cols);

  return (
    <Page>
      <PageHero topInset back eyebrow={tx.kicker} title={cat === "prophet" ? tx.title : label[cat]} lead={cat === "prophet" ? tx.lead : undefined} arabic="محمد ﷺ">
        <View style={{ marginTop: 16 }}>
          <GoldButton title={tx.open} icon="play" onPress={() => list.length && setOpen({ list, group: 0, story: 0 })} />
        </View>
      </PageHero>

      <View style={{ marginTop: 18, gap: 18 }}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingHorizontal: 16 }} accessibilityRole="tablist">
          {CATS.filter((c) => groups[c].length).map((c) => (
            <Pressable key={c} onPress={() => setCat(c)} accessibilityRole="tab" accessibilityState={{ selected: c === cat }}
              style={{ height: 34, paddingHorizontal: 14, justifyContent: "center", borderRadius: R.pill, borderWidth: 1, borderColor: c === cat ? t.accent : t.line, backgroundColor: c === cat ? t.accent : t.surface }}>
              <Text style={{ fontFamily: FONT.semibold, fontSize: 13.5, color: c === cat ? t.onAccent : t.ink }}>{label[c]}</Text>
            </Pressable>
          ))}
        </ScrollView>

        <StoryRail groups={list} onOpen={(i) => setOpen({ list, group: i, story: 0 })} />

        {!quota.pro ? (
          <Text style={{ fontFamily: FONT.regular, fontSize: 12.5, color: t.muted, paddingHorizontal: 16 }}>
            {`${Math.min(quota.used, FREE_STORIES_PER_DAY)} / ${FREE_STORIES_PER_DAY}`}
          </Text>
        ) : null}

        {savedGroup ? (
          <View style={{ paddingHorizontal: 16 }}>
            <SectionTitle title={tx.saved} />
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12 }}>
              {savedGroup.stories.map((s, i) => <StoryTile key={s.id} story={s} width={Math.min(tileW, 170)} onPress={() => setOpen({ list: [savedGroup], group: 0, story: i })} />)}
            </ScrollView>
          </View>
        ) : null}

        {list.every((g) => g.stories.length === 1) ? (
          // one card per group (the reciters): a single grid
          <View style={{ paddingHorizontal: 16, maxWidth: 1100, width: "100%", alignSelf: "center", flexDirection: "row", flexWrap: "wrap", gap: 12 }}>
            {list.map((g, gi) => <StoryTile key={g.id} story={g.stories[0]} width={tileW} onPress={() => setOpen({ list, group: gi, story: 0 })} />)}
          </View>
        ) : list.map((g, gi) => (
          <View key={g.id} style={{ paddingHorizontal: 16, maxWidth: 1100, width: "100%", alignSelf: "center" }}>
            <SectionTitle title={g.title} action={g.stories[0]?.href.startsWith("/islam/") ? tx.readFull : undefined} onAction={() => router.push(g.stories[0].href as Href)} />
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12 }}>
              {g.stories.map((s, si) => <StoryTile key={s.id} story={s} width={tileW} onPress={() => setOpen({ list, group: gi, story: si })} />)}
            </View>
          </View>
        ))}
        <View style={{ height: 32 }} />
      </View>

      <StoryViewer groups={open?.list ?? []} start={open ? { group: open.group, story: open.story } : null} onClose={() => setOpen(null)} />
    </Page>
  );
}
