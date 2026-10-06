import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["de", "en", "id", "fa"],
  defaultLocale: "de",
});
