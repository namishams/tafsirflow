"use client";
import { useMemo, useSyncExternalStore } from "react";
import { useLocale } from "next-intl";
import { readJSON, storageVersion, subscribeStorage, writeJSON } from "@/lib/storage";
import { readIdentity, saveIdentity, type Gender } from "@/lib/identity";
import { fillUi, tutorUi, type TutorUi } from "@/lib/tutor/ui";
import type { OpenPlace } from "@/lib/tutor/next";
import { useShams2 } from "@/lib/learn/shams2/model";
import { DIMS, type Dim } from "@/lib/learn/shams2/mastery";
import { readSrsState, streakOf } from "@/lib/learn/srs/store";

// The tutor's state in the browser (website, 1:1 with the app's features/tutor/prefs.ts and progress.ts): consent
// (Apple-style disclosure that questions go to OpenAI), the chosen tutor, the conversation (only in this browser) and
// the learner's own figures. Brother / sister is the shared identity (lib/identity.ts).

export type Persona = "dalil" | "hidaya";
export type Consent = { v: number; age: "13plus" | "parent"; at: number };
export type Cite = { n: number; title: string; link: string; kind: string };
export type Scripture = {
  verses: { key: string; arabic: string; translation: string; chapter: string; chapterArabic: string }[];
  hadith: { id: string; arabic?: string; text: string; textLang: string; reference: string; url?: string; grades?: { by: string; grade: string }[] }[];
};
export type ChatMsg = {
  role: "user" | "assistant"; content: string; at: number;
  id?: string; status?: string; notice?: string | null; sources?: Cite[]; related?: Cite[]; followups?: string[]; scripture?: Scripture; persona?: Persona; local?: boolean; open?: OpenPlace[];
};
export type TutorContext = {
  kind: "lesson" | "quiz" | "shams" | "verse" | "carousel" | "tajweed" | "guide" | "onboarding" | "progress" | "general";
  id?: string; lesson?: string; verse?: string; title?: string; question?: string; chosen?: string; correct?: string; explain?: string;
};

export const CONSENT_VERSION = 1;
const PREFS_KEY = "qmc.tutor.v1";
const CHAT_KEY = "qmc.tutor.chat.v1";
type Prefs = { consent: Consent | null; persona: Persona | null };

export const readPrefs = (): Prefs => ({ consent: null, persona: null, ...readJSON<Partial<Prefs>>(PREFS_KEY, {}) });
const savePrefs = (p: Partial<Prefs>) => writeJSON(PREFS_KEY, { ...readPrefs(), ...p }, true);
export const hasConsent = (p: Prefs = readPrefs()) => !!p.consent && p.consent.v >= CONSENT_VERSION;
export const giveConsent = (age: Consent["age"]) => savePrefs({ consent: { v: CONSENT_VERSION, age, at: Date.now() } });
export const withdrawConsent = () => savePrefs({ consent: null });
export const savePersona = (p: Persona) => savePrefs({ persona: p });
export const saveAddress = (g: Gender | null) => saveIdentity({ gender: g });
export const readChat = (): ChatMsg[] => readJSON<ChatMsg[]>(CHAT_KEY, []);
export const saveChat = (m: ChatMsg[]) => writeJSON(CHAT_KEY, m.slice(-60), true);
export const clearChat = () => writeJSON(CHAT_KEY, [], true);
export const personaOf = (p: Persona | null, g: Gender | null): Persona => (g !== "sister" ? "dalil" : p ?? "hidaya");
export const NAMES: Record<Persona, string> = { dalil: "Dalil", hidaya: "Hidaya" };

/** re-renders when the browser storage changes (version counter of lib/storage) */
export function useStorageVersion(): number {
  return useSyncExternalStore(subscribeStorage, storageVersion, () => 0);
}

export function useTutor() {
  const locale = useLocale();
  const v = useStorageVersion();
  return useMemo(() => {
    const prefs = readPrefs();
    const address = typeof window === "undefined" ? null : readIdentity().gender;
    const persona = personaOf(prefs.persona, address);
    const name = NAMES[persona];
    const ui: TutorUi = tutorUi(locale);
    return { prefs, address, persona, name, ui, chat: typeof window === "undefined" ? [] : readChat(), f: (s: string, x: Record<string, string | number> = {}) => fillUi(s, { name, ...x }) };
  }, [locale, v]); // eslint-disable-line react-hooks/exhaustive-deps
}

export type Progress = Partial<{
  streak: number; versesMemorised: number; learnedToday: boolean; minutesToday: number; weakestDim: Dim; weakestPct: number;
  todayNew: number; todayReview: number; testsDue: number; nextStep: string; milestone: string;
}>;
const MILESTONES = [1, 7, 10, 25, 50, 100, 200, 300, 500, 1000, 2000, 3000, 4000, 5000, 6000, 6236];

/** the learner's own figures from this browser (Shams model and review streak); nothing is estimated */
export function useTutorProgress(): Progress | null {
  const m = useShams2();
  return useMemo(() => {
    try {
      const p: Progress = {};
      p.streak = streakOf(readSrsState());
      p.versesMemorised = m.known.size;
      if (typeof m.todayMin === "number") { p.minutesToday = m.todayMin; p.learnedToday = m.todayMin > 0; }
      p.todayNew = m.wird.sabaq.verses;
      p.todayReview = m.wird.sabqi.verses + m.wird.manzil.verses;
      p.testsDue = (m.due.weekly ? 1 : 0) + (m.due.monthly ? 1 : 0);
      if (m.known.size >= 3) {
        const mm = m.mastery();
        let worst: { d: Dim; pct: number } | null = null;
        for (const d of DIMS) { const a = mm.overall.dims[d]; if (a?.pct === null || a?.pct === undefined || a.n < 3) continue; if (!worst || a.pct < worst.pct) worst = { d, pct: a.pct }; }
        if (worst) { p.weakestDim = worst.d; p.weakestPct = Math.round(worst.pct); }
      }
      if (m.wird.tathbit.items.length) p.nextStep = "tathbit (consolidate weak spots)";
      else if (m.wird.sabaq.verses) p.nextStep = "sabaq (new verses)";
      const hit = [...MILESTONES].reverse().find((n) => m.known.size >= n);
      if (hit && m.known.size - hit < 3) p.milestone = `${hit} verses memorised`;
      return p;
    } catch { return null; }
  }, [m]);
}
