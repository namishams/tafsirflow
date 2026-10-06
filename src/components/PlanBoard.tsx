"use client";
import { useEffect, useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { getChapters, type Chapter } from "@/lib/quran";
import { ORDER, PLAN_DAYS, TRACKS, cumulative, dayOfPlan, newPerDay, portion, ranges, readPlan, savePlan, type MyPlan, type Track } from "@/lib/plans";
import { today, dueVerses } from "@/lib/learning";
import { ageProfile } from "@/lib/age";

export default function PlanBoard() {
  const t = useTranslations("plan");
  const locale = useLocale();
  const [plan, setPlan] = useState<MyPlan | null | undefined>(undefined);
  const [choice, setChoice] = useState<Track["id"]>("standard");
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [due, setDue] = useState(0);
  const [rec, setRec] = useState<Track["id"] | null>(null);
  useEffect(() => { const a = ageProfile(); setRec(a.track); setChoice(a.track); }, []);
  useEffect(() => { setPlan(readPlan()); setDue(dueVerses().length); getChapters(locale).then(setChapters).catch(() => undefined); }, [locale]);
  const name = (s: number) => chapters.find((c) => c.id === s)?.name_simple ?? `${locale === "ar" ? "سورة" : "Surah"} ${s}`;
  const months = useMemo(() => Array.from({ length: 12 }, (_, m) => m + 1), []);
  if (plan === undefined) return null;

  const preview = TRACKS.find((x) => x.id === (plan?.track ?? choice))!;
  const yearTotal = cumulative(preview, PLAN_DAYS);

  const monthRow = (tr: Track, m: number) => {
    const end = cumulative(tr, Math.min(PLAN_DAYS, Math.round((PLAN_DAYS / 12) * m)));
    const last = ORDER[Math.max(0, end - 1)];
    return { end, last, perDay: newPerDay(tr, Math.round((PLAN_DAYS / 12) * m)) };
  };

  if (!plan) {
    return (
      <>
        <div className="mt-8 grid gap-px overflow-hidden rounded-lg border border-line bg-line sm:grid-cols-2">
          {TRACKS.map((tr) => (
            <button key={tr.id} onClick={() => setChoice(tr.id)} className={`bg-surface p-5 text-start hover:bg-bg ${choice === tr.id ? "outline outline-2 -outline-offset-2 outline-ink" : ""}`}>
              <span className="block text-xs font-semibold uppercase tracking-[0.12em] text-gold">{t(`${tr.id}For`)}{rec === tr.id ? ` · ${t("recommended")}` : ""}</span>
              <span className="mt-1 block text-lg font-bold">{t(tr.id)}</span>
              <span className="mt-1 block text-sm text-muted">{t("ramp", { start: tr.start, cap: tr.cap, every: tr.every, step: tr.step })}</span>
              <span className="mt-2 block text-sm font-semibold">{t("yearResult", { n: cumulative(tr, PLAN_DAYS), pct: Math.round((cumulative(tr, PLAN_DAYS) / ORDER.length) * 100) })}</span>
            </button>
          ))}
        </div>
        <MonthTable tr={preview} months={months} monthRow={monthRow} name={name} t={t} />
        <button onClick={() => { const p = { track: choice, startDay: today(), done: {}, at: Date.now() }; savePlan(p); setPlan(p); }} className="mt-6 h-12 rounded-md bg-accent px-6 text-[15px] font-bold text-white">{t("start", { name: t(choice) })}</button>
      </>
    );
  }

  const tr = TRACKS.find((x) => x.id === plan.track)!;
  const day = dayOfPlan(plan);
  // what is still open: everything scheduled up to today that is not marked done
  const scheduled = cumulative(tr, day);
  const doneCount = Object.values(plan.done).reduce((a, b) => a + b, 0);
  const todays = portion(tr, day);
  const backlog = Math.max(0, scheduled - doneCount - todays.length);
  const doneToday = (plan.done[today()] ?? 0) > 0;
  const first = ORDER[Math.min(doneCount, ORDER.length - 1)];
  const markDone = () => { const p = { ...plan, done: { ...plan.done, [today()]: (plan.done[today()] ?? 0) + todays.length }, at: Date.now() }; savePlan(p); setPlan(p); };

  return (
    <>
      <section className="mt-8 grid gap-px overflow-hidden rounded-lg border border-line bg-line sm:grid-cols-4">
        <div className="bg-surface p-5"><p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted">{t("track")}</p><p className="mt-2 text-lg font-bold">{t(tr.id)}</p></div>
        <div className="bg-surface p-5"><p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted">{t("day")}</p><p className="font-display mt-2 text-3xl tabular-nums">{Math.min(day, PLAN_DAYS)}<span className="text-lg text-muted"> / {PLAN_DAYS}</span></p></div>
        <div className="bg-surface p-5"><p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted">{t("learned")}</p><p className="font-display mt-2 text-3xl tabular-nums">{doneCount}</p><p className="mt-1 text-xs text-muted">{t("ofYear", { n: yearTotal })}</p></div>
        <div className="bg-surface p-5"><p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted">{t("review")}</p><p className="font-display mt-2 text-3xl tabular-nums">{due}</p><p className="mt-1 text-xs text-muted">{t("reviewHint")}</p></div>
      </section>

      <section className="mt-4 rounded-lg border border-line bg-surface p-5 sm:p-7">
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-gold">{t("today", { n: newPerDay(tr, day) })}</p>
        <ol className="mt-3 grid gap-2">
          <li className="flex gap-3"><span className="font-bold text-gold">1</span><span>{due > 0 ? <Link href="/today" className="font-semibold text-accent hover:underline">{t("stepReview", { n: due })}</Link> : t("stepReviewNone")}</span></li>
          <li className="flex gap-3"><span className="font-bold text-gold">2</span><span>
            {t("stepNew")}{" "}
            {ranges(todays).map((r) => <Link key={`${r.s}:${r.from}`} href={`/surah/${r.s}?v=${r.from}&shams=1`} className="me-2 inline-block font-semibold text-accent hover:underline">{name(r.s)} {r.from}{r.to > r.from ? `–${r.to}` : ""}</Link>)}
          </span></li>
          <li className="flex gap-3"><span className="font-bold text-gold">3</span><span>{t("stepChain")}</span></li>
          <li className="flex gap-3"><span className="font-bold text-gold">4</span><span>{t("stepTest")} <Link href={`/academy/${first.s}/${Math.max(1, first.v - ((first.v - 1) % 5))}`} className="font-semibold text-accent hover:underline">{t("toTest")}</Link></span></li>
          <li className="flex gap-3"><span className="font-bold text-gold">5</span><span>{t("stepNight")}</span></li>
        </ol>
        {backlog > 0 && <p className="mt-4 rounded-md bg-bg p-3 text-sm text-gold">{t("backlog", { n: backlog })}</p>}
        <button disabled={doneToday} onClick={markDone} className="mt-5 h-11 rounded-md bg-accent px-5 text-sm font-bold text-white disabled:opacity-50">{doneToday ? t("doneToday") : t("markDone")}</button>
      </section>

      <MonthTable tr={tr} months={months} monthRow={monthRow} name={name} t={t} current={Math.ceil(Math.min(day, PLAN_DAYS) / (PLAN_DAYS / 12))} />
      <button onClick={() => { if (confirm(t("resetConfirm"))) { savePlan(null); setPlan(null); } }} className="mt-6 text-sm text-muted underline">{t("reset")}</button>
    </>
  );
}

function MonthTable({ tr, months, monthRow, name, t, current }: { tr: Track; months: number[]; monthRow: (tr: Track, m: number) => { end: number; last: { s: number; v: number }; perDay: number }; name: (s: number) => string; t: ReturnType<typeof useTranslations>; current?: number }) {
  return (
    <section className="mt-8">
      <h2 className="text-lg font-bold">{t("months", { name: t(tr.id) })}</h2>
      <div className="mt-3 overflow-hidden rounded-lg border border-line">
        <table className="w-full text-sm">
          <thead className="bg-bg text-left text-xs uppercase tracking-[0.08em] text-muted"><tr><th className="p-3">{t("month")}</th><th className="p-3">{t("perDay")}</th><th className="p-3">{t("total")}</th><th className="hidden p-3 sm:table-cell">{t("reached")}</th></tr></thead>
          <tbody className="divide-y divide-line bg-surface">
            {months.map((m) => {
              const r = monthRow(tr, m);
              return (
                <tr key={m} className={current === m ? "bg-accent-soft" : ""}>
                  <td className="p-3 font-semibold">{m}</td>
                  <td className="p-3 tabular-nums">{r.perDay}</td>
                  <td className="p-3 tabular-nums">{r.end} <span className="text-muted">({Math.round((r.end / ORDER.length) * 100)}%)</span></td>
                  <td className="hidden p-3 sm:table-cell">{name(r.last.s)} {r.last.v}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
