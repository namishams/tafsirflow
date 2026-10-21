import { NextRequest } from "next/server";
import { pool } from "@/lib/db";
import { json } from "@/lib/http";
import { badText } from "@/lib/communityProfiles";
import { NO_STORE, line, talentGate } from "@/lib/talents";

export const dynamic = "force-dynamic";

// POST { title, postIds }: a story highlight of the member's own approved clips (keeps those stories after 24 h)
export async function POST(req: NextRequest) {
  const g = await talentGate(req, "highlight", 20, { windowMs: 60 * 60_000, write: true, needProfile: true });
  if (g.res) return g.res;
  const b = (await req.json().catch(() => ({}))) as { title?: unknown; postIds?: unknown };
  const title = line(b.title, 30);
  const ids = Array.isArray(b.postIds) ? [...new Set(b.postIds.filter((x): x is string => typeof x === "string" && /^\d{1,18}$/.test(x)))].slice(0, 30) : [];
  if (!title || !ids.length) return json({ error: "bad_request" }, 400);
  const bad = await badText(title);
  if (bad) return json({ error: bad }, 400);
  const p = pool()!;
  const own = await p.query("SELECT id FROM community_posts WHERE id = ANY($1::bigint[]) AND author_id = $2 AND status = 'approved' AND deleted_at IS NULL AND media_path IS NOT NULL", [ids, g.me.id]);
  if (!own.rows.length) return json({ error: "bad_request" }, 400);
  const n = await p.query("SELECT count(*)::int AS n FROM community_highlights WHERE owner_id = $1", [g.me.id]);
  if (Number(n.rows[0].n) >= 30) return json({ error: "too_many" }, 400);
  const h = await p.query("INSERT INTO community_highlights (owner_id, title) VALUES ($1,$2) RETURNING id", [g.me.id, title]);
  const keep = ids.filter((id) => own.rows.some((r) => String(r.id) === id));
  await p.query(
    "INSERT INTO community_highlight_items (highlight_id, post_id, position) SELECT $1, x.id, x.ord FROM unnest($2::bigint[]) WITH ORDINALITY AS x(id, ord)",
    [h.rows[0].id, keep],
  );
  return json({ id: String(h.rows[0].id) }, 200, NO_STORE);
}
