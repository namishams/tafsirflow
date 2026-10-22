import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { AppStoreButton } from "@/components/AppShowcase";
import { CoverTile } from "@/components/carousel/CarouselParts";
import { carouselList } from "@/lib/feed/carousels/store";

// Home page: "one account, in sync" (pushes the app without locking the website) and the carousels as a marketing
// showcase with a call to continue in the app. Texts: messages → "promo".
export async function SyncSection({ locale }: { locale: string }) {
  const t = await getTranslations({ locale, namespace: "promo" });
  return (
    <section className="stage girih relative overflow-hidden text-[#eef0f3]" aria-labelledby="sync-title">
      <div className="relative mx-auto grid max-w-6xl items-center gap-10 px-5 py-14 sm:py-20 lg:grid-cols-[1.2fr_0.8fr]">
        <div>
          <p className="text-[12px] font-semibold uppercase tracking-[0.22em] text-[rgb(var(--gold))] rtl:tracking-normal">{t("syncKicker")}</p>
          <h2 id="sync-title" className="font-display mt-3 text-3xl leading-tight sm:text-5xl">{t("syncTitle")}</h2>
          <p className="mt-4 max-w-2xl text-[16px] leading-relaxed text-white/75">{t("syncLead")}</p>
          <ul className="mt-6 space-y-2.5 text-[15px] text-white/80">
            {(["syncB1", "syncB2", "syncB3"] as const).map((k) => <li key={k} className="flex gap-3"><span aria-hidden className="mt-2 h-1.5 w-1.5 shrink-0 rotate-45 bg-[rgb(var(--gold))]" />{t(k)}</li>)}
          </ul>
        </div>
        <div className="flex flex-col items-start gap-4 lg:items-center">
          <AppStoreButton label={t("appStore")} />
          <Link href="/app" className="text-[15px] font-semibold text-[rgb(var(--gold))] underline-offset-4 hover:underline">{t("appCta")} →</Link>
        </div>
      </div>
    </section>
  );
}

export async function CarouselShowcase({ locale, appUrl }: { locale: string; appUrl: string }) {
  const t = await getTranslations({ locale, namespace: "promo" });
  const { items } = await carouselList({ locale, offset: 0, limit: 4 }).catch(() => ({ items: [] }));
  if (!items.length) return null;
  return (
    <section className="mx-auto max-w-6xl px-4 py-14 sm:px-5 sm:py-20" aria-labelledby="car-title">
      <div className="mx-auto mb-8 max-w-xl text-center">
        <p className="eyebrow">{t("carKicker")}</p>
        <h2 id="car-title" className="font-display mt-3 text-3xl sm:text-4xl">{t("carTitle")}</h2>
        <p className="mt-3 text-muted">{t("carLead")}</p>
      </div>
      <ul className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {items.map((c) => <li key={c.id}><CoverTile c={c} /><p className="mt-2 line-clamp-2 text-[13.5px] font-semibold leading-snug">{c.cover.title}</p></li>)}
      </ul>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Link href="/carousels" className="inline-flex h-12 items-center rounded-md bg-accent px-6 text-[15px] font-bold text-white transition hover:brightness-110">{t("carCta")}</Link>
        <a href={appUrl} target="_blank" rel="noopener noreferrer" className="btn-gold inline-flex h-12 items-center rounded-md px-6 text-[15px] font-bold">{t("carApp")}</a>
      </div>
    </section>
  );
}
