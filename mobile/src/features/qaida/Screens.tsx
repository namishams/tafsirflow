import { useEffect, useMemo, useRef, useState } from "react";
import { ActivityIndicator, Animated, Pressable, ScrollView, Text, View } from "react-native";
import { router, Stack, type Href } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { SOC } from "@/features/social/api";
import { Arcade, GoldButton, GoldCard, OutlineButton, SmallStar, Stage } from "@/components/brand";
import { Icon } from "@/components/icons";
import { goBack } from "@/components/page";
import { useLang } from "@/i18n";
import { useEntitlement } from "@/lib/entitlements";
import { ARABIC_FONT, FONT, R, stage as ST, useTheme } from "@/lib/theme";
import { useVerseAudio } from "@/features/quran/useVerseAudio";
import { preloadClips, tone } from "../coursekit/audio";
import { StepIn, useNudge, useReduceMotion } from "../coursekit/motion";
import { FREE_STAGES, STAGES, isFreeStage, lessonOf, stageOf, txOf, type QLesson, type QStage } from "./curriculum";
import { Ar, BuildCard, ChooseCard, LearnCard, MatchCard, RED, ReadCard, SpeedCard, exClips, useSay } from "./Exercises";
import { buildLesson, buildReview, passFor, reviewSurahs, type Ex } from "./lesson";
import { lessonOpen, nextLesson, placedStages, saveLesson, setGoal, stageOpen, stageState, starsFor, streak, todayCount, useArabicCourse, useQaida, weakKeys } from "./progress";
import { useQT } from "./texts";
import { realWords, toQWord, useSurahs } from "./words";

const leave = () => (router.canGoBack() ? goBack() : router.replace("/arabic/read" as Href));
const open = (id: string) => router.push(`/arabic/read/${id}` as Href);

function Stars({ n, size = 13 }: { n: number; size?: number }) {
  const t = useTheme();
  const qt = useQT();
  return (
    <View accessibilityLabel={qt("stars", { n })} style={{ flexDirection: "row", gap: 3 }}>
      {[0, 1, 2].map((i) => <SmallStar key={i} size={size} color={i < n ? "#c9a65e" : t.line} />)}
    </View>
  );
}

function BackButton({ onStage = false }: { onStage?: boolean }) {
  const t = useTheme();
  return (
    <Pressable onPress={leave} accessibilityRole="button" accessibilityLabel="Back" hitSlop={12} style={{ width: 40, height: 40, justifyContent: "center" }}>
      <Icon name="chevronLeft" size={24} color={onStage ? "#fff" : t.ink} />
    </Pressable>
  );
}

// ---------- the path ----------

export function QaidaPathScreen() {
  const t = useTheme();
  const qt = useQT();
  const { lang } = useLang();
  const insets = useSafeAreaInsets();
  const p = useQaida();
  const course = useArabicCourse();
  const placed = useMemo(() => placedStages(course), [course]);
  const ent = useEntitlement("arabicReading");
  const next = nextLesson(p, placed);
  const [openStage, setOpenStage] = useState<number | null>(next?.stage.n ?? 1);
  const today = todayCount(p);
  const days = streak(p);
  const weak = weakKeys(p);
  const firstThreeDone = STAGES.slice(0, FREE_STAGES).every((s) => stageState(p, s, placed).complete);

  const go = (s: QStage, l: QLesson) => (!isFreeStage(s.n) && !ent.allowed ? ent.upsell() : open(l.id));

  return (
    <View style={{ flex: 1, backgroundColor: t.bg }}>
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + 48 }}>
        <Stage hairlines={false}>
          <View style={{ paddingHorizontal: 20, paddingTop: insets.top + 8, paddingBottom: 32 }}>
            <BackButton onStage />
            <Text style={{ marginTop: 10, fontFamily: FONT.semibold, fontSize: 12, letterSpacing: 2.4, textTransform: "uppercase", color: ST.gold }}>{qt("kicker")}</Text>
            <Text accessibilityRole="header" style={{ marginTop: 12, fontFamily: FONT.display, fontSize: 34, lineHeight: 38, color: "#eef0f3" }}>{qt("title")}</Text>
            <Text style={{ marginTop: 14, fontFamily: FONT.regular, fontSize: 16, lineHeight: 25, color: "rgba(255,255,255,0.72)" }}>{qt("lead")}</Text>
            {next ? (
              <GoldButton title={`${Object.keys(p.done).length ? qt("continue") : qt("start")} · ${txOf(next.stage.title, lang)}`} onPress={() => go(next.stage, next.lesson)} style={{ marginTop: 22 }} />
            ) : null}
          </View>
          <Arcade />
        </Stage>

        <View style={{ paddingHorizontal: 16, marginTop: 20, gap: 16 }}>
          {/* daily goal */}
          <GoldCard>
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
              <Text style={{ fontFamily: FONT.bold, fontSize: 17, color: t.ink }}>{qt("goal")}</Text>
              {days ? <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}><Icon name="flame" size={16} color={t.gold} /><Text style={{ fontFamily: FONT.semibold, fontSize: 13, color: t.muted }}>{qt("streak", { n: days })}</Text></View> : null}
            </View>
            <View style={{ marginTop: 12, height: 8, borderRadius: 4, backgroundColor: t.line, overflow: "hidden" }}>
              <View style={{ width: `${Math.min(100, (today / p.goal) * 100)}%`, height: 8, backgroundColor: t.accent }} />
            </View>
            <Text style={{ marginTop: 8, fontFamily: FONT.regular, fontSize: 14, color: t.muted }}>{today >= p.goal ? qt("goalMet") : qt("today", { d: today, n: p.goal })}</Text>
            <View style={{ marginTop: 12, flexDirection: "row", gap: 8 }}>
              {[1, 2, 3].map((n) => (
                <Pressable key={n} onPress={() => setGoal(n)} accessibilityRole="button" accessibilityState={{ selected: p.goal === n }}
                  style={{ height: 34, paddingHorizontal: 14, borderRadius: R.pill, borderWidth: 1, borderColor: p.goal === n ? t.accent : t.line, backgroundColor: p.goal === n ? t.accentSoft : t.surface, justifyContent: "center" }}>
                  <Text style={{ fontFamily: FONT.semibold, fontSize: 13, color: p.goal === n ? t.accent : t.ink }}>{qt("goalN", { n })}</Text>
                </Pressable>
              ))}
            </View>
          </GoldCard>

          {/* placement (the Arabic course's test) and review */}
          <View style={{ flexDirection: "row", gap: 12 }}>
            <Pressable onPress={() => router.push("/arabic/placement" as Href)} accessibilityRole="button"
              style={{ flex: 1, borderRadius: R.card, borderWidth: 1, borderColor: t.line, backgroundColor: t.surface, padding: 14, gap: 6 }}>
              <Icon name="compass" size={20} color={t.gold} />
              <Text style={{ fontFamily: FONT.bold, fontSize: 15, color: t.ink }}>{qt("placement")}</Text>
              <Text style={{ fontFamily: FONT.regular, fontSize: 12.5, lineHeight: 18, color: t.muted }}>{qt("placementLead")}</Text>
            </Pressable>
            <Pressable onPress={() => open("review")} accessibilityRole="button"
              style={{ flex: 1, borderRadius: R.card, borderWidth: 1, borderColor: t.line, backgroundColor: t.surface, padding: 14, gap: 6 }}>
              <Icon name="repeat" size={20} color={t.gold} />
              <Text style={{ fontFamily: FONT.bold, fontSize: 15, color: t.ink }}>{qt("review")}{weak.length ? ` · ${weak.length}` : ""}</Text>
              <Text style={{ fontFamily: FONT.regular, fontSize: 12.5, lineHeight: 18, color: t.muted }}>{weak.length ? qt("reviewLead") : qt("reviewEmpty")}</Text>
            </Pressable>
          </View>
        </View>

        {/* the game path */}
        <View style={{ paddingHorizontal: 16, marginTop: 28 }}>
          {STAGES.map((s, i) => {
            const st = stageState(p, s, placed);
            const isOpen = stageOpen(p, s.n, placed);
            const locked = !isFreeStage(s.n) && !ent.allowed;
            const current = next?.stage.n === s.n;
            const side = [0, 1, 0, -1][i % 4];
            return (
              <View key={s.id}>
                {s.n === FREE_STAGES + 1 && !ent.allowed ? <UnlockCard done={firstThreeDone} onPress={ent.upsell} /> : null}
                {i > 0 ? <View style={{ alignSelf: "center", width: 3, height: 26, borderRadius: 2, backgroundColor: st.complete || current ? t.gold : t.line, transform: [{ translateX: side * 50 }] }} /> : null}
                <StageNode s={s} side={side} stars={st.stars} complete={st.complete} current={current} reachable={isOpen} locked={locked}
                  expanded={openStage === s.n} onPress={() => setOpenStage(openStage === s.n ? null : s.n)} />
                {openStage === s.n ? (
                  <StepIn>
                    <GoldCard style={{ marginTop: 12 }}>
                      <Text style={{ fontFamily: FONT.regular, fontSize: 14.5, lineHeight: 22, color: t.muted }}>{txOf(s.explain, lang)}</Text>
                      {st.placed ? <Text style={{ marginTop: 8, fontFamily: FONT.semibold, fontSize: 13, color: t.gold }}>{qt("placed")}</Text> : null}
                      {!isOpen ? <Text style={{ marginTop: 8, fontFamily: FONT.semibold, fontSize: 13, color: t.muted }}>{qt("locked")}</Text> : null}
                      <View style={{ marginTop: 12, gap: 8 }}>
                        {s.lessons.map((l, k) => {
                          const can = isOpen && lessonOpen(p, s, k, placed);
                          const d = p.done[l.id];
                          return (
                            <Pressable key={l.id} disabled={!can} onPress={() => go(s, l)} accessibilityRole="button" accessibilityState={{ disabled: !can }}
                              style={{ flexDirection: "row", alignItems: "center", gap: 12, minHeight: 48, paddingHorizontal: 12, borderRadius: R.md, borderWidth: 1, borderColor: t.line, backgroundColor: t.bg, opacity: can ? 1 : 0.5 }}>
                              <Text style={{ flex: 1, fontFamily: FONT.semibold, fontSize: 14.5, color: t.ink }}>{lessonLabel(s, l, k, qt)}</Text>
                              {locked ? <Icon name="lock" size={15} color={t.gold} /> : d ? <Stars n={d.stars} /> : can ? <Icon name="chevronRight" size={16} color={t.muted} /> : <Icon name="lock" size={14} color={t.muted} />}
                            </Pressable>
                          );
                        })}
                      </View>
                    </GoldCard>
                  </StepIn>
                ) : null}
              </View>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}

function lessonLabel(s: QStage, l: QLesson, k: number, qt: ReturnType<typeof useQT>) {
  if (l.kind === "test") return qt("test");
  if (l.kind === "juz") return qt("juzSurah", { n: l.surah ?? 0 });
  if (l.letters && (l.kind === "letters" || l.kind === "forms")) return `${qt("lesson", { n: k + 1 })} · ${l.letters.join(" ")}`;
  return qt("lesson", { n: k + 1 });
}

function StageNode({ s, side, stars, complete, current, reachable, locked, expanded, onPress }: {
  s: QStage; side: number; stars: number; complete: boolean; current: boolean; reachable: boolean; locked: boolean; expanded: boolean; onPress: () => void;
}) {
  const t = useTheme();
  const qt = useQT();
  const { lang } = useLang();
  const size = current ? 92 : 80;
  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityState={{ expanded }} accessibilityLabel={`${qt("stage", { n: s.n })}: ${txOf(s.title, lang)}`}
      style={{ alignItems: "center", transform: [{ translateX: side * 50 }] }}>
      <View style={{ width: size, height: size, borderRadius: size / 2, alignItems: "center", justifyContent: "center",
        backgroundColor: complete ? ST.bg : current ? t.accent : t.surface, borderWidth: current ? 4 : 2, borderColor: complete ? "#c9a65e" : current ? "rgba(201,166,94,0.7)" : t.line, opacity: reachable ? 1 : 0.55 }}>
        <Text allowFontScaling={false} numberOfLines={1} adjustsFontSizeToFit style={{ fontFamily: ARABIC_FONT, fontSize: s.glyph.length > 4 ? 18 : 30, lineHeight: (s.glyph.length > 4 ? 18 : 30) * 1.7, paddingHorizontal: 8, color: complete ? "#f3e2b6" : current ? t.onAccent : t.ink, writingDirection: "rtl" }}>{s.glyph}</Text>
        {locked || !reachable ? <View style={{ position: "absolute", bottom: -4, end: -4, width: 26, height: 26, borderRadius: 13, backgroundColor: t.surface, borderWidth: 1, borderColor: t.line, alignItems: "center", justifyContent: "center" }}><Icon name="lock" size={13} color={locked ? t.gold : t.muted} /></View> : null}
      </View>
      <Text style={{ marginTop: 8, fontFamily: FONT.semibold, fontSize: 11, letterSpacing: 1.4, textTransform: "uppercase", color: t.gold }}>{qt("stage", { n: s.n })}{isFreeStage(s.n) ? ` · ${qt("free")}` : ""}</Text>
      <Text style={{ marginTop: 2, fontFamily: FONT.bold, fontSize: 15, color: t.ink, textAlign: "center" }}>{txOf(s.title, lang)}</Text>
      <View style={{ marginTop: 4 }}><Stars n={stars} /></View>
    </Pressable>
  );
}

/** the Pro card after the free stages */
export function UnlockCard({ done, onPress }: { done: boolean; onPress: () => void }) {
  const qt = useQT();
  return (
    <Stage rounded={R.card} style={{ marginVertical: 20 }}>
      <View style={{ padding: 22, gap: 10 }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}><SmallStar size={11} color={ST.gold} /><Text style={{ fontFamily: FONT.semibold, fontSize: 11.5, letterSpacing: 2, textTransform: "uppercase", color: ST.gold }}>{done ? qt("unlockKicker") : "Pro"}</Text></View>
        <Text style={{ fontFamily: FONT.display, fontSize: 26, lineHeight: 31, color: "#fff" }}>{qt("unlockTitle")}</Text>
        <Text style={{ fontFamily: FONT.regular, fontSize: 15, lineHeight: 23, color: "rgba(255,255,255,0.75)" }}>{qt("unlockLead")}</Text>
        {(["unlockList1", "unlockList2", "unlockList3"] as const).map((k) => (
          <View key={k} style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
            <Icon name="check" size={16} color={ST.gold} />
            <Text style={{ flex: 1, fontFamily: FONT.semibold, fontSize: 14, color: "rgba(255,255,255,0.9)" }}>{qt(k)}</Text>
          </View>
        ))}
        <GoldButton title={qt("unlockCta")} onPress={onPress} style={{ marginTop: 8 }} />
      </View>
      <Arcade />
    </Stage>
  );
}

// ---------- a lesson ----------

export function QaidaLessonScreen({ id }: { id: string }) {
  const t = useTheme();
  const insets = useSafeAreaInsets();
  const ent = useEntitlement("arabicReading");
  const qt = useQT();
  const s = stageOf(id);
  const l = lessonOf(id);
  if (id !== "review" && (!s || !l)) {
    return (
      <View style={{ flex: 1, backgroundColor: t.bg, alignItems: "center", justifyContent: "center", padding: 32 }}>
        <Stack.Screen options={{ headerShown: false }} />
        <OutlineButton title={qt("toMap")} onPress={() => router.replace("/arabic/read" as Href)} />
      </View>
    );
  }
  if (s && !isFreeStage(s.n) && !ent.allowed) {
    return (
      <View style={{ flex: 1, backgroundColor: t.bg, padding: 16, paddingTop: insets.top + 8 }}>
        <Stack.Screen options={{ headerShown: false }} />
        <BackButton />
        <UnlockCard done onPress={ent.upsell} />
        <OutlineButton title={qt("toMap")} onPress={leave} />
      </View>
    );
  }
  if (l?.kind === "juz") return <JuzSurahScreen surah={l.surah!} id={l.id} />;
  return <LessonLoader key={id} stage={s ?? null} lesson={l ?? null} />;
}

function LessonLoader({ stage, lesson }: { stage: QStage | null; lesson: QLesson | null }) {
  const t = useTheme();
  const qt = useQT();
  const { lang } = useLang();
  const p = useQaida();
  const keys = useMemo(() => weakKeys(p), []); // eslint-disable-line react-hooks/exhaustive-deps
  const surahs = lesson ? (lesson.kind === "forms" || lesson.kind === "syllables" ? [] : lesson.surahs ?? []) : reviewSurahs(keys).length ? reviewSurahs(keys) : [1];
  const { verses, error } = useSurahs(surahs);
  const { canSpeak, voiceReady } = useSay();
  // the device voice is looked up when the app first needs it: wait for the answer (at most 1.5 s), otherwise a
  // syllable lesson, which needs no Quran words, was built "without voice" and lost all its listening questions
  const [voiceWait, setVoiceWait] = useState(!voiceReady);
  useEffect(() => { const id = setTimeout(() => setVoiceWait(false), 1500); return () => clearTimeout(id); }, []);
  const [exs, setExs] = useState<Ex[] | null>(null);
  useEffect(() => {
    if (!verses || exs || (voiceWait && !voiceReady)) return;
    setExs(lesson && stage ? buildLesson(stage, lesson, verses, lang, qt, canSpeak) : buildReview(keys, verses, lang, qt, canSpeak));
  }, [verses, voiceReady, voiceWait]); // eslint-disable-line react-hooks/exhaustive-deps
  const insets = useSafeAreaInsets();
  if (error || (exs && !exs.length)) {
    return (
      <View style={{ flex: 1, backgroundColor: t.bg, alignItems: "center", justifyContent: "center", padding: 32, gap: 16 }}>
        <Stack.Screen options={{ headerShown: false }} />
        <Text style={{ fontFamily: FONT.regular, fontSize: 16, lineHeight: 24, color: t.muted, textAlign: "center" }}>{error ? qt("offline") : qt("reviewEmpty")}</Text>
        {error ? <GoldButton title={qt("tryAgain")} onPress={() => router.replace(`/arabic/read/${lesson?.id ?? "review"}?r=${Date.now()}` as Href)} /> : null}
        <OutlineButton title={qt("toMap")} onPress={leave} />
      </View>
    );
  }
  if (!exs) {
    return (
      <View style={{ flex: 1, backgroundColor: t.bg, alignItems: "center", justifyContent: "center", gap: 12, paddingTop: insets.top }}>
        <Stack.Screen options={{ headerShown: false }} />
        <ActivityIndicator color={t.accent} />
        <Text style={{ fontFamily: FONT.regular, fontSize: 14, color: t.muted }}>{qt("loading")}</Text>
      </View>
    );
  }
  return <LessonRun exs={exs} lesson={lesson} stage={stage} />;
}

const gradable = (e: Ex) => e.t === "choose" || e.t === "match" || e.t === "build" || e.t === "read";
const keyOf = (e: Ex) => ("key" in e ? e.key : "");

function LessonRun({ exs, lesson, stage }: { exs: Ex[]; lesson: QLesson | null; stage: QStage | null }) {
  const t = useTheme();
  const qt = useQT();
  const insets = useSafeAreaInsets();
  const reduce = useReduceMotion();
  const nudge = useNudge();
  const [queue, setQueue] = useState<Ex[]>(exs);
  const [i, setI] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [order, setOrder] = useState<number[]>([]);
  const [checked, setChecked] = useState(false);
  const [graded, setGraded] = useState<boolean | null>(null);
  const [readScore, setReadScore] = useState<number | null>(null);
  const [ready, setReady] = useState(false);
  const first = useRef(new Map<string, boolean>());
  const retried = useRef(new Set<number>());
  const [finished, setFinished] = useState<number | null>(null);
  const ex = queue[i];
  // the recordings of this card and the next four load in the background, so "Listen" plays from disk
  useEffect(() => { preloadClips(queue.slice(i, i + 5).flatMap(exClips)); }, [i, queue]);

  const total = exs.filter(gradable).length;
  const grade = (ok: boolean) => {
    const k = `${i < exs.length ? i : -1}:${keyOf(ex)}`;
    if (i < exs.length && !first.current.has(k)) first.current.set(k, ok);
    setGraded(ok);
    tone(ok);
    if (!ok && i < exs.length && !retried.current.has(i)) { retried.current.add(i); setQueue((q) => [...q, ex]); }
  };

  const advance = () => {
    setPicked(null); setOrder([]); setChecked(false); setGraded(null); setReadScore(null); setReady(false);
    if (i + 1 < queue.length) { setI(i + 1); return; }
    const results = [...first.current.entries()];
    const right = results.filter(([, ok]) => ok).length;
    const pct = total ? Math.round((right / Math.max(total, results.length)) * 100) : 100;
    const wrongKeys = results.filter(([, ok]) => !ok).map(([k]) => k.split(":").slice(1).join(":"));
    const rightKeys = results.filter(([, ok]) => ok).map(([k]) => k.split(":").slice(1).join(":"));
    saveLesson(lesson?.id ?? "review", lesson ? pct : 100, wrongKeys.filter(Boolean), rightKeys.filter(Boolean));
    setFinished(pct);
  };

  const onCheck = () => {
    if (ex.t === "choose") { setChecked(true); grade(picked === ex.answer); if (picked !== ex.answer) nudge.run(); }
    else if (ex.t === "build") { setChecked(true); grade(order.map((x) => ex.tiles[x]).join("|") === ex.tiles.join("|")); }
    else if (ex.t === "read") { if (readScore !== null) { setChecked(true); grade(readScore >= 0.7); } else advance(); }
  };

  if (finished !== null) return <Result pct={finished} lesson={lesson} stage={stage} />;
  if (!ex) return null;

  const canCheck = ex.t === "choose" ? picked !== null : ex.t === "build" ? order.length === ex.tiles.length : ex.t === "read" ? true : false;
  const showCheck = (ex.t === "choose" || ex.t === "build" || ex.t === "read") && !checked;
  const showNext = ex.t === "learn" || checked || ((ex.t === "match" || ex.t === "speed") && ready);
  const progress = (i + (checked ? 1 : 0)) / queue.length;

  return (
    <View style={{ flex: 1, backgroundColor: t.bg }}>
      <Stack.Screen options={{ headerShown: false, gestureEnabled: false }} />
      <View style={{ paddingTop: insets.top + 8, paddingHorizontal: 16, flexDirection: "row", alignItems: "center", gap: 12 }}>
        <Pressable onPress={leave} accessibilityRole="button" accessibilityLabel={qt("quit")} hitSlop={12}><Icon name="close" size={22} color={t.muted} /></Pressable>
        <View style={{ flex: 1, height: 10, borderRadius: 5, backgroundColor: t.line, overflow: "hidden" }}>
          <View style={{ width: `${Math.round(progress * 100)}%`, height: 10, borderRadius: 5, backgroundColor: t.accent }} />
        </View>
      </View>
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 160 }} key={i}>
        <StepIn distance={reduce ? 0 : 10}>
          <Animated.View style={nudge.style}>
            {ex.t === "learn" ? <LearnCard ex={ex} /> : null}
            {ex.t === "choose" ? <ChooseCard ex={ex} picked={picked} checked={checked} onPick={setPicked} /> : null}
            {ex.t === "match" ? <MatchCard ex={ex} onDone={(m) => { grade(m === 0); setReady(true); }} /> : null}
            {ex.t === "build" ? <BuildCard ex={ex} checked={checked} onChange={setOrder} /> : null}
            {ex.t === "read" ? <ReadCard words={ex.words} onResult={setReadScore} /> : null}
            {ex.t === "speed" ? <SpeedCard ex={ex} onDone={() => setReady(true)} /> : null}
          </Animated.View>
        </StepIn>
      </ScrollView>
      <View style={{ position: "absolute", left: 0, right: 0, bottom: 0, paddingHorizontal: 16, paddingTop: 14, paddingBottom: insets.bottom + 14, borderTopWidth: 1, borderColor: t.line,
        backgroundColor: graded === null ? t.bg : graded ? t.accentSoft : "rgba(160,58,52,0.10)", gap: 10 }}>
        {graded !== null && ex.t !== "match" ? (
          <Text accessibilityLiveRegion="polite" style={{ fontFamily: FONT.bold, fontSize: 16, color: graded ? t.accent : RED }}>
            {graded ? qt("right") : ex.t === "choose" ? `${qt("wrong")} ${ex.options[ex.answer].text ?? ex.options[ex.answer].ar}` : qt("wrong")}
          </Text>
        ) : null}
        {showCheck ? (
          <View style={{ flexDirection: "row", gap: 10 }}>
            {ex.t === "read" && readScore === null ? <OutlineButton title={qt("skip")} onPress={advance} style={{ flex: 1 }} /> : (
              <GoldButton title={qt("check")} disabled={!canCheck} onPress={onCheck} style={{ flex: 1 }} />
            )}
          </View>
        ) : null}
        {showNext ? <GoldButton title={qt("next")} onPress={advance} /> : null}
      </View>
    </View>
  );
}

function Result({ pct, lesson, stage }: { pct: number; lesson: QLesson | null; stage: QStage | null }) {
  const t = useTheme();
  const qt = useQT();
  const insets = useSafeAreaInsets();
  const pass = lesson ? passFor(lesson) : 0;
  const ok = pct >= pass;
  const stars = starsFor(pct);
  const ent = useEntitlement("arabicReading");
  const nextL = stage && lesson ? stage.lessons[stage.lessons.indexOf(lesson) + 1] ?? STAGES[stage.n]?.lessons[0] : undefined;
  const nextStage = nextL ? stageOf(nextL.id) : undefined;
  const nextLocked = nextStage && !isFreeStage(nextStage.n) && !ent.allowed;
  return (
    <View style={{ flex: 1, backgroundColor: t.bg }}>
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView contentContainerStyle={{ padding: 20, paddingTop: insets.top + 40, paddingBottom: insets.bottom + 32, gap: 16, alignItems: "stretch" }}>
        <View style={{ alignItems: "center", gap: 10 }}>
          <Stars n={lesson ? stars : 3} size={30} />
          <Text accessibilityRole="header" style={{ fontFamily: FONT.display, fontSize: 30, color: t.ink, textAlign: "center" }}>{ok || !lesson ? qt("complete") : qt("almost")}</Text>
          {lesson ? <Text style={{ fontFamily: FONT.semibold, fontSize: 16, color: t.muted }}>{qt("score", { p: pct })}</Text> : null}
          {lesson && !ok ? <Text style={{ fontFamily: FONT.regular, fontSize: 15, lineHeight: 23, color: t.muted, textAlign: "center" }}>{qt("needPass", { p: pass })}</Text> : null}
        </View>
        {ok && nextLocked && stage?.n === FREE_STAGES ? <UnlockCard done onPress={ent.upsell} /> : null}
        {ok && nextL && !nextLocked ? <GoldButton title={qt("nextLesson")} onPress={() => router.replace(`/arabic/read/${nextL.id}` as Href)} /> : null}
        {!ok && lesson ? <GoldButton title={qt("retry")} onPress={() => router.replace(`/arabic/read/${lesson.id}?r=${Date.now()}` as Href)} /> : null}
        <OutlineButton title={qt("toMap")} onPress={() => router.replace("/arabic/read" as Href)} />
      </ScrollView>
    </View>
  );
}

// ---------- Juz ʿAmma: listen with word-by-word highlighting, then read each verse ----------

function JuzSurahScreen({ surah, id }: { surah: number; id: string }) {
  const t = useTheme();
  const qt = useQT();
  const insets = useSafeAreaInsets();
  const { verses, error } = useSurahs([surah]);
  const audio = useVerseAudio();
  const [cur, setCur] = useState<number | null>(null);
  const [all, setAll] = useState(false);
  const [checkAt, setCheckAt] = useState<number | null>(null);
  const scores = useRef(new Map<number, number>());
  const p = useQaida();
  const done = (p.done[id]?.best ?? 0) >= 70;

  const play = (k: number) => { const v = verses?.[k]; if (!v) return; setCur(k); audio.play(v.audioUrl, { fallback: v.remoteAudioUrl, track: false }); };
  audio.onEnd.current = () => { if (all && verses && cur !== null && cur + 1 < verses.length) play(cur + 1); else { setAll(false); setCur(null); } };
  const active = cur !== null && verses ? verses[cur].segments.find((s) => audio.positionMs >= s.start && audio.positionMs < s.end)?.word ?? null : null;

  const finish = () => {
    const vals = [...scores.current.values()];
    const pct = vals.length ? Math.round((vals.reduce((a, b) => a + b, 0) / vals.length) * 100) : 100;
    saveLesson(id, Math.max(70, pct), [], []);
    // a milestone for friends, stored only when the member shares milestones (16+, own profile; errors are ignored)
    void SOC.reportSurah(surah).catch(() => undefined);
    router.replace("/arabic/read" as Href);
  };

  return (
    <View style={{ flex: 1, backgroundColor: t.bg }}>
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView contentContainerStyle={{ padding: 16, paddingTop: insets.top + 8, paddingBottom: insets.bottom + 40, gap: 14 }}>
        <BackButton />
        <Text accessibilityRole="header" style={{ fontFamily: FONT.display, fontSize: 28, color: t.ink }}>{qt("juzSurah", { n: surah })}</Text>
        <Text style={{ fontFamily: FONT.regular, fontSize: 14.5, lineHeight: 22, color: t.muted }}>{qt("juzLead")}</Text>
        {error ? <Text style={{ fontFamily: FONT.regular, fontSize: 15, color: t.muted }}>{qt("offline")}</Text> : !verses ? <ActivityIndicator color={t.accent} /> : (
          <>
            <GoldButton title={audio.playing && all ? qt("pause") : qt("playAll")} icon={audio.playing && all ? "pause" : "play"}
              onPress={() => { if (audio.playing && all) { audio.pause(); setAll(false); } else { setAll(true); play(cur ?? 0); } }} />
            {verses.map((v, k) => (
              <GoldCard key={v.verse_key} star={false}>
                <View style={{ flexDirection: "row-reverse", direction: "ltr", flexWrap: "wrap", gap: 4 }}>
                  {realWords(v).map((w) => (
                    <Text key={w.position} accessibilityLanguage="ar" allowFontScaling={false}
                      style={{ fontFamily: ARABIC_FONT, fontSize: 28, lineHeight: 54, paddingHorizontal: 4, borderRadius: R.sm, writingDirection: "rtl",
                        color: cur === k && active === w.position ? t.onAccent : t.arabic, backgroundColor: cur === k && active === w.position ? t.accent : "transparent" }}>{w.text_uthmani}</Text>
                  ))}
                </View>
                <View style={{ marginTop: 10, flexDirection: "row", gap: 10, flexWrap: "wrap" }}>
                  <Pressable onPress={() => { setAll(false); if (cur === k && audio.playing) audio.pause(); else play(k); }} accessibilityRole="button"
                    style={{ height: 36, paddingHorizontal: 14, borderRadius: R.pill, borderWidth: 1, borderColor: t.line, flexDirection: "row", alignItems: "center", gap: 6 }}>
                    <Icon name={cur === k && audio.playing ? "pause" : "play"} size={13} color={t.accent} />
                    <Text style={{ fontFamily: FONT.semibold, fontSize: 13, color: t.ink }}>{qt("verseN", { n: v.verse_number })}</Text>
                  </Pressable>
                  <Pressable onPress={() => setCheckAt(checkAt === k ? null : k)} accessibilityRole="button" accessibilityState={{ expanded: checkAt === k }}
                    style={{ height: 36, paddingHorizontal: 14, borderRadius: R.pill, borderWidth: 1, borderColor: checkAt === k ? t.accent : t.line, flexDirection: "row", alignItems: "center", gap: 6 }}>
                    <Icon name="speaker" size={13} color={t.accent} />
                    <Text style={{ fontFamily: FONT.semibold, fontSize: 13, color: t.ink }}>{qt("checkVerse")}</Text>
                  </Pressable>
                </View>
                {checkAt === k ? <View style={{ marginTop: 12 }}><ReadCard highlight words={realWords(v).map((w) => toQWord(v, w))} onResult={(s) => { if (s !== null) scores.current.set(k, s); }} /></View> : null}
              </GoldCard>
            ))}
            <GoldButton title={done ? qt("surahDone") : qt("markRead")} icon="check" onPress={finish} />
          </>
        )}
      </ScrollView>
    </View>
  );
}

// ---------- entry card (Masterclass tab, Arabic page) ----------

export function QaidaCard() {
  const qt = useQT();
  const p = useQaida();
  const started = Object.keys(p.done).length > 0;
  return (
    <Pressable onPress={() => router.push("/arabic/read" as Href)} accessibilityRole="button" accessibilityLabel={qt("title")}
      style={{ borderRadius: R.card, overflow: "hidden", backgroundColor: ST.bg, borderWidth: 1, borderColor: "rgba(201,166,94,0.45)", padding: 20, gap: 8 }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}><SmallStar size={12} color={ST.gold} /><Text style={{ fontFamily: FONT.semibold, fontSize: 11.5, letterSpacing: 2, textTransform: "uppercase", color: ST.gold }}>{qt("kicker")}</Text></View>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
        <Text style={{ flex: 1, fontFamily: FONT.display, fontSize: 26, lineHeight: 30, color: "#fff" }}>{qt("title")}</Text>
        <Text allowFontScaling={false} style={{ fontFamily: ARABIC_FONT, fontSize: 34, lineHeight: 60, color: "#f3e2b6" }}>{"ا ب ت"}</Text>
      </View>
      <Text style={{ fontFamily: FONT.regular, fontSize: 14.5, lineHeight: 21, color: "rgba(255,255,255,0.75)" }}>{qt("cardLead")}</Text>
      <View style={{ marginTop: 8, alignSelf: "flex-start", flexDirection: "row", alignItems: "center", gap: 8, height: 40, paddingHorizontal: 16, borderRadius: R.pill, backgroundColor: ST.gold }}>
        <Text style={{ fontFamily: FONT.bold, fontSize: 14, color: ST.bg }}>{started ? qt("continue") : qt("start")}</Text>
      </View>
    </Pressable>
  );
}
