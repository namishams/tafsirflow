import { NextRequest } from "next/server";
import { currentUser, type User } from "./auth";
import { pool } from "./db";
import { json, rateLimited, sameOrigin } from "./http";
import { moderate } from "./moderation";
import { displayBadge } from "./talentBadges";

// Reciters community (mini): shared helpers for /api/community/*
export const ROLES = ["learner", "reciter", "teacher"] as const;
export type CRole = (typeof ROLES)[number];
export const USERNAME_RE = /^[a-z0-9_.]{3,20}$/;
const RESERVED = new Set(["admin", "administrator", "root", "support", "help", "staff", "team", "moderator", "mod", "official", "quran", "quranmasterclass", "qmc", "allah", "muhammad", "prophet", "system", "null", "undefined", "me", "api", "settings", "shams",
  // Quran Talents: route names of the app and website (/talents/<name>)
  "record", "player", "badges", "notifications", "blocked", "list", "requests", "messages", "guidelines", "invite", "talents", "followers", "following"]);

export const reserved = (u: string) => RESERVED.has(u.replace(/[._]/g, "")) || RESERVED.has(u);
export const adultEnough = (birthYear: number | null) => !!birthYear && new Date().getFullYear() - birthYear >= 13;

export type Row = {
  username: string; display_name: string; bio: string; country: string | null; role: CRole; style: string; has_ijaza: boolean; public: boolean;
  shares_total?: number;
  // Quran Talents (optional so older selects keep working)
  rewaya?: string; maqam?: string; ijazah_chain?: string; level?: string; verified?: boolean;
  show_progress?: boolean; tree_stage?: number; tree_type?: string; cert_juz?: number[] | null;
  avatar_path?: string | null; avatar_version?: number; private?: boolean; message_policy?: string;
  badge?: string | null; official?: boolean; official_channel?: string | null;
};

/** sharer ("Verbreiter") tiers, same thresholds as the app (mobile/src/features/share/sharer.ts) */
export const SHARER_TIERS = [3, 10, 25, 50, 100, 250, 500, 1000];
export const sharerTier = (shares: number) => SHARER_TIERS.filter((n) => shares >= n).length;
/** day number of this week's Monday (UTC days, like the ranking) */
export const mondayDay = () => { const d = Math.floor(Date.now() / 86400000); return d - ((d + 3) % 7); };
export const shape = (r: Row & { followers?: number; following?: number }) => ({
  username: r.username, name: r.display_name, bio: r.bio, country: r.country, role: r.role, style: r.style, ijaza: r.has_ijaza, public: r.public,
  followers: Number(r.followers ?? 0), following: Number(r.following ?? 0),
  shares: Number(r.shares_total ?? 0), sharerTier: sharerTier(Number(r.shares_total ?? 0)),
  rewaya: r.rewaya ?? "", maqam: r.maqam ?? "", ijazahChain: r.ijazah_chain ?? "", level: r.level ?? "talent", verified: !!displayBadge(r),
  badge: displayBadge(r), officialChannel: r.official ? r.official_channel ?? null : null,
  avatar: r.avatar_path ? `/api/community/avatar/${r.username}?v=${Number(r.avatar_version ?? 0)}` : null,
  private: !!r.private, messagePolicy: r.message_policy ?? "connections",
  progress: r.show_progress ? { treeStage: Number(r.tree_stage ?? 0), treeType: r.tree_type ?? "", certJuz: (r.cert_juz ?? []).map(Number) } : null,
});

/** common gate: DB, same origin, signed in, confirmed e-mail, rate limit per account. Returns the user or a response. */
export async function gate(req: NextRequest, key: string, max: number, windowMs = 60_000, write = false) {
  if (!pool()) return { res: json({ error: "unavailable" }, 503) };
  if (write && !sameOrigin(req)) return { res: json({ error: "forbidden" }, 403) };
  const me = await currentUser();
  if (!me) return { res: json({ error: "login" }, 401) };
  if (!me.emailVerified) return { res: json({ error: "verify" }, 403) };
  // under 13: no community at all (known birth year)
  if (me.birthYear && new Date().getFullYear() - me.birthYear < 13) return { res: json({ error: "age" }, 403) };
  if (rateLimited(`comm-${key}:${me.id}`, max, windowMs)) return { res: json({ error: "slow_down" }, 429) };
  return { me } as { me: User; res?: undefined };
}

/** null when fine, otherwise an error code */
export async function badText(text: string): Promise<string | null> {
  if (!text.trim()) return null;
  const v = await moderate(text.length < 2 ? text + "  " : text);
  return v.ok ? null : "text_not_allowed";
}

export async function findByName(username: string) {
  const r = await pool()!.query(`SELECT user_id, username, display_name, bio, country, role, style, has_ijaza, public, shares_total,
            rewaya, maqam, ijazah_chain, level, verified, show_progress, tree_stage, tree_type, cert_juz, suspended,
            avatar_path, avatar_version, private, message_policy, badge, official, official_channel
       FROM community_profiles WHERE username = $1`, [username.toLowerCase()]);
  return r.rows[0] as (Row & { user_id: string; suspended?: boolean }) | undefined;
}
