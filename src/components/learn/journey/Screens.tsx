"use client";
// mirrors mobile/src/features/journey/{JourneyScreen,TodayScreen,StatsScreen,YearScreen}.tsx: Riḥlat al-ʿIlm on the
// website. /journey: the map of the Marāḥil (no last one), the app rank with its next horizon, the milestones of the
// chosen Marḥala, the garden areas after the tree's last stage, the album of seals and the nine mythic seals.
// /journey/today: the endless daily plans (khatm, hifz review, tafsir, hadith, Quranic lemmas, mutashābihāt).
// /journey/stats: every statistic of the registry. /journey/year: the Hijri year in review.
// Stored progress is read only in the browser (after hydration); the server renders the hero and the frame.
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Link } from "@/i18n/navigation";
import { useLang, formatNumber } from "@/lib/learn/i18n";
import { readJSON, useStored } from "@/lib/learn/store";
import { readTradition } from "@/lib/learn/tradition";
import { TOTAL_VERSES } from "@/lib/quranIndex";
import { DAY, toHijri, todayUtc } from "@/lib/hijri";
import { readSrs } from "@/lib/learning";
import { loadVerse } from "@/lib/learn/srs/verse";
import { GAMIFY_KEY, STICKER, type Gamify, type StickerDef } from "@/lib/learn/feed/gamify";
import { dayNum } from "@/lib/learn/feed/statsStore";
import { activeTree, readGarden, treeStage } from "@/lib/learn/garden/garden";
import { readCP } from "@/lib/learn/courses/progress";
import { readProgress as readLangProgress } from "@/lib/learn/arabic-lang/progress";
import { useJourneyData } from "@/lib/learn/journey/hooks";
import { doneOf, fracOf, marhala, marhalaPoints, type Milestone } from "@/lib/learn/journey/marahil";
import { BAND } from "@/lib/learn/journey/rank";
import { activeDaysByHijri, albumOf, defOf, gardenAreas, hijriBounds, MYTHIC, yearDef, YEAR_DAYS, type JDef } from "@/lib/learn/journey/stickers";
import { markFreshSeen, PER_OPTIONS, setPer, toggleQiraat, useJourney, type EngineId } from "@/lib/learn/journey/store";
import { allStats, GROUPS, type StatCtx, type StatDef } from "@/lib/learn/journey/stats";
import {
  allLemmas, doneHadith, doneKhatm, doneLemmas, doneMut, doneReview, doneTafsir, hadithSequence, isToday, khatmPortion, knownIndices,
  loadHadith, MUT_COUNT, mutGroup, rangesOf, readerHref, reviewPortion, workOf, type Lemma, type Range,
} from "@/lib/learn/journey/engines";
import type { HadithItem } from "@/lib/learn/journey/hadith";
import { useJT, type JKey, type JT } from "@/lib/learn/journey/texts";
import { Bar, Card, GoldButton, GoldLink, LearnHero, LearnMain, OutlineButton, OutlineLink, RowList, Row, SectionTitle, Spinner, StageStats } from "@/components/learn/ui";
import { StarGlyph } from "@/components/art/HomeOrnaments";
import { Seal, StickerArt } from "./Seal";
import { Chip, Glyph, HorizonVerse, MarahilMap, type MapNode } from "./ui";

const WORD = "رحلة العلم";
const BACK = { href: "/masterclass", label: "Masterclass" };
const useNf = () => { const { lang } = useLang(); return (n: number) => formatNumber(n, lang); };

export function useMarhalaTitle() {
  const jt = useJT();
  return (m: number) => (m <= 7 ? jt(`mh_${m}` as JKey) : jt("mh_n", { n: m }));
}
export const gardenName = (jt: JT, n: number) => (n <= 7 ? jt(`garden_${n}` as JKey) : jt("garden_n", { n }));

function Loading() {
  const jt = useJT();
  return <div className="py-16"><Spinner label={jt("loadingPath")} /></div>;
}
function Small({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <p className={`text-[12.5px] leading-relaxed text-muted ${className}`}>{children}</p>;
}

// ——— /journey ———
export function JourneyHome() {
  const jt = useJT();
  const { lang } = useLang();
  const nf = useNf();
  const { M, done, current, ready } = useJourneyData();
  const j = useJourney();
  const [sel, setSel] = useState(current);
  const [all, setAll] = useState(false);
  useEffect(() => { setSel(current); }, [current]);
  useEffect(() => () => { markFreshSeen(); }, []);
  const mt = useMarhalaTitle();

  // the map shows the stations up to one past the learner's Marḥala, at least seven; long paths show a window
  const last = Math.max(7, current + 1);
  const first = all ? 1 : Math.max(1, current - 5);
  const nodes: MapNode[] = useMemo(() => Array.from({ length: last - first + 1 }, (_, i) => {
    const m = first + i;
    const ms = m === current ? marhala(m, M) : null;
    const state = m <= done ? "done" : m === current ? "current" : "ahead";
    const frac = ms ? fracOf(ms) : 0;
    const pts = ms ? marhalaPoints(ms) : null;
    return { m, state, frac, title: jt("marhalaN", { n: m }), sub: pts ? `${mt(m)} · ${jt("towardNext", { a: formatNumber(pts[0], lang), b: formatNumber(pts[1], lang), n: m + 1 })}` : state === "done" ? `${mt(m)} · ${jt("reached")}` : mt(m) } as MapNode;
  }), [M, done, current, first, last, lang]); // eslint-disable-line react-hooks/exhaustive-deps

  const ms = useMemo(() => marhala(sel, M), [sel, M]);
  const areas = gardenAreas(M, done);
  const album = useMemo(() => albumOf(M, j.stickers), [M, j.stickers]);
  const r = M.rank;
  const [pa, pb] = marhalaPoints(ms);

  return (
    <>
      <LearnHero back={BACK} kicker={jt("eyebrow")} title={jt("title")} lead={jt("lead")} word={WORD} uid="journey">
        <GoldLink href="/journey/today">{jt("todayCta")}</GoldLink>
      </LearnHero>
      <LearnMain className="grid gap-10">
        {!ready ? <Loading /> : (
          <>
            {/* the app rank: always a next level, the 12:76 reminder from level 8 on */}
            <Card>
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-[12px] font-semibold tracking-[0.08em] text-[rgb(var(--hm-gold-d))] rtl:tracking-normal">{jt("rankKicker")}</p>
                  <p className="font-display mt-1.5 text-[26px] leading-tight">{jt("levelN", { n: nf(r.level) })}</p>
                  <p className="mt-0.5 text-[14px] text-muted">{r.k > 0 ? `${r.tr} · ${jt("bandStep", { b: nf(r.band), s: r.step, of: BAND })}` : jt("learningLevels")}</p>
                </div>
                <span lang="ar" dir="rtl" className="font-arabic shrink-0 text-[28px] leading-[1.6] text-[rgb(var(--hm-gold-d))]">{r.ar}</span>
              </div>
              <div className="mt-4 grid gap-1.5">
                <Bar value={r.pct} gold label={jt("toNext", { n: nf(r.level + 1), a: nf(Math.max(0, Math.ceil((1 - r.pct) * (r.to - r.from)))) })} />
                <Small>{jt("toNext", { n: nf(r.level + 1), a: nf(Math.max(0, Math.ceil((1 - r.pct) * (r.to - r.from)))) })}</Small>
                <Small>{jt("rankNote")}</Small>
              </div>
              {r.level >= 8 ? <div className="mt-4"><HorizonVerse /></div> : null}
            </Card>

            <section className="grid gap-4">
              <div className="flex flex-wrap items-end justify-between gap-3">
                <SectionTitle title={jt("mapTitle")} />
                {current > 6 ? <button type="button" onClick={() => setAll((x) => !x)} className="min-h-10 text-sm font-semibold text-accent hover:underline">{all ? jt("showRecent") : jt("showAll")}</button> : null}
              </div>
              <MarahilMap nodes={nodes} selected={sel} onSelect={setSel} />
            </section>

            {/* the chosen Marḥala */}
            <section className="grid gap-4" aria-live="polite">
              <SectionTitle title={`${jt("marhalaN", { n: sel })} · ${mt(sel)}`}
                lead={sel <= done ? jt("marhalaDone", { n: sel + 1 }) : jt("marhalaOpen", { d: doneOf(ms), n: ms.length, a: formatNumber(pa, lang), b: formatNumber(pb, lang), m: sel + 1 })} />
              <RowList>{ms.map((x) => <MilestoneRow key={x.id} x={x} />)}</RowList>
              {ms.some((x) => x.q) ? <Small>{jt("qiraatNote")}</Small> : null}
              {sel === current ? <HorizonVerse /> : null}
            </section>

            {/* the garden keeps growing after the tree's last stage */}
            <section className="grid gap-4">
              <div className="flex flex-wrap items-end justify-between gap-3">
                <SectionTitle title={jt("gardenTitle")} lead={jt("gardenLead")} />
                <Link href="/garden" className="min-h-10 text-sm font-semibold text-accent hover:underline">{jt("openGarden")}</Link>
              </div>
              <RowList>
                {Array.from({ length: areas }, (_, i) => <Row key={i} lead={<Glyph ok />} title={gardenName(jt, i + 1)} sub={jt("gardenOpened")} />)}
                <Row lead={<Glyph />} locked title={gardenName(jt, areas + 1)} sub={M.treeStage >= 12 ? jt("gardenNextMarhala", { n: done + 1 }) : jt("gardenNeedsTree")} />
              </RowList>
            </section>

            {/* album of the path */}
            <section className="grid gap-4">
              <SectionTitle title={jt("albumTitle")} lead={jt("albumLead")} />
              <div className="grid gap-6">
                {album.filter((row) => row.items.length).map((row) => (
                  <div key={row.fam}>
                    <h3 className="mb-2 text-[14px] font-semibold">{jt(`row_${row.fam}` as JKey)}</h3>
                    <ul className="flex flex-wrap gap-3">
                      {row.items.map(({ def, have, prog }) => {
                        const label = jt(def.key as JKey, { n: typeof def.n === "number" ? nf(def.n) : "" });
                        const fresh = j.fresh.includes(def.id);
                        return (
                          <li key={def.id} className="flex w-[88px] flex-col items-center gap-1 text-center" aria-label={`${label}${have ? "" : `, ${jt("locked")}: ${nf(prog?.[0] ?? 0)} / ${nf(prog?.[1] ?? 0)}`}`}>
                            <Seal def={def} size={72} locked={!have} pct={prog ? prog[0] / Math.max(1, prog[1]) : 0} />
                            <span aria-hidden className={`line-clamp-2 text-[11.5px] font-medium leading-tight ${have ? "" : "text-muted"}`}>{label}</span>
                            {fresh ? <span aria-hidden className="text-[10.5px] font-bold text-[rgb(var(--hm-gold-d))]">{jt("new")}</span> : null}
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                ))}
              </div>
            </section>

            {/* mythic */}
            <section className="stage girih relative grid gap-3 overflow-hidden rounded-2xl border border-[rgb(214_180_108/0.45)] p-5 text-white sm:p-6">
              <p className="flex items-center gap-2 text-[12px] font-semibold tracking-[0.08em] text-[rgb(var(--gold))] rtl:tracking-normal"><StarGlyph size={12} />{jt("mythicKicker")}</p>
              <h2 className="font-display text-[24px] leading-tight">{jt("mythicTitle")}</h2>
              <p className="text-[14.5px] leading-relaxed text-white/70">{jt("mythicLead")}</p>
              <ul className="mt-2 grid gap-4 sm:grid-cols-2">
                {MYTHIC.map((x) => {
                  const have = !!j.stickers[x.id];
                  const [a, b] = x.prog(M);
                  return (
                    <li key={x.id} className="flex items-center gap-3.5" aria-label={`${jt(x.key as JKey)}. ${have ? jt("earned") : `${nf(Math.min(a, b))} / ${nf(b)}`}`}>
                      <Seal def={x} size={64} locked={!have} pct={a / Math.max(1, b)} />
                      <div aria-hidden className="grid min-w-0 flex-1 gap-1">
                        <p className="text-[14.5px] font-bold">{jt(x.key as JKey)}</p>
                        <p className="text-[12.5px] leading-snug text-white/60">{jt(`${x.key}_how` as JKey)}</p>
                        {have ? <p className="text-[12px] font-semibold text-[rgb(var(--gold))]">{jt("earned")}</p>
                          : <><Bar value={Math.min(1, a / Math.max(1, b))} gold /><p className="text-[11.5px] tabular-nums text-white/60">{`${nf(Math.min(a, b))} / ${nf(b)}`}</p></>}
                      </div>
                    </li>
                  );
                })}
              </ul>
            </section>
          </>
        )}

        <RowList>
          <Row href="/journey/year" lead={<Glyph />} title={jt("yearTitle")} sub={jt("yearRow")} />
          <Row href="/journey/stats" lead={<Glyph />} title={jt("statsTitle")} sub={jt("statsRow")} />
          <Row href="/journey/today" lead={<Glyph />} title={jt("todayTitle")} sub={jt("todayRow")} />
        </RowList>
        <Small>{jt("healthy")}</Small>
      </LearnMain>
    </>
  );
}

function MilestoneRow({ x }: { x: Milestone }) {
  const jt = useJT();
  const nf = useNf();
  const j = useJourney();
  const ok = x.have >= x.goal;
  const vars = Object.fromEntries(Object.entries(x.vars ?? {}).map(([k, v]) => [k, typeof v === "number" ? nf(v) : v]));
  const title = jt(x.key as JKey, vars);
  const status = ok ? jt("done") : x.goal === 100 && !x.q ? jt("pctDone", { p: x.have }) : x.q ? jt("notMarked") : `${nf(x.have)} / ${nf(x.goal)}`;
  // qirāʾāt steps are marked by the learner; a mark can be taken back only on the day it was set
  if (x.q) {
    const canToggle = !j.q[x.q] || j.q[x.q] === dayNum();
    return (
      <li>
        <button type="button" role="checkbox" aria-checked={ok} disabled={!canToggle} onClick={() => toggleQiraat(x.q!)} aria-label={`${title}, ${status}`}
          className="flex min-h-[64px] w-full items-center gap-4 px-4 py-3 text-start transition hover:bg-[rgb(var(--hm-gold))]/[0.06] disabled:cursor-default disabled:hover:bg-transparent sm:px-5">
          <Glyph ok={ok} />
          <span className="min-w-0 flex-1">
            <span className="block text-[15px] font-semibold leading-snug">{title}</span>
            <span className={`mt-0.5 block text-[12.5px] ${ok ? "text-[rgb(var(--hm-gold-d))]" : "text-muted"}`}>{ok ? status : jt("tapToMark")}</span>
          </span>
          <span aria-hidden className={`grid h-6 w-6 place-items-center rounded-full border ${ok ? "border-[rgb(var(--hm-gold))] bg-[rgb(var(--hm-gold))] text-white" : "border-line text-muted"}`}>{ok ? "✓" : "+"}</span>
        </button>
      </li>
    );
  }
  return (
    <Row href={x.href} lead={<Glyph ok={ok} />} title={title}>
      {!ok ? <Bar value={x.goal ? x.have / x.goal : 0} gold className="mt-2" /> : null}
      <span className={`mt-1 block text-[12.5px] ${ok ? "text-[rgb(var(--hm-gold-d))]" : "text-muted"}`}>{status}</span>
    </Row>
  );
}

// ——— /journey/today ———
export function JourneyToday() {
  const jt = useJT();
  const { ready } = useJourneyData();
  return (
    <>
      <LearnHero back={{ href: "/journey", label: jt("title") }} kicker={jt("eyebrow")} title={jt("todayTitle")} lead={jt("todayLead")} word={WORD} uid="journey-today" />
      <LearnMain className="grid gap-6">
        {!ready ? <Loading /> : (
          <>
            <KhatmCard />
            <ReviewCard />
            <TafsirCard />
            <HadithCard />
            <LemmaCard />
            <MutCard />
          </>
        )}
        <Small>{jt("todayNote")}</Small>
      </LearnMain>
    </>
  );
}

function PlanCard({ id, title, line, frac, children, onDone, doneLabel, perLabel }: {
  id: EngineId; title: string; line: string; frac: number; children: ReactNode; onDone?: () => void; doneLabel?: string; perLabel?: (n: number) => string;
}) {
  const jt = useJT();
  const e = useJourney().e[id];
  return (
    <Card>
      <h2 className="font-display flex items-center gap-2.5 text-[22px]"><StarGlyph size={13} className="shrink-0 text-[rgb(var(--hm-gold))]" />{title}</h2>
      <p className="mt-1 text-[13.5px] text-muted">{line}</p>
      <Bar value={frac} gold className="mt-3" label={line} />
      <div className="mt-4 grid gap-3">{children}</div>
      {perLabel ? (
        <div className="mt-4 flex flex-wrap gap-2" role="group" aria-label={jt("portionSize")}>
          {PER_OPTIONS[id].map((n) => <Chip key={n} selected={e.per === n} onClick={() => setPer(id, n)}>{perLabel(n)}</Chip>)}
        </div>
      ) : null}
      {onDone ? (
        <div className="mt-4 grid justify-items-start gap-1.5">
          <OutlineButton onClick={onDone}>{doneLabel ?? jt("markDone")}</OutlineButton>
          {isToday(e.last) ? <p role="status" className="text-[13px] text-[rgb(var(--hm-gold-d))]">{jt("doneToday")}</p> : null}
        </div>
      ) : null}
    </Card>
  );
}

function Ranges({ list, tafsir = false }: { list: Range[]; tafsir?: boolean }) {
  const jt = useJT();
  return (
    <div className="flex flex-wrap items-center gap-2">
      {list.slice(0, 12).map((r) => {
        const label = r.a === r.b ? `${r.s}:${r.a}` : `${r.s}:${r.a}–${r.b}`;
        return <Chip key={label} href={readerHref(r.s, r.a, tafsir)}><span dir="ltr">{label}</span></Chip>;
      })}
      {list.length > 12 ? <span className="text-[13px] text-muted">{jt("moreRanges", { n: list.length - 12 })}</span> : null}
    </div>
  );
}

function KhatmCard() {
  const jt = useJT();
  const nf = useNf();
  const e = useJourney().e.khatm;
  const p = khatmPortion(e.pos, e.per);
  return (
    <PlanCard id="khatm" title={jt("e_khatm")} frac={e.pos / TOTAL_VERSES} line={jt("khatmLine", { c: nf(e.cycles + 1), a: nf(e.pos), b: nf(TOTAL_VERSES) })}
      onDone={doneKhatm} doneLabel={jt("markRead")} perLabel={(n) => jt("versesN", { n: nf(n) })}>
      <Ranges list={rangesOf(p.idx)} />
    </PlanCard>
  );
}

function ReviewCard() {
  const jt = useJT();
  const nf = useNf();
  const e = useJourney().e.review;
  const known = useMemo(() => knownIndices(), [e.pos, e.cycles]); // eslint-disable-line react-hooks/exhaustive-deps
  const p = reviewPortion(e.pos, e.per, known);
  if (!known.length) return (
    <PlanCard id="review" title={jt("e_review")} frac={0} line={jt("reviewEmpty")}>
      <OutlineLink href="/shams" className="w-fit">{jt("openShams")}</OutlineLink>
    </PlanCard>
  );
  return (
    <PlanCard id="review" title={jt("e_review")} frac={e.pos / TOTAL_VERSES} line={jt("reviewLine", { c: nf(e.cycles + 1), n: nf(known.length) })}
      onDone={doneReview} doneLabel={jt("markRecited")} perLabel={(n) => jt("versesN", { n: nf(n) })}>
      <Ranges list={rangesOf(p.idx)} />
      <OutlineLink href="/shams/wird" className="w-fit">{jt("openWird")}</OutlineLink>
      <Small>{jt("reviewHint")}</Small>
    </PlanCard>
  );
}

function TafsirCard() {
  const jt = useJT();
  const nf = useNf();
  const e = useJourney().e.tafsir;
  const w = workOf(e.cycles + 1);
  const p = khatmPortion(e.pos, e.per);
  return (
    <PlanCard id="tafsir" title={jt("e_tafsir")} frac={e.pos / TOTAL_VERSES} line={jt("tafsirLine", { c: nf(e.cycles + 1), w: jt(`work_${w.key}` as JKey), a: nf(e.pos), b: nf(TOTAL_VERSES) })}
      onDone={doneTafsir} doneLabel={jt("markRead")} perLabel={(n) => jt("versesN", { n: nf(n) })}>
      <Ranges list={rangesOf(p.idx)} tafsir />
      <Small>{jt("tafsirHint")}</Small>
    </PlanCard>
  );
}

function HadithCard() {
  const jt = useJT();
  const nf = useNf();
  const { lang } = useLang();
  useStored("qmc.prayerSetup", {});
  const tradition = readTradition();
  const j = useJourney();
  const e = j.e.hadith;
  const seq = useMemo(() => hadithSequence(tradition), [tradition]);
  const col = seq[j.hCol % Math.max(1, seq.length)];
  const [h, setH] = useState<{ item: HadithItem | null; n: number } | null>(null);
  const [err, setErr] = useState(false);
  useEffect(() => {
    if (!col) return;
    let off = false;
    setH(null); setErr(false);
    loadHadith(col, e.pos, lang).then((x) => { if (!off) setH(x); }).catch(() => { if (!off) setErr(true); });
    return () => { off = true; };
  }, [col?.id, e.pos, lang]); // eslint-disable-line react-hooks/exhaustive-deps
  if (!col) return null;
  return (
    <PlanCard id="hadith" title={jt("e_hadith")} frac={e.pos / Math.max(1, col.max)} line={jt("hadithLine", { s: col.name, a: nf(e.pos), b: nf(col.max), n: nf(e.units) })}
      onDone={h ? () => doneHadith(seq, h.n) : undefined} doneLabel={jt("markHadith")}>
      {!h && !err ? <Spinner /> : null}
      {err ? <p className="text-[14px] text-muted">{jt("offline")}</p> : null}
      {h?.item ? (
        <div className="grid gap-2">
          {h.item.arabic ? <p lang="ar" dir="rtl" className="font-arabic whitespace-pre-line text-end text-[20px] leading-[2]">{h.item.arabic}</p> : null}
          {h.item.text ? <p lang={h.item.textLang} className="whitespace-pre-line text-[15px] leading-relaxed">{h.item.text}</p> : null}
          <p className="text-[12.5px] font-medium text-muted">{h.item.reference}{h.item.grades[0] ? ` · ${h.item.grades[0].by}: ${h.item.grades[0].grade}` : ""}</p>
          <p className="text-[12px] text-muted">{h.item.url ? <a href={h.item.url} target="_blank" rel="noopener noreferrer" className="hover:underline">{h.item.credit}</a> : h.item.credit}{h.item.translator ? ` · ${h.item.translator}` : ""}</p>
        </div>
      ) : h && !h.item ? <p className="text-[14px] text-muted">{jt("hadithGap")}</p> : null}
    </PlanCard>
  );
}

function LemmaCard() {
  const jt = useJT();
  const nf = useNf();
  const { lang } = useLang();
  const e = useJourney().e.lemma;
  const [table, setTable] = useState<Lemma[] | null>(null);
  const [err, setErr] = useState(false);
  const [mean, setMean] = useState<Record<string, string>>({});
  useEffect(() => { allLemmas().then(setTable).catch(() => setErr(true)); }, []);
  const rows = table ? table.slice(e.pos, e.pos + e.per) : [];
  useEffect(() => {
    if (!rows.length) return;
    let off = false;
    void Promise.all(rows.map(async ([lem, , , ref]) => {
      const [s, a, w] = ref.split(":");
      try { const v = await loadVerse(`${s}:${a}`, lang); const x = v.words.find((y) => y.position === Number(w)); return [lem, x ? `${x.text} · ${x.meaning}` : ""] as const; } catch { return [lem, ""] as const; }
    })).then((list) => { if (!off) setMean(Object.fromEntries(list)); });
    return () => { off = true; };
  }, [table, e.pos, e.per, lang]); // eslint-disable-line react-hooks/exhaustive-deps
  const total = table?.length ?? 0;
  return (
    <PlanCard id="lemma" title={jt("e_lemma")} frac={total ? e.pos / total : 0} line={total ? jt("lemmaLine", { c: nf(e.cycles + 1), a: nf(e.pos), b: nf(total) }) : jt("loading")}
      onDone={total ? () => doneLemmas(total) : undefined} doneLabel={jt("markStudied")} perLabel={(n) => jt("wordsN", { n: nf(n) })}>
      {!table && !err ? <Spinner /> : null}
      {err ? <p className="text-[14px] text-muted">{jt("offline")}</p> : null}
      {rows.length ? (
        <ul className="grid gap-2">
          {rows.map(([lem, root, count, ref]) => {
            const [s, a] = ref.split(":").map(Number);
            return (
              <li key={lem} className="flex items-center gap-3 rounded-md border border-line p-2.5">
                <div className="grid min-w-0 flex-1 gap-0.5">
                  <p className="line-clamp-2 text-[13.5px]">{mean[lem] || "…"}</p>
                  <p className="text-[12px] text-muted">{jt("lemmaMeta", { r: root ? [...root].join(" ") : "–", n: nf(count), k: `${s}:${a}` })}</p>
                </div>
                <Link href={readerHref(s, a)} lang="ar" dir="rtl" className="font-arabic shrink-0 text-[24px] leading-[1.8] hover:text-accent">{lem}</Link>
              </li>
            );
          })}
        </ul>
      ) : null}
      <p className="text-[12px] leading-relaxed text-muted">{jt("lemmaSource")}</p>
    </PlanCard>
  );
}

function MutCard() {
  const jt = useJT();
  const nf = useNf();
  const { lang } = useLang();
  const e = useJourney().e.mut;
  const groups = Array.from({ length: Math.max(0, Math.min(e.per, MUT_COUNT - e.pos)) }, (_, i) => mutGroup(e.pos + i));
  return (
    <PlanCard id="mut" title={jt("e_mut")} frac={e.pos / Math.max(1, MUT_COUNT)} line={jt("mutLine", { c: nf(e.cycles + 1), a: nf(e.pos), b: nf(MUT_COUNT) })}
      onDone={doneMut} doneLabel={jt("markStudied")} perLabel={(n) => jt("groupsN", { n: nf(n) })}>
      {groups.map((g) => (
        <div key={g.id} className="grid gap-1.5">
          <p className="text-[14.5px] font-semibold">{lang === "de" ? g.topic.de : lang === "ar" ? g.topic.ar : g.topic.en}</p>
          <Ranges list={g.keys.map((k) => { const [s, v] = k.split(":").map(Number); return { s, a: v, b: v }; })} />
        </div>
      ))}
      <OutlineLink href="/shams/mutashabihat" className="w-fit">{jt("openMut")}</OutlineLink>
      <p className="text-[12px] text-muted">{jt("mutDraft")}</p>
    </PlanCard>
  );
}

// ——— /journey/stats ———
export function JourneyStats() {
  const jt = useJT();
  const { lang } = useLang();
  const { M, ready } = useJourneyData();
  const ctx: StatCtx = { M, lang, jt };
  const rows = useMemo(() => (ready ? allStats() : []).map((d) => {
    let v = 0, of = 0;
    try { v = d.value(ctx); of = d.of?.(ctx) ?? 0; } catch { /* a provider without data shows 0 */ }
    return { d, v, of };
  }), [M, lang, ready]); // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <>
      <LearnHero back={{ href: "/journey", label: jt("title") }} kicker={jt("eyebrow")} title={jt("statsTitle")} lead={jt("statsLead")} word={WORD} uid="journey-stats" />
      <LearnMain className="grid gap-10">
        {!ready ? <Loading /> : GROUPS.map((g) => {
          const list = rows.filter((r) => r.d.group === g);
          if (!list.length) return null;
          return (
            <section key={g} className="grid gap-4">
              <SectionTitle title={jt(`grp_${g}` as JKey)} />
              <RowList>{list.map((r) => <StatRow key={r.d.id} d={r.d} v={r.v} of={r.of} ctx={ctx} />)}</RowList>
            </section>
          );
        })}
        <Small>{jt("statsNote")}</Small>
      </LearnMain>
    </>
  );
}

function StatRow({ d, v, of, ctx }: { d: StatDef; v: number; of: number; ctx: StatCtx }) {
  const { jt, lang } = ctx;
  const nf = (n: number) => formatNumber(n, lang);
  const unit = d.unit === "min" ? jt("unitMin", { n: nf(v) }) : d.unit === "days" ? jt("unitDays", { n: nf(v) }) : d.unit === "pts" ? jt("unitPts", { n: nf(v) }) : nf(v);
  const reached = d.kind === "bounded" && of > 0 && v >= of;
  const name = d.label(ctx);
  const sub = d.kind === "best" ? jt("kindBest") : d.kind === "total" ? jt("kindTotal") : reached ? `${jt("reached")} · ${d.next ? d.next(ctx) : jt("nx_generic")}` : `${nf(v)} / ${nf(of)}`;
  return (
    <li className="grid gap-1.5 px-4 py-3.5 sm:px-5" aria-label={`${name}: ${d.kind === "bounded" ? sub : `${unit}, ${sub}`}`}>
      <div aria-hidden className="flex items-center gap-3">
        <span className="min-w-0 flex-1 text-[15px] font-semibold">{name}</span>
        {d.kind === "bounded"
          ? (reached ? <Glyph ok /> : <span className="text-[14px] font-semibold tabular-nums text-muted">{`${Math.floor((100 * v) / Math.max(1, of))} %`}</span>)
          : <span className="font-display text-[19px] tabular-nums">{unit}</span>}
      </div>
      {d.kind === "bounded" && !reached ? <Bar value={v / Math.max(1, of)} gold /> : null}
      <span aria-hidden className={`text-[12.5px] ${reached ? "text-[rgb(var(--hm-gold-d))]" : "text-muted"}`}>{sub}</span>
    </li>
  );
}

// ——— /journey/year ———
const utcDay = (ms: number) => Math.floor(ms / DAY);

/** a journey sticker id back to its definition */
function jdefOf(id: string): JDef | null {
  const my = MYTHIC.find((x) => x.id === id);
  if (my) return my;
  const m = /^rihla-hijri-(\d+)$/.exec(id);
  if (m) return yearDef(Number(m[1]));
  const s = /^rihla-([a-z]+)-(\d+)$/.exec(id);
  return s ? defOf(s[1], Number(s[2]), 0) : null;
}

export function JourneyYear() {
  const jt = useJT();
  const nf = useNf();
  const { lang } = useLang();
  const { M, ready } = useJourneyData();
  const j = useJourney();
  const nowY = toHijri(todayUtc()).y;
  const byYear = useMemo(() => (ready ? activeDaysByHijri() : new Map<number, number>()), [M, ready]); // eslint-disable-line react-hooks/exhaustive-deps
  const years = useMemo(() => [...new Set([...byYear.keys(), nowY])].sort((a, b) => b - a), [byYear, nowY]);
  const [y, setY] = useState(nowY);
  const [msg, setMsg] = useState("");
  const b = hijriBounds(y);
  const data = useMemo(() => {
    if (!b || !ready) return null;
    const { from, to } = b;
    const inY = (d: number) => d >= from && d <= to;
    const per = Object.fromEntries(allStats().filter((s) => s.perDays).map((s) => [s.id, s.perDays!(from, to)])) as Record<string, number>;
    const learned = Object.values(readSrs()).filter((x) => typeof x.first === "number" && inY(x.first)).length;
    const gm = readJSON<Partial<Gamify>>(GAMIFY_KEY, {});
    const feedSt = Object.entries(gm.stickers ?? {}).filter(([, d]) => inY(d)).map(([id]) => STICKER.get(id)).filter((x): x is StickerDef => !!x);
    const pathSt = Object.entries(j.stickers).filter(([, d]) => inY(d)).map(([id]) => jdefOf(id)).filter((x): x is JDef => !!x);
    const cycles: Partial<Record<EngineId, number>> = {};
    for (const [e, d] of j.log) if (inY(d)) cycles[e] = (cycles[e] ?? 0) + 1;
    const courses = Object.values(readCP().complete ?? {}).filter((ms) => inY(utcDay(ms))).length;
    const rp = readJSON<{ certs?: Record<string, string> }>("qmc.reciterPath", {});
    const rpCerts = Object.values(rp.certs ?? {}).filter((s) => inY(utcDay(Date.parse(`${s}T12:00:00Z`)))).length;
    const arCerts = Object.values(readLangProgress().certs ?? {}).filter((c) => c && inY(utcDay(c.at))).length;
    let tree: { name: string; stage: number } | null = null;
    try { const t = activeTree(readGarden(), true); tree = t ? { name: t.name, stage: treeStage(t, true) } : null; } catch { tree = null; }
    const best = Math.max(0, ...[...byYear.entries()].filter(([yy]) => yy !== y).map(([, n]) => n));
    return { per, learned, feedSt, pathSt, cycles, certs: courses + rpCerts + arCerts, tree, best };
  }, [y, M, j, lang, ready]); // eslint-disable-line react-hooks/exhaustive-deps
  const days = data?.per.activeDays ?? 0;
  const yd = yearDef(y);

  // the app's share card is replaced by the Web Share API (text and link), or a copy to the clipboard
  async function share() {
    const text = jt("y_shareText", { y: nf(y), d: nf(days) });
    const url = typeof window !== "undefined" ? window.location.href : "";
    try {
      if (navigator.share) { await navigator.share({ title: jt("yearTitle"), text, url }); return; }
      await navigator.clipboard.writeText(`${text} ${url}`.trim());
      setMsg(jt("y_copied"));
    } catch { /* the reader closed the share sheet */ }
  }

  return (
    <>
      <LearnHero back={{ href: "/journey", label: jt("title") }} kicker={jt("eyebrow")} title={jt("yearTitle")} lead={jt("yearLead")} word={WORD} uid="journey-year">
        {ready ? (
          <div className="flex flex-wrap gap-2" role="group" aria-label={jt("yearTitle")}>
            {years.map((x) => <Chip key={x} onStage selected={x === y} onClick={() => setY(x)}>{jt("hijriYear", { y: nf(x) })}</Chip>)}
          </div>
        ) : null}
      </LearnHero>
      <LearnMain className="grid gap-10">
        {!data ? <Loading /> : (
          <>
            <section className="stage relative overflow-hidden rounded-2xl p-4 sm:p-5">
              <StageStats items={[
                { n: nf(days), l: jt("y_days") }, { n: nf(data.per.points ?? 0), l: jt("y_points") }, { n: nf(Math.round((data.per.minutes ?? 0) / 60)), l: jt("y_hours") },
                { n: nf(data.per.bestStreak ?? 0), l: jt("y_streak") }, { n: nf(data.learned), l: jt("y_learned") }, { n: nf(data.per.bestDay ?? 0), l: jt("y_bestDay") },
              ]} />
            </section>
            {days > 0 && days >= data.best ? <p className="-mt-6 text-[14.5px] font-semibold text-[rgb(var(--hm-gold-d))]">{jt("y_bestYear")}</p> : null}

            <Card>
              <div className="flex items-center gap-4">
                <Seal def={yd} size={72} locked={!j.stickers[yd.id]} pct={days / YEAR_DAYS} />
                <div className="grid min-w-0 flex-1 gap-1">
                  <p className="text-[15.5px] font-bold">{jt("s_hijri", { n: nf(y) })}</p>
                  <p className="text-[13.5px] leading-relaxed text-muted">{j.stickers[yd.id] ? jt("earned") : jt("y_sealHow", { n: nf(Math.min(days, YEAR_DAYS)), m: nf(YEAR_DAYS) })}</p>
                </div>
              </div>
            </Card>

            <section className="grid gap-4">
              <SectionTitle title={jt("y_cycles")} />
              <RowList>
                {(["khatm", "review", "tafsir", "hadith", "lemma", "mut"] as EngineId[]).map((e) => (
                  <Row key={e} title={jt(`e_${e}` as JKey)} trail={<span className="font-display text-[18px] tabular-nums">{nf(data.cycles[e] ?? 0)}</span>} />
                ))}
                <Row title={jt("y_certs")} trail={<span className="font-display text-[18px] tabular-nums">{nf(data.certs)}</span>} />
                {data.tree ? <Row title={jt("y_tree", { name: data.tree.name })} trail={<span className="font-display text-[18px] tabular-nums">{jt("stageN", { n: nf(data.tree.stage) })}</span>} /> : null}
              </RowList>
            </section>

            <section className="grid gap-4">
              <SectionTitle title={jt("y_stickers", { n: nf(data.feedSt.length + data.pathSt.length) })} />
              {data.feedSt.length + data.pathSt.length === 0 ? <p className="text-[14.5px] text-muted">{jt("y_noStickers")}</p> : (
                <div className="flex flex-wrap gap-2.5">
                  {data.pathSt.map((d) => <Seal key={d.id} def={d} size={58} />)}
                  {data.feedSt.slice(0, 40).map((d) => <StickerArt key={d.id} def={d} size={58} />)}
                </div>
              )}
            </section>

            <div className="grid justify-items-start gap-2">
              <GoldButton onClick={share}>{jt("y_share")}</GoldButton>
              {msg ? <p role="status" className="text-[13px] text-[rgb(var(--hm-gold-d))]">{msg}</p> : null}
            </div>
            <HorizonVerse />
          </>
        )}
      </LearnMain>
    </>
  );
}
