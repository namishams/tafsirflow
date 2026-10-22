import { readJSON, useStored, writeJSON } from "@/lib/store";
import { readIdentity, saveIdentity, useIdentity, type Gender } from "@/lib/identity";

// The tutor's settings on this device: the consent (Apple 5.1.2(i): questions go to OpenAI), the chosen tutor and the
// conversation. Brother / sister is NOT kept here: it is the learner's identity (lib/identity.ts, one synced key for
// the whole product), read and written through that module.
// Nothing here is synced: the consent is given per device, the conversation never leaves it.

export type Persona = "dalil" | "hidaya";
export type Consent = { v: number; age: "13plus" | "parent"; at: number };
export type TutorPrefs = { consent: Consent | null; persona: Persona | null };
export type Cite = { n: number; title: string; link: string; kind: string };
export type Scripture = {
  verses: { key: string; arabic: string; translation: string; chapter: string; chapterArabic: string }[];
  hadith: { id: string; arabic?: string; text: string; textLang: string; reference: string; url?: string; grades?: { by: string; grade: string }[] }[];
};
export type ChatMsg = {
  role: "user" | "assistant";
  content: string;
  at: number;
  // assistant only
  id?: string; status?: string; notice?: string | null; sources?: Cite[]; related?: Cite[]; followups?: string[]; scripture?: Scripture; persona?: Persona;
  /** a fixed message of the app (offline, limit …), never sent back as history */
  local?: boolean;
};

export const CONSENT_VERSION = 1;
const PREFS_KEY = "qmc.tutor.v1";
const CHAT_KEY = "qmc.tutor.chat.v1";
const MAX_SAVED = 60;
const EMPTY: TutorPrefs = { consent: null, persona: null };

export const readPrefs = (): TutorPrefs => ({ ...EMPTY, ...readJSON<Partial<TutorPrefs>>(PREFS_KEY, {}) });
export const useTutorPrefs = () => ({ ...EMPTY, ...useStored<Partial<TutorPrefs>>(PREFS_KEY, {}) });
const savePrefs = (p: Partial<TutorPrefs>) => writeJSON(PREFS_KEY, { ...readPrefs(), ...p }, true);

export const hasConsent = (p: TutorPrefs = readPrefs()) => !!p.consent && p.consent.v >= CONSENT_VERSION;
export const giveConsent = (age: Consent["age"]) => savePrefs({ consent: { v: CONSENT_VERSION, age, at: Date.now() } });
export const withdrawConsent = () => savePrefs({ consent: null });

/** brother / sister from the shared identity (null = not stated) */
export const useAddress = (): Gender | null => useIdentity().gender;
export const readAddress = (): Gender | null => readIdentity().gender;
export const saveAddress = (g: Gender | null) => saveIdentity({ gender: g });

/** Hidaya only for sisters, and their default; everyone else has Dalil */
export function personaOf(p: Persona | null, address: Gender | null): Persona {
  if (address !== "sister") return "dalil";
  return p ?? "hidaya";
}
export const savePersona = (p: Persona) => savePrefs({ persona: p });
export const TUTOR_NAMES: Record<Persona, { name: string; ar: string }> = { dalil: { name: "Dalil", ar: "دليل" }, hidaya: { name: "Hidaya", ar: "هداية" } };

export const readChat = (): ChatMsg[] => readJSON<ChatMsg[]>(CHAT_KEY, []);
export const useChat = (): ChatMsg[] => useStored<ChatMsg[]>(CHAT_KEY, []);
export const saveChat = (m: ChatMsg[]) => writeJSON(CHAT_KEY, m.slice(-MAX_SAVED), true);
export const clearChat = () => writeJSON(CHAT_KEY, [], true);
