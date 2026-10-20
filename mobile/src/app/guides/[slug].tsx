import { useRef } from "react";
import { Text, View } from "react-native";
import { Redirect, router, useLocalSearchParams, type Href } from "expo-router";
import { FONT, FWD } from "@/lib/theme";
import { useLang } from "@/i18n";
import { useWebT } from "@/i18n/web";
import { GUIDES } from "@/web/guides";
import { HeroLead, HeroTitle, IslBreak, IslCard, IslH2, IslHero, Marble, Rain, StageBackPill, StageBackground, StarMark, useSaw } from "@/features/library/art";
import { Article, mdHeadings } from "@/features/library/markdown";
import { FaqItem, GoldPill } from "@/features/library/ui";
import { IslScreen } from "@/features/library/screen";
import { ReadingBar, useReader } from "@/features/library/reader";
import { STAGE_GOLD, useIsl } from "@/features/library/palette";
import { guideOf, longDate } from "@/features/library/content";
import { openHref } from "@/features/library/links";
import { stage } from "@/lib/theme";

// /guides/[slug] – one guide with reading bar, questions and related guides
// (website: src/app/[locale]/(app)/guides/[slug]/page.tsx)
export default function GuideScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const g = GUIDES.find((x) => x.slug === String(slug));
  if (!g) return <Redirect href={"/guides" as Href} />;
  return <Guide key={g.slug} slug={g.slug} />;
}

function Guide({ slug }: { slug: string }) {
  const { lang } = useLang();
  const t = useWebT("guides");
  const isl = useIsl();
  const sw = useSaw();
  const g = GUIDES.find((x) => x.slug === slug)!;
  const gt = guideOf(g, lang);
  const toc = mdHeadings(gt.body);
  const reader = useReader(toc.length);
  const marbleY = useRef(0);
  const inner = useRef({ y: 0, h: 0 });
  const place = () => reader.model.setArticle(marbleY.current + inner.current.y, inner.current.h);
  const related = g.related.map((r) => GUIDES.find((x) => x.slug === r)).filter((x) => !!x);
  return (
    <IslScreen onScrollY={reader.model.onScrollY} overlay={<ReadingBar reader={reader} sections={toc} title={gt.title} />}>
      <IslHero callig="دليل" fall={420} rainOpacity={0.7} back={false} paddingTop={12} paddingBottom={88}>
        <StageBackPill label={t("title")} onPress={() => router.dismissTo("/guides" as Href)} />
        <HeroTitle size={38} style={{ marginTop: 24, lineHeight: 40.3 }}>{sw(gt.title)}</HeroTitle>
        <HeroLead style={{ marginTop: 20 }}>{sw(gt.desc)}</HeroLead>
        <View style={{ marginTop: 20, flexDirection: "row", alignItems: "center", gap: 8 }}>
          <StarMark size={14} color={STAGE_GOLD} center={stage.bg} />
          <Text style={{ fontFamily: FONT.regular, fontSize: 14, color: "rgba(255,255,255,0.6)" }}>{t("by")} · {longDate(g.date, lang)}</Text>
        </View>
      </IslHero>

      <View onLayout={(e) => { marbleY.current = e.nativeEvent.layout.y; place(); }}>
        <Marble>
          <View style={{ paddingHorizontal: 20, paddingTop: 48, paddingBottom: 64 }}>
            <View onLayout={(e) => { inner.current = { y: e.nativeEvent.layout.y, h: e.nativeEvent.layout.height }; place(); }}>
              <Article text={gt.body} onHeading={reader.model.setHeading} />
            </View>

            <IslBreak />
            <IslH2 size={30}>{t("faq")}</IslH2>
            <View style={{ marginTop: 24, gap: 12 }}>
              {gt.faq.map((f, i) => <FaqItem key={i} q={f.q} a={f.a} />)}
            </View>

            {related.length ? (
              <View style={{ marginTop: 48 }}>
                <Text accessibilityRole="header" style={{ fontFamily: FONT.bold, fontSize: 12, letterSpacing: 2.4, textTransform: "uppercase", color: isl.gold }}>{t("related")}</Text>
                <View style={{ marginTop: 16, gap: 8 }}>
                  {related.map((r) => (
                    <IslCard key={r!.slug} onPress={() => router.replace(`/guides/${r!.slug}` as Href)} accessibilityLabel={guideOf(r!, lang).title}>
                      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12, paddingHorizontal: 16, paddingVertical: 12 }}>
                        <Text style={{ flex: 1, fontFamily: FONT.semibold, fontSize: 15, lineHeight: 21, color: isl.ink }}>{sw(guideOf(r!, lang).title)}</Text>
                        <Text style={{ fontFamily: FONT.semibold, fontSize: 16, color: isl.gold }}>{FWD}</Text>
                      </View>
                    </IslCard>
                  ))}
                </View>
              </View>
            ) : null}
          </View>
        </Marble>
      </View>

      <StageBackground>
        <Rain fall={360} opacity={0.6} />
        <View style={{ paddingHorizontal: 20, paddingVertical: 56, alignItems: "center" }}>
          <Text accessibilityRole="header" style={{ fontFamily: FONT.display, fontSize: 24, lineHeight: 32, letterSpacing: -0.5, color: "#eef0f3", textAlign: "center" }}>{t("ctaTitle")}</Text>
          <GoldPill title={t("cta")} onPress={() => openHref("/academy")} style={{ marginTop: 24, alignSelf: "center" }} />
        </View>
      </StageBackground>
    </IslScreen>
  );
}
