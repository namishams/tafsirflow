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
  { href: "/academy", key: "courses" },
  { href: "/shams", key: "shams" },
  { href: "/duas", key: "duas", wide: true },
  { href: "/radio", key: "radio", wide: true },
  { href: "/prayer", key: "prayer", wide: true },
  { href: "/search", key: "search", wide: true },
] as const;
const MORE = [
  { href: "/duas", key: "duas", wide: true },
  { href: "/radio", key: "radio", wide: true },
  { href: "/prayer", key: "prayer", wide: true },
  { href: "/search", key: "search", wide: true },
  { href: "/plan", key: "plan" },
  { href: "/map", key: "map" },
  { href: "/tajweed", key: "tajweed" },
  { href: "/vocab", key: "vocab" },
  { href: "/khatm", key: "khatm" },
  { href: "/guides", key: "guides" },
  { href: "/feedback", key: "feedback" },
  { href: "/about", key: "about" },
] as const;

// App bar: logo, section links (desktop), kids / language / account
export default function AppHeader() {
  const t = useTranslations("nav");
  const path = usePathname();
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-surface">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-3 px-4">
        <div className="flex min-w-0 items-center gap-6">
          <Link href="/" className="flex min-w-0 shrink-0 items-center gap-2.5" aria-label="Quran Masterclass">
            <Logo size={30} />
            <span className="truncate text-[15px] font-extrabold tracking-tight lg:hidden xl:inline">Quran Masterclass</span>
          </Link>
          <nav className="hidden items-center gap-1 lg:flex" aria-label="Main">
            {NAV.map((n) => {
              const on = path === n.href || path.startsWith(`${n.href}/`) || (n.href === "/quran" && path.startsWith("/surah"));
              return (
                <Link key={n.href} href={n.href} aria-current={on ? "page" : undefined} className={`${"wide" in n ? "hidden 2xl:inline-block" : ""} whitespace-nowrap rounded-md px-2.5 py-1.5 text-sm font-semibold transition ${on ? "bg-accent-soft text-accent" : "text-muted hover:text-ink"}`}>
                  {t(n.key)}
                </Link>
              );
            })}
            <details key={path} className="relative">
              <summary className="cursor-pointer list-none whitespace-nowrap rounded-md px-2.5 py-1.5 text-sm font-semibold text-muted hover:text-ink">{t("more")} ▾</summary>
              <div className="absolute start-0 top-full z-50 mt-2 grid w-64 gap-0.5 rounded-lg border border-line bg-surface p-2 shadow-lg">
                {MORE.map((m) => <Link key={m.href} href={m.href} className={`${"wide" in m ? "2xl:hidden" : ""} rounded-md px-3 py-2 text-sm font-semibold hover:bg-bg`}>{t(m.key)}</Link>)}
              </div>
            </details>
          </nav>
        </div>
        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2"><KidsToggle /><LanguageSwitcher /><AccountLink /></div>
      </div>
    </header>
  );
}
