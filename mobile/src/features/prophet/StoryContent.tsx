import { Pressable, Text, View } from "react-native";
import { CALLIG_FONT, FONT, stage } from "@/lib/theme";
import { GoldButton } from "@/components/brand";
import { Icon } from "@/components/icons";
import type { Story } from "./stories";
import { useProphetText } from "./texts";

// The text of one story card on the dark stage (feed page and full-screen viewer): kicker, verdict badge, title, the
// paragraphs taken from the library, "known for" points, the original sources and the way to the full text.

export function Badge({ badge }: { badge: NonNullable<Story["badge"]> }) {
  const bg = badge.tone === "no" ? "rgba(190,84,104,0.55)" : badge.tone === "info" ? "rgba(214,180,108,0.32)" : "rgba(58,190,146,0.38)";
  return <Text style={{ alignSelf: "flex-start", fontFamily: FONT.bold, fontSize: 12, color: "#fff", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999, backgroundColor: bg, overflow: "hidden" }}>{badge.text}</Text>;
}

export function StoryContent({ story, onReadMore, wide, compactSources }: { story: Story; onReadMore?: () => void; wide?: boolean; compactSources?: boolean }) {
  const tx = useProphetText();
  return (
    <View style={{ gap: 14 }}>
      <Text allowFontScaling={false} accessibilityElementsHidden importantForAccessibility="no" style={{ position: "absolute", top: -34, end: -6, fontFamily: CALLIG_FONT, fontSize: 64, lineHeight: 110, color: "rgba(214,180,108,0.14)" }}>{story.arabic}</Text>
      {story.kicker ? <Text style={{ fontFamily: FONT.semibold, fontSize: 12, letterSpacing: 1.8, textTransform: "uppercase", color: stage.gold }}>{story.kicker}</Text> : null}
      {story.badge ? <Badge badge={story.badge} /> : null}
      <Text accessibilityRole="header" style={{ fontFamily: FONT.display, fontSize: wide ? 34 : 28, lineHeight: wide ? 40 : 33, letterSpacing: -0.5, color: "#fff" }}>{story.title}</Text>
      {story.paragraphs.map((p, i) => (
        <Text key={i} selectable style={{ fontFamily: FONT.regular, fontSize: wide ? 19 : 16.5, lineHeight: wide ? 30 : 26, color: "rgba(255,255,255,0.9)" }}>{p}</Text>
      ))}
      {story.points ? (
        <View style={{ gap: 8, marginTop: 2 }}>
          <Text style={{ fontFamily: FONT.bold, fontSize: 14, color: stage.gold }}>{story.points.title}</Text>
          {story.points.items.map((it, i) => (
            <View key={i} style={{ flexDirection: "row", gap: 10 }}>
              <Text style={{ color: stage.gold, fontSize: 14, lineHeight: 22 }}>◆</Text>
              <Text style={{ flex: 1, fontFamily: FONT.regular, fontSize: 15, lineHeight: 22, color: "rgba(255,255,255,0.88)" }}>{it}</Text>
            </View>
          ))}
        </View>
      ) : null}
      {story.sources.length ? (
        <View style={{ marginTop: 4, gap: 4 }}>
          <Text style={{ fontFamily: FONT.semibold, fontSize: 11.5, letterSpacing: 1.4, textTransform: "uppercase", color: stage.textMuted }}>{tx.sources}</Text>
          <Text numberOfLines={compactSources ? 3 : undefined} style={{ fontFamily: FONT.regular, fontSize: 12.5, lineHeight: 18, color: stage.textMuted }}>{story.sources.join(" · ")}</Text>
        </View>
      ) : null}
      {onReadMore ? (
        <Pressable onPress={onReadMore} accessibilityRole="link" style={{ flexDirection: "row", alignItems: "center", gap: 6, alignSelf: "flex-start", marginTop: 4, paddingVertical: 8 }}>
          <Text style={{ fontFamily: FONT.bold, fontSize: 14.5, color: stage.gold }}>{story.truncated && story.href.startsWith("/islam/") ? tx.readFull : tx.readMore}</Text>
          <Icon name="chevronRight" color={stage.gold} size={16} />
        </Pressable>
      ) : null}
    </View>
  );
}

/** the Pro card after the free stories of the day */
export function ProCard({ onPro, onLater }: { onPro: () => void; onLater?: () => void }) {
  const tx = useProphetText();
  return (
    <View style={{ gap: 16, padding: 22, borderRadius: 18, borderWidth: 1, borderColor: stage.goldSoft, backgroundColor: "rgba(0,0,0,0.25)" }}>
      <Text allowFontScaling={false} accessibilityElementsHidden style={{ fontFamily: CALLIG_FONT, fontSize: 46, lineHeight: 80, color: "rgba(233,207,153,0.85)", textAlign: "center" }}>قصص</Text>
      <Text accessibilityRole="header" style={{ fontFamily: FONT.display, fontSize: 26, lineHeight: 31, color: "#fff", textAlign: "center" }}>{tx.proTitle}</Text>
      <Text style={{ fontFamily: FONT.regular, fontSize: 15.5, lineHeight: 23, color: stage.textSoft, textAlign: "center" }}>{tx.proBody}</Text>
      <GoldButton title={tx.proCta} icon="starBig" onPress={onPro} />
      {onLater ? <Text onPress={onLater} accessibilityRole="button" style={{ fontFamily: FONT.semibold, fontSize: 14.5, color: stage.textSoft, textAlign: "center", paddingVertical: 8 }}>{tx.proLater}</Text> : null}
    </View>
  );
}
