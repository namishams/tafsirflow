import { api } from "@/lib/api";
import type { TalentCard } from "@/features/talents/api";
import { demoOn, demoReply } from "./sample";

// Client of the Together endpoints (website src/app/api/together/*, logic in src/lib/together.ts). In development,
// `?demo=1` on /together switches to sample data for screenshots (sample.ts); release builds never show it.
export type Feature = "activity" | "league" | "circles" | "challenges" | "nudges" | "community" | "bestList";
export type Gender = "brother" | "sister";
export type Settings = Record<Feature, boolean> & { gender: Gender | null };
export type FriendToday = TalentCard & { today: boolean; streak: number; weekActive: number };
export type FriendsToday = { list: FriendToday[]; sharing: number; friends: number; learnedToday: number; keptStreak: number };
export type CircleKind = "brothers" | "sisters" | "family" | "teacher";
export type GoalKind = "days" | "xp" | "verses";
export type CircleSummary = { id: string; name: string; kind: CircleKind; role: "leader" | "member"; status: "pending" | "member"; members: number; pending: number; suspended: boolean; goalKind: GoalKind; goal: number; progress: number; reached: boolean; streak: number };
export type Pulse = { settings: Settings; friends: FriendsToday; league: { tier: number } | null; circles: CircleSummary[]; inbox: { unread: number } };
export type LeagueRow = TalentCard & { xp: number; tier: number; me: boolean; active: number; rank: number };
export type League = { enabled: boolean; tier?: number; bestTier?: number; last?: { result: "up" | "stay" | "down"; rank: number | null; size: number | null } | null; rows?: LeagueRow[]; upZone?: number; daysLeft?: number };
export type CircleMember = TalentCard & { role: "leader" | "member"; me: boolean; today: boolean; streak: number; week: { xp: number; days: number; verses: number }; canNudge: boolean };
export type Circle = {
  id: string; name: string; kind: CircleKind; role: "leader" | "member"; status: "pending" | "member"; suspended: boolean; goalKind: GoalKind; goal: number; approval: boolean; maxMembers: number;
  code: string | null; members: CircleMember[]; pending: TalentCard[]; progress: number; reached: boolean; streak: number; history: { week: number; progress: number; goal: number; reached: boolean }[];
};
export type ChallengeKind = "surah" | "verses" | "streak";
export type Challenge = {
  id: string; kind: ChallengeKind; target: number; days: number; status: "pending" | "active" | "declined" | "cancelled" | "ended"; fromMe: boolean; other: TalentCard;
  createdAt: string; endsAt: string | null; goal: number; mine: number; theirs: number; mineDone: boolean; theirsDone: boolean;
};
export type Topic = "surah" | "review" | "tafsir" | "arabic" | "tajweed";
export type Invite = { id: string; topic: Topic; surah: number | null; at: string; mine: boolean; from: TalentCard | null; to: TalentCard | null; circle: { id: string; name: string } | null; myAnswer: "yes" | "no" | null; yes: number };
export type NudgeKind = "miss_you" | "together_today" | "dua_ease" | "well_done" | "keep_streak";
export const NUDGE_KINDS: NudgeKind[] = ["miss_you", "together_today", "dua_ease", "well_done", "keep_streak"];
export type Nudge = { id: string; kind: NudgeKind; at: string; read: boolean; circle: { id: string; name: string } | null; from: TalentCard };
export type Inbox = { nudges: Nudge[]; challenges: Challenge[]; invites: Invite[]; joinRequests: number; unread: number };
export type BestRow = TalentCard & { rank: number; verses: number };
export type Community = {
  month: string; world: { verses: number; learners: number; goal: number }; country: { code: string; verses: number; learners: number; goal: number } | null;
  countries: { country: string; verses: number; learners: number }[]; best: { world: BestRow[]; country: BestRow[] }; mine: { community: boolean; bestList: boolean };
};
/** read-only summary for the AI tutor (GET /api/together/summary) */
export type TogetherSummary = {
  streak: number; learnedToday: boolean; weekXp: number; weekActiveDays: number;
  friends: { sharing: number; learnedToday: number; keptStreak: number; names: string[] };
  circles: { id: string; name: string; goalKind: GoalKind; goal: number; progress: number; reached: boolean; groupStreak: number; members: number }[];
  league: { tier: number; rank: number | null; size: number; daysLeft: number; last: "up" | "stay" | "down" | null; aheadXp: number | null } | null;
  challenges: { kind: ChallengeKind; target: number; mine: number; theirs: number; goal: number; with: string; endsAt: string | null }[];
  sessionsToday: { topic: Topic; surah: number | null; at: string }[];
  rankChange: { rank: number | null; prev: number | null; change: number | null } | null;
  settings: Settings;
};
export type ReportCategory = "spam" | "harassment" | "inappropriate" | "impersonation" | "minor_safety" | "other";

const u = encodeURIComponent;
/** in demo mode (development only) answers come from sample.ts, never from the server */
function call<T>(path: string, init?: { method?: string; body?: unknown }): Promise<T> {
  if (demoOn()) return Promise.resolve(demoReply(path, init?.method ?? (init?.body !== undefined ? "POST" : "GET"), init?.body) as T);
  return api<T>(path, init);
}

export const TG = {
  pulse: () => call<Pulse>("/api/together/pulse"),
  settings: () => call<{ settings: Settings }>("/api/together/settings"),
  saveSettings: (patch: Partial<Settings>) => call<{ settings: Settings }>("/api/together/settings", { method: "PUT", body: patch }),
  league: () => call<League>("/api/together/league"),
  circles: () => call<{ circles: CircleSummary[] }>("/api/together/circles"),
  createCircle: (b: { name: string; kind: CircleKind; goalKind: GoalKind; goal: number; approval: boolean; consent: true; gender?: Gender }) =>
    call<{ id: string }>("/api/together/circles", { method: "POST", body: b }),
  joinCircle: (b: { code: string; consent: true; gender?: Gender }) => call<{ id: string; status: "pending" | "member" }>("/api/together/circles/join", { method: "POST", body: b }),
  circle: (id: string) => call<{ circle: Circle }>(`/api/together/circles/${u(id)}`),
  updateCircle: (id: string, b: Partial<{ name: string; goalKind: GoalKind; goal: number; approval: boolean; newCode: true }>) =>
    call<{ circle: Circle }>(`/api/together/circles/${u(id)}`, { method: "PATCH", body: b }),
  deleteCircle: (id: string) => call<{ ok: true }>(`/api/together/circles/${u(id)}`, { method: "DELETE" }),
  member: (id: string, action: "approve" | "decline" | "remove" | "leave", username?: string) =>
    call<{ ok: true }>(`/api/together/circles/${u(id)}/members`, { method: "POST", body: { action, username } }),
  reportCircle: (id: string, category: ReportCategory, reason: string) => call<{ reported: true }>(`/api/together/circles/${u(id)}/report`, { method: "POST", body: { category, reason } }),
  challenges: () => call<{ challenges: Challenge[] }>("/api/together/challenges"),
  challenge: (b: { username: string; kind: ChallengeKind; target: number; days: number }) => call<{ id: string }>("/api/together/challenges", { method: "POST", body: b }),
  answerChallenge: (id: string, action: "accept" | "decline" | "cancel") => call<{ challenges: Challenge[] }>(`/api/together/challenges/${u(id)}`, { method: "PATCH", body: { action } }),
  invites: () => call<{ invites: Invite[] }>("/api/together/invites"),
  invite: (b: { username?: string; circleId?: string; topic: Topic; surah?: number; at: string }) => call<{ id: string }>("/api/together/invites", { method: "POST", body: b }),
  answerInvite: (id: string, b: { answer?: "yes" | "no"; cancel?: true }) => call<{ invites: Invite[] }>(`/api/together/invites/${u(id)}`, { method: "PATCH", body: b }),
  nudge: (b: { username: string; kind: NudgeKind; circleId?: string }) => call<{ ok: true }>("/api/together/nudges", { method: "POST", body: b }),
  inbox: () => call<Inbox>("/api/together/inbox"),
  readInbox: () => call<{ ok: true }>("/api/together/inbox", { method: "POST", body: {} }),
  friends: (f: Feature) => call<{ friends: TalentCard[] }>(`/api/together/friends?for=${f}`),
  stats: (username: string) => call<{ stats: { own: boolean; league: { tier: number; bestTier: number } | null; circles: number | null; circleWeeksReached: number | null; challengesDone: number | null } }>(`/api/together/stats/${u(username)}`),
  summary: () => call<{ summary: TogetherSummary }>("/api/together/summary"),
  community: (country?: string) => call<Community>(`/api/together/community${country ? `?country=${u(country)}` : ""}`),
};
