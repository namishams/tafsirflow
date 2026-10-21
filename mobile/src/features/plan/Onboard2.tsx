import { useEffect, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
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

const METHOD_STEPS: [string, IconName][] = [["listen", "volume"], ["understand", "book"], ["repeat", "repeat"], ["recite", "speaker"], ["review", "grid"]];

/** The Shams Method in four screens: the five steps, why it works, the tree that grows with it, made for your goals */
export function MethodIntro({ goals, name, onDone }: { goals: GoalV2[]; name: string; onDone: () => void }) {
  const o = useO2();
  const p = usePlanT();
  const label = useGoalLabel();
  const insets = useSafeAreaInsets();
  const reduce = useReducedMotion();
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
    <Stage hairlines={false} style={{ flex: 1 }}>
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
              <View style={{ alignSelf: "center", width: 180, height: 180, alignItems: "center", justifyContent: "center", marginVertical: 6 }} accessible={false}>
                {[180, 128, 76].map((d, n) => (
                  <Animated.View key={d} entering={reduce ? undefined : FadeIn.delay(n * 160).duration(500)}
                    style={{ position: "absolute", width: d, height: d, borderRadius: d / 2, borderWidth: 1, borderColor: alpha(stage.gold, 0.25 + n * 0.25), backgroundColor: alpha(stage.gold, 0.04 + n * 0.05) }} />
                ))}
                <Icon name="sun" color={stage.gold} size={34} />
              </View>
              <Text style={{ fontFamily: FONT.regular, fontSize: 16, lineHeight: 24, color: stage.textSoft }}>{o.m2B}</Text>
              <View style={{ gap: 12 }}>{[o.m2a, o.m2b, o.m2c].map((s, n) => row("checkCircle", s, "", n))}</View>
            </>
          ) : null}
          {i === 2 ? (
            <>
              <Display size="title1" onStage>{o.m3T}</Display>
              <View style={{ flexDirection: "row", alignItems: "flex-end", justifyContent: "center", gap: 2, marginVertical: 4 }} accessible={false}>
                {[1, 4, 7].map((s, n) => (
                  <Animated.View key={s} entering={reduce ? undefined : FadeInUp.delay(n * 220).duration(420)}>
                    <TreeArt id="onboarding" type="olive" stage={s} size={96 + n * 26} still={reduce} />
                  </Animated.View>
                ))}
              </View>
              <Text style={{ fontFamily: FONT.regular, fontSize: 16, lineHeight: 24, color: stage.textSoft }}>{o.m3B}</Text>
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
    </Stage>
  );
}

/** "Your personal path": name, goals, interests, daily minutes, courses, feed, and the 30-day plan */
export function PathView({ plan, v2, name, hasTree, onNext }: { plan: Plan; v2: V2Answers; name: string; hasTree: boolean; onNext: () => void }) {
  const p = usePlanT();
  const o = useO2();
  const label = useGoalLabel();
  const insets = useSafeAreaInsets();
  const reduce = useReducedMotion();
  const a = plan.answers;
  const chip = (s: string) => (
    <View key={s} style={{ borderRadius: R.pill, borderWidth: 1, borderColor: alpha(stage.gold, 0.45), backgroundColor: alpha(stage.gold, 0.1), paddingHorizontal: 12, paddingVertical: 6 }}>
      <Text style={{ fontFamily: FONT.medium, fontSize: 13.5, color: "#ffffff" }}>{s}</Text>
    </View>
  );
  const section = (title: string, body: React.ReactNode, n: number) => (
    <Animated.View entering={reduce ? undefined : FadeInDown.delay(120 + n * 110).duration(360)} style={{ borderRadius: R.card, borderWidth: 1, borderColor: alpha(stage.gold, 0.25), backgroundColor: "rgba(255,255,255,0.04)", padding: 16, gap: 10 }}>
      <Text style={{ fontFamily: FONT.bold, fontSize: 11.5, letterSpacing: 1.6, textTransform: "uppercase", color: stage.gold }}>{title}</Text>
      {body}
    </Animated.View>
  );
  const interests = v2.interests.map((i) => o[`i_${i}`]);
  return (
    <Stage hairlines={false} style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={{ padding: 20, paddingTop: insets.top + 24, paddingBottom: insets.bottom + 24, gap: 12 }}>
        <Text style={kicker}>{o.pathKicker}</Text>
        <Display onStage>{name ? fmt(o.pathTName, { name }) : o.pathT}</Display>
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
        {plan.weeks.map((w, i) => (
          <View key={i} style={{ borderRadius: R.card, borderWidth: 1, borderColor: alpha(stage.gold, 0.2), backgroundColor: "rgba(255,255,255,0.03)", padding: 16 }}>
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
          </View>
        ))}
        <PlanMilestones minutes={a.minutes} />
        <GoldButton title={hasTree ? o.pathCtaTree : o.pathCta} onPress={onNext} style={{ marginTop: 12 }} />
      </ScrollView>
    </Stage>
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

