import { COUNTRY_CODES, GOALS } from "./countries";

// The details a new account needs, the same as the password registration (/api/auth/register): first and last name,
// country, year of birth and the accepted terms; city, goal and news are optional (news only with the separate box).
export type SignupProfile = {
  firstName: string; lastName: string; name: string; country: string; city: string | null; goal: string | null;
  birthYear: number; locale: string | null; marketing: boolean;
};

const clean = (v: unknown, max: number) => String(v ?? "").replace(/\s+/g, " ").trim().slice(0, max);

export function readSignupProfile(body: Record<string, unknown>): { error: "name" | "country" | "terms" | "age" } | { profile: SignupProfile } {
  const firstName = clean(body.firstName, 60), lastName = clean(body.lastName, 60);
  if (!firstName || !lastName) return { error: "name" };
  const country = String(body.country ?? "").toUpperCase();
  if (!COUNTRY_CODES.includes(country)) return { error: "country" };
  if (body.acceptTerms !== true) return { error: "terms" };
  const birthYear = Number(body.birthYear);
  if (!Number.isInteger(birthYear) || birthYear < 1920 || birthYear > new Date().getFullYear() - 3) return { error: "age" };
  const goal = (GOALS as readonly string[]).includes(String(body.goal)) ? String(body.goal) : null;
  const locale = /^[a-z]{2}$/.test(String(body.locale)) ? String(body.locale) : null;
  return { profile: { firstName, lastName, name: `${firstName} ${lastName}`, country, city: clean(body.city, 80) || null, goal, birthYear, locale, marketing: body.marketing === true } };
}
