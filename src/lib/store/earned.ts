import { pool } from "@/lib/db";
import { toHijri } from "@/lib/hijri";
import { EARNED, earnedProduct } from "./catalog";
import { grant } from "./entitlements";

// Earned stickers: never for sale, the most prestigious ones. Granted only from what the server itself knows:
// - hafiz-pearl: a valid juz certificate (exam attempt checked and signed by the server, see certificates)
// - khatm-emerald: a completed khatm round in the synced khatm planner (tf:khatm.round >= 1)
// - qadr-nights-star: learning on every one of the last ten nights of a Ramadan (21-29, synced active days tf:days)
// - streak-100 / streak-365: 100 / 365 consecutive learning days (tf:days)
type Days = Record<string, number>;
const DAY = 86_400_000;

function longestStreak(days: number[]): number {
  let best = 0, run = 0, prev = -2;
  for (const d of days) { run = d === prev + 1 ? run + 1 : 1; best = Math.max(best, run); prev = d; }
  return best;
}
function qadrNights(days: number[]): boolean {
  const set = new Set(days);
  const byYear = new Map<number, number[]>();
  for (const d of days) { const h = toHijri(d * DAY); if (h.m === 9 && h.d >= 21 && h.d <= 29) byYear.set(h.y, [...(byYear.get(h.y) ?? []), d]); }
  for (const list of byYear.values()) if (list.length >= 9 && list.every((d) => set.has(d))) return true;
  return false;
}

export async function checkEarned(userId: number): Promise<string[]> {
  const p = pool();
  if (!p) return [];
  const data = Object.fromEntries((await p.query<{ key: string; value: unknown }>("SELECT key, value FROM user_data WHERE user_id = $1 AND key IN ('tf:days','tf:khatm')", [userId])).rows.map((r) => [r.key, r.value]));
  const days = Object.keys((data["tf:days"] as Days | undefined) ?? {}).map(Number).filter(Number.isFinite).sort((a, b) => a - b);
  const khatm = data["tf:khatm"] as { round?: number; deleted?: boolean } | undefined;
  const juz = (await p.query("SELECT 1 FROM certificates WHERE user_id = $1 AND course LIKE 'juz:%' AND status = 'valid' LIMIT 1", [userId])).rowCount;
  const streak = longestStreak(days);
  const ok: Record<string, boolean> = {
    "hafiz-pearl": !!juz,
    "khatm-emerald": !!khatm && !khatm.deleted && Number(khatm.round ?? 0) >= 1,
    "qadr-nights-star": qadrNights(days),
    "streak-100": streak >= 100,
    "streak-365": streak >= 365,
  };
  const have = new Set((await p.query<{ product_id: string }>("SELECT product_id FROM iap_entitlements WHERE user_id = $1 AND product_id LIKE '%.earned.%'", [userId])).rows.map((r) => r.product_id));
  const fresh = EARNED.filter((e) => ok[e.slug] && !have.has(earnedProduct(e.slug)));
  if (!fresh.length) return [];
  const c = await p.connect();
  try { for (const e of fresh) await grant(c, userId, earnedProduct(e.slug), "reward", null, null); } finally { c.release(); }
  return fresh.map((e) => e.slug);
}
