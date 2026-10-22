import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Pressable, Text, View } from "react-native";
import { Stack, router, type Href } from "expo-router";
import { Page, PageHero, useWide } from "@/components/page";
import { Eyebrow, GoldButton, GoldProgress, OutlineButton, SmallStar } from "@/components/brand";
import { Icon } from "@/components/icons";
import { isRTL, useLang } from "@/i18n";
import { ARABIC_FONT, CALLIG_FONT, FONT, FWD, R, useTheme } from "@/lib/theme";
import { useEntitlement } from "@/lib/entitlements";
import { usePro } from "@/lib/pro";
import { HmCard, QuranQuote } from "@/features/extra/art";
import { openVerse } from "@/features/coursekit/links";
import { Markdown } from "@/features/coursekit/Markdown";
import { StepIn, useNudge } from "@/features/coursekit/motion";
import { Callout } from "@/features/coursekit/ui";
import { GoldRing, StarBadge } from "@/features/today/art";
import { bonusXp, gEvent, useGamify, type Motif, type Shape, type StickerDef, type Tone } from "@/features/feed/gamify";
import { StickerArt } from "@/features/feed/Sticker";
import { success, tick } from "@/features/feed/haptics";
import { takeBurst, tickGarden } from "@/features/garden/garden";
import { award } from "@/web/points";
import { COURSES, courseById, tx } from "./index";
import { nameRefs, useAllahNames } from "./names";
import { PASS, doneCount, isPassed, saveCourseLesson, useCP } from "./progress";
import { useCT } from "./texts";
import type { CLesson, CQuestion, Course, Tag } from "./types";
import { AskTutor } from "@/features/tutor/AskTutor";
import { useTutor } from "@/features/tutor/hooks";
import type { TutorContext } from "@/features/tutor/api";

// Screens of the academy courses: overview of all courses, one course (lesson path, sticker), one lesson (explanation,
// verses by key from the Quran API, hadith references, tags, quiz, rewards). Rewards: a passed lesson counts as a
// lesson in the points (and so grows the tree via the garden), every first answer counts for the feed quests, a
// finished course adds bonus XP and its sticker.

const ACADEMY = "academy";
const STICKER_STYLE: Record<string, { shape: Shape; motif: Motif; tone: Tone }> = {
  seerah: { shape: "arch", motif: "palm", tone: "gold" }, prophets: { shape: "rosette", motif: "scroll", tone: "emerald" }, ulum: { shape: "hex", motif: "book", tone: "night" },
  "hadith-sci": { shape: "hex", motif: "scroll", tone: "emerald" }, aqidah: { shape: "star", motif: "star8", tone: "gold" }, "fiqh-salah-sawm": { shape: "arch", motif: "mat", tone: "night" },
  akhlaq: { shape: "circle", motif: "rose", tone: "emerald" }, adhkar: { shape: "circle", motif: "drop", tone: "night" }, names: { shape: "star", motif: "star8", tone: "rare" },
  ramadan: { shape: "rosette", motif: "lantern", tone: "gold" }, hajj: { shape: "arch", motif: "dome", tone: "gold" }, "tajweed-deep": { shape: "hex", motif: "wave", tone: "night" },
};
export const courseSticker = (id: string): StickerDef => ({ id: `course-${id}`, fam: "course", ...(STICKER_STYLE[id] ?? { shape: "circle", motif: "book", tone: "emerald" }) });
const COURSE_XP = 100, LESSON_XP = 15;

/** the lesson's index is free, or the user has Pro */
function useOpen(course: Course) {
  const ent = useEntitlement(ACADEMY);
  return { allowed: ent.allowed, upsell: ent.upsell, open: (i: number) => ent.allowed || i < course.free };
}

/** card for the academy and other overviews */
export function CoursesEntry() {
  const t = useTheme();
  const c = useCT();
  const p = useCP();
  const n = COURSES.filter((x) => p.complete[x.id]).length;
  return (
    <HmCard onPress={() => router.push("/courses" as Href)} accessibilityLabel={`${c("coursesTitle")}. ${c("coursesCard")}`} style={{ marginTop: 16 }}>
      <Text style={{ fontFamily: FONT.semibold, fontSize: 11, letterSpacing: 1.5, textTransform: "uppercase", color: t.gold }}>{c("coursesKicker")}</Text>
      <Text style={{ fontFamily: FONT.bold, fontSize: 18, color: t.ink, marginTop: 4 }}>{c("coursesTitle")}</Text>
      <Text style={{ fontFamily: FONT.regular, fontSize: 14, lineHeight: 21, color: t.muted, marginTop: 4 }}>{c("coursesCard")}</Text>
      <Text style={{ fontFamily: FONT.semibold, fontSize: 12, color: t.accent, marginTop: 10 }}>{`${n}/${COURSES.length} ${FWD}`}</Text>
    </HmCard>
  );
}

export function CoursesHome() {
  const t = useTheme();
  const c = useCT();
  const { lang } = useLang();
  const wide = useWide();
  const p = useCP();
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <Page>
        <PageHero back topInset eyebrow={c("coursesKicker")} title={c("coursesTitle")} lead={c("coursesLead")} />
        <View style={{ padding: 16, flexDirection: "row", flexWrap: "wrap", gap: 12 }}>
          {COURSES.map((co, i) => {
            const d = doneCount(p, co.id, co.lessons.map((l) => l.id));
            const complete = !!p.complete[co.id];
            return (
              <StepIn key={co.id} delay={Math.min(i, 8) * 40} style={{ width: wide ? "48.5%" : "100%" }}>
                <HmCard onPress={() => router.push(`/courses/${co.id}` as Href)} accessibilityLabel={`${tx(co.title, lang)}. ${c("progress", { d, n: co.lessons.length })}`} style={{ overflow: "hidden" }}>
                  <Text allowFontScaling={false} numberOfLines={1} accessibilityElementsHidden importantForAccessibility="no"
                    style={{ position: "absolute", bottom: -22, end: 0, fontFamily: CALLIG_FONT, fontSize: 54, lineHeight: 90, color: "rgba(201,166,94,0.14)" }}>{co.word}</Text>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
                    {complete ? <StickerArt def={courseSticker(co.id)} size={48} /> : <StarBadge size={44} tone={d > 0 ? "gold" : "light"}>{i + 1}</StarBadge>}
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontFamily: FONT.bold, fontSize: 16.5, color: t.ink }}>{tx(co.title, lang)}</Text>
                      <Text style={{ fontFamily: FONT.regular, fontSize: 12.5, color: t.muted, marginTop: 2 }}>{c("progress", { d, n: co.lessons.length })}</Text>
                    </View>
                  </View>
                  <Text style={{ fontFamily: FONT.regular, fontSize: 14, lineHeight: 21, color: t.muted, marginTop: 10 }} numberOfLines={3}>{tx(co.lead, lang)}</Text>
                  <View style={{ marginTop: 10, maxWidth: 260 }}><GoldProgress value={d / Math.max(1, co.lessons.length)} /></View>
                </HmCard>
              </StepIn>
            );
          })}
        </View>
      </Page>
    </>
  );
}

function TagChips({ tags }: { tags?: Tag[] }) {
  const t = useTheme();
  const c = useCT();
  if (!tags?.length) return null;
  return (
    <View style={{ gap: 6 }}>
      <Eyebrow>{c("tagsTitle")}</Eyebrow>
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6 }}>
        {tags.map((g) => (
          <View key={g} style={{ paddingHorizontal: 10, paddingVertical: 5, borderRadius: R.pill, borderWidth: 1, borderColor: t.line, backgroundColor: t.surface }}>
            <Text style={{ fontFamily: FONT.semibold, fontSize: 12, color: t.muted }}>{c(`tag_${g}` as never)}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const HADITH_NAMES: Record<string, string> = { bukhari: "al-Bukhari", muslim: "Muslim", tirmidhi: "at-Tirmidhi", abudawud: "Abu Dawud", nasai: "an-Nasa'i", ibnmajah: "Ibn Majah", ahmad: "Ahmad", malik: "Malik, al-Muwatta'", darimi: "ad-Darimi" };
export const hadithLabel = (ref: string) => { const [col, n] = ref.split(":"); return `${HADITH_NAMES[col] ?? col} ${n ?? ""}`.trim(); };

export function CourseScreen({ id }: { id: string }) {
  const t = useTheme();
  const c = useCT();
  const { lang } = useLang();
  const p = useCP();
  const course = courseById(id);
  const names = useAllahNames(lang);
  const { open, allowed, upsell } = useOpen(course ?? COURSES[0]);
  if (!course) return <Page><PageHero back topInset title={c("notFound")} /></Page>;
  const ids = course.lessons.map((l) => l.id);
  const d = doneCount(p, course.id, ids);
  const next = course.lessons.findIndex((l) => !isPassed(p, course.id, l.id));
  const title = (l: CLesson, i: number) => (course.id === "names" ? (names?.[i] ? `${names[i].latin}` : `${c("lesson")} ${i + 1}`) : tx(l.title, lang));
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <Page>
        <PageHero back topInset eyebrow={c("coursesKicker")} title={tx(course.title, lang)} lead={tx(course.lead, lang)} arabic={course.word} />
        <View style={{ padding: 16, gap: 12 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 14 }}>
            <GoldRing value={d / Math.max(1, ids.length)} size={70} stroke={5} dark={false}>
              <Text style={{ fontFamily: FONT.display, fontSize: 16, color: t.ink }}>{d}</Text>
            </GoldRing>
            <View style={{ flex: 1 }}>
              <Text style={{ fontFamily: FONT.bold, fontSize: 16, color: t.ink }}>{c("progress", { d, n: ids.length })}</Text>
              {p.complete[course.id] ? <Text style={{ fontFamily: FONT.semibold, fontSize: 13, color: t.accent, marginTop: 2 }}>{c("sticker")}</Text> : null}
            </View>
            {p.complete[course.id] ? <StickerArt def={courseSticker(course.id)} size={64} /> : null}
          </View>
          {course.note ? <Callout><Text style={{ fontFamily: FONT.regular, fontSize: 14, lineHeight: 21, color: t.ink }}>{tx(course.note, lang)}</Text></Callout> : null}
          {next >= 0 ? <GoldButton title={`${d ? c("continue") : c("start")}: ${title(course.lessons[next], next)}`} onPress={() => open(next) ? router.push(`/courses/${course.id}/${course.lessons[next].id}` as Href) : upsell()} /> : null}
          <View style={{ gap: 8, marginTop: 6 }}>
            {course.lessons.map((l, i) => {
              const passed = isPassed(p, course.id, l.id);
              const locked = !open(i);
              return (
                <Pressable key={l.id} onPress={() => (locked ? upsell() : router.push(`/courses/${course.id}/${l.id}` as Href))} accessibilityRole="button"
                  accessibilityLabel={`${c("lesson")} ${i + 1}: ${title(l, i)}${passed ? `, ${c("done")}` : ""}${locked ? ", Pro" : ""}`}
                  style={({ pressed }) => ({ flexDirection: "row", alignItems: "center", gap: 12, padding: 12, borderRadius: R.md, borderWidth: 1, borderColor: i === next ? "rgba(150,116,52,0.55)" : "rgba(150,116,52,0.22)", backgroundColor: t.surface, opacity: pressed ? 0.85 : 1 })}>
                  <StarBadge size={32} tone={passed ? "emerald" : i === next ? "gold" : "light"}>{i + 1}</StarBadge>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontFamily: FONT.semibold, fontSize: 15, color: t.ink }} numberOfLines={2}>{title(l, i)}</Text>
                    {course.id === "names" && names?.[i] ? <Text style={{ fontFamily: FONT.regular, fontSize: 12.5, color: t.muted }} numberOfLines={1}>{names[i].meaning}</Text> : null}
                  </View>
                  {course.id === "names" && names?.[i] ? <Text style={{ fontFamily: ARABIC_FONT, fontSize: 20, color: t.gold }}>{names[i].ar}</Text> : null}
                  {locked ? <Icon name="lock" size={15} color={t.gold} /> : passed ? <Icon name="check" size={16} color={t.accent} /> : i < course.free && !allowed ? <Text style={{ fontFamily: FONT.semibold, fontSize: 11, color: t.accent }}>{c("free")}</Text> : null}
                </Pressable>
              );
            })}
          </View>
        </View>
      </Page>
    </>
  );
}

const shuffle = <T,>(a: T[]) => { const b = [...a]; for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b; };
export type RunQ = { q: string; options: string[]; answer: number; explain?: string; verse?: string };

export function LessonScreen({ courseId, lessonId }: { courseId: string; lessonId: string }) {
  const t = useTheme();
  const c = useCT();
  const { lang } = useLang();
  const rtl = isRTL(lang);
  const { pro } = usePro();
  const gm = useGamify();
  const course = courseById(courseId);
  const names = useAllahNames(lang);
  const { open, upsell } = useOpen(course ?? COURSES[0]);
  const [phase, setPhase] = useState<"read" | "quiz" | "result">("read");
  const [res, setRes] = useState<{ score: number; burst: number; complete: boolean; xp: number } | null>(null);
  useEffect(() => { setPhase("read"); setRes(null); }, [courseId, lessonId]);
  const idx = course?.lessons.findIndex((l) => l.id === lessonId) ?? -1;
  const lesson = course && idx >= 0 ? course.lessons[idx] : undefined;
  const isNames = courseId === "names";
  const name = isNames && names ? names[idx] : undefined;

  // the questions of this lesson in the user's content language (names: built from the list)
  const qs: RunQ[] = useMemo(() => {
    if (!lesson) return [];
    if (isNames) {
      if (!names?.length || !name) return [];
      const others = shuffle(names.filter((n) => n.meaning !== name.meaning)).slice(0, 3).map((n) => n.meaning);
      const opts = shuffle([name.meaning, ...others]);
      const latins = shuffle([name.latin, ...shuffle(names.filter((n) => n.latin !== name.latin)).slice(0, 3).map((n) => n.latin)]);
      return [
        { q: c("nameQ"), options: opts, answer: opts.indexOf(name.meaning) },
        { q: name.meaning, options: latins, answer: latins.indexOf(name.latin) },
      ];
    }
    return lesson.quiz.map((q: CQuestion) => ({ q: tx(q.q, lang), options: q.options.map((o) => tx(o, lang)), answer: q.answer, explain: q.explain ? tx(q.explain, lang) : undefined }));
  }, [lesson, isNames, names, name, lang]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!course || !lesson) return <Page><PageHero back topInset title={c("notFound")} /></Page>;
  const locked = !open(idx);
  const ids = course.lessons.map((l) => l.id);
  const nextL = course.lessons[idx + 1];
  const title = isNames ? (name?.latin ?? `${c("lesson")} ${idx + 1}`) : tx(lesson.title, lang);
  const verses = isNames ? (names ? nameRefs(names, idx) : []) : lesson.verses ?? [];

  const finish = (right: number) => {
    const score = qs.length ? right / qs.length : 1;
    const r = saveCourseLesson(course.id, lesson.id, score, ids);
    let xp = 0;
    if (r.first) { award("lesson"); xp += LESSON_XP; }
    if (r.complete) { xp += COURSE_XP; success(); }
    if (xp) bonusXp(xp);
    takeBurst();
    tickGarden(gm.xp + xp, false, pro, gm.names);
    setRes({ score, burst: takeBurst(), complete: r.complete, xp });
    setPhase("result");
  };
  const para = { writingDirection: rtl ? "rtl" : "ltr" } as const;

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <Page>
        <PageHero back topInset eyebrow={`${tx(course.title, lang)} · ${c("lesson")} ${idx + 1}/${ids.length}`} title={title} arabic={isNames ? name?.ar : undefined} />
        <View style={{ padding: 16, gap: 16 }}>
          {locked ? (
            <View style={{ gap: 12 }}>
              <Text style={{ fontFamily: FONT.regular, fontSize: 15.5, lineHeight: 24, color: t.ink, ...para }}>{c("lockedLead")}</Text>
              <GoldButton title={c("unlock")} icon="lock" onPress={upsell} />
            </View>
          ) : phase === "read" ? (
            <StepIn style={{ gap: 16 }}>
              {course.note && idx === 0 ? <Callout><Text style={{ fontFamily: FONT.regular, fontSize: 14, lineHeight: 21, color: t.ink, ...para }}>{tx(course.note, lang)}</Text></Callout> : null}
              <TagChips tags={lesson.tags} />
              {isNames ? (
                name ? (
                  <View style={{ alignItems: "center", gap: 8, paddingVertical: 8 }}>
                    <Text style={{ fontFamily: ARABIC_FONT, fontSize: 44, lineHeight: 80, color: t.gold }}>{name.ar}</Text>
                    <Text style={{ fontFamily: FONT.bold, fontSize: 20, color: t.ink }}>{name.latin}</Text>
                    <Eyebrow>{c("nameMeaning")}</Eyebrow>
                    <Text style={{ fontFamily: FONT.regular, fontSize: 17, lineHeight: 26, color: t.ink, textAlign: "center" }}>{name.meaning}</Text>
                    {!verses.length ? <Text style={{ fontFamily: FONT.regular, fontSize: 14, lineHeight: 21, color: t.muted, textAlign: "center", marginTop: 6 }}>{c("nameSunnah")}</Text> : null}
                  </View>
                ) : <Text style={{ fontFamily: FONT.regular, color: t.muted }}>{c("namesLoading")}</Text>
              ) : <Markdown text={tx(lesson.body, lang)} />}
              {verses.length ? (
                <View style={{ gap: 10 }}>
                  <Eyebrow>{isNames ? c("nameInQuran") : c("verses")}</Eyebrow>
                  {verses.map((k) => (
                    <Pressable key={k} onPress={() => openVerse(k)} accessibilityRole="button" accessibilityLabel={`${c("openReader")}: ${k}`}
                      style={{ padding: 14, borderRadius: R.card, borderWidth: 1, borderColor: "rgba(150,116,52,0.25)", backgroundColor: t.surface }}>
                      <QuranQuote verseKey={k} size={21} />
                    </Pressable>
                  ))}
                </View>
              ) : null}
              {lesson.hadith?.length ? (
                <View style={{ gap: 8 }}>
                  <Eyebrow>{c("hadith")}</Eyebrow>
                  <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6 }}>
                    {lesson.hadith.map((h) => (
                      <View key={h} style={{ paddingHorizontal: 10, paddingVertical: 6, borderRadius: R.pill, borderWidth: 1, borderColor: t.line, backgroundColor: t.surface }}>
                        <Text style={{ fontFamily: FONT.semibold, fontSize: 12.5, color: t.ink }}>{hadithLabel(h)}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              ) : null}
              <TutorLessonAsk context={{ kind: "lesson", id: courseId, lesson: lessonId, title }} />
              {qs.length ? <GoldButton title={c("startQuiz")} onPress={() => setPhase("quiz")} /> : null}
            </StepIn>
          ) : phase === "quiz" ? (
            <Quiz qs={qs} onDone={finish} ctx={{ kind: "quiz", id: courseId, lesson: lessonId, title }} />
          ) : res ? (
            <Result score={res.score} xp={res.xp} burst={res.burst} complete={res.complete} stickerId={course.id}
              onRetry={() => setPhase("quiz")}
              onNext={nextL ? () => (open(idx + 1) ? router.replace(`/courses/${course.id}/${nextL.id}` as Href) : upsell()) : undefined}
              onOverview={() => router.replace(`/courses/${course.id}` as Href)} />
          ) : null}
        </View>
      </Page>
    </>
  );
}

/** multiple-choice quiz; every first answer counts for the feed quests */
/** tutor entry under the lesson text (Dalil / Hidaya, features/tutor) */
function TutorLessonAsk({ context }: { context: TutorContext }) {
  const { ui } = useTutor();
  return <AskTutor context={context} label={ui.lessonAsk} />;
}
/** "Why is this wrong?" after a wrong answer: the tutor explains it from the lesson (quiz context) */
function TutorWhy({ ctx, q, pick }: { ctx: TutorContext; q: RunQ; pick: number }) {
  const { ui } = useTutor();
  return <AskTutor context={{ ...ctx, question: q.q, chosen: q.options[pick], correct: q.options[q.answer], explain: q.explain }} question={ui.why} label={ui.why} />;
}

export function Quiz({ qs, onDone, header, ctx }: { qs: RunQ[]; onDone: (right: number) => void; header?: ReactNode; ctx?: TutorContext }) {
  const t = useTheme();
  const c = useCT();
  const nudge = useNudge();
  const [i, setI] = useState(0);
  const [pick, setPick] = useState<number | null>(null);
  const [right, setRight] = useState(0);
  const q = qs[i];
  if (!q) return null;
  const choose = (k: number) => {
    if (pick !== null) return;
    setPick(k);
    const ok = k === q.answer;
    if (ok) { tick(); setRight((r) => r + 1); } else nudge.run();
    gEvent({ t: "quiz", right: ok });
  };
  const next = () => {
    const r = right;
    if (i + 1 >= qs.length) { onDone(r); return; }
    setI(i + 1); setPick(null);
  };
  return (
    <StepIn key={i} style={{ gap: 12 }}>
      {header}
      <Text style={{ fontFamily: FONT.semibold, fontSize: 12, letterSpacing: 1.2, textTransform: "uppercase", color: t.gold }}>{c("question", { n: i + 1, m: qs.length })}</Text>
      <GoldProgress value={i / qs.length} />
      {q.verse ? <View style={{ padding: 14, borderRadius: R.card, borderWidth: 1, borderColor: "rgba(150,116,52,0.25)", backgroundColor: t.surface }}><QuranQuote verseKey={q.verse} size={22} /></View> : null}
      <Text accessibilityRole="header" style={{ fontFamily: FONT.bold, fontSize: 18, lineHeight: 26, color: t.ink }}>{q.q}</Text>
      <View style={{ gap: 8 }}>
        {q.options.map((o, k) => {
          const isRight = pick !== null && k === q.answer, isWrong = pick === k && k !== q.answer;
          return (
            <Pressable key={k} onPress={() => choose(k)} accessibilityRole="button" accessibilityState={{ selected: pick === k, disabled: pick !== null }} accessibilityLabel={o}
              style={{ padding: 14, borderRadius: R.md, borderWidth: 1.5, borderColor: isRight ? t.accent : isWrong ? "rgb(160,58,52)" : t.line, backgroundColor: isRight ? t.accentSoft : t.surface }}>
              <Text style={{ fontFamily: FONT.semibold, fontSize: 15.5, lineHeight: 22, color: t.ink }}>{o}</Text>
            </Pressable>
          );
        })}
      </View>
      {pick !== null ? (
        <View style={{ gap: 10 }}>
          <Text accessibilityLiveRegion="polite" style={{ fontFamily: FONT.bold, fontSize: 15, color: pick === q.answer ? t.accent : "rgb(160,58,52)" }}>{pick === q.answer ? c("right") : `${c("wrong")}: ${q.options[q.answer]}`}</Text>
          {q.explain ? <Text style={{ fontFamily: FONT.regular, fontSize: 14.5, lineHeight: 22, color: t.muted }}>{q.explain}</Text> : null}
          {ctx && pick !== q.answer ? <TutorWhy ctx={ctx} q={q} pick={pick} /> : null}
          <GoldButton title={c("next")} onPress={next} />
        </View>
      ) : null}
    </StepIn>
  );
}

function Result({ score, xp, burst, complete, stickerId, onRetry, onNext, onOverview }: {
  score: number; xp: number; burst: number; complete: boolean; stickerId: string; onRetry: () => void; onNext?: () => void; onOverview: () => void;
}) {
  const t = useTheme();
  const c = useCT();
  const passed = score >= PASS;
  return (
    <StepIn style={{ alignItems: "center", gap: 12, paddingVertical: 10 }}>
      <GoldRing value={score} size={120} stroke={7} dark={false}>
        <Text style={{ fontFamily: FONT.display, fontSize: 26, color: t.ink }}>{Math.round(score * 100)}%</Text>
      </GoldRing>
      <Text accessibilityRole="header" style={{ fontFamily: FONT.display, fontSize: 24, color: t.ink }}>{passed ? c("passed") : c("almost")}</Text>
      {!passed ? <Text style={{ fontFamily: FONT.regular, fontSize: 14, color: t.muted, textAlign: "center" }}>{c("needPass", { p: Math.round(PASS * 100) })}</Text> : null}
      {xp ? <Text style={{ fontFamily: FONT.bold, fontSize: 15, color: t.gold }}>{c("xp", { n: xp })}</Text> : null}
      {burst ? <Text style={{ fontFamily: FONT.semibold, fontSize: 14, color: t.accent }}>{c("growth", { n: burst })}</Text> : null}
      {complete ? (
        <View style={{ alignItems: "center", gap: 6, marginTop: 6 }}>
          <StickerArt def={courseSticker(stickerId)} size={110} />
          <Text style={{ fontFamily: FONT.bold, fontSize: 16, color: t.ink }}>{c("sticker")}</Text>
          <Text style={{ fontFamily: FONT.regular, fontSize: 14, color: t.muted }}>{c("stickerLead")}</Text>
        </View>
      ) : null}
      <View style={{ alignSelf: "stretch", gap: 10, marginTop: 8 }}>
        {passed && onNext ? <GoldButton title={c("nextLesson")} onPress={onNext} /> : null}
        {!passed ? <GoldButton title={c("retry")} onPress={onRetry} /> : null}
        <OutlineButton title={c("overview")} onPress={onOverview} />
      </View>
      <SmallStar size={12} color={t.gold} />
    </StepIn>
  );
}
