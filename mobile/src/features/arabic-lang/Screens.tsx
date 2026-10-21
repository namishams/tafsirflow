import { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, Share, Text, TextInput, View } from "react-native";
import { router, Stack, type Href } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Arcade, GoldButton, GoldCard, GoldProgress, OutlineButton, SmallStar, Stage, StarNumber, Wordmark } from "@/components/brand";
import { Icon } from "@/components/icons";
import { goBack } from "@/components/page";
import { useLang, useT } from "@/i18n";
import { useEntitlement } from "@/lib/entitlements";
import { ARABIC_FONT, FONT, R, stage as ST, useTheme } from "@/lib/theme";
import { meaning } from "@/web/vocabI18n";
import { findWordPosition, normalizeArabic } from "@/web/vocabStudy";
import type { Word } from "@/web/vocab";
import { gEvent } from "@/features/feed/gamify";
import { success, tick } from "@/features/feed/haptics";
import { addOwnCards } from "@/features/srs/store";
import { loadVerse, type VWord } from "@/features/srs/verse";
import { StepIn, useNudge } from "../coursekit/motion";
import { useArabicVoice } from "../coursekit/voice";
import { buildLesson, prepareLesson, scored, type Ex } from "./build";
import { ALL_WORDS, FREE_UNITS, LESSONS, LEVELS, PASS, UNITS, deckWords, isFreeUnit, lessonById, unitOfLesson } from "./curriculum";
import { Ar, ChooseCard, DialogueView, IntroCard, SpeakCard, SpotCard, TilesCard, TypeCard } from "./Exercises";
import { isDone, lessonOpen, nextLesson, saveLesson, setGoal, streak, todayCount, useLangProgress } from "./progress";
import { useLT } from "./texts";
import { tx, type Lesson, type Unit } from "./types";
import { ExamBar, ExamBlocked, ExamVerdict } from "@/features/exam/ExamUI";
import { useExamSession } from "@/features/exam/integrity";
import { arabicRecitePlan } from "@/features/exam/plans";
import { VerifiedCertLink } from "@/features/exam/Certificates";

const open = (id: string) => router.push(`/arabic/lang/${id}` as Href);
const RED = "#a57c29";

function BackButton({ onStage }: { onStage?: boolean }) {
  const t = useTheme();
  const tr = useT();
  return (
    <Pressable onPress={goBack} accessibilityRole="button" accessibilityLabel={tr("common.back")} hitSlop={12} style={{ width: 40, height: 40, justifyContent: "center", marginStart: -6 }}>
      <Icon name="chevronLeft" size={24} color={onStage ? "#fff" : t.ink} />
    </Pressable>
  );
}

// ---------- entry card (Arabic page, Masterclass tab) ----------
export function LangCourseCard() {
  const lt = useLT();
  const p = useLangProgress();
  const started = Object.keys(p.done).length > 0;
  return (
    <Pressable onPress={() => router.push("/arabic/lang" as Href)} accessibilityRole="button" accessibilityLabel={lt("title")}
      style={{ borderRadius: R.card, overflow: "hidden", backgroundColor: ST.bg, borderWidth: 1, borderColor: "rgba(201,166,94,0.45)", padding: 20, gap: 8 }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}><SmallStar size={12} color={ST.gold} /><Text style={{ fontFamily: FONT.semibold, fontSize: 11.5, letterSpacing: 2, textTransform: "uppercase", color: ST.gold }}>{lt("kicker")} · A1–B2</Text></View>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
        <Text style={{ flex: 1, fontFamily: FONT.display, fontSize: 26, lineHeight: 30, color: "#fff" }}>{lt("title")}</Text>
        <Text allowFontScaling={false} style={{ fontFamily: ARABIC_FONT, fontSize: 30, lineHeight: 56, color: ST.cream }}>{"ع ل م"}</Text>
      </View>
      <Text style={{ fontFamily: FONT.regular, fontSize: 14.5, lineHeight: 21, color: "rgba(255,255,255,0.75)" }}>{lt("cardLead")}</Text>
      <View style={{ marginTop: 8, alignSelf: "flex-start", height: 40, paddingHorizontal: 16, borderRadius: R.pill, backgroundColor: ST.gold, justifyContent: "center" }}>
        <Text style={{ fontFamily: FONT.bold, fontSize: 14, color: ST.bg }}>{started ? lt("continue") : lt("start")}</Text>
      </View>
    </Pressable>
  );
}

// ---------- the Pro unlock card ----------
export function UnlockCard() {
  const lt = useLT();
  const ent = useEntitlement("arabicLanguage");
  if (ent.allowed) return null;
  return (
    <Stage rounded={R.card} style={{ borderWidth: 1, borderColor: "rgba(201,166,94,0.5)" }}>
      <View style={{ padding: 22, gap: 10 }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}><SmallStar size={12} color={ST.gold} /><Text style={{ fontFamily: FONT.semibold, fontSize: 11.5, letterSpacing: 2, textTransform: "uppercase", color: ST.gold }}>{lt("unlockKicker")}</Text></View>
        <Text style={{ fontFamily: FONT.display, fontSize: 25, lineHeight: 30, color: "#fff" }}>{lt("unlockTitle")}</Text>
        <Text style={{ fontFamily: FONT.regular, fontSize: 15, lineHeight: 23, color: "rgba(255,255,255,0.75)" }}>{lt("unlockLead")}</Text>
        <View style={{ gap: 8, marginTop: 4 }}>
          {(["unlockList1", "unlockList2", "unlockList3"] as const).map((k) => (
            <View key={k} style={{ flexDirection: "row", alignItems: "center", gap: 10 }}><Icon name="check" size={16} color={ST.gold} /><Text style={{ flex: 1, fontFamily: FONT.medium, fontSize: 14.5, color: "#eef0f3" }}>{lt(k)}</Text></View>
          ))}
        </View>
        <GoldButton title={lt("unlockCta")} onPress={ent.upsell} style={{ marginTop: 10 }} />
      </View>
      <Arcade />
    </Stage>
  );
}

// ---------- path ----------
export function LangPathScreen() {
  const t = useTheme();
  const lt = useLT();
  const { lang } = useLang();
  const insets = useSafeAreaInsets();
  const p = useLangProgress();
  const ent = useEntitlement("arabicLanguage");
  const next = nextLesson(p);
  const today = todayCount(p);
  const days = streak(p);
  const go = (u: Unit, l: Lesson) => (!isFreeUnit(u.n) && !ent.allowed ? ent.upsell() : lessonOpen(p, l.id) ? open(l.id) : undefined);
  const nextUnit = next ? unitOfLesson(next.id) : undefined;

  return (
    <View style={{ flex: 1, backgroundColor: t.bg }}>
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + 48 }}>
        <Stage hairlines={false}>
          <View style={{ paddingHorizontal: 20, paddingTop: insets.top + 8, paddingBottom: 32 }}>
            <BackButton onStage />
            <Text style={{ marginTop: 10, fontFamily: FONT.semibold, fontSize: 12, letterSpacing: 2.4, textTransform: "uppercase", color: ST.gold }}>{lt("kicker")}</Text>
            <Text accessibilityRole="header" style={{ marginTop: 12, fontFamily: FONT.display, fontSize: 34, lineHeight: 38, color: "#eef0f3" }}>{lt("title")}</Text>
            <Text style={{ marginTop: 14, fontFamily: FONT.regular, fontSize: 16, lineHeight: 25, color: "rgba(255,255,255,0.72)" }}>{lt("lead")}</Text>
            {next && nextUnit ? <GoldButton title={`${Object.keys(p.done).length ? lt("continue") : lt("start")} · ${tx(next.title, lang)}`} onPress={() => go(nextUnit, next)} style={{ marginTop: 22 }} /> : null}
          </View>
          <Arcade />
        </Stage>

        <View style={{ paddingHorizontal: 16, marginTop: 20, gap: 16 }}>
          <GoldCard>
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
              <Text style={{ fontFamily: FONT.bold, fontSize: 17, color: t.ink }}>{lt("goal")}</Text>
              {days ? <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}><Icon name="flame" size={16} color={t.gold} /><Text style={{ fontFamily: FONT.semibold, fontSize: 13, color: t.muted }}>{lt("streak", { n: days })}</Text></View> : null}
            </View>
            <Text style={{ marginTop: 6, fontFamily: FONT.regular, fontSize: 14, color: today >= p.goal ? t.accent : t.muted }}>{today >= p.goal ? lt("goalMet") : lt("today", { d: today, n: p.goal })}</Text>
            <View style={{ marginTop: 10 }}><GoldProgress value={Math.min(1, today / p.goal)} /></View>
            <View accessibilityRole="radiogroup" style={{ flexDirection: "row", gap: 8, marginTop: 12 }}>
              {[1, 2, 3].map((n) => (
                <Pressable key={n} onPress={() => setGoal(n)} accessibilityRole="radio" accessibilityState={{ selected: p.goal === n }}
                  style={{ flex: 1, height: 38, borderRadius: R.pill, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: p.goal === n ? t.accent : t.line, backgroundColor: p.goal === n ? t.accentSoft : t.surface }}>
                  <Text style={{ fontFamily: FONT.semibold, fontSize: 13, color: p.goal === n ? t.accent : t.muted }}>{lt("goalN", { n })}</Text>
                </Pressable>
              ))}
            </View>
          </GoldCard>

          <View style={{ flexDirection: "row", gap: 12 }}>
            <Pressable onPress={() => router.push("/arabic/lang/roots" as Href)} accessibilityRole="button" style={{ flex: 1, borderRadius: R.card, borderWidth: 1, borderColor: t.line, backgroundColor: t.surface, padding: 14, gap: 4 }}>
              <Text allowFontScaling={false} style={{ fontFamily: ARABIC_FONT, fontSize: 22, lineHeight: 38, color: t.gold }}>{"ك ت ب"}</Text>
              <Text style={{ fontFamily: FONT.bold, fontSize: 15, color: t.ink }}>{lt("roots")}</Text>
            </Pressable>
            <Pressable onPress={() => router.push("/arabic/lang/certificate" as Href)} accessibilityRole="button" style={{ flex: 1, borderRadius: R.card, borderWidth: 1, borderColor: t.line, backgroundColor: t.surface, padding: 14, gap: 4 }}>
              <View style={{ height: 38, flexDirection: "row", alignItems: "center", gap: 6 }}>
                {LEVELS.map(({ level }) => <Text key={level} style={{ fontFamily: FONT.bold, fontSize: 13, color: p.certs[level] ? t.gold : t.line }}>{level}</Text>)}
              </View>
              <Text style={{ fontFamily: FONT.bold, fontSize: 15, color: t.ink }}>{lt("certs")}</Text>
            </Pressable>
          </View>

          {UNITS.map((u) => {
            const locked = !isFreeUnit(u.n) && !ent.allowed;
            const done = u.lessons.filter((l) => isDone(p, l.id)).length;
            return (
              <View key={u.n} style={{ gap: 12 }}>
                {u.n === FREE_UNITS + 1 ? <UnlockCard /> : null}
                <View style={{ marginTop: 8, flexDirection: "row", alignItems: "center", gap: 12 }}>
                  <StarNumber n={u.n} size={44} active={done > 0} />
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontFamily: FONT.semibold, fontSize: 11.5, letterSpacing: 1.6, textTransform: "uppercase", color: t.gold }}>{`${lt("unit", { n: u.n })} · ${u.level}${isFreeUnit(u.n) ? ` · ${lt("free")}` : locked ? ` · ${lt("pro")}` : ""}`}</Text>
                    <Text accessibilityRole="header" style={{ fontFamily: FONT.display, fontSize: 21, lineHeight: 26, color: t.ink }}>{tx(u.title, lang)}</Text>
                  </View>
                  {locked ? <Icon name="lock" size={18} color={t.muted} /> : null}
                </View>
                <Text style={{ fontFamily: FONT.regular, fontSize: 14, lineHeight: 21, color: t.muted }}>{tx(u.lead, lang)}</Text>
                <Text style={{ fontFamily: FONT.semibold, fontSize: 12.5, color: t.muted }}>{lt("lessonsDone", { d: done, n: u.lessons.length })}</Text>
                <View style={{ gap: 10 }}>
                  {u.lessons.map((l, i) => {
                    const d = isDone(p, l.id);
                    const can = !locked && lessonOpen(p, l.id);
                    const cur = next?.id === l.id;
                    const off = i % 4 === 1 ? 24 : i % 4 === 3 ? -24 : 0;
                    return (
                      <Pressable key={l.id} onPress={() => go(u, l)} disabled={!locked && !can} accessibilityRole="button"
                        accessibilityLabel={`${tx(l.title, lang)}${!locked && !can ? `, ${lt("locked")}` : ""}`} accessibilityState={{ disabled: !locked && !can, selected: d }}
                        style={{ marginStart: 24 + off, marginEnd: 24 - off, flexDirection: "row", alignItems: "center", gap: 12, padding: 12, borderRadius: R.pill, borderWidth: cur ? 2 : 1, borderColor: cur ? t.gold : t.line, backgroundColor: d ? t.accentSoft : t.surface, opacity: can || locked ? 1 : 0.55 }}>
                        <View style={{ width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center", backgroundColor: d ? t.accent : l.test ? t.gold : t.bg, borderWidth: 1, borderColor: d ? t.accent : t.line }}>
                          {d ? <Icon name="check" size={18} color="#fff" /> : locked || !can ? <Icon name="lock" size={15} color={l.test ? "#fff" : t.muted} /> : l.test ? <Icon name="trophy" size={17} color="#fff" /> : <Text style={{ fontFamily: FONT.bold, fontSize: 13, color: t.ink }}>{i + 1}</Text>}
                        </View>
                        <Text style={{ flex: 1, fontFamily: cur ? FONT.bold : FONT.semibold, fontSize: 15, color: t.ink }} numberOfLines={2}>{tx(l.title, lang)}</Text>
                        {p.done[l.id] ? <Text style={{ fontFamily: FONT.semibold, fontSize: 12, color: t.muted }}>{`${Math.round(p.done[l.id].score * 100)} %`}</Text> : null}
                      </Pressable>
                    );
                  })}
                </View>
              </View>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}

// ---------- lesson ----------
type Q = { ex: Ex; first: boolean };
export function LangLessonScreen({ id }: { id: string }) {
  const t = useTheme();
  const lt = useLT();
  const { lang } = useLang();
  const insets = useSafeAreaInsets();
  const p = useLangProgress();
  const ent = useEntitlement("arabicLanguage");
  const lesson = lessonById(id);
  const unit = unitOfLesson(id);
  const { canSpeak } = useArabicVoice();
  const [phase, setPhase] = useState<"explain" | "dialogue" | "ex" | "done">("explain");
  const [queue, setQueue] = useState<Q[]>([]);
  const [idx, setIdx] = useState(0);
  const [fb, setFb] = useState<{ ok: boolean; correct: string } | null>(null);
  const [right, setRight] = useState(0);
  const [result, setResult] = useState<{ score: number; added: number } | null>(null);
  const nudge = useNudge();
  // unit tests follow the exam rules (src/features/exam); the final test of a level leads to a verifiable certificate
  const ex = useExamSession(lesson?.test && unit ? "ar-unit" : null, String(unit?.n ?? ""), { active: phase === "ex", recite: (rand) => arabicRecitePlan(rand) });

  useEffect(() => { setPhase(lesson?.test ? "explain" : "explain"); setIdx(0); setFb(null); setRight(0); setResult(null); }, [id, lesson?.test]);

  if (!lesson || !unit) return <View style={{ flex: 1, backgroundColor: t.bg }}><Stack.Screen options={{ headerShown: false }} /></View>;
  const gated = !isFreeUnit(unit.n) && !ent.allowed;
  const total = queue.filter((q) => q.first && scored(q.ex)).length;

  const begin = () => {
    const go = () => {
      setQueue(buildLesson(lesson, lang, { canSpeak }).map((ex) => ({ ex, first: true })));
      setIdx(0); setRight(0); setFb(null); setResult(null);
      setPhase("ex");
    };
    // the Quran frequency track loads its words first; on failure the lesson starts with what is cached
    prepareLesson(lesson, lang).then(go, go);
  };
  const onCheck = (ok: boolean, correct: string) => {
    const q = queue[idx];
    setFb({ ok, correct });
    if (ok) { tick(); if (q.first) setRight((r) => r + 1); }
    else { nudge.run(); setQueue((qs) => [...qs, { ex: q.ex, first: false }]); }
    if (q.first) gEvent({ t: "quiz", right: ok });
  };
  const finish = (rightNow: number) => {
    const score = total ? rightNow / total : 1;
    const passed = !lesson.test || score >= PASS;
    let added = 0;
    if (passed) {
      saveLesson(lesson.id, score);
      const ids = deckWords(lesson).map((w) => `word:${w.id}`);
      if (ids.length) { added = addOwnCards(ids); if (added) gEvent({ t: "words", n: added }); }
      success();
    }
    setResult({ score, added });
    setPhase("done");
    if (lesson.test) ex.finish(rightNow, total);
  };
  const advance = () => {
    setFb(null);
    if (idx + 1 >= queue.length) finish(right);
    else setIdx(idx + 1);
  };
  const skip = () => { setQueue((qs) => qs.map((q, i) => (i === idx ? { ...q, first: false } : q))); advance(); };

  const cur = queue[idx];
  const doneN = queue.slice(0, idx).length;
  const nextL = LESSONS[LESSONS.findIndex((l) => l.id === lesson.id) + 1];

  return (
    <View style={{ flex: 1, backgroundColor: t.bg }}>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={{ paddingTop: insets.top + 6, paddingHorizontal: 16, paddingBottom: 10, flexDirection: "row", alignItems: "center", gap: 12, borderBottomWidth: 1, borderColor: t.line, backgroundColor: t.surface }}>
        <Pressable onPress={goBack} accessibilityRole="button" accessibilityLabel={lt("quit")} hitSlop={12}><Icon name="close" size={22} color={t.ink} /></Pressable>
        <View style={{ flex: 1 }}>
          {phase === "ex" ? <GoldProgress value={queue.length ? doneN / queue.length : 0} /> : <Text style={{ fontFamily: FONT.semibold, fontSize: 13, color: t.muted }} numberOfLines={1}>{`${lt("unit", { n: unit.n })} · ${unit.level}`}</Text>}
        </View>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 140, gap: 16 }} keyboardShouldPersistTaps="handled">
        {gated ? <UnlockCard /> : !lessonOpen(p, lesson.id) ? (
          <GoldCard><Text style={{ fontFamily: FONT.regular, fontSize: 15, color: t.ink }}>{lt("locked")}</Text></GoldCard>
        ) : phase === "explain" ? (
          <StepIn style={{ gap: 16 }}>
            <Text accessibilityRole="header" style={{ fontFamily: FONT.display, fontSize: 28, lineHeight: 33, color: t.ink }}>{tx(lesson.title, lang)}</Text>
            <GoldCard>
              <Text style={{ fontFamily: FONT.semibold, fontSize: 11.5, letterSpacing: 1.6, textTransform: "uppercase", color: t.gold }}>{lt("explain")}</Text>
              <Text style={{ marginTop: 8, fontFamily: FONT.regular, fontSize: 16, lineHeight: 25, color: t.ink }}>{tx(lesson.expl, lang)}</Text>
            </GoldCard>
            {lesson.conj ? <ConjTable lesson={lesson} /> : null}
            {lesson.roots ? <OutlineButton title={lt("openRoots")} onPress={() => router.push(`/arabic/lang/roots?r=${encodeURIComponent(lesson.roots![0])}` as Href)} /> : null}
            <GoldButton title={lt("startEx")} onPress={() => (lesson.lines ? setPhase("dialogue") : begin())} />
          </StepIn>
        ) : phase === "dialogue" && lesson.lines ? (
          <StepIn><DialogueView lines={lesson.lines} onNext={begin} /></StepIn>
        ) : phase === "ex" && lesson.test && ex.phase === "blocked" ? <ExamBlocked session={ex} />
        : phase === "ex" && lesson.test && ex.phase === "void" ? <View style={{ gap: 12 }}><ExamVerdict session={ex} /><OutlineButton title={lt("toMap")} onPress={goBack} /></View>
        : phase === "ex" && lesson.test && !ex.ready ? <ActivityIndicator color={t.accent} />
        : phase === "ex" && cur ? (
          <StepIn key={idx}>
            {lesson.test ? <View style={{ marginBottom: 12 }}><ExamBar session={ex} showRules={idx === 0} /></View> : null}
            <View pointerEvents={fb ? "none" : "auto"}>
              {cur.ex.k === "intro" ? <IntroCard item={cur.ex.item} onNext={advance} />
                : cur.ex.k === "choose" || cur.ex.k === "listen" || cur.ex.k === "conj" ? <ChooseCard ex={cur.ex} onCheck={onCheck} />
                : cur.ex.k === "tiles" ? <TilesCard ex={cur.ex} onCheck={onCheck} />
                : cur.ex.k === "type" ? <TypeCard ex={cur.ex} onCheck={onCheck} />
                : cur.ex.k === "speak" ? <SpeakCard ex={cur.ex} onCheck={onCheck} onSkip={skip} />
                : <SpotCard ex={cur.ex} onCheck={onCheck} />}
            </View>
          </StepIn>
        ) : phase === "done" && result ? (
          <StepIn style={{ gap: 14, alignItems: "stretch" }}>
            <Stage rounded={R.card}>
              <View style={{ padding: 24, alignItems: "center", gap: 8 }}>
                <Icon name={result.score >= PASS || !lesson.test ? "trophy" : "repeat"} size={34} color={ST.gold} />
                <Text accessibilityRole="header" style={{ fontFamily: FONT.display, fontSize: 26, color: "#fff", textAlign: "center" }}>
                  {lesson.test ? (result.score >= PASS ? lt("testPassed") : lt("almost")) : lt("complete")}
                </Text>
                <Text style={{ fontFamily: FONT.regular, fontSize: 15, color: "rgba(255,255,255,0.75)", textAlign: "center" }}>{lt("score", { p: Math.round(result.score * 100) })}</Text>
                {lesson.test && result.score < PASS ? <Text style={{ fontFamily: FONT.regular, fontSize: 14, color: "rgba(255,255,255,0.7)", textAlign: "center" }}>{lt("needPass", { p: Math.round(PASS * 100) })}</Text> : null}
                {result.added ? <Text style={{ fontFamily: FONT.semibold, fontSize: 14, color: ST.cream, textAlign: "center" }}>{lt("wordsAdded", { n: result.added })}</Text> : null}
              </View>
              <Arcade />
            </Stage>
            {lesson.test ? <ExamVerdict session={ex} /> : null}
            {nextL && (result.score >= PASS || !lesson.test) ? <GoldButton title={lt("nextLesson")} onPress={() => router.replace(`/arabic/lang/${nextL.id}` as Href)} /> : null}
            {ex.phase === "recite" || ex.phase === "submitting" ? null : <OutlineButton title={lt("retry")} onPress={begin} />}
            <OutlineButton title={lt("toMap")} onPress={goBack} />
            {unit.n === FREE_UNITS && lesson.test && result.score >= PASS ? <UnlockCard /> : null}
          </StepIn>
        ) : null}
      </ScrollView>

      {fb ? (
        <View accessibilityLiveRegion="polite" style={{ position: "absolute", left: 0, right: 0, bottom: 0, paddingHorizontal: 16, paddingTop: 14, paddingBottom: insets.bottom + 14, backgroundColor: fb.ok ? t.accentSoft : t.surface, borderTopWidth: 2, borderColor: fb.ok ? t.accent : RED, gap: 8 }}>
          <Text style={{ fontFamily: FONT.bold, fontSize: 17, color: fb.ok ? t.accent : RED }}>{fb.ok ? lt("right") : lt("wrong")}</Text>
          {!fb.ok && fb.correct ? <View style={nudge.style}><Ar size={24}>{fb.correct}</Ar></View> : null}
          <Pressable onPress={advance} accessibilityRole="button" style={{ height: 50, borderRadius: R.pill, alignItems: "center", justifyContent: "center", backgroundColor: fb.ok ? t.accent : RED }}>
            <Text style={{ fontFamily: FONT.bold, fontSize: 16, color: "#fff" }}>{lt("next")}</Text>
          </Pressable>
        </View>
      ) : null}
    </View>
  );
}

function ConjTable({ lesson }: { lesson: Lesson }) {
  const t = useTheme();
  const { lang } = useLang();
  const c = lesson.conj!;
  return (
    <View style={{ borderRadius: R.card, borderWidth: 1, borderColor: t.line, backgroundColor: t.surface, overflow: "hidden" }}>
      <Text style={{ padding: 12, fontFamily: FONT.bold, fontSize: 15, color: t.ink, borderBottomWidth: 1, borderColor: t.line }}>{tx(c.title, lang)}</Text>
      {c.rows.map(([label, form, tr], i) => (
        <View key={i} style={{ flexDirection: "row", alignItems: "center", paddingHorizontal: 12, borderTopWidth: i ? 1 : 0, borderColor: t.line }}>
          <Text style={{ width: 90, fontFamily: FONT.regular, fontSize: 13, color: t.muted }}>{tr}</Text>
          <View style={{ flex: 1 }}><Ar size={22}>{form}</Ar></View>
          <View style={{ width: 70 }}><Ar size={18} color={t.gold}>{label}</Ar></View>
        </View>
      ))}
    </View>
  );
}

// ---------- root explorer ----------
const rootKey = (r: string) => normalizeArabic(r.replace(/\s+/g, ""));
const ROOTS = (() => {
  const m = new Map<string, { root: string; n: number }>();
  for (const w of ALL_WORDS) if (w.root) { const k = rootKey(w.root); const e = m.get(k); if (e) e.n++; else m.set(k, { root: w.root, n: 1 }); }
  return [...m.values()].sort((a, b) => b.n - a.n);
})();

export function RootExplorerScreen({ initial }: { initial?: string }) {
  const t = useTheme();
  const lt = useLT();
  const { lang } = useLang();
  const insets = useSafeAreaInsets();
  const [q, setQ] = useState(initial ?? "");
  const key = rootKey(q);
  const words = useMemo(() => {
    if (key.length < 2) return [];
    const seen = new Set<string>();
    return ALL_WORDS.filter((w) => w.root && rootKey(w.root) === key && !seen.has(w.ar) && (seen.add(w.ar), true));
  }, [key]);
  return (
    <View style={{ flex: 1, backgroundColor: t.bg }}>
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + 48 }} keyboardShouldPersistTaps="handled">
        <Stage hairlines={false}>
          <View style={{ paddingHorizontal: 20, paddingTop: insets.top + 8, paddingBottom: 28 }}>
            <BackButton onStage />
            <Text accessibilityRole="header" style={{ marginTop: 10, fontFamily: FONT.display, fontSize: 32, lineHeight: 36, color: "#eef0f3" }}>{lt("roots")}</Text>
            <Text style={{ marginTop: 12, fontFamily: FONT.regular, fontSize: 15.5, lineHeight: 24, color: "rgba(255,255,255,0.72)" }}>{lt("rootsLead")}</Text>
            <TextInput value={q} onChangeText={setQ} placeholder={lt("rootPh")} placeholderTextColor="rgba(255,255,255,0.45)" autoCorrect={false} accessibilityLabel={lt("rootPh")}
              style={{ marginTop: 18, height: 56, borderRadius: R.card, borderWidth: 1, borderColor: "rgba(201,166,94,0.5)", backgroundColor: "rgba(255,255,255,0.06)", paddingHorizontal: 16, fontFamily: ARABIC_FONT, fontSize: 24, color: "#fff", textAlign: "right", writingDirection: "rtl" }} />
          </View>
          <Arcade />
        </Stage>
        <View style={{ padding: 16, gap: 12 }}>
          <Text style={{ fontFamily: FONT.semibold, fontSize: 12, letterSpacing: 1.6, textTransform: "uppercase", color: t.gold }}>{lt("rootPick")}</Text>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
            {ROOTS.slice(0, 18).map((r) => (
              <Pressable key={r.root} onPress={() => { tick(); setQ(r.root); }} accessibilityRole="button" accessibilityState={{ selected: rootKey(r.root) === key }}
                style={{ paddingHorizontal: 12, borderRadius: R.pill, borderWidth: 1, borderColor: rootKey(r.root) === key ? t.accent : t.line, backgroundColor: rootKey(r.root) === key ? t.accentSoft : t.surface }}>
                <Text allowFontScaling={false} style={{ fontFamily: ARABIC_FONT, fontSize: 18, lineHeight: 34, color: t.ink }}>{r.root}</Text>
              </Pressable>
            ))}
          </View>
          {key.length >= 2 && !words.length ? <Text style={{ fontFamily: FONT.regular, fontSize: 14, color: t.muted }}>{lt("rootNone")}</Text> : null}
          {words.map((w, i) => <RootWord key={w.id} w={w} lang={lang} showVerse={i < 4} />)}
        </View>
      </ScrollView>
    </View>
  );
}

function RootWord({ w, lang, showVerse }: { w: Word; lang: string; showVerse: boolean }) {
  const t = useTheme();
  const lt = useLT();
  const [v, setV] = useState<{ words: VWord[]; pos: number | null } | null>(null);
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    if (!showVerse || !w.ex) return;
    let live = true;
    setLoading(true);
    loadVerse(w.ex.key, lang).then((d) => { if (live) setV({ words: d.words, pos: findWordPosition(w, d.words) }); }).catch(() => undefined).finally(() => { if (live) setLoading(false); });
    return () => { live = false; };
  }, [w, lang, showVerse]);
  return (
    <GoldCard star={false}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
        <View style={{ flex: 1 }}>
          <Text style={{ fontFamily: FONT.bold, fontSize: 16, color: t.ink }}>{meaning(w, lang)}</Text>
          <Text style={{ fontFamily: FONT.regular, fontSize: 13, color: t.muted }}>{w.tr}</Text>
        </View>
        <Ar size={28} center={false} color={t.gold}>{w.ar}</Ar>
      </View>
      {showVerse && w.ex ? (
        <View style={{ marginTop: 10, borderTopWidth: 1, borderColor: t.line, paddingTop: 8 }}>
          <Text style={{ fontFamily: FONT.semibold, fontSize: 11.5, letterSpacing: 1.2, textTransform: "uppercase", color: t.muted }}>{`${lt("inQuran")} · ${w.ex.key}`}</Text>
          {loading ? <ActivityIndicator color={t.accent} style={{ marginTop: 8 }} /> : v ? (
            <Text allowFontScaling={false} style={{ marginTop: 4, fontFamily: ARABIC_FONT, fontSize: 22, lineHeight: 42, color: t.ink, writingDirection: "rtl", textAlign: "right" }}>
              {v.words.map((x, i) => <Text key={x.position} style={x.position === v.pos ? { color: t.accent, textDecorationLine: "underline" } : undefined}>{`${i ? " " : ""}${x.text}`}</Text>)}
            </Text>
          ) : null}
        </View>
      ) : null}
    </GoldCard>
  );
}

// ---------- certificates ----------
export function LangCertificateScreen() {
  const t = useTheme();
  const lt = useLT();
  const insets = useSafeAreaInsets();
  const p = useLangProgress();
  const { lang } = useLang();
  return (
    <View style={{ flex: 1, backgroundColor: t.bg }}>
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView contentContainerStyle={{ padding: 16, paddingTop: insets.top + 8, paddingBottom: insets.bottom + 48, gap: 16 }}>
        <BackButton />
        <Text accessibilityRole="header" style={{ fontFamily: FONT.display, fontSize: 30, color: t.ink }}>{lt("certs")}</Text>
        <Text style={{ fontFamily: FONT.regular, fontSize: 14, lineHeight: 21, color: t.muted }}>{lt("certNote")}</Text>
        {LEVELS.map(({ level, lastUnit }) => {
          const c = p.certs[level];
          if (!c) return (
            <View key={level} style={{ borderRadius: R.card, borderWidth: 1, borderStyle: "dashed", borderColor: t.line, padding: 18, flexDirection: "row", alignItems: "center", gap: 12 }}>
              <Text style={{ fontFamily: FONT.display, fontSize: 26, color: t.line }}>{level}</Text>
              <Text style={{ flex: 1, fontFamily: FONT.regular, fontSize: 14, color: t.muted }}>{lt("certLocked", { n: lastUnit })}</Text>
              <Icon name="lock" size={16} color={t.muted} />
            </View>
          );
          const date = new Date(c.at).toLocaleDateString(lang);
          const msg = `${lt("certTitle", { level })} · ${lt("kicker")} · ${c.pct} % · ${date}`;
          return (
            <Stage key={level} rounded={R.card} style={{ borderWidth: 1, borderColor: "rgba(201,166,94,0.6)" }}>
              <View style={{ padding: 24, alignItems: "center", gap: 6 }}>
                <SmallStar size={14} color={ST.gold} />
                <Wordmark tone="gold" height={18} />
                <Text style={{ fontFamily: FONT.display, fontSize: 44, color: "#fff" }}>{level}</Text>
                <Text style={{ fontFamily: FONT.display, fontSize: 20, color: "#fff", textAlign: "center" }}>{lt("certTitle", { level })}</Text>
                <Text style={{ fontFamily: FONT.regular, fontSize: 14.5, lineHeight: 22, color: "rgba(255,255,255,0.78)", textAlign: "center" }}>{`${lt("certYou")} · ${lt("certFor", { level })}`}</Text>
                <Text style={{ fontFamily: FONT.semibold, fontSize: 13, color: ST.cream }}>{`${c.pct} % · ${date}`}</Text>
                <Text style={{ marginTop: 6, fontFamily: FONT.regular, fontSize: 11.5, color: "rgba(255,255,255,0.55)", textAlign: "center" }}>{lt("certNote")}</Text>
                <OutlineButton onStage compact title={lt("share")} icon="share" onPress={() => { void Share.share({ message: msg }).catch(() => undefined); }} style={{ marginTop: 10 }} />
                <View style={{ alignSelf: "stretch", marginTop: 10 }}><VerifiedCertLink course={`ar-level:${level}`} /></View>
              </View>
              <Arcade />
            </Stage>
          );
        })}
      </ScrollView>
    </View>
  );
}
