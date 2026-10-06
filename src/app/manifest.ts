import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Quran Masterclass – Learn the Quran",
    short_name: "Masterclass",
    description: "Listen to the Quran verse by verse, study tafsir and memorize with spaced repetition.",
    id: "/",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "any",
    background_color: "#f5f7f6",
    theme_color: "#08261d",
    categories: ["education", "books", "lifestyle"],
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
    // long-press on the app icon (Android) – the locale is added by the site
    shortcuts: [
      { name: "Today", url: "/today", icons: [{ src: "/icon-192.png", sizes: "192x192" }] },
      { name: "Quran", url: "/quran", icons: [{ src: "/icon-192.png", sizes: "192x192" }] },
      { name: "Shams Method", url: "/shams", icons: [{ src: "/icon-192.png", sizes: "192x192" }] },
      { name: "Radio", url: "/radio", icons: [{ src: "/icon-192.png", sizes: "192x192" }] },
    ],
  };
}
