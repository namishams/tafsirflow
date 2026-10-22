"use client";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { FOUNDER_BOOK, FOUNDER_RECITER } from "@/lib/company";
import { IslamCorners } from "@/components/art/IslamArt";

// The founder, Nami Shams (owner's own statements, 22.10.2026; texts in messages → founderAbout):
//   "full"    – the section on the About page (focus, the book card, why Quran Masterclass, Mishary Alafasy, links)
//   "compact" – the "About the founder" block on the founder's Quran Talents profile
// App: mobile/src/features/library/FounderAbout.tsx.

/** the German translation of Nahj al-Balagha as a small book: emerald cover, gold frame and calligraphy */
export function FounderBook({ small = false }: { small?: boolean }) {
  const t = useTranslations("founderAbout");
  return (
    <a href={FOUNDER_BOOK.url} target="_blank" rel="noopener" className="isl-card isl-card-hover group flex items-center gap-4 p-4 text-start sm:gap-5 sm:p-5">
      <span aria-hidden className={`relative flex shrink-0 flex-col items-center justify-center rounded-[4px_10px_10px_4px] border border-[#D9B970]/70 bg-[linear-gradient(160deg,#0c4a37_0%,#06221a_100%)] shadow-[4px_6px_14px_rgba(0,0,0,0.25)] ${small ? "h-[92px] w-[66px]" : "h-[132px] w-[94px]"}`}>
        <span className="absolute inset-[5px] rounded-[2px_7px_7px_2px] border border-[#D9B970]/45" />
        <span className={`font-arabic leading-tight text-[rgb(233_207_153)] ${small ? "text-[15px]" : "text-[21px]"}`} dir="rtl">نهج البلاغة</span>
        <span className="mt-1 text-[8px] font-semibold uppercase tracking-[0.18em] text-[#D9B970]/80">Deutsch</span>
      </span>
      <span className="min-w-0">
        <span className="block text-[11px] font-semibold uppercase tracking-[0.2em] text-gold rtl:tracking-normal">{t("bookEyebrow")}</span>
        <span className="font-display mt-1 block text-[22px] leading-tight text-ink">{t("bookTitle")}</span>
        <span className="mt-1 block text-[14px] leading-snug text-muted">{t("bookSub")}</span>
        <span className="btn-gold mt-3 inline-flex h-9 items-center rounded-full px-4 text-[13px] font-bold">{t("bookCta")}</span>
      </span>
    </a>
  );
}

function ReciterLinks({ className = "" }: { className?: string }) {
  const t = useTranslations("founderAbout");
  const pill = "inline-flex h-10 items-center gap-2 rounded-full border border-[rgb(var(--isl-gold-soft))]/50 px-4 text-[13.5px] font-bold hover:border-[rgb(var(--isl-gold-soft))]";
  return (
    <div className={`flex flex-wrap gap-2.5 ${className}`}>
      <Link href={FOUNDER_RECITER.listen} className="btn-gold inline-flex h-10 items-center gap-2 rounded-full px-4 text-[13.5px] font-bold">
        <svg aria-hidden viewBox="0 0 24 24" className="h-3.5 w-3.5"><path d="M8 5.5v13l10.5-6.5z" fill="currentColor" /></svg>{t("linkListen")}
      </Link>
      <Link href={FOUNDER_RECITER.star} className={pill}>{t("linkStar")}</Link>
      <Link href={FOUNDER_RECITER.reciter} className={pill}>{t("linkReciter")}</Link>
      <Link href={FOUNDER_RECITER.path} className={pill}>{t("linkPath")}</Link>
    </div>
  );
}

export default function FounderAbout({ variant = "full" }: { variant?: "full" | "compact" }) {
  const t = useTranslations("founderAbout");
  if (variant === "compact") {
    return (
      <section aria-labelledby="founder-about" className="isl-card relative mt-4 w-full overflow-hidden p-5 text-start">
        <IslamCorners />
        <h2 id="founder-about" className="font-display relative text-[20px] leading-tight text-ink">{t("profileTitle")}</h2>
        <p className="relative mt-2 text-[14.5px] leading-relaxed text-muted">{t("profileShort")}</p>
        <div className="relative mt-4"><FounderBook small /></div>
        <ReciterLinks className="relative mt-4" />
        <Link href="/about#founder" className="relative mt-4 inline-block text-[14px] font-semibold text-accent hover:underline">{t("more")}</Link>
      </section>
    );
  }
  return (
    <section id="founder" aria-labelledby="founder-title" className="mx-auto max-w-6xl scroll-mt-24 px-5 py-16 sm:py-24">
      <div className="isl-card relative overflow-hidden px-6 py-10 sm:px-12 sm:py-14">
        <IslamCorners />
        <div className="relative grid gap-10 lg:grid-cols-[1.2fr_0.8fr]">
          <div>
            <p className="eyebrow text-gold">{t("eyebrow")}</p>
            <h2 id="founder-title" className="font-display mt-2 text-4xl leading-[1.08] sm:text-5xl">{t("title")}</h2>
            <p className="font-arabic mt-2 text-2xl text-gold" dir="rtl" lang="ar">نامي شمس</p>
            <p className="isl-serif mt-5 text-[18px] leading-relaxed">{t("lead")}</p>
            <h3 className="mt-9 text-lg font-bold">{t("focusTitle")}</h3>
            <p className="mt-2 text-[15.5px] leading-relaxed text-muted">{t("focus")}</p>
            <h3 className="mt-7 text-lg font-bold">{t("whyTitle")}</h3>
            <p className="mt-2 text-[15.5px] leading-relaxed text-muted">{t("why")}</p>
          </div>
          <div className="grid content-start gap-5">
            <FounderBook />
            <p className="text-[14.5px] leading-relaxed text-muted">{t("bookText")}</p>
          </div>
        </div>
        <div className="stage relative mt-12 overflow-hidden rounded-2xl px-6 py-8 text-[#eef0f3] sm:px-10">
          <p className="font-arabic text-3xl text-[rgb(233_207_153)]" dir="rtl" lang="ar">مشاري راشد العفاسي</p>
          <h3 className="font-display mt-3 text-3xl leading-tight">{t("misharyTitle")}</h3>
          <p className="mt-3 max-w-2xl text-[16px] leading-relaxed text-white/75">{t("mishary")}</p>
          <ReciterLinks className="mt-6 [&_a:not(.btn-gold)]:text-[#eef0f3]" />
        </div>
      </div>
    </section>
  );
}
