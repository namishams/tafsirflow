"use client";
import { useLocale, useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { PRIMARY, isActive } from "@/lib/nav";
import LanguageSwitcher from "./LanguageSwitcher";
import SiteMenu from "./SiteMenu";
import AccountLink from "./AccountLink";
import MessagesBadge from "./messenger/MessagesBadge";
import Wordmark from "./Wordmark";

// The header of every page: gold wordmark, main sections + "More" (desktop), language, account, menu (phones)
export default function AppHeader() {
  const t = useTranslations("nav");
  const path = usePathname();
  const latin = useLocale() !== "ar"; // Wordmark shows the Arabic lockup (about 5× as wide as high) on Arabic pages
  return (
    <header data-top-bar className="header-gold sticky top-0 z-40 border-b border-line bg-surface/95 backdrop-blur supports-[backdrop-filter]:bg-surface/85">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-3 px-5">
        <div className="flex min-w-0 items-center gap-5">
          <Link href="/" className="flex min-w-0 shrink-0 items-center gap-2.5" aria-label="Quran Masterclass">
            {/* the Latin lockup is 9× as wide as high: on phones ≤ 400 px it shrinks with the screen so it never runs
                under the language, account and menu buttons (≈ 140 px + paddings) */}
            <Wordmark height={30} svgClassName={`${latin ? "h-[min(24px,calc((100vw_-_198px)/9))]" : "h-[24px]"} w-auto sm:h-[30px] lg:h-[22px] xl:h-[28px]`} />
          </Link>
          <nav className="hidden items-center gap-0.5 lg:flex" aria-label={t("main")}>
            {PRIMARY.map((n, i) => {
              const on = isActive(path, n.href);
              return (
                <Link key={n.href} href={n.href} aria-current={on ? "page" : undefined} className={`${i >= 4 ? "hidden xl:inline-block" : ""} relative whitespace-nowrap rounded-md px-2.5 py-1.5 text-sm font-semibold transition ${on ? "text-ink" : "text-muted hover:text-ink"}`}>
                  {t(n.key)}
                  {on && <span className="absolute inset-x-2.5 -bottom-[11px] h-[2px] rounded-full bg-[rgb(var(--gold))]" />}
                </Link>
              );
            })}
            <SiteMenu variant="panel" />
          </nav>
        </div>
        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2"><LanguageSwitcher /><MessagesBadge /><AccountLink /><span className="lg:hidden"><SiteMenu /></span></div>
      </div>
    </header>
  );
}
