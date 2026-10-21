"use client";
// mirrors mobile/src/features/shams2/Quality.tsx: /shams/quality?juz= – hifz quality (itqān) as a heatmap over the
// 604 pages of the Madani mushaf (page numbers from the Quran API), the 114 surahs or the 30 ajzāʾ. Select a cell for
// its score, how it is made up and its weakest verses (each opens talaqqī), and drill the weak spots.
import { useMemo, useState } from "react";
import { useShams2 } from "@/lib/learn/shams2/model";
import { usePageMap } from "@/lib/learn/shams2/pages";
import { levelOf, pageCells, verseScore, type Cell } from "@/lib/learn/shams2/qualityModel";
import { useS2 } from "@/lib/learn/shams2/text";
import { Card, GoldLink, LearnHero, LearnMain } from "@/components/learn/ui";
import { LevelPill, Live, ScoreDot, Segmented, SmallBtn, SourceNote, Term, onScore, scoreColor, useBack, useNames } from "./ui";

type Mode = "page" | "surah" | "juz";

function Body({ initialJuz }: { initialJuz?: number }) {
  const { s, nf } = useS2();
  const { name } = useNames();
  const m = useShams2();
  const [mode, setMode] = useState<Mode>(initialJuz ? "juz" : "page");
  const [sel, setSel] = useState<number | null>(initialJuz ?? null);
  const surahsWithVerses = useMemo(() => m.q.surahs.filter((c) => c.known > 0).map((c) => c.id), [m.q.surahs]);
  const pages = usePageMap(surahsWithVerses);
  const pageList = useMemo(() => pageCells(pages, m.q.scores), [pages, m.q.scores]);
  const cells: Cell[] = mode === "page" ? pageList : mode === "surah" ? m.q.surahs : m.q.juz;
  const cur = sel ? cells[sel - 1] : null;
  const label = (c: Cell) => (mode === "page" ? s("pageN", { n: nf(c.id) }) : mode === "surah" ? `${nf(c.id)}. ${name(c.id)}` : s("juzN", { n: nf(c.id) }));
  const parts = useMemo(() => {
    if (!cur) return null;
    const ks = cur.weakest.map((w) => m.known.get(w.key)).filter((k): k is NonNullable<typeof k> => !!k);
    if (!ks.length) return null;
    const v = ks.map((k) => verseScore(k, { words: m.words, checks: m.checks, mut: m.mut }));
    const avg = (f: (x: (typeof v)[number]) => number | null) => { const xs = v.map(f).filter((x): x is number => x !== null); return xs.length ? Math.round((xs.reduce((a, b) => a + b, 0) / xs.length) * 100) : null; };
    return { recall: avg((x) => x.recall), maturity: avg((x) => x.maturity), accuracy: avg((x) => x.accuracy), steadiness: avg((x) => x.steadiness) };
  }, [cur, m]);
  const cols = mode === "page" ? "grid-cols-[repeat(20,minmax(0,1fr))]" : mode === "surah" ? "grid-cols-[repeat(12,minmax(0,1fr))]" : "grid-cols-6";
  return (
    <div className="grid gap-5">
      <div className="flex items-center gap-4">
        <ScoreDot score={m.q.overall} size={64} className="border-2 border-[rgb(var(--hm-gold))]/60" />
        <div className="grid gap-1">
          <p className="text-[16px] font-bold">{s("overall")}</p>
          <p className="text-[13.5px] text-muted">{s("versesMemorised", { n: nf(m.q.count) })}</p>
          <LevelPill level={levelOf(m.q.overall)} />
        </div>
      </div>
      <Segmented value={mode} label={s("heatmap")} options={[["page", s("byPage")], ["surah", s("bySurah")], ["juz", s("byJuz")]]} onChange={(x) => { setMode(x); setSel(null); }} />
      <div role="group" aria-label={s("heatmap")} className={`grid ${cols} ${mode === "page" ? "gap-[2px]" : "gap-1"}`}>
        {cells.map((c) => {
          const on = sel === c.id;
          return (
            <button key={c.id} type="button" onClick={() => setSel(c.id)} aria-pressed={on}
              aria-label={`${label(c)}, ${c.score === null ? s("notYet") : s("scoreP", { p: nf(c.score) })}`}
              className={`grid place-items-center font-semibold ${mode === "page" ? "aspect-[1/1.35] rounded-[2px]" : "aspect-square rounded-md"} ${on ? "outline outline-2 outline-[rgb(var(--hm-gold))]" : ""}`}
              style={{ background: scoreColor(c.score), color: onScore(c.score) ?? "rgb(var(--muted))", fontSize: mode === "juz" ? 13 : 10 }}>
              {mode !== "page" ? nf(c.id) : null}
            </button>
          );
        })}
      </div>
      <ul className="flex flex-wrap items-center gap-3" aria-hidden>
        {[null, 20, 55, 80, 95].map((v, i) => (
          <li key={i} className="flex items-center gap-1.5 text-[12px] text-muted"><span className="h-3.5 w-3.5 rounded-[3px]" style={{ background: scoreColor(v) }} />{s(`lv_${levelOf(v)}` as never)}</li>
        ))}
      </ul>
      {mode === "page" && <p className="text-[12.5px] text-muted">{s("pageNote")}</p>}
      {cur && (
        <Card className="grid gap-3">
          <div className="flex items-center justify-between gap-3"><h2 className="text-[18px] font-bold">{label(cur)}</h2><LevelPill level={levelOf(cur.score)} /></div>
          <p className="text-[14px] text-muted" aria-live="polite">{cur.score === null ? s("notYet") : `${s("scoreP", { p: nf(cur.score) })} · ${s("knownOf", { n: nf(cur.known), total: nf(cur.total) })}`}</p>
          {parts && (
            <dl className="grid gap-1.5">
              {([["recall", parts.recall], ["maturity", parts.maturity], ["accuracy", parts.accuracy], ["steadiness", parts.steadiness]] as const).map(([k, v]) => (
                <div key={k} className="flex items-center gap-3">
                  <dt className="w-32 shrink-0 text-[12.5px] text-muted">{s(`part_${k}` as never)}</dt>
                  <dd className="flex flex-1 items-center gap-2">
                    <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-[rgb(var(--line))]"><span className="block h-full bg-accent" style={{ width: `${v ?? 0}%` }} /></span>
                    <span className="w-9 text-end text-[12px] font-semibold tabular-nums">{v === null ? "–" : nf(v)}</span>
                  </dd>
                </div>
              ))}
            </dl>
          )}
          {cur.weakest.length > 0 && <p className="text-[13.5px] font-semibold">{s("weakestHere")}</p>}
          <div className="flex flex-wrap gap-1.5">
            {cur.weakest.map((w) => {
              const [a, b] = w.key.split(":");
              return <SmallBtn key={w.key} href={`/shams/talaqqi?s=${a}&v=${b}`}>{`${name(Number(a))} ${nf(Number(b))} · ${nf(w.score)}`}</SmallBtn>;
            })}
          </div>
          {cur.known > 0 && <GoldLink className="w-fit" href={mode === "surah" ? `/shams/weak?s=${cur.id}` : "/shams/weak"}>{s("drillWeak")}</GoldLink>}
        </Card>
      )}
    </div>
  );
}

export function QualityScreen({ juz }: { juz?: number }) {
  const { s } = useS2();
  return (
    <>
      <LearnHero back={useBack()} kicker={s("eyebrow")} title={s("qualityTitle")} lead={s("qualityLead")} word="الإتقان" uid="s2q" />
      <LearnMain className="grid gap-5">
        <Live><Body initialJuz={juz} /></Live>
        <div className="grid gap-3 sm:grid-cols-2"><Term id="itqan" /><Term id="juz" /></div>
        <p className="text-[13.5px] leading-relaxed text-muted">{s("qualityHow")}</p>
        <SourceNote src={["app", "fsrs", "quranApi"]} review={{ status: "draft" }} />
      </LearnMain>
    </>
  );
}
