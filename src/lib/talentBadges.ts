import { pool } from "./db";
import raw from "./feed/config.json";
import { PUBLIC_SITE, SITE } from "./site";

// Quran Talents badges, granted automatically (owner decision 21.10.2026):
// - emerald check: e-mail confirmed, 16+, profile complete (name, bio, country, rewaya), community guidelines accepted,
//   phone confirmed by SMS when `badges.requirePhone` is on (TODO: no SMS provider in this project yet, so it is off)
// - gold check "Masterclass Reciter": emerald + a valid Reciter Path level certificate >= goldMinLevel from the exam
//   module (exam_attempts/certificates: server-timed, signed results; src/app/api/certificates)
// - official star: a YouTube channel proven with Google OAuth (>= officialMinSubscribers, name matches) or an invite
//   code; admins can grant or revoke (badge_override 'none' stops the automatic badges for a member)
// Founder (owner 22.10.2026): a gold check for exactly one account (users.founder, set only by the migration in
// db/schema.sql). Colours (owner 22.10.2026, the same in app and web): founder gold, "gold" (Masterclass Reciter, the top
// tier) grey, "emerald" (confirmed learner) blue, official star unchanged. Stored values stay as they are.
// Star (owner 22.10.2026): a well-known reciter who took over his star profile (src/lib/stars.ts), stored as badge 'star';
// an emerald disc with a white tick and a light emerald ring (gold stays the founder's).
export type Badge = "emerald" | "gold" | "official" | "founder" | "star" | "personality";
export type BadgeRules = { requirePhone: boolean; goldMinLevel: number; officialMinSubscribers: number };

export function badgeRules(): BadgeRules {
  const b = ((raw as { badges?: Partial<BadgeRules> }).badges ?? {}) as Partial<BadgeRules>;
  const envSubs = Number(process.env.YOUTUBE_MIN_SUBSCRIBERS);
  return {
    requirePhone: b.requirePhone === true,
    goldMinLevel: typeof b.goldMinLevel === "number" ? Math.max(1, Math.min(10, Math.floor(b.goldMinLevel))) : 6,
    officialMinSubscribers: Number.isFinite(envSubs) && envSubs > 0 ? Math.floor(envSubs) : typeof b.officialMinSubscribers === "number" ? b.officialMinSubscribers : 100_000,
  };
}

/** the badge shown for a profile row */
export function displayBadge(r: { badge?: string | null; official?: boolean | null; verified?: boolean | null; founder?: boolean | null }): Badge | null {
  if (r.founder) return "founder";
  if (r.badge === "star" || r.badge === "personality") return r.badge;
  if (r.official) return "official";
  if (r.badge === "gold" || r.verified) return "gold"; // an admin verification counts as gold
  if (r.badge === "emerald") return "emerald";
  return null;
}

/** PRO mark (owner 22.10.2026): the Pro entitlement mirrored on community_profiles.pro_until, shown while in the future */
export const proOf = (r: unknown) => {
  const v = (r as { pro_until?: string | Date | null } | null)?.pro_until;
  return !!v && new Date(v).getTime() > Date.now();
};

/** highest Reciter Path level with a valid certificate from the exam module (0 when the module has no tables yet) */
export async function certifiedReciterLevel(userId: number): Promise<number> {
  try {
    const r = await pool()!.query(
      "SELECT max(split_part(course, ':', 2)::int) AS n FROM certificates WHERE user_id = $1 AND status = 'valid' AND course ~ '^rp-level:[0-9]+$'",
      [userId],
    );
    return Number(r.rows[0]?.n ?? 0);
  } catch {
    return 0;
  }
}

export type BadgeState = {
  badge: Badge | null;
  emerald: { ok: boolean; email: boolean; phone: boolean | null; age: boolean; profile: boolean; guidelines: boolean };
  gold: { ok: boolean; level: number; need: number };
  official: { ok: boolean; source: string | null; channel: string | null; minSubscribers: number; available: boolean };
};

/** computes the badges of a member, stores the automatic one and returns the checklist */
export async function refreshBadges(userId: number): Promise<BadgeState | null> {
  const p = pool();
  if (!p) return null;
  const rules = badgeRules();
  const r = (await p.query(
    `SELECT u.email_verified, u.birth_year, u.phone_verified_at, c.display_name, c.bio, c.country, c.rewaya, c.guidelines_accepted_at,
            c.badge, c.official, c.official_source, c.official_channel, c.verified, c.badge_override, c.suspended
       FROM users u JOIN community_profiles c ON c.user_id = u.id WHERE u.id = $1`,
    [userId],
  )).rows[0];
  if (!r) return null;
  const age = r.birth_year ? new Date().getFullYear() - Number(r.birth_year) : 0;
  const emerald = {
    email: !!r.email_verified,
    phone: rules.requirePhone ? !!r.phone_verified_at : null,
    age: age >= 16,
    profile: !!(String(r.display_name ?? "").trim() && String(r.bio ?? "").trim() && r.country && String(r.rewaya ?? "").trim()),
    guidelines: !!r.guidelines_accepted_at,
    ok: false,
  };
  emerald.ok = emerald.email && emerald.phone !== false && emerald.age && emerald.profile && emerald.guidelines && !r.suspended;
  const level = await certifiedReciterLevel(userId);
  const gold = { ok: emerald.ok && level >= rules.goldMinLevel, level, need: rules.goldMinLevel };
  const blocked = r.badge_override === "none";
  const stored = r.badge === "star" || r.badge === "personality" ? r.badge : blocked ? "none" : gold.ok ? "gold" : emerald.ok ? "emerald" : "none";
  if (stored !== r.badge) await p.query("UPDATE community_profiles SET badge = $2 WHERE user_id = $1", [userId, stored]);
  const official = {
    ok: !!r.official, source: r.official_source ?? null, channel: r.official_channel ?? null, minSubscribers: rules.officialMinSubscribers,
    available: !!(process.env.GOOGLE_OAUTH_CLIENT_ID && process.env.GOOGLE_OAUTH_CLIENT_SECRET),
  };
  return { badge: displayBadge({ badge: stored, official: r.official, verified: r.verified }), emerald, gold, official };
}

// ---------- name match for the official badge ----------
const fold = (s: string) => s.normalize("NFKD").replace(/[̀-ًͯ-ٰٟ]/g, "").toLowerCase().replace(/^@/, "").replace(/[^\p{L}\p{N}]+/gu, " ").trim();
function lev(a: string, b: string) {
  const d = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    let prev = d[0]; d[0] = i;
    for (let j = 1; j <= b.length; j++) { const t = d[j]; d[j] = Math.min(d[j] + 1, d[j - 1] + 1, prev + (a[i - 1] === b[j - 1] ? 0 : 1)); prev = t; }
  }
  return d[b.length];
}
/** fuzzy: equal after folding, one contains the other (>= 4 letters), all words of the shorter in the longer, or 80 % similar */
export function namesMatch(profileNames: string[], channelNames: string[]): boolean {
  for (const pn of profileNames.map(fold).filter(Boolean)) {
    for (const cn of channelNames.map(fold).filter(Boolean)) {
      const a = pn.replace(/ /g, ""), b = cn.replace(/ /g, "");
      if (a === b) return true;
      if (Math.min(a.length, b.length) >= 4 && (a.includes(b) || b.includes(a))) return true;
      const [short, long] = pn.split(" ").length <= cn.split(" ").length ? [pn, cn] : [cn, pn];
      const lw = new Set(long.split(" "));
      if (short.split(" ").every((w) => w.length >= 2 && lw.has(w))) return true;
      if (1 - lev(a, b) / Math.max(a.length, b.length) >= 0.8) return true;
    }
  }
  return false;
}

/** the OAuth redirect URI to register in the Google Cloud console */
export const officialRedirectUri = () => `${SITE.startsWith("http://localhost") ? SITE : PUBLIC_SITE}/api/community/official/callback`;
