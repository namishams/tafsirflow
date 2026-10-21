"use client";
// Unit test and level exam of the Reciter Path, mirrors mobile/src/features/reciter-path/Quiz.tsx: one question at a
// time ("tap every word with <rule>" on the verse's word data, or multiple choice), checked with feedback, score at
// the end. In exams a time per question runs; when it ends, the answer is checked as it stands.
import { useEffect, useMemo, useState } from "react";
import type { TapItem } from "@/lib/learn/reciter-path/curriculum";
import { useContent } from "@/lib/learn/reciter-path/content";
import { useRpT } from "@/lib/learn/reciter-path/texts";
import { useVerse } from "@/lib/learn/reciter-path/useVerse";
import { GoldButton, Option, OutlineButton, Spinner } from "@/components/learn/ui";
import { tone } from "@/components/learn/media";
import { VerseWords } from "./Practice";

export type Question = { kind: "tap"; item: TapItem } | { kind: "mcq"; q: string; options: string[]; answer: number };

/** a stable order of the options (the content lists the right answer first) */
function order(n: number, seed: string) {
  let h = 0; for (const c of seed) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  const idx = Array.from({ length: n }, (_, i) => i);
  for (let i = n - 1; i > 0; i--) { h = (h * 1103515245 + 12345) >>> 0; const j = h % (i + 1); [idx[i], idx[j]] = [idx[j], idx[i]]; }
  return idx;
}

function TapQuestion({ item, picked, setPicked, revealed }: { item: TapItem; picked: number[]; setPicked: (p: number[]) => void; revealed: boolean }) {
  const rt = useRpT();
  const c = useContent();
  const { verse, error } = useVerse(item.key);
  return (
    <div className="grid gap-3">
      <p className="text-[17px] font-bold leading-snug">{rt("tapPrompt", { rule: c.rules[item.rule].name })}</p>
      <p className="text-[13px] text-muted">{item.key}</p>
      {verse ? (
        <VerseWords verse={verse} picked={picked} mark={revealed ? item.answer : undefined}
          onWord={revealed ? undefined : (pos) => setPicked(picked.includes(pos) ? picked.filter((x) => x !== pos) : [...picked, pos])} />
      ) : error ? <p className="text-muted">{rt("offline")}</p> : <Spinner />}
    </div>
  );
}

export function Quiz({ questions, seed, onDone, questionSeconds }: { questions: Question[]; seed: string; onDone: (score: number) => void; questionSeconds?: number }) {
  const rt = useRpT();
  const [i, setI] = useState(0);
  const [picked, setPicked] = useState<number[]>([]);
  const [choice, setChoice] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [right, setRight] = useState(0);
  const q = questions[i];
  const ord = useMemo(() => (q?.kind === "mcq" ? order(q.options.length, `${seed}:${i}`) : []), [q, seed, i]);
  const [left, setLeft] = useState<number | null>(questionSeconds ?? null);
  useEffect(() => {
    if (!questionSeconds || revealed) return;
    setLeft(questionSeconds);
    const end = Date.now() + questionSeconds * 1000;
    const tm = setInterval(() => { const l = Math.max(0, Math.ceil((end - Date.now()) / 1000)); setLeft(l); if (!l) { clearInterval(tm); setChoice(null); setPicked([]); setRevealed(true); } }, 500);
    return () => clearInterval(tm);
  }, [i, revealed, questionSeconds]);
  if (!q) return null;

  const isRight = q.kind === "tap"
    ? picked.length === q.item.answer.length && q.item.answer.every((a) => picked.includes(a))
    : choice === q.answer;
  const check = () => { setRevealed(true); tone(isRight); if (isRight) setRight((r) => r + 1); };
  const next = () => {
    if (i + 1 >= questions.length) { onDone(right / questions.length); return; }
    setI(i + 1); setPicked([]); setChoice(null); setRevealed(false);
  };

  return (
    <div className="grid gap-4">
      <p className="text-[12px] font-semibold tracking-wide text-[rgb(var(--hm-gold-d))] tabular-nums">{`${i + 1} / ${questions.length}${questionSeconds && !revealed && left !== null ? ` · ${left} s` : ""}`}</p>
      {q.kind === "tap" ? <TapQuestion item={q.item} picked={picked} setPicked={setPicked} revealed={revealed} /> : (
        <div className="grid gap-2.5" role="radiogroup" aria-label={q.q}>
          <p className="text-[17px] font-bold leading-snug">{q.q}</p>
          {ord.map((k) => {
            const sel = choice === k, good = revealed && k === q.answer, bad = revealed && sel && k !== q.answer;
            return <Option key={k} disabled={revealed} onClick={() => setChoice(k)} state={good ? "right" : bad ? "wrong" : sel ? "chosen" : revealed ? "dim" : "idle"}>{q.options[k]}</Option>;
          })}
        </div>
      )}
      {revealed && <p aria-live="polite" className={`text-[15px] font-bold ${isRight ? "text-accent" : "text-red-700 dark:text-red-400"}`}>{isRight ? rt("correct") : rt("wrong")}</p>}
      {revealed
        ? <GoldButton onClick={next} className="w-fit">{i + 1 >= questions.length ? rt("finish") : rt("next")}</GoldButton>
        : <OutlineButton onClick={check} className="w-fit" disabled={q.kind === "tap" ? picked.length === 0 : choice === null}>{rt("check")}</OutlineButton>}
    </div>
  );
}
