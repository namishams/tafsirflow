// mirrors mobile/src/features/shams2/model.ts (copied for the website; keep in step with the app)
import { useMemo } from "react";
import { readJSON, useStoreVersion } from "@/lib/learn/store";
import { today, type Srs } from "@/lib/learning";
import { readSrsState } from "@/lib/learn/srs/store";
import { computeWird } from "./plan";
import { knownVerses, qualityModel } from "./qualityModel";
import { readChecks, readMut, readSettings, readWords } from "./store";
import { gradeOf, readGrade, sabaqGated, testsDue } from "./grades";
import { readLinks, readRubric, readTodayMinutes, readUnderstand } from "./store2";
import { masteryModel, weakLinks, type MasteryModel } from "./mastery";
import { weakSpots } from "./weakSpots";
import { MUT_GROUPS, dueMutGroups } from "./mutData";

/** everything Shams 2.0 computes from the learner's own data; recomputed only when the store changed */
export function useShams2() {
  const version = useStoreVersion();
  return useMemo(() => {
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
    const wird = computeWird(srs, known, settings, grade, gated, day, opts);
    const due = testsDue(gs, known.size, day);
    const ardLeft = Math.max(0, (known.size >= 5 ? grade.ardPerDay : 0) - (gs.ard[day] ?? 0));
    return { day, srs, known, q, wird, words, checks, mut, settings, gs, grade, due, ardLeft, links, spots, todayMin, mastery };
  }, [version]); // eslint-disable-line react-hooks/exhaustive-deps
}
