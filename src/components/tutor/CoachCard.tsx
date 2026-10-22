"use client";
import { useEffect, useState } from "react";
import { useLocale } from "next-intl";
import { Link } from "@/i18n/navigation";
import { readJSON, writeJSON } from "@/lib/storage";
import { dailyCheckIn, fillNext, nextUi, practicePlan } from "@/lib/tutor/next";
import { TutorFace } from "./TutorChat";
import { useCoachInput } from "./coach";
import { useTutor } from "./state";

// The daily check-in and the recitation coach on the Shams screens (app: mobile/src/features/tutor/CoachCard.tsx).
// One calm message a day from the learner's own figures (no notification, hidden for the day with one tap); after a
// Shams step the 10-minute plan with links into the drills, and the way to ask the tutor (AI) about the weak spots.
const HIDE_KEY = "qmc.tutor.checkin.v1";
const today = () => new Date().toISOString().slice(0, 10);

export default function CoachCard({ after = false, className = "" }: { after?: boolean; className?: string }) {
  const locale = useLocale();
  const t = nextUi(locale);
  const { ui, name, persona } = useTutor();
  const input = useCoachInput();
  const [hidden, setHidden] = useState(true);
  useEffect(() => { setHidden(!after && readJSON<string>(HIDE_KEY, "") === today()); }, [after]);
  if (!input || hidden) return null;
  const ci = dailyCheckIn(input);
  const plan = after || input.spots.length ? practicePlan(input) : [];
  const f = (s: string, v: Record<string, string | number> = {}) => fillNext(s, { name, ...v });
  const ctx = JSON.stringify({ kind: "shams", title: t.coachTitle });
  return (
    <section className={`relative grid gap-3 rounded-3xl border border-[rgb(var(--gold)/0.45)] bg-[rgb(var(--surface)/0.72)] p-5 backdrop-blur-xl ${className}`} aria-label={after ? t.coachTitle : t.checkTitle}>
      <div className="flex items-center gap-3">
        <TutorFace persona={persona} size={40} still />
        <div className="min-w-0 flex-1">
          <p className="text-[11.5px] font-semibold uppercase tracking-[0.16em] text-[rgb(var(--gold))] rtl:tracking-normal">{after ? t.coachTitle : t.checkTitle}</p>
          <p className="text-[12.5px] text-muted">{after ? t.coachLead : t.fromData}</p>
        </div>
        {!after ? <button type="button" onClick={() => { writeJSON(HIDE_KEY, today(), true); setHidden(true); }} className="text-[12.5px] text-muted hover:text-ink">{t.dismiss}</button> : null}
      </div>
      {!after ? (
        <p className="text-[15px] leading-relaxed">
          {f(t.check[ci.kind], { n: ci.n ?? 0, ref: ci.ref ?? "" })}{" "}
          <Link href={ci.href} className="font-semibold text-accent hover:underline">{t.open}</Link>
        </p>
      ) : null}
      {plan.length ? (
        <div className="grid gap-1.5">
          <p className="text-[13px] font-semibold">{t.planTitle}</p>
          <ol className="grid gap-1.5">
            {plan.map((s, i) => (
              <li key={`${s.kind}${i}`}>
                <Link href={s.href} className="flex items-center justify-between gap-3 rounded-2xl border border-line px-3 py-2 text-[14px] transition hover:border-[rgb(var(--gold))]">
                  <span className="min-w-0">{f(t.steps[s.kind], { ref: s.ref ?? "", letter: s.letter ?? "" })}</span>
                  <span className="shrink-0 text-[12.5px] font-semibold text-[rgb(var(--gold))]">{f(t.min, { n: s.minutes })}</span>
                </Link>
              </li>
            ))}
          </ol>
        </div>
      ) : null}
      {input.spots.length || after ? (
        <Link href={{ pathname: "/assistant", query: { ctx, q: t.coachAsk } }}
          className="inline-flex w-fit items-center gap-2 rounded-full border border-[rgb(var(--gold)/0.6)] bg-[rgb(var(--gold)/0.08)] py-1.5 pe-4 ps-1.5 text-sm font-semibold transition hover:border-[rgb(var(--gold))]">
          <TutorFace persona={persona} size={26} still />{f(t.coachAskBtn)}
          <span className="rounded-full border border-[rgb(var(--gold)/0.7)] px-1.5 text-[10px] font-bold tracking-wider text-[rgb(var(--gold))]">{ui.ai}</span>
        </Link>
      ) : null}
    </section>
  );
}
