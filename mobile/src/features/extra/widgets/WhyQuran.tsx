import { Pressable, Text, View } from "react-native";
import { router, type Href } from "expo-router";
import Svg, { Path } from "react-native-svg";
import { Stage } from "@/components/brand";
import { useWebT } from "@/i18n/web";
import { FONT, R, stage, useTheme } from "@/lib/theme";
import { GOLD, GOLD_L, HmCard, IllumFrame, QuranQuote, StarGlyph, alpha, useHm } from "../art";

/**
 * "Why learning the Quran matters more than anything" (website WhyQuran.tsx, home and Shams page): the lead, four
 * sayings on marble cards (texts and sources from the website's messages), verse 54:17 in gold on the stage (Arabic
 * from the server) with its translation, and a button to the Academy.
 * The website's closing sentence ("that is why Quran Masterclass is free") is left out in the app because of Pro.
 * Props: cta (default true) shows the Academy button; padded (default true) adds the page gutter.
 */
export function WhyQuran({ cta = true, padded = true }: { cta?: boolean; padded?: boolean }) {
  const t = useTheme();
  const hm = useHm(t);
  const w = useWebT("shams");
  return (
    <View style={{ paddingHorizontal: padded ? 16 : 0, paddingVertical: padded ? 40 : 0 }}>
      <Text accessibilityRole="header" style={{ fontFamily: FONT.display, fontSize: 30, lineHeight: 34, letterSpacing: -0.7, color: t.ink }}>{w("whyTitle")}</Text>
      <Text style={{ fontFamily: FONT.regular, fontSize: 16, lineHeight: 25, color: t.muted, marginTop: 14 }}>{w("whyLead")}</Text>
      <View style={{ gap: 12, marginTop: 24 }}>
        {[1, 2, 3, 4].map((n) => (
          <HmCard key={n}>
            <Svg width={30} height={22} viewBox="0 0 40 28"><Path d="M4 26V15C4 8 8 3 16 2v5c-4 1-6 4-6 8h6v11zM24 26V15c0-7 4-12 12-13v5c-4 1-6 4-6 8h6v11z" fill={GOLD} fillOpacity={0.22} stroke={GOLD} strokeWidth={1.2} strokeLinejoin="round" /></Svg>
            <Text style={{ fontFamily: FONT.regular, fontSize: 16.5, lineHeight: 26, color: t.ink, marginTop: 10 }}>{w(`why${n}`)}</Text>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginTop: 14 }}>
              <StarGlyph size={10} color={hm.goldD} />
              <Text style={{ flex: 1, fontFamily: FONT.semibold, fontSize: 13.5, color: hm.goldD }}>{w(`why${n}s`)}</Text>
            </View>
          </HmCard>
        ))}
        <Stage rounded={R.card}>
          <IllumFrame />
          <View style={{ paddingHorizontal: 22, paddingVertical: 30, alignItems: "center" }}>
            <QuranQuote verseKey="54:17" size={24} color={GOLD_L} citeColor={alpha(GOLD_L, 0.7)} />
            <Text style={{ fontFamily: FONT.regular, fontSize: 16.5, lineHeight: 26, color: "rgba(255,255,255,0.85)", textAlign: "center", marginTop: 12 }}>{w("why5")}</Text>
            <Text style={{ fontFamily: FONT.semibold, fontSize: 13.5, color: stage.gold, marginTop: 10 }}>{w("why5s")}</Text>
          </View>
        </Stage>
      </View>
      {cta ? (
        <Pressable onPress={() => router.push("/academy" as Href)} accessibilityRole="button" accessibilityLabel={w("whyCta")}
          style={({ pressed }) => ({ alignSelf: "flex-start", marginTop: 24, height: 52, paddingHorizontal: 24, borderRadius: R.md, backgroundColor: t.ink, justifyContent: "center", opacity: pressed ? 0.88 : 1, borderWidth: 1, borderColor: "rgba(233,207,153,0.3)" })}>
          <Text style={{ fontFamily: FONT.bold, fontSize: 15, color: t.bg }}>{w("whyCta")}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}
