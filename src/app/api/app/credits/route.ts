import { currentUser } from "@/lib/auth";
import { json } from "@/lib/http";
import { duaCredits } from "@/lib/aiCredits";
import { getSettings } from "@/lib/settings";

export const dynamic = "force-dynamic";

// What the signed-in account can still use in the app: paid dua credits, the duas Pro includes this month, and
// whether the AI assistant is part of the plan (null = not available without Pro).
export async function GET() {
  const me = await currentUser();
  if (!me) return json({ error: "login" }, 401);
  const pro = me.plan === "premium";
  const c = await duaCredits(me.id, pro);
  const s = await getSettings();
  return json({ dua: c.dua, proDuaLeft: c.proDuaLeft, assistantLeft: pro ? s.premium.assistantPerDay : null });
}
