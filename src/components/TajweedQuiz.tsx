"use client";
import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { tajweedFor } from "@/lib/tajweed";
import { readJSON, writeJSON } from "@/lib/storage";
import { award } from "@/lib/points";
import { PracticeCelebrate, PracticeMedallion } from "./art/PracticeArt";

export default function TajweedQuiz({ id }: { id: string }) {
  const t = useTranslations("tajweed");
  const locale = useLocale();
  const de = locale === "de";
  const l = tajweedFor(locale).find((x) => x.id === id)!; // Arabic: the *_en fields carry the Arabic texts
  const [i, setI] = useState(0);
  const [pick, setPick] = useState<number | null>(null);
  const [ok, setOk] = useState(0);
  const q = l.quiz[i];
  const done = i >= l.quiz.length;
  const next = () => {
    const right = ok + (pick === q.answer ? 1 : 0);
    setOk(right); setPick(null); setI(i + 1);
    if (i + 1 >= l.quiz.length) { const r = readJSON<Record<string, number>>("tf:tajweed", {}); r[id] = Math.max(r[id] ?? 0, Math.round((right / l.quiz.length) * 100)); writeJSON("tf:tajweed", r); award("quiz"); }
  };
  if (done) {
    const pct = l.quiz.length ? ok / l.quiz.length : 0;
    return (
      <div className="pa-card relative mt-5 overflow-hidden p-6 pt-8 text-center">
        {pct >= 0.7 && <PracticeCelebrate />}
        <PracticeMedallion pct={pct} size={132} uid={`tq-${id}`} className="pa-medal-in mx-auto" turn={pct >= 0.7}>
          <span className="font-display text-[26px] leading-none tabular-nums" dir="ltr">{ok}<span className="text-[15px] text-[#f3e2b6]/60">/{l.quiz.length}</span></span>
        </PracticeMedallion>
        <p className="relative mt-4 text-lg font-bold">{t("result", { ok, n: l.quiz.length })}</p>
        <button onClick={() => { setI(0); setOk(0); setPick(null); }} className="relative mt-4 h-11 rounded-full border border-line px-5 text-sm font-bold hover:border-[rgb(201_166_94)]">{t("again")}</button>
      </div>
    );
  }
  const opts = de ? q.options_de : q.options_en;
  return (
    <div className="pa-card mt-5 p-5 pt-6 sm:p-6">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-semibold text-muted">{t("qN", { n: i + 1, total: l.quiz.length })}</p>
        <span className="flex gap-1" aria-hidden>{l.quiz.map((_, k) => <span key={k} className={`h-1.5 rounded-full transition-all ${k < i ? "w-4 bg-[rgb(201_166_94)]" : k === i ? "w-6 bg-gradient-to-r from-[#c6a65e] to-[#ecd7a2]" : "w-4 bg-line"}`} />)}</span>
      </div>
      <p key={i} className="step-in mt-3 text-[17px] font-bold leading-snug">{de ? q.q_de : q.q_en}</p>
      <div className="mt-4 grid gap-2.5">
        {opts.map((o, n) => {
          const cls = pick === null ? "border-line bg-surface hover:border-[rgb(201_166_94)]/60" : n === q.answer ? "pa-right border-[rgb(201_166_94)] bg-[rgb(201_166_94)]/15" : n === pick ? "pa-shake border-[rgb(190_84_104)] bg-[rgb(190_84_104)]/10" : "border-line opacity-60";
          return <button key={n} disabled={pick !== null} onClick={() => setPick(n)} className={`rounded-xl border-2 p-3.5 text-start transition ${cls}`}>{o}</button>;
        })}
      </div>
      {pick !== null && (
        <div className={`step-in mt-4 rounded-xl border p-4 ${pick === q.answer ? "border-[rgb(201_166_94)]/45 bg-[rgb(201_166_94)]/10" : "border-[rgb(190_84_104)]/30 bg-[rgb(190_84_104)]/[0.07]"}`}>
          <p className="text-[15px] leading-relaxed text-ink/85">{de ? q.explain_de : q.explain_en}</p>
          <button onClick={next} className={`mt-3 h-11 rounded-full px-6 text-sm font-bold ${pick === q.answer ? "btn-gold" : "bg-ink text-bg"}`}>{t("next")}</button>
        </div>
      )}
    </div>
  );
}
