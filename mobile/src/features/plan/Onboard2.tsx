import { useEffect, useState } from "react";
import { Pressable, ScrollView, Text, View, useWindowDimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, { FadeIn, FadeInDown, FadeInUp, FadeOut } from "react-native-reanimated";
import { router, type Href } from "expo-router";
import { Display, GoldButton, GoldCard, Stage } from "@/components/brand";
import { Icon, type IconName } from "@/components/icons";
import { FONT, R, stage, useTheme } from "@/lib/theme";
import { success, tick } from "@/features/feed/haptics";
import { alpha } from "@/features/extra/art";
import { useReducedMotion } from "@/features/library/motion";
import { TreeArt } from "@/features/garden/Tree";
import { PlanMilestones } from "@/features/garden/widgets";
import { ShamsModeChooser, ShamsModeNote } from "@/features/shams2/ModeChooser";
import { JourneyStage } from "@/features/garden/Landscape";
import { ArcadeOfSteps, Astrolabe, GrowingTerraces, MapPath, QuranStand, RefQuote, Rosette } from "./Scenes";
import { GOOD_TREE_KEY, RECITERS_KEY, fillS, useStory } from "./story";
import { useHadithQuote, useVerseQuote } from "./sources";
import { RECITERS } from "@/lib/quran";
import { FREE, usePro } from "@/lib/pro";
import { readTradition } from "@/lib/tradition";
import { useHadithText } from "@/features/hadith/texts";
import { useWebT } from "@/i18n/web";
import { STEPS, usePlan, type Plan } from "./plan";
import { fmt, usePlanT } from "./texts";
import { useO2 } from "./texts2";
import { useV2, type GoalV2, type V2Answers } from "./v2";

const kicker = { fontFamily: FONT.semibold, fontSize: 11.5, letterSpacing: 2, textTransform: "uppercase" as const, color: stage.gold };

/** "Read Arabic" / "Learn about Islam" … for any v2 goal */
export function useGoalLabel() {
  const p = usePlanT();
  const o = useO2();
  return (g: GoalV2) => (g === "islam" || g === "children" ? o[`g_${g}`] : p[`g_${g}`]);
}
/** "A, B and C" without language-specific "and": joined with the list separator */
export const joinList = (xs: string[]) => xs.join(" · ");

/** the short personal reply after an answer: fades up from below, a light haptic tick; static under Reduce Motion */
export function ReplyCard({ title, body, cta, onNext }: { title: string; body: string; cta: string; onNext: () => void }) {
  const reduce = useReducedMotion();
  useEffect(() => { tick(); }, [body]);
  return (
    <Animated.View key={body} entering={reduce ? undefined : FadeInUp.duration(320)} exiting={reduce ? undefined : FadeOut.duration(150)} accessibilityLiveRegion="polite"
      style={{ borderRadius: R.card, borderWidth: 1, borderColor: alpha(stage.gold, 0.45), backgroundColor: "rgba(20,16,10,0.94)", padding: 18, gap: 8 }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
        <Icon name="sun" color={stage.gold} size={18} />
        <Text style={{ fontFamily: FONT.display, fontSize: 18, color: "#ffffff", flex: 1 }}>{title}</Text>
      </View>
      <Text style={{ fontFamily: FONT.regular, fontSize: 15, lineHeight: 22, color: stage.textSoft }}>{body}</Text>
      <GoldButton title={cta} onPress={onNext} style={{ marginTop: 6 }} />
    </Animated.View>
  );
}

/** The story begins: "the people of the Quran" (the honour of learning and teaching it: Sahih al-Bukhari 5027 from the
 *  synced hadith sources; Quran 35:29 from the Quran data for the Shia tradition), personal with name, goal, reciter
 *  and tradition. */
export function PeopleOfQuran({ plan, goals, name, onDone }: { plan: Plan | null; goals: GoalV2[]; name: string; onDone: () => void }) {
  const st = useStory();
  const p = usePlanT();
  const hx = useHadithText();
  const web = useWebT("shams");
  const label = useGoalLabel();
  const insets = useSafeAreaInsets();
  const reduce = useReducedMotion();
  const [trad] = useState(() => readTradition());
  const { pro } = usePro();
  const reciter = RECITERS.find((r) => r.folder === plan?.answers.reciter);
  // a Pro voice chosen without Pro: the reader plays the first free voice until then (features/quran/reciter.ts)
  const freeVoice = RECITERS.find((r) => FREE.reciterIds.includes(r.id));
  const reciterText = !reciter ? null : pro || FREE.reciterIds.includes(reciter.id) || !freeVoice
    ? fillS(st.reciterLine, { reciter: reciter.name })
    : fillS(st.reciterLinePro, { reciter: reciter.name, free: freeVoice.name });
  // Sahih al-Bukhari 5027 and Quran 35:29 from the app's data; the story's lines only offline, marked as a paraphrase
  const bukhari = useHadithQuote("bukhari", 5027, web("why1s"), (w) => fillS(st.quote, { t: w }), { text: web("why1"), source: `${web("why1s")} · ${st.para}` });
  const reciters = useVerseQuote(RECITERS_KEY, st.shiaQs.split(" · ")[0], { text: st.shiaQ, source: st.shiaQs });
  const goal = label(goals[0] ?? "daily");
  const line = (s: string, n: number) => <Animated.Text key={s} entering={reduce ? undefined : FadeInDown.delay(500 + n * 140).duration(380)} style={{ fontFamily: FONT.medium, fontSize: 15, lineHeight: 22, color: "#ffffff" }}>{s}</Animated.Text>;
  return (
    <JourneyStage progress={1} horizon={0.37} veil={0.6}>
      <ScrollView contentContainerStyle={{ padding: 22, paddingTop: insets.top + 18, paddingBottom: insets.bottom + 24, flexGrow: 1, gap: 16 }}>
        <View style={{ height: 230, justifyContent: "flex-end" }}><QuranStand still={reduce} size={210} /></View>
        <Animated.View entering={reduce ? undefined : FadeInDown.duration(420)} style={{ gap: 10 }}>
          <Text style={kicker}>{st.kicker}</Text>
          <Display size="title1" onStage>{name ? fillS(st.peopleT, { name }) : st.peopleT0}</Display>
          <Text style={{ fontFamily: FONT.regular, fontSize: 16, lineHeight: 24, color: stage.textSoft }}>{st.peopleB}</Text>
        </Animated.View>
        <Animated.View entering={reduce ? undefined : FadeIn.delay(300).duration(500)}>
          {trad === "shia" ? (reciters ? <RefQuote {...reciters} /> : null) : bukhari ? <RefQuote {...bukhari} /> : null}
        </Animated.View>
        <View style={{ gap: 6 }}>
          {line(fillS(st.goalLine, { goal }), 0)}
          {reciterText ? line(reciterText, 1) : null}
          {trad ? line(fillS(st.tradLine, { trad: trad === "sunni" ? hx.sunni : trad === "shia" ? hx.shia : hx.both }), 2) : null}
        </View>
        <View style={{ flex: 1 }} />
        <GoldButton title={p.next} onPress={() => { tick(); onDone(); }} />
      </ScrollView>
    </JourneyStage>
  );
}

const METHOD_STEPS: [string, IconName][] = [["listen", "volume"], ["understand", "book"], ["repeat", "repeat"], ["recite", "speaker"], ["review", "grid"]];

/** The Shams Method in four screens: the five steps, why it works, the tree that grows with it, made for your goals */
export function MethodIntro({ goals, name, onDone }: { goals: GoalV2[]; name: string; onDone: () => void }) {
  const o = useO2();
  const st = useStory();
  const [trad] = useState(() => readTradition());
  // Quran 14:24 from the app's data; the story's line only offline, marked as a paraphrase
  const goodTree = useVerseQuote(GOOD_TREE_KEY, st.goodTreeS.split(" · ")[0], { text: st.goodTree, source: st.goodTreeS });
  const p = usePlanT();
  const label = useGoalLabel();
  const insets = useSafeAreaInsets();
  const reduce = useReducedMotion();
  const { width } = useWindowDimensions();
  const [i, setI] = useState(0);
  const N = 4;
  const next = () => { tick(); if (i + 1 < N) setI(i + 1); else { success(); onDone(); } };
  const back = () => { tick(); if (i > 0) setI(i - 1); };
  const enter = reduce ? undefined : FadeInDown.duration(380);
  const row = (icon: IconName, title: string, desc: string, n: number) => (
    <Animated.View key={title} entering={reduce ? undefined : FadeInDown.delay(120 + n * 90).duration(340)} style={{ flexDirection: "row", alignItems: "center", gap: 14 }}>
      <View style={{ width: 46, height: 46, borderRadius: 23, borderWidth: 1, borderColor: alpha(stage.gold, 0.5), backgroundColor: alpha(stage.gold, 0.1), alignItems: "center", justifyContent: "center" }}>
        <Icon name={icon} color={stage.gold} size={21} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ fontFamily: FONT.semibold, fontSize: 16, color: "#ffffff" }}>{title}</Text>
        {desc ? <Text style={{ fontFamily: FONT.regular, fontSize: 13.5, lineHeight: 19, color: stage.textMuted, marginTop: 2 }}>{desc}</Text> : null}
      </View>
    </Animated.View>
  );
  const focus = goals.length ? goals : (["daily"] as GoalV2[]);
  return (
    <JourneyStage progress={1} horizon={0.37} veil={0.6}>
      <View style={{ paddingTop: insets.top + 8, paddingHorizontal: 20, flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
        <Pressable onPress={back} disabled={i === 0} accessibilityRole="button" accessibilityLabel={p.back} hitSlop={10} style={{ width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(255,255,255,0.08)", opacity: i === 0 ? 0 : 1 }}>
          <Icon name="chevronLeft" color="#ffffff" size={20} />
        </Pressable>
        <Text style={kicker}>{o.m_kicker}</Text>
        <View style={{ flexDirection: "row", gap: 6 }} accessibilityRole="progressbar" accessibilityValue={{ min: 1, max: N, now: i + 1 }}>
          {Array.from({ length: N }, (_, k) => <View key={k} style={{ width: k === i ? 16 : 6, height: 6, borderRadius: 3, backgroundColor: k <= i ? stage.gold : "rgba(255,255,255,0.2)" }} />)}
        </View>
      </View>
      <ScrollView contentContainerStyle={{ padding: 22, paddingTop: 26, paddingBottom: insets.bottom + 24, flexGrow: 1 }}>
        <Animated.View key={i} entering={enter} style={{ flex: 1, gap: 18 }}>
          <View style={{ height: 220, justifyContent: "flex-end", marginTop: -8 }}>
            {i === 0 ? <ArcadeOfSteps icons={METHOD_STEPS.map(([, ic]) => ic)} still={reduce} width={width - 44} /> : null}
            {i === 1 ? <Rosette still={reduce} size={190} /> : null}
            {i === 2 ? <GrowingTerraces still={reduce} width={width - 44} /> : null}
            {i === 3 ? <Astrolabe still={reduce} size={196} marks={focus.length} /> : null}
          </View>
          {i === 0 ? (
            <>
              <Display size="title1" onStage>{name ? `${name}, ${o.m1T.charAt(0).toLocaleLowerCase()}${o.m1T.slice(1)}` : o.m1T}</Display>
              <Text style={{ fontFamily: FONT.regular, fontSize: 16, lineHeight: 24, color: stage.textSoft }}>{o.m1B}</Text>
              <View style={{ gap: 14, marginTop: 4 }}>
                {METHOD_STEPS.map(([k, ic], n) => row(ic, o[`st_${k}` as "st_listen"], o[`st_${k}D` as "st_listenD"], n))}
              </View>
            </>
          ) : null}
          {i === 1 ? (
            <>
              <Display size="title1" onStage>{o.m2T}</Display>
              <Text style={{ fontFamily: FONT.regular, fontSize: 16, lineHeight: 24, color: stage.textSoft }}>{o.m2B}</Text>
              <View style={{ gap: 12 }}>{[o.m2a, o.m2b, o.m2c].map((s, n) => row("checkCircle", s, "", n))}</View>
            </>
          ) : null}
          {i === 2 ? (
            <>
              <Display size="title1" onStage>{o.m3T}</Display>
              <Text style={{ fontFamily: FONT.regular, fontSize: 16, lineHeight: 24, color: stage.textSoft }}>{o.m3B}</Text>
              <Text style={{ fontFamily: FONT.semibold, fontSize: 15.5, lineHeight: 23, color: "#ffffff" }}>{st.treeB}</Text>
              <View style={{ gap: 12 }}>
                {goodTree ? <RefQuote {...goodTree} /> : null}
                {trad !== "shia" ? <RefQuote text={st.hearts} source={st.heartsS} /> : null}
                {trad !== "shia" ? <RefQuote text={st.paradise} source={st.paradiseS} /> : null}
              </View>
              <Text style={{ fontFamily: FONT.italic, fontSize: 14.5, lineHeight: 21, color: stage.gold }}>{st.sabr}</Text>
            </>
          ) : null}
          {i === 3 ? (
            <>
              <Display size="title1" onStage>{o.m4T}</Display>
              <Text style={{ fontFamily: FONT.regular, fontSize: 16, lineHeight: 24, color: stage.textSoft }}>{fmt(o.m4B, { goals: joinList(focus.map(label)) })}</Text>
              <View style={{ gap: 12 }}>{focus.slice(0, 5).map((g, n) => row("checkCircle", label(g), o[`f_${g}`], n))}</View>
            </>
          ) : null}
        </Animated.View>
        <GoldButton title={i + 1 < N ? p.next : o.pathKicker} onPress={next} style={{ marginTop: 24 }} />
      </ScrollView>
    </JourneyStage>
  );
}

/** "Your personal path": name, goals, interests, daily minutes, courses, feed, and the 30-day plan */
export function PathView({ plan, v2, name, hasTree, onNext }: { plan: Plan; v2: V2Answers; name: string; hasTree: boolean; onNext: () => void }) {
  const p = usePlanT();
  const st = useStory();
  const o = useO2();
  const label = useGoalLabel();
  const insets = useSafeAreaInsets();
  const reduce = useReducedMotion();
  const a = plan.answers;
  const [ys, setYs] = useState<(number | undefined)[]>([]);
  const [mapH, setMapH] = useState(0);
  const mapYs = ys.length === plan.weeks.length && ys.every((y) => y !== undefined) ? (ys as number[]) : [];
  const chip = (s: string) => (
    <View key={s} style={{ borderRadius: R.pill, borderWidth: 1, borderColor: alpha(stage.gold, 0.45), backgroundColor: alpha(stage.gold, 0.1), paddingHorizontal: 12, paddingVertical: 6 }}>
      <Text style={{ fontFamily: FONT.medium, fontSize: 13.5, color: "#ffffff" }}>{s}</Text>
    </View>
  );
  const section = (title: string, body: React.ReactNode, n: number) => (
    <Animated.View entering={reduce ? undefined : FadeInDown.delay(120 + n * 110).duration(360)} style={{ borderRadius: R.card, borderWidth: 1, borderColor: alpha(stage.gold, 0.25), backgroundColor: "rgba(6,30,23,0.7)", padding: 16, gap: 10 }}>
      <Text style={{ fontFamily: FONT.bold, fontSize: 11.5, letterSpacing: 1.6, textTransform: "uppercase", color: stage.gold }}>{title}</Text>
      {body}
    </Animated.View>
  );
  const interests = v2.interests.map((i) => o[`i_${i}`]);
  return (
    <JourneyStage progress={1} horizon={0.27} veil={0.5}>
      <ScrollView contentContainerStyle={{ padding: 20, paddingTop: insets.top + 220, paddingBottom: insets.bottom + 24, gap: 12 }}>
        <Text style={kicker}>{o.pathKicker}</Text>
        <Display onStage>{name ? fmt(o.pathTName, { name }) : o.pathT}</Display>
        <Text style={{ fontFamily: FONT.semibold, fontSize: 15.5, lineHeight: 22, color: "#f3e2b6" }}>{name ? fillS(st.begins, { name, goal: label(v2.goals[0] ?? a.goal) }) : fillS(st.begins0, { goal: label(v2.goals[0] ?? a.goal) })}</Text>
        {a.motivation ? <Text style={{ fontFamily: FONT.italic, fontSize: 14, color: stage.gold }}>{p[`m_${a.motivation}`]}</Text> : null}
        {section(o.pathGoals, <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>{(v2.goals.length ? v2.goals : [a.goal]).map((g) => chip(label(g)))}</View>, 0)}
        {interests.length ? section(o.pathInterests, (
          <>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>{interests.map(chip)}</View>
            <Text style={{ fontFamily: FONT.regular, fontSize: 13.5, lineHeight: 19, color: stage.textMuted }}>{fmt(o.pathFeed, { list: joinList(interests.slice(0, 3)) })}</Text>
          </>
        ), 1) : null}
        {section(o.pathTime, <Text style={{ fontFamily: FONT.display, fontSize: 22, color: "#ffffff" }}>{fmt(p.stepMin, { n: a.minutes })}</Text>, 2)}
        {v2.courses.length ? section(o.pathCourses, (
          <View style={{ gap: 8 }}>
            {v2.courses.map((c) => (
              <View key={c} style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                <Icon name="book" color={stage.gold} size={16} />
                <Text style={{ flex: 1, fontFamily: FONT.semibold, fontSize: 15, color: "#ffffff" }}>{o[`co_${c}`]}</Text>
              </View>
            ))}
          </View>
        ), 3) : null}
        <Text style={[kicker, { marginTop: 10 }]}>{o.pathWeeks}</Text>
        <View onLayout={(e) => setMapH(e.nativeEvent.layout.height)} style={{ paddingLeft: 46, gap: 12 }}>
        <MapPath ys={mapYs} height={mapH} still={reduce} />
        {plan.weeks.map((w, i) => (
          <Animated.View key={i} entering={reduce ? undefined : FadeInDown.delay(500 + i * 260).duration(420)} onLayout={(e) => { const y = e.nativeEvent.layout.y + 30; setYs((p0) => { if (p0[i] === y) return p0; const n = [...p0]; n.length = plan.weeks.length; n[i] = y; return n; }); }}
            style={{ borderRadius: R.card, borderWidth: 1, borderColor: alpha(stage.gold, 0.28), backgroundColor: "rgba(6,30,23,0.7)", padding: 16 }}>
            <Text style={{ fontFamily: FONT.bold, fontSize: 11.5, letterSpacing: 1.6, textTransform: "uppercase", color: stage.gold }}>{fmt(p.week, { n: i + 1 })}</Text>
            <Text style={{ fontFamily: FONT.display, fontSize: 18, color: "#ffffff", marginTop: 4 }}>{p[`w_${w.theme}`]}</Text>
            <View style={{ gap: 6, marginTop: 10 }}>
              {w.steps.map((id) => (
                <View key={id} style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                  <Icon name={STEPS[id].pro ? "lock" : "checkCircle"} color={STEPS[id].pro ? stage.gold : stage.textMuted} size={15} />
                  <Text style={{ flex: 1, fontFamily: FONT.regular, fontSize: 14, color: stage.textSoft }}>{p[`s_${id}`]}</Text>
                  {STEPS[id].pro ? <Text style={{ fontFamily: FONT.bold, fontSize: 11, color: stage.gold }}>{p.pro}</Text> : null}
                </View>
              ))}
            </View>
          </Animated.View>
        ))}
        </View>
        <PlanMilestones minutes={a.minutes} />
        <ShamsModeNote top={0} />
        {/* the method (classic, 2.0, 3.0) and the difficulty, chosen here and changeable later (Shams page, hub, settings) */}
        <ShamsModeChooser tone="stage" stay />
        <GoldButton title={hasTree ? o.pathCtaTree : o.pathCta} onPress={onNext} style={{ marginTop: 12 }} />
      </ScrollView>
    </JourneyStage>
  );
}

/** "Personalise your path" on the Masterclass tab, for people who have a plan from before onboarding v2 */
export function PersonaliseCard() {
  const t = useTheme();
  const o = useO2();
  const plan = usePlan();
  const v2 = useV2();
  if (!plan || v2) return null;
  return (
    <GoldCard>
      <Text style={{ fontFamily: FONT.display, fontSize: 19, color: t.ink }}>{o.persT}</Text>
      <Text style={{ fontFamily: FONT.regular, fontSize: 14, lineHeight: 20, color: t.muted, marginTop: 4 }}>{o.persD}</Text>
      <GoldButton title={o.persCta} onPress={() => router.push("/onboarding?personalise=1" as Href)} style={{ marginTop: 14 }} />
    </GoldCard>
  );
}

