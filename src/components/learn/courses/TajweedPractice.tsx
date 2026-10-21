"use client";
// /tajweed/practice – the tajweed rules on real verses (verse text from the Quran store by key): "find the rule" (ten
// random places), a quiz per surah, and the link to the in-depth course. Web port of TajweedPracticeScreen in
// mobile/src/features/courses/TajweedPractice.tsx; on the website every round and every surah is open.
import { useEffect, useMemo, useRef, useState } from "react";
import { CardLink, GoldButton, Kicker, LearnHero, LearnMain, OutlineButton, Row, RowList, SectionTitle } from "@/components/learn/ui";
import { HomeCorners, HomeRing } from "@/components/art/HomeOrnaments";
import { ArrowNext } from "@/components/Icons";
import { award } from "@/lib/points";
import { formatNumber, useLang } from "@/lib/learn/i18n";
import { getChapters, type Chapter } from "@/lib/learn/quran";
import { courseById, tx } from "@/lib/learn/courses";
import { PRACTICE, RULES, type PracticeItem, type RuleId } from "@/lib/learn/courses/content/tajweedPractice";
import { useCT } from "@/lib/learn/courses/texts";
import { Quiz, shuffle, type RunQ } from "./parts";
import { useWT } from "./strings";

const surahOf = (k: string) => Number(k.split(":")[0]);
const verseNo = (k: string) => Number(k.split(":")[1]);
type Mode = { kind: "find" } | { kind: "surah"; s: number };

export default function TajweedPractice() {
  const c = useCT();
  const w = useWT();
  const { lang } = useLang();
  const [mode, setMode] = useState<Mode | null>(null);
  const [round, setRound] = useState(0);
  const [result, setResult] = useState<{ right: number; n: number } | null>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const top = useRef<HTMLDivElement>(null);
  const head = useRef<HTMLHeadingElement>(null);
  useEffect(() => { getChapters(lang).then(setChapters).catch(() => undefined); }, [lang]);
  const surahs = useMemo(() => Array.from(new Set(PRACTICE.map((p) => surahOf(p.key)))).sort((a, b) => a - b), []);
  const items: PracticeItem[] = useMemo(() => {
    if (!mode) return [];
    if (mode.kind === "find") return shuffle(PRACTICE).slice(0, 10);
    return PRACTICE.filter((p) => surahOf(p.key) === mode.s).sort((a, b) => verseNo(a.key) - verseNo(b.key));
  }, [mode, round]); // eslint-disable-line react-hooks/exhaustive-deps
  const qs: RunQ[] = useMemo(() => items.map((it) => {
    const others = shuffle((Object.keys(RULES) as RuleId[]).filter((r) => r !== it.rule)).slice(0, 3);
    const opts = shuffle([it.rule, ...others]);
    return { q: c("tjWhich", { w: it.word }), verse: it.key, options: opts.map((r) => tx(RULES[r].name, lang)), answer: opts.indexOf(it.rule), explain: tx(RULES[it.rule].hint, lang) };
  }), [items, lang]); // eslint-disable-line react-hooks/exhaustive-deps
  const deep = courseById("tajweed-deep");
  const name = (s: number) => chapters.find((x) => x.id === s)?.name_simple ?? String(s);
  const toTop = () => requestAnimationFrame(() => top.current?.scrollIntoView({ block: "start" }));
  const start = (m: Mode) => { setResult(null); setMode(m); setRound((r) => r + 1); toTop(); };
  const done = (right: number) => { award("quiz"); setResult({ right, n: qs.length }); toTop(); };
  const back = () => { setMode(null); setResult(null); toTop(); };
  useEffect(() => { if (result) head.current?.focus(); }, [result]);

  return (
    <div>
      <LearnHero uid="tjp" back={{ href: "/tajweed", label: w("tajweed") }} kicker="Tajweed" title={c("tjPractice")} lead={c("tjPracticeLead")} word="تجويد" />
      <LearnMain>
        <div ref={top} className="scroll-mt-24" />
        {mode && !result ? (
          <div className="space-y-6">
            <Quiz key={round} qs={qs} onDone={done} header={<Kicker>{mode.kind === "find" ? c("tjFind") : `${formatNumber(mode.s, lang)}. ${name(mode.s)}`}</Kicker>} />
            <OutlineButton onClick={back}>{c("overview")}</OutlineButton>
          </div>
        ) : result && mode ? (
          <div className="flex flex-col items-center gap-3 py-4 text-center">
            <HomeRing id="tjp-res" value={result.right / Math.max(1, result.n)} size={128} dark={false}>
              <span className="font-display text-[26px]">{formatNumber(result.right, lang)}/{formatNumber(result.n, lang)}</span>
            </HomeRing>
            <h2 ref={head} tabIndex={-1} className="font-display text-[26px] outline-none">{c("tjScore", { n: formatNumber(result.right, lang), m: formatNumber(result.n, lang) })}</h2>
            <div className="mt-3 flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
              <GoldButton onClick={() => start(mode)}>{c("tjAgain")}</GoldButton>
              <OutlineButton onClick={back}>{c("overview")}</OutlineButton>
            </div>
          </div>
        ) : (
          <>
            <div className="grid gap-4 sm:grid-cols-2">
              <button type="button" onClick={() => start({ kind: "find" })} className="hm-card hm-lift relative flex flex-col p-5 text-start sm:p-6">
                <HomeCorners />
                <span className="text-[17px] font-bold">{c("tjFind")}</span>
                <span className="mt-1 text-[14.5px] leading-relaxed text-muted">{c("tjFindLead")}</span>
                <span className="mt-auto inline-flex items-center gap-1.5 pt-4 text-[13px] font-semibold text-accent">{c("start")} <ArrowNext /></span>
              </button>
              <CardLink href="/courses/tajweed-deep">
                <span className="text-[17px] font-bold">{c("tjDeep")}</span>
                <span className="mt-1 text-[14.5px] leading-relaxed text-muted">{deep ? tx(deep.lead, lang) : c("coursesCard")}</span>
                <span className="mt-auto inline-flex items-center gap-1.5 pt-4 text-[13px] font-semibold text-accent">{c("continue")} <ArrowNext /></span>
              </CardLink>
            </div>
            <SectionTitle className="mt-12" title={c("tjSurah")} lead={c("tjSurahLead")} />
            <RowList className="mt-5">
              {surahs.map((s) => {
                const n = PRACTICE.filter((p) => surahOf(p.key) === s).length;
                return (
                  <Row key={s} onClick={() => start({ kind: "surah", s })}
                    lead={<span className="inline-block min-w-[2rem] text-[13px] font-bold tabular-nums text-[rgb(var(--hm-gold-d))]">{formatNumber(s, lang)}</span>}
                    title={name(s)} sub={c("tjItems", { n: formatNumber(n, lang) })} />
                );
              })}
            </RowList>
          </>
        )}
      </LearnMain>
    </div>
  );
}
