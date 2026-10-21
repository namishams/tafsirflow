import { api } from "@/lib/api";
import type { Snapshot } from "@/features/shams2/teacherModel";

// Client of /api/teacher/* (website src/app/api/teacher, src/lib/teacherShare.ts). Usernames only, never ids of people.
export type Member = { username: string; name: string; level: string; badge: string | null; verified: boolean; avatar: string | null; country: string | null };
export type Preset = "keep_going" | "well_done" | "gentle_reminder" | "take_your_time";
export const PRESETS: Preset[] = ["keep_going", "well_done", "gentle_reminder", "take_your_time"];
export type SugStatus = "open" | "accepted" | "dismissed" | "done";
export type Suggestion = { id: string; kind: "nudge" | "assign"; preset: Preset | null; surah: number | null; from: number | null; to: number | null; status: SugStatus; at: string };
export type Inbox = Suggestion & { shareId: string; teacher: Member | null };
export type MyTeacher = { id: string; status: "pending" | "active"; parental: boolean; syncedAt: string | null; since: string; teacher: Member | null };
export type Digest = { memorised: number; overall: number | null; grade: number; streak: number; activeDays: number; idle: number | null; weak: number; itqan: { surahs: number; juz: number }; minutes: number; syncedAt: string | null };
export type StudentRow = { id: string; status: "pending" | "active"; member: Member | null; since: string; open: number; digest: Digest | null };
export type ServerSnapshot = Snapshot & { grade: number; weak: { total: number; lapses: number; fading: number; words: number; mut: number }; itqan: { surahs: number; juz: number } };

export const TL = {
  shares: () => api<{ consentVersion: number; parentalNeeded: boolean; maxTeachers: number; teachers: MyTeacher[]; suggestions: Inbox[] }>("/api/teacher/shares"),
  invite: (username: string, parental: boolean) => api<{ ok: true; id: string }>("/api/teacher/shares", { body: { username, consent: true, parental } }),
  answer: (id: string, action: "accept" | "decline") => api<{ ok: true }>(`/api/teacher/shares/${id}`, { method: "PATCH", body: { action } }),
  end: (id: string) => api<{ ok: true }>(`/api/teacher/shares/${id}`, { method: "DELETE" }),
  sync: (snapshot?: unknown) => api<{ ok: true; shares: number; suggestions: Inbox[] }>("/api/teacher/sync", { body: snapshot ? { snapshot } : {} }),
  students: () => api<{ students: StudentRow[] }>("/api/teacher/students"),
  student: (id: string) => api<{ id: string; member: Member | null; snapshot: ServerSnapshot | null; digest: Digest | null; syncedAt: string | null; suggestions: Suggestion[] }>(`/api/teacher/students/${id}`),
  nudge: (shareId: string, preset: Preset) => api<{ ok: true }>("/api/teacher/suggestions", { body: { shareId, kind: "nudge", preset } }),
  assign: (shareId: string, surah: number, from: number, to: number) => api<{ ok: true }>("/api/teacher/suggestions", { body: { shareId, kind: "assign", surah, from, to } }),
  respond: (id: string, action: "accept" | "dismiss" | "done") => api<{ ok: true }>(`/api/teacher/suggestions/${id}`, { method: "PATCH", body: { action } }),
  withdraw: (id: string) => api<{ ok: true }>(`/api/teacher/suggestions/${id}`, { method: "DELETE" }),
};
