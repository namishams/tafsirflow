import { api } from "@/lib/api";
import type { Badge } from "@/features/talents/badges";
import type { Sijill } from "@/features/sijill/api";
import type { BoardCat, BoardPeriod, BoardScope, Career } from "./career";

// Client of the progress profile and the global boards (website src/app/api/community/stats/<u> and
// src/app/api/community/rankings/board). Mirrors src/lib/careerStats.ts.
export type RankPos = { rank: number | null; total: number; pct: number | null; country: number | null; countryTotal: number; score: number };
export type Milestone = { kind: string; ref: string; data: Record<string, unknown>; at: string };
export type Side = { username: string; name: string; avatar: string | null; badge: Badge | null; country: string | null; sijill: Sijill; career: Career | null; ranks: Record<string, RankPos> | null };
export type CareerStats = Side & {
  v: 1; level: string; mine: boolean; memberSince: string | null; optedIn?: boolean;
  milestones: Milestone[];
  compare: { allowed: boolean; me?: Side } | null;
};
export type BoardRow = { rank: number; username: string; name: string; country: string | null; badge: Badge | null; level: string; avatar: string | null; score: number; streak: number; me: boolean };
export type Board = {
  scope: BoardScope; cat: BoardCat; period: BoardPeriod; country: string | null; rows: BoardRow[]; named: number;
  me: { rank: number | null; total: number; pct: number | null; score: number; listed: boolean } | null; needCountry?: boolean;
};

const u = encodeURIComponent;
export const statsApi = {
  of: (username: string, locale: string) => api<{ stats: CareerStats | null; restricted?: boolean }>(`/api/community/stats/${u(username)}?locale=${u(locale)}`),
  board: (q: { scope: BoardScope; cat: BoardCat; period: BoardPeriod; country?: string | null }) => {
    const p = new URLSearchParams({ scope: q.scope, cat: q.cat, period: q.period });
    if (q.scope === "country" && q.country) p.set("country", q.country);
    return api<Board>(`/api/community/rankings/board?${p}`);
  },
  top: () => api<{ top: Record<BoardCat, BoardRow[]> | null }>("/api/community/rankings/board?top=1"),
};
