import { pool } from "@/lib/db";
import { cardsFor } from "./mentoring";

export type PlaceRow = { season_id: string; user_id: string; place: number; score: string; sticker_id: string | null; rarity: string | null };

/** podium / top 10 of published seasons with member cards (results are public once published) */
export async function placements(seasonIds: string[], max: number, meId?: number) {
  const out = new Map<string, { place: number; score: number; sticker: string | null; rarity: "mythic" | "legendary" | null; member: ReturnType<typeof Object>; mine?: boolean }[]>();
  if (!seasonIds.length) return out;
  const r = await pool()!.query("SELECT season_id, user_id, place, score, sticker_id, rarity FROM season_results WHERE season_id = ANY($1::bigint[]) AND place <= $2 ORDER BY season_id, place", [seasonIds, max]);
  const cards = await cardsFor(r.rows.map((x) => Number(x.user_id)));
  for (const x of r.rows as PlaceRow[]) {
    const list = out.get(String(x.season_id)) ?? [];
    list.push({
      place: Number(x.place), score: Number(x.score), sticker: x.sticker_id, rarity: x.rarity === "mythic" || x.rarity === "legendary" ? x.rarity : null,
      member: cards.get(Number(x.user_id)) ?? null, ...(meId !== undefined ? { mine: Number(x.user_id) === meId } : {}),
    });
    out.set(String(x.season_id), list);
  }
  return out;
}
