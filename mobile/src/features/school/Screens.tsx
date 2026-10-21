import { useEffect, useMemo, useState } from "react";
import { Pressable, Text, View } from "react-native";
import { Stack, router, type Href } from "expo-router";
import { Chip, GoldButton, GoldCard, GoldProgress, SectionTitle, SmallStar } from "@/components/brand";
import { Icon } from "@/components/icons";
import { Page, PageHero } from "@/components/page";
import { intlLocale, useLang } from "@/i18n";
import { useStoreVersion } from "@/lib/store";
import { ARABIC_FONT, FONT, R, stage as ST, useTheme } from "@/lib/theme";
import { useMyCertificates } from "@/features/exam/Certificates";
import {
  DEPARTMENTS, FACULTIES, GRADE_TR, SUBJECT_PLACE, WORDS, appRank, type WordId,
  CURRICULUM, GRADE_AR, STAGES, SUBJECTS, coursesOf, currentStage, dailyMinutes, gradeKey, hrefOf, liveSnapshot, ownRank, readSchool, recordSnapshot,
  setMinutes, stageState, stateOf, subjectGrades, termBounds, termExams, termOf, timetable, titleOf, type SchoolCourse, type Snapshot, type StageId, type SubjectId, type TermId,
} from "./model";
import { useSchoolT } from "./texts";

// The Madrasa screens: home (/school), a stage (/school/<stage>), the report card (/school/report) and the weekly
// timetable (/school/timetable). Emerald and gold like the rest of the app; the Quran is the main subject throughout.

const go = (href: string) => router.push(href as Href);
const pct = (x: number) => Math.round(x * 100);

function useSchoolData() {
  const v = useStoreVersion();
  return useMemo(() => {
    const stage = currentStage();
    const live = liveSnapshot();
    return { stage, live, grades: subjectGrades(stage), stages: STAGES.map((s) => stageState(s.id)), store: readSchool() };
  }, [v]); // eslint-disable-line react-hooks/exhaustive-deps
}

function useTermLabel() {
  const st = useSchoolT();
  return (id: TermId) => { const [y, h] = id.split("-"); return st("term", { n: h, year: y }); };
}

/** the stage's name in the language and in Arabic */
function StageName({ id, onStage }: { id: StageId; onStage?: boolean }) {
  const t = useTheme();
  const st = useSchoolT();
  const s = STAGES.find((x) => x.id === id)!;
  return (
    <View style={{ gap: 2 }}>
      <Text style={{ fontFamily: ARABIC_FONT, fontSize: 20, lineHeight: 34, color: onStage ? ST.gold : t.gold, textAlign: "left" }}>{s.ar}</Text>
      <Text style={{ fontFamily: FONT.display, fontSize: 21, lineHeight: 26, color: onStage ? "#fff" : t.ink }}>{s.tr}</Text>
      <Text style={{ fontFamily: FONT.regular, fontSize: 13, color: onStage ? ST.textSoft : t.muted }}>{st(`stage_${id}`)}</Text>
    </View>
  );
}

/** a word of the school: Arabic, transliteration and translation (Kashf ad-darajāt · Report card) */
export function Term({ id, onStage, size = 18 }: { id: WordId; onStage?: boolean; size?: number }) {
  const t = useTheme();
  const st = useSchoolT();
  const w = WORDS[id];
  return (
    <View style={{ flexDirection: "row", alignItems: "baseline", flexWrap: "wrap", columnGap: 8 }}>
      <Text style={{ fontFamily: ARABIC_FONT, fontSize: size, lineHeight: size * 1.7, color: onStage ? ST.gold : t.gold }}>{w.ar}</Text>
      <Text style={{ fontFamily: FONT.semibold, fontSize: size * 0.72, color: onStage ? "#fff" : t.ink }}>{`${w.tr} · ${st(`w_${id}`)}`}</Text>
    </View>
  );
}

/** subjects grouped by faculty (kulliyya) and department (qism); the Faculty of the Quran comes first */
function Faculties({ grades }: { grades: { subject: SubjectId; grade: number | null; done: number }[] }) {
  const t = useTheme();
  const st = useSchoolT();
  return (
    <View style={{ gap: 14 }}>
      {FACULTIES.map((f) => {
        const subs = grades.filter((g) => SUBJECT_PLACE[g.subject].faculty === f.id);
        return (
          <View key={f.id} style={{ borderRadius: R.card, borderWidth: f.id === "quran" ? 1.5 : 1, borderColor: f.id === "quran" ? t.gold : t.line, overflow: "hidden" }}>
            <View style={{ padding: 14, gap: 2, backgroundColor: f.id === "quran" ? ST.bg : t.surface }}>
              <Text style={{ fontFamily: ARABIC_FONT, fontSize: 18, lineHeight: 30, color: f.id === "quran" ? ST.gold : t.gold, textAlign: "left" }}>{f.ar}</Text>
              <Text style={{ fontFamily: FONT.semibold, fontSize: 14, color: f.id === "quran" ? "#fff" : t.ink }}>{f.tr}</Text>
              <Text style={{ fontFamily: FONT.regular, fontSize: 12.5, color: f.id === "quran" ? ST.textSoft : t.muted }}>{st(`fac_${f.id}`)}</Text>
            </View>
            {subs.map((g) => {
              const d = DEPARTMENTS.find((x) => x.id === SUBJECT_PLACE[g.subject].dept);
              return (
                <View key={g.subject} style={{ borderTopWidth: 1, borderTopColor: t.line }}>
                  {d ? <Text style={{ paddingHorizontal: 14, paddingTop: 10, fontFamily: FONT.semibold, fontSize: 11.5, color: t.gold }}>{`${d.ar} · ${d.tr} · ${st(`dept_${d.id}`)}`}</Text> : null}
                  <SubjectRow id={g.subject} grade={g.grade} done={g.done} first />
                </View>
              );
            })}
          </View>
        );
      })}
    </View>
  );
}

/** the learner's honest app rank: Ṭālib, Ṭālib mutaqaddim, Ḥāfiẓ of a reviewed juz; never real honorifics */
function AppRankCard() {
  const t = useTheme();
  const st = useSchoolT();
  const { list } = useMyCertificates();
  const juz = (list ?? []).filter((c) => c.status === "valid" && c.course.startsWith("juz:")).map((c) => Number(c.course.slice(4)));
  const r = appRank(juz);
  return (
    <View style={{ borderRadius: R.card, borderWidth: 1, borderColor: t.line, backgroundColor: t.surface, padding: 16, gap: 8 }}>
      <Text style={{ fontFamily: FONT.semibold, fontSize: 11, letterSpacing: 1.6, textTransform: "uppercase", color: t.gold }}>{st("appRankLabel")}</Text>
      <Text style={{ fontFamily: ARABIC_FONT, fontSize: 24, lineHeight: 40, color: t.gold, textAlign: "left" }}>{r.ar}</Text>
      <Text style={{ fontFamily: FONT.display, fontSize: 20, color: t.ink }}>{`${r.tr} · ${st(`rank_${r.key}`)}`}</Text>
      {r.hafizJuz.length ? (
        <View style={{ gap: 2 }}>
          <Text style={{ fontFamily: ARABIC_FONT, fontSize: 18, lineHeight: 30, color: t.accent, textAlign: "left" }}>{`حافظ الجزء ${r.hafizJuz.join("، ")}`}</Text>
          <Text style={{ fontFamily: FONT.semibold, fontSize: 14, color: t.accent }}>{st("rank_hafizJuz", { list: r.hafizJuz.join(", ") })}</Text>
          <Text style={{ fontFamily: FONT.regular, fontSize: 12, color: t.muted }}>{st("hafizNote")}</Text>
        </View>
      ) : null}
      <Text style={{ fontFamily: FONT.regular, fontSize: 12.5, lineHeight: 18, color: t.muted }}>{st("appRankNote")}</Text>
    </View>
  );
}

function GradeBadge({ grade }: { grade: number | null }) {
  const t = useTheme();
  const st = useSchoolT();
  if (grade === null) return <Text style={{ fontFamily: FONT.regular, fontSize: 12.5, color: t.muted }}>{st("notGraded")}</Text>;
  const k = gradeKey(grade);
  return (
    <View style={{ alignItems: "flex-end" }}>
      <Text style={{ fontFamily: ARABIC_FONT, fontSize: 16, lineHeight: 26, color: t.gold }}>{GRADE_AR[k]}</Text>
      <Text style={{ fontFamily: FONT.semibold, fontSize: 12, color: t.ink }}>{`${GRADE_TR[k] ? `${GRADE_TR[k]} · ` : ""}${st(`grade_${k}`)} · ${pct(grade)} %`}</Text>
    </View>
  );
}

function SubjectRow({ id, grade, done, first }: { id: SubjectId; grade: number | null; done: number; first?: boolean }) {
  const t = useTheme();
  const st = useSchoolT();
  const s = SUBJECTS.find((x) => x.id === id)!;
  const main = id === "quran";
  return (
    <View style={{ padding: 14, gap: 8, borderTopWidth: first ? 0 : 1, borderTopColor: t.line, backgroundColor: main ? t.accentSoft : t.surface }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
        <View style={{ flex: 1, gap: 2 }}>
          {main ? <Text style={{ fontFamily: FONT.semibold, fontSize: 10.5, letterSpacing: 1.6, textTransform: "uppercase", color: t.gold }}>{st("mainSubject")}</Text> : null}
          <Text style={{ fontFamily: FONT.semibold, fontSize: 15, color: t.ink }}>{st(`subj_${id}`)}</Text>
          <Text style={{ fontFamily: ARABIC_FONT, fontSize: 15, lineHeight: 24, color: t.muted, textAlign: "left" }}>{s.ar}</Text>
        </View>
        <GradeBadge grade={grade} />
      </View>
      <GoldProgress value={done} />
    </View>
  );
}

// ---------- entry card on the Masterclass tab ----------
export function SchoolEntryCard() {
  const st = useSchoolT();
  const { stage, stages } = useSchoolData();
  const s = stages.find((x) => x.id === stage)!;
  return (
    <Pressable onPress={() => go("/school")} accessibilityRole="button" accessibilityLabel={st("title")}
      style={{ borderRadius: R.card, overflow: "hidden", backgroundColor: ST.bg, borderWidth: 1, borderColor: "rgba(201,166,94,0.45)", padding: 20, gap: 10 }}>
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}><SmallStar size={12} color={ST.gold} /><Text style={{ fontFamily: FONT.semibold, fontSize: 11.5, letterSpacing: 2, textTransform: "uppercase", color: ST.gold }}>{st("kicker")}</Text></View>
        <Text style={{ fontFamily: ARABIC_FONT, fontSize: 22, lineHeight: 36, color: ST.gold }}>{"المدرسة"}</Text>
      </View>
      <Text style={{ fontFamily: FONT.display, fontSize: 28, lineHeight: 32, color: "#fff" }}>{st("title")}</Text>
      <Text style={{ fontFamily: FONT.regular, fontSize: 14.5, lineHeight: 21, color: ST.textSoft }}>{st("entryLead")}</Text>
      <View style={{ gap: 6, marginTop: 4 }}>
        <Text style={{ fontFamily: FONT.semibold, fontSize: 13, color: ST.cream }}>{`${st("yourStage")}: ${st(`stage_${stage}`)} · ${st("stageProgress", { p: pct(s.done) })}`}</Text>
        <GoldProgress value={s.done} track="rgba(255,255,255,0.12)" />
      </View>
      <View style={{ marginTop: 6, alignSelf: "flex-start", flexDirection: "row", alignItems: "center", gap: 8, height: 40, paddingHorizontal: 16, borderRadius: R.pill, backgroundColor: ST.gold }}>
        <Icon name="cap" size={16} color={ST.bg} />
        <Text style={{ fontFamily: FONT.bold, fontSize: 14, color: ST.bg }}>{st("enter")}</Text>
      </View>
    </Pressable>
  );
}

// ---------- /school ----------
export function SchoolHome() {
  const t = useTheme();
  const st = useSchoolT();
  const { lang } = useLang();
  const termLabel = useTermLabel();
  const { stage, live, grades, stages, store } = useSchoolData();
  useEffect(() => { recordSnapshot(live); }, [live]);
  const term = termOf();
  const { end } = termBounds(term);
  const daysLeft = Math.max(0, Math.ceil((end - Date.now()) / 86400000));
  const base = store.baseline[term];
  const gain = base !== undefined ? Math.round((live.done - base) * 1000) / 10 : 0;
  const rank = ownRank(live, store.terms, term);
  const today = (new Date().getDay() + 6) % 7;
  const plan = useMemo(() => timetable(), [live]); // eslint-disable-line react-hooks/exhaustive-deps
  const cur = stages.find((s) => s.id === stage)!;
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <Page>
        <PageHero topInset back arabic="المدرسة" eyebrow={st("kicker")} title={st("title")} lead={st("lead")}>
          <View style={{ borderRadius: R.lg, borderWidth: 1, borderColor: "rgba(233,207,153,0.25)", backgroundColor: "rgba(255,255,255,0.04)", padding: 14, gap: 8 }}>
            <Text style={{ fontFamily: FONT.semibold, fontSize: 11.5, letterSpacing: 1.8, textTransform: "uppercase", color: ST.gold }}>{st("yourStage")}</Text>
            <StageName id={stage} onStage />
            <GoldProgress value={cur.done} track="rgba(255,255,255,0.12)" />
            <Text style={{ fontFamily: FONT.regular, fontSize: 13, color: ST.textSoft }}>{`${st("stageProgress", { p: pct(cur.done) })} · ${termLabel(term)} · ${st("termLeft", { d: daysLeft })}`}</Text>
          </View>
          <GoldButton title={st("open")} icon="cap" onPress={() => go(`/school/${stage}`)} />
        </PageHero>

        <View style={{ paddingHorizontal: 16, marginTop: 24, gap: 28 }}>
          <View>
            <SectionTitle title={st("faculties")} action={st("w_kashf")} onAction={() => go("/school/report")} />
            <Faculties grades={grades} />
          </View>

          <View>
            <SectionTitle title={st("timetable")} action={st("open")} onAction={() => go("/school/timetable")} />
            <GoldCard>
              <Text style={{ fontFamily: FONT.semibold, fontSize: 12, letterSpacing: 1.6, textTransform: "uppercase", color: t.gold }}>{st("today")}</Text>
              <View style={{ gap: 8, marginTop: 10 }}>
                {plan[today].map((s, i) => <SlotRow key={`${s.course.id}-${i}`} slot={s} lang={lang} />)}
                {!plan[today].length ? <Text style={{ fontFamily: FONT.regular, color: t.muted }}>{st("noCourses")}</Text> : null}
              </View>
            </GoldCard>
          </View>

          <View>
            <SectionTitle title={st("report")} action={st("open")} onAction={() => go("/school/report")} />
            <GoldCard>
              <Term id="kashf" />
              <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontFamily: FONT.semibold, fontSize: 15, color: t.ink }}>{st("overall")}</Text>
                  <Text style={{ fontFamily: FONT.regular, fontSize: 13, color: t.muted }}>{termLabel(term)}</Text>
                </View>
                <GradeBadge grade={live.overall} />
              </View>
              <Text style={{ fontFamily: FONT.regular, fontSize: 13.5, lineHeight: 20, color: t.muted, marginTop: 10 }}>{gain > 0 ? st("termGain", { p: gain }) : st("termNoGain")}</Text>
            </GoldCard>
          </View>

          <AppRankCard />
          <RankCard rank={rank} />

          <View>
            <SectionTitle title={st("stages")} />
            <View style={{ gap: 10 }}>
              {stages.map((s) => (
                <Pressable key={s.id} onPress={() => go(`/school/${s.id}`)} accessibilityRole="button"
                  style={({ pressed }) => ({ borderRadius: R.card, borderWidth: 1, borderColor: s.id === stage ? t.gold : t.line, backgroundColor: pressed ? t.bg : t.surface, padding: 16, gap: 8 })}>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                    <View style={{ flex: 1 }}><StageName id={s.id} /></View>
                    {s.complete ? <Icon name="checkCircle" color={t.accent} /> : <Icon name="chevronRight" size={16} color={t.muted} />}
                  </View>
                  <Text style={{ fontFamily: FONT.regular, fontSize: 13.5, lineHeight: 20, color: t.muted }}>{st(`lead_${s.id}`)}</Text>
                  <GoldProgress value={s.done} />
                  <Text style={{ fontFamily: FONT.semibold, fontSize: 12.5, color: s.complete ? t.accent : t.ink }}>{s.complete ? st("stageDone") : st("stageProgress", { p: pct(s.done) })}</Text>
                </Pressable>
              ))}
            </View>
          </View>

          <View style={{ borderRadius: R.card, borderWidth: 1, borderColor: t.line, overflow: "hidden", backgroundColor: t.surface }}>
            <LinkLine icon="list" title={`${WORDS.sijill.tr} · ${st("w_sijill")}`} sub={st("transcriptLead")} onPress={() => go("/school/transcript")} first />
            <LinkLine icon="trophy" title={st("certificates")} sub={st("certificatesLead")} onPress={() => go("/school/certificates")} />
            <LinkLine icon="checkCircle" title={st("allExams")} onPress={() => go("/tests")} />
            <LinkLine icon="cap" title={st("c_rp", { a: 1, b: 10 })} onPress={() => go("/reciter-path")} />
          </View>
          <Text style={{ fontFamily: FONT.regular, fontSize: 12.5, lineHeight: 18, color: t.muted }}>{st("note")}</Text>
        </View>
      </Page>
    </>
  );
}

function LinkLine({ icon, title, sub, onPress, first }: { icon: "trophy" | "checkCircle" | "cap" | "list"; title: string; sub?: string; onPress: () => void; first?: boolean }) {
  const t = useTheme();
  return (
    <Pressable onPress={onPress} accessibilityRole="button" style={({ pressed }) => ({ flexDirection: "row", alignItems: "center", gap: 12, padding: 14, borderTopWidth: first ? 0 : 1, borderTopColor: t.line, backgroundColor: pressed ? t.bg : t.surface })}>
      <Icon name={icon} size={18} color={t.gold} />
      <View style={{ flex: 1 }}>
        <Text style={{ fontFamily: FONT.semibold, fontSize: 15, color: t.ink }}>{title}</Text>
        {sub ? <Text style={{ fontFamily: FONT.regular, fontSize: 12.5, color: t.muted }}>{sub}</Text> : null}
      </View>
      <Icon name="chevronRight" size={15} color={t.muted} />
    </Pressable>
  );
}

function RankCard({ rank }: { rank: ReturnType<typeof ownRank> }) {
  const t = useTheme();
  const st = useSchoolT();
  const termLabel = useTermLabel();
  return (
    <View style={{ borderRadius: R.card, borderWidth: 1, borderColor: t.line, backgroundColor: t.surface, padding: 16, gap: 8 }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}><Icon name="user" color={t.gold} /><Text style={{ fontFamily: FONT.bold, fontSize: 16, color: t.ink }}>{st("rankTitle")}</Text></View>
      <Text style={{ fontFamily: FONT.regular, fontSize: 13, lineHeight: 19, color: t.muted }}>{st("rankLead")}</Text>
      {rank ? (
        <>
          <Text style={{ fontFamily: FONT.display, fontSize: 22, color: t.ink }}>{st("rankOf", { r: rank.rank, n: rank.of })}</Text>
          {rank.delta !== null ? <Text style={{ fontFamily: FONT.semibold, fontSize: 14, color: rank.delta >= 0 ? t.accent : t.ink }}>{st("vsLast", { d: `${rank.delta >= 0 ? "+" : "−"}${Math.abs(Math.round(rank.delta * 100))}` })}</Text> : null}
          <Text style={{ fontFamily: FONT.regular, fontSize: 13.5, color: t.muted }}>{st("best", { term: termLabel(rank.best) })}</Text>
        </>
      ) : <Text style={{ fontFamily: FONT.regular, fontSize: 14, lineHeight: 20, color: t.ink }}>{st("rankFirst")}</Text>}
    </View>
  );
}

function SlotRow({ slot, lang }: { slot: { course: SchoolCourse; minutes: number }; lang: string }) {
  const t = useTheme();
  const st = useSchoolT();
  const main = slot.course.subject === "quran";
  return (
    <Pressable onPress={() => go(hrefOf(slot.course))} accessibilityRole="button"
      style={({ pressed }) => ({ flexDirection: "row", alignItems: "center", gap: 10, padding: 10, borderRadius: R.lg, borderWidth: 1, borderColor: main ? t.gold : t.line, backgroundColor: pressed ? t.bg : main ? t.accentSoft : t.surface })}>
      <View style={{ width: 52, alignItems: "center" }}><Text style={{ fontFamily: FONT.bold, fontSize: 13, color: main ? t.accent : t.ink }}>{st("min", { n: slot.minutes })}</Text></View>
      <View style={{ flex: 1 }}>
        <Text style={{ fontFamily: FONT.semibold, fontSize: 14, color: t.ink }} numberOfLines={2}>{titleOf(slot.course, lang, st)}</Text>
        <Text style={{ fontFamily: FONT.regular, fontSize: 12, color: t.muted }}>{st(`subj_${slot.course.subject}`)}</Text>
      </View>
      <Icon name="chevronRight" size={14} color={t.muted} />
    </Pressable>
  );
}

// ---------- /school/<stage> ----------
export function StageScreen({ id }: { id: string }) {
  const t = useTheme();
  const st = useSchoolT();
  const { lang } = useLang();
  const v = useStoreVersion();
  const stage = (STAGES.find((s) => s.id === id)?.id ?? "ibtidai") as StageId;
  const s = useMemo(() => stageState(stage), [stage, v]); // eslint-disable-line react-hooks/exhaustive-deps
  const bySubject = useMemo(() => SUBJECTS.map((sub) => ({ sub, cs: coursesOf(stage).filter((c) => c.subject === sub.id).map((c) => ({ c, st: stateOf(c) })) })).filter((x) => x.cs.length), [stage, v]); // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <Page>
        <PageHero topInset back arabic={STAGES.find((x) => x.id === stage)!.ar} eyebrow={st("title")} title={st(`stage_${stage}`)} lead={st(`lead_${stage}`)}>
          <GoldProgress value={s.done} track="rgba(255,255,255,0.12)" />
          <Text style={{ fontFamily: FONT.semibold, fontSize: 13, color: s.complete ? ST.cream : ST.textSoft }}>{s.complete ? st("stageDone") : st("stageProgress", { p: pct(s.done) })}</Text>
        </PageHero>
        <View style={{ paddingHorizontal: 16, marginTop: 24, gap: 24 }}>
          {bySubject.map(({ sub, cs }) => (
            <View key={sub.id}>
              <View style={{ flexDirection: "row", alignItems: "baseline", justifyContent: "space-between", marginBottom: 10 }}>
                <Text style={{ fontFamily: FONT.display, fontSize: 20, color: t.ink }}>{st(`subj_${sub.id}`)}</Text>
                <Text style={{ fontFamily: ARABIC_FONT, fontSize: 16, color: t.gold }}>{sub.ar}</Text>
              </View>
              <View style={{ borderRadius: R.card, borderWidth: 1, borderColor: sub.id === "quran" ? t.gold : t.line, overflow: "hidden" }}>
                {cs.map(({ c, st: cst }, i) => (
                  <Pressable key={c.id} onPress={() => go(hrefOf(c))} accessibilityRole="button"
                    style={({ pressed }) => ({ padding: 14, gap: 8, borderTopWidth: i ? 1 : 0, borderTopColor: t.line, backgroundColor: pressed ? t.bg : t.surface })}>
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                      <View style={{ flex: 1, gap: 4 }}>
                        <Text style={{ fontFamily: FONT.semibold, fontSize: 15, color: t.ink }}>{titleOf(c, lang, st)}</Text>
                        <View style={{ flexDirection: "row", gap: 6 }}>
                          <View style={{ paddingHorizontal: 8, paddingVertical: 2, borderRadius: R.pill, backgroundColor: c.required ? t.accentSoft : t.bg, borderWidth: 1, borderColor: c.required ? t.accent : t.line }}>
                            <Text style={{ fontFamily: FONT.semibold, fontSize: 11, color: c.required ? t.accent : t.muted }}>{c.required ? st("required") : st("elective")}</Text>
                          </View>
                          <Text style={{ fontFamily: FONT.regular, fontSize: 12, color: t.muted }}>{st("progress", { p: pct(cst.done) })}</Text>
                        </View>
                      </View>
                      {cst.done >= 0.999 ? <Icon name="checkCircle" size={18} color={t.accent} /> : <GradeBadge grade={cst.graded ? cst.grade : null} />}
                    </View>
                    <GoldProgress value={cst.done} />
                  </Pressable>
                ))}
              </View>
            </View>
          ))}
          <Text style={{ fontFamily: FONT.regular, fontSize: 12.5, lineHeight: 18, color: t.muted }}>{st("note")}</Text>
        </View>
      </Page>
    </>
  );
}

// ---------- /school/report ----------
export function ReportScreen() {
  const t = useTheme();
  const st = useSchoolT();
  const termLabel = useTermLabel();
  const { live, store } = useSchoolData();
  useEffect(() => { recordSnapshot(live); }, [live]);
  const current = termOf();
  const terms = useMemo(() => [...new Set([current, ...Object.keys(store.terms)])].sort().reverse(), [store, current]);
  const [term, setTerm] = useState<TermId>(current);
  const snap: Snapshot | undefined = term === current ? live : store.terms[term];
  const ex = termExams(term);
  const rank = ownRank(live, store.terms, current);
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <Page>
        <PageHero topInset back arabic={WORDS.kashf.ar} eyebrow={st("title")} title={`${WORDS.kashf.tr} · ${st("w_kashf")}`} lead={st("reportLead")} />
        <View style={{ paddingHorizontal: 16, marginTop: 20, gap: 20 }}>
          {terms.length > 1 ? (
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
              {terms.map((id) => <Chip key={id} label={termLabel(id)} selected={id === term} onPress={() => setTerm(id)} />)}
            </View>
          ) : null}
          {snap ? (
            <View style={{ borderRadius: R.card, borderWidth: 1.5, borderColor: t.gold, backgroundColor: t.surface, overflow: "hidden" }}>
              <View style={{ padding: 18, gap: 4, backgroundColor: ST.bg }}>
                <Term id="fasl" onStage size={15} />
                <Text style={{ fontFamily: FONT.semibold, fontSize: 11.5, letterSpacing: 2, textTransform: "uppercase", color: ST.gold }}>{termLabel(term)}</Text>
                <StageName id={snap.stage} onStage />
                <Text style={{ fontFamily: FONT.regular, fontSize: 12.5, color: ST.textMuted }}>{term === current ? st("live") : st("saved")}</Text>
              </View>
              {SUBJECTS.map((s, i) => (
                <View key={s.id} style={{ flexDirection: "row", alignItems: "center", gap: 12, padding: 14, borderTopWidth: i ? 1 : 0, borderTopColor: t.line, backgroundColor: s.id === "quran" ? t.accentSoft : t.surface }}>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontFamily: FONT.semibold, fontSize: 14.5, color: t.ink }}>{st(`subj_${s.id}`)}</Text>
                    <Text style={{ fontFamily: ARABIC_FONT, fontSize: 14, lineHeight: 22, color: t.muted, textAlign: "left" }}>{s.ar}</Text>
                  </View>
                  <GradeBadge grade={snap.subjects[s.id] ?? null} />
                </View>
              ))}
              <View style={{ flexDirection: "row", alignItems: "center", gap: 12, padding: 16, borderTopWidth: 1.5, borderTopColor: t.gold }}>
                <Text style={{ flex: 1, fontFamily: FONT.bold, fontSize: 16, color: t.ink }}>{st("overall")}</Text>
                <GradeBadge grade={snap.overall} />
              </View>
            </View>
          ) : null}
          <Text style={{ fontFamily: FONT.regular, fontSize: 13.5, color: t.muted }}>{st("exams", ex)}</Text>
          <AppRankCard />
          <RankCard rank={rank} />
          <Text style={{ fontFamily: FONT.regular, fontSize: 12.5, lineHeight: 18, color: t.muted }}>{st("note")}</Text>
        </View>
      </Page>
    </>
  );
}

// ---------- /school/transcript (as-Sijill al-akādīmī) with the sanad ----------
export function TranscriptScreen() {
  const t = useTheme();
  const st = useSchoolT();
  const { lang } = useLang();
  const v = useStoreVersion();
  const rows = useMemo(() => STAGES.map((s) => ({ s, cs: coursesOf(s.id).map((c) => ({ c, st: stateOf(c) })) })), [v]); // eslint-disable-line react-hooks/exhaustive-deps
  const { list } = useMyCertificates();
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <Page>
        <PageHero topInset back arabic={WORDS.sijill.ar} eyebrow={st("title")} title={`${WORDS.sijill.tr} · ${st("w_sijill")}`} lead={st("transcriptLead")} />
        <View style={{ paddingHorizontal: 16, marginTop: 20, gap: 22 }}>
          {rows.map(({ s, cs }) => (
            <View key={s.id} style={{ borderRadius: R.card, borderWidth: 1, borderColor: t.line, overflow: "hidden", backgroundColor: t.surface }}>
              <View style={{ padding: 14, borderBottomWidth: 1, borderBottomColor: t.line }}>
                <StageName id={s.id} />
                <View style={{ marginTop: 6 }}><Term id="madda" size={14} /></View>
              </View>
              {cs.map(({ c, st: x }, i) => (
                <View key={c.id} style={{ flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 14, paddingVertical: 10, borderTopWidth: i ? 1 : 0, borderTopColor: t.line }}>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontFamily: FONT.semibold, fontSize: 14, color: t.ink }}>{titleOf(c, lang, st)}</Text>
                    <Text style={{ fontFamily: FONT.regular, fontSize: 12, color: t.muted }}>{`${st(`subj_${c.subject}`)} · ${c.required ? st("required") : st("elective")} · ${st("progress", { p: pct(x.done) })}`}</Text>
                  </View>
                  <GradeBadge grade={x.graded ? x.grade : null} />
                </View>
              ))}
            </View>
          ))}
          {list?.length ? (
            <View style={{ gap: 8 }}>
              <SectionTitle title={st("certificates")} />
              {list.map((c) => (
                <Pressable key={c.code} onPress={() => go("/school/certificates")} accessibilityRole="button" style={{ flexDirection: "row", gap: 10, alignItems: "center", padding: 12, borderRadius: R.lg, borderWidth: 1, borderColor: t.line, backgroundColor: t.surface }}>
                  <Icon name="trophy" size={16} color={t.gold} />
                  <Text style={{ flex: 1, fontFamily: FONT.semibold, fontSize: 14, color: t.ink }}>{`${c.title} · ${c.pct} %`}</Text>
                  <Text style={{ fontFamily: FONT.regular, fontSize: 12, color: t.muted }}>{c.code}</Text>
                </Pressable>
              ))}
            </View>
          ) : null}
          <SanadChain />
          <AppRankCard />
          <Text style={{ fontFamily: FONT.regular, fontSize: 12.5, lineHeight: 18, color: t.muted }}>{st("note")}</Text>
        </View>
      </Page>
    </>
  );
}

/** the chain of the recitation Ḥafṣ ʿan ʿĀṣim as a diagram; the learner's link only through a real ijazah */
export function SanadChain() {
  const t = useTheme();
  const st = useSchoolT();
  const steps = ["sanad1", "sanad2", "sanad3", "sanad4", "sanad5", "sanad6", "sanad7", "sanad8", "sanad9", "sanad10"] as const;
  return (
    <View style={{ borderRadius: R.card, borderWidth: 1, borderColor: t.gold, backgroundColor: t.surface, padding: 16, gap: 10 }}>
      <Term id="sanad" />
      <Text style={{ fontFamily: FONT.regular, fontSize: 13, lineHeight: 19, color: t.muted }}>{st("sanadLead")}</Text>
      <View style={{ marginTop: 4 }}>
        {steps.map((k, i) => {
          const last = i === steps.length - 1, open = i >= steps.length - 2;
          return (
            <View key={k} style={{ flexDirection: "row", gap: 12 }}>
              <View style={{ width: 18, alignItems: "center" }}>
                <View style={{ width: 12, height: 12, borderRadius: 6, marginTop: 4, borderWidth: 2, borderColor: open ? t.muted : t.gold, backgroundColor: open ? "transparent" : t.gold }} />
                {!last ? <View style={{ flex: 1, width: 2, minHeight: 18, backgroundColor: i >= steps.length - 3 ? "transparent" : t.gold, borderLeftWidth: i >= steps.length - 3 ? 2 : 0, borderStyle: "dashed", borderColor: t.muted }} /> : null}
              </View>
              <Text style={{ flex: 1, paddingBottom: last ? 0 : 12, fontFamily: open ? FONT.regular : FONT.semibold, fontSize: 14, lineHeight: 20, color: open ? t.muted : t.ink }}>{st(k)}</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

// ---------- /school/timetable ----------
const MINUTES = [10, 15, 20, 30, 45, 60];
export function TimetableScreen() {
  const t = useTheme();
  const st = useSchoolT();
  const { lang } = useLang();
  const v = useStoreVersion();
  const minutes = useMemo(() => dailyMinutes(), [v]); // eslint-disable-line react-hooks/exhaustive-deps
  const plan = useMemo(() => timetable(minutes), [minutes, v]); // eslint-disable-line react-hooks/exhaustive-deps
  const today = (new Date().getDay() + 6) % 7;
  const dayName = (d: number) => new Date(2024, 0, 1 + d).toLocaleDateString(intlLocale(lang), { weekday: "long" }); // 1 January 2024 was a Monday
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <Page>
        <PageHero topInset back arabic="الجدول" eyebrow={st("title")} title={st("timetable")} lead={st("timetableLead", { m: minutes })} />
        <View style={{ paddingHorizontal: 16, marginTop: 20, gap: 18 }}>
          <View style={{ gap: 8 }}>
            <Text style={{ fontFamily: FONT.semibold, fontSize: 13, color: t.muted }}>{st("minutesPerDay")}</Text>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
              {MINUTES.map((m) => <Chip key={m} label={st("min", { n: m })} selected={m === minutes} onPress={() => setMinutes(m)} />)}
            </View>
          </View>
          {plan.map((day, d) => (
            <View key={d} style={{ borderRadius: R.card, borderWidth: 1, borderColor: d === today ? t.gold : t.line, backgroundColor: t.surface, padding: 14, gap: 8 }}>
              <Text style={{ fontFamily: FONT.bold, fontSize: 15, color: d === today ? t.gold : t.ink }}>{`${dayName(d)}${d === today ? ` · ${st("today")}` : ""}`}</Text>
              {day.map((s, i) => <SlotRow key={`${s.course.id}-${i}`} slot={s} lang={lang} />)}
              {!day.length ? <Text style={{ fontFamily: FONT.regular, color: t.muted }}>{st("noCourses")}</Text> : null}
            </View>
          ))}
          <Text style={{ fontFamily: FONT.regular, fontSize: 12.5, lineHeight: 18, color: t.muted }}>{st("note")}</Text>
        </View>
      </Page>
    </>
  );
}

export { CURRICULUM };
