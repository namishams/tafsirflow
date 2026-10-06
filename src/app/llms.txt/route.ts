import { llmsTxt } from "@/lib/llms";
import { SITE } from "@/lib/site";

export const dynamic = "force-dynamic";

export function GET(req: Request) {
  const base = process.env.SITE_URL ? SITE : new URL(req.url).origin;
  return new Response(llmsTxt(base), { headers: { "content-type": "text/plain; charset=utf-8", "cache-control": "public, max-age=3600" } });
}
