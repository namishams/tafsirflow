import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { pageMeta } from "@/lib/site";
import PremiumPanel, { Seal } from "@/components/PremiumPanel";

// Quran Masterclass Pro: a monthly subscription in the app (App Store / Google Play). The website itself stays free;
// this page only explains Pro and links to the stores. (The route keeps its old name /premium so links stay valid.)
export const dynamic = "force-dynamic"; // APP_STORE_URL / PLAY_STORE_URL are read from the server environment at request time

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "premium" });
  return pageMeta(locale, "/premium", t("metaTitle"), t("metaDesc"));
}

const FEATURES = [1, 2, 3, 4, 5, 6, 7] as const;
const FREE = [1, 2, 3, 4, 5] as const;

export default async function PremiumPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("premium");
  return (
    <div>
      <section className="stage girih relative overflow-hidden text-[#eef0f3]">
        <span aria-hidden className="illum-frame" />
        <div className="relative mx-auto grid max-w-5xl gap-10 px-5 py-14 sm:py-20 lg:grid-cols-[1fr_auto] lg:items-center">
          <div>
            <p className="text-[12px] font-semibold uppercase tracking-[0.22em] text-[rgb(var(--gold))] rtl:tracking-normal">{t("kicker")}</p>
            <h1 className="font-display mt-4 text-[38px] leading-[1.06] sm:text-6xl">{t("title")}</h1>
            <p className="mt-5 max-w-2xl text-[17px] leading-relaxed text-white/70">{t("lead")}</p>
            <div className="mt-8"><PremiumPanel appStoreUrl={process.env.APP_STORE_URL ?? ""} playStoreUrl={process.env.PLAY_STORE_URL ?? ""} /></div>
          </div>
          <div aria-hidden className="mx-auto hidden lg:block"><Seal size={200} /></div>
        </div>
      </section>
      <section className="mx-auto max-w-5xl px-5 py-14">
        <h2 className="font-display text-3xl">{t("featuresTitle")}</h2>
        <ul className="mt-6 grid gap-4 sm:grid-cols-2">
          {FEATURES.map((i) => (
            <li key={i} className="rounded-2xl border border-[rgb(201_166_94)]/30 bg-surface p-5">
              <p className="flex items-center gap-2.5 font-bold"><Seal size={22} />{t(`f${i}Title`)}</p>
              <p className="mt-2 text-[14px] leading-relaxed text-muted">{t(`f${i}`)}</p>
            </li>
          ))}
        </ul>
        <p className="mt-5 text-[14px] text-muted">{t("duasNote")}</p>
        <div className="mt-8 rounded-2xl border border-line bg-surface p-5 text-[14px] leading-relaxed">
          <p className="font-semibold">{t("plan")}</p>
          <p className="mt-1 text-muted">{t("price")}</p>
          <p className="mt-3 text-[13px] text-muted">{t("terms")}</p>
        </div>
        <h2 className="font-display mt-14 text-3xl">{t("freeTitle")}</h2>
        <ul className="mt-5 grid gap-2.5 text-[15px]">
          {FREE.map((i) => <li key={i} className="flex gap-3"><span aria-hidden className="mt-2 h-2 w-2 shrink-0 rotate-45 bg-[rgb(var(--gold))]" />{t(`free${i}`)}</li>)}
        </ul>
      </section>
    </div>
  );
}
