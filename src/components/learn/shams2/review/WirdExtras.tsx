"use client";
// mirrors mobile/src/features/shams2/review/WirdExtras.tsx – Shams 3.0 additions to the wird (/shams/wird): today's
// minutes (only for this day), the verse strip of a review range (rate single verses and the transitions between them)
// and the tathbīt block (the learner's own weak points, at most 15 % of the day).
import { Fragment, useState } from "react";
import type { Rating4 } from "@/lib/learning";
import type { useShams2 } from "@/lib/learn/shams2/model";
import type { Range, Tathbit, TathbitItem } from "@/lib/learn/shams2/plan";
import { markToday, noteLink, rateVerseToday, setTodayMinutes } from "@/lib/learn/shams2/store2";
import { MUT_GROUPS } from "@/lib/learn/shams2/mutData";
import { useS2 } from "@/lib/learn/shams2/text";
import { useRv } from "@/lib/learn/shams2/review/text";
import { Card } from "@/components/learn/ui";
import { Chip, SmallBtn, Term, useNames } from "../ui";

type Model = ReturnType<typeof useShams2>;
export const TODAY_CHOICES = [10, 15, 20, 30, 45, 60] as const;
type Mark = "fluent" | "hesitant" | "weak";
/** ids of the verse strip's marks in the day log (rateRange): a verse "2:5", the transition into it ">2:5" */
export const verseMarkId = (key: string) => key;
export const gapMarkId = (key: string) => `>${key}`;
const GRADE: Record<Mark, Rating4> = { fluent: 3, hesitant: 2, weak: 1 };
const toneCls = (x: string | undefined) => (x === "fluent" ? "border-accent bg-accent-soft text-accent" : x === "hesitant" ? "border-[rgb(var(--hm-gold))] bg-[rgb(var(--hm-gold))]/[0.16] text-[rgb(var(--hm-gold-d))]" : x === "weak" ? "border-[rgb(160,58,52)] bg-[rgb(160,58,52)]/[0.12] text-[rgb(160,58,52)] dark:text-[rgb(214,120,110)]" : "border-line bg-surface");

/** today's minutes: chips for this day only, "as set" goes back to the daily minutes of the settings */
export function TodayMinutes({ m }: { m: Model }) {
  const rv = useRv();
  const { nf } = useS2();
  return (
    <Card className="grid gap-3">
      <h2 className="text-[17px] font-bold">{rv("todayTitle")}</h2>
      <div className="flex flex-wrap gap-1.5">
        {TODAY_CHOICES.map((n) => <Chip key={n} label={rv("todayMin", { n: nf(n) })} on={m.todayMin === n} onClick={() => setTodayMinutes(n)} />)}
        <Chip label={rv("todayAsSet")} on={!m.todayMin} onClick={() => setTodayMinutes(null)} />
      </div>
      {m.todayMin ? <p className="text-[13px] leading-relaxed text-muted">{rv("todayNote", { n: nf(m.wird.usual) })}</p> : null}
    </Card>
  );
}

/** a review range verse by verse: a verse (held / hesitated / shaky -> FSRS 3 / 2 / 1) or the line between two verses
 *  (the transition held or stalled -> links.v1) */
export function VerseStrip({ r, known, marks }: { r: Range; known: Model["known"]; marks: Record<string, string> }) {
  const rv = useRv();
  const { nf } = useS2();
  const [sel, setSel] = useState<{ gap: boolean; key: string } | null>(null);
  const verses = Array.from({ length: r.to - r.from + 1 }, (_, i) => r.from + i);
  // once per mark and day (markToday): the same chip again does nothing; a changed mark replaces today's rating
  const markVerse = (key: string, g: Mark) => { markToday(verseMarkId(key), g, () => { if (known.has(key)) rateVerseToday(key, GRADE[g]); }); setSel(null); };
  const markGap = (key: string, ok: boolean) => { markGapToday(key, ok); setSel(null); };
  const vOf = (k: string) => Number(k.split(":")[1]);
  return (
    <div className="grid gap-2">
      <p className="text-[12.5px] leading-relaxed text-muted">{rv("stripHint")}</p>
      <div className="flex flex-wrap items-center gap-y-2">
        {verses.map((v) => {
          const key = `${r.s}:${v}`;
          const vm = marks[verseMarkId(key)], gm = marks[gapMarkId(key)];
          const onV = sel?.key === key && !sel.gap, onG = sel?.key === key && sel.gap;
          return (
            <Fragment key={v}>
              {v > r.from && (
                <button type="button" onClick={() => setSel(onG ? null : { gap: true, key })} aria-pressed={onG}
                  aria-label={`${rv("gapLabel", { a: nf(v - 1), b: nf(v) })}${gm ? `, ${rv(gm === "fluent" ? "gapOk" : "gapMiss")}` : ""}`}
                  className="grid h-9 w-4 place-items-center">
                  <span className={`block h-5 rounded-full ${onG ? "w-1 bg-[rgb(var(--hm-gold))]" : gm === "fluent" ? "w-[3px] bg-accent" : gm === "weak" ? "w-[3px] bg-[rgb(160,58,52)]" : "w-[3px] bg-[rgb(var(--line))]"}`} />
                </button>
              )}
              <button type="button" onClick={() => setSel(onV ? null : { gap: false, key })} aria-pressed={onV}
                aria-label={`${rv("verseLabel", { v: nf(v) })}${vm ? `, ${rv(vm === "fluent" ? "v_ok" : vm === "hesitant" ? "v_hesitant" : "v_weak")}` : ""}`}
                className={`inline-grid h-9 min-w-[38px] place-items-center rounded-full border px-2 text-[13px] font-semibold tabular-nums transition ${toneCls(vm)} ${onV ? "outline outline-2 outline-[rgb(var(--hm-gold))]" : ""}`}>
                {nf(v)}
              </button>
            </Fragment>
          );
        })}
      </div>
      {sel && (
        <div className="grid gap-2 rounded-xl bg-accent-soft p-3">
          <p className="text-[13.5px] font-semibold">{sel.gap ? rv("gapLabel", { a: nf(vOf(sel.key) - 1), b: nf(vOf(sel.key)) }) : rv("verseLabel", { v: nf(vOf(sel.key)) })}</p>
          <div className="flex flex-wrap gap-1.5">
            {sel.gap ? (
              <>
                <Chip label={rv("gapOk")} on={marks[gapMarkId(sel.key)] === "fluent"} onClick={() => markGap(sel.key, true)} />
                <Chip label={rv("gapMiss")} on={marks[gapMarkId(sel.key)] === "weak"} onClick={() => markGap(sel.key, false)} />
              </>
            ) : (["fluent", "hesitant", "weak"] as const).map((g) => (
              <Chip key={g} label={rv(g === "fluent" ? "v_ok" : g === "hesitant" ? "v_hesitant" : "v_weak")} on={marks[verseMarkId(sel.key)] === g} onClick={() => markVerse(sel.key, g)} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/** a transition marked held or stalled in the wird, once per day (noteLinks counts one result per transition and day) */
const markGapToday = (key: string, ok: boolean) => markToday(gapMarkId(key), ok ? "fluent" : "weak", () => noteLink(key, ok));

/** the strip behind a toggle, so long manzil portions stay compact */
export function StripToggle(p: { r: Range; known: Model["known"]; marks: Record<string, string> }) {
  const rv = useRv();
  const [open, setOpen] = useState(false);
  return (
    <div className="grid gap-2">
      <div><Chip label={rv(open ? "stripHide" : "stripShow")} on={open} onClick={() => setOpen(!open)} /></div>
      {open && <VerseStrip {...p} />}
    </div>
  );
}

function ItemRow({ x, marks }: { x: TathbitItem; marks: Record<string, string> }) {
  const rv = useRv();
  const { cl, nf } = useS2();
  const { name } = useNames();
  const ref = (k: string) => { const [a, b] = k.split(":"); return `${name(Number(a))} ${nf(Number(b))}`; };
  let title: string, sub: string, href: string;
  if (x.t === "spot") {
    const [a, b] = x.key.split(":");
    title = ref(x.key);
    // a verse confused with a similar one (and no weak words): its own label, practised among the mutashābihāt
    const mut = !x.words.length && x.reason.includes("mutashabih");
    const g = mut ? MUT_GROUPS.find((y) => y.keys.includes(x.key)) : undefined;
    sub = x.words.length ? rv("t_spot", { n: nf(x.words.length) }) : mut ? rv("t_mutSpot") : x.reason.includes("lapses") ? rv("t_lapses") : rv("t_fading");
    href = mut ? (g ? `/shams/mutashabihat?g=${encodeURIComponent(g.id)}` : "/shams/mutashabihat") : `/shams/talaqqi?s=${a}&v=${b}`;
  } else if (x.t === "link") {
    const [a, b] = x.key.split(":").map(Number);
    title = `${name(a)} · ${rv("t_link", { a: nf(b - 1), b: nf(b) })}`;
    sub = x.weak ? rv("why_transition") : "";
    href = `/shams/talaqqi?s=${a}&v=${b - 1}&to=${b}`;
  } else {
    const g = MUT_GROUPS.find((y) => y.id === x.id);
    title = g ? (g.topic[cl] || g.topic.en) : rv("t_mut");
    sub = `${rv("t_mut")} · ${x.keys.map(ref).join(" · ")}`;
    href = `/shams/mutashabihat?g=${encodeURIComponent(x.id)}`;
  }
  const gm = x.t === "link" ? marks[gapMarkId(x.key)] : undefined;
  return (
    <li className="grid gap-2 py-3">
      <div className="flex items-center gap-3">
        <span aria-hidden className={`grid h-7 w-7 shrink-0 place-items-center rounded-full text-[13px] ${x.t === "mut" ? "bg-[rgb(var(--hm-gold))]/[0.16] text-[rgb(var(--hm-gold-d))]" : "bg-accent-soft text-accent"}`}>{x.t === "spot" ? "◉" : x.t === "link" ? "↔" : "≈"}</span>
        <span className="grid min-w-0 flex-1 gap-0.5">
          <span className="text-[15px] font-semibold">{title}</span>
          {sub && <span className="text-[13px] text-muted">{sub}</span>}
        </span>
        <SmallBtn href={href} label={`${rv("practise")}: ${title}`}>{rv("practise")}</SmallBtn>
      </div>
      {x.t === "link" && (
        <div className="flex flex-wrap gap-1.5">
          <Chip label={rv("gapOk")} on={gm === "fluent"} onClick={() => markGapToday(x.key, true)} />
          <Chip label={rv("gapMiss")} on={gm === "weak"} onClick={() => markGapToday(x.key, false)} />
        </div>
      )}
    </li>
  );
}

/** the tathbīt block of the wird */
export function TathbitCard({ tb, marks }: { tb: Tathbit; marks: Record<string, string> }) {
  const rv = useRv();
  const { nf } = useS2();
  return (
    <Card className="grid gap-3">
      <Term id="tathbit" />
      <p className="text-[14.5px] font-semibold">{tb.items.length ? rv("tathbitMeta", { n: nf(tb.items.length), m: nf(Math.max(1, tb.minutes)) }) : rv("tathbitEmpty")}</p>
      {tb.items.length > 0 && <ul className="divide-y divide-line border-y border-line">{tb.items.map((x) => <ItemRow key={`${x.t}:${x.t === "mut" ? x.id : x.key}`} x={x} marks={marks} />)}</ul>}
    </Card>
  );
}
