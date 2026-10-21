import { NextRequest } from "next/server";
import { currentUser } from "@/lib/auth";
import { pool } from "@/lib/db";
import { json, rateLimited, sameOrigin } from "@/lib/http";
import { MIN_POST_AGE, MIN_VIEW_AGE, NO_STORE, ageOf } from "@/lib/talents";
import { refreshBadges } from "@/lib/talentBadges";

export const dynamic = "force-dynamic";

// Age for the community: GET tells what the member may do, POST { birthYear, confirm: true } stores the birth year
// (only when none is stored yet) and the confirmation. The birth year itself is never shown to others.
const status = (birthYear: number | null, confirmedAt: string | null) => {
  const age = ageOf(birthYear);
  return {
    known: age !== null, confirmed: !!confirmedAt,
    community: age !== null && age >= MIN_VIEW_AGE, // view, follow, like
    interact: age !== null && age >= MIN_POST_AGE, // post, connect, message
  };
};

export async function GET() {
  const me = await currentUser();
  if (!me) return json({ error: "login" }, 401);
  const r = await pool()!.query("SELECT birth_year, age_confirmed_at FROM users WHERE id = $1", [me.id]);
  return json(status(r.rows[0]?.birth_year ?? null, r.rows[0]?.age_confirmed_at ?? null), 200, NO_STORE);
}

export async function POST(req: NextRequest) {
  if (!pool()) return json({ error: "unavailable" }, 503);
  if (!sameOrigin(req)) return json({ error: "forbidden" }, 403);
  const me = await currentUser();
  if (!me) return json({ error: "login" }, 401);
  if (rateLimited(`comm-age:${me.id}`, 5, 60 * 60_000)) return json({ error: "slow_down" }, 429);
  const b = (await req.json().catch(() => ({}))) as { birthYear?: unknown; confirm?: unknown };
  if (b.confirm !== true) return json({ error: "confirm" }, 400);
  const year = new Date().getFullYear();
  const p = pool()!;
  const cur = (await p.query("SELECT birth_year FROM users WHERE id = $1", [me.id])).rows[0];
  let birthYear: number | null = cur?.birth_year ?? null;
  if (birthYear === null) {
    const y = typeof b.birthYear === "number" ? Math.floor(b.birthYear) : NaN;
    if (!(y >= 1920 && y <= year - 4)) return json({ error: "birth_year" }, 400);
    birthYear = y;
  } else if (b.birthYear !== undefined && b.birthYear !== birthYear) {
    // a stored birth year is not changed here (no way around the age limits); the account page shows it
    return json({ error: "age_locked" }, 409);
  }
  const r = await p.query("UPDATE users SET birth_year = $2, age_confirmed_at = now() WHERE id = $1 RETURNING age_confirmed_at", [me.id, birthYear]);
  await refreshBadges(me.id).catch(() => null);
  return json(status(birthYear, r.rows[0].age_confirmed_at), 200, NO_STORE);
}
