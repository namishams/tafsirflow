"use client";
import { useEffect, useRef, useState } from "react";
import { useLocale } from "next-intl";
import { RECITERS, getResources, getVerses, pickTranslation, type Verse } from "@/lib/quran";
import { noteMistake } from "@/lib/learning";
import { fill, journeyText } from "@/lib/journey";

// "Which verse comes next?" – a short quiz on the verses of one surah you have already learned (opened from the
// surah panel of the Quran map). You see the end of a learned verse and pick the beginning of the verse that follows.
type Q = { v: number; prompt: string; cut: boolean; options: { v: number; text: string }[]; answer: number };

const shuffle = <T,>(a: T[]) => { const b = [...a]; for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b; };
const words = (t: string) => t.trim().split(/\s+/).filter(Boolean);
const head = (t: string, n = 7) => { const w = words(t); return w.length > n ? `${w.slice(0, n).join(" ")} …` : w.join(" "); };

function build(all: Verse[], learned: number[], count = 5): Q[] {
  const byNum = new Map(all.map((v) => [v.verse_number, v]));
  const cands = shuffle(learned.filter((v) => byNum.has(v) && byNum.has(v + 1))).slice(0, count);
  const out: Q[] = [];
  for (const v of cands) {
    const cur = byNum.get(v)!, nxt = byNum.get(v + 1)!;
    const correct = head(nxt.text_uthmani);
    // distractors: preferably verses close by (they sound alike), never the right one or one with the same opening
    const near = shuffle(all.filter((x) => x.verse_number !== v + 1 && x.verse_number !== v && Math.abs(x.verse_number - (v + 1)) <= 5));
    const far = shuffle(all.filter((x) => x.verse_number !== v + 1 && x.verse_number !== v && Math.abs(x.verse_number - (v + 1)) > 5));
    const seen = new Set([correct]);
    const opts: { v: number; text: string }[] = [{ v: v + 1, text: correct }];
    for (const x of [...near, ...far, cur]) {
      if (opts.length >= 3) break;
      const t = head(x.text_uthmani);
      if (seen.has(t)) continue;
      seen.add(t); opts.push({ v: x.verse_number, text: t });
    }
    if (opts.length < 2) continue;
    const w = words(cur.text_uthmani);
    const options = shuffle(opts);
    out.push({ v, prompt: w.slice(-10).join(" "), cut: w.length > 10, options, answer: options.findIndex((o) => o.v === v + 1) });
  }
  return out;
}

export default function SurahQuiz({ surah, learned, dark = false, onClose }: { surah: number; learned: number[]; dark?: boolean; onClose: () => void }) {
  const locale = useLocale();
  const T = journeyText(locale).quiz;
  const nf = (n: number) => new Intl.NumberFormat(locale, { numberingSystem: "latn" }).format(n);
  const [all, setAll] = useState<Verse[] | null>(null);
  const [failed, setFailed] = useState(false);
  const [round, setRound] = useState(0);
  const [i, setI] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [right, setRight] = useState(0);

  useEffect(() => {
    let off = false;
    getResources().then((r) => pickTranslation(locale, r.translations)).catch(() => 20)
      .then((tid) => getVerses(surah, locale, RECITERS[0], tid))
      .then((v) => { if (!off) setAll(v); })
      .catch(() => { if (!off) setFailed(true); });
    return () => { off = true; };
  }, [surah, locale]);

  // questions are drawn once per round, so a refresh of the map behind the quiz never reshuffles them mid-way
  const learnedRef = useRef(learned);
  learnedRef.current = learned;
  const [built, setBuilt] = useState<Q[] | null>(null);
  useEffect(() => { if (all) setBuilt(build(all, learnedRef.current)); }, [all, round]);
  const qs = built ?? [];
  const q = qs[i];
  const doneAll = qs.length > 0 && i >= qs.length;

  const choose = (n: number) => {
    if (picked !== null || !q) return;
    setPicked(n);
    if (n === q.answer) setRight((x) => x + 1);
    else if (learned.includes(q.v + 1)) noteMistake(`${surah}:${q.v + 1}`); // a slip in a test makes the verse come back sooner
  };
  const again = () => { setRound((r) => r + 1); setI(0); setPicked(null); setRight(0); };

  const box = dark ? "border-white/10 bg-[rgb(var(--stage))]/60" : "border-line bg-bg";
  const sub = dark ? "text-white/60" : "text-muted";
  const optBase = "w-full rounded-md border px-4 py-3 text-start transition";
  const optCls = (n: number) => {
    if (picked === null) return `${optBase} ${dark ? "border-white/15 hover:border-white/50" : "border-line bg-surface hover:border-ink"}`;
    if (n === q.answer) return `${optBase} border-accent bg-accent/15`;
    if (n === picked) return `${optBase} border-red-500/80 bg-red-500/10`;
    return `${optBase} ${dark ? "border-white/10" : "border-line"} opacity-50`;
  };

  return (
    <div className={`mt-4 rounded-lg border p-4 sm:p-5 ${box}`}>
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[rgb(var(--gold))] rtl:tracking-normal">{T.title}</p>
          {q && !doneAll && <p className={`mt-1 text-xs ${sub}`}>{fill(T.of, { i: nf(i + 1), n: nf(qs.length) })}</p>}
        </div>
        <button onClick={onClose} className={`-me-2 -mt-1 shrink-0 rounded-md px-2 py-1 text-xs font-semibold ${dark ? "text-white/60 hover:text-white" : "text-muted hover:text-ink"}`}>{T.close}</button>
      </div>

      {failed && <p className={`mt-3 text-sm ${sub}`}>{T.error}</p>}
      {!failed && !built && <p className={`mt-3 animate-pulse text-sm ${sub}`}>{T.loading}</p>}

      {q && !doneAll && (
        <div key={`${round}-${i}`} className="step-in">
          {i === 0 && picked === null && <p className={`mt-2 text-sm leading-relaxed ${sub}`}>{T.lead}</p>}
          <p className="mt-3 rounded-md border border-[rgb(var(--gold))]/25 bg-[rgb(var(--gold))]/[0.06] px-4 py-3 font-arabic text-[22px] leading-[2.1] [overflow-wrap:anywhere]" dir="rtl" lang="ar">{q.cut ? "… " : ""}{q.prompt} <span className="verse-end">﴿{nf(q.v)}﴾</span></p>
          <p className={`mt-3 text-sm font-semibold ${dark ? "text-white/80" : ""}`}>{fill(T.prompt, { v: nf(q.v) })}</p>
          <ul className="mt-2 grid gap-2">
            {q.options.map((o, n) => (
              <li key={n}><button onClick={() => choose(n)} disabled={picked !== null} className={optCls(n)}><span className="block font-arabic text-xl leading-loose [overflow-wrap:anywhere]" dir="rtl" lang="ar">{o.text}</span></button></li>
            ))}
          </ul>
          {picked !== null && (
            <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
              <p className={`text-sm font-semibold ${picked === q.answer ? "text-accent" : dark ? "text-red-300" : "text-red-600"}`} role="status">
                {picked === q.answer ? T.right : fill(learned.includes(q.v + 1) ? T.wrongNote : T.wrong, { v: nf(q.v + 1) })}
              </p>
              <button onClick={() => { setI(i + 1); setPicked(null); }} className="btn-gold inline-flex h-10 items-center rounded-md px-5 text-sm font-bold">{i + 1 >= qs.length ? T.finish : T.next}</button>
            </div>
          )}
        </div>
      )}

      {doneAll && qs.length > 0 && (
        <div className="step-in mt-3">
          <p className="font-display text-2xl">{fill(T.result, { c: nf(right), n: nf(qs.length) })}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <button onClick={again} className="btn-gold inline-flex h-10 items-center rounded-md px-5 text-sm font-bold">{T.again}</button>
            <button onClick={onClose} className={`inline-flex h-10 items-center rounded-md border px-5 text-sm font-bold ${dark ? "border-white/25 hover:border-white" : "border-line hover:border-ink"}`}>{T.close}</button>
          </div>
        </div>
      )}
      {built && built.length === 0 && <p className={`mt-3 text-sm ${sub}`}>{T.error}</p>}
    </div>
  );
}
