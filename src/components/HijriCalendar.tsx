"use client";
import { useEffect, useMemo, useState } from "react";
import { useLocale } from "next-intl";
import { Link } from "@/i18n/navigation";
import {
  DAY, EVENTS, HIJRI_MONTHS, addMonths, calText, daysBetween, fmtGregorian, fmtHijri, fromHijri, hijriMonthName, monthGrid, monthLength, nextOccurrence, toHijri, todayUtc,
} from "@/lib/hijri";
import { Rosette } from "./Ornaments";

const NIGHTS = new Set(["lastten", "qadr"]);
const toIso = (t: number) => new Date(t).toISOString().slice(0, 10);
const fromIso = (s: string) => { const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s); return m ? Date.UTC(+m[1], +m[2] - 1, +m[3]) : null; };

// Today's Hijri date, a month grid with the Gregorian days, countdowns to the important days and a small converter
export default function HijriCalendar() {
  const locale = useLocale();
  const ar = locale === "ar";
  const { t, ev } = calText(locale);
  const [today, setToday] = useState<number | null>(null);
  const [view, setView] = useState<{ y: number; m: number } | null>(null);
  useEffect(() => {
    const now = todayUtc();
    setToday(now);
    const h = toHijri(now);
    setView({ y: h.y, m: h.m });
  }, []);

  if (today === null || view === null) {
    return (
      <div aria-busy className="grid gap-6">
        <div className="h-56 animate-pulse rounded-2xl bg-line/40" />
        <div className="h-96 animate-pulse rounded-2xl bg-line/40" />
      </div>
    );
  }
  return (
    <div className="grid gap-12">
      <TodayCard today={today} locale={locale} t={t} ev={ev} ar={ar} />
      <MonthView today={today} view={view} setView={setView} locale={locale} t={t} ev={ev} ar={ar} />
      <Upcoming today={today} locale={locale} t={t} ev={ev} />
      <section className="callout rounded-lg p-5">
        <h2 className="font-display text-xl">{t("noteTitle")}</h2>
        <p className="mt-2 text-[15px] leading-relaxed">{t("note")}</p>
        <p className="mt-2 text-[14px] leading-relaxed text-muted">{t("sunset")}</p>
      </section>
      <Converter today={today} locale={locale} t={t} />
    </div>
  );
}

type T = ReturnType<typeof calText>["t"];
type Ev = ReturnType<typeof calText>["ev"];

function TodayCard({ today, locale, t, ev, ar }: { today: number; locale: string; t: T; ev: Ev; ar: boolean }) {
  const h = toHijri(today);
  const next = useMemo(() => EVENTS.map((e) => ({ e, o: nextOccurrence(e.m, e.d, today) })).filter((x) => x.o).sort((a, b) => a.o!.t - b.o!.t)[0], [today]);
  const n = next ? daysBetween(today, next.o!.t) : 0;
  return (
    <section className="stage relative overflow-hidden rounded-2xl px-5 py-9 text-[#eef0f3] sm:px-10">
      <span aria-hidden className="illum-frame" />
      {["start-1.5 top-1.5", "end-1.5 top-1.5", "bottom-1.5 start-1.5", "bottom-1.5 end-1.5"].map((c) => <Rosette key={c} size={24} className={`absolute ${c}`} />)}
      <div className="relative grid items-center gap-8 md:grid-cols-[1fr_auto]">
        <div className="text-center md:text-start">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[rgb(var(--gold))]">{t("todayIs")} · {fmtGregorian(today, locale, { weekday: "long" })}</p>
          <div className="mt-3 flex flex-wrap items-end justify-center gap-x-5 gap-y-1 md:justify-start">
            <span className="font-display text-[84px] leading-none sm:text-[104px]">{h.d}</span>
            <span className="pb-2">
              <span className="font-callig block text-[44px] leading-tight text-[rgb(var(--gold))] sm:text-[56px]" dir="rtl" lang="ar">{HIJRI_MONTHS[h.m - 1].ar}</span>
              <span className="block text-[18px] text-white/75">{ar ? `${h.y} هـ` : `${hijriMonthName(h.m, locale)} ${h.y} AH`}</span>
            </span>
          </div>
          <p className="mt-4 text-[15px] text-white/70">{fmtGregorian(today, locale, { day: "numeric", month: "long", year: "numeric" })}</p>
          <p className="mt-2 text-[13px] leading-relaxed text-white/50">{t("sunset")}</p>
        </div>
        {next && (
          <div className="mx-auto w-full max-w-xs rounded-xl border border-white/10 bg-white/[0.04] px-5 py-5 text-center">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/50">{t("upcoming")}</p>
            <p className="font-display mt-2 text-xl leading-snug">{ev(next.e.id).name}</p>
            <p className="font-display mt-1 text-4xl text-[rgb(var(--gold))]">{n === 0 ? t("todayCount") : n === 1 ? t("tomorrow") : t("days", { n })}</p>
            <p className="mt-1 text-[13px] text-white/60">{fmtGregorian(next.o!.t, locale, { day: "numeric", month: "long", year: "numeric" })}</p>
          </div>
        )}
      </div>
    </section>
  );
}

function MonthView({ today, view, setView, locale, t, ev, ar }: { today: number; view: { y: number; m: number }; setView: (v: { y: number; m: number }) => void; locale: string; t: T; ev: Ev; ar: boolean }) {
  const weekStart = locale === "en" ? 0 : 1;
  const grid = useMemo(() => monthGrid(view.y, view.m, weekStart), [view.y, view.m, weekStart]);
  const th = toHijri(today);
  const isCurrent = th.y === view.y && th.m === view.m;
  const evs = EVENTS.filter((e) => e.m === view.m);
  const last = grid.first + (grid.len - 1) * DAY;
  const span = `${fmtGregorian(grid.first, locale, { day: "numeric", month: "short" })} – ${fmtGregorian(last, locale, { day: "numeric", month: "short", year: "numeric" })}`;
  // weekday headers from a known Sunday (4 Jan 1970)
  const wd = Array.from({ length: 7 }, (_, i) => { const d = (weekStart + i) % 7; return { d, s: fmtGregorian(Date.UTC(1970, 0, 4 + d), locale, { weekday: "short" }) }; });
  const step = (k: number) => setView(addMonths(view.y, view.m, k));

  return (
    <section aria-labelledby="hc-month">
      <div className="flex items-center justify-between gap-2">
        <button type="button" onClick={() => step(-1)} aria-label={t("prev")} className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-line bg-surface hover:border-[rgb(201_166_94)]">
          <svg aria-hidden viewBox="0 0 24 24" className="h-5 w-5 rtl:-scale-x-100"><path d="M15 5l-7 7 7 7" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </button>
        <div className="min-w-0 text-center">
          <h2 id="hc-month" className="leading-tight">
            <span className="font-callig block text-[34px] text-gold sm:text-[42px]" dir="rtl" lang="ar">{HIJRI_MONTHS[view.m - 1].ar} {ar ? view.y : ""}</span>
            {!ar && <span className="font-display block text-xl">{hijriMonthName(view.m, locale)} {view.y}</span>}
          </h2>
          <p className="mt-1 text-[13px] text-muted">{span} · {t("days", { n: grid.len })}</p>
        </div>
        <button type="button" onClick={() => step(1)} aria-label={t("next")} className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-line bg-surface hover:border-[rgb(201_166_94)]">
          <svg aria-hidden viewBox="0 0 24 24" className="h-5 w-5 rtl:-scale-x-100"><path d="M9 5l7 7-7 7" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </button>
      </div>
      {!isCurrent && (
        <p className="mt-3 text-center"><button type="button" onClick={() => setView({ y: th.y, m: th.m })} className="text-sm font-semibold text-accent hover:underline">{t("backToday")}</button></p>
      )}

      <div className="mt-5 rounded-2xl border border-[rgb(201_166_94)]/30 bg-surface p-2 sm:p-4">
        <div className="grid grid-cols-7 gap-1 text-center" role="row">
          {wd.map((w) => <span key={w.d} role="columnheader" title={w.d === 5 ? t("friday") : undefined} className={`truncate py-1 text-[11px] font-semibold uppercase tracking-wide sm:text-[12px] ${w.d === 5 ? "text-gold" : "text-muted"}`}>{w.s}</span>)}
        </div>
        <div className="mt-1 grid grid-cols-7 gap-1">
          {grid.cells.map((c, i) => {
            if (!c) return <span key={`e${i}`} aria-hidden />;
            const e = evs.find((x) => x.d === c.h);
            const isToday = c.t === today;
            const white = c.h >= 13 && c.h <= 15;
            const g = new Date(c.t);
            const gDay = g.getUTCDate();
            const label = `${fmtHijri({ y: view.y, m: view.m, d: c.h }, locale)} · ${fmtGregorian(c.t, locale, { weekday: "long", day: "numeric", month: "long", year: "numeric" })}${e ? ` · ${ev(e.id).name}` : ""}`;
            return (
              <div key={c.t} aria-label={label} title={label} aria-current={isToday ? "date" : undefined}
                className={`relative flex min-h-[3.25rem] flex-col items-center justify-center rounded-lg border px-0.5 py-1 sm:min-h-[4.5rem] ${isToday ? "border-[rgb(201_166_94)] bg-[rgb(201_166_94)]/15 shadow-[0_0_0_2px_rgb(201_166_94/0.35)]" : white ? "border-transparent bg-accent-soft/60" : "border-transparent bg-bg"}`}>
                <span className={`font-display text-[16px] leading-none sm:text-[22px] ${e ? "text-gold" : ""}`}>{c.h}</span>
                <span className="mt-1 text-[10px] leading-none text-muted sm:text-[11px]">{gDay === 1 || c.h === 1 ? fmtGregorian(c.t, locale, { day: "numeric", month: "short" }) : gDay}</span>
                {e && <span aria-hidden className="absolute end-1 top-1 h-1.5 w-1.5 rotate-45 bg-[rgb(201_166_94)]" />}
              </div>
            );
          })}
        </div>
        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 px-1 text-[12px] text-muted">
          <span className="inline-flex items-center gap-1.5"><span aria-hidden className="h-3 w-3 rounded-sm border border-[rgb(201_166_94)] bg-[rgb(201_166_94)]/15" />{t("legendToday")}</span>
          <span className="inline-flex items-center gap-1.5"><span aria-hidden className="h-1.5 w-1.5 rotate-45 bg-[rgb(201_166_94)]" />{t("legendEvent")}</span>
          <span className="inline-flex items-center gap-1.5"><span aria-hidden className="h-3 w-3 rounded-sm bg-accent-soft" />{t("legendWhite")}</span>
        </div>
      </div>
      <p className="mt-3 text-[13px] text-muted">{t("white")} · <span className="text-gold">{t("friday")}</span></p>

      {evs.length > 0 && (
        <div className="mt-5">
          <h3 className="font-display text-xl">{t("thisMonth")}</h3>
          <ul className="mt-3 grid gap-2">
            {evs.map((e) => {
              const gt = fromHijri(view.y, view.m, e.d);
              return (
                <li key={e.id} className="flex flex-wrap items-baseline gap-x-3 gap-y-1 rounded-lg border border-line bg-surface px-4 py-3 text-[14.5px]">
                  <b className="text-gold">{e.d} {hijriMonthName(view.m, locale)}</b>
                  <span className="font-semibold">{ev(e.id).name}</span>
                  {gt !== null && <span className="text-muted">{fmtGregorian(gt, locale, { weekday: "short", day: "numeric", month: "long", year: "numeric" })}</span>}
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </section>
  );
}

function Upcoming({ today, locale, t, ev }: { today: number; locale: string; t: T; ev: Ev }) {
  const list = useMemo(() => EVENTS.map((e) => ({ e, o: nextOccurrence(e.m, e.d, today) })).filter((x) => x.o).sort((a, b) => a.o!.t - b.o!.t), [today]);
  return (
    <section>
      <h2 className="font-display text-3xl">{t("upcoming")}</h2>
      <ul className="mt-5 grid gap-3 md:grid-cols-2">
        {list.map(({ e, o }) => {
          const n = daysBetween(today, o!.t);
          const x = ev(e.id);
          return (
            <li key={e.id} className="relative flex flex-col overflow-hidden rounded-xl border border-line bg-surface p-5">
              <span aria-hidden className="niche !border-[rgb(201_166_94)]/20" />
              <div className="relative flex flex-wrap items-start justify-between gap-2">
                <h3 className="font-display min-w-0 text-[20px] leading-snug">{x.name}</h3>
                <span className="shrink-0 rounded-full bg-[rgb(201_166_94)]/15 px-3 py-1 text-[13px] font-bold text-gold">{n === 0 ? t("todayCount") : n === 1 ? t("tomorrow") : t("inDays", { n })}</span>
              </div>
              <p className="relative mt-1 text-[13.5px] text-muted">
                <span className="font-semibold text-ink">{fmtHijri({ y: o!.y, m: e.m, d: e.d }, locale)}</span> · {fmtGregorian(o!.t, locale, { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
              </p>
              <p className="relative mt-3 text-[15px] leading-relaxed">{x.desc}</p>
              {NIGHTS.has(e.id) && <p className="relative mt-1 text-[13px] text-muted">{t("nightNote")}</p>}
              {x.note && <p className="relative mt-2 text-[13.5px] italic leading-relaxed text-muted">{x.note}</p>}
              {e.link && <Link href={e.link} className="relative mt-auto inline-flex pt-3 text-sm font-semibold text-accent hover:underline">{t("more")}</Link>}
            </li>
          );
        })}
      </ul>
    </section>
  );
}

function Converter({ today, locale, t }: { today: number; locale: string; t: T }) {
  const h0 = toHijri(today);
  const [g, setG] = useState(toIso(today));
  const [hd, setHd] = useState({ y: h0.y, m: h0.m, d: h0.d });
  const gt = fromIso(g);
  const gh = gt !== null ? toHijri(gt) : null;
  const ht = fromHijri(hd.y, hd.m, hd.d);
  const len = monthLength(hd.y, hd.m);
  const sel = "w-full rounded-xl border border-line bg-bg px-3 py-3 text-[16px] focus:border-[rgb(201_166_94)] focus:outline-none";
  const lab = "text-[11px] font-semibold uppercase tracking-[0.16em] text-muted";
  return (
    <section>
      <h2 className="font-display text-3xl">{t("conv")}</h2>
      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <div className="rounded-xl border border-line bg-surface p-5">
          <h3 className="font-display text-lg">{t("convG")}</h3>
          <label className="mt-4 grid gap-2">
            <span className={lab}>{t("day")}</span>
            <input type="date" value={g} min="1937-03-14" max="2076-11-16" onChange={(e) => setG(e.target.value)} className={sel} />
          </label>
          <p className="mt-4 min-h-[3rem]" aria-live="polite">
            {gh && <><span className="font-display block text-2xl text-gold">{fmtHijri(gh, locale)}</span><span className="font-callig block text-2xl" dir="rtl" lang="ar">{gh.d} {HIJRI_MONTHS[gh.m - 1].ar} {gh.y}</span></>}
          </p>
        </div>
        <div className="rounded-xl border border-line bg-surface p-5">
          <h3 className="font-display text-lg">{t("convH")}</h3>
          <div className="mt-4 grid grid-cols-[1fr_2fr_1.3fr] gap-2">
            <label className="grid gap-2"><span className={lab}>{t("day")}</span>
              <select value={hd.d} onChange={(e) => setHd({ ...hd, d: Number(e.target.value) })} className={sel}>{Array.from({ length: 30 }, (_, i) => <option key={i} value={i + 1}>{i + 1}</option>)}</select>
            </label>
            <label className="grid min-w-0 gap-2"><span className={lab}>{t("month")}</span>
              <select value={hd.m} onChange={(e) => setHd({ ...hd, m: Number(e.target.value) })} className={sel}>{HIJRI_MONTHS.map((_, i) => <option key={i} value={i + 1}>{i + 1}. {hijriMonthName(i + 1, locale)}</option>)}</select>
            </label>
            <label className="grid gap-2"><span className={lab}>{t("year")}</span>
              <select value={hd.y} onChange={(e) => setHd({ ...hd, y: Number(e.target.value) })} className={sel}>{Array.from({ length: 31 }, (_, i) => h0.y - 15 + i).map((y) => <option key={y} value={y}>{y}</option>)}</select>
            </label>
          </div>
          <p className="mt-4 min-h-[3rem]" aria-live="polite">
            {ht !== null && hd.d <= len
              ? <span className="font-display block text-2xl text-gold">{fmtGregorian(ht, locale, { weekday: "long", day: "numeric", month: "long", year: "numeric" })}</span>
              : <span className="text-[14px] text-muted">{t("invalid")}</span>}
          </p>
        </div>
      </div>
    </section>
  );
}
