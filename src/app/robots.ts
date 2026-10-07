import type { MetadataRoute } from "next";
import { headers } from "next/headers";
import { PUBLIC_SITE, SITE, isPublicHost } from "@/lib/site";

export const dynamic = "force-dynamic"; // decided per request: open on the domain, closed on the bare IP

export default async function robots(): Promise<MetadataRoute.Robots> {
  const publicHost = isPublicHost((await headers()).get("host"));
  // the bare server IP and test hosts stay out of search results (the domain has the same pages)
  if (!publicHost && process.env.ALLOW_INDEXING !== "1") return { rules: { userAgent: "*", disallow: "/" } };
  const base = publicHost ? PUBLIC_SITE : SITE;
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/api/", "/*/admin", "/*/account"] }],
    sitemap: `${base}/sitemap.xml`,
    host: base,
  };
}
