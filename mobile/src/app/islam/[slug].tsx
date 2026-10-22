import { useRef } from "react";
import { Text, View } from "react-native";
import { Redirect, router, useLocalSearchParams, type Href } from "expo-router";
import Svg, { Path } from "react-native-svg";
import { BACK, FONT, stage } from "@/lib/theme";
import { useLang } from "@/i18n";
import { ISLAM, islamDoc, readingMinutes, tradUi } from "@/web/islam";
import { FactCartouche, HeroLead, HeroTitle, IslBreak, IslH2, IslHero, IslamNum, Marble, Rosette, StageBackPill, Rain, StageBackground, useSaw } from "@/features/library/art";
import { Article, mdHeadings } from "@/features/library/markdown";
import { Doorway, FaqItem, GoldPill, MoreTiles } from "@/features/library/ui";
import { IslScreen } from "@/features/library/screen";
import { ReadingBar, useReader } from "@/features/library/reader";
import { STAGE_GOLD, stageGold, useIsl } from "@/features/library/palette";
import { useChapters, useIslamUi } from "@/features/library/content";
import { openHref } from "@/features/library/links";

// /islam/[slug] – one chapter, set like an illuminated book: hero with the key facts, the article with numbered
// sections, questions, sources as a colophon and a domed doorway to the next chapter
// (website: src/app/[locale]/(app)/islam/[slug]/page.tsx with IslamReader for the reading bar)
export default function IslamChapter() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const d = islamDoc(String(slug));
  if (!d) return <Redirect href={"/islam" as Href} />;
  return <Chapter key={d.slug} slug={d.slug} />;
}

function Chapter({ slug }: { slug: string }) {
  const { lang } = useLang();
  const u = useIslamUi();
  const isl = useIsl();
  const sw = useSaw();
  const d = islamDoc(slug)!;
  const all = useChapters();
  const i = ISLAM.indexOf(d);
  const c = all[i];
  const prev = ISLAM[i - 1], next = ISLAM[i + 1];
  const toc = mdHeadings(c.body);
  const reader = useReader(toc.length);
  const marbleY = useRef(0);
  const inner = useRef({ y: 0, h: 0 });
  const place = () => reader.model.setArticle(marbleY.current + inner.current.y, inner.current.h);
  if (!u) return <IslScreen><View /></IslScreen>;
  const door = next
    ? { go: () => router.replace(`/islam/${next.slug}` as Href), label: u.next, ar: next.arabic, title: all[i + 1].title, lead: all[i + 1].lead, meta: `${u.chapter} ${i + 2} · ${readingMinutes(all[i + 1].body)} ${u.min}` }
    : { go: () => router.dismissTo("/islam" as Href), label: u.back, ar: "الإسلام", title: u.title, lead: u.lead, meta: `${ISLAM.length} · ${u.chapters}` };

  return (
    <IslScreen onScrollY={reader.model.onScrollY} overlay={<ReadingBar reader={reader} sections={toc} title={c.title} />}>
      <IslHero callig={d.arabic} dome fall={520} back={false} paddingTop={12} paddingBottom={80}>
        <StageBackPill label={u.back} onPress={() => router.dismissTo("/islam" as Href)} />
        <View style={{ marginTop: 28, flexDirection: "row", flexWrap: "wrap", alignItems: "center", columnGap: 12, rowGap: 4 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <IslamNum n={i + 1} size={32} fontSize={11} color={STAGE_GOLD} paper={stage.bg} />
            <Text style={{ fontFamily: FONT.semibold, fontSize: 12, letterSpacing: 2.4, textTransform: "uppercase", color: stage.gold }}>{u.chapter} {i + 1}</Text>
          </View>
          <View style={{ height: 1, width: 24, backgroundColor: stageGold(0.5) }} />
          <Text style={{ fontFamily: FONT.semibold, fontSize: 12, letterSpacing: 2.4, textTransform: "uppercase", color: stage.gold }}>{c.kicker}</Text>
        </View>
        <HeroTitle size={40} style={{ marginTop: 16, lineHeight: 42 }}>{sw(c.title)}</HeroTitle>
        <HeroLead style={{ fontSize: 18, lineHeight: 29, marginTop: 20 }}>{sw(c.lead)}</HeroLead>
        <View style={{ marginTop: 20, flexDirection: "row", alignItems: "center", gap: 8 }}>
          <Svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke={STAGE_GOLD} strokeWidth={1.6} strokeLinecap="round"><Path d="M7 3h10M7 21h10M8 3c0 5 8 6 8 9s-8 4-8 9M16 3c0 5-8 6-8 9" /></Svg>
          <Text style={{ fontFamily: FONT.regular, fontSize: 14, color: "rgba(255,255,255,0.6)" }}>{readingMinutes(c.body)} {u.min}</Text>
        </View>
        <View style={{ marginTop: 40, flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
          {c.facts.map((f) => <FactCartouche key={f.l} n={f.n} l={f.l} style={{ width: "48%", flexGrow: 1 }} />)}
        </View>
      </IslHero>

      <View onLayout={(e) => { marbleY.current = e.nativeEvent.layout.y; place(); }}>
        <Marble>
          <View style={{ paddingHorizontal: 20, paddingTop: 48, paddingBottom: 48 }}>
            <View onLayout={(e) => { inner.current = { y: e.nativeEvent.layout.y, h: e.nativeEvent.layout.height }; place(); }}>
              {d.needs_review ? <Text accessibilityRole="text" style={{ alignSelf: "flex-start", marginBottom: 20, borderRadius: 999, borderWidth: 1, borderColor: isl.a("goldSoft", 0.5), paddingHorizontal: 12, paddingVertical: 5, fontFamily: FONT.semibold, fontSize: 12.5, color: isl.gold }}>{tradUi(lang).review}</Text> : null}
              <Article text={c.body} onHeading={reader.model.setHeading} />
            </View>

            <IslBreak />
            <IslH2 size={30}>{u.faq}</IslH2>
            <View style={{ marginTop: 24, gap: 12 }}>
              {c.faq.map((f) => <FaqItem key={f.q} q={f.q} a={f.a} />)}
            </View>

            {/* colophon: the sources, set like the last page of a manuscript */}
            <View style={{ marginTop: 56, borderRadius: 16, borderWidth: 1, borderColor: isl.a("goldSoft", 0.3), paddingHorizontal: 20, paddingTop: 32, paddingBottom: 24, alignItems: "center" }}>
              <View style={{ position: "absolute", top: -15, left: 0, right: 0, alignItems: "center" }}><Rosette size={30} color={isl.gold} bg={isl.paper} /></View>
              <Text accessibilityRole="header" style={{ fontFamily: FONT.bold, fontSize: 12, letterSpacing: 2.4, textTransform: "uppercase", color: isl.gold }}>{u.sources}</Text>
              <View style={{ marginTop: 16, gap: 6 }}>
                {c.sources.map((s) => <Text key={s} style={{ fontFamily: FONT.regular, fontSize: 14, lineHeight: 22.75, color: isl.a("ink", 0.75), textAlign: "center" }}>{sw(s)}</Text>)}
              </View>
              <Text style={{ marginTop: 20, paddingTop: 16, borderTopWidth: 1, borderTopColor: isl.a("goldSoft", 0.2), alignSelf: "stretch", fontFamily: FONT.regular, fontSize: 13, lineHeight: 21, color: isl.muted, textAlign: "center" }}>{u.note}</Text>
            </View>
          </View>

          {/* the doorway to the next chapter */}
          <View style={{ paddingHorizontal: 20, paddingBottom: 64 }}>
            {prev ? (
              <Text onPress={() => router.replace(`/islam/${prev.slug}` as Href)} accessibilityRole="link" style={{ marginBottom: 20, textAlign: "center", fontFamily: FONT.regular, fontSize: 14, lineHeight: 20, color: isl.muted }}>
                {BACK} {u.prev}: <Text style={{ fontFamily: FONT.semibold, color: isl.a("ink", 0.8) }}>{sw(all[i - 1].title)}</Text>
              </Text>
            ) : null}
            <Doorway label={door.label} ar={door.ar} title={door.title} lead={door.lead} meta={door.meta} onPress={door.go} />
          </View>
        </Marble>
      </View>

      <MoreTiles keys={["assistant", "salah", "arabic", "shams"]} />

      <StageBackground>
        <Rain fall={420} opacity={0.6} />
        <View style={{ paddingHorizontal: 20, paddingVertical: 56, alignItems: "center" }}>
          <Text accessibilityRole="header" style={{ fontFamily: FONT.display, fontSize: 30, lineHeight: 36, letterSpacing: -0.6, color: "#eef0f3", textAlign: "center" }}>{u.ctaTitle}</Text>
          <Text style={{ marginTop: 16, fontFamily: FONT.regular, fontSize: 16, lineHeight: 26, color: "rgba(255,255,255,0.7)", textAlign: "center" }}>{u.ctaBody}</Text>
          <GoldPill title={u.cta} onPress={() => openHref("/surah/1?shams=1")} style={{ marginTop: 28, alignSelf: "center" }} />
        </View>
      </StageBackground>
    </IslScreen>
  );
}
