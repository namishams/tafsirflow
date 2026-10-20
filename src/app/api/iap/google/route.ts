import { json } from "@/lib/http";

export const dynamic = "force-dynamic";

// Google Play purchases need a Play service account to be verified on the server; until it is set up the Android app
// cannot confirm purchases (the app shows "purchases not available right now" and charges nothing it cannot confirm).
export async function POST() {
  return json({ error: "not_configured" }, 501);
}
