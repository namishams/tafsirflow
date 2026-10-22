"use client";
import { useEffect, useMemo, useState } from "react";
import { Link } from "@/i18n/navigation";
import { useLang } from "@/lib/learn/i18n";
import { maqasidOf, sectionOf, type L, type LL } from "@/lib/learn/shams2/maqasid";
import { linkKey, noteLink, noteUnderstand, saveFlex, useFlex } from "@/lib/learn/shams2/store2";
import { comprehensionQ, type CompVerse } from "@/lib/shamsFlex";
import { useFlexT } from "@/lib/learn/shamsflex/text";
import type { WordRoot } from "@/lib/learn/wordRoots";

// The pieces of the flexible classic path (Shams 3.0, package 3) for the Shams coach in the Player (src/components/
// Player.tsx): quick check, roots under the words, word loop chips, "what comes next", the short tafsir first, the
// comprehension question, the transition chips and the card for today's verses in one go. Mirrors the app's
// mobile/src/features/shams/FlexParts.tsx. All of them sit on the dark green stage card except ShortTafsir and BlindCard.

type CL = "de" | "en" | "ar";
const useCl = (): CL => { const { lang } = useLang(); return lang === "de" || lang === "ar" ? lang : "en"; };
const pick = (x: L | undefined, cl: CL) => (x ? x[cl] || x.en : "");
const pickL = (x: LL | undefined, cl: CL) => (x ? (x[cl]?.length ? x[cl] : x.en) : []);

const glass = "inline-flex h-11 items-center justify-center gap-2 rounded-full border border-white/25 bg-white/[0.06] px-5 text-sm font-semibold backdrop-blur transition hover:border-white";

/** step 0: "I know this already" – recite from memory, reveal, say honestly whether it sat */
export function QuickCheck({ revealed, placement, saved, onReveal, onPass, onFail }: { revealed: boolean; placement: boolean; saved?: string | null; onReveal: () => void; onPass: () => void; onFail: () => void }) {
  const f = useFlexT();
  return (
    <div className="step-in mt-4 grid gap-3">
      {placement && <p className="text-[13px] font-semibold leading-snug text-[rgb(var(--gold))]">{f("quickPlacement")}</p>}
      <h3 className="font-display text-2xl leading-tight">{f("quickTitle")}</h3>
      <p className="text-[15px] leading-relaxed text-white/75">{f("quickLead")}</p>
      {!revealed ? (
        <div className="flex flex-wrap gap-2">
          <button onClick={onReveal} className="btn-gold h-11 rounded-full px-6 text-sm font-bold">{f("quickReveal")}</button>
          <button onClick={onFail} className={glass}>{f("quickLearn")}</button>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-2">
          <button onClick={onFail} className="h-12 rounded-full border border-red-300/50 bg-red-500/10 text-sm font-bold text-[rgb(236_200_190)] hover:bg-red-500/20">{f("quickFail")}</button>
          <button onClick={onPass} className="btn-gold h-12 rounded-full text-sm font-bold">{f("quickPass")}</button>
        </div>
      )}
      {saved && <p className="text-[13px] text-[rgb(var(--gold))]" role="status">{saved}</p>}
    </div>
  );
}

/** step 2: the word loop chips (×n with a pause) and the hint how to hear a single word */
export function WordLoopBar({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  const f = useFlexT();
  const flex = useFlex();
  const chip = (sel: boolean) => `inline-flex h-9 items-center rounded-full border px-3.5 text-[13px] font-semibold transition ${sel ? "border-transparent bg-[linear-gradient(180deg,#dcc48c,#c6a65e)] text-[rgb(8_38_29)]" : "border-white/20 bg-white/[0.04] text-white/80 hover:border-white/50"}`;
  return (
    <div className="mt-3 grid gap-2">
      <div className="flex flex-wrap items-center gap-2">
        <button onClick={onToggle} aria-pressed={on} className={chip(on)}>{f("wordLoop", { n: flex.wordLoop })}</button>
        {on && [2, 3, 5].map((n) => <button key={n} onClick={() => saveFlex({ wordLoop: n })} aria-pressed={flex.wordLoop === n} className={chip(flex.wordLoop === n)}>×{n}</button>)}
      </div>
      <p className="text-[13px] leading-snug text-white/65">{on ? f("wordLoopOn", { n: flex.wordLoop }) : f("wordTap")}</p>
    </div>
  );
}

/** the root of one word and how often words of that root occur (under the word, step 2) */
export function RootLine({ root }: { root?: WordRoot }) {
  const f = useFlexT();
  if (!root) return null;
  return (
    <span className="mt-1 block border-t border-line/70 pt-1 font-sans text-[11px] leading-tight text-muted" dir="ltr" title={f("rootOf", { r: root.letters })}>
      <span className="font-arabic block text-[15px] leading-normal text-gold" dir="rtl">{root.letters}</span>
      {f("rootCount", { n: root.count })}
    </span>
  );
}
export function RootSource() {
  const f = useFlexT();
  return <p className="mt-2 text-[11px] text-muted">{f("rootSource")}</p>;
}

/** step 3: what comes next (the next verse's meaning) and the core of the passage (maqāṣid takeaway) */
export function NextUp({ surah, verse, next }: { surah: number; verse: number; next?: { verse_number: number; translation?: string | null } }) {
  const f = useFlexT();
  const cl = useCl();
  const take = pick(sectionOf(surah, verse)?.takeaway, cl);
  if (!next?.translation && !take) return null;
  return (
    <div className="mt-1 grid gap-2">
      {next?.translation && (
        <div className="rounded-xl border border-white/10 bg-white/[0.06] p-3">
          <p className="font-semibold text-[rgb(var(--gold))]">{f("nextTitle")}</p>
          <p className="text-xs text-white/60">{f("nextLead", { v: next.verse_number })}</p>
          <p className="mt-1.5 text-[14.5px] leading-relaxed text-white">{next.translation}</p>
        </div>
      )}
      {take && (
        <div className="rounded-xl border border-[rgb(var(--gold))]/30 bg-[rgb(var(--gold))]/10 p-3">
          <p className="font-semibold text-[rgb(var(--gold))]">{f("takeaway")}</p>
          <p className="mt-1 text-[14.5px] leading-relaxed text-white">{take}</p>
        </div>
      )}
    </div>
  );
}

/** does this verse have a short version of the tafsir (a maqāṣid section)? */
export const hasShortTafsir = (surah: number, verse: number) => !!sectionOf(surah, verse) && !!maqasidOf(surah);

/** step 4: the short version first – what the passage is about – then the detailed tafsir on request (on the stage) */
export function ShortTafsir({ surah, verse, onFull }: { surah: number; verse: number; onFull: () => void }) {
  const f = useFlexT();
  const cl = useCl();
  const sec = sectionOf(surah, verse);
  const m = maqasidOf(surah);
  if (!sec || !m) return null;
  const lessons = pickL(sec.lessons, cl).slice(0, 3);
  const take = pick(sec.takeaway, cl);
  return (
    <div className="step-in mt-4 grid gap-2.5 rounded-xl border border-white/10 bg-white/[0.05] p-4">
      <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[rgb(var(--gold))] rtl:tracking-normal">{f("shortTitle")}</p>
      <p className="font-semibold text-white">{pick(sec.title, cl)}</p>
      {lessons.length ? <ul className="grid gap-1 text-[14.5px] leading-relaxed text-white/80">{lessons.map((x, i) => <li key={i} className="flex gap-2"><span className="text-[rgb(var(--gold))]">•</span><span>{x}</span></li>)}</ul>
        : <p className="text-[14.5px] leading-relaxed text-white/80">{pick(m.theme, cl)}</p>}
      {take && <p className="rounded-lg bg-[rgb(var(--gold))]/10 p-2.5 text-sm font-semibold text-[rgb(233_207_153)]">{f("takeaway")}: {take}</p>}
      <p className="text-xs text-white/55">{f("draft")}</p>
      <div className="flex flex-wrap items-center gap-3">
        <button onClick={onFull} className={glass}>{f("readFull")}</button>
        <label className="inline-flex cursor-pointer items-center gap-2 text-[13px] text-white/70">
          <input type="checkbox" checked={false} onChange={() => saveFlex({ tafsir: "full" })} className="h-4 w-4 accent-[rgb(201_166_94)]" />{f("alwaysFull")}
        </label>
      </div>
    </div>
  );
}

/** the "always full" switch next to the detailed tafsir (to go back to the short version first) */
export function AlwaysFullSwitch({ className = "" }: { className?: string }) {
  const f = useFlexT();
  const flex = useFlex();
  const on = flex.tafsir === "full";
  return (
    <label className={`inline-flex cursor-pointer items-center gap-2 text-[13px] text-muted ${className}`}>
      <input type="checkbox" checked={on} onChange={() => saveFlex({ tafsir: on ? "short" : "full" })} className="h-4 w-4 accent-[rgb(201_166_94)]" />{f("alwaysFull")}
    </label>
  );
}

/** step 6: which meaning belongs to this verse (its own translation among its neighbours') -> qmc.shams2.understand.v1 */
export function Comprehension({ verses, idx }: { verses: CompVerse[]; idx: number }) {
  const f = useFlexT();
  const q = useMemo(() => comprehensionQ(verses, idx), [verses, idx]);
  const [picked, setPicked] = useState<number | null>(null);
  useEffect(() => setPicked(null), [idx]);
  if (!q) return null;
  return (
    <div className="mt-3 grid gap-2">
      <p className="font-semibold text-white">{f("compQ")}</p>
      {q.options.map((o, i) => {
        const right = picked !== null && i === q.answer, wrong = picked === i && i !== q.answer;
        return (
          <button key={o.key} disabled={picked !== null} onClick={() => { setPicked(i); noteUnderstand(q.key, i === q.answer); }}
            className={`rounded-2xl border p-3 text-start text-[14.5px] leading-relaxed transition ${right ? "border-[rgb(var(--gold))] bg-[rgb(var(--gold))]/15 text-white" : wrong ? "border-red-300/60 bg-red-500/10 text-white/80" : "border-white/15 bg-white/[0.05] text-white/80 hover:border-white/40"}`}>
            {o.text}
          </button>
        );
      })}
      {picked !== null && <p role="status" className={`text-sm font-semibold ${picked === q.answer ? "text-[rgb(var(--gold))]" : "text-[rgb(236_200_190)]"}`}>{picked === q.answer ? f("compRight") : f("compWrong")}</p>}
    </div>
  );
}

/** step 7: how the transition from the previous verse went -> qmc.shams2.links.v1 */
export function LinkChips({ surah, verse }: { surah: number; verse: number }) {
  const f = useFlexT();
  const [done, setDone] = useState<boolean | null>(null);
  useEffect(() => setDone(null), [surah, verse]);
  const mark = (ok: boolean) => { if (done !== null) return; setDone(ok); noteLink(linkKey(surah, verse), ok); };
  const chip = (sel: boolean) => `inline-flex h-10 items-center rounded-full border px-4 text-sm font-semibold transition disabled:opacity-45 ${sel ? "border-transparent bg-[linear-gradient(180deg,#dcc48c,#c6a65e)] text-[rgb(8_38_29)]" : "border-white/20 bg-white/[0.04] text-white/85 hover:border-white/50"}`;
  return (
    <div className="mt-3 grid gap-2">
      <p className="text-sm font-semibold text-white">{f("linkQ")}</p>
      <div className="flex flex-wrap gap-2">
        <button className={chip(done === true)} disabled={done === false} onClick={() => mark(true)}>{f("linkOk")}</button>
        <button className={chip(done === false)} disabled={done === true} onClick={() => mark(false)}>{f("linkMiss")}</button>
      </div>
      {done !== null && <p role="status" className="text-[13px] text-[rgb(var(--gold))]">{f("linkSaved")}</p>}
    </div>
  );
}

/** the end card: today's verses in one go, from memory (blind recitation of the range learned in this sitting) */
export function BlindCard({ s, from, to, onStage = false }: { s: number; from: number; to: number; onStage?: boolean }) {
  const f = useFlexT();
  return (
    <div className={onStage ? "mt-4 rounded-xl border border-[rgb(var(--gold))]/30 bg-white/[0.05] p-4" : "verse-frame mt-4 rounded-2xl border border-[rgb(var(--gold))]/35 bg-surface p-5"}>
      <p className={`font-semibold ${onStage ? "text-white" : "text-ink"}`}>{f("blindTitle")}</p>
      <p className={`mt-1 text-sm leading-relaxed ${onStage ? "text-white/70" : "text-muted"}`}>{from === to ? f("blindLeadOne", { a: from }) : f("blindLead", { a: from, b: to })}</p>
      <Link href={`/shams/blind?s=${s}&from=${from}&to=${to}`} className={onStage ? `${glass} mt-3` : "mt-3 inline-flex h-11 items-center rounded-full border border-[rgb(201_166_94)]/60 bg-surface px-5 text-sm font-bold text-ink transition hover:bg-[rgb(201_166_94)]/10"}>{f("blindGo")}</Link>
    </div>
  );
}
