import { useEffect } from "react";
import { api } from "@/lib/api";
import { readJSON, useStored, writeJSON } from "@/lib/store";

// Switches the owner sets in the website's admin dashboard (features on/off, the announcement), read from /api/config
// and cached under the same key as the website (tf:cfg, not synced). Same fallback as src/lib/config.ts.
export type SiteFeatures = { ranking: boolean; community: boolean; likes: boolean; comments: boolean; assistant: boolean; duaAi: boolean; sideArt: boolean; celebrations: boolean };
export type SiteAnnouncement = { on?: boolean; id: string; de: string; en: string; ar: string; href: string };
export type SiteConfig = { features: SiteFeatures; announcement: SiteAnnouncement | null; premium: { gateWeb: boolean; freeOffline: number }; ai: boolean };

export const FALLBACK: SiteConfig = {
  features: { ranking: true, community: true, likes: true, comments: true, assistant: true, duaAi: true, sideArt: true, celebrations: true },
  announcement: null, premium: { gateWeb: false, freeOffline: 3 }, ai: false,
};

const merge = (c: Partial<SiteConfig> | null): SiteConfig => ({
  ...FALLBACK, ...(c ?? {}),
  features: { ...FALLBACK.features, ...(c?.features ?? {}) },
  premium: { ...FALLBACK.premium, ...(c?.premium ?? {}) },
  announcement: c?.announcement ?? null,
});

let inflight: Promise<SiteConfig> | null = null;
let loadedAt = 0;
/** fetch the config (at most once a minute); falls back to the cached copy when offline */
export function loadSiteConfig(): Promise<SiteConfig> {
  if (inflight && Date.now() - loadedAt < 60_000) return inflight;
  loadedAt = Date.now();
  inflight = api<SiteConfig>("/api/config")
    .then((c) => { writeJSON("tf:cfg", c, true); return merge(c); })
    .catch(() => merge(readJSON<Partial<SiteConfig> | null>("tf:cfg", null)));
  return inflight;
}

/** the current config; refreshes in the background when a screen using it opens */
export function useSiteConfig(): SiteConfig {
  const cached = useStored<Partial<SiteConfig> | null>("tf:cfg", null);
  useEffect(() => { void loadSiteConfig(); }, []);
  return merge(cached);
}
