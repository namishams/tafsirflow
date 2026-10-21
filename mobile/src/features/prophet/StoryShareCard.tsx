import { Text, View } from "react-native";
import { CALLIG_FONT, FONT, stage } from "@/lib/theme";
import { FeedBackdrop, toneOf } from "@/features/feed/art";
import { GoldFrame, Rule } from "@/features/feed/ornament";
import { BrandFoot, CARD_SIZE, type ShareFormat } from "@/features/feed/share";
import type { Story } from "./stories";

// The image of a story card (Instagram Story 1080×1920 / Post 1080×1350): title, the first part of the existing
// text (cut after a full sentence), the chapter and its first source, the brand line. Fixed layout, no font scaling.

function clip(text: string, max: number): string {
  if (text.length <= max) return text;
  const cut = text.slice(0, max);
  const end = Math.max(cut.lastIndexOf(". "), cut.lastIndexOf("! "), cut.lastIndexOf("? "), cut.lastIndexOf("؟ "), cut.lastIndexOf("。"));
  return end > max * 0.5 ? cut.slice(0, end + 1) : `${cut.slice(0, cut.lastIndexOf(" "))} …`;
}

export function StoryShareCard({ story, format, lines }: { story: Story; format: ShareFormat; lines?: { title: string; body: string; arabic?: string } }) {
  const { w, h } = CARD_SIZE[format];
  const title = lines?.title ?? story.title;
  const body = lines?.body ?? clip(story.paragraphs.join("\n\n") || (story.points?.items.join("\n") ?? ""), format === "story" ? 620 : 380);
  const arabic = lines?.arabic ?? story.arabic;
  return (
    <View style={{ width: w, height: h, overflow: "hidden" }}>
      <FeedBackdrop tone={toneOf(story.group)} width={w} height={h} still />
      <GoldFrame inset={12} />
      <Text allowFontScaling={false} style={{ position: "absolute", top: format === "story" ? 70 : 34, alignSelf: "center", fontFamily: CALLIG_FONT, fontSize: 64, lineHeight: 110, color: "rgba(214,180,108,0.16)" }}>{arabic}</Text>
      <View style={{ flex: 1, paddingHorizontal: 28, paddingTop: format === "story" ? 64 : 30, paddingBottom: format === "story" ? 44 : 22, justifyContent: "space-between" }}>
        <View style={{ alignItems: "center", gap: 6 }}>
          <Rule width={72} />
          <Text allowFontScaling={false} numberOfLines={1} style={{ fontFamily: FONT.semibold, fontSize: 10.5, letterSpacing: 2, textTransform: "uppercase", color: stage.gold }}>{story.groupTitle}</Text>
        </View>
        <View style={{ gap: 14 }}>
          {story.badge ? <Text allowFontScaling={false} style={{ alignSelf: "center", fontFamily: FONT.bold, fontSize: 11, color: "#fff", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999, backgroundColor: story.badge.tone === "no" ? "rgba(160,58,52,0.6)" : story.badge.tone === "info" ? "rgba(214,180,108,0.4)" : "rgba(58,190,146,0.45)" }}>{story.badge.text}</Text> : null}
          <Text allowFontScaling={false} style={{ fontFamily: FONT.display, fontSize: format === "story" ? 26 : 22, lineHeight: format === "story" ? 31 : 27, color: "#fff", textAlign: "center" }}>{title}</Text>
          <Text allowFontScaling={false} style={{ fontFamily: FONT.regular, fontSize: format === "story" ? 14 : 12.5, lineHeight: format === "story" ? 21 : 18.5, color: "rgba(255,255,255,0.88)", textAlign: "center" }}>{body}</Text>
          {story.sources[0] ? <Text allowFontScaling={false} numberOfLines={2} style={{ fontFamily: FONT.regular, fontSize: 10, color: stage.textMuted, textAlign: "center" }}>{story.sources.slice(0, 2).join(" · ")}</Text> : null}
        </View>
        <BrandFoot />
      </View>
    </View>
  );
}
