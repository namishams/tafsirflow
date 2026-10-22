import { NextRequest } from "next/server";
import { json } from "@/lib/http";
import { MIN_POST_AGE, NO_STORE, talentGate } from "@/lib/talents";
import { saveSettings, settingsOf } from "@/lib/together";

export const dynamic = "force-dynamic";

// Together: the member's switches (every feature off until switched on) and the self-declared gender for brothers or
// sisters circles (set once). GET: { settings }. PUT { activity?, league?, circles?, challenges?, nudges?, community?,
// bestList?, gender? }: { settings }. 16+ with a community profile.
export async function GET(req: NextRequest) {
  const g = await talentGate(req, "tg-settings", 60, { minAge: MIN_POST_AGE, needProfile: true });
  if (g.res) return g.res;
  return json({ settings: await settingsOf(g.me.id) }, 200, NO_STORE);
}

export async function PUT(req: NextRequest) {
  const g = await talentGate(req, "tg-settings-w", 30, { minAge: MIN_POST_AGE, needProfile: true, write: true });
  if (g.res) return g.res;
  const b = (await req.json().catch(() => null)) as Record<string, unknown> | null;
  if (!b || typeof b !== "object") return json({ error: "bad_request" }, 400);
  return json({ settings: await saveSettings(g.me.id, b) }, 200, NO_STORE);
}
