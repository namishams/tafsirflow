import { routing } from "@/i18n/routing";

// The public domain. A production build always uses it as canonical address, even if SITE_URL on the server
// still holds the bare IP; SITE_URL only overrides it with another https address.
export const DOMAIN = "quranmasterclass.com";
export const PUBLIC_SITE = `https://${DOMAIN}`;
const envSite = (process.env.SITE_URL ?? "").replace(/\/$/, "");
export const SITE = envSite.startsWith("https://") ? envSite : process.env.NODE_ENV === "production" ? PUBLIC_SITE : envSite || "http://localhost:3000";
// Search engines are invited on the public domain; anywhere else (IP address, test server) only with ALLOW_INDEXING=1
export const INDEXABLE = process.env.ALLOW_INDEXING === "1" || SITE === PUBLIC_SITE;
export const isPublicHost = (host: string | null | undefined) => (host ?? "").split(":")[0].toLowerCase().replace(/^www\./, "") === DOMAIN;

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
