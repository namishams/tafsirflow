"use client";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import LanguageSwitcher from "./LanguageSwitcher";
import AccountLink from "./AccountLink";
import KidsToggle from "./KidsToggle";
import Logo from "./Logo";

export const NAV = [
  { href: "/today", key: "today" },
  { href: "/quran", key: "quran" },
  { href: "/duas", key: "duas" },
  { href: "/radio", key: "radio" },
  { href: "/prayer", key: "prayer" },
  { href: "/search", key: "search" },
] as const;

// App bar: logo, section links (desktop), kids / language / account
export default function AppHeader() {
  const t = useTranslations("nav");
  const path = usePathname();
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-surface">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-3 px-4">
        <div className="flex min-w-0 items-center gap-8">
          <Link href="/" className="flex min-w-0 items-center gap-2.5" aria-label="Quran Masterclass">
            <Logo size={30} />
            <span className="truncate text-[15px] font-extrabold tracking-tight">Quran Masterclass</span>
          </Link>
          <nav className="hidden items-center gap-1 lg:flex" aria-label="Main">
            {NAV.map((n) => {
              const on = path === n.href || path.startsWith(`${n.href}/`) || (n.href === "/quran" && path.startsWith("/surah"));
              return (
                <Link key={n.href} href={n.href} aria-current={on ? "page" : undefined} className={`rounded-md px-3 py-1.5 text-sm font-semibold transition ${on ? "bg-accent-soft text-accent" : "text-muted hover:text-ink"}`}>
                  {t(n.key)}
                </Link>
              );
            })}
          </nav>
        </div>
        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2"><KidsToggle /><LanguageSwitcher /><AccountLink /></div>
      </div>
    </header>
  );
}
