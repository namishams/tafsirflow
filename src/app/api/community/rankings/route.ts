import { NextRequest } from "next/server";
import { pool } from "@/lib/db";
import { currentUser } from "@/lib/auth";
import { clientIp, json, rateLimited } from "@/lib/http";
import { sijillConfig } from "@/lib/sijill";
import {
  COUNTRY_METRICS, MIN_COUNTRY_MEMBERS, countryList, ensureFresh, friendsList, isMetric, listFor, nextReset, participants, standing,
  type CountryMetric, type CountryMode, type CountryPeriod, type Metric,
} from "@/lib/rankings";

export const dynamic = "force-dynamic";

// Worldwide rankings (opt-in). GET ?scope=world|country|friends|countries
//   &metric=xp_week|xp_total|streak|verses|stickers|mashaallah   (members; default xp_week)
//   &country=XX                                                    (scope=country; default: the member's own country)
//   &period=week|all &cm=xp|stickers|verses &mode=total|per_capita (scope=countries)
// World, country and countries are public (no sign-in: the website page uses them); friends and the caller's own rank need
// a sign-in. Top 100 plus the caller's own rank. Members appear only by username, display name, avatar, country and badge.
// Lists come from a snapshot that is rebuilt every 10 minutes (src/lib/rankings.ts) and are cached for a minute.
const PUBLIC = { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120" };
const PRIVATE = { "Cache-Control": "private, no-store" };

export async function GET(req: NextRequest) {
  if (!pool()) return json({ error: "unavailable" }, 503);
  if (!sijillConfig().leaderboards) return json({ error: "not_available" }, 403);
  if (rateLimited(`rk-ip:${clientIp(req)}`, 90, 60_000)) return json({ error: "slow_down" }, 429);
  const sp = req.nextUrl.searchParams;
  const scope = ["world", "country", "friends", "countries"].includes(sp.get("scope") ?? "") ? (sp.get("scope") as string) : "world";
  const metric: Metric = isMetric(sp.get("metric")) ? (sp.get("metric") as Metric) : "xp_week";
  const me = await currentUser();
  if (me && rateLimited(`rk-user:${me.id}`, 120, 60_000)) return json({ error: "slow_down" }, 429);
  if (scope === "friends" && !me) return json({ error: "login" }, 401);
  await ensureFresh();
  const base = { scope, metric, resetsAt: new Date(nextReset()).toISOString(), minCountryMembers: MIN_COUNTRY_MEMBERS, ...(await participants().catch(() => ({ named: 0, counted: 0, countriesN: 0 }))) };

  const inCommunity = !!me && me.emailVerified && !(me.birthYear && new Date().getFullYear() - me.birthYear < 13);
  const st = inCommunity ? await standing(me!.id, metric).catch(() => null) : null;

  if (scope === "countries") {
    const period: CountryPeriod = sp.get("period") === "all" ? "all" : "week";
    const cmRaw = sp.get("cm") ?? (sp.get("metric") === "verses" ? "verses" : sp.get("metric") === "stickers" ? "stickers" : "xp");
    const cm: CountryMetric = (COUNTRY_METRICS as readonly string[]).includes(cmRaw) ? (cmRaw as CountryMetric) : "xp";
    const mode: CountryMode = sp.get("mode") === "per_capita" ? "per_capita" : "total";
    const myCountry = st?.country ?? null;
    const { rows, mine } = await countryList(period, cm, mode, myCountry);
    return json({ ...base, period, cm, mode, countries: rows, mineCountry: mine, myCountry, counted: st?.counted ?? false }, 200, me ? PRIVATE : PUBLIC);
  }

  let country: string | null = null;
  if (scope === "country") {
    const q = (sp.get("country") ?? "").toUpperCase();
    country = /^[A-Z]{2}$/.test(q) ? q : st?.country ?? null;
    if (!country) return json({ ...base, country: null, rows: [], me: st, needCountry: true }, 200, PRIVATE);
  }
  const rows = scope === "friends" ? await friendsList(me!.id, metric) : await listFor(scope === "country" ? "country" : "world", metric, country, inCommunity ? me!.id : undefined);
  const own = scope === "friends" ? rows.find((r) => r.me) : undefined;
  const mine = st && (scope === "friends" ? { ...st, rank: own?.rank ?? null, score: own?.score ?? 0, participants: rows.length } : { ...st, rank: scope === "country" ? st.countryRank : st.rank });
  return json({ ...base, country, rows, me: mine }, 200, me ? PRIVATE : PUBLIC);
}
