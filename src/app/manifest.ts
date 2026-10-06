import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Quran Masterclass – Learn the Quran",
    short_name: "Masterclass",
    description: "Listen to the Quran verse by verse, study tafsir and memorize with spaced repetition.",
    start_url: "/",
    display: "standalone",
    background_color: "#fafaf7",
    theme_color: "#066c4e",
    icons: [{ src: "/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" }],
  };
}
