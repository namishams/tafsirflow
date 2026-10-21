import { NextRequest } from "next/server";
import { pool } from "@/lib/db";
import { clientIp, json, rateLimited } from "@/lib/http";
import { ensureFresh, rankOf } from "@/lib/rankings";

export const dynamic = "force-dynamic";

// GET: the worldwide and country place by total XP of a member who is listed by name (public; otherwise { rank: null }).
export async function GET(req: NextRequest, ctx: { params: Promise<{ username: string }> }) {
  if (!pool()) return json({ error: "unavailable" }, 503);
  if (rateLimited(`rk-of:${clientIp(req)}`, 120, 60_000)) return json({ error: "slow_down" }, 429);
  await ensureFresh();
  const { username } = await ctx.params;
  return json({ rank: await rankOf(username.toLowerCase()) }, 200, { "Cache-Control": "public, s-maxage=60" });
}
