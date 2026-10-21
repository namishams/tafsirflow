"use client";
// The tests of the card trainer on the website, mirrors mobile/src/features/srs/Tests.tsx:
//   /tests              placement and weekly test, vocabulary, juz and surah exams, device certificates, score history
//   /tests/<kind>       one test (?ref= juz or surah number, or the vocabulary deck), under the exam rules of
//                       src/lib/learn/exam (seeded option order, time limits, no going back, cooldown, server-signed result;
//                       the juz exam ends with a recitation part from memory)
//   /tests/certificate  the juz certificates earned in this browser (?juz=N for one) and the verifiable one
// The website has no Pro limits: every test is open. The exam cooldowns still apply (anti-cheating, not a paywall).
import { useEffect, useRef, useState } from "react";
import { Link } from "@/i18n/navigation";
import { intlLocale, useLang } from "@/lib/learn/i18n";
import { useAuth } from "@/lib/learn/auth";
import { useHydrated, useStored } from "@/lib/learn/store";
import { shuffleOptions, useExamSession } from "@/lib/learn/exam/integrity";
import { examOfTest, juzRecitePlan } from "@/lib/learn/exam/plans";
import { useExamT } from "@/lib/learn/exam/texts";
import { useIntl } from "@/lib/learn/srs/format";
import { EMPTY_TESTS, TESTS_KEY, useTestGate, type TestKind, type TestResult, type TestStore } from "@/lib/learn/srs/gate";
import { PASS, buildTest, saveResult, type Question } from "@/lib/learn/srs/testgen";
import { useSrsT } from "@/lib/learn/srs/texts";
import { tone } from "@/components/learn/media";
import { shareOrCopy } from "@/components/learn/coursekit/share";
import { ExamBar, ExamBlocked, ExamVerdict, VerifiedCertLink } from "@/components/learn/exam";
import { Card, GoldButton, GoldLink, LearnHero, LearnMain, Option, OutlineButton, OutlineLink, SectionTitle, Spinner } from "@/components/learn/ui";
import { StarGlyph } from "@/components/art/HomeOrnaments";
import { IconTrophy } from "@/components/Icons";
import { VOCAB_TEST_DECKS } from "./meta";
import { useSrsWeb } from "./webTexts";

function useTestTitle() {
  const st = useSrsT();
  const nf = useIntl();
  return (kind: TestKind, ref: string) => {
    if (kind === "juz") return `${st("juzExam")} · ${st("juzN", { n: nf(Number(ref)) })}`;
    if (kind === "surah") return `${st("surahExam")} · ${st("surahN", { n: nf(Number(ref)) })}`;
    if (kind === "vocab") return `${st("vocabExam")} · ${st(`deck_${ref}` as "deck_juzamma")}`;
    return st(kind);
  };
}

const testHref = (kind: TestKind, ref = "") => `/tests/${kind}${ref ? `?ref=${ref}` : ""}`;

// ---------- /tests ----------
export function TestsHome() {
  const st = useSrsT();
  const nf = useIntl();
  const { lang } = useLang();
  const title = useTestTitle();
  const hydrated = useHydrated();
  const store = useStored<TestStore>(TESTS_KEY, EMPTY_TESTS);
  const done = new Set(store.certs.map((c) => c.juz));
  return (
    <>
      <LearnHero back={{ href: "/cards", label: st("title") }} word="اِمْتِحَان" title={st("tests")} lead={st("testsLead")} uid="tests">
        <GoldLink href={testHref("placement")}>{st("placement")}</GoldLink>
      </LearnHero>
      <LearnMain>
        <div className="grid gap-12">
          <div className="grid gap-3 sm:grid-cols-2">
            <TestTile href={testHref("placement")} title={st("placement")} sub={st("placementLead")} />
            <TestTile href={testHref("weekly")} title={st("weekly")} sub={st("weeklyLead")} />
          </div>

          <section>
            <SectionTitle title={st("vocabExam")} />
            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              {VOCAB_TEST_DECKS.map((d) => <TestTile key={d} href={testHref("vocab", d)} title={st(`deck_${d}`)} />)}
            </div>
          </section>

          <section>
            <SectionTitle title={st("juzExam")} lead={st("examLead")} />
            <NumberGrid n={30} min={52} done={hydrated ? done : undefined} href={(j) => testHref("juz", String(j))} label={(j) => st("juzN", { n: nf(j) })} />
          </section>

          <section>
            <SectionTitle title={st("surahExam")} />
            <NumberGrid n={114} min={42} href={(s) => testHref("surah", String(s))} label={(s) => st("surahN", { n: nf(s) })} />
          </section>

          {hydrated && store.certs.length > 0 && (
            <section>
              <SectionTitle title={st("certificate")} />
              <ul className="hm-card relative mt-5 divide-y divide-line overflow-hidden !p-0">
                {store.certs.map((c) => (
                  <li key={c.juz}>
                    <Link href={`/tests/certificate?juz=${c.juz}`} className="flex items-center gap-3 px-4 py-3.5 transition hover:bg-[rgb(var(--hm-gold))]/[0.06] sm:px-5">
                      <IconTrophy className="h-5 w-5 shrink-0 text-[rgb(var(--hm-gold))]" />
                      <span className="min-w-0 flex-1 text-[15.5px] font-semibold">{st("juzN", { n: nf(c.juz) })}</span>
                      <span className="text-sm font-semibold tabular-nums text-accent">{`${nf(c.pct)} %`}</span>
                      <span aria-hidden className="text-muted rtl:-scale-x-100">›</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}

          <section>
            <SectionTitle title={st("history")} />
            {hydrated && store.results.length ? (
              <ul className="mt-5 divide-y divide-line overflow-hidden rounded-2xl border border-line bg-surface">
                {store.results.slice(0, 30).map((r) => {
                  const ok = r.total && r.score / r.total >= PASS;
                  return (
                    <li key={r.id} className="flex items-center gap-3 px-4 py-3">
                      <span className="min-w-0 flex-1">
                        <span className="block text-[14.5px] font-semibold">{title(r.kind, r.ref)}</span>
                        <span className="block text-[12.5px] text-muted">{new Date(r.at).toLocaleDateString(intlLocale(lang))}</span>
                      </span>
                      <span className={`text-base font-bold tabular-nums ${ok ? "text-accent" : "text-muted"}`}>{`${nf(r.total ? Math.round((r.score / r.total) * 100) : 0)} %`}</span>
                    </li>
                  );
                })}
              </ul>
            ) : <p className="mt-4 text-[15px] text-muted">{st("noHistory")}</p>}
          </section>
        </div>
      </LearnMain>
    </>
  );
}

function TestTile({ href, title, sub }: { href: string; title: string; sub?: string }) {
  return (
    <Link href={href} className="hm-card hm-lift relative flex items-center gap-3 p-4 sm:p-5">
      <StarGlyph size={14} className="shrink-0 text-[rgb(var(--hm-gold))]" />
      <span className="min-w-0 flex-1">
        <span className="block text-[15.5px] font-bold">{title}</span>
        {sub && <span className="mt-0.5 block text-[13px] leading-snug text-muted">{sub}</span>}
      </span>
      <span aria-hidden className="text-muted rtl:-scale-x-100">›</span>
    </Link>
  );
}

function NumberGrid({ n, min, done, href, label }: { n: number; min: number; done?: Set<number>; href: (i: number) => string; label: (i: number) => string }) {
  const nf = useIntl();
  return (
    <ul className="mt-5 grid gap-1.5" style={{ gridTemplateColumns: `repeat(auto-fill, minmax(${min}px, 1fr))` }}>
      {Array.from({ length: n }, (_, i) => i + 1).map((i) => (
        <li key={i}>
          <Link href={href(i)} aria-label={label(i)} title={label(i)}
            className={`flex aspect-square items-center justify-center rounded-md border text-[13px] font-semibold tabular-nums transition hover:border-[rgb(var(--hm-gold))] hover:bg-[rgb(var(--hm-gold))]/[0.08] ${done?.has(i) ? "border-[rgb(var(--hm-gold))] bg-[rgb(var(--hm-gold))]/[0.18]" : "border-line bg-surface"}`}>
            {nf(i)}
          </Link>
        </li>
      ))}
    </ul>
  );
}

// ---------- /tests/<kind> ----------
export function TestRunner({ kind, refId: ref }: { kind: TestKind; refId: string }) {
  const st = useSrsT();
  const sw = useSrsWeb();
  const et = useExamT();
  const nf = useIntl();
  const { lang } = useLang();
  const title = useTestTitle()(kind, ref);
  const gate = useTestGate();
  const [qs, setQs] = useState<Question[] | null>(null);
  const [error, setError] = useState(false);
  const [i, setI] = useState(0);
  const [pick, setPick] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [result, setResult] = useState<TestResult | null>(null);
  const [copied, setCopied] = useState(false);
  // exam rules (src/lib/learn/exam): seeded option order, time limits, no going back, cooldown, server-signed result
  const onTimeout = useRef(() => {});
  const onExpire = useRef(() => {});
  const ex = useExamSession(examOfTest(kind), ref, {
    questionIndex: i, questionOpen: pick === null && !!qs && !result,
    onQuestionTimeout: () => onTimeout.current(), onExpire: () => onExpire.current(),
    recite: (rand) => juzRecitePlan(Number(ref), rand),
    leaveText: et("leaveBody"),
  });
  useEffect(() => {
    if (!ex.ready || qs) return;
    let live = true;
    buildTest(kind, ref, lang).then((q) => { if (live) { if (q.length) setQs(q.map((x) => shuffleOptions(x, ex.rand))); else setError(true); } }).catch(() => { if (live) setError(true); });
    return () => { live = false; };
  }, [ex.ready]); // eslint-disable-line react-hooks/exhaustive-deps

  const q = qs?.[i];
  const answer = (k: number) => {
    if (pick !== null || !q) return;
    const ok = k === q.answer;
    setPick(k); tone(ok); if (ok) setScore((s) => s + 1);
  };
  const next = () => {
    if (!qs) return;
    if (i + 1 < qs.length) { setI(i + 1); setPick(null); return; }
    setResult(saveResult({ kind, ref, score, total: qs.length }, gate.pro));
    ex.finish(score, qs.length);
  };
  onTimeout.current = () => answer(-1);
  onExpire.current = () => { if (qs && !result) { setResult(saveResult({ kind, ref, score, total: qs.length }, gate.pro)); ex.finish(score, qs.length); } };
  const live = useRef({ answer, next, q, pick }); live.current = { answer, next, q, pick };

  // keyboard: 1–4 choose an answer, Enter goes on
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement | null;
      const L = live.current;
      if (!L.q || e.metaKey || e.ctrlKey || e.altKey) return;
      if (el && (el.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(el.tagName))) return;
      if (L.pick === null && /^[1-9]$/.test(e.key) && Number(e.key) <= L.q.options.length) { e.preventDefault(); L.answer(Number(e.key) - 1); }
      else if (L.pick !== null && e.key === "Enter" && el?.tagName !== "BUTTON" && el?.tagName !== "A") { e.preventDefault(); L.next(); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const pct = result && result.total ? Math.round((result.score / result.total) * 100) : 0;
  const running = !!q && !result && ex.phase !== "void";
  return (
    <>
      <LearnHero back={{ href: "/tests", label: st("tests") }} title={title} lead={kind === "juz" || kind === "surah" ? st("examLead") : undefined} uid={`test-${kind}`} />
      <LearnMain>
        <div className="mx-auto grid max-w-2xl gap-5">
          <ExamBlocked session={ex} />
          {ex.phase === "blocked" && <OutlineLink href="/tests" className="w-fit">{st("tests")}</OutlineLink>}
          {running && <ExamBar session={ex} showRules={i === 0} />}
          {error && <p className="text-center text-[15px] text-muted">{st("loadError")}</p>}
          {!qs && !error && ex.phase !== "blocked" && ex.phase !== "void" && <div className="text-center"><Spinner label={st("loading")} /></div>}
          {ex.phase === "void" && !result && <><ExamVerdict session={ex} /><OutlineLink href="/tests" className="w-fit">{st("tests")}</OutlineLink></>}
          {running && q && (
            <div key={i} className="rise">
              <p className="mb-3 text-center text-[13px] font-semibold text-muted">{st("question", { n: nf(i + 1), total: nf(qs!.length) })}</p>
              <div className="stage girih relative grid min-h-[170px] place-items-center rounded-2xl border border-[rgb(var(--gold))]/40 p-6 text-[#eef0f3]">
                <div className="relative w-full"><QuestionFront q={q} revealed={pick !== null} /></div>
              </div>
              <div className="mt-4 grid gap-2">
                {q.options.map((o, k) => {
                  const state = pick === null ? "idle" : k === q.answer ? "right" : k === pick ? "wrong" : "dim";
                  const ar = q.type !== "text" && q.type !== "meaning";
                  return (
                    <Option key={k} state={state} onClick={() => answer(k)} disabled={pick !== null} dir={ar ? "rtl" : undefined}>
                      <span className="flex items-center gap-3">
                        <span aria-hidden className="hidden w-5 shrink-0 text-center text-[12px] font-bold text-muted sm:inline">{k + 1}</span>
                        {ar ? <span lang="ar" className="font-arabic flex-1 text-center text-[24px] leading-[1.8]">{o}</span> : <span className="flex-1">{o}</span>}
                      </span>
                    </Option>
                  );
                })}
              </div>
              {pick !== null && <GoldButton onClick={next} className="mt-4 w-full">{st("next")}</GoldButton>}
            </div>
          )}
          {result && (
            <div className="rise grid gap-4">
              <Card className="grid justify-items-center gap-2 text-center">
                <p className="hm-k text-[rgb(var(--hm-gold-d))]">{st("result")}</p>
                <p className="font-display text-[52px] leading-none tabular-nums">{`${nf(pct)} %`}</p>
                <p className="text-[16px] text-muted">{st("scoreOf", { score: nf(result.score), total: nf(result.total) })}</p>
                {kind !== "placement" && <p className={`text-[15px] font-semibold ${pct >= PASS * 100 ? "text-accent" : "text-muted"}`}>{pct >= PASS * 100 ? st("passed") : st("notPassed")}</p>}
                {kind === "placement" && <p className="text-[15px] font-semibold">{st("placementResult", { deck: st(pct >= 70 ? "deck_vocab" : "deck_juzamma") })}</p>}
              </Card>
              <ExamVerdict session={ex} />
              <div className="flex flex-wrap gap-3">
                <GoldButton onClick={() => { void shareOrCopy({ title, text: st("shareMsg", { pct: nf(pct), test: title }), url: `${location.origin}/tests` }).then((r) => setCopied(r === "copied")); }}>{st("share")}</GoldButton>
                {kind === "juz" && pct >= PASS * 100 && <OutlineLink href={`/tests/certificate?juz=${ref}`}>{st("viewCert")}</OutlineLink>}
                {kind === "placement" && <OutlineLink href={`/cards/deck/${pct >= 70 ? "vocab" : "juzamma"}`}>{st(pct >= 70 ? "deck_vocab" : "deck_juzamma")}</OutlineLink>}
                <OutlineLink href="/tests">{st("tests")}</OutlineLink>
              </div>
              {copied && <p role="status" className="text-sm text-accent">{sw("copied")}</p>}
            </div>
          )}
        </div>
      </LearnMain>
    </>
  );
}

function QuestionFront({ q, revealed }: { q: Question; revealed: boolean }) {
  const st = useSrsT();
  if (q.type === "meaning") return <p lang="ar" dir="rtl" className="font-arabic text-center text-[46px] leading-[1.9] text-white">{q.ar}</p>;
  if (q.type === "text") return <p className="text-center text-[18px] font-bold leading-snug text-white">{q.prompt}</p>;
  return (
    <div className="grid gap-2">
      <p className="text-center text-[11.5px] font-semibold uppercase tracking-[0.16em] text-[rgb(var(--gold))] rtl:tracking-normal">{`${st("verse", { key: q.verseKey })} · ${st("fillIn")}`}</p>
      <p lang="ar" dir="rtl" className="font-arabic text-center text-[24px] leading-[2.05] text-white">
        {q.words.map((w, i) => {
          const txt = `${i ? " " : ""}${w.text}`;
          if (w.position !== q.hide) return <span key={w.position}>{txt}</span>;
          return revealed
            ? <span key={w.position} className="text-[rgb(var(--gold))]">{txt}</span>
            : <span key={w.position}>{i ? " " : ""}<Gap len={w.text.length} /></span>;
        })}
      </p>
    </div>
  );
}

/** the place of a hidden word: a blank of about its width, without the word in the page (screen readers hear "…") */
export function Gap({ len }: { len: number }) {
  return <span role="img" aria-label="…" className="inline-block h-[1.1em] rounded bg-[rgb(214_180_108/0.3)] align-middle" style={{ width: `${Math.max(1.6, len * 0.42)}em` }} />;
}

// ---------- /tests/certificate ----------
export function CertificateScreen({ juz }: { juz: number | null }) {
  const st = useSrsT();
  const sw = useSrsWeb();
  const nf = useIntl();
  const hydrated = useHydrated();
  const store = useStored<TestStore>(TESTS_KEY, EMPTY_TESTS);
  const certs = juz ? store.certs.filter((c) => c.juz === juz) : [...store.certs].sort((a, b) => a.juz - b.juz);
  return (
    <>
      <LearnHero back={{ href: "/tests", label: st("tests") }} title={juz ? `${st("certificate")} · ${st("juzN", { n: nf(juz) })}` : sw("allCerts")} lead={st("certificateNote")} uid="cert" />
      <LearnMain>
        {!hydrated ? <div className="text-center"><Spinner /></div> : certs.length ? (
          <div className={`grid gap-10 ${certs.length > 1 ? "md:grid-cols-2" : "mx-auto max-w-md"}`}>
            {certs.map((c) => <DeviceCert key={c.juz} cert={c} />)}
          </div>
        ) : (
          <div className="grid justify-items-center gap-4 text-center">
            <p className="text-[15px] text-muted">{st("noHistory")}</p>
            {juz ? <GoldLink href={testHref("juz", String(juz))}>{sw("openExam")}</GoldLink> : <GoldLink href="/tests">{st("tests")}</GoldLink>}
          </div>
        )}
        {hydrated && juz && certs.length > 0 && store.certs.length > 1 && <p className="mt-8 text-center"><Link href="/tests/certificate" className="text-sm font-semibold text-accent hover:underline">{sw("allCerts")}</Link></p>}
      </LearnMain>
    </>
  );
}

function DeviceCert({ cert }: { cert: TestStore["certs"][number] }) {
  const st = useSrsT();
  const sw = useSrsWeb();
  const nf = useIntl();
  const { lang } = useLang();
  const { user } = useAuth();
  const [copied, setCopied] = useState(false);
  const date = new Date(cert.at).toLocaleDateString(intlLocale(lang), { year: "numeric", month: "long", day: "numeric" });
  const juzName = st("juzN", { n: nf(cert.juz) });
  return (
    <div className="grid content-start gap-3">
      <article className="stage girih relative overflow-hidden rounded-2xl border-2 border-[rgb(var(--gold))] p-7 text-center text-[#eef0f3]">
        <span aria-hidden className="illum-frame" />
        <div className="relative grid justify-items-center gap-2.5">
          <IconTrophy className="h-9 w-9 text-[rgb(var(--gold))]" />
          <p className="text-[12px] font-semibold uppercase tracking-[0.2em] text-[rgb(var(--gold))] rtl:tracking-normal">{st("certificate")}</p>
          {user?.name && <p className="font-display text-[26px]">{user.name}</p>}
          <p className="text-[15px] text-white/75">{st("certificateFor")}</p>
          <p className="font-display text-[30px] text-[#f4ead2]">{juzName}</p>
          <p className="text-[14px] text-white/60">{`${nf(cert.pct)} % · ${date}`}</p>
          <p className="mt-2 max-w-sm text-[12px] leading-relaxed text-white/55">{st("certificateNote")}</p>
        </div>
      </article>
      <div className="flex flex-wrap gap-3 print:hidden">
        <GoldButton onClick={() => { void shareOrCopy({ title: st("certificate"), text: st("shareMsg", { pct: nf(cert.pct), test: juzName }), url: `${location.origin}/tests` }).then((r) => setCopied(r === "copied")); }}>{st("share")}</GoldButton>
        <OutlineButton onClick={() => window.print()}>{sw("print")}</OutlineButton>
      </div>
      {copied && <p role="status" className="text-sm text-accent">{sw("copied")}</p>}
      <div className="print:hidden"><VerifiedCertLink course={`juz:${cert.juz}`} /></div>
    </div>
  );
}
