"use client";
// /cards/hifz – how well each surah and juz is known, mirrors mobile/src/features/srs/Hifz.tsx: a verse counts when it
// is in the verse reviews of the reader ("tf:srs", src/lib/learning.ts) or is a verse / dua card here. Cell colour =
// share of verses known × average recall today. A selected cell links to its exam (/tests/juz|surah?ref=N).
import { useEffect, useMemo, useState } from "react";
import { useLang } from "@/lib/learn/i18n";
import { getChapters, type Chapter } from "@/lib/learn/quran";
import { useHydrated, useStored } from "@/lib/learn/store";
import { VERSE_COUNTS } from "@/lib/counts";
import { recall as verseRecall, today, type Srs } from "@/lib/learning";
import { JUZ_START, TOTAL_VERSES, indexOf } from "@/lib/quranIndex";
import { strengthOf } from "@/lib/learn/srs/fsrs";
import { useIntl } from "@/lib/learn/srs/format";
import { useSrsState } from "@/lib/learn/srs/store";
import { useSrsT } from "@/lib/learn/srs/texts";
import { shareOrCopy } from "@/components/learn/coursekit/share";
import { Bar, Card, LearnHero, LearnMain, OutlineButton, OutlineLink } from "@/components/learn/ui";
import { useSrsWeb } from "./webTexts";

type Cell = { id: number; known: number; total: number; strength: number };

const juzRange = (j: number) => {
  const from = indexOf(...(JUZ_START[j - 1].split(":").map(Number) as [number, number]));
  const to = j < 30 ? indexOf(...(JUZ_START[j].split(":").map(Number) as [number, number])) : TOTAL_VERSES;
  return [from, to] as const;
};

export function useHifzCells() {
  const verseSrs = useStored<Srs>("tf:srs", {});
  const s = useSrsState();
  return useMemo(() => {
    const day = today();
    const known = new Map<number, number>(); // verse index -> recall 0…1
    for (const [k, e] of Object.entries(verseSrs)) {
      const [a, b] = k.split(":").map(Number);
      if (!a || !b) continue;
      const r = e.s !== undefined && e.last !== undefined ? verseRecall(e.s, day - e.last) : 0.8;
      known.set(indexOf(a, b), r);
    }
    for (const [id, c] of Object.entries(s.cards)) {
      if (!c.m || !(id.startsWith("verse:") || id.startsWith("dua:"))) continue;
      const [a, b] = id.split(":").slice(1).map(Number);
      const i = indexOf(a, b);
      known.set(i, Math.max(known.get(i) ?? 0, strengthOf(c.m, day)));
    }
    const cell = (id: number, from: number, to: number): Cell => {
      let n = 0, sum = 0;
      for (let i = from; i < to; i++) { const r = known.get(i); if (r !== undefined) { n++; sum += r; } }
      return { id, known: n, total: to - from, strength: n ? sum / n : 0 };
    };
    const surahs = VERSE_COUNTS.map((c, i) => cell(i + 1, indexOf(i + 1, 1), indexOf(i + 1, 1) + c));
    const juz = Array.from({ length: 30 }, (_, i) => { const [a, b] = juzRange(i + 1); return cell(i + 1, a, b); });
    return { surahs, juz };
  }, [verseSrs, s]);
}

export function HifzScreen() {
  const st = useSrsT();
  const sw = useSrsWeb();
  const nf = useIntl();
  const { lang } = useLang();
  const hydrated = useHydrated();
  const { surahs, juz } = useHifzCells();
  const [mode, setMode] = useState<"juz" | "surah">("juz");
  const [sel, setSel] = useState<number | null>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [copied, setCopied] = useState(false);
  useEffect(() => { getChapters(lang).then(setChapters).catch(() => undefined); }, [lang]);
  const cells = mode === "juz" ? juz : surahs;
  const cur = sel ? cells[sel - 1] : null;
  const name = (c: Cell) => (mode === "juz" ? st("juzN", { n: nf(c.id) }) : chapters[c.id - 1] ? `${nf(c.id)}. ${chapters[c.id - 1].name_simple}` : st("surahN", { n: nf(c.id) }));
  const shade = (c: Cell): React.CSSProperties => {
    const v = c.total ? (c.known / c.total) * (0.4 + 0.6 * c.strength) : 0;
    return v <= 0 ? {} : { backgroundColor: `rgb(var(--accent) / ${(0.18 + v * 0.82).toFixed(3)})`, borderColor: "transparent" };
  };
  const totalKnown = cells.reduce((a, c) => a + c.known, 0);
  return (
    <>
      <LearnHero back={{ href: "/cards", label: st("title") }} word="حِفْظ" title={st("hifz")} lead={st("hifzLead")} uid="hifz">
        {hydrated && <p className="text-[14px] font-semibold text-white/75">{st("learnedOf", { n: nf(totalKnown), total: nf(TOTAL_VERSES) })}</p>}
      </LearnHero>
      <LearnMain>
        <div className="grid gap-6">
          <div role="tablist" aria-label={st("hifz")} className="inline-flex w-fit rounded-full border border-line bg-surface p-1">
            {([["juz", st("byJuz")], ["surah", st("bySurah")]] as const).map(([m, l]) => (
              <button key={m} type="button" role="tab" aria-selected={mode === m} onClick={() => { setMode(m); setSel(null); }}
                className={`min-h-10 rounded-full px-5 text-sm font-semibold transition ${mode === m ? "bg-accent text-white" : "text-muted hover:text-ink"}`}>{l}</button>
            ))}
          </div>
          <div className={`grid gap-1.5 ${mode === "juz" ? "grid-cols-[repeat(auto-fill,minmax(52px,1fr))]" : "grid-cols-[repeat(auto-fill,minmax(38px,1fr))]"}`}>
            {cells.map((c) => (
              <button key={c.id} type="button" onClick={() => setSel(c.id)} aria-pressed={sel === c.id}
                aria-label={`${name(c)}, ${st("learnedOf", { n: nf(c.known), total: nf(c.total) })}`} title={name(c)}
                style={hydrated ? shade(c) : undefined}
                className={`flex aspect-square items-center justify-center rounded-md border border-line font-semibold tabular-nums transition hover:border-[rgb(var(--hm-gold))] ${mode === "juz" ? "text-[13px]" : "text-[11px]"} ${hydrated && c.known ? "text-white" : "bg-surface text-muted"} ${sel === c.id ? "ring-2 ring-[rgb(var(--hm-gold))] ring-offset-1 ring-offset-[rgb(var(--bg))]" : ""}`}>
                {nf(c.id)}
              </button>
            ))}
          </div>
          <p className="text-[12.5px] text-muted">{st("legend")}</p>
          {cur && (
            <Card>
              <h2 className="font-display text-[22px]">{name(cur)}</h2>
              <p className="mt-1 text-[15px] text-muted">{st("learnedOf", { n: nf(cur.known), total: nf(cur.total) })}</p>
              <Bar value={cur.total ? cur.known / cur.total : 0} gold className="mt-3" label={name(cur)} />
              <div className="mt-4 flex flex-wrap gap-3">
                <OutlineLink href={`/tests/${mode}?ref=${cur.id}`}>{mode === "juz" ? st("juzExam") : st("surahExam")}</OutlineLink>
                {cur.known > 0 && cur.known >= cur.total && (
                  <OutlineButton onClick={() => { void shareOrCopy({ title: name(cur), text: sw("shareHifz", { name: name(cur) }), url: `${location.origin}/cards/hifz` }).then((r) => setCopied(r === "copied")); }}>
                    {sw("shareProgress")}
                  </OutlineButton>
                )}
              </div>
              {copied && <p role="status" className="mt-2 text-sm text-accent">{sw("copied")}</p>}
            </Card>
          )}
        </div>
      </LearnMain>
    </>
  );
}
