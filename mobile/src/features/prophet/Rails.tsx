import { useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { router, type Href } from "expo-router";
import { CALLIG_FONT, FONT, R, stage, useTheme } from "@/lib/theme";
import { useStored } from "@/lib/store";
import { Icon } from "@/components/icons";
import { toneOf } from "@/features/feed/art";
import type { Story, StoryCat, StoryGroup } from "./stories";
import { StoryViewer } from "./StoryViewer";
import { useProphetText } from "./texts";
import { SEEN_KEY, useStories } from "./useStories";

// Instagram-like story circles and story cards in the Discover style. A circle has a gold ring while one of its
// cards has not been read yet.

export function StoryRail({ groups, onOpen }: { groups: StoryGroup[]; onOpen: (group: number) => void }) {
  const t = useTheme();
  const seen = useStored<string[]>(SEEN_KEY, []);
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 14, paddingHorizontal: 16, paddingVertical: 4 }}>
      {groups.map((g, i) => {
        const fresh = g.stories.some((s) => !seen.includes(s.id));
        const tone = toneOf(g.id);
        return (
          <Pressable key={g.id} onPress={() => onOpen(i)} accessibilityRole="button" accessibilityLabel={`${g.title}, ${g.stories.length}`} style={{ width: 78, alignItems: "center", gap: 6 }}>
            <LinearGradient colors={fresh ? ["#f3e2b6", "#c6a65e", "#8a6a2c"] : [t.line, t.line]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ width: 72, height: 72, borderRadius: 36, padding: 2.5 }}>
              <View style={{ flex: 1, borderRadius: 34, padding: 2, backgroundColor: t.bg }}>
                <LinearGradient colors={tone} style={{ flex: 1, borderRadius: 32, alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
                  <Text allowFontScaling={false} numberOfLines={1} adjustsFontSizeToFit style={{ fontFamily: CALLIG_FONT, fontSize: 20, lineHeight: 40, color: "rgb(233,207,153)", paddingHorizontal: 6 }}>{g.arabic}</Text>
                </LinearGradient>
              </View>
            </LinearGradient>
            <Text numberOfLines={2} style={{ fontFamily: FONT.semibold, fontSize: 11.5, lineHeight: 14, color: t.ink, textAlign: "center" }}>{g.title}</Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

export function StoryTile({ story, onPress, width }: { story: Story; onPress: () => void; width: number }) {
  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={`${story.title}. ${story.groupTitle}`} style={({ pressed }) => ({ width, opacity: pressed ? 0.85 : 1 })}>
      <LinearGradient colors={toneOf(story.group)} start={{ x: 0.1, y: 0 }} end={{ x: 0.9, y: 1 }} style={{ height: width * 1.3, borderRadius: R.card, padding: 14, justifyContent: "flex-end", overflow: "hidden", borderWidth: 1, borderColor: stage.goldSoft }}>
        <Text allowFontScaling={false} numberOfLines={1} style={{ position: "absolute", top: 4, end: 10, fontFamily: CALLIG_FONT, fontSize: 34, lineHeight: 64, color: "rgba(214,180,108,0.22)" }}>{story.arabic}</Text>
        {story.badge ? <Text style={{ position: "absolute", top: 12, start: 12, fontFamily: FONT.bold, fontSize: 10.5, color: "#fff", paddingHorizontal: 8, paddingVertical: 3, borderRadius: 999, overflow: "hidden", backgroundColor: story.badge.tone === "no" ? "rgba(190,84,104,0.6)" : "rgba(58,190,146,0.4)" }}>{story.badge.text}</Text> : null}
        <Text numberOfLines={1} style={{ fontFamily: FONT.semibold, fontSize: 10.5, letterSpacing: 1.2, textTransform: "uppercase", color: stage.gold }}>{story.groupTitle}</Text>
        <Text numberOfLines={3} style={{ fontFamily: FONT.display, fontSize: 16.5, lineHeight: 20, color: "#fff", marginTop: 4 }}>{story.title}</Text>
        {story.paragraphs[0] ? <Text numberOfLines={3} style={{ fontFamily: FONT.regular, fontSize: 12.5, lineHeight: 17, color: stage.textSoft, marginTop: 6 }}>{story.paragraphs[0]}</Text> : null}
      </LinearGradient>
    </Pressable>
  );
}

const CAT_ROUTE: Record<StoryCat, string> = { prophet: "prophet", islam: "islam", reciters: "reciters", tips: "tips", secrets: "secrets" };

/** the story rails of every category for the Discover screen, each opening the full-screen viewer */
export function StoryRails() {
  const t = useTheme();
  const tx = useProphetText();
  const { groups } = useStories();
  const [open, setOpen] = useState<{ cat: StoryCat; group: number } | null>(null);
  const rows: [StoryCat, string][] = [["prophet", tx.catProphet], ["reciters", tx.catReciters], ["islam", tx.catIslam], ["tips", tx.catTips], ["secrets", tx.catSecrets]];
  return (
    <View style={{ gap: 18 }}>
      {rows.filter(([c]) => groups[c].length).map(([c, title]) => (
        <View key={c} style={{ gap: 8 }}>
          <Pressable onPress={() => router.push(`/prophet-stories?cat=${CAT_ROUTE[c]}` as Href)} accessibilityRole="link" style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16 }}>
            <Text accessibilityRole="header" style={{ fontFamily: FONT.display, fontSize: 18, color: t.ink }}>{title}</Text>
            <Icon name="chevronRight" color={t.muted} size={18} />
          </Pressable>
          <StoryRail groups={groups[c]} onOpen={(i) => setOpen({ cat: c, group: i })} />
        </View>
      ))}
      <StoryViewer groups={open ? groups[open.cat] : []} start={open ? { group: open.group, story: 0 } : null} onClose={() => setOpen(null)} />
    </View>
  );
}
