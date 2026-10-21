// mirrors mobile/src/features/swipe/learn.ts: what a swiped card does for the learner on the website. SRS cards are
// rated "good" (FSRS), a new Quran word joins the review cards, every card counts in the feed and journey statistics
// (statPost), the garden grows a little through the "vocab" points (one unit per card up to the daily cap of the
// config) and the Swipe & Learn streak earns a MashaAllah moment with XP. A moment card swiped to the left sends that
// member a MashaAllah through the existing reaction endpoint (its rules and caps); a counted one gives a little XP and
// moves the "Encourager" stickers along.
import { award } from "@/lib/points";
import { readJSON } from "@/lib/learn/store";
import { addOwnCards, rateCard, readSrsState } from "@/lib/learn/srs/store";
import { statPost, statQuiz, statWords } from "@/lib/learn/feed/statsStore";
import { GAMIFY_KEY, bonusXp, setSocialTotals } from "@/lib/learn/feed/gamify";
import { markShown, mashaState, noteMasha, recordLearned, streakXp } from "./store";

type Card = { id: string; kind: string; srs?: string; word?: { id: string }; web?: { kind: string }; moment?: { id: string; author: { username: string } } };
const FEED_KIND: Record<string, string> = {
  srs: "word", word: "word", verse: "verse", tajweed: "kn-tajweed", name: "kn-names", quiz: "kn-exam", course: "kn-course", maqasid: "kn-tadabbur",
  grammar: "kn-grammar", hadith: "hadith", tafsir: "tafsir", dua: "dua", insight: "word-of-day", moment: "kn-moment",
};
const SRS_KIND: Record<string, string> = { word: "word", qword: "word", name: "kn-names", verse: "verse", dua: "dua", tajweed: "kn-tajweed" };
export const feedKindOf = (c: Card) => (c.kind === "srs" && c.srs ? SRS_KIND[c.srs.split(":")[0]] ?? "word" : FEED_KIND[c.kind] ?? "word");

export const XP_MASHA = 3;
export const XP_SET = 10;

export type LearnResult = { newWord: boolean; review: boolean; streak: number | null; milestone: boolean; xp: number };
export function learned(c: Card, growthCap: number): LearnResult {
  markShown(c.id);
  let newWord = false, review = false, xp = 0;
  if (c.kind === "srs" && c.srs) { rateCard(c.srs, 3); review = true; }
  if (c.kind === "word" && c.word) {
    const id = `word:${c.word.id}`;
    if (!readSrsState().cards[id]) { newWord = addOwnCards([id]) > 0; if (newWord) statWords(1); }
  }
  statPost(feedKindOf(c), c.id);
  const r = recordLearned({ newWord, review }, growthCap);
  if (r.growth) award("vocab");
  if (r.streak) { xp = streakXp(r.streak, r.milestone); bonusXp(xp); }
  return { newWord, review, streak: r.streak, milestone: r.milestone, xp };
}

export const answered = (right: boolean) => statQuiz(right);

export type MashaResult = "sent" | "already" | "dayFull" | "profile" | "error";
export async function sendMasha(c: Card): Promise<MashaResult> {
  const m = c.moment;
  if (!m) return "error";
  markShown(c.id);
  const st = mashaState(m.author.username);
  if (st !== "open") return st;
  try {
    const res = await fetch(`/api/community/moments/${encodeURIComponent(m.id)}/react`, { method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json" }, credentials: "same-origin", body: JSON.stringify({ reaction: "mashallah" }) });
    if (res.status === 401 || res.status === 403) return "profile";
    if (!res.ok) return "error";
    const d = (await res.json().catch(() => ({}))) as { credited?: boolean };
    const credited = d.credited !== false;
    noteMasha(m.author.username, credited);
    if (credited) {
      bonusXp(XP_MASHA);
      const g = readJSON<{ recv?: number; gave?: number }>(GAMIFY_KEY, {});
      setSocialTotals(g.recv ?? 0, (g.gave ?? 0) + 1);
    }
    return "sent";
  } catch {
    return "error";
  }
}
