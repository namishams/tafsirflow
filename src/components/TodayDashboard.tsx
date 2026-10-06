"use client";
import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { STAGES, dueVerses, readSrs, stats } from "@/lib/learning";
import { readJSON } from "@/lib/storage";
import { fetchMe, type Me } from "@/lib/sync";

type Last = { chapter: number; verse: number };

function Tile({ label, value, hint }: { label: string; value: string | number; hint?: string }) {
  return (
    <div className="min-w-0 bg-surface p-4 sm:p-5">
      <p className="text-[13px] font-medium text-ink">{label}</p>
      <p className="mt-1.5 font-display text-[32px] leading-none">{value}</p>
      {hint && <p className="mt-2 text-[13px] leading-snug text-muted">{hint}</p>}
    </div>
  );
}

// "Today": what to do now, at a glance (tiles + one clear next step)
export default function TodayDashboard() {
  const t = useTranslations("today");
  const locale = useLocale();
  const [me, setMe] = useState<Me | null>(null);
  const [dateText, setDateText] = useState(""); // set in the browser: some locales use other calendars, server and browser would differ
  const [d, setD] = useState({ due: [] as string[], streak: 0, todayCount: 0, secure: 0, learned: 0, marks: 0, notes: 0, last: null as Last | null });

  useEffect(() => {
    const load = () => {
      const srs = readSrs();
      const st = stats();
      setD({
        due: dueVerses(srs),
        streak: st.streak,
        todayCount: st.todayCount,
        learned: Object.keys(srs).length,
        secure: Object.values(srs).filter((v) => v.stage >= 3).length,
        marks: readJSON<string[]>("tf:bookmarks", []).length,
        notes: Object.keys(readJSON<Record<string, unknown>>("tf:notes", {})).length,
        last: readJSON<Last | null>("tf:last", null),
      });
    };
    load();
    setDateText(new Date().toLocaleDateString(locale, { calendar: "gregory", numberingSystem: "latn", weekday: "long", year: "numeric", month: "long", day: "numeric" }));
    fetchMe().then((r) => setMe(r.user));
    window.addEventListener("tf-synced", load);
    return () => window.removeEventListener("tf-synced", load);
  }, []);

  const first = d.due[0];
  const step = first
    ? { eyebrow: t("stepReview"), title: t("reviewTitle", { n: d.due.length }), body: t("reviewBody"), cta: t("reviewCta"), href: `/surah/${first.split(":")[0]}?v=${first.split(":")[1]}&m=2&r=1` }
    : d.last
      ? { eyebrow: t("stepContinue"), title: t("continueTitle", { surah: d.last.chapter, verse: d.last.verse }), body: t("continueBody"), cta: t("continueCta"), href: `/surah/${d.last.chapter}?v=${d.last.verse}` }
      : { eyebrow: t("stepStart"), title: t("startTitle"), body: t("startBody"), cta: t("startCta"), href: "/surah/1" };

  return (
    <main className="mx-auto max-w-3xl px-4 pb-16 pt-6">
      <div className="flex flex-wrap items-end justify-between gap-3 border-b border-line pb-5">
        <div>
          <h1 className="font-display text-[34px] leading-none">{t("title")}</h1>
          <p className="mt-2 text-[15px] text-muted">{me?.name ? `${me.name} · ` : ""}{dateText}</p>
        </div>
        <Link href="/quran" className="rounded-md border border-ink px-4 py-2.5 text-sm font-bold hover:bg-ink hover:text-bg">{t("library")}</Link>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-line bg-line">
        <Tile label={t("tileDue")} value={d.due.length} hint={d.due.length ? t("tileDueHint") : t("tileDueNone")} />
        <Tile label={t("tileStreak")} value={d.streak} hint={t("tileStreakHint")} />
        <Tile label={t("tileToday")} value={d.todayCount} hint={t("tileTodayHint")} />
        <Tile label={t("tileSecure")} value={d.secure} hint={t("tileSecureHint", { n: d.learned })} />
        <Tile label={t("tileMarks")} value={d.marks} />
        <Tile label={t("tileNotes")} value={d.notes} />
      </div>

      <section className="mt-6 rounded-lg border border-line border-s-4 border-s-accent bg-surface p-5">
        <p className="text-[13px] font-bold text-accent">{step.eyebrow}</p>
        <h2 className="font-display mt-1.5 text-2xl leading-tight">{step.title}</h2>
        <p className="mt-2 max-w-xl text-[15px] leading-relaxed text-muted">{step.body}</p>
        <Link href={step.href} className="mt-5 inline-flex h-12 items-center rounded-md bg-accent px-6 text-[15px] font-bold text-white hover:brightness-110">{step.cta}</Link>
      </section>

      <section className="mt-6 rounded-lg border border-line bg-surface p-5">
        <h2 className="text-[15px] font-bold">{t("scheduleTitle")}</h2>
        <p className="mt-1 text-sm text-muted">{t("scheduleBody")}</p>
        <ol className="mt-4 flex flex-wrap gap-2">
          {STAGES.map((n, i) => (
            <li key={n} className="rounded-md border border-line px-3 py-1.5 text-sm"><span className="font-bold">{i + 1}</span> <span className="text-muted">· {n} {t("days")}</span></li>
          ))}
        </ol>
      </section>

      {!me && (
        <section className="mt-6 flex flex-wrap items-center justify-between gap-4 rounded-lg border border-line bg-surface p-5">
          <p className="max-w-md text-[15px] leading-relaxed">{t("saveHint")}</p>
          <Link href="/account" className="inline-flex h-11 items-center rounded-md border border-ink px-5 text-sm font-bold hover:bg-ink hover:text-bg">{t("saveCta")}</Link>
        </section>
      )}
    </main>
  );
}
