"use client";
// mirrors mobile/src/features/shams2/Rubric.tsx: the learner's own pronunciation rating after the A/B comparison –
// makhārij, tajweed rules, stopping and starting, pace (1–5 each), saved in rubric.v1 as "self". Labelled as an own
// assessment, never computed from speech recognition; a teacher's rating is shown and takes precedence.
import { useEffect, useState } from "react";
import { RUBRIC_FIELDS, noteRubric, useRubric, type RubricField, type RubricScores } from "@/lib/learn/shams2/store2";
import { useRec } from "@/lib/learn/shams2/rec/text";
import { SmallBtn } from "./ui";

export function Rubric({ verseKey }: { verseKey: string }) {
  const { r, nf } = useRec();
  const all = useRubric();
  const entry = all[verseKey];
  const [scores, setScores] = useState<RubricScores>({});
  const [saved, setSaved] = useState(false);
  useEffect(() => {
    const own = entry?.self;
    setScores(own ? Object.fromEntries(RUBRIC_FIELDS.filter((f) => typeof own[f] === "number").map((f) => [f, own[f]])) : {});
    setSaved(false);
  }, [verseKey]); // eslint-disable-line react-hooks/exhaustive-deps
  const teacher = entry?.teacher;
  const tVals = teacher ? RUBRIC_FIELDS.map((f) => teacher[f]).filter((x): x is number => typeof x === "number") : [];
  const set = (f: RubricField, v: number) => { setScores((s) => ({ ...s, [f]: v })); setSaved(false); };
  return (
    <div className="grid gap-2.5">
      <p className="text-[14px] font-semibold">{r("rbTitle")}</p>
      <p className="text-[13px] leading-relaxed text-muted">{r("rbLead")}</p>
      {tVals.length ? <p className="text-[13px] font-semibold text-accent">{r("rbTeacher", { by: teacher?.by ?? "–", v: nf(Math.round((tVals.reduce((a, b) => a + b, 0) / tVals.length) * 10) / 10) })}</p> : null}
      {RUBRIC_FIELDS.map((f) => (
        <div key={f} className="grid gap-1.5">
          <span className="text-[13px] font-semibold">{r(`rb_${f}` as never)}</span>
          <div role="radiogroup" aria-label={r(`rb_${f}` as never)} className="grid grid-cols-5 gap-1.5">
            {[1, 2, 3, 4, 5].map((v) => (
              <button key={v} type="button" role="radio" aria-checked={scores[f] === v} onClick={() => set(f, v)}
                className={`h-9 rounded-full border text-[13px] font-semibold ${scores[f] === v ? "border-[rgb(var(--hm-gold))] bg-[rgb(var(--hm-gold))]/[0.18] text-[rgb(var(--hm-gold-d))]" : "border-line bg-surface"}`}>{nf(v)}</button>
            ))}
          </div>
        </div>
      ))}
      <p className="text-[12px] text-muted">{r("rbScale")}</p>
      <div className="flex flex-wrap items-center gap-2.5">
        <SmallBtn disabled={!Object.keys(scores).length} onClick={() => { if (noteRubric(verseKey, scores, "self")) setSaved(true); }}>{r("rbSave")}</SmallBtn>
        {saved && <span aria-live="polite" className="text-[13px] font-semibold text-accent">{r("rbSaved")}</span>}
      </div>
    </div>
  );
}
