import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { duaOfMonth, hijriMonthName, surahOfDay, surahOfMonth } from "@/lib/featured";
import { getChapter, getResources, getVerseByKey, pickTranslation } from "@/lib/quran";
import { SUNNAH_DUAS } from "@/lib/sunnahDuas";
import { SUNNAH_DUAS_2 } from "@/lib/sunnahDuas2";
import { Rosette } from "./Ornaments";

const lang = (l: string) => (l === "de" ? "de" : l === "ar" ? "ar" : "en") as "de" | "en" | "ar";

// Home page: surah of the day, surah of the month, dua of the month and the dua generator – rendered on the server
export default async function Featured({ locale }: { locale: string }) {
  const t = await getTranslations({ locale, namespace: "featured" });
  const now = new Date();
  const day = surahOfDay(now), month = surahOfMonth(now), dua = duaOfMonth(now);
  const L = lang(locale);
  const monthName = hijriMonthName(now, locale);
  let tr = 20;
  try { tr = pickTranslation(locale, (await getResources()).translations); } catch { /* default */ }
  const [cDay, cMonth, qDua] = await Promise.all([
    getChapter(day.surah, locale).catch(() => null),
    getChapter(month.surah, locale).catch(() => null),
    dua.quran ? getVerseByKey(dua.quran, locale, tr).catch(() => null) : Promise.resolve(null),
  ]);
  const sDua = dua.sunnah ? [...SUNNAH_DUAS, ...SUNNAH_DUAS_2].find((d) => d.id === dua.sunnah) : undefined;
  const duaAr = qDua?.text_uthmani ?? sDua?.ar ?? "";
  const duaTr = L === "ar" ? "" : qDua?.translation?.replace(/<[^>]+>/g, "") ?? (sDua ? (L === "de" ? sDua.de : sDua.en) : "");
  const duaSrc = dua.quran ? `Quran ${dua.quran}` : sDua?.src ?? "";
  const card = "group relative flex flex-col overflow-hidden rounded-2xl border border-[rgb(201_166_94)]/30 bg-surface p-6 transition hover:-translate-y-0.5 hover:border-[rgb(201_166_94)]/60";
  const kicker = "relative text-[11px] font-semibold uppercase tracking-[0.18em] text-gold";
  const chapterLine = (c: Awaited<ReturnType<typeof getChapter>> | null, n: number) => (
    <>
      <p className="font-callig relative mt-3 text-4xl leading-tight text-gold" dir="rtl" lang="ar">سورة {c?.name_arabic ?? ""}</p>
      {L !== "ar" && <p className="relative mt-1 text-xl font-bold">{n}. {c?.name_simple ?? ""}</p>}
      <p className="relative text-sm text-muted">{c ? `${c.translated_name.name} · ${t("verses", { n: c.verses_count })}` : ""}</p>
    </>
  );
  return (
    <section className="mx-auto max-w-6xl px-5 py-14">
      <h2 className="font-display text-3xl sm:text-4xl">{t("title")}</h2>
      <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Link href={`/surah/${day.surah}`} className={card}>
          <span aria-hidden className="niche !border-[rgb(201_166_94)]/20" />
          <p className={kicker}>{t("day")}</p>
          {chapterLine(cDay, day.surah)}
          <p className="relative mt-3 flex-1 text-[14px] leading-relaxed text-muted">{day.friday ? t("friday") : t("dayLead")}</p>
          <span className="relative mt-4 text-sm font-semibold text-accent">{t("listen")}</span>
        </Link>
        <Link href={`/surah/${month.surah}${month.ref ? `?v=${month.ref.split(":")[1]}` : ""}`} className={card}>
          <span aria-hidden className="niche !border-[rgb(201_166_94)]/20" />
          <p className={kicker}>{t("month", { month: monthName })}</p>
          {chapterLine(cMonth, month.surah)}
          <p className="relative mt-3 flex-1 text-[14px] leading-relaxed text-muted">{month.reason[L]}</p>
          <span className="relative mt-4 text-sm font-semibold text-accent">{t("listen")}</span>
        </Link>
        <div className="stage relative flex flex-col overflow-hidden rounded-2xl p-6 text-[#eef0f3]">
          <span aria-hidden className="illum-frame" />
          <p className="relative text-[11px] font-semibold uppercase tracking-[0.18em] text-[rgb(var(--gold))]">{t("dua", { month: monthName })}</p>
          <p className="font-arabic relative mt-4 line-clamp-4 text-[21px] leading-[2] text-[rgb(233_207_153)]" dir="rtl" lang="ar">{duaAr}</p>
          {duaTr && <p className="relative mt-2 line-clamp-4 text-[14px] leading-relaxed text-white/70">{duaTr}</p>}
          <p className="relative mt-3 flex-1 text-xs text-white/50">{dua.reason[L]} · {duaSrc}</p>
          <Link href={dua.quran ? `/surah/${dua.quran.split(":")[0]}?v=${dua.quran.split(":")[1]}` : "/duas"} className="relative mt-4 text-sm font-semibold text-[rgb(var(--gold))] hover:underline">{dua.quran ? t("listen") : t("moreDuas")}</Link>
        </div>
        <Link href="/dua-generator" className="relative flex flex-col overflow-hidden rounded-2xl border border-[rgb(201_166_94)]/40 bg-[linear-gradient(160deg,#2f2a44_0%,#0e0c18_100%)] p-6 text-[#eef0f3] transition hover:-translate-y-0.5">
          <span aria-hidden className="niche" />
          <Rosette size={34} className="relative" />
          <p className="font-callig relative mt-3 text-4xl text-[rgb(233_207_153)]" dir="rtl" lang="ar">دعاء</p>
          <p className="relative mt-1 text-xl font-bold">{t("genTitle")}</p>
          <p className="relative mt-2 flex-1 text-[14px] leading-relaxed text-white/70">{t("genLead")}</p>
          <span className="relative mt-4 text-sm font-semibold text-[rgb(233_207_153)]">{t("genCta")}</span>
        </Link>
      </div>
    </section>
  );
}
