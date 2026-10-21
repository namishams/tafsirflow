"use client";
// mirrors mobile/src/features/courses/Shams.tsx: the Shams Method extensions on the website (all free) – a guided
// 30-day program (/shams/program), memorisation plans for any surah (/shams/plans) and "Shams review" of the weakest
// verses (/shams/review). They only open the existing Shams sessions (the reader with the Shams method) at a verse;
// the program's progress has its own key, the same as in the app.
import { useMemo, useState } from "react";
import { Link } from "@/i18n/navigation";
import { readJSON, useStored, writeJSON } from "@/lib/learn/store";
import { weakestVerses } from "@/lib/learning";
import { award } from "@/lib/points";
import { shamsGrow } from "@/lib/learn/garden/garden";
import { useCT } from "@/lib/learn/courses/texts";
import { useSurahNames } from "@/lib/learn/shams2/names";
import { Bar, Card, LearnHero, LearnMain, Row, RowList } from "@/components/learn/ui";
import { Chip, Live } from "./ui";

const KEY = "qmc.shams-program.v1";
type Prog = { days: Record<string, number> };
const VC: [number, number][] = [[1, 7], [114, 6], [113, 5], [112, 4], [111, 5], [110, 3], [109, 6], [108, 3], [107, 7], [106, 4], [105, 5], [104, 9], [103, 3], [102, 8], [101, 11], [100, 11], [99, 8], [98, 8], [97, 5]];
type Kind = "learn" | "review" | "link" | "recite";
type PDay = { n: number; kind: Kind; s: number; from: number; to: number };

/** 30 days: new portions of at most 5 verses, every 4th day a review of the last days, every 7th a full recitation */
const PROGRAM: PDay[] = (() => {
  const portions: { s: number; from: number; to: number }[] = [];
  for (const [s, n] of VC) for (let a = 1; a <= n; a += 5) portions.push({ s, from: a, to: Math.min(n, a + 4) });
  const out: PDay[] = [];
  let k = 0;
  for (let n = 1; n <= 30; n++) {
    const last = portions[Math.max(0, k - 1)];
    if (n % 7 === 0) out.push({ n, kind: "recite", s: last.s, from: 1, to: VC.find((x) => x[0] === last.s)![1] });
    else if (n % 4 === 0) out.push({ n, kind: "review", ...portions[Math.max(0, k - 2)] });
    else if (n % 7 === 6 && k > 1) out.push({ n, kind: "link", s: last.s, from: 1, to: last.to });
    else { out.push({ n, kind: "learn", ...portions[Math.min(k, portions.length - 1)] }); k++; }
  }
  return out;
})();
/** the Shams session of a surah at a verse: the reader with the Shams method switched on */
const sessionAt = (s: number, v: number) => `/surah/${s}?v=${v}&shams=1`;
const dayStamp = (ms: number) => { const d = new Date(ms); return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`; };
/** whether a program day was already marked on today's calendar date (local time): one program day per calendar day */
const markedToday = (days: Record<string, number>) => { const now = dayStamp(Date.now()); return Object.values(days).some((ms) => typeof ms === "number" && dayStamp(ms) === now); };

function Num({ n, tone }: { n: number | string; tone: "done" | "cur" | "idle" }) {
  const cls = tone === "done" ? "bg-accent text-white" : tone === "cur" ? "btn-gold" : "border border-line bg-surface text-muted";
  return <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-full text-[13px] font-bold tabular-nums ${cls}`}>{n}</span>;
}

/** the three entries, as on the app's Shams page */
export function ShamsEntries() {
  const c = useCT();
  const items: [string, string, string][] = [["/shams/program", c("shProgram"), c("shProgramLead")], ["/shams/plans", c("shPlans"), c("shPlansLead")], ["/shams/review", c("shReview"), c("shReviewLead")]];
  return (
    <div className="grid gap-3 sm:grid-cols-3">
      {items.map(([href, title, lead]) => (
        <Link key={href} href={href} className="hm-card block p-5 transition hover:border-[rgb(var(--hm-gold))]/70">
          <span className="block text-[16px] font-bold">{title}</span>
          <span className="mt-1 block text-[14px] leading-relaxed text-muted">{lead}</span>
          <span className="mt-2 block text-[12px] font-semibold text-accent">{c("start")} <span aria-hidden className="rtl:-scale-x-100 inline-block">›</span></span>
        </Link>
      ))}
    </div>
  );
}

function ProgramBody() {
  const c = useCT();
  const { name } = useSurahNames();
  const p = useStored<Prog>(KEY, { days: {} });
  const days = p.days ?? {};
  const doneN = Object.keys(days).length;
  const today = PROGRAM.find((d) => !days[d.n]) ?? null;
  const doneToday = markedToday(days);
  const mark = (d: PDay) => {
    const cur = readJSON<Prog>(KEY, { days: {} });
    if (cur.days?.[d.n] || markedToday(cur.days ?? {})) return;
    writeJSON(KEY, { days: { ...(cur.days ?? {}), [d.n]: Date.now() } });
    award("session"); shamsGrow("session", false);
  };
  return (
    <div className="grid gap-3">
      <p className="text-sm font-semibold text-muted tabular-nums">{`${doneN}/30`}</p>
      <Bar value={doneN / 30} gold label={`${doneN}/30`} />
      <ol className="grid gap-2.5">
        {PROGRAM.map((d) => {
          const done = !!days[d.n], cur = today?.n === d.n;
          return (
            <li key={d.n} className={`hm-card grid gap-2 p-3 ${cur ? "border-[rgb(var(--hm-gold))]/60" : ""}`}>
              <div className="flex items-center gap-3">
                <Num n={d.n} tone={done ? "done" : cur ? "cur" : "idle"} />
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[rgb(var(--hm-gold))]">{`${c("shDay", { n: d.n })} · ${c(`shKind_${d.kind}`)}`}</p>
                  <p className="text-[15px] font-semibold">{`${name(d.s)} · ${c("shVersesRange", { a: d.from, b: d.to })}`}</p>
                </div>
                {done ? <span className="text-[13px] font-semibold text-accent">{c("shDayDone")}</span> : null}
              </div>
              {cur ? (
                <div className="flex flex-wrap items-center gap-2">
                  <Link href={sessionAt(d.s, d.from)} className="inline-flex min-h-9 items-center rounded-full border border-line bg-surface px-3 text-[13px] font-semibold hover:border-[rgb(var(--hm-gold))]/70">{c("shOpen")}</Link>
                  {doneToday ? null : <Chip label={c("shMarkDone")} on onClick={() => mark(d)} />}
                </div>
              ) : null}
              {cur && doneToday ? <p className="text-[13px] leading-snug text-muted">{c("shOneADay")}</p> : null}
            </li>
          );
        })}
      </ol>
    </div>
  );
}

export function ShamsProgramScreen() {
  const c = useCT();
  return (
    <>
      <LearnHero back={{ href: "/shams", label: "Shams" }} kicker="Shams" title={c("shProgram")} lead={c("shProgramLead")} word="شمس" uid="shp" />
      <LearnMain><Live><ProgramBody /></Live></LearnMain>
    </>
  );
}

export function ShamsPlansScreen() {
  const c = useCT();
  const { chapters, name } = useSurahNames();
  const [s, setS] = useState(1);
  const [pace, setPace] = useState(3);
  const vc = chapters.find((x) => x.id === s)?.verses_count ?? 7;
  const plan = useMemo(() => Array.from({ length: Math.ceil(vc / pace) }, (_, i) => ({ a: i * pace + 1, b: Math.min(vc, (i + 1) * pace) })), [vc, pace]);
  return (
    <>
      <LearnHero back={{ href: "/shams", label: "Shams" }} kicker="Shams" title={c("shPlans")} lead={c("shPlansLead")} word="شمس" uid="shl" />
      <LearnMain className="grid gap-4">
        <div className="flex flex-wrap gap-1.5">
          {[1, 2, 3, 5, 10].map((n) => <Chip key={n} label={c("shPace", { n })} on={pace === n} onClick={() => setPace(n)} />)}
        </div>
        <h2 className="font-display text-[21px]">{`${name(s)} · ${c("shDays", { n: plan.length })}`}</h2>
        <RowList>
          {plan.map((d, i) => <Row key={i} href={sessionAt(s, d.a)} lead={<span className="inline-block min-w-16 text-[13px] font-semibold text-[rgb(var(--hm-gold))]">{c("shDay", { n: i + 1 })}</span>} title={c("shVersesRange", { a: d.a, b: d.b })} />)}
        </RowList>
        <p className="mt-2 text-[15px] font-semibold">{c("tjPick")}</p>
        <div className="flex flex-wrap gap-1.5">
          {chapters.map((x) => <Chip key={x.id} label={`${x.id} ${x.name_simple}`} on={x.id === s} onClick={() => setS(x.id)} />)}
        </div>
      </LearnMain>
    </>
  );
}

function ReviewBody() {
  const c = useCT();
  const { name } = useSurahNames();
  const weak = weakestVerses(20);
  if (!weak.length) return <Card><p className="text-[15px] leading-relaxed text-muted">{c("shNoWeak")}</p></Card>;
  const [s0, v0] = weak[0].key.split(":").map(Number);
  return (
    <div className="grid gap-3">
      <Link href={sessionAt(s0, v0)} className="btn-gold inline-flex h-12 items-center justify-center rounded-full px-6 text-[15px] font-bold">{c("start")}</Link>
      <RowList>
        {weak.map((x) => {
          const [s, v] = x.key.split(":").map(Number);
          const pct = Math.round(x.strength * 100);
          return (
            <Row key={x.key} href={sessionAt(s, v)} lead={<Num n={v} tone="idle" />} title={name(s)}
              trail={<span className="flex items-center gap-2"><span className="w-16"><Bar value={x.strength} gold /></span><span className="text-[12px] text-muted tabular-nums">{c("shStrength", { p: pct })}</span></span>} />
          );
        })}
      </RowList>
    </div>
  );
}

export function ShamsReviewScreen() {
  const c = useCT();
  return (
    <>
      <LearnHero back={{ href: "/shams", label: "Shams" }} kicker="Shams" title={c("shReview")} lead={c("shReviewLead")} word="شمس" uid="shr" />
      <LearnMain><Live><ReviewBody /></Live></LearnMain>
    </>
  );
}
