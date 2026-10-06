"use client";
import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { TAJWEED_LESSONS } from "@/lib/tajweed";
import { readJSON, writeJSON } from "@/lib/storage";

export default function TajweedQuiz({ id }: { id: string }) {
  const t = useTranslations("tajweed");
  const de = useLocale() === "de";
  const l = TAJWEED_LESSONS.find((x) => x.id === id)!;
  const [i, setI] = useState(0);
  const [pick, setPick] = useState<number | null>(null);
  const [ok, setOk] = useState(0);
  const q = l.quiz[i];
  const done = i >= l.quiz.length;
  const next = () => {
    const right = ok + (pick === q.answer ? 1 : 0);
    setOk(right); setPick(null); setI(i + 1);
    if (i + 1 >= l.quiz.length) { const r = readJSON<Record<string, number>>("tf:tajweed", {}); r[id] = Math.max(r[id] ?? 0, Math.round((right / l.quiz.length) * 100)); writeJSON("tf:tajweed", r, true); }
  };
  if (done) return (
    <div className="mt-4 rounded-lg border border-line bg-surface p-6 text-center">
      <p className="text-lg font-bold">{t("result", { ok, n: l.quiz.length })}</p>
      <button onClick={() => { setI(0); setOk(0); setPick(null); }} className="mt-4 h-11 rounded-md border border-line px-5 text-sm font-bold hover:border-ink">{t("again")}</button>
    </div>
  );
  const opts = de ? q.options_de : q.options_en;
  return (
    <div className="mt-4 rounded-lg border border-line bg-surface p-5">
      <p className="text-sm font-semibold text-muted">{t("qN", { n: i + 1, total: l.quiz.length })}</p>
      <p className="mt-2 text-[17px] font-bold">{de ? q.q_de : q.q_en}</p>
      <div className="mt-4 grid gap-2">
        {opts.map((o, n) => {
          const cls = pick === null ? "border-line hover:border-ink" : n === q.answer ? "border-accent bg-accent-soft" : n === pick ? "border-red-500" : "border-line opacity-60";
          return <button key={n} disabled={pick !== null} onClick={() => setPick(n)} className={`rounded-md border p-3 text-start ${cls}`}>{o}</button>;
        })}
      </div>
      {pick !== null && (
        <div className="mt-4">
          <p className="text-[15px] text-muted">{de ? q.explain_de : q.explain_en}</p>
          <button onClick={next} className="mt-3 h-11 rounded-md bg-ink px-5 text-sm font-bold text-bg">{t("next")}</button>
        </div>
      )}
    </div>
  );
}
