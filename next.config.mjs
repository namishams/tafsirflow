import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");
const prod = process.env.NODE_ENV === "production";
const https = (process.env.SITE_URL ?? "").startsWith("https://");

// Content Security Policy: only our own scripts, styles, fonts and data; audio may also come from Quran.com's CDN.
// Inline scripts are needed by Next.js itself and by our JSON-LD. The only third party is Google reCAPTCHA (bot protection),
// which is loaded on protected forms only.
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline' https://www.google.com/recaptcha/ https://www.gstatic.com/recaptcha/${prod ? "" : " 'unsafe-eval'"}`,
  "frame-src https://www.google.com/recaptcha/ https://recaptcha.google.com/recaptcha/",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https://www.gstatic.com/recaptcha/",
  "font-src 'self' data:",
  "media-src 'self' blob: https://verses.quran.com https://*.quran.com https://audio.qurancdn.com https://download.quranicaudio.com",
  `connect-src 'self' https://www.google.com/recaptcha/${prod ? "" : " ws: wss:"}`,
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
  // the support page was removed (2026-10): old links and search results land on the home page
  async redirects() {
    return [{ source: "/:locale(de|en|ar|fr|es|zh|id|ms|fa|tr|ru|ur|bn|ps)/support", destination: "/:locale", permanent: true }];
  },
  async rewrites() {
    return [{ source: "/.well-known/assetlinks.json", destination: "/api/assetlinks" }];
  },
  async headers() {
    return [
      { source: "/:path*", headers: security },
      // personal data is never cached by browsers or proxies
      { source: "/api/:path*", headers: [{ key: "Cache-Control", value: "private, no-store" }] },
    ];
  },
});
