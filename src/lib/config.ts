"use client";
import { useEffect, useState } from "react";
import { readJSON, writeJSON } from "./storage";
import type { PublicConfig } from "./settings";

// Switches and rules set in the admin dashboard, cached in the browser (tf:cfg, not synced) and refreshed on every visit
export type ClientConfig = PublicConfig & { ai: boolean };
export const FALLBACK: ClientConfig = {
  features: { ranking: true, community: true, likes: true, comments: true, assistant: true, duaAi: true, sideArt: true, celebrations: true },
  points: {}, announcement: null, ai: false,
};
let inflight: Promise<ClientConfig> | null = null;
export const cachedConfig = (): ClientConfig => { const c = readJSON<Partial<ClientConfig>>("tf:cfg", {}); return { ...FALLBACK, ...c, features: { ...FALLBACK.features, ...(c.features ?? {}) } }; };

export function loadConfig(): Promise<ClientConfig> {
  inflight ??= fetch("/api/config")
    .then((r) => (r.ok ? r.json() : Promise.reject()))
    .then((c: ClientConfig) => { writeJSON("tf:cfg", c, true); window.dispatchEvent(new Event("tf-config")); return c; })
    .catch(() => cachedConfig());
  return inflight;
}

export function useConfig(): ClientConfig {
  const [c, setC] = useState<ClientConfig>(FALLBACK);
  useEffect(() => {
    setC(cachedConfig());
    loadConfig().then(setC);
    const on = () => setC(cachedConfig());
    window.addEventListener("tf-config", on);
    return () => window.removeEventListener("tf-config", on);
  }, []);
  return c;
}
