import { readJSON } from "@/lib/store";
import { award } from "@/web/points";
import { addOwnCards, rateCard, readSrsState } from "@/features/srs/store";
import { statPost, statQuiz, statWords } from "@/features/feed/statsStore";
import { GAMIFY_KEY, bonusXp, setSocialTotals } from "@/features/feed/gamify";
import { engaged } from "@/features/feed/interest";
import { api } from "@/lib/api";
import type { SCard } from "./deck";
import { markShown, mashaState, noteMasha, recordLearned, streakXp } from "./store";

// What a swiped card does for the learner: it counts as reviewed. SRS cards are rated "good" (FSRS), a new Quran
// word joins the review cards, every card counts in the feed and journey statistics (statPost: posts, kinds, XP with
// the feed's daily cap, quests), the garden grows a little through the existing "vocab" points (one unit per card
// up to the daily growth cap of the config) and the Swipe & Learn streak earns a MashaAllah moment with XP.
/** the feed kind a card counts as (topics, interest, stickers) */
const FEED_KIND: Record<SCard["kind"], string> = {
  srs: "word", word: "word", verse: "verse", tajweed: "kn-tajweed", name: "kn-names", quiz: "kn-exam", course: "kn-course", maqasid: "kn-tadabbur",
  grammar: "kn-grammar", hadith: "hadith", tafsir: "tafsir", dua: "dua", insight: "word-of-day", moment: "kn-moment",
};
export const feedKindOf = (c: SCard) => (c.kind === "srs" && c.srs ? ({ word: "word", qword: "word", name: "kn-names", verse: "verse", dua: "dua", tajweed: "kn-tajweed" } as Record<string, string>)[c.srs.split(":")[0]] ?? "word" : c.lib?.kind && c.kind !== "quiz" ? c.lib.kind : FEED_KIND[c.kind]);

/** XP for a sent MashaAllah that the server counted (the "Encourager" stickers follow the server's total) */
export const XP_MASHA = 3;
/** a finished set of cards (the summary) */
export const XP_SET = 10;

export type LearnResult = { newWord: boolean; review: boolean; streak: number | null; milestone: boolean; xp: number };
export function learned(c: SCard, growthCap: number): LearnResult {
  markShown(c.id);
  let newWord = false, review = false, xp = 0;
  if (c.kind === "srs" && c.srs) { rateCard(c.srs, 3); review = true; }
  if (c.kind === "word" && c.word) {
    const id = `word:${c.word.id}`;
    if (!readSrsState().cards[id]) { newWord = addOwnCards([id]) > 0; if (newWord) statWords(1); }
  }
  if (c.kind !== "moment") {
    statPost(feedKindOf(c), c.id);
    engaged(feedKindOf(c), "learn");
  }
  const r = recordLearned({ newWord, review }, growthCap);
  if (r.growth && c.kind !== "moment") award("vocab");
  if (r.streak) { xp = streakXp(r.streak, r.milestone); bonusXp(xp); }
  return { newWord, review, streak: r.streak, milestone: r.milestone, xp };
}

/** a question answered on the card (once per card) */
export const answered = (right: boolean) => statQuiz(right);

export type MashaResult = "sent" | "already" | "dayFull" | "profile" | "error";
/** sends a MashaAllah for a moment (the existing reaction endpoint, its rules and caps); never throws */
export async function sendMasha(c: SCard): Promise<MashaResult> {
  const m = c.moment;
  if (!m) return "error";
  markShown(c.id);
  const st = mashaState(m.author.username);
  if (st !== "open") return st;
  try {
    const d = await api<{ mine: string | null; credited?: boolean }>(`/api/community/moments/${encodeURIComponent(m.id)}/react`, { method: "POST", body: { reaction: "mashallah" } });
    // older servers do not say whether it was counted: count it, the next sync of the totals corrects it
    const credited = d.credited !== false;
    noteMasha(m.author.username, credited);
    if (credited) {
      bonusXp(XP_MASHA);
      const g = readJSON<{ recv?: number; gave?: number }>(GAMIFY_KEY, {});
      setSocialTotals(g.recv ?? 0, (g.gave ?? 0) + 1);
    }
    return "sent";
  } catch (e) {
    const code = (e as { code?: string }).code ?? "";
    if (code === "profile_required" || code === "age" || code === "age16" || code === "age_required" || code === "login") return "profile";
    return "error";
  }
}
