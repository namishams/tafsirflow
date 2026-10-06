import { sitemapIndex, xmlHeaders } from "@/lib/sitemaps";

export const dynamic = "force-dynamic";

export const GET = () => new Response(sitemapIndex(), { headers: xmlHeaders });
