import { Text, View, type StyleProp, type ViewStyle } from "react-native";
import { GoldButton, OutlineButton, SmallStar, Stage } from "@/components/brand";
import { Display } from "@/components/brand";
import { openPro, usePro, type ProFeature } from "@/lib/pro";
import { FONT, R, stage } from "@/lib/theme";
import { IllumFrame } from "../art";
import { useX } from "../strings";

/**
 * A calm invitation to Pro for free users (nothing for Pro users): the stage with an illuminated frame, what Pro adds
 * in one sentence and one button to the Pro sheet. Props: feature (tells the sheet where the person came from),
 * title / body (override the default texts), compact (a slim one-line banner instead of the card).
 */
export function ProTeaser({ feature = "general", title, body, compact = false, style }: { feature?: ProFeature; title?: string; body?: string; compact?: boolean; style?: StyleProp<ViewStyle> }) {
  const { pro } = usePro();
  const x = useX().pro;
  if (pro) return null;
  if (compact) {
    return (
      <Stage rounded={R.card} style={style}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 12, padding: 14, paddingStart: 18 }}>
          <SmallStar size={12} color={stage.gold} />
          <Text style={{ flex: 1, fontFamily: FONT.semibold, fontSize: 14, lineHeight: 19, color: "#ffffff" }} numberOfLines={2}>{title ?? x.title}</Text>
          <OutlineButton title={x.cta} onStage compact onPress={() => openPro(feature)} />
        </View>
      </Stage>
    );
  }
  return (
    <Stage rounded={R.card} style={style}>
      <IllumFrame />
      <View style={{ padding: 24, gap: 10 }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          <SmallStar size={11} color={stage.gold} />
          <Text style={{ fontFamily: FONT.semibold, fontSize: 11.5, letterSpacing: 1.8, textTransform: "uppercase", color: stage.gold }}>{x.kicker}</Text>
        </View>
        <Display size="title2" onStage>{title ?? x.title}</Display>
        <Text style={{ fontFamily: FONT.regular, fontSize: 15, lineHeight: 23, color: "rgba(255,255,255,0.75)" }}>{body ?? x.body}</Text>
        <GoldButton title={x.cta} onPress={() => openPro(feature)} style={{ marginTop: 8 }} />
      </View>
    </Stage>
  );
}
