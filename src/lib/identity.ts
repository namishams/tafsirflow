import { readJSON, writeJSON } from "./storage";

// The learner's self-declared identity: brother or sister and an age band. One module for the whole product (app
// and website; the app gets this file through mobile/scripts/sync-web.mjs as src/web/identity.ts). Both answers are
// optional ("keine Angabe" = null), asked once in the onboarding and changeable in the profile settings.
// Data minimisation: an age band, never a birth date. Stored in one synced key (qmc.identity.v1, merge: the newer
// choice wins, see syncExtra.ts). Used only inside the product: the form of address (AI tutor, Together circles),
// the "Für Schwestern" entry, the pace of the Shams Method (age.ts). Never used for tracking or advertising.
// Not an age verification: the community gates (13+, Together 16+) keep using the confirmed birth year on the server.
export type Gender = "brother" | "sister";
export const AGE_BANDS = ["u13", "13-15", "16-17", "18-24", "25-39", "40-59", "60+"] as const;
export type AgeBand = (typeof AGE_BANDS)[number];
export type Identity = {
  gender: Gender | null;
  age: AgeBand | null;
  /** the onboarding step was answered or skipped (do not ask again) */
  asked: boolean;
  /** time of the last change (sync: the newer choice wins) */
  at: number;
};
export const IDENTITY_KEY = "qmc.identity.v1";
const EMPTY: Identity = { gender: null, age: null, asked: false, at: 0 };

const isGender = (x: unknown): x is Gender => x === "brother" || x === "sister";
const isBand = (x: unknown): x is AgeBand => typeof x === "string" && (AGE_BANDS as readonly string[]).includes(x);

/** a stored value, cleaned (unknown values become "keine Angabe") */
export function cleanIdentity(x: unknown): Identity {
  const o = x && typeof x === "object" ? (x as Record<string, unknown>) : {};
  return { gender: isGender(o.gender) ? o.gender : null, age: isBand(o.age) ? o.age : null, asked: o.asked === true, at: typeof o.at === "number" && Number.isFinite(o.at) ? o.at : 0 };
}
export const readIdentity = (): Identity => cleanIdentity(readJSON<unknown>(IDENTITY_KEY, EMPTY));

/** saves a change; `asked` is set as well, so the onboarding does not ask again */
export function saveIdentity(patch: Partial<Pick<Identity, "gender" | "age">>): Identity {
  const next: Identity = { ...readIdentity(), ...patch, asked: true, at: Date.now() };
  writeJSON(IDENTITY_KEY, next);
  return next;
}

/** sync merge (same rule in syncExtra.ts): the newer choice wins; a tie keeps this device's */
export function mergeIdentity(a: unknown, b: unknown): Identity {
  const x = cleanIdentity(a), y = cleanIdentity(b);
  return x.at >= y.at ? { ...x, asked: x.asked || y.asked } : { ...y, asked: x.asked || y.asked };
}

/** the lowest age of a band */
export const bandMin = (b: AgeBand): number => (b === "u13" ? 0 : Number(b.replace("+", "").split("-")[0]));

/** is the learner at least `min` years old by the band? null when unknown or the band straddles `min` */
export function bandAtLeast(b: AgeBand | null, min: number): boolean | null {
  if (!b) return null;
  const lo = bandMin(b);
  const i = AGE_BANDS.indexOf(b);
  const hi = i + 1 < AGE_BANDS.length ? bandMin(AGE_BANDS[i + 1]) - 1 : 200;
  return lo >= min ? true : hi < min ? false : null;
}

/** the age group of the Shams Method's pace (age.ts) from a band */
export function groupOfBand(b: AgeBand | null): "child" | "teen" | "adult" | "senior" | null {
  if (!b) return null;
  return b === "u13" ? "child" : b === "13-15" || b === "16-17" ? "teen" : b === "60+" ? "senior" : "adult";
}

/** the form of address for the AI tutor and the Together circles ("brother" | "sister" | null) */
export const addressOf = (i: Identity = readIdentity()): Gender | null => i.gender;

// ---------- prayer posture (everyone, optional) ----------
// "Können Sie im Stehen beten?" – drives the prayer trainer's variant (standing, sitting, on a chair, lying).
// Health-related, so special category data (GDPR Art. 9): its own key, ON THIS DEVICE ONLY. It is not in the sync
// lists, never sent to a server or the AI, and removed on sign-out (sisters/state.ts clearDeviceOnly).
export const PRAYER_POSTURES = ["standing", "sitting", "chair", "lying"] as const;
export type PrayerPosture = (typeof PRAYER_POSTURES)[number];
export const POSTURE_KEY = "qmc.posture.v1";
export const readPosture = (): PrayerPosture | null => {
  const v = readJSON<unknown>(POSTURE_KEY, null);
  return typeof v === "string" && (PRAYER_POSTURES as readonly string[]).includes(v) ? (v as PrayerPosture) : null;
};
/** null = "Keine Angabe" (the key is cleared); silent: this key is never synced */
export const savePosture = (p: PrayerPosture | null) => writeJSON(POSTURE_KEY, p, true);

// ---------- tradition (everyone, optional) ----------
// "Sunni" | "Schiitisch (Dschaʿfari / Zwölfer)" | "Beides zeigen": one choice that switches the whole product – prayer
// and wudu trainers, the prayer-time method, the Islamic calendar (Shia days), the hadith collections, the order of the
// "Islam" chapters (the other schools behind "Andere Rechtsschulen"), the travel note, the sisters' madhhab default.
// Religious belief is special category data (GDPR Art. 9): like the posture it stays ON THIS DEVICE ONLY, in the key
// the guided prayer setup has always used ("qmc.prayerSetup".tradition: "sunni" | "shia" | "unsure"), so the app's
// prayer setup, mobile/src/lib/tradition.ts and the website's src/lib/learn/tradition.ts read the same answer.
// It is never synced, never sent to a server or the AI. Every screen keeps a local override (the trainers' switch).
export const TRADITIONS = ["sunni", "shia", "both"] as const;
export type TraditionChoice = (typeof TRADITIONS)[number];
export const TRADITION_KEY = "qmc.prayerSetup";
/** the stored choice, read defensively; null = never asked */
export function readTraditionChoice(): TraditionChoice | null {
  const o = readJSON<unknown>(TRADITION_KEY, null);
  const t = o && typeof o === "object" ? (o as { tradition?: unknown }).tradition : undefined;
  return t === "sunni" || t === "shia" ? t : t === "unsure" ? "both" : null;
}
/** stores the choice next to the other prayer-setup answers (silent: never synced). The app's saveTradition() also moves
 *  the prayer-time method along; the website has no prayer alerts, so this is all it needs. */
export function saveTraditionChoice(t: TraditionChoice) {
  const o = readJSON<unknown>(TRADITION_KEY, null);
  const cur = o && typeof o === "object" ? (o as Record<string, unknown>) : {};
  writeJSON(TRADITION_KEY, { ...cur, tradition: t === "both" ? "unsure" : t }, true);
}
/** the trainers' (prayer, wudu) default: Ja'fari only when Shia was chosen */
export const trainerOf = (t: TraditionChoice | null): "sunni" | "shia" => (t === "shia" ? "shia" : "sunni");
