import { NextRequest } from "next/server";
import { pool } from "@/lib/db";
import { json } from "@/lib/http";
import { MIN_POST_AGE, NO_STORE, talentGate } from "@/lib/talents";
import { invites } from "@/lib/together";

export const dynamic = "force-dynamic";

// PATCH { answer: yes|no } (an invited member) or { cancel: true } (the sender).
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const g = await talentGate(req, "tg-inv-w", 30, { minAge: MIN_POST_AGE, needProfile: true, write: true });
  if (g.res) return g.res;
  const id = (await params).id;
  const mine = (await invites(g.me.id)).find((i) => i.id === id);
  if (!mine) return json({ error: "not_found" }, 404);
  const b = (await req.json().catch(() => ({}))) as { answer?: unknown; cancel?: unknown };
  const p = pool()!;
  if (b.cancel === true && mine.mine) await p.query("UPDATE together_invites SET cancelled = true WHERE id = $1", [id]);
  else if ((b.answer === "yes" || b.answer === "no") && !mine.mine) {
    await p.query("INSERT INTO together_invite_answers (invite_id, user_id, answer) VALUES ($1,$2,$3) ON CONFLICT (invite_id, user_id) DO UPDATE SET answer = $3, created_at = now()", [id, g.me.id, b.answer]);
  } else return json({ error: "bad_request" }, 400);
  return json({ invites: await invites(g.me.id) }, 200, NO_STORE);
}
