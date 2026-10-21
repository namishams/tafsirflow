import { useEffect, useMemo } from "react";
import { useStoreVersion } from "@/lib/store";
import { readMetrics, type Metrics } from "./metrics";
import { evaluate, marahilDone } from "./stickers";
import { ensureStarted, useJourney } from "./store";

/** the metrics of the long path, recomputed when any stored learning data changes; new stickers are recorded */
export function useJourneyData(): { M: Metrics; done: number; current: number } {
  const v = useStoreVersion();
  const j = useJourney();
  const M = useMemo(() => readMetrics(), [v]); // eslint-disable-line react-hooks/exhaustive-deps
  const done = useMemo(() => marahilDone(M), [M, j.stickers]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { ensureStarted(); }, []);
  // evaluated after rendering (grant() writes the store, which would render again)
  useEffect(() => { const id = setTimeout(() => { try { evaluate(M); } catch { /* a missing store never breaks the screen */ } }, 300); return () => clearTimeout(id); }, [M]);
  return { M, done, current: done + 1 };
}
