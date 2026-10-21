import { remoteConfig, useRemoteConfig, type FeedConfig } from "@/features/feed/remote";

// Swipe & Learn switches from the server (website src/lib/feed/config.json → "swipe", served with /api/feed/config).
// Every field optional; offline or unknown = the local defaults below. minSeconds: how long a learning card must be
// read before it can be swiped (owner: 10 s); momentSeconds: the same for a friend's achievement card; momentEvery:
// one achievement card after about this many learning cards; sessionSize: a summary after this many cards.
export type SwipeConfig = { enabled: boolean; minSeconds: number; momentSeconds: number; momentEvery: number; sessionSize: number; dailyGrowth: number };
export const SWIPE_DEFAULTS: SwipeConfig = { enabled: true, minSeconds: 10, momentSeconds: 3, momentEvery: 5, sessionSize: 20, dailyGrowth: 50 };
type Remote = FeedConfig & { swipe?: Partial<SwipeConfig> };

const num = (v: unknown, d: number, min: number, max: number) => (typeof v === "number" && Number.isFinite(v) ? Math.min(max, Math.max(min, Math.round(v))) : d);
function of(c: Remote | null): SwipeConfig {
  const s = c?.swipe ?? {};
  return {
    enabled: s.enabled !== false,
    minSeconds: num(s.minSeconds, SWIPE_DEFAULTS.minSeconds, 0, 60),
    momentSeconds: num(s.momentSeconds, SWIPE_DEFAULTS.momentSeconds, 0, 30),
    momentEvery: num(s.momentEvery, SWIPE_DEFAULTS.momentEvery, 3, 50),
    sessionSize: num(s.sessionSize, SWIPE_DEFAULTS.sessionSize, 5, 100),
    dailyGrowth: num(s.dailyGrowth, SWIPE_DEFAULTS.dailyGrowth, 0, 200),
  };
}
export const swipeConfig = () => of(remoteConfig() as Remote | null);
export const useSwipeConfig = () => of(useRemoteConfig() as Remote | null);
