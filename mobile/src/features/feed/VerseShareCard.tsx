import { Text, View } from "react-native";
import { ARABIC_FONT, FONT, stage } from "@/lib/theme";
import { FeedBackdrop } from "./art";
import { BrandFoot, CARD_SIZE, type ShareFormat } from "./share";
import { GoldFrame, Rule } from "./ornament";

// The image of a verse for Instagram / WhatsApp: the verse in Arabic, the translation, the reference and the brand
// line. Fixed layout (no font scaling), drawn at CARD_SIZE and captured at 1080 px width.

function arabicSize(text: string, f: ShareFormat) {
  const n = text.length;
  const base = f === "story" ? 1 : 0.86;
  return Math.round((n < 70 ? 30 : n < 160 ? 25 : n < 320 ? 20 : n < 520 ? 16 : 13) * base);
}
function transSize(text: string, f: ShareFormat) {
  const n = text.length;
  const base = f === "story" ? 1 : 0.9;
  return Math.round((n < 140 ? 15.5 : n < 300 ? 13.5 : n < 520 ? 12 : 10.5) * base * 10) / 10;
}

export function VerseShareCard({ format, arabic, translation, reference, tone }: { format: ShareFormat; arabic: string; translation: string; reference: string; tone: [string, string] }) {
  const { w, h } = CARD_SIZE[format];
  const ar = arabicSize(arabic, format);
  const tr = transSize(translation, format);
  return (
    <View style={{ width: w, height: h, overflow: "hidden" }}>
      <FeedBackdrop tone={tone} width={w} height={h} still />
      <GoldFrame inset={12} />
      <View style={{ flex: 1, paddingHorizontal: 26, paddingTop: format === "story" ? 64 : 34, paddingBottom: format === "story" ? 44 : 22, justifyContent: "space-between" }}>
        <View style={{ alignItems: "center", gap: 6 }}>
          <Rule width={72} />
          <Text allowFontScaling={false} style={{ fontFamily: FONT.semibold, fontSize: 11, letterSpacing: 2.2, textTransform: "uppercase", color: stage.gold }}>{reference}</Text>
        </View>
        <View style={{ gap: 16 }}>
          <Text allowFontScaling={false} style={{ fontFamily: ARABIC_FONT, fontSize: ar, lineHeight: ar * 1.85, color: "#fff", textAlign: "center", writingDirection: "rtl" }}>{arabic}</Text>
          {translation ? (
            <Text allowFontScaling={false} numberOfLines={format === "story" ? 12 : 7} style={{ fontFamily: FONT.regular, fontSize: tr, lineHeight: tr * 1.5, color: "rgba(243,226,182,0.9)", textAlign: "center" }}>{translation}</Text>
          ) : null}
        </View>
        <BrandFoot />
      </View>
    </View>
  );
}
