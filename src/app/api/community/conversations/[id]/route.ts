import { NextRequest } from "next/server";
import { pool } from "@/lib/db";
import { json } from "@/lib/http";
import { badText } from "@/lib/communityProfiles";
import { MIN_POST_AGE, NO_STORE, para, talentGate } from "@/lib/talents";
import { insertMessage, messagesOf, person, sendProblem, threadFor } from "@/lib/messenger/core";
import { messengerReady } from "@/lib/messenger/crypto";

export const dynamic = "force-dynamic";

const MAX_LEN = 500;

// Older app builds (up to Build 25): one page of a one-to-one chat and sending text, served from the messenger store.
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!messengerReady()) return json({ error: "unavailable" }, 503);
  const g = await talentGate(req, "msgs", 120, { minAge: MIN_POST_AGE });
  if (g.res) return g.res;
  const t = await threadFor(g.me.id, (await params).id);
  if (!t || t.kind !== "direct") return json({ error: "not_found" }, 404);
  const before = req.nextUrl.searchParams.get("before");
  const page = await messagesOf(g.me.id, t, { before: /^\d{1,18}$/.test(before ?? "") ? before : null, limit: 30 });
  const newest = page.messages.length ? page.messages[page.messages.length - 1].id : null;
  if (!before && newest) await pool()!.query("UPDATE msg_members SET read_id = GREATEST(read_id, $3) WHERE thread_id = $1 AND user_id = $2", [t.id, g.me.id, newest]);
  const other = (await pool()!.query(
    "SELECT c.username, c.display_name, c.level, c.verified, c.badge, c.official, c.founder, c.avatar_path, c.avatar_version FROM community_profiles c WHERE c.user_id = $1",
    [Number(t.direct_a) === g.me.id ? t.direct_b : t.direct_a])).rows[0];
  const w = person(other);
  const problem = await sendProblem(g.me.id, t, "text");
  return json({
    with: { username: w?.username ?? "", name: w?.name ?? "", level: w?.level ?? "talent", verified: !!w?.verified, badge: w?.badge ?? null },
    canSend: !problem,
    messages: page.messages.filter((m) => m.kind !== "system").map((m) => ({
      id: m.id, mine: m.mine, removed: m.removed || m.deleted, at: m.at,
      // older builds show text only: images and voice notes become a short marker
      text: m.removed || m.deleted ? null : m.kind === "text" ? m.text : m.kind === "image" ? `[Foto] ${m.text ?? ""}`.trim() : "[Sprachnachricht]",
    })),
    more: page.more,
  }, 200, NO_STORE);
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!messengerReady()) return json({ error: "unavailable" }, 503);
  const g = await talentGate(req, "send", 30, { write: true, minAge: MIN_POST_AGE, needProfile: true });
  if (g.res) return g.res;
  const t = await threadFor(g.me.id, (await params).id);
  if (!t || t.kind !== "direct") return json({ error: "not_found" }, 404);
  const problem = await sendProblem(g.me.id, t, "text");
  if (problem) return json({ error: problem === "minor_protection" ? "not_available" : problem.startsWith("request") ? "connect_first" : problem }, 403);
  const b = (await req.json().catch(() => ({}))) as { text?: unknown };
  const text = para(b.text, MAX_LEN + 1);
  if (!text) return json({ error: "empty" }, 400);
  if (text.length > MAX_LEN) return json({ error: "too_long" }, 400);
  const bad = await badText(text);
  if (bad) return json({ error: bad }, 400);
  const r = await insertMessage(g.me.id, t, { kind: "text", text });
  return json({ message: { id: String(r.id), mine: true, text, removed: false, at: r.created_at } }, 200, NO_STORE);
}
