// mirrors mobile/src/lib/entitlements.ts and the FREE table of mobile/src/lib/pro.tsx – on the website everything is
// free: every course, every deck, every exam, no daily limits and no purchase links. The functions keep the app's
// shape so the copied learning modules run unchanged.
export type EntitlementFeature = string | { course: string; unit: number } | { shamsSurah: number };
export type Entitlement = { allowed: boolean; remaining: number | null; canUse: boolean; upsell: () => void; consume: (n?: number) => void };

const ALL: Entitlement = { allowed: true, remaining: null, canUse: true, upsell: () => undefined, consume: () => undefined };
export const entitlement = (_f?: EntitlementFeature, _pro?: boolean) => ({ allowed: true, remaining: null, canUse: true });
export const useEntitlement = (_f?: EntitlementFeature): Entitlement => ALL;
export const FREE_LIMITS = { cardsPerDay: Infinity, testsPerDay: Infinity };
export const freeLimits = () => FREE_LIMITS;
export const isUnitFree = () => true;
export const consumeFree = () => undefined;

/** the app's FREE table, opened completely */
export const FREE = {
  shamsSurah: (_surah: number) => true,
  reciterIds: [7, 2, 6, 9] as number[],
  arabicLessons: Infinity,
  tajweedLessons: Infinity,
  vocabPerDay: Infinity,
};
export const usePro = () => ({ pro: true, until: null as number | null });
export const openPro = (_f?: string) => undefined;
