import { NextRequest } from "next/server";
import { json } from "@/lib/http";
import { MIN_POST_AGE, NO_STORE, talentGate } from "@/lib/talents";
import { listThreads, openDirect, unreadTotals } from "@/lib/messenger/core";
import { messengerReady } from "@/lib/messenger/crypto";

export const dynamic = "force-dynamic";

// Older app builds (up to Build 25): the one-to-one inbox, now served from the messenger store (src/lib/messenger,
// encrypted at rest). GET: one-to-one chats with last message and unread count. POST { username }: open a chat.
export async function GET(req: NextRequest) {
  if (!messengerReady()) return json({ error: "unavailable" }, 503);
  const g = await talentGate(req, "convs", 60, { minAge: MIN_POST_AGE });
  if (g.res) return g.res;
  const [threads, unread] = await Promise.all([listThreads(g.me.id, "inbox"), unreadTotals(g.me.id)]);
  const direct = threads.filter((t) => t.kind === "direct" && t.with);
  return json({
    conversations: direct.map((t) => ({
      id: t.id, username: t.with!.username, name: t.with!.name, level: t.with!.level, verified: t.with!.verified, badge: t.with!.badge, sharerTier: 0,
      last: t.last ? { text: t.last.gone ? "" : t.last.text ?? "", mine: t.last.mine } : null, at: t.at, unread: t.unread,
    })),
    // the whole inbox (groups too), so the badge of older builds counts everything
    unread: unread.inbox,
  }, 200, NO_STORE);
}

export async function POST(req: NextRequest) {
  if (!messengerReady()) return json({ error: "unavailable" }, 503);
  const g = await talentGate(req, "conv-open", 30, { write: true, minAge: MIN_POST_AGE, needProfile: true });
  if (g.res) return g.res;
  const b = (await req.json().catch(() => ({}))) as { username?: unknown };
  if (typeof b.username !== "string") return json({ error: "not_found" }, 404);
  const r = await openDirect(g.me.id, b.username);
  if ("error" in r) return json({ error: r.error === "not_available" || r.error === "minor_protection" ? "not_available" : r.error }, r.status);
  return json({ id: r.id }, 200, NO_STORE);
}
