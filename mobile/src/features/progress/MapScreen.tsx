import { useEffect, useState } from "react";
import { Pressable, Text, View } from "react-native";
import { Stage } from "@/components/brand";
import { Loading, Page, PageHero } from "@/components/page";
import { FONT, R, stage, useTheme } from "@/lib/theme";
import { useLang } from "@/i18n";
import { mapContent, type MapContent } from "@/web/mapContent";
import { LESSONS as ARABIC_LESSONS } from "@/web/arabic";
import { RED, alpha } from "./art";
import { JourneyLevelStrip, LearningJourney } from "./LearningJourney";
import { MapView } from "./MapView";
import { Markdown } from "./Markdown";
import { go } from "./links";
import { GoldPill, Grid, H2, HairStat, OutlinePill, StageBox, useCols } from "./ui";

/** /map – the Quran map page of the website (map/page.tsx): hero with the map, learning journey, colours, FAQ */
export function MapScreen() {
  const t = useTheme();
  const { lang } = useLang();
  const [c, setC] = useState<MapContent | null>(null);
  const [faq, setFaq] = useState<number | null>(null);
  const colorCols = useCols(1, 2, 4);
  const twoCols = useCols(1, 2, 2);
  useEffect(() => { let off = false; mapContent(lang).then((x) => { if (!off) setC(x); }); return () => { off = true; }; }, [lang]);
  if (!c) return <Loading />;
  const DOT: Record<string, string> = { strong: t.accent, mid: alpha(t.gold, 0.7), weak: alpha(RED, 0.8), none: t.line };
  const sec = { paddingHorizontal: 20, paddingVertical: 64 };
  const h2Big = 36;

  return (
    <Page>
      {/* hero + the map itself */}
      <PageHero back topInset eyebrow={c.kicker} title={c.title} lead={c.lead}>
        <View style={{ flexDirection: "row", gap: 16, marginTop: 8 }}>
          {c.stats.map((s) => <View key={s.l} style={{ flex: 1 }}><HairStat value={s.n} label={s.l} size={26} /></View>)}
        </View>
        <View style={{ marginTop: 28, borderRadius: R.md, borderWidth: 1, borderColor: "rgba(255,255,255,0.1)", backgroundColor: "rgba(255,255,255,0.03)", padding: 16 }}>
          <MapView />
        </View>
        <JourneyLevelStrip arabicTotal={ARABIC_LESSONS.length} />
        <View style={{ height: 24 }} />
      </PageHero>

      {/* learning journey: every learning area as a station, with real progress and the next step */}
      <View style={{ backgroundColor: t.surface, borderBottomWidth: 1, borderBottomColor: t.line, ...sec }}>
        <LearningJourney />
      </View>

      {/* colours */}
      <View style={sec}>
        <H2 size={h2Big}>{c.readTitle}</H2>
        <Text style={{ fontFamily: FONT.regular, fontSize: 17, lineHeight: 27, color: t.muted, marginTop: 20 }}>{c.readLead}</Text>
        <Grid cols={colorCols} gap={16} style={{ marginTop: 40 }}>
          {c.colors.map((col) => (
            <View key={col.key} style={{ flex: 1, borderRadius: R.md, borderWidth: 1, borderColor: t.line, backgroundColor: t.surface, padding: 20 }}>
              <View style={{ flexDirection: "row", gap: 4 }}>{[0, 1, 2, 3, 4].map((i) => <View key={i} style={{ width: 20, height: 20, borderRadius: 3, backgroundColor: DOT[col.key] }} />)}</View>
              <Text style={{ fontFamily: FONT.bold, fontSize: 18, color: t.ink, marginTop: 16 }}>{col.t}</Text>
              <Text style={{ fontFamily: FONT.regular, fontSize: 15, lineHeight: 24, color: t.muted, marginTop: 8 }}>{col.d}</Text>
              <Text style={{ fontFamily: FONT.semibold, fontSize: 14, lineHeight: 22, color: t.ink, marginTop: 16, paddingTop: 12, borderTopWidth: 1, borderTopColor: t.line }}>{col.todo}</Text>
            </View>
          ))}
        </Grid>
      </View>

      {/* how it works */}
      <Stage hairlines={false} pattern={false}>
        <View style={[sec, { gap: 40 }]}>
          <View>
            <H2 onStage size={h2Big}>{c.howTitle}</H2>
            <View style={{ gap: 12, marginTop: 32 }}>
              {c.views.map((v, i) => (
                <StageBox key={v.t} style={{ backgroundColor: "rgba(255,255,255,0.03)", borderRadius: R.sm }}>
                  <Text style={{ fontFamily: FONT.bold, fontSize: 11, letterSpacing: 2, textTransform: "uppercase", color: stage.gold }}>0{i + 1} · {v.t}</Text>
                  <Text style={{ fontFamily: FONT.regular, fontSize: 15, lineHeight: 24, color: "rgba(255,255,255,0.7)", marginTop: 4 }}>{v.d}</Text>
                </StageBox>
              ))}
            </View>
          </View>
          <Markdown text={c.howBody} dark />
        </View>
      </Stage>

      {/* use */}
      <View style={sec}>
        <H2 size={h2Big}>{c.useTitle}</H2>
        <View style={{ marginTop: 40, borderRadius: R.md, borderWidth: 1, borderColor: t.line, backgroundColor: t.line, overflow: "hidden" }}>
          <Grid cols={twoCols} gap={1}>
            {c.uses.map((u, i) => (
              <View key={u.t} style={{ flex: 1, backgroundColor: t.surface, padding: 24 }}>
                <Text style={{ fontFamily: FONT.display, fontSize: 30, color: t.gold }}>0{i + 1}</Text>
                <Text style={{ fontFamily: FONT.bold, fontSize: 18, color: t.ink, marginTop: 8 }}>{u.t}</Text>
                <Text style={{ fontFamily: FONT.regular, fontSize: 15, lineHeight: 24, color: t.muted, marginTop: 8 }}>{u.d}</Text>
              </View>
            ))}
          </Grid>
        </View>
      </View>

      {/* FAQ */}
      <View style={{ paddingHorizontal: 20, paddingBottom: 64 }}>
        <H2 size={h2Big}>{c.faqTitle}</H2>
        <View style={{ marginTop: 32, borderTopWidth: 1, borderBottomWidth: 1, borderColor: t.line }}>
          {c.faq.map((f, i) => {
            const open = faq === i;
            return (
              <View key={f.q} style={{ paddingVertical: 16, borderTopWidth: i ? 1 : 0, borderTopColor: t.line }}>
                <Pressable onPress={() => setFaq(open ? null : i)} accessibilityRole="button" accessibilityState={{ expanded: open }} style={{ flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", gap: 16 }}>
                  <Text style={{ flex: 1, fontFamily: FONT.bold, fontSize: 17, lineHeight: 24, color: t.ink }}>{f.q}</Text>
                  <Text style={{ fontFamily: FONT.regular, fontSize: 20, lineHeight: 24, color: t.muted, transform: [{ rotate: open ? "45deg" : "0deg" }] }}>+</Text>
                </Pressable>
                {open ? <Text style={{ fontFamily: FONT.regular, fontSize: 15, lineHeight: 24, color: t.muted, marginTop: 12 }}>{f.a}</Text> : null}
              </View>
            );
          })}
        </View>
      </View>

      {/* final call */}
      <Stage hairlines={false} pattern={false}>
        <View style={[sec, { alignItems: "center" }]}>
          <H2 onStage size={h2Big} style={{ textAlign: "center" }}>{c.finalTitle}</H2>
          <Text style={{ fontFamily: FONT.regular, fontSize: 17, lineHeight: 27, color: "rgba(255,255,255,0.7)", marginTop: 20, textAlign: "center" }}>{c.finalLead}</Text>
          <View style={{ flexDirection: "row", flexWrap: "wrap", justifyContent: "center", gap: 12, marginTop: 32 }}>
            <GoldPill pill={false} arrow={false} title={c.ctaStart} onPress={() => go("/surah/1?shams=1")} style={{ minHeight: 48 }} />
            <OutlinePill onStage title={c.ctaToday} onPress={() => go("/today")} style={{ minHeight: 48, borderColor: "rgba(255,255,255,0.3)", paddingHorizontal: 24 }} />
          </View>
        </View>
      </Stage>
    </Page>
  );
}

export default MapScreen;
