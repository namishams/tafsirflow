"use client";
// mirrors mobile/src/features/shams2/Hub.tsx: /shams/method – Shams Method 2.0: the classical hifz system (sabaq,
// sabqī, manzil, talaqqī, ʿarḍ, mutashābihāt, darajāt) joined with learning science (spaced retrieval, interleaving),
// never ending. Today's wird, the grade, quality, and one tile per tool; the method in five sentences and the glossary.
// Everything extends the existing Shams sessions in the reader; they are opened, never replaced.
import { useShams2 } from "@/lib/learn/shams2/model";
import { weakSpots } from "@/lib/learn/shams2/weakSpots";
import { levelOf } from "@/lib/learn/shams2/qualityModel";
import { useS2 } from "@/lib/learn/shams2/text";
import { Card, GoldLink, LearnHero, LearnMain, SectionTitle } from "@/components/learn/ui";
import { Glossary, LevelPill, Live, S2Kicker, ScoreDot, SourceNote, Term, Tile, useWebT } from "./ui";
import { ContinueNext } from "./Continue";
import { DueChecks, GradeCard } from "./Darajat";
import { Briefing } from "./Tadabbur";
import { useOnboarded } from "./Guide";
import { ShamsModeChooser } from "./ModeChooser";

function Today() {
  const { s, nf } = useS2();
  const m = useShams2();
  const first = m.wird.sabaq.ranges[0];
  const rows: [string, number][] = [["sabaq", m.wird.sabaq.verses], ["sabqi", m.wird.sabqi.verses], ["manzil", m.wird.manzil.verses]];
  return (
    <Card className="grid gap-3">
      <S2Kicker>{s("todayWird")}</S2Kicker>
      <dl className="grid gap-1.5">
        {rows.map(([k, n]) => (
          <div key={k} className="flex items-center justify-between gap-3"><dt><Term id={k} inline /></dt><dd className="text-[14.5px] font-semibold tabular-nums">{s("versesCount", { n: nf(n) })}</dd></div>
        ))}
      </dl>
      {m.wird.gated && <p className="text-[13.5px] text-[rgb(var(--hm-gold-d))]">{s("gatedLead")}</p>}
      {first && <Briefing s={first.s} v={first.from} />}
      <GoldLink href="/shams/wird" className="w-fit">{s("openWird", { m: nf(m.wird.minutes) })}</GoldLink>
    </Card>
  );
}

function Tiles() {
  const { s, nf } = useS2();
  const m = useShams2();
  const weak = weakSpots(m.known, m.words, m.mut).length;
  const first = m.wird.sabaq.ranges[0];
  return (
    <div className="grid gap-2.5 sm:grid-cols-2">
      <Tile title={s("qualityTitle")} lead={s("qualityShort")} href="/shams/quality" right={<span className="grid justify-items-end gap-1"><ScoreDot score={m.q.overall} /><LevelPill level={levelOf(m.q.overall)} /></span>} />
      <Tile title={s("tadabburTitle")} lead={s("tadabburShort")} href={`/shams/tadabbur?s=${first?.s ?? 1}`} />
      <Tile title={s("talaqqiTitle")} lead={s("talaqqiShort")} href={`/shams/talaqqi?s=${first?.s ?? 1}&v=${first?.from ?? 1}`} />
      <Tile title={s("mutTitle")} lead={s("mutShort")} href="/shams/mutashabihat" />
      <Tile title={s("weakTitle")} lead={weak ? s("weakCount", { n: nf(weak) }) : s("weakShort")} href="/shams/weak" />
      <Tile title={s("darajatTitle")} lead={s("darajatShort")} href="/shams/darajat" />
      <Tile title={s("weekTitle")} lead={s("weekShort")} href="/shams/week" />
      <Tile title={s("handbookTitle")} lead={s("handbookShort")} href="/shams/handbook" />
      <Tile title={s("teacherTitle")} lead={s("teacherShort")} href="/shams/teacher" />
    </div>
  );
}

/** the same tiles without stored progress (server rendering and first paint) */
function StaticTiles() {
  const { s } = useS2();
  return (
    <div className="grid gap-2.5 sm:grid-cols-2">
      <Tile title={s("qualityTitle")} lead={s("qualityShort")} href="/shams/quality" />
      <Tile title={s("tadabburTitle")} lead={s("tadabburShort")} href="/shams/tadabbur?s=1" />
      <Tile title={s("talaqqiTitle")} lead={s("talaqqiShort")} href="/shams/talaqqi?s=1&v=1" />
      <Tile title={s("mutTitle")} lead={s("mutShort")} href="/shams/mutashabihat" />
      <Tile title={s("weakTitle")} lead={s("weakShort")} href="/shams/weak" />
      <Tile title={s("darajatTitle")} lead={s("darajatShort")} href="/shams/darajat" />
      <Tile title={s("weekTitle")} lead={s("weekShort")} href="/shams/week" />
      <Tile title={s("handbookTitle")} lead={s("handbookShort")} href="/shams/handbook" />
      <Tile title={s("teacherTitle")} lead={s("teacherShort")} href="/shams/teacher" />
    </div>
  );
}

function Onboard() {
  const { s } = useS2();
  const onboarded = useOnboarded();
  if (onboarded) return null;
  return <Tile title={s("onboardCard")} lead={s("welcomeLead")} href="/shams/welcome" />;
}

export function HubScreen() {
  const { s } = useS2();
  const w = useWebT();
  return (
    <>
      <LearnHero back={{ href: "/shams", label: w.method }} kicker={s("eyebrow")} title={s("hubTitle")} lead={s("hubLead")} word="منهج شمس" uid="s2" />
      <LearnMain className="grid gap-5">
        <ShamsModeChooser className="pb-2" />
        <Live fallback={null}><Onboard /><DueChecks /></Live>
        <Live><Today /><GradeCard compact /></Live>
        <Live fallback={<StaticTiles />}><Tiles /></Live>
        <Card><ContinueNext /></Card>
        <section className="grid gap-3">
          <SectionTitle title={s("methodTitle")} />
          <div className="grid gap-2.5">
            {(["m1", "m2", "m3", "m4", "m5"] as const).map((k) => <p key={k} className="text-[15.5px] leading-relaxed">{s(k)}</p>)}
          </div>
          <SourceNote src={["halaqa", "jazari", "nawawi", "fsrs", "retrieval", "interleave"]} review={{ status: "draft" }} />
        </section>
        <Glossary />
      </LearnMain>
    </>
  );
}
