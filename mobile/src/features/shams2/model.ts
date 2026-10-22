import { readJSON, useStoreVersion } from "@/lib/store";
import { FREE, usePro } from "@/lib/pro";
import { today, type Srs } from "@/web/learning";
import { readSrsState } from "@/features/srs/store";
import { computeWird } from "./plan";
import { knownVerses, qualityModel } from "./qualityModel";
import { readChecks, readMut, readSettings, readWords } from "./store";
import { gradeOf, readGrade, sabaqGated, testsDue } from "./grades";
import { readLinks, readRubric, readTodayMinutes, readUnderstand } from "./store2";
import { masteryModel, weakLinks, type MasteryModel } from "./mastery";
import { weakSpots } from "./weakSpots";
import { MUT_GROUPS, dueMutGroups } from "./mutData";

function compute(pro: boolean) {
  const day = today();
  const srs = readJSON<Srs>("tf:srs", {});
  const words = readWords(), checks = readChecks(), mut = readMut(), settings = readSettings();
  const known = knownVerses(srs, readSrsState(), day);
  const q = qualityModel(known, { words, checks, mut });
  const gs = readGrade();
  const grade = gradeOf(gs.grade);
  const gated = sabaqGated(gs, known.size, day);
  // Shams 3.0: transitions, comprehension and pronunciation ratings (store2.ts), today's minutes and the tathbīt candidates
  const links = readLinks(), understand = readUnderstand(), rubric = readRubric(), todayMin = readTodayMinutes(day);
  const spots = weakSpots(known, words, mut, 40, links);
  const opts = { todayMinutes: todayMin, words, checks, spots, links: weakLinks(links), mut: dueMutGroups(MUT_GROUPS, mut, known) };
  // the six dimensions of mastery are computed only when a screen asks for them (Quality)
  let mm: MasteryModel | null = null;
  const mastery = () => (mm ??= masteryModel({ known, words, checks, mut, links, understand, rubric }));
  // without Pro the new portion stays in the free surahs (al-Fātiḥa and Juzʾ ʿAmma), see plan.ts
  const wird = computeWird(srs, known, settings, grade, gated, day, pro ? undefined : FREE.shamsSurah, opts);
  const due = testsDue(gs, known.size, day);
  const ardLeft = Math.max(0, (known.size >= 5 ? grade.ardPerDay : 0) - (gs.ard[day] ?? 0));
  return { day, srs, known, q, wird, words, checks, mut, settings, gs, grade, due, ardLeft, links, spots, todayMin, mastery };
}

export type Shams2Model = ReturnType<typeof compute>;

// One model for the whole app: every screen and card that calls useShams2 (the wird alone has about seven) shares the
// result, which is computed again only when the store changed, the day turned or Pro changed.
let cache: { version: number; day: number; pro: boolean; value: Shams2Model } | null = null;

/** everything Shams 2.0 computes from the learner's own data; recomputed only when the store changed */
export function useShams2(): Shams2Model {
  const version = useStoreVersion();
  const { pro } = usePro();
  const day = today();
  if (!cache || cache.version !== version || cache.day !== day || cache.pro !== pro) cache = { version, day, pro, value: compute(pro) };
  return cache.value;
}
