import { NextRequest } from "next/server";
import { pool } from "@/lib/db";
import { json } from "@/lib/http";
import { MIN_POST_AGE, NO_STORE, talentGate } from "@/lib/talents";
import { inbox } from "@/lib/together";

export const dynamic = "force-dynamic";

// GET: nudges of the last 14 days, challenges and invitations waiting for an answer, join requests of own circles,
// the unread count (the app turns new items into one local notification, never at night). POST {}: nudges read.
export async function GET(req: NextRequest) {
  const g = await talentGate(req, "tg-inbox", 60, { minAge: MIN_POST_AGE, needProfile: true });
  if (g.res) return g.res;
  return json(await inbox(g.me.id), 200, NO_STORE);
}

export async function POST(req: NextRequest) {
  const g = await talentGate(req, "tg-inbox-r", 30, { minAge: MIN_POST_AGE, needProfile: true, write: true });
  if (g.res) return g.res;
  await pool()!.query("UPDATE together_nudges SET read_at = now() WHERE to_id = $1 AND read_at IS NULL", [g.me.id]);
  await pool()!.query("DELETE FROM together_nudges WHERE to_id = $1 AND created_at < now() - interval '60 days'", [g.me.id]);
  return json({ ok: true }, 200, NO_STORE);
}
