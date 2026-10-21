// mirrors mobile/src/features/journey/hooks.ts (copied for the website; keep in step with the app)
import { useEffect, useMemo } from "react";
import { useStoreVersion } from "@/lib/learn/store";
import { readMetrics, type Metrics } from "./metrics";
import { evaluate, marahilDone } from "./stickers";
import { ensureStarted, useJourney } from "./store";

/** the metrics of the long path, recomputed when any stored learning data changes; new stickers are recorded.
 *  Website: `ready` is false during server rendering and hydration (the stores are only read in the browser), so
 *  screens show the stored progress only once it is true. */
export function useJourneyData(): { M: Metrics; done: number; current: number; ready: boolean } {
  const v = useStoreVersion();
  const j = useJourney();
  const M = useMemo(() => readMetrics(), [v]); // eslint-disable-line react-hooks/exhaustive-deps
  const done = useMemo(() => marahilDone(M), [M, j.stickers]); // eslint-disable-line react-hooks/exhaustive-deps
  const ready = v >= 0;
  useEffect(() => { ensureStarted(); }, []);
  // evaluated after rendering (grant() writes the store, which would render again)
  useEffect(() => { if (!ready) return; const id = setTimeout(() => { try { evaluate(M); } catch { /* a missing store never breaks the screen */ } }, 300); return () => clearTimeout(id); }, [M, ready]);
  return { M, done, current: done + 1, ready };
}
