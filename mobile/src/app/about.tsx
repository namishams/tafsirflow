import { Text, View } from "react-native";
import Svg, { Defs, RadialGradient, Rect, Stop } from "react-native-svg";
import { ARABIC_FONT, FONT, stage, useTheme } from "@/lib/theme";
import { useWebT } from "@/i18n/web";
import type { AboutContent } from "@/web/aboutContent";
import { Corners, FactCartouche, HeroKicker, HeroTitle, IslCard, IslH2, IslHero, IslamNum, Marble, Mosque, Rain, StageBackground } from "@/features/library/art";
import { Article, Markdown } from "@/features/library/markdown";
import { ArchPanel, GoldPill, MoreTiles, OutlinePill, StageCard } from "@/features/library/ui";
import { IslScreen } from "@/features/library/screen";
import { SERIF, SERIF_ITALIC, STAGE_GOLD, useIsl } from "@/features/library/palette";
import { useAbout } from "@/features/library/content";
import { openHref } from "@/features/library/links";
import FounderAbout from "@/features/library/FounderAbout";

// /about – the story behind Quran Masterclass, values, Dubai and the Quran, thanks, the letter and contact
// (website: src/app/[locale]/(app)/about/page.tsx, texts from src/lib/aboutContent.ts)
export default function AboutPage() {
  const c = useAbout();
  if (!c) return <IslScreen><View /></IslScreen>;
  return <About c={c} />;
}

function Eyebrow({ children }: { children: string }) {
  const t = useTheme();
  return <Text style={{ fontFamily: FONT.semibold, fontSize: 12, letterSpacing: 1.92, textTransform: "uppercase", color: t.gold }}>{children}</Text>;
}

function About({ c }: { c: AboutContent }) {
  const t = useWebT("about");
  const tc = useWebT("company");
  const tl = useWebT("legal");
  const isl = useIsl();
  return (
    <IslScreen>
      <IslHero callig="قصتنا" fall={520} paddingBottom={96}>
        <Svg style={{ position: "absolute", top: 0, left: 0, right: 0, height: 400 }} pointerEvents="none">
          <Defs><RadialGradient id="aboutglow" cx="15%" cy="0%" r="45%"><Stop offset="0" stopColor={stage.gold} stopOpacity={0.08} /><Stop offset="1" stopColor={stage.gold} stopOpacity={0} /></RadialGradient></Defs>
          <Rect width="100%" height="100%" fill="url(#aboutglow)" />
        </Svg>
        <HeroKicker>{c.eyebrow}</HeroKicker>
        <HeroTitle size={42} style={{ lineHeight: 43.7 }}>{c.title}</HeroTitle>
        <Text style={{ marginTop: 24, fontFamily: FONT.regular, fontSize: 18, lineHeight: 29, color: "rgba(255,255,255,0.7)" }}>{c.lead}</Text>
        <View style={{ marginTop: 48, flexDirection: "row", flexWrap: "wrap", gap: 16 }}>
          {c.facts.map((f) => <FactCartouche key={f.l} n={f.n} l={f.l} nSize={30} style={{ width: "46%", flexGrow: 1 }} />)}
        </View>
      </IslHero>

      <Marble>
        {/* Story */}
        <View style={{ paddingHorizontal: 20, paddingTop: 56, paddingBottom: 48 }}>
          <Article text={c.story} numbered={false} />
        </View>

        {/* The founder: Nami Shams, his book and Mishary Alafasy (owner 22.10.2026) */}
        <FounderAbout />

        {/* Values */}
        <View style={{ paddingHorizontal: 20, paddingBottom: 64 }}>
          <IslH2 size={36} style={{ lineHeight: 40 }}>{c.valuesTitle}</IslH2>
          <View style={{ marginTop: 40, gap: 16 }}>
            {c.values.map((v, i) => (
              <IslCard key={v.t} style={{ padding: 24 }}>
                <IslamNum n={i + 1} size={44} fontSize={15} />
                <Text style={{ marginTop: 12, fontFamily: FONT.bold, fontSize: 18, lineHeight: 26, color: isl.ink }}>{v.t}</Text>
                <Text style={{ marginTop: 8, fontFamily: FONT.regular, fontSize: 15, lineHeight: 24.4, color: isl.muted }}>{v.d}</Text>
              </IslCard>
            ))}
          </View>
          <IslCard style={{ marginTop: 48, paddingHorizontal: 24, paddingVertical: 36 }}>
            <Corners />
            <IslH2 size={30} style={{ lineHeight: 36 }}>{c.freeTitle}</IslH2>
            <Markdown text={c.free} />
            {/* the website stays free; the app has Pro */}
            <Text style={{ marginTop: 16, fontFamily: FONT.regular, fontSize: 15, lineHeight: 24.4, color: isl.muted }}>{t("appNote")}</Text>
          </IslCard>
        </View>
      </Marble>

      {/* Dubai and the Quran */}
      <StageBackground>
        <Svg style={{ position: "absolute", top: 0, left: 0, right: 0, height: 600 }} pointerEvents="none">
          <Defs><RadialGradient id="dubaiglow" cx="90%" cy="30%" r="40%"><Stop offset="0" stopColor={stage.gold} stopOpacity={0.06} /><Stop offset="1" stopColor={stage.gold} stopOpacity={0} /></RadialGradient></Defs>
          <Rect width="100%" height="100%" fill="url(#dubaiglow)" />
        </Svg>
        <Rain fall={700} opacity={0.6} />
        <View style={{ paddingHorizontal: 20, paddingVertical: 64 }}>
          <View style={{ marginBottom: 32, opacity: 0.8 }}><Mosque width={192} color={STAGE_GOLD} /></View>
          <HeroKicker>{c.dubaiEyebrow}</HeroKicker>
          <HeroTitle size={36} style={{ lineHeight: 39 }}>{c.dubaiTitle}</HeroTitle>
          <Text style={{ marginTop: 24, fontFamily: FONT.regular, fontSize: 18, lineHeight: 29, color: "rgba(255,255,255,0.7)" }}>{c.dubaiLead}</Text>
          <View style={{ marginTop: 32 }}><Markdown text={c.dubai} dark /></View>
          <View style={{ marginTop: 40, gap: 12 }}>
            {c.dubaiMoments.map((m) => (
              <StageCard key={m.t}>
                <Text style={{ fontFamily: FONT.display, fontSize: 24, lineHeight: 30, color: stage.gold }}>{m.t}</Text>
                <Text style={{ marginTop: 8, fontFamily: FONT.regular, fontSize: 15, lineHeight: 24.4, color: "rgba(255,255,255,0.7)" }}>{m.d}</Text>
              </StageCard>
            ))}
          </View>
        </View>
      </StageBackground>

      <Marble veins={false}>
        {/* Thanks */}
        <View style={{ paddingHorizontal: 20, paddingVertical: 64 }}>
          <Eyebrow>{c.thanksEyebrow}</Eyebrow>
          <IslH2 size={36} style={{ marginTop: 8, lineHeight: 42 }}>{c.thanksTitle}</IslH2>
          <Markdown text={c.thanks} />
        </View>

        {/* Honour: rulers and custodians of the holy places */}
        {c.honour ? (
          <View style={{ paddingHorizontal: 20, paddingBottom: 64 }}>
            <IslCard style={{ padding: 24 }}>
              <Corners />
              <Eyebrow>{c.honour.eyebrow}</Eyebrow>
              <IslH2 size={30} style={{ marginTop: 8, lineHeight: 36 }}>{c.honour.title}</IslH2>
              <Markdown text={c.honour.body} />
              <View style={{ marginTop: 32, gap: 12 }}>
                {c.honour.cities.map((ct) => (
                  <ArchPanel key={ct.name} fill="stage" style={{ padding: 20, paddingTop: 40, alignItems: "center" }}>
                    {ct.ar ? <Text style={{ fontFamily: ARABIC_FONT, fontSize: 24, lineHeight: 40, color: stage.gold, writingDirection: "rtl", textAlign: "center" }}>{ct.ar}</Text> : null}
                    <Text style={{ marginTop: 4, fontFamily: FONT.bold, fontSize: 16, color: "#eef0f3", textAlign: "center" }}>{ct.name}</Text>
                    <Text style={{ marginTop: 4, fontFamily: FONT.regular, fontSize: 14, lineHeight: 20, color: "rgba(255,255,255,0.7)", textAlign: "center" }}>{ct.d}</Text>
                  </ArchPanel>
                ))}
              </View>
            </IslCard>
          </View>
        ) : null}

        {/* Letter */}
        <View style={{ paddingHorizontal: 20, paddingBottom: 64 }}>
          <IslCard style={{ paddingHorizontal: 24, paddingBottom: 32, paddingTop: 40 }}>
            <Corners />
            <IslH2 size={30} style={{ lineHeight: 36 }}>{c.letterTitle}</IslH2>
            <Markdown text={c.letter} family={SERIF} style={{ marginTop: 8 }} />
            <View style={{ marginTop: 32, paddingTop: 20, borderTopWidth: 1, borderTopColor: isl.a("goldSoft", 0.3) }}>
              <Text style={{ fontFamily: SERIF_ITALIC, fontStyle: "italic", fontSize: 26, lineHeight: 34, color: isl.head }}>{c.signature}</Text>
              <Text style={{ fontFamily: FONT.regular, fontSize: 14, color: isl.muted }}>{c.signatureRole}</Text>
            </View>
          </IslCard>
          <IslH2 size={30} style={{ marginTop: 56 }}>{c.contactTitle}</IslH2>
          <Markdown text={c.contact} />
          <Text style={{ marginTop: 16, fontFamily: FONT.regular, fontSize: 15, lineHeight: 24.4, color: isl.muted }}>
            {tc("operatedBy", { place: tc("place") })}{" "}
            <Text onPress={() => openHref("/legal/imprint")} accessibilityRole="link" style={{ fontFamily: FONT.semibold, color: isl.accent }}>{tl("imprintTitle")}</Text>
          </Text>
          <View style={{ marginTop: 32, flexDirection: "row", flexWrap: "wrap", gap: 12 }}>
            <GoldPill small title={t("ctaShams")} onPress={() => openHref("/shams")} />
            <OutlinePill title={t("ctaFeedback")} onPress={() => openHref("/feedback")} />
          </View>
        </View>
      </Marble>
      <MoreTiles keys={["how", "shams", "courses", "islam"]} />
    </IslScreen>
  );
}
