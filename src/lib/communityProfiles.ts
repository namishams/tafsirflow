import { NextRequest } from "next/server";
import { currentUser, type User } from "./auth";
import { pool } from "./db";
import { json, rateLimited, sameOrigin } from "./http";
import { moderate } from "./moderation";

// Reciters community (mini): shared helpers for /api/community/*
export const ROLES = ["learner", "reciter", "teacher"] as const;
export type CRole = (typeof ROLES)[number];
export const USERNAME_RE = /^[a-z0-9_.]{3,20}$/;
const RESERVED = new Set(["admin", "administrator", "root", "support", "help", "staff", "team", "moderator", "mod", "official", "quran", "quranmasterclass", "qmc", "allah", "muhammad", "prophet", "system", "null", "undefined", "me", "api", "settings", "shams"]);

export const reserved = (u: string) => RESERVED.has(u.replace(/[._]/g, "")) || RESERVED.has(u);
export const adultEnough = (birthYear: number | null) => !!birthYear && new Date().getFullYear() - birthYear >= 13;

export type Row = {
  username: string; display_name: string; bio: string; country: string | null; role: CRole; style: string; has_ijaza: boolean; public: boolean;
};
export const shape = (r: Row & { followers?: number; following?: number }) => ({
  username: r.username, name: r.display_name, bio: r.bio, country: r.country, role: r.role, style: r.style, ijaza: r.has_ijaza, public: r.public,
  followers: Number(r.followers ?? 0), following: Number(r.following ?? 0),
});

/** common gate: DB, same origin, signed in, confirmed e-mail, rate limit per account. Returns the user or a response. */
export async function gate(req: NextRequest, key: string, max: number, windowMs = 60_000, write = false) {
  if (!pool()) return { res: json({ error: "unavailable" }, 503) };
  if (write && !sameOrigin(req)) return { res: json({ error: "forbidden" }, 403) };
  const me = await currentUser();
  if (!me) return { res: json({ error: "login" }, 401) };
  if (!me.emailVerified) return { res: json({ error: "verify" }, 403) };
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
  const r = await pool()!.query("SELECT user_id, username, display_name, bio, country, role, style, has_ijaza, public FROM community_profiles WHERE username = $1", [username.toLowerCase()]);
  return r.rows[0] as (Row & { user_id: string }) | undefined;
}
