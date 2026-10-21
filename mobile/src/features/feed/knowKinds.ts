import { readTradition, showsNahj } from "@/lib/tradition";
import { sijillFlags } from "@/features/sijill/config";
import type { SubjectId } from "@/features/school/model";

// The kinds and subjects of the knowledge posts, without their content: library.ts imports this file, and the
// builders (knowledge.ts, which reach into the courses, the Madrasa and gamification) load lazily on first use, so
// there is no import cycle with gamify.ts / library.ts.
export const KNOW_KINDS = ["kn-course", "kn-names", "kn-tadabbur", "kn-exam", "kn-faculty", "kn-adab", "kn-next", "kn-tajweed", "kn-maqam", "kn-arabic-word", "kn-grammar", "kn-abrahamic", "kn-haramain", "kn-nahj", "kn-moment"] as const;
export type KnowKind = (typeof KNOW_KINDS)[number];
export const isKnowKind = (k: string): k is KnowKind => (KNOW_KINDS as readonly string[]).includes(k);
/** the Madrasa subjects (features/school/model SUBJECTS, same order): Explore chips and personal interest */
export type KnowSubject = SubjectId;
export const KNOW_SUBJECTS: KnowSubject[] = ["quran", "arabic", "aqidah", "fiqh", "seerah", "hadith", "akhlaq", "tafsir"];

/** is this kind shown at all right now (Nahj visibility, the Sijill switch) */
export function knowVisible(kind: KnowKind): boolean {
  if (kind === "kn-nahj") { try { return showsNahj(readTradition()); } catch { return false; } }
  if (kind === "kn-moment") { try { return sijillFlags().momentsInFeed; } catch { return false; } }
  return true;
}
