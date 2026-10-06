import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  // order = order in the language menu (largest learner groups first)
  locales: ["de", "en", "ar", "tr", "ur", "fa", "ps", "fr", "es", "id", "bn", "ru", "zh"],
  defaultLocale: "de",
});
