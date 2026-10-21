import { api, ApiError } from "@/lib/api";
import { upload } from "@/features/talents/api";
import type { Badge } from "@/features/talents/badges";

// Client for the mentoring and season endpoints (website src/app/api/mentoring/*). Usernames only, never ids of people.
export type Member = { username: string; name: string; level: string; badge: Badge | null; verified: boolean; avatar: string | null; country: string | null };
export type Link = { id: string; status: "pending" | "accepted"; note: string; since: string; open: number; member: Member | null };
export type MentoringMe = { canMentor: boolean; canJudge: boolean; admin: boolean; mentors: Link[]; students: Link[]; inbox: number };
export type MasterItem = Member & { link: "none" | "pending" | "accepted" | "declined" | "ended" };
export const RUBRIC = ["makharij", "tajweed", "waqf", "pace", "maqam"] as const;
export type RubricKey = (typeof RUBRIC)[number];
export type Submission = {
  id: string; verseKey: string; durationMs: number; note: string; status: "pending" | "reviewed"; at: string; expiresAt: string; hasAudio: boolean;
  season: string | null; reviews: number; avgTotal: number | null; student: Member | null; mentor: Member | null;
};
export type Review = { id: string; at: string; text: string; rubric: Record<RubricKey, number>; total: number; reviewer: Member | null };
export type SubmissionDetail = { submission: Submission; role: "student" | "master" | "jury"; reviews: Review[]; canReview: boolean };
export type Season = {
  slug: string; kind: "month" | "ramadan" | "special"; title: string; verses: string; startsOn: string; endsOn: string; maxSeconds: number;
  status: "open" | "judging" | "closed"; published: boolean; rewards: { mythic: string; legendary: string };
};
export type SeasonItem = Season & { entries: number; mine: { id: string; status: string } | null; result: { place: number; score: number; sticker: string | null; rarity: string | null } | null };
export type Placement = { place: number; score: number; sticker: string | null; rarity: "mythic" | "legendary" | null; member: Member | null; mine?: boolean };

const u = encodeURIComponent;
export const M = {
  me: () => api<MentoringMe>("/api/mentoring/me"),
  masters: () => api<{ masters: MasterItem[] }>("/api/mentoring/masters"),
  ask: (username: string, note = "") => api<{ ok: true }>("/api/mentoring/links", { body: { username, note } }),
  link: (id: string, action: "accept" | "decline" | "end") => api<{ ok: true }>(`/api/mentoring/links/${u(id)}`, { body: { action } }),
  submissions: (box: "mine" | "inbox" | "jury", season?: string) => api<{ submissions: Submission[] }>(`/api/mentoring/submissions?box=${box}${season ? `&season=${u(season)}` : ""}`),
  submission: (id: string) => api<SubmissionDetail>(`/api/mentoring/submissions/${u(id)}`),
  withdraw: (id: string) => api<{ ok: true }>(`/api/mentoring/submissions/${u(id)}`, { method: "DELETE" }),
  review: (id: string, rubric: Record<RubricKey, number>, text: string) => api<{ ok: true }>(`/api/mentoring/submissions/${u(id)}/review`, { body: { ...rubric, text } }),
  audioPath: (id: string) => `/api/mentoring/submissions/${u(id)}/audio`,
  send: (fields: { verseKey: string; durationMs: number; note?: string; mentor?: string; season?: string }, uri: string) =>
    upload<{ ok: true; id: string }>("/api/mentoring/submissions",
      Object.fromEntries(Object.entries({ ...fields, durationMs: String(Math.round(fields.durationMs)) }).filter(([, v]) => v !== undefined && v !== "")) as Record<string, string>,
      { file: { uri, name: "recitation.m4a", type: "audio/mp4" } }),
  seasons: () => api<{ seasons: SeasonItem[]; admin: boolean; judge: boolean }>("/api/mentoring/seasons"),
  season: (slug: string) => api<{ season: Season; entries: number; judged: number; results: Placement[] }>(`/api/mentoring/seasons/${u(slug)}`),
  newSeason: (b: { slug: string; kind: string; title: string; verses: string; startsOn: string; endsOn: string; maxSeconds?: number }) => api<{ ok: true }>("/api/mentoring/seasons", { body: b }),
  seasonAction: (slug: string, action: "judging" | "publish") => api<{ ok: true }>(`/api/mentoring/seasons/${u(slug)}`, { body: { action } }),
  hallOfFame: () => api<{ seasons: { season: Season; podium: Placement[] }[] }>("/api/mentoring/hall-of-fame"),
};
export const errCode = (e: unknown) => (e instanceof ApiError ? e.code : "generic");
