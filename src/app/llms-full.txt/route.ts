import { llmsFullTxt } from "@/lib/llms";
import { getChapters } from "@/lib/quran";
import { SITE } from "@/lib/site";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const base = process.env.SITE_URL ? SITE : new URL(req.url).origin;
  const chapters = await getChapters("en").catch(() => []);
  return new Response(llmsFullTxt(base, chapters), { headers: { "content-type": "text/plain; charset=utf-8", "cache-control": "public, max-age=3600" } });
}
