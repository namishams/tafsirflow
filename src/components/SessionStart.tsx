"use client";
import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import { dayPlan } from "@/lib/coach";
import { stats } from "@/lib/learning";
import { currentItem, itemUrl, readSession, readSummary, startSession, type Session, type SessionSummary } from "@/lib/session";

// The one big button of the day: start (or continue) today's guided session
export function SessionStart() {
  const t = useTranslations("session");
  const router = useRouter();
  const [s, setS] = useState<{ open: Session | null; minutes: number; count: number } | null>(null);
  useEffect(() => { const p = dayPlan(); setS({ open: readSession(), minutes: p.minutes, count: p.repair.length + p.reviews.length + p.newVerses }); }, []);
  if (!s) return <div className="h-14 w-full max-w-sm animate-pulse rounded-full bg-white/10" />;
  const go = () => { const sess = s.open ?? startSession(); const it = currentItem(sess); if (it) router.push(itemUrl(it)); };
  return (
    <button onClick={go} className="btn-gold group inline-flex h-14 items-center justify-center gap-3 rounded-full px-7 text-[16px] font-bold shadow-[0_10px_30px_-12px_rgb(214_180_108/0.8)]">
      <span className="relative grid h-7 w-7 place-items-center rounded-full bg-[rgb(var(--stage))]/90 text-[rgb(var(--gold))]">
        <span className="absolute inset-0 animate-ping rounded-full bg-[rgb(var(--gold))]/30" aria-hidden />
        <svg viewBox="0 0 24 24" className="relative h-3.5 w-3.5" fill="currentColor" aria-hidden><path d="M8 5.5v13l11-6.5z" /></svg>
      </span>
      {s.open ? t("resume", { n: s.open.i + 1, total: s.open.items.length }) : t("start", { min: s.minutes })}
      {!s.open && <span className="hidden text-[13px] font-semibold opacity-70 sm:inline">· {t("steps", { n: s.count })}</span>}
    </button>
  );
}

// After the last verse: a calm celebration with what was done today
export function SessionDone() {
  const t = useTranslations("session");
  const [d, setD] = useState<(SessionSummary & { streak: number }) | null>(null);
  useEffect(() => { const sum = readSummary(); if (sum && new URLSearchParams(location.search).get("session") === "done") setD({ ...sum, streak: stats().streak }); }, []);
  if (!d) return null;
  return (
    <section className="stage girih relative mt-6 overflow-hidden rounded-2xl p-6 text-center text-[#eef0f3] sm:p-8">
      <div aria-hidden className="pointer-events-none absolute inset-0">
        {Array.from({ length: 14 }, (_, i) => (
          <svg key={i} viewBox="0 0 24 24" className="star-rise absolute text-[rgb(var(--gold))]" style={{ left: `${(i * 71) % 100}%`, animationDelay: `${(i % 7) * 0.25}s`, width: 10 + (i % 4) * 4 }} fill="currentColor"><path d="M12 2l2.4 5.6L20 6l-1.6 5.6L22 12l-3.6.4L20 18l-5.6-1.6L12 22l-2.4-5.6L4 18l1.6-5.6L2 12l3.6-.4L4 6l5.6 1.6z" /></svg>
        ))}
      </div>
      <p className="font-callig gold-sheen relative text-[46px] leading-tight" dir="rtl">ما شاء الله</p>
      <h2 className="font-display relative mt-2 text-3xl">{t("doneTitle")}</h2>
      <dl className="relative mx-auto mt-6 grid max-w-md grid-cols-3 gap-3">
        <div className="rounded-xl bg-white/[0.06] p-3"><dt className="text-[11px] text-white/60">{t("doneVerses")}</dt><dd className="font-display text-3xl">{d.done}</dd></div>
        <div className="rounded-xl bg-white/[0.06] p-3"><dt className="text-[11px] text-white/60">{t("doneNew")}</dt><dd className="font-display text-3xl">{d.fresh}</dd></div>
        <div className="rounded-xl bg-white/[0.06] p-3"><dt className="text-[11px] text-white/60">{t("doneMin")}</dt><dd className="font-display text-3xl">{d.minutes}</dd></div>
      </dl>
      <p className="relative mt-5 text-[15px] text-white/75">{d.streak > 1 ? t("doneStreak", { n: d.streak }) : t("doneFirst")}</p>
      <p className="relative mt-2 text-[13px] text-white/55">{t("doneHadith")}</p>
      <Link href="/map" className="relative mt-5 inline-flex h-11 items-center rounded-full border border-white/25 px-5 text-sm font-semibold hover:border-white">{t("doneMap")} →</Link>
    </section>
  );
}
