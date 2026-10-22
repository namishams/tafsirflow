"use client";
// "Für Schwestern" on the website, 1:1 with the app (mobile/src/features/sisters): the page, the opt-in setup, the
// "Meine Tage" card, the listening and understanding days and the gate on recitation pages. Texts, sources and rules:
// src/lib/sisters. Everything she chooses stays in this browser (never synced).
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { useLocale } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useStored } from "@/lib/learn/store";
import { shamsGrow } from "@/lib/learn/garden/garden";
import { useShams2 } from "@/lib/learn/shams2/model";
import { markListen, useLog } from "@/lib/learn/shams2/store";
import { SISTERS_REVIEW, SISTERS_ROUTES, SOURCES, sistersText } from "@/lib/sisters";
import { LISTEN_KEY, MADHHABS, SISTERS_KEY, gateFor, listenDaysOn, readSisters, saveSisters, setDays, setListenSwitch, shiftReviews, type GateKind } from "@/lib/sisters/state";
import type { Point, Position } from "@/lib/sisters/types";
import { IDENTITY_KEY, cleanIdentity } from "@/lib/identity";
import { GoldButton, OutlineButton } from "@/components/learn/ui";

export function useSis() { const l = useLocale(); return useMemo(() => sistersText(l), [l]); }
export function useSisters() { const raw = useStored<unknown>(SISTERS_KEY, null); return useMemo(() => readSisters(), [raw]); } // eslint-disable-line react-hooks/exhaustive-deps
function useListenOn() { const s = useSisters(); const raw = useStored<unknown>(LISTEN_KEY, null); return useMemo(() => listenDaysOn(s), [s, raw]); } // eslint-disable-line react-hooks/exhaustive-deps

const chip = (on: boolean) => `rounded-full border px-3.5 py-1.5 text-[14px] font-semibold transition ${on ? "border-accent bg-accent text-white" : "border-line bg-surface text-ink hover:border-accent/60"}`;
const card = "hm-card relative grid gap-3 p-5";

export function SrcLine({ ids }: { ids?: string[] }) {
  if (!ids?.length) return null;
  return <p className="mt-1.5 flex flex-wrap gap-x-3 gap-y-1 text-[11.5px]">{ids.map((id) => SOURCES[id]).filter(Boolean).map((s) => s.url
    ? <a key={s.title} href={s.url} target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">{s.title}</a>
    : <span key={s.title} className="text-muted">{s.title}</span>)}</p>;
}
export function ReviewLine() {
  const tx = useSis();
  return SISTERS_REVIEW.needs_review ? <p className="text-[12px] font-semibold text-[rgb(170,134,62)]">{tx.reviewLine}</p> : null;
}
function PositionRow({ p }: { p: Position }) {
  const tx = useSis();
  return <div className="border-t border-line py-3 first:border-t-0"><p className="text-[12px] font-bold tracking-wide text-[rgb(170,134,62)]">{tx.schools[p.school]}</p><p className="mt-1 text-[15px] leading-relaxed">{p.text}</p><SrcLine ids={p.src} /></div>;
}
function Points({ items }: { items: Point[] }) {
  return <div className={card}>{items.map((p) => <div key={p.text} className="border-t border-line pt-3 first:border-t-0 first:pt-0"><p className="text-[15px] leading-relaxed">{p.text}</p><SrcLine ids={p.src} /></div>)}</div>;
}

/** consent first, then her school; `onDone` after agreeing (and choosing) or declining */
export function SistersSetup({ dark, onDone }: { dark?: boolean; onDone?: (agreed: boolean) => void }) {
  const tx = useSis();
  const st = useSisters();
  const [step, setStep] = useState<"consent" | "madhhab" | "declined">(() => (readSisters().consent === true ? "madhhab" : "consent"));
  const soft = dark ? "text-white/70" : "text-muted";
  if (step === "declined") return <div className="grid gap-3"><p className={soft}>{tx.setup.declined}</p>{onDone ? <GoldButton onClick={() => onDone(false)}>{tx.setup.done}</GoldButton> : null}</div>;
  if (step === "consent") return (
    <div className="grid gap-3">
      <h2 className="font-display text-[24px] leading-tight">{tx.setup.title}</h2>
      <p className={soft}>{tx.setup.lead}</p>
      <ul className="grid gap-2 text-[14.5px]">{tx.setup.points.map((p) => <li key={p} className="flex gap-2"><span aria-hidden className="text-[rgb(214,180,108)]">✓</span><span>{p}</span></li>)}</ul>
      <GoldButton onClick={() => { saveSisters({ consent: true }); setStep("madhhab"); }}>{tx.setup.agree}</GoldButton>
      <OutlineButton dark={dark} onClick={() => { saveSisters({ consent: false }); setStep("declined"); }}>{tx.setup.decline}</OutlineButton>
    </div>
  );
  return (
    <div className="grid gap-3">
      <h2 className="font-display text-[22px] leading-tight">{tx.setup.madhhabTitle}</h2>
      <p className={soft}>{tx.setup.madhhabLead}</p>
      <div className="flex flex-wrap gap-2">{MADHHABS.map((m) => <button key={m} type="button" aria-pressed={st.madhhab === m} onClick={() => saveSisters({ madhhab: m })} className={chip(st.madhhab === m)}>{tx.setup.madhhabs[m]}</button>)}</div>
      {st.madhhab ? <p className={`text-[13.5px] ${soft}`}>{tx.days.rules[st.madhhab]}</p> : null}
      <p className={`text-[12.5px] ${soft}`}>{tx.setup.later}</p>
      {onDone ? <GoldButton disabled={!st.madhhab} onClick={() => onDone(true)}>{tx.setup.done}</GoldButton> : null}
    </div>
  );
}

export function DaysCard() {
  const tx = useSis();
  const st = useSisters();
  const [pick, setPick] = useState(false);
  useEffect(() => { shiftReviews(); }, []);
  if (st.consent !== true || !st.madhhab || pick) return <div className={card}><SistersSetup onDone={st.consent === true ? () => setPick(false) : undefined} /></div>;
  const m = st.madhhab;
  return (
    <section className={card}>
      <h2 className="text-[17px] font-bold">{tx.days.title}</h2>
      <p className="text-[13.5px] text-muted">{tx.days.lead}</p>
      <p className="font-semibold">{tx.days.question}</p>
      <div role="radiogroup" className="flex gap-2">
        <button type="button" role="radio" aria-checked={st.days} onClick={() => setDays(true)} className={chip(st.days)}>{tx.days.yes}</button>
        <button type="button" role="radio" aria-checked={!st.days} onClick={() => setDays(false)} className={chip(!st.days)}>{tx.days.no}</button>
      </div>
      <p className="text-[13px] font-semibold text-[rgb(170,134,62)]">{st.days ? tx.days.statusOn : tx.days.statusOff}</p>
      <p className="text-[13.5px]">{tx.days.rules[m]}</p>
      <label className="flex items-start gap-3 border-t border-line pt-3">
        <input type="checkbox" checked={st.strict} onChange={(e) => saveSisters({ strict: e.target.checked })} className="mt-1 h-4 w-4 accent-[rgb(170,134,62)]" />
        <span><span className="block font-semibold">{tx.days.strictTitle}</span><span className="block text-[12.5px] text-muted">{tx.days.strictLead}</span></span>
      </label>
      {st.days ? (
        <div className="grid gap-2 border-t border-line pt-3">
          <GoldButton onClick={() => setDays(false)}>{tx.days.offTitle}</GoldButton>
          <p className="text-[13px] text-muted">{tx.days.offNote}</p>
          <SrcLine ids={["ifta12343"]} />
          <Link href="/wudu" className="text-[13.5px] font-semibold text-accent hover:underline">{tx.days.ghuslLink}</Link>
        </div>
      ) : null}
      <button type="button" onClick={() => setPick(true)} className="text-start text-[13px] font-semibold text-accent hover:underline">{tx.days.changeMadhhab}: {tx.setup.madhhabs[m]}</button>
      <p className="text-[12px] text-muted">{tx.days.privacy}</p>
    </section>
  );
}

/** the listening and understanding days: the switch, or today's listening plan with "complete" */
export function ListenDaysCard({ compact }: { compact?: boolean }) {
  const tx = useSis();
  const on = useListenOn();
  const st = useSisters();
  const m = useShams2();
  const log = useLog();
  const [msg, setMsg] = useState(false);
  useEffect(() => { if (on) shiftReviews(); }, [on]);
  const first = m.wird.sabaq.ranges[0] ?? m.wird.sabqi.ranges[0];
  const listen = first ? `/surah/${first.s}?v=${first.from}` : "/quran";
  const href: Record<string, string> = { listen, eyes: listen, understand: `${SISTERS_ROUTES.understand}?s=${first?.s ?? 1}`, words: SISTERS_ROUTES.words, tajweed: SISTERS_ROUTES.tajweed, dua: SISTERS_ROUTES.duas };
  if (!on) return (
    <div className={card}>
      <label className="flex items-start gap-3">
        <input type="checkbox" checked={false} onChange={(e) => setListenSwitch(e.target.checked)} className="mt-1 h-4 w-4 accent-[rgb(170,134,62)]" />
        <span><span className="block font-bold">{tx.ld.on}</span>{!compact ? <span className="block text-[13px] text-muted">{tx.ld.lead}</span> : null}</span>
      </label>
      <p className="text-[12px] text-muted">{tx.ld.onHint}</p>
      <Link href={SISTERS_ROUTES.page} className="text-[13px] font-semibold text-accent hover:underline">{tx.ld.sistersLink}</Link>
    </div>
  );
  const done = msg || !!log[m.day]?.listen;
  return (
    <section className="stage relative grid gap-3 overflow-hidden rounded-2xl p-5 text-white" style={{ border: "1px solid rgba(214,180,108,0.45)" }}>
      <p lang="ar" dir="rtl" className="font-arabic text-[18px] text-[rgb(214,180,108)]">اِسْتِمَاع وَتَدَبُّر</p>
      <h2 className="font-display text-[21px] leading-tight">{tx.ld.activeTitle}</h2>
      <p className="text-[14px] text-white/75">{tx.ld.activeLead}</p>
      {tx.partShams.steps.map((s) => (
        <Link key={s.id} href={href[s.id]} className="block rounded-xl border border-[rgb(214,180,108)]/25 bg-white/[0.04] p-3 hover:bg-white/[0.08]">
          <span className="block font-semibold">{s.title}</span>{!compact ? <span className="block text-[12.5px] text-white/60">{s.text}</span> : null}
        </Link>
      ))}
      {done ? <p className="text-[13.5px] font-semibold text-[rgb(214,180,108)]">{tx.ld.doneMsg}</p> : <GoldButton onClick={() => { if (markListen(m.day)) shamsGrow("session", false); setMsg(true); }}>{tx.ld.done}</GoldButton>}
      {!st.days ? <OutlineButton dark onClick={() => setListenSwitch(false)}>{tx.ld.off}</OutlineButton> : <Link href={SISTERS_ROUTES.page} className="text-[13px] font-semibold text-[rgb(214,180,108)]">{tx.ld.sistersLink}</Link>}
    </section>
  );
}

/** wraps a recitation page: paused (calm state) or a note, by her school; "open anyway" is her own decision */
export function DaysGate({ kind, children }: { kind: GateKind; children: ReactNode }) {
  const tx = useSis();
  const st = useSisters();
  const gate = gateFor(kind, st);
  const [anyway, setAnyway] = useState(false);
  if (gate.state === "open" || anyway) return <>{children}</>;
  if (gate.state === "note") return <>
    <p role="note" className="mx-auto mt-4 max-w-4xl rounded-xl border border-[rgb(201,166,94)]/55 bg-surface px-4 py-3 text-[13.5px]">{gate.reason === "jafari" ? tx.gate.noteJafari : tx.gate.noteMaliki}</p>
    {children}
  </>;
  return (
    <main className="stage mx-auto grid min-h-[70vh] max-w-xl content-center gap-4 px-5 py-16 text-white">
      <h1 className="font-display text-[28px] leading-tight">{tx.gate.pausedTitle}</h1>
      <p className="text-[15px] leading-relaxed text-white/75">{gate.reason === "strict" ? tx.gate.pausedStrict : tx.gate.pausedMajority}</p>
      <Link href="/shams/wird" className="rounded-xl px-5 py-3 text-center font-semibold text-[#1a140a]" style={{ backgroundImage: "linear-gradient(180deg,#e9cf99,#c9a65e)" }}>{tx.gate.listenInstead}</Link>
      <Link href={SISTERS_ROUTES.page} className="rounded-xl border border-white/40 px-5 py-3 text-center font-semibold">{tx.gate.toSection}</Link>
      <button type="button" onClick={() => setAnyway(true)} className="py-2 text-[13.5px] text-white/60 hover:text-white">{tx.gate.openAnyway}</button>
      <p className="text-[12px] font-semibold text-[rgb(214,180,108)]">{SISTERS_REVIEW.needs_review ? tx.reviewLine : ""}</p>
    </main>
  );
}

/** Discover/Shams entry: for sisters (unless she declined), or `always` as a quiet link for everyone */
export function SistersEntryCard({ always }: { always?: boolean }) {
  const tx = useSis();
  const id = cleanIdentity(useStored<unknown>(IDENTITY_KEY, null));
  const st = useSisters();
  if (!always && (id.gender !== "sister" || st.consent === false)) return null;
  return (
    <Link href={SISTERS_ROUTES.page} className="stage relative grid gap-2 overflow-hidden rounded-2xl p-5 text-white hover:opacity-95" style={{ border: "1px solid rgba(214,180,108,0.45)" }}>
      <span lang="ar" dir="rtl" className="font-arabic text-[20px] text-[rgb(214,180,108)]">لِلْأَخَوَات</span>
      <span className="font-display text-[21px]">{tx.entryTitle}</span>
      <span className="text-[14px] text-white/75">{tx.entryLead}</span>
      <span className="text-[13px] font-semibold text-[rgb(214,180,108)]">{tx.entryCta}</span>
    </Link>
  );
}

/** /sisters */
export function SistersPage() {
  const tx = useSis();
  const st = useSisters();
  const used = new Set<string>();
  const add = (ids?: string[]) => ids?.forEach((i) => used.add(i));
  tx.partRecite.blocks.forEach((b) => { b.positions?.forEach((p) => add(p.src)); b.points?.forEach((p) => add(p.src)); });
  tx.partShams.steps.forEach((s) => add(s.src)); tx.partShams.notes.forEach((p) => add(p.src)); tx.partSajda.positions.forEach((p) => add(p.src));
  [...tx.partWomen.companions, ...tx.partWomen.scholars, ...tx.partWomen.reciters].forEach((p) => add(p.src));
  const H = ({ t, l }: { t: string; l?: string }) => <div><h2 className="font-display text-[24px] leading-tight">{t}</h2>{l ? <p className="mt-1 text-[15px] text-muted">{l}</p> : null}</div>;
  return (
    <>
      <section className="stage relative overflow-hidden text-white">
        <div className="mx-auto grid max-w-4xl gap-3 px-5 pb-10 pt-10">
          <p lang="ar" dir="rtl" className="font-arabic text-[26px] text-[rgb(214,180,108)]">لِلْأَخَوَات</p>
          <p className="text-[11.5px] font-semibold uppercase tracking-[0.16em] text-[rgb(214,180,108)] rtl:tracking-normal">{tx.kicker}</p>
          <h1 className="font-display text-[34px] leading-tight sm:text-[44px]">{tx.title}</h1>
          <p className="text-[16px] leading-relaxed text-white/75">{tx.lead}</p>
          {SISTERS_REVIEW.needs_review ? <p className="text-[12px] font-semibold text-[rgb(214,180,108)]">{tx.reviewLine}</p> : null}
        </div>
      </section>
      <main className="mx-auto grid max-w-4xl gap-8 px-4 pb-24 pt-8 sm:px-5">
        {st.consent !== false ? <DaysCard /> : null}
        <section className="grid gap-3"><H t={tx.partRecite.title} l={tx.partRecite.lead} />
          {tx.partRecite.blocks.map((b) => (
            <div key={b.id} className={card}><h3 className="text-[16px] font-bold">{b.title}</h3>
              {b.positions?.map((p, i) => <PositionRow key={i} p={p} />)}
              {b.points?.map((p) => <div key={p.text} className="border-t border-line pt-3 first:border-t-0"><p className="text-[15px] leading-relaxed">{p.text}</p><SrcLine ids={p.src} /></div>)}
            </div>
          ))}
        </section>
        <section className="grid gap-3"><H t={tx.partShams.title} l={tx.partShams.lead} /><ListenDaysCard /><Points items={tx.partShams.notes} /></section>
        <section className="grid gap-3"><H t={tx.partSajda.title} l={tx.partSajda.lead} /><div className={card}>{tx.partSajda.positions.map((p, i) => <PositionRow key={i} p={p} />)}</div></section>
        <section className="grid gap-3"><H t={tx.partWomen.title} l={tx.partWomen.lead} />
          <h3 className="font-bold">{tx.partWomen.versesTitle}</h3>
          <ul className="hm-card divide-y divide-line">{tx.partWomen.verses.map((v) => (
            <li key={v.ref}><Link href={SISTERS_ROUTES.verse(v.ref)} aria-label={`${v.ref}. ${v.topic}. ${tx.readVerse}`} className="flex gap-3 p-4 hover:bg-bg"><span className="min-w-12 font-bold text-[rgb(170,134,62)]">{v.ref}</span><span className="text-[14.5px]">{v.topic}</span></Link></li>
          ))}</ul>
          <h3 className="mt-2 font-bold">{tx.partWomen.companionsTitle}</h3><Points items={tx.partWomen.companions} />
          <h3 className="mt-2 font-bold">{tx.partWomen.recitersTitle}</h3><Points items={tx.partWomen.reciters} />
          <h3 className="mt-2 font-bold">{tx.partWomen.scholarsTitle}</h3><Points items={tx.partWomen.scholars} />
        </section>
        <section className="grid gap-3"><H t={tx.partTogether.title} l={tx.partTogether.lead} />
          <div className={card}>
            <p>{tx.partTogether.teacher}</p><Link href={SISTERS_ROUTES.teacher} className="font-semibold text-accent hover:underline">{tx.partTogether.teacherCta}</Link>
            <p>{tx.partTogether.circles}</p><Link href={SISTERS_ROUTES.circles} className="font-semibold text-accent hover:underline">{tx.partTogether.circlesCta}</Link>
          </div>
        </section>
        <section className="grid gap-2"><H t={tx.sourcesTitle} />
          <ul className="grid gap-1.5 text-[12.5px]">{[...used].map((id) => SOURCES[id]).filter(Boolean).map((s) => <li key={s.title}>{s.url ? <a href={s.url} target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">{s.title}</a> : s.title}</li>)}</ul>
        </section>
        <div className="grid gap-2"><ReviewLine /><p className="font-semibold">{tx.notFatwa}</p></div>
      </main>
    </>
  );
}
