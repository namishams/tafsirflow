"use client";
// mirrors mobile/src/features/shams2/Weak.tsx: /shams/weak?s= – weak-spot practice (tathbīt): the verses and words
// with repeated errors, collected automatically, practised one by one with the weak words marked; the prompts follow
// the learner's grade. Every answer updates the verse review (FSRS) and the word statistics, so a weak spot leaves the
// list once it holds.
import { useMemo, useState } from "react";
import { rate, type Rating } from "@/lib/learning";
import { useVerseData } from "@/lib/learn/srs/verseHooks";
import { shamsGrow } from "@/lib/learn/garden/garden";
import { useShams2 } from "@/lib/learn/shams2/model";
import { noteCheck, noteWords } from "@/lib/learn/shams2/store";
import { useS2 } from "@/lib/learn/shams2/text";
import { useRv } from "@/lib/learn/shams2/review/text";
import { weakSpots } from "@/lib/learn/shams2/weakSpots";
import { Card, GoldButton, LearnHero, LearnMain, Spinner } from "@/components/learn/ui";
import { PromptedWords, SpeechCheck, type CheckResult } from "./recite";
import { Live, SmallBtn, SourceNote, Term, useBack, useNames, useWebT } from "./ui";
import { ContinueNext } from "./Continue";
import { Briefing } from "./Tadabbur";

function Body({ surah }: { surah?: number }) {
  const { s, nf, lang } = useS2();
  const w = useWebT();
  const { name } = useNames();
  const m = useShams2();
  const rv = useRv();
  const spots = useMemo(() => {
    const all = weakSpots(m.known, m.words, m.mut, 40, m.links);
    if (!surah) return all;
    const inSurah = all.filter((x) => x.key.startsWith(`${surah}:`));
    if (inSurah.length) return inSurah;
    // nothing flagged in that surah: its weakest memorised verses
    return [...m.known.values()].filter((k) => k.key.startsWith(`${surah}:`)).sort((a, b) => a.recall - b.recall).slice(0, 10).map((k) => ({ key: k.key, words: [] as number[], reason: ["fading" as const], weight: 1 }));
  }, [m.known, m.words, m.mut, m.links, surah]);
  const [queue, setQueue] = useState<string[] | null>(null);
  const [i, setI] = useState(0);
  const [result, setResult] = useState<CheckResult | null>(null);
  const cur = queue ? queue[i] ?? null : null;
  const spot = spots.find((x) => x.key === cur);
  const vd = useVerseData(cur, lang);
  const ref = (k: string) => { const [a, b] = k.split(":"); return `${name(Number(a))} ${nf(Number(b))}`; };
  const grade = (r: Rating) => {
    if (!cur) return;
    rate(cur, r);
    if (spot?.words.length) noteWords(cur, spot.words.map((p) => ({ position: p, ok: r !== "again" })));
    if (r !== "again") shamsGrow("verse", false);
    setResult(null);
    setI(i + 1);
  };
  const onCheck = (r: CheckResult) => {
    if (!cur || !vd?.data) return;
    setResult(r);
    noteWords(cur, vd.data.words.map((x, j) => ({ position: x.position, ok: !!r.ok[j] })));
    noteCheck(cur, r.ok.filter(Boolean).length, r.ok.length);
  };
  if (queue && cur) {
    const [a, b] = cur.split(":").map(Number);
    const words = vd?.data?.words.map((x) => ({ position: x.position, text: x.text })) ?? [];
    return (
      <div className="grid gap-3">
        <p className="text-[13px] font-semibold text-muted">{`${nf(i + 1)} / ${nf(queue.length)} · ${ref(cur)}`}</p>
        <Card className="grid gap-3">
          {vd?.error ? <p className="text-muted">{s("loadFailed")}</p> : !vd?.data ? <Spinner label={w.loading} /> : (
            <>
              <PromptedWords words={words} prompt={m.grade.prompt} mark={new Set(spot?.words ?? [])} />
              {spot?.words.length ? <p className="text-[13px] text-muted">{s("weakWordsMarked", { n: nf(spot.words.length) })}</p> : null}
              <SpeechCheck words={words} pass={m.grade.wordPass} onResult={onCheck} />
              {result && <p className={`text-[13.5px] font-semibold ${result.pass ? "text-accent" : "text-[rgb(var(--hm-gold-d))]"}`}>{result.pass ? s("passed") : s("notYetPassed")}</p>}
              <Briefing s={a} v={b} review />
              <p className="text-[14px] font-semibold">{s("howWasIt")}</p>
              <div className="flex flex-wrap gap-2">
                <SmallBtn onClick={() => grade("again")}>{s("rate_weak")}</SmallBtn>
                <SmallBtn onClick={() => grade("good")}>{s("rate_hesitant")}</SmallBtn>
                <SmallBtn primary onClick={() => grade("easy")}>{s("rate_fluent")}</SmallBtn>
              </div>
              <SmallBtn href={`/shams/talaqqi?s=${a}&v=${b}`}>{s("talaqqi")}</SmallBtn>
            </>
          )}
        </Card>
      </div>
    );
  }
  if (queue) return <Card className="grid gap-4"><p className="font-display text-[22px]" role="status">{s("weakDone")}</p><ContinueNext surah={surah} /></Card>;
  return (
    <div className="grid gap-4">
      {spots.length ? <GoldButton className="w-fit" onClick={() => { setQueue(spots.slice(0, 10).map((x) => x.key)); setI(0); }}>{s("startDrillN", { n: nf(Math.min(10, spots.length)) })}</GoldButton>
        : <p className="text-[15px] leading-relaxed text-muted">{s("noWeak")}</p>}
      {spots.length > 0 && (
        <ul className="grid gap-2">
          {spots.map((x) => (
            <li key={x.key} className="flex items-center gap-3 rounded-lg border border-line bg-surface p-3">
              <span className="min-w-0 flex-1">
                <span className="block text-[15px] font-semibold">{ref(x.key)}</span>
                <span className="block text-[13px] text-muted">{x.reason.map((r) => (r === "transition" ? rv("why_transition") : s(`why_${r}` as never))).join(" · ")}</span>
              </span>
              {x.words.length > 0 && <span className="text-[13px] font-semibold tabular-nums text-[rgb(var(--hm-gold-d))]">{nf(x.words.length)}</span>}
            </li>
          ))}
        </ul>
      )}
      {!spots.length && <Card><ContinueNext surah={surah} /></Card>}
    </div>
  );
}

export function WeakScreen({ surah }: { surah?: number }) {
  const { s } = useS2();
  return (
    <>
      <LearnHero back={useBack()} kicker={s("eyebrow")} title={s("weakTitle")} lead={s("weakLead")} word="التثبيت" uid="s2k" />
      <LearnMain className="grid gap-5">
        <Term id="tathbit" />
        <Live><Body surah={surah} /></Live>
        <SourceNote src={["app", "retrieval", "fsrs"]} review={{ status: "draft" }} />
      </LearnMain>
    </>
  );
}
