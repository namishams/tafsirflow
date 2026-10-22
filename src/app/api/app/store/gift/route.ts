import { NextRequest } from "next/server";
import { currentUser } from "@/lib/auth";
import { pool } from "@/lib/db";
import { clientIp, json, rateLimited, sameOrigin } from "@/lib/http";
import { friends, insertMessage, openDirect, profileByName, threadFor } from "@/lib/messenger/core";
import { allPacks, packProduct } from "@/lib/store/catalog";
import { grant, ownedOf, ownsPack } from "@/lib/store/entitlements";

export const dynamic = "force-dynamic";

// POST /api/app/store/gift { gift, username, note } – send a sticker pack bought as a gift to a friend: the friend
// owns the pack from now on and gets a message in the messenger. Only to mutual friends, never to strangers.
export async function POST(req: NextRequest) {
  if (!sameOrigin(req)) return json({ error: "origin" }, 403);
  if (rateLimited(`gift:${clientIp(req)}`, 20, 60 * 60_000)) return json({ error: "rate" }, 429);
  const me = await currentUser();
  if (!me) return json({ error: "login" }, 401);
  const p = pool();
  if (!p) return json({ error: "nodb" }, 503);
  const b = (await req.json().catch(() => ({}))) as { gift?: unknown; username?: unknown; note?: unknown };
  if (typeof b.gift !== "string" || !/^\d{1,18}$/.test(b.gift) || typeof b.username !== "string") return json({ error: "input" }, 400);
  const g = (await p.query("SELECT id, pack FROM sticker_gifts WHERE id = $1 AND from_user = $2 AND to_user IS NULL", [b.gift, me.id])).rows[0];
  if (!g) return json({ error: "not_found" }, 404);
  const other = await profileByName(me.id, b.username);
  if (!other) return json({ error: "not_found" }, 404);
  const to = Number(other.user_id);
  if (!(await friends(me.id, to))) return json({ error: "friends_only" }, 403);
  if (ownsPack(await ownedOf(to), g.pack)) return json({ error: "already_owned" }, 409);
  const pack = (await allPacks()).find((x) => x.slug === g.pack);
  const c = await p.connect();
  try {
    await c.query("BEGIN");
    const upd = await c.query("UPDATE sticker_gifts SET to_user = $2, sent_at = now() WHERE id = $1 AND to_user IS NULL", [g.id, to]);
    if (!upd.rowCount) { await c.query("ROLLBACK"); return json({ error: "not_found" }, 404); }
    await grant(c, to, packProduct(g.pack), "gift", null, null);
    await c.query("COMMIT");
  } catch {
    await c.query("ROLLBACK").catch(() => undefined);
    return json({ error: "db" }, 500);
  } finally {
    c.release();
  }
  // the message: the sender's own short note (optional) and the pack's name; the app shows it as a gift card
  const d = await openDirect(me.id, b.username);
  if ("id" in d) {
    const t = await threadFor(me.id, d.id);
    const note = typeof b.note === "string" ? b.note.trim().slice(0, 300) : "";
    // a share card that opens the pack in the recipient's sticker store (internal path only)
    const card = { type: "course" as const, ref: `gift:${g.pack}`, title: `${pack?.title.en ?? g.pack} · ${pack?.title.ar ?? ""}`.slice(0, 120), subtitle: "Sticker gift / Sticker-Geschenk", url: `/sticker-store?pack=${g.pack}` };
    if (t) await insertMessage(me.id, t, { kind: "share", card, text: note }).catch(() => undefined);
  }
  return json({ ok: true });
}
