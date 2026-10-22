import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { LOCALE_META } from "@/i18n/locales";
import Wordmark from "./Wordmark";
import TrustStrip from "./TrustStrip";
import { CookieSettingsLink } from "./analytics/Analytics";
import MadeInDubai from "./MadeInDubai";
import Skyline from "./Skyline";

// Footer columns (owner 22.10.2026): six balanced groups, no duplicates; labels from "nav"
const FOOTER: { title: string; items: { href: string; key: string }[] }[] = [
  { title: "groupLearn", items: [
    { href: "/today", key: "today" }, { href: "/shams", key: "shams" }, { href: "/shams/method", key: "shamsMethod" }, { href: "/plan", key: "plan" }, { href: "/tajweed", key: "tajweed" },
    { href: "/vocab", key: "vocab" }, { href: "/salah", key: "salah" }, { href: "/wudu", key: "wudu" }, { href: "/cards", key: "cards" }, { href: "/tests", key: "tests" },
  ] },
  { title: "groupSchool", items: [
    { href: "/school", key: "school" }, { href: "/academy", key: "courses" }, { href: "/arabic/read", key: "arabicRead" }, { href: "/arabic/lang", key: "arabicLang" }, { href: "/reciter-path", key: "reciterPath" },
    { href: "/journey", key: "journey" }, { href: "/mishary", key: "mishary" }, { href: "/courses/hadith-sci", key: "fHadith" }, { href: "/nahj", key: "fNahj" }, { href: "/school/certificates", key: "certificates" },
  ] },
  { title: "groupQuran", items: [
    { href: "/quran", key: "quran" }, { href: "/search", key: "search" }, { href: "/reciters", key: "reciters" }, { href: "/radio", key: "radio" }, { href: "/khatm", key: "khatm" },
    { href: "/map", key: "map" }, { href: "/abrahamic", key: "abrahamic" }, { href: "/haramain", key: "haramain" }, { href: "/shams/adab", key: "fAdab" },
  ] },
  { title: "islam", items: [
    { href: "/islam", key: "islam" }, { href: "/islam/halal-haram", key: "halal" }, { href: "/prayer", key: "prayer" }, { href: "/duas", key: "duas" }, { href: "/dua-generator", key: "duagen" },
    { href: "/sisters", key: "fSisters" }, { href: "/secrets", key: "secrets" }, { href: "/world", key: "world" }, { href: "/guides", key: "guides" },
  ] },
  { title: "groupCommunity", items: [
    { href: "/community", key: "community" }, { href: "/talents", key: "talents" }, { href: "/together", key: "fTogether" }, { href: "/messages", key: "fMessages" },
    { href: "/garden", key: "garden" }, { href: "/ranking", key: "ranking" }, { href: "/stats", key: "stats" }, { href: "/assistant", key: "assistant" },
  ] },
  { title: "groupMore", items: [
    { href: "/how", key: "how" }, { href: "/app", key: "fAppStickers" }, { href: "/premium", key: "premium" }, { href: "/about", key: "about" },
    { href: "/support", key: "support" }, { href: "/feedback", key: "feedback" }, { href: "/suggestions", key: "suggestions" }, { href: "/reciters/apply", key: "reciterApply" }, { href: "/changelog", key: "changelog" },
  ] },
];

// The footer of every page: sections, languages, and one closing block – free for everyone, © with the founder,
// the Dubai signature and the operating company (src/lib/company.ts)
export default async function SiteFooter() {
  const t = await getTranslations();
  const year = new Date().getFullYear();
  return (
    <footer className="border-t border-line bg-surface">
      <div className="mx-auto max-w-6xl px-5 pt-10"><Skyline /></div>
      <div className="mx-auto max-w-6xl px-5 pb-10 pt-10">
        <div className="grid gap-10 lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-14">
          <div className="min-w-0">
            <Link href="/" className="inline-flex max-w-full items-center" aria-label="Quran Masterclass"><Wordmark height={24} /></Link>
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-muted">{t("app.tagline")}</p>
            <div className="mt-6"><TrustStrip compact /></div>
          </div>
          {/* desktop: six columns */}
          <div className="hidden min-w-0 grid-cols-3 gap-x-8 gap-y-10 lg:grid xl:grid-cols-6 xl:gap-x-6">
            {FOOTER.map((g) => (
              <nav key={g.title} aria-label={t(`nav.${g.title}`)} className="min-w-0">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted">{t(`nav.${g.title}`)}</p>
                <ul className="mt-3 grid gap-2 text-sm">
                  {g.items.map((i) => <li key={i.href}><Link href={i.href} className="text-ink/80 transition hover:text-accent">{t(`nav.${i.key}`)}</Link></li>)}
                </ul>
              </nav>
            ))}
          </div>
          {/* phones and tablets: collapsible sections */}
          <div className="divide-y divide-line border-y border-line lg:hidden">
            {FOOTER.map((g) => (
              <details key={g.title} className="group">
                <summary className="flex cursor-pointer list-none items-center justify-between py-3.5 text-[13px] font-semibold uppercase tracking-[0.12em] text-ink [&::-webkit-details-marker]:hidden">
                  {t(`nav.${g.title}`)}
                  <svg aria-hidden width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-muted transition group-open:rotate-180"><path d="m6 9 6 6 6-6" /></svg>
                </summary>
                <ul className="grid grid-cols-2 gap-x-4 gap-y-2.5 pb-4 text-sm">
                  {g.items.map((i) => <li key={i.href}><Link href={i.href} className="text-ink/80 transition hover:text-accent">{t(`nav.${i.key}`)}</Link></li>)}
                </ul>
              </details>
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
          <div className="mx-auto mt-5 max-w-xl rounded-2xl border border-[rgb(201_166_94)]/45 bg-surface px-5 py-4">
            <p className="font-semibold text-ink">{t("nav.fSupportTitle")}</p>
            <p className="mt-1">{t("nav.fSupportBody")}</p>
            <div className="mt-3 flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
              <Link href="/support" className="inline-flex h-9 items-center rounded-full border border-[rgb(201_166_94)] px-5 text-[13px] font-bold text-ink transition hover:bg-[rgb(201_166_94)]/15">{t("nav.fSupportCta")}</Link>
              <Link href="/supporters" className="text-[13px] font-semibold text-accent hover:underline">{t("nav.fSupportList")}</Link>
            </div>
          </div>
          <p className="mt-3 flex flex-col items-center gap-1 sm:flex-row sm:justify-center sm:gap-2">
            <span>© {year} ICSL FZE, Sharjah · Quran Masterclass · Nami Shams</span>
            <span aria-hidden className="hidden sm:inline">·</span>
            <MadeInDubai />
          </p>
          <p className="mt-2 text-xs">{t("company.operatedBy", { place: t("company.place") })}</p>
          <p className="mt-4 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-xs">
            <Link href="/legal/privacy" className="hover:text-ink">{t("free.privacy")}</Link>
            <Link href="/legal/terms" className="hover:text-ink">{t("home2.terms")}</Link>
            <Link href="/legal/imprint" className="hover:text-ink">{t("free.imprint")}</Link>
            <Link href="/islam/mosques" className="hover:text-ink">{t("free.visit")}</Link>
            <CookieSettingsLink label={t("consent.settings")} />
          </p>
        </div>
      </div>
    </footer>
  );
}
