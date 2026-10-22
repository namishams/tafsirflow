"use client";
// mirrors mobile/src/features/shams2/Darajat.tsx: Darajāt al-Ḥifẓ – the grade card (name, demands, what unlocks the
// next grade), the due tests and the surprise ʿarḍ (DueChecks), the grade screen (/shams/darajat) and the formal ʿarḍ
// tests (/shams/ard?kind=weekly|monthly|ard). A test item is the classical teacher's question: a verse from the
// memorised portion is given – "continue from here"; the browser's word check helps, the learner answers honestly.
import { useMemo, useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { intlLocale } from "@/lib/learn/i18n";
import { noteMistake } from "@/lib/learning";
import { juzOf } from "@/lib/quranIndex";
import { award } from "@/lib/points";
import { useVerseData } from "@/lib/learn/srs/verseHooks";
import { shamsGrow } from "@/lib/learn/garden/garden";
import { gEvent } from "@/lib/learn/feed/gamify";
import { GRADES, checkPromotion, nextRequirements, pickItems, recordTest, type Grade, type TestKind } from "@/lib/learn/shams2/grades";
import { useShams2 } from "@/lib/learn/shams2/model";
import { noteCheck, noteWords } from "@/lib/learn/shams2/store";
import { noteLink } from "@/lib/learn/shams2/store2";
import { useS2 } from "@/lib/learn/shams2/text";
import { Bar, Card, GoldButton, LearnHero, LearnMain, Spinner } from "@/components/learn/ui";
import { PromptedWords, SpeechCheck, type CheckResult } from "./recite";
import { Live, S2Kicker, SmallBtn, SourceNote, Term, useBack, useNames, useWebT } from "./ui";
import { ContinueNext } from "./Continue";

/** the grade card: name, demands, what unlocks the next grade */
export function GradeCard({ compact }: { compact?: boolean }) {
  const { s, nf } = useS2();
  const m = useShams2();
  const g = m.grade;
  const next = nextRequirements(m.gs, m.known.size, m.q.overall);
  return (
    <Card className="grid gap-3">
      <S2Kicker>{s("darajaLabel", { n: nf(g.n), total: nf(GRADES.length) })}</S2Kicker>
      <p className="flex flex-wrap items-baseline gap-2.5">
        <span lang="ar" dir="rtl" className="font-arabic text-[26px] leading-[1.7] text-[rgb(var(--hm-gold-d))]">{g.ar}</span>
        <span className="text-[17px] font-bold">{g.tr}</span>
      </p>
      {!compact && <Demands g={g} />}
      {next ? (
        <div className="grid gap-2">
          <p className="text-[14px] font-semibold">{s("unlocksNext", { g: next.grade.tr })}</p>
          {next.items.map((x) => (
            <div key={x.id} className="grid gap-1">
              <p className="flex justify-between gap-3 text-[13px]">
                <span className="text-muted">{s(`req_${x.id}` as never)}</span>
                <span className={`font-semibold tabular-nums ${x.have >= x.need ? "text-accent" : ""}`}>{`${nf(Math.min(x.have, x.need))} / ${nf(x.need)}`}</span>
              </p>
              <Bar value={x.need ? Math.min(1, x.have / x.need) : 1} gold label={s(`req_${x.id}` as never)} />
            </div>
          ))}
          {next.ready && <GoldButton onClick={() => { if (checkPromotion(m.known.size, m.q.overall)) award("session"); }}>{s("promote")}</GoldButton>}
        </div>
      ) : <p className="text-[14px] text-muted">{s("topGrade")}</p>}
      {compact && <SmallBtn href="/shams/darajat">{s("darajatOpen")}</SmallBtn>}
    </Card>
  );
}

function Demands({ g }: { g: Grade }) {
  const { s, nf } = useS2();
  const rows: [string, string][] = [
    [s("dm_prompt"), s(`prompt_${g.prompt}` as never)],
    [s("dm_pass"), `${nf(Math.round(g.wordPass * 100))} %`],
    [s("dm_pace"), s("paceX", { x: nf(g.pace) })],
    [s("dm_manzil"), s("daysN", { n: nf(g.manzilDays) })],
    [s("dm_minutes"), s("minN", { n: nf(g.minutesMin) })],
    [s("dm_ard"), nf(g.ardPerDay)],
    [s("dm_traps"), g.traps ? s("yes") : s("no")],
    [s("dm_tests"), s("testsLine", { w: nf(g.weeklyItems), m: nf(g.monthlyItems), p: nf(Math.round(g.testPass * 100)) })],
  ];
  return (
    <dl className="grid gap-1">
      {rows.map(([a, b]) => (
        <div key={a} className="flex justify-between gap-3 text-[13.5px]"><dt className="text-muted">{a}</dt><dd className="text-end font-semibold">{b}</dd></div>
      ))}
    </dl>
  );
}

/** due tests and the surprise ʿarḍ, as one-tap rows (hub and wird) */
export function DueChecks() {
  const { s, nf } = useS2();
  const m = useShams2();
  const rows: [string, string, string][] = [];
  if (m.ardLeft > 0) rows.push(["ard", s("surpriseArd"), s("surpriseArdLead", { n: nf(m.ardLeft) })]);
  if (m.due.weekly) rows.push(["weekly", s("weeklyArd"), m.wird.gated ? s("gatedLead") : s("weeklyLead")]);
  if (m.due.monthly) rows.push(["monthly", s("monthlyReview"), m.wird.gated ? s("gatedLead") : s("monthlyLead")]);
  if (!rows.length) return null;
  return (
    <div className="grid gap-2.5">
      {rows.map(([k, title, lead]) => (
        <div key={k} className="callout flex flex-wrap items-center gap-3 rounded-lg p-4">
          <div className="min-w-0 flex-1"><p className="text-[16px] font-bold">{title}</p><p className="mt-0.5 text-[13.5px] leading-relaxed text-muted">{lead}</p></div>
          <SmallBtn href={`/shams/ard?kind=${k}`}>{s("begin")}</SmallBtn>
        </div>
      ))}
    </div>
  );
}

function History() {
  const { s, nf, lang } = useS2();
  const m = useShams2();
  const tests = [...m.gs.tests].reverse().slice(0, 12);
  if (!tests.length) return null;
  return (
    <section className="grid gap-2">
      <h2 className="font-display text-[22px]">{s("history")}</h2>
      <ul className="grid gap-1">
        {tests.map((x, i) => (
          <li key={i} className={`text-[13.5px] ${x.pass ? "text-accent" : "text-muted"}`}>
            {`${new Date(x.day * 86400000).toLocaleDateString(intlLocale(lang))} · ${s(x.kind === "weekly" ? "weeklyArd" : x.kind === "monthly" ? "monthlyReview" : "surpriseArd")} · ${nf(Math.round(x.score * 100))} % · ${x.pass ? s("passed") : s("retake")}`}
          </li>
        ))}
      </ul>
    </section>
  );
}

function GradeListLive() { const m = useShams2(); return <GradeList current={m.grade.n} />; }
function GradeList({ current }: { current: number }) {
  const { s, nf } = useS2();
  return (
    <ol className="grid gap-2">
      {GRADES.map((g) => (
        <li key={g.n} className={`rounded-xl border bg-surface p-3.5 ${g.n === current ? "border-[rgb(var(--hm-gold))]/70" : "border-line"} ${current && g.n > current + 1 ? "opacity-70" : ""}`}>
          <p className="flex flex-wrap items-baseline gap-2">
            <span className="text-[12.5px] font-semibold text-[rgb(var(--hm-gold-d))]">{nf(g.n)}</span>
            <span lang="ar" dir="rtl" className="font-arabic text-[19px] leading-[1.7]">{g.ar}</span>
            <span className="text-[13.5px] font-semibold text-muted">{g.tr}</span>
          </p>
          <p className="text-[13px] text-muted">{s("gradeReq", { v: nf(g.req.verses), q: nf(g.req.quality), w: nf(g.req.weekly), m: nf(g.req.monthly) })}</p>
        </li>
      ))}
    </ol>
  );
}

export function DarajatScreen() {
  const { s } = useS2();
  return (
    <>
      <LearnHero back={useBack()} kicker={s("eyebrow")} title={s("darajatTitle")} lead={s("darajatLead")} word="درجات" uid="s2d" />
      <LearnMain className="grid gap-5">
        <Live><GradeCard /><DueChecks /></Live>
        <div className="flex flex-wrap gap-2">
          <SmallBtn href="/shams/ard?kind=weekly">{s("weeklyArd")}</SmallBtn>
          <SmallBtn href="/shams/ard?kind=monthly">{s("monthlyReview")}</SmallBtn>
        </div>
        <h2 className="font-display text-[22px]">{s("allGrades")}</h2>
        <Live fallback={<GradeList current={0} />}><GradeListLive /></Live>
        <Live fallback={null}><History /></Live>
        <p className="text-[13px] leading-relaxed text-muted">{s("darajatNote")}</p>
        <div className="grid gap-3 sm:grid-cols-3"><Term id="ard" /><Term id="itqan" /><Term id="mutashabihat" /></div>
        <SourceNote src={["halaqa", "jazari", "retrieval"]} review={{ status: "draft" }} />
      </LearnMain>
    </>
  );
}

// ---------- the test runner ----------
function Item({ k, onDone }: { k: string; onDone: (score: number) => void }) {
  const { s, nf, lang } = useS2();
  const w = useWebT();
  const { name } = useNames();
  const m = useShams2();
  const [sur, v] = k.split(":").map(Number);
  const prevKey = v > 1 ? `${sur}:${v - 1}` : null;
  const prev = useVerseData(prevKey, lang);
  const cur = useVerseData(k, lang);
  const [check, setCheck] = useState<CheckResult | null>(null);
  const [shown, setShown] = useState(false);
  const words = cur?.data?.words.map((x) => ({ position: x.position, text: x.text })) ?? [];
  // the cue: at the highest prompt level only the last words of the previous verse, like a teacher's prompt
  const cue = prev?.data ? (m.grade.prompt === "hidden" ? prev.data.words.slice(-3) : prev.data.words) : [];
  const finish = (score: number) => {
    if (score < 1) noteMistake(k);
    // the item asks for the transition from the previous verse into this one (Shams 3.0, links.v1): held when it sat.
    // A stall counts only when the start went wrong: an error in the first three words heard, or (without a speech
    // check) nothing recited at all; a partial score with a clean start is a mistake later in the verse, not in the
    // transition, and leaves the transition as it is.
    if (prevKey) {
      const badStart = check ? check.ok.slice(0, 3).some((x) => !x) : score <= 0;
      if (score >= 1) noteLink(k, true);
      else if (badStart) noteLink(k, false);
    }
    if (check) { noteWords(k, words.map((x, i) => ({ position: x.position, ok: !!check.ok[i] }))); noteCheck(k, check.ok.filter(Boolean).length, check.ok.length); }
    onDone(score);
  };
  if ((prevKey && !prev?.data && !prev?.error) || (!cur?.data && !cur?.error)) return <Spinner label={w.loading} />;
  if (cur?.error) return <p className="text-[14px] text-muted">{s("loadFailed")}</p>;
  return (
    <Card className="grid gap-3">
      <S2Kicker>{`${name(sur)} · ${s("verseN", { v: nf(v) })}`}</S2Kicker>
      <p className="text-[16px] font-bold">{prevKey ? s("continueFromHere") : s("beginSurah", { surah: name(sur) })}</p>
      {cue.length > 0 && <PromptedWords words={cue.map((x) => ({ position: x.position, text: x.text }))} prompt="full" size={22} />}
      <SpeechCheck words={words} pass={m.grade.wordPass} onResult={setCheck} />
      {shown ? <PromptedWords words={words} prompt="full" size={24} /> : <SmallBtn onClick={() => setShown(true)}>{s("showAnswer")}</SmallBtn>}
      <p className="text-[14px] font-semibold">{s("howWasIt")}</p>
      <div className="flex flex-wrap gap-2">
        <SmallBtn onClick={() => finish(0)}>{s("ans_no")}</SmallBtn>
        <SmallBtn onClick={() => finish(0.5)}>{s("ans_slip")}</SmallBtn>
        <SmallBtn primary={!check || check.pass} onClick={() => finish(check && !check.pass ? 0.5 : 1)}>{s("ans_ok")}</SmallBtn>
      </div>
      {check && !check.pass && <p className="text-[12.5px] text-muted">{s("checkCaps")}</p>}
    </Card>
  );
}

function Runner({ kind }: { kind: TestKind }) {
  const { s, nf } = useS2();
  const router = useRouter();
  const m = useShams2();
  const juz = useMemo(() => (kind === "monthly" ? [...m.q.juz].filter((j) => j.known > 0).sort((a, b) => b.known - a.known)[0]?.id : undefined), [kind, m.q.juz]);
  const items = useMemo(() => pickItems(m.known, kind === "ard" ? 1 : kind === "weekly" ? m.grade.weeklyItems : m.grade.monthlyItems, m.grade, m.day * 7 + (kind === "monthly" ? 3 : kind === "ard" ? (m.gs.ard[m.day] ?? 0) + 11 : 1), juzOf, juz), [kind]); // eslint-disable-line react-hooks/exhaustive-deps
  const [i, setI] = useState(0);
  const [scores, setScores] = useState<number[]>([]);
  const [result, setResult] = useState<{ score: number; pass: boolean; up: Grade | null } | null>(null);
  const done = (sc: number) => {
    const all = [...scores, sc];
    setScores(all);
    if (all.length < items.length) { setI(i + 1); return; }
    const score = all.reduce((a, b) => a + b, 0) / all.length;
    const pass = score >= (kind === "ard" ? 0.5 : m.grade.testPass);
    recordTest({ kind, day: m.day, score, items: all.length, pass, juz });
    gEvent({ t: "quiz", right: pass });
    if (pass) shamsGrow(kind === "ard" ? "verse" : "session", false);
    setResult({ score, pass, up: pass && kind !== "ard" ? checkPromotion(m.known.size, m.q.overall) : null });
  };
  if (!items.length) return <Card className="grid gap-4"><p className="text-[15px] text-muted">{s("ardNothing")}</p><ContinueNext /></Card>;
  if (result) {
    return (
      <Card className="grid gap-3" >
        <p className="font-display text-[30px] tabular-nums">{`${nf(Math.round(result.score * 100))} %`}</p>
        <p className={`text-[15px] font-semibold ${result.pass ? "text-accent" : "text-[rgb(var(--hm-gold-d))]"}`} role="status">{result.pass ? s("testPassed") : s("testRetake", { p: nf(Math.round(m.grade.testPass * 100)) })}</p>
        {result.up && <p className="text-[16px] font-bold text-[rgb(var(--hm-gold-d))]">{s("newGrade", { g: result.up.tr })}</p>}
        {!result.pass && <GoldButton className="w-fit" onClick={() => router.replace("/shams/weak")}>{s("weakTitle")}</GoldButton>}
        <ContinueNext />
      </Card>
    );
  }
  return (
    <div className="grid gap-3">
      <p className="text-[13px] font-semibold text-muted">{`${nf(i + 1)} / ${nf(items.length)}`}</p>
      <Bar value={i / items.length} gold />
      <Item key={items[i]} k={items[i]} onDone={done} />
    </div>
  );
}

function ArdLead({ kind }: { kind: TestKind }) {
  const { s, nf } = useS2();
  const m = useShams2();
  const juz = kind === "monthly" ? [...m.q.juz].filter((j) => j.known > 0).sort((a, b) => b.known - a.known)[0]?.id : undefined;
  return <>{juz ? s("monthlyJuz", { n: nf(juz) }) : s("ardLead")}</>;
}

export function ArdScreen({ kind }: { kind: TestKind }) {
  const { s } = useS2();
  const title = kind === "weekly" ? s("weeklyArd") : kind === "monthly" ? s("monthlyReview") : s("surpriseArd");
  return (
    <>
      <LearnHero back={useBack()} kicker={s("eyebrow")} title={title} lead={<Live fallback={s("ardLead")}><ArdLead kind={kind} /></Live>} word="عرض" uid="s2a" />
      <LearnMain className="grid gap-5">
        <Live><Runner key={kind} kind={kind} /></Live>
        <SourceNote src={["halaqa", "jazari", "retrieval"]} review={{ status: "draft" }} />
      </LearnMain>
    </>
  );
}
