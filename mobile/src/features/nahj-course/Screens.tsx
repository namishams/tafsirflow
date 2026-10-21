import { useEffect, useMemo, useState } from "react";
import { Pressable, Share, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Redirect, Stack, router, type Href } from "expo-router";
import { Page, PageHero } from "@/components/page";
import { Eyebrow, GoldButton, GoldCard, OutlineButton, Segmented, StarLattice, TextLink } from "@/components/brand";
import { CareNote } from "@/components/CareNote";
import { Icon } from "@/components/icons";
import { isRTL, useLang } from "@/i18n";
import { FONT, R, stage, useTheme } from "@/lib/theme";
import { useEntitlement } from "@/lib/entitlements";
import { usePro } from "@/lib/pro";
import { useStored } from "@/lib/store";
import { NAHJ_OPTIN_KEY, setNahjOptIn, useNahjVisible, useTradition } from "@/lib/tradition";
import { award } from "@/web/points";
import { gEvent, useGamify } from "@/features/feed/gamify";
import { takeBurst, tickGarden } from "@/features/garden/garden";
import { GoldRing, StepIn } from "@/features/coursekit/motion";
import { nahjEdition, nahjRef, type NahjEdition, type NahjPassage } from "@/features/hadith/nahj";
import { nahjItem, toggleSaved } from "@/features/hadith/data";
import { HadithShare, useSavedState } from "@/features/hadith/ui";
import {
  PASS_LESSON, PASS_UNIT, courseState, courseUnits, lessonById, lessonQuiz, markLesson, markUnit, nextLesson, sayingOfTheDay, setFont, setLast, studyNote, studyOf, unitById, unitTest,
  useNahjProgress, type Lesson, type Qn, type Unit,
} from "./data";
import { fill, useNahjText, type NahjCourseText } from "./text";

const go = (href: string) => router.push(href as Href);
const unitHref = (u: Unit) => `/nahj-studies/unit/${u.id}`;
const lessonHref = (l: Lesson) => `/nahj-studies/lesson/${l.id}`;

function useEd(): NahjEdition {
  const { lang } = useLang();
  useStored<string | null>("qmc.nahjEdition", null); // follows the edition switch of the feed
  return nahjEdition(lang);
}

function Bar({ frac }: { frac: number }) {
  const t = useTheme();
  return (
    <View style={{ height: 6, borderRadius: 3, backgroundColor: t.line, overflow: "hidden" }} accessible accessibilityRole="progressbar" accessibilityValue={{ min: 0, max: 100, now: Math.round(frac * 100) }}>
      <View style={{ width: `${Math.round(Math.max(0, Math.min(1, frac)) * 100)}%`, height: 6, backgroundColor: t.gold }} />
    </View>
  );
}

/** shown instead of the course when the Nahj al-Balagha is not switched on (Sunni and "both" modes) */
function OptIn() {
  const x = useNahjText();
  const t = useTheme();
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <Page>
        <PageHero back topInset eyebrow={x.kicker} title={x.title} arabic="نهج البلاغة" />
        <View style={{ padding: 16, gap: 14 }}>
          <Text style={{ fontFamily: FONT.regular, fontSize: 15.5, lineHeight: 24, color: t.ink }}>{x.optInIntro}</Text>
          <GoldButton title={x.optInTitle} onPress={() => setNahjOptIn(true)} />
          <Text style={{ fontFamily: FONT.regular, fontSize: 12.5, lineHeight: 18, color: t.muted }}>{x.optInNote}</Text>
        </View>
      </Page>
    </>
  );
}

/** the Account setting: shown for Sunni and "both" (Shia mode shows the Nahj al-Balagha by default) */
export function NahjOptInSetting() {
  const x = useNahjText();
  const t = useTheme();
  const { tradition } = useTradition();
  const on = useStored<boolean>(NAHJ_OPTIN_KEY, false);
  if (tradition === "shia") return null;
  return (
    <View style={{ gap: 8, marginTop: 14 }}>
      <Text style={{ fontFamily: FONT.semibold, fontSize: 14, color: t.ink }}>{x.optInTitle}</Text>
      <Segmented<"on" | "off"> value={on ? "on" : "off"} options={[["on", x.optInOn], ["off", x.optInOff]]} onChange={(v) => setNahjOptIn(v === "on")} />
      <Text style={{ fontFamily: FONT.regular, fontSize: 12.5, lineHeight: 18, color: t.muted }}>{x.optInNote}</Text>
    </View>
  );
}

// ---------- course home ----------
export function NahjCourseHome() {
  const visible = useNahjVisible();
  if (!visible) return <OptIn />;
  return <Home />;
}

function Home() {
  const x = useNahjText();
  const t = useTheme();
  const ed = useEd();
  const { lang } = useLang();
  const rtl = isRTL(lang);
  const p = useNahjProgress();
  const ent = useEntitlement("nahj");
  const units = useMemo(() => courseUnits(ed), [ed]);
  const st = courseState(ed, p);
  const cont = nextLesson(ed, p);
  const day = useMemo(() => sayingOfTheDay(ed), [ed]);
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <Page>
        <PageHero back topInset eyebrow={x.kicker} title={x.title} lead={x.lead} arabic="نهج البلاغة">
          {cont ? <GoldButton compact title={st.lessonsDone ? x.cont : x.start} onPress={() => (units.findIndex((u) => u.id === cont.unit) > 0 && !ent.allowed ? ent.upsell() : go(lessonHref(cont)))} style={{ marginTop: 14, alignSelf: "flex-start" }} /> : null}
        </PageHero>
        <View style={{ padding: 16, gap: 14 }}>
          <View style={{ backgroundColor: t.surface, borderRadius: 14, borderWidth: 1, borderColor: t.line, padding: 16, gap: 10 }}>
            <Text style={{ fontFamily: FONT.regular, fontSize: 13.5, color: t.muted }}>{fill(x.progress, { n: st.lessonsDone, m: st.lessons })} · {fill(x.unitsDone, { n: st.unitsPassed, m: st.units })}</Text>
            <Bar frac={st.done} />
            {p.cert ? <GoldButton compact title={x.viewCert} icon="trophy" onPress={() => go("/nahj-studies/certificate")} style={{ alignSelf: "flex-start" }} /> : <Text style={{ fontFamily: FONT.regular, fontSize: 12.5, color: t.muted }}>{x.certLocked}</Text>}
          </View>

          {day ? <Saying p={day} ed={ed} /> : null}

          {units.map((u, ui) => {
            const locked = ui > 0 && !ent.allowed;
            const done = u.lessons.filter((l) => p.lessons[l.id]).length;
            const allDone = done === u.lessons.length;
            return (
              <View key={u.id} style={{ backgroundColor: t.surface, borderRadius: 14, borderWidth: 1, borderColor: t.line, padding: 16, gap: 4 }}>
                <Eyebrow>{`${x.unit} ${u.n}`}</Eyebrow>
                <Text accessibilityRole="header" style={{ fontFamily: FONT.display, fontSize: 21, color: t.ink, writingDirection: rtl ? "rtl" : "ltr" }}>{x.units[u.theme] ?? ""}</Text>
                <Text style={{ fontFamily: FONT.regular, fontSize: 12.5, color: t.muted, marginBottom: 6 }}>{fill(x.progress, { n: done, m: u.lessons.length })}{ui === 0 ? ` · ${x.free}` : ""}</Text>
                {u.lessons.map((l) => {
                  const d = !!p.lessons[l.id], current = cont?.id === l.id;
                  return (
                    <Pressable key={l.id} accessibilityRole="button" accessibilityLabel={`${x.lesson} ${l.n}: ${l.title}${d ? `, ${x.done}` : ""}${locked ? ", Pro" : ""}`}
                      onPress={() => (locked ? ent.upsell() : go(lessonHref(l)))}
                      style={({ pressed }) => ({ flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 10, borderTopWidth: 1, borderTopColor: t.line, opacity: pressed ? 0.7 : 1 })}>
                      <View style={{ width: 30, height: 30, borderRadius: 15, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: d || current ? t.gold : t.line, backgroundColor: d ? t.gold : "transparent" }}>
                        {d ? <Icon name="check" size={15} color={t.bg} /> : <Text style={{ fontFamily: FONT.semibold, fontSize: 12.5, color: current ? t.gold : t.muted }}>{l.n}</Text>}
                      </View>
                      <Text style={{ flex: 1, fontFamily: FONT.semibold, fontSize: 15, color: t.ink, writingDirection: rtl ? "rtl" : "ltr" }}>{l.title}</Text>
                      <Icon name={locked ? "lock" : "chevronRight"} size={16} color={locked ? t.gold : t.muted} />
                    </Pressable>
                  );
                })}
                <Pressable accessibilityRole="button" accessibilityLabel={`${x.unitTest}${p.units[u.id] ? `, ${x.unitPassed}` : ""}`}
                  onPress={() => (locked ? ent.upsell() : go(unitHref(u)))}
                  style={({ pressed }) => ({ flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 10, borderTopWidth: 1, borderTopColor: t.line, opacity: pressed ? 0.7 : 1 })}>
                  <Icon name={p.units[u.id] ? "check" : "trophy"} size={20} color={t.gold} />
                  <Text style={{ flex: 1, fontFamily: FONT.semibold, fontSize: 15, color: allDone ? t.ink : t.muted }}>{x.unitTest}{p.units[u.id] ? ` · ${x.unitPassed}` : ""}</Text>
                  <Icon name="chevronRight" size={16} color={t.muted} />
                </Pressable>
              </View>
            );
          })}

          <OutlineButton title={x.library} icon="book" onPress={() => go("/nahj-studies/library")} />
          <View style={{ borderRadius: 12, borderWidth: 1, borderColor: t.gold, padding: 14, gap: 6 }}>
            <Eyebrow>{x.aboutT}</Eyebrow>
            <Text style={{ fontFamily: FONT.regular, fontSize: 14, lineHeight: 21, color: t.ink, writingDirection: rtl ? "rtl" : "ltr" }}>{x.about}</Text>
            <Text style={{ fontFamily: FONT.regular, fontSize: 12.5, color: t.muted }}>{studyNote(ed)}</Text>
          </View>
        </View>
      </Page>
    </>
  );
}

// ---------- one passage: text, save, share, explanation panel ----------
const SIZES = [15.5, 17.5, 19.5, 22];

function PassageBlock({ p, ed, open: initial = false }: { p: NahjPassage; ed: NahjEdition; open?: boolean }) {
  const x = useNahjText();
  const t = useTheme();
  const { lang } = useLang();
  const rtl = isRTL(lang);
  const prog = useNahjProgress();
  const item = useMemo(() => nahjItem(p), [p]);
  const saved = useSavedState(item.id);
  const [share, setShare] = useState(false);
  const [open, setOpen] = useState(initial);
  const study = studyOf(ed, p.id);
  const size = SIZES[Math.max(0, Math.min(3, prog.font ?? 1))];
  return (
    <View style={{ gap: 10 }}>
      <View style={{ borderRadius: R.card, overflow: "hidden", borderWidth: 1, borderColor: stage.goldSoft }}>
        <LinearGradient colors={[stage.bg, stage.deep]} style={{ padding: 18 }}>
          <StarLattice opacity={0.05} />
          <Text style={{ fontFamily: FONT.semibold, fontSize: 12, letterSpacing: 1.8, textTransform: "uppercase", color: stage.gold }}>{nahjRef(ed, p)}</Text>
          <Text lang={p.edition} selectable style={{ fontFamily: FONT.regular, fontSize: size, lineHeight: size * 1.55, color: "#fff", marginTop: 10, writingDirection: rtl ? "rtl" : "ltr" }}>{p.text}</Text>
          <Text style={{ fontFamily: FONT.regular, fontSize: 12.5, color: stage.textMuted, marginTop: 12 }}>{p.credit}</Text>
          <View style={{ flexDirection: "row", gap: 10, marginTop: 14 }}>
            <Chip icon="bookmark" label={saved ? x.saved : x.save} on={saved} onPress={() => toggleSaved(item)} />
            <Chip icon="send" label={x.share} onPress={() => setShare(true)} />
          </View>
        </LinearGradient>
      </View>
      {study ? (
        <View style={{ borderRadius: 12, borderWidth: 1, borderColor: t.line, backgroundColor: t.surface }}>
          <Pressable onPress={() => setOpen(!open)} accessibilityRole="button" accessibilityState={{ expanded: open }} accessibilityLabel={x.explanation}
            style={{ flexDirection: "row", alignItems: "center", gap: 10, padding: 14 }}>
            <Icon name="book" size={18} color={t.gold} />
            <Text style={{ flex: 1, fontFamily: FONT.semibold, fontSize: 15, color: t.ink }}>{x.explanation}</Text>
            <View style={{ transform: [{ rotate: open ? "180deg" : "0deg" }] }}><Icon name="chevronDown" size={16} color={t.muted} /></View>
          </Pressable>
          {open ? (
            <View style={{ paddingHorizontal: 14, paddingBottom: 14, gap: 10 }}>
              <Text lang={ed} style={{ fontFamily: FONT.regular, fontSize: 15, lineHeight: 23, color: t.ink, writingDirection: rtl ? "rtl" : "ltr" }}>{study.e}</Text>
              <Eyebrow>{x.reflect}</Eyebrow>
              {study.r.map((q, i) => <Text key={i} lang={ed} style={{ fontFamily: FONT.regular, fontSize: 14.5, lineHeight: 22, color: t.ink, writingDirection: rtl ? "rtl" : "ltr" }}>{`• ${q}`}</Text>)}
              <CareNote />
            </View>
          ) : null}
        </View>
      ) : null}
      {share ? <HadithShare item={item} onClose={() => setShare(false)} /> : null}
    </View>
  );
}

function Chip({ icon, label, on, onPress }: { icon: "bookmark" | "send"; label: string; on?: boolean; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={label} accessibilityState={on !== undefined ? { selected: on } : undefined} hitSlop={6}
      style={{ flexDirection: "row", alignItems: "center", gap: 7, minHeight: 40, paddingHorizontal: 13, borderRadius: R.pill, borderWidth: 1, borderColor: on ? stage.gold : stage.goldSoft, backgroundColor: on ? "rgba(214,180,108,0.2)" : "rgba(255,255,255,0.06)" }}>
      <Icon name={icon} color={stage.gold} size={16} />
      <Text style={{ fontFamily: FONT.semibold, fontSize: 13.5, color: "#fff" }}>{label}</Text>
    </Pressable>
  );
}

function Saying({ p, ed }: { p: NahjPassage; ed: NahjEdition }) {
  const x = useNahjText();
  return (
    <View style={{ gap: 8 }}>
      <Eyebrow>{x.saying}</Eyebrow>
      <PassageBlock p={p} ed={ed} />
    </View>
  );
}

// ---------- quiz ----------
const qText = (x: NahjCourseText, q: string) => (q.startsWith("matchQ|") ? fill(x.matchQ, { s: q.slice(7) }) : q);

function Quiz({ quiz, onDone }: { quiz: Qn[]; onDone: (score: number) => void }) {
  const x = useNahjText();
  const t = useTheme();
  const { lang } = useLang();
  const rtl = isRTL(lang);
  const [i, setI] = useState(0);
  const [score, setScore] = useState(0);
  const [chosen, setChosen] = useState<number | null>(null);
  const q = quiz[i];
  const next = () => {
    const s = score + (chosen === q.a ? 1 : 0);
    if (i + 1 >= quiz.length) onDone(s);
    else { setScore(s); setI(i + 1); setChosen(null); }
  };
  return (
    <StepIn key={i} style={{ gap: 12 }}>
      <Eyebrow>{fill(x.question, { n: i + 1, m: quiz.length })}</Eyebrow>
      <Text accessibilityRole="header" style={{ fontFamily: FONT.display, fontSize: 20, lineHeight: 28, color: t.ink, writingDirection: rtl ? "rtl" : "ltr" }}>{qText(x, q.q)}</Text>
      {q.o.map((o, k) => {
        const right = chosen !== null && k === q.a, wrong = chosen === k && k !== q.a;
        return (
          <Pressable key={k} disabled={chosen !== null} accessibilityRole="button" accessibilityLabel={o} accessibilityState={{ selected: chosen === k }} onPress={() => setChosen(k)}
            style={({ pressed }) => ({ flexDirection: "row", alignItems: "center", gap: 10, padding: 14, borderRadius: 12, borderWidth: 1.5, borderColor: right ? t.gold : wrong ? "rgb(160,58,52)" : t.line, backgroundColor: t.surface, opacity: pressed ? 0.8 : 1 })}>
            <Text style={{ flex: 1, fontFamily: FONT.regular, fontSize: 15, lineHeight: 22, color: t.ink, writingDirection: rtl ? "rtl" : "ltr" }}>{o}</Text>
            <GoldRing on={right} />
          </Pressable>
        );
      })}
      {chosen !== null ? (
        <View accessibilityLiveRegion="polite" style={{ gap: 8 }}>
          <Text style={{ fontFamily: FONT.semibold, fontSize: 14, color: chosen === q.a ? t.gold : "rgb(160,58,52)" }}>{chosen === q.a ? x.right : x.wrong}</Text>
          <GoldButton title={x.next} onPress={next} />
        </View>
      ) : null}
    </StepIn>
  );
}

function useRewards() {
  const gm = useGamify();
  const { pro } = usePro();
  return (first: boolean) => {
    if (first) { award("lesson"); gEvent({ t: "verse" }); }
    award("quiz");
    takeBurst();
    tickGarden(gm.xp, false, pro, gm.names);
    return takeBurst();
  };
}

// ---------- lesson ----------
export function NahjLessonScreen({ id }: { id: string }) {
  const visible = useNahjVisible();
  if (!visible) return <Redirect href={"/nahj-studies" as Href} />;
  return <LessonBody id={id} />;
}

function LessonBody({ id }: { id: string }) {
  const x = useNahjText();
  const t = useTheme();
  const ed = useEd();
  const { lang } = useLang();
  const rtl = isRTL(lang);
  const ent = useEntitlement("nahj");
  const prog = useNahjProgress();
  const rewards = useRewards();
  const lesson = lessonById(ed, id);
  const unit = lesson ? unitById(ed, lesson.unit) : null;
  const [phase, setPhase] = useState<"read" | "quiz" | "result">("read");
  const [res, setRes] = useState<{ score: number; of: number; burst: number; passed: boolean; complete: boolean } | null>(null);
  const quiz = useMemo(() => (lesson ? lessonQuiz(ed, lesson) : []), [ed, lesson]);
  useEffect(() => { setPhase("read"); setRes(null); if (lesson) setLast(lesson.id); }, [id]); // eslint-disable-line react-hooks/exhaustive-deps
  if (!lesson || !unit) return <Page><PageHero back topInset title={x.notFound} /></Page>;
  const idx = courseUnits(ed).indexOf(unit);
  const locked = idx > 0 && !ent.allowed;
  const all = courseUnits(ed).flatMap((u) => u.lessons);
  const nextL = all[all.findIndex((l) => l.id === lesson.id) + 1];
  const finish = (score: number) => {
    const r = markLesson(ed, lesson.id, score, quiz.length);
    const burst = r.passed ? rewards(r.first) : 0;
    setRes({ score, of: quiz.length, burst, passed: r.passed, complete: r.complete });
    setPhase("result");
  };
  const para = { fontFamily: FONT.regular, fontSize: 15.5, lineHeight: 24, color: t.ink, writingDirection: rtl ? "rtl" : "ltr" } as const;
  const font = prog.font ?? 1;
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <Page>
        <PageHero back topInset eyebrow={`${x.units[unit.theme] ?? ""} · ${x.lesson} ${lesson.n}`} title={lesson.title} arabic="نهج البلاغة" />
        <View style={{ padding: 16, gap: 14 }}>
          {locked ? (
            <View style={{ gap: 12 }}>
              <Text style={para}>{lesson.aim}</Text>
              <GoldButton title={x.unlock} icon="lock" onPress={ent.upsell} />
            </View>
          ) : phase === "read" ? (
            <StepIn style={{ gap: 14 }}>
              <Eyebrow>{x.aim}</Eyebrow>
              <Text style={para}>{lesson.aim}</Text>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }} accessibilityRole="toolbar">
                <Text style={{ fontFamily: FONT.semibold, fontSize: 13, color: t.muted, flex: 1 }}>{x.textSize}</Text>
                <SizeButton label={x.smaller} glyph="A−" disabled={font <= 0} onPress={() => setFont(font - 1)} />
                <SizeButton label={x.larger} glyph="A+" disabled={font >= 3} onPress={() => setFont(font + 1)} />
              </View>
              {lesson.items.map((p, i) => <PassageBlock key={p.id} p={p} ed={ed} open={i === 0} />)}
              <GoldButton title={x.quizStart} onPress={() => setPhase("quiz")} style={{ marginTop: 8 }} />
            </StepIn>
          ) : phase === "quiz" ? (
            quiz.length ? <Quiz quiz={quiz} onDone={finish} /> : <GoldButton title={x.next} onPress={() => finish(0)} />
          ) : res ? (
            <StepIn style={{ gap: 12 }}>
              <Text accessibilityRole="header" style={{ fontFamily: FONT.display, fontSize: 24, color: t.ink, textAlign: "center" }}>{fill(x.result, { n: res.score, m: res.of })}</Text>
              {res.burst > 0 ? <Text style={{ fontFamily: FONT.semibold, fontSize: 14, color: t.gold, textAlign: "center" }}>{fill(x.growth, { n: res.burst })}</Text> : null}
              {!res.passed ? <Text style={{ fontFamily: FONT.regular, fontSize: 14, color: t.muted, textAlign: "center" }}>{`${Math.round(PASS_LESSON * 100)} %`}</Text> : null}
              {res.complete ? <GoldButton title={x.viewCert} icon="trophy" onPress={() => router.replace("/nahj-studies/certificate" as Href)} /> : null}
              {res.passed && nextL ? <GoldButton title={x.nextLesson} onPress={() => (courseUnits(ed).findIndex((u) => u.id === nextL.unit) > 0 && !ent.allowed ? ent.upsell() : router.replace(lessonHref(nextL) as Href))} /> : null}
              <OutlineButton title={x.retry} onPress={() => setPhase("quiz")} />
              <TextLink title={x.back} onPress={() => router.replace("/nahj-studies" as Href)} style={{ alignSelf: "center" }} />
            </StepIn>
          ) : null}
        </View>
      </Page>
    </>
  );
}

function SizeButton({ label, glyph, disabled, onPress }: { label: string; glyph: string; disabled: boolean; onPress: () => void }) {
  const t = useTheme();
  return (
    <Pressable onPress={onPress} disabled={disabled} accessibilityRole="button" accessibilityLabel={label} accessibilityState={{ disabled }} hitSlop={6}
      style={{ width: 44, height: 40, borderRadius: R.pill, borderWidth: 1, borderColor: t.line, alignItems: "center", justifyContent: "center", opacity: disabled ? 0.4 : 1 }}>
      <Text style={{ fontFamily: FONT.semibold, fontSize: 15, color: t.ink }}>{glyph}</Text>
    </Pressable>
  );
}

// ---------- unit test ----------
export function NahjUnitScreen({ id }: { id: string }) {
  const visible = useNahjVisible();
  if (!visible) return <Redirect href={"/nahj-studies" as Href} />;
  return <UnitBody id={id} />;
}

function UnitBody({ id }: { id: string }) {
  const x = useNahjText();
  const t = useTheme();
  const ed = useEd();
  const ent = useEntitlement("nahj");
  const prog = useNahjProgress();
  const rewards = useRewards();
  const unit = unitById(ed, id);
  const [phase, setPhase] = useState<"intro" | "quiz" | "result">("intro");
  const [res, setRes] = useState<{ score: number; of: number; passed: boolean; burst: number; complete: boolean } | null>(null);
  const quiz = useMemo(() => (unit ? unitTest(ed, unit) : []), [ed, unit]);
  if (!unit) return <Page><PageHero back topInset title={x.notFound} /></Page>;
  const idx = courseUnits(ed).indexOf(unit);
  const ready = unit.lessons.every((l) => prog.lessons[l.id]);
  const finish = (score: number) => {
    const r = markUnit(ed, unit.id, score, quiz.length);
    const burst = r.passed ? rewards(r.first) : 0;
    setRes({ score, of: quiz.length, passed: r.passed, burst, complete: r.complete });
    setPhase("result");
  };
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <Page>
        <PageHero back topInset eyebrow={`${x.unit} ${unit.n}`} title={x.unitTest} lead={x.units[unit.theme]} arabic="نهج البلاغة" />
        <View style={{ padding: 16, gap: 14 }}>
          {idx > 0 && !ent.allowed ? <GoldButton title={x.unlock} icon="lock" onPress={ent.upsell} />
            : phase === "intro" ? (
              <StepIn style={{ gap: 12 }}>
                <Text style={{ fontFamily: FONT.regular, fontSize: 15.5, lineHeight: 24, color: t.ink }}>{fill(x.unitTestLead, { m: quiz.length, p: Math.round(PASS_UNIT * 100) })}</Text>
                {!ready ? <Text style={{ fontFamily: FONT.regular, fontSize: 14, color: t.muted }}>{x.unitLocked}</Text> : null}
                {prog.units[unit.id] ? <Text style={{ fontFamily: FONT.semibold, fontSize: 14, color: t.gold }}>{x.unitPassed}</Text> : null}
                <GoldButton title={x.quizStart} disabled={!ready || !quiz.length} onPress={() => setPhase("quiz")} />
              </StepIn>
            ) : phase === "quiz" ? <Quiz quiz={quiz} onDone={finish} />
            : res ? (
              <StepIn style={{ gap: 12 }}>
                <Text accessibilityRole="header" style={{ fontFamily: FONT.display, fontSize: 24, color: t.ink, textAlign: "center" }}>{fill(x.result, { n: res.score, m: res.of })}</Text>
                <Text style={{ fontFamily: FONT.semibold, fontSize: 14.5, color: res.passed ? t.gold : t.muted, textAlign: "center" }}>{res.passed ? x.unitPassed : x.unitFailed}</Text>
                {res.burst > 0 ? <Text style={{ fontFamily: FONT.semibold, fontSize: 14, color: t.gold, textAlign: "center" }}>{fill(x.growth, { n: res.burst })}</Text> : null}
                {res.complete ? <GoldButton title={x.viewCert} icon="trophy" onPress={() => router.replace("/nahj-studies/certificate" as Href)} /> : null}
                {!res.passed ? <OutlineButton title={x.retry} onPress={() => setPhase("quiz")} /> : null}
                <TextLink title={x.back} onPress={() => router.replace("/nahj-studies" as Href)} style={{ alignSelf: "center" }} />
              </StepIn>
            ) : null}
        </View>
      </Page>
    </>
  );
}

// ---------- lesson library ----------
export function NahjLibraryScreen() {
  const visible = useNahjVisible();
  const x = useNahjText();
  const t = useTheme();
  const ed = useEd();
  const { lang } = useLang();
  const rtl = isRTL(lang);
  const ent = useEntitlement("nahj");
  const prog = useNahjProgress();
  if (!visible) return <Redirect href={"/nahj-studies" as Href} />;
  const units = courseUnits(ed);
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <Page>
        <PageHero back topInset eyebrow={x.title} title={x.library} lead={x.libraryLead} arabic="نهج البلاغة" />
        <View style={{ padding: 16, gap: 14 }}>
          {units.map((u, ui) => (
            <View key={u.id} style={{ backgroundColor: t.surface, borderRadius: 14, borderWidth: 1, borderColor: t.line, padding: 16 }}>
              <Eyebrow>{`${x.unit} ${u.n}`}</Eyebrow>
              <Text accessibilityRole="header" style={{ fontFamily: FONT.display, fontSize: 19, color: t.ink, marginBottom: 6, writingDirection: rtl ? "rtl" : "ltr" }}>{x.units[u.theme] ?? ""}</Text>
              {u.lessons.map((l) => {
                const locked = ui > 0 && !ent.allowed;
                return (
                  <Pressable key={l.id} accessibilityRole="button" accessibilityLabel={`${x.lesson} ${l.n}: ${l.title}. ${l.items.map((p) => nahjRef(ed, p)).join(", ")}`}
                    onPress={() => (locked ? ent.upsell() : go(lessonHref(l)))}
                    style={({ pressed }) => ({ paddingVertical: 11, borderTopWidth: 1, borderTopColor: t.line, gap: 3, opacity: pressed ? 0.7 : 1 })}>
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                      <Text style={{ flex: 1, fontFamily: FONT.semibold, fontSize: 15, color: t.ink, writingDirection: rtl ? "rtl" : "ltr" }}>{`${l.n}. ${l.title}`}</Text>
                      {prog.lessons[l.id] ? <Icon name="check" size={15} color={t.gold} /> : null}
                      <Icon name={locked ? "lock" : "chevronRight"} size={15} color={locked ? t.gold : t.muted} />
                    </View>
                    <Text style={{ fontFamily: FONT.regular, fontSize: 12.5, lineHeight: 18, color: t.muted }}>{fill(x.passages, { n: l.items.length })}: {l.items.map((p) => nahjRef(ed, p)).join(" · ")}</Text>
                  </Pressable>
                );
              })}
            </View>
          ))}
        </View>
      </Page>
    </>
  );
}

// ---------- certificate ----------
export function NahjCertificateScreen() {
  const visible = useNahjVisible();
  const x = useNahjText();
  const t = useTheme();
  const ed = useEd();
  const p = useNahjProgress();
  if (!visible) return <Redirect href={"/nahj-studies" as Href} />;
  const st = courseState(ed, p);
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <Page>
        <PageHero back topInset eyebrow={x.certificate} title={x.title} arabic="نهج البلاغة" />
        <View style={{ padding: 16, gap: 14 }}>
          {p.cert ? (
            <GoldCard>
              <Text style={{ fontFamily: FONT.display, fontSize: 24, color: t.ink, textAlign: "center" }}>{x.title}</Text>
              <Text style={{ fontFamily: FONT.regular, fontSize: 15, color: t.muted, textAlign: "center", marginTop: 8 }}>{x.certYou}</Text>
              <Text style={{ fontFamily: FONT.semibold, fontSize: 28, color: t.gold, textAlign: "center", marginTop: 12 }}>{`${p.cert.pct} %`}</Text>
              <Text style={{ fontFamily: FONT.regular, fontSize: 13, color: t.muted, textAlign: "center", marginTop: 8 }}>{new Date(p.cert.at).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" })}</Text>
              <Text style={{ fontFamily: FONT.regular, fontSize: 12, color: t.muted, textAlign: "center", marginTop: 12 }}>{x.certNote}</Text>
            </GoldCard>
          ) : <Text style={{ fontFamily: FONT.regular, fontSize: 15, color: t.muted }}>{x.certLocked} {fill(x.progress, { n: st.lessonsDone, m: st.lessons })}</Text>}
          {p.cert ? <GoldButton title={x.share} icon="send" onPress={() => void Share.share({ message: `${x.title}: ${x.certYou} (${p.cert!.pct} %)` })} /> : null}
        </View>
      </Page>
    </>
  );
}
