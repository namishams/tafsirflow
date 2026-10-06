import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["de", "en", "ar", "fr", "es", "zh", "id", "fa"],
  defaultLocale: "de",
});
