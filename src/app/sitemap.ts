import type { MetadataRoute } from "next";
import { routing } from "@/i18n/routing";
import { abs, alternates } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const paths = ["", "/quran", ...Array.from({ length: 114 }, (_, i) => `/surah/${i + 1}`)];
  return routing.locales.flatMap((l) =>
    paths.map((p) => ({
      url: abs(`/${l}${p}`),
      lastModified: now,
      changeFrequency: p === "" ? ("weekly" as const) : ("monthly" as const),
      priority: p === "" ? 1 : p === "/quran" ? 0.9 : 0.7,
      alternates: { languages: alternates(l, p).languages },
    })),
  );
}
