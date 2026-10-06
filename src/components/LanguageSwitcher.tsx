"use client";
import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { LOCALE_META, type AppLocale } from "@/i18n/locales";

// Keeps the query string (?v=255, ?shams=1) when the language changes. Shows a short code on phones and the full name from sm up; the native <select> sits invisibly on top so the system picker still opens.
export default function LanguageSwitcher() {
  const t = useTranslations("language");
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  return (
    <label className="relative inline-flex shrink-0 items-center rounded-full border border-line bg-surface px-3 py-1.5 text-sm font-medium text-ink shadow-card">
      <span aria-hidden className="uppercase sm:hidden">{locale}</span>
      <span aria-hidden className="hidden sm:inline">{LOCALE_META[locale as AppLocale].label}</span>
      <span aria-hidden className="ms-1 text-[10px] text-muted">▾</span>
      <select
        aria-label={t("label")}
        value={locale}
        onChange={(e) => router.replace(`${pathname}${window.location.search}`, { locale: e.target.value })}
        className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
      >
        {routing.locales.map((l) => (
          <option key={l} value={l}>{LOCALE_META[l as AppLocale].label}</option>
        ))}
      </select>
    </label>
  );
}
