"use client";
import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { dayPlan, learner, type DayPlan, type Learner } from "@/lib/coach";
import { LESSONS as ARABIC_LESSONS, readArabic } from "@/lib/arabic";
import { getChapters, type Chapter } from "@/lib/quran";
import { ArrowNext } from "./Icons";
import { HomeCorners, HomeRing, HomeStar, StarGlyph } from "./art/HomeOrnaments";

// Reads the learner model on the device and refreshes it after a sync or when the tab gets focus
function useCoach() {
  const [s, setS] = useState<{ L: Learner; plan: DayPlan; arabic: number } | null>(null);
  useEffect(() => {
    const load = () => setS({ L: learner(), plan: dayPlan(), arabic: Object.values(readArabic().done).filter((x) => x.stars > 0).length });
    load();
    window.addEventListener("tf-synced", load);
    window.addEventListener("focus", load);
    return () => { window.removeEventListener("tf-synced", load); window.removeEventListener("focus", load); };
  }, []);
  return s;
}
function useNames() {
  const locale = useLocale();
  const [ch, setCh] = useState<Chapter[]>([]);
  useEffect(() => { getChapters(locale).then(setCh).catch(() => undefined); }, [locale]);
  return (id: number) => ch.find((c) => c.id === id)?.name_simple ?? String(id);
}
const verseHref = (s: number, v: number, review = false) => `/surah/${s}?v=${v}${review ? "&m=2&r=1" : "&shams=1"}`;

function Forecast({ days, dark = false }: { days: number[]; dark?: boolean }) {
  const t = useTranslations("coach");
  const locale = useLocale();
  const max = Math.max(1, ...days);
  return (
    <ol className="flex h-20 items-end gap-1.5" aria-label={t("forecast")}>
      {days.map((n, i) => {
        const d = new Date(Date.now() + i * 86400000);
        return (
          <li key={i} className="flex min-w-0 flex-1 flex-col items-center gap-1">
            <span className={`text-[10px] tabular-nums ${dark ? "text-white/55" : "text-muted"}`}>{n || ""}</span>
            <span className={`w-full max-w-[34px] rounded-t-full ${i === 0 ? "bg-gradient-to-b from-[#e9cf99] to-[#c6a65e] shadow-[0_6px_14px_-8px_rgb(150_116_52/.9)]" : dark ? "bg-white/25" : "bg-gradient-to-b from-accent/70 to-accent/40"}`} style={{ height: `${Math.max(4, (n / max) * 48)}px` }} />
            <span className={`text-[10px] ${dark ? "text-white/55" : "text-muted"}`}>{i === 0 ? t("todayShort") : d.toLocaleDateString(locale, { weekday: "narrow" })}</span>
          </li>
        );
      })}
    </ol>
  );
}

// Today: the coach's plan for this session, with the reason behind it
export function CoachCard() {
  const t = useTranslations("coach");
  const name = useNames();
  const c = useCoach();
  if (!c) return <div className="h-40 animate-pulse rounded-xl bg-line/40" />;
  const { plan, L } = c;
  const first = plan.repair[0] ?? plan.reviews[0];
  const href = first ? verseHref(Number(first.split(":")[0]), Number(first.split(":")[1]), true) : verseHref(plan.next.surah, plan.next.verse);
  return (
    <section className="hm-card relative overflow-hidden p-5 sm:p-6">
      <HomeCorners />
      <span aria-hidden className="font-callig pointer-events-none absolute -top-3 end-4 text-[72px] leading-none text-[rgb(var(--hm-gold))]/[0.1]">خطة</span>
      <div className="relative flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="font-display flex items-center gap-2 text-xl"><StarGlyph size={14} className="text-[rgb(var(--hm-gold))]" />{t("planTitle")}</h2>
        <span className="rounded-full border border-[rgb(var(--hm-gold))]/35 bg-[rgb(var(--hm-gold))]/10 px-2.5 py-0.5 text-[13px] font-semibold tabular-nums text-[rgb(var(--hm-gold-d))]">{t("planMinutes", { n: plan.minutes })}</span>
      </div>
      <p className="mt-1 text-[14px] leading-relaxed text-muted">{t(`reason_${plan.reason}`)}</p>
      <ul className="mt-4 grid grid-cols-3 gap-2 text-center">
        {([[plan.reviews.length, t("planReviews"), "light"], [plan.repair.length, t("planRepair"), "light"], [plan.newVerses, t("planNew"), "gold"]] as [number, string, "light" | "gold"][]).map(([n, l, tone]) => (
          <li key={l} className="flex flex-col items-center rounded-lg border border-[rgb(var(--hm-gold))]/20 bg-[rgb(var(--hm-ivory))] px-2 pb-2.5 pt-3">
            <HomeStar size={46} tone={tone} className="!text-[17px]">{n}</HomeStar>
            <p className="mt-1.5 text-[11px] leading-tight text-muted">{l}</p>
          </li>
        ))}
      </ul>
      <p className="mt-3 text-[13px] text-muted">{t("nextBody", { surah: name(plan.next.surah), v: plan.next.verse })}</p>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <Link href={href} className="btn-gold inline-flex h-11 items-center rounded-full px-5 text-[14px] font-bold">{t("startPlan")} <ArrowNext /></Link>
        <Link href="/profile" className="text-[13px] font-semibold text-accent hover:underline">{t("title")} <ArrowNext /></Link>
      </div>
      {L.learned > 0 && <div className="mt-5 border-t border-[rgb(var(--hm-gold))]/20 pt-4"><p className="mb-2 text-xs font-semibold text-muted">{t("forecast")}</p><Forecast days={L.forecast} /></div>}
    </section>
  );
}

// Profile: how far the learner is – Quran share, memory, pace, surahs done and in progress, what needs attention
export default function ProgressPanel() {
  const t = useTranslations("coach");
  const locale = useLocale();
  const name = useNames();
  const c = useCoach();
  if (!c) return <div className="h-72 animate-pulse rounded-xl bg-line/40" />;
  const { L } = c;
  const pct = L.percent * 100;
  const mem = L.memory < 0.85 ? "memLow" : L.memory > 1.3 ? "memHigh" : "memAvg";
  return (
    <section id="progress" className="overflow-hidden rounded-xl border border-[rgb(var(--hm-gold))]/30 bg-surface">
      <div className="stage girih relative grid gap-6 p-5 text-[#eef0f3] sm:grid-cols-[auto_1fr] sm:items-center sm:p-6">
        <HomeRing id="pp-ring" value={Math.max(L.learned ? 0.012 : 0, L.percent)} size={124} stroke={7} className="mx-auto">
          <span><span className="font-display block text-2xl leading-none">{pct < 10 ? pct.toFixed(1) : Math.round(pct)}&nbsp;%</span><span className="text-[10px] text-white/60">{t("ofQuran")}</span></span>
        </HomeRing>
        <div className="min-w-0">
          <h2 className="font-display text-2xl">{t("title")}</h2>
          <p className="mt-1 text-[14px] text-white/70">{L.learned ? t("learnedN", { n: L.learned, solid: L.solid, done: L.complete.length }) : t("empty")}</p>
          <Link href={verseHref(L.next.surah, L.next.verse)} className="btn-gold mt-4 inline-flex h-11 items-center rounded-full px-5 text-[14px] font-bold">{t("nextBody", { surah: name(L.next.surah), v: L.next.verse })} <ArrowNext /></Link>
          <p className="mt-2 text-[11px] text-white/45">{t("noBasmala")}</p>
        </div>
      </div>

      {L.learned > 0 && (
        <div className="grid gap-6 p-5 sm:p-6">
          <dl className="grid grid-cols-3 gap-2">
            <div className="rounded-lg border border-[rgb(var(--hm-gold))]/20 bg-[rgb(var(--hm-ivory))] p-3"><dt className="text-[11px] text-muted">{t("retention")}</dt><dd className="font-display mt-1 text-2xl tabular-nums">{L.retention === null ? "–" : `${Math.round(L.retention * 100)} %`}</dd></div>
            <div className="rounded-lg border border-[rgb(var(--hm-gold))]/20 bg-[rgb(var(--hm-ivory))] p-3"><dt className="text-[11px] text-muted">{t("memory")}</dt><dd className="font-display mt-1 text-2xl tabular-nums">{L.memory.toLocaleString(locale, { minimumFractionDigits: 2, maximumFractionDigits: 2, numberingSystem: "latn" } as Intl.NumberFormatOptions)}</dd></div>
            <div className="rounded-lg border border-[rgb(var(--hm-gold))]/20 bg-[rgb(var(--hm-ivory))] p-3"><dt className="text-[11px] text-muted">{t("pace")}</dt><dd className="font-display mt-1 text-2xl tabular-nums">{L.pace || "–"}</dd></div>
          </dl>
          <p className="-mt-3 text-[13px] leading-relaxed text-muted">{t(mem)} {t("paceHint", { days: L.activeDays })}</p>

          <div><p className="mb-2 text-xs font-semibold text-muted">{t("forecast")}</p><Forecast days={L.forecast} /></div>

          {L.working.length > 0 && (
            <div>
              <h3 className="text-[15px] font-bold">{t("working")}</h3>
              <ul className="mt-3 grid gap-2.5 sm:grid-cols-2">
                {L.working.slice(0, 8).map((p) => (
                  <li key={p.id} className="min-w-0">
                    <Link href={verseHref(p.id, p.next ?? 1)} className="block rounded-lg border border-[rgb(var(--hm-gold))]/25 p-3 transition hover:border-[rgb(var(--hm-gold))]/70">
                      <span className="flex items-center justify-between gap-2 text-sm"><span className="truncate font-semibold">{p.id}. {name(p.id)}</span><span className="shrink-0 tabular-nums text-muted">{p.learned}/{p.total}</span></span>
                      <span className="hm-bar mt-2.5"><i style={{ width: `${Math.round((p.learned / p.total) * 100)}%` }} /></span>
                      <span className="mt-1.5 block text-xs text-muted">{t("continueAt", { v: p.next ?? 1 })}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {L.fading.length > 0 && (
            <div className="rounded-lg border border-gold/40 bg-gold/5 p-4">
              <h3 className="text-[15px] font-bold">{t("fading")}</h3>
              <p className="mt-1 text-[13px] text-muted">{t("fadingHint")}</p>
              <ul className="mt-3 flex flex-wrap gap-2">
                {L.fading.map((p) => <li key={p.id}><Link href={`/surah/${p.id}?v=1&m=2`} className="inline-flex items-center gap-2 rounded-full border border-line bg-surface px-3 py-1.5 text-[13px] font-semibold hover:border-ink">{name(p.id)} <span className="tabular-nums text-muted">{Math.round((p.avg ?? 0) * 100)} %</span></Link></li>)}
              </ul>
            </div>
          )}

          {L.complete.length > 0 && (
            <div>
              <h3 className="text-[15px] font-bold">{t("complete")} <span className="font-normal text-muted">· {L.complete.length}</span></h3>
              <ul className="mt-3 flex flex-wrap gap-1.5">
                {L.complete.map((p) => <li key={p.id}><Link href={`/surah/${p.id}`} className="inline-flex rounded-full bg-accent-soft px-3 py-1 text-[13px] font-semibold text-accent">{name(p.id)}</Link></li>)}
              </ul>
            </div>
          )}
        </div>
      )}

      <div className="border-t border-[rgb(var(--hm-gold))]/20 p-5 sm:p-6">
        <Link href="/arabic" className="block">
          <span className="flex items-center justify-between text-sm"><span className="font-semibold">{t("arabic")}</span><span className="tabular-nums text-muted">{t("arabicHint", { done: c.arabic, total: ARABIC_LESSONS.length })}</span></span>
          <span className="hm-bar is-gold mt-2.5"><i style={{ width: `${Math.round((c.arabic / Math.max(1, ARABIC_LESSONS.length)) * 100)}%` }} /></span>
        </Link>
      </div>
    </section>
  );
}

// Quran map: what the coach reads from the map – next step, what fades first, the coming reviews
export function MapInsights() {
  const t = useTranslations("coach");
  const name = useNames();
  const c = useCoach();
  if (!c || c.L.learned === 0) return null;
  const { L } = c;
  return (
    <div className="mt-6 grid gap-3 sm:grid-cols-3">
      <Link href={verseHref(L.next.surah, L.next.verse)} className="rounded-lg border border-white/10 bg-white/[0.04] p-4 transition hover:border-white/30">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[rgb(var(--gold))]">{t("planNew")}</p>
        <p className="mt-2 text-[15px] font-semibold">{t("nextBody", { surah: name(L.next.surah), v: L.next.verse })}</p>
        <p className="mt-1 text-xs text-white/55">{t("learnedN", { n: L.learned, solid: L.solid, done: L.complete.length })}</p>
      </Link>
      <div className="rounded-lg border border-white/10 bg-white/[0.04] p-4">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[rgb(var(--gold))]">{t("fading")}</p>
        {L.fading.length ? (
          <ul className="mt-2 flex flex-wrap gap-1.5">{L.fading.map((p) => <li key={p.id}><Link href={`/surah/${p.id}?v=1&m=2`} className="inline-flex rounded-full border border-white/15 px-2.5 py-1 text-[13px] hover:border-white/40">{name(p.id)} · {Math.round((p.avg ?? 0) * 100)} %</Link></li>)}</ul>
        ) : <p className="mt-2 text-sm text-white/60">{t("reason_steady")}</p>}
      </div>
      <div className="rounded-lg border border-white/10 bg-white/[0.04] p-4">
        <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-[rgb(var(--gold))]">{t("forecast")}</p>
        <Forecast days={L.forecast} dark />
      </div>
    </div>
  );
}
