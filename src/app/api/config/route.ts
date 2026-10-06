import { getSettings, publicConfig } from "@/lib/settings";
import { json } from "@/lib/http";

export const dynamic = "force-dynamic";

// switches and rules the browser needs (feature flags, point rules, announcement); short public cache
export async function GET() {
  return json({ ...publicConfig(await getSettings()), ai: !!process.env.OPENAI_API_KEY }, 200, { "Cache-Control": "public, max-age=30, s-maxage=60" });
}
