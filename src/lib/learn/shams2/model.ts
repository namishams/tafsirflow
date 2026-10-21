// mirrors mobile/src/features/shams2/model.ts (copied for the website; keep in step with the app)
import { useMemo } from "react";
import { readJSON, useStoreVersion } from "@/lib/learn/store";
import { today, type Srs } from "@/lib/learning";
import { readSrsState } from "@/lib/learn/srs/store";
import { computeWird } from "./plan";
import { knownVerses, qualityModel } from "./qualityModel";
import { readChecks, readMut, readSettings, readWords } from "./store";
import { gradeOf, readGrade, sabaqGated, testsDue } from "./grades";

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
    const wird = computeWird(srs, known, settings, grade, gated, day);
    const due = testsDue(gs, known.size, day);
    const ardLeft = Math.max(0, (known.size >= 5 ? grade.ardPerDay : 0) - (gs.ard[day] ?? 0));
    return { day, srs, known, q, wird, words, checks, mut, settings, gs, grade, due, ardLeft };
  }, [version]); // eslint-disable-line react-hooks/exhaustive-deps
}
