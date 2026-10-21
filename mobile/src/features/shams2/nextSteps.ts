import { nextNew, surahProgress } from "@/web/coach";
import type { Srs } from "@/web/learning";
import { MUT_GROUPS } from "./mutData";
import { nextAllowed } from "./plan";
import type { Cell, Known } from "./qualityModel";

// The "continue" engine: after any surah, juz, course or level there is always a next meaningful step – never an end
// screen without one. Ordered by what matters most for this learner right now.
export type NextKind = "sabaq" | "tathbit" | "juzExam" | "nextJuz" | "tafsir" | "mutashabihat" | "talaqqi" | "academy" | "reciterPath" | "courses";
export type NextStep = { kind: NextKind; href: string; s?: number; v?: number; juz?: number; score?: number };

/** ctx.allow (app only): the surahs the learner may open; without Pro the next new portion stays in the free surahs */
export function nextSteps(srs: Srs, known: Map<string, Known>, surahs: Cell[], juz: Cell[], ctx?: { surah?: number; allow?: (surah: number) => boolean }): NextStep[] {
  const out: NextStep[] = [];
  const sp = surahProgress(srs);
  const coach = nextNew(srs, sp);
  const nx = ctx?.allow && !ctx.allow(coach.surah) ? nextAllowed(known, ctx.allow) ?? coach : coach;
  const finished = ctx?.surah;
  // 1. consolidate what was just finished when it does not hold yet
  if (finished) {
    const c = surahs[finished - 1];
    if (c && c.score !== null && c.score < 70) out.push({ kind: "tathbit", href: `/shams/weak?s=${finished}`, s: finished, score: c.score });
  }
  // 2. the next new portion (sabaq): the surah in progress or the next one on the classical path
  out.push({ kind: "sabaq", href: `/shams/${nx.surah}?v=${nx.verse}`, s: nx.surah, v: nx.verse });
  // 3. a juz that is fully memorised: its exam, then the next juz
  const doneJuz = juz.filter((j) => j.total > 0 && j.known >= j.total);
  const lastDone = doneJuz.at(-1);
  if (lastDone) out.push({ kind: "juzExam", href: `/tests/juz?ref=${lastDone.id}`, juz: lastDone.id });
  const partJuz = juz.filter((j) => j.known > 0 && j.known < j.total).sort((a, b) => b.known / b.total - a.known / a.total)[0];
  if (partJuz) out.push({ kind: "nextJuz", href: `/shams/quality?juz=${partJuz.id}`, juz: partJuz.id, score: Math.round((partJuz.known / partJuz.total) * 100) });
  // 4. deeper understanding of the surah just learned (or the one in progress)
  const deep = finished ?? nx.surah;
  out.push({ kind: "tafsir", href: `/surah/${deep}?v=1&tafsir=1`, s: deep });
  // 5. similar verses inside what is memorised
  if (MUT_GROUPS.some((g) => g.keys.some((k) => known.has(k)))) out.push({ kind: "mutashabihat", href: "/shams/mutashabihat" });
  // 6. recitation with a master reciter
  out.push({ kind: "talaqqi", href: `/shams/talaqqi?s=${deep}&v=1`, s: deep });
  // 7. the wider programme: academy, reciter path, courses (always there, so the list never ends)
  out.push({ kind: "academy", href: "/academy" }, { kind: "reciterPath", href: "/reciter-path" }, { kind: "courses", href: "/courses" });
  return out;
}
