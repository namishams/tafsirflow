import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { ActivityIndicator, Animated, Easing, Pressable, ScrollView, Text, View, type ScrollViewInstance } from "react-native";
import { router, Stack, type Href } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { GoldCard, Stage } from "@/components/brand";
import { Icon } from "@/components/icons";
import { pageLang } from "./lang";
import { isRTL, useLang } from "@/i18n";
import { FREE, openPro, usePro } from "@/lib/pro";
import { ARABIC_FONT, CALLIG_FONT, FONT, R, useTheme, AR_RIGHT, FWD } from "@/lib/theme";
import {
  LESSONS, PASS_PCT, PLACEMENT_UNITS, UNITS, buildLesson, lessonById, nextArabic, placementResult, saveArabic, savePlacement, starsFor,
  verseAudioUrl, wordAudioUrl, type Ex, type Lesson, type PlacementResult,
} from "@/web/arabic";
import { logDay } from "@/web/learning";
import { Girih, IllumFrame, MedalText, PracticeCelebrate, PracticeMedallion, PracticeStar, PracticeStarNum, PracticeWindow, ROSE, goldA, roseA, solidGoldA } from "../coursekit/art";
import { preloadClips, tone, useClip } from "../coursekit/audio";
import { GoldRing, StepIn, useNudge, useReduceMotion } from "../coursekit/motion";
import { syncQuranTextApp } from "../coursekit/quranText";
import { useCourseT } from "../coursekit/strings";
import { BigButton, Callout, ProCard } from "../coursekit/ui";
import { useArabicVoice } from "../coursekit/voice";
import { isProLesson } from "./ArabicHome";
import { LESSON_T, WELL_DONE } from "./texts";
import { goBack } from "@/components/page";

// ArabicLesson.tsx: a short Babbel-style lesson – learning cards, then varied exercises (choose, listen, match, put the
// verse in order); a missed exercise comes back once at the end; stars, XP and the result are saved in "tf:arabic"
// exactly like on the website. The placement test (/arabic/placement) runs on the same screen.

type TT = (typeof LESSON_T)["en"];
const shuffle = <T,>(a: T[]) => { const b = [...a]; for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b; };

// the options after a wrong answer come back in a new order (the exercise itself is re-queued once)
const reshuffled = (ex: Ex): Ex => {
  if (ex.t !== "choose" && ex.t !== "listen") return ex;
  const order = shuffle((ex.options as unknown[]).map((_, i) => i));
  return { ...ex, options: order.map((i) => ex.options[i]), answer: order.indexOf(ex.answer) } as Ex;
};

const leave = () => (router.canGoBack() ? goBack() : router.replace("/arabic" as Href));

export function ArabicLessonScreen({ id }: { id: string }) {
  const { pro } = usePro();
  const lesson = lessonById(id);
  if (!lesson) return <Missing />;
  if (!pro && isProLesson(lesson)) return <LessonProWall lesson={lesson} />;
  return <LessonRun key={lesson.id} lesson={lesson} />;
}

function Missing() {
  const t = useTheme();
  const ct = useCourseT();
  return (
    <View style={{ flex: 1, backgroundColor: t.bg, alignItems: "center", justifyContent: "center", padding: 32, gap: 18 }}>
      <Stack.Screen options={{ headerShown: false }} />
      <Text style={{ fontFamily: FONT.regular, fontSize: 16, color: t.muted, textAlign: "center" }}>{ct("notFound")}</Text>
      <BigButton variant="outline" title={ct("toOverview")} onPress={() => router.replace("/arabic" as Href)} height={48} radius={R.pill} />
    </View>
  );
}

/** a Pro lesson opened directly (e.g. from a link): what it is, and the way to Pro */
function LessonProWall({ lesson }: { lesson: Lesson }) {
  const t = useTheme();
  const insets = useSafeAreaInsets();
  const lang = pageLang(useLang().lang);
  const ct = useCourseT();
  const unit = UNITS.find((u) => u.n === lesson.unit);
  return (
    <View style={{ flex: 1, backgroundColor: t.bg }}>
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView contentContainerStyle={{ padding: 16, paddingTop: insets.top + 12, paddingBottom: insets.bottom + 32 }}>
        <CloseButton />
        <View style={{ alignItems: "center", marginTop: 24 }}>
          <PracticeStarNum n={LESSONS.indexOf(lesson) + 1} size={58} />
          <Text style={{ marginTop: 14, fontFamily: FONT.bold, fontSize: 12, letterSpacing: isRTL(lang) ? 0 : 1.9, textTransform: "uppercase", color: t.gold }}>{unit ? `${LESSON_T[lang].unitWord} ${unit.n} · ${unit.title[lang] ?? unit.title.en}` : ""}</Text>
          <Text style={{ marginTop: 8, fontFamily: FONT.display, fontSize: 30, lineHeight: 35, color: t.ink, textAlign: "center" }}>{lesson.title[lang] ?? lesson.title.en}</Text>
          <Text style={{ marginTop: 10, fontFamily: FONT.regular, fontSize: 16, lineHeight: 25, color: t.muted, textAlign: "center" }}>{lesson.goal[lang] ?? lesson.goal.en}</Text>
        </View>
        <ProCard feature="arabic" title={ct("lessonLocked")} text={ct("arabicProText", { n: FREE.arabicLessons, total: LESSONS.length })} style={{ marginTop: 28 }} />
      </ScrollView>
    </View>
  );
}

function CloseButton() {
  const t = useTheme();
  const T = LESSON_T[pageLang(useLang().lang)];
  return (
    <Pressable onPress={leave} accessibilityRole="button" accessibilityLabel={T.quit} hitSlop={6}
      style={({ pressed }) => ({ width: 40, height: 40, borderRadius: 20, borderWidth: 1, borderColor: pressed ? solidGoldA(1) : t.line, alignItems: "center", justifyContent: "center" })}>
      <Icon name="close" size={18} color={t.muted} />
    </Pressable>
  );
}

function LessonRun({ lesson }: { lesson: Lesson }) {
  const t = useTheme();
  const insets = useSafeAreaInsets();
  const lang = pageLang(useLang().lang);
  const { pro } = usePro();
  const T = LESSON_T[lang];
  const isPlacement = !!lesson.placement;
  const next = isPlacement ? undefined : LESSONS[LESSONS.indexOf(lesson) + 1];
  const [seed, setSeed] = useState(0);
  // units 7 and 8 read real verses: first load Quran.com's exact text, then build the exercises
  const [qReady, setQReady] = useState(lesson.unit < 7);
  useEffect(() => { if (!qReady) void syncQuranTextApp().finally(() => setQReady(true)); }, []); // eslint-disable-line react-hooks/exhaustive-deps
  const base = useMemo(() => buildLesson(lesson, lang), [lesson, lang, seed, qReady]); // eslint-disable-line react-hooks/exhaustive-deps
  const [queue, setQueue] = useState<Ex[]>(base);
  const [pos, setPos] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [checked, setChecked] = useState(false);
  const [stats, setStats] = useState({ first: 0, firstRight: 0, xp: 0, combo: 0 });
  const wrongKeys = useRef<string[]>([]);
  const retried = useRef(new Set<number>());
  const [finished, setFinished] = useState<null | { pct: number; xp: number }>(null);
  const unitRes = useRef<Record<number, { ok: number; n: number }>>({}); // placement test: right answers per unit
  const [placed, setPlaced] = useState<null | { res: PlacementResult; next: Lesson | null }>(null);
  const { canSpeak, speak } = useArabicVoice();
  const scroll = useRef<ScrollViewInstance>(null);
  useEffect(() => { setQueue(base); setPos(0); setPicked(null); setChecked(false); setStats({ first: 0, firstRight: 0, xp: 0, combo: 0 }); wrongKeys.current = []; retried.current = new Set(); unitRes.current = {}; setPlaced(null); setFinished(null); }, [base]);
  useEffect(() => { scroll.current?.scrollTo({ y: 0, animated: false }); }, [pos, finished]);

  const ex = queue[pos];
  const total = queue.length;
  // the word recordings of this card and the next four load in the background, so they play from disk
  useEffect(() => {
    preloadClips(queue.slice(pos, pos + 5).flatMap((e) => { const r = (e as { ref?: string }).ref; return r ? [wordAudioUrl(r)] : []; }));
  }, [pos, queue]);
  const isRetry = retried.current.has(pos);

  const finish = (s = stats) => {
    const pct = s.first ? Math.round((s.firstRight / s.first) * 100) : 100;
    if (isPlacement) {
      // the placement test marks the units the learner already knows as done – it does not give XP or stars of its own
      const res = placementResult(unitRes.current);
      const nx = nextArabic(savePlacement(res, wrongKeys.current));
      logDay();
      setPlaced({ res, next: nx });
      setFinished({ pct, xp: 0 });
      return;
    }
    const bonus = starsFor(pct) * 10;
    saveArabic(lesson.id, pct, s.xp + bonus, wrongKeys.current);
    logDay();
    setFinished({ pct, xp: s.xp + bonus });
  };
  const advance = (s = stats) => { setPicked(null); setChecked(false); if (pos + 1 >= queue.length) finish(s); else setPos(pos + 1); };

  const grade = (ok: boolean, key: string) => {
    tone(ok);
    const s = { ...stats };
    if (!isRetry) {
      s.first += 1; if (ok) s.firstRight += 1;
      if (ex.u) { const r = (unitRes.current[ex.u] ??= { ok: 0, n: 0 }); r.n += 1; if (ok) r.ok += 1; }
    }
    if (ok) { s.combo += 1; s.xp += isRetry ? 5 : 10 + Math.min(10, s.combo * 2); }
    else {
      s.combo = 0; wrongKeys.current.push(key);
      // Babbel-style: a missed exercise comes back once at the end (not in the placement test – it must measure, not teach)
      if (!isRetry && ex.t !== "learn" && !isPlacement) { setQueue((q) => { retried.current.add(q.length); return [...q, reshuffled(ex)]; }); }
    }
    setStats(s);
    return s;
  };

  const goLesson = (l: Lesson) => (!pro && isProLesson(l) ? openPro("arabic") : router.replace(`/arabic/${l.id}` as Href));
  const page = (children: ReactNode) => (
    <View style={{ flex: 1, backgroundColor: t.bg }}>
      <Stack.Screen options={{ headerShown: false }} />
      {children}
    </View>
  );

  if (finished && isPlacement && placed) {
    const { res } = placed;
    return page(
      <ScrollView ref={scroll} contentContainerStyle={{ paddingHorizontal: 16, paddingTop: insets.top + 12, paddingBottom: insets.bottom + 32 }}>
        <CloseButton />
        <View style={{ alignItems: "center" }}>
          {res.passed.length > 0 ? <PracticeCelebrate /> : null}
          <PracticeMedallion pct={res.total ? res.correct / res.total : 0} size={136} turn enter>
            <MedalText size={26} small={`/${res.total}`}>{res.correct}</MedalText>
          </PracticeMedallion>
          <Text style={{ marginTop: 20, fontFamily: FONT.bold, fontSize: 12, letterSpacing: 1.9, textTransform: "uppercase", color: t.gold }}>{T.pLabel}</Text>
          <Text accessibilityRole="header" style={{ marginTop: 4, fontFamily: FONT.display, fontSize: 34, lineHeight: 39, color: t.ink, textAlign: "center" }}>{T.pHead}</Text>
          <Text style={{ marginTop: 14, fontFamily: FONT.regular, fontSize: 17, lineHeight: 27, color: t.ink, textAlign: "center" }}>{res.start > PLACEMENT_UNITS.length ? T.pAll : T.pFrom.replace("{n}", String(res.start))}</Text>
          <Text style={{ marginTop: 4, fontFamily: FONT.regular, fontSize: 14, color: t.muted }}>{T.pRight.replace("{a}", String(res.correct)).replace("{b}", String(res.total))}</Text>
        </View>
        <GoldCard star={false} padded={false} style={{ marginTop: 24, overflow: "hidden" }}>
          {PLACEMENT_UNITS.map((u, k) => {
            const known = res.passed.includes(u);
            const un = UNITS.find((x) => x.n === u)!;
            return (
              <View key={u} style={{ flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 16, paddingVertical: 12, borderTopWidth: k ? 1 : 0, borderTopColor: t.line }}>
                <PracticeStarNum n={known ? "✓" : u} size={34} filled={known} />
                <Text style={{ flex: 1, fontFamily: FONT.semibold, fontSize: 15, lineHeight: 20, color: t.ink }}>{`${T.unitWord} ${u} · ${un.title[lang] ?? un.title.en}`}</Text>
                <Text style={{ fontFamily: FONT.bold, fontSize: 12, color: known ? t.gold : t.muted }}>{known ? T.known : T.open}</Text>
              </View>
            );
          })}
        </GoldCard>
        <Text style={{ marginTop: 16, fontFamily: FONT.regular, fontSize: 14, lineHeight: 21, color: t.muted, textAlign: "center" }}>{T.pNote}</Text>
        <View style={{ marginTop: 32, gap: 12 }}>
          {placed.next
            ? <BigButton title={`${T.pGo} ${placed.next.title[lang] ?? placed.next.title.en}  ${FWD}`} height={48} radius={R.pill} onPress={() => goLesson(placed.next!)} />
            : <BigButton title={`${T.readQuran}  ${FWD}`} height={48} radius={R.pill} onPress={() => router.push("/shams/1" as Href)} />}
          <BigButton variant="outline" title={T.pRetry} height={48} radius={R.pill} onPress={() => setSeed((n) => n + 1)} />
          <Text onPress={leave} accessibilityRole="link" style={{ alignSelf: "center", paddingVertical: 10, fontFamily: FONT.semibold, fontSize: 14, color: t.muted }}>{T.overview}</Text>
        </View>
      </ScrollView>,
    );
  }

  if (finished) {
    const stars = starsFor(finished.pct);
    const passed = finished.pct >= PASS_PCT;
    return page(
      <ScrollView ref={scroll} contentContainerStyle={{ paddingHorizontal: 16, paddingTop: insets.top + 12, paddingBottom: insets.bottom + 32 }}>
        <CloseButton />
        <View style={{ alignItems: "center" }}>
          {passed ? <PracticeCelebrate /> : null}
          {passed ? <Text allowFontScaling={false} style={{ fontFamily: CALLIG_FONT, fontSize: 40, lineHeight: 60, color: t.gold }}>{WELL_DONE}</Text> : null}
          <View style={{ marginTop: 12 }}>
            <PracticeMedallion pct={finished.pct / 100} size={150} turn={passed} enter>
              <MedalText size={30}>{`${finished.pct}%`}</MedalText>
            </PracticeMedallion>
          </View>
          <Text accessibilityRole="header" style={{ marginTop: 20, fontFamily: FONT.display, fontSize: 34, lineHeight: 39, color: t.ink, textAlign: "center" }}>{passed ? T.done : T.notYet}</Text>
          <View style={{ marginTop: 16, flexDirection: "row", gap: 12 }} accessible accessibilityLabel={`${stars}/3`}>
            {[1, 2, 3].map((n) => <PracticeStar key={n} size={30} dim={n > stars} />)}
          </View>
        </View>
        <View style={{ marginTop: 24, flexDirection: "row", gap: 12 }}>
          <GoldCard star={false} style={{ flex: 1, padding: 16, paddingTop: 16, alignItems: "center" }}>
            <Text style={{ fontFamily: FONT.display, fontSize: 30, color: t.ink }}>{`${finished.pct} %`}</Text>
            <Text style={{ fontFamily: FONT.regular, fontSize: 14, lineHeight: 19, color: t.muted, textAlign: "center" }}>{T.score}</Text>
          </GoldCard>
          <GoldCard star={false} style={{ flex: 1, padding: 16, paddingTop: 16, alignItems: "center" }}>
            <Text style={{ fontFamily: FONT.display, fontSize: 30, color: t.gold }}>{`+${finished.xp}`}</Text>
            <Text style={{ fontFamily: FONT.regular, fontSize: 14, color: t.muted }}>{T.xp}</Text>
          </GoldCard>
        </View>
        {!passed ? <Text style={{ marginTop: 20, fontFamily: FONT.regular, fontSize: 15, lineHeight: 23, color: t.muted, textAlign: "center" }}>{T.needPass.replace("{pass}", String(PASS_PCT))}</Text> : null}
        <View style={{ marginTop: 32, gap: 12 }}>
          {passed && next ? <BigButton title={`${T.nextLesson}  ${FWD}`} height={48} radius={R.pill} onPress={() => goLesson(next)} /> : null}
          {passed && !next ? <BigButton title={`${T.readQuran}  ${FWD}`} height={48} radius={R.pill} onPress={() => router.push("/shams/1" as Href)} /> : null}
          <BigButton variant="outline" title={T.again} height={48} radius={R.pill} onPress={() => setSeed((n) => n + 1)} />
          <Text onPress={leave} accessibilityRole="link" style={{ alignSelf: "center", paddingVertical: 10, fontFamily: FONT.semibold, fontSize: 14, color: t.muted }}>{T.overview}</Text>
        </View>
      </ScrollView>,
    );
  }

  if (!qReady || !ex) return page(<View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}><ActivityIndicator color={t.accent} /></View>);

  const choice = ex.t === "choose" || ex.t === "listen" ? ex : null;
  const answerOpt = choice ? (choice.options[choice.answer] as { ar?: string; text?: string }) : null;
  const right = choice ? picked === choice.answer : false;

  return page(
    <>
      {/* progress */}
      <View style={{ paddingTop: insets.top + 6, paddingHorizontal: 16 }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
          <CloseButton />
          <ProgressTrack value={pos / total} />
          <View style={{ borderRadius: R.pill, borderWidth: 1, borderColor: solidGoldA(0.4), backgroundColor: solidGoldA(0.1), paddingHorizontal: 12, paddingVertical: 4 }}>
            <Text style={{ fontFamily: FONT.bold, fontSize: 14, color: t.gold, fontVariant: ["tabular-nums"] }}>{`${stats.xp} ${T.xp}`}</Text>
          </View>
        </View>
        {stats.combo >= 3 ? (
          <View style={{ marginTop: 8, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 4 }}>
            <Icon name="flame" size={14} color={t.gold} />
            <Text style={{ fontFamily: FONT.bold, fontSize: 12, color: t.gold }}>{`${stats.combo}×`}</Text>
          </View>
        ) : null}
        {isPlacement ? <Text style={{ marginTop: 12, textAlign: "center", fontFamily: FONT.bold, fontSize: 12, letterSpacing: 1.9, textTransform: "uppercase", color: t.gold }}>{`${T.pLabel} · ${Math.min(pos + 1, total)}/${total}`}</Text> : null}
      </View>

      {ex.t === "build" ? (
        <BuildCard key={`${pos}-${ex.key}`} ex={ex} T={T} isRetry={isRetry} onGrade={(ok) => grade(ok, ex.key)} onNext={() => advance()} />
      ) : (
        <>
          <ScrollView ref={scroll} style={{ flex: 1 }} contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 28, paddingBottom: 24 }}>
            <StepIn key={`${pos}-${seed}`}>
              {ex.t === "learn" ? <LearnCard ex={ex} T={T} canSpeak={canSpeak} speak={speak} /> : null}
              {ex.t === "choose" ? (
                <View>
                  {isRetry ? <Review T={T} /> : null}
                  <Question>{ex.q}</Question>
                  {ex.ar ? (
                    <GoldCard style={{ marginTop: 24, paddingVertical: 32, paddingHorizontal: 12, alignItems: "center", justifyContent: "center", flexDirection: "row", gap: 16 }}>
                      <Text allowFontScaling={false} style={ex.ar.length > 14
                        ? { fontFamily: ARABIC_FONT, fontSize: 34, lineHeight: 68, color: t.ink, textAlign: "center", writingDirection: "rtl", flexShrink: 1 }
                        : { fontFamily: ARABIC_FONT, fontSize: 64, lineHeight: 104, color: t.ink, textAlign: "center", writingDirection: "rtl" }}>{ex.ar}</Text>
                      {canSpeak && ex.speak ? <SpeakButton label={T.listen} onPress={() => speak(ex.speak!)} /> : null}
                    </GoldCard>
                  ) : null}
                  {!ex.ar && canSpeak && ex.speak ? <View style={{ marginTop: 16 }}><SpeakButton label={T.listen} onPress={() => speak(ex.speak!)} wide /></View> : null}
                  <Options opts={ex.options} answer={ex.answer} picked={picked} checked={checked} onPick={setPicked} />
                </View>
              ) : null}
              {ex.t === "listen" ? (
                <View>
                  <ListenCard key={`${pos}-${ex.key}`} ex={ex} T={T} isRetry={isRetry} canSpeak={canSpeak} speak={speak} />
                  <Options opts={ex.options} answer={ex.answer} picked={picked} checked={checked} onPick={setPicked} />
                </View>
              ) : null}
              {ex.t === "match" ? <MatchCard key={`${pos}-${ex.key}`} ex={ex} T={T} onDone={(mistakes) => { const s = grade(mistakes <= 1, ex.key); setTimeout(() => advance(s), 700); }} /> : null}
            </StepIn>
          </ScrollView>

          {/* bottom bar */}
          {ex.t === "learn" ? <Footer><BigButton title={T.next} onPress={() => advance()} /></Footer> : null}
          {choice && answerOpt ? (
            <Footer tint={checked ? (right ? "right" : "wrong") : undefined}>
              {checked ? (
                <StepIn distance={6} style={{ marginBottom: 12 }}>
                  <View style={{ flexDirection: "row", flexWrap: "wrap", alignItems: "center", gap: 8 }}>
                    {right ? <PracticeStar size={16} color={t.gold} /> : null}
                    <Text style={{ fontFamily: FONT.bold, fontSize: 16, color: right ? t.gold : ROSE }}>{right ? T.right : T.wrong}</Text>
                    {!right ? (answerOpt.ar
                      ? <Text allowFontScaling={false} style={{ fontFamily: ARABIC_FONT, fontSize: 24, lineHeight: 42, color: ROSE, writingDirection: "rtl" }}>{answerOpt.ar}</Text>
                      : <Text style={{ fontFamily: FONT.bold, fontSize: 16, color: ROSE }}>{answerOpt.text}</Text>) : null}
                  </View>
                  {choice.t === "listen" ? <Text style={{ marginTop: 4, fontFamily: FONT.regular, fontSize: 14, lineHeight: 20, color: t.ink, opacity: 0.8 }}>{choice.info}</Text> : null}
                </StepIn>
              ) : null}
              {!checked
                ? <BigButton title={T.check} disabled={picked === null} onPress={() => { setChecked(true); grade(picked === choice.answer, choice.key); }} />
                : <BigButton title={T.next} variant={right ? "gold" : "rose"} onPress={() => advance()} />}
            </Footer>
          ) : null}
        </>
      )}
    </>,
  );
}

// ---------- pieces ----------

function ProgressTrack({ value }: { value: number }) {
  const t = useTheme();
  const reduce = useReduceMotion();
  const [w, setW] = useState(0);
  const v = useRef(new Animated.Value(value)).current;
  useEffect(() => {
    if (reduce) { v.setValue(value); return; }
    Animated.timing(v, { toValue: value, duration: 500, easing: Easing.out(Easing.quad), useNativeDriver: false }).start();
  }, [value, reduce, v]);
  return (
    <View onLayout={(e) => setW(e.nativeEvent.layout.width)} style={{ flex: 1, height: 12, borderRadius: 6, backgroundColor: t.line }}
      accessibilityRole="progressbar" accessibilityValue={{ min: 0, max: 100, now: Math.round(value * 100) }}>
      <Animated.View style={{ height: 12, borderRadius: 6, overflow: "hidden", width: v.interpolate({ inputRange: [0, 1], outputRange: [0, Math.max(w, 1)] }) }}>
        <LinearGradient colors={["#c6a65e", "#ecd7a2"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={{ flex: 1 }} />
      </Animated.View>
      {w > 0 ? (
        <Animated.View pointerEvents="none" style={{ position: "absolute", top: -3, left: v.interpolate({ inputRange: [0, 1], outputRange: [-9, w - 9] }) }}>
          <PracticeStar size={18} color="rgb(201,166,94)" />
        </Animated.View>
      ) : null}
    </View>
  );
}

function Footer({ children, tint }: { children: ReactNode; tint?: "right" | "wrong" }) {
  const t = useTheme();
  const insets = useSafeAreaInsets();
  return (
    <View style={{ paddingHorizontal: 16, paddingTop: 8, paddingBottom: Math.max(insets.bottom, 12) + 4, backgroundColor: t.bg }}>
      <View style={tint ? { borderRadius: R.sm, borderWidth: 1, padding: 16, borderColor: tint === "right" ? solidGoldA(0.45) : roseA(0.3), backgroundColor: tint === "right" ? solidGoldA(0.12) : roseA(0.08) } : undefined}>
        {children}
      </View>
    </View>
  );
}

function Question({ children }: { children: ReactNode }) {
  const t = useTheme();
  return <Text accessibilityRole="header" style={{ fontFamily: FONT.bold, fontSize: 20, lineHeight: 27, color: t.ink }}>{children}</Text>;
}

function Review({ T }: { T: TT }) {
  const t = useTheme();
  return <Text style={{ marginBottom: 8, fontFamily: FONT.bold, fontSize: 12, letterSpacing: 1.7, textTransform: "uppercase", color: t.gold }}>{T.review}</Text>;
}

function SpeakButton({ label, onPress, wide = false }: { label: string; onPress: () => void; wide?: boolean }) {
  const t = useTheme();
  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={label}
      style={{ height: 48, minWidth: 48, paddingHorizontal: 16, borderRadius: R.pill, backgroundColor: t.accent, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, alignSelf: wide ? "stretch" : "center" }}>
      <Icon name="speaker" size={18} color="#ffffff" />
      {wide ? <Text style={{ fontFamily: FONT.bold, fontSize: 14, color: "#ffffff" }}>{label}</Text> : null}
    </Pressable>
  );
}

// a letter count without vowel signs, tatweel and Quranic annotation marks (same ranges as the website)
const letterCount = (s: string) => s.replace(/[\u064B-\u065F\u0670\u0640\u06D6-\u06ED]/g, "").length;

/** answer buttons shared by "choose" and "listen": long words get a smaller size, long meanings (whole verses) one column */
function Options({ opts, answer, picked, checked, onPick }: { opts: { ar?: string; text?: string }[]; answer: number; picked: number | null; checked: boolean; onPick: (i: number) => void }) {
  const small = opts.some((o) => letterCount(o.ar ?? "") > 6);
  const wide = opts.some((o) => (o.text ?? "").length > 40);
  const rows: number[][] = [];
  opts.forEach((_, i) => { if (wide || i % 2 === 0) rows.push([]); rows[rows.length - 1].push(i); });
  return (
    <View style={{ marginTop: 24, gap: 12 }}>
      {rows.map((r, ri) => (
        <View key={ri} style={{ flexDirection: "row", gap: 12 }}>
          {r.map((i) => {
            const state = checked ? (i === answer ? "right" : i === picked ? "wrong" : "idle") : i === picked ? "picked" : "idle";
            return <OptionButton key={i} o={opts[i]} state={state} small={small} wide={wide} disabled={checked} onPress={() => onPick(i)} />;
          })}
          {!wide && r.length === 1 ? <View style={{ flex: 1 }} /> : null}
        </View>
      ))}
    </View>
  );
}

function OptionButton({ o, state, small, wide, disabled, onPress }: { o: { ar?: string; text?: string }; state: "idle" | "picked" | "right" | "wrong"; small: boolean; wide: boolean; disabled: boolean; onPress: () => void }) {
  const t = useTheme();
  const nudge = useNudge();
  useEffect(() => { if (state === "wrong") nudge.run(); }, [state]); // eslint-disable-line react-hooks/exhaustive-deps
  const border = state === "right" || state === "picked" ? "rgb(201,166,94)" : state === "wrong" ? ROSE : t.line;
  const bg = state === "right" ? solidGoldA(0.15) : state === "picked" ? solidGoldA(0.1) : state === "wrong" ? roseA(0.1) : t.surface;
  const size = small ? 28 : 34;
  return (
    <Animated.View style={[{ flex: 1 }, nudge.style]}>
      <Pressable onPress={onPress} disabled={disabled} accessibilityRole="button" accessibilityState={{ selected: state === "picked", disabled }} accessibilityLabel={o.ar ?? o.text}
        style={{ flexGrow: 1, minHeight: 72, borderRadius: R.sm, borderWidth: 2, borderColor: border, backgroundColor: bg, paddingHorizontal: 12, paddingVertical: 8, alignItems: "center", justifyContent: "center" }}>
        {o.ar
          ? <Text allowFontScaling={false} adjustsFontSizeToFit numberOfLines={1} minimumFontScale={0.6} style={{ fontFamily: ARABIC_FONT, fontSize: size, lineHeight: size * 1.75, color: t.ink, writingDirection: "rtl" }}>{o.ar}</Text>
          : <Text style={{ fontFamily: FONT.semibold, fontSize: wide ? 15 : 16, lineHeight: wide ? 21 : 22, color: t.ink, textAlign: "center" }}>{o.text}</Text>}
        <GoldRing on={state === "right"} radius={R.sm} />
      </Pressable>
    </Animated.View>
  );
}

function LearnCard({ ex, T, canSpeak, speak }: { ex: Extract<Ex, { t: "learn" }>; T: TT; canSpeak: boolean; speak: (s: string) => void }) {
  const t = useTheme();
  const clip = useClip();
  // a card with a word reference plays the real recording; without one (or if it cannot be loaded) the device voice is used, if there is one
  const real = !!ex.ref && clip.state !== "error";
  const hasButton = real || (canSpeak && !!ex.speak);
  const size = ex.ar.length > 18 ? 40 : ex.ar.length > 9 ? 54 : 72;
  return (
    <View style={{ borderRadius: R.md, borderWidth: 1, borderColor: goldA(t, 0.3), backgroundColor: t.surface, overflow: "hidden",
      shadowColor: "rgb(201,166,94)", shadowOpacity: 0.35, shadowRadius: 24, shadowOffset: { width: 0, height: 18 } }}>
      <Stage hairlines={false} pattern={false} style={{ minHeight: 230 }}>
        <Girih />
        {ex.ar.length <= 9
          ? <View style={{ position: "absolute", top: 12, left: 0, right: 0, bottom: 0, alignItems: "center" }}><PracticeWindow height={218} opacity={0.9} /></View>
          : <IllumFrame />}
        <View style={{ flex: 1, minHeight: 230, flexDirection: "row", flexWrap: "wrap", alignItems: "center", justifyContent: "center", gap: 16, paddingHorizontal: 16, paddingTop: 48, paddingBottom: 32 }}>
          <Text allowFontScaling={false} style={{ fontFamily: ARABIC_FONT, fontSize: size, lineHeight: size * 1.75, color: "#f6e7bf", textAlign: "center", writingDirection: "rtl", textShadowColor: "rgba(233,207,153,0.35)", textShadowRadius: 22 }}>{ex.ar}</Text>
          {hasButton ? (
            <Pressable onPress={() => (real ? clip.play(wordAudioUrl(ex.ref!)) : speak(ex.speak!))} accessibilityRole="button" accessibilityLabel={T.listen}
              style={({ pressed }) => ({ width: 48, height: 48, borderRadius: 24, borderWidth: 1, borderColor: "rgba(214,180,108,0.5)", alignItems: "center", justifyContent: "center", backgroundColor: clip.state === "playing" || pressed ? "rgba(255,255,255,0.25)" : "rgba(255,255,255,0.1)" })}>
              <Icon name="speaker" size={20} color="#ffffff" />
            </Pressable>
          ) : null}
          {ex.ref && clip.state === "error" && !canSpeak ? <Text style={{ width: "100%", textAlign: "center", fontFamily: FONT.regular, fontSize: 12, color: "rgba(255,255,255,0.6)" }}>{T.offline}</Text> : null}
        </View>
      </Stage>
      <View style={{ padding: 24 }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
          <PracticeStar size={10} />
          <Text style={{ fontFamily: FONT.bold, fontSize: 11, letterSpacing: 1.8, textTransform: "uppercase", color: t.gold }}>{T.learn}</Text>
        </View>
        <Text accessibilityRole="header" style={{ marginTop: 4, fontFamily: FONT.display, fontSize: 24, lineHeight: 29, color: t.ink }}>{ex.title}</Text>
        <Text style={{ marginTop: 12, fontFamily: FONT.regular, fontSize: 16, lineHeight: 26, color: t.ink, opacity: 0.85 }}>{ex.body}</Text>
        <Text style={{ marginTop: 16, fontFamily: FONT.regular, fontSize: 14, lineHeight: 20, color: t.muted }}>{T.tip}</Text>
      </View>
    </View>
  );
}

// "Which word do you hear?" – a real recording of one Quran word (Quran.com), started once when the card appears
function ListenCard({ ex, T, isRetry, canSpeak, speak }: { ex: Extract<Ex, { t: "listen" }>; T: TT; isRetry: boolean; canSpeak: boolean; speak: (s: string) => void }) {
  const t = useTheme();
  const clip = useClip();
  const reduce = useReduceMotion();
  const play = () => clip.play(wordAudioUrl(ex.ref));
  useEffect(() => { play(); }, []); // eslint-disable-line react-hooks/exhaustive-deps
  const word = ex.options[ex.answer].ar;
  const ping = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (clip.state !== "playing" || reduce) { ping.setValue(0); return; }
    const a = Animated.loop(Animated.timing(ping, { toValue: 1, duration: 1000, easing: Easing.out(Easing.quad), useNativeDriver: true }));
    a.start();
    return () => a.stop();
  }, [clip.state, reduce, ping]);
  return (
    <View>
      {isRetry ? <Review T={T} /> : null}
      <Question>{ex.q}</Question>
      <GoldCard style={{ marginTop: 20, paddingVertical: 28, paddingHorizontal: 16, alignItems: "center" }}>
        <View style={{ width: 104, height: 104, borderRadius: 52, borderWidth: 2, borderColor: solidGoldA(0.7), alignItems: "center", justifyContent: "center" }}>
          {clip.state === "playing" && !reduce ? (
            <Animated.View pointerEvents="none" style={{ position: "absolute", width: 96, height: 96, borderRadius: 48, backgroundColor: solidGoldA(0.3),
              opacity: ping.interpolate({ inputRange: [0, 1], outputRange: [0.8, 0] }), transform: [{ scale: ping.interpolate({ inputRange: [0, 1], outputRange: [1, 1.5] }) }] }} />
          ) : null}
          <Pressable onPress={play} accessibilityRole="button" accessibilityLabel={T.listen}
            style={({ pressed }) => ({ width: 96, height: 96, borderRadius: 48, overflow: "hidden", transform: [{ scale: pressed ? 0.95 : 1 }],
              shadowColor: "rgb(6,58,44)", shadowOpacity: 0.9, shadowRadius: 14, shadowOffset: { width: 0, height: 12 } })}>
            <Stage rounded={48} hairlines={false} style={{ width: 96, height: 96, alignItems: "center", justifyContent: "center" }}>
              {clip.state === "loading" ? <ActivityIndicator color="#f3e2b6" /> : <Icon name={clip.state === "playing" ? "speaker" : "play"} size={36} color="#f3e2b6" />}
            </Stage>
          </Pressable>
        </View>
        {clip.state === "error" ? (
          // the recording cannot be loaded: say so quietly and give the transliteration, so the exercise stays solvable
          <View style={{ marginTop: 16, alignItems: "center" }}>
            <Text style={{ fontFamily: FONT.regular, fontSize: 14, lineHeight: 20, color: t.muted, textAlign: "center" }}>{`${T.offline} ${T.wordIs}`}</Text>
            <Text style={{ marginTop: 4, fontFamily: FONT.bold, fontSize: 18, color: t.ink }}>{ex.tr}</Text>
            {canSpeak ? (
              <Pressable onPress={() => speak(word)} accessibilityRole="button" style={{ marginTop: 8, height: 40, flexDirection: "row", alignItems: "center", gap: 8, borderRadius: R.pill, borderWidth: 1, borderColor: t.line, paddingHorizontal: 16 }}>
                <Icon name="speaker" size={16} color={t.ink} /><Text style={{ fontFamily: FONT.semibold, fontSize: 14, color: t.ink }}>{T.voice}</Text>
              </Pressable>
            ) : null}
          </View>
        ) : <Text style={{ marginTop: 16, fontFamily: FONT.regular, fontSize: 14, lineHeight: 20, color: t.muted, textAlign: "center" }}>{T.hearHint}</Text>}
      </GoldCard>
    </View>
  );
}

function MatchCard({ ex, T, onDone }: { ex: Extract<Ex, { t: "match" }>; T: TT; onDone: (mistakes: number) => void }) {
  const t = useTheme();
  const left = useMemo(() => shuffle(ex.pairs.map((p, i) => ({ i, v: p.ar }))), [ex]);
  const right = useMemo(() => shuffle(ex.pairs.map((p, i) => ({ i, v: p.text }))), [ex]);
  const [sel, setSel] = useState<number | null>(null);
  const [done, setDone] = useState<number[]>([]);
  const [bad, setBad] = useState<number | null>(null);
  const mistakes = useRef(0);
  const pickRight = (i: number) => {
    if (sel === null) return;
    if (i === sel) { const d = [...done, i]; setDone(d); setSel(null); tone(true); if (d.length === ex.pairs.length) onDone(mistakes.current); }
    else { mistakes.current += 1; setBad(i); tone(false); setTimeout(() => setBad(null), 450); }
  };
  const cell = (isDone: boolean, on: boolean, wrong: boolean) => ({
    height: 64, borderRadius: R.sm, borderWidth: 2, alignItems: "center" as const, justifyContent: "center" as const, paddingHorizontal: 8,
    borderColor: isDone ? "transparent" : wrong ? ROSE : on ? "rgb(201,166,94)" : t.line,
    backgroundColor: isDone ? solidGoldA(0.15) : wrong ? roseA(0.1) : on ? solidGoldA(0.1) : t.surface,
    opacity: isDone ? 0.4 : 1,
  });
  return (
    <View>
      <Question>{T.match}</Question>
      <View style={{ marginTop: 24, flexDirection: "row", gap: 12 }}>
        <View style={{ flex: 1, gap: 12 }}>
          {left.map((l) => (
            <Pressable key={l.i} disabled={done.includes(l.i)} onPress={() => setSel(l.i)} accessibilityRole="button" accessibilityState={{ selected: sel === l.i, disabled: done.includes(l.i) }} accessibilityLabel={l.v}
              style={cell(done.includes(l.i), sel === l.i, false)}>
              <Text allowFontScaling={false} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.6} style={{ fontFamily: ARABIC_FONT, fontSize: 30, lineHeight: 52, color: t.ink, writingDirection: "rtl" }}>{l.v}</Text>
            </Pressable>
          ))}
        </View>
        <View style={{ flex: 1, gap: 12 }}>
          {right.map((r) => <MatchRight key={r.i} label={r.v} done={done.includes(r.i)} bad={bad === r.i} style={cell(done.includes(r.i), false, bad === r.i)} onPress={() => pickRight(r.i)} />)}
        </View>
      </View>
    </View>
  );
}

function MatchRight({ label, done, bad, style, onPress }: { label: string; done: boolean; bad: boolean; style: object; onPress: () => void }) {
  const t = useTheme();
  const nudge = useNudge();
  useEffect(() => { if (bad) nudge.run(); }, [bad]); // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <Animated.View style={nudge.style}>
      <Pressable disabled={done} onPress={onPress} accessibilityRole="button" accessibilityState={{ disabled: done }} accessibilityLabel={label} style={style}>
        <Text numberOfLines={2} adjustsFontSizeToFit minimumFontScale={0.75} style={{ fontFamily: FONT.semibold, fontSize: 15, lineHeight: 19, color: t.ink, textAlign: "center" }}>{label}</Text>
      </Pressable>
    </Animated.View>
  );
}

// "Put the words in order" – tap the word tiles (Arabic, right to left); a tapped tile moves into the answer row, tapping it there moves it back
function BuildCard({ ex, T, isRetry, onGrade, onNext }: { ex: Extract<Ex, { t: "build" }>; T: TT; isRetry: boolean; onGrade: (ok: boolean) => void; onNext: () => void }) {
  const t = useTheme();
  const order = useMemo(() => {
    const idx = ex.tiles.map((_, i) => i);
    let o = shuffle(idx);
    for (let k = 0; k < 8 && o.every((v, i) => ex.tiles[v] === ex.tiles[i]); k++) o = shuffle(idx); // never start in the solved order
    return o;
  }, [ex]);
  const [placed, setPlaced] = useState<number[]>([]); // slots of the tile pool, in the order they were tapped
  const [checked, setChecked] = useState(false);
  const clip = useClip();
  const text = (slot: number) => ex.tiles[order[slot]];
  const isRight = (slot: number, pos: number) => text(slot) === ex.tiles[pos];
  const ok = placed.length === ex.tiles.length && placed.every(isRight);
  const full = placed.length === ex.tiles.length;
  const playVerse = () => clip.play(verseAudioUrl(ex.s, ex.a));
  const check = () => { setChecked(true); onGrade(ok); if (ok) playVerse(); };
  const tileStyle = { minHeight: 56, borderRadius: R.sm, borderWidth: 2, paddingHorizontal: 16, alignItems: "center" as const, justifyContent: "center" as const };
  const tileText = { fontFamily: ARABIC_FONT, fontSize: 28, lineHeight: 48, color: t.ink, writingDirection: "rtl" as const };
  return (
    <>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 28, paddingBottom: 24 }}>
        <StepIn>
          {isRetry ? <Review T={T} /> : null}
          <Question>{ex.q}</Question>
          <Callout style={{ marginTop: 12, padding: 12 }}>
            <Text style={{ fontFamily: FONT.bold, fontSize: 11, letterSpacing: 1.8, textTransform: "uppercase", color: t.gold }}>{T.meaningLbl}</Text>
            <Text style={{ fontFamily: FONT.regular, fontSize: 15, lineHeight: 21, color: t.ink }}>{ex.hint}</Text>
          </Callout>

          {/* answer row: the first tapped tile sits on the right */}
          <View accessibilityLabel={T.emptyRow}
            style={{ marginTop: 20, minHeight: 84, borderRadius: R.sm, borderWidth: 2, borderStyle: checked ? "solid" : "dashed", padding: 12, flexDirection: "row", direction: "rtl", flexWrap: "wrap", alignItems: "center", gap: 8,
              borderColor: checked ? (ok ? "rgb(201,166,94)" : roseA(0.6)) : goldA(t, 0.35), backgroundColor: checked ? (ok ? solidGoldA(0.12) : roseA(0.05)) : t.surface }}>
            {placed.length === 0 ? <Text style={{ width: "100%", textAlign: "center", fontFamily: FONT.regular, fontSize: 14, color: t.muted }}>{T.emptyRow}</Text> : null}
            {placed.map((slot, i) => (
              <Pressable key={slot} disabled={checked} onPress={() => setPlaced(placed.filter((s) => s !== slot))} accessibilityRole="button" accessibilityLabel={text(slot)}
                style={[tileStyle, checked
                  ? { borderColor: isRight(slot, i) ? "rgb(201,166,94)" : ROSE, backgroundColor: isRight(slot, i) ? t.surface : roseA(0.1) }
                  : { borderColor: "rgb(201,166,94)", backgroundColor: solidGoldA(0.1) }]}>
                <Text allowFontScaling={false} style={tileText}>{text(slot)}</Text>
              </Pressable>
            ))}
            <GoldRing on={checked && ok} radius={R.sm} />
          </View>

          {/* tile pool: placed tiles leave an empty place so nothing jumps around */}
          <View style={{ marginTop: 16, flexDirection: "row", direction: "rtl", flexWrap: "wrap", gap: 8 }}>
            {order.map((_, slot) => placed.includes(slot)
              ? <View key={slot} style={[tileStyle, { borderColor: "transparent", opacity: 0 }]} importantForAccessibility="no-hide-descendants" accessibilityElementsHidden><Text allowFontScaling={false} style={tileText}>{text(slot)}</Text></View>
              : (
                <Pressable key={slot} disabled={checked} onPress={() => setPlaced([...placed, slot])} accessibilityRole="button" accessibilityLabel={text(slot)}
                  style={({ pressed }) => [tileStyle, { borderColor: pressed ? solidGoldA(0.6) : t.line, backgroundColor: t.surface }]}>
                  <Text allowFontScaling={false} style={tileText}>{text(slot)}</Text>
                </Pressable>
              ))}
          </View>
          {!checked ? (
            <View style={{ marginTop: 16, flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
              <Text style={{ flex: 1, fontFamily: FONT.regular, fontSize: 14, lineHeight: 20, color: t.muted }}>{T.tapOrder}</Text>
              {placed.length > 0 ? <Text onPress={() => setPlaced([])} accessibilityRole="button" style={{ fontFamily: FONT.semibold, fontSize: 14, color: t.ink, opacity: 0.7, textDecorationLine: "underline", paddingVertical: 6 }}>{T.reset}</Text> : null}
            </View>
          ) : null}
        </StepIn>
      </ScrollView>

      <Footer tint={checked ? (ok ? "right" : "wrong") : undefined}>
        {checked ? (
          <StepIn distance={6} style={{ marginBottom: 12 }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
              {ok ? <PracticeStar size={16} color={t.gold} /> : null}
              <Text style={{ fontFamily: FONT.bold, fontSize: 16, color: ok ? t.gold : ROSE }}>{ok ? T.right : T.wrong}</Text>
            </View>
            <Text allowFontScaling={false} style={{ marginTop: 4, fontFamily: ARABIC_FONT, fontSize: 24, lineHeight: 46, color: t.ink, writingDirection: "rtl", textAlign: AR_RIGHT }}>{ex.tiles.join(" ")}</Text>
            <Text style={{ fontFamily: FONT.regular, fontSize: 14, lineHeight: 20, color: t.ink, opacity: 0.8 }}>{ex.tr}</Text>
            {clip.state !== "error" ? (
              <Pressable onPress={playVerse} accessibilityRole="button" accessibilityLabel={T.verse}
                style={{ marginTop: 12, alignSelf: "flex-start", height: 40, flexDirection: "row", alignItems: "center", gap: 8, borderRadius: R.pill, borderWidth: 1, borderColor: t.line, backgroundColor: t.surface, paddingHorizontal: 16 }}>
                <Icon name="speaker" size={16} color={t.ink} /><Text style={{ fontFamily: FONT.semibold, fontSize: 14, color: t.ink }}>{T.verse}</Text>
              </Pressable>
            ) : null}
          </StepIn>
        ) : null}
        {!checked
          ? <BigButton title={T.check} disabled={!full} onPress={check} />
          : <BigButton title={T.next} variant={ok ? "gold" : "rose"} onPress={onNext} />}
      </Footer>
    </>
  );
}

