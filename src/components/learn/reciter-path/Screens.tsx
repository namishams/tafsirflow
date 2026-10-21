"use client";
// The Reciter Path on the website, mirrors mobile/src/features/reciter-path/Screens.tsx: the path of ten levels
// (/reciter-path), a unit (/reciter-path/<unit>: explanation, examples, practice, self-check, unit test), the level
// exam under the exam rules with the device certificate and the verifiable one (/reciter-path/exam/<level>), and how
// to find a teacher for an ijazah (/reciter-path/teacher). Everything is open on the website.
import { useMemo, useState } from "react";
import { Link } from "@/i18n/navigation";
import { LEVELS, PASS, unitById, type Unit } from "@/lib/learn/reciter-path/curriculum";
import { useContent } from "@/lib/learn/reciter-path/content";
import { useRpT } from "@/lib/learn/reciter-path/texts";
import { levelUnitsDone, setExamScore, setUnitScore, toggleCheck, unitDone, useRpProgress } from "@/lib/learn/reciter-path/progress";
import { useVerse } from "@/lib/learn/reciter-path/useVerse";
import { shuffleWith, useExamSession } from "@/lib/learn/exam/integrity";
import { rpRecitePlan } from "@/lib/learn/exam/plans";
import { useExamT } from "@/lib/learn/exam/texts";
import { useAuth } from "@/lib/learn/auth";
import { intlLocale, useLang } from "@/lib/learn/i18n";
import { useHydrated } from "@/lib/learn/store";
import { award } from "@/lib/points";
import { ExamBar, ExamBlocked, ExamVerdict, VerifiedCertLink } from "@/components/learn/exam";
import { Bar, Card, GoldButton, GoldLink, LearnHero, LearnMain, OutlineButton, OutlineLink, SectionTitle, Spinner, StageStats } from "@/components/learn/ui";
import { StarGlyph } from "@/components/art/HomeOrnaments";
import { IconTrophy } from "@/components/Icons";
import { ListenRepeat, RecordCompare, VerseWords, WordCheck } from "./Practice";
import { Quiz, type Question } from "./Quiz";

const unitHref = (id: string) => `/reciter-path/${id}`;
const examHref = (n: number) => `/reciter-path/exam/${n}`;
const ALL = LEVELS.flatMap((l) => l.units);

// ——— /reciter-path ———
export function PathHome() {
  const rt = useRpT();
  const c = useContent();
  const p = useRpProgress();
  const hydrated = useHydrated();
  const next = ALL.find((u) => !unitDone(p, u.id)) ?? ALL[0];
  const done = ALL.filter((u) => unitDone(p, u.id)).length;
  const certs = Object.keys(p.certs).length;
  return (
    <>
      <LearnHero back={{ href: "/masterclass", label: "Masterclass" }} kicker={rt("kicker")} title={rt("title")} lead={rt("lead")} word="ترتيل" uid="rp" wide
        aside={hydrated ? <StageStats items={[{ n: LEVELS.length, l: rt("level", { n: "" }).trim() }, { n: done, l: rt("unitsDone", { d: done, n: ALL.length }) }, { n: certs, l: rt("certificate") }]} /> : undefined}>
        <GoldLink href={unitHref(next.id)}>{hydrated && Object.keys(p.units).length ? rt("continue") : rt("start")}</GoldLink>
        <OutlineLink dark href="/reciter-path/teacher">{rt("teacherCard")}</OutlineLink>
      </LearnHero>
      <LearnMain wide>
        <ol className="grid gap-8 lg:grid-cols-2">
          {LEVELS.map((l) => {
            const d = hydrated ? l.units.filter((u) => unitDone(p, u.id)).length : 0;
            const examOpen = hydrated && levelUnitsDone(p, l.n);
            return (
              <li key={l.n} className="min-w-0">
                <section className="hm-card relative h-full p-5 sm:p-6">
                  <p className="flex items-center gap-2 text-[12px] font-semibold uppercase tracking-[0.14em] text-[rgb(var(--hm-gold-d))] rtl:tracking-normal">
                    {rt("level", { n: l.n })}
                    {hydrated && p.certs[l.n] && <span className="text-[rgb(var(--hm-gold))] [&>svg]:h-4 [&>svg]:w-4" aria-label={rt("certificate")}><IconTrophy /></span>}
                  </p>
                  <h2 className="font-display mt-1 text-[22px] leading-tight">{c.levels[l.n].title}</h2>
                  <p className="mt-1.5 text-[14px] leading-relaxed text-muted">{c.levels[l.n].lead}</p>
                  <Bar value={d / l.units.length} gold className="mt-3" />
                  <ul className="mt-4 divide-y divide-line overflow-hidden rounded-lg border border-line">
                    {l.units.map((u, i) => {
                      const ok = hydrated && unitDone(p, u.id);
                      return (
                        <li key={u.id}>
                          <Link href={unitHref(u.id)} className="flex items-center gap-3 bg-surface p-3.5 transition hover:bg-[rgb(var(--hm-gold))]/[0.06]">
                            <span className={`grid h-[30px] w-[30px] shrink-0 place-items-center rounded-full text-[13px] font-bold ${ok ? "bg-accent text-white" : "bg-accent-soft text-accent"}`}>{ok ? "✓" : i + 1}</span>
                            <span className="min-w-0 flex-1 text-[15px] font-semibold">{c.units[u.id].title}</span>
                            <span aria-hidden className="text-muted rtl:-scale-x-100">›</span>
                          </Link>
                        </li>
                      );
                    })}
                    <li>
                      <Link href={examHref(l.n)} className={`flex items-center gap-3 bg-surface p-3.5 transition hover:bg-[rgb(var(--hm-gold))]/[0.06] ${examOpen ? "" : "opacity-70"}`}>
                        <span className="grid h-[30px] w-[30px] shrink-0 place-items-center"><StarGlyph size={16} className="text-[rgb(var(--hm-gold))]" /></span>
                        <span className="min-w-0 flex-1 text-[15px] font-semibold">{rt("exam")}</span>
                        <span aria-hidden className="text-muted rtl:-scale-x-100">›</span>
                      </Link>
                    </li>
                  </ul>
                </section>
              </li>
            );
          })}
        </ol>
        <Link href="/reciter-path/teacher" className="hm-card hm-lift relative mt-8 grid gap-1.5 p-5 sm:p-6">
          <span className="flex items-center gap-2 text-base font-bold"><StarGlyph size={13} className="text-[rgb(var(--hm-gold))]" />{rt("teacherTitle")}</span>
          <span className="text-[14px] leading-relaxed text-muted">{rt("teacherLead")}</span>
        </Link>
      </LearnMain>
    </>
  );
}

function Example({ refKey, word, rule }: { refKey: string; word: number; rule: string }) {
  const rt = useRpT();
  const { verse, error } = useVerse(refKey);
  return (
    <Card className="grid gap-3">
      <div className="flex justify-between gap-3"><span className="text-[14px] font-bold text-[rgb(var(--hm-gold-d))]">{rule}</span><span className="text-[13px] text-muted">{refKey}</span></div>
      {verse ? <><VerseWords verse={verse} mark={[word]} /><ListenRepeat verse={verse} word={word} /></> : error ? <p className="text-muted">{rt("offline")}</p> : <Spinner label={rt("loading")} />}
    </Card>
  );
}

function PracticeBlock({ keys }: { keys: string[] }) {
  const rt = useRpT();
  const [k, setK] = useState(keys[0]);
  const { verse, error } = useVerse(k);
  return (
    <Card className="grid gap-4">
      {keys.length > 1 && (
        <div className="flex flex-wrap gap-1.5" role="group">
          {keys.map((x) => <button key={x} type="button" aria-pressed={x === k} onClick={() => setK(x)} className="hm-chip border border-line bg-surface">{x}</button>)}
        </div>
      )}
      {verse ? (
        <div key={k} className="grid gap-5">
          <VerseWords verse={verse} size={24} />
          <ListenRepeat verse={verse} />
          <RecordCompare verse={verse} />
          <hr className="border-line" />
          <h3 className="text-[15px] font-bold">{rt("wordCheck")}</h3>
          <WordCheck verse={verse} />
        </div>
      ) : error ? <p className="text-muted">{rt("offline")}</p> : <Spinner label={rt("loading")} />}
    </Card>
  );
}

const unitQuestions = (u: Unit, mcq: { q: string; options: string[]; answer: number }[]): Question[] =>
  [...u.tap.map((item) => ({ kind: "tap" as const, item })), ...mcq.map((m) => ({ kind: "mcq" as const, ...m }))];

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return <section className="grid gap-3"><SectionTitle title={title} />{children}</section>;
}

// ——— /reciter-path/[unit] ———
export function UnitPage({ id }: { id: string }) {
  const rt = useRpT();
  const c = useContent();
  const p = useRpProgress();
  const hydrated = useHydrated();
  const [quiz, setQuiz] = useState<null | "run" | number>(null);
  const u = unitById(id);
  const keys = useMemo(() => {
    if (!u) return [];
    if (u.verses) return u.verses.flatMap((r) => Array.from({ length: r.to - r.from + 1 }, (_, i) => `${r.surah}:${r.from + i}`));
    return [...new Set(u.examples.map((e) => e.ref.key))];
  }, [u]);
  if (!u) return null;
  const tx = c.units[u.id];
  const questions = unitQuestions(u, tx.mcq);
  const unitNo = LEVELS[u.level - 1].units.indexOf(u) + 1;
  const idx = ALL.indexOf(u);
  const nextUnit = ALL[idx + 1];
  const finishUnit = (s: number) => { const first = !unitDone(p, u.id) && s >= PASS; setUnitScore(u.id, s); if (first) award("lesson"); };

  return (
    <>
      <LearnHero back={{ href: "/reciter-path", label: rt("title") }} kicker={`${rt("level", { n: u.level })} · ${rt("unit", { n: unitNo })}`} title={tx.title} word="ترتيل" uid={`rpu-${u.id}`} />
      <LearnMain>
        <div className="grid gap-10">
          <Section title={rt("explanation")}>
            <p className="text-[16px] leading-relaxed">{tx.intro}</p>
            <ul className="grid gap-2">
              {tx.points.map((pt) => <li key={pt} className="flex gap-2.5 text-[15px] leading-relaxed"><StarGlyph size={10} className="mt-2 shrink-0 text-[rgb(var(--hm-gold))]" />{pt}</li>)}
            </ul>
            {u.rules.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {u.rules.map((r) => <span key={r} className="rounded-full bg-accent-soft px-2.5 py-1.5 text-[12px] font-semibold text-accent">{`${c.rules[r].name} · ${c.rules[r].short}`}</span>)}
              </div>
            )}
          </Section>

          {u.examples.length > 0 && (
            <Section title={rt("examples")}>
              <div className="grid gap-3 md:grid-cols-2">
                {u.examples.map((e) => <Example key={`${e.ref.key}-${e.ref.word}-${e.rule}`} refKey={e.ref.key} word={e.ref.word} rule={c.rules[e.rule].name} />)}
              </div>
            </Section>
          )}

          <Section title={rt("practice")}>
            {u.verses?.map((r) => <p key={`${r.surah}-${r.from}`} className="text-[13px] font-semibold text-muted">{rt("surahVerses", { s: r.surah, a: r.from, b: r.to })}</p>)}
            {keys.length > 0 && <PracticeBlock keys={keys} />}
          </Section>

          <Section title={rt("checklist")}>
            <Card className="grid gap-3">
              {tx.check.map((line, i) => {
                const on = hydrated && !!p.checks[`${u.id}:${i}`];
                return (
                  <label key={line} className="flex cursor-pointer items-start gap-3 text-[15px] leading-relaxed">
                    <input type="checkbox" checked={on} onChange={() => toggleCheck(u.id, i)} className="mt-1 h-5 w-5 shrink-0 accent-[rgb(var(--accent))]" />
                    <span>{line}</span>
                  </label>
                );
              })}
              <p className="text-[12px] text-muted">{rt("checkSaved")}</p>
            </Card>
          </Section>

          <Section title={rt("test")}>
            {questions.length === 0 ? (
              hydrated && unitDone(p, u.id) ? <p className="font-bold text-accent">{rt("done")}</p> : <GoldButton className="w-fit" onClick={() => finishUnit(1)}>{rt("finish")}</GoldButton>
            ) : quiz === "run" ? (
              <Card><Quiz questions={questions} seed={u.id} onDone={(s) => { finishUnit(s); setQuiz(s); }} /></Card>
            ) : typeof quiz === "number" ? (
              <Card className="grid gap-3">
                <p className="font-display text-2xl">{rt("result", { score: Math.round(quiz * 100) })}</p>
                <p aria-live="polite" className={`text-[15px] ${quiz >= PASS ? "text-accent" : "text-muted"}`}>{quiz >= PASS ? rt("passed") : rt("notPassed")}</p>
                <div className="flex flex-wrap gap-2.5">
                  <OutlineButton onClick={() => setQuiz("run")}>{rt("retry")}</OutlineButton>
                  {quiz >= PASS && nextUnit ? <GoldLink href={unitHref(nextUnit.id)}>{rt("next")}</GoldLink> : <GoldLink href="/reciter-path">{rt("toPath")}</GoldLink>}
                </div>
              </Card>
            ) : (
              <div className="grid gap-3">
                {hydrated && unitDone(p, u.id) && <p className="font-bold text-accent">{`${rt("passed")} · ${Math.round((p.units[u.id] ?? 0) * 100)} %`}</p>}
                <GoldButton className="w-fit" onClick={() => setQuiz("run")}>{rt("test")}</GoldButton>
              </div>
            )}
          </Section>

          <nav className="flex flex-wrap justify-between gap-3 border-t border-line pt-6">
            <OutlineLink href="/reciter-path">{rt("toPath")}</OutlineLink>
            {nextUnit ? <OutlineLink href={unitHref(nextUnit.id)}>{rt("next")}</OutlineLink> : <OutlineLink href={examHref(u.level)}>{rt("exam")}</OutlineLink>}
          </nav>
        </div>
      </LearnMain>
    </>
  );
}

// ——— certificate of the device (an app certificate, clearly not an ijazah) ———
function Certificate({ level, date }: { level: number; date: string }) {
  const rt = useRpT();
  const c = useContent();
  const { lang } = useLang();
  const { user } = useAuth();
  const [name, setName] = useState("");
  const [copied, setCopied] = useState(false);
  const holder = name.trim() || user?.name || "";
  const shown = (() => { try { return new Date(date).toLocaleDateString(intlLocale(lang), { year: "numeric", month: "long", day: "numeric" }); } catch { return date; } })();
  const share = async () => {
    const text = `${rt("certTitle")} · ${rt("title")} · ${rt("level", { n: level })}`;
    const url = `${location.origin}/${lang}/reciter-path`;
    try { if (navigator.share) await navigator.share({ title: rt("certTitle"), text, url }); else { await navigator.clipboard.writeText(`${text} · ${url}`); setCopied(true); } } catch { /* closed */ }
  };
  return (
    <div className="grid gap-4">
      <article className="stage girih relative overflow-hidden rounded-2xl border-[1.5px] border-[rgb(var(--gold))] p-6 text-center text-white print:break-inside-avoid">
        <span aria-hidden className="illum-frame" />
        <div className="relative grid justify-items-center gap-2.5">
          <StarGlyph size={20} className="text-[rgb(var(--gold))]" />
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[rgb(var(--gold))] rtl:tracking-normal">{rt("certTitle")}</p>
          <p lang="ar" className="font-arabic text-[22px] text-[rgb(var(--gold))]">شهادة</p>
          {holder && <p className="font-display text-[26px]">{holder}</p>}
          <p className="text-[14px] text-white/80">{rt("certBody", { n: level })}</p>
          <p className="text-[18px] font-bold">{c.levels[level].title}</p>
          <p className="text-[13px] font-semibold text-[rgb(var(--gold))]">{`${rt("title")} · ${shown}`}</p>
          <p className="mt-1 max-w-sm text-[11px] leading-snug text-white/65">{rt("certNote")}</p>
          <p className="text-[10.5px] text-white/60">quranmasterclass.com</p>
        </div>
      </article>
      <div className="flex flex-wrap items-center gap-2.5 print:hidden">
        <input value={name} onChange={(e) => setName(e.target.value.slice(0, 40))} placeholder={rt("certName")} aria-label={rt("certName")}
          className="h-11 min-w-0 flex-1 rounded-lg border border-line bg-surface px-3 text-[15px]" />
        <GoldButton onClick={() => void share()}>{copied ? "✓" : rt("shareCert")}</GoldButton>
        <OutlineButton onClick={() => window.print()}>{lang === "de" ? "Drucken" : lang === "ar" ? "طباعة" : "Print"}</OutlineButton>
      </div>
    </div>
  );
}

// ——— /reciter-path/exam/[level] ———
export function ExamPage({ level }: { level: number }) {
  const rt = useRpT();
  const et = useExamT();
  const c = useContent();
  const p = useRpProgress();
  const hydrated = useHydrated();
  const [state, setState] = useState<null | "run" | number>(null);
  const l = LEVELS[level - 1];
  const questions = useMemo<Question[]>(() => (l ? l.units.flatMap((u) => unitQuestions(u, c.units[u.id].mcq)) : []), [l, c]);
  // exam rules: order drawn per attempt, time limits, cooldown, recitation (levels 6–10), server-signed result
  const ex = useExamSession(l ? "rp-level" : null, String(level), { active: state === "run", recite: (rand) => rpRecitePlan(level, rand), leaveText: et("leaveBody") });
  const examQs = useMemo(() => (ex.ready ? shuffleWith(questions, ex.rand) : questions), [questions, ex.ready, ex.rand]);
  if (!l) return null;
  const ready = levelUnitsDone(p, level);
  return (
    <>
      <LearnHero back={{ href: "/reciter-path", label: rt("title") }} kicker={rt("level", { n: level })} title={`${rt("exam")}: ${c.levels[level].title}`} lead={c.levels[level].lead} word="إجازة" uid={`rpe-${level}`} />
      <LearnMain>
        <div className="grid gap-6">
          {!hydrated ? <Spinner /> : !ready && !p.certs[level] ? (
            <Card className="grid gap-3"><p className="text-[15px] leading-relaxed">{rt("examLocked")}</p><OutlineLink href="/reciter-path" className="w-fit">{rt("toPath")}</OutlineLink></Card>
          ) : state === "run" ? (
            ex.phase === "blocked" ? <><ExamBlocked session={ex} /><OutlineButton className="w-fit" onClick={() => setState(null)}>{rt("toPath")}</OutlineButton></>
            : ex.phase === "void" ? <Card className="grid gap-3"><ExamVerdict session={ex} /><OutlineLink href="/reciter-path" className="w-fit">{rt("toPath")}</OutlineLink></Card>
            : !ex.ready ? <Spinner /> : (
              <>
                <ExamBar session={ex} />
                <Card><Quiz questions={examQs} seed={`exam-${level}-${ex.nonce}`} questionSeconds={ex.rule?.questionSec} onDone={(s) => { setExamScore(level, s, s >= PASS); setState(s); ex.finish(Math.round(s * examQs.length), examQs.length); }} /></Card>
              </>
            )
          ) : (
            <>
              {typeof state === "number" && (
                <Card className="grid gap-3">
                  <p className="font-display text-2xl">{rt("result", { score: Math.round(state * 100) })}</p>
                  <p aria-live="polite" className={`text-[15px] ${state >= PASS ? "text-accent" : "text-muted"}`}>{state >= PASS ? rt("passed") : rt("notPassed")}</p>
                  <ExamVerdict session={ex} />
                </Card>
              )}
              {ex.phase === "recite" || ex.phase === "submitting" ? null : (
                <div className="grid gap-2">
                  <GoldButton className="w-fit" onClick={() => setState("run")}>{state === null ? rt("exam") : rt("retry")}</GoldButton>
                  {state === null && <p className="text-[12.5px] leading-relaxed text-muted">{`${et("rule1")} ${et("rule2")} ${et("rule3")}`}</p>}
                </div>
              )}
            </>
          )}
          {hydrated && p.certs[level] && state !== "run" && (
            <section className="grid gap-3">
              <SectionTitle title={rt("certificate")} lead={rt("certNote")} />
              <Certificate level={level} date={p.certs[level]} />
              <VerifiedCertLink course={`rp-level:${level}`} />
            </section>
          )}
        </div>
      </LearnMain>
    </>
  );
}

// ——— /reciter-path/teacher ———
export function TeacherPage() {
  const rt = useRpT();
  const steps = [rt("teacherS1"), rt("teacherS2"), rt("teacherS3"), rt("teacherS4")];
  return (
    <>
      <LearnHero back={{ href: "/reciter-path", label: rt("title") }} kicker={rt("title")} title={rt("teacherTitle")} lead={rt("teacherLead")} word="إجازة" uid="rpt" />
      <LearnMain>
        <Section title={rt("teacherSteps")}>
          <ol className="grid gap-4">
            {steps.map((s, i) => (
              <li key={s} className="flex gap-3">
                <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-accent-soft text-sm font-bold text-accent">{i + 1}</span>
                <span className="text-[15px] leading-relaxed">{s}</span>
              </li>
            ))}
          </ol>
        </Section>
        <p className="mt-8 text-[13px] text-muted">{rt("teacherSoon")}</p>
        <div className="mt-6 flex flex-wrap gap-3"><OutlineLink href="/talents">Quran Masterclass Talents</OutlineLink><OutlineLink href="/reciter-path">{rt("toPath")}</OutlineLink></div>
      </LearnMain>
    </>
  );
}
