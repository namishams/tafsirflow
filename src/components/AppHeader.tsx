"use client";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { PRIMARY, isActive } from "@/lib/nav";
import LanguageSwitcher from "./LanguageSwitcher";
import SiteMenu from "./SiteMenu";
import AccountLink from "./AccountLink";
import Logo from "./Logo";

// The header of every page: logo, main sections + "More" (desktop), language, account, menu (phones)
export default function AppHeader() {
  const t = useTranslations("nav");
  const path = usePathname();
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-surface/95 backdrop-blur supports-[backdrop-filter]:bg-surface/85">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-3 px-5">
        <div className="flex min-w-0 items-center gap-5">
          <Link href="/" className="flex min-w-0 shrink-0 items-center gap-2.5" aria-label="Quran Masterclass">
            <Logo size={28} />
            <span className="truncate text-[15px] font-extrabold tracking-tight lg:hidden xl:inline">Quran Masterclass</span>
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
        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2"><LanguageSwitcher /><AccountLink /><span className="lg:hidden"><SiteMenu /></span></div>
      </div>
    </header>
  );
}
