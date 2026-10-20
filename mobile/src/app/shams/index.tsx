import { Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { router, type Href } from "expo-router";
import Svg, { Defs, RadialGradient, Rect, Stop } from "react-native-svg";
import { ARABIC_BOLD, ARABIC_FONT, FONT, stage, useTheme } from "@/lib/theme";
import { useLang } from "@/i18n";
import { useWebT } from "@/i18n/web";
import { shamsContent } from "@/web/shamsContent";
import { GUIDES } from "@/web/guides";
import { Corners, FactCartouche, HeroKicker, IllumFrame, IslBreak, IslCard, IslH2, IslHero, IslamNum, Marble, Rain, RefChip, StageBackground, StarMark } from "@/features/library/art";
import { Article, FramedQuote } from "@/features/library/markdown";
import { FaqItem, GoldPill, MoreTiles, OutlinePill, StageCard, StageDetails } from "@/features/library/ui";
import { IslScreen } from "@/features/library/screen";
import { SERIF, STAGE_GOLD, STAGE_TEXT, stageGold, useIsl } from "@/features/library/palette";
import { guideOf } from "@/features/library/content";
import { openHref } from "@/features/library/links";
import { Curve, DayIcon, Ladder, PrincipleIcon, ShamsDemo, ShamsPlanner, StepIcon, Sun } from "@/features/library/shamsArt";
import { CUES, W } from "@/features/library/content/shams";

// /shams – the Shams Method: hero with the sun over the arcade, why "Shams", problems and solution, the seven steps as
// a journey towards the sun, one verse in four stages, roots in the hifz tradition, why it works, the forgetting curve,
// spacing and fluency, adaptation, a learning day with the planner, comparison, teaching plan, why it matters, the
// in-depth guide, questions and the final call (website: src/app/[locale]/(app)/shams/page.tsx)
const minutesOf = (s: string) => { const m = s.match(/\d+/); return m ? Number(m[0]) : 1; };
const startShams = () => router.push("/shams/1" as Href);

function H2({ children, center, onStage }: { children: string; center?: boolean; onStage?: boolean }) {
  const isl = useIsl();
  return <Text accessibilityRole="header" style={{ fontFamily: FONT.display, fontSize: 36, lineHeight: 39.6, letterSpacing: -0.8, color: onStage ? STAGE_TEXT : isl.ink, textAlign: center ? "center" : "left" }}>{children}</Text>;
}
function Lead({ children, onStage, center }: { children: string; onStage?: boolean; center?: boolean }) {
  const isl = useIsl();
  return <Text style={{ marginTop: 20, fontFamily: FONT.regular, fontSize: 17, lineHeight: 27.6, color: onStage ? "rgba(255,255,255,0.7)" : isl.a("ink", 0.75), textAlign: center ? "center" : "left" }}>{children}</Text>;
}

export default function ShamsPage() {
  const { lang } = useLang();
  const t = useWebT("shams");
  const isl = useIsl();
  const theme = useTheme();
  const c = shamsContent(lang);
  const guide = GUIDES.find((g) => g.slug === "shams-method");
  const total = c.teachPlan.reduce((a, s) => a + minutesOf(s.min), 0);
  const kicker = { fontFamily: FONT.semibold, fontSize: 12, letterSpacing: 2.6, textTransform: "uppercase" as const, color: stage.gold };
  const body = { fontFamily: FONT.regular, fontSize: 15, lineHeight: 24.4, color: isl.muted };

  return (
    <IslScreen>
      {/* Hero: the sun rises over an arcade */}
      <IslHero fall={620} paddingBottom={80}>
        <View style={{ alignItems: "center", marginBottom: -16 }}><Sun size={230} /></View>
        <HeroKicker>{c.heroKicker}</HeroKicker>
        <Text accessibilityRole="header" style={{ marginTop: 16, fontFamily: FONT.display, fontSize: 44, lineHeight: 44.9, letterSpacing: -1, color: STAGE_TEXT }}>{c.heroTitle}</Text>
        <Text style={{ marginTop: 24, fontFamily: FONT.regular, fontSize: 17, lineHeight: 27.6, color: "rgba(255,255,255,0.75)" }}>{c.heroLead}</Text>
        <View style={{ marginTop: 20, flexDirection: "row", alignItems: "center", gap: 8 }}>
          <StarMark size={14} color={STAGE_GOLD} center={stage.bg} />
          <Text style={{ fontFamily: FONT.semibold, fontSize: 14, color: "rgba(255,255,255,0.9)" }}>{c.heroBy}</Text>
        </View>
        <View style={{ marginTop: 32, flexDirection: "row", flexWrap: "wrap", gap: 12 }}>
          <GoldPill title={t("cta")} onPress={startShams} />
          <OutlinePill title={t("planCta")} onPress={() => openHref("/plan")} onStage style={{ height: 48, paddingHorizontal: 24 }} />
        </View>
        {c.heroFacts ? (
          <View style={{ marginTop: 40, flexDirection: "row", gap: 10 }}>
            {c.heroFacts.map((f) => <FactCartouche key={f.l} n={f.n} l={f.l} nSize={26} style={{ flex: 1 }} />)}
          </View>
        ) : null}
      </IslHero>

      <Marble>
        {/* Why "Shams" */}
        {c.name ? (
          <View style={{ paddingHorizontal: 20, paddingTop: 56 }}>
            <H2>{c.name.title}</H2>
            <Text style={{ marginTop: 20, fontFamily: FONT.regular, fontSize: 17, lineHeight: 27.6, color: isl.a("ink", 0.8) }}>{c.name.body}</Text>
            <View style={{ marginTop: 40, gap: 16 }}>
              {c.name.verses.map((v) => (
                <IslCard key={v.ref} style={{ paddingHorizontal: 20, paddingBottom: 20, paddingTop: 24, alignItems: "center" }}>
                  <Corners />
                  <Text style={{ fontFamily: ARABIC_FONT, fontSize: 26, lineHeight: 49.4, color: isl.head, textAlign: "center", writingDirection: "rtl" }}>{v.ar}</Text>
                  {v.meaning ? <Text style={{ marginTop: 4, fontFamily: FONT.regular, fontSize: 15, lineHeight: 22, color: isl.muted, textAlign: "center" }}>{v.meaning}</Text> : null}
                  <View style={{ marginTop: 12 }}><RefChip label={v.ref} /></View>
                </IslCard>
              ))}
            </View>
          </View>
        ) : null}

        {/* Problem and solution */}
        <View style={{ paddingHorizontal: 20, paddingVertical: 64 }}>
          <H2>{c.problemTitle}</H2>
          <View style={{ marginTop: 40, gap: 16 }}>
            {c.problems.map((p, i) => (
              <IslCard key={i} style={{ padding: 24 }}>
                <IslamNum n={i + 1} size={44} fontSize={15} />
                <Text style={{ marginTop: 16, fontFamily: FONT.bold, fontSize: 18, lineHeight: 24, color: isl.ink }}>{p.t}</Text>
                <Text style={{ ...body, marginTop: 8 }}>{p.d}</Text>
              </IslCard>
            ))}
          </View>
          <StageBackground rounded={16} style={{ marginTop: 48 }}>
            <IllumFrame opacity={1} />
            <View style={{ position: "absolute", top: 0, bottom: 0, left: 0, right: 0, alignItems: "center", justifyContent: "center", opacity: 0.25 }}>
              <Sun size={520} word="" />
            </View>
            <View style={{ paddingHorizontal: 24, paddingVertical: 36, alignItems: "center" }}>
              <Text style={kicker}>{c.solutionTitle}</Text>
              <Text style={{ marginTop: 16, fontFamily: SERIF, fontSize: 22, lineHeight: 30, color: "#f3ead6", textAlign: "center" }}>{c.solution}</Text>
            </View>
          </StageBackground>
        </View>
      </Marble>

      {/* Seven steps: a journey towards the sun */}
      <StageBackground>
        <View style={{ paddingHorizontal: 20, paddingVertical: 64 }}>
          <H2 center onStage>{c.stepsTitle}</H2>
          <Lead onStage center>{c.stepsLead}</Lead>
          <View style={{ marginTop: 56, gap: 22 }}>
            <View pointerEvents="none" style={{ position: "absolute", top: 28, bottom: 28, left: 27, width: 2, borderRadius: 2, backgroundColor: stageGold(0.14) }} />
            <LinearGradient pointerEvents="none" colors={[stageGold(0.35), STAGE_GOLD, "rgb(255,236,190)"]} locations={[0, 0.7, 1]}
              style={{ position: "absolute", top: 28, bottom: 28, left: 27, width: 2, borderRadius: 2, shadowColor: STAGE_GOLD, shadowOpacity: 0.45, shadowRadius: 6 }} />
            {c.steps.map((s, i) => (
              <View key={i} style={{ flexDirection: "row", gap: 14, alignItems: "flex-start" }}>
                <View style={{ width: 56, height: 56, alignItems: "center", justifyContent: "center" }}>
                  <Svg width={76} height={76} style={{ position: "absolute", left: -10, top: -10 }} pointerEvents="none">
                    <Defs><RadialGradient id={`node${i}`} cx="50%" cy="50%" r="50%"><Stop offset="0" stopColor="rgb(255,228,160)" stopOpacity={0.18 + i * 0.07} /><Stop offset="0.65" stopColor="rgb(255,228,160)" stopOpacity={0} /></RadialGradient></Defs>
                    <Rect width={76} height={76} fill={`url(#node${i})`} />
                  </Svg>
                  <IslamNum n={i + 1} size={56} fontSize={17} color={STAGE_GOLD} solid={stage.bg} />
                </View>
                <StageCard style={{ flex: 1, minWidth: 0 }}>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
                    <View style={{ width: 52, height: 52, borderRadius: 26, alignItems: "center", justifyContent: "center", backgroundColor: stageGold(0.08), borderWidth: 1, borderColor: stageGold(0.35) }}>
                      <StepIcon n={i + 1} size={38} color={STAGE_GOLD} />
                    </View>
                    <View style={{ flex: 1, minWidth: 0 }}>
                      <Text style={{ fontFamily: FONT.display, fontSize: 21, lineHeight: 25, color: STAGE_TEXT }}>{t(`s${i + 1}`)}</Text>
                      <Text style={{ marginTop: 4, fontFamily: FONT.semibold, fontSize: 12, color: "rgba(255,255,255,0.55)" }}>{c.labels.time}: {s.time}</Text>
                    </View>
                  </View>
                  {c.stepTags?.[i] ? (
                    <View style={{ marginTop: 16, alignSelf: "flex-start", flexDirection: "row", alignItems: "center", gap: 6, borderRadius: 999, borderWidth: 1, borderColor: stageGold(0.35), backgroundColor: stageGold(0.1), paddingHorizontal: 10, paddingVertical: 4 }}>
                      <StarMark size={12} color={STAGE_GOLD} center={stage.bg} />
                      <Text style={{ fontFamily: FONT.semibold, fontSize: 11.5, color: STAGE_GOLD }}>{c.stepTags[i]}</Text>
                    </View>
                  ) : null}
                  <Text style={{ marginTop: 12, fontFamily: FONT.regular, fontSize: 15.5, lineHeight: 25, color: "rgba(255,255,255,0.85)" }}>{s.what}</Text>
                  <StageDetails label={c.labels.why}>
                    <Text style={{ marginTop: 12, fontFamily: FONT.regular, fontSize: 14.5, lineHeight: 23.5, color: "rgba(255,255,255,0.75)" }}>{s.why}</Text>
                    <Text style={{ marginTop: 12, fontFamily: FONT.semibold, fontSize: 12, letterSpacing: 1.44, textTransform: "uppercase", color: "rgba(255,255,255,0.45)" }}>{c.labels.platform}</Text>
                    <Text style={{ marginTop: 4, fontFamily: FONT.regular, fontSize: 14.5, lineHeight: 23.5, color: "rgba(255,255,255,0.75)" }}>{s.platform}</Text>
                  </StageDetails>
                </StageCard>
              </View>
            ))}
            <View style={{ width: 56, height: 56, marginTop: -6 }}><Sun size={56} word="" /></View>
          </View>
        </View>
      </StageBackground>

      <Marble>
        {/* One verse, four stages */}
        <View style={{ paddingHorizontal: 20, paddingVertical: 64 }}>
          <H2>{c.demoTitle}</H2>
          <Lead>{t("d6")}</Lead>
          <GoldPill title={t("cta")} onPress={startShams} style={{ marginTop: 28 }} />
          <View style={{ marginTop: 40 }}><ShamsDemo words={W} cues={CUES} stages={c.demoStages} title={c.demoTitle} /></View>
        </View>

        {/* Roots in the hifz tradition */}
        {c.heritage ? (
          <View style={{ paddingHorizontal: 20, paddingBottom: 64 }}>
            <H2>{c.heritage.title}</H2>
            <Lead>{c.heritage.lead}</Lead>
            <View style={{ marginTop: 40, gap: 16 }}>
              {c.heritage.items.map((h) => (
                <IslCard key={h.t}>
                  <View style={{ height: 128, alignItems: "center", justifyContent: "center", backgroundColor: stage.bg, borderTopLeftRadius: 13, borderTopRightRadius: 13 }}>
                    <View pointerEvents="none" style={{ position: "absolute", top: 10, left: 10, right: 10, bottom: 10, borderTopLeftRadius: 120, borderTopRightRadius: 120, borderBottomLeftRadius: 10, borderBottomRightRadius: 10, borderWidth: 1, borderColor: stageGold(0.16) }} />
                    <Text style={{ paddingHorizontal: 12, fontFamily: ARABIC_BOLD, fontSize: 28, lineHeight: 45, color: STAGE_GOLD, textAlign: "center", writingDirection: "rtl" }}>{h.ar}</Text>
                  </View>
                  <View style={{ padding: 20 }}>
                    <Text style={{ fontFamily: FONT.bold, fontSize: 17, lineHeight: 23, color: isl.ink }}>{h.t}</Text>
                    <Text style={{ ...body, fontSize: 14.5, lineHeight: 23.5, marginTop: 8 }}>{h.d}</Text>
                  </View>
                </IslCard>
              ))}
            </View>
          </View>
        ) : null}

        {/* Why it works: the learning principles */}
        <View style={{ paddingHorizontal: 20, paddingBottom: 64 }}>
          <H2>{t("why")}</H2>
          {c.principlesLead ? <Lead>{c.principlesLead}</Lead> : null}
          <View style={{ marginTop: 40, gap: 16 }}>
            {[9, 10, 2, 8, 1, 3, 4, 5, 6, 7].map((n) => (
              <IslCard key={n} style={{ flexDirection: "row", gap: 16, padding: 20 }}>
                <View style={{ width: 56, height: 56, borderRadius: 28, alignItems: "center", justifyContent: "center", backgroundColor: isl.a("goldSoft", 0.12), borderWidth: 1, borderColor: isl.a("goldSoft", 0.4) }}>
                  <PrincipleIcon n={n} color={isl.gold} />
                </View>
                <View style={{ flex: 1, minWidth: 0 }}>
                  <Text style={{ fontFamily: FONT.bold, fontSize: 16.5, lineHeight: 22, color: isl.ink }}>{t(`p${n}t`)}</Text>
                  <Text style={{ ...body, fontSize: 14.5, lineHeight: 23.5, marginTop: 6 }}>{t(`p${n}d`)}</Text>
                </View>
              </IslCard>
            ))}
          </View>
        </View>

        {/* Forgetting curve */}
        <View style={{ paddingHorizontal: 20, paddingBottom: 64 }}>
          <H2>{c.curveTitle}</H2>
          <Lead>{c.curveLead}</Lead>
          <IslCard style={{ marginTop: 40, padding: 16 }}>
            <Curve c={c} />
            <Text style={{ marginTop: 8, fontFamily: FONT.regular, fontSize: 12, lineHeight: 18, color: isl.muted }}>{c.curveNote}</Text>
          </IslCard>
        </View>
      </Marble>

      {/* Deep dive: spacing, non-stop repetition, 4-3-2, meaning */}
      {c.spacing ? (
        <StageBackground>
          <View style={{ paddingHorizontal: 20, paddingVertical: 64 }}>
            <H2 onStage>{c.spacing.title}</H2>
            <Lead onStage>{c.spacing.lead}</Lead>
            <View style={{ marginTop: 40, gap: 16 }}>
              {c.spacing.points.map((p, i) => (
                <StageCard key={i}>
                  <IslamNum n={i + 1} size={44} fontSize={15} color={STAGE_GOLD} paper={stage.bg} />
                  <Text style={{ marginTop: 12, fontFamily: FONT.bold, fontSize: 18, lineHeight: 24, color: STAGE_TEXT }}>{p.t}</Text>
                  <Text style={{ marginTop: 8, fontFamily: FONT.regular, fontSize: 15, lineHeight: 24.4, color: "rgba(255,255,255,0.75)" }}>{p.d}</Text>
                </StageCard>
              ))}
            </View>
            <View style={{ marginTop: 40, gap: 24 }}>
              <StageCard>
                <Text style={{ fontFamily: FONT.bold, fontSize: 12, letterSpacing: 1.92, textTransform: "uppercase", color: STAGE_GOLD }}>{c.spacing.ladderTitle}</Text>
                <Text style={{ marginTop: 8, fontFamily: FONT.regular, fontSize: 14, lineHeight: 20, color: "rgba(255,255,255,0.7)" }}>{c.spacing.ladderLead}</Text>
                <View style={{ marginTop: 16 }}><Ladder day={c.spacing.ladderDay} /></View>
                <Text style={{ marginTop: 8, fontFamily: FONT.semibold, fontSize: 14, lineHeight: 20, color: "rgba(255,255,255,0.85)" }}>{c.spacing.ladderNote}</Text>
              </StageCard>
              <StageCard>
                <Text style={{ fontFamily: FONT.bold, fontSize: 12, letterSpacing: 1.92, textTransform: "uppercase", color: STAGE_GOLD }}>{c.spacing.fluencyTitle}</Text>
                <Text style={{ marginTop: 8, fontFamily: FONT.regular, fontSize: 14, lineHeight: 20, color: "rgba(255,255,255,0.7)" }}>{c.spacing.fluencyLead}</Text>
                <View style={{ marginTop: 16, gap: 12 }}>
                  {c.spacing.fluencySteps.map((st, i) => (
                    <View key={i}>
                      <Text style={{ fontFamily: FONT.bold, fontSize: 14, color: STAGE_TEXT }}>{st.min}</Text>
                      <LinearGradient colors={["#c9a65e", "#ecd6a2"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={{ marginTop: 6, height: 10, borderRadius: 5, width: `${100 - i * 25}%` }} />
                      <Text style={{ marginTop: 6, fontFamily: FONT.regular, fontSize: 13, lineHeight: 18, color: "rgba(255,255,255,0.7)" }}>{st.d}</Text>
                    </View>
                  ))}
                </View>
                <Text style={{ marginTop: 16, fontFamily: FONT.regular, fontSize: 14, lineHeight: 20, color: "rgba(255,255,255,0.75)" }}>{c.spacing.fluencyNote}</Text>
              </StageCard>
            </View>
            <View style={{ marginTop: 40, gap: 24 }}>
              <View>
                <Text style={{ fontFamily: FONT.display, fontSize: 24, lineHeight: 30, color: STAGE_TEXT }}>{c.spacing.meaningTitle}</Text>
                <Text style={{ marginTop: 12, fontFamily: FONT.regular, fontSize: 16, lineHeight: 26, color: "rgba(255,255,255,0.75)" }}>{c.spacing.meaning}</Text>
              </View>
              <Text style={{ borderRadius: 16, borderWidth: 1, borderColor: stageGold(0.4), backgroundColor: stageGold(0.1), paddingHorizontal: 20, paddingVertical: 16, fontFamily: SERIF, fontWeight: "600", fontSize: 17, lineHeight: 25, color: STAGE_GOLD, overflow: "hidden" }}>{c.spacing.rule}</Text>
            </View>
          </View>
        </StageBackground>
      ) : null}

      <Marble>
        {/* Adaptive */}
        <View style={{ paddingHorizontal: 20, paddingVertical: 64 }}>
          <H2>{c.adaptTitle}</H2>
          <View style={{ marginTop: 40, gap: 16 }}>
            {c.adapt.map((a, i) => (
              <IslCard key={i} style={{ flexDirection: "row", gap: 16, padding: 20 }}>
                <IslamNum n={i + 1} size={40} fontSize={13} />
                <View style={{ flex: 1, minWidth: 0 }}>
                  <Text style={{ fontFamily: FONT.bold, fontSize: 18, lineHeight: 24, color: isl.ink }}>{a.t}</Text>
                  <Text style={{ ...body, marginTop: 8 }}>{a.d}</Text>
                </View>
              </IslCard>
            ))}
          </View>
        </View>

        {/* Daily routine + planner */}
        <View style={{ paddingHorizontal: 20, paddingBottom: 64 }}>
          <H2>{t("dayTitle")}</H2>
          <Lead>{t("dayLead")}</Lead>
          <View style={{ marginTop: 40, gap: 16 }}>
            {[1, 2, 3, 4].map((n) => (
              <IslCard key={n} style={{ padding: 24 }}>
                <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                  <DayIcon n={n} color={isl.gold} />
                  <Text style={{ fontFamily: FONT.display, fontSize: 30, color: isl.gold, opacity: 0.8 }}>{n}</Text>
                </View>
                <Text style={{ marginTop: 16, fontFamily: FONT.bold, fontSize: 16, lineHeight: 22, color: isl.ink }}>{t(`day${n}t`)}</Text>
                <Text style={{ ...body, marginTop: 8 }}>{t(`day${n}d`)}</Text>
              </IslCard>
            ))}
          </View>
          <View style={{ marginTop: 48 }}>
            <IslH2 size={30}>{t("howTitle")}</IslH2>
            <Text style={{ ...body, marginTop: 12 }}>{t("howLead")}</Text>
            <View style={{ marginTop: 16, gap: 8 }}>
              {["how1", "how2", "how3"].map((k) => (
                <View key={k} style={{ flexDirection: "row", gap: 12 }}>
                  <View style={{ width: 9, height: 9, marginTop: 9, backgroundColor: isl.a("goldSoft", 0.2), borderWidth: 1, borderColor: isl.goldSoft, transform: [{ rotate: "45deg" }] }} />
                  <Text style={{ flex: 1, fontFamily: FONT.regular, fontSize: 15, lineHeight: 24.4, color: isl.ink }}>{t(k)}</Text>
                </View>
              ))}
            </View>
            <Text style={{ marginTop: 12, fontFamily: FONT.regular, fontSize: 14, lineHeight: 20, color: isl.muted }}>{t("howNote")}</Text>
            <GoldPill small title={t("planCta")} onPress={() => openHref("/plan")} style={{ marginTop: 24 }} />
          </View>
          <View style={{ marginTop: 32 }}>
            <Text style={{ marginBottom: 12, fontFamily: FONT.bold, fontSize: 18, color: isl.ink }}>{t("planTitle")}</Text>
            <ShamsPlanner lang={lang} />
          </View>
        </View>

        {/* Comparison */}
        <View style={{ paddingHorizontal: 20, paddingBottom: 64 }}>
          <H2>{c.compareTitle}</H2>
          <Lead>{c.compareLead}</Lead>
          <View style={{ marginTop: 32, gap: 12 }}>
            {c.compareRows.map((r) => (
              <IslCard key={r.label} style={{ padding: 16 }}>
                <Text style={{ fontFamily: FONT.bold, fontSize: 16, color: isl.ink }}>{r.label}</Text>
                <View style={{ marginTop: 12, gap: 6 }}>
                  {r.cells.map((x, i) => (
                    <View key={i} style={{ flexDirection: "row", gap: 12, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6, backgroundColor: i === 3 ? isl.a("goldSoft", 0.15) : "transparent" }}>
                      <Text style={{ flex: 0.9, fontFamily: i === 3 ? FONT.semibold : FONT.regular, fontSize: 14, lineHeight: 20, color: i === 3 ? isl.gold : isl.muted }}>{c.compareCols[i]}</Text>
                      <Text style={{ flex: 1.1, fontFamily: i === 3 ? FONT.semibold : FONT.regular, fontSize: 14, lineHeight: 20, color: isl.ink }}>{x}</Text>
                    </View>
                  ))}
                </View>
              </IslCard>
            ))}
          </View>
          <Text style={{ ...body, marginTop: 24 }}>{c.compareNote}</Text>
        </View>
      </Marble>

      {/* Teachers */}
      <StageBackground>
        <View style={{ paddingHorizontal: 20, paddingVertical: 64 }}>
          <H2 onStage>{c.teachTitle}</H2>
          <Lead onStage>{c.teachLead}</Lead>
          <View style={{ marginTop: 40, flexDirection: "row", gap: 3, height: 14, borderRadius: 999, overflow: "hidden" }} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
            {c.teachPlan.map((s, i) => <View key={i} style={{ flex: minutesOf(s.min) / total, backgroundColor: stageGold(0.3 + (i % 2) * 0.35) }} />)}
          </View>
          <View style={{ marginTop: 24, gap: 12 }}>
            {c.teachPlan.map((s, i) => (
              <StageCard key={i}>
                <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
                  <IslamNum n={i + 1} size={36} fontSize={13} color={STAGE_GOLD} paper={stage.bg} />
                  <View style={{ borderRadius: 999, borderWidth: 1, borderColor: stageGold(0.35), paddingHorizontal: 10, paddingVertical: 2 }}>
                    <Text style={{ fontFamily: FONT.semibold, fontSize: 12, color: STAGE_GOLD }}>{s.min}</Text>
                  </View>
                </View>
                <Text style={{ marginTop: 12, fontFamily: FONT.bold, fontSize: 18, lineHeight: 24, color: STAGE_TEXT }}>{s.t}</Text>
                <Text style={{ marginTop: 8, fontFamily: FONT.regular, fontSize: 15, lineHeight: 24.4, color: "rgba(255,255,255,0.7)" }}>{s.d}</Text>
              </StageCard>
            ))}
          </View>
          <Text style={{ marginTop: 24, fontFamily: FONT.regular, fontSize: 15, lineHeight: 24, color: "rgba(255,255,255,0.7)" }}>{c.teachNote}</Text>
        </View>
      </StageBackground>

      <Marble>
        {/* Why learning the Quran matters (hadith and Quran) */}
        <View style={{ paddingHorizontal: 20, paddingVertical: 64 }}>
          <H2 center>{t("whyTitle")}</H2>
          <Lead center>{t("whyLead")}</Lead>
          <View style={{ marginTop: 48, gap: 40 }}>
            {[1, 2, 3, 4, 5].map((n) => <FramedQuote key={n} size={17 / 1.16} cite={t(`why${n}s`)} style={{ marginTop: 0, marginBottom: 0 }}>{t(`why${n}`)}</FramedQuote>)}
          </View>
          <Text style={{ marginTop: 40, fontFamily: SERIF, fontSize: 19, lineHeight: 31, color: isl.a("ink", 0.85), textAlign: "center" }}>{t("whyClose")}</Text>
        </View>

        {/* In-depth article */}
        {guide ? (
          <View style={{ paddingHorizontal: 20, paddingBottom: 64 }}>
            <IslBreak style={{ marginTop: 0 }} />
            <H2>{c.deepTitle}</H2>
            <Text style={{ marginTop: 16, fontFamily: FONT.regular, fontSize: 17, lineHeight: 26, color: isl.muted }}>{c.deepLead}</Text>
            <View style={{ marginTop: 32 }}><Article text={guideOf(guide, lang).body} numbered={false} /></View>
          </View>
        ) : null}

        {/* FAQ */}
        <View style={{ paddingHorizontal: 20, paddingBottom: 64 }}>
          <H2>{t("faqTitle")}</H2>
          <View style={{ marginTop: 32, gap: 12 }}>
            {c.faq.map((f, i) => <FaqItem key={i} q={f.q} a={f.a} />)}
          </View>
          <View style={{ marginTop: 32, borderRadius: 8, borderWidth: 1, borderColor: theme.dark ? "rgba(214,178,106,0.28)" : "rgba(150,116,52,0.28)", backgroundColor: theme.surface, padding: 16, overflow: "hidden" }}>
            <LinearGradient pointerEvents="none" colors={[theme.dark ? "rgba(214,178,106,0.07)" : "rgba(150,116,52,0.07)", "transparent"]} style={{ position: "absolute", top: 0, left: 0, right: 0, height: 80 }} />
            <LinearGradient pointerEvents="none" colors={["transparent", theme.gold, "transparent"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={{ position: "absolute", top: 0, left: 22, right: 22, height: 1 }} />
            <Text style={{ fontFamily: FONT.regular, fontSize: 14, lineHeight: 22.75, color: isl.muted }}>{t("note")}</Text>
          </View>
        </View>
      </Marble>

      {/* Final call: your first verse */}
      <StageBackground>
        <View pointerEvents="none" style={{ position: "absolute", bottom: -200, left: 0, right: 0, alignItems: "center", opacity: 0.7 }}><Sun size={400} word="" /></View>
        <Rain fall={560} opacity={0.6} />
        <View style={{ paddingHorizontal: 20, paddingTop: 64, paddingBottom: 230, alignItems: "center" }}>
          <H2 center onStage>{c.finalTitle}</H2>
          <Text style={{ marginTop: 16, fontFamily: FONT.regular, fontSize: 17, lineHeight: 26, color: "rgba(255,255,255,0.75)", textAlign: "center" }}>{c.finalLead}</Text>
          <View style={{ marginTop: 32, flexDirection: "row", flexWrap: "wrap", justifyContent: "center", columnGap: 6, rowGap: 8 }}>
            {[1, 2, 3, 4, 5, 6, 7].map((n) => (
              <View key={n} style={{ flexDirection: "row", alignItems: "center", gap: 6, borderRadius: 999, borderWidth: 1, borderColor: stageGold(0.25), backgroundColor: "rgba(255,255,255,0.04)", paddingVertical: 4, paddingLeft: 4, paddingRight: 12 }}>
                <IslamNum n={n} size={24} fontSize={10} color={STAGE_GOLD} paper={stage.bg} />
                <Text style={{ fontFamily: FONT.semibold, fontSize: 12.5, color: "rgba(255,255,255,0.8)" }}>{t(`s${n}`)}</Text>
              </View>
            ))}
          </View>
          {c.finalPoints ? (
            <View style={{ marginTop: 32, gap: 8, alignSelf: "stretch" }}>
              {c.finalPoints.map((p) => (
                <View key={p} style={{ flexDirection: "row", gap: 10 }}>
                  <View style={{ marginTop: 4 }}><StarMark size={14} color={STAGE_GOLD} center={stage.bg} /></View>
                  <Text style={{ flex: 1, fontFamily: FONT.regular, fontSize: 15, lineHeight: 22, color: "rgba(255,255,255,0.8)" }}>{p}</Text>
                </View>
              ))}
            </View>
          ) : null}
          <GoldPill title={t("cta")} onPress={startShams} style={{ marginTop: 36, alignSelf: "center" }} />
        </View>
      </StageBackground>
      <MoreTiles keys={["courses", "plan", "map", "arabic"]} />
    </IslScreen>
  );
}
