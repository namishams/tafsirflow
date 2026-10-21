import { Pressable, Text, View, useWindowDimensions } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { router, type Href } from "expo-router";
import { StarLattice } from "@/components/brand";
import { Icon } from "@/components/icons";
import { CALLIG_FONT, FONT, R, TONES, stage } from "@/lib/theme";
import { useProphetText } from "@/features/prophet/texts";
import { useFeedText } from "./texts";

// Entry points: the two prominent cards on the Discover screen (Quran Feed, The Prophet ﷺ) and the small "Feed"
// button on the Today stage.

function Spot({ title, lead, cta, arabic, colors, onPress }: { title: string; lead: string; cta: string; arabic: string; colors: [string, string]; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={`${title}. ${lead}`} style={({ pressed }) => ({ flex: 1, minWidth: 260, opacity: pressed ? 0.9 : 1 })}>
      <LinearGradient colors={colors} start={{ x: 0.1, y: 0 }} end={{ x: 0.9, y: 1 }} style={{ borderRadius: R.card, padding: 18, minHeight: 190, overflow: "hidden", borderWidth: 1, borderColor: stage.goldSoft, justifyContent: "flex-end" }}>
        <StarLattice opacity={0.07} />
        <Text allowFontScaling={false} style={{ position: "absolute", top: 6, end: 14, fontFamily: CALLIG_FONT, fontSize: 44, lineHeight: 80, color: "rgba(214,180,108,0.28)" }}>{arabic}</Text>
        <Text style={{ fontFamily: FONT.display, fontSize: 23, letterSpacing: -0.4, color: "#fff" }}>{title}</Text>
        <Text style={{ fontFamily: FONT.regular, fontSize: 14, lineHeight: 20, color: stage.textSoft, marginTop: 6 }}>{lead}</Text>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginTop: 12 }}>
          <Text style={{ fontFamily: FONT.bold, fontSize: 14, color: stage.gold }}>{cta}</Text>
          <Icon name="chevronRight" color={stage.gold} size={16} />
        </View>
      </LinearGradient>
    </Pressable>
  );
}

export function FeedSpotlight() {
  const f = useFeedText();
  const p = useProphetText();
  const { width } = useWindowDimensions();
  return (
    <View style={{ flexDirection: width >= 640 ? "row" : "column", gap: 12 }}>
      <Spot title={f.title} lead={f.lead} cta={f.open} arabic="آية" colors={[stage.bg, stage.deep]} onPress={() => router.navigate("/" as Href)} />
      <Spot title={p.title} lead={p.lead} cta={p.open} arabic="محمد ﷺ" colors={TONES[1]} onPress={() => router.push("/prophet-stories" as Href)} />
    </View>
  );
}

/** the small button on the Today stage */
export function FeedButton() {
  const f = useFeedText();
  return (
    <Pressable onPress={() => router.navigate("/" as Href)} accessibilityRole="button" accessibilityLabel={f.title}
      style={({ pressed }) => ({ flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, height: 44, borderRadius: R.pill, borderWidth: 1, borderColor: stage.goldSoft, backgroundColor: pressed ? "rgba(255,255,255,0.1)" : "rgba(255,255,255,0.04)" })}>
      <Icon name="play" color={stage.gold} size={16} />
      <Text style={{ fontFamily: FONT.bold, fontSize: 15, color: "#fff" }}>{f.title}</Text>
    </Pressable>
  );
}
