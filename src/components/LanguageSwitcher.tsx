"use client";
import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { LOCALE_META, type AppLocale } from "@/i18n/locales";

export default function LanguageSwitcher() {
  const t = useTranslations("language");
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  return (
    <select
      aria-label={t("label")}
      value={locale}
      onChange={(e) => router.replace(pathname, { locale: e.target.value })}
      className="max-w-[7.5rem] rounded-full border border-line bg-surface px-2.5 py-1.5 text-sm text-ink shadow-card"
    >
      {routing.locales.map((l) => (
        <option key={l} value={l}>{LOCALE_META[l as AppLocale].label}</option>
      ))}
    </select>
  );
}
