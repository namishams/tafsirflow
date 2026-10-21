"use client";
// mirrors mobile/src/features/shams2/Wird.tsx: /shams/wird – today's wird: sabaq (new), sabqī (recent), manzil (long
// term). One tap opens the reader at the right verse (new verses with the Shams method switched on); after reciting, a
// self-assessment (tathbīt) updates the verse reviews. Settings for time, new verses, manzil cycle and sabqī window.
import { Link } from "@/i18n/navigation";
import { rate, stats } from "@/lib/learning";
import { award } from "@/lib/points";
import { shamsGrow } from "@/lib/learn/garden/garden";
import { gEvent } from "@/lib/learn/feed/gamify";
import { useShams2 } from "@/lib/learn/shams2/model";
import { rangeId, type Range, type WirdBlock } from "@/lib/learn/shams2/plan";
import { markBlock, rateRange, saveSettings, useLog, wirdStreak, type Block } from "@/lib/learn/shams2/store";
import { useS2 } from "@/lib/learn/shams2/text";
import { Card, GoldButton, LearnHero, LearnMain, Stats } from "@/components/learn/ui";
import { IconCheckCircle } from "@/components/Icons";
import { Chip, Live, S2Kicker, SmallBtn, SourceNote, Term, useBack, useNames } from "./ui";
import { ContinueNext } from "./Continue";
import { DueChecks } from "./Darajat";
import { Briefing } from "./Tadabbur";

const BLOCKS = ["sabaq", "sabqi", "manzil"] as const;
/** where a portion is recited on the website: new verses with the Shams method, reviews in the reader */
export const rangeHref = (kind: Block, r: Range) => (kind === "sabaq" ? `/surah/${r.s}?v=${r.from}&shams=1` : `/surah/${r.s}?v=${r.from}`);

/** free-tier growth on the website (never the Pro doubling) */
export function rewardBlock(verses: number) {
  shamsGrow(verses >= 5 ? "session" : "verse", false);
  gEvent({ t: "verse" });
}

function BlockCard({ b, done, onDone, ratings, primary }: { b: WirdBlock; done: boolean; onDone: () => void; ratings: Record<string, string>; primary: boolean }) {
  const { s, nf } = useS2();
  const { name } = useNames();
  const { known } = useShams2();
  const reviewKind = b.kind !== "sabaq";
  const onRate = (r: Range, g: "fluent" | "hesitant" | "weak") => {
    for (let v = r.from; v <= r.to; v++) {
      const key = `${r.s}:${v}`;
      const k = known.get(key);
      if (!k) continue;
      rate(key, g === "fluent" ? "good" : g === "weak" ? "again" : k.recall < 0.6 ? "again" : "good");
    }
    rateRange(rangeId(r), g);
  };
  const action = s(b.kind === "sabaq" ? "learn" : "recite");
  return (
    <Card className={`grid gap-3 ${done ? "opacity-85" : ""}`}>
      <div className="flex items-start justify-between gap-3">
        <Term id={b.kind} />
        {done && <span className="text-accent [&>svg]:h-6 [&>svg]:w-6" aria-label={s("markDone")}><IconCheckCircle /></span>}
      </div>
      <p className="text-[14.5px] font-semibold">{b.verses ? s("blockMeta", { n: nf(b.verses), m: nf(Math.max(1, b.minutes)) }) : s(`empty_${b.kind}` as never)}</p>
      {b.ranges[0] && <Briefing s={b.ranges[0].s} v={b.ranges[0].from} review={reviewKind} />}
      {b.ranges.length > 0 && (
        <ul className="divide-y divide-line border-y border-line">
          {b.ranges.slice(0, 12).map((r) => {
            const id = rangeId(r);
            const rated = ratings[id];
            const label = `${name(r.s)} · ${r.from === r.to ? s("verseN", { v: nf(r.from) }) : s("versesAB", { a: nf(r.from), b: nf(r.to) })}`;
            return (
              <li key={id} className="grid gap-2 py-3">
                <div className="flex items-center gap-3">
                  <span className="min-w-0 flex-1 truncate text-[15px] font-semibold">{label}</span>
                  <SmallBtn href={rangeHref(b.kind, r)} label={`${action}: ${label}`}>{action}</SmallBtn>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  <Link href={`/shams/talaqqi?s=${r.s}&v=${r.from}&to=${r.to}`} className="inline-flex min-h-9 items-center rounded-full border border-line bg-surface px-3 text-[13px] font-semibold transition hover:border-[rgb(var(--hm-gold))]/70">{s("talaqqi")}</Link>
                  {reviewKind && (["fluent", "hesitant", "weak"] as const).map((g) => (
                    <Chip key={g} label={s(`rate_${g}` as never)} on={rated === g} onClick={() => onRate(r, g)} />
                  ))}
                </div>
              </li>
            );
          })}
        </ul>
      )}
      {b.ranges.length > 12 && <p className="text-[13px] text-muted">{s("moreRanges", { n: nf(b.ranges.length - 12) })}</p>}
      {b.verses > 0 && !done && (primary ? <GoldButton className="w-fit" onClick={onDone}>{s("markDone")}</GoldButton> : <SmallBtn onClick={onDone}>{s("markDone")}</SmallBtn>)}
    </Card>
  );
}

function Body() {
  const { s, nf } = useS2();
  const { wird, settings, day, grade } = useShams2();
  const log = useLog();
  const today = log[day] ?? {};
  const streak = Math.max(wirdStreak(log, day), 0);
  const done = (b: Block) => !!today[b];
  const finish = (b: WirdBlock) => {
    if (!markBlock(b.kind, day)) return;
    rewardBlock(b.verses);
    const n = BLOCKS.filter((k) => k === b.kind || done(k) || !wird[k].verses).length;
    if (n === 3) award("session");
  };
  const allDone = BLOCKS.every((k) => done(k) || !wird[k].verses);
  const firstOpen = BLOCKS.find((k) => wird[k].verses && !done(k));
  const reasonKey = wird.reason === "reviewOnly" ? "reasonReviewOnly" : wird.reason === "consolidate" ? "reasonConsolidate" : wird.reason === "start" ? "reasonStart" : null;
  const opt = (label: string, list: number[], cur: number, fmt: (m: number) => string, save: (m: number) => void) => (
    <div className="grid gap-1.5">
      <p className="text-[13px] font-semibold text-muted">{label}</p>
      <div className="flex flex-wrap gap-1.5">{list.map((m) => <Chip key={m} label={fmt(m)} on={cur === m} onClick={() => save(m)} />)}</div>
    </div>
  );
  return (
    <div className="grid gap-5">
      <Stats className="!grid-cols-3" items={[{ n: nf(wird.minutes), l: s("minutes") }, { n: `${nf(wird.cycleDay)}/${nf(wird.cycleOf)}`, l: s("manzilCycle") }, { n: nf(Math.max(streak, stats().streak)), l: s("streak") }]} />
      <p className="text-[13.5px] font-semibold text-[rgb(var(--hm-gold-d))]">{s("wirdGrade", { g: grade.tr, m: nf(grade.minutesMin), d: nf(settings.manzilDays || grade.manzilDays) })}</p>
      <DueChecks />
      {wird.gated && <p className="text-[14.5px] leading-relaxed text-[rgb(var(--hm-gold-d))]">{s("gatedLead")}</p>}
      {reasonKey && <p className="text-[14.5px] leading-relaxed text-muted">{s(reasonKey)}</p>}
      {BLOCKS.map((k) => <BlockCard key={k} b={wird[k]} done={done(k)} onDone={() => finish(wird[k])} ratings={today.r ?? {}} primary={k === firstOpen} />)}
      {allDone && <Card className="grid gap-4"><p className="text-[18px] font-bold">{s("wirdDone")}</p><ContinueNext /></Card>}
      <Card className="grid gap-3.5">
        <h2 className="text-[17px] font-bold">{s("settings")}</h2>
        {opt(s("setMinutes"), [10, 20, 30, 45, 60, 90], settings.minutes, (m) => s("minN", { n: nf(m) }), (m) => saveSettings({ minutes: m }))}
        {opt(s("setNew"), [0, 1, 2, 3, 5, 7, 10], settings.newPerDay, (m) => (m ? nf(m) : s("auto")), (m) => saveSettings({ newPerDay: m }))}
        {opt(s("setManzil"), [0, 3, 5, 7, 10, 14, 30], settings.manzilDays, (m) => (m ? s("daysN", { n: nf(m) }) : s("byGrade")), (m) => saveSettings({ manzilDays: m }))}
        {opt(s("setSabqi"), [7, 14, 30, 60], settings.sabqiDays, (m) => s("daysN", { n: nf(m) }), (m) => saveSettings({ sabqiDays: m }))}
      </Card>
    </div>
  );
}

export function WirdScreen() {
  const { s } = useS2();
  return (
    <>
      <LearnHero back={useBack()} kicker={s("eyebrow")} title={s("wirdTitle")} lead={s("wirdLead")} word="الورد" uid="s2w" />
      <LearnMain className="grid gap-5">
        <S2Kicker>{s("todayWird")}</S2Kicker>
        <Live><Body /></Live>
        <p className="text-[13.5px] leading-relaxed text-muted">{s("wirdHow")}</p>
        <SourceNote src={["halaqa", "fsrs", "retrieval"]} review={{ status: "draft" }} />
      </LearnMain>
    </>
  );
}
