import { NextRequest } from "next/server";
import { pool } from "@/lib/db";
import { json } from "@/lib/http";
import { MIN_POST_AGE, NO_STORE, talentGate } from "@/lib/talents";
import { challenges } from "@/lib/together";

export const dynamic = "force-dynamic";

// PATCH { action: accept|decline } (the invited friend) or { action: cancel } (either side). Accepting starts the
// challenge now: the bases (memorised verses) are taken from both Sijill records.
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const g = await talentGate(req, "tg-chal-w", 30, { minAge: MIN_POST_AGE, needProfile: true, write: true });
  if (g.res) return g.res;
  const id = Number((await params).id);
  if (!Number.isSafeInteger(id) || id <= 0) return json({ error: "not_found" }, 404);
  const b = (await req.json().catch(() => ({}))) as { action?: unknown };
  const p = pool()!;
  const c = (await p.query("SELECT * FROM together_challenges WHERE id = $1 AND (from_id = $2 OR to_id = $2)", [id, g.me.id])).rows[0];
  if (!c) return json({ error: "not_found" }, 404);
  const toMe = String(c.to_id) === String(g.me.id);
  if (b.action === "accept" && toMe && c.status === "pending") {
    await p.query(
      `UPDATE together_challenges t SET status = 'active', starts_at = now(), ends_at = now() + (t.days || ' days')::interval,
              from_base = COALESCE((SELECT memorised_verses FROM community_profiles WHERE user_id = t.from_id), 0),
              to_base = COALESCE((SELECT memorised_verses FROM community_profiles WHERE user_id = t.to_id), 0)
        WHERE t.id = $1`,
      [id],
    );
  } else if (b.action === "decline" && toMe && c.status === "pending") {
    await p.query("UPDATE together_challenges SET status = 'declined' WHERE id = $1", [id]);
  } else if (b.action === "cancel" && (c.status === "pending" || c.status === "active")) {
    await p.query("UPDATE together_challenges SET status = 'cancelled' WHERE id = $1", [id]);
  } else return json({ error: "bad_request" }, 400);
  return json({ challenges: await challenges(g.me.id) }, 200, NO_STORE);
}
