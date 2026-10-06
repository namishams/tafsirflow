import { routing } from "@/i18n/routing";

// Public address of the site. Set SITE_URL once the domain exists (e.g. https://example.com).
export const SITE = (process.env.SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");
// Search engines are only invited when the owner switches this on (avoids indexing the bare server IP).
export const INDEXABLE = process.env.ALLOW_INDEXING === "1";

export const abs = (path: string) => `${SITE}${path}`;

// canonical + hreflang for a path without locale prefix ("" for home, "/quran", "/surah/1")
export function alternates(locale: string, path: string) {
  const languages: Record<string, string> = {};
  for (const l of routing.locales) languages[l] = abs(`/${l}${path}`);
  languages["x-default"] = abs(`/${routing.defaultLocale}${path}`);
  return { canonical: abs(`/${locale}${path}`), languages };
}

const OG_LOCALE: Record<string, string> = { de: "de_DE", en: "en_US", ar: "ar_AR", fr: "fr_FR", es: "es_ES", zh: "zh_CN", id: "id_ID", ms: "ms_MY", fa: "fa_IR", tr: "tr_TR", ru: "ru_RU", ur: "ur_PK", bn: "bn_BD", ps: "ps_AF" };

export function pageMeta(locale: string, path: string, title: string, description: string, keywords?: string) {
  return {
    title,
    description,
    keywords,
    alternates: alternates(locale, path),
    robots: INDEXABLE ? { index: true, follow: true } : { index: false, follow: false },
    openGraph: {
      type: "website" as const,
      siteName: "Quran Masterclass",
      title,
      description,
      url: abs(`/${locale}${path}`),
      locale: OG_LOCALE[locale] ?? "en_US",
      alternateLocale: routing.locales.filter((l) => l !== locale).map((l) => OG_LOCALE[l]),
    },
    twitter: { card: "summary_large_image" as const, title, description },
  };
}
