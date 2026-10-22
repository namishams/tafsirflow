import { routing } from "@/i18n/routing";
import { SITE, abs } from "./site";
import { GUIDES } from "./guides";
import { TAJWEED_LESSONS } from "./tajweed";
import { ISLAM } from "./islam";
import { RECITER_BIOS } from "./reciters";
import { CATALOG } from "./learn/courses/catalog";
import { carouselPaths } from "./feed/carousels/paths";
import { SUBJECTS as QBANK_SUBJECTS } from "./learn/qbank/bank";

// Sitemap index -> one file per category and language, e.g. /sitemaps/surahs-de.xml
export const CATEGORIES = {
  pages: ["", "/shams", "/plan", "/academy", "/tajweed", "/vocab", "/khatm", "/guides", "/about", "/feedback", "/changelog", "/quran", "/islam", "/how", "/arabic", "/salah", "/reciters", "/world", "/secrets", "/app", "/today", "/feed", "/map", "/search", "/prayer", "/radio", "/duas", "/support", "/supporters", "/wudu", "/community", "/ranking", "/assistant", "/dua-generator", "/masterclass", "/talents", "/premium"],
  guides: [...ISLAM.map((d) => `/islam/${d.slug}`), ...RECITER_BIOS.map((r) => `/reciters/${r.slug}`), ...GUIDES.map((g) => `/guides/${g.slug}`), ...TAJWEED_LESSONS.map((l) => `/tajweed/${l.id}`)],
  // the courses ported from the app (overview pages; lesson runners and exams are not listed)
  learn: ["/school", "/school/ibtidai", "/school/idadi", "/school/thanawi", "/school/ali", "/courses", ...CATALOG.map((c) => `/courses/${c.id}`), "/arabic/read", "/arabic/lang", "/reciter-path", "/cards", "/swipe",
    // the examination centre (overview and its twelve subjects; sessions, mock exams and statistics are personal)
    "/exams", ...QBANK_SUBJECTS.map((x) => `/exams/${x.id}`),
    // Shams Method 2.0, Rihlat al-'Ilm, the garden and the Mishary track (ported from the app)
    "/shams/method", "/shams/handbook", "/shams/mutashabihat", "/shams/darajat", ...Array.from({ length: 114 }, (_, i) => `/shams/tadabbur?s=${i + 1}`), "/journey", "/garden", "/garden/collection", "/garden/album", "/mishary", "/mishary/ear", "/mishary/masters", "/mishary/masters/alafasy", "/mishary/masters/abdulbasit", "/mishary/masters/minshawi", "/mishary/masters/husary", "/mishary/masters/sudais", "/mishary/seasons", "/mishary/hall-of-fame", "/tests", "/abrahamic", "/haramain", "/haramain/guide", "/tajweed/practice", "/vocab-decks"],
  legal: ["/legal/privacy", "/legal/terms", "/legal/imprint"],
  surahs: Array.from({ length: 114 }, (_, i) => `/surah/${i + 1}`),
  // the feed's carousels (src/lib/feed/carousels): the gallery and every carousel
  carousels: carouselPaths(),
} as const;
export type Category = keyof typeof CATEGORIES;

const started = new Date().toISOString().slice(0, 10); // changes with each deploy/restart, not on every request
const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;");

export const sitemapFiles = () => (Object.keys(CATEGORIES) as Category[]).flatMap((c) => routing.locales.map((l) => `${c}-${l}.xml`));

export function sitemapIndex() {
  const items = sitemapFiles().map((f) => `  <sitemap><loc>${esc(abs(`/sitemaps/${f}`))}</loc><lastmod>${started}</lastmod></sitemap>`).join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${items}\n</sitemapindex>\n`;
}

export function sitemapFile(file: string): string | null {
  const m = file.match(new RegExp(`^(${Object.keys(CATEGORIES).join("|")})-([a-z]{2})\\.xml$`));
  if (!m || !(routing.locales as readonly string[]).includes(m[2])) return null;
  const [, cat, locale] = m as unknown as [string, Category, string];
  const urls = CATEGORIES[cat].map((p) => {
    const alts = [...routing.locales.map((l) => `    <xhtml:link rel="alternate" hreflang="${l}" href="${esc(abs(`/${l}${p}`))}"/>`), `    <xhtml:link rel="alternate" hreflang="x-default" href="${esc(abs(`/${routing.defaultLocale}${p}`))}"/>`].join("\n");
    return `  <url>\n    <loc>${esc(abs(`/${locale}${p}`))}</loc>\n    <lastmod>${started}</lastmod>\n${alts}\n  </url>`;
  });
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${urls.join("\n")}\n</urlset>\n`;
}

export const xmlHeaders = { "content-type": "application/xml; charset=utf-8", "cache-control": "public, max-age=3600" };
export { SITE };
