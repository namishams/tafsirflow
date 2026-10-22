import { useCallback, useMemo } from "react";
import { FREE, openPro, usePro, type ProFeature } from "./pro";
import { readJSON, useStored, writeJSON } from "./store";
import { remoteConfig } from "@/features/feed/remote";
import { router, type Href } from "expo-router";
import { courseSlugOf, ownsCourse, readShop, type CourseSlug } from "./shop";

// Free and Pro in one place. Rules:
// - the feed and the Quran reader are free for everyone
// - every course: the first unit is free (Shams: al-Fātiḥa and Juz ʿAmma, see FREE in lib/pro.tsx), the rest is Pro
// - free users get a daily number of cards and tests; the numbers come from the feed config
//   (monetize.limits in src/lib/feed/config.json of the website) with the local defaults below
// - Pro gets everything, without limits
// Use `useEntitlement(feature)` in screens: { allowed, remaining, canUse, upsell(), consume() }.
// For the daily-limited features ("cards" / "srs", "tests") `allowed` means unlimited access (Pro) and `remaining`
// is what a free user has left today; `canUse` combines both. Any other feature name is Pro-only.

export type Course = "shams" | "academy" | "arabic" | "tajweed";
export type EntitlementFeature =
  | "feed" | "reader"
  | "cards" | "tests"
  | { course: Course; unit: number } // unit is 0-based: unit 0 is free
  | { shamsSurah: number }
  | ProFeature
  | "srs" | "reciterPath"
  | (string & {}); // other Pro-only areas by name

/** local defaults when the config has no limits (or the app is offline on first start) */
export const FREE_LIMITS = { cardsPerDay: FREE.vocabPerDay, testsPerDay: 3 };

export function freeLimits(): { cardsPerDay: number; testsPerDay: number } {
  const l = remoteConfig()?.monetize?.limits;
  const n = (v: unknown, d: number) => (typeof v === "number" && Number.isFinite(v) && v >= 0 ? Math.floor(v) : d);
  return { cardsPerDay: n(l?.cardsPerDay, FREE_LIMITS.cardsPerDay), testsPerDay: n(l?.testsPerDay, FREE_LIMITS.testsPerDay) };
}

/** true when a course unit is free (the first unit of every course) */
export const isUnitFree = (_course: Course, unit: number) => unit <= 0;

const USAGE_KEY = "qmc.usage"; // { day: "YYYY-MM-DD", cards: n, tests: n } – device only
type Usage = { day: string; cards: number; tests: number };
const today = () => { const d = new Date(); return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`; };
function usageNow(u: Usage | null): Usage { return u && u.day === today() ? u : { day: today(), cards: 0, tests: 0 }; }
/** count one card / test for today (no-op for Pro is the caller's choice; counting does not block anything) */
export function consumeFree(kind: "cards" | "tests", n = 1) {
  const u = usageNow(readJSON<Usage | null>(USAGE_KEY, null));
  writeJSON(USAGE_KEY, { ...u, [kind]: u[kind] + n }, true);
}

/** which Pro sheet a feature opens */
function proFeatureOf(f: EntitlementFeature): ProFeature {
  if (typeof f === "string") {
    if (f === "cards" || f === "srs") return "vocab";
    if (f === "arabicReading") return "arabic";
    const known: string[] = ["shams", "reciters", "arabic", "tajweed", "academy", "offline", "vocab", "stats"];
    return (known.includes(f) ? f : "general") as ProFeature;
  }
  if ("shamsSurah" in f) return "shams";
  return f.course;
}

export type Entitlement = {
  /** full access (for cards / tests: unlimited, i.e. Pro) */
  allowed: boolean;
  /** what a free user has left today of a daily-limited feature (cards / tests); null = no limit applies */
  remaining: number | null;
  /** may it be used right now (allowed, or free quota left today) */
  canUse: boolean;
  /** open the Pro sheet for this feature */
  upsell: () => void;
  /** count one use of a limited feature (cards / tests); does nothing for Pro or unlimited features */
  consume: (n?: number) => void;
};

/** pure check, for code outside React */
const limitOf = (f: EntitlementFeature): "cards" | "tests" | null => (f === "cards" || f === "srs" ? "cards" : f === "tests" ? "tests" : null);
const full = (allowed: boolean) => ({ allowed, remaining: null, canUse: allowed });
export function entitlement(feature: EntitlementFeature, pro: boolean): Omit<Entitlement, "upsell" | "consume"> {
  if (pro) return full(true);
  if (feature === "feed" || feature === "reader") return full(true);
  const lim = limitOf(feature);
  if (lim) {
    const u = usageNow(readJSON<Usage | null>(USAGE_KEY, null));
    const max = freeLimits()[lim === "cards" ? "cardsPerDay" : "testsPerDay"];
    const remaining = Math.max(0, max - u[lim]);
    return { allowed: false, remaining, canUse: remaining > 0 };
  }
  // a course bought singly (not "academy": that card covers several courses, see features/courses/Screens)
  const slug = singleCourse(feature);
  if (slug && ownsCourse(readShop(), slug)) return full(true);
  if (typeof feature === "object") {
    if ("shamsSurah" in feature) return full(FREE.shamsSurah(feature.shamsSurah));
    return full(isUnitFree(feature.course, feature.unit));
  }
  return full(false); // any other Pro feature
}

/** the single course a feature belongs to, when it can be bought on its own */
function singleCourse(f: EntitlementFeature): CourseSlug | null {
  const id = typeof f === "string" ? f : "course" in f ? f.course : null;
  return id && id !== "academy" ? courseSlugOf(id) : null;
}

/** the unlock sheet: Pro, or this one course as a single purchase */
export function openUnlock(slug: CourseSlug, feature: ProFeature = "general") {
  router.push(`/unlock?c=${slug}&f=${feature}` as Href);
}

/** the entitlement of one feature for the current user (re-renders when Pro or today's usage changes) */
export function useEntitlement(feature: EntitlementFeature): Entitlement {
  const { pro } = usePro();
  useStored<Usage | null>(USAGE_KEY, null);
  useStored("qmc.shop.v1", null); // re-render when a single course was bought
  const key = typeof feature === "string" ? feature : JSON.stringify(feature);
  const base = entitlement(feature, pro);
  const upsell = useCallback(() => { const slug = singleCourse(feature); if (slug) openUnlock(slug, proFeatureOf(feature)); else openPro(proFeatureOf(feature)); }, [key]); // eslint-disable-line react-hooks/exhaustive-deps
  const consume = useCallback((n = 1) => {
    const lim = limitOf(feature);
    if (pro || !lim) return;
    consumeFree(lim, n);
  }, [pro, key]); // eslint-disable-line react-hooks/exhaustive-deps
  return useMemo(() => ({ ...base, upsell, consume }), [base.allowed, base.remaining, base.canUse, upsell, consume]); // eslint-disable-line react-hooks/exhaustive-deps
}
