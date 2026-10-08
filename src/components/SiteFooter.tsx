import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { GROUPS } from "@/lib/nav";
import { LOCALE_META } from "@/i18n/locales";
import Logo from "./Logo";
import TrustStrip from "./TrustStrip";
import MadeInDubai from "./MadeInDubai";
import Skyline from "./Skyline";

// The footer of every page: sections, languages, and one closing block – free for everyone, © and the Dubai signature
export default async function SiteFooter() {
  const t = await getTranslations();
  const year = new Date().getFullYear();
  return (
    <footer className="border-t border-line bg-surface">
      <div className="mx-auto max-w-6xl px-5 pt-10"><Skyline /></div>
      <div className="mx-auto max-w-6xl px-5 pb-10 pt-10">
        <div className="grid gap-10 lg:grid-cols-[1.25fr_repeat(4,1fr)]">
          <div>
            <Link href="/" className="inline-flex items-center gap-2.5"><Logo size={26} /><span className="text-[15px] font-extrabold tracking-tight">Quran Masterclass</span></Link>
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-muted">{t("app.tagline")}</p>
            <div className="mt-6"><TrustStrip compact /></div>
          </div>
          <div className="grid grid-cols-2 gap-x-6 gap-y-8 sm:grid-cols-4 lg:col-span-4">
            {GROUPS.map((g) => (
              <nav key={g.title} aria-label={t(`nav.${g.title}`)}>
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted">{t(`nav.${g.title}`)}</p>
                <ul className="mt-3 grid gap-2 text-sm">
                  {g.items.map((i) => <li key={i.href}><Link href={i.href} className="text-ink/80 transition hover:text-accent">{t(`nav.${i.key}`)}</Link></li>)}
                </ul>
              </nav>
            ))}
          </div>
        </div>
        <nav aria-label={t("home2.fLanguages")} className="mt-10 border-t border-line pt-6">
          <ul className="flex flex-wrap gap-x-4 gap-y-2 text-[13px] text-muted">
            {Object.entries(LOCALE_META).map(([k, v]) => <li key={k}><Link href="/" locale={k} hrefLang={k} className="transition hover:text-ink">{v.label}</Link></li>)}
          </ul>
        </nav>
      </div>
      <div className="border-t border-line bg-bg">
        <div className="mx-auto max-w-6xl px-5 py-7 text-center text-[13px] leading-relaxed text-muted">
          <p className="mx-auto max-w-2xl"><span className="font-semibold text-ink">{t("free.title")}</span> {t("free.body")}</p>
          <p className="mt-3 flex flex-col items-center gap-1 sm:flex-row sm:justify-center sm:gap-2">
            <span>© {year} Quran Masterclass</span>
            <span aria-hidden className="hidden sm:inline">·</span>
            <MadeInDubai />
          </p>
          <p className="mt-4 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-xs">
            <Link href="/legal/privacy" className="hover:text-ink">{t("free.privacy")}</Link>
            <Link href="/legal/terms" className="hover:text-ink">{t("home2.terms")}</Link>
            <Link href="/legal/imprint" className="hover:text-ink">{t("free.imprint")}</Link>
            <Link href="/islam/mosques" className="hover:text-ink">{t("free.visit")}</Link>
          </p>
        </div>
      </div>
    </footer>
  );
}
