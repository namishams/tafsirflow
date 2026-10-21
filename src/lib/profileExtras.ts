// Profile extras (owner, 21.10.2026; app and website 1:1): learning goals as chips, a coarse city or region, travel
// mode with an optional destination, each with its own audience (everyone, followers, only me). Stored on
// community_profiles (learning_goals, city, travel_on, travel_city, extras_privacy). The city is free text the member
// types or takes from the prayer-time place, rounded to the city on the device; never coordinates.
export const PROFILE_GOALS = ["read", "understand", "juzamma", "tajweed", "reciter", "daily", "islam", "children"] as const;
export type ProfileGoal = (typeof PROFILE_GOALS)[number];
export const AUDIENCES = ["everyone", "followers", "me"] as const;
export type Audience = (typeof AUDIENCES)[number];
export type ExtrasPrivacy = { goals: Audience; city: Audience; travel: Audience };
export const DEFAULT_EXTRAS_PRIVACY: ExtrasPrivacy = { goals: "everyone", city: "followers", travel: "followers" };
export type ProfileExtras = { goals?: ProfileGoal[]; city?: string; travel?: { on: boolean; city: string } };

type Row = { learning_goals?: string[] | null; city?: string | null; travel_on?: boolean | null; travel_city?: string | null; extras_privacy?: Partial<ExtrasPrivacy> | null };

export const isAudience = (v: unknown): v is Audience => typeof v === "string" && (AUDIENCES as readonly string[]).includes(v);
export function privacyOf(r: Row): ExtrasPrivacy {
  const p = r.extras_privacy ?? {};
  return { goals: isAudience(p.goals) ? p.goals : DEFAULT_EXTRAS_PRIVACY.goals, city: isAudience(p.city) ? p.city : DEFAULT_EXTRAS_PRIVACY.city, travel: isAudience(p.travel) ? p.travel : DEFAULT_EXTRAS_PRIVACY.travel };
}

/** what a viewer sees: the owner everything, followers "everyone" and "followers", others "everyone" only */
export function visibleExtras(r: Row, viewer: "owner" | "follower" | "other"): ProfileExtras {
  const pr = privacyOf(r);
  const can = (a: Audience) => viewer === "owner" || a === "everyone" || (a === "followers" && viewer === "follower");
  const out: ProfileExtras = {};
  const goals = (r.learning_goals ?? []).filter((g): g is ProfileGoal => (PROFILE_GOALS as readonly string[]).includes(g));
  if (goals.length && can(pr.goals)) out.goals = goals;
  if (r.city && can(pr.city)) out.city = r.city;
  if (r.travel_on && can(pr.travel)) out.travel = { on: true, city: r.travel_city ?? "" };
  return out;
}

/** a coarse place name: letters, spaces, dots, dashes, commas and apostrophes, no digits (no street numbers), 60 chars */
export function cleanPlace(v: unknown): string {
  if (typeof v !== "string") return "";
  return v.replace(/[0-9@#/\\<>{}[\]|_=+*~^$%&]/g, "").replace(/\s+/g, " ").trim().slice(0, 60);
}
