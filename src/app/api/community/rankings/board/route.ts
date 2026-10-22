import { NextRequest } from "next/server";
import { pool } from "@/lib/db";
import { currentUser } from "@/lib/auth";
import { clientIp, json, rateLimited } from "@/lib/http";
import { sijillConfig } from "@/lib/sijill";
import { BOARD_CATS, BOARD_PERIODS, BOARD_SCOPES, type BoardCat, type BoardPeriod, type BoardScope } from "@/lib/career";
import { board, topLearners } from "@/lib/careerStats";

export const dynamic = "force-dynamic";

// Global boards of the progress profile (owner 22.10.2026). GET
//   ?scope=world|country|following  &cat=xp|verses|streak|exams  &period=week|month|all  &country=XX (scope=country)
//   ?top=1  the best learners right now (top three per category, world, all time)
// World and country are public (only members listed by name: opted in, worldwide, public profile, 16+); following and
// the caller's own place need a sign-in. Top 100 from the ranking snapshot (10-minute rebuild), cached for a minute.
const PUBLIC = { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120" };
const PRIVATE = { "Cache-Control": "private, no-store" };
const pick = <T extends string>(v: string | null, list: readonly T[], d: T): T => ((list as readonly string[]).includes(v ?? "") ? (v as T) : d);

export async function GET(req: NextRequest) {
  if (!pool()) return json({ error: "unavailable" }, 503);
  if (!sijillConfig().leaderboards) return json({ error: "not_available" }, 403);
  if (rateLimited(`board-ip:${clientIp(req)}`, 90, 60_000)) return json({ error: "slow_down" }, 429);
  const sp = req.nextUrl.searchParams;
  if (sp.get("top") === "1") return json({ top: await topLearners().catch(() => null) }, 200, PUBLIC);
  const scope: BoardScope = pick(sp.get("scope"), BOARD_SCOPES, "world");
  const cat: BoardCat = pick(sp.get("cat"), BOARD_CATS, "xp");
  const period: BoardPeriod = pick(sp.get("period"), BOARD_PERIODS, "week");
  const me = await currentUser();
  const inCommunity = !!me && me.emailVerified && !(me.birthYear && new Date().getFullYear() - me.birthYear < 13);
  if (scope === "following" && !inCommunity) return json({ error: "login" }, 401);
  if (me && rateLimited(`board-user:${me.id}`, 120, 60_000)) return json({ error: "slow_down" }, 429);
  let country: string | null = null;
  if (scope === "country") {
    const q = (sp.get("country") ?? "").toUpperCase();
    if (/^[A-Z]{2}$/.test(q)) country = q;
    else if (inCommunity) country = (await pool()!.query("SELECT upper(NULLIF(country, '')) AS c FROM community_profiles WHERE user_id = $1", [me!.id])).rows[0]?.c ?? null;
    if (!country) return json({ scope, cat, period, country: null, rows: [], named: 0, me: null, needCountry: true }, 200, PRIVATE);
  }
  const b = await board(scope, cat, period, country, inCommunity ? me!.id : undefined);
  return json(b, 200, me ? PRIVATE : PUBLIC);
}
