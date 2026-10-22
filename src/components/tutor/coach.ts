"use client";
import { useMemo } from "react";
import { useShams2 } from "@/lib/learn/shams2/model";
import { readMakhraj } from "@/lib/learn/shams2/store2";
import { MUT_GROUPS, dueMutGroups } from "@/lib/learn/shams2/mutData";
import { DIMS } from "@/lib/learn/shams2/mastery";
import type { CoachInput } from "@/lib/tutor/next";

// The recitation coach's input from this browser's own practice data (Shams model, makhraj ratings, due groups of
// similar verses); the app builds the same in mobile/src/features/tutor/coach.ts. Nothing is estimated.
export function useCoachInput(): CoachInput | null {
  const m = useShams2();
  return useMemo(() => {
    try {
      let weakestDim: string | null = null, weakestPct: number | null = null;
      if (m.known.size >= 3) {
        const mm = m.mastery();
        for (const d of DIMS) { const a = mm.overall.dims[d]; if (a?.pct === null || a?.pct === undefined || a.n < 3) continue; if (weakestPct === null || a.pct < weakestPct) { weakestDim = d; weakestPct = Math.round(a.pct); } }
      }
      return {
        spots: m.spots.slice(0, 8).map((s) => ({ key: s.key, words: s.words, reason: s.reason })),
        mutDue: dueMutGroups(MUT_GROUPS, m.mut, m.known).slice(0, 4).map((g) => ({ id: g.id, keys: g.keys })),
        makhraj: readMakhraj(),
        weakestDim, weakestPct,
        todayNew: m.wird.sabaq.verses,
        todayReview: m.wird.sabqi.verses + m.wird.manzil.verses,
        testsDue: (m.due.weekly ? 1 : 0) + (m.due.monthly ? 1 : 0),
        learnedToday: (m.todayMin ?? 0) > 0,
        known: m.known.size,
      };
    } catch { return null; }
  }, [m]);
}
