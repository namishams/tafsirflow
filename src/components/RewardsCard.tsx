"use client";
import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { dayNow, levelOf, readPoints, totalPoints } from "@/lib/points";
import { readListen } from "@/lib/listen";
import { HOUR_STICKERS, buildCtx, hoursOf, nextHourSticker } from "@/lib/stickers";
import Sticker from "./Sticker";
import { LevelSeal } from "./Rewards";

// Today: level, points, listening today and the next sticker
export default function RewardsCard() {
  const t = useTranslations("rewards");
  const locale = useLocale();
  const nf = (n: number) => new Intl.NumberFormat(locale, { numberingSystem: "latn", maximumFractionDigits: 0 }).format(n);
  const [v, setV] = useState<null | { total: number; today: number; listen: number; verses: number; hours: number; next: (typeof HOUR_STICKERS)[number] | null; prevH: number}>(null);
  useEffect(() => {
    const load = () => {
      const p = readPoints(), ctx = buildCtx(), d = readListen()[String(dayNow())];
      const next = nextHourSticker(ctx), hours = hoursOf(ctx);
      const i = next ? HOUR_STICKERS.indexOf(next) : HOUR_STICKERS.length;
      setV({ total: totalPoints(p), today: p.d[String(dayNow())] ?? 0, listen: d?.s ?? 0, verses: d?.v ?? 0, hours, next, prevH: i > 0 ? HOUR_STICKERS[i - 1].h : 0 });
    };
    load();
    const evs = ["tf-points", "tf-listen", "tf-synced"];
    evs.forEach((e) => window.addEventListener(e, load));
    return () => evs.forEach((e) => window.removeEventListener(e, load));
  }, []);
  if (!v) return <div className="mt-8 h-44 animate-pulse rounded-xl bg-line/40" />;
  const lvl = levelOf(v.total);
  const m = Math.round(v.listen / 60);
  return (
    <section className="stage girih relative mt-8 overflow-hidden rounded-xl text-[#eef0f3]">
      <div className="relative grid gap-5 p-5 sm:grid-cols-[auto_1fr_auto] sm:items-center sm:p-6">
        <Link href="/stats" className="flex items-center gap-4" aria-label={t("toStats")}>
          <LevelSeal n={lvl.n} size={76} />
          <span className="min-w-0">
            <span className="font-callig block text-3xl leading-tight text-[rgb(var(--gold))]" dir="rtl" lang="ar">{lvl.ar}</span>
            <span className="block text-sm font-semibold">{t("levelN", { n: lvl.n })}{locale !== "ar" ? ` · ${t(`l${lvl.n}`)}` : ""}</span>
          </span>
        </Link>
        <div className="min-w-0">
          <div className="flex justify-between gap-3 text-xs text-white/65"><span>{t("points", { n: nf(v.total) })}</span><span>{t("todayPts", { n: nf(v.today) })}</span></div>
          <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-[rgb(var(--gold))] transition-[width] duration-1000" style={{ width: `${Math.round(lvl.pct * 100)}%` }} /></div>
          <dl className="mt-4 grid grid-cols-3 gap-3 text-center sm:text-start">
            <div><dt className="font-display text-2xl text-[rgb(var(--gold))]">{m}</dt><dd className="text-[11px] leading-tight text-white/60">{t("minToday")}</dd></div>
            <div><dt className="font-display text-2xl text-[rgb(var(--gold))]">{nf(v.verses)}</dt><dd className="text-[11px] leading-tight text-white/60">{t("versesToday")}</dd></div>
            <div><dt className="font-display text-2xl text-[rgb(var(--gold))]">{new Intl.NumberFormat(locale, { numberingSystem: "latn", maximumFractionDigits: v.hours < 10 ? 1 : 0 }).format(v.hours)}</dt><dd className="text-[11px] leading-tight text-white/60">{t("hours")}</dd></div>
          </dl>
        </div>
        {v.next && (
          <Link href="/stats" className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/[0.04] p-3 sm:flex-col sm:text-center">
            <Sticker def={v.next} size={64} locked pct={(v.hours - v.prevH) / (v.next.h - v.prevH)} />
            <span className="text-xs leading-snug text-white/70">{t("nextShort")}<b className="block text-sm text-white">{locale === "ar" ? v.next.ar : t(`s_${v.next.id}`)}</b>{t("hoursN", { n: nf(v.next.h) })}</span>
          </Link>
        )}
      </div>
      <div className="relative flex flex-wrap gap-x-5 gap-y-2 border-t border-white/10 px-5 py-3 text-sm font-semibold sm:px-6">
        <Link href="/stats" className="text-[rgb(var(--gold))] hover:underline">{t("toStats")}</Link>
        <Link href="/ranking" className="text-white/80 hover:text-white hover:underline">{t("toRanking")}</Link>
      </div>
    </section>
  );
}
