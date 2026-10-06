import { llmsLocaleTxt } from "@/lib/llms";
import { getChapters } from "@/lib/quran";
import { routing } from "@/i18n/routing";
import { SITE } from "@/lib/site";

export const dynamic = "force-dynamic";

// /llms/<language>.txt – the same summary in one language (de, en, ar, tr, ur, fa, ps, fr, es, id, bn, ru, zh)
export async function GET(req: Request, { params }: { params: Promise<{ file: string }> }) {
  const code = (await params).file.replace(/\.txt$/, "");
  if (!(routing.locales as readonly string[]).includes(code)) return new Response("Not found", { status: 404 });
  const base = process.env.SITE_URL ? SITE : new URL(req.url).origin;
  const chapters = await getChapters(code).catch(() => getChapters("en").catch(() => []));
  return new Response(await llmsLocaleTxt(base, code, chapters), { headers: { "content-type": "text/plain; charset=utf-8", "cache-control": "public, max-age=3600" } });
}
