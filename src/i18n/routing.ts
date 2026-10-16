import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  // order = order in the language menu (largest learner groups first)
  locales: ["de", "en", "ar", "tr", "ur", "fa", "ps", "fr", "es", "id", "ms", "bn", "ru", "zh"],
  defaultLocale: "de",
  // no hreflang Link header: it named redirecting URLs (/, /surah/1) as x-default, which contradicted
  // the <link rel="alternate"> tags in the page and the sitemap (both use /de as x-default)
  alternateLinks: false,
});
