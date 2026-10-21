import { api } from "@/lib/api";
import type { Badge } from "@/features/talents/badges";
import type { TalentCard } from "@/features/talents/api";

// Client of the Sijill endpoints (website src/app/api/community/{achievements,talents/<u>/sijill,compare,leaderboard,
// buddies,moments}). Mirrors src/lib/sijill.ts.
export const SECTIONS = ["level", "badges", "hifz", "tree", "stickers", "certificates", "exams", "memorised", "time", "activity", "courses", "sharer"] as const;
export type Section = (typeof SECTIONS)[number];
export type Privacy = Record<Section, boolean>;
export type StudyStage = "ibtidai" | "idadi" | "thanawi" | "ali";
export type Focus = "hifz" | "reading" | "arabic" | "knowledge";
export const STUDY_STAGES: StudyStage[] = ["ibtidai", "idadi", "thanawi", "ali"];
export const FOCUSES: Focus[] = ["hifz", "reading", "arabic", "knowledge"];

export type Summary = {
  v: 1;
  level: { xp: number; level: number };
  rank: { stage: StudyStage; rank: "talib" | "mutaqaddim"; overall: number | null };
  hifz: { grade: number; verses: number; tests: number; quality: number | null };
  tree: { type: string; stage: number; trees: number; fruits: number; name: string; days: number };
  stickers: { total: number; catalog: number; feed: number; rare: number; epic: number; legendaryN: number; legendary: string[]; series: string[] };
  memorised: { verses: number; juz: number[]; surahs: number[]; current: number | null };
  time: { totalMin: number; weekMin: number; streak: number; best: number; wird: number };
  week: { monday: number; xp: number[]; active: number };
  courses: { done: number; ids: string[]; qaida: number; arabic: number; rp: number; arLevels: string[] };
  goal: { minutes: number; focus: Focus };
};
export type Certificate = { title: string; course: string; pct: number; url: string; at: string };
export type ExamPassed = { exam: string; ref: string; pct: number; at: string; attempts: number };
export type Sijill = {
  updatedAt: string | null;
  privacy?: Privacy;
  leaderboard?: boolean;
  level?: { xp: number; level: number; talentLevel: string; stage: StudyStage; rank: "talib" | "mutaqaddim"; overall: number | null };
  badges?: { badge: Badge | null; official: boolean };
  hifz?: Summary["hifz"];
  tree?: Summary["tree"];
  stickers?: Summary["stickers"];
  certificates?: Certificate[];
  exams?: ExamPassed[];
  memorised?: Summary["memorised"];
  time?: Summary["time"];
  activity?: { xp: number; level: number; week: number[]; active: number };
  courses?: Summary["courses"];
  sharer?: { tier: number; shares: number };
  reactions: number;
  moments: number;
};
export type SijillConfig = { momentsInFeed: boolean; leaderboards: boolean; compare: boolean };

export const REACTIONS = ["like", "mashallah", "barakallah", "barik"] as const;
export type Reaction = (typeof REACTIONS)[number];
export type MomentKind = "certificate" | "exam" | "level" | "juz" | "tree" | "sticker" | "streak" | "course" | "hifz";
export type Moment = {
  id: string; kind: MomentKind; ref: string; data: Record<string, unknown>; at: string; title: string | null;
  total: number; mine: Reaction | null; own: boolean; counts: Record<Reaction, number>;
  author: { username: string; name: string; badge: Badge | null; avatar: string | null };
};
export type LbRow = TalentCard & { rank: number; score: number; streak: number; me: boolean };
export type Buddy = TalentCard & { match: { stage: boolean; focus: boolean; stageId: string; focusId: string } };

const u = encodeURIComponent;
export const sijillApi = {
  mine: (locale: string) => api<{ sijill: Sijill; config: SijillConfig }>(`/api/community/achievements?locale=${u(locale)}`),
  sync: (body: { summary?: Summary; privacy?: Partial<Privacy>; leaderboard?: boolean }, locale = "en") =>
    api<{ sijill: Sijill }>(`/api/community/achievements?locale=${u(locale)}`, { method: "POST", body }),
  of: (username: string, locale: string) => api<{ sijill: Sijill | null; restricted?: boolean }>(`/api/community/talents/${u(username)}/sijill?locale=${u(locale)}`),
  compare: (username: string, locale: string) =>
    api<{ me: { username: string; name: string; sijill: Sijill }; them: { username: string; name: string; sijill: Sijill } }>(`/api/community/compare/${u(username)}?locale=${u(locale)}`),
  leaderboard: (kind: "following" | "consistent", metric: "xp" | "streak" | "memorised" = "xp") =>
    api<{ kind: string; metric: string; optedIn: boolean; rows: LbRow[] }>(`/api/community/leaderboard?kind=${kind}&metric=${metric}`),
  buddies: () => api<{ buddies: Buddy[]; needSync?: boolean }>("/api/community/buddies"),
  moments: (q: { scope?: "friends" | "user"; u?: string; before?: string; locale: string }) =>
    api<{ moments: Moment[]; more: string | null }>(`/api/community/moments?${new URLSearchParams(Object.entries(q).filter(([, v]) => v) as [string, string][]).toString()}`),
  react: (id: string, reaction: Reaction | null) =>
    api<{ mine: Reaction | null; counts: Record<Reaction, number>; total: number }>(`/api/community/moments/${u(id)}/react`, reaction ? { method: "POST", body: { reaction } } : { method: "DELETE" }),
};
