import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { pageMeta } from "@/lib/site";
import { getSettings } from "@/lib/settings";
import PremiumPanel, { Seal } from "@/components/PremiumPanel";

export const dynamic = "force-dynamic"; // APP_STORE_URL is read from the server environment at request time

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "premium" });
  return pageMeta(locale, "/premium", t("metaTitle"), t("metaDesc"));
}

export default async function PremiumPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("premium");
  const { premium } = await getSettings();
  const features: [string, string][] = [[t("f1Title"), t("f1")], [t("f2Title"), t("f2", { n: premium.freeOffline })], [t("f3Title"), t("f3")], [t("f4Title"), t("f4")]];
  const free = [t("free1"), t("free2"), t("free3"), t("free4"), t("free5")];
  return (
    <div>
      <section className="stage girih relative overflow-hidden text-[#eef0f3]">
        <span aria-hidden className="illum-frame" />
        <div className="relative mx-auto grid max-w-5xl gap-10 px-5 py-14 sm:py-20 lg:grid-cols-[1fr_auto] lg:items-center">
          <div>
            <p className="text-[12px] font-semibold uppercase tracking-[0.22em] text-[rgb(var(--gold))] rtl:tracking-normal">{t("kicker")}</p>
            <h1 className="font-display mt-4 text-[38px] leading-[1.06] sm:text-6xl">{t("title")}</h1>
            <p className="mt-5 max-w-2xl text-[17px] leading-relaxed text-white/70">{t("lead")}</p>
            <div className="mt-8"><PremiumPanel appStoreUrl={process.env.APP_STORE_URL ?? ""} /></div>
          </div>
          <div aria-hidden className="mx-auto hidden lg:block"><Seal size={200} /></div>
        </div>
      </section>
      <section className="mx-auto max-w-5xl px-5 py-14">
        <ul className="grid gap-4 sm:grid-cols-2">
          {features.map(([h, d]) => (
            <li key={h} className="rounded-2xl border border-[rgb(201_166_94)]/30 bg-surface p-5">
              <p className="flex items-center gap-2.5 font-bold"><Seal size={22} />{h}</p>
              <p className="mt-2 text-[14px] leading-relaxed text-muted">{d}</p>
            </li>
          ))}
        </ul>
        <h2 className="font-display mt-14 text-3xl">{t("freeTitle")}</h2>
        <ul className="mt-5 grid gap-2.5 text-[15px]">
          {free.map((f) => <li key={f} className="flex gap-3"><span aria-hidden className="mt-2 h-2 w-2 shrink-0 rotate-45 bg-[rgb(var(--gold))]" />{f}</li>)}
        </ul>
      </section>
    </div>
  );
}
