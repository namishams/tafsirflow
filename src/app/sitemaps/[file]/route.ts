import { sitemapFile, xmlHeaders } from "@/lib/sitemaps";

export const dynamic = "force-dynamic";

export async function GET(_: Request, { params }: { params: Promise<{ file: string }> }) {
  const xml = sitemapFile((await params).file);
  return xml ? new Response(xml, { headers: xmlHeaders }) : new Response("Not found", { status: 404 });
}
