"use client";
// mirrors mobile/src/features/plan/TodayPlanCard.tsx on the website (/today): today's steps of the personal 30-day plan
// with checkboxes and the streak; without a plan it invites to the personal path (/start). Same keys as the app
// (qmc.plan, qmc.plan.done), so a step ticked off on the website is ticked off in the app after the sync.
// Web difference: every step is free (no Pro locks).
import { Link } from "@/i18n/navigation";
import { useHydrated } from "@/lib/learn/store";
import { doneToday, planDay, streakOf, todaysSteps, toggleStep, useDone, usePlan } from "@/lib/learn/plan/plan";
import { fmt, usePlanT } from "@/lib/learn/plan/texts";
import { planWebHref } from "@/lib/learn/plan/web";
import { useShamsMode } from "@/lib/learn/shams2/mode";
import { HomeCorners } from "@/components/art/HomeOrnaments";
import { IconFlame } from "@/components/Icons";

export function TodayPlanCard({ className = "" }: { className?: string }) {
  const p = usePlanT();
  const ready = useHydrated();
  const plan = usePlan();
  const done = useDone();
  const { mode } = useShamsMode(); // the Shams steps open today's wird for Shams Method 2.0
  if (!ready) return null;
  if (!plan) {
    return (
      <section className={`hm-card relative flex flex-wrap items-center justify-between gap-4 p-5 sm:p-6 ${className}`}>
        <HomeCorners />
        <div className="min-w-0 flex-1">
          <h2 className="font-display text-[21px]">{p.makePlan}</h2>
          <p className="mt-1 max-w-xl text-[14px] leading-relaxed text-muted">{p.makePlanD}</p>
        </div>
        <Link href="/start" className="btn-gold inline-flex h-11 shrink-0 items-center rounded-full px-5 text-[14px] font-bold">{p.next} <span aria-hidden className="ms-1 inline-block rtl:-scale-x-100">→</span></Link>
      </section>
    );
  }
  const steps = todaysSteps(plan);
  const today = doneToday(done);
  const streak = streakOf(done);
  const all = steps.length > 0 && steps.every((s) => today.has(s.id));
  return (
    <section className={`hm-card relative p-5 sm:p-6 ${className}`}>
      <HomeCorners />
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <h2 className="font-display text-[21px]">{p.todayTitle}</h2>
          <p className="mt-0.5 text-[12.5px] text-muted">{fmt(p.dayOf, { n: planDay(plan) })}</p>
        </div>
        {streak > 0 ? (
          <span className="inline-flex h-7 shrink-0 items-center gap-1.5 rounded-full bg-[rgb(var(--hm-gold))]/12 px-2.5 text-[13px] font-bold">
            <IconFlame className="inline h-[15px] w-[15px] text-[rgb(var(--hm-gold-d))]" />{fmt(p.streak, { n: streak })}
          </span>
        ) : null}
      </div>
      <ul className="mt-3 divide-y divide-line overflow-hidden rounded-xl border border-line bg-surface">
        {steps.map((s) => {
          const on = today.has(s.id);
          return (
            <li key={s.id} className="flex min-h-14 items-center">
              <label className="flex cursor-pointer items-center self-stretch px-3.5">
                <input type="checkbox" checked={on} onChange={() => toggleStep(s.id, !on)} aria-label={p[`s_${s.id}`]} className="h-[22px] w-[22px] accent-[rgb(var(--accent))]" />
              </label>
              <Link href={planWebHref(s.id, s.href, mode)} className="flex min-w-0 flex-1 items-center gap-2 py-3 pe-3.5 transition hover:opacity-75">
                <span className="min-w-0 flex-1">
                  <span className={`block text-[15px] font-semibold ${on ? "text-muted line-through" : ""}`}>{p[`s_${s.id}`]}</span>
                  <span className="mt-0.5 block text-[12.5px] text-muted">{fmt(p.stepMin, { n: s.minutes })}</span>
                </span>
                <span aria-hidden className="text-muted rtl:-scale-x-100">›</span>
              </Link>
            </li>
          );
        })}
      </ul>
      {all ? <p role="status" className="mt-2.5 text-[14px] font-semibold text-accent">{p.todayDone}</p> : null}
      <Link href="/start" className="mt-2.5 inline-block py-1 text-[13.5px] font-medium text-accent hover:underline">{p.adjust}</Link>
    </section>
  );
}
