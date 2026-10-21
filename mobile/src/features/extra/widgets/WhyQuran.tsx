import { Pressable, Text, View } from "react-native";
import { router, type Href } from "expo-router";
import Svg, { Path } from "react-native-svg";
import { Stage } from "@/components/brand";
import { useWebT } from "@/i18n/web";
import { ARABIC_FONT, FONT, R, stage, useTheme } from "@/lib/theme";
import { HADITH_API_NAME, SHAMS_WHY, type ShamsWhyItem } from "@/web/shamsContent";
import { useShamsHadith, useTranslationName, useVerse } from "@/features/library/shamsSources";
import { GOLD, GOLD_L, HmCard, IllumFrame, QuranQuote, StarGlyph, alpha, useHm } from "../art";

/**
 * "Why learning the Quran matters more than anything" (website WhyQuran.tsx, home page): the lead, four hadith on
 * marble cards and verse 54:17 in gold on the stage, then a button to the Academy. Nothing is typed (BLUEPRINT §4):
 * the hadith come by collection and number (SHAMS_WHY) from fawazahmed0/hadith-api (the Arabic words and the
 * translation in the reader's language, English where the API has none; kept on the device once fetched, shared with
 * the Shams page), the verse's Arabic and translation from the Quran API. The website's messages give each card an
 * own-words heading (shams.why1h …), the reference labels (shams.why1s …) and the sources note. A hadith that cannot
 * be loaded keeps its card with heading and reference, without any text in its place.
 * The website's closing sentence ("that is why Quran Masterclass is free") is left out in the app because of Pro.
 * Props: cta (default true) shows the Academy button; padded (default true) adds the page gutter.
 */
type HadithItem = Extract<ShamsWhyItem, { kind: "hadith" }>;
const HADITH = SHAMS_WHY.filter((w): w is HadithItem => w.kind === "hadith");
const VERSE = SHAMS_WHY.find((w): w is Extract<ShamsWhyItem, { kind: "verse" }> => w.kind === "verse") ?? { kind: "verse", key: "54:17", cite: "why5s" };
/** the heading of a card: "why1s" (reference label) -> "why1h" (own words) */
const headKey = (cite: string) => cite.replace(/s$/, "h");

function HadithCard({ item }: { item: HadithItem }) {
  const t = useTheme();
  const hm = useHm(t);
  const w = useWebT("shams");
  const h = useShamsHadith(item);
  return (
    <HmCard>
      <Svg width={30} height={22} viewBox="0 0 40 28"><Path d="M4 26V15C4 8 8 3 16 2v5c-4 1-6 4-6 8h6v11zM24 26V15c0-7 4-12 12-13v5c-4 1-6 4-6 8h6v11z" fill={GOLD} fillOpacity={0.22} stroke={GOLD} strokeWidth={1.2} strokeLinejoin="round" /></Svg>
      <Text accessibilityRole="header" style={{ fontFamily: FONT.display, fontSize: 18, lineHeight: 24, letterSpacing: -0.2, color: t.ink, marginTop: 10 }}>{w(headKey(item.cite))}</Text>
      {h === undefined ? (
        <View accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={{ height: 72, borderRadius: 8, marginTop: 10, backgroundColor: alpha(GOLD, 0.12) }} />
      ) : h ? (
        <>
          {h.arabic ? <Text style={{ fontFamily: ARABIC_FONT, fontSize: 19, lineHeight: 36, color: t.ink, marginTop: 10, writingDirection: "rtl" }}>{h.arabic}</Text> : null}
          {h.text ? <Text style={{ fontFamily: FONT.regular, fontSize: 15.5, lineHeight: 25, color: t.ink, marginTop: 10 }}>{h.text}</Text> : null}
        </>
      ) : null}
      <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginTop: 14 }}>
        <StarGlyph size={10} color={hm.goldD} />
        <Text style={{ flex: 1, fontFamily: FONT.semibold, fontSize: 13.5, color: hm.goldD }}>{h ? `${w(item.cite)} · ${HADITH_API_NAME}` : w(item.cite)}</Text>
      </View>
    </HmCard>
  );
}

export function WhyQuran({ cta = true, padded = true }: { cta?: boolean; padded?: boolean }) {
  const t = useTheme();
  const w = useWebT("shams");
  const verse = useVerse(VERSE.key)?.v;
  const translator = useTranslationName();
  return (
    <View style={{ paddingHorizontal: padded ? 16 : 0, paddingVertical: padded ? 40 : 0 }}>
      <Text accessibilityRole="header" style={{ fontFamily: FONT.display, fontSize: 30, lineHeight: 34, letterSpacing: -0.7, color: t.ink }}>{w("whyTitle")}</Text>
      <Text style={{ fontFamily: FONT.regular, fontSize: 16, lineHeight: 25, color: t.muted, marginTop: 14 }}>{w("whyLead")}</Text>
      <View style={{ gap: 12, marginTop: 24 }}>
        {HADITH.map((item) => <HadithCard key={item.cite} item={item} />)}
        <Stage rounded={R.card}>
          <IllumFrame />
          <View style={{ paddingHorizontal: 22, paddingVertical: 30, alignItems: "center" }}>
            <QuranQuote verseKey={VERSE.key} size={24} color={GOLD_L} citeColor={alpha(GOLD_L, 0.7)} />
            {verse?.translation ? <Text style={{ fontFamily: FONT.regular, fontSize: 16.5, lineHeight: 26, color: "rgba(255,255,255,0.85)", textAlign: "center", marginTop: 12 }}>{verse.translation}</Text> : null}
            <Text style={{ fontFamily: FONT.semibold, fontSize: 13.5, color: stage.gold, marginTop: 10 }}>{verse?.translation && translator ? `${w(VERSE.cite)} · ${translator}` : w(VERSE.cite)}</Text>
          </View>
        </Stage>
      </View>
      <Text style={{ fontFamily: FONT.regular, fontSize: 12.5, lineHeight: 19, color: t.muted, marginTop: 14 }}>{w("whyNote")}</Text>
      {cta ? (
        <Pressable onPress={() => router.push("/academy" as Href)} accessibilityRole="button" accessibilityLabel={w("whyCta")}
          style={({ pressed }) => ({ alignSelf: "flex-start", marginTop: 24, height: 52, paddingHorizontal: 24, borderRadius: R.md, backgroundColor: t.ink, justifyContent: "center", opacity: pressed ? 0.88 : 1, borderWidth: 1, borderColor: "rgba(233,207,153,0.3)" })}>
          <Text style={{ fontFamily: FONT.bold, fontSize: 15, color: t.bg }}>{w("whyCta")}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}
