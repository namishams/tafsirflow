// mirrors mobile/src/features/swipe/config.ts: the "swipe" switches of src/lib/feed/config.json (served to the app with
// /api/feed/config). The website page reads them on the server and passes them to the client screen.
export type SwipeConfig = { enabled: boolean; minSeconds: number; momentSeconds: number; momentEvery: number; sessionSize: number; dailyGrowth: number };
export const SWIPE_DEFAULTS: SwipeConfig = { enabled: true, minSeconds: 10, momentSeconds: 3, momentEvery: 5, sessionSize: 20, dailyGrowth: 50 };

const num = (v: unknown, d: number, min: number, max: number) => (typeof v === "number" && Number.isFinite(v) ? Math.min(max, Math.max(min, Math.round(v))) : d);
export function swipeConfigOf(raw: Partial<SwipeConfig> | null | undefined): SwipeConfig {
  const s = raw ?? {};
  return {
    enabled: s.enabled !== false,
    minSeconds: num(s.minSeconds, SWIPE_DEFAULTS.minSeconds, 0, 60),
    momentSeconds: num(s.momentSeconds, SWIPE_DEFAULTS.momentSeconds, 0, 30),
    momentEvery: num(s.momentEvery, SWIPE_DEFAULTS.momentEvery, 3, 50),
    sessionSize: num(s.sessionSize, SWIPE_DEFAULTS.sessionSize, 5, 100),
    dailyGrowth: num(s.dailyGrowth, SWIPE_DEFAULTS.dailyGrowth, 0, 200),
  };
}
