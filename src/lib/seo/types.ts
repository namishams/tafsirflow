// SEO data model. Per locale there are three data files (all written natively, not machine-translated word for word):
//   keywords/<locale>.ts  research data: focus keyword + short/long-tail terms per route (never rendered as a list)
//   pages/<locale>.json   localized <title> (<=60 chars) and description (<=155) per existing public route
//   hubs/<locale>.ts      full content of the landing hub pages
export const HUB_IDS = [
  "learn-quran", "quran-tafsir", "tajweed-online", "memorize-quran", "quran-radio", "listen-quran",
  "tawbah", "learn-salah", "learn-wudu", "learn-islam",
] as const;
export type HubId = (typeof HUB_IDS)[number];

// existing public routes that get a localized title/description from pages/<locale>.json
export const PAGE_ROUTES = [
  "", "/how", "/app", "/courses", "/tajweed", "/arabic", "/academy", "/blog", "/guides", "/islam", "/quran", "/reciters",
  "/radio", "/prayer", "/calendar", "/names", "/duas", "/nahj", "/shams", "/salah", "/wudu", "/khatm", "/vocab", "/dua-generator", "/surah",
] as const;
export type PageRoute = (typeof PAGE_ROUTES)[number];

export type PageSeo = { title: string; desc: string };
export type KeywordSet = { focus: string; short: string[]; long: string[] };

// keywords/<locale>.ts covers PAGE_ROUTES (key = route, "" = home; "/surah" = every surah page) and the hubs (key = "/learn-quran" …)
export const keywordRoutes = [...PAGE_ROUTES, ...HUB_IDS.map((h) => `/${h}`)] as string[];

export type HubSection = { h2: string; p: string[]; links?: [string, string][] }; // links: [path, anchor text]
export type Hub = {
  title: string; // <title>, <=60 chars, contains the focus keyword
  description: string; // <=155 chars
  kicker: string;
  h1: string; // contains the focus keyword
  intro: string; // first paragraph, contains the focus keyword naturally
  answer: string; // answer-first box: 2-3 sentences that directly answer the search question, factual, citable by AI search
  sections: HubSection[]; // 3-4 sections, each an H2 with 1-2 paragraphs
  stepsTitle: string;
  steps: { title: string; body: string }[]; // 4-6 steps
  faqTitle: string;
  faq: { q: string; a: string }[]; // 5-7 questions people really ask; answers plain text, honest
  linksTitle: string;
  links: [string, string][]; // 6-9 internal links [path, anchor text]
  cta: [string, string]; // [path, label] main button
};

// internal paths a hub may link to (checked by scripts/seo-audit.mjs)
export const LINK_TARGETS = [
  "/quran", "/shams", "/shams/method", "/shams/adab", "/shams/mutashabihat", "/courses", "/academy", "/tajweed", "/tajweed/practice", "/arabic", "/arabic/read", "/vocab",
  "/reciters", "/radio", "/prayer", "/wudu", "/salah", "/duas", "/dua-generator", "/names", "/calendar", "/islam", "/how", "/app", "/khatm", "/guides", "/today", "/sisters",
  "/nahj", "/school", "/masterclass", "/reciter-path", "/plan", "/search", "/mishary",
  ...Array.from({ length: 114 }, (_, i) => `/surah/${i + 1}`),
  "/islam/islam", "/islam/quran", "/islam/prophet", "/islam/iman", "/islam/prayer-sunni", "/islam/prayer-shia", "/islam/daily", "/islam/ramadan", "/islam/halal-haram", "/islam/madhahib", "/islam/names", "/islam/hajj", "/islam/eid", "/islam/reciter-path",
  "/guides/how-to-learn-the-quran", "/guides/how-to-memorize-the-quran", "/guides/shams-method", "/guides/learn-to-read-the-quran", "/guides/tajweed-for-beginners", "/guides/juz-amma-learning-plan", "/guides/quran-for-kids", "/guides/understanding-the-quran-tafsir", "/guides/daily-quran-routine", "/guides/learn-quranic-arabic-vocabulary",
  "/tajweed/makharij", "/tajweed/qalqalah", "/tajweed/madd", "/tajweed/nun-sakinah-izhar", "/tajweed/mim-sakinah",
  ...HUB_IDS.map((h) => `/${h}`),
];

// File articles/<locale>.ts: default export Record keyed "why/<slug>" or "new-beginning/<slug>".
// Long-form articles (800-1500 words): why learning, reading and understanding the Quran matters, and a fresh start after mistakes.
export const WHY_SLUGS = ["inner-peace", "guidance", "character", "family", "discipline", "barakah"] as const;
export const FRESH_SLUGS = ["fresh-start-with-the-quran", "back-to-allah", "start-praying-again"] as const;
export type ArticleKind = "why" | "new-beginning";
export const ARTICLE_SLUGS: Record<ArticleKind, readonly string[]> = { why: WHY_SLUGS, "new-beginning": FRESH_SLUGS };
export type Article = {
  title: string; description: string; kicker: string; h1: string; focus?: string;
  answer: string; // 2-3 sentence direct answer
  intro: string;
  sections: HubSection[]; // 5-8 sections, together 800-1500 words
  faqTitle: string; faq: { q: string; a: string }[]; // 4-6
  linksTitle: string; links: [string, string][]; // 6-9 internal links
  cta: [string, string];
  note?: string; // e.g. "For a personal ruling ask a scholar or your imam"
};
export type ArticleSet = Record<string, Article>; // key = slug
