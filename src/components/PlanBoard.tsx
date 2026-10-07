"use client";
import { useEffect, useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { getChapters, type Chapter } from "@/lib/quran";
import { ORDER, PLAN_DAYS, TRACKS, cumulative, dayOfPlan, newPerDay, portion, ranges, readPlan, savePlan, type MyPlan, type Track } from "@/lib/plans";
import { today, dueVerses } from "@/lib/learning";
import { ageProfile } from "@/lib/age";
import { QuranRing, QuranStar } from "./art/QuranArt";

export default function PlanBoard() {
  const t = useTranslations("plan");
  const locale = useLocale();
  const [plan, setPlan] = useState<MyPlan | null | undefined>(undefined);
  const [choice, setChoice] = useState<Track["id"]>("standard");
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [due, setDue] = useState(0);
  const [rec, setRec] = useState<Track["id"] | null>(null);
  useEffect(() => { const a = ageProfile(); setRec(a.track); setChoice(a.track); }, []);
  useEffect(() => {
    const load = () => { setPlan(readPlan()); setDue(dueVerses().length); };
    load();
    window.addEventListener("tf-synced", load); // the account copy arrives after the first render on a new device
    getChapters(locale).then(setChapters).catch(() => undefined);
    return () => window.removeEventListener("tf-synced", load);
  }, [locale]);
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
        <div className="mt-8 grid gap-3 sm:grid-cols-2">
          {TRACKS.map((tr) => (
            <button key={tr.id} onClick={() => setChoice(tr.id)} aria-pressed={choice === tr.id} className="q-track">
              <span className="q-kicker block pe-5 text-[rgb(var(--q-ink-gold))]">{t(`${tr.id}For`)}{rec === tr.id ? ` · ${t("recommended")}` : ""}</span>
              <span className="mt-1 block text-lg font-bold">{t(tr.id)}</span>
              <span className="mt-1 block text-sm text-muted">{t("ramp", { start: tr.start, cap: tr.cap, every: tr.every, step: tr.step })}</span>
              <span className="mt-2 block text-sm font-semibold">{t("yearResult", { n: cumulative(tr, PLAN_DAYS), pct: Math.round((cumulative(tr, PLAN_DAYS) / ORDER.length) * 100) })}</span>
            </button>
          ))}
        </div>
        <MonthTable tr={preview} months={months} monthRow={monthRow} name={name} t={t} />
        <button onClick={() => { const p = { track: choice, startDay: today(), done: {}, at: Date.now() }; savePlan(p); setPlan(p); }} className="btn-gold mt-6 inline-flex h-12 items-center rounded-md px-6 text-[15px] font-bold">{t("start", { name: t(choice) })}</button>
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
      <section className="callout mt-8 grid items-center gap-5 rounded-xl p-5 sm:grid-cols-[auto_repeat(3,minmax(0,1fr))] sm:gap-6 sm:p-7">
        <QuranRing pct={(Math.min(day, PLAN_DAYS) / PLAN_DAYS) * 100} className="mx-auto h-32 w-32"><span className="q-kicker text-[10px] text-muted">{t("day")}</span><span className="font-display mt-1 text-3xl tabular-nums">{Math.min(day, PLAN_DAYS)}</span><span className="mt-1 text-xs tabular-nums text-muted">/ {PLAN_DAYS}</span></QuranRing>
        <div className="min-w-0 text-center sm:text-start"><p className="q-kicker text-[rgb(var(--q-ink-gold))]">{t("track")}</p><p className="mt-2 text-lg font-bold">{t(tr.id)}</p></div>
        <div className="min-w-0 text-center sm:text-start"><p className="q-kicker text-[rgb(var(--q-ink-gold))]">{t("learned")}</p><p className="font-display mt-2 text-3xl tabular-nums">{doneCount}</p><p className="mt-1 text-xs text-muted">{t("ofYear", { n: yearTotal })}</p></div>
        <div className="min-w-0 text-center sm:text-start"><p className="q-kicker text-[rgb(var(--q-ink-gold))]">{t("review")}</p><p className="font-display mt-2 text-3xl tabular-nums">{due}</p><p className="mt-1 text-xs text-muted">{t("reviewHint")}</p></div>
      </section>

      <section className="mt-4 rounded-xl border border-[rgb(201_166_94/0.3)] bg-surface p-5 sm:p-7">
        <p className="q-kicker text-[rgb(var(--q-ink-gold))]">{t("today", { n: newPerDay(tr, day) })}</p>
        <ol className="mt-4">
          <li className="q-step"><QuranStar n={1} className="!h-9 !w-9" /><span className="pt-1.5">{due > 0 ? <Link href="/today" className="font-semibold text-accent hover:underline">{t("stepReview", { n: due })}</Link> : t("stepReviewNone")}</span></li>
          <li className="q-step"><QuranStar n={2} className="!h-9 !w-9" /><span className="pt-1.5">
            {t("stepNew")}{" "}
            {ranges(todays).map((r) => <Link key={`${r.s}:${r.from}`} href={`/surah/${r.s}?v=${r.from}&shams=1`} className="me-2 inline-block font-semibold text-accent hover:underline">{name(r.s)} {r.from}{r.to > r.from ? `–${r.to}` : ""}</Link>)}
          </span></li>
          <li className="q-step"><QuranStar n={3} className="!h-9 !w-9" /><span className="pt-1.5">{t("stepChain")}</span></li>
          <li className="q-step"><QuranStar n={4} className="!h-9 !w-9" /><span className="pt-1.5">{t("stepTest")} <Link href={`/academy/${first.s}/${Math.max(1, first.v - ((first.v - 1) % 5))}`} className="font-semibold text-accent hover:underline">{t("toTest")}</Link></span></li>
          <li className="q-step"><QuranStar n={5} className="!h-9 !w-9" /><span className="pt-1.5">{t("stepNight")}</span></li>
        </ol>
        {backlog > 0 && <p className="mt-5 rounded-lg bg-[rgb(201_166_94/0.1)] p-3.5 text-sm text-[rgb(var(--q-ink-gold))]">{t("backlog", { n: backlog })}</p>}
        <button disabled={doneToday} onClick={markDone} className="btn-gold mt-6 inline-flex h-11 items-center rounded-md px-5 text-sm font-bold disabled:opacity-50">{doneToday ? t("doneToday") : t("markDone")}</button>
      </section>

      <MonthTable tr={tr} months={months} monthRow={monthRow} name={name} t={t} current={Math.ceil(Math.min(day, PLAN_DAYS) / (PLAN_DAYS / 12))} />
      <button onClick={() => { if (confirm(t("resetConfirm"))) { savePlan(null); setPlan(null); } }} className="mt-6 text-sm text-muted underline decoration-[rgb(201_166_94/0.6)] underline-offset-4 hover:text-ink">{t("reset")}</button>
    </>
  );
}

function MonthTable({ tr, months, monthRow, name, t, current }: { tr: Track; months: number[]; monthRow: (tr: Track, m: number) => { end: number; last: { s: number; v: number }; perDay: number }; name: (s: number) => string; t: ReturnType<typeof useTranslations>; current?: number }) {
  return (
    <section className="mt-8">
      <h2 className="font-display text-2xl">{t("months", { name: t(tr.id) })}</h2>
      <div className="mt-4 overflow-hidden rounded-xl border border-[rgb(201_166_94/0.3)]">
        <table className="q-table w-full text-sm">
          <thead><tr><th className="p-3">{t("month")}</th><th className="p-3">{t("perDay")}</th><th className="p-3">{t("total")}</th><th className="hidden p-3 sm:table-cell">{t("reached")}</th></tr></thead>
          <tbody className="divide-y divide-[rgb(201_166_94/0.16)] bg-surface">
            {months.map((m) => {
              const r = monthRow(tr, m);
              return (
                <tr key={m} className={current === m ? "is-now" : ""}>
                  <td className="p-3 font-semibold tabular-nums text-[rgb(var(--q-ink-gold))]">{m}</td>
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
