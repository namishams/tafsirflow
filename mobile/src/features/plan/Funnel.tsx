import { useEffect, useMemo, useRef, useState } from "react";
import { AccessibilityInfo, Animated, Easing, Pressable, ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router, type Href } from "expo-router";
import { Display, GoldButton, Stage } from "@/components/brand";
import { Icon } from "@/components/icons";
import { LANGS, langLabel, useLang, type Lang } from "@/i18n";
import { FONT, R, stage } from "@/lib/theme";
import { readJSON, writeJSON } from "@/lib/store";
import { RECITERS } from "@/lib/quran";
import { FREE, usePro } from "@/lib/pro";
import { saveTradition, type TraditionChoice } from "@/lib/tradition";
import { useHadithText } from "@/features/hadith/texts";
import { ASK_DONE_KEY } from "@/features/hadith/cards";
import { success, tick } from "@/features/feed/haptics";
import { remoteConfig } from "@/features/feed/remote";
import { alpha } from "@/features/extra/art";
import { goBack } from "@/components/page";
import type { Goal } from "@/web/coach";
import { Day1Paywall } from "./Day1Paywall";
import { PlantFlow } from "@/features/garden/PlantFlow";
import { PlanMilestones } from "@/features/garden/widgets";
import { readGarden } from "@/features/garden/garden";
import { GOALS, LEVELS, MINUTES, MOTIVATIONS, STEPS, readDraft, savePlan, writeDraft, type Plan, type QuizAnswers, type QuizDraft } from "./plan";
import { fmt, usePlanT } from "./texts";

// The first-run funnel: eight short questions (one per screen, progress bar, haptics) → "building your plan" →
// the personal 30-day plan → the day-1 paywall (prices from the store; "Continue for free" always visible).
// Answers so far are kept in qmc.quiz.draft, so the reload a right-to-left language needs resumes at the same step.
const Q = ["lang", "goal", "level", "minutes", "reciter", "tradition", "prayer", "motivation"] as const;
type Phase = "quiz" | "building" | "plan" | "garden" | "paywall";

/** the website's goal (tf:goal, synced with the account) from the quiz answers */
function websiteGoal(a: QuizAnswers): Goal {
  const read: Goal["read"] = a.level === "none" ? "no" : a.level === "fluent" ? "fluent" : "some";
  const aim: Goal["aim"] = a.goal === "juzamma" ? "juzamma" : a.goal === "understand" || a.goal === "daily" ? "understand" : "read";
  return { read, aim, minutes: a.minutes, at: Date.now() };
}

export function Funnel() {
  const p = usePlanT();
  const hx = useHadithText();
  const { lang, setSetting } = useLang();
  const { pro } = usePro();
  const insets = useSafeAreaInsets();
  const [draft, setDraft] = useState<QuizDraft>(() => readDraft() ?? {});
  const [step, setStep] = useState(() => Math.min(draft.step ?? 0, Q.length - 1));
  const [phase, setPhase] = useState<Phase>("quiz");
  const [plan, setPlan] = useState<Plan | null>(null);
  const bar = useRef(new Animated.Value((step + 1) / Q.length)).current;
  useEffect(() => { Animated.timing(bar, { toValue: (step + 1) / Q.length, duration: 260, easing: Easing.out(Easing.cubic), useNativeDriver: false }).start(); }, [step, bar]);

  const update = (patch: Partial<QuizAnswers>, next = true) => {
    tick();
    const d: QuizDraft = { ...draft, ...patch, step: next ? step + 1 : step };
    setDraft(d);
    writeDraft(d);
    if (!next) return;
    if (step + 1 < Q.length) setStep(step + 1);
    else finish(d);
  };
  const finish = (d: QuizDraft) => {
    const a: QuizAnswers = { goal: d.goal ?? "daily", level: d.level ?? "slow", minutes: d.minutes ?? 10, reciter: d.reciter ?? null, prayer: !!d.prayer, motivation: d.motivation ?? null };
    writeJSON("tf:goal", websiteGoal(a));
    setPlan(savePlan(a));
    setPhase("building");
  };
  const back = () => { tick(); if (step > 0) setStep(step - 1); else leave(); };
  const leave = () => { writeJSON("tf:onboardSkip", true); writeDraft(null); if (router.canGoBack()) goBack(); else router.replace("/" as Href); };
  const done = () => { router.replace("/" as Href); };
  const afterPlan = () => {
    const cfg = remoteConfig()?.monetize?.paywall?.day1;
    if (pro || cfg?.enabled === false) done(); else setPhase("paywall");
  };

  if (phase === "building") return <Building onDone={() => { success(); setPhase("plan"); }} />;
  // the tree is planted right after the plan (the mission of the Shams Method), unless one already grows
  if (phase === "plan" && plan) return <PlanView plan={plan} onNext={() => (readGarden().trees.length ? afterPlan() : setPhase("garden"))} />;
  if (phase === "garden") return <PlantFlow minutes={plan?.answers.minutes} onDone={afterPlan} onLater={afterPlan} />;
  if (phase === "paywall") return <Day1Paywall plan={plan} onDone={done} />;

  const q = Q[step];
  const opt = (key: string, on: boolean, label: string, desc: string | null, onPress: () => void, badge?: string) => (
    <Pressable key={key} onPress={onPress} accessibilityRole="button" accessibilityState={{ selected: on }} accessibilityLabel={desc ? `${label}. ${desc}` : label}
      style={({ pressed }) => ({ flexDirection: "row", alignItems: "center", gap: 12, borderRadius: R.md, borderWidth: 1, paddingHorizontal: 16, paddingVertical: 14, minHeight: 56,
        borderColor: on ? stage.gold : pressed ? alpha(stage.gold, 0.6) : alpha(stage.gold, 0.22), backgroundColor: on ? alpha(stage.gold, 0.12) : pressed ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.03)" })}>
      <View style={{ flex: 1 }}>
        <Text style={{ fontFamily: FONT.semibold, fontSize: 16, color: "#ffffff" }}>{label}</Text>
        {desc ? <Text style={{ fontFamily: FONT.regular, fontSize: 13, lineHeight: 18, color: stage.textMuted, marginTop: 3 }}>{desc}</Text> : null}
      </View>
      {badge ? <Text style={{ fontFamily: FONT.bold, fontSize: 11, letterSpacing: 1, color: stage.gold, borderWidth: 1, borderColor: stage.goldSoft, borderRadius: R.pill, paddingHorizontal: 8, paddingVertical: 2 }}>{badge}</Text> : null}
      {on ? <Icon name="checkCircle" color={stage.gold} size={20} /> : null}
    </Pressable>
  );
  const title = (s: string) => <Display size="title1" onStage style={{ marginBottom: 16 }}>{s}</Display>;
  const note = (s: string) => <Text style={{ fontFamily: FONT.regular, fontSize: 13, lineHeight: 19, color: stage.textMuted, marginTop: 14 }}>{s}</Text>;

  return (
    <Stage hairlines={false} style={{ flex: 1 }}>
      <View style={{ paddingTop: insets.top + 8, paddingHorizontal: 20 }}>
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
          <Pressable onPress={back} accessibilityRole="button" accessibilityLabel={p.back} hitSlop={10} style={{ width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(255,255,255,0.08)" }}>
            <Icon name="chevronLeft" color="#ffffff" size={20} />
          </Pressable>
          <Text style={{ fontFamily: FONT.semibold, fontSize: 11.5, letterSpacing: 2, textTransform: "uppercase", color: stage.gold }}>{p.kicker} · {step + 1}/{Q.length}</Text>
          <Text onPress={leave} accessibilityRole="button" style={{ fontFamily: FONT.medium, fontSize: 14, color: stage.textMuted, paddingVertical: 8 }}>{p.skip}</Text>
        </View>
        <View style={{ height: 4, borderRadius: 2, backgroundColor: "rgba(255,255,255,0.12)", marginTop: 12, overflow: "hidden" }} accessibilityRole="progressbar" accessibilityValue={{ min: 0, max: Q.length, now: step + 1 }}>
          <Animated.View style={{ height: 4, borderRadius: 2, backgroundColor: stage.gold, width: bar.interpolate({ inputRange: [0, 1], outputRange: ["0%", "100%"] }) }} />
        </View>
      </View>
      <ScrollView contentContainerStyle={{ padding: 20, paddingTop: 28, paddingBottom: insets.bottom + 24 }}>
        {q === "lang" ? (
          <>
            {title(p.qLang)}
            <View style={{ gap: 8 }}>{LANGS.map((l: Lang) => opt(l, lang === l, langLabel(l), null, () => {
              const d = { ...draft, step: step + 1 };
              writeDraft(d); setDraft(d); tick(); // saved first: a right-to-left switch reloads the app
              if (l !== lang) setSetting(l);
              setStep(step + 1);
            }))}</View>
          </>
        ) : null}
        {q === "goal" ? (
          <>
            {title(p.qGoal)}
            <View style={{ gap: 8 }}>{GOALS.map((g) => opt(g, draft.goal === g, p[`g_${g}`], p[`g_${g}D`], () => update({ goal: g })))}</View>
          </>
        ) : null}
        {q === "level" ? (
          <>
            {title(p.qLevel)}
            <View style={{ gap: 8 }}>{LEVELS.map((l) => opt(l, draft.level === l, p[`l_${l}`], p[`l_${l}D`], () => update({ level: l })))}</View>
          </>
        ) : null}
        {q === "minutes" ? (
          <>
            {title(p.qMinutes)}
            <View style={{ flexDirection: "row", gap: 8 }}>
              {MINUTES.map((m) => {
                const on = draft.minutes === m;
                return (
                  <Pressable key={m} onPress={() => update({ minutes: m })} accessibilityRole="button" accessibilityState={{ selected: on }} accessibilityLabel={`${m} ${p.min}`}
                    style={({ pressed }) => ({ flex: 1, alignItems: "center", paddingVertical: 18, borderRadius: R.lg, borderWidth: 1, borderColor: on ? stage.gold : alpha(stage.gold, 0.25), backgroundColor: on ? alpha(stage.gold, 0.12) : pressed ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.03)" })}>
                    <Text style={{ fontFamily: FONT.display, fontSize: 26, color: "#ffffff" }}>{m}</Text>
                    <Text style={{ fontFamily: FONT.regular, fontSize: 12, color: stage.textMuted, marginTop: 2 }}>{p.min}</Text>
                  </Pressable>
                );
              })}
            </View>
            {note(p.minutesD)}
          </>
        ) : null}
        {q === "reciter" ? (
          <>
            {title(p.qReciter)}
            <View style={{ gap: 8 }}>{RECITERS.map((r) => opt(r.folder, draft.reciter === r.folder, r.name, null, () => {
              writeJSON("tf:reciter", r.folder, true);
              update({ reciter: r.folder });
            }, FREE.reciterIds.includes(r.id) ? undefined : p.pro))}</View>
            {note(p.reciterD)}
          </>
        ) : null}
        {q === "tradition" ? (
          <>
            {title(hx.tradQ)}
            <View style={{ gap: 8 }}>{([["sunni", hx.sunni], ["shia", hx.shia], ["both", hx.both]] as [TraditionChoice, string][]).map(([t, label]) => opt(t, false, label, null, () => {
              saveTradition(t, lang);
              writeJSON(ASK_DONE_KEY, true, true);
              update({});
            }))}</View>
            {note(hx.tradLead)}
          </>
        ) : null}
        {q === "prayer" ? (
          <>
            {title(p.qPrayer)}
            <View style={{ gap: 8 }}>
              {opt("yes", draft.prayer === true, p.yes, null, () => {
                void import("@/features/practice/prayer/alerts").then((m) => m.ensurePermission()).catch(() => undefined);
                update({ prayer: true });
              })}
              {opt("no", draft.prayer === false, p.no, null, () => update({ prayer: false }))}
            </View>
            {note(p.prayerD)}
          </>
        ) : null}
        {q === "motivation" ? (
          <>
            {title(p.qMotivation)}
            <View style={{ gap: 8 }}>{MOTIVATIONS.map((m) => opt(m, draft.motivation === m, p[`m_${m}`], null, () => update({ motivation: m })))}</View>
          </>
        ) : null}
      </ScrollView>
    </Stage>
  );
}

/** "Building your plan …": three lines that tick off one after another (about 2.4 s; instant with Reduce Motion) */
function Building({ onDone }: { onDone: () => void }) {
  const p = usePlanT();
  const [n, setN] = useState(0);
  const spin = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    let live = true;
    const loop = Animated.loop(Animated.timing(spin, { toValue: 1, duration: 1400, easing: Easing.linear, useNativeDriver: true }));
    loop.start();
    AccessibilityInfo.isReduceMotionEnabled().then((reduce) => {
      if (!live) return;
      const gap = reduce ? 250 : 750;
      [1, 2, 3].forEach((i) => setTimeout(() => { if (live) { setN(i); tick(); } }, gap * i));
      setTimeout(() => { if (live) onDone(); }, gap * 3 + 450);
    }).catch(() => onDone());
    return () => { live = false; loop.stop(); };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  const rotate = spin.interpolate({ inputRange: [0, 1], outputRange: ["0deg", "360deg"] });
  return (
    <Stage hairlines={false} style={{ flex: 1, justifyContent: "center" }}>
      <View style={{ padding: 28, alignItems: "center" }}>
        <Animated.View style={{ transform: [{ rotate }], marginBottom: 26 }}>
          <View style={{ width: 64, height: 64, borderRadius: 32, borderWidth: 3, borderColor: alpha(stage.gold, 0.2), borderTopColor: stage.gold }} />
        </Animated.View>
        <Display size="title1" onStage style={{ textAlign: "center" }}>{p.building}</Display>
        <View style={{ gap: 12, marginTop: 24, alignSelf: "stretch" }} accessibilityLiveRegion="polite">
          {[p.b1, p.b2, p.b3].map((s, i) => (
            <View key={s} style={{ flexDirection: "row", alignItems: "center", gap: 10, opacity: n > i ? 1 : 0.35 }}>
              {n > i ? <Icon name="checkCircle" color={stage.gold} size={20} /> : <View style={{ width: 20, height: 20, borderRadius: 10, borderWidth: 1.5, borderColor: stage.goldSoft }} />}
              <Text style={{ fontFamily: FONT.medium, fontSize: 15, color: "#ffffff" }}>{s}</Text>
            </View>
          ))}
        </View>
      </View>
    </Stage>
  );
}

/** "Your 30-day plan": four weekly milestones with their steps */
function PlanView({ plan, onNext }: { plan: Plan; onNext: () => void }) {
  const p = usePlanT();
  const insets = useSafeAreaInsets();
  const a = plan.answers;
  const goal = p[`g_${a.goal}`];
  const fade = useRef(new Animated.Value(0)).current;
  useEffect(() => { Animated.timing(fade, { toValue: 1, duration: 420, useNativeDriver: true }).start(); }, [fade]);
  const lead = useMemo(() => fmt(p.planLead, { minutes: a.minutes, goal }), [p, a.minutes, goal]);
  return (
    <Stage hairlines={false} style={{ flex: 1 }}>
      <Animated.ScrollView style={{ opacity: fade }} contentContainerStyle={{ padding: 20, paddingTop: insets.top + 24, paddingBottom: insets.bottom + 24 }}>
        <Text style={{ fontFamily: FONT.semibold, fontSize: 11.5, letterSpacing: 2, textTransform: "uppercase", color: stage.gold }}>{p.kicker}</Text>
        <Display onStage style={{ marginTop: 8 }}>{p.planTitle}</Display>
        <Text style={{ fontFamily: FONT.regular, fontSize: 15, lineHeight: 22, color: stage.textSoft, marginTop: 8 }}>{lead}</Text>
        {a.motivation ? <Text style={{ fontFamily: FONT.italic, fontSize: 14, color: stage.gold, marginTop: 6 }}>{p[`m_${a.motivation}`]}</Text> : null}
        <View style={{ gap: 12, marginTop: 22 }}>
          {plan.weeks.map((w, i) => (
            <View key={i} style={{ borderRadius: R.card, borderWidth: 1, borderColor: alpha(stage.gold, 0.25), backgroundColor: "rgba(255,255,255,0.04)", padding: 16 }}>
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
        </View>
        <View style={{ marginTop: 12 }}><PlanMilestones minutes={a.minutes} /></View>
        <GoldButton title={p.start} onPress={onNext} style={{ marginTop: 24 }} />
      </Animated.ScrollView>
    </Stage>
  );
}

/** true while an unfinished quiz waits (e.g. after the reload a right-to-left language needs) */
export const quizPending = () => { const d = readDraft(); return !!d && typeof d.step === "number" && d.step > 0 && !readJSON("qmc.plan", null); };
