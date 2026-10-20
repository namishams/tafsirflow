import { json } from "@/lib/http";

export const dynamic = "force-dynamic";

// Google Play purchases need a Play service account to be verified on the server; until it is set up the Android app
// cannot confirm purchases (the app shows "purchases not available right now" and charges nothing it cannot confirm).
// When it is: the consumables map like on iOS – DUA_PRODUCTS (lib/appleIap) to dua credits via addDuaCredits,
// NAME_PRODUCTS (lib/aiCredits) to name-report credits via addNameCredits, each purchase token credited once.
export async function POST() {
  return json({ error: "not_configured" }, 501);
}
