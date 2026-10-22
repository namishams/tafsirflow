"use client";
// Shared pieces of the course pages: the multiple-choice quiz (mirrors Quiz in mobile/src/features/courses/Screens.tsx),
// perspective tags, hadith reference labels and the simple course badge that stands in for the app's course sticker.
import { useEffect, useRef, useState, type ReactNode } from "react";
import QuranVerse from "@/components/learn/QuranVerse";
import { Bar, GoldButton, Kicker, Option, Pill } from "@/components/learn/ui";
import { StarGlyph } from "@/components/art/HomeOrnaments";
import { useCT } from "@/lib/learn/courses/texts";
import type { Tag } from "@/lib/learn/courses/types";
import AskTutor from "@/components/tutor/AskTutor";
import type { TutorContext } from "@/components/tutor/state";

export type RunQ = { q: string; options: string[]; answer: number; explain?: string; verse?: string; /** the question is an Arabic word */ qAr?: boolean };
export const shuffle = <T,>(a: T[]) => { const b = [...a]; for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b; };

const HADITH_NAMES: Record<string, string> = { bukhari: "al-Bukhari", muslim: "Muslim", tirmidhi: "at-Tirmidhi", abudawud: "Abu Dawud", nasai: "an-Nasa'i", ibnmajah: "Ibn Majah", ahmad: "Ahmad", malik: "Malik, al-Muwatta'", darimi: "ad-Darimi" };
export const hadithLabel = (ref: string) => { const [col, n] = ref.split(":"); return `${HADITH_NAMES[col] ?? col} ${n ?? ""}`.trim(); };

export function TagChips({ tags }: { tags?: Tag[] }) {
  const c = useCT();
  if (!tags?.length) return null;
  return (
    <div>
      <Kicker>{c("tagsTitle")}</Kicker>
      <ul className="mt-2 flex flex-wrap gap-1.5">
        {tags.map((g) => <li key={g}><Pill>{c(`tag_${g}` as never)}</Pill></li>)}
      </ul>
    </div>
  );
}

/** a round gold seal with the course's calligraphic word: the web's simple form of the app's course sticker */
export function CourseBadge({ word, size = 56, label, muted = false }: { word: string; size?: number; label?: string; muted?: boolean }) {
  return (
    <span role={label ? "img" : undefined} aria-label={label} aria-hidden={label ? undefined : true}
      className={`relative inline-grid shrink-0 place-items-center overflow-hidden rounded-full border-2 ${muted ? "border-line bg-surface text-muted" : "border-[rgb(var(--hm-gold))] bg-[rgb(var(--hm-gold))]/10 text-[rgb(var(--hm-gold-d))]"}`}
      style={{ width: size, height: size }}>
      <StarGlyph size={Math.round(size * 0.9)} className="absolute opacity-30" />
      <span lang="ar" dir="rtl" className="font-callig relative max-w-[86%] truncate leading-none" style={{ fontSize: Math.max(10, size * 0.22) }}>{word}</span>
    </span>
  );
}

/** multiple-choice quiz; one pick per question, feedback with explanation, then "Continue" */
export function Quiz({ qs, onDone, header, ctx }: { qs: RunQ[]; onDone: (right: number) => void; header?: ReactNode; /** tutor context: "Why is this wrong?" after a wrong answer */ ctx?: TutorContext }) {
  const c = useCT();
  const [i, setI] = useState(0);
  const [pick, setPick] = useState<number | null>(null);
  const [right, setRight] = useState(0);
  const head = useRef<HTMLHeadingElement>(null);
  const first = useRef(true);
  useEffect(() => { if (first.current) { first.current = false; return; } head.current?.focus(); }, [i]);
  const q = qs[i];
  if (!q) return null;
  const choose = (k: number) => {
    if (pick !== null) return;
    setPick(k);
    if (k === q.answer) setRight((r) => r + 1);
  };
  const next = () => {
    if (i + 1 >= qs.length) { onDone(right); return; }
    setI(i + 1); setPick(null);
  };
  const ok = pick === q.answer;
  return (
    <div className="space-y-4">
      {header}
      <p className="hm-k text-[rgb(var(--hm-gold-d))]">{c("question", { n: i + 1, m: qs.length })}</p>
      <Bar value={i / qs.length} gold label={c("question", { n: i + 1, m: qs.length })} />
      {q.verse && <QuranVerse verseKey={q.verse} size="text-[24px] sm:text-[28px]" />}
      {q.qAr
        ? <h2 ref={head} tabIndex={-1} lang="ar" dir="rtl" className="font-arabic text-center text-[40px] leading-[1.8] outline-none">{q.q}</h2>
        : <h2 ref={head} tabIndex={-1} className="font-display text-[22px] leading-snug outline-none sm:text-2xl" dir="auto">{q.q}</h2>}
      <div className="grid gap-2.5">
        {q.options.map((o, k) => (
          <Option key={k} dir="auto" onClick={() => choose(k)} disabled={pick !== null}
            state={pick === null ? "idle" : k === q.answer ? "right" : pick === k ? "wrong" : "dim"}>{o}</Option>
        ))}
      </div>
      <div aria-live="polite">
        {pick !== null && (
          <div className="space-y-3">
            <p className={`text-[15px] font-bold ${ok ? "text-accent" : "text-red-700 dark:text-red-400"}`}>{ok ? c("right") : `${c("wrong")}: ${q.options[q.answer]}`}</p>
            {q.explain && <p className="text-[14.5px] leading-relaxed text-muted">{q.explain}</p>}
            {ctx && !ok && <AskTutor kind="why" context={{ ...ctx, question: q.q, chosen: q.options[pick], correct: q.options[q.answer], explain: q.explain }} />}
          </div>
        )}
      </div>
      {pick !== null && <GoldButton onClick={next} className="w-full sm:w-auto">{c("next")}</GoldButton>}
    </div>
  );
}
