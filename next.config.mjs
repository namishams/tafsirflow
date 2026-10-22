import createNextIntlPlugin from "next-intl/plugin";
import { generateIntlNamespaces } from "./scripts/intl-namespaces.mjs";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");
const prod = process.env.NODE_ENV === "production";
// which message namespaces each part of the site sends to the browser – worked out from the code before every build
// (src/i18n/ClientMessages.tsx); the development server sends all texts and does not need it
if (prod) generateIntlNamespaces();
const https = (process.env.SITE_URL ?? "").startsWith("https://");

// Content Security Policy: only our own scripts, styles, fonts and data; audio may also come from Quran.com's CDN.
// Inline scripts are needed by Next.js itself and by our JSON-LD. The only third party is Google reCAPTCHA (bot protection),
// which is loaded on protected forms only.
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline' https://www.google.com/recaptcha/ https://www.gstatic.com/recaptcha/${prod ? "" : " 'unsafe-eval'"}`,
  "frame-src https://www.google.com/recaptcha/ https://recaptcha.google.com/recaptcha/",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https://www.gstatic.com/recaptcha/ https://upload.wikimedia.org",
  "font-src 'self' data:",
  "media-src 'self' blob: https://verses.quran.com https://*.quran.com https://audio.qurancdn.com https://download.quranicaudio.com",
  // the courses fetch Quran.com's word recordings ahead (src/components/learn/media.ts preloadClips) and play them as blob:
  // hadith by number from the published hadith-api (src/lib/learn/journey/hadith.ts: the long path's daily hadith and
  // the story of /start) – only that repository's path on the CDN
  `connect-src 'self' https://www.google.com/recaptcha/ https://raw.githubusercontent.com https://audio.qurancdn.com https://verses.quran.com https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1/${prod ? "" : " ws: wss:"}`,
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
  ...(https ? ["upgrade-insecure-requests"] : []),
].join("; ");

const security = [
  { key: "Content-Security-Policy", value: csp },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(self), geolocation=(self), payment=(), usb=(), interest-cohort=()" },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
  { key: "Cross-Origin-Resource-Policy", value: "same-origin" },
  ...(https ? [{ key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" }] : []),
];

// scripts/deploy.sh builds into a separate folder (NEXT_DIST_DIR) and swaps it in only after a successful build,
// so the running site never serves pages whose CSS/JS files were already replaced.
export default withNextIntl({
  distDir: process.env.NEXT_DIST_DIR || ".next",
  poweredByHeader: false,
  // deploy builds always start from scratch, so a compiler cache would only use up disk space on the server
  webpack(config, { dev }) {
    if (!dev && process.env.NEXT_DIST_DIR) config.cache = false;
    return config;
  },
  // Android app ↔ domain verification (see src/app/api/assetlinks/route.ts)
  async rewrites() {
    return [
      { source: "/.well-known/assetlinks.json", destination: "/api/assetlinks" },
      { source: "/.well-known/apple-app-site-association", destination: "/api/aasa" }, // iOS app ↔ domain (src/app/api/aasa/route.ts)
    ];
  },
  async redirects() {
    // short links people share for project support (spenden, donate, support) without a language prefix
    return ["donate", "spenden", "spende", "unterstuetzen", "support"].flatMap((s) => [
      { source: `/${s}`, destination: "/support", permanent: false },
      { source: `/:locale(de|en|ar|tr|ur|fa|ps|fr|es|id|ms|bn|ru|zh)/${s}`, destination: "/:locale/support", permanent: false },
    ]).filter((r) => !(r.source === "/support" || r.source.endsWith(")/support"))).concat(["unterstuetzer", "unterstutzer"].flatMap((s) => [
      { source: `/${s}`, destination: "/supporters", permanent: true },
      { source: `/:locale(de|en|ar|tr|ur|fa|ps|fr|es|id|ms|bn|ru|zh)/${s}`, destination: "/:locale/supporters", permanent: true },
    ]));
  },
  async headers() {
    return [
      { source: "/:path*", headers: security },
      // personal data is never cached by browsers or proxies – except the public, read-only community figures and the
      // public feed (config, new, page, web: no personal data), which set their own Cache-Control (a header here would
      // override the route's own)
      { source: "/api/:path((?!social/community$|feed/config$|feed/new$|feed/page$|feed/web$|feed/stories$).*)", headers: [{ key: "Cache-Control", value: "private, no-store" }] },
      // pictures from public/ (garden, brand, lesson images, app screenshots, icons): Next.js serves them with max-age=0, so
      // every visit asked for each one again. Their names are not hashed, so a day plus a week of background refresh –
      // a replaced file shows within a day.
      ...["/garden/:path*", "/brand/:path*", "/learn/:path*", "/app-screens/:path*", "/icon-192.png", "/icon-512.png", "/icon-maskable-512.png"].map((source) => ({
        source,
        headers: [{ key: "Cache-Control", value: "public, max-age=86400, stale-while-revalidate=604800" }],
      })),
    ];
  },
});
