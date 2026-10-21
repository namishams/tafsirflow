// mirrors mobile/src/features/srs/gate.ts (copied for the website; keep both in step)
import { useEntitlement } from "@/lib/learn/free";
import { readJSON } from "@/lib/learn/store";
import { today } from "@/lib/learning";

// Free and Pro for cards and tests, through the shared entitlement hook:
//   free – 10 new cards a day plus the reviews of those, the Juz ʿAmma vocabulary deck and own cards, one test a week
//   Pro  – unlimited cards, every deck, every exam, app certificates
type Feature = Parameters<typeof useEntitlement>[0];
const f = (name: string) => name as unknown as Feature;

export function useSrsLimits() {
  const e = useEntitlement(f("srs"));
  return { unlimited: !!e.allowed, upsell: e.upsell };
}

export const TESTS_KEY = "qmc.srs.tests";
export type TestResult = { id: string; kind: TestKind; ref: string; score: number; total: number; at: number };
export type TestKind = "placement" | "weekly" | "juz" | "surah" | "vocab";
export type TestStore = { results: TestResult[]; certs: { juz: number; at: number; pct: number }[] };
export const EMPTY_TESTS: TestStore = { results: [], certs: [] };
export const week = (day = today()) => Math.floor((day + 3) / 7); // weeks start on Monday

/** free: one test a week (placement test always open); Pro: all exams */
export function useTestGate() {
  const e = useEntitlement(f("tests"));
  const pro = !!e.allowed;
  const used = readJSON<TestStore>(TESTS_KEY, EMPTY_TESTS).results.some((r) => r.kind !== "placement" && week(Math.floor(r.at / 86400000)) === week());
  return {
    pro,
    upsell: e.upsell,
    canStart: (kind: TestKind) => pro || kind === "placement" || !used,
    usedThisWeek: used,
  };
}
