import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { AppStoreButton } from "@/components/AppShowcase";

// The iOS app in store-style screenshots: headline, benefits, the App Store badge (or "coming soon" until the link in
// src/lib/appstore.ts is set) and a row of phones in a CSS frame (no device artwork). Real screenshots of the app from
// the iOS simulator, as WebP in public/images/app. Texts: messages → promo.shots*. On the home page and on /app.
const SHOTS = ["shams", "swipe", "hadith", "nahj", "stickers", "feed"] as const;
const CAP = { shams: "shotShams", swipe: "shotSwipe", hadith: "shotHadith", nahj: "shotNahj", stickers: "shotStickers", feed: "shotFeed" } as const;

export default async function AppScreens({ locale, showMore = true, headingLevel = 2 }: { locale: string; showMore?: boolean; headingLevel?: 1 | 2 }) {
  const t = await getTranslations({ locale, namespace: "promo" });
  const H = headingLevel === 1 ? "h1" : "h2";
  return (
    <section aria-labelledby="app-shots-title" className="stage girih relative overflow-hidden text-[#eef0f3]">
      <div className="relative mx-auto max-w-6xl px-4 py-14 sm:px-5 sm:py-20">
        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
          <div>
            <p className="text-[12px] font-semibold uppercase tracking-[0.22em] text-[rgb(var(--gold))] rtl:tracking-normal">{t("shotsKicker")}</p>
            <H id="app-shots-title" className="font-display mt-3 text-[32px] leading-[1.08] sm:text-5xl">{t("shotsTitle")}</H>
            <p className="mt-4 max-w-xl text-[16px] leading-relaxed text-white/75">{t("shotsLead")}</p>
          </div>
          <div>
            <ul className="grid gap-2.5 text-[15px] text-white/85">
              {(["shotsB1", "shotsB2", "shotsB3", "shotsB4"] as const).map((k) => (
                <li key={k} className="flex gap-3"><span aria-hidden className="mt-2 h-1.5 w-1.5 shrink-0 rotate-45 bg-[rgb(var(--gold))]" />{t(k)}</li>
              ))}
            </ul>
            <div className="mt-6 flex flex-wrap items-center gap-4">
              <AppStoreButton label={t("appStore")} soon={t("appSoon")} top={t("appBadgeTop")} />
              {showMore && <Link href="/app" className="text-[15px] font-semibold text-white/80 underline-offset-4 hover:text-white hover:underline">{t("appCta")} <span aria-hidden className="inline-block rtl:-scale-x-100">→</span></Link>}
            </div>
          </div>
        </div>
        {/* phones: swipeable row on small screens, six in a row on wide ones */}
        <ul className="-mx-4 mt-12 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-4 [scrollbar-width:none] sm:-mx-5 sm:px-5 lg:mx-0 lg:grid lg:grid-cols-6 lg:overflow-visible lg:px-0">
          {SHOTS.map((s, i) => (
            <li key={s} className={`w-[58%] max-w-[230px] shrink-0 snap-center sm:w-[34%] lg:w-auto lg:max-w-none ${i % 2 ? "lg:translate-y-8" : ""}`}>
              <figure>
                <div className="rounded-[2.1rem] bg-gradient-to-b from-[#3a3f47] via-[#1c1f24] to-[#2b2f36] p-[6px] shadow-[0_24px_60px_-20px_rgba(0,0,0,0.7)] ring-1 ring-white/15">
                  <div className="relative overflow-hidden rounded-[1.75rem] bg-black">
                    <Image src={`/images/app/${s}.webp`} alt={t(CAP[s])} width={600} height={1304} sizes="(min-width: 1024px) 180px, (min-width: 640px) 34vw, 58vw" className="block h-auto w-full" />
                  </div>
                </div>
                <figcaption className="mt-3 text-center text-[13.5px] font-semibold leading-snug text-white/80">{t(CAP[s])}</figcaption>
              </figure>
            </li>
          ))}
        </ul>
        <p className="mt-6 text-center text-[13px] text-white/55">{t("shotsFree")}</p>
      </div>
    </section>
  );
}
