import { NextRequest } from "next/server";
import { pool } from "@/lib/db";
import { currentUser } from "@/lib/auth";
import { clientIp, json, rateLimited } from "@/lib/http";
import {
  COUNTRY_METRICS, SEASON_KINDS, SEASON_METRICS, hallOfFame, myHistory, seasonCountries, seasonRows, seasons,
  type CountryMetric, type CountryMode, type SeasonKind, type SeasonMetric,
} from "@/lib/rankings";

export const dynamic = "force-dynamic";

// Season history (weeks, months, Ramadan, years) and the hall of fame. Public.
//   GET ?kind=year&hall=1                 – per closed season the top three members per metric and the top countries
//   GET ?kind=month                       – the closed seasons of a kind (newest first)
//   GET ?kind=year&key=2026&metric=xp_season|xp_total|streak|verses|stickers|mashaallah   – top 100 members of a season
//   GET ?kind=year&key=2026&countries=1&cm=xp&mode=total|per_capita                     – top 50 countries of a season
//   GET ?mine=1 (signed in)               – the caller's own places in closed seasons (top 100 only)
// Only members who still have the worldwide listing switched on appear (opting out removes them from the history too).
export async function GET(req: NextRequest) {
  if (!pool()) return json({ error: "unavailable" }, 503);
  if (rateLimited(`rk-hist:${clientIp(req)}`, 60, 60_000)) return json({ error: "slow_down" }, 429);
  const sp = req.nextUrl.searchParams;
  const kind: SeasonKind = (SEASON_KINDS as readonly string[]).includes(sp.get("kind") ?? "") ? (sp.get("kind") as SeasonKind) : "year";
  const PUB = { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600" };
  try {
    if (sp.get("mine") === "1") {
      const me = await currentUser();
      if (!me) return json({ error: "login" }, 401);
      return json({ places: await myHistory(me.id) }, 200, { "Cache-Control": "private, no-store" });
    }
    const key = sp.get("key") ?? "";
    if (key) {
      if (!/^[0-9-]{4,10}$/.test(key)) return json({ error: "bad_request" }, 400);
      if (sp.get("countries") === "1") {
        const cm: CountryMetric = (COUNTRY_METRICS as readonly string[]).includes(sp.get("cm") ?? "") ? (sp.get("cm") as CountryMetric) : "xp";
        const mode: CountryMode = sp.get("mode") === "per_capita" ? "per_capita" : "total";
        return json({ kind, key, cm, mode, countries: await seasonCountries(kind, key, cm, mode) }, 200, PUB);
      }
      const metric: SeasonMetric = (SEASON_METRICS as readonly string[]).includes(sp.get("metric") ?? "") ? (sp.get("metric") as SeasonMetric) : "xp_season";
      return json({ kind, key, metric, rows: await seasonRows(kind, key, metric) }, 200, PUB);
    }
    if (sp.get("hall") === "1") return json({ kind, hall: await hallOfFame(kind) }, 200, PUB);
    return json({ kind, seasons: await seasons(kind) }, 200, PUB);
  } catch {
    return json({ kind, seasons: [], hall: [], rows: [] }, 200, { "Cache-Control": "no-store" });
  }
}
