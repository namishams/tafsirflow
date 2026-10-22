import { NextRequest } from "next/server";
import { pool } from "@/lib/db";
import { json } from "@/lib/http";
import { MIN_POST_AGE, NO_STORE, talentGate } from "@/lib/talents";
import { CHALLENGE_KINDS, HAS, MAX_OPEN_CHALLENGES, challenges, friendByName, settingsOf, type ChallengeKind } from "@/lib/together";

export const dynamic = "force-dynamic";

// Challenges between two friends (both switched challenges on). Kinds: surah (memorise surah n), verses (memorise n new
// verses), streak (learn n days in a row). Both can succeed; progress comes from the Sijill sync, nothing is staked.
// GET: own challenges with both sides' progress. POST { username, kind, target, days }.
export async function GET(req: NextRequest) {
  const g = await talentGate(req, "tg-chal", 60, { minAge: MIN_POST_AGE, needProfile: true });
  if (g.res) return g.res;
  return json({ challenges: await challenges(g.me.id) }, 200, NO_STORE);
}

export async function POST(req: NextRequest) {
  const g = await talentGate(req, "tg-chal-new", 5, { minAge: MIN_POST_AGE, needProfile: true, write: true, windowMs: 60 * 60_000 });
  if (g.res) return g.res;
  const b = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  if (!(await settingsOf(g.me.id)).challenges) return json({ error: "feature_off" }, 403);
  const kind = CHALLENGE_KINDS.includes(b.kind as ChallengeKind) ? (b.kind as ChallengeKind) : null;
  const num = (v: unknown) => (typeof v === "number" && Number.isFinite(v) ? Math.floor(v) : NaN);
  let target = num(b.target), days = num(b.days);
  if (!kind || !Number.isFinite(target) || !Number.isFinite(days)) return json({ error: "bad_request" }, 400);
  days = Math.max(3, Math.min(60, days));
  if (kind === "surah") target = Math.max(1, Math.min(114, target));
  if (kind === "verses") target = Math.max(1, Math.min(1000, target));
  if (kind === "streak") { target = Math.max(3, Math.min(60, target)); days = Math.max(days, target); }
  const f = typeof b.username === "string" ? await friendByName(g.me.id, b.username) : null;
  if (!f) return json({ error: "not_found" }, 404);
  const p = pool()!;
  const ok = (await p.query(`SELECT ${HAS("challenges", "$2::bigint")} AS ok`, [g.me.id, f.user_id])).rows[0].ok;
  if (!ok) return json({ error: "feature_off_other" }, 403);
  const open = (await p.query("SELECT count(*)::int AS n FROM together_challenges WHERE status IN ('pending','active') AND (from_id = ANY($1::bigint[]) OR to_id = ANY($1::bigint[]))", [[g.me.id, f.user_id]])).rows[0].n;
  if (open >= MAX_OPEN_CHALLENGES * 2) return json({ error: "challenge_limit" }, 403);
  const dup = await p.query("SELECT 1 FROM together_challenges WHERE status IN ('pending','active') AND LEAST(from_id, to_id) = LEAST($1::bigint, $2::bigint) AND GREATEST(from_id, to_id) = GREATEST($1::bigint, $2::bigint) AND kind = $3", [g.me.id, f.user_id, kind]);
  if (dup.rows[0]) return json({ error: "challenge_exists" }, 409);
  const r = await p.query("INSERT INTO together_challenges (from_id, to_id, kind, target, days) VALUES ($1,$2,$3,$4,$5) RETURNING id", [g.me.id, f.user_id, kind, target, days]);
  return json({ id: String(r.rows[0].id) }, 201, NO_STORE);
}
