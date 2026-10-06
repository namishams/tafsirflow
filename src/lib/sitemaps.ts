import { routing } from "@/i18n/routing";
import { SITE, abs } from "./site";
import { GUIDES } from "./guides";
import { TAJWEED_LESSONS } from "./tajweed";

// Sitemap index -> one file per category and language, e.g. /sitemaps/surahs-de.xml
export const CATEGORIES = {
  pages: ["", "/shams", "/academy", "/tajweed", "/vocab", "/khatm", "/guides", "/quran", "/today", "/search", "/prayer", "/radio", "/duas", "/support"],
  guides: [...GUIDES.map((g) => `/guides/${g.slug}`), ...TAJWEED_LESSONS.map((l) => `/tajweed/${l.id}`)],
  legal: ["/legal/privacy", "/legal/terms", "/legal/imprint"],
  surahs: Array.from({ length: 114 }, (_, i) => `/surah/${i + 1}`),
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
  const m = file.match(/^(pages|guides|legal|surahs)-([a-z]{2})\.xml$/);
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
