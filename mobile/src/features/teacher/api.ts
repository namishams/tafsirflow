import { api } from "@/lib/api";
import { upload } from "@/features/talents/api";
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
export type ServerSnapshot = Snapshot & { grade: number; weak: { total: number; lapses: number; fading: number; words: number; mut: number }; itqan: { surahs: number; juz: number }; mastery?: Record<"hifz" | "words" | "links" | "understand" | "tajweed" | "similar", number | null> };

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

// ——— recordings for a teacher (Shams 3.0): /api/teacher/recitations (website src/app/api/teacher/recitations) ———
export type RecKind = "blind" | "talaqqi" | "drill" | "makhraj";
export type RecRubric = { makharij?: number; tajweed?: number; waqf?: number; pace?: number };
/** what the app measured or the learner rated (no free text): own rating 1–5, ear-training answers, words heard */
export type RecSummary = { self?: number; quizOk?: number; quizMiss?: number; heardOk?: number; heardTotal?: number };
export type RecReview = RecRubric & { id: string; marks: string[]; text: string; at: string };
export type Recitation = {
  id: string; kind: RecKind; surah: number | null; from: number | null; to: number | null; letter: string | null; durationMs: number;
  summary: RecSummary; status: "open" | "reviewed"; at: string; expiresAt: string; hasAudio: boolean;
  student: Member | null; teacher: Member | null; review: RecReview | null;
};
export type RecSend = { shareId: string; kind: RecKind; durationMs: number; surah?: number; from?: number; to?: number; letter?: string; summary?: RecSummary; parental?: boolean };
/** shortest recording a teacher can be sent: a few seconds for one letter, half a minute for a recitation */
export const REC_MIN_MS: Record<RecKind, number> = { makhraj: 5_000, drill: 30_000, talaqqi: 30_000, blind: 30_000 };
export const REC_MAX_MS = 5 * 60_000;
const enc = encodeURIComponent;
export const RL = {
  list: (box: "mine" | "inbox") => api<{ recitations: Recitation[]; parentalNeeded: boolean }>(`/api/teacher/recitations?box=${box}`),
  get: (id: string) => api<{ recitation: Recitation; role: "student" | "teacher" }>(`/api/teacher/recitations/${enc(id)}`),
  withdraw: (id: string) => api<{ ok: true }>(`/api/teacher/recitations/${enc(id)}`, { method: "DELETE" }),
  review: (id: string, b: RecRubric & { marks: string[]; text: string }) => api<{ ok: true }>(`/api/teacher/recitations/${enc(id)}/review`, { body: b }),
  report: (id: string, category: string, reason: string, review = false) => api<{ reported: true }>(`/api/teacher/recitations/${enc(id)}/report`, { body: { category, reason, review } }),
  audioPath: (id: string) => `/api/teacher/recitations/${enc(id)}/audio`,
  send: (f: RecSend, uri: string, mime = "audio/mp4", name = "recitation.m4a") => {
    const fields: Record<string, string> = { shareId: f.shareId, kind: f.kind, durationMs: String(Math.round(f.durationMs)), summary: JSON.stringify(f.summary ?? {}) };
    if (f.surah && f.from && f.to) { fields.surah = String(f.surah); fields.from = String(f.from); fields.to = String(f.to); }
    if (f.letter) fields.letter = f.letter;
    if (f.parental) fields.parental = "1";
    return upload<{ ok: true; id: string }>("/api/teacher/recitations", fields, { file: { uri, name, type: mime } });
  },
};
