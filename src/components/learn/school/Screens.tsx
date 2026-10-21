"use client";
// The Madrasa on the website, mirrors mobile/src/features/school/Screens.tsx: home (/school), a stage (/school/<stage>),
// the report card (/school/report), the transcript with the sanad (/school/transcript) and the weekly timetable
// (/school/timetable). The model (src/lib/learn/school/model.ts) reads the progress of every course on this device.
import { useEffect, useMemo, useState } from "react";
import { Link } from "@/i18n/navigation";
import { intlLocale, useLang } from "@/lib/learn/i18n";
import { useStoreVersion } from "@/lib/learn/store";
import { useSchoolT } from "@/lib/learn/school/texts";
import {
  DEPARTMENTS, FACULTIES, GRADE_AR, GRADE_TR, STAGES, SUBJECTS, SUBJECT_PLACE, WORDS, appRank, coursesOf, currentStage, dailyMinutes, gradeKey, hrefOf,
  liveSnapshot, ownRank, readSchool, recordSnapshot, setMinutes, stageState, stateOf, subjectGrades, termBounds, termExams, termOf, timetable, titleOf,
  type SchoolCourse, type Snapshot, type StageId, type SubjectId, type TermId, type WordId,
} from "@/lib/learn/school/model";
import { MyCertificates, useMyCertificates } from "@/components/learn/exam";
import { Bar, Card, GoldLink, LearnHero, LearnMain, OutlineButton, SectionTitle } from "@/components/learn/ui";
import { StarGlyph } from "@/components/art/HomeOrnaments";

const pct = (x: number) => Math.round(x * 100);
/** the app's routes are the website's paths, except the Shams Method of one surah (the reader with ?shams=1) */
export const webHref = (href: string) => { const m = href.match(/^\/shams\/(\d+)$/); return m ? `/surah/${m[1]}?shams=1` : href; };
const courseHref = (c: SchoolCourse) => webHref(hrefOf(c));

/** stored progress is read in the browser only: during server rendering and hydration the screens show a placeholder */
function useSchoolData() {
  const v = useStoreVersion();
  return useMemo(() => {
    if (v < 0) return null;
    const stage = currentStage();
    const live = liveSnapshot();
    return { stage, live, grades: subjectGrades(stage), stages: STAGES.map((s) => stageState(s.id)), store: readSchool() };
  }, [v]);
}
const Placeholder = () => <div aria-hidden className="mt-2 grid gap-4">{[0, 1, 2].map((i) => <div key={i} className="h-28 animate-pulse rounded-xl bg-line/40" />)}</div>;

function useTermLabel() {
  const st = useSchoolT();
  return (id: TermId) => { const [y, h] = id.split("-"); return st("term", { n: h, year: y }); };
}

function StageName({ id, dark }: { id: StageId; dark?: boolean }) {
  const st = useSchoolT();
  const s = STAGES.find((x) => x.id === id)!;
  return (
    <span className="grid gap-0.5">
      <span lang="ar" dir="rtl" className={`font-arabic w-fit text-[20px] leading-[1.7] ${dark ? "text-[rgb(var(--gold))]" : "text-[rgb(var(--hm-gold-d))]"}`}>{s.ar}</span>
      <span className={`font-display text-[21px] leading-tight ${dark ? "text-white" : ""}`}>{s.tr}</span>
      <span className={`text-[13px] ${dark ? "text-white/65" : "text-muted"}`}>{st(`stage_${id}`)}</span>
    </span>
  );
}

/** a word of the school: Arabic, transliteration and translation */
export function SchoolWord({ id, dark, size = 18 }: { id: WordId; dark?: boolean; size?: number }) {
  const st = useSchoolT();
  const w = WORDS[id];
  return (
    <p className="flex flex-wrap items-baseline gap-x-2">
      <span lang="ar" className={`font-arabic ${dark ? "text-[rgb(var(--gold))]" : "text-[rgb(var(--hm-gold-d))]"}`} style={{ fontSize: size, lineHeight: 1.7 }}>{w.ar}</span>
      <span className={`font-semibold ${dark ? "text-white" : ""}`} style={{ fontSize: size * 0.72 }}>{`${w.tr} · ${st(`w_${id}`)}`}</span>
    </p>
  );
}

function GradeBadge({ grade }: { grade: number | null }) {
  const st = useSchoolT();
  if (grade === null) return <span className="shrink-0 text-[12.5px] text-muted">{st("notGraded")}</span>;
  const k = gradeKey(grade);
  return (
    <span className="grid shrink-0 justify-items-end text-end">
      <span lang="ar" className="font-arabic text-[16px] leading-[1.6] text-[rgb(var(--hm-gold-d))]">{GRADE_AR[k]}</span>
      <span className="text-[12px] font-semibold">{`${GRADE_TR[k] ? `${GRADE_TR[k]} · ` : ""}${st(`grade_${k}`)} · ${pct(grade)} %`}</span>
    </span>
  );
}

function SubjectRow({ id, grade, done }: { id: SubjectId; grade: number | null; done: number }) {
  const st = useSchoolT();
  const s = SUBJECTS.find((x) => x.id === id)!;
  const main = id === "quran";
  return (
    <div className={`grid gap-2 p-4 ${main ? "bg-accent-soft" : "bg-surface"}`}>
      <div className="flex items-center gap-3">
        <div className="min-w-0 flex-1">
          {main && <p className="text-[10.5px] font-semibold uppercase tracking-[0.14em] text-[rgb(var(--hm-gold-d))] rtl:tracking-normal">{st("mainSubject")}</p>}
          <p className="text-[15px] font-semibold">{st(`subj_${id}`)}</p>
          <p lang="ar" dir="rtl" className="font-arabic w-fit text-[15px] leading-[1.6] text-muted">{s.ar}</p>
        </div>
        <GradeBadge grade={grade} />
      </div>
      <Bar value={done} gold label={st(`subj_${id}`)} />
    </div>
  );
}

/** subjects grouped by faculty and department; the Faculty of the Quran first */
function Faculties({ grades }: { grades: { subject: SubjectId; grade: number | null; done: number }[] }) {
  const st = useSchoolT();
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {FACULTIES.map((f) => {
        const subs = grades.filter((g) => SUBJECT_PLACE[g.subject].faculty === f.id);
        const core = f.id === "quran";
        return (
          <section key={f.id} className={`overflow-hidden rounded-2xl border ${core ? "border-[1.5px] border-[rgb(var(--hm-gold))] md:col-span-2" : "border-line"}`}>
            <header className={`grid gap-0.5 p-4 ${core ? "stage girih text-white" : "bg-surface"}`}>
              <p lang="ar" dir="rtl" className={`font-arabic w-fit text-[18px] leading-[1.7] ${core ? "text-[rgb(var(--gold))]" : "text-[rgb(var(--hm-gold-d))]"}`}>{f.ar}</p>
              <p className="text-[14px] font-semibold">{f.tr}</p>
              <p className={`text-[12.5px] ${core ? "text-white/65" : "text-muted"}`}>{st(`fac_${f.id}`)}</p>
            </header>
            <div className="divide-y divide-line border-t border-line">
              {subs.map((g) => {
                const d = DEPARTMENTS.find((x) => x.id === SUBJECT_PLACE[g.subject].dept);
                return (
                  <div key={g.subject}>
                    {d && <p className="bg-surface px-4 pt-3 text-[11.5px] font-semibold text-[rgb(var(--hm-gold-d))]">{`${d.ar} · ${d.tr} · ${st(`dept_${d.id}`)}`}</p>}
                    <SubjectRow id={g.subject} grade={g.grade} done={g.done} />
                  </div>
                );
              })}
            </div>
          </section>
        );
      })}
    </div>
  );
}

/** the learner's honest app rank (Ṭālib, Ṭālib mutaqaddim, Ḥāfiẓ of a reviewed juz) */
function AppRankCard() {
  const st = useSchoolT();
  const { list } = useMyCertificates();
  const juz = (list ?? []).filter((c) => c.status === "valid" && c.course.startsWith("juz:")).map((c) => Number(c.course.slice(4)));
  const r = appRank(juz);
  return (
    <Card>
      <p className="hm-k text-[rgb(var(--hm-gold-d))]">{st("appRankLabel")}</p>
      <p lang="ar" dir="rtl" className="font-arabic mt-1 w-fit text-[24px] leading-[1.7] text-[rgb(var(--hm-gold-d))]">{r.ar}</p>
      <p className="font-display text-xl">{`${r.tr} · ${st(`rank_${r.key}`)}`}</p>
      {r.hafizJuz.length > 0 && (
        <div className="mt-2">
          <p lang="ar" dir="rtl" className="font-arabic w-fit text-[18px] leading-[1.7] text-accent">{`حافظ الجزء ${r.hafizJuz.join("، ")}`}</p>
          <p className="text-sm font-semibold text-accent">{st("rank_hafizJuz", { list: r.hafizJuz.join(", ") })}</p>
          <p className="text-xs text-muted">{st("hafizNote")}</p>
        </div>
      )}
      <p className="mt-2 text-[12.5px] leading-relaxed text-muted">{st("appRankNote")}</p>
    </Card>
  );
}

function RankCard({ rank }: { rank: ReturnType<typeof ownRank> }) {
  const st = useSchoolT();
  const termLabel = useTermLabel();
  return (
    <Card>
      <h3 className="flex items-center gap-2 text-base font-bold"><StarGlyph size={13} className="text-[rgb(var(--hm-gold))]" />{st("rankTitle")}</h3>
      <p className="mt-1.5 text-[13px] leading-relaxed text-muted">{st("rankLead")}</p>
      {rank ? (
        <div className="mt-3 grid gap-1">
          <p className="font-display text-[22px]">{st("rankOf", { r: rank.rank, n: rank.of })}</p>
          {rank.delta !== null && <p className={`text-sm font-semibold ${rank.delta >= 0 ? "text-accent" : ""}`}>{st("vsLast", { d: `${rank.delta >= 0 ? "+" : "−"}${Math.abs(Math.round(rank.delta * 100))}` })}</p>}
          <p className="text-[13.5px] text-muted">{st("best", { term: termLabel(rank.best) })}</p>
        </div>
      ) : <p className="mt-3 text-sm leading-relaxed">{st("rankFirst")}</p>}
    </Card>
  );
}

function SlotRow({ slot, lang }: { slot: { course: SchoolCourse; minutes: number }; lang: string }) {
  const st = useSchoolT();
  const main = slot.course.subject === "quran";
  return (
    <Link href={courseHref(slot.course)} className={`flex items-center gap-3 rounded-lg border p-2.5 transition hover:bg-[rgb(var(--hm-gold))]/[0.06] ${main ? "border-[rgb(var(--hm-gold))] bg-accent-soft" : "border-line bg-surface"}`}>
      <span className={`w-14 shrink-0 text-center text-[13px] font-bold tabular-nums ${main ? "text-accent" : ""}`}>{st("min", { n: slot.minutes })}</span>
      <span className="min-w-0 flex-1">
        <span className="line-clamp-2 block text-[14px] font-semibold">{titleOf(slot.course, lang, st)}</span>
        <span className="block text-[12px] text-muted">{st(`subj_${slot.course.subject}`)}</span>
      </span>
      <span aria-hidden className="text-muted rtl:-scale-x-100">›</span>
    </Link>
  );
}

function LinkLine({ href, title, sub }: { href: string; title: string; sub?: string }) {
  return (
    <li>
      <Link href={href} className="flex items-center gap-3 p-4 transition hover:bg-[rgb(var(--hm-gold))]/[0.06]">
        <StarGlyph size={14} className="shrink-0 text-[rgb(var(--hm-gold))]" />
        <span className="min-w-0 flex-1">
          <span className="block text-[15px] font-semibold">{title}</span>
          {sub && <span className="block text-[12.5px] text-muted">{sub}</span>}
        </span>
        <span aria-hidden className="text-muted rtl:-scale-x-100">›</span>
      </Link>
    </li>
  );
}

const Foot = () => { const st = useSchoolT(); return <p className="mt-10 text-[12.5px] leading-relaxed text-muted">{st("note")}</p>; };

// ---------- /school ----------
export function SchoolHome() {
  const st = useSchoolT();
  const { lang } = useLang();
  const termLabel = useTermLabel();
  const data = useSchoolData();
  useEffect(() => { if (data) recordSnapshot(data.live); }, [data]);
  const plan = useMemo(() => (data ? timetable() : []), [data]);
  const cur = data?.stages.find((s) => s.id === data.stage);
  const term = termOf();
  const aside = data && cur ? (
    <div className="grid gap-2.5 rounded-xl border border-[rgb(var(--gold))]/25 bg-white/[0.04] p-4">
      <p className="text-[11.5px] font-semibold uppercase tracking-[0.16em] text-[rgb(var(--gold))] rtl:tracking-normal">{st("yourStage")}</p>
      <StageName id={data.stage} dark />
      <Bar value={cur.done} gold />
      <p className="text-[13px] text-white/65">{`${st("stageProgress", { p: pct(cur.done) })} · ${termLabel(term)} · ${st("termLeft", { d: Math.max(0, Math.ceil((termBounds(term).end - Date.now()) / 86400000)) })}`}</p>
    </div>
  ) : undefined;
  return (
    <>
      <LearnHero kicker={st("kicker")} title={st("title")} lead={st("lead")} word="المدرسة" uid="school" aside={aside} wide>
        {data && <GoldLink href={`/school/${data.stage}`}>{st("open")}</GoldLink>}
        <GoldLinkOutline href="/school/certificates">{st("certificates")}</GoldLinkOutline>
      </LearnHero>
      <LearnMain wide>
        {!data ? <Placeholder /> : (
          <div className="grid gap-12">
            <section>
              <div className="flex flex-wrap items-end justify-between gap-3"><SectionTitle title={st("faculties")} /><Link href="/school/report" className="text-sm font-semibold text-accent hover:underline">{st("w_kashf")}</Link></div>
              <div className="mt-5"><Faculties grades={data.grades} /></div>
            </section>

            <div className="grid gap-6 lg:grid-cols-2">
              <section>
                <div className="flex flex-wrap items-end justify-between gap-3"><SectionTitle title={st("timetable")} /><Link href="/school/timetable" className="text-sm font-semibold text-accent hover:underline">{st("open")}</Link></div>
                <Card className="mt-5">
                  <p className="hm-k text-[rgb(var(--hm-gold-d))]">{st("today")}</p>
                  <div className="mt-3 grid gap-2">
                    {(plan[(new Date().getDay() + 6) % 7] ?? []).map((s, i) => <SlotRow key={`${s.course.id}-${i}`} slot={s} lang={lang} />)}
                    {!(plan[(new Date().getDay() + 6) % 7] ?? []).length && <p className="text-sm text-muted">{st("noCourses")}</p>}
                  </div>
                </Card>
              </section>
              <section>
                <div className="flex flex-wrap items-end justify-between gap-3"><SectionTitle title={st("report")} /><Link href="/school/report" className="text-sm font-semibold text-accent hover:underline">{st("open")}</Link></div>
                <Card className="mt-5">
                  <SchoolWord id="kashf" />
                  <div className="mt-2 flex items-center gap-3">
                    <div className="min-w-0 flex-1"><p className="text-[15px] font-semibold">{st("overall")}</p><p className="text-[13px] text-muted">{termLabel(term)}</p></div>
                    <GradeBadge grade={data.live.overall} />
                  </div>
                  {(() => { const base = data.store.baseline[term]; const gain = base !== undefined ? Math.round((data.live.done - base) * 1000) / 10 : 0; return <p className="mt-3 text-[13.5px] leading-relaxed text-muted">{gain > 0 ? st("termGain", { p: gain }) : st("termNoGain")}</p>; })()}
                </Card>
              </section>
            </div>

            <div className="grid gap-4 md:grid-cols-2"><AppRankCard /><RankCard rank={ownRank(data.live, data.store.terms, term)} /></div>

            <section>
              <SectionTitle title={st("stages")} />
              <ol className="mt-5 grid gap-3 md:grid-cols-2">
                {data.stages.map((s) => (
                  <li key={s.id}>
                    <Link href={`/school/${s.id}`} className={`hm-card hm-lift relative grid h-full gap-2.5 p-5 ${s.id === data.stage ? "!border-[rgb(var(--hm-gold))]" : ""}`}>
                      <div className="flex items-start gap-3"><div className="min-w-0 flex-1"><StageName id={s.id} /></div>{s.complete ? <span className="text-accent" aria-label={st("stageDone")}>✓</span> : <span aria-hidden className="text-muted rtl:-scale-x-100">›</span>}</div>
                      <p className="text-[13.5px] leading-relaxed text-muted">{st(`lead_${s.id}`)}</p>
                      <Bar value={s.done} gold />
                      <p className={`text-[12.5px] font-semibold ${s.complete ? "text-accent" : ""}`}>{s.complete ? st("stageDone") : st("stageProgress", { p: pct(s.done) })}</p>
                    </Link>
                  </li>
                ))}
              </ol>
            </section>

            <ul className="hm-card relative divide-y divide-line overflow-hidden !p-0">
              <LinkLine href="/school/transcript" title={`${WORDS.sijill.tr} · ${st("w_sijill")}`} sub={st("transcriptLead")} />
              <LinkLine href="/school/certificates" title={st("certificates")} sub={st("certificatesLead")} />
              <LinkLine href="/tests" title={st("allExams")} />
              <LinkLine href="/reciter-path" title={st("c_rp", { a: 1, b: 10 })} />
            </ul>
          </div>
        )}
        <Foot />
      </LearnMain>
    </>
  );
}
function GoldLinkOutline({ href, children }: { href: string; children: React.ReactNode }) {
  return <Link href={href} className="inline-flex h-12 items-center rounded-md border border-[rgb(var(--gold))]/40 px-6 text-[15px] font-bold transition hover:border-[rgb(var(--gold))] hover:bg-white/[0.04]">{children}</Link>;
}

// ---------- /school/<stage> ----------
export function StageScreen({ id }: { id: StageId }) {
  const st = useSchoolT();
  const { lang } = useLang();
  const v = useStoreVersion();
  const s = useMemo(() => (v < 0 ? null : stageState(id)), [id, v]);
  const bySubject = useMemo(() => (v < 0 ? [] : SUBJECTS.map((sub) => ({ sub, cs: coursesOf(id).filter((c) => c.subject === sub.id).map((c) => ({ c, st: stateOf(c) })) })).filter((x) => x.cs.length)), [id, v]);
  const meta = STAGES.find((x) => x.id === id)!;
  return (
    <>
      <LearnHero back={{ href: "/school", label: st("title") }} kicker={`${meta.tr} · ${st("title")}`} title={st(`stage_${id}`)} lead={st(`lead_${id}`)} word={meta.ar} uid={`st-${id}`}>
        {s && (
          <div className="grid w-full max-w-md gap-2">
            <Bar value={s.done} gold />
            <p className={`text-[13px] font-semibold ${s.complete ? "text-[#f4ead2]" : "text-white/65"}`}>{s.complete ? st("stageDone") : st("stageProgress", { p: pct(s.done) })}</p>
          </div>
        )}
      </LearnHero>
      <LearnMain>
        {!s ? <Placeholder /> : (
          <div className="grid gap-8">
            {bySubject.map(({ sub, cs }) => (
              <section key={sub.id}>
                <div className="mb-3 flex items-baseline justify-between gap-3">
                  <h2 className="font-display text-xl">{st(`subj_${sub.id}`)}</h2>
                  <span lang="ar" className="font-arabic text-[16px] text-[rgb(var(--hm-gold-d))]">{sub.ar}</span>
                </div>
                <ul className={`divide-y divide-line overflow-hidden rounded-2xl border ${sub.id === "quran" ? "border-[rgb(var(--hm-gold))]" : "border-line"}`}>
                  {cs.map(({ c, st: cst }) => (
                    <li key={c.id}>
                      <Link href={courseHref(c)} className="grid gap-2 bg-surface p-4 transition hover:bg-[rgb(var(--hm-gold))]/[0.06]">
                        <span className="flex items-center gap-3">
                          <span className="min-w-0 flex-1">
                            <span className="block text-[15px] font-semibold">{titleOf(c, lang, st)}</span>
                            <span className="mt-1 flex flex-wrap items-center gap-2">
                              <span className={`rounded-full border px-2 py-0.5 text-[11px] font-semibold ${c.required ? "border-accent bg-accent-soft text-accent" : "border-line text-muted"}`}>{c.required ? st("required") : st("elective")}</span>
                              <span className="text-[12px] text-muted">{st("progress", { p: pct(cst.done) })}</span>
                            </span>
                          </span>
                          {cst.done >= 0.999 ? <span className="text-accent" aria-label={st("stageDone")}>✓</span> : <GradeBadge grade={cst.graded ? cst.grade : null} />}
                        </span>
                        <Bar value={cst.done} gold />
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
        )}
        <Foot />
      </LearnMain>
    </>
  );
}

// ---------- /school/report ----------
export function ReportScreen() {
  const st = useSchoolT();
  const { lang } = useLang();
  const termLabel = useTermLabel();
  const data = useSchoolData();
  useEffect(() => { if (data) recordSnapshot(data.live); }, [data]);
  const current = termOf();
  const terms = useMemo(() => (data ? [...new Set([current, ...Object.keys(data.store.terms)])].sort().reverse() : [current]), [data, current]);
  const [term, setTerm] = useState<TermId>(current);
  const snap: Snapshot | undefined = !data ? undefined : term === current ? data.live : data.store.terms[term];
  return (
    <>
      <LearnHero back={{ href: "/school", label: st("title") }} kicker={st("title")} title={`${WORDS.kashf.tr} · ${st("w_kashf")}`} lead={st("reportLead")} word={WORDS.kashf.ar} uid="report">
        <OutlineButton dark onClick={() => window.print()} className="print:hidden">{printLabel(lang)}</OutlineButton>
      </LearnHero>
      <LearnMain>
        {!data ? <Placeholder /> : (
          <div className="grid gap-6">
            {terms.length > 1 && (
              <div className="flex flex-wrap gap-2 print:hidden" role="group">
                {terms.map((id) => <button key={id} type="button" aria-pressed={id === term} onClick={() => setTerm(id)} className="hm-chip border border-line bg-surface">{termLabel(id)}</button>)}
              </div>
            )}
            {snap && (
              <article className="overflow-hidden rounded-2xl border-[1.5px] border-[rgb(var(--hm-gold))] bg-surface print:break-inside-avoid">
                <header className="stage girih grid gap-1 p-5 text-white">
                  <SchoolWord id="fasl" dark size={15} />
                  <p className="text-[11.5px] font-semibold uppercase tracking-[0.16em] text-[rgb(var(--gold))] rtl:tracking-normal">{termLabel(term)}</p>
                  <StageName id={snap.stage} dark />
                  <p className="text-[12.5px] text-white/55">{term === current ? st("live") : st("saved")}</p>
                </header>
                <ul className="divide-y divide-line">
                  {SUBJECTS.map((s) => (
                    <li key={s.id} className={`flex items-center gap-3 p-4 ${s.id === "quran" ? "bg-accent-soft" : ""}`}>
                      <span className="min-w-0 flex-1">
                        <span className="block text-[14.5px] font-semibold">{st(`subj_${s.id}`)}</span>
                        <span lang="ar" dir="rtl" className="font-arabic block w-fit text-[14px] leading-[1.6] text-muted">{s.ar}</span>
                      </span>
                      <GradeBadge grade={snap.subjects[s.id] ?? null} />
                    </li>
                  ))}
                </ul>
                <footer className="flex items-center gap-3 border-t-[1.5px] border-[rgb(var(--hm-gold))] p-4">
                  <span className="flex-1 text-base font-bold">{st("overall")}</span>
                  <GradeBadge grade={snap.overall} />
                </footer>
              </article>
            )}
            <p className="text-[13.5px] text-muted">{st("exams", termExams(term))}</p>
            <div className="grid gap-4 md:grid-cols-2 print:hidden"><AppRankCard /><RankCard rank={ownRank(data.live, data.store.terms, current)} /></div>
          </div>
        )}
        <Foot />
      </LearnMain>
    </>
  );
}
const printLabel = (lang: string) => (lang === "de" ? "Drucken" : lang === "ar" ? "طباعة" : "Print");

// ---------- /school/transcript ----------
export function TranscriptScreen() {
  const st = useSchoolT();
  const { lang } = useLang();
  const v = useStoreVersion();
  const rows = useMemo(() => (v < 0 ? null : STAGES.map((s) => ({ s, cs: coursesOf(s.id).map((c) => ({ c, st: stateOf(c) })) }))), [v]);
  const { list } = useMyCertificates();
  return (
    <>
      <LearnHero back={{ href: "/school", label: st("title") }} kicker={st("title")} title={`${WORDS.sijill.tr} · ${st("w_sijill")}`} lead={st("transcriptLead")} word={WORDS.sijill.ar} uid="transcript">
        <OutlineButton dark onClick={() => window.print()} className="print:hidden">{printLabel(lang)}</OutlineButton>
      </LearnHero>
      <LearnMain>
        {!rows ? <Placeholder /> : (
          <div className="grid gap-6">
            {rows.map(({ s, cs }) => (
              <section key={s.id} className="overflow-hidden rounded-2xl border border-line bg-surface print:break-inside-avoid">
                <header className="border-b border-line p-4"><StageName id={s.id} /><div className="mt-1.5"><SchoolWord id="madda" size={14} /></div></header>
                <ul className="divide-y divide-line">
                  {cs.map(({ c, st: x }) => (
                    <li key={c.id} className="flex items-center gap-3 px-4 py-3">
                      <span className="min-w-0 flex-1">
                        <Link href={courseHref(c)} className="block text-[14px] font-semibold hover:underline">{titleOf(c, lang, st)}</Link>
                        <span className="block text-[12px] text-muted">{`${st(`subj_${c.subject}`)} · ${c.required ? st("required") : st("elective")} · ${st("progress", { p: pct(x.done) })}`}</span>
                      </span>
                      <GradeBadge grade={x.graded ? x.grade : null} />
                    </li>
                  ))}
                </ul>
              </section>
            ))}
            {list && list.length > 0 && (
              <section className="grid gap-2">
                <SectionTitle title={st("certificates")} />
                {list.map((c) => (
                  <Link key={c.code} href="/school/certificates" className="flex items-center gap-3 rounded-lg border border-line bg-surface p-3 hover:bg-[rgb(var(--hm-gold))]/[0.05]">
                    <StarGlyph size={13} className="text-[rgb(var(--hm-gold))]" />
                    <span className="min-w-0 flex-1 text-[14px] font-semibold">{`${c.title} · ${c.pct} %`}</span>
                    <span className="text-[12px] text-muted">{c.code}</span>
                  </Link>
                ))}
              </section>
            )}
            <SanadChain />
            <div className="print:hidden"><AppRankCard /></div>
          </div>
        )}
        <Foot />
      </LearnMain>
    </>
  );
}

/** the chain of the recitation Ḥafṣ ʿan ʿĀṣim; the learner's own link only through a real ijazah */
export function SanadChain() {
  const st = useSchoolT();
  const steps = ["sanad1", "sanad2", "sanad3", "sanad4", "sanad5", "sanad6", "sanad7", "sanad8", "sanad9", "sanad10"] as const;
  return (
    <section className="rounded-2xl border border-[rgb(var(--hm-gold))] bg-surface p-5 print:break-inside-avoid">
      <SchoolWord id="sanad" />
      <p className="mt-1 text-[13px] leading-relaxed text-muted">{st("sanadLead")}</p>
      <ol className="mt-4">
        {steps.map((k, i) => {
          const last = i === steps.length - 1, open = i >= steps.length - 2;
          return (
            <li key={k} className="flex gap-3">
              <span aria-hidden className="flex w-[18px] flex-col items-center">
                <span className={`mt-1 h-3 w-3 rounded-full border-2 ${open ? "border-muted" : "border-[rgb(var(--hm-gold))] bg-[rgb(var(--hm-gold))]"}`} />
                {!last && <span className={`min-h-[18px] w-0 flex-1 border-s-2 ${i >= steps.length - 3 ? "border-dashed border-muted" : "border-[rgb(var(--hm-gold))]"}`} />}
              </span>
              <span className={`flex-1 text-[14px] leading-5 ${last ? "" : "pb-3"} ${open ? "text-muted" : "font-semibold"}`}>{st(k)}</span>
            </li>
          );
        })}
      </ol>
    </section>
  );
}

// ---------- /school/timetable ----------
const MINUTES = [10, 15, 20, 30, 45, 60];
export function TimetableScreen() {
  const st = useSchoolT();
  const { lang } = useLang();
  const v = useStoreVersion();
  const minutes = useMemo(() => (v < 0 ? null : dailyMinutes()), [v]);
  const plan = useMemo(() => (minutes === null ? null : timetable(minutes)), [minutes, v]); // eslint-disable-line react-hooks/exhaustive-deps
  const today = (new Date().getDay() + 6) % 7;
  const dayName = (d: number) => new Date(2024, 0, 1 + d).toLocaleDateString(intlLocale(lang), { weekday: "long" }); // 1 January 2024 was a Monday
  return (
    <>
      <LearnHero back={{ href: "/school", label: st("title") }} kicker={st("title")} title={st("timetable")} lead={minutes !== null ? st("timetableLead", { m: minutes }) : undefined} word="الجدول" uid="tt" />
      <LearnMain wide>
        {!plan || minutes === null ? <Placeholder /> : (
          <div className="grid gap-6">
            <div className="grid gap-2">
              <p className="text-[13px] font-semibold text-muted">{st("minutesPerDay")}</p>
              <div className="flex flex-wrap gap-2" role="group" aria-label={st("minutesPerDay")}>
                {MINUTES.map((m) => <button key={m} type="button" aria-pressed={m === minutes} onClick={() => setMinutes(m)} className="hm-chip border border-line bg-surface">{st("min", { n: m })}</button>)}
              </div>
            </div>
            <ol className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {plan.map((day, d) => (
                <li key={d} className={`grid content-start gap-2 rounded-2xl border bg-surface p-4 ${d === today ? "border-[rgb(var(--hm-gold))]" : "border-line"}`}>
                  <p className={`text-[15px] font-bold ${d === today ? "text-[rgb(var(--hm-gold-d))]" : ""}`}>{`${dayName(d)}${d === today ? ` · ${st("today")}` : ""}`}</p>
                  {day.map((s, i) => <SlotRow key={`${s.course.id}-${i}`} slot={s} lang={lang} />)}
                  {!day.length && <p className="text-sm text-muted">{st("noCourses")}</p>}
                </li>
              ))}
            </ol>
          </div>
        )}
        <Foot />
      </LearnMain>
    </>
  );
}

// ---------- /school/certificates ----------
export function CertificatesScreen() {
  const st = useSchoolT();
  const { lang } = useLang();
  return (
    <>
      <LearnHero back={{ href: "/school", label: st("title") }} kicker={st("title")} title={st("certificates")} lead={st("certificatesLead")} word="شهادات" uid="certs">
        <GoldLinkOutline href="/verify">{verifyLabel(lang)}</GoldLinkOutline>
      </LearnHero>
      <LearnMain wide>
        <MyCertificates />
        <ul className="hm-card relative mt-10 divide-y divide-line overflow-hidden !p-0">
          <LinkLine href="/tests" title={st("allExams")} />
          <LinkLine href="/reciter-path" title={st("c_rp", { a: 1, b: 10 })} />
          <LinkLine href="/arabic/lang" title={st("c_ar", { level: "A1–C1" })} />
        </ul>
        <Foot />
      </LearnMain>
    </>
  );
}
const verifyLabel = (lang: string) => (lang === "de" ? "Zertifikat prüfen" : lang === "ar" ? "التحقق من شهادة" : "Check a certificate");

