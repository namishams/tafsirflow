import { useEffect, useMemo, useRef, useState } from "react";
import { AccessibilityInfo, Animated, Easing, Pressable, ScrollView, Text, TextInput, View, type ScrollViewInstance } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router, useLocalSearchParams, type Href } from "expo-router";
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
import { JourneyStage } from "@/features/garden/Landscape";
import { GoldStarSpinner } from "./Scenes";
import { LEVELS, MINUTES, MOTIVATIONS, STEPS, readDraft, readPlan, savePlan, writeDraft, type Plan, type QuizAnswers, type QuizDraft } from "./plan";
import { fmt, usePlanT } from "./texts";
import { useO2 } from "./texts2";
import { CHALLENGES, GOALS_V2, INTERESTS, primaryGoal, readName, readV2, saveName, saveV2, type Challenge, type GoalV2, type Interest, type V2Answers } from "./v2";
import { MethodIntro, PathView, ReplyCard, useGoalLabel } from "./Onboard2";

// The first-run funnel (onboarding v2): language, an optional name, then multi-select goals, interests and challenges,
// and the v1 single-select questions (level, minutes, reciter, tradition, prayer, motivation). After every answer a
// short personal reply. Then the Shams Method in four screens → "building your plan" → "Your personal path" (summary
// + the 30-day plan + courses) → the planting ceremony (only without a tree) → the day-1 paywall → the feed.
// Answers so far are kept in qmc.quiz.draft, so the reload a right-to-left language needs resumes at the same step.
// "?personalise=1" (Masterclass tab): the same questions for an existing plan; keeps the plan's start date and tree.
const Q = ["lang", "name", "goals", "interests", "challenges", "level", "minutes", "reciter", "tradition", "prayer", "motivation"] as const;
type Phase = "quiz" | "method" | "building" | "plan" | "garden" | "paywall";
type Draft = QuizDraft & { goals?: GoalV2[]; interests?: Interest[]; challenges?: Challenge[]; v?: 2 };

/** the website's goal (tf:goal, synced with the account) from the quiz answers */
function websiteGoal(a: QuizAnswers): Goal {
  const read: Goal["read"] = a.level === "none" ? "no" : a.level === "fluent" ? "fluent" : "some";
  const aim: Goal["aim"] = a.goal === "juzamma" ? "juzamma" : a.goal === "understand" || a.goal === "daily" ? "understand" : "read";
  return { read, aim, minutes: a.minutes, at: Date.now() };
}
const toggle = <T,>(xs: T[] | undefined, x: T) => (xs ?? []).includes(x) ? (xs ?? []).filter((y) => y !== x) : [...(xs ?? []), x];

export function Funnel() {
  const p = usePlanT();
  const o = useO2();
  const hx = useHadithText();
  const goalLabel = useGoalLabel();
  const { personalise, preview } = useLocalSearchParams<{ personalise?: string; preview?: string }>();
  const pers = personalise === "1";
  const { lang, setSetting } = useLang();
  const { pro } = usePro();
  const insets = useSafeAreaInsets();
  const [draft, setDraft] = useState<Draft>(() => {
    const d = (readDraft() ?? {}) as Draft;
    if (d.v === 2) return d;
    // a v1 draft or a fresh start: carry over what is known (the old single goal becomes the first of the goals)
    const prev = readV2();
    return { ...d, step: d.v === undefined && d.step ? 0 : d.step, v: 2, goals: prev?.goals ?? (d.goal ? [d.goal] : undefined), interests: prev?.interests, challenges: prev?.challenges };
  });
  const [step, setStep] = useState(() => Math.min(draft.step ?? 0, Q.length - 1));
  // development only: "?preview=method|building|plan|garden|paywall" opens a later scene with the saved plan (design previews)
  const pv = __DEV__ && preview && readPlan() ? (preview as Phase) : null;
  const [phase, setPhase] = useState<Phase>(pv ?? "quiz");
  const [plan, setPlan] = useState<Plan | null>(() => (pv ? readPlan() : null));
  const [v2, setV2] = useState<V2Answers | null>(() => (pv ? readV2() ?? { goals: ["read", "understand"], interests: ["tafsir", "history"], challenges: ["time"], courses: ["arabicRead", "cards"], at: 0 } : null));
  const [name, setName] = useState(() => readName());
  const [reply, setReply] = useState<string | null>(null);
  const scroller = useRef<ScrollViewInstance>(null);
  useEffect(() => { if (reply) setTimeout(() => scroller.current?.scrollToEnd({ animated: true }), 60); }, [reply]);
  useEffect(() => { scroller.current?.scrollTo({ y: 0, animated: false }); }, [step]);
  const bar = useRef(new Animated.Value((step + 1) / Q.length)).current;
  useEffect(() => { Animated.timing(bar, { toValue: (step + 1) / Q.length, duration: 260, easing: Easing.out(Easing.cubic), useNativeDriver: false }).start(); }, [step, bar]);

  const save = (patch: Partial<Draft>, nextStep: number) => {
    const d: Draft = { ...draft, ...patch, step: nextStep, v: 2 };
    setDraft(d);
    writeDraft(d as QuizDraft);
    return d;
  };
  /** answer + personal reply: saved at once (resume lands on the next question), the reply waits for "Continue" */
  const answer = (patch: Partial<Draft>, text: string) => { tick(); save(patch, step + 1); setReply(text); };
  /** a multi-select tap: saved, no reply yet */
  const pick = (patch: Partial<Draft>) => { tick(); save(patch, step); };
  const go = () => {
    setReply(null);
    if (step + 1 < Q.length) setStep(step + 1);
    else finish(draft);
  };
  const finish = (d: Draft) => {
    const goals = d.goals?.length ? d.goals : (["daily"] as GoalV2[]);
    const a: QuizAnswers = { goal: primaryGoal(goals), level: d.level ?? "slow", minutes: d.minutes ?? 10, reciter: d.reciter ?? null, prayer: !!d.prayer, motivation: d.motivation ?? null };
    writeJSON("tf:goal", websiteGoal(a));
    const old = pers ? readPlan() : null;
    const made = savePlan(a);
    if (old) { made.createdAt = old.createdAt; writeJSON("qmc.plan", made, true); }
    setPlan(made);
    setV2(saveV2(goals, d.interests ?? [], d.challenges ?? []));
    setPhase("method");
  };
  const back = () => { tick(); if (reply) { setReply(null); return; } if (step > 0) setStep(step - 1); else leave(); };
  const leave = () => { if (!pers) writeJSON("tf:onboardSkip", true); writeDraft(null); if (router.canGoBack()) goBack(); else router.replace("/" as Href); };
  const done = () => { if (pers && router.canGoBack()) goBack(); else router.replace("/" as Href); };
  const afterPlan = () => {
    const cfg = remoteConfig()?.monetize?.paywall?.day1;
    if (pro || pers || cfg?.enabled === false) done(); else setPhase("paywall");
  };
  const hi = name ? fmt(o.hiName, { name }) : o.hi;

  if (phase === "method") return <MethodIntro goals={v2?.goals ?? []} name={name} onDone={() => setPhase("building")} />;
  if (phase === "building") return <Building onDone={() => { success(); setPhase("plan"); }} />;
  // the tree is planted right after the plan (the mission of the Shams Method), unless one already grows
  const hasTree = readGarden().trees.length > 0;
  if (phase === "plan" && plan && v2) return <PathView plan={plan} v2={v2} name={name} hasTree={hasTree} onNext={() => (hasTree ? afterPlan() : setPhase("garden"))} />;
  if (phase === "plan" && plan) return <PlanView plan={plan} onNext={() => (hasTree ? afterPlan() : setPhase("garden"))} />;
  if (phase === "garden") return <PlantFlow minutes={plan?.answers.minutes} onDone={afterPlan} onLater={afterPlan} />;
  if (phase === "paywall") return <Day1Paywall plan={plan} onDone={done} />;

  const q = Q[step];
  const opt = (key: string, on: boolean, label: string, desc: string | null, onPress: () => void, badge?: string, multi?: boolean) => (
    <Pressable key={key} onPress={onPress} disabled={!!reply} accessibilityRole={multi ? "checkbox" : "button"} accessibilityState={multi ? { checked: on } : { selected: on }} accessibilityLabel={desc ? `${label}. ${desc}` : label}
      style={({ pressed }) => ({ flexDirection: "row", alignItems: "center", gap: 12, borderRadius: R.md, borderWidth: 1, paddingHorizontal: 16, paddingVertical: 14, minHeight: 56,
        borderColor: on ? stage.gold : pressed ? alpha(stage.gold, 0.6) : alpha(stage.gold, 0.22), backgroundColor: on ? alpha(stage.gold, 0.12) : pressed ? "rgba(255,255,255,0.06)" : "rgba(6,30,23,0.62)" })}>
      <View style={{ flex: 1 }}>
        <Text style={{ fontFamily: FONT.semibold, fontSize: 16, color: "#ffffff" }}>{label}</Text>
        {desc ? <Text style={{ fontFamily: FONT.regular, fontSize: 13, lineHeight: 18, color: stage.textMuted, marginTop: 3 }}>{desc}</Text> : null}
      </View>
      {badge ? <Text style={{ fontFamily: FONT.bold, fontSize: 11, letterSpacing: 1, color: stage.gold, borderWidth: 1, borderColor: stage.goldSoft, borderRadius: R.pill, paddingHorizontal: 8, paddingVertical: 2 }}>{badge}</Text> : null}
      {multi ? (
        <View style={{ width: 22, height: 22, borderRadius: 6, borderWidth: 1.5, borderColor: on ? stage.gold : alpha(stage.gold, 0.45), backgroundColor: on ? stage.gold : "transparent", alignItems: "center", justifyContent: "center" }}>
          {on ? <Icon name="check" color="#1a140a" size={14} /> : null}
        </View>
      ) : on ? <Icon name="checkCircle" color={stage.gold} size={20} /> : null}
    </Pressable>
  );
  const title = (s: string) => <Display size="title1" onStage style={{ marginBottom: 16 }}>{s}</Display>;
  const note = (s: string) => <Text style={{ fontFamily: FONT.regular, fontSize: 13, lineHeight: 19, color: stage.textMuted, marginTop: 14 }}>{s}</Text>;
  const multiNext = (n: number, text: string, allowEmpty = false) => (
    <GoldButton title={p.next} disabled={!reply && !allowEmpty && n === 0} onPress={() => answer({}, text)} style={{ marginTop: 18 }} />
  );

  return (
    <JourneyStage progress={(step + 1) / Q.length} horizon={0.5}>
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
      <ScrollView ref={scroller} contentContainerStyle={{ padding: 20, paddingTop: 28, paddingBottom: insets.bottom + 24 }} keyboardShouldPersistTaps="handled" automaticallyAdjustKeyboardInsets>
        {q === "lang" ? (
          <>
            {title(p.qLang)}
            <View style={{ gap: 8 }}>{LANGS.map((l: Lang) => opt(l, lang === l, langLabel(l), null, () => {
              tick();
              save({}, step + 1); // saved first: a right-to-left switch reloads the app
              if (l !== lang) setSetting(l);
              setReply(o.r_lang);
            }))}</View>
          </>
        ) : null}
        {q === "name" ? (
          <>
            {title(o.qName)}
            <TextInput value={name} onChangeText={setName} maxLength={40} placeholder={o.namePh} placeholderTextColor="rgba(255,255,255,0.45)" accessibilityLabel={o.qName}
              autoCapitalize="words" autoCorrect={false} textContentType="givenName" autoComplete="name-given" returnKeyType="done" editable={!reply}
              onSubmitEditing={() => { if (name.trim()) { saveName(name); answer({}, o.r_name); } }}
              style={{ borderRadius: R.lg, borderWidth: 1, borderColor: alpha(stage.gold, 0.4), color: "#fff", fontFamily: FONT.regular, fontSize: 17, paddingHorizontal: 14, paddingVertical: 12, backgroundColor: "rgba(255,255,255,0.05)" }} />
            {note(o.nameD)}
            {!reply ? (
              <>
                <GoldButton title={p.next} disabled={!name.trim()} onPress={() => { saveName(name); answer({}, o.r_name); }} style={{ marginTop: 18 }} />
                <Text onPress={() => { setName(""); saveName(""); tick(); save({}, step + 1); setStep(step + 1); }} accessibilityRole="button" style={{ fontFamily: FONT.medium, fontSize: 14, color: stage.textMuted, textAlign: "center", paddingVertical: 14 }}>{o.nameSkip}</Text>
              </>
            ) : null}
          </>
        ) : null}
        {q === "goals" ? (
          <>
            {title(o.qGoals)}
            {note(o.chooseMany)}
            <View style={{ gap: 8, marginTop: 12 }}>{GOALS_V2.map((g) => opt(g, !!draft.goals?.includes(g), goalLabel(g), g === "islam" || g === "children" ? o[`g_${g}D`] : p[`g_${g}D`], () => pick({ goals: toggle(draft.goals, g) }), undefined, true))}</View>
            {!reply ? multiNext(draft.goals?.length ?? 0, o.r_goals) : null}
          </>
        ) : null}
        {q === "interests" ? (
          <>
            {title(o.qInterests)}
            {note(o.chooseMany)}
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 12 }}>
              {INTERESTS.map((i) => {
                const on = !!draft.interests?.includes(i);
                return (
                  <Pressable key={i} disabled={!!reply} onPress={() => pick({ interests: toggle(draft.interests, i) })} accessibilityRole="checkbox" accessibilityState={{ checked: on }} accessibilityLabel={o[`i_${i}`]}
                    style={({ pressed }) => ({ flexDirection: "row", alignItems: "center", gap: 6, borderRadius: R.pill, borderWidth: 1, paddingHorizontal: 14, paddingVertical: 10, minHeight: 44,
                      borderColor: on ? stage.gold : alpha(stage.gold, 0.3), backgroundColor: on ? alpha(stage.gold, 0.16) : pressed ? "rgba(255,255,255,0.06)" : "rgba(6,30,23,0.62)" })}>
                    {on ? <Icon name="check" color={stage.gold} size={14} /> : null}
                    <Text style={{ fontFamily: FONT.semibold, fontSize: 15, color: "#ffffff" }}>{o[`i_${i}`]}</Text>
                  </Pressable>
                );
              })}
            </View>
            {!reply ? multiNext(draft.interests?.length ?? 0, o.r_interests) : null}
          </>
        ) : null}
        {q === "challenges" ? (
          <>
            {title(o.qChallenges)}
            {note(o.challengesD)}
            <View style={{ gap: 8, marginTop: 12 }}>{CHALLENGES.map((c) => opt(c, !!draft.challenges?.includes(c), o[`c_${c}`], null, () => pick({ challenges: toggle(draft.challenges, c) }), undefined, true))}</View>
            {!reply ? multiNext(draft.challenges?.length ?? 0, draft.challenges?.length ? o.r_challenges : o.r_challengesNone, true) : null}
          </>
        ) : null}
        {q === "level" ? (
          <>
            {title(p.qLevel)}
            <View style={{ gap: 8 }}>{LEVELS.map((l) => opt(l, draft.level === l, p[`l_${l}`], p[`l_${l}D`], () => answer({ level: l }, l === "none" ? o.r_level0 : o.r_level)))}</View>
          </>
        ) : null}
        {q === "minutes" ? (
          <>
            {title(p.qMinutes)}
            <View style={{ flexDirection: "row", gap: 8 }}>
              {MINUTES.map((m) => {
                const on = draft.minutes === m;
                return (
                  <Pressable key={m} disabled={!!reply} onPress={() => answer({ minutes: m }, fmt(o.r_minutes, { n: m }))} accessibilityRole="button" accessibilityState={{ selected: on }} accessibilityLabel={`${m} ${p.min}`}
                    style={({ pressed }) => ({ flex: 1, alignItems: "center", paddingVertical: 18, borderRadius: R.lg, borderWidth: 1, borderColor: on ? stage.gold : alpha(stage.gold, 0.25), backgroundColor: on ? alpha(stage.gold, 0.12) : pressed ? "rgba(255,255,255,0.06)" : "rgba(6,30,23,0.62)" })}>
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
              answer({ reciter: r.folder }, o.r_reciter);
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
              answer({}, o.r_tradition);
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
                answer({ prayer: true }, o.r_prayer);
              })}
              {opt("no", draft.prayer === false, p.no, null, () => answer({ prayer: false }, o.r_prayer))}
            </View>
            {note(p.prayerD)}
          </>
        ) : null}
        {q === "motivation" ? (
          <>
            {title(p.qMotivation)}
            <View style={{ gap: 8 }}>{MOTIVATIONS.map((m) => opt(m, draft.motivation === m, p[`m_${m}`], null, () => answer({ motivation: m }, o.r_motivation)))}</View>
          </>
        ) : null}
        {reply ? <View style={{ marginTop: 20 }}><ReplyCard title={hi} body={reply} cta={p.next} onNext={go} /></View> : null}
      </ScrollView>
    </JourneyStage>
  );
}

/** "Building your plan …": three lines that tick off one after another (about 2.4 s; instant with Reduce Motion) */
function Building({ onDone }: { onDone: () => void }) {
  const p = usePlanT();
  const [n, setN] = useState(0);
  const [still, setStill] = useState(false);
  const spin = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    let live = true;
    const loop = Animated.loop(Animated.timing(spin, { toValue: 1, duration: 1400, easing: Easing.linear, useNativeDriver: true }));
    loop.start();
    AccessibilityInfo.isReduceMotionEnabled().then((reduce) => {
      if (!live) return;
      setStill(reduce);
      const gap = reduce ? 250 : 750;
      [1, 2, 3].forEach((i) => setTimeout(() => { if (live) { setN(i); tick(); } }, gap * i));
      setTimeout(() => { if (live) onDone(); }, gap * 3 + 450);
    }).catch(() => onDone());
    return () => { live = false; loop.stop(); };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <JourneyStage progress={0.92} horizon={0.5} veil={0.5}>
      <View style={{ flex: 1, padding: 28, alignItems: "center", justifyContent: "center" }}>
        <View style={{ marginBottom: 10 }}><GoldStarSpinner still={still} /></View>
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
    </JourneyStage>
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
