import { ApiError, api } from "@/lib/api";
import { readTradition } from "@/lib/tradition";
import type { ChatMsg, Cite, Consent, Persona, Scripture } from "./prefs";

// The tutor's server calls (the website's /api/assistant, the same route for app and website).

export type TutorContext = {
  kind: "lesson" | "quiz" | "shams" | "verse" | "carousel" | "tajweed" | "guide" | "onboarding" | "progress" | "general";
  id?: string; lesson?: string; verse?: string; title?: string; question?: string; chosen?: string; correct?: string; explain?: string;
};
export type TutorStatus = { enabled: boolean; consentVersion: number; quota: { limit: number; left: number; pro: boolean; signedIn: boolean } };
export type TutorAnswer = {
  id: string; status: string; answer: string; notice: string | null; sources: Cite[]; related: Cite[]; followups: string[];
  verses: string[]; hadith: string[]; scripture: Scripture; quota: { limit: number; left: number; pro: boolean };
};
export type AskError = "offline" | "off" | "busy" | "limit" | "pro" | "login" | "verify" | "consent" | "age" | "rate" | "error";

export const tutorStatus = () => api<TutorStatus>("/api/assistant");

export async function askTutor(o: {
  question: string; history: ChatMsg[]; lang: string; context: TutorContext | null; address: string | null; persona: Persona; consent: Consent;
  progress?: Record<string, unknown> | null;
  /** goals and preferences the learner confirmed, only when they allow it (next.ts memoryForServer) */
  memory?: string[];
}): Promise<TutorAnswer> {
  const t = readTradition();
  return api<TutorAnswer>("/api/assistant", {
    timeoutMs: 60_000,
    body: {
      v: 2, question: o.question, locale: o.lang, context: o.context, address: o.address, persona: o.persona,
      tradition: t === "sunni" || t === "shia" ? t : "all",
      consent: { v: o.consent.v, age: o.consent.age },
      progress: o.progress ?? undefined,
      memory: o.memory?.length ? o.memory : undefined,
      history: o.history.filter((m) => !m.local).slice(-6).map((m) => ({ role: m.role, content: m.content.slice(0, 600) })),
    },
  });
}

export function askError(e: unknown): AskError {
  if (!(e instanceof ApiError)) return "offline";
  const c = e.code;
  if (e.status === 402 || c === "pro") return "pro";
  if (e.status === 428 || c === "consent") return "consent";
  if (c === "age") return "age";
  if (c === "verify") return "verify";
  if (e.status === 401 || c === "login") return "login";
  if (c === "limit") return "limit";
  if (c === "rate") return "rate";
  if (c === "off") return "off";
  if (c === "busy" || e.status === 503) return "busy";
  return "error";
}

export const reportAnswer = (b: { id: string; reason: string; note?: string; question?: string; answer?: string; sources?: string[]; locale: string }) =>
  api<{ ok: boolean }>("/api/assistant/report", { body: b, timeoutMs: 20_000 });

export type PathStep = { id: string; link: string; title: string; why: string };
export const tailorPath = (b: { answers: Record<string, string>; locale: string; address: string | null; persona: Persona; consent: Consent }) =>
  api<{ intro: string; steps: PathStep[] }>("/api/assistant/path", { body: { ...b, consent: { v: b.consent.v, age: b.consent.age } }, timeoutMs: 45_000 });
