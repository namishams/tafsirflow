import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import type { Badge } from "@/features/talents/badges";

// Client of the worldwide ranking endpoints (website src/app/api/community/rankings*). Mirrors src/lib/rankings.ts.
export const METRICS = ["xp_week", "xp_total", "streak", "verses", "stickers", "mashaallah"] as const;
export type Metric = (typeof METRICS)[number];
export type Scope = "world" | "country" | "friends" | "countries";
export type Row = { rank: number; username: string; name: string; country: string | null; badge: Badge | null; level: string; avatar: string | null; score: number; streak: number; me: boolean };
export type Me = { optedIn: boolean; world: boolean; counted: boolean; country: string | null; score: number; rank: number | null; countryRank: number | null; participants: number; pending: boolean };
export type CountryRow = { rank: number; country: string; members: number; active: number; total: number; perCapita: number; me: boolean };
export type Listing = {
  scope: Scope; metric: Metric; resetsAt: string; named: number; counted: number; minCountryMembers: number;
  rows?: Row[]; me?: Me | null; country?: string | null; needCountry?: boolean;
  countries?: CountryRow[]; mineCountry?: CountryRow | null; myCountry?: string | null;
};
export type Settings = { hasProfile: boolean; ageKnown: boolean; age16: boolean; optIn: boolean; world: boolean; countCountry: boolean; country: string | null };
export type SettingsResp = { settings: Settings; week: Me | null; total: Me | null; resetsAt: string };
export type SeasonRows = Row[];
export type CountryHall = { rank: number; country: string; members: number; active: number; score: number };
export type Hall = { season: { kind: string; key: string; from: string; to: string; participants: number }; members: Record<string, Row[]>; countries: { total: CountryHall[]; perCapita: CountryHall[] } };

export const rankingsApi = {
  list: (q: { scope: Scope; metric?: Metric; country?: string | null; period?: "week" | "all"; cm?: "xp" | "stickers" | "verses"; mode?: "total" | "per_capita" }) => {
    const p = new URLSearchParams({ scope: q.scope });
    if (q.scope === "countries") { p.set("period", q.period ?? "week"); p.set("cm", q.cm ?? "xp"); p.set("mode", q.mode ?? "total"); } else p.set("metric", q.metric ?? "xp_week");
    if (q.scope === "country" && q.country) p.set("country", q.country);
    return api<Listing>(`/api/community/rankings?${p}`);
  },
  settings: () => api<SettingsResp>("/api/community/rankings/settings"),
  save: (body: { optIn?: boolean; countCountry?: boolean }) => api<{ settings: Settings }>("/api/community/rankings/settings", { method: "POST", body }),
  hall: () => api<{ hall: Hall[] }>("/api/community/rankings/history?kind=year&hall=1"),
  of: (username: string) => api<{ rank: { world: number | null; country: number | null; countryCode: string | null } | null }>(`/api/community/rankings/of/${encodeURIComponent(username)}`),
};

// the member's own place, loaded once and kept for ten minutes (feed ring, Account link)
let mine: { at: number; v: SettingsResp | null; uid: string } | null = null;
export function useMyRanking(): SettingsResp | null {
  const { user } = useAuth();
  const [v, setV] = useState<SettingsResp | null>(mine && user && mine.uid === String(user.id) ? mine.v : null);
  useEffect(() => {
    if (!user) { setV(null); return; }
    const uid = String(user.id);
    if (mine && mine.uid === uid && Date.now() - mine.at < 10 * 60_000) { setV(mine.v); return; }
    let off = false;
    rankingsApi.settings().then((r) => { mine = { at: Date.now(), v: r, uid }; if (!off) setV(r); }).catch(() => { mine = { at: Date.now(), v: null, uid }; });
    return () => { off = true; };
  }, [user]);
  return v;
}
/** forget the cached place (after joining or leaving) */
export const resetMyRanking = () => { mine = null; };
